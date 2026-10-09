import { HomepageSection, t } from "@/lib/api";
import { getCategories } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { getRequestLocale } from "@/i18n/server";

const PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

interface Props {
  section: HomepageSection;
}

export async function ProductOverviewSection({ section }: Props) {
  const locale = await getRequestLocale();
  const categories = await getCategories().catch(() => []);
  const limit = section.itemLimit ?? 9;
  const shown = categories.slice(0, limit);

  return (
    <section className="section bg-[--color-surface-alt]" aria-labelledby="products-heading">
      <div className="container">
        <header className="text-center mb-12">
          <h2 id="products-heading" className="text-3xl md:text-4xl font-bold text-[--color-text-primary] mb-3">
            {t(section.sectionTitle, locale) || "Our Products"}
          </h2>
          {section.sectionSubtitle && (
            <p className="text-lg text-[--color-text-muted] max-w-xl mx-auto">
              {t(section.sectionSubtitle, locale)}
            </p>
          )}
        </header>

        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6" role="list" aria-label="Product categories">
          {shown.map((cat) => (
            <li key={cat._id}>
              <Link
                href={`/category/${cat.slug}`}
                className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-[--color-border] hover:border-[--color-brand-primary] hover:shadow-md transition-all duration-200"
              >
                <div className="relative w-full aspect-product rounded-xl overflow-hidden mb-4 bg-[--color-neutral-100]">
                  <Image
                    src={cat.image?.url || PLACEHOLDER}
                    alt={cat.image ? t(cat.image.alt, locale) || t(cat.name, locale) : t(cat.name, locale)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized={!cat.image?.url}
                  />
                </div>
                <h3 className="font-semibold text-[--color-text-primary] group-hover:text-[--color-brand-primary] transition-colors">
                  {t(cat.name, locale)}
                </h3>
                {cat.description && (
                  <p className="text-sm text-[--color-text-muted] mt-1 line-clamp-2">
                    {t(cat.description, locale)}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="text-center mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[--color-brand-primary] text-white font-semibold hover:bg-[--color-brand-primary-light] transition-colors"
          >
            View All Products
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
