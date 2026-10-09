import { getSegmentPage, t } from "@/lib/api";
import { ProductCard } from "@/components/ui/ProductCard";
import Link from "next/link";
import type { Metadata } from "next";
import { getRequestLocale } from "@/i18n/server";
import { hasFieldTranslation, metadataAlternates } from "@/i18n/messages";
import { DEFAULT_LOCALE, LOCALE_TAGS } from "@/i18n/config";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const locale = await getRequestLocale();
    const data = await getSegmentPage(slug);
    const metadataFields = [data.metaTitle, data.metaDescription, data.segment?.name, data.heroSubheadline];
    const translatedLocales = (["es", "de", "it", "fr", "pt"] as const)
      .filter((candidate) => metadataFields.some((field) => hasFieldTranslation(field, candidate)));
    const metadataLocale = translatedLocales.some((candidate) => candidate === locale) ? locale : DEFAULT_LOCALE;
    return {
      title: data.metaTitle ? t(data.metaTitle, locale) : `${t(data.segment?.name, locale)} Shade Solutions | Shadesology`,
      description: data.metaDescription ? t(data.metaDescription, locale) : t(data.heroSubheadline, locale),
      alternates: metadataAlternates(`/segments/${slug}`, locale, translatedLocales),
      openGraph: { locale: LOCALE_TAGS[metadataLocale].replace("-", "_") },
    };
  } catch {
    return { title: "Segment | Shadesology" };
  }
}

export const revalidate = 300;

export default async function SegmentPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  let data;
  try {
    data = await getSegmentPage(slug);
  } catch {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Page not found</h1>
        <Link href="/" className="text-[--color-brand-primary] hover:underline">Go home</Link>
      </div>
    );
  }

  const {
    segment,
    heroHeadline,
    heroSubheadline,
    heroImageUrl,
    heroCta,
    contentBlocks,
    featuredProducts,
    enquiryQueue,
    relatedSegments,
  } = data;

  const activeBlocks = (contentBlocks ?? []).filter((b) => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      {/* Hero */}
      <section
        className="relative bg-[--color-brand-primary] text-white py-24 overflow-hidden"
        aria-labelledby="segment-hero-heading"
        style={heroImageUrl ? { backgroundImage: `url('${heroImageUrl}')`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
      >
        {heroImageUrl && <div className="absolute inset-0 bg-[--color-brand-primary]/65" aria-hidden="true" />}
        <div className="relative container max-w-3xl text-center">
          {segment && (
            <p className="text-sm font-semibold uppercase tracking-widest text-[--color-brand-accent] mb-3">
              {segment.audience === "commercial" ? "Commercial" : "Residential"} · {t(segment.name, locale)}
            </p>
          )}
          <h1 id="segment-hero-heading" className="text-4xl md:text-5xl font-bold mb-4">
            {t(heroHeadline, locale) || (segment ? t(segment.name, locale) : "")}
          </h1>
          {heroSubheadline && (
            <p className="text-lg text-white/85 mb-8 max-w-2xl mx-auto">{t(heroSubheadline, locale)}</p>
          )}
          {heroCta && (
            <Link
              href={heroCta.url}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[--color-brand-accent] text-[--color-neutral-900] font-bold hover:bg-[--color-brand-accent-dark] transition-colors"
            >
              {t(heroCta.label, locale)}
            </Link>
          )}
        </div>
      </section>

      {/* Content blocks */}
      {activeBlocks.length > 0 && (
        <section className="section border-b border-[--color-border]">
          <div className="container max-w-3xl space-y-8">
            {activeBlocks.map((block, i) => (
              <div key={i}>
                {block.type === "rich_text" && (
                  <div className="prose max-w-none text-[--color-text-muted]">
                    <p>{t(block.content, locale)}</p>
                  </div>
                )}
                {block.type === "cta" && (
                  <div className="bg-[--color-neutral-50] rounded-2xl border border-[--color-border] p-6 text-center">
                    <p className="font-semibold mb-4">{t(block.content, locale)}</p>
                    <Link
                      href={enquiryQueue === "commercial" ? "/quote?type=commercial" : "/quote"}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[--color-brand-primary] text-white font-semibold hover:bg-[--color-brand-primary-light] transition-colors"
                    >
                      Get a Quote
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="section bg-[--color-surface-alt]" aria-labelledby="segment-products-heading">
          <div className="container">
            <h2 id="segment-products-heading" className="text-2xl font-bold mb-6">
              Recommended Products
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
              {featuredProducts.map((p) => (
                <li key={p._id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Empty state */}
      {(!featuredProducts || featuredProducts.length === 0) && (
        <section className="section bg-[--color-surface-alt]">
          <div className="container text-center py-10">
            <p className="text-[--color-text-muted] mb-4">Featured products coming soon for this segment.</p>
            <Link href="/products" className="text-[--color-brand-primary] font-semibold hover:underline">
              Browse all products →
            </Link>
          </div>
        </section>
      )}

      {/* Enquiry CTA */}
      <section className="section-sm bg-[--color-brand-primary] text-white">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-3">
            {enquiryQueue === "commercial" ? "Ready to discuss a commercial project?" : "Ready to get started?"}
          </h2>
          <p className="text-white/80 mb-6">Our team will help you find the perfect shade solution.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href={enquiryQueue === "commercial" ? "/quote?type=commercial" : "/quote"}
              className="px-7 py-3 rounded-xl bg-[--color-brand-accent] text-[--color-neutral-900] font-bold hover:bg-[--color-brand-accent-dark] transition-colors"
            >
              Request a Quote
            </Link>
            <Link
              href="/contact"
              className="px-7 py-3 rounded-xl border-2 border-white text-white font-bold hover:bg-white hover:text-[--color-brand-primary] transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Related segments */}
      {relatedSegments && relatedSegments.length > 0 && (
        <section className="section border-t border-[--color-border]" aria-labelledby="related-segments-heading">
          <div className="container">
            <h2 id="related-segments-heading" className="text-2xl font-bold mb-6">Related Applications</h2>
            <div className="flex flex-wrap gap-3">
              {relatedSegments.map((seg) => (
                <Link
                  key={seg._id}
                  href={`/segments/${seg.slug}`}
                  className="px-4 py-2 rounded-full border-2 border-[--color-border] text-sm font-medium text-[--color-text-primary] hover:border-[--color-brand-primary] hover:text-[--color-brand-primary] transition-colors"
                >
                  {t(seg.name, locale)}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
