import type { MetadataRoute } from "next";
import { getSitemap } from "@/lib/api";
import { DEFAULT_LOCALE, LOCALE_TAGS, LOCALES, isLocale, localizedPath } from "@/i18n/config";
import { routeTranslation } from "@/i18n/messages";

const SITE_URL = "https://shadesology.com";
export const dynamic = "force-dynamic";

interface SitemapEntry {
  url: string;
  translations?: string[];
  images?: { url: string; title: string }[];
  video?: { url: string; title: string; description: string; thumbnailUrl?: string } | null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getSitemap();
  const entries: SitemapEntry[] = [
    ...data.static,
    ...data.categories,
    ...data.products,
    ...data.segments,
    ...data.legal,
    ...data.projects,
    ...data.videos,
  ];

  return entries.flatMap((entry) => {
    const parsed = new URL(entry.url, SITE_URL);
    if (parsed.origin !== SITE_URL) {
      throw new Error(`Sitemap URL must be on ${SITE_URL}.`);
    }
    const pathname = parsed.pathname;
    const languages: Record<string, string> = {
      en: new URL(localizedPath(pathname, DEFAULT_LOCALE), SITE_URL).toString(),
      "x-default": new URL(localizedPath(pathname, DEFAULT_LOCALE), SITE_URL).toString(),
    };
    const availableTranslations = new Set(
      "translations" in entry && Array.isArray(entry.translations)
        ? entry.translations.filter(isLocale)
        : [],
    );
    const translatedLocales = LOCALES.filter((locale) =>
      locale !== DEFAULT_LOCALE &&
      (availableTranslations.has(locale) || Boolean(routeTranslation(locale, pathname)))
    );
    for (const locale of LOCALES) {
      if (locale !== DEFAULT_LOCALE && translatedLocales.includes(locale)) {
        languages[LOCALE_TAGS[locale]] = new URL(localizedPath(pathname, locale), SITE_URL).toString();
      }
    }
    const mediaMetadata = {
      ...(entry.images?.length ? { images: entry.images.map((image) => image.url) } : {}),
      ...(entry.video?.thumbnailUrl
        ? {
            videos: [{
              title: entry.video.title,
              description: entry.video.description,
              thumbnail_loc: entry.video.thumbnailUrl,
              player_loc: entry.video.url,
            }],
          }
        : {}),
    };
    return [
      {
        url: new URL(pathname, SITE_URL).toString(),
        alternates: { languages },
        ...mediaMetadata,
      },
      ...translatedLocales.map((locale) => ({
        url: new URL(localizedPath(pathname, locale), SITE_URL).toString(),
        alternates: { languages },
        ...mediaMetadata,
      })),
    ];
  });
}
