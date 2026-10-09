import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support Center | Shadesology",
  description:
    "Get help with your Shadesology products — FAQs, manuals, warranty claims and service requests.",
};

const SUPPORT_TOPICS = [
  {
    icon: "📋",
    title: "FAQs",
    description: "Answers to the most common questions about our products, installation and ordering.",
    href: "/support/faq",
  },
  {
    icon: "📖",
    title: "Installation Manuals",
    description: "Download step-by-step manuals for all products — updated when new versions are released.",
    href: "/resources?type=manual",
  },
  {
    icon: "🛡️",
    title: "Warranty Information",
    description: "Understand your coverage and submit a warranty claim online.",
    href: "/warranty",
  },
  {
    icon: "🔧",
    title: "Service Request",
    description: "Log a service issue and one of our technicians or local installers will follow up.",
    href: "/support/service",
  },
  {
    icon: "📦",
    title: "Order Support",
    description: "Track your order, request changes or get help with delivery.",
    href: "/support/orders",
  },
  {
    icon: "✨",
    title: "Inspiration Gallery",
    description: "Browse real project photos, save favorites and find products for your space.",
    href: "/inspiration",
  },
  {
    icon: "▶️",
    title: "Video Library",
    description: "Watch installation, product demo and maintenance videos.",
    href: "/videos",
  },
  {
    icon: "🏡",
    title: "Project Gallery",
    description: "Explore completed shade projects and customer case studies.",
    href: "/projects",
  },
  {
    icon: "↩️",
    title: "Returns & Refunds",
    description: "Understand our return policy for standard and custom-made products.",
    href: "/refunds",
  },
];

const POPULAR_FAQS = [
  {
    q: "How long does delivery take?",
    a: "Made-to-order products typically ship within 10–21 business days depending on the product type and customisations selected. Delivery time is shown on each product page.",
  },
  {
    q: "Do you offer professional installation?",
    a: "Yes — we have a network of certified installers across the country. Use our Find an Installer tool to locate one near you.",
  },
  {
    q: "What warranty do your products carry?",
    a: "Warranty varies by product type. Retractable awnings carry up to a 5-year frame warranty; fabric covers are typically 3–5 years depending on the fabric grade selected.",
  },
  {
    q: "Can I return a custom-made product?",
    a: "Custom-made products cannot be returned unless they arrive damaged or defective. Please review our Refund Policy before ordering.",
  },
  {
    q: "How do I get a dealer or trade price?",
    a: "Apply for a trade or dealer account through our Dealer Program page. Pricing is assigned by our team after reviewing your application.",
  },
];

export default function SupportPage() {
  return (
    <>
      <header className="bg-[--color-brand-primary] text-white py-14">
        <div className="container max-w-3xl">
          <h1 className="text-4xl font-bold mb-3">Support Center</h1>
          <p className="text-white/80 text-lg">
            How can we help you today? Browse topics below or contact us directly.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-[--color-brand-accent] text-[--color-neutral-900] font-bold hover:bg-[--color-brand-accent-dark] transition-colors"
            >
              Contact Support
            </Link>
            <a
              href="tel:18007423370"
              className="px-5 py-2.5 rounded-xl border-2 border-white text-white font-bold hover:bg-white hover:text-[--color-brand-primary] transition-colors"
            >
              📞 Call 1-800-SHADES-0
            </a>
          </div>
        </div>
      </header>

      {/* Topic grid */}
      <section className="section" aria-labelledby="topics-heading">
        <div className="container">
          <h2 id="topics-heading" className="text-2xl font-bold mb-8">Browse Support Topics</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" role="list">
            {SUPPORT_TOPICS.map((topic) => (
              <li key={topic.href}>
                <Link
                  href={topic.href}
                  className="group flex flex-col h-full p-5 rounded-2xl border-2 border-[--color-border] hover:border-[--color-brand-primary] hover:shadow-md transition-all"
                >
                  <span className="text-3xl mb-3" aria-hidden="true">{topic.icon}</span>
                  <h3 className="font-bold text-[--color-text-primary] group-hover:text-[--color-brand-primary] transition-colors mb-1">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-[--color-text-muted] leading-relaxed flex-1">
                    {topic.description}
                  </p>
                  <span className="mt-3 text-sm font-semibold text-[--color-brand-primary] flex items-center gap-1">
                    Learn more
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Popular FAQs */}
      <section className="section bg-[--color-surface-alt] border-t border-[--color-border]" aria-labelledby="faq-heading">
        <div className="container max-w-3xl">
          <h2 id="faq-heading" className="text-2xl font-bold mb-6">Popular Questions</h2>
          <div className="space-y-3">
            {POPULAR_FAQS.map((faq, i) => (
              <details key={i} className="group rounded-xl border border-[--color-border] bg-white overflow-hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-[--color-text-primary] hover:bg-[--color-neutral-50] transition-colors list-none">
                  <span>{faq.q}</span>
                  <svg className="h-4 w-4 text-[--color-text-muted] group-open:rotate-180 transition-transform shrink-0 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-4 pb-4 text-sm text-[--color-text-muted] border-t border-[--color-border] pt-3 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/support/faq"
              className="text-sm font-semibold text-[--color-brand-primary] hover:underline"
            >
              View all FAQs →
            </Link>
          </div>
        </div>
      </section>

      {/* Still need help */}
      <section className="section-sm bg-[--color-brand-primary] text-white">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
          <p className="text-white/80 mb-6">Our shade experts are ready to assist you.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/contact" className="px-6 py-2.5 rounded-xl bg-[--color-brand-accent] text-[--color-neutral-900] font-bold hover:bg-[--color-brand-accent-dark] transition-colors">
              Send a Message
            </Link>
            <a href="tel:18007423370" className="px-6 py-2.5 rounded-xl border-2 border-white text-white font-bold hover:bg-white hover:text-[--color-brand-primary] transition-colors">
              Call Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
