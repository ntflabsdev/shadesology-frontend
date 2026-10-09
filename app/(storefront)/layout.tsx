import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { ConversionTracking, TrustBadges, TrustExperience } from "@/components/trust/TrustExperience";
import { ChatWidget } from "@/components/support/ChatWidget";
import { getMainNav, getFooter } from "@/lib/api";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { DEFAULT_LOCALE, LOCALES, LOCALE_TAGS, isLocale, localizedPath, type Locale } from "@/i18n/config";
import { routeTranslation } from "@/i18n/messages";
import { CookieConsent } from "@/components/privacy/CookieConsent";
import { MarketingPixels } from "@/components/privacy/MarketingPixels";
import { AnalyticsTracking } from "@/components/privacy/AnalyticsTracking";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const SITE_URL = "https://shadesology.com";
const SITE_ENTITY_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Shadesology",
      url: SITE_URL,
      email: "hello@shadesology.com",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Shadesology",
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const localeValue = requestHeaders.get("x-site-locale") ?? DEFAULT_LOCALE;
  const locale: Locale = isLocale(localeValue) ? localeValue : DEFAULT_LOCALE;
  const pathname = requestHeaders.get("x-site-route-path") || "/";
  const translation = routeTranslation(locale, pathname);
  const effectiveLocale = translation ? locale : DEFAULT_LOCALE;
  const canonicalPath = localizedPath(pathname, effectiveLocale);
  const languages: Record<string, string> = {
    en: localizedPath(pathname, DEFAULT_LOCALE),
    "x-default": localizedPath(pathname, DEFAULT_LOCALE),
  };

  for (const candidate of LOCALES) {
    if (candidate !== DEFAULT_LOCALE && routeTranslation(candidate, pathname)) {
      languages[LOCALE_TAGS[candidate]] = localizedPath(pathname, candidate);
    }
  }

  return {
    title: translation?.title ?? {
      default: "Shadesology — Premium Custom Shade Solutions",
      template: "%s | Shadesology",
    },
    description: translation?.description ??
      "Custom retractable awnings, pergolas, louvered roofs, shade sails, screens and more — made to order for residential and commercial spaces.",
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: canonicalPath,
      languages,
    },
    openGraph: {
      type: "website",
      locale: LOCALE_TAGS[effectiveLocale].replace("-", "_"),
      siteName: "Shadesology",
      images: [{ url: "/opengraph-image" }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const localeValue = requestHeaders.get("x-site-locale") ?? DEFAULT_LOCALE;
  const requestedLocale: Locale = isLocale(localeValue) ? localeValue : DEFAULT_LOCALE;
  const pathname = requestHeaders.get("x-site-route-path") || "/";
  const locale = routeTranslation(requestedLocale, pathname) ? requestedLocale : DEFAULT_LOCALE;

  // Fetch nav & footer at layout level — both are cached by Next.js
  const [nav, footer] = await Promise.all([getMainNav(), getFooter()]);

  return (
    <html lang={locale} className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Script
          id="site-entity-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_ENTITY_JSONLD).replace(/</g, "\\u003c") }}
        />
        {/* Skip to main content — WCAG 2.1 AA */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <LocaleProvider locale={requestedLocale}>
          <ToastProvider>
            <Header nav={nav} />
            <TrustBadges />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <Footer footer={footer} />
            <CookieConsent />
            <AnalyticsTracking />
            <MarketingPixels />
            <ChatWidget />
            <TrustExperience />
            <ConversionTracking />
          </ToastProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
