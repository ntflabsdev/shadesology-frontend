/**
 * /quote/status/[ref] — Quote status tracking page.
 *
 * Works for both:
 *   - Authenticated users  → fetches from /api/quotes/mine then filters by ref
 *   - Guest users          → fetches from /api/quotes/status/:ref?token=xxx
 *
 * The guest token is a one-time secret included in the confirmation email.
 * It is passed as a query-string parameter and validated server-side (SHA-256 hash).
 *
 * The page is noindex (personal quote data, not public content).
 */

import { notFound } from "next/navigation";
import { cookies }  from "next/headers";
import { Badge }    from "@/components/ui/Badge";
import { Button }   from "@/components/ui/Button";
import { getRequestLocale } from "@/i18n/server";
import { formatCurrency, formatDate } from "@/i18n/format";
import type { Locale } from "@/i18n/config";

export const metadata = {
  title: "Quote Status",
  robots: { index: false, follow: false },
};

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// ─── Types ─────────────────────────────────────────────────────────────────

interface QuoteLine {
  productName?: string;
  variantName?:  string;
  sku?:          string;
  quantity:      number;
  selectedOptions?: Record<string, string>;
  unitPrice?:    number | null;
  totalPrice?:   number | null;
}

interface QuoteStatusHistory {
  status: string;
  note?:  string;
  at:     string;
}

interface QuoteData {
  _id:             string;
  referenceNumber: string;
  status:          string;
  items:           QuoteLine[];
  subtotal?:       number | null;
  tax?:            number | null;
  total?:          number | null;
  currency:        string;
  priceLocked?:    boolean;
  expiresAt?:      string;
  statusHistory?:  QuoteStatusHistory[];
  createdAt:       string;
  projectDescription?: string;
  enquiryQueue?:   string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "success" | "warning" | "error" | "accent"; description: string }> = {
  submitted: {
    label:       "Submitted",
    variant:     "default",
    description: "We received your request. Our team will review it shortly.",
  },
  in_review: {
    label:       "In Review",
    variant:     "warning",
    description: "Our team is reviewing your project details.",
  },
  quoted: {
    label:       "Quote Ready",
    variant:     "accent",
    description: "Your quote is ready. Review the pricing below.",
  },
  accepted: {
    label:       "Accepted",
    variant:     "success",
    description: "You have accepted this quote. Our team will be in touch shortly.",
  },
  ordered: {
    label:       "Order Created",
    variant:     "success",
    description: "Your quote has been converted to an order.",
  },
  expired: {
    label:       "Expired",
    variant:     "error",
    description: "This quote has expired. Please submit a new request for updated pricing.",
  },
  declined: {
    label:       "Declined",
    variant:     "error",
    description: "This quote was not taken forward. Please contact us if you have questions.",
  },
};

function fmt(n: number | null | undefined, currency = "USD", locale: Locale = "en") {
  if (n == null) return "TBC";
  return formatCurrency(n / 100, currency, currency, locale);
}

function fmtDate(iso: string, locale: Locale) {
  return formatDate(iso, locale, { year: "numeric", month: "long", day: "numeric" });
}

