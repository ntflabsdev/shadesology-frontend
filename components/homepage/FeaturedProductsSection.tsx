import { HomepageSection, t } from "@/lib/api";
import { ProductCard } from "@/components/ui/ProductCard";
import Link from "next/link";
import { getRequestLocale } from "@/i18n/server";

interface Props {
  section: HomepageSection;
}

export async function FeaturedProductsSection({ section }: Props) {
  const locale = await getRequestLocale();
  const products = section.featuredProducts ?? [];

  if (products.length === 0) {
    return null; // Empty state — staff hasn't curated anything yet
  }

  return (
    <section className="section bg-[--color-surface-alt]" aria-labelledby="featured-products-heading">
      <div className="container">
        <header className="text-center mb-12">
          <h2 id="featured-products-heading" className="text-3xl md:text-4xl font-bold text-[--color-text-primary] mb-3">
            {t(section.sectionTitle, locale) || "Popular Products"}
          </h2>
          {section.sectionSubtitle && (
            <p className="text-lg text-[--color-text-muted] max-w-xl mx-auto">
              {t(section.sectionSubtitle, locale)}
            </p>
          )}
        </header>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Featured products">
          {products.slice(0, section.itemLimit ?? 6).map((product) => (
            <li key={product._id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>

        <div className="text-center mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl border-2 border-[--color-brand-primary] text-[--color-brand-primary] font-semibold hover:bg-[--color-brand-primary] hover:text-white transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
