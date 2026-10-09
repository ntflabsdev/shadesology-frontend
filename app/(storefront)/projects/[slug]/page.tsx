import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject, t } from "@/lib/api";
import { getRequestLocale } from "@/i18n/server";
import { PrintProjectButton } from "@/components/projects/PrintProjectButton";
import { getProjects } from "@/lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

function safeInstallerHref(value?: string) {
  if (!value) return "";
  if (/^\/find-installer\/[a-z0-9-]+$/i.test(value)) return value;
  try {
    return new URL(value).protocol === "https:" ? value : "";
  } catch {
    return "";
  }
}

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const project = await getProject(slug);
    return {
      title: t(project.metaTitle) || `${t(project.title)} | Shadesology Projects`,
      description: t(project.metaDescription) || t(project.description),
      openGraph: {
        type: "article",
        images: project.gallery[0]?.url ? [{ url: project.gallery[0].url, alt: t(project.gallery[0].alt) }] : undefined,
      },
    };
  } catch {
    return { title: "Project | Shadesology" };
  }
}

export default async function ProjectCaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const [project, locale, projects] = await Promise.all([
    getProject(slug).catch(() => null),
    getRequestLocale(),
    getProjects(),
  ]);
  if (!project) notFound();
  const relatedProjects = projects
    .filter((candidate) => candidate._id !== project._id && candidate.segments.some((segment) =>
      project.segments.some((relatedSegment) => relatedSegment.slug === segment.slug)))
    .slice(0, 3);

  const title = t(project.title, locale);
  const description = t(project.description, locale);
  const installerHref = safeInstallerHref(project.installerProfileUrl);
  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: t(project.metaDescription, locale) || description,
    dateModified: project.updatedAt || undefined,
    image: project.gallery.map((image) => image.url).filter(Boolean),
    author: { "@type": "Organization", name: "Shadesology" },
    publisher: { "@type": "Organization", name: "Shadesology", url: "https://shadesology.com" },
  };

  return (
    <>
      <Script id="project-article-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd).replace(/</g, "\\u003c") }} />
      <header className="bg-[--color-brand-primary] py-12 text-white">
        <div className="container">
          <Link href="/projects" className="text-sm text-white/80 underline">← All projects</Link>
          <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-white/75">{project.segments.map((segment) => t(segment.name, locale)).join(" · ")}</p>
          <h1 className="mt-2 max-w-4xl text-4xl font-bold">{title}</h1>
          <p className="mt-3 text-white/80">{[project.location.city, project.location.state, project.location.country].filter(Boolean).join(", ")}</p>
        </div>
      </header>

      <main className="container max-w-5xl py-10">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-[--color-text-muted]">
            {project.areaSqFt ? <span>{project.areaSqFt.toLocaleString()} sq ft</span> : null}
            {project.installerName ? <span>{project.areaSqFt ? " · " : ""}Installed by {installerHref ? <a href={installerHref} className="underline" rel={installerHref.startsWith("https://") ? "noopener noreferrer" : undefined}>{project.installerName}</a> : project.installerName}</span> : null}
          </div>
          <PrintProjectButton />
        </div>

        {project.gallery.length > 0 && (
          <section aria-label="Project photos" className="grid gap-4 sm:grid-cols-2">
            {project.gallery.map((image, index) => (
              <figure key={`${image.url}-${index}`}>
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-[--color-neutral-100]">
                  <Image src={image.url} alt={t(image.alt, locale) || title} fill sizes="(max-width: 640px) 100vw, 50vw" unoptimized className="object-cover" priority={index === 0} />
                </div>
                {(image.isBefore || image.isAfter) && <figcaption className="mt-2 text-sm font-medium text-[--color-text-muted]">{image.isBefore ? "Before" : "After"}</figcaption>}
              </figure>
            ))}
          </section>
        )}

        {description && <p className="mt-8 text-lg leading-8 text-[--color-text-muted]">{description}</p>}
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {project.challenge?.en && <section><h2 className="text-xl font-bold">The challenge</h2><p className="mt-2 whitespace-pre-wrap leading-7 text-[--color-text-muted]">{t(project.challenge, locale)}</p></section>}
          {project.solution?.en && <section><h2 className="text-xl font-bold">The solution</h2><p className="mt-2 whitespace-pre-wrap leading-7 text-[--color-text-muted]">{t(project.solution, locale)}</p></section>}
          {project.results?.en && <section><h2 className="text-xl font-bold">The results</h2><p className="mt-2 whitespace-pre-wrap leading-7 text-[--color-text-muted]">{t(project.results, locale)}</p></section>}
          {project.energySavings?.en && <section><h2 className="text-xl font-bold">Energy savings</h2><p className="mt-2 whitespace-pre-wrap leading-7 text-[--color-text-muted]">{t(project.energySavings, locale)}</p></section>}
        </div>

        {project.metrics.length > 0 && <section className="mt-10" aria-labelledby="project-metrics"><h2 id="project-metrics" className="text-xl font-bold">Project results at a glance</h2><dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{project.metrics.map((metric, index) => <div key={`${metric.value}-${index}`} className="rounded-xl border border-[--color-border] p-4"><dt className="text-sm text-[--color-text-muted]">{t(metric.label, locale)}</dt><dd className="mt-1 text-2xl font-bold">{metric.value} {metric.unit}</dd></div>)}</dl></section>}
        {project.budget?.en && <p className="mt-8 text-sm text-[--color-text-muted]"><strong>Project budget:</strong> {t(project.budget, locale)}</p>}

        {project.products.length > 0 && <section className="mt-10" aria-labelledby="project-products"><h2 id="project-products" className="text-xl font-bold">Products used</h2><ul className="mt-3 flex flex-wrap gap-3">{project.products.map((product) => <li key={product._id}><Link href={`/products/${product.slug}`} className="inline-flex rounded-lg border border-[--color-border] px-4 py-2 font-semibold text-[--color-brand-primary] hover:border-[--color-brand-primary]">{t(product.name, locale)}</Link></li>)}</ul></section>}
        {relatedProjects.length > 0 && <section className="mt-10 border-t border-[--color-border] pt-8" aria-labelledby="related-projects"><h2 id="related-projects" className="text-xl font-bold">Related projects</h2><ul className="mt-3 flex flex-wrap gap-3">{relatedProjects.map((related) => <li key={related._id}><Link href={`/projects/${related.slug}`} className="rounded-lg border border-[--color-border] px-4 py-2 font-semibold text-[--color-brand-primary] underline">{t(related.title, locale)}</Link></li>)}</ul></section>}
      </main>
    </>
  );
}
