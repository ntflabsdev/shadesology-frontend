"use client";

import React, { useEffect, useState } from "react";
import { ProductDetail, Variant, t } from "@/lib/api";
import { MediaGallery } from "./MediaGallery";
import { VariantSelector } from "./VariantSelector";
import { PurchasePanel } from "./PurchasePanel";
import { useLocaleSettings } from "@/components/i18n/LocaleProvider";
import { DisplayPrice } from "@/components/i18n/DisplayPrice";
import { trackConversion } from "@/lib/conversion";

interface Props {
  data: ProductDetail;
}

export function ProductPageClient({ data }: Props) {
  const { locale } = useLocaleSettings();
  const { product, variants, moduleVisibility, content, faqs, manuals } = data;

  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0] ?? null;
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?._id ?? "");

  const selectedVariant: Variant | null =
    variants.find((v) => v._id === selectedVariantId) ?? defaultVariant;

  useEffect(() => {
    if (!product._id || !selectedVariant) return;
    trackConversion("view_item", {
      currency: "USD",
      value: selectedVariant.displayPrice ?? 0,
      items: [{
        item_id: product._id,
        item_name: t(product.name, locale),
        item_variant: typeof selectedVariant.name === "string" ? selectedVariant.name : t(selectedVariant.name, locale),
        price: selectedVariant.displayPrice ?? 0,
        quantity: 1,
      }],
    });
  }, [locale, product._id, product.name, selectedVariant]);

  const images = (product.images ?? [])
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((img) => ({ url: img.url, alt: t(img.alt, locale) || t(product.name, locale), type: img.type }));

  return (
    <div>
      {/* Two-column PDP layout */}
      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Media */}
          <div>
            <MediaGallery
              images={images}
              videoUrl={product.videoUrl}
              productName={t(product.name, locale)}
            />
          </div>

          {/* Right: Details + purchase */}
          <div className="space-y-6">
            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-[--color-text-primary]">
              {t(product.name, locale)}
            </h1>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-lg text-[--color-text-muted] leading-relaxed">
                {t(product.shortDescription, locale)}
              </p>
            )}

            {/* Key features */}
            {product.features && product.features.length > 0 && (
              <ul className="space-y-1.5" aria-label="Key features">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[--color-text-primary]">
                    <svg className="h-4 w-4 text-[--color-brand-accent] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t(f.text, locale)}
                  </li>
                ))}
              </ul>
            )}

            {/* Variant selector */}
            <VariantSelector
              variants={variants}
              selectedId={selectedVariantId}
              onSelect={setSelectedVariantId}
            />

            {/* Purchase panel */}
            <PurchasePanel
              selectedVariant={selectedVariant}
              productName={t(product.name, locale)}
              productSlug={product.slug}
              productId={product._id}
              showPrice={product.showPrice !== false}
            />
          </div>
        </div>
      </div>

      {/* ── Content modules ── */}
      <div className="border-t border-[--color-border]">
        {/* Full description */}
        {product.description && (
          <section className="section border-b border-[--color-border]" aria-labelledby="description-heading">
            <div className="container max-w-3xl">
              <h2 id="description-heading" className="text-2xl font-bold mb-4">Overview</h2>
              <div className="prose text-[--color-text-muted]">
                <p>{t(product.description, locale)}</p>
                {content?.productIntro && <p className="mt-3">{content.productIntro}</p>}
              </div>
            </div>
          </section>
        )}

        {/* Specifications table */}
        {moduleVisibility.specifications && selectedVariant && (
          <section className="section border-b border-[--color-border]" aria-labelledby="specs-heading">
            <div className="container">
              <h2 id="specs-heading" className="text-2xl font-bold mb-6">Specifications</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse" aria-label="Product specifications">
                  <tbody>
                    {(
                      [
                        selectedVariant.widthMin ? ["Width Range", `${selectedVariant.widthMin}–${selectedVariant.widthMax ?? ""}"`] : null,
                        selectedVariant.projectionMin ? ["Projection Range", `${selectedVariant.projectionMin}–${selectedVariant.projectionMax ?? ""}"`] : null,
                        selectedVariant.leadTimeDays ? ["Lead Time", `${selectedVariant.leadTimeDays} days`] : null,
                        selectedVariant.availability ? ["Availability", selectedVariant.availability.replace(/_/g, " ")] : null,
                        selectedVariant.sku ? ["SKU", selectedVariant.sku] : null,
                      ] as ([string, string] | null)[]
                    ).filter((r): r is [string, string] => r !== null).map(([label, value], i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-[--color-neutral-50]" : "bg-white"}>
                        <td className="py-2.5 px-4 font-medium text-[--color-text-primary] w-1/3">{label}</td>
                        <td className="py-2.5 px-4 text-[--color-text-muted]">{value}</td>
                      </tr>
                    ))}
                    {content?.specNotes && (
                      <tr className="bg-[--color-neutral-50]">
                        <td className="py-2.5 px-4 font-medium text-[--color-text-primary] w-1/3">Notes</td>
                        <td className="py-2.5 px-4 text-[--color-text-muted]">{content.specNotes}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Operation & Motorization */}
        {moduleVisibility.operation_motorization && content?.operationOverview && (
          <section className="section border-b border-[--color-border]" aria-labelledby="operation-heading">
            <div className="container max-w-3xl">
              <h2 id="operation-heading" className="text-2xl font-bold mb-4">Operation & Motorization</h2>
              <p className="text-[--color-text-muted]">{content.operationOverview}</p>
              {content.motorBrands && content.motorBrands.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Motor Brands:</p>
                  <div className="flex flex-wrap gap-2">
                    {content.motorBrands.map((b) => (
                      <span key={b} className="bg-[--color-neutral-100] text-[--color-text-muted] px-2.5 py-0.5 rounded-full text-xs font-medium">{b}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Frame features */}
        {moduleVisibility.frame_features && content?.frameOverview && (
          <section className="section border-b border-[--color-border]" aria-labelledby="frame-heading">
            <div className="container max-w-3xl">
              <h2 id="frame-heading" className="text-2xl font-bold mb-4">Frame Features</h2>
              <p className="text-[--color-text-muted] mb-4">{content.frameOverview}</p>
              {content.frameFeatures && content.frameFeatures.length > 0 && (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {content.frameFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[--color-text-primary]">
                      <svg className="h-4 w-4 text-[--color-brand-accent] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {/* Fabric & Valance */}
        {moduleVisibility.fabric_valance_thread && product.fabrics && product.fabrics.length > 0 && (
          <section className="section border-b border-[--color-border]" aria-labelledby="fabric-heading">
            <div className="container">
              <h2 id="fabric-heading" className="text-2xl font-bold mb-6">Fabric Options</h2>
              {content?.fabricOverview && <p className="text-[--color-text-muted] mb-6">{content.fabricOverview}</p>}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {product.fabrics.map((fabric) => (
                  <div key={fabric._id} className="rounded-xl border border-[--color-border] p-4 text-center hover:border-[--color-brand-primary] transition-colors">
                    {fabric.images?.[0] && (
                      <img src={fabric.images[0].url} alt={t(fabric.name, locale)} className="w-full h-20 object-cover rounded-lg mb-2" />
                    )}
                    <p className="text-sm font-semibold">{t(fabric.name, locale)}</p>
                    {fabric.brand && <p className="text-xs text-[--color-text-muted]">{fabric.brand}</p>}
                    {fabric.warrantyYears && <p className="text-xs text-[--color-text-muted] mt-1">{fabric.warrantyYears}yr warranty</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Color options */}
        {product.colors && product.colors.length > 0 && (
          <section className="section border-b border-[--color-border]" aria-labelledby="colors-heading">
            <div className="container">
              <h2 id="colors-heading" className="text-2xl font-bold mb-6">Frame Colors</h2>
              <div className="flex flex-wrap gap-3" role="list" aria-label="Available colors">
                {product.colors.map((color) => (
                  <div
                    key={color._id}
                    role="listitem"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[--color-border] hover:border-[--color-brand-primary] transition-colors"
                    title={color.code ? `${t(color.name, locale)} (${color.code})` : t(color.name, locale)}
                  >
                    {color.hexValue && (
                      <span
                        className="w-5 h-5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: color.hexValue }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="text-sm">{t(color.name, locale)}</span>
                    {color.hasSurcharge && (
                      <span className="text-xs text-[--color-brand-accent] font-medium">+ surcharge</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Heat sealing */}
        {moduleVisibility.heat_sealing && content?.heatSealingDescription && (
          <section className="section border-b border-[--color-border]" aria-labelledby="heat-sealing-heading">
            <div className="container max-w-3xl">
              <h2 id="heat-sealing-heading" className="text-2xl font-bold mb-4">Heat Sealing</h2>
              <p className="text-[--color-text-muted]">{content.heatSealingDescription}</p>
              {content.heatSealingImageUrl && (
                <img src={content.heatSealingImageUrl} alt="Heat sealing illustration" className="mt-4 rounded-xl max-w-sm" />
              )}
            </div>
          </section>
        )}

        {/* Installation types */}
        {moduleVisibility.installation_types && content?.installationTypes && content.installationTypes.length > 0 && (
          <section className="section border-b border-[--color-border]" aria-labelledby="installation-heading">
            <div className="container max-w-3xl">
              <h2 id="installation-heading" className="text-2xl font-bold mb-4">Installation Types</h2>
              <div className="flex flex-wrap gap-2">
                {content.installationTypes.map((inst) => (
                  <span key={inst} className="px-3 py-1.5 rounded-lg bg-[--color-neutral-100] text-sm font-medium text-[--color-text-primary] capitalize">
                    {inst.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Accessories */}
        {moduleVisibility.accessories && product.accessories && product.accessories.length > 0 && (
          <section className="section border-b border-[--color-border]" aria-labelledby="accessories-heading">
            <div className="container">
              <h2 id="accessories-heading" className="text-2xl font-bold mb-6">Accessories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {product.accessories.map((acc) => (
                  <a
                    key={acc._id}
                    href={`/products/${acc.slug}`}
                    className="group rounded-xl border border-[--color-border] p-4 hover:border-[--color-brand-primary] hover:shadow-sm transition-all"
                  >
                    {acc.images?.[0] && (
                      <img src={acc.images[0].url} alt={t(acc.name, locale)} className="w-full h-20 object-cover rounded-lg mb-2" />
                    )}
                    <p className="text-sm font-semibold group-hover:text-[--color-brand-primary] transition-colors">{t(acc.name, locale)}</p>
                    {acc.basePrice && (
                      <p className="text-xs text-[--color-text-muted] mt-0.5">From <DisplayPrice amount={acc.basePrice} /></p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Manuals & Downloads */}
        {moduleVisibility.manuals && manuals && manuals.length > 0 && (
          <section className="section border-b border-[--color-border]" aria-labelledby="manuals-heading">
            <div className="container max-w-3xl">
              <h2 id="manuals-heading" className="text-2xl font-bold mb-6">Downloads & Manuals</h2>
              <ul className="divide-y divide-[--color-border]">
                {manuals.map((doc) => (
                  <li key={doc._id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold">{t(doc.title, locale)}</p>
                      <p className="text-xs text-[--color-text-muted] capitalize">{doc.type.replace(/_/g, " ")} {doc.currentVersion ? `· v${doc.currentVersion}` : ""}</p>
                    </div>
                    {doc.gating === "open" ? (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-[--color-brand-primary] hover:underline flex items-center gap-1"
                        aria-label={`Download ${t(doc.title, locale)}`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a>
                    ) : (
                      <a
                        href={`/downloads/${doc._id}`}
                        className="text-sm font-semibold text-[--color-text-muted] hover:text-[--color-brand-primary] flex items-center gap-1"
                        aria-label={`Request access to ${t(doc.title, locale)}`}
                      >
                        🔒 Request Access
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Warranty */}
        {moduleVisibility.warranty && content?.warrantyOverview && (
          <section className="section border-b border-[--color-border]" aria-labelledby="warranty-heading">
            <div className="container max-w-3xl">
              <h2 id="warranty-heading" className="text-2xl font-bold mb-4">Warranty</h2>
              <p className="text-[--color-text-muted] mb-4">{content.warrantyOverview}</p>
              {content.warrantyTiers && content.warrantyTiers.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {content.warrantyTiers.map((tier, i) => (
                    <div key={i} className="rounded-xl bg-[--color-neutral-50] border border-[--color-border] p-4 text-center">
                      <p className="text-2xl font-bold text-[--color-brand-primary]">{tier.years} yr</p>
                      <p className="text-sm font-semibold mt-1">{tier.label}</p>
                      {tier.notes && <p className="text-xs text-[--color-text-muted] mt-1">{tier.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* FAQ */}
        {moduleVisibility.faq && faqs && faqs.length > 0 && (
          <section className="section border-b border-[--color-border]" aria-labelledby="faq-heading">
            <div className="container max-w-3xl">
              <h2 id="faq-heading" className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <dl className="space-y-4">
                {faqs.map((faq) => (
                  <details key={faq._id} className="group rounded-xl border border-[--color-border] overflow-hidden">
                    <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-[--color-text-primary] hover:bg-[--color-neutral-50] transition-colors list-none">
                      <dt>{t(faq.question, locale)}</dt>
                      <svg className="h-4 w-4 text-[--color-text-muted] group-open:rotate-180 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <dd className="px-4 pb-4 text-sm text-[--color-text-muted] leading-relaxed border-t border-[--color-border] pt-3">
                      {t(faq.answer, locale)}
                    </dd>
                  </details>
                ))}
              </dl>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
