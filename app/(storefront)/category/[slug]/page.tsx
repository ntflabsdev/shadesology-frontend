import { getCategoryPage, t } from "@/lib/api";
import { CompareProductGrid } from "@/components/catalog/CompareProductGrid";
import { FilterPanel } from "@/components/catalog/FilterPanel";
import Link from "next/link";
import type { Metadata } from "next";
import { PaymentCalculator } from "@/components/financing/PaymentCalculator";
import { getRequestLocale } from "@/i18n/server";
import { hasFieldTranslation, metadataAlternates } from "@/i18n/messages";
import { DEFAULT_LOCALE, LOCALE_TAGS } from "@/i18n/config";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string>>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  try {
    const locale = await getRequestLocale();
    const { slug } = await params;
    const sp = await searchParams;
    const data = await getCategoryPage(slug, sp as Record<string, string>);
    const cat = data.category;
    const metadataFields = [cat.metaTitle, cat.metaDescription, cat.name, cat.description];
    const translatedLocales = (["es", "de", "it", "fr", "pt"] as const)
      .filter((candidate) => metadataFields.some((field) => hasFieldTranslation(field, candidate)));
    const metadataLocale = translatedLocales.some((candidate) => candidate === locale) ? locale : DEFAULT_LOCALE;
    return {
      title: cat.metaTitle ? t(cat.metaTitle, locale) : `${t(cat.name, locale)} | Shadesology`,
      description: cat.metaDescription ? t(cat.metaDescription, locale) : t(cat.description, locale),
      alternates: metadataAlternates(`/category/${slug}`, locale, translatedLocales),
      openGraph: { locale: LOCALE_TAGS[metadataLocale].replace("-", "_") },
      robots: data.seo.noindex ? "noindex,follow" : undefined,
    };
  } catch {
    return { title: "Category | Shadesology" };
  }
}

export const revalidate = 300;

