import { getProduct, t } from "@/lib/api";
import { ProductPageClient } from "@/components/product/ProductPageClient";
import { ProductCard } from "@/components/ui/ProductCard";
import Link from "next/link";
import type { Metadata } from "next";
import Script from "next/script";
import { getRequestLocale } from "@/i18n/server";
import { formatDate } from "@/i18n/format";
import { hasFieldTranslation, metadataAlternates } from "@/i18n/messages";
import { DEFAULT_LOCALE, LOCALE_TAGS } from "@/i18n/config";
import { ProductShareBar } from "@/components/product/ProductShareBar";
import { VideoPlayer } from "@/components/media/VideoPlayer";
import { getHostedVideoEmbedUrl } from "@/lib/video";

interface Props {
  params: Promise<{ slug: string }>;
}

const SITE_URL = "https://shadesology.com";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const locale = await getRequestLocale();
    const data = await getProduct(slug);
    const p = data.product;
    const metadataFields = [p.metaTitle, p.metaDescription, p.name, p.shortDescription];
    const translatedLocales = (["es", "de", "it", "fr", "pt"] as const)
      .filter((candidate) => metadataFields.some((field) => hasFieldTranslation(field, candidate)));
    const metadataLocale = translatedLocales.some((candidate) => candidate === locale) ? locale : DEFAULT_LOCALE;
    return {
      title: p.metaTitle ? t(p.metaTitle, locale) : `${t(p.name, locale)} | Shadesology`,
      description: p.metaDescription ? t(p.metaDescription, locale) : t(p.shortDescription, locale),
      alternates: metadataAlternates(`/products/${slug}`, locale, translatedLocales),
      openGraph: {
        locale: LOCALE_TAGS[metadataLocale].replace("-", "_"),
        title: p.metaTitle ? t(p.metaTitle, locale) : t(p.name, locale),
        description: p.metaDescription ? t(p.metaDescription, locale) : t(p.shortDescription, locale) ?? "",
        images: p.images?.[0] ? [{ url: p.images[0].url, alt: t(p.images[0].alt, locale) }] : undefined,
      },
    };
  } catch {
    return { title: "Product | Shadesology" };
  }
}

export const revalidate = 300;

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  let data;
  try {
    data = await getProduct(slug);
  } catch {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link href="/products" className="text-[--color-brand-primary] hover:underline">Browse all products</Link>
      </div>
    );
  }

  const { product, breadcrumbs, relatedProducts, reviews, jsonLd } = data;
  const localizedProductJsonLd = {
    ...jsonLd.product,
    name: t(product.name, locale),
    description: t(product.shortDescription, locale),
  };
  const videoThumbnail = product.images?.find((image) => image.type === "video_thumbnail")?.url;
  const videoJsonLd = product.videoUrl && videoThumbnail
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: t(product.name, locale),
        description: t(product.shortDescription, locale),
        thumbnailUrl: [videoThumbnail],
        contentUrl: product.videoUrl,
        publisher: { "@id": `${SITE_URL}/#organization` },
      }
    : null;
  const libraryVideoJsonLd = (product.videos || [])
    .filter((video) => video.thumbnail?.url && getHostedVideoEmbedUrl(video.videoUrl))
    .map((video) => ({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: t(video.title, locale) || t(product.name, locale),
      description: t(video.description, locale) || t(product.shortDescription, locale),
      thumbnailUrl: [video.thumbnail?.url],
      embedUrl: getHostedVideoEmbedUrl(video.videoUrl),
      uploadDate: video.createdAt,
      publisher: { "@id": `${SITE_URL}/#organization` },
    }));

  return (
    <>
      {/* JSON-LD structured data */}
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localizedProductJsonLd) }}
      />
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.breadcrumb) }}
      />
      {videoJsonLd && (
        <Script
          id="product-video-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      {libraryVideoJsonLd.map((item, index) => (
        <Script
          key={`${product.slug}-video-${index}`}
          id={`product-library-video-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }}
        />
      ))}

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="bg-[--color-neutral-50] border-b border-[--color-border]">
        <ol className="container py-3 flex items-center flex-wrap gap-2 text-sm text-[--color-text-muted]">
          {breadcrumbs.map((crumb, i) => (
            <li key={i} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {crumb.url ? (
                <Link href={crumb.url} className="hover:text-[--color-brand-primary] transition-colors">{crumb.name}</Link>
              ) : (
                <span className="text-[--color-text-primary] font-medium" aria-current="page">{crumb.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Product page content */}
      <ProductPageClient data={data} />
      {product.videos?.length ? (
        <section className="section border-t border-[--color-border]" aria-labelledby="product-videos-heading">
          <div className="container max-w-4xl">
            <h2 id="product-videos-heading" className="mb-6 text-2xl font-bold">Product videos</h2>
            <div className="space-y-8">
              {product.videos.map((video) => (
                <article key={video._id}>
                  <h3 className="mb-3 text-lg font-semibold">{t(video.title, locale) || t(product.name, locale)}</h3>
                  <VideoPlayer video={video} title={t(video.title, locale) || t(product.name, locale)} />
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <div className="container pb-8">
        <ProductShareBar
          title={t(product.name, locale)}
          url={`${SITE_URL}/products/${encodeURIComponent(slug)}`}
          imageUrl={product.images?.[0]?.url}
        />
      </div>

      {/* Reviews section */}
      {reviews.summary.count > 0 && (
        <section className="section border-t border-[--color-border]" aria-labelledby="reviews-heading">
          <div className="container max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <h2 id="reviews-heading" className="text-2xl font-bold">Customer Reviews</h2>
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-400 text-lg" aria-label={`${reviews.summary.averageRating} out of 5 stars`}>
                  {"★".repeat(Math.round(reviews.summary.averageRating ?? 0))}
                  {"☆".repeat(5 - Math.round(reviews.summary.averageRating ?? 0))}
                </span>
                <span className="text-sm text-[--color-text-muted]">
                  {reviews.summary.averageRating?.toFixed(1)} ({reviews.summary.count} reviews)
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.recent.map((review) => (
                <article key={review._id} className="rounded-xl border border-[--color-border] p-5">
                  <header className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">{review.displayName}</p>
                      <p className="text-xs text-[--color-text-muted]">
                        {formatDate(review.createdAt, locale)}
                        {review.isVerifiedPurchase && " · ✓ Verified Purchase"}
                      </p>
                    </div>
                    <span className="text-yellow-400" aria-label={`${review.rating} out of 5`}>
                      {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </span>
                  </header>
                  <p className="text-sm text-[--color-text-muted]">{review.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="section bg-[--color-surface-alt] border-t border-[--color-border]" aria-labelledby="related-heading">
          <div className="container">
            <h2 id="related-heading" className="text-2xl font-bold mb-6">You May Also Like</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="list">
              {relatedProducts.map((p) => (
                <li key={p._id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
