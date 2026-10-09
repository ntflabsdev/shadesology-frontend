"use client";

/**
 * QuotesPanel — authenticated user's quote history tab.
 * Loaded lazily inside AccountDashboard when the Quotes tab is selected.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { useLocaleSettings } from "@/components/i18n/LocaleProvider";
import { formatCurrency, formatDate } from "@/i18n/format";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuoteSummary {
  _id:             string;
  referenceNumber: string;
  status:          string;
  items:           { productName?: string; quantity: number }[];
  total?:          number | null;
  currency?:       string;
  expiresAt?:      string;
  createdAt:       string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; variant: "default" | "success" | "warning" | "error" | "accent" }> = {
  submitted: { label: "Submitted",    variant: "default"  },
  in_review: { label: "In Review",    variant: "warning"  },
  quoted:    { label: "Quote Ready",  variant: "accent"   },
  accepted:  { label: "Accepted",     variant: "success"  },
  ordered:   { label: "Ordered",      variant: "success"  },
  expired:   { label: "Expired",      variant: "error"    },
  declined:  { label: "Declined",     variant: "error"    },
};

function fmt(n: number | null | undefined, currency = "USD", locale: "en" | "es" | "de" | "it" | "fr" | "pt" = "en") {
  if (n == null) return "TBC";
  return formatCurrency(n / 100, currency, currency, locale);
}

function fmtDate(iso: string, locale: "en" | "es" | "de" | "it" | "fr" | "pt") {
  return formatDate(iso, locale, { year: "numeric", month: "short", day: "numeric" });
}

function itemSummary(items: QuoteSummary["items"]) {
  if (!items?.length) return "No items";
  const first = items[0].productName ?? "Product";
  return items.length === 1
    ? first
    : `${first} + ${items.length - 1} more`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QuotesPanel() {
  const { locale } = useLocaleSettings();
  const [quotes, setQuotes]   = useState<QuoteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`${BASE}/api/quotes/mine`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load quotes.");
        const json = await res.json();
        if (!cancelled) setQuotes(json.data ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load quotes.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="py-10 text-center text-[--color-text-muted] text-sm" aria-live="polite" aria-busy="true">
        <svg className="animate-spin h-6 w-6 mx-auto mb-2 text-[--color-brand-primary]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Loading quotes…
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
        {error}
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (quotes.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-10 text-[--color-text-muted]">
            <svg className="mx-auto mb-3 opacity-30" width="48" height="48" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M12 8h24a4 4 0 014 4v24a4 4 0 01-4 4H12a4 4 0 01-4-4V12a4 4 0 014-4z" stroke="currentColor" strokeWidth="2" />
              <path d="M16 20h16M16 28h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="font-medium">No quotes yet</p>
            <p className="text-sm mt-1">Request a quote from any product page.</p>
            <Button href="/products" variant="outline" size="sm" className="mt-4">
              Browse products
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  // ── List ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {quotes.map((quote) => {
        const s = STATUS_MAP[quote.status] ?? { label: quote.status, variant: "default" as const };
        const isActive = !["expired", "declined", "ordered"].includes(quote.status);

        return (
          <Link
            key={quote._id}
            href={`/quote/status/${quote.referenceNumber}`}
            className="block p-4 rounded-xl border border-[--color-border] bg-white hover:border-[--color-brand-primary] hover:shadow-sm transition-all group"
            aria-label={`Quote ${quote.referenceNumber} — ${s.label}`}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Left: ref + item summary */}
              <div className="min-w-0">
                <p className="font-semibold text-[--color-text-primary] group-hover:text-[--color-brand-primary] transition-colors">
                  {quote.referenceNumber}
                </p>
                <p className="text-sm text-[--color-text-muted] truncate mt-0.5">
                  {itemSummary(quote.items)}
                </p>
                <p className="text-xs text-[--color-text-muted] mt-1">
                  {fmtDate(quote.createdAt, locale)}
                  {isActive && quote.expiresAt && (
                    <> · expires {fmtDate(quote.expiresAt, locale)}</>
                  )}
                </p>
              </div>

              {/* Right: status + total */}
              <div className="text-right shrink-0">
                <Badge variant={s.variant} className="mb-1">{s.label}</Badge>
                <p className="text-sm font-semibold text-[--color-text-primary]">
                  {fmt(quote.total, quote.currency, locale)}
                </p>
              </div>
            </div>
          </Link>
        );
      })}

      <div className="pt-2">
        <Button href="/quote/basket" variant="outline" size="sm">
          Request another quote
        </Button>
      </div>
    </div>
  );
}
