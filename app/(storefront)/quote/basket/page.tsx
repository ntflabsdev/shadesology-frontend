"use client";

/**
 * /quote/basket — Multi-item quote basket and submission.
 *
 * Flow:
 *   1. Customer adds items via "Add to Quote" buttons on product pages
 *      (items stored in localStorage under key 'quote_basket')
 *   2. Here they review items, fill in contact + project details
 *   3. Optionally upload drawings/photos directly to S3 via presigned URLs
 *   4. Submit → POST /api/quotes
 *   5. On success: show reference number + status link
 *
 * Guest customers get a one-time token in the response which creates
 * a bookmarkable status URL at /quote/status/[ref]?token=xxx
 */

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { uploadFileWithPostPolicy } from "@/lib/uploads";
import {
  clearQuoteBasket,
  loadQuoteBasket,
  saveQuoteBasket,
  type QuoteBasketItem,
} from "@/lib/quoteBasket";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface AttachmentFile {
  file:     File;
  key?:     string;   // S3 key after upload
  status:   "pending" | "uploading" | "done" | "error";
  error?:   string;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function QuoteBasketPage() {
  const [items, setItems]           = useState<QuoteBasketItem[]>([]);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const fileInputRef                = useRef<HTMLInputElement>(null);
  const [status, setStatus]         = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg]     = useState("");
  const [result, setResult]         = useState<{ referenceNumber: string; guestToken?: string } | null>(null);

  const [form, setForm] = useState({
    firstName:          "",
    lastName:           "",
    email:              "",
    phone:              "",
    company:            "",
    projectDescription: "",
    buildingType:       "residential",
    addressLine1:       "",
    addressCity:        "",
    addressState:       "",
    addressZip:         "",
    enquiryQueue:       "consumer",
  });

  // Load basket from localStorage on mount
  useEffect(() => {
    // localStorage is client-only; hydrate the server-rendered empty state on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(loadQuoteBasket());
    const handler = (e: CustomEvent) => setItems(e.detail as QuoteBasketItem[]);
    window.addEventListener("quoteBasketUpdated", handler as EventListener);
    return () => window.removeEventListener("quoteBasketUpdated", handler as EventListener);
  }, []);

  // ── Basket editing ────────────────────────────────────────────────────────

  function updateQty(idx: number, qty: number) {
    const next = items.map((item, i) =>
      i === idx ? { ...item, quantity: Math.max(1, qty) } : item
    );
    setItems(next);
    saveQuoteBasket(next);
  }

  function removeItem(idx: number) {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    saveQuoteBasket(next);
  }

  // ── File upload ───────────────────────────────────────────────────────────

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const newAttachments: AttachmentFile[] = files.map((file) => ({
      file,
      status: "pending",
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
    // Reset input so the same file can be added again after removal
    e.target.value = "";
  }

  async function uploadAttachment(idx: number): Promise<string | null> {
    const att = attachments[idx];
    if (!att || att.status === "done") return att?.key ?? null;

    setAttachments((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, status: "uploading" } : a))
    );

    try {
      // Step 1: Get presigned URL from API
      const urlRes = await fetch(`${BASE}/api/quotes/upload-url`, {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          filename:    att.file.name,
          contentType: att.file.type || "application/octet-stream",
          sizeBytes:   att.file.size,
        }),
      });

      if (!urlRes.ok) {
        const json = await urlRes.json().catch(() => ({}));
        throw new Error(json.message || "Failed to get upload URL");
      }

      const { key, uploadUrl, fields } = await urlRes.json();

      // Step 2: Upload directly to S3
      const uploadRes = await uploadFileWithPostPolicy({ uploadUrl, fields }, att.file);

      if (!uploadRes.ok) throw new Error(`S3 upload failed (${uploadRes.status})`);

      setAttachments((prev) =>
        prev.map((a, i) => (i === idx ? { ...a, status: "done", key } : a))
      );
      return key;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setAttachments((prev) =>
        prev.map((a, i) => (i === idx ? { ...a, status: "error", error: message } : a))
      );
      return null;
    }
  }

  function removeAttachment(idx: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Form submission ───────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting" || items.length === 0) return;
    setStatus("submitting");
    setErrorMsg("");

    // Upload all pending attachments first
    const uploadedKeys: string[] = [];
    for (let i = 0; i < attachments.length; i++) {
      const key = await uploadAttachment(i);
      if (!key) {
        setStatus("error");
        setErrorMsg(`Could not upload ${attachments[i].file.name}. Please retry or remove it.`);
        return;
      }
      uploadedKeys.push(key);
    }

    try {
      const payload = {
        items: items.map((item) => ({
          productId:       item.productId,
          variantId:       item.variantId,
          quantity:        item.quantity,
          selectedOptions: item.selectedOptions,
          notes:           item.notes || "",
        })),
        guestContact: {
          firstName: form.firstName.trim(),
          lastName:  form.lastName.trim(),
          email:     form.email.trim(),
          phone:     form.phone.trim(),
          company:   form.company.trim(),
        },
        projectDescription: form.projectDescription.trim(),
        buildingType:       form.buildingType,
        enquiryQueue:       form.enquiryQueue,
        installationAddress: {
          line1:   form.addressLine1.trim(),
          city:    form.addressCity.trim(),
          state:   form.addressState.trim(),
          zip:     form.addressZip.trim(),
          country: "US",
        },
        // Attachments already uploaded — just pass the S3 keys
        attachments: uploadedKeys.map((s3Key, idx) => ({
          s3Key,
          filename: attachments[idx].file.name,
        })),
      };

      const res = await fetch(`${BASE}/api/quotes`, {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body:        JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Failed to submit quote request.");
      }

      const json = await res.json();
      setResult({ referenceNumber: json.referenceNumber, guestToken: json.guestToken });
      clearQuoteBasket();
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  // ─── Success screen ────────────────────────────────────────────────────────

  if (status === "success" && result) {
    const statusHref  = result.guestToken
      ? `/quote/status/${result.referenceNumber}?token=${result.guestToken}`
      : "/account/quotes";

    return (
      <div className="container py-24 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[--color-brand-primary] mb-2">
          Quote Request Received
        </h1>
        <p className="text-[--color-text-muted] mb-1">
          Reference number: <strong className="text-[--color-text-primary]">{result.referenceNumber}</strong>
        </p>
        <p className="text-[--color-text-muted] mb-6 text-sm">
          We will review your request and respond within 1–2 business days.
          A confirmation email is on its way.
        </p>

        <Link
          href={statusHref}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[--color-brand-primary] text-white font-semibold hover:bg-[--color-brand-primary-light] transition-colors mb-3"
        >
          Track Quote Status
        </Link>

        {result.guestToken && (
          <p className="text-xs text-[--color-text-muted] mt-2">
            Bookmark the status link above — it is only shown once.
            We also included it in your confirmation email.
          </p>
        )}

        <div className="mt-6">
          <Link href="/products" className="text-sm text-[--color-brand-primary] hover:underline">
            Continue browsing products
          </Link>
        </div>
      </div>
    );
  }

  // ─── Empty basket ──────────────────────────────────────────────────────────

  if (items.length === 0 && status !== "submitting") {
    return (
      <div className="container py-24 text-center max-w-md mx-auto">
        <svg className="mx-auto mb-4 opacity-25" width="64" height="64" fill="none" viewBox="0 0 64 64" aria-hidden="true">
          <path d="M12 8h40a4 4 0 014 4v32a4 4 0 01-4 4H12a4 4 0 01-4-4V12a4 4 0 014-4z" stroke="currentColor" strokeWidth="2" />
          <path d="M24 28h16M24 36h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <h1 className="text-2xl font-bold text-[--color-text-primary] mb-2">
          Your quote basket is empty
        </h1>
        <p className="text-[--color-text-muted] mb-6 text-sm">
          Browse our products and click &ldquo;Add to Quote&rdquo; on any product page.
        </p>
        <Button href="/products">Browse Products</Button>
      </div>
    );
  }

  // ─── Main form ─────────────────────────────────────────────────────────────

  return (
    <>
      <header className="bg-[--color-brand-primary] text-white py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-1">Quote Basket</h1>
          <p className="text-white/75 text-sm">
            Review your items and submit a quote request.
          </p>
        </div>
      </header>

      <div className="container py-12">
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── Left column: items + attachments ─────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Items */}
              <section aria-labelledby="items-heading">
                <h2 id="items-heading" className="text-lg font-bold mb-4 text-[--color-text-primary]">
                  Items ({items.length})
                </h2>
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 p-4 rounded-xl border border-[--color-border] bg-white"
                    >
                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[--color-text-primary] truncate">
                          {item.productName}
                        </p>
                        {item.variantName && (
                          <p className="text-sm text-[--color-text-muted]">{item.variantName}</p>
                        )}
                        {item.sku && (
                          <p className="text-xs text-[--color-text-muted]">SKU: {item.sku}</p>
                        )}
                        {/* Selected options */}
                        {Object.entries(item.selectedOptions).length > 0 && (
                          <ul className="mt-1 flex flex-wrap gap-1">
                            {Object.entries(item.selectedOptions).map(([k, v]) => (
                              <li key={k}>
                                <span className="text-xs bg-[--color-neutral-100] px-2 py-0.5 rounded-full">
                                  {k}: {v}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQty(idx, item.quantity - 1)}
                            className="w-7 h-7 rounded border border-[--color-border] text-sm font-bold hover:bg-[--color-neutral-100] transition-colors"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQty(idx, item.quantity + 1)}
                            className="w-7 h-7 rounded border border-[--color-border] text-sm font-bold hover:bg-[--color-neutral-100] transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-xs text-[--color-error] hover:underline"
                          aria-label={`Remove ${item.productName} from quote`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Attachments */}
              <section aria-labelledby="attachments-heading">
                <h2 id="attachments-heading" className="text-lg font-bold mb-1 text-[--color-text-primary]">
                  Drawings & Photos
                </h2>
                <p className="text-sm text-[--color-text-muted] mb-4">
                  Upload site photos, drawings or measurements (JPEG, PNG, PDF, CAD — up to 50 MB each).
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,application/pdf,.dwg,.dxf"
                  multiple
                  className="sr-only"
                  aria-label="Upload attachments"
                  onChange={handleFileSelect}
                  id="file-upload"
                />

                {attachments.length > 0 && (
                  <ul className="space-y-2 mb-3">
                    {attachments.map((att, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-[--color-border] text-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {att.status === "uploading" && (
                            <svg className="animate-spin h-4 w-4 text-[--color-brand-primary] shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                          )}
                          {att.status === "done" && (
                            <svg className="h-4 w-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {att.status === "error" && (
                            <svg className="h-4 w-4 text-[--color-error] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {att.status === "pending" && (
                            <svg className="h-4 w-4 text-[--color-text-muted] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                          )}
                          <span className="truncate text-[--color-text-primary]">{att.file.name}</span>
                          {att.error && <span className="text-xs text-[--color-error] shrink-0">{att.error}</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="text-xs text-[--color-text-muted] hover:text-[--color-error] shrink-0"
                          aria-label={`Remove ${att.file.name}`}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-[--color-border] text-sm text-[--color-text-muted] hover:border-[--color-brand-primary] hover:text-[--color-brand-primary] cursor-pointer transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add files
                </label>
              </section>
            </div>

            {/* ── Right column: contact + project details ──────────────── */}
            <div className="space-y-6">

              {/* Contact */}
              <section
                aria-labelledby="contact-heading"
                className="p-5 rounded-2xl border border-[--color-border] bg-white space-y-4"
              >
                <h2 id="contact-heading" className="font-bold text-[--color-text-primary]">
                  Your Details
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First name"
                    name="firstName"
                    value={form.firstName}
                    onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                    autoComplete="given-name"
                    required
                  />
                  <Input
                    label="Last name"
                    name="lastName"
                    value={form.lastName}
                    onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                    autoComplete="family-name"
                    required
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  autoComplete="email"
                  required
                />
                <Input
                  label="Phone (optional)"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  autoComplete="tel"
                />
                <Input
                  label="Company (optional)"
                  name="company"
                  value={form.company}
                  onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                  autoComplete="organization"
                />
              </section>

              {/* Project details */}
              <section
                aria-labelledby="project-heading"
                className="p-5 rounded-2xl border border-[--color-border] bg-white space-y-4"
              >
                <h2 id="project-heading" className="font-bold text-[--color-text-primary]">
                  Project Details
                </h2>

                <div>
                  <label htmlFor="buildingType" className="block text-sm font-medium mb-1.5 text-[--color-text-primary]">
                    Building type
                  </label>
                  <select
                    id="buildingType"
                    value={form.buildingType}
                    onChange={(e) => setForm((p) => ({ ...p, buildingType: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-[--color-border] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent]"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="government">Government</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="enquiryQueue" className="block text-sm font-medium mb-1.5 text-[--color-text-primary]">
                    Project type
                  </label>
                  <select
                    id="enquiryQueue"
                    value={form.enquiryQueue}
                    onChange={(e) => setForm((p) => ({ ...p, enquiryQueue: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-[--color-border] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent]"
                  >
                    <option value="consumer">Residential / Consumer</option>
                    <option value="commercial">Commercial / Trade</option>
                  </select>
                </div>

                <Input
                  label="Address / City"
                  name="addressLine1"
                  placeholder="e.g. 123 Main St, Miami, FL"
                  value={form.addressLine1}
                  onChange={(e) => setForm((p) => ({ ...p, addressLine1: e.target.value }))}
                />

                <Textarea
                  label="Project description"
                  id="projectDescription"
                  value={form.projectDescription}
                  onChange={(e) => setForm((p) => ({ ...p, projectDescription: e.target.value }))}
                  rows={4}
                  placeholder="Describe your project — size, setting, any requirements…"
                  required
                />
              </section>

              {/* Submit */}
              {status === "error" && (
                <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={status === "submitting"}
                disabled={items.length === 0 || status === "submitting"}
              >
                Submit Quote Request
              </Button>

              <p className="text-xs text-[--color-text-muted]">
                By submitting, you agree to our{" "}
                <Link href="/privacy" className="text-[--color-brand-primary] hover:underline">Privacy Policy</Link>.
                No spam, ever.
              </p>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
