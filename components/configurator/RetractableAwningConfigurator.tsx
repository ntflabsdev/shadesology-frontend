"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  awningOptions,
  calculateRetractableAwningEstimate,
  type RetractableAwningConfig,
} from "@/lib/configurator";

const defaultConfig: RetractableAwningConfig = {
  width: 12,
  projection: 10,
  fabric: "performance",
  operation: "motorized",
  installation: "standard",
  color: "sandstone",
  extras: ["windSensor"],
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function OptionSelector<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ id: T; label: string; description?: string; swatch?: string; amount?: number }>;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-[--color-text-primary]">{label}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {options.map((option) => {
          const isActive = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.id)}
              className={`rounded-2xl border p-3 text-left transition-all ${
                isActive
                  ? "border-[--color-brand-primary] bg-[--color-brand-primary]/5 shadow-sm"
                  : "border-[--color-border] hover:border-[--color-brand-primary]/60"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-[--color-text-primary]">{option.label}</span>
                {option.swatch ? (
                  <span
                    className="h-5 w-5 rounded-full border border-[--color-border]"
                    style={{ backgroundColor: option.swatch }}
                    aria-label={`${option.label} swatch`}
                  />
                ) : null}
              </div>
              {option.description ? (
                <p className="mt-2 text-sm text-[--color-text-muted]">{option.description}</p>
              ) : null}
              {typeof option.amount === "number" ? (
                <p className="mt-2 text-xs font-semibold text-[--color-brand-primary]">
                  +{currency.format(option.amount)}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function RetractableAwningConfigurator() {
  const [config, setConfig] = useState<RetractableAwningConfig>(defaultConfig);
  const [savedMessage, setSavedMessage] = useState("");

  const estimate = useMemo(() => calculateRetractableAwningEstimate(config), [config]);

  const updateConfig = <K extends keyof RetractableAwningConfig>(key: K, value: RetractableAwningConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const toggleExtra = (value: string) => {
    const optionValue = value as RetractableAwningConfig["extras"][number];
    setConfig((prev) => {
      const exists = prev.extras.includes(optionValue);
      return {
        ...prev,
        extras: exists ? prev.extras.filter((item) => item !== optionValue) : [...prev.extras, optionValue],
      };
    });
  };

  const handleSave = () => {
    try {
      const existing = JSON.parse(window.localStorage.getItem("shadeology_design_quotes") || "[]");
      const entry = {
        id: `awning-${Date.now()}`,
        type: "Retractable Awning",
        createdAt: new Date().toISOString(),
        config,
        estimate,
      };

      const next = [...existing, entry].slice(-8);
      window.localStorage.setItem("shadeology_design_quotes", JSON.stringify(next));
      setSavedMessage("Saved to your quote basket.");
    } catch {
      setSavedMessage("Unable to save on this browser. Please try again.");
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="rounded-3xl border border-[--color-border] bg-white p-5 shadow-[var(--shadow-md)] sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[--color-brand-primary]">Design tool</p>
          <h2 className="mt-2 text-3xl font-bold text-[--color-text-primary]">Retractable awning configurator</h2>
          <p className="mt-2 max-w-2xl text-[--color-text-muted]">
            Tailor your awning for project size, fabric, operation and installation needs before sending it to a quote.
          </p>
        </div>

        <div className="space-y-8">
          <OptionSelector
            label="Width"
            value={config.width.toString() as never}
            options={awningOptions.widths.map((option) => ({ id: option.value.toString() as never, label: option.label }))}
            onChange={(value) => updateConfig("width", Number(value))}
          />

          <OptionSelector
            label="Projection"
            value={config.projection.toString() as never}
            options={awningOptions.projections.map((option) => ({ id: option.value.toString() as never, label: option.label }))}
            onChange={(value) => updateConfig("projection", Number(value))}
          />

          <OptionSelector
            label="Fabric"
            value={config.fabric}
            options={awningOptions.fabrics.map((option) => ({
              id: option.id,
              label: option.label,
              description: option.description,
              amount: option.surcharge,
            }))}
            onChange={(value) => updateConfig("fabric", value)}
          />

          <OptionSelector
            label="Operation"
            value={config.operation}
            options={awningOptions.operations.map((option) => ({
              id: option.id,
              label: option.label,
              amount: option.addition,
            }))}
            onChange={(value) => updateConfig("operation", value)}
          />

          <OptionSelector
            label="Mounting"
            value={config.installation}
            options={awningOptions.installations.map((option) => ({
              id: option.id,
              label: option.label,
              amount: option.addition,
            }))}
            onChange={(value) => updateConfig("installation", value)}
          />

          <div>
            <p className="mb-3 text-sm font-semibold text-[--color-text-primary]">Color</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {awningOptions.colors.map((option) => {
                const isActive = option.id === config.color;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => updateConfig("color", option.id)}
                    className={`flex items-center gap-3 rounded-2xl border p-3 text-left ${
                      isActive
                        ? "border-[--color-brand-primary] bg-[--color-brand-primary]/5"
                        : "border-[--color-border]"
                    }`}
                  >
                    <span className="h-5 w-5 rounded-full border border-[--color-border]" style={{ backgroundColor: option.swatch }} />
                    <span className="text-sm font-medium text-[--color-text-primary]">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-[--color-text-primary]">Optional upgrades</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {awningOptions.extras.map((option) => {
                const isSelected = config.extras.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleExtra(option.id)}
                    className={`rounded-2xl border p-3 text-left transition-colors ${
                      isSelected
                        ? "border-[--color-brand-primary] bg-[--color-brand-primary]/5"
                        : "border-[--color-border] hover:border-[--color-brand-primary]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-[--color-text-primary]">{option.label}</span>
                      <span className="text-xs font-bold text-[--color-brand-primary]">+{currency.format(option.price)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <aside className="rounded-3xl border border-[--color-border] bg-[--color-neutral-50] p-5 shadow-[var(--shadow-sm)] sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="text-xl font-bold text-[--color-text-primary]">Quote estimate</h3>
          <span className="rounded-full bg-[--color-brand-primary]/10 px-2.5 py-1 text-xs font-semibold text-[--color-brand-primary]">
            {config.width} x {config.projection} ft
          </span>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-sm)]">
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <span className="text-sm text-[--color-text-muted]">Estimated total</span>
            <span className="text-3xl font-bold text-[--color-brand-primary]">{currency.format(estimate.total)}</span>
          </div>
          <p className="text-sm text-[--color-text-muted]">{estimate.recommendation}</p>
        </div>

        <div className="mt-6 space-y-3">
          {estimate.lineItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[--color-text-muted]">{item.label}</span>
              <span className="font-medium text-[--color-text-primary]">{currency.format(item.amount)}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          <Button type="button" onClick={handleSave} className="w-full" variant="primary" size="lg">
            Save to quote basket
          </Button>
          <Button
            type="button"
            onClick={() => setConfig(defaultConfig)}
            className="w-full"
            variant="outline"
            size="lg"
          >
            Reset configuration
          </Button>
        </div>

        {savedMessage ? (
          <p aria-live="polite" className="mt-4 text-sm font-medium text-[--color-success]">
            {savedMessage}
          </p>
        ) : null}
      </aside>
    </div>
  );
}
