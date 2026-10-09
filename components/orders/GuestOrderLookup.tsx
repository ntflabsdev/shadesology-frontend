"use client";

import { useState } from "react";
import { useLocaleSettings } from "@/components/i18n/LocaleProvider";
import { formatCurrency, formatDate } from "@/i18n/format";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
type GuestOrder = {
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  trackingNumber?: string;
  trackingUrl?: string;
  carrierName?: string;
  estimatedDeliveryDate?: string;
  statusHistory?: Array<{ status: string; note?: string; at: string }>;
  items?: Array<{ availability?: string }>;
};
const safeTrackingUrl = (value?: string) => value && /^https?:\/\/\S+$/i.test(value) ? value : "";

export default function GuestOrderLookup() {
  const { locale } = useLocaleSettings();
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<GuestOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    setOrder(null);
    try {
      const response = await fetch(`${BASE}/api/orders/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, orderNumber }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Order not found. Please check the order number and email.");
      setOrder(json.data as GuestOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not retrieve the order.");
    } finally {
      setLoading(false);
    }
  }

  async function submitRequest(type: "cancellation" | "return") {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${BASE}/api/orders/lookup/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, orderNumber, type, reason }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Could not submit request.");
      setNotice(json.policyNotice || "Your request was sent for staff review.");
      setReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="order-lookup">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm font-medium">Order number
          <input required value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="SH-2026-00001" className="mt-1 block w-full rounded-md border border-[--color-border] px-3 py-2.5 text-sm" />
        </label>
        <label className="flex-1 text-sm font-medium">Email address
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-1 block w-full rounded-md border border-[--color-border] px-3 py-2.5 text-sm" />
        </label>
        <button disabled={loading} className="rounded-lg bg-[--color-brand-primary] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Searching…" : "Find order"}</button>
      </form>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
      {order && <section aria-live="polite" className="mt-5 rounded-lg border border-[--color-border] p-4">
        <h3 className="font-bold">{order.orderNumber} · {order.status.replaceAll("_", " ")}</h3>
        <p className="mt-1 text-sm">Total: {formatCurrency(order.total, order.currency || "USD", order.currency || "USD", locale)}</p>
        {order.trackingNumber && <p className="mt-2 text-sm">
          {order.carrierName || "Tracking"}: {safeTrackingUrl(order.trackingUrl) ? <a href={safeTrackingUrl(order.trackingUrl)} target="_blank" rel="noreferrer" className="font-semibold underline">{order.trackingNumber}</a> : order.trackingNumber}
          {order.estimatedDeliveryDate ? ` · Estimated delivery ${formatDate(order.estimatedDeliveryDate, locale)}` : ""}
        </p>}
        {order.statusHistory?.length ? <ol className="mt-3 space-y-1 text-sm text-[--color-text-muted]">
          {order.statusHistory.map((entry, index) => <li key={`${entry.status}-${index}`}>{formatDate(entry.at, locale)} · {entry.status.replaceAll("_", " ")}{entry.note ? ` — ${entry.note}` : ""}</li>)}
        </ol> : null}
        {(["pending", "payment_processing", "confirmed"].includes(order.status) || order.status === "delivered") && <div className="mt-4 border-t pt-4">
          <label className="block text-sm font-medium" htmlFor="guest-request-reason">Request a {order.status === "delivered" ? "return" : "cancellation"}</label>
          <textarea id="guest-request-reason" value={reason} onChange={(event) => setReason(event.target.value)} minLength={10} maxLength={1000} className="mt-2 w-full rounded border p-2 text-sm" rows={3} placeholder="Reason (10–1000 characters)" />
          <button type="button" disabled={loading || reason.trim().length < 10} onClick={() => void submitRequest(order.status === "delivered" ? "return" : "cancellation")} className="mt-2 rounded border px-4 py-2 text-sm disabled:opacity-50">{loading ? "Submitting…" : "Submit request"}</button>
          {order.status === "delivered" && order.items?.some((item) => item.availability !== "in_stock") && <p className="mt-2 text-xs text-amber-800">Made-to-order returns are reviewed case by case; a request is not approval or refund.</p>}
        </div>}
      </section>}
    </div>
  );
}
