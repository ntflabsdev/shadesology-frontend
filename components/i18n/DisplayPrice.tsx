"use client";

import { formatCurrency } from "@/i18n/format";
import { useLocaleSettings } from "./LocaleProvider";

export function DisplayPrice({
  amount,
  sourceCurrency = "USD",
  className,
}: {
  amount: number;
  sourceCurrency?: string;
  className?: string;
}) {
  const { locale, currency } = useLocaleSettings();
  return <span className={className}>{formatCurrency(amount, sourceCurrency, currency, locale)}</span>;
}
