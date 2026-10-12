import type { AuthStrategyFunction } from "payload";

const staffRoles = new Set(["admin", "sales", "support", "content"]);
type StaffRole = "admin" | "sales" | "support" | "content";
const apiBase = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const identityURL = process.env.PAYLOAD_STAFF_IDENTITY_URL ||
  new URL("/api/auth/payload-staff", apiBase).toString();

function isStaffRole(role: unknown): role is StaffRole {
  return typeof role === "string" && staffRoles.has(role);
}

function backendStaffCookie(cookieHeader: string | null) {
  return cookieHeader
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("shades_token="));
}

export const backendStaffStrategy: AuthStrategyFunction = async ({ headers }) => {
  const staffCookie = backendStaffCookie(headers.get("cookie"));
  if (!staffCookie) return { user: null };

  const identityURLObject = new URL(identityURL);
  if (
    process.env.NODE_ENV === "production" &&
    identityURLObject.protocol !== "https:" &&
    !["localhost", "127.0.0.1", "::1", "[::1]"].includes(identityURLObject.hostname)
  ) {
    throw new Error("The Payload staff identity service must use HTTPS in production.");
  }

  const response = await fetch(identityURL, {
    headers: { cookie: staffCookie },
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (response.status === 401 || response.status === 403) return { user: null };
  if (!response.ok) {
    throw new Error(`Backend staff identity verification failed (${response.status}).`);
  }

  const body: {
    user?: {
      id?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      role?: unknown;
      createdAt?: string;
      updatedAt?: string;
    };
  } = await response.json();
  const user = body.user;
  if (
    !user ||
    typeof user.id !== "string" ||
    typeof user.email !== "string" ||
    !isStaffRole(user.role) ||
    typeof user.createdAt !== "string" ||
    typeof user.updatedAt !== "string"
  ) {
    return { user: null };
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      collection: "users",
      _strategy: "backend-staff",
    },
  };
};
