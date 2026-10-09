import { HomepageSection, t } from "@/lib/api";
import Link from "next/link";
import { getRequestLocale } from "@/i18n/server";

interface Props {
  section: HomepageSection;
}

export async function HeroSection({ section }: Props) {
  const locale = await getRequestLocale();
  const headline = t(section.headline, locale) || "Custom Shade Solutions, Built for You";
  const sub = t(section.subheadline, locale) || "Retractable awnings, pergolas, louvered roofs and more — made to order.";
  const bg = section.backgroundImage?.url || "";

  return (
    <section
      className="relative overflow-hidden bg-[--color-brand-primary] text-white"
      aria-labelledby="hero-heading"
      style={bg ? { backgroundImage: `url('${bg}')`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
    >
      {/* Overlay */}
      {bg && <div className="absolute inset-0 bg-[--color-brand-primary]/70" aria-hidden="true" />}

      <div className="relative container py-24 lg:py-36">
        <div className="max-w-2xl">
          <h1
            id="hero-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-5"
          >
            {headline}
          </h1>
          <p className="text-lg md:text-xl text-white/85 mb-8 max-w-xl leading-relaxed">
            {sub}
          </p>
          <div className="flex flex-wrap gap-4">
            {section.cta1?.url && (
              <Link
                href={section.cta1.url}
                className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-base transition-colors ${
                  section.cta1.style === "secondary"
                    ? "bg-[--color-brand-accent] text-[--color-neutral-900] hover:bg-[--color-brand-accent-dark]"
                    : "bg-white text-[--color-brand-primary] hover:bg-[--color-neutral-100]"
                }`}
              >
                {t(section.cta1.label, locale) || "Shop Products"}
              </Link>
            )}
            {section.cta2?.url && (
              <Link
                href={section.cta2.url}
                className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-base transition-colors border-2 ${
                  section.cta2.style === "outline"
                    ? "border-white text-white hover:bg-white hover:text-[--color-brand-primary]"
                    : "border-[--color-brand-accent] bg-[--color-brand-accent] text-[--color-neutral-900] hover:bg-[--color-brand-accent-dark]"
                }`}
              >
                {t(section.cta2.label, locale) || "Request a Quote"}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Decorative wave */}
      <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
        <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 64L48 58.7C96 53 192 43 288 37.3C384 32 480 32 576 37.3C672 43 768 53 864 53.3C960 53 1056 43 1152 37.3C1248 32 1344 32 1392 32L1440 32V64H0Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
