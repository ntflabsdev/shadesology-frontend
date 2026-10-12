"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { calculateWindLoad } from "@/lib/configurator";

const exposureOptions = [
  { id: "sheltered", label: "Sheltered" },
  { id: "urban", label: "Urban" },
  { id: "coastal", label: "Coastal" },
  { id: "open", label: "Open / exposed" },
] as const;

const productOptions = [
  { id: "awning", label: "Awning" },
  { id: "pergola", label: "Pergola" },
  { id: "screen", label: "Screen" },
  { id: "umbrella", label: "Umbrella" },
] as const;

export function WindLoadCalculator() {
  const [windSpeed, setWindSpeed] = useState(35);
  const [exposure, setExposure] = useState<(typeof exposureOptions)[number]["id"]>("urban");
  const [height, setHeight] = useState(9);
  const [span, setSpan] = useState(16);
  const [productType, setProductType] = useState<(typeof productOptions)[number]["id"]>("awning");

  const result = useMemo(
    () => calculateWindLoad({ windSpeed, exposure, height, span, productType }),
    [windSpeed, exposure, height, span, productType],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-3xl border border-[--color-border] bg-white p-6 shadow-[var(--shadow-md)]">
        <h2 className="text-3xl font-bold text-[--color-text-primary]">Wind load calculator</h2>
        <p className="mt-2 text-[--color-text-muted]">
          Compare design exposure and projected wind load against common structural thresholds for custom shade systems.
        </p>

        <div className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[--color-text-primary]">
              Wind speed (mph)
              <input
                type="number"
                min="15"
                value={windSpeed}
                onChange={(event) => setWindSpeed(Number(event.target.value || 15))}
                className="mt-2 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>
            <label className="block text-sm font-medium text-[--color-text-primary]">
              Height (ft)
              <input
                type="number"
                min="4"
                value={height}
                onChange={(event) => setHeight(Number(event.target.value || 4))}
                className="mt-2 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[--color-text-primary]">
              Span (ft)
              <input
                type="number"
                min="4"
                value={span}
                onChange={(event) => setSpan(Number(event.target.value || 4))}
                className="mt-2 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>
            <div>
              <p className="mb-3 text-sm font-medium text-[--color-text-primary]">Product type</p>
              <div className="grid grid-cols-2 gap-2">
                {productOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={productType === option.id}
                    onClick={() => setProductType(option.id)}
                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                      productType === option.id
                        ? "border-[--color-brand-primary] bg-[--color-brand-primary]/5 text-[--color-brand-primary]"
                        : "border-[--color-border] text-[--color-text-primary]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-[--color-text-primary]">Exposure</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {exposureOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={exposure === option.id}
                  onClick={() => setExposure(option.id)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                    exposure === option.id
                      ? "border-[--color-brand-primary] bg-[--color-brand-primary]/5 text-[--color-brand-primary]"
                      : "border-[--color-border] text-[--color-text-primary]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <aside className="rounded-3xl border border-[--color-border] bg-[--color-neutral-50] p-6 shadow-[var(--shadow-sm)]">
        <h3 className="text-xl font-bold text-[--color-text-primary]">Design review</h3>

        <div className="mt-6 rounded-2xl bg-white p-4 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[--color-text-muted]">Effective wind load</p>
          <p className="mt-2 text-3xl font-bold text-[--color-brand-primary]">{result.effectiveLoad.toFixed(1)} psf</p>
          <p className="mt-2 text-sm text-[--color-text-muted]">{result.beaufort}</p>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-[--color-text-muted]">Design rating</dt>
            <dd className="font-medium text-[--color-text-primary]">{result.rating}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[--color-text-muted]">Dynamic pressure</dt>
            <dd className="font-medium text-[--color-text-primary]">{result.dynamicPressure} psf</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[--color-text-muted]">Threshold</dt>
            <dd className="font-medium text-[--color-text-primary]">{result.threshold} psf</dd>
          </div>
        </dl>

        <div className="mt-8 rounded-2xl border border-[--color-border] bg-white p-4 text-sm text-[--color-text-muted]">
          {result.recommendation}
        </div>

        <div className="mt-8">
          <Button type="button" variant="outline" className="w-full" size="lg">
            Print summary
          </Button>
        </div>
      </aside>
    </div>
  );
}
