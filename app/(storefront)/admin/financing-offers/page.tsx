"use client";

import { useCallback, useEffect, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
type Offer = {
  _id: string;
  name: string;
  offerType: "representative_apr" | "deferred_interest";
  apr: number;
  standardApr: number | null;
  termMonths: number;
  minimumAmount: number;
  maximumAmount: number | null;
  startsAt: string;
  endsAt: string;
  lenderDisclosure: string;
  isActive: boolean;
};
type Form = Omit<Offer, "_id">;
const blank: Form = {
  name: "", offerType: "representative_apr", apr: 0, standardApr: null,
  termMonths: 60, minimumAmount: 0, maximumAmount: null,
  startsAt: "", endsAt: "", lenderDisclosure: "", isActive: true,
};
const dateInput = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

export default function AdminFinancingOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [form, setForm] = useState<Form>(blank);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE}/admin/financing-offers`, { credentials: "include", cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Could not load financing offers.");
      setOffers(json.data ?? []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load financing offers.");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void (async () => { await load(); })(); }, [load]);

  function edit(offer: Offer) {
    const { _id, ...data } = offer;
    setEditingId(_id);
    setForm({
      ...data,
      startsAt: dateInput(data.startsAt),
      endsAt: dateInput(data.endsAt),
    });
    setNotice("");
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch(`${BASE}/admin/financing-offers${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          startsAt: new Date(form.startsAt).toISOString(),
          endsAt: new Date(form.endsAt).toISOString(),
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Could not save financing offer.");
      setNotice(editingId ? "Offer updated." : "Offer created.");
      setEditingId(""); setForm(blank);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save financing offer.");
    } finally { setSaving(false); }
  }

  async function remove(offer: Offer) {
    if (!window.confirm(`Delete offer "${offer.name}"?`)) return;
    setError(""); setNotice("");
    try {
      const response = await fetch(`${BASE}/admin/financing-offers/${offer._id}`, { method: "DELETE", credentials: "include" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Could not delete offer.");
      setNotice("Offer deleted.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete offer.");
    }
  }

  const inputClass = "mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2";
  return (
    <main className="container max-w-6xl py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-[--color-brand-primary]">Sales workspace</p>
      <h1 className="mt-1 text-3xl font-bold">Financing offers</h1>
      <p className="mt-2 text-sm text-[--color-text-muted]">Offers automatically appear only between their start and end dates. Enter lender disclosures verbatim; these appear with the customer estimate.</p>
      {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-5 rounded-lg bg-green-50 p-4 text-sm text-green-800">{notice}</p>}
      <section className="mt-6 rounded-xl border bg-white p-5">
        <h2 className="text-xl font-semibold">{editingId ? "Edit financing offer" : "Create scheduled offer"}</h2>
        <form onSubmit={save} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm">Offer name<input required maxLength={120} className={inputClass} value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} /></label>
          <label className="text-sm">Offer type<select className={inputClass} value={form.offerType} onChange={(event) => setForm((value) => ({ ...value, offerType: event.target.value as Form["offerType"] }))}><option value="representative_apr">Representative APR</option><option value="deferred_interest">Deferred interest</option></select></label>
          <label className="text-sm">Promotional APR (%)<input required type="number" min="0" max="100" step="0.01" className={inputClass} value={form.apr} onChange={(event) => setForm((value) => ({ ...value, apr: Number(event.target.value) }))} /></label>
          {form.offerType === "deferred_interest" && <label className="text-sm">Standard APR after promo (%)<input type="number" min="0" max="100" step="0.01" className={inputClass} value={form.standardApr ?? ""} onChange={(event) => setForm((value) => ({ ...value, standardApr: event.target.value === "" ? null : Number(event.target.value) }))} /></label>}
          <label className="text-sm">Term (months)<input required type="number" min="1" max="360" step="1" className={inputClass} value={form.termMonths} onChange={(event) => setForm((value) => ({ ...value, termMonths: Number(event.target.value) }))} /></label>
          <label className="text-sm">Minimum amount ($)<input type="number" min="0" step="0.01" className={inputClass} value={form.minimumAmount} onChange={(event) => setForm((value) => ({ ...value, minimumAmount: Number(event.target.value) }))} /></label>
          <label className="text-sm">Maximum amount ($)<input type="number" min="0" step="0.01" className={inputClass} value={form.maximumAmount ?? ""} onChange={(event) => setForm((value) => ({ ...value, maximumAmount: event.target.value === "" ? null : Number(event.target.value) }))} /></label>
          <label className="text-sm">Starts at<input required type="datetime-local" className={inputClass} value={form.startsAt} onChange={(event) => setForm((value) => ({ ...value, startsAt: event.target.value }))} /></label>
          <label className="text-sm">Ends at<input required type="datetime-local" className={inputClass} value={form.endsAt} onChange={(event) => setForm((value) => ({ ...value, endsAt: event.target.value }))} /></label>
          <label className="text-sm sm:col-span-2 lg:col-span-3">Verbatim lender disclosure<textarea required maxLength={5000} rows={5} className={inputClass} value={form.lenderDisclosure} onChange={(event) => setForm((value) => ({ ...value, lenderDisclosure: event.target.value }))} /></label>
          <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((value) => ({ ...value, isActive: event.target.checked }))} />Active</label>
          <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
            <button disabled={saving} className="rounded-lg bg-[--color-brand-primary] px-5 py-2 font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : editingId ? "Save offer" : "Create offer"}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(""); setForm(blank); }} className="rounded-lg border px-5 py-2">Cancel</button>}
          </div>
        </form>
      </section>
      <section className="mt-8">
        <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">All offers</h2><button type="button" onClick={() => void load()} className="rounded-lg border px-3 py-2 text-sm">Refresh</button></div>
        {loading ? <p className="py-6">Loading offers…</p> : offers.length === 0 ? <p className="py-6 text-sm text-[--color-text-muted]">No offers yet. Create an offer above and set its activation dates.</p> : (
          <ul className="mt-4 space-y-3">{offers.map((offer) => (
            <li key={offer._id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-4">
              <div><h3 className="font-semibold">{offer.name} {!offer.isActive && <span className="text-xs text-amber-700">(inactive)</span>}</h3>
                <p className="mt-1 text-sm text-[--color-text-muted]">{offer.offerType.replaceAll("_", " ")} · {offer.apr}% APR · {offer.termMonths} months · {new Date(offer.startsAt).toLocaleDateString()}–{new Date(offer.endsAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2"><button type="button" onClick={() => edit(offer)} className="rounded border px-3 py-2 text-sm">Edit</button><button type="button" onClick={() => void remove(offer)} className="rounded border border-red-300 px-3 py-2 text-sm text-red-700">Delete</button></div>
            </li>
          ))}</ul>
        )}
      </section>
    </main>
  );
}
