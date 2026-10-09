"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { VideoPlayer } from "@/components/media/VideoPlayer";
import { t, type HostedVideo } from "@/lib/api";
import type { Locale } from "@/i18n/config";

const categories = ["installation", "demo", "walkthrough", "fly-through", "testimonial", "factory tour", "maintenance"];

export function VideoLibrary({ videos, locale }: { videos: HostedVideo[]; locale: Locale }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return videos.filter((video) => {
      const text = [t(video.title, locale), t(video.description, locale), video.category, t(video.transcript, locale)].join(" ").toLocaleLowerCase();
      return (!category || video.category === category) && (!term || text.includes(term));
    });
  }, [category, locale, query, videos]);

  return (
    <>
      <section className="container py-7" aria-label="Video library filters">
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm font-medium">Search videos</span>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-lg border border-[--color-border] px-3 py-2" />
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium">Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-lg border border-[--color-border] px-3 py-2">
              <option value="">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}</option>)}
            </select>
          </label>
        </div>
      </section>
      <section className="container pb-14" aria-label="Videos">
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-[--color-border] p-8 text-center text-[--color-text-muted]">No videos are available for this search yet.</p>
        ) : (
          <ul className="grid gap-8 lg:grid-cols-2" role="list">
            {filtered.map((video, index) => {
              const related = filtered.filter((candidate) => candidate._id !== video._id && candidate.category === video.category).slice(0, 3);
              return (
                <li key={video._id}>
                  <article className="h-full rounded-2xl border border-[--color-border] bg-white p-4 sm:p-5">
                    <VideoPlayer video={video} title={t(video.title, locale) || `${video.category} video`} />
                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[--color-brand-primary]">{video.category}</p>
                    <h2 className="mt-1 text-xl font-bold"><Link href={`/videos/${video._id}`} className="hover:text-[--color-brand-primary] hover:underline">{t(video.title, locale) || `Video ${index + 1}`}</Link></h2>
                    {t(video.description, locale) && <p className="mt-2 text-sm leading-6 text-[--color-text-muted]">{t(video.description, locale)}</p>}
                    {video.products.length > 0 && <p className="mt-3 text-sm">Related products: {video.products.map((product, productIndex) => <span key={product._id}>{productIndex > 0 && ", "}<Link href={`/products/${product.slug}`} className="font-semibold text-[--color-brand-primary] underline">{t(product.name, locale)}</Link></span>)}</p>}
                    {related.length > 0 && <aside className="mt-4 border-t border-[--color-border] pt-3"><h3 className="text-sm font-semibold">More in {video.category}</h3><ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">{related.map((item) => <li key={item._id}><a href={`#video-${item._id}`} className="text-[--color-brand-primary] underline">{t(item.title, locale) || "Related video"}</a></li>)}</ul></aside>}
                  </article>
                  <span id={`video-${video._id}`} className="sr-only" />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
