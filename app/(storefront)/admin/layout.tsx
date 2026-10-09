import Link from "next/link";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <nav aria-label="Admin navigation" className="border-b border-[--color-border] bg-white">
        <div className="container flex flex-wrap gap-x-6 gap-y-2 py-3 text-sm font-medium">
          <Link href="/admin/orders" className="text-[--color-brand-primary] hover:underline">Orders</Link>
          <Link href="/admin/quotes" className="text-[--color-brand-primary] hover:underline">Quotes</Link>
          <Link href="/admin/shipping-rates" className="text-[--color-brand-primary] hover:underline">Shipping rates</Link>
          <Link href="/admin/financing-offers" className="text-[--color-brand-primary] hover:underline">Financing offers</Link>
          <Link href="/admin/leads" className="text-[--color-brand-primary] hover:underline">Leads & routing</Link>
          <Link href="/admin/crm" className="text-[--color-brand-primary] hover:underline">CRM integration</Link>
          <Link href="/admin/installers" className="text-[--color-brand-primary] hover:underline">Installers</Link>
          <Link href="/admin/videos" className="text-[--color-brand-primary] hover:underline">Video library</Link>
          <Link href="/admin/inspiration" className="text-[--color-brand-primary] hover:underline">Bulk inspiration upload</Link>
          <Link href="/admin/collections/projects" className="text-[--color-brand-primary] hover:underline">Projects & case studies</Link>
          <Link href="/admin/collections/inspiration-items" className="text-[--color-brand-primary] hover:underline">Inspiration images</Link>
        </div>
      </nav>
      {children}
    </>
  );
}
