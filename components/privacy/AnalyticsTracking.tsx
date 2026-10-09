"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const CONSENT_KEY = "shadesology-consent-v1";
const SCRIPT_ID = "shadesology-google-analytics";

type AnalyticsEventDetail = {
  event?: string;
  page?: string;
  occurredAt?: string;
  [key: string]: unknown;
};

type AnalyticsWindow = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
};

function hasAnalyticsConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? JSON.parse(raw).analytics === true : false;
  } catch {
    return false;
  }
}

function gaEventName(event: string) {
  switch (event) {
    case "primary_cta_click":
      return "select_content";
    case "quote_started":
    case "quote_submitted":
    case "contact_submitted":
    case "service_request_submitted":
    case "warranty_registered":
    case "chat_message_submitted":
    case "installer_lead_submitted":
      return "generate_lead";
    case "checkout_started":
      return "begin_checkout";
    default:
      return event;
  }
}

export function AnalyticsTracking() {
  const pathname = usePathname();

  useEffect(() => {
    if (!MEASUREMENT_ID || !/^G-[A-Z0-9]+$/i.test(MEASUREMENT_ID)) return;
    const analyticsWindow = window as AnalyticsWindow;
    let wasAnalyticsGranted = false;

    const ensureGoogleTag = () => {
      if (!analyticsWindow.gtag) {
        analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
        analyticsWindow.gtag = (...args: unknown[]) => {
          analyticsWindow.dataLayer?.push(args);
        };
        analyticsWindow.gtag("consent", "default", {
          analytics_storage: "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        });
        analyticsWindow.gtag("js", new Date());
        analyticsWindow.gtag("config", MEASUREMENT_ID, { send_page_view: false });
      }
      if (!document.getElementById(SCRIPT_ID)) {
        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
        document.head.appendChild(script);
      }
    };

    const syncConsent = () => {
      if (hasAnalyticsConsent()) {
        ensureGoogleTag();
        analyticsWindow.gtag?.("consent", "update", {
          analytics_storage: "granted",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        });
        if (!wasAnalyticsGranted) {
          analyticsWindow.gtag?.("event", "page_view", {
            page_path: pathname,
            page_location: window.location.href,
          });
        }
        wasAnalyticsGranted = true;
      } else {
        analyticsWindow.gtag?.("consent", "update", {
          analytics_storage: "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        });
        wasAnalyticsGranted = false;
      }
    };

    const onConversion = (event: Event) => {
      if (!hasAnalyticsConsent()) return;
      const detail = (event as CustomEvent<AnalyticsEventDetail>).detail;
      if (!detail?.event) return;
      ensureGoogleTag();
      const parameters = Object.fromEntries(
        Object.entries(detail).filter(([key]) => !["event", "page", "occurredAt"].includes(key)),
      );
      analyticsWindow.gtag?.("event", gaEventName(detail.event), {
        ...parameters,
        page_location: detail.page ? new URL(detail.page, window.location.origin).toString() : window.location.href,
      });
    };

    syncConsent();
    window.addEventListener("shadesology:conversion", onConversion);
    window.addEventListener("shadesology:consent-updated", syncConsent);
    window.addEventListener("storage", syncConsent);
    return () => {
      window.removeEventListener("shadesology:conversion", onConversion);
      window.removeEventListener("shadesology:consent-updated", syncConsent);
      window.removeEventListener("storage", syncConsent);
    };
  }, [pathname]);

  return null;
}
