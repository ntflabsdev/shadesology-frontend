import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dealer Program | Shadesology",
  description:
    "Join the Shadesology dealer network — trade pricing, product configurators, co-op marketing support and a dedicated sales team.",
};

export default function DealerPage() {
  const BENEFITS = [
    { icon: "💰", title: "Trade Pricing", desc: "Tiered pricing structures that reward volume. Pricing group assigned after application review." },
    { icon: "🛠️", title: "Product Configurators", desc: "Online tools to spec and price custom orders quickly for your customers." },
    { icon: "📦", title: "Priority Fulfillment", desc: "Dealer orders get priority production scheduling and dedicated account management." },
    { icon: "📣", title: "Co-op Marketing", desc: "Co-branded materials, product imagery, and campaign support." },
    { icon: "📚", title: "Training & Certification", desc: "Product training, installation certification and technical support resources." },
    { icon: "🔗", title: "Installer Referrals", desc: "We refer installation inquiries in your region to your business." },
  ];

  return (
    <>
      <header className="bg-[--color-brand-primary] text-white py-20">
        <div className="container max-w-3xl">
          <p className="text-[--color-brand-accent] text-sm font-semibold uppercase tracking-widest mb-3">Trade Program</p>
          <h1 className="text-5xl font-bold mb-4">Dealer & Distributor Program</h1>
          <p className="text-white/80 text-lg mb-8">
            Partner with Shadesology and offer your customers the finest custom shade products
            with competitive trade pricing and full support.
          </p>
          <Link href="#apply" className="px-7 py-3.5 rounded-xl bg-[--color-brand-accent] text-[--color-neutral-900] font-bold hover:bg-[--color-brand-accent-dark] transition-colors">
            Apply Now
          </Link>
        </div>
      </header>

      <section className="section" aria-labelledby="benefits-heading">
        <div className="container">
          <h2 id="benefits-heading" className="text-3xl font-bold mb-10 text-center">Dealer Benefits</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
            {BENEFITS.map((b) => (
              <li key={b.title} className="rounded-2xl border border-[--color-border] p-6">
                <span className="text-3xl" aria-hidden="true">{b.icon}</span>
                <h3 className="font-bold text-lg mt-4 mb-2">{b.title}</h3>
                <p className="text-sm text-[--color-text-muted] leading-relaxed">{b.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="apply" className="section bg-[--color-surface-alt] border-t border-[--color-border]" aria-labelledby="apply-heading">
        <div className="container max-w-xl text-center">
          <h2 id="apply-heading" className="text-3xl font-bold mb-4">Ready to Apply?</h2>
          <p className="text-[--color-text-muted] mb-8">
            Fill out your dealer application and our trade team will review it within 2–3 business days.
            Pricing group assignment is completed by our team after approval.
          </p>
          <Link
            href="/dealer/apply"
            className="inline-flex px-8 py-3.5 rounded-xl bg-[--color-brand-primary] text-white font-bold hover:bg-[--color-brand-primary-light] transition-colors"
          >
            Start Application
          </Link>
          <p className="mt-4 text-sm text-[--color-text-muted]">
            Already a dealer?{" "}
            <Link href="/login" className="text-[--color-brand-primary] hover:underline font-semibold">
              Sign in to your portal
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
