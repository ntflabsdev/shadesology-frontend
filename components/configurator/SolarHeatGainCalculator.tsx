"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { calculateSolarHeatGain } from "@/lib/configurator";

const orientations = [
  { id: "north", label: "North" },
  { id: "east", label: "East" },
  { id: "south", label: "South" },
  { id: "west", label: "West" },
] as const;

export function SolarHeatGainCalculator() {
  const [width, setWidth] = useState(12);
  const [height, setHeight] = useState(8);
  const [orientation, setOrientation] = useState<(typeof orientations)[number]["id"]>("west");
  const [glazing, setGlazing] = useState(0.7);
  const [shadeFactor, setShadeFactor] = useState(55);

  const result = useMemo(
    () => calculateSolarHeatGain({ width, height, orientation, glazing, shadeFactor }),
    [width, height, orientation, glazing, shadeFactor],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-3xl border border-[--color-border] bg-white p-6 shadow-[var(--shadow-md)]">
        <h2 className="text-3xl font-bold text-[--color-text-primary]">Solar heat gain calculator</h2>
        <p className="mt-2 text-[--color-text-muted]">
          Use this rule-of-thumb estimate to compare how much solar load a window or shaded opening experiences.
        </p>

        <div className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[--color-text-primary]">
              Width (ft)
              <input
                type="number"
                value={width}
                onChange={(event) => setWidth(Number(event.target.value || 0))}
                className="mt-2 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>
            <label className="block text-sm font-medium text-[--color-text-primary]">
              Height (ft)
              <input
                type="number"
                value={height}
                onChange={(event) => setHeight(Number(event.target.value || 0))}
                className="mt-2 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-[--color-text-primary]">Orientation</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {orientations.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={orientation === option.id}
                  onClick={() => setOrientation(option.id)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                    orientation === option.id
                      ? "border-[--color-brand-primary] bg-[--color-brand-primary]/5 text-[--color-brand-primary]"
                      : "border-[--color-border] text-[--color-text-primary]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[--color-text-primary]">
              Glass factor
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="1"
                value={glazing}
                onChange={(event) => setGlazing(Number(event.target.value || 0))}
                className="mt-2 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>
            <label className="block text-sm font-medium text-[--color-text-primary]">
              Shade factor (%)
              <input
                type="number"
                min="0"
                max="100"
                value={shadeFactor}
                onChange={(event) => setShadeFactor(Number(event.target.value || 0))}
                className="mt-2 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>
          </div>
        </div>
      </section>

      <aside className="rounded-3xl border border-[--color-border] bg-[--color-neutral-50] p-6 shadow-[var(--shadow-sm)]">
        <h3 className="text-xl font-bold text-[--color-text-primary]">Estimate</h3>

        <div className="mt-6 rounded-2xl bg-white p-4 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[--color-text-muted]">Projected solar gain</p>
          <p className="mt-2 text-3xl font-bold text-[--color-brand-primary]">{Math.round(result.estimatedGain).toLocaleString()} BTU/hr</p>
          <p className="mt-2 text-sm text-[--color-text-muted]">
            Effective shade performance: {Math.round(result.efficiency)}%
          </p>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-[--color-text-muted]">Window area</dt>
            <dd className="font-medium text-[--color-text-primary]">{result.area.toFixed(1)} sq ft</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[--color-text-muted]">Base gain</dt>
            <dd className="font-medium text-[--color-text-primary]">{Math.round(result.baseGain).toLocaleString()} BTU/hr</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[--color-text-muted]">Shade reduction</dt>
            <dd className="font-medium text-[--color-text-primary]">{Math.round(result.shadeReduction * 100)}%</dd>
          </div>
        </dl>

        <div className="mt-8">
          <Button type="button" variant="outline" className="w-full" size="lg">
            Save scenario
          </Button>
        </div>
      </aside>
    </div>
  );
}
