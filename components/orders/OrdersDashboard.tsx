"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocaleSettings } from "@/components/i18n/LocaleProvider";
import { formatCurrency, formatDate } from "@/i18n/format";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
type CustomerRequest = { _id: string; type: "cancellation" | "return"; reason: string; status: string; createdAt: string };
type Order = {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  paymentStatus?: string;
  balanceDue?: number;
  items: Array<{ productName: string; variantName: string; sku: string; quantity: number; lineTotal: number; availability?: string; selectedOptions?: Record<string, unknown> }>;
  shippingAddress?: { city: string; state: string };
  statusHistory?: Array<{ status: string; note?: string; at: string }>;
  trackingNumber?: string;
  trackingUrl?: string;
  carrierName?: string;
  estimatedDeliveryDate?: string;
  customerRequests?: CustomerRequest[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending payment", payment_processing: "Processing payment", confirmed: "Confirmed",
  in_production: "In production", ready_to_ship: "Ready to ship", shipped: "Shipped",
  delivered: "Delivered", cancelled: "Cancelled", refunded: "Refunded",
};
const safeTrackingUrl = (value?: string) => value && /^https?:\/\/\S+$/i.test(value) ? value : "";

export default function OrdersDashboard() {
  const { locale } = useLocaleSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");

  async function loadOrders() {
    const response = await fetch(`${BASE}/api/orders`, { credentials: "include", cache: "no-store" });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || "Could not load your orders.");
    setOrders(json.data ?? []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadOrders();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load your orders.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function request(type: "cancellation" | "return", order: Order) {
    const reason = reasons[order._id]?.trim() || "";
    setBusy(order._id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${BASE}/api/orders/${order._id}/requests`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, reason }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Could not submit your request.");
      setNotice(`${type === "return" ? "Return" : "Cancellation"} request received for ${order.orderNumber}. ${json.policyNotice || ""}`);
      setReasons((current) => ({ ...current, [order._id]: "" }));
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your request.");
    } finally {
      setBusy("");
    }
  }

  if (loading) return <p className="py-10 text-center">Loading orders…</p>;
  return (
    <div className="space-y-4">
      {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-lg bg-green-50 p-4 text-sm text-green-800">{notice}</p>}
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-[--color-border] bg-white py-20 text-center">
          <p className="mb-4 text-[--color-text-muted]">You haven&apos;t placed any orders yet.</p>
          <Link href="/products" className="inline-block rounded-lg bg-[--color-brand-primary] px-6 py-2.5 text-sm font-medium text-white">Browse Products</Link>
        </div>
      ) : orders.map((order) => (
        <article key={order._id} className="rounded-2xl border border-[--color-border] bg-white p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold">{order.orderNumber}</p>
              <p className="mt-0.5 text-xs text-[--color-text-muted]">
                Placed {formatDate(order.createdAt, locale)}
                {order.shippingAddress?.city ? ` · ${order.shippingAddress.city}, ${order.shippingAddress.state}` : ""}
              </p>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800">{STATUS_LABELS[order.status] ?? order.status}</span>
              <p className="mt-1 font-bold">{formatCurrency(order.total, order.currency || "USD", order.currency || "USD", locale)}</p>
              {order.balanceDue != null && order.balanceDue > 0 && <p className="text-xs text-amber-800">Balance due before dispatch: {formatCurrency(order.balanceDue, order.currency || "USD", order.currency || "USD", locale)}</p>}
            </div>
          </div>
          {order.trackingNumber && (
            <div className="mb-4 rounded-lg bg-cyan-50 p-3 text-sm">
              <strong>{order.carrierName || "Shipment"} tracking:</strong> {safeTrackingUrl(order.trackingUrl)
                ? <a className="font-semibold underline" href={safeTrackingUrl(order.trackingUrl)} target="_blank" rel="noreferrer">{order.trackingNumber}</a>
                : order.trackingNumber}
              {order.estimatedDeliveryDate && <span> · Estimated delivery {formatDate(order.estimatedDeliveryDate, locale)}</span>}
            </div>
          )}
          <ul className="space-y-3">
            {order.items.map((item, index) => (
              <li key={`${item.sku}-${index}`} className="border-t border-[--color-border] pt-3 text-sm">
                <div className="flex justify-between gap-3 text-[--color-text-muted]">
                  <span>{item.productName}{item.variantName ? ` — ${item.variantName}` : ""}{item.sku ? ` (${item.sku})` : ""} × {item.quantity}</span>
                  <span>{formatCurrency(item.lineTotal, order.currency || "USD", order.currency || "USD", locale)}</span>
                </div>
                {item.selectedOptions && <ul className="mt-1 grid gap-x-5 text-xs text-[--color-text-muted] sm:grid-cols-2">
                  {Object.entries(item.selectedOptions).map(([key, value]) => <li key={key}><strong>{key}:</strong> {typeof value === "object" ? JSON.stringify(value) : String(value)}</li>)}
                </ul>}
                <p className="mt-1 text-xs text-[--color-text-muted]">{item.availability === "in_stock" ? "Stock item" : "Made to order"}</p>
              </li>
            ))}
          </ul>
          {order.statusHistory?.length ? (
            <details className="mt-4 border-t border-[--color-border] pt-3 text-sm">
              <summary className="cursor-pointer font-medium">Order updates</summary>
              <ol className="mt-2 space-y-2">
                {order.statusHistory.map((entry, index) => <li key={`${entry.status}-${entry.at}-${index}`}><strong>{STATUS_LABELS[entry.status] ?? entry.status}</strong> · {formatDate(entry.at, locale, { dateStyle: "medium", timeStyle: "short" })}{entry.note ? ` — ${entry.note}` : ""}</li>)}
              </ol>
            </details>
          ) : null}
          {order.customerRequests?.length ? <ul className="mt-3 text-xs text-[--color-text-muted]">
            {order.customerRequests.map((entry) => <li key={entry._id}>{entry.type} request · {entry.status} · {formatDate(entry.createdAt, locale)}</li>)}
          </ul> : null}
          {(["pending", "payment_processing", "confirmed"].includes(order.status) || order.status === "delivered") && (
            <div className="mt-4 border-t border-[--color-border] pt-4">
              <label className="block text-sm font-medium" htmlFor={`request-${order._id}`}>Request a {order.status === "delivered" ? "return" : "cancellation"}</label>
              <textarea id={`request-${order._id}`} minLength={10} maxLength={1000} required value={reasons[order._id] ?? ""} onChange={(event) => setReasons((current) => ({ ...current, [order._id]: event.target.value }))} className="mt-2 w-full rounded-lg border border-[--color-border] p-3 text-sm" rows={3} placeholder="Tell us why you are contacting us (10–1000 characters)" />
              <button type="button" disabled={busy === order._id} onClick={() => void request(order.status === "delivered" ? "return" : "cancellation", order)} className="mt-2 rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50">{busy === order._id ? "Submitting…" : "Submit request"}</button>
              {order.status === "confirmed" && order.items.some((item) => item.availability !== "in_stock") && <p className="mt-2 text-xs text-amber-800">Made-to-order items can be cancelled only before production begins. Requests are reviewed by our team; submitting does not automatically cancel or refund the order.</p>}
              {order.status === "delivered" && order.items.some((item) => item.availability !== "in_stock") && <p className="mt-2 text-xs text-amber-800">Made-to-order returns are reviewed case by case. Submitting a request does not guarantee return approval or a refund.</p>}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
