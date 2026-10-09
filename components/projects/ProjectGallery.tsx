"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { t, type Phase3Project } from "@/lib/api";
import type { Locale } from "@/i18n/config";

function ProjectImages({ project, locale }: { project: Phase3Project; locale: Locale }) {
  const [position, setPosition] = useState(50);
  const before = project.gallery.find((image) => image.isBefore);
  const after = project.gallery.find((image) => image.isAfter);

  if (!before || !after) {
    const image = after || project.gallery[0];
    if (!image) return <div className="aspect-video bg-[--color-neutral-100]" />;
    return <div className="relative aspect-video bg-[--color-neutral-100]">
      <Image src={image.url} alt={t(image.alt, locale) || t(project.title, locale)} fill sizes="(max-width: 768px) 100vw, 50vw" unoptimized className="object-cover" />
    </div>;
  }

  return (
    <div className="relative aspect-video overflow-hidden bg-[--color-neutral-100]">
      <Image src={after.url} alt={t(after.alt, locale) || `${t(project.title, locale)} — after`} fill sizes="(max-width: 768px) 100vw, 50vw" unoptimized className="object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image src={before.url} alt={t(before.alt, locale) || `${t(project.title, locale)} — before`} fill sizes="(max-width: 768px) 100vw, 50vw" unoptimized className="object-cover" />
      </div>
      <label className="absolute inset-x-4 bottom-3 flex items-center gap-3 rounded-lg bg-black/70 px-3 py-2 text-xs font-semibold text-white">
        <span>Before</span>
        <input aria-label={`Compare before and after for ${t(project.title, locale)}`} type="range" min="0" max="100" value={position} onChange={(event) => setPosition(Number(event.target.value))} className="w-full accent-white" />
        <span>After</span>
      </label>
    </div>
  );
}

export function ProjectGallery({ projects, locale }: { projects: Phase3Project[]; locale: Locale }) {
  const [segment, setSegment] = useState("");
  const [query, setQuery] = useState("");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const segments = useMemo(() => {
    const bySlug = new Map<string, string>();
    projects.forEach((project) => project.segments.forEach((item) => bySlug.set(item.slug, t(item.name, locale))));
    return Array.from(bySlug.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [locale, projects]);
  const filtered = projects.filter((project) => {
    const text = [t(project.title, locale), t(project.description, locale), project.location.city, project.location.state, project.installerName].join(" ").toLocaleLowerCase();
    return (!segment || project.segments.some((item) => item.slug === segment)) && (!query || text.includes(query.trim().toLocaleLowerCase()));
  });

  return (
    <section className="container py-8">
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <label className="min-w-48 flex-1">
          <span className="mb-1 block text-sm font-medium">Search projects</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-lg border border-[--color-border] px-3 py-2" />
        </label>
        <label className="min-w-48 flex-1">
          <span className="mb-1 block text-sm font-medium">Market segment</span>
          <select value={segment} onChange={(event) => setSegment(event.target.value)} className="w-full rounded-lg border border-[--color-border] px-3 py-2">
            <option value="">All segments</option>
            {segments.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}
          </select>
        </label>
        <div className="flex gap-2" role="group" aria-label="Project layout">
          <button type="button" aria-pressed={layout === "grid"} onClick={() => setLayout("grid")} className="rounded-lg border px-4 py-2 text-sm">Grid</button>
          <button type="button" aria-pressed={layout === "list"} onClick={() => setLayout("list")} className="rounded-lg border px-4 py-2 text-sm">List</button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="rounded-xl border border-[--color-border] p-8 text-center text-[--color-text-muted]">No published projects match these filters yet.</p>
      ) : (
        <ul className={layout === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-5"} role="list">
          {filtered.map((project) => (
            <li key={project._id}>
              <article className={`overflow-hidden rounded-2xl border border-[--color-border] bg-white ${layout === "list" ? "sm:grid sm:grid-cols-2" : ""}`}>
                <ProjectImages project={project} locale={locale} />
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[--color-brand-primary]">{project.segments.map((item) => t(item.name, locale)).join(" · ")}</p>
                  <h2 className="mt-2 text-xl font-bold">{t(project.title, locale)}</h2>
                  <p className="mt-2 text-sm text-[--color-text-muted]">{[project.location.city, project.location.state].filter(Boolean).join(", ")}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[--color-text-muted]">{t(project.description, locale)}</p>
                  {project.metrics.length > 0 && <ul className="mt-4 flex flex-wrap gap-2" aria-label="Project results">{project.metrics.slice(0, 3).map((metric, index) => <li key={`${metric.label.en}-${index}`} className="rounded-lg bg-[--color-neutral-100] px-3 py-2 text-xs"><strong>{metric.value}{metric.unit}</strong> {t(metric.label, locale)}</li>)}</ul>}
                  <Link href={`/projects/${project.slug}`} className="mt-5 inline-block font-semibold text-[--color-brand-primary] underline">Read case study</Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
