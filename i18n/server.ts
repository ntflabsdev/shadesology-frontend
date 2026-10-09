import { headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale } from "./config";

export async function getRequestLocale() {
  const locale = (await headers()).get("x-site-locale") ?? undefined;
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}
