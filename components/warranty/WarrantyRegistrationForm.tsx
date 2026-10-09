"use client";

import { useState } from "react";
import { trackConversion } from "@/lib/conversion";
import { HoneypotField } from "@/components/forms/HoneypotField";
import { submitLead } from "@/lib/leads";

export function WarrantyRegistrationForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setSuccess("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const result = await submitLead("warranty/register", data);
      setSuccess(`${result.message} Reference: ${result.data?.reference ?? ""}`);
      form.reset();
      trackConversion("warranty_registered");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register your warranty.");
    } finally { setBusy(false); }
  }
  const cls = "mt-1 w-full rounded-lg border border-[--color-border] px-3 py-2";
  return (
    <section className="mt-12 rounded-2xl border bg-white p-6" aria-labelledby="register-warranty-title">
      <h2 id="register-warranty-title" className="text-2xl font-bold">Register your product</h2>
      <p className="mt-2 text-sm text-[--color-text-muted]">Submit your model and installation date so our support team can locate your warranty record.</p>
      {error && <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {success && <p role="status" className="mt-4 rounded bg-green-50 p-3 text-sm text-green-800">{success}</p>}
      <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">Name<input name="name" required maxLength={201} autoComplete="name" className={cls} /></label>
        <label className="text-sm">Email<input name="email" required type="email" maxLength={254} autoComplete="email" className={cls} /></label>
        <label className="text-sm">Phone<input name="phone" type="tel" maxLength={40} autoComplete="tel" className={cls} /></label>
        <label className="text-sm">Product type<input name="productType" required maxLength={100} className={cls} /></label>
        <label className="text-sm">Model<input name="model" required maxLength={200} className={cls} /></label>
        <label className="text-sm">Serial number<input name="serialNumber" maxLength={100} className={cls} /></label>
        <label className="text-sm">Order number<input name="orderNumber" maxLength={100} className={cls} /></label>
        <label className="text-sm">Installation date<input name="installDate" required type="date" max={new Date().toISOString().slice(0, 10)} className={cls} /></label>
        <HoneypotField />
        <button disabled={busy} data-conversion-event="primary_cta_click" className="rounded-lg bg-[--color-brand-primary] px-5 py-2 font-semibold text-white disabled:opacity-50 sm:col-span-2">{busy ? "Submitting…" : "Register warranty"}</button>
      </form>
    </section>
  );
}
