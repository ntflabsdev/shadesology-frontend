import en from "./messages/en.json";
import es from "./messages/es.json";
import de from "./messages/de.json";
import it from "./messages/it.json";
import fr from "./messages/fr.json";
import pt from "./messages/pt.json";
import { DEFAULT_LOCALE, LOCALE_TAGS, LOCALES, localizedPath, type Locale } from "./config";

export type TranslationValue = string | { [key: string]: TranslationValue };
export type TranslationFile = { [key: string]: TranslationValue };

const dictionaries: Record<Locale, TranslationFile> = { en, es, de, it, fr, pt };

function readKey(dictionary: TranslationFile, key: string): string | undefined {
  const value = key.split(".").reduce<TranslationValue | undefined>(
    (current, part) => (current && typeof current === "object" ? current[part] : undefined),
    dictionary,
  );
  return typeof value === "string" ? value : undefined;
}

export function translate(key: string, locale: Locale): string {
  return readKey(dictionaries[locale], key) ?? readKey(dictionaries[DEFAULT_LOCALE], key) ?? key;
}

export function routeTranslation(locale: Locale, pathname: string): { title?: string; description?: string } | undefined {
  if (locale === DEFAULT_LOCALE) return undefined;
  const routes = dictionaries[locale].routes;
  if (!routes || typeof routes !== "object") return undefined;
  const route = routes[pathname];
  if (!route || typeof route !== "object") return undefined;
  const title = typeof route.title === "string" ? route.title : undefined;
  const description = typeof route.description === "string" ? route.description : undefined;
  return title || description ? { title, description } : undefined;
}

export function hasFieldTranslation(field: unknown, locale: Locale): boolean {
  if (!field || typeof field !== "object") return false;
  const value = (field as Record<string, unknown>)[locale];
  return typeof value === "string" && value.trim().length > 0;
}

export function metadataAlternates(pathname: string, locale: Locale, translatedLocales: Locale[]) {
  const availableLocales = new Set<Locale>([DEFAULT_LOCALE, ...translatedLocales]);
  const canonicalLocale = availableLocales.has(locale) ? locale : DEFAULT_LOCALE;
  const languages: Record<string, string> = {
    en: localizedPath(pathname, DEFAULT_LOCALE),
    "x-default": localizedPath(pathname, DEFAULT_LOCALE),
  };
  for (const candidate of LOCALES) {
    if (candidate !== DEFAULT_LOCALE && availableLocales.has(candidate)) {
      languages[LOCALE_TAGS[candidate]] = localizedPath(pathname, candidate);
    }
  }
  return {
    canonical: localizedPath(pathname, canonicalLocale),
    languages,
  };
}
