"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { HoneypotField } from "@/components/forms/HoneypotField";
import { submitLead } from "@/lib/leads";

const BUSINESS_TYPES = [
  { value: "dealer",            label: "Reseller / Dealer" },
  { value: "installer",         label: "Installer" },
  { value: "specifier",         label: "Architect / Specifier" },
  { value: "commercial_customer", label: "Commercial / Corporate Buyer" },
  { value: "property_manager",  label: "Property Manager" },
  { value: "other",             label: "Other Trade" },
];

const ANNUAL_VOLUMES = [
  { value: "under_50k",        label: "Under $50,000" },
  { value: "50k_200k",         label: "$50,000 – $200,000" },
  { value: "200k_500k",        label: "$200,000 – $500,000" },
  { value: "over_500k",        label: "Over $500,000" },
];

export default function DealerApplyPage() {
  const [form, setForm] = useState({
    businessName: "", contactName: "", email: "", phone: "",
    businessType: "", website: "", abn: "",
    annualVolume: "", productsOfInterest: "", additionalNotes: "",
    faxNumber: "",
  });
  const [agreed, setAgreed]        = useState(false);
  const [errors, setErrors]        = useState<Record<string, string>>({});
  const [loading, setLoading]      = useState(false);
  const [submitted, setSubmitted]  = useState(false);
  const [serverError, setServerError] = useState("");

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.businessName.trim()) e.businessName  = "Required";
    if (!form.contactName.trim())  e.contactName   = "Required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.businessType)        e.businessType  = "Required";
    if (!agreed)                   e.terms         = "You must agree to continue";
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerError("");
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);

    try {
      await submitLead("leads", {
        type: "dealer",
        name: form.contactName,
        email: form.email,
        phone: form.phone,
        company: form.businessName,
        source: "dealer_apply_page",
        data: form,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-lg p-10">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M5 14l6 6L23 8" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-xl font-bold mb-2">Application Submitted!</h1>
          <p className="text-sm text-[--color-text-muted] mb-6">
            Thank you, {form.contactName.split(" ")[0]}! Our trade team will review your application
            and respond within 2–3 business days at <strong>{form.email}</strong>.
          </p>
          <div className="space-y-2">
            <Button href="/" fullWidth>Return to Home</Button>
            <Button href="/login" variant="ghost" fullWidth>Sign in to existing account</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-[--color-brand-primary] text-white py-14">
        <div className="container max-w-2xl">
          <nav aria-label="Breadcrumb" className="text-sm text-white/60 mb-4">
            <Link href="/dealer" className="hover:text-white transition-colors">Dealer Program</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-white">Apply</span>
          </nav>
          <h1 className="text-3xl font-bold mb-2">Apply for a Trade Account</h1>
          <p className="text-white/80">
            Trade pricing is assigned after approval — it is never available by self-selection.
          </p>
        </div>
      </header>

      {/* What you get */}
      <div className="bg-[--color-neutral-50] border-b border-[--color-border]">
        <div className="container max-w-2xl py-8">
          <ul className="grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { icon: "💰", text: "Trade pricing once approved" },
              { icon: "📐", text: "Early access to new products" },
              { icon: "🤝", text: "Dedicated account manager" },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                <span className="text-[--color-text-muted]">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container max-w-2xl py-12">
        <div className="bg-white rounded-2xl border border-[--color-border] p-8">
          {serverError && (
            <div role="alert" className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-[--color-error]">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <HoneypotField name="faxNumber" value={form.faxNumber} onChange={set("faxNumber")} />
            <fieldset className="space-y-4">
              <legend className="text-base font-semibold text-[--color-text-primary] mb-3">Business details</legend>
              <Input label="Business / company name" value={form.businessName} onChange={set("businessName")} error={errors.businessName} required />
              <Input label="Primary contact name"    value={form.contactName}  onChange={set("contactName")}  error={errors.contactName}  required autoComplete="name" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Business email" type="email" value={form.email} onChange={set("email")} error={errors.email} required autoComplete="email" />
                <Input label="Phone" type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" />
              </div>
              <Select
                label="Business type"
                options={BUSINESS_TYPES}
                value={form.businessType}
                onChange={(e) => setForm((p) => ({ ...p, businessType: e.target.value }))}
                error={errors.businessType}
                placeholder="Select business type"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Website (optional)" type="url" value={form.website} onChange={set("website")} placeholder="https://yourbusiness.com" />
                <Input label="ABN / Tax ID (optional)" value={form.abn} onChange={set("abn")} />
              </div>
            </fieldset>

            <fieldset className="space-y-4 pt-4 border-t border-[--color-border]">
              <legend className="text-base font-semibold text-[--color-text-primary] mb-3">Purchasing details</legend>
              <Select
                label="Estimated annual spend on shade products"
                options={ANNUAL_VOLUMES}
                value={form.annualVolume}
                onChange={(e) => setForm((p) => ({ ...p, annualVolume: e.target.value }))}
                placeholder="Select estimated volume"
              />
              <Input
                label="Products of interest (optional)"
                value={form.productsOfInterest}
                onChange={set("productsOfInterest")}
                placeholder="e.g. retractable awnings, louvered roofs"
              />
              <Textarea
                label="Additional notes (optional)"
                value={form.additionalNotes}
                onChange={set("additionalNotes")}
                rows={3}
                placeholder="Anything else you&apos;d like us to know about your business or requirements."
              />
            </fieldset>

            <Checkbox
              label={
                <>
                  I understand that trade pricing is assigned by Shadesology after reviewing my application,
                  and I agree to the{" "}
                  <Link href="/terms" className="text-[--color-brand-primary] underline" target="_blank">
                    Dealer Program Terms
                  </Link>
                  .
                </>
              }
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              error={errors.terms}
              required
            />

            <Button type="submit" fullWidth size="lg" isLoading={loading} data-conversion-event="primary_cta_click">
              Submit Application
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
