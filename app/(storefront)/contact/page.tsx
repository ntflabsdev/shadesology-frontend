"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HoneypotField } from "@/components/forms/HoneypotField";
import { submitLead } from "@/lib/leads";

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  website: string;
  productType: string;
  region: string;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    website: "",
    productType: "",
    region: "",
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
      await submitLead("contact", form);
      setStatus("success");
      window.dispatchEvent(new CustomEvent("shadesology:conversion", { detail: { event: "contact_submitted", page: window.location.pathname } }));
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="container py-24 text-center max-w-xl mx-auto">
        <div className="text-5xl mb-4" aria-hidden="true">✓</div>
        <h1 className="text-3xl font-bold text-[--color-brand-primary] mb-3">Message Sent!</h1>
        <p className="text-[--color-text-muted] mb-8">
          Thanks for reaching out. Our team will get back to you within 1 business day.
        </p>
        <Link
          href="/"
          className="inline-flex px-6 py-2.5 rounded-xl bg-[--color-brand-primary] text-white font-semibold hover:bg-[--color-brand-primary-light] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <>
      <header className="bg-[--color-brand-primary] text-white py-14">
        <div className="container">
          <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-white/80">We&apos;re here to help — reach out any time.</p>
        </div>
      </header>

      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact info */}
          <aside aria-label="Contact information">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold mb-3">Get in Touch</h2>
                <div className="space-y-3 text-sm text-[--color-text-muted]">
                  <div className="flex items-start gap-3">
                    <span className="text-[--color-brand-primary] mt-0.5" aria-hidden="true">📞</span>
                    <div>
                      <p className="font-semibold text-[--color-text-primary]">Phone</p>
                      <a href="tel:18007423370" className="hover:text-[--color-brand-primary] transition-colors">
                        1-800-SHADES-0
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[--color-brand-primary] mt-0.5" aria-hidden="true">✉</span>
                    <div>
                      <p className="font-semibold text-[--color-text-primary]">Email</p>
                      <a href="mailto:hello@shadesology.com" className="hover:text-[--color-brand-primary] transition-colors">
                        hello@shadesology.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[--color-brand-primary] mt-0.5" aria-hidden="true">🕐</span>
                    <div>
                      <p className="font-semibold text-[--color-text-primary]">Hours</p>
                      <p>Mon–Fri: 8am–6pm EST</p>
                      <p>Sat: 9am–2pm EST</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[--color-border]">
                <h3 className="font-semibold mb-2">Quick Links</h3>
                <ul className="space-y-1.5 text-sm">
                  {[
                    { href: "/quote", label: "Request a Quote" },
                    { href: "/find-installer", label: "Find an Installer" },
                    { href: "/support", label: "Support Center" },
                    { href: "/warranty", label: "Warranty Claims" },
                  ].map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-[--color-brand-primary] hover:underline"
                      >
                        {link.label} →
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Form */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} noValidate aria-label="Contact form">
              <HoneypotField value={form.website} onChange={handleChange} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                    Full Name <span className="text-[--color-error]" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    className="w-full px-4 py-2.5 rounded-xl border border-[--color-border] focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent] text-sm"
                    aria-required="true"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                    Email <span className="text-[--color-error]" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="w-full px-4 py-2.5 rounded-xl border border-[--color-border] focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent] text-sm"
                    aria-required="true"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    className="w-full px-4 py-2.5 rounded-xl border border-[--color-border] focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent] text-sm"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-1.5">
                    Subject <span className="text-[--color-error]" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[--color-border] focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent] text-sm bg-white"
                    aria-required="true"
                  >
                    <option value="">Select a subject…</option>
                    <option value="product_inquiry">Product Inquiry</option>
                    <option value="quote_request">Quote Request</option>
                    <option value="order_support">Order Support</option>
                    <option value="installation">Installation Help</option>
                    <option value="warranty">Warranty Claim</option>
                    <option value="trade_dealer">Trade / Dealer Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="productType" className="block text-sm font-medium mb-1.5">Product (optional)</label>
                  <input id="productType" name="productType" type="text" maxLength={100} value={form.productType} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-[--color-border] text-sm" />
                </div>
                <div>
                  <label htmlFor="region" className="block text-sm font-medium mb-1.5">City, state or ZIP (optional)</label>
                  <input id="region" name="region" type="text" maxLength={100} autoComplete="postal-code" value={form.region} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-[--color-border] text-sm" />
                </div>

                {/* Message */}
                <div className="sm:col-span-2">
                  <label htmlFor="message" className="block text-sm font-medium mb-1.5">
                    Message <span className="text-[--color-error]" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    minLength={10}
                    maxLength={10000}
                    rows={5}
                    className="w-full px-4 py-2.5 rounded-xl border border-[--color-border] focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent] text-sm resize-y"
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Error */}
              {status === "error" && (
                <div
                  role="alert"
                  className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700"
                >
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-6 px-8 py-3 rounded-xl bg-[--color-brand-primary] text-white font-bold hover:bg-[--color-brand-primary-light] transition-colors disabled:opacity-60 flex items-center gap-2"
                aria-busy={status === "loading"}
                data-conversion-event="primary_cta_click"
              >
                {status === "loading" ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Sending…
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
