import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQs | Shadesology Support",
  description: "Answers to the most common questions about Shadesology products, ordering, installation and warranties.",
};

export const revalidate = 3600;

interface FAQ {
  _id: string;
  question: { en: string };
  answer: { en: string };
  tags?: string[];
  includeInSchema?: boolean;
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function getFaqs(query = ""): Promise<FAQ[]> {
  try {
    const search = query ? `?q=${encodeURIComponent(query)}` : "";
    const res = await fetch(`${BASE}/api/content/faqs${search}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

// Fallback static FAQs shown when API is unavailable or empty
const STATIC_FAQS: { category: string; items: { q: string; a: string }[] }[] = [
  {
    category: "Ordering & Delivery",
    items: [
      {
        q: "How long does delivery take?",
        a: "Made-to-order products typically ship within 10–21 business days depending on the product and customisations. The estimated delivery date is shown on each product page and confirmed in your order confirmation.",
      },
      {
        q: "Can I change or cancel my order after placing it?",
        a: "Changes can be requested within 24 hours of ordering. Made-to-order products enter production quickly, so contact us immediately if you need to make changes. Cancellations after production starts are subject to our cancellation policy.",
      },
      {
        q: "Do you ship internationally?",
        a: "Currently we ship within the contiguous United States. Hawaii, Alaska and international shipping is available by special arrangement — contact us for a quote.",
      },
    ],
  },
  {
    category: "Products & Customisation",
    items: [
      {
        q: "Are your products custom-made?",
        a: "Yes — most of our products are made to order. You select the dimensions, frame colour, fabric, and operation type. Each product is manufactured to your exact specifications.",
      },
      {
        q: "Can I request a fabric sample?",
        a: "Yes. Many fabrics in our range offer free sample swatches. Find the fabric on the product page and look for the 'Request Sample' option, or contact our team.",
      },
      {
        q: "What is the maximum size available?",
        a: "Dimensions vary by product type. Retractable awnings can reach up to 49 ft wide. Each product page lists the available size range for that model.",
      },
    ],
  },
  {
    category: "Installation",
    items: [
      {
        q: "Do you offer professional installation?",
        a: "Yes — our certified installer network covers most of the country. Use our Find an Installer tool to locate a professional near you. We recommend professional installation to maintain your warranty.",
      },
      {
        q: "Can I install it myself?",
        a: "Most products include detailed installation instructions and can be DIY-installed. Note that DIY installation may affect the frame warranty. Read the warranty terms for your product before proceeding.",
      },
      {
        q: "What fixings do I need?",
        a: "The required fixings depend on your wall type (masonry, timber frame, metal). The installation manual specifies the requirements. If in doubt, consult a certified installer.",
      },
    ],
  },
  {
    category: "Trade & Dealer",
    items: [
      {
        q: "How do I get a trade or dealer price?",
        a: "Apply through our Dealer Program page. Our team reviews applications and assigns an approved pricing tier. Pricing is not available via self-selection — it is granted after approval only.",
      },
      {
        q: "Can architects and specifiers access CAD/BIM files?",
        a: "Yes — register as a specifier through our Specifier Portal. Once verified, you get access to our full CAD/BIM library, CSI specs and engineering data.",
      },
    ],
  },
];

export default async function FaqPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().slice(0, 100);
  const apiFaqs = await getFaqs(query);
  const hasDynamicFaqs = apiFaqs.length > 0;
  const staticItems = STATIC_FAQS.map((group) => ({
    ...group,
    items: group.items.filter((faq) => !query || `${faq.q} ${faq.a}`.toLowerCase().includes(query.toLowerCase())),
  })).filter((group) => group.items.length > 0);
  const structuredFaqs = hasDynamicFaqs
    ? apiFaqs.filter((faq) => faq.includeInSchema !== false).map((faq) => ({ question: faq.question?.en ?? "", answer: faq.answer?.en ?? "" }))
    : staticItems.flatMap((group) => group.items.map((faq) => ({ question: faq.q, answer: faq.a })));

  return (
    <>
      <Script id="faq-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: structuredFaqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }).replace(/</g, "\\u003c"),
      }} />
      <header className="bg-[--color-brand-primary] text-white py-14">
        <div className="container max-w-3xl">
          <nav aria-label="Breadcrumb" className="text-sm text-white/60 mb-4">
            <Link href="/support" className="hover:text-white transition-colors">Support</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-white">FAQs</span>
          </nav>
          <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-white/80">Everything you need to know about our products and services.</p>
        </div>
      </header>

      <div className="container max-w-3xl py-14">
        <form action="/support/faq" role="search" aria-label="Search support FAQs" className="mb-8 flex gap-3">
          <label htmlFor="faq-search" className="sr-only">Search questions</label>
          <input id="faq-search" name="q" type="search" maxLength={100} defaultValue={query} placeholder="Search questions and answers" className="min-w-0 flex-1 rounded-xl border border-[--color-border] px-4 py-3" />
          <button className="rounded-xl bg-[--color-brand-primary] px-5 py-3 font-semibold text-white">Search</button>
          {query && <Link href="/support/faq" className="self-center text-sm underline">Clear</Link>}
        </form>
        {hasDynamicFaqs ? (
          // Live FAQs from the database
          <div className="space-y-3">
            {apiFaqs.map((faq) => (
              <details
                key={faq._id}
                className="group rounded-xl border border-[--color-border] bg-white overflow-hidden"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-[--color-text-primary] hover:bg-[--color-neutral-50] transition-colors list-none">
                  <span>{faq.question?.en ?? ""}</span>
                  <svg
                    className="h-4 w-4 text-[--color-text-muted] group-open:rotate-180 transition-transform shrink-0 ml-4"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-5 pb-5 pt-3 text-sm text-[--color-text-muted] leading-relaxed border-t border-[--color-border]">
                  {faq.answer?.en ?? ""}
                </p>
                {faq.tags?.length ? <div className="flex gap-2 px-5 pb-4">{faq.tags.map((tag) => <span key={tag} className="rounded-full bg-gray-100 px-2 py-1 text-xs capitalize text-gray-700">{tag.replaceAll("_", " ")}</span>)}</div> : null}
              </details>
            ))}
          </div>
        ) : (
          // Static fallback categories
          <div className="space-y-12">
            {staticItems.map((group) => (
              <section key={group.category} aria-labelledby={`faq-${group.category.toLowerCase().replace(/\s+/g, "-")}`}>
                <h2
                  id={`faq-${group.category.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-xl font-bold text-[--color-text-primary] mb-4 pb-2 border-b border-[--color-border]"
                >
                  {group.category}
                </h2>
                <div className="space-y-3">
                  {group.items.map((faq, i) => (
                    <details
                      key={i}
                      className="group rounded-xl border border-[--color-border] bg-white overflow-hidden"
                    >
                      <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-[--color-text-primary] hover:bg-[--color-neutral-50] transition-colors list-none">
                        <span>{faq.q}</span>
                        <svg
                          className="h-4 w-4 text-[--color-text-muted] group-open:rotate-180 transition-transform shrink-0 ml-4"
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <p className="px-5 pb-5 pt-3 text-sm text-[--color-text-muted] leading-relaxed border-t border-[--color-border]">
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
        {!hasDynamicFaqs && staticItems.length === 0 && <p role="status" className="rounded-lg border p-6 text-center text-[--color-text-muted]">No answers matched that search. Try different words or <Link href="/contact" className="underline">contact our support team</Link>.</p>}

        <div className="mt-12 bg-[--color-brand-primary] text-white rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Still have a question?</h2>
          <p className="text-white/80 mb-5">Our shade experts are happy to help.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-[--color-brand-accent] text-[--color-neutral-900] font-bold hover:bg-[--color-brand-accent-dark] transition-colors"
            >
              Contact Us
            </Link>
            <a
              href="tel:18007423370"
              className="px-5 py-2.5 rounded-xl border-2 border-white text-white font-bold hover:bg-white hover:text-[--color-brand-primary] transition-colors"
            >
              Call 1-800-SHADES-0
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
