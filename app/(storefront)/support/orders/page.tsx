import Link from "next/link";
import type { Metadata } from "next";
import { getMe } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import GuestOrderLookup from "@/components/orders/GuestOrderLookup";

export const metadata: Metadata = {
  title: "Order Support | Shadesology",
  description: "Track your order, request changes or get help with delivery.",
};

export default async function OrderSupportPage() {
  const user = await getMe();

  return (
    <>
      <header className="bg-[--color-brand-primary] text-white py-12">
        <div className="container max-w-3xl">
          <nav aria-label="Breadcrumb" className="text-sm text-white/60 mb-4">
            <Link href="/support" className="hover:text-white transition-colors">Support</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-white">Order Support</span>
          </nav>
          <h1 className="text-3xl font-bold mb-1">Order Support</h1>
          <p className="text-white/80">Track your order, request changes or get help with delivery.</p>
        </div>
      </header>

      <div className="container max-w-3xl py-12 space-y-8">
        {/* Logged-in: show account orders */}
        {user ? (
          <div className="bg-white rounded-2xl border border-[--color-border] p-8 text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-[--color-brand-primary]/10 flex items-center justify-center">
              <svg className="h-6 w-6 text-[--color-brand-primary]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-lg font-bold mb-2">Welcome back, {user.firstName}</h2>
            <p className="text-[--color-text-muted] mb-5">View your orders, track shipments and download invoices from your account.</p>
            <Button href="/account?tab=orders">View My Orders</Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[--color-border] p-8 text-center">
            <h2 className="text-lg font-bold mb-2">Sign in to track your order</h2>
            <p className="text-[--color-text-muted] mb-5">Access your order history, shipment tracking and invoices.</p>
            <div className="flex justify-center gap-3">
              <Button href="/login">Sign in</Button>
              <Button href="/register" variant="outline">Create account</Button>
            </div>
          </div>
        )}

        {/* Order lookup by email */}
        <div className="bg-white rounded-2xl border border-[--color-border] p-8">
          <h2 className="text-lg font-bold mb-1">Look up a guest order</h2>
          <p className="text-sm text-[--color-text-muted] mb-5">
            Placed an order without an account? Enter your order number and email.
          </p>
          <GuestOrderLookup />
        </div>

        {/* Help options */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: "📦",
              title: "Track Shipment",
              desc: "Follow your order from our production facility to your door.",
              href: "#order-lookup",
            },
            {
              icon: "🔄",
              title: "Returns & Refunds",
              desc: "Understand our return policy for standard and made-to-order products.",
              href: "/refunds",
            },
            {
              icon: "🔧",
              title: "Report an Issue",
              desc: "Something arrived damaged or not as expected? Let us know.",
              href: "/support/service",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col p-5 rounded-xl border border-[--color-border] hover:border-[--color-brand-primary] hover:shadow-sm transition-all"
            >
              <span className="text-2xl mb-3" aria-hidden="true">{item.icon}</span>
              <h3 className="font-semibold mb-1 group-hover:text-[--color-brand-primary] transition-colors">{item.title}</h3>
              <p className="text-sm text-[--color-text-muted]">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
