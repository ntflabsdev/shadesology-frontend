import { listProducts, getCategories, t } from "@/lib/api";
import { ProductCard } from "@/components/ui/ProductCard";
import Link from "next/link";
import type { Metadata } from "next";
import { getRequestLocale } from "@/i18n/server";

export const metadata: Metadata = {
  title: "All Products | Shadesology",
  description:
    "Browse all custom shade products — retractable awnings, pergolas, louvered roofs, shade sails, screens, blinds, umbrellas, pool covers and tensile structures.",
};

export const revalidate = 300;

interface Props {
  searchParams: Promise<{ sort?: string; page?: string; category?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const locale = await getRequestLocale();
  const paramsFromUrl = await searchParams;
  const params: Record<string, string> = {};
  if (paramsFromUrl.sort) params.sort = paramsFromUrl.sort;
  if (paramsFromUrl.page) params.page = paramsFromUrl.page;
  if (paramsFromUrl.category) params.category = paramsFromUrl.category;

  const [{ products, pagination }, categories] = await Promise.all([
    listProducts(params).catch(() => ({
      products: [],
      pagination: { page: 1, limit: 24, total: 0, pages: 0 },
    })),
    getCategories().catch(() => []),
  ]);

  const SORT_OPTIONS = [
    { value: "sortOrder", label: "Featured" },
    { value: "newest", label: "Newest" },
    { value: "name_asc", label: "Name: A–Z" },
    { value: "popular", label: "Most Popular" },
  ];

  return (
    <>
      {/* Page header */}
      <header className="bg-[--color-brand-primary] text-white py-12">
        <div className="container">
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex items-center gap-2 text-sm text-white/70">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-white font-medium" aria-current="page">Products</li>
            </ol>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold">All Products</h1>
          <p className="text-white/80 mt-2">
            {pagination.total} premium custom shade products
          </p>
        </div>
      </header>

      <div className="container py-10">
        {/* Category filter pills */}
        {categories.length > 0 && (
          <section aria-label="Filter by category" className="mb-8">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/products"
                className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors ${
                  !paramsFromUrl.category
                    ? "bg-[--color-brand-primary] text-white border-[--color-brand-primary]"
                    : "border-[--color-border] text-[--color-text-primary] hover:border-[--color-brand-primary] hover:text-[--color-brand-primary]"
                }`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/products?category=${cat._id}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors ${
                    paramsFromUrl.category === cat._id
                      ? "bg-[--color-brand-primary] text-white border-[--color-brand-primary]"
                      : "border-[--color-border] text-[--color-text-primary] hover:border-[--color-brand-primary] hover:text-[--color-brand-primary]"
                  }`}
                >
                  {t(cat.name, locale)}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Sort row */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <p className="text-sm text-[--color-text-muted]" aria-live="polite">
            <span className="font-semibold text-[--color-text-primary]">{pagination.total}</span> products
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-[--color-text-muted]">Sort:</span>
            {SORT_OPTIONS.map((o) => (
              <Link
                key={o.value}
                href={`/products?${new URLSearchParams({ ...(paramsFromUrl.category ? { category: paramsFromUrl.category } : {}), sort: o.value })}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  (paramsFromUrl.sort ?? "sortOrder") === o.value
                    ? "bg-[--color-brand-primary] text-white border-[--color-brand-primary]"
                    : "border-[--color-border] text-[--color-text-muted] hover:border-[--color-brand-primary] hover:text-[--color-brand-primary]"
                }`}
              >
                {o.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Grid */}
        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[--color-text-muted] text-lg mb-4">No products found.</p>
            <Link href="/products" className="text-[--color-brand-primary] font-semibold hover:underline">
              Clear filters
            </Link>
          </div>
        ) : (
          <ul
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            role="list"
            aria-label="All products"
          >
            {products.map((product) => (
              <li key={product._id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-10">
            {pagination.page > 1 && (
              <Link
                href={`/products?page=${pagination.page - 1}${paramsFromUrl.sort ? `&sort=${paramsFromUrl.sort}` : ""}`}
                className="px-3 py-1.5 rounded border border-[--color-border] text-sm hover:bg-[--color-neutral-50] transition-colors"
                aria-label="Previous page"
              >
                ←
              </Link>
            )}
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={`/products?page=${n}${paramsFromUrl.sort ? `&sort=${paramsFromUrl.sort}` : ""}`}
                aria-current={n === pagination.page ? "page" : undefined}
                className={`px-3 py-1.5 rounded border text-sm transition-colors ${
                  n === pagination.page
                    ? "bg-[--color-brand-primary] text-white border-[--color-brand-primary]"
                    : "border-[--color-border] hover:bg-[--color-neutral-50]"
                }`}
              >
                {n}
              </Link>
            ))}
            {pagination.page < pagination.pages && (
              <Link
                href={`/products?page=${pagination.page + 1}${paramsFromUrl.sort ? `&sort=${paramsFromUrl.sort}` : ""}`}
                className="px-3 py-1.5 rounded border border-[--color-border] text-sm hover:bg-[--color-neutral-50] transition-colors"
                aria-label="Next page"
              >
                →
              </Link>
            )}
          </nav>
        )}
      </div>
    </>
  );
}
