"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getFinancingApplication, type FinancingApplicationStatus } from "@/lib/financing";
import { useLocaleSettings } from "@/components/i18n/LocaleProvider";
import { formatCurrency } from "@/i18n/format";

function FinancingStatusContent() {
  const { locale } = useLocaleSettings();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") ?? "";
  const [application, setApplication] = useState<FinancingApplicationStatus | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = async () => {
      try {
        const data = await getFinancingApplication(reference);
        if (!active) return;
        setApplication(data);
        setError("");
        if (data.status === "started" || data.status === "prequalified") {
          timer = setTimeout(refresh, 3000);
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not retrieve your application status.");
      }
    };
    void refresh();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [reference]);

  const statusCopy: Record<string, string> = {
    started: "Your lender application is being processed. This page will refresh automatically.",
    prequalified: "The lender reports that you are prequalified. This is not final approval or a financing agreement.",
    approved: "The lender reports an approval. Review the lender’s terms and complete any required lender steps; this status does not place or pay for an order.",
    declined: "The lender reports that this application was not approved. You can still complete checkout using another available payment method.",
    abandoned: "This lender application was not completed. You can return to checkout and choose another payment method.",
    handoff_unavailable: "Your application details were recorded, but online lender handoff is not available. Please contact our team for assistance.",
  };
  const checkoutUrl = reference ? `/checkout?financing_ref=${encodeURIComponent(reference)}` : "/checkout";

  return (
    <main className="container max-w-2xl py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-[--color-brand-primary]">Financing application</p>
      <h1 className="mt-2 text-3xl font-bold">Application status</h1>
      {!reference ? (
        <p role="alert" className="mt-5 rounded-lg bg-amber-50 p-4 text-amber-900">No application reference was provided. Return to checkout to start or review an application.</p>
      ) : error ? (
        <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-red-800">{error}</p>
      ) : application ? (
        <div className="mt-5 rounded-xl border bg-white p-5">
          <p className="font-semibold capitalize">{application.status.replaceAll("_", " ")}</p>
          <p className="mt-2 text-sm text-[--color-text-muted]">{statusCopy[application.status] ?? "Your application status is being reviewed."}</p>
          {application.status === "approved" && application.approvedAmount != null && <p className="mt-3 font-medium">Reported approved amount: {formatCurrency(application.approvedAmount, "USD", "USD", locale)}</p>}
          <p className="mt-3 text-xs text-[--color-text-muted]">Reference: {application.reference}</p>
        </div>
      ) : <p role="status" className="mt-5">Loading your application status…</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={checkoutUrl} className="rounded-lg bg-[--color-brand-primary] px-5 py-3 font-semibold text-white">Return to checkout</Link>
        <Link href="/" className="rounded-lg border px-5 py-3 font-semibold">Continue shopping</Link>
      </div>
      <p className="mt-5 text-xs leading-relaxed text-[--color-text-muted]">Application updates are verified by the financing provider. A return from the lender alone does not establish approval or charge your order.</p>
    </main>
  );
}

export default function FinancingStatusPage() {
  return <Suspense fallback={<main className="container max-w-2xl py-16">Loading financing status…</main>}><FinancingStatusContent /></Suspense>;
}
