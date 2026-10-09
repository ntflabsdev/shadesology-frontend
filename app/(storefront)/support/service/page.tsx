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
import { uploadFileWithPostPolicy } from "@/lib/uploads";

const ENQUIRY_TYPES = [
  { value: "warranty_claim",    label: "Warranty Claim" },
  { value: "repair_request",    label: "Repair Request" },
  { value: "parts_enquiry",     label: "Spare Parts Enquiry" },
  { value: "installation_issue",label: "Installation Issue" },
  { value: "maintenance",       label: "Maintenance Advice" },
  { value: "other",             label: "Other" },
];

const PRODUCT_TYPES = [
  { value: "retractable_awning",  label: "Retractable Awning" },
  { value: "fabric_pergola",      label: "Fabric Pergola" },
  { value: "louvered_roof",       label: "Louvered Roof" },
  { value: "shade_sail",          label: "Shade Sail" },
  { value: "retractable_screen",  label: "Retractable Screen" },
  { value: "umbrella",            label: "Umbrella" },
  { value: "pool_cover",          label: "Pool Cover" },
  { value: "tensile_structure",   label: "Tensile Structure" },
  { value: "other",               label: "Other / Not Listed" },
];

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export default function ServiceRequestPage() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    orderNumber: "", productType: "", enquiryType: "",
    description: "", installDate: "", region: "",
    website: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [loading, setLoading]         = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [serverError, setServerError] = useState("");

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim())    e.firstName    = "Required";
    if (!form.lastName.trim())     e.lastName     = "Required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.productType)         e.productType  = "Please select a product type";
    if (!form.enquiryType)         e.enquiryType  = "Please select an enquiry type";
    if (!form.description.trim() || form.description.length < 20)
      e.description = "Please describe the issue (min 20 characters)";
    if (!acceptTerms) e.terms = "Please confirm your details are correct";
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
      const attachments = await Promise.all(photos.map(async (file) => {
        const signResponse = await fetch(`${BASE}/api/content/service-upload-url`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type, sizeBytes: file.size }),
        });
        const signed = await signResponse.json();
        if (!signResponse.ok) throw new Error(signed.message || "Could not prepare a service photo upload.");
        const uploadResponse = await uploadFileWithPostPolicy(signed.data, file);
        if (!uploadResponse.ok) throw new Error("A service photo could not be uploaded. Please retry or submit without photos.");
        return { s3Key: signed.data.key, filename: file.name };
      }));
      await submitLead("contact", {
          ...form,
          subject:     `Service Request — ${form.enquiryType.replace(/_/g, " ")}`,
          type:        "service_request",
          enquiryType: form.enquiryType,
          attachments,
          source: "service_request",
        });
      setSubmitted(true);
      window.dispatchEvent(new CustomEvent("shadesology:conversion", { detail: { event: "service_request_submitted", page: window.location.pathname } }));
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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
          <h1 className="text-xl font-bold mb-2">Request Received</h1>
          <p className="text-sm text-[--color-text-muted] mb-6">
            Thank you, {form.firstName}. Your service request has been logged.
            A member of our support team will contact you within 1–2 business days.
          </p>
          <div className="flex flex-col gap-2">
            <Button href="/support">Back to Support</Button>
            <Button href="/" variant="ghost">Return to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-[--color-brand-primary] text-white py-12">
        <div className="container max-w-2xl">
          <nav aria-label="Breadcrumb" className="text-sm text-white/60 mb-4">
            <Link href="/support" className="hover:text-white transition-colors">Support</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-white">Service Request</span>
          </nav>
          <h1 className="text-3xl font-bold mb-1">Submit a Service Request</h1>
          <p className="text-white/80">Our team responds within 1–2 business days.</p>
        </div>
      </header>

      <div className="container max-w-2xl py-12">
        <div className="bg-white rounded-2xl border border-[--color-border] p-8">
          {serverError && (
            <div role="alert" className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-[--color-error]">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <HoneypotField value={form.website} onChange={set("website")} />
            {/* Contact info */}
            <fieldset className="space-y-4">
              <legend className="text-base font-semibold text-[--color-text-primary] mb-3">
                Your contact details
              </legend>
              <div className="grid grid-cols-2 gap-4">
                <Input label="First name" value={form.firstName} onChange={set("firstName")} error={errors.firstName} required autoComplete="given-name" />
                <Input label="Last name"  value={form.lastName}  onChange={set("lastName")}  error={errors.lastName}  required autoComplete="family-name" />
              </div>
              <Input label="Email address" type="email" value={form.email} onChange={set("email")} error={errors.email} required autoComplete="email" />
              <Input label="Phone (optional)" type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" />
            </fieldset>

            {/* Product / order */}
            <fieldset className="space-y-4 pt-4 border-t border-[--color-border]">
              <legend className="text-base font-semibold text-[--color-text-primary] mb-3">
                Product details
              </legend>
              <Input
                label="Order number (if known)"
                value={form.orderNumber}
                onChange={set("orderNumber")}
                placeholder="SH-2026-00001"
                hint="Found in your confirmation email"
              />
              <Select
                label="Product type"
                options={PRODUCT_TYPES}
                value={form.productType}
                onChange={(e) => setForm((p) => ({ ...p, productType: e.target.value }))}
                error={errors.productType}
                placeholder="Select product type"
                required
              />
              <Input
                label="Approximate installation date (optional)"
                type="date"
                value={form.installDate}
                onChange={set("installDate")}
              />
              <Input
                label="City, state or ZIP (optional)"
                value={form.region}
                onChange={set("region")}
                autoComplete="postal-code"
                maxLength={100}
              />
            </fieldset>

            {/* Issue */}
            <fieldset className="space-y-4 pt-4 border-t border-[--color-border]">
              <legend className="text-base font-semibold text-[--color-text-primary] mb-3">
                Issue details
              </legend>
              <Select
                label="Type of enquiry"
                options={ENQUIRY_TYPES}
                value={form.enquiryType}
                onChange={(e) => setForm((p) => ({ ...p, enquiryType: e.target.value }))}
                error={errors.enquiryType}
                placeholder="Select enquiry type"
                required
              />
              <Textarea
                label="Describe the issue"
                value={form.description}
                onChange={set("description")}
                error={errors.description}
                rows={5}
                placeholder="Please describe the problem in as much detail as possible, including when it started and any steps already taken."
                hint="Minimum 20 characters. Attach up to five photos (JPEG, PNG, WebP or HEIC; 10 MB each)."
                required
              />
              <label className="block text-sm font-medium">Photos (optional)
                <input type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple className="mt-1 block w-full text-sm" onChange={(event) => {
                  const selected = Array.from(event.target.files ?? []);
                  if (selected.length > 5) {
                    setServerError("Please select no more than five photos.");
                    event.target.value = "";
                    return;
                  }
                  if (selected.some((file) => file.size > 10 * 1024 * 1024)) {
                    setServerError("Each photo must be 10 MB or smaller.");
                    event.target.value = "";
                    return;
                  }
                  setServerError("");
                  setPhotos(selected);
                }} />
                {photos.length > 0 && <span className="mt-1 block text-xs text-[--color-text-muted]">{photos.length} photo{photos.length === 1 ? "" : "s"} selected</span>}
              </label>
            </fieldset>

            <Checkbox
              label="I confirm the information above is accurate to the best of my knowledge."
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              error={errors.terms}
              required
            />

            <Button type="submit" fullWidth size="lg" isLoading={loading}>
              Submit Service Request
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[--color-text-muted]">
          Prefer to call?{" "}
          <a href="tel:18007423370" className="text-[--color-brand-primary] hover:underline font-medium">
            1-800-SHADES-0
          </a>
        </p>
      </div>
    </>
  );
}
