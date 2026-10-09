import { getHomepageSections } from "@/lib/api";
import { HeroSection } from "@/components/homepage/HeroSection";
import { ProductOverviewSection } from "@/components/homepage/ProductOverviewSection";
import { SegmentsGridSection } from "@/components/homepage/SegmentsGridSection";
import { FeaturedProductsSection } from "@/components/homepage/FeaturedProductsSection";
import { FeaturedProjectsSection } from "@/components/homepage/FeaturedProjectsSection";
import { TrustBandSection } from "@/components/homepage/TrustBandSection";
import { InstallerLocatorSection } from "@/components/homepage/InstallerLocatorSection";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { HomepageSection } from "@/lib/api";
import type { Metadata } from "next";
import { getRequestLocale } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Shadesology — Premium Custom Shade Solutions",
  description:
    "Custom retractable awnings, pergolas, louvered roofs, shade sails, screens and more — made to order for residential and commercial spaces.",
};

// Revalidate every 5 minutes
export const revalidate = 300;

function renderSection(section: HomepageSection, locale: Awaited<ReturnType<typeof getRequestLocale>>) {
  switch (section.type) {
    case "hero":
      return <HeroSection key={section._id} section={section} />;
    case "product_overview":
      return <ProductOverviewSection key={section._id} section={section} />;
    case "segments_grid":
      return <SegmentsGridSection key={section._id} section={section} />;
    case "featured_products":
      return <FeaturedProductsSection key={section._id} section={section} />;
    case "featured_projects":
      return <FeaturedProjectsSection key={section._id} section={section} />;
    case "trust_band":
      return <TrustBandSection key={section._id} section={section} />;
    case "installer_locator":
      return <InstallerLocatorSection key={section._id} section={section} />;
    case "rich_content": {
      const body = section.payloadRichText?.[locale] || section.payloadRichText?.en;
      if (!body || typeof body !== "object") return null;
      return (
        <section key={section._id} className="section">
          <div className="container prose prose-neutral max-w-none">
            <RichText data={body} />
          </div>
        </section>
      );
    }
    case "custom_html":
      if (!section.content?.[locale] && !section.content?.en) return null;
      return (
        <section key={section._id} className="section">
          <div
            className="container prose prose-neutral max-w-none"
            dangerouslySetInnerHTML={{ __html: section.content[locale] || section.content.en }}
          />
        </section>
      );
    default:
      return null;
  }
}

export default async function HomePage() {
  const locale = await getRequestLocale();
  const sections = await getHomepageSections();
  const active = sections
    .filter((s) => s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      {active.map((section) => renderSection(section, locale))}
    </>
  );
}
