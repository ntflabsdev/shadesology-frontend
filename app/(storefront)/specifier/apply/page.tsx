"use client";

import { useState, type FormEvent } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export default function SpecifierApplicationPage() {
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [professionalBody, setProfessionalBody] = useState("");
  const [membershipNumber, setMembershipNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [verification, setVerification] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);

  async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API}${path}`, {
      credentials: "include",
      ...init,
      headers: { ...(init?.headers || {}), ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }) },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || `Request failed (${response.status}).`);
    return result.data as T;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const documents: { key: string; label: string }[] = [];
      if (verification) {
        const upload = await api<{ key: string; uploadUrl: string; fields: Record<string, string> }>("/api/portals/applications/upload-url", {
          method: "POST",
          body: JSON.stringify({ filename: verification.name, contentType: verification.type, sizeBytes: verification.size }),
        });
        const form = new FormData();
        Object.entries(upload.fields).forEach(([key, value]) => form.append(key, value));
        form.append("file", verification);
        const result = await fetch(upload.uploadUrl, { method: "POST", body: form });
        if (!result.ok) throw new Error("Verification document upload failed.");
        documents.push({ key: upload.key, label: "Professional verification" });
      }
      const result = await api<{ referenceNumber: string }>("/api/portals/applications", {
        method: "POST",
        body: JSON.stringify({
          type: "specifier",
          data: { businessName, businessEmail, city, state, website, professionalBody, membershipNumber },
          documents,
        }),
      });
      setReference(result.referenceNumber);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to submit your application.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container max-w-2xl py-12">
      <h1 className="text-3xl font-bold">Specifier access application</h1>
      <p className="mt-2 text-[--color-text-muted]">Sign in with a verified customer account before applying. Professional access is enabled after staff review.</p>
      {reference ? <p role="status" className="mt-6 rounded-lg bg-green-50 p-4 text-green-800">Application submitted. Reference: {reference}</p> : (
        <form onSubmit={submit} className="mt-8 space-y-4 rounded-xl border border-[--color-border] p-6">
          {error && <p role="alert" className="rounded bg-red-50 p-3 text-red-800">{error}</p>}
          <label className="block text-sm font-medium">Firm or business name<input required minLength={2} value={businessName} onChange={(event) => setBusinessName(event.target.value)} className="mt-1 w-full rounded border p-2" /></label>
          <label className="block text-sm font-medium">Business email<input required type="email" value={businessEmail} onChange={(event) => setBusinessEmail(event.target.value)} className="mt-1 w-full rounded border p-2" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">City<input required value={city} onChange={(event) => setCity(event.target.value)} className="mt-1 w-full rounded border p-2" /></label>
            <label className="block text-sm font-medium">State<input required value={state} onChange={(event) => setState(event.target.value)} className="mt-1 w-full rounded border p-2" /></label>
          </div>
          <label className="block text-sm font-medium">Professional body<input value={professionalBody} onChange={(event) => setProfessionalBody(event.target.value)} className="mt-1 w-full rounded border p-2" /></label>
          <label className="block text-sm font-medium">Membership / license number<input value={membershipNumber} onChange={(event) => setMembershipNumber(event.target.value)} className="mt-1 w-full rounded border p-2" /></label>
          <label className="block text-sm font-medium">Website (optional)<input type="url" placeholder="https://" value={website} onChange={(event) => setWebsite(event.target.value)} className="mt-1 w-full rounded border p-2" /></label>
          <label className="block text-sm font-medium">Verification document (optional, PDF/JPEG/PNG/WebP, max 100 MB)<input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setVerification(event.target.files?.[0] || null)} className="mt-1 block w-full" /></label>
          <button disabled={busy} className="rounded-lg bg-[--color-brand-primary] px-5 py-3 font-semibold text-white disabled:opacity-60">{busy ? "Submitting…" : "Submit for verification"}</button>
        </form>
      )}
    </main>
  );
}
