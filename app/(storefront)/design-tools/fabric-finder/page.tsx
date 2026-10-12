import type { Metadata } from "next";
import Link from "next/link";
import { FabricFinder } from "@/components/configurator/FabricFinder";

export const metadata: Metadata = {
  title: "Fabric Finder | Shadesology",
  description: "Browse shade fabrics by composition, openness, pattern and product fit.",
};

export default function FabricFinderPage() {
  return (
    <main className="container py-12">
      <div className="mb-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[--color-text-muted]">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-[--color-brand-primary]">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/design-tools" className="hover:text-[--color-brand-primary]">Design tools</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-[--color-text-primary]">Fabric finder</li>
          </ol>
        </nav>
      </div>

      <FabricFinder />
    </main>
  );
}