function Pagination({
  page,
  pages,
  slug,
  searchParams,
}: {
  page: number;
  pages: number;
  slug: string;
  searchParams: Record<string, string>;
}) {
  if (pages <= 1) return null;

  function buildHref(p: number) {
    const params = new URLSearchParams({ ...searchParams, page: String(p) });
    return `/category/${slug}?${params}`;
  }

  const pageNums: (number | "...")[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || (i >= page - 1 && i <= page + 1)) {
      pageNums.push(i);
    } else if (pageNums[pageNums.length - 1] !== "...") {
      pageNums.push("...");
    }
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-10">
      {page > 1 && (
        <Link href={buildHref(page - 1)} className="px-3 py-1.5 rounded border border-[--color-border] text-sm hover:bg-[--color-neutral-50] transition-colors" aria-label="Previous page">
          ←
        </Link>
      )}
      {pageNums.map((n, i) =>
        n === "..." ? (
          <span key={i} className="px-2 text-[--color-text-muted]">…</span>
        ) : (
          <Link
            key={n}
            href={buildHref(n as number)}
            aria-current={n === page ? "page" : undefined}
            className={`px-3 py-1.5 rounded border text-sm transition-colors ${
              n === page
                ? "bg-[--color-brand-primary] text-white border-[--color-brand-primary]"
                : "border-[--color-border] hover:bg-[--color-neutral-50]"
            }`}
          >
            {n}
          </Link>
        )
      )}
      {page < pages && (
        <Link href={buildHref(page + 1)} className="px-3 py-1.5 rounded border border-[--color-border] text-sm hover:bg-[--color-neutral-50] transition-colors" aria-label="Next page">
          →
        </Link>
      )}
    </nav>
  );
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const sp = await searchParams;

  let data;
  try {
    data = await getCategoryPage(slug, sp as Record<string, string>);
  } catch {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Category not found</h1>
        <Link href="/products" className="text-[--color-brand-primary] hover:underline">Browse all products</Link>
      </div>
    );
  }

  const { category, content, products, activeFilters, sort, seo, pagination } = data;
  const visiblePriceFrom = products
    .map((product) => product.showPrice !== false ? product.priceFrom : null)
    .filter((price): price is number => typeof price === "number" && price > 0);
  const representativeAmount = visiblePriceFrom.length ? Math.min(...visiblePriceFrom) : 0;

  // Normalise facets: strip any extra Mongoose fields and ensure labels are
  // plain objects (not class instances) so the client boundary serialises cleanly.
  const facets = data.facets.map((f) => ({
    key:         f.key,
    label:       f.label,
    type:        f.type,
    displayType: f.displayType,
    unit:        f.unit,
    options:     (f.options ?? []).map((o) => ({
      value: o.value,
      label: o.label,
      ...(o.count !== undefined ? { count: o.count } : {}),
    })),
  }));

  return (
    <>
      {/* SEO: inject canonical + noindex when needed */}
      {seo.noindex && (
        <meta name="robots" content="noindex,follow" />
      )}

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="bg-[--color-neutral-50] border-b border-[--color-border]">
        <ol className="container py-3 flex items-center gap-2 text-sm text-[--color-text-muted]">
          <li><Link href="/" className="hover:text-[--color-brand-primary] transition-colors">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/products" className="hover:text-[--color-brand-primary] transition-colors">Products</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-[--color-text-primary] font-medium" aria-current="page">{t(category.name, locale)}</li>
        </ol>
      </nav>

      {/* Category header */}
      <header className="bg-white border-b border-[--color-border] py-10">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold text-[--color-text-primary] mb-2">{t(category.name, locale)}</h1>
          {category.description && (
            <p className="text-lg text-[--color-text-muted] max-w-2xl">{t(category.description, locale)}</p>
          )}
        </div>
      </header>

      {/* Intro content above grid */}
      {content?.introContent && (
        <section className="section-sm bg-[--color-surface-alt] border-b border-[--color-border]">
          <div className="container">
            {content.introHeading && (
              <h2 className="text-2xl font-bold mb-4">{t(content.introHeading, locale)}</h2>
            )}
            <div className="prose max-w-3xl text-[--color-text-muted]">
              <p>{t(content.introContent, locale)}</p>
            </div>
          </div>
        </section>
      )}

      {/* Main grid + filters */}
      <div className="container py-10">
        {representativeAmount > 0 && (
          <div className="mb-6 max-w-xl">
            <PaymentCalculator amount={representativeAmount} title="Estimate monthly payments" compact />
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar filters */}
          {facets.length > 0 && (
            <div className="w-full lg:w-64 shrink-0">
              <FilterPanel
                facets={facets}
                activeFilters={activeFilters}
                sort={sort}
                totalProducts={pagination.total}
              />
            </div>
          )}

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {/* Sort row when no sidebar */}
            {facets.length === 0 && (
              <FilterPanel
                facets={[]}
                activeFilters={{}}
                sort={sort}
                totalProducts={pagination.total}
              />
            )}

            {products.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-[--color-text-muted] mb-4">No products match your filters.</p>
                <Link href={`/category/${slug}`} className="text-[--color-brand-primary] hover:underline font-semibold">Clear filters</Link>
              </div>
            ) : (
              <CompareProductGrid
                products={products}
                label={`${t(category.name, locale)} products`}
              />
            )}

            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              slug={slug}
              searchParams={sp as Record<string, string>}
            />
          </div>
        </div>
      </div>

      {/* Outro SEO copy below grid */}
      {content?.outroContent && (
        <section className="section-sm bg-[--color-surface-alt] border-t border-[--color-border]">
          <div className="container">
            {content.outroHeading && (
              <h2 className="text-2xl font-bold mb-4">{t(content.outroHeading, locale)}</h2>
            )}
            <div className="prose max-w-3xl text-[--color-text-muted]">
              <p>{t(content.outroContent, locale)}</p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
