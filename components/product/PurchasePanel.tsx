"use client";

import React, { useState } from "react";
import { Variant, t } from "@/lib/api";
import { addToCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";
import { AddToQuoteButton } from "@/components/product/AddToQuoteButton";
import Link from "next/link";
import { DeliveryEstimate } from "@/components/shipping/DeliveryEstimate";
import { PaymentCalculator } from "@/components/financing/PaymentCalculator";
import { DisplayPrice } from "@/components/i18n/DisplayPrice";
import { useLocaleSettings } from "@/components/i18n/LocaleProvider";

interface Props {
  selectedVariant: Variant | null;
  productName: string;
  productSlug: string;
  productId: string;
  showPrice: boolean;
}

export function PurchasePanel({ selectedVariant, productName, productId, showPrice }: Props) {
  const { toast } = useToast();
  const { locale } = useLocaleSettings();
  const [loading, setLoading] = useState(false);

  const v = selectedVariant;
  const hasPrice = v && v.displayPrice !== null && v.priceType !== "quote";
  const isDiscontinued = v?.availability === "discontinued";

  async function handleAddToCart() {
    if (!v || !productId) return;
    setLoading(true);
    try {
      const result = await addToCart(productId, v._id, 1);
      toast({
        title: "Added to cart!",
        description: `${productName} — ${result.itemCount} item${result.itemCount !== 1 ? "s" : ""} in cart`,
        variant: "success",
      });
    } catch (err: unknown) {
      toast({
        title: "Couldn't add to cart",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sticky top-24 bg-white rounded-2xl border border-[--color-border] p-6 shadow-sm space-y-5">
      {/* Price display */}
      <div>
        {!showPrice ? (
          <div>
            <p className="text-sm text-[--color-text-muted] mb-1">Price available on request</p>
            <p className="text-2xl font-bold text-[--color-text-primary]">Request Quote</p>
          </div>
        ) : hasPrice ? (
          <div>
            <p className="text-sm text-[--color-text-muted] mb-1">
              {v?.priceType === "dealer" ? "Your Price" : "Starting from"}
            </p>
            <p className="text-3xl font-bold text-[--color-text-primary]">
              <DisplayPrice amount={v!.displayPrice!} />
            </p>
            {v?.priceType === "dealer" && (
              <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                Dealer Price
              </span>
            )}
          </div>
        ) : (
          <p className="text-3xl font-bold text-[--color-brand-primary]">Request Quote</p>
        )}

        {/* Availability */}
        {v && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                v.availability === "in_stock"
                  ? "bg-green-500"
                  : v.availability === "made_to_order"
                  ? "bg-amber-400"
                  : "bg-red-400"
              }`}
              aria-hidden="true"
            />
            <span className="text-sm text-[--color-text-muted]">
              {v.availability === "in_stock"
                ? "In Stock"
                : v.availability === "made_to_order"
                ? `Made to Order${v.leadTimeDays ? ` — ~${v.leadTimeDays} days` : ""}`
                : v.availability === "coming_soon"
                ? "Coming Soon"
                : "Discontinued"}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {!isDiscontinued && (
        <div className="space-y-3">
          {showPrice && hasPrice && (
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[--color-brand-primary] text-white font-bold hover:bg-[--color-brand-primary-light] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[--color-brand-accent] focus-visible:outline-none"
              aria-label={`Add ${productName} to cart`}
              aria-busy={loading}
              data-conversion-event="primary_cta_click"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Adding…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m.6 8L4 5M7 13l-1 5h12M17 18a1 1 0 100 2 1 1 0 000-2M9 18a1 1 0 100 2 1 1 0 000-2" />
                  </svg>
                  Add to Cart
                </>
              )}
            </button>
          )}

          <AddToQuoteButton
            productId={productId}
            productName={productName}
            variantId={v?._id}
            variantName={v ? t(v.name, locale) : undefined}
            sku={v?.sku}
            className="w-full"
          />

          <Link
            href={`/quote?product=${productId}`}
            className="w-full py-3.5 rounded-xl border-2 border-[--color-brand-accent] text-[--color-brand-primary] font-bold hover:bg-[--color-brand-accent]/10 transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[--color-brand-accent] focus-visible:outline-none"
            aria-label={`Request a quote for ${productName}`}
            data-conversion-event="primary_cta_click"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Request a Quote
          </Link>
        </div>
      )}

      {showPrice && hasPrice && (
        <PaymentCalculator amount={v!.displayPrice!} title="Monthly payment estimate" compact showLeaseInquiry />
      )}

      {/* Secure checkout signals */}
      <div className="pt-3 border-t border-[--color-border]">
        <ul className="space-y-1.5 text-xs text-[--color-text-muted]">
          {[
            "Secure checkout — SSL encrypted",
            "Custom-made to your specs",
            "Free shipping on orders over $2,000",
          ].map((txt) => (
            <li key={txt} className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {txt}
            </li>
          ))}
        </ul>
      </div>

      {v && <DeliveryEstimate variantIds={[v._id]} />}
    </div>
  );
}
