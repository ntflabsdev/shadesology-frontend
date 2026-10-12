import type { Metadata } from "next";
import Link from "next/link";
import { CommercialROICalculator } from "@/components/configurator/CommercialROICalculator";

export const metadata: Metadata = {
  title: "Commercial ROI | Shadesology",
  description: "Compare the operating and productivity gains of a commercial shade investment against the project cost.",
};

export default function CommercialROIPage() {
  return (
    <main className="container py-12">
      <div className="mb-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[--color-text-muted]">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-[--color-brand-primary]">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/design-tools" className="hover:text-[--color-brand-primary]">Design tools</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-[--color-text-primary]">Commercial ROI</li>
          </ol>
        </nav>
      </div>

      <CommercialROICalculator />
    </main>
  );
}
