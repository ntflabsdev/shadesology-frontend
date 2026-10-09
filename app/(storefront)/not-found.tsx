import { getNotFoundCategories, t } from "@/lib/api";
import Link from "next/link";
import type { Metadata } from "next";
import { getRequestLocale } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: "noindex",
};

export default async function NotFoundPage() {
  const locale = await getRequestLocale();
  const categories = await getNotFoundCategories().catch(() => []);

  return (
    <div className="container py-20 text-center">
      <div className="max-w-2xl mx-auto">
        <p className="text-[--color-brand-accent] text-lg font-semibold mb-2">404 — Page Not Found</p>
        <h1 className="text-4xl font-bold text-[--color-text-primary] mb-4">
          We couldn't find that page
        </h1>
        <p className="text-[--color-text-muted] mb-8">
          The page you're looking for may have moved or no longer exists. Try searching or browsing our categories.
        </p>

        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          <Link href="/" className="px-6 py-2.5 rounded-xl bg-[--color-brand-primary] text-white font-semibold hover:bg-[--color-brand-primary-light] transition-colors">
            Go Home
          </Link>
          <Link href="/products" className="px-6 py-2.5 rounded-xl border-2 border-[--color-brand-primary] text-[--color-brand-primary] font-semibold hover:bg-[--color-brand-primary] hover:text-white transition-colors">
            Browse Products
          </Link>
        </div>

        {categories.length > 0 && (
          <section aria-labelledby="categories-404-heading">
            <h2 id="categories-404-heading" className="text-lg font-semibold mb-4">Browse Categories</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/category/${cat.slug}`}
                  className="px-4 py-2 rounded-full border border-[--color-border] text-sm hover:border-[--color-brand-primary] hover:text-[--color-brand-primary] transition-colors"
                >
                  {t(cat.name, locale)}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
