import { getSitemap } from "@/lib/api";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sitemap | Shadesology",
};

export const revalidate = 3600;

export default async function SitemapPage() {
  let data;
  try {
    data = await getSitemap();
  } catch {
    data = { static: [], categories: [], products: [], segments: [], legal: [] };
  }

  return (
    <div className="container py-16">
      <h1 className="text-4xl font-bold mb-10">Sitemap</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <section aria-labelledby="sitemap-categories">
          <h2 id="sitemap-categories" className="text-lg font-bold mb-4 pb-2 border-b border-[--color-border]">
            Categories
          </h2>
          <ul className="space-y-2">
            {data.categories.map((item, i) => (
              <li key={i}>
                <Link href={item.url} className="text-sm text-[--color-brand-primary] hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sitemap-products">
          <h2 id="sitemap-products" className="text-lg font-bold mb-4 pb-2 border-b border-[--color-border]">
            Products
          </h2>
          <ul className="space-y-2">
            {data.products.map((item, i) => (
              <li key={i}>
                <Link href={item.url} className="text-sm text-[--color-brand-primary] hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sitemap-segments">
          <h2 id="sitemap-segments" className="text-lg font-bold mb-4 pb-2 border-b border-[--color-border]">
            Market Segments
          </h2>
          <ul className="space-y-2">
            {data.segments.map((item, i) => (
              <li key={i}>
                <Link href={item.url} className="text-sm text-[--color-brand-primary] hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sitemap-legal">
          <h2 id="sitemap-legal" className="text-lg font-bold mb-4 pb-2 border-b border-[--color-border]">
            Legal & Info
          </h2>
          <ul className="space-y-2">
            {data.legal.map((item, i) => (
              <li key={i}>
                <Link href={item.url} className="text-sm text-[--color-brand-primary] hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
            {data.static.map((item, i) => (
              <li key={`s-${i}`}>
                <Link href={item.url} className="text-sm text-[--color-brand-primary] hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
