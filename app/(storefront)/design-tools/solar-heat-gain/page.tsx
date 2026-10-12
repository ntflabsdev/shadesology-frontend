import type { Metadata } from "next";
import Link from "next/link";
import { SolarHeatGainCalculator } from "@/components/configurator/SolarHeatGainCalculator";

export const metadata: Metadata = {
  title: "Solar Heat Gain Calculator | Shadesology",
  description: "Estimate how much heat enters with different glazing, orientation and shade factors.",
};

export default function SolarHeatGainPage() {
  return (
    <main className="container py-12">
      <div className="mb-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[--color-text-muted]">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-[--color-brand-primary]">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/design-tools" className="hover:text-[--color-brand-primary]">Design tools</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-[--color-text-primary]">Solar heat gain</li>
          </ol>
        </nav>
      </div>

      <SolarHeatGainCalculator />
    </main>
  );
}
