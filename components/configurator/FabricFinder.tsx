"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  fabricData,
  fabricFilterOptions,
  type FabricEntry,
} from "@/lib/fabricFinder";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function FabricFinder() {
  const [composition, setComposition] = useState<string>("All");
  const [openness, setOpenness] = useState<string>("All");
  const [pattern, setPattern] = useState<string>("All");
  const [group, setGroup] = useState<string>("All");
  const [warrantyMin, setWarrantyMin] = useState<number>(8);
  const [selectedFabricId, setSelectedFabricId] = useState<string>(fabricData[0]?.id ?? "");

  const filteredFabrics = useMemo(() => {
    return fabricData.filter((fabric) => {
      const matchesComposition = composition === "All" || fabric.composition === composition;
      const matchesOpenness = openness === "All" || fabric.openness === openness;
      const matchesPattern = pattern === "All" || fabric.pattern === pattern;
      const matchesGroup = group === "All" || fabric.group === group;
      const matchesWarranty = fabric.warrantyYears >= warrantyMin;
      return matchesComposition && matchesOpenness && matchesPattern && matchesGroup && matchesWarranty;
    });
  }, [composition, openness, pattern, group, warrantyMin]);

  const selectedFabric = filteredFabrics.find((fabric) => fabric.id === selectedFabricId) ?? filteredFabrics[0] ?? fabricData[0];

  const similarFabrics = useMemo(() => {
    if (!selectedFabric) return [];
    return fabricData
      .filter((fabric) => fabric.id !== selectedFabric.id)
      .filter((fabric) => fabric.composition === selectedFabric.composition || fabric.group === selectedFabric.group)
      .slice(0, 3);
  }, [selectedFabric]);

  const handleReset = () => {
    setComposition("All");
    setOpenness("All");
    setPattern("All");
    setGroup("All");
    setWarrantyMin(8);
    setSelectedFabricId(fabricData[0]?.id ?? "");
  };

  const renderAvailability = (fabric: FabricEntry) => {
    const available = Object.entries(fabric.availability)
      .filter(([, availableFor]) => availableFor)
      .map(([key]) => key.replace(/([A-Z])/g, " $1").trim());

    return available.length ? available.join(" • ") : "Not currently mapped";
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[0.9fr_1.5fr]">
      <aside className="rounded-3xl border border-[--color-border] bg-[--color-neutral-50] p-5 shadow-[var(--shadow-sm)]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-[--color-text-primary]">Fabric filters</h2>
          <button type="button" onClick={handleReset} className="text-sm font-semibold text-[--color-brand-primary]">
            Reset
          </button>
        </div>

        <div className="space-y-5">
          <label className="block text-sm font-medium text-[--color-text-primary]">
            Composition
            <select value={composition} onChange={(event) => setComposition(event.target.value)} className="mt-2 w-full rounded-xl border border-[--color-border] bg-white px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]">
              <option value="All">All</option>
              {fabricFilterOptions.compositions.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-[--color-text-primary]">
            Openness
            <select value={openness} onChange={(event) => setOpenness(event.target.value)} className="mt-2 w-full rounded-xl border border-[--color-border] bg-white px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]">
              <option value="All">All</option>
              {fabricFilterOptions.openness.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-[--color-text-primary]">
            Pattern
            <select value={pattern} onChange={(event) => setPattern(event.target.value)} className="mt-2 w-full rounded-xl border border-[--color-border] bg-white px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]">
              <option value="All">All</option>
              {fabricFilterOptions.patterns.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-[--color-text-primary]">
            Product group
            <select value={group} onChange={(event) => setGroup(event.target.value)} className="mt-2 w-full rounded-xl border border-[--color-border] bg-white px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]">
              <option value="All">All</option>
              {fabricFilterOptions.groups.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-[--color-text-primary]">
            Warranty minimum
            <input
              type="range"
              min="5"
              max="15"
              step="1"
              value={warrantyMin}
              onChange={(event) => setWarrantyMin(Number(event.target.value))}
              className="mt-3 w-full accent-[--color-brand-primary]"
            />
            <span className="mt-2 block text-[--color-text-muted]">{warrantyMin} years</span>
          </label>
        </div>
      </aside>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[--color-brand-primary]">Fabric finder</p>
            <h2 className="mt-2 text-3xl font-bold text-[--color-text-primary]">{filteredFabrics.length} fabrics available</h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {filteredFabrics.map((fabric) => (
            <button
              key={fabric.id}
              type="button"
              onClick={() => setSelectedFabricId(fabric.id)}
              className={`overflow-hidden rounded-3xl border bg-white text-left transition-all ${
                selectedFabric?.id === fabric.id ? "border-[--color-brand-primary] shadow-[var(--shadow-md)]" : "border-[--color-border]"
              }`}
            >
              <img src={fabric.image} alt={fabric.name} className="h-44 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[--color-brand-primary]">{fabric.manufacturer}</p>
                    <h3 className="mt-1 text-xl font-bold text-[--color-text-primary]">{fabric.name}</h3>
                  </div>
                  <span className="rounded-full bg-[--color-brand-primary]/10 px-2 py-1 text-xs font-semibold text-[--color-brand-primary]">
                    {fabric.pattern}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-[--color-text-muted]">
                  <span className="rounded-full border border-[--color-border] px-2 py-1">{fabric.composition}</span>
                  <span className="rounded-full border border-[--color-border] px-2 py-1">{fabric.openness}</span>
                  <span className="rounded-full border border-[--color-border] px-2 py-1">{fabric.warrantyYears}yr warranty</span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                  <span className="text-[--color-text-muted]">From {currency.format(fabric.pricePerSqFt)}/sq ft</span>
                  <span className="font-semibold text-[--color-text-primary]">{fabric.color}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedFabric && (
          <div className="rounded-3xl border border-[--color-border] bg-white p-6 shadow-[var(--shadow-sm)]">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[--color-brand-primary]">Selected fabric</p>
                <h3 className="mt-2 text-3xl font-bold text-[--color-text-primary]">{selectedFabric.name}</h3>
                <p className="mt-2 text-[--color-text-muted]">{selectedFabric.manufacturer}</p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[--color-neutral-50] p-3">
                    <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Composition</p>
                    <p className="mt-1 font-semibold text-[--color-text-primary]">{selectedFabric.composition}</p>
                  </div>
                  <div className="rounded-2xl bg-[--color-neutral-50] p-3">
                    <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Openness</p>
                    <p className="mt-1 font-semibold text-[--color-text-primary]">{selectedFabric.openness}</p>
                  </div>
                  <div className="rounded-2xl bg-[--color-neutral-50] p-3">
                    <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Warranty</p>
                    <p className="mt-1 font-semibold text-[--color-text-primary]">{selectedFabric.warrantyYears} years</p>
                  </div>
                  <div className="rounded-2xl bg-[--color-neutral-50] p-3">
                    <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Solar trans.</p>
                    <p className="mt-1 font-semibold text-[--color-text-primary]">{selectedFabric.solarTransmission}%</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-semibold text-[--color-text-primary]">Suitable for</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedFabric.suitableFor.map((item) => (
                      <span key={item} className="rounded-full border border-[--color-border] px-2.5 py-1 text-xs font-medium text-[--color-text-muted]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="rounded-2xl border border-[--color-border] bg-[--color-neutral-50] p-4">
                  <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Availability</p>
                  <p className="mt-2 text-sm font-medium text-[--color-text-primary]">{renderAvailability(selectedFabric)}</p>
                </div>

                <div className="mt-4 rounded-2xl border border-[--color-border] bg-white p-4">
                  <p className="text-sm text-[--color-text-muted]">Approximate pricing</p>
                  <p className="mt-2 text-3xl font-bold text-[--color-brand-primary]">{currency.format(selectedFabric.pricePerSqFt)}/sq ft</p>
                </div>

                <div className="mt-4 space-y-3">
                  <Button type="button" variant="primary" size="lg" className="w-full">Request a sample</Button>
                  <Button type="button" variant="outline" size="lg" className="w-full">Add to configurator</Button>
                </div>
              </div>
            </div>

            {similarFabrics.length > 0 && (
              <div className="mt-6 border-t border-[--color-border] pt-6">
                <p className="text-sm font-semibold text-[--color-text-primary]">Similar options</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {similarFabrics.map((fabric) => (
                    <button
                      key={fabric.id}
                      type="button"
                      onClick={() => setSelectedFabricId(fabric.id)}
                      className="rounded-2xl border border-[--color-border] p-3 text-left hover:border-[--color-brand-primary]"
                    >
                      <p className="text-sm font-semibold text-[--color-text-primary]">{fabric.name}</p>
                      <p className="mt-1 text-xs text-[--color-text-muted]">{fabric.composition} • {fabric.group}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
