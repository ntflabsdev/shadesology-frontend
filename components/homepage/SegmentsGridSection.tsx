import { HomepageSection, t } from "@/lib/api";
import { getSegments } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { getRequestLocale } from "@/i18n/server";

interface Props {
  section: HomepageSection;
}

const SEGMENT_ICONS: Record<string, string> = {
  "residential-home":           "🏠",
  "residential-outdoor-living": "🌿",
  "residential-poolside":       "🏊",
  "residential-balcony-terrace":"🌇",
  "commercial-hospitality":     "🏨",
  "commercial-restaurant-cafe": "☕",
  "commercial-retail":          "🛍️",
  "commercial-office":          "🏢",
  "commercial-healthcare":      "🏥",
  "commercial-education":       "🎓",
  "commercial-government":      "🏛️",
  "commercial-sports-recreation":"⚽",
  "commercial-industrial":      "🏭",
  "commercial-property-management":"🔑",
};

export async function SegmentsGridSection({ section }: Props) {
  const locale = await getRequestLocale();
  const segments = await getSegments();

  return (
    <section className="section" aria-labelledby="segments-heading">
      <div className="container">
        <header className="text-center mb-12">
          <h2 id="segments-heading" className="text-3xl md:text-4xl font-bold text-[--color-text-primary] mb-3">
            {t(section.sectionTitle, locale) || "Shade for Every Setting"}
          </h2>
          {section.sectionSubtitle && (
            <p className="text-lg text-[--color-text-muted] max-w-2xl mx-auto">
              {t(section.sectionSubtitle, locale)}
            </p>
          )}
        </header>

        <ul
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4"
          role="list"
          aria-label="Market segments"
        >
          {segments.map((seg) => {
            const icon = SEGMENT_ICONS[seg.slug] ?? "☀️";
            const imgUrl = seg.heroImage?.url;
            return (
              <li key={seg._id}>
                <Link
                  href={`/segments/${seg.slug}`}
                  className="group flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-[--color-neutral-50] border border-[--color-border] hover:border-[--color-brand-primary] hover:bg-white hover:shadow-md transition-all duration-200"
                >
                  {imgUrl ? (
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-1">
                      <Image
                        src={imgUrl}
                        alt={seg.heroImage ? t(seg.heroImage.alt, locale) || t(seg.name, locale) : t(seg.name, locale)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, 15vw"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <span className="text-3xl" aria-hidden="true">{icon}</span>
                  )}
                  <span className="text-xs font-semibold text-[--color-text-primary] group-hover:text-[--color-brand-primary] transition-colors leading-tight">
                    {t(seg.name, locale)}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${seg.audience === "commercial" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>
                    {seg.audience}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
