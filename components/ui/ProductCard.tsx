"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductCard as PC, t } from "@/lib/api";
import { DisplayPrice } from "@/components/i18n/DisplayPrice";
import { useLocaleSettings } from "@/components/i18n/LocaleProvider";
import { isWishlisted, toggleWishlistItem } from "@/lib/advancedEcommerce";

interface Props {
  product: PC;
  showCompare?: boolean;
  onCompare?: (id: string) => void;
  isInCompare?: boolean;
}

const PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

export function ProductCard({ product, showCompare, onCompare, isInCompare }: Props) {
  const { locale } = useLocaleSettings();
  const image = product.images?.find((i) => i.type === "photo") ?? product.images?.[0];
  const imgSrc = image?.url || PLACEHOLDER;
  const imgAlt = image ? t(image.alt, locale) || t(product.name, locale) : t(product.name, locale);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isWishlisted(product.slug));
  }, [product.slug]);

  function handleWishlistToggle() {
    const next = toggleWishlistItem(product.slug, t(product.name, locale));
    setSaved(next.some((item) => item.slug === product.slug));
  }

  return (
    <article className="group bg-white rounded-xl overflow-hidden shadow-sm border border-[--color-border] hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className="relative">
        <Link href={`/products/${product.slug}`} className="block aspect-product bg-[--color-neutral-100] overflow-hidden relative" tabIndex={0}>
          <Image
            src={imgSrc}
            alt={imgAlt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={imgSrc.startsWith("data:")}
          />
          {product.isNewArrival && (
            <span className="absolute top-2 left-2 bg-[--color-brand-accent] text-[--color-neutral-900] text-xs font-bold px-2 py-0.5 rounded-full">
              New
            </span>
          )}
          {product.isFeatured && (
            <span className="absolute top-2 right-2 bg-[--color-brand-primary] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={saved ? `Remove ${t(product.name, locale)} from wishlist` : `Save ${t(product.name, locale)} to wishlist`}
          className={`absolute right-3 top-3 rounded-full border px-2.5 py-1.5 text-xs font-semibold shadow-sm transition-colors ${
            saved
              ? "border-[--color-brand-primary] bg-[--color-brand-primary] text-white"
              : "border-[--color-border] bg-white/90 text-[--color-text-primary] hover:border-[--color-brand-primary] hover:text-[--color-brand-primary]"
          }`}
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        {product.productType && (
          <p className="text-xs text-[--color-text-muted] uppercase tracking-wide mb-1">
            {t(product.productType.name, locale)}
          </p>
        )}
        <h3 className="font-semibold text-[--color-text-primary] line-clamp-2 mb-1">
          <Link
            href={`/products/${product.slug}`}
            className="hover:text-[--color-brand-primary] transition-colors"
          >
            {t(product.name, locale)}
          </Link>
        </h3>

        {product.shortDescription && (
          <p className="text-sm text-[--color-text-muted] line-clamp-2 mb-3">
            {t(product.shortDescription, locale)}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto gap-2">
          {/* Price */}
          <div>
            {product.showPrice === false ? (
              <span className="text-sm text-[--color-text-muted] italic">Request Quote</span>
            ) : product.priceFrom ? (
              <span className="font-semibold text-[--color-text-primary]">
                From <DisplayPrice amount={product.priceFrom} />
              </span>
            ) : null}
          </div>

          {/* Compare checkbox */}
          {showCompare && onCompare && (
            <label className="flex items-center gap-1.5 text-xs text-[--color-text-muted] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isInCompare}
                onChange={() => onCompare(product.slug)}
                className="rounded border-[--color-border] text-[--color-brand-primary] focus:ring-[--color-brand-accent]"
                aria-label={`Compare ${t(product.name, locale)}`}
              />
              Compare
            </label>
          )}
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="mt-3 block w-full text-center text-sm font-semibold py-2 rounded-lg border border-[--color-brand-primary] text-[--color-brand-primary] hover:bg-[--color-brand-primary] hover:text-white transition-colors"
          aria-label={`View details for ${t(product.name, locale)}`}
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
