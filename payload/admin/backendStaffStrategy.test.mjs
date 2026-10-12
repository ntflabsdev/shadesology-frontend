import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { backendStaffStrategy } from "./backendStaffStrategy.ts";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("Backend staff Payload auth strategy", () => {
  it("does not call the identity service without a backend session cookie", async () => {
    globalThis.fetch = async () => {
      throw new Error("Unexpected identity request");
    };

    assert.deepEqual(
      await backendStaffStrategy({ headers: new Headers({ cookie: "other=value" }) }),
      { user: null },
    );
  });

  it("forwards only the backend auth cookie and maps a verified staff identity", async () => {
    let forwardedCookie;
    globalThis.fetch = async (_url, options) => {
      forwardedCookie = options.headers.cookie;
      return new Response(JSON.stringify({
        user: {
          id: "staff-123",
          email: "staff@example.test",
          role: "admin",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      }), { status: 200 });
    };

    const result = await backendStaffStrategy({
      headers: new Headers({ cookie: "session=unrelated; shades_token=signed-staff-token; payload-token=old" }),
    });

    assert.equal(forwardedCookie, "shades_token=signed-staff-token");
    assert.deepEqual(result.user, {
      id: "staff-123",
      email: "staff@example.test",
      firstName: undefined,
      lastName: undefined,
      role: "admin",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      collection: "users",
      _strategy: "backend-staff",
    });
  });

  it("rejects non-staff identities", async () => {
    globalThis.fetch = async () => new Response(JSON.stringify({
      user: {
        id: "dealer-123",
        email: "dealer@example.test",
        role: "dealer",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    }), { status: 200 });

    const result = await backendStaffStrategy({
      headers: new Headers({ cookie: "shades_token=signed-user-token" }),
    });
    assert.deepEqual(result, { user: null });
  });

  it("fails closed for unauthorized sessions and surfaces service failures", async () => {
    globalThis.fetch = async () => new Response("{}", { status: 401 });
    assert.deepEqual(
      await backendStaffStrategy({ headers: new Headers({ cookie: "shades_token=expired" }) }),
      { user: null },
    );

    globalThis.fetch = async () => new Response("{}", { status: 503 });
    await assert.rejects(
      backendStaffStrategy({ headers: new Headers({ cookie: "shades_token=valid" }) }),
      /identity verification failed \(503\)/,
    );
  });
});
