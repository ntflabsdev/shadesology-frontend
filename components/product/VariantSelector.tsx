"use client";

import React from "react";
import { Variant, t } from "@/lib/api";
import { DisplayPrice } from "@/components/i18n/DisplayPrice";
import { useLocaleSettings } from "@/components/i18n/LocaleProvider";
import { formatLengthRange } from "@/i18n/format";

interface Props {
  variants: Variant[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const AVAILABILITY_LABELS: Record<string, { label: string; color: string }> = {
  in_stock:       { label: "In Stock",       color: "text-green-600" },
  made_to_order:  { label: "Made to Order",  color: "text-[--color-brand-accent]" },
  discontinued:   { label: "Discontinued",   color: "text-red-500" },
  coming_soon:    { label: "Coming Soon",    color: "text-blue-500" },
};

export function VariantSelector({ variants, selectedId, onSelect }: Props) {
  const { locale, units } = useLocaleSettings();
  if (variants.length <= 1) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-[--color-text-primary] mb-2" id="variant-selector-label">
        Model / Size
      </h3>
      <div
        className="space-y-2"
        role="radiogroup"
        aria-labelledby="variant-selector-label"
      >
        {variants.map((v) => {
          const isSelected = v._id === selectedId;
          const avail = AVAILABILITY_LABELS[v.availability] ?? { label: v.availability, color: "text-[--color-text-muted]" };
          const sizeLabel = [
            formatLengthRange(v.widthMin, v.widthMax, units, locale, "W"),
            formatLengthRange(v.projectionMin, v.projectionMax, units, locale, "P"),
          ]
            .filter(Boolean)
            .join(" × ");

          return (
            <label
              key={v._id}
              className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                isSelected
                  ? "border-[--color-brand-primary] bg-[--color-brand-primary]/5"
                  : "border-[--color-border] hover:border-[--color-brand-primary]/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="variant"
                  value={v._id}
                  checked={isSelected}
                  onChange={() => onSelect(v._id)}
                  className="sr-only"
                  aria-label={`Select ${t(v.name, locale)}`}
                />
                <div>
                  <p className="text-sm font-semibold text-[--color-text-primary]">{t(v.name, locale)}</p>
                  {sizeLabel && (
                    <p className="text-xs text-[--color-text-muted]">{sizeLabel}</p>
                  )}
                  <p className={`text-xs font-medium mt-0.5 ${avail.color}`}>{avail.label}</p>
                </div>
              </div>
              <div className="text-right">
                {v.displayPrice !== null && v.priceType !== "quote" ? (
                  <p className="font-bold text-[--color-text-primary]">
                    <DisplayPrice amount={v.displayPrice ?? 0} />
                  </p>
                ) : (
                  <p className="text-sm text-[--color-text-muted] italic">Quote</p>
                )}
                {v.leadTimeDays && (
                  <p className="text-xs text-[--color-text-muted]">{v.leadTimeDays}d lead</p>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
