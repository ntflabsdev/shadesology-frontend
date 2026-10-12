"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { calculateBudgetingTool } from "@/lib/configurator";

const productTypes = [
  { id: "awning", label: "Patio awning" },
  { id: "pergola", label: "Fabric pergola" },
  { id: "screen", label: "Retractable screen" },
  { id: "umbrella", label: "Outdoor umbrella" },
] as const;

const featureOptions = [
  { id: "motor", label: "Motorized operation", price: 1400 },
  { id: "weather", label: "Weather sensor", price: 850 },
  { id: "lighting", label: "Integrated lighting", price: 620 },
  { id: "drainage", label: "Drainage kit", price: 520 },
] as const;

export function BudgetingTool() {
  const [budget, setBudget] = useState(12000);
  const [area, setArea] = useState(220);
  const [productType, setProductType] = useState<(typeof productTypes)[number]["id"]>("awning");
  const [selectedFeatures, setSelectedFeatures] = useState<Array<(typeof featureOptions)[number]["id"]>>(["motor", "weather"]);
  const [financingRate, setFinancingRate] = useState(7.9);
  const [financingTerm, setFinancingTerm] = useState(84);

  const result = useMemo(
    () =>
      calculateBudgetingTool({
        budget,
        area,
        productType,
        features: selectedFeatures,
        financingRate,
        financingTerm,
      }),
    [budget, area, productType, selectedFeatures, financingRate, financingTerm],
  );

  const toggleFeature = (featureId: (typeof featureOptions)[number]["id"]) => {
    setSelectedFeatures((current) =>
      current.includes(featureId)
        ? current.filter((item) => item !== featureId)
        : [...current, featureId],
    );
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-3xl border border-[--color-border] bg-white p-6 shadow-[var(--shadow-md)]">
        <h2 className="text-3xl font-bold text-[--color-text-primary]">Budgeting tool</h2>
        <p className="mt-2 text-[--color-text-muted]">
          Set a budget ceiling and compare a recommended package for your preferred installation profile.
        </p>

        <div className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[--color-text-primary]">
              Budget ($)
              <input
                type="number"
                min="1500"
                value={budget}
                onChange={(event) => setBudget(Number(event.target.value || 1500))}
                className="mt-2 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>
            <label className="block text-sm font-medium text-[--color-text-primary]">
              Area (sq ft)
              <input
                type="number"
                min="30"
                value={area}
                onChange={(event) => setArea(Number(event.target.value || 30))}
                className="mt-2 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-[--color-text-primary]">Product type</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {productTypes.map((option) => (
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

          <div>
            <p className="mb-3 text-sm font-medium text-[--color-text-primary]">Upgrade features</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {featureOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleFeature(option.id)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors ${
                    selectedFeatures.includes(option.id)
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
              APR (%)
              <input
                type="number"
                min="0"
                step="0.1"
                value={financingRate}
                onChange={(event) => setFinancingRate(Number(event.target.value || 0))}
                className="mt-2 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>
            <label className="block text-sm font-medium text-[--color-text-primary]">
              Term (months)
              <input
                type="number"
                min="12"
                value={financingTerm}
                onChange={(event) => setFinancingTerm(Number(event.target.value || 12))}
                className="mt-2 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>
          </div>
        </div>
      </section>

      <aside className="rounded-3xl border border-[--color-border] bg-[--color-neutral-50] p-6 shadow-[var(--shadow-sm)]">
        <h3 className="text-xl font-bold text-[--color-text-primary]">Package recommendation</h3>

        <div className="mt-6 rounded-2xl bg-white p-4 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[--color-text-muted]">Estimated investment</p>
          <p className="mt-2 text-3xl font-bold text-[--color-brand-primary]">${result.total.toLocaleString()}</p>
          <p className="mt-2 text-sm text-[--color-text-muted]">{result.recommendedPackage}</p>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-[--color-text-muted]">Budget gap</dt>
            <dd className="font-medium text-[--color-text-primary]">${result.delta.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[--color-text-muted]">Monthly payment</dt>
            <dd className="font-medium text-[--color-text-primary]">${result.monthlyPayment.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[--color-text-muted]">Design fee</dt>
            <dd className="font-medium text-[--color-text-primary]">${result.designFee.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[--color-text-muted]">Ready to quote</dt>
            <dd className="font-medium text-[--color-text-primary]">{result.isProjectReady ? "Yes" : "Needs review"}</dd>
          </div>
        </dl>

        <div className="mt-8">
          <Button type="button" variant="outline" className="w-full" size="lg">
            Save estimate
          </Button>
        </div>
      </aside>
    </div>
  );
}
