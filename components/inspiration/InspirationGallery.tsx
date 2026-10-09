"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { t, type InspirationItem } from "@/lib/api";
import type { Locale } from "@/i18n/config";

const FAVORITES_KEY = "shadesology.inspiration.favorites";

function choices(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export function InspirationGallery({ items, locale }: { items: InspirationItem[]; locale: Locale }) {
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState("");
  const [productType, setProductType] = useState("");
  const [setting, setSetting] = useState("");
  const [color, setColor] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [selected, setSelected] = useState<InspirationItem | null>(null);
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
          throw new Error("Stored favorites have an invalid format.");
        }
        // Restore browser-only state after hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFavorites(parsed);
      }
      const collection = new URLSearchParams(window.location.search).get("collection");
      if (collection) {
        const ids = collection.split(",").filter(Boolean);
        setFavorites(ids);
        setShowFavorites(true);
      }
    } catch {
      setShareMessage("Saved favorites could not be loaded in this browser.");
    }
  }, []);

  const visibleItems = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return items.filter((item) => {
      const text = [
        t(item.title, locale),
        t(item.alt, locale),
        item.style,
        item.setting,
        item.color,
        t(item.productType?.name, locale),
        t(item.manufacturer?.name, locale),
      ].join(" ").toLocaleLowerCase();
      return (!term || text.includes(term)) &&
        (!style || item.style === style) &&
        (!productType || item.productType?.slug === productType) &&
        (!setting || item.setting === setting) &&
        (!color || item.color === color) &&
        (!manufacturer || item.manufacturer?.slug === manufacturer) &&
        (!showFavorites || favorites.includes(item._id));
    });
  }, [color, favorites, items, locale, manufacturer, productType, query, setting, showFavorites, style]);

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const updated = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      try {
        window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
        setShareMessage("");
      } catch {
        setShareMessage("Favorites could not be saved in this browser.");
      }
      return updated;
    });
  }

  async function shareFavorites() {
    if (!favorites.length) {
      setShareMessage("Save at least one image to create a collection link.");
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("collection", favorites.join(","));
    window.history.replaceState(null, "", url);
    try {
      await navigator.clipboard.writeText(url.toString());
      setShareMessage("Collection link copied.");
    } catch {
      setShareMessage("The collection link is in the address bar, but could not be copied automatically.");
    }
  }

  const styles = choices(items.map((item) => item.style));
  const productTypes = Array.from(new Map(items.filter((item) => item.productType).map((item) => [item.productType!.slug, t(item.productType!.name, locale)])).entries());
  const settings = choices(items.map((item) => item.setting));
  const colors = choices(items.map((item) => item.color));
  const manufacturers = Array.from(new Map(items.filter((item) => item.manufacturer).map((item) => [item.manufacturer!.slug, t(item.manufacturer!.name, locale)])).entries());

  return (
    <>
      <section className="container py-8" aria-label="Inspiration filters">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <label className="lg:col-span-2">
            <span className="mb-1 block text-sm font-medium">Search inspiration</span>
            <input value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(12); }} className="w-full rounded-lg border border-[--color-border] px-3 py-2" type="search" />
          </label>
          <label><span className="mb-1 block text-sm font-medium">Style</span>
            <select value={style} onChange={(event) => { setStyle(event.target.value); setVisibleCount(12); }} className="w-full rounded-lg border border-[--color-border] px-3 py-2"><option value="">All styles</option>{styles.map((value) => <option key={value}>{value}</option>)}</select>
          </label>
          <label><span className="mb-1 block text-sm font-medium">Product</span>
            <select value={productType} onChange={(event) => { setProductType(event.target.value); setVisibleCount(12); }} className="w-full rounded-lg border border-[--color-border] px-3 py-2"><option value="">All products</option>{productTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          </label>
          <label><span className="mb-1 block text-sm font-medium">Setting</span>
            <select value={setting} onChange={(event) => { setSetting(event.target.value); setVisibleCount(12); }} className="w-full rounded-lg border border-[--color-border] px-3 py-2"><option value="">All settings</option>{settings.map((value) => <option key={value}>{value}</option>)}</select>
          </label>
          <label><span className="mb-1 block text-sm font-medium">Color</span>
            <select value={color} onChange={(event) => { setColor(event.target.value); setVisibleCount(12); }} className="w-full rounded-lg border border-[--color-border] px-3 py-2"><option value="">All colors</option>{colors.map((value) => <option key={value}>{value}</option>)}</select>
          </label>
          {manufacturers.length > 0 && <label><span className="mb-1 block text-sm font-medium">Manufacturer</span>
            <select value={manufacturer} onChange={(event) => { setManufacturer(event.target.value); setVisibleCount(12); }} className="w-full rounded-lg border border-[--color-border] px-3 py-2"><option value="">All manufacturers</option>{manufacturers.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          </label>}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" aria-pressed={showFavorites} onClick={() => setShowFavorites((value) => !value)} className="rounded-lg border border-[--color-border] px-4 py-2 text-sm font-semibold">
            {showFavorites ? "Show all images" : `Favorites (${favorites.length})`}
          </button>
          <button type="button" onClick={() => void shareFavorites()} className="rounded-lg border border-[--color-border] px-4 py-2 text-sm font-semibold">Share collection</button>
          {shareMessage && <p role="status" className="text-sm text-[--color-text-muted]">{shareMessage}</p>}
          <p className="ml-auto text-sm text-[--color-text-muted]">{visibleItems.length} inspiration images</p>
        </div>
      </section>

      <section className="container pb-14" aria-label="Inspiration image gallery">
        {visibleItems.length === 0 ? (
          <p className="rounded-xl border border-[--color-border] p-8 text-center text-[--color-text-muted]">No inspiration images match those filters yet.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {visibleItems.slice(0, visibleCount).map((item) => (
              <li key={item._id} className="overflow-hidden rounded-2xl border border-[--color-border] bg-white">
                <button type="button" onClick={() => setSelected(item)} className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
                  <div className="relative aspect-[4/3] bg-[--color-neutral-100]">
                    <Image src={item.image.url} alt={t(item.alt, locale) || t(item.image.alt, locale) || t(item.title, locale)} fill sizes="(max-width: 768px) 100vw, 33vw" unoptimized className="object-cover transition-transform hover:scale-[1.02]" />
                  </div>
                  <span className="sr-only">View {t(item.title, locale) || "inspiration image"}</span>
                </button>
                <div className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <h2 className="font-semibold">{t(item.title, locale) || "Project inspiration"}</h2>
                    <p className="mt-1 text-sm text-[--color-text-muted]">{[item.style, item.setting, item.color].filter(Boolean).join(" · ")}</p>
                    {item.products.map((product) => (
                      <Link key={product._id} href={`/products/${product.slug}`} className="mt-2 inline-block text-sm font-semibold text-[--color-brand-primary] underline">Shop {t(product.name, locale)}</Link>
                    ))}
                    {item.project && <Link href={`/projects/${item.project.slug}`} className="mt-2 block text-sm font-semibold text-[--color-brand-primary] underline">View project</Link>}
                  </div>
                  <button type="button" aria-label={favorites.includes(item._id) ? "Remove from favorites" : "Save to favorites"} aria-pressed={favorites.includes(item._id)} onClick={() => toggleFavorite(item._id)} className="rounded-full border border-[--color-border] px-3 py-2 text-lg" title={favorites.includes(item._id) ? "Remove favorite" : "Add favorite"}>{favorites.includes(item._id) ? "♥" : "♡"}</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {visibleCount < visibleItems.length && <div className="mt-8 text-center"><button type="button" onClick={() => setVisibleCount((count) => count + 12)} className="rounded-xl border-2 border-[--color-brand-primary] px-6 py-3 font-semibold text-[--color-brand-primary]">Load more</button></div>}
      </section>

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? t(selected.title, locale) || "Inspiration" : "Inspiration"} size="xl">
        {selected && <div className="space-y-4">
          <div className="relative aspect-[4/3] bg-[--color-neutral-100]"><Image src={selected.image.url} alt={t(selected.alt, locale) || t(selected.image.alt, locale)} fill sizes="90vw" unoptimized className="object-contain" /></div>
          <p className="text-sm text-[--color-text-muted]">{[selected.style, selected.setting, selected.color].filter(Boolean).join(" · ")}</p>
        </div>}
      </Modal>
    </>
  );
}