function fmtDateTime(iso: string, locale: Locale) {
  return formatDate(iso, locale, { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// ─── Data fetching ─────────────────────────────────────────────────────────

async function fetchQuote(ref: string, token?: string): Promise<QuoteData | null> {
  // Guest path — token in query string
  if (token) {
    try {
      const res = await fetch(
        `${BASE}/api/quotes/status/${encodeURIComponent(ref)}?token=${encodeURIComponent(token)}`,
        { cache: "no-store" }
      );
      if (!res.ok) return null;
      const json = await res.json();
      return json.data ?? null;
    } catch {
      return null;
    }
  }

  // Authenticated path — read cookie and call authenticated endpoint
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  if (!allCookies) return null;

  try {
    const res = await fetch(`${BASE}/api/quotes/mine`, {
      cache:   "no-store",
      headers: { Cookie: allCookies },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const quotes: QuoteData[] = json.data ?? [];
    return quotes.find((q) => q.referenceNumber === ref) ?? null;
  } catch {
    return null;
  }
}

// ─── Step tracker ──────────────────────────────────────────────────────────

const STEPS = [
  { key: "submitted",  label: "Submitted" },
  { key: "in_review",  label: "In Review" },
  { key: "quoted",     label: "Quote Ready" },
  { key: "accepted",   label: "Accepted" },
  { key: "ordered",    label: "Ordered" },
];

function StepTracker({ status }: { status: string }) {
  if (status === "expired" || status === "declined") return null;
  const currentIdx = STEPS.findIndex((s) => s.key === status);

  return (
    <nav aria-label="Quote progress" className="mb-8">
      <ol className="flex items-center">
        {STEPS.map((step, idx) => {
          const done    = idx < currentIdx;
          const current = idx === currentIdx;
          const last    = idx === STEPS.length - 1;

          return (
            <li key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <span
                  aria-current={current ? "step" : undefined}
                  className={[
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                    done    ? "bg-[--color-brand-primary] border-[--color-brand-primary] text-white"    : "",
                    current ? "border-[--color-brand-primary] text-[--color-brand-primary] bg-white"    : "",
                    !done && !current ? "border-[--color-border] text-[--color-text-muted] bg-white"   : "",
                  ].filter(Boolean).join(" ")}
                >
                  {done ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </span>
                <span
                  className={[
                    "text-xs font-medium whitespace-nowrap hidden sm:block",
                    current ? "text-[--color-brand-primary]" : "text-[--color-text-muted]",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>
              {!last && (
                <div
                  className={[
                    "flex-1 h-0.5 mx-1",
                    idx < currentIdx
                      ? "bg-[--color-brand-primary]"
                      : "bg-[--color-border]",
                  ].join(" ")}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function QuoteStatusPage({
  params,
  searchParams,
}: {
  params:       Promise<{ ref: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const locale = await getRequestLocale();
  const { ref }   = await params;
  const { token } = await searchParams;

  const quote = await fetchQuote(ref, token);

  if (!quote) {
    // Don't 404 — show a helpful message so the URL can't be used to probe for
    // valid reference numbers
    return (
      <div className="container py-24 text-center max-w-md mx-auto">
        <svg className="mx-auto mb-4 opacity-25 text-[--color-text-muted]" width="64" height="64" fill="none" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" />
          <path d="M32 22v12M32 38v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <h1 className="text-2xl font-bold text-[--color-text-primary] mb-2">
          Quote not found
        </h1>
        <p className="text-[--color-text-muted] text-sm mb-6">
          The link may have expired or the reference number is incorrect.
          {" "}Please check your confirmation email or{" "}
          <a href="/support/contact" className="text-[--color-brand-primary] hover:underline">
            contact support
          </a>.
        </p>
        <Button href="/quote/basket" variant="outline" size="sm">
          Request a New Quote
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[quote.status] ?? {
    label:       quote.status,
    variant:     "default" as const,
    description: "",
  };

  const isExpiredOrDeclined = quote.status === "expired" || quote.status === "declined";
  const hasPrice = quote.total != null;

  return (
    <div className="container py-10 max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-[--color-text-primary]">
            Quote {quote.referenceNumber}
          </h1>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>
        <p className="text-sm text-[--color-text-muted]">
          Submitted {fmtDate(quote.createdAt, locale)}
          {quote.expiresAt && !isExpiredOrDeclined && (
            <> · Valid until {fmtDate(quote.expiresAt, locale)}</>
          )}
        </p>
        {statusConfig.description && (
          <p className="mt-2 text-sm text-[--color-text-secondary]">
            {statusConfig.description}
          </p>
        )}
      </div>

      {/* Progress steps */}
      <StepTracker status={quote.status} />

      {/* Pricing card (shown once staff have quoted) */}
      {hasPrice && (
        <section
          aria-labelledby="pricing-heading"
          className="mb-6 p-5 rounded-2xl border border-[--color-border] bg-white"
        >
          <h2 id="pricing-heading" className="font-semibold text-[--color-text-primary] mb-4">
            Pricing
          </h2>
          <dl className="space-y-2 text-sm">
            {quote.subtotal != null && (
              <div className="flex justify-between">
                <dt className="text-[--color-text-muted]">Subtotal</dt>
                <dd className="font-medium">{fmt(quote.subtotal, quote.currency, locale)}</dd>
              </div>
            )}
            {quote.tax != null && (
              <div className="flex justify-between">
                <dt className="text-[--color-text-muted]">Tax (est.)</dt>
                <dd className="font-medium">{fmt(quote.tax, quote.currency, locale)}</dd>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-[--color-border]">
              <dt className="font-semibold text-[--color-text-primary]">Total</dt>
              <dd className="font-bold text-[--color-text-primary] text-base">
                {fmt(quote.total, quote.currency, locale)}
              </dd>
            </div>
          </dl>
          {quote.priceLocked && (
            <p className="mt-3 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
              ✓ Price is locked — it will not change if you accept this quote.
            </p>
          )}
          {quote.expiresAt && !isExpiredOrDeclined && (
            <p className="mt-2 text-xs text-[--color-text-muted]">
              Quote valid until {fmtDate(quote.expiresAt, locale)}.
            </p>
          )}
        </section>
      )}

      {/* Items */}
      <section aria-labelledby="items-heading" className="mb-6">
        <h2 id="items-heading" className="font-semibold text-[--color-text-primary] mb-3">
          Items ({quote.items.length})
        </h2>
        <div className="space-y-3">
          {quote.items.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-[--color-border] bg-white"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-[--color-text-primary] truncate">
                    {item.productName ?? "Product"}
                  </p>
                  {item.variantName && (
                    <p className="text-sm text-[--color-text-muted]">{item.variantName}</p>
                  )}
                  {item.sku && (
                    <p className="text-xs text-[--color-text-muted]">SKU: {item.sku}</p>
                  )}
                  {item.selectedOptions && Object.entries(item.selectedOptions).length > 0 && (
                    <ul className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(item.selectedOptions).map(([k, v]) => (
                        <li key={k}>
                          <span className="text-xs bg-[--color-neutral-100] px-2 py-0.5 rounded-full">
                            {k}: {v}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-[--color-text-muted]">Qty: {item.quantity}</p>
                  {item.unitPrice != null && (
                    <p className="text-sm font-medium text-[--color-text-primary]">
                      {fmt(item.unitPrice, quote.currency, locale)} ea.
                    </p>
                  )}
                  {item.totalPrice != null && (
                    <p className="text-sm font-semibold text-[--color-text-primary]">
                      {fmt(item.totalPrice, quote.currency, locale)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Status history */}
      {quote.statusHistory && quote.statusHistory.length > 0 && (
        <section aria-labelledby="history-heading" className="mb-8">
          <h2 id="history-heading" className="font-semibold text-[--color-text-primary] mb-3">
            Activity
          </h2>
          <ol className="space-y-3">
            {[...quote.statusHistory].reverse().map((entry, idx) => (
              <li key={idx} className="flex gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-[--color-brand-primary] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="font-medium capitalize text-[--color-text-primary]">
                    {STATUS_CONFIG[entry.status]?.label ?? entry.status}
                  </span>
                  {entry.note && (
                    <p className="text-[--color-text-muted]">{entry.note}</p>
                  )}
                  <p className="text-xs text-[--color-text-muted]">{fmtDateTime(entry.at, locale)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* CTAs */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-[--color-border]">
        {(quote.status === "expired" || quote.status === "declined") && (
          <Button href="/quote/basket">Request New Quote</Button>
        )}
        <Button href="/support/contact" variant="outline">
          Contact Us
        </Button>
        <Button href="/" variant="ghost" size="sm">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
