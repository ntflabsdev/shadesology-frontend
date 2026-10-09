export const LOCALES = ["en", "es", "de", "it", "fr", "pt"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  de: "Deutsch",
  it: "Italiano",
  fr: "Français",
  pt: "Português",
};

export const LOCALE_TAGS: Record<Locale, string> = {
  en: "en-US",
  es: "es-ES",
  de: "de-DE",
  it: "it-IT",
  fr: "fr-FR",
  pt: "pt-PT",
};

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && LOCALES.includes(value as Locale));
}

export function localeFromPathname(pathname: string): Locale {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return isLocale(firstSegment) ? firstSegment : DEFAULT_LOCALE;
}

export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/");
  if (isLocale(segments[1])) {
    const remainder = `/${segments.slice(2).join("/")}`;
    return remainder === "/" ? "/" : remainder.replace(/\/+$/, "");
  }
  return pathname || "/";
}

export function localizedPath(pathname: string, locale: Locale): string {
  const cleanPath = stripLocalePrefix(pathname);
  if (locale === DEFAULT_LOCALE) return cleanPath;
  return `/${locale}${cleanPath === "/" ? "" : cleanPath}`;
}
