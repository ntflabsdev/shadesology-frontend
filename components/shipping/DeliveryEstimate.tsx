"use client";

import { useState } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface Estimate {
  available: boolean;
  quoteRequired?: boolean;
  productionDays?: number;
  transitDays?: number;
  totalDays?: number;
}

export function DeliveryEstimate({ variantIds }: { variantIds: string[] }) {
  const [zip, setZip] = useState("");
  const [state, setState] = useState("");
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function checkEstimate(event: React.FormEvent) {
    event.preventDefault();
    if (!zip.trim()) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        variantIds: variantIds.join(","),
        zip: zip.trim(),
        state: state.trim(),
        country: "US",
      });
      const response = await fetch(`${BASE}/api/shipping/estimate?${params}`, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Could not estimate delivery.");
      setEstimate(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not estimate delivery.");
      setEstimate(null);
    } finally {
      setLoading(false);
    }
  }

  if (variantIds.length === 0) return null;
  return (
    <section className="rounded-xl border border-[--color-border] bg-white p-4" aria-label="Delivery estimate">
      <p className="font-semibold text-sm">Delivery estimate</p>
      <p className="mt-1 text-xs text-[--color-text-muted]">Includes model-specific production time and transit.</p>
      <form onSubmit={checkEstimate} className="mt-3 flex gap-2">
        <input
          aria-label="Delivery ZIP code"
          autoComplete="postal-code"
          inputMode="numeric"
          value={zip}
          onChange={(event) => setZip(event.target.value)}
          placeholder="ZIP code"
          className="min-w-0 flex-1 rounded-lg border border-[--color-border] px-3 py-2 text-sm"
        />
        <input
          aria-label="Delivery state"
          autoComplete="address-level1"
          value={state}
          onChange={(event) => setState(event.target.value.toUpperCase())}
          placeholder="State"
          maxLength={2}
          className="w-20 rounded-lg border border-[--color-border] px-3 py-2 text-sm uppercase"
        />
        <button type="submit" disabled={loading || !zip.trim()} className="rounded-lg bg-[--color-brand-primary] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {loading ? "…" : "Check"}
        </button>
      </form>
      {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
      {estimate && (
        <p className="mt-3 text-sm text-[--color-text-primary]">
          {estimate.quoteRequired || !estimate.available
            ? "Delivery to this address needs a custom freight quote."
            : `Estimated ${estimate.totalDays} days (${estimate.productionDays} production + ${estimate.transitDays} transit).`}
        </p>
      )}
    </section>
  );
}
