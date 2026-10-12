"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
type OrderSummary = { _id: string; orderNumber: string; status: string; paymentStatus: string; total: number; currency: string; createdAt: string; guestEmail?: string; user?: { firstName?: string; lastName?: string; email?: string } };
const statuses = ["pending", "payment_processing", "confirmed", "in_production", "ready_to_ship", "shipped", "delivered", "cancelled", "refunded"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (search.trim()) params.set("search", search.trim());
      const response = await fetch(`${BASE}/admin/orders?${params}`, { credentials: "include", cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Could not load orders.");
      setOrders(json.data ?? []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);
  useEffect(() => {
    void (async () => { await load(); })();
  }, [load]);

  return (
    <main className="container max-w-6xl py-10">
      <h1 className="text-3xl font-bold">Order management</h1>
      <p className="mt-2 text-sm text-[--color-text-muted]">Review payment, production configuration, customer requests and shipping.</p>
      <div className="my-5 flex flex-wrap gap-3">
        <label className="text-sm">Search orders
          <input className="ml-2 rounded border px-3 py-2" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Order number or email" />
        </label>
        <label className="text-sm">Status
          <select className="ml-2 rounded border bg-white px-3 py-2" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => void load()} className="rounded border px-4 py-2 text-sm">Refresh</button>
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {loading ? <p className="py-8">Loading orders…</p> : orders.length === 0 ? <p className="py-8 text-sm text-[--color-text-muted]">No orders found.</p> : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-50"><tr>{["Order", "Customer", "Status", "Payment", "Total", "Placed", ""].map((column) => <th key={column} className="px-4 py-3 font-semibold">{column}</th>)}</tr></thead>
            <tbody>{orders.map((order) => <tr key={order._id} className="border-t">
              <td className="px-4 py-3 font-semibold">{order.orderNumber}</td>
              <td className="px-4 py-3">{order.user?.email || order.guestEmail || "—"}</td>
              <td className="px-4 py-3">{order.status.replaceAll("_", " ")}</td>
              <td className="px-4 py-3">{order.paymentStatus?.replaceAll("_", " ") || "—"}</td>
              <td className="px-4 py-3">{order.currency} {order.total.toFixed(2)}</td>
              <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3"><Link href={`/admin/orders/${order._id}`} className="font-semibold text-[--color-brand-primary] underline">Open</Link></td>
            </tr>)}</tbody>
          </table>
        </div>
      )}
    </main>
  );
}
