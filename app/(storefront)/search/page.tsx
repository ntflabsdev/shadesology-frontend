import { search, t } from "@/lib/api";
import { ProductCard } from "@/components/ui/ProductCard";
import Link from "next/link";
import type { Metadata } from "next";
import { getRequestLocale } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Search Results",
  robots: "noindex",
};

interface Props {
  searchParams: Promise<{ q?: string; page?: string; type?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, page: pageParam } = await searchParams;
  const locale = await getRequestLocale();
  const query = q?.trim() ?? "";
  const page = pageParam ?? "1";

  if (!query) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Search Shadesology</h1>
        <p className="text-[--color-text-muted]">Enter a search term in the search bar above.</p>
      </div>
    );
  }

  let results;
  try {
    results = await search(query, { page });
  } catch {
    results = null;
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">
        Search results for &quot;<span className="text-[--color-brand-primary]">{query}</span>&quot;
      </h1>

      {results ? (
        <>
          <p className="text-[--color-text-muted] mb-8">
            {results.pagination.total} result{results.pagination.total !== 1 ? "s" : ""} found
          </p>

          {/* Products */}
          {results.products.length > 0 && (
            <section className="mb-12" aria-labelledby="search-products-heading">
              <h2 id="search-products-heading" className="text-xl font-bold mb-5">
                Products ({results.totals.products})
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                {results.products.map((p) => (
                  <li key={p._id}>
                    <ProductCard product={p} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Categories */}
          {results.categories.length > 0 && (
            <section className="mb-12" aria-labelledby="search-categories-heading">
              <h2 id="search-categories-heading" className="text-xl font-bold mb-5">
                Categories ({results.totals.categories})
              </h2>
              <div className="flex flex-wrap gap-3">
                {results.categories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/category/${cat.slug}`}
                    className="px-4 py-2 rounded-full border-2 border-[--color-border] text-sm font-medium hover:border-[--color-brand-primary] hover:text-[--color-brand-primary] transition-colors"
                  >
                    {t(cat.name, locale)}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Content */}
          {results.content.length > 0 && (
            <section className="mb-12" aria-labelledby="search-content-heading">
              <h2 id="search-content-heading" className="text-xl font-bold mb-5">
                Content ({results.totals.content})
              </h2>
              <ul className="space-y-3">
                {results.content.map((item) => (
                  <li key={item._id}>
                    <Link
                      href={`/${item.slug}`}
                      className="block rounded-xl border border-[--color-border] p-4 hover:border-[--color-brand-primary] hover:shadow-sm transition-all"
                    >
                      <p className="font-semibold text-[--color-text-primary]">{t(item.title, locale)}</p>
                      <p className="text-xs text-[--color-text-muted] mt-0.5 capitalize">{item.type}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* No results at all */}
          {results.products.length === 0 && results.categories.length === 0 && results.content.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-lg text-[--color-text-muted] mb-6">No results found for &quot;{query}&quot;</p>
              <p className="text-sm text-[--color-text-muted] mb-8">Try different keywords or browse our categories.</p>
              <Link href="/products" className="px-6 py-3 rounded-xl bg-[--color-brand-primary] text-white font-semibold hover:bg-[--color-brand-primary-light] transition-colors">
                Browse All Products
              </Link>
            </div>
          )}
        </>
      ) : (
        <p className="text-[--color-text-muted] py-20 text-center">Search unavailable. Please try again later.</p>
      )}
    </div>
  );
}
