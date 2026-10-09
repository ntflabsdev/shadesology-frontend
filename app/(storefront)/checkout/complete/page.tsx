"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { trackConversionOnce, type AnalyticsItem } from "@/lib/conversion";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface PaymentStatus {
  paid: boolean;
  orderNumber?: string;
  total?: number;
  currency?: string;
  paymentStatus?: string;
  balanceDue?: number;
  tax?: number;
  shipping?: number;
  items?: {
    productId?: string;
    itemName: string;
    itemVariant?: string;
    itemSku?: string;
    quantity: number;
    price: number;
  }[];
}

function CheckoutCompleteContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState(() => sessionId ? "" : "No payment session was provided.");

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const checkStatus = async () => {
      try {
        const response = await fetch(`${BASE}/api/payments/session/${encodeURIComponent(sessionId)}`, { cache: "no-store" });
        const json = await response.json();
        if (!response.ok) throw new Error(json.message || "Could not verify payment.");
        if (cancelled) return;
        const paymentStatus = json.data as PaymentStatus;
        setStatus(paymentStatus);
        if (!json.data?.paid && attempts++ < 9) timer = setTimeout(checkStatus, 2000);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not verify payment.");
      }
    };
    void checkStatus();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [sessionId]);

  useEffect(() => {
    const sendPurchase = () => {
      if (
        !status?.paid ||
        status.paymentStatus !== "paid" ||
        status.balanceDue !== 0 ||
        !status.orderNumber
      ) return;
      const items: AnalyticsItem[] = (status.items || []).map((item) => ({
        item_id: item.productId || item.itemSku,
        item_name: item.itemName,
        item_variant: item.itemVariant,
        price: item.price,
        quantity: item.quantity,
      }));
      trackConversionOnce("purchase", status.orderNumber, {
        transaction_id: status.orderNumber,
        currency: status.currency || "USD",
        value: status.total || 0,
        tax: status.tax || 0,
        shipping: status.shipping || 0,
        items,
      });
    };

    sendPurchase();
    window.addEventListener("shadesology:consent-updated", sendPurchase);
    window.addEventListener("storage", sendPurchase);
    return () => {
      window.removeEventListener("shadesology:consent-updated", sendPurchase);
      window.removeEventListener("storage", sendPurchase);
    };
  }, [status]);

  return (
    <main className="container flex min-h-[60vh] max-w-xl flex-col items-center justify-center py-16 text-center">
      {error ? (
        <>
          <h1 className="text-2xl font-bold">Payment status unavailable</h1>
          <p role="alert" className="mt-3 text-[--color-text-muted]">{error}</p>
        </>
      ) : status?.paid ? (
        <>
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700" aria-hidden="true">✓</div>
          <h1 className="text-3xl font-bold">Payment confirmed</h1>
          <p className="mt-3 text-[--color-text-muted]">Order {status.orderNumber} is confirmed.</p>
          {status.total != null && <p className="mt-2">Order total: ${status.total.toFixed(2)}</p>}
          {status.balanceDue != null && status.balanceDue > 0 && (
            <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              Deposit received. Remaining balance of ${status.balanceDue.toFixed(2)} is due before dispatch.
            </p>
          )}
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold">Confirming your payment…</h1>
          <p className="mt-3 text-[--color-text-muted]">Please wait while we verify the secure payment session.</p>
        </>
      )}
      <Link href="/account/orders" className="mt-8 rounded-lg bg-[--color-brand-primary] px-5 py-3 font-semibold text-white">View orders</Link>
    </main>
  );
}

export default function CheckoutCompletePage() {
  return <Suspense fallback={<main className="container py-16 text-center">Loading payment status…</main>}><CheckoutCompleteContent /></Suspense>;
}
