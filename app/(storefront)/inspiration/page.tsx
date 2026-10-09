import type { Metadata } from "next";
import { InspirationGallery } from "@/components/inspiration/InspirationGallery";
import { getInspirationItems } from "@/lib/api";
import { getRequestLocale } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Inspiration Gallery | Shadesology",
  description: "Browse custom shade projects and save ideas for your home or commercial space.",
};

export const revalidate = 300;

export default async function InspirationPage() {
  const [items, locale] = await Promise.all([getInspirationItems(), getRequestLocale()]);

  return (
    <>
      <header className="bg-[--color-brand-primary] py-14 text-white">
        <div className="container">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/75">Ideas for every space</p>
          <h1 className="mt-2 text-4xl font-bold">Inspiration gallery</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/85">Explore real shade styles, save your favorites, and discover products that bring your ideas to life.</p>
        </div>
      </header>
      <InspirationGallery items={items} locale={locale} />
    </>
  );
}
