"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import {
  defaultCurrencyForLocale,
  defaultUnitsForLocale,
  DISPLAY_CURRENCIES,
  regionalPricingDefaults,
  type MeasurementUnit,
} from "@/i18n/format";

interface LocaleSettings {
  locale: Locale;
  country: string;
  currency: string;
  units: MeasurementUnit;
  setCurrency: (currency: string) => void;
  setUnits: (units: MeasurementUnit) => void;
}

const LocaleContext = createContext<LocaleSettings>({
  locale: DEFAULT_LOCALE,
  country: "US",
  currency: "USD",
  units: "imperial",
  setCurrency: () => {},
  setUnits: () => {},
});

function subscribePreferences(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("site-preferences-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("site-preferences-change", onChange);
  };
}

function savedCurrency() {
  return localStorage.getItem("display-currency") ?? "";
}

function savedUnits() {
  return localStorage.getItem("measurement-units") ?? "";
}

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const storedCurrency = useSyncExternalStore(subscribePreferences, savedCurrency, () => "");
  const storedUnits = useSyncExternalStore(subscribePreferences, savedUnits, () => "");
  const currency = storedCurrency && DISPLAY_CURRENCIES.includes(storedCurrency)
    ? storedCurrency
    : defaultCurrencyForLocale(locale);
  const units: MeasurementUnit = storedUnits === "metric" || storedUnits === "imperial"
    ? storedUnits
    : defaultUnitsForLocale(locale);
  const country = regionalPricingDefaults(locale).country;
  const setCurrency = useCallback((value: string) => {
    if (!DISPLAY_CURRENCIES.includes(value)) {
      throw new RangeError(`Unsupported display currency: ${value}`);
    }
    localStorage.setItem("display-currency", value);
    window.dispatchEvent(new Event("site-preferences-change"));
  }, []);
  const setUnits = useCallback((value: MeasurementUnit) => {
    localStorage.setItem("measurement-units", value);
    window.dispatchEvent(new Event("site-preferences-change"));
  }, []);

  const value = useMemo(
    () => ({ locale, country, currency, units, setCurrency, setUnits }),
    [locale, country, currency, units, setCurrency, setUnits],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocaleSettings(): LocaleSettings {
  return useContext(LocaleContext);
}
