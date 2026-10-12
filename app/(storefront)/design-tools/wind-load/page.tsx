import type { Metadata } from "next";
import Link from "next/link";
import { WindLoadCalculator } from "@/components/configurator/WindLoadCalculator";

export const metadata: Metadata = {
  title: "Wind Load | Shadesology",
  description: "Compare wind exposure and structural load assumptions for custom shade systems and outdoor structures.",
};

export default function WindLoadPage() {
  return (
    <main className="container py-12">
      <div className="mb-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[--color-text-muted]">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-[--color-brand-primary]">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/design-tools" className="hover:text-[--color-brand-primary]">Design tools</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-[--color-text-primary]">Wind load</li>
          </ol>
        </nav>
      </div>

      <WindLoadCalculator />
    </main>
  );
}
