"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { ProductCard as Product } from "@/lib/api";
import { ProductCard as ProductCardView } from "@/components/ui/ProductCard";

const STORAGE_KEY = "shadesology-compare-products-v2";
const MAX_COMPARE = 4;

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("shadesology-compare-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("shadesology-compare-change", callback);
  };
}

function getStoredSelection() {
  return localStorage.getItem(STORAGE_KEY) || "[]";
}

function saveSelection(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("shadesology-compare-change"));
}

export function CompareProductGrid({ products, label }: { products: Product[]; label: string }) {
  const storedSelection = useSyncExternalStore(subscribe, getStoredSelection, () => "[]");
  let selected: string[] = [];
  try {
    const parsed: unknown = JSON.parse(storedSelection);
    if (Array.isArray(parsed)) selected = parsed.filter((id): id is string => typeof id === "string").slice(0, MAX_COMPARE);
  } catch {
    selected = [];
  }
  const [message, setMessage] = useState("");

  function toggle(productSlug: string) {
    const next = selected.includes(productSlug)
      ? selected.filter((slug) => slug !== productSlug)
      : selected.length < MAX_COMPARE
        ? [...selected, productSlug]
        : null;

    if (!next) {
      setMessage(`You can compare up to ${MAX_COMPARE} products at a time.`);
      return;
    }
    setMessage("");
    saveSelection(next);
  }

  return (
    <>
      {selected.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[--color-border] bg-white p-4">
          <p aria-live="polite" className="text-sm">
            {selected.length} of {MAX_COMPARE} products selected for comparison.
            {message && <span className="ml-2 text-red-700">{message}</span>}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-sm underline"
              onClick={() => {
                setMessage("");
                saveSelection([]);
              }}
            >
              Clear selection
            </button>
            <Link
              href={`/compare?ids=${encodeURIComponent(selected.join(","))}`}
              className="rounded-md bg-[--color-brand-primary] px-4 py-2 text-sm font-semibold text-white"
            >
              Compare selected
            </Link>
          </div>
        </div>
      )}
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3" role="list" aria-label={label}>
        {products.map((product) => (
          <li key={product._id}>
            <ProductCardView
              product={product}
              showCompare
              onCompare={toggle}
              isInCompare={selected.includes(product.slug)}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
