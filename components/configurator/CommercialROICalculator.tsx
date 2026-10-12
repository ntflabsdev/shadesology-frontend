"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { calculateCommercialROI } from "@/lib/configurator";

const climateZones = [
  { id: "cool", label: "Cool climate" },
  { id: "temperate", label: "Temperate" },
  { id: "hot", label: "Hot climate" },
] as const;

export function CommercialROICalculator() {
  const [annualEnergySpend, setAnnualEnergySpend] = useState(65000);
  const [climateZone, setClimateZone] = useState<(typeof climateZones)[number]["id"]>("hot");
  const [usableDaysBefore, setUsableDaysBefore] = useState(210);
  const [usableDaysAfter, setUsableDaysAfter] = useState(295);
  const [projectCost, setProjectCost] = useState(42000);
  const [staffCount, setStaffCount] = useState(22);

  const result = useMemo(
    () =>
      calculateCommercialROI({
        annualEnergySpend,
        climateZone,
        usableDaysBefore,
        usableDaysAfter,
        projectCost,
        staffCount,
      }),
    [annualEnergySpend, climateZone, usableDaysBefore, usableDaysAfter, projectCost, staffCount],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-3xl border border-[--color-border] bg-white p-6 shadow-[var(--shadow-md)]">
        <h2 className="text-3xl font-bold text-[--color-text-primary]">Commercial ROI calculator</h2>
        <p className="mt-2 text-[--color-text-muted]">
          Estimate operational savings, usable-day uplift and simple payback for a commercial shade investment.
        </p>

        <div className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[--color-text-primary]">
              Annual energy spend ($)
              <input
                type="number"
                min="4000"
                value={annualEnergySpend}
                onChange={(event) => setAnnualEnergySpend(Number(event.target.value || 4000))}
                className="mt-2 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>
            <label className="block text-sm font-medium text-[--color-text-primary]">
              Installed project cost ($)
              <input
                type="number"
                min="1000"
                value={projectCost}
                onChange={(event) => setProjectCost(Number(event.target.value || 1000))}
                className="mt-2 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-[--color-text-primary]">Climate zone</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {climateZones.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={climateZone === option.id}
                  onClick={() => setClimateZone(option.id)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                    climateZone === option.id
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
              Usable days before
              <input
                type="number"
                min="0"
                max="365"
                value={usableDaysBefore}
                onChange={(event) => setUsableDaysBefore(Number(event.target.value || 0))}
                className="mt-2 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>
            <label className="block text-sm font-medium text-[--color-text-primary]">
              Usable days after
              <input
                type="number"
                min="0"
                max="365"
                value={usableDaysAfter}
                onChange={(event) => setUsableDaysAfter(Number(event.target.value || 0))}
                className="mt-2 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-[--color-text-primary]">
            Staff count
            <input
              type="number"
              min="1"
              value={staffCount}
              onChange={(event) => setStaffCount(Number(event.target.value || 1))}
              className="mt-2 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
            />
          </label>
        </div>
      </section>

      <aside className="rounded-3xl border border-[--color-border] bg-[--color-neutral-50] p-6 shadow-[var(--shadow-sm)]">
        <h3 className="text-xl font-bold text-[--color-text-primary]">ROI summary</h3>

        <div className="mt-6 rounded-2xl bg-white p-4 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[--color-text-muted]">Annual savings</p>
          <p className="mt-2 text-3xl font-bold text-[--color-brand-primary]">${result.annualSavings.toLocaleString()}</p>
          <p className="mt-2 text-sm text-[--color-text-muted]">{result.recommendation}</p>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-[--color-text-muted]">ROI</dt>
            <dd className="font-medium text-[--color-text-primary]">{result.roi}%</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[--color-text-muted]">Payback</dt>
            <dd className="font-medium text-[--color-text-primary]">{result.paybackMonths} months</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[--color-text-muted]">Usable day lift</dt>
            <dd className="font-medium text-[--color-text-primary]">{result.usableDayLift} days</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[--color-text-muted]">Cooling savings</dt>
            <dd className="font-medium text-[--color-text-primary]">${result.avoidedCooling.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[--color-text-muted]">Productivity gain</dt>
            <dd className="font-medium text-[--color-text-primary]">${result.productivityGain.toLocaleString()}</dd>
          </div>
        </dl>

        <div className="mt-8 rounded-2xl border border-[--color-border] bg-white p-4 text-sm text-[--color-text-muted]">
          This estimate is a high-level planning model, not a substitute for engineering signoff or detailed HVAC analysis.
        </div>

        <div className="mt-8">
          <Button type="button" variant="outline" className="w-full" size="lg">
            Request ROI report
          </Button>
        </div>
      </aside>
    </div>
  );
}
