"use client";

import { useCallback, useEffect, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
type ShippingRate = {
  _id: string;
  name: string;
  countries: string[];
  states: string[];
  restrictedStates: string[];
  restrictedCountries: string[];
  restrictedPostalPrefixes: string[];
  freightClassMultipliers: Record<string, number>;
  baseRate: number;
  perPoundRate: number;
  cratingCharge: number;
  specialHandlingCharge: number;
  transitDays: number;
  freeShippingThreshold: number | null;
  isActive: boolean;
};
type RateForm = Omit<ShippingRate, "_id">;

const blankForm: RateForm = {
  name: "", countries: ["US"], states: [], restrictedStates: [], restrictedCountries: [],
  restrictedPostalPrefixes: [], freightClassMultipliers: {}, baseRate: 0, perPoundRate: 0,
  cratingCharge: 0, specialHandlingCharge: 0, transitDays: 5,
  freeShippingThreshold: null, isActive: true,
};
const csv = (value: string[]) => value.join(", ");

export default function AdminShippingRatesPage() {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [form, setForm] = useState<RateForm>(blankForm);
  const [editingId, setEditingId] = useState("");
  const [multipliers, setMultipliers] = useState("{}");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadRates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE}/admin/shipping-rates`, { credentials: "include", cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Could not load shipping rates.");
      setRates(json.data ?? []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load shipping rates.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void loadRates(); }, [loadRates]);

  function editRate(rate: ShippingRate) {
    const { _id, ...values } = rate;
    setEditingId(_id);
    setForm(values);
    setMultipliers(JSON.stringify(values.freightClassMultipliers ?? {}, null, 2));
    setNotice("");
  }

  async function saveRate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      let parsedMultipliers: Record<string, number>;
      try {
        parsedMultipliers = JSON.parse(multipliers) as Record<string, number>;
      } catch {
        throw new Error("Freight-class multipliers must be valid JSON.");
      }
      if (Object.values(parsedMultipliers).some((value) => !Number.isFinite(value) || value <= 0)) {
        throw new Error("Freight-class multipliers must contain positive numbers.");
      }
      const response = await fetch(`${BASE}/admin/shipping-rates${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, freightClassMultipliers: parsedMultipliers }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Could not save shipping rate.");
      setNotice(editingId ? "Shipping rule updated." : "Shipping rule created.");
      setEditingId("");
      setForm(blankForm);
      setMultipliers("{}");
      await loadRates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save shipping rate.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRate(rate: ShippingRate) {
    if (!window.confirm(`Delete shipping rule “${rate.name}”?`)) return;
    try {
      const response = await fetch(`${BASE}/admin/shipping-rates/${rate._id}`, { method: "DELETE", credentials: "include" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Could not delete shipping rate.");
      setNotice("Shipping rule deleted.");
      await loadRates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete shipping rate.");
    }
  }

  const inputClass = "mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2";
  const listField = (key: "countries" | "states" | "restrictedStates" | "restrictedCountries" | "restrictedPostalPrefixes", label: string) => (
    <label className="text-sm">{label}
      <input className={inputClass} value={csv(form[key])} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value.split(",").map((value) => value.trim().toUpperCase()).filter(Boolean) }))} placeholder="Comma-separated values" />
    </label>
  );
  const numberField = (key: "baseRate" | "perPoundRate" | "cratingCharge" | "specialHandlingCharge" | "transitDays" | "freeShippingThreshold", label: string, min = 0) => (
    <label className="text-sm">{label}
      <input className={inputClass} type="number" min={min} step={key === "transitDays" ? 1 : "0.01"} value={form[key] ?? ""} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value === "" && key === "freeShippingThreshold" ? null : Number(event.target.value) }))} required={key !== "freeShippingThreshold"} />
    </label>
  );

  return (
    <main className="container max-w-6xl py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-[--color-brand-primary]">Operations</p>
      <h1 className="mt-1 text-3xl font-bold">Shipping rate rules</h1>
      <p className="mt-2 text-sm text-[--color-text-muted]">Manage destination eligibility, freight rates, handling charges, and transit estimates.</p>
      {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-5 rounded-lg bg-green-50 p-4 text-sm text-green-800">{notice}</p>}

      <section className="mt-7 rounded-xl border bg-white p-5">
        <h2 className="text-xl font-semibold">{editingId ? "Edit shipping rule" : "Add shipping rule"}</h2>
        <form onSubmit={saveRate} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm">Rule name<input className={inputClass} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required /></label>
          {listField("countries", "Countries (ISO codes)")}
          {listField("states", "Included states (empty = all)")}
          {listField("restrictedStates", "Restricted states")}
          {listField("restrictedCountries", "Restricted countries")}
          {listField("restrictedPostalPrefixes", "Restricted postal prefixes")}
          {numberField("baseRate", "Base rate ($)")}
          {numberField("perPoundRate", "Per-pound rate ($)")}
          {numberField("cratingCharge", "Crating charge ($)")}
          {numberField("specialHandlingCharge", "Special handling ($)")}
          {numberField("transitDays", "Transit days", 1)}
          {numberField("freeShippingThreshold", "Free shipping threshold ($)")}
          <label className="text-sm sm:col-span-2">Freight class multipliers (JSON)
            <textarea className={`${inputClass} min-h-24 font-mono`} value={multipliers} onChange={(event) => setMultipliers(event.target.value)} />
          </label>
          <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />Active</label>
          <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
            <button disabled={saving} className="rounded-lg bg-[--color-brand-primary] px-5 py-2 font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : editingId ? "Save changes" : "Create rule"}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(""); setForm(blankForm); setMultipliers("{}"); }} className="rounded-lg border px-5 py-2">Cancel</button>}
          </div>
        </form>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Configured rules</h2><button type="button" onClick={() => void loadRates()} className="rounded-lg border px-3 py-2 text-sm">Refresh</button></div>
        {loading ? <p className="py-6">Loading shipping rates…</p> : rates.length === 0 ? <p className="py-6 text-sm text-[--color-text-muted]">No rules configured; shipping checkout will require a custom quote.</p> : (
          <ul className="mt-4 space-y-3">{rates.map((rate) => (
            <li key={rate._id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-4">
              <div><h3 className="font-semibold">{rate.name} {!rate.isActive && <span className="text-xs text-amber-700">(inactive)</span>}</h3>
                <p className="mt-1 text-sm text-[--color-text-muted]">{csv(rate.countries)} · {rate.states.length ? csv(rate.states) : "all states"} · base ${rate.baseRate.toFixed(2)} + ${rate.perPoundRate.toFixed(2)}/lb · {rate.transitDays} transit days</p>
              </div>
              <div className="flex gap-2"><button type="button" onClick={() => editRate(rate)} className="rounded border px-3 py-2 text-sm">Edit</button><button type="button" onClick={() => void deleteRate(rate)} className="rounded border border-red-300 px-3 py-2 text-sm text-red-700">Delete</button></div>
            </li>
          ))}</ul>
        )}
      </section>
    </main>
  );
}
