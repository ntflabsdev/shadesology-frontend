"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface QuoteRow {
  _id: string;
  referenceNumber: string;
  status: string;
  enquiryQueue: string;
  guestContact?: { firstName?: string; lastName?: string; email?: string };
  user?: { firstName?: string; lastName?: string; email?: string };
  assignedTo?: { firstName?: string; lastName?: string };
  items: Array<{ quantity: number }>;
  createdAt: string;
}

const STATUSES = ["submitted", "in_review", "quoted", "accepted", "ordered", "expired", "declined"];

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [status, setStatus] = useState("");
  const [queue, setQueue] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadQuotes = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "100");
      if (status) params.set("status", status);
      if (queue) params.set("queue", queue);
      const response = await fetch(`${BASE}/admin/quotes?${params}`, { credentials: "include", cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Could not load the quote queue.");
      setQuotes(json.data ?? []);
      setPages(json.pagination?.pages ?? 1);
      setTotal(json.pagination?.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the quote queue.");
    } finally {
      setLoading(false);
    }
  }, [page, queue, status]);

  useEffect(() => {
    let cancelled = false;
    async function fetchQuotes() {
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "100");
        if (status) params.set("status", status);
        if (queue) params.set("queue", queue);
        const response = await fetch(`${BASE}/admin/quotes?${params}`, { credentials: "include", cache: "no-store" });
        const json = await response.json();
        if (!response.ok) throw new Error(json.message || "Could not load the quote queue.");
        if (!cancelled) {
          setQuotes(json.data ?? []);
          setPages(json.pagination?.pages ?? 1);
          setTotal(json.pagination?.total ?? 0);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load the quote queue.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void fetchQuotes();
    return () => { cancelled = true; };
  }, [page, queue, status]);

  return (
    <section className="container py-10 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[--color-brand-primary]">Sales workspace</p>
          <h1 className="text-3xl font-bold mt-1">Quote review queue</h1>
          <p className="text-sm text-[--color-text-muted] mt-2">Assign incoming requests, prepare pricing, and convert accepted quotes to orders.</p>
        </div>
        <button type="button" onClick={() => { setLoading(true); setError(""); void loadQuotes(); }} className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50">
          Refresh queue
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <label className="text-sm font-medium">
          Status
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); setLoading(true); setError(""); }} className="ml-2 rounded border border-gray-300 bg-white px-3 py-2">
            <option value="">All statuses</option>
            {STATUSES.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">
          Queue
          <select value={queue} onChange={(event) => { setQueue(event.target.value); setPage(1); setLoading(true); setError(""); }} className="ml-2 rounded border border-gray-300 bg-white px-3 py-2">
            <option value="">All queues</option>
            <option value="consumer">Consumer</option>
            <option value="commercial">Commercial</option>
          </select>
        </label>
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {loading ? (
        <p className="py-12 text-center text-[--color-text-muted]">Loading quotes…</p>
      ) : quotes.length === 0 ? (
        <p className="rounded-xl border border-dashed p-12 text-center text-[--color-text-muted]">No quotes match these filters.</p>
      ) : (
        <>
        <p className="mb-3 text-sm text-gray-600">{total} quote{total === 1 ? "" : "s"} in this queue</p>
        <div className="overflow-x-auto rounded-xl border border-[--color-border] bg-white">
          <table className="w-full min-w-190 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Queue</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Assigned to</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotes.map((quote) => {
                const customer = quote.guestContact ?? quote.user;
                return (
                  <tr key={quote._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">
                      <Link className="text-[--color-brand-primary] hover:underline" href={`/admin/quotes/${quote._id}`}>{quote.referenceNumber}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <div>{[customer?.firstName, customer?.lastName].filter(Boolean).join(" ") || "Customer"}</div>
                      <div className="text-xs text-gray-500">{customer?.email || "—"}</div>
                    </td>
                    <td className="px-4 py-3 capitalize">{quote.enquiryQueue}</td>
                    <td className="px-4 py-3">{quote.items?.length ?? 0}</td>
                    <td className="px-4 py-3">{quote.assignedTo ? `${quote.assignedTo.firstName} ${quote.assignedTo.lastName}` : "Unassigned"}</td>
                    <td className="px-4 py-3 capitalize">{quote.status.replaceAll("_", " ")}</td>
                    <td className="px-4 py-3">{new Date(quote.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded border px-4 py-2 text-sm disabled:opacity-50">Previous</button>
            <span className="text-sm text-gray-600">Page {page} of {pages}</span>
            <button type="button" disabled={page >= pages} onClick={() => setPage((current) => current + 1)} className="rounded border px-4 py-2 text-sm disabled:opacity-50">Next</button>
          </div>
        )}
        </>
      )}
    </section>
  );
}
