import type { Metadata } from "next";
import Link from "next/link";
import { SizingProjectionCalculator } from "@/components/configurator/SizingProjectionCalculator";

export const metadata: Metadata = {
  title: "Sizing & Projection | Shadesology",
  description: "Estimate shade coverage and recommended projection for a custom outdoor shading layout.",
};

export default function SizingAndProjectionPage() {
  return (
    <main className="container py-12">
      <div className="mb-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[--color-text-muted]">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-[--color-brand-primary]">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/design-tools" className="hover:text-[--color-brand-primary]">Design tools</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-[--color-text-primary]">Sizing & projection</li>
          </ol>
        </nav>
      </div>

      <SizingProjectionCalculator />
    </main>
  );
}
