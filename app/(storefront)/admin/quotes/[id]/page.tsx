"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const STATUSES = ["submitted", "in_review", "quoted", "accepted", "declined", "expired"];

interface StaffOption { _id: string; firstName: string; lastName: string; email: string }
interface QuoteDetail {
  _id: string;
  referenceNumber: string;
  status: string;
  enquiryQueue: string;
  guestContact?: { firstName?: string; lastName?: string; email?: string; phone?: string; company?: string };
  user?: { firstName?: string; lastName?: string; email?: string; phone?: string };
  items: Array<{ productName?: string; variantName?: string; sku?: string; quantity: number; selectedOptions?: Record<string, string>; notes?: string; unitPrice?: number | null; totalPrice?: number | null }>;
  attachments: Array<{ _id: string; filename: string; contentType: string; sizeBytes: number }>;
  projectDescription?: string;
  installationAddress?: { line1?: string; city?: string; state?: string; zip?: string; country?: string };
  subtotal?: number | null;
  tax?: number | null;
  total?: number | null;
  currency: string;
  priceLocked: boolean;
  expiresAt?: string;
  assignedTo?: string | { _id: string };
  pdfS3Key?: string;
  orderId?: string;
}

function moneyInput(cents?: number | null) {
  return cents == null ? "" : (cents / 100).toFixed(2);
}
function centsValue(value: string) {
  if (!value.trim()) return undefined;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0 || !Number.isSafeInteger(Math.round(amount * 100))) {
    throw new Error("Enter a valid non-negative price.");
  }
  return Math.round(amount * 100);
}

