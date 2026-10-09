"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
type Order = {
  _id: string; orderNumber: string; status: string; paymentStatus: string; total: number;
  currency: string; subtotal: number; tax: number; shippingCost: number; discountAmount: number;
  createdAt: string; guestEmail?: string; guestName?: string; user?: { firstName?: string; lastName?: string; email?: string };
  items: Array<{ _id: string; productName: string; variantName: string; sku: string; quantity: number; availability: string; unitPrice: number; lineTotal: number; selectedOptions: Record<string, unknown>; surcharges: Array<{ label: string; amount: number }> }>;
  shippingAddress?: Record<string, string>; trackingNumber?: string; trackingUrl?: string; carrierName?: string; estimatedDeliveryDate?: string;
  balanceDue?: number; statusHistory?: Array<{ status: string; note?: string; at: string }>;
  customerRequests?: Array<{ _id: string; type: string; reason: string; status: string; createdAt: string }>;
};
const nextStatuses: Record<string, string[]> = {
  pending: ["payment_processing", "cancelled"], payment_processing: ["confirmed", "cancelled"],
  confirmed: ["in_production", "cancelled"], in_production: ["ready_to_ship"],
  ready_to_ship: ["shipped"], shipped: ["delivered"], delivered: ["refunded"], cancelled: [], refunded: [],
};

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [carrierName, setCarrierName] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${BASE}/admin/orders/${params.id}`, { credentials: "include", cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Could not load this order.");
      setOrder(json.data);
      setTrackingNumber(json.data.trackingNumber || "");
      setTrackingUrl(json.data.trackingUrl || "");
      setCarrierName(json.data.carrierName || "");
      setEstimatedDeliveryDate(json.data.estimatedDeliveryDate ? new Date(json.data.estimatedDeliveryDate).toISOString().slice(0, 10) : "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this order.");
    }
  }, [params.id]);
  useEffect(() => {
    void (async () => { await load(); })();
  }, [load]);

  async function updateStatus(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!status) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`${BASE}/admin/orders/${params.id}/status`, {
        method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note, trackingNumber, trackingUrl, carrierName, estimatedDeliveryDate: estimatedDeliveryDate || undefined }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Could not update order.");
      setNotice(`Order moved to ${status.replaceAll("_", " ")}. Customer notification queued.`);
      setStatus(""); setNote(""); await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update order.");
    } finally { setBusy(false); }
  }

  async function resolveRequest(requestId: string, decision: "approved" | "declined") {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`${BASE}/admin/orders/${params.id}/requests/${requestId}`, {
        method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision, resolutionNote: resolutionNotes[requestId] || "" }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Could not review customer request.");
      setNotice(`Customer request ${decision}. Notification queued.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not review customer request.");
    } finally { setBusy(false); }
  }

  if (error && !order) return <main className="container py-10"><p role="alert">{error}</p></main>;
  if (!order) return <main className="container py-10">Loading order…</main>;
  const address = order.shippingAddress || {};
  return (
    <main className="container max-w-5xl py-10">
      <Link href="/admin/orders" className="text-sm text-[--color-brand-primary] underline">← All orders</Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-sm text-[--color-text-muted]">Order</p><h1 className="text-3xl font-bold">{order.orderNumber}</h1><p className="mt-1 text-sm">{order.guestName || `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim()} · {order.guestEmail || order.user?.email}</p></div>
        <div className="text-right"><p className="font-semibold">{order.status.replaceAll("_", " ")} · payment {order.paymentStatus.replaceAll("_", " ")}</p><p className="text-xl font-bold">{order.currency} {order.total.toFixed(2)}</p>{order.balanceDue ? <p className="text-sm text-amber-800">${order.balanceDue.toFixed(2)} balance due before dispatch</p> : null}</div>
      </div>
      {error && <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">Production configuration</h2><a href={`${BASE}/admin/orders/${order._id}/export`} className="rounded border px-3 py-2 text-sm font-medium">Download production CSV</a></div>
          <ul className="mt-4 space-y-4">{order.items.map((item) => <li key={item._id} className="border-t pt-4">
            <div className="flex justify-between gap-4"><div><h3 className="font-semibold">{item.productName} {item.variantName ? `— ${item.variantName}` : ""}</h3><p className="text-xs text-[--color-text-muted]">SKU {item.sku} · {item.availability?.replaceAll("_", " ")} · Qty {item.quantity}</p></div><p className="font-semibold">${item.lineTotal.toFixed(2)}</p></div>
            <dl className="mt-2 grid gap-x-4 text-sm sm:grid-cols-2">{Object.entries(item.selectedOptions || {}).map(([key, value]) => <div key={key} className="flex justify-between gap-3 border-b py-1"><dt>{key}</dt><dd className="text-right">{typeof value === "object" ? JSON.stringify(value) : String(value)}</dd></div>)}</dl>
            {item.surcharges?.length ? <p className="mt-2 text-xs text-[--color-text-muted]">Surcharges: {item.surcharges.map((charge) => `${charge.label} $${charge.amount.toFixed(2)}`).join(", ")}</p> : null}
          </li>)}</ul>
          <div className="mt-5 border-t pt-4 text-sm"><p>Subtotal ${order.subtotal?.toFixed(2)} · Shipping ${order.shippingCost?.toFixed(2)} · Tax ${order.tax?.toFixed(2)} · Discount ${order.discountAmount?.toFixed(2)}</p></div>
        </section>
        <aside className="space-y-5">
          <section className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Ship to</h2><address className="mt-2 not-italic text-sm leading-6">{[address.firstName, address.lastName, address.line1, address.line2, [address.city, address.state, address.zip].filter(Boolean).join(" "), address.country].filter(Boolean).map((line, index) => <div key={index}>{line}</div>)}</address></section>
          <section className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold">Update status / tracking</h2>
            <form onSubmit={updateStatus} className="mt-3 space-y-3">
              <label className="block text-sm">Next status<select required value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 w-full rounded border bg-white px-3 py-2"><option value="">Choose status</option>{(nextStatuses[order.status] || []).map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select></label>
              <label className="block text-sm">Carrier<input value={carrierName} onChange={(event) => setCarrierName(event.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label>
              <label className="block text-sm">Tracking number<input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label>
              <label className="block text-sm">Tracking URL<input type="url" value={trackingUrl} onChange={(event) => setTrackingUrl(event.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label>
              <label className="block text-sm">Estimated delivery<input type="date" value={estimatedDeliveryDate} onChange={(event) => setEstimatedDeliveryDate(event.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label>
              <label className="block text-sm">Customer update<input value={note} onChange={(event) => setNote(event.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label>
              <button disabled={busy} className="w-full rounded-lg bg-[--color-brand-primary] px-4 py-2 font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Save and notify customer"}</button>
            </form>
          </section>
        </aside>
      </div>
      {order.customerRequests?.length ? <section className="mt-6 rounded-xl border bg-white p-5">
        <h2 className="text-xl font-semibold">Customer cancellation and return requests</h2>
        <ul className="mt-3 space-y-4">{order.customerRequests.map((request) => <li key={request._id} className="border-t pt-4">
          <div className="flex flex-wrap justify-between gap-2"><strong>{request.type} · {request.status}</strong><span className="text-sm text-[--color-text-muted]">{new Date(request.createdAt).toLocaleString()}</span></div>
          <p className="mt-2 text-sm">{request.reason}</p>
          {request.status === "pending" && <div className="mt-3 flex flex-wrap gap-2">
            <input aria-label="Resolution note" value={resolutionNotes[request._id] || ""} onChange={(event) => setResolutionNotes((current) => ({ ...current, [request._id]: event.target.value }))} className="min-w-60 flex-1 rounded border px-3 py-2 text-sm" placeholder="Resolution note for customer" />
            <button type="button" disabled={busy} onClick={() => void resolveRequest(request._id, "approved")} className="rounded border border-green-600 px-3 py-2 text-sm text-green-800">Approve</button>
            <button type="button" disabled={busy} onClick={() => void resolveRequest(request._id, "declined")} className="rounded border border-red-300 px-3 py-2 text-sm text-red-800">Decline</button>
          </div>}
        </li>)}</ul>
      </section> : null}
      <section className="mt-6 rounded-xl border bg-white p-5"><h2 className="font-semibold">Order status history</h2><ol className="mt-3 space-y-2 text-sm">{order.statusHistory?.map((entry, index) => <li key={`${entry.status}-${index}`}>{new Date(entry.at).toLocaleString()} · <strong>{entry.status.replaceAll("_", " ")}</strong>{entry.note ? ` — ${entry.note}` : ""}</li>)}</ol></section>
    </main>
  );
}
