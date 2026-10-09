import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Shadesology | Premium Custom Shade Solutions",
  description:
    "Learn about Shadesology — our story, values, and commitment to designing and manufacturing the finest custom shade products.",
};

export default function AboutPage() {
  return (
    <>
      <header className="bg-[--color-brand-primary] text-white py-20">
        <div className="container max-w-3xl">
          <h1 className="text-5xl font-bold mb-4">About Shadesology</h1>
          <p className="text-white/80 text-xl leading-relaxed">
            We design and manufacture premium custom shade solutions for residential
            and commercial spaces across North America.
          </p>
        </div>
      </header>

      {/* Mission */}
      <section className="section" aria-labelledby="mission-heading">
        <div className="container max-w-3xl">
          <h2 id="mission-heading" className="text-3xl font-bold mb-5">Our Mission</h2>
          <p className="text-lg text-[--color-text-muted] leading-relaxed mb-5">
            At Shadesology, we believe that great shade design transforms outdoor spaces —
            and the way people live and work in them. Every product we make is custom-built
            to exact specifications, using premium materials selected for durability,
            aesthetics, and performance in real-world conditions.
          </p>
          <p className="text-lg text-[--color-text-muted] leading-relaxed">
            From a single retractable awning for a family home to a large-scale tensile
            structure for a commercial development, we approach every project with the same
            commitment: the right shade, in the right place, built to last.
          </p>
        </div>
      </section>

      {/* Values grid */}
      <section className="section bg-[--color-surface-alt] border-t border-[--color-border]" aria-labelledby="values-heading">
        <div className="container">
          <h2 id="values-heading" className="text-3xl font-bold mb-10 text-center">What We Stand For</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="list">
            {[
              { icon: "🎯", title: "Precision", desc: "Every dimension matters. Our manufacturing tolerances are tight because custom products have to fit perfectly." },
              { icon: "🌿", title: "Sustainability", desc: "We source materials from suppliers with responsible practices and design products built to outlast trends." },
              { icon: "🤝", title: "Partnership", desc: "We work alongside homeowners, architects, dealers and installers — sharing knowledge at every step." },
              { icon: "⚡", title: "Innovation", desc: "We invest in motorisation, smart control and new materials to keep our products at the leading edge." },
            ].map((v) => (
              <li key={v.title} className="rounded-2xl border border-[--color-border] bg-white p-6">
                <span className="text-3xl" aria-hidden="true">{v.icon}</span>
                <h3 className="font-bold text-lg mt-3 mb-2">{v.title}</h3>
                <p className="text-sm text-[--color-text-muted] leading-relaxed">{v.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Stats band */}
      <section className="section-sm bg-[--color-brand-primary] text-white" aria-label="Company statistics">
        <div className="container">
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center" role="list">
            {[
              { value: "10,000+", label: "Installations" },
              { value: "500+",    label: "Certified Installers" },
              { value: "9",       label: "Product Categories" },
              { value: "14",      label: "Market Segments" },
            ].map((stat) => (
              <li key={stat.label}>
                <p className="text-4xl font-bold text-[--color-brand-accent]">{stat.value}</p>
                <p className="text-sm text-white/75 mt-1">{stat.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="section text-center">
        <div className="container max-w-xl">
          <h2 className="text-3xl font-bold mb-4">Ready to start your project?</h2>
          <p className="text-[--color-text-muted] mb-8">Get a free, no-obligation quote from our team today.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/quote" className="px-7 py-3 rounded-xl bg-[--color-brand-primary] text-white font-bold hover:bg-[--color-brand-primary-light] transition-colors">
              Request a Quote
            </Link>
            <Link href="/contact" className="px-7 py-3 rounded-xl border-2 border-[--color-brand-primary] text-[--color-brand-primary] font-bold hover:bg-[--color-brand-primary] hover:text-white transition-colors">
              Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
