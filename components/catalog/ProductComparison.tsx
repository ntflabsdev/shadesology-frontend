"use client";

import { useEffect, useState } from "react";
import { compareVariants, getProduct, t, type ProductComparison } from "@/lib/api";
import { useLocaleSettings } from "@/components/i18n/LocaleProvider";

const STORAGE_KEY = "shadesology-compare-products-v2";

export function ProductComparison({ productSlugs }: { productSlugs: string[] }) {
  const { locale } = useLocaleSettings();
  const [comparison, setComparison] = useState<ProductComparison | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const variants = await Promise.all(productSlugs.map(async (slug) => {
          const detail = await getProduct(slug);
          const selected = detail.variants.find((variant) => variant.isDefault) ?? detail.variants[0];
          if (!selected) throw new Error(`${t(detail.product.name, locale)} has no available model to compare.`);
          return selected._id;
        }));
        const result = await compareVariants(variants);
        if (!cancelled) setComparison(result);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Unable to load product comparison.");
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [productSlugs, locale]);

  if (error) {
    return <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">{error}</p>;
  }
  if (!comparison) return <p role="status">Loading product comparison…</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-[--color-border]">
      <table className="w-full min-w-160 border-collapse text-left text-sm">
        <caption className="sr-only">Side-by-side product specifications</caption>
        <thead>
          <tr>
            <th scope="col" className="sticky left-0 bg-white p-3">Specification</th>
            {comparison.items.map((item) => (
              <th scope="col" key={item.variantId} className="min-w-48 p-3">
                <a href={`/products/${item.product.slug}`} className="font-semibold underline">
                  {t(item.product.name, locale)}
                </a>
                <div className="font-normal">{t(item.variantName, locale)}</div>
                <div className="font-normal">{item.displayPrice == null ? "Request a quote" : `$${item.displayPrice.toFixed(2)}`}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparison.rows.map((row) => (
            <tr key={row.key} className={row.hasDifference ? "bg-amber-50" : ""}>
              <th scope="row" className="sticky left-0 bg-inherit p-3 font-medium">
                {t(row.label, locale)}{row.unit ? ` (${row.unit})` : ""}
              </th>
              {row.values.map((value, index) => (
                <td key={`${row.key}-${index}`} className="p-3">{value == null ? "—" : String(value)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {comparison.isCrossCategory && (
        <p className="border-t border-[--color-border] p-3 text-xs text-[--color-text-muted]">
          These products are from different product types; specifications that do not apply are shown as —.
        </p>
      )}
    </div>
  );
}

export function ComparePageClient({ ids }: { ids: string[] }) {
  const safeSlugs = [...new Set(ids.filter(Boolean))].slice(0, 4);
  const serializedSlugs = safeSlugs.join(",");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedSlugs ? serializedSlugs.split(",") : []));
  }, [serializedSlugs]);

  if (safeSlugs.length < 1 || ids.length > 4) {
    return <p role="alert">Select between one and four products to compare.</p>;
  }
  return <ProductComparison productSlugs={safeSlugs} />;
}
