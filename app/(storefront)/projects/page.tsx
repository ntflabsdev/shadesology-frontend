import type { Metadata } from "next";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { getProjects } from "@/lib/api";
import { getRequestLocale } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Project Gallery & Case Studies | Shadesology",
  description: "Explore completed custom shade installations and the results our projects deliver.",
};

export const revalidate = 300;

export default async function ProjectsPage() {
  const [projects, locale] = await Promise.all([getProjects(), getRequestLocale()]);
  return (
    <>
      <header className="bg-[--color-brand-primary] py-14 text-white">
        <div className="container">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/75">Ideas made real</p>
          <h1 className="mt-2 text-4xl font-bold">Projects & case studies</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/85">See how homeowners and commercial teams create more comfortable outdoor spaces.</p>
        </div>
      </header>
      <ProjectGallery projects={projects} locale={locale} />
    </>
  );
}
