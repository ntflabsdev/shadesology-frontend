"use client";

import { isLocale, LOCALE_LABELS, LOCALES, localizedPath } from "@/i18n/config";
import { translate } from "@/i18n/messages";
import { DISPLAY_CURRENCIES } from "@/i18n/format";
import { useLocaleSettings } from "./LocaleProvider";
import { useRouter } from "next/navigation";

export function LocaleControls() {
  const router = useRouter();
  const { locale, currency, units, setCurrency, setUnits } = useLocaleSettings();

  function switchLocale(nextLocale: string) {
    if (!isLocale(nextLocale)) return;
    const nextPath = localizedPath(window.location.pathname, nextLocale);
    document.cookie = `site-locale=${nextLocale}; path=/; max-age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
    router.push(`${nextPath}${window.location.search}${window.location.hash}`);
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <label className="sr-only" htmlFor="site-language">{translate("common.language", locale)}</label>
      <select
        id="site-language"
        value={locale}
        onChange={(event) => switchLocale(event.target.value)}
        className="max-w-28 rounded border border-[--color-border] bg-white px-2 py-1.5 text-[--color-text-primary]"
      >
        {LOCALES.map((item) => <option key={item} value={item}>{LOCALE_LABELS[item]}</option>)}
      </select>

      <label className="sr-only" htmlFor="display-currency">{translate("common.displayCurrency", locale)}</label>
      <select
        id="display-currency"
        value={currency}
        onChange={(event) => setCurrency(event.target.value)}
        className="max-w-24 rounded border border-[--color-border] bg-white px-2 py-1.5 text-[--color-text-primary]"
      >
        {DISPLAY_CURRENCIES.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>

      <label className="sr-only" htmlFor="measurement-units">{translate("common.measurements", locale)}</label>
      <select
        id="measurement-units"
        value={units}
        onChange={(event) => setUnits(event.target.value as "imperial" | "metric")}
        className="max-w-32 rounded border border-[--color-border] bg-white px-2 py-1.5 text-[--color-text-primary]"
      >
        <option value="imperial">{translate("common.imperial", locale)}</option>
        <option value="metric">{translate("common.metric", locale)}</option>
      </select>
      {currency !== "USD" && (
        <p className="basis-full text-[10px] text-current">{translate("common.conversionNotice", locale)}</p>
      )}
    </div>
  );
}
