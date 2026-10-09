import { HomepageSection, t } from "@/lib/api";
import Link from "next/link";
import { getRequestLocale } from "@/i18n/server";
import { getProjects } from "@/lib/api";
import Image from "next/image";

interface Props {
  section: HomepageSection;
}

export async function FeaturedProjectsSection({ section }: Props) {
  const [locale, projects] = await Promise.all([getRequestLocale(), getProjects()]);
  const featured = projects.filter((project) => project.isFeatured).slice(0, section.itemLimit ?? 3);
  return (
    <section className="section" aria-labelledby="projects-heading">
      <div className="container">
        <header className="text-center mb-12">
          <h2 id="projects-heading" className="text-3xl md:text-4xl font-bold text-[--color-text-primary] mb-3">
            {t(section.sectionTitle, locale) || "Recent Projects"}
          </h2>
          {section.sectionSubtitle && (
            <p className="text-lg text-[--color-text-muted] max-w-xl mx-auto">
              {t(section.sectionSubtitle, locale)}
            </p>
          )}
        </header>

        {featured.length > 0 ? (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Featured projects">
            {featured.map((project) => {
              const image = project.gallery.find((item) => item.isAfter) || project.gallery[0];
              return (
                <li key={project._id}>
                  <Link href={`/projects/${project.slug}`} className="group block overflow-hidden rounded-2xl border border-[--color-border] bg-white">
                    {image ? <div className="relative aspect-video bg-[--color-neutral-100]">
                      <Image src={image.url} alt={t(image.alt, locale) || t(project.title, locale)} fill sizes="(max-width: 768px) 100vw, 33vw" unoptimized className="object-cover transition-transform group-hover:scale-[1.02]" />
                    </div> : <div className="aspect-video bg-[--color-neutral-100]" />}
                    <div className="p-4">
                      <h3 className="font-semibold group-hover:text-[--color-brand-primary]">{t(project.title, locale)}</h3>
                      <p className="mt-1 text-sm text-[--color-text-muted]">{[project.location.city, project.location.state].filter(Boolean).join(", ")}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-xl border border-[--color-border] p-6 text-center text-[--color-text-muted]">Featured project stories will appear here soon.</p>
        )}

        <div className="text-center mt-10">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl border-2 border-[--color-brand-primary] text-[--color-brand-primary] font-semibold hover:bg-[--color-brand-primary] hover:text-white transition-colors"
          >
            View Project Gallery
          </Link>
        </div>
      </div>
    </section>
  );
}
