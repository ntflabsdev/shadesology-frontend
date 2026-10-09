"use client";

import React, { useState } from "react";
import Link from "next/link";
import { trackConversion } from "@/lib/conversion";
import { HoneypotField } from "@/components/forms/HoneypotField";
import { submitLead } from "@/lib/leads";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  productType: string;
  projectDescription: string;
  budget: string;
  timeline: string;
  installationType: string;
  address: string;
  notes: string;
  website: string;
}

export default function QuotePage() {
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    productType: "",
    projectDescription: "",
    budget: "",
    timeline: "",
    installationType: "",
    address: "",
    notes: "",
    website: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setErrorMsg("");

    try {
      await submitLead("leads", {
        type: "quote",
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        phone: form.phone,
        company: form.company,
        productType: form.productType,
        region: form.address,
        source: "quote_page",
        data: form,
      });
      setStatus("success");
      trackConversion("quote_submitted", {
        product_type: form.productType || "unspecified",
        lead_source: "quote_page",
      });
    } catch (err) {
      // Keep the form available so the user can retry.
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="container py-24 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[--color-brand-primary] mb-3">Quote Request Received</h1>
        <p className="text-[--color-text-muted] mb-8">
          Thank you! Our team will review your project and send a detailed quote within 1–2 business days.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/" className="px-6 py-2.5 rounded-xl bg-[--color-brand-primary] text-white font-semibold hover:bg-[--color-brand-primary-light] transition-colors">
            Back to Home
          </Link>
          <Link href="/products" className="px-6 py-2.5 rounded-xl border-2 border-[--color-brand-primary] text-[--color-brand-primary] font-semibold hover:bg-[--color-brand-primary] hover:text-white transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-[--color-brand-primary] text-white py-14">
        <div className="container">
          <h1 className="text-4xl font-bold mb-2">Request a Quote</h1>
          <p className="text-white/80">
            Tell us about your project and we&apos;ll send a detailed, no-obligation quote.
          </p>
        </div>
      </header>

      <div className="container py-16 max-w-3xl">
        {/* Trust signals */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: "⚡", label: "Fast Response", sub: "Within 1–2 business days" },
            { icon: "🔒", label: "No Obligation", sub: "Free quote, no pressure" },
            { icon: "🏆", label: "Expert Advice", sub: "Shade specialists on hand" },
          ].map((item) => (
            <div key={item.label} className="text-center p-4 rounded-xl bg-[--color-neutral-50] border border-[--color-border]">
              <span className="text-2xl" aria-hidden="true">{item.icon}</span>
              <p className="text-sm font-bold mt-1">{item.label}</p>
              <p className="text-xs text-[--color-text-muted]">{item.sub}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate aria-label="Quote request form">
        <HoneypotField value={form.website} onChange={handleChange} />
          {/* Personal details */}
          <fieldset className="mb-8">
            <legend className="text-lg font-bold mb-5 pb-2 border-b border-[--color-border] w-full">
              Your Details
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1.5">
                  First Name <span className="text-[--color-error]" aria-hidden="true">*</span>
                </label>
                <input id="firstName" name="firstName" type="text" value={form.firstName} onChange={handleChange} required autoComplete="given-name"
                  className="w-full px-4 py-2.5 rounded-xl border border-[--color-border] focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent] text-sm" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1.5">
                  Last Name <span className="text-[--color-error]" aria-hidden="true">*</span>
                </label>
                <input id="lastName" name="lastName" type="text" value={form.lastName} onChange={handleChange} required autoComplete="family-name"
                  className="w-full px-4 py-2.5 rounded-xl border border-[--color-border] focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent] text-sm" />
              </div>
              <div>
                <label htmlFor="q-email" className="block text-sm font-medium mb-1.5">
                  Email <span className="text-[--color-error]" aria-hidden="true">*</span>
                </label>
                <input id="q-email" name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="email"
                  className="w-full px-4 py-2.5 rounded-xl border border-[--color-border] focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent] text-sm" />
              </div>
              <div>
                <label htmlFor="q-phone" className="block text-sm font-medium mb-1.5">Phone</label>
                <input id="q-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} autoComplete="tel"
                  className="w-full px-4 py-2.5 rounded-xl border border-[--color-border] focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent] text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="company" className="block text-sm font-medium mb-1.5">Company / Business (optional)</label>
                <input id="company" name="company" type="text" value={form.company} onChange={handleChange} autoComplete="organization"
                  className="w-full px-4 py-2.5 rounded-xl border border-[--color-border] focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent] text-sm" />
              </div>
            </div>
          </fieldset>

          {/* Project details */}
          <fieldset className="mb-8">
            <legend className="text-lg font-bold mb-5 pb-2 border-b border-[--color-border] w-full">
              Project Details
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="productType" className="block text-sm font-medium mb-1.5">
                  Product Type <span className="text-[--color-error]" aria-hidden="true">*</span>
                </label>
                <select id="productType" name="productType" value={form.productType} onChange={handleChange} required
                  className="w-full px-4 py-2.5 rounded-xl border border-[--color-border] focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent] text-sm bg-white">
                  <option value="">Select product type…</option>
                  <option value="retractable-awning">Retractable Awning</option>
                  <option value="fabric-pergola">Fabric Pergola</option>
                  <option value="louvered-roof">Louvered Roof</option>
                  <option value="shade-sail">Shade Sail</option>
                  <option value="retractable-screen">Retractable Screen</option>
                  <option value="horizontal-blind">Horizontal Blind</option>
                  <option value="umbrella">Umbrella</option>
                  <option value="pool-cover">Pool Cover</option>
                  <option value="tensile-structure">Tensile Structure</option>
                  <option value="unsure">Not Sure — Need Advice</option>
                </select>
              </div>
              <div>
                <label htmlFor="installationType" className="block text-sm font-medium mb-1.5">Installation Type</label>
                <select id="installationType" name="installationType" value={form.installationType} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[--color-border] focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent] text-sm bg-white">
                  <option value="">Select…</option>
                  <option value="wall">Wall mount</option>
                  <option value="roof">Roof mount</option>
                  <option value="soffit">Soffit</option>
                  <option value="freestanding">Freestanding</option>
                  <option value="unsure">Unsure</option>
                </select>
              </div>
              <div>
                <label htmlFor="budget" className="block text-sm font-medium mb-1.5">Budget Range</label>
                <select id="budget" name="budget" value={form.budget} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[--color-border] focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent] text-sm bg-white">
                  <option value="">Prefer not to say</option>
                  <option value="under_2500">Under $2,500</option>
                  <option value="2500_5000">$2,500 – $5,000</option>
                  <option value="5000_10000">$5,000 – $10,000</option>
                  <option value="10000_25000">$10,000 – $25,000</option>
                  <option value="25000_plus">$25,000+</option>
                </select>
              </div>
              <div>
                <label htmlFor="timeline" className="block text-sm font-medium mb-1.5">Desired Timeline</label>
                <select id="timeline" name="timeline" value={form.timeline} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[--color-border] focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent] text-sm bg-white">
                  <option value="">Flexible</option>
                  <option value="asap">As soon as possible</option>
                  <option value="1_month">Within 1 month</option>
                  <option value="3_months">1–3 months</option>
                  <option value="6_months">3–6 months</option>
                  <option value="planning">Still planning</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium mb-1.5">
                  Installation Address / City <span className="text-[--color-error]" aria-hidden="true">*</span>
                </label>
                <input id="address" name="address" type="text" value={form.address} onChange={handleChange} required
                  placeholder="e.g. Miami, FL 33101"
                  className="w-full px-4 py-2.5 rounded-xl border border-[--color-border] focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent] text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="projectDescription" className="block text-sm font-medium mb-1.5">
                  Project Description <span className="text-[--color-error]" aria-hidden="true">*</span>
                </label>
                <textarea id="projectDescription" name="projectDescription" value={form.projectDescription} onChange={handleChange} required rows={4}
                  placeholder="Tell us about your project — size, setting, any specific requirements…"
                  className="w-full px-4 py-2.5 rounded-xl border border-[--color-border] focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent] text-sm resize-y" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium mb-1.5">Additional Notes</label>
                <textarea id="notes" name="notes" value={form.notes} onChange={handleChange} rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-[--color-border] focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent] text-sm resize-y" />
              </div>
            </div>
          </fieldset>

          {status === "error" && (
            <div role="alert" className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            data-conversion-event="primary_cta_click"
            disabled={status === "loading"}
            className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-[--color-brand-primary] text-white font-bold text-base hover:bg-[--color-brand-primary-light] transition-colors disabled:opacity-60 flex items-center gap-2"
            aria-busy={status === "loading"}
          >
            {status === "loading" ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Submitting…
              </>
            ) : (
              "Submit Quote Request"
            )}
          </button>
          <p className="mt-3 text-xs text-[--color-text-muted]">
            By submitting this form, you agree to our{" "}
            <Link href="/privacy" className="text-[--color-brand-primary] hover:underline">Privacy Policy</Link>.
            No spam, ever.
          </p>
        </form>
      </div>
    </>
  );
}
