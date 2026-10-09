"use client";

/**
 * AddToQuoteButton — adds a configured product to the quote basket (localStorage).
 *
 * Place this on product detail pages alongside the Add to Cart button:
 *
 *   <AddToQuoteButton
 *     productId={product._id}
 *     productName={product.name.en}
 *     variantId={selectedVariant._id}
 *     variantName={selectedVariant.name.en}
 *     sku={selectedVariant.sku}
 *     selectedOptions={selectedOptions}
 *   />
 *
 * After adding, shows a confirmation toast and a link to /quote/basket.
 * A basket count badge is shown if items exist.
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { addToQuoteBasket, loadQuoteBasket } from "@/lib/quoteBasket";

interface AddToQuoteButtonProps {
  productId?:       string;
  productName:      string;
  variantId?:       string;
  variantName?:     string;
  sku?:             string;
  selectedOptions?: Record<string, string>;
  quantity?:        number;
  className?:       string;
  /** Called after a successful add */
  onAdded?: () => void;
}

export function AddToQuoteButton({
  productId,
  productName,
  variantId,
  variantName,
  sku,
  selectedOptions = {},
  quantity = 1,
  className = "",
  onAdded,
}: AddToQuoteButtonProps) {
  const [added, setAdded]       = useState(false);
  const [basketCount, setBasketCount] = useState(0);

  // Keep basket count in sync
  useEffect(() => {
    function sync() {
      setBasketCount(loadQuoteBasket().reduce((sum, item) => sum + item.quantity, 0));
    }
    sync();
    window.addEventListener("quoteBasketUpdated", sync);
    return () => window.removeEventListener("quoteBasketUpdated", sync);
  }, []);

  function handleAdd() {
    addToQuoteBasket({ productId, productName, variantId, variantName, sku, quantity, selectedOptions });
    setAdded(true);
    onAdded?.();

    // Reset after 3 s
    setTimeout(() => setAdded(false), 3000);
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleAdd}
        aria-label={added ? "Added to quote basket" : "Add to quote basket"}
        className={[
          "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg",
          "border-2 font-semibold text-sm transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]",
          added
            ? "border-green-600 bg-green-50 text-green-700"
            : "border-[--color-brand-primary] text-[--color-brand-primary] hover:bg-[--color-brand-primary] hover:text-white",
          className,
        ].filter(Boolean).join(" ")}
      >
        {added ? (
          <>
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Added to Quote
          </>
        ) : (
          <>
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Add to Quote
          </>
        )}
      </button>

      {/* Link to basket — shown when basket has items */}
      {basketCount > 0 && (
        <Link
          href="/quote/basket"
          className="text-xs text-center text-[--color-brand-primary] hover:underline"
          aria-label={`View quote basket (${basketCount} item${basketCount !== 1 ? "s" : ""})`}
        >
          View quote basket ({basketCount} item{basketCount !== 1 ? "s" : ""}) →
        </Link>
      )}
    </div>
  );
}
