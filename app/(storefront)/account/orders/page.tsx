import Link from "next/link";
import OrdersDashboard from "@/components/orders/OrdersDashboard";

export const metadata = {
  title: "My Orders | Shadesology",
  robots: { index: false },
};

export default function OrdersPage() {
  return (
    <main className="container max-w-4xl py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[--color-text-primary]">My Orders</h1>
          <p className="mt-1 text-sm text-[--color-text-muted]">Review configurations, track shipments, or contact us about an order.</p>
        </div>
        <Link href="/account" className="text-sm text-[--color-brand-primary] hover:underline">← Back to account</Link>
      </div>
      <OrdersDashboard />
    </main>
  );
}
