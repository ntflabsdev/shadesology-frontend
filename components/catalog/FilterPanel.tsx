"use client";

import React, { useTransition, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Facet, FacetOption, t } from "@/lib/api";
import { useLocaleSettings } from "@/components/i18n/LocaleProvider";
import type { Locale } from "@/i18n/config";

interface Props {
  facets: Facet[];
  activeFilters: Record<string, string | string[]>;
  sort: string;
  totalProducts: number;
}

// ─── URL builder ─────────────────────────────────────────────────────────────
function buildUrl(
  pathname: string,
  current: URLSearchParams,
  key: string,
  value: string,
  multi: boolean,
): string {
  const p = new URLSearchParams(current.toString());
  p.delete("page");

  if (multi) {
    const existing = p.getAll(key);
    if (existing.includes(value)) {
      p.delete(key);
      existing.filter((v) => v !== value).forEach((v) => p.append(key, v));
    } else {
      p.append(key, value);
    }
  } else {
    p.get(key) === value ? p.delete(key) : p.set(key, value);
  }

  const qs = p.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

function buildRangeUrl(
  pathname: string,
  current: URLSearchParams,
  key: string,
  min: string,
  max: string,
): string {
  const p = new URLSearchParams(current.toString());
  p.delete("page");
  if (min) p.set(`${key}_min`, min); else p.delete(`${key}_min`);
  if (max) p.set(`${key}_max`, max); else p.delete(`${key}_max`);
  const qs = p.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

const SORT_OPTIONS = [
  { value: "sortOrder",  label: "Featured" },
  { value: "newest",     label: "Newest" },
  { value: "price_asc",  label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc",   label: "Name: A–Z" },
  { value: "popular",    label: "Most Popular" },
];

// ─── Render variants ─────────────────────────────────────────────────────────

function CheckboxFacet({
  facet, activeArr, navigate, pathname, searchParams, locale,
}: {
  facet: Facet; activeArr: string[];
  navigate: (url: string) => void;
  pathname: string; searchParams: URLSearchParams;
  locale: Locale;
}) {
  return (
    <div className="space-y-1.5 mt-2">
      {facet.options.map((option: FacetOption) => {
        const isChecked = activeArr.includes(option.value);
        const url = buildUrl(pathname, searchParams, facet.key, option.value, true);
        return (
          <label key={option.value} className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => navigate(url)}
              className="rounded border-[--color-border] text-[--color-brand-primary] focus:ring-[--color-brand-accent]"
              aria-label={`Filter by ${t(facet.label, locale)}: ${t(option.label, locale)}`}
            />
            <span className="text-sm text-[--color-text-primary] group-hover:text-[--color-brand-primary] transition-colors flex-1">
              {t(option.label, locale)}
            </span>
            {option.count !== undefined && (
              <span className="text-xs text-[--color-text-muted]">({option.count})</span>
            )}
          </label>
        );
      })}
    </div>
  );
}

function ButtonGroupFacet({
  facet, activeArr, navigate, pathname, searchParams, locale,
}: {
  facet: Facet; activeArr: string[];
  navigate: (url: string) => void;
  pathname: string; searchParams: URLSearchParams;
  locale: Locale;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-2" role="group" aria-label={t(facet.label, locale)}>
      {facet.options.map((option: FacetOption) => {
        const isActive = activeArr.includes(option.value);
        const url = buildUrl(pathname, searchParams, facet.key, option.value, true);
        return (
          <button
            key={option.value}
            onClick={() => navigate(url)}
            aria-pressed={isActive}
            className={[
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
              isActive
                ? "bg-[--color-brand-primary] text-white border-[--color-brand-primary]"
                : "bg-white text-[--color-text-primary] border-[--color-border] hover:border-[--color-brand-primary] hover:text-[--color-brand-primary]",
            ].join(" ")}
          >
            {t(option.label, locale)}
            {option.count !== undefined && (
              <span className={`ml-1 text-xs ${isActive ? "text-white/70" : "text-[--color-text-muted]"}`}>
                ({option.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ColorSwatchFacet({
  facet, activeArr, navigate, pathname, searchParams, locale,
}: {
  facet: Facet; activeArr: string[];
  navigate: (url: string) => void;
  pathname: string; searchParams: URLSearchParams;
  locale: Locale;
}) {
  return (
    <div className="flex flex-wrap gap-2.5 mt-2" role="group" aria-label={t(facet.label, locale)}>
      {facet.options.map((option: FacetOption & { hexValue?: string; swatchImage?: string }) => {
        const isActive = activeArr.includes(option.value);
        const url = buildUrl(pathname, searchParams, facet.key, option.value, true);
        const hex = (option as { hexValue?: string }).hexValue;
        const swatch = (option as { swatchImage?: string }).swatchImage;

        return (
          <button
            key={option.value}
            onClick={() => navigate(url)}
            aria-pressed={isActive}
            aria-label={`Filter by colour: ${t(option.label, locale)}`}
            title={t(option.label, locale)}
            className={[
              "w-8 h-8 rounded-full border-2 transition-all",
              isActive
                ? "border-[--color-brand-primary] scale-110 shadow-md"
                : "border-transparent hover:border-[--color-neutral-400]",
            ].join(" ")}
            style={hex ? { backgroundColor: hex } : {}}
          >
            {swatch && !hex && (
              <img src={swatch} alt={t(option.label, locale)} className="w-full h-full rounded-full object-cover" />
            )}
            {!hex && !swatch && (
              <span className="w-full h-full rounded-full bg-[--color-neutral-200] flex items-center justify-center text-xs">
                {t(option.label, locale).slice(0, 2)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function RangeSliderFacet({
  facet, searchParams, navigate, pathname,
}: {
  facet: Facet;
  searchParams: URLSearchParams;
  navigate: (url: string) => void;
  pathname: string;
}) {
  // Parse current min/max from URL
  const urlMin = searchParams.get(`${facet.key}_min`) ?? "";
  const urlMax = searchParams.get(`${facet.key}_max`) ?? "";

  const [min, setMin] = useState(urlMin);
  const [max, setMax] = useState(urlMax);

  // Derive numeric bounds from options if available
  const numericValues = facet.options
    .map((o) => parseFloat(o.value))
    .filter((n) => !isNaN(n));
  const rangeMin = numericValues.length ? Math.min(...numericValues) : 0;
  const rangeMax = numericValues.length ? Math.max(...numericValues) : 9999;
  const unit = facet.unit ? ` ${facet.unit}` : "";

  function applyRange() {
    navigate(buildRangeUrl(pathname, searchParams, facet.key, min, max));
  }

  function clearRange() {
    setMin("");
    setMax("");
    navigate(buildRangeUrl(pathname, searchParams, facet.key, "", ""));
  }

  const hasRange = !!urlMin || !!urlMax;

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <div className="flex-1">
          <label htmlFor={`${facet.key}-min`} className="block text-xs text-[--color-text-muted] mb-1">
            Min{unit}
          </label>
          <input
            id={`${facet.key}-min`}
            type="number"
            value={min}
            min={rangeMin}
            max={rangeMax}
            placeholder={String(rangeMin)}
            onChange={(e) => setMin(e.target.value)}
            onBlur={applyRange}
            onKeyDown={(e) => e.key === "Enter" && applyRange()}
            className="w-full px-2.5 py-1.5 rounded-lg border border-[--color-border] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent]"
          />
        </div>
        <span className="text-[--color-text-muted] mt-5">–</span>
        <div className="flex-1">
          <label htmlFor={`${facet.key}-max`} className="block text-xs text-[--color-text-muted] mb-1">
            Max{unit}
          </label>
          <input
            id={`${facet.key}-max`}
            type="number"
            value={max}
            min={rangeMin}
            max={rangeMax}
            placeholder={String(rangeMax)}
            onChange={(e) => setMax(e.target.value)}
            onBlur={applyRange}
            onKeyDown={(e) => e.key === "Enter" && applyRange()}
            className="w-full px-2.5 py-1.5 rounded-lg border border-[--color-border] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent]"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={applyRange}
          className="flex-1 py-1.5 rounded-lg bg-[--color-brand-primary] text-white text-xs font-semibold hover:bg-[--color-brand-primary-light] transition-colors"
        >
          Apply
        </button>
        {hasRange && (
          <button
            onClick={clearRange}
            className="px-3 py-1.5 rounded-lg border border-[--color-border] text-xs text-[--color-text-muted] hover:text-[--color-brand-primary] hover:border-[--color-brand-primary] transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FilterPanel({ facets, activeFilters, sort, totalProducts }: Props) {
  const { locale } = useLocaleSettings();
  const router     = useRouter();
  const pathname   = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function navigate(url: string) {
    startTransition(() => router.push(url, { scroll: false }));
  }

  function handleSort(e: React.ChangeEvent<HTMLSelectElement>) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("sort", e.target.value);
    p.delete("page");
    navigate(`${pathname}?${p}`);
  }

  function clearAll() {
    navigate(pathname);
  }

  const hasActiveFilters = Object.values(activeFilters).some(
    (v) => (Array.isArray(v) ? v.length > 0 : !!v),
  );

  // Also check range params
  const hasRangeFilters = facets.some(
    (f) => searchParams.get(`${f.key}_min`) || searchParams.get(`${f.key}_max`),
  );

  return (
    <aside
      aria-label="Product filters"
      className={isPending ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}
    >
      {/* Sort + total row */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <p className="text-sm text-[--color-text-muted]" aria-live="polite">
          <span className="font-semibold text-[--color-text-primary]">{totalProducts}</span> products
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm text-[--color-text-muted] whitespace-nowrap">
            Sort:
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={handleSort}
            className="text-sm border border-[--color-border] rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent]"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear all */}
      {(hasActiveFilters || hasRangeFilters) && (
        <button
          onClick={clearAll}
          className="mb-5 text-sm font-medium text-[--color-brand-primary] hover:underline flex items-center gap-1.5"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear all filters
        </button>
      )}

      {/* Facet groups */}
      <div className="space-y-6">
        {facets.map((facet) => {
          const active    = activeFilters[facet.key];
          const activeArr = Array.isArray(active) ? active : active ? [active] : [];
          // Determine effective display type
          const displayType = facet.displayType ?? facet.type ?? "checkbox";

          return (
            <fieldset key={facet.key} className="border-0 p-0 m-0">
              <legend className="text-sm font-semibold text-[--color-text-primary] mb-1 pb-1.5 border-b border-[--color-border] w-full flex items-center justify-between">
                {t(facet.label, locale)}
                {activeArr.length > 0 && (
                  <span className="ml-2 text-xs bg-[--color-brand-primary] text-white rounded-full px-1.5 py-0.5 font-normal">
                    {activeArr.length}
                  </span>
                )}
              </legend>

              {/* Render based on displayType */}
              {(displayType === "button_group") && (
                <ButtonGroupFacet
                  facet={facet} activeArr={activeArr}
                  navigate={navigate} pathname={pathname} searchParams={searchParams} locale={locale}
                />
              )}

              {(displayType === "color_swatch") && (
                <ColorSwatchFacet
                  facet={facet} activeArr={activeArr}
                  navigate={navigate} pathname={pathname} searchParams={searchParams} locale={locale}
                />
              )}

              {(displayType === "range_slider" || displayType === "range") && (
                <RangeSliderFacet
                  facet={facet}
                  searchParams={searchParams}
                  navigate={navigate}
                  pathname={pathname}
                />
              )}

              {/* Default: checkbox (covers 'checkbox', 'select', unknown) */}
              {displayType !== "button_group" &&
               displayType !== "color_swatch" &&
               displayType !== "range_slider" &&
               displayType !== "range" && (
                <CheckboxFacet
                  facet={facet} activeArr={activeArr}
                  navigate={navigate} pathname={pathname} searchParams={searchParams} locale={locale}
                />
              )}
            </fieldset>
          );
        })}
      </div>
    </aside>
  );
}
