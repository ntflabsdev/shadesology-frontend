"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { calculateSizingAndProjection } from "@/lib/configurator";

const orientations = [
  { id: "north", label: "North" },
  { id: "east", label: "East" },
  { id: "south", label: "South" },
  { id: "west", label: "West" },
] as const;

export function SizingProjectionCalculator() {
  const [width, setWidth] = useState(16);
  const [projection, setProjection] = useState(10);
  const [sunAngle, setSunAngle] = useState(42);
  const [orientation, setOrientation] = useState<(typeof orientations)[number]["id"]>("west");
  const [targetCoverage, setTargetCoverage] = useState(72);

  const result = useMemo(
    () => calculateSizingAndProjection({ width, projection, sunAngle, orientation, targetCoverage }),
    [width, projection, sunAngle, orientation, targetCoverage],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-3xl border border-[--color-border] bg-white p-6 shadow-[var(--shadow-md)]">
        <h2 className="text-3xl font-bold text-[--color-text-primary]">Sizing & projection calculator</h2>
        <p className="mt-2 text-[--color-text-muted]">
          Check how much shade coverage a product can deliver based on opening dimensions, sun angle and exposure.
        </p>

        <div className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[--color-text-primary]">
              Width (ft)
              <input
                type="number"
                min="6"
                value={width}
                onChange={(event) => setWidth(Number(event.target.value || 6))}
                className="mt-2 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>
            <label className="block text-sm font-medium text-[--color-text-primary]">
              Projection (ft)
              <input
                type="number"
                min="4"
                value={projection}
                onChange={(event) => setProjection(Number(event.target.value || 4))}
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
              Sun angle (°)
              <input
                type="number"
                min="15"
                max="80"
                value={sunAngle}
                onChange={(event) => setSunAngle(Number(event.target.value || 45))}
                className="mt-2 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>
            <label className="block text-sm font-medium text-[--color-text-primary]">
              Target coverage (%)
              <input
                type="number"
                min="35"
                max="95"
                value={targetCoverage}
                onChange={(event) => setTargetCoverage(Number(event.target.value || 65))}
                className="mt-2 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>
          </div>
        </div>
      </section>

      <aside className="rounded-3xl border border-[--color-border] bg-[--color-neutral-50] p-6 shadow-[var(--shadow-sm)]">
        <h3 className="text-xl font-bold text-[--color-text-primary]">Recommended setup</h3>

        <div className="mt-6 rounded-2xl bg-white p-4 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[--color-text-muted]">Coverage</p>
          <p className="mt-2 text-3xl font-bold text-[--color-brand-primary]">{result.coverage}%</p>
          <p className="mt-2 text-sm text-[--color-text-muted]">{result.product}</p>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-[--color-text-muted]">Projected area</dt>
            <dd className="font-medium text-[--color-text-primary]">{result.area.toFixed(0)} sq ft</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[--color-text-muted]">Recommended projection</dt>
            <dd className="font-medium text-[--color-text-primary]">{result.recommendedProjection.toFixed(1)} ft</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[--color-text-muted]">Shade hours</dt>
            <dd className="font-medium text-[--color-text-primary]">{result.shadeHours} hrs</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[--color-text-muted]">Sun factor</dt>
            <dd className="font-medium text-[--color-text-primary]">{result.sunFactor}</dd>
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
