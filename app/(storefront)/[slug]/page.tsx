import { getLegalPage, t } from "@/lib/api";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRequestLocale } from "@/i18n/server";
import { formatDate } from "@/i18n/format";
import { hasFieldTranslation, metadataAlternates } from "@/i18n/messages";
import { DEFAULT_LOCALE, LOCALE_TAGS } from "@/i18n/config";

// Handles: /privacy, /terms, /refunds, /accessibility, /cookie-policy, /shipping-policy
// These slugs are served from the LegalPage collection via /api/content/pages/:slug

const LEGAL_SLUGS = new Set([
  "privacy",
  "terms",
  "refunds",
  "accessibility",
  "cookie-policy",
  "shipping-policy",
]);

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const locale = await getRequestLocale();
    const page = await getLegalPage(slug);
    const metadataFields = [page.metaTitle, page.metaDescription, page.title, page.content];
    const translatedLocales = (["es", "de", "it", "fr", "pt"] as const)
      .filter((candidate) => metadataFields.some((field) => hasFieldTranslation(field, candidate)));
    const metadataLocale = translatedLocales.some((candidate) => candidate === locale) ? locale : DEFAULT_LOCALE;
    return {
      title: page.metaTitle ? t(page.metaTitle, locale) : `${t(page.title, locale)} | Shadesology`,
      description: page.metaDescription ? t(page.metaDescription, locale) : undefined,
      alternates: metadataAlternates(`/${slug}`, locale, translatedLocales),
      openGraph: { locale: LOCALE_TAGS[metadataLocale].replace("-", "_") },
      robots: page.noindex ? "noindex" : undefined,
    };
  } catch {
    return { title: "Page | Shadesology" };
  }
}

export const revalidate = 3600;

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getRequestLocale();

  if (!LEGAL_SLUGS.has(slug)) {
    notFound();
  }

  let page;
  try {
    page = await getLegalPage(slug);
  } catch {
    notFound();
  }

  return (
    <article className="container py-16 max-w-3xl">
      <header className="mb-8 pb-6 border-b border-[--color-border]">
        <h1 className="text-4xl font-bold text-[--color-text-primary]">{t(page.title, locale)}</h1>
        {page.lastReviewedAt && (
          <p className="text-sm text-[--color-text-muted] mt-2">
            Last reviewed:{" "}
            {formatDate(page.lastReviewedAt, locale)}
          </p>
        )}
      </header>
      <div
        className="prose prose-neutral max-w-none text-[--color-text-muted] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: t(page.content, locale) }}
      />
    </article>
  );
}
