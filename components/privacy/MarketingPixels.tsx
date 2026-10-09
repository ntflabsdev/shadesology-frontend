"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const SCRIPT_ID = "shadesology-meta-pixel";

function marketingConsent() {
  try {
    const raw = localStorage.getItem("shadesology-consent-v1");
    return raw ? JSON.parse(raw).marketing === true : false;
  } catch {
    return false;
  }
}

export function MarketingPixels() {
  const pathname = usePathname();

  useEffect(() => {
    if (!PIXEL_ID) return;
    let consentWasGranted = false;
    const onConversion = (event: Event) => {
      if (!marketingConsent()) return;
      const detail = (event as CustomEvent<{ event?: string }>).detail;
      if (detail?.event) {
        const w = window as Window & { fbq?: (...args: unknown[]) => void };
        w.fbq?.("trackCustom", detail.event);
      }
    };
    const syncConsent = () => {
      const w = window as Window & { fbq?: (...args: unknown[]) => void; _fbq?: unknown };
      if (!marketingConsent()) {
        w.fbq?.("consent", "revoke");
        consentWasGranted = false;
        return;
      }
      if (!w.fbq) {
        const fbq = (...args: unknown[]) => {
          const queue = fbq as typeof fbq & { callMethod?: (...values: unknown[]) => void; queue?: unknown[][]; loaded?: boolean; version?: string };
          if (queue.callMethod) queue.callMethod(...args);
          else (queue.queue ??= []).push(args);
        };
        const pixel = fbq as typeof fbq & { queue?: unknown[][]; loaded?: boolean; version?: string };
        pixel.queue = [];
        pixel.loaded = true;
        pixel.version = "2.0";
        w.fbq = pixel;
        w._fbq = pixel;
        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.async = true;
        script.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.appendChild(script);
        w.fbq("init", PIXEL_ID);
      }
      w.fbq("consent", "grant");
      if (!consentWasGranted) {
        w.fbq("track", "PageView");
        consentWasGranted = true;
      }
    };
    syncConsent();
    window.addEventListener("shadesology:conversion", onConversion);
    window.addEventListener("shadesology:consent-updated", syncConsent);
    window.addEventListener("storage", syncConsent);
    return () => {
      window.removeEventListener("shadesology:consent-updated", syncConsent);
      window.removeEventListener("storage", syncConsent);
      window.removeEventListener("shadesology:conversion", onConversion);
    };
  }, [pathname]);

  return null;
}
