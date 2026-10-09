import Link from "next/link";
import { getProjects, getSegments, t } from "@/lib/api";
import type { Metadata } from "next";
import { getRequestLocale } from "@/i18n/server";
import { ProjectGallery } from "@/components/projects/ProjectGallery";

export const metadata: Metadata = {
  title: "Commercial Shade Solutions | Shadesology",
  description:
    "Commercial-grade awnings, pergolas, tensile structures and shade sails for hospitality, retail, healthcare, education and more.",
};

export const revalidate = 600;

export default async function CommercialPage() {
  const locale = await getRequestLocale();
  const [segments, projects] = await Promise.all([
    getSegments().catch(() => []),
    getProjects({ audience: "commercial" }).catch(() => []),
  ]);
  const commercialSegments = segments.filter((s) => s.audience === "commercial");

  return (
    <>
      <header className="bg-[--color-brand-primary] text-white py-20">
        <div className="container max-w-3xl">
          <p className="text-[--color-brand-accent] font-semibold text-sm uppercase tracking-widest mb-3">
            Commercial Division
          </p>
          <h1 className="text-5xl font-bold mb-4">Shade Built for Business</h1>
          <p className="text-white/80 text-lg leading-relaxed mb-8">
            From restaurant terraces to hospital courtyards — we deliver commercial-grade
            shade systems engineered for high traffic, long service life and architectural impact.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/commercial/request" className="px-7 py-3.5 rounded-xl bg-[--color-brand-accent] text-[--color-neutral-900] font-bold hover:bg-[--color-brand-accent-dark] transition-colors">
              Enquire Now
            </Link>
            <Link href="/contact" className="px-7 py-3.5 rounded-xl border-2 border-white text-white font-bold hover:bg-white hover:text-[--color-brand-primary] transition-colors">
              Speak to a Specialist
            </Link>
          </div>
        </div>
      </header>

      {/* Market segments */}
      {commercialSegments.length > 0 && (
        <section className="section" aria-labelledby="commercial-segments-heading">
          <div className="container">
            <h2 id="commercial-segments-heading" className="text-3xl font-bold mb-3">Industries We Serve</h2>
            <p className="text-[--color-text-muted] mb-10 max-w-2xl">
              Our commercial team has delivered projects across 10 industry sectors.
              Each sector has distinct requirements — we understand them.
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" role="list">
              {commercialSegments.map((seg) => (
                <li key={seg._id}>
                  <Link
                    href={`/segments/${seg.slug}`}
                    className="group flex flex-col items-center text-center p-4 rounded-2xl border-2 border-[--color-border] hover:border-[--color-brand-primary] hover:shadow-md transition-all"
                  >
                    <span className="text-3xl mb-2" aria-hidden="true">🏢</span>
                    <span className="text-sm font-semibold group-hover:text-[--color-brand-primary] transition-colors">
                      {t(seg.name, locale)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Capabilities */}
      <section className="section bg-[--color-surface-alt] border-t border-[--color-border]" aria-labelledby="capabilities-heading">
        <div className="container">
          <h2 id="capabilities-heading" className="text-3xl font-bold mb-10 text-center">Why Commercial Projects Choose Us</h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list">
            {[
              {
                icon: "📐",
                title: "Custom Engineering",
                desc: "We design to your exact site conditions — span, wind rating, loads, mounting constraints and aesthetic requirements.",
              },
              {
                icon: "📋",
                title: "Compliance Ready",
                desc: "Our products carry industry certifications and can be specified with engineering drawings and wind-load documentation.",
              },
              {
                icon: "🔧",
                title: "Full-Service Delivery",
                desc: "From concept to certified installation, we manage the entire process through our trained installer network.",
              },
            ].map((item) => (
              <li key={item.title} className="rounded-2xl border border-[--color-border] bg-white p-6">
                <span className="text-3xl" aria-hidden="true">{item.icon}</span>
                <h3 className="font-bold text-xl mt-4 mb-2">{item.title}</h3>
                <p className="text-[--color-text-muted] leading-relaxed">{item.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Audience links */}
      <section className="section" aria-labelledby="audience-heading">
        <div className="container">
          <h2 id="audience-heading" className="text-2xl font-bold mb-6">Portals for Professionals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { href: "/commercial/architects-specifiers", icon: "📌", title: "Architects & specifiers", desc: "CAD, BIM, CSI specifications, engineering data and technical resources." },
              { href: "/commercial/builders-developers-property-managers", icon: "🏗️", title: "Builders & property teams", desc: "Coordinate shade systems for developments, properties and construction projects." },
              { href: "/commercial/government-healthcare-hospitality", icon: "🏛️", title: "Public sector & hospitality", desc: "Solutions for government, healthcare, hospitality and high-traffic environments." },
              { href: "/dealer", icon: "💼", title: "Dealers & Distributors", desc: "Trade pricing, product configurators and marketing tools." },
              { href: "/find-installer", icon: "🔧", title: "Find an Installer", desc: "Locate a certified installer for your commercial project." },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col p-6 rounded-2xl border-2 border-[--color-border] hover:border-[--color-brand-primary] hover:shadow-md transition-all"
              >
                <span className="text-3xl mb-3" aria-hidden="true">{card.icon}</span>
                <h3 className="font-bold text-lg mb-1 group-hover:text-[--color-brand-primary] transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-[--color-text-muted]">{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {projects.length > 0 && (
        <section className="section bg-[--color-surface-alt] border-t border-[--color-border]" aria-labelledby="commercial-projects-heading">
          <div className="container">
            <h2 id="commercial-projects-heading" className="text-3xl font-bold">Commercial project references</h2>
            <p className="mt-2 text-[--color-text-muted]">Explore completed projects and case studies across our commercial segments.</p>
          </div>
          <ProjectGallery projects={projects} locale={locale} />
        </section>
      )}

      {/* CTA */}
      <section className="section-sm bg-[--color-brand-primary] text-white">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-2">Have a commercial project in mind?</h2>
          <p className="text-white/80 mb-6">Our commercial team will review your requirements and send a detailed proposal.</p>
          <Link href="/commercial/request" className="inline-flex px-8 py-3.5 rounded-xl bg-[--color-brand-accent] text-[--color-neutral-900] font-bold hover:bg-[--color-brand-accent-dark] transition-colors">
            Submit a Commercial Enquiry
          </Link>
        </div>
      </section>
    </>
  );
}
