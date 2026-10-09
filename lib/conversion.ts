export type ConversionEvent =
  | "primary_cta_click"
  | "quote_started"
  | "quote_submitted"
  | "contact_submitted"
  | "service_request_submitted"
  | "warranty_registered"
  | "chat_message_submitted"
  | "checkout_started"
  | "view_item"
  | "purchase"
  | "installer_lead_submitted";

export interface AnalyticsItem {
  item_id?: string;
  item_name: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
}

export function hasOptionalTrackingConsent() {
  try {
    const raw = window.localStorage.getItem("shadesology-consent-v1");
    if (!raw) return false;
    const consent = JSON.parse(raw) as { analytics?: unknown; marketing?: unknown };
    return consent.analytics === true || consent.marketing === true;
  } catch {
    return false;
  }
}

export function trackConversion(
  event: ConversionEvent,
  details: Record<string, string | number | AnalyticsItem[]> = {},
) {
  if (typeof window === "undefined" || !hasOptionalTrackingConsent()) return;
  window.dispatchEvent(new CustomEvent("shadesology:conversion", {
    detail: { event, ...details, page: window.location.pathname, occurredAt: new Date().toISOString() },
  }));
}

export function trackConversionOnce(
  event: ConversionEvent,
  key: string,
  details: Record<string, string | number | AnalyticsItem[]> = {},
) {
  if (typeof window === "undefined" || !hasOptionalTrackingConsent()) return;
  const storageKey = `shadesology:conversion:${event}:${key}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, "1");
  } catch (error) {
    console.warn("[Analytics] Could not persist conversion de-duplication key:", error);
  }
  trackConversion(event, details);
}
