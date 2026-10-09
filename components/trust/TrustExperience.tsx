"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { trackConversion } from "@/lib/conversion";

export function TrustBadges() {
  return (
    <ul aria-label="Shopping assurances" className="flex flex-wrap justify-center gap-x-6 gap-y-2 border-y border-[--color-border] bg-[--color-neutral-50] px-4 py-3 text-xs font-semibold text-[--color-text-muted]">
      <li>Secure checkout</li>
      <li>Protected payment</li>
      <li><Link href="/warranty" className="hover:text-[--color-brand-primary]">Product warranty</Link></li>
      <li><Link href="/support" className="hover:text-[--color-brand-primary]">Expert support</Link></li>
    </ul>
  );
}

export function CertificationBadge({ label, issuer }: { label: string; issuer?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[--color-border] bg-white px-3 py-1.5 text-xs font-semibold" aria-label={issuer ? `${label}, issued by ${issuer}` : label}>
      <span aria-hidden="true" className="text-[--color-brand-primary]">✓</span>
      {label}{issuer ? <span className="font-normal text-[--color-text-muted]">· {issuer}</span> : null}
    </span>
  );
}

export function WarrantyBadge({ label = "Warranty information available" }: { label?: string }) {
  return <Link href="/warranty" className="inline-flex items-center gap-2 rounded-full border border-[--color-border] bg-white px-3 py-1.5 text-xs font-semibold hover:text-[--color-brand-primary]"><span aria-hidden="true">🛡</span>{label}</Link>;
}

export function ConversionTracking() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const action = target.closest<HTMLElement>("[data-conversion-event]");
      if (action?.dataset.conversionEvent === "primary_cta_click") {
        trackConversion("primary_cta_click", { label: (action.textContent || "").trim().slice(0, 80) });
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}

export function TrustExperience() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const key = "shadesology:cta-shown-at";
    try {
      const dismissedAt = Number(window.localStorage.getItem(key) || 0);
      if (Date.now() - dismissedAt < 24 * 60 * 60 * 1000) {
        return;
      }
    } catch (err) {
      console.warn("[TrustExperience] Frequency cap storage unavailable:", err);
    }
    const reveal = () => {
      setVisible(true);
      try {
        window.localStorage.setItem(key, String(Date.now()));
      } catch (err) {
        console.warn("[TrustExperience] Could not store CTA frequency cap:", err);
      }
    };
    const timer: ReturnType<typeof setTimeout> = setTimeout(reveal, 12_000);
    const exitIntent = (event: MouseEvent) => {
      if (event.clientY <= 0) reveal();
    };
    document.addEventListener("mouseout", exitIntent);
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("mouseout", exitIntent);
    };
  }, []);

  if (dismissed || !visible) return null;
  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-[--color-border] bg-white p-3 shadow-lg" aria-label="Get expert product help">
      <div className="container flex items-center justify-between gap-3">
        <p className="text-sm font-medium">Need help choosing a shade solution?</p>
        <div className="flex gap-2">
          <Link href="/quote" data-conversion-event="primary_cta_click" className="rounded-lg bg-[--color-brand-primary] px-4 py-2 text-sm font-semibold text-white">Get expert help</Link>
          <button type="button" aria-label="Dismiss help offer" onClick={() => setDismissed(true)} className="rounded-lg border px-3 py-2 text-sm">Dismiss</button>
        </div>
      </div>
    </aside>
  );
}
