import { DEFAULT_LOCALE, LOCALE_TAGS, type Locale } from "./config";

export type MeasurementUnit = "imperial" | "metric";

const configuredRates: unknown = process.env.NEXT_PUBLIC_DISPLAY_CURRENCY_RATES
  ? JSON.parse(process.env.NEXT_PUBLIC_DISPLAY_CURRENCY_RATES)
  : { USD: 1 };

function validateRates(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("NEXT_PUBLIC_DISPLAY_CURRENCY_RATES must be a JSON object of currency-to-USD rates.");
  }
  const entries = Object.entries(value);
  if (!entries.length || entries.some(([code, rate]) =>
    !/^[A-Z]{3}$/.test(code) || typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0)) {
    throw new Error("NEXT_PUBLIC_DISPLAY_CURRENCY_RATES contains an invalid currency code or rate.");
  }
  if (!entries.some(([code, rate]) => code === "USD" && rate === 1)) {
    throw new Error("NEXT_PUBLIC_DISPLAY_CURRENCY_RATES must include USD: 1.");
  }
  return Object.fromEntries(entries) as Record<string, number>;
}

export const DISPLAY_CURRENCY_RATES = validateRates(configuredRates);
export const DISPLAY_CURRENCIES = Object.keys(DISPLAY_CURRENCY_RATES).sort();

const REGIONAL_DEFAULTS: Record<Locale, { country: string; currency: string }> = {
  en: { country: "US", currency: "USD" },
  es: { country: "ES", currency: "EUR" },
  de: { country: "DE", currency: "EUR" },
  it: { country: "IT", currency: "EUR" },
  fr: { country: "FR", currency: "EUR" },
  pt: { country: "PT", currency: "EUR" },
};

export function regionalPricingDefaults(locale: Locale) {
  const region = REGIONAL_DEFAULTS[locale];
  const currency = DISPLAY_CURRENCY_RATES[region.currency] ? region.currency : "USD";
  return {
    country: region.country,
    currency,
    displayOnly: true as const,
    rate: DISPLAY_CURRENCY_RATES[currency],
  };
}

export function defaultCurrencyForLocale(locale: Locale): string {
  return regionalPricingDefaults(locale).currency;
}

export function defaultUnitsForLocale(locale: Locale): MeasurementUnit {
  return locale === DEFAULT_LOCALE ? "imperial" : "metric";
}

function localeTag(locale: Locale): string {
  return LOCALE_TAGS[locale] || LOCALE_TAGS[DEFAULT_LOCALE];
}

export function formatNumber(value: number, locale: Locale, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(localeTag(locale), options).format(value);
}

export function formatDate(value: Date | string | number, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(localeTag(locale), options ?? {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export function formatCurrency(
  amount: number,
  sourceCurrency: string,
  targetCurrency: string,
  locale: Locale,
): string {
  const fromRate = DISPLAY_CURRENCY_RATES[sourceCurrency];
  const toRate = DISPLAY_CURRENCY_RATES[targetCurrency];
  const canConvert = Number.isFinite(amount) && fromRate && toRate;
  const currency = canConvert ? targetCurrency : sourceCurrency;
  const convertedAmount = canConvert ? (amount / fromRate) * toRate : amount;
  return new Intl.NumberFormat(localeTag(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(convertedAmount);
}

export function formatAddress(
  address: { name?: string; line1?: string; line2?: string; city?: string; state?: string; postalCode?: string; country?: string },
  locale: Locale,
): string {
  const lines = [address.name, address.line1, address.line2].filter(Boolean) as string[];
  const locality = locale === "en"
    ? [address.city, address.state, address.postalCode]
    : [address.postalCode, address.city, address.state];
  lines.push(locality.filter(Boolean).join(" "));
  if (address.country) lines.push(address.country);
  return lines.join(", ");
}

export function formatLength(inches: number, units: MeasurementUnit, locale: Locale): string {
  const value = units === "metric" ? Math.round(inches * 2.54 * 10) / 10 : Math.round(inches * 2) / 2;
  const unit = units === "metric" ? "cm" : "in";
  return `${formatNumber(value, locale, { maximumFractionDigits: 1 })} ${unit}`;
}

export function formatLengthRange(
  minimum: number | undefined,
  maximum: number | undefined,
  units: MeasurementUnit,
  locale: Locale,
  dimension?: string,
): string {
  if (minimum == null && maximum == null) return "";
  const min = minimum == null ? undefined : formatLength(minimum, units, locale);
  const max = maximum == null ? undefined : formatLength(maximum, units, locale);
  const range = min === max ? min : min && max ? `${min}–${max}` : min ?? max;
  if (!range) return "";
  return dimension ? `${dimension} ${range}` : range;
}
