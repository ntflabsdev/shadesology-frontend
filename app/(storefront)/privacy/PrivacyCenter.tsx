"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
type RequestType = "access" | "deletion" | "do_not_sell";

function downloadExport(data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "shadesology-data-export.json";
  link.click();
  URL.revokeObjectURL(url);
}

export function PrivacyCenter() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [email, setEmail] = useState("");
  const [type, setType] = useState<RequestType>("access");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  async function requestPrivacyAction(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`${API_BASE}/api/privacy/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Your request could not be submitted.");
      setMessage(result.message);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your request could not be submitted.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyRequest() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/privacy/requests/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "The verification link could not be confirmed.");
      if (result.data) downloadExport(result.data);
      setVerified(true);
      setMessage(result.message || "Your verified request has been processed.");
      window.history.replaceState({}, "", window.location.pathname);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The verification link could not be confirmed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-xl border border-[--color-border] bg-white p-6">
      <h2 className="text-xl font-semibold">Privacy request center</h2>
      {token && !verified ? (
        <div className="mt-4">
          <p>Confirm your email to continue with the privacy request.</p>
          <button type="button" onClick={() => void verifyRequest()} disabled={loading} className="mt-4 rounded-md bg-[--color-brand-primary] px-4 py-2 font-semibold text-white disabled:opacity-60">
            {loading ? "Verifying…" : "Verify request"}
          </button>
        </div>
      ) : (
        <form onSubmit={requestPrivacyAction} className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Request type</span>
            <select className="w-full rounded-md border border-[--color-border] bg-white px-3 py-2" value={type} onChange={(event) => setType(event.target.value as RequestType)}>
              <option value="access">Get a copy of my personal data</option>
              <option value="deletion">Delete my account and personal data</option>
              <option value="do_not_sell">Opt out of sale or sharing for targeted advertising</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email address</span>
            <input
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-[--color-border] px-3 py-2"
            />
          </label>
          <p className="text-sm text-[--color-text-muted]">We will email a one-time verification link before processing your request.</p>
          <button type="submit" disabled={loading} className="rounded-md bg-[--color-brand-primary] px-4 py-2 font-semibold text-white disabled:opacity-60">
            {loading ? "Submitting…" : "Submit privacy request"}
          </button>
        </form>
      )}
      {message && <p role="status" className="mt-4 text-sm text-[--color-success]">{message}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-[--color-error]">{error}</p>}
    </div>
  );
}
