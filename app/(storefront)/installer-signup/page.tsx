"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { HoneypotField } from "@/components/forms/HoneypotField";
import { loginUser, registerUser } from "@/lib/api";
import { uploadFileWithPostPolicy } from "@/lib/uploads";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

const STATES = [
  { value: "AL", label: "Alabama" }, { value: "AZ", label: "Arizona" },
  { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
  { value: "FL", label: "Florida" }, { value: "GA", label: "Georgia" },
  { value: "IL", label: "Illinois" }, { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" }, { value: "MN", label: "Minnesota" },
  { value: "NJ", label: "New Jersey" }, { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" }, { value: "OH", label: "Ohio" },
  { value: "OR", label: "Oregon" }, { value: "PA", label: "Pennsylvania" },
  { value: "TN", label: "Tennessee" }, { value: "TX", label: "Texas" },
  { value: "VA", label: "Virginia" }, { value: "WA", label: "Washington" },
  { value: "other", label: "Other" },
].sort((a, b) => a.label.localeCompare(b.label));

const YEARS_EXP = [
  { value: "0-2",  label: "0–2 years" },
  { value: "3-5",  label: "3–5 years" },
  { value: "6-10", label: "6–10 years" },
  { value: "10+",  label: "10+ years" },
];

export default function InstallerSignupPage() {
  const [form, setForm] = useState({
    businessName: "", contactName: "", email: "", phone: "",
    city: "", state: "", coverageZips: "",
    licenseNumber: "", licenseExpiry: "",
    insuranceProvider: "", insuranceExpiry: "",
    yearsExperience: "", specialities: "",
    description: "",
    faxNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [existingAccount, setExistingAccount] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [agreedToTerms, setAgreed] = useState(false);
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
    if (!form.businessName.trim()) e.businessName = "Required";
    if (!form.contactName.trim())  e.contactName  = "Required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim())        e.phone        = "Required";
    if (!form.city.trim())         e.city         = "Required";
    if (!form.state)               e.state        = "Required";
    if (!form.licenseNumber.trim()) e.licenseNumber = "Required";
    if (!form.insuranceProvider.trim()) e.insuranceProvider = "Required";
    if (!form.insuranceExpiry || new Date(form.insuranceExpiry) <= new Date()) e.insuranceExpiry = "Choose a future expiry date.";
    if (!form.yearsExperience)     e.yearsExperience = "Required";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (!existingAccount && form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    if (documents.length > 5) e.documents = "Upload no more than five documents.";
    if (documents.some((file) => {
      const maxBytes = file.type === "application/pdf" ? 100 * 1024 * 1024 : 15 * 1024 * 1024;
      return !["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > maxBytes;
    })) e.documents = "Documents must be PDF, JPEG, PNG or WebP within the file-size limit.";
    if (!agreedToTerms)            e.terms        = "You must agree to continue";
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
      const names = form.contactName.trim().split(/\s+/);
      if (!existingAccount) {
        await registerUser({
          firstName: names[0],
          lastName: names.slice(1).join(" ") || "Installer",
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim(),
        });
      }
      await loginUser(form.email.trim(), form.password);
      const uploadedDocuments = await Promise.all(documents.map(async (file) => {
        const signResponse = await fetch(`${BASE}/api/installers/application-upload-url`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type, sizeBytes: file.size }),
        });
        const signed = await signResponse.json();
        if (!signResponse.ok) throw new Error(signed.message || "Could not prepare a private document upload.");
        const uploadResponse = await uploadFileWithPostPolicy(signed.data, file);
        if (!uploadResponse.ok) throw new Error(`Could not upload ${file.name}. Please retry.`);
        return { key: signed.data.key, label: file.name };
      }));
      const experienceByRange: Record<string, number> = { "0-2": 1, "3-5": 4, "6-10": 8, "10+": 10 };
      const experience = experienceByRange[form.yearsExperience] ?? Number(form.yearsExperience);
      const coverageAreas = form.coverageZips.split(",").map((entry) => {
        const [postcode, rawRadius, rawLat, rawLng] = entry.trim().split(":");
        return {
          postcode: postcode?.trim(),
          radiusMiles: rawRadius ? Number(rawRadius) : 25,
          ...(rawLat && rawLng ? { lat: Number(rawLat), lng: Number(rawLng) } : {}),
        };
      }).filter((area) => area.postcode);
      const response = await fetch(`${BASE}/api/installers/apply`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faxNumber: form.faxNumber,
          businessName: form.businessName,
          contactName: form.contactName,
          phone: form.phone,
          city: form.city,
          state: form.state,
          coverageAreas,
          licenseNumber: form.licenseNumber,
          licenseExpiry: form.licenseExpiry || undefined,
          insuranceProvider: form.insuranceProvider,
          insuranceExpiry: form.insuranceExpiry,
          yearsExperience: experience,
          specialities: form.specialities.split(",").map((item) => item.trim()).filter(Boolean),
          description: form.description,
          documents: uploadedDocuments,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Application could not be submitted.");
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
          <h1 className="text-xl font-bold mb-2">Application Received!</h1>
          <p className="text-sm text-[--color-text-muted] mb-6">
            Thank you, {form.contactName.split(" ")[0]}! We&apos;ve received your installer application and will
            review it. Check your application status any time.
          </p>
          <div className="flex flex-col gap-2">
            <Button href="/installer-signup/status">Check application status</Button>
            <Button href="/" variant="outline">Return to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-[--color-brand-primary] text-white py-14">
        <div className="container max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">Join Our Installer Network</h1>
          <p className="text-white/80">
            Apply to become a certified Shadesology installer and receive qualified leads in your area.
          </p>
        </div>
      </header>

      {/* Benefits */}
      <div className="bg-[--color-neutral-50] border-b border-[--color-border]">
        <div className="container max-w-2xl py-8">
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {[
              { icon: "📍", text: "Qualified local leads in your coverage area" },
              { icon: "🎓", text: "Product training and certification support" },
              { icon: "💼", text: "Priority listing in our installer directory" },
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
            {/* Business info */}
            <fieldset className="space-y-4">
              <legend className="text-base font-semibold text-[--color-text-primary] mb-3">Business information</legend>
              <Input label="Business name" value={form.businessName} onChange={set("businessName")} error={errors.businessName} required />
              <Input label="Primary contact name" value={form.contactName} onChange={set("contactName")} error={errors.contactName} required autoComplete="name" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Email" type="email" value={form.email} onChange={set("email")} error={errors.email} required autoComplete="email" />
                <Input label="Phone" type="tel" value={form.phone} onChange={set("phone")} error={errors.phone} required autoComplete="tel" />
              </div>
              <Input
                label={existingAccount ? "Account password" : "Create account password"}
                type="password"
                value={form.password}
                onChange={set("password")}
                error={errors.password}
                hint="At least 8 characters."
                autoComplete={existingAccount ? "current-password" : "new-password"}
                required
              />
              {!existingAccount && <Input
                label="Confirm account password"
                type="password"
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                error={errors.confirmPassword}
                autoComplete="new-password"
                required
              />}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={existingAccount} onChange={(event) => setExistingAccount(event.target.checked)} />
                I already have a Shadesology account
              </label>
            </fieldset>

            {/* Location & coverage */}
            <fieldset className="space-y-4 pt-4 border-t border-[--color-border]">
              <legend className="text-base font-semibold text-[--color-text-primary] mb-3">Location & Coverage Area</legend>
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" value={form.city} onChange={set("city")} error={errors.city} required />
                <Select label="State" options={STATES} value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} error={errors.state} placeholder="Select state" required />
              </div>
              <Input
                label="ZIP coverage rules (comma-separated)"
                value={form.coverageZips}
                onChange={set("coverageZips")}
                placeholder="33101:25:25.7617:-80.1918, 33102:25"
                hint="Use ZIP:radius in miles; add latitude and longitude to enable radius-overlap and distance mapping."
              />
            </fieldset>

            {/* Experience */}
            <fieldset className="space-y-4 pt-4 border-t border-[--color-border]">
              <legend className="text-base font-semibold text-[--color-text-primary] mb-3">Experience & Qualifications</legend>
              <Select
                label="Years of installation experience"
                options={YEARS_EXP}
                value={form.yearsExperience}
                onChange={(e) => setForm((p) => ({ ...p, yearsExperience: e.target.value }))}
                error={errors.yearsExperience}
                placeholder="Select years of experience"
                required
              />
              <Input
                label="License number"
                value={form.licenseNumber}
                onChange={set("licenseNumber")}
                placeholder="Contractor license number"
                error={errors.licenseNumber}
                required
              />
              <Input label="License expiry (optional)" type="date" value={form.licenseExpiry} onChange={set("licenseExpiry")} />
              <Input label="Insurance provider" value={form.insuranceProvider} onChange={set("insuranceProvider")} error={errors.insuranceProvider} required />
              <Input label="Insurance expiry" type="date" value={form.insuranceExpiry} onChange={set("insuranceExpiry")} error={errors.insuranceExpiry} required />
              <Input label="Specialities (comma-separated)" value={form.specialities} onChange={set("specialities")} placeholder="Awnings, pergolas, retractable screens" />
              <label className="block text-sm font-medium">
                License and insurance documents (PDF, JPEG, PNG or WebP; up to 5 files)
                <input
                  className="mt-2 block w-full rounded border border-gray-300 p-2 text-sm"
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(event) => setDocuments(Array.from(event.target.files || []))}
                />
              </label>
              {errors.documents && <p role="alert" className="text-sm text-red-700">{errors.documents}</p>}
              {documents.length > 0 && <ul className="list-inside list-disc text-xs text-[--color-text-muted]">{documents.map((file) => <li key={`${file.name}-${file.size}`}>{file.name}</li>)}</ul>}
              <Textarea
                label="Tell us about your business"
                value={form.description}
                onChange={set("description")}
                rows={4}
                placeholder="Describe your business, the types of products you install, and any relevant certifications you hold."
              />
            </fieldset>

            <Checkbox
              label={
                <>
                  I agree to the{" "}
                  <Link href="/terms" className="text-[--color-brand-primary] underline" target="_blank">Installer Network Terms</Link>
                  {" "}and understand my application will be reviewed by Shadesology.
                </>
              }
              checked={agreedToTerms}
              onChange={(e) => setAgreed(e.target.checked)}
              error={errors.terms}
              required
            />

            <Button type="submit" fullWidth size="lg" isLoading={loading} data-conversion-event="primary_cta_click">
              Submit Application
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-[--color-text-muted]">
          Already applied?{" "}
          <Link href="/installer-signup/status" className="text-[--color-brand-primary] hover:underline">
            Sign in to check your status
          </Link>
        </p>
      </div>
    </>
  );
}