export default function AdminQuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [status, setStatus] = useState("");
  const [assignee, setAssignee] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [tax, setTax] = useState("");
  const [total, setTotal] = useState("");
  const [itemPrices, setItemPrices] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [quoteResponse, staffResponse] = await Promise.all([
        fetch(`${BASE}/admin/quotes/${encodeURIComponent(id)}`, { credentials: "include", cache: "no-store" }),
        fetch(`${BASE}/admin/quotes/staff`, { credentials: "include", cache: "no-store" }),
      ]);
      const [quoteJson, staffJson] = await Promise.all([quoteResponse.json(), staffResponse.json()]);
      if (!quoteResponse.ok) throw new Error(quoteJson.message || "Could not load this quote.");
      if (!staffResponse.ok) throw new Error(staffJson.message || "Could not load staff assignments.");
      const data = quoteJson.data as QuoteDetail;
      setQuote(data);
      setStaff(staffJson.data ?? []);
      setStatus(data.status);
      setAssignee(typeof data.assignedTo === "string" ? data.assignedTo : data.assignedTo?._id ?? "");
      setSubtotal(moneyInput(data.subtotal));
      setTax(moneyInput(data.tax));
      setTotal(moneyInput(data.total));
      setItemPrices(data.items.map((item) => moneyInput(item.unitPrice)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this quote.");
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    async function fetchQuote() {
      try {
        const [quoteResponse, staffResponse] = await Promise.all([
          fetch(`${BASE}/admin/quotes/${encodeURIComponent(id)}`, { credentials: "include", cache: "no-store" }),
          fetch(`${BASE}/admin/quotes/staff`, { credentials: "include", cache: "no-store" }),
        ]);
        const [quoteJson, staffJson] = await Promise.all([quoteResponse.json(), staffResponse.json()]);
        if (!quoteResponse.ok) throw new Error(quoteJson.message || "Could not load this quote.");
        if (!staffResponse.ok) throw new Error(staffJson.message || "Could not load staff assignments.");
        if (cancelled) return;
        const data = quoteJson.data as QuoteDetail;
        setQuote(data);
        setStaff(staffJson.data ?? []);
        setStatus(data.status);
        setAssignee(typeof data.assignedTo === "string" ? data.assignedTo : data.assignedTo?._id ?? "");
        setSubtotal(moneyInput(data.subtotal));
        setTax(moneyInput(data.tax));
        setTotal(moneyInput(data.total));
        setItemPrices(data.items.map((item) => moneyInput(item.unitPrice)));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load this quote.");
      }
    }
    void fetchQuote();
    return () => { cancelled = true; };
  }, [id]);

  async function request(path: string, method: string, body?: unknown) {
    const response = await fetch(`${BASE}${path}`, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || "Request failed.");
    return json;
  }

  async function saveChanges(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const payload: Record<string, unknown> = { status, assignedTo: assignee || null, note };
      const subtotalCents = centsValue(subtotal);
      const taxCents = centsValue(tax);
      const totalCents = centsValue(total);
      const itemPricing = quote?.items.map((item, index) => {
        const unitPrice = centsValue(itemPrices[index] ?? "");
        return unitPrice === undefined ? {} : { unitPrice };
      });
      if (subtotalCents !== undefined) payload.subtotal = subtotalCents;
      if (taxCents !== undefined) payload.tax = taxCents;
      if (totalCents !== undefined) payload.total = totalCents;
      if (itemPricing) payload.items = itemPricing;
      await request(`/admin/quotes/${encodeURIComponent(id)}`, "PATCH", payload);
      setNotice("Quote updated.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update quote.");
    } finally {
      setBusy(false);
    }
  }

  async function openPrivateFile(path: string) {
    setError("");
    try {
      const json = await request(path, "GET");
      window.open(json.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open the private file.");
    }
  }

  async function generatePdf() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const json = await request(`/admin/quotes/${encodeURIComponent(id)}/generate-pdf`, "POST", {});
      setNotice(json.message || "Quote PDF generation queued.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not queue the quote PDF.");
    } finally {
      setBusy(false);
    }
  }

  async function convertToOrder() {
    if (!window.confirm("Convert this accepted quote to an order with its current locked pricing?")) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const json = await request(`/admin/quotes/${encodeURIComponent(id)}/convert-to-order`, "POST", {});
      setNotice(`Order ${json.data.order.orderNumber} created with locked quote pricing.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not convert this quote.");
    } finally {
      setBusy(false);
    }
  }

  if (error && !quote) return <section className="container max-w-4xl py-10"><p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{error}</p></section>;
  if (!quote) return <section className="container py-16 text-center text-gray-500">Loading quote…</section>;
  const customer = quote.guestContact ?? quote.user;

  return (
    <section className="container max-w-5xl py-10">
      <Link href="/admin/quotes" className="text-sm text-[--color-brand-primary] hover:underline">← Quote queue</Link>
      <div className="mt-4 mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[--color-brand-primary]">{quote.enquiryQueue} enquiry</p>
          <h1 className="mt-1 text-3xl font-bold">Quote {quote.referenceNumber}</h1>
          <p className="mt-2 text-sm text-gray-600">{[customer?.firstName, customer?.lastName].filter(Boolean).join(" ") || "Customer"} · {customer?.email || "No email"}</p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold capitalize">{quote.status.replaceAll("_", " ")}</span>
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-800">{notice}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-xl border bg-white p-5">
            <h2 className="mb-4 text-lg font-bold">Requested products</h2>
            <ul className="divide-y">
              {quote.items.map((item, index) => (
                <li key={`${item.sku ?? item.productName}-${index}`} className="py-3 first:pt-0 last:pb-0">
                  <p className="font-semibold">{item.productName || "Product"}{item.variantName ? ` — ${item.variantName}` : ""}</p>
                  <p className="text-sm text-gray-600">{item.sku || "No SKU"} · Quantity {item.quantity}</p>
                  {item.selectedOptions && <p className="mt-1 text-xs text-gray-600">{Object.entries(item.selectedOptions).map(([key, value]) => `${key}: ${value}`).join(" · ")}</p>}
                  {item.notes && <p className="mt-1 text-sm">Notes: {item.notes}</p>}
                  <label className="mt-2 block max-w-xs text-sm font-medium">Unit price ({quote.currency})
                    <input
                      inputMode="decimal"
                      value={itemPrices[index] ?? ""}
                      onChange={(event) => setItemPrices((prices) => prices.map((price, priceIndex) => priceIndex === index ? event.target.value : price))}
                      disabled={quote.priceLocked}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                    />
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border bg-white p-5">
            <h2 className="mb-2 text-lg font-bold">Project details</h2>
            <p className="whitespace-pre-wrap text-sm text-gray-700">{quote.projectDescription || "No project description provided."}</p>
            {quote.installationAddress?.line1 && <address className="mt-3 not-italic text-sm text-gray-600">{quote.installationAddress.line1}<br />{[quote.installationAddress.city, quote.installationAddress.state, quote.installationAddress.zip].filter(Boolean).join(", ")}<br />{quote.installationAddress.country}</address>}
            <p className="mt-3 text-sm text-gray-600">{customer?.phone || "No phone"}{quote.guestContact?.company ? ` · ${quote.guestContact.company}` : ""}</p>
          </section>

          <section className="rounded-xl border bg-white p-5">
            <h2 className="mb-3 text-lg font-bold">Drawings and photos</h2>
            {quote.attachments?.length ? (
              <ul className="space-y-2">
                {quote.attachments.map((file) => (
                  <li key={file._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 p-3 text-sm">
                    <span>{file.filename} <span className="text-gray-500">({(file.sizeBytes / 1024 / 1024).toFixed(1)} MB)</span></span>
                    <button type="button" onClick={() => void openPrivateFile(`/admin/quotes/${encodeURIComponent(id)}/attachments/${encodeURIComponent(file._id)}/url`)} className="font-semibold text-[--color-brand-primary] hover:underline">Open private file</button>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-gray-600">No files were attached.</p>}
          </section>
        </div>

        <aside className="space-y-6">
          <form onSubmit={saveChanges} className="space-y-4 rounded-xl border bg-white p-5">
            <h2 className="text-lg font-bold">Review and assign</h2>
            <label className="block text-sm font-medium">Status
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2">
                {[...STATUSES, ...(quote.status === "ordered" ? ["ordered"] : [])].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">Assigned to
              <select value={assignee} onChange={(event) => setAssignee(event.target.value)} className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2">
                <option value="">Unassigned</option>
                {staff.map((person) => <option key={person._id} value={person._id}>{person.firstName} {person.lastName} — {person.email}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-medium">Subtotal ({quote.currency})
                <input inputMode="decimal" value={subtotal} onChange={(event) => setSubtotal(event.target.value)} disabled={quote.priceLocked} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 disabled:bg-gray-100" />
              </label>
              <label className="text-sm font-medium">Tax ({quote.currency})
                <input inputMode="decimal" value={tax} onChange={(event) => setTax(event.target.value)} disabled={quote.priceLocked} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 disabled:bg-gray-100" />
              </label>
            </div>
            <label className="block text-sm font-medium">Total ({quote.currency})
              <input inputMode="decimal" value={total} onChange={(event) => setTotal(event.target.value)} disabled={quote.priceLocked} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 disabled:bg-gray-100" />
            </label>
            {quote.priceLocked && <p className="text-xs font-medium text-green-700">Pricing is locked and cannot be changed.</p>}
            <label className="block text-sm font-medium">Internal/customer update note
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
            </label>
            <button disabled={busy} className="w-full rounded-lg bg-[--color-brand-primary] px-4 py-2.5 font-semibold text-white disabled:opacity-60">{busy ? "Saving…" : "Save quote"}</button>
            {quote.expiresAt && <p className="text-xs text-gray-500">Expires {new Date(quote.expiresAt).toLocaleDateString()}</p>}
          </form>

          <section className="space-y-3 rounded-xl border bg-white p-5">
            <h2 className="text-lg font-bold">Quote document</h2>
            <button type="button" disabled={busy} onClick={() => void generatePdf()} className="w-full rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-60">{quote.pdfS3Key ? "Regenerate PDF" : "Generate quote PDF"}</button>
            {quote.pdfS3Key && <button type="button" onClick={() => void openPrivateFile(`/admin/quotes/${encodeURIComponent(id)}/pdf-url`)} className="w-full rounded-lg border px-4 py-2 text-sm font-semibold">Open private PDF</button>}
          </section>

          {quote.status === "accepted" && !quote.orderId && (
            <button type="button" disabled={busy} onClick={() => void convertToOrder()} className="w-full rounded-lg bg-green-700 px-4 py-3 font-bold text-white disabled:opacity-60">Convert accepted quote to order</button>
          )}
          {quote.orderId && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Converted order: {typeof quote.orderId === "string" ? quote.orderId : "created"}</p>}
        </aside>
      </div>
    </section>
  );
}
