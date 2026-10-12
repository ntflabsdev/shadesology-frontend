import type { Metadata } from "next";
import Link from "next/link";
import { ProductPhotoVisualizer } from "@/components/configurator/ProductPhotoVisualizer";

export const metadata: Metadata = {
  title: "Product Photo Visualizer | Shadesology",
  description: "Experiment with product placement and scale on a project photo before generating a quote.",
};

export default function ProductPhotoVisualizerPage() {
  return (
    <main className="container py-12">
      <div className="mb-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[--color-text-muted]">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-[--color-brand-primary]">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/design-tools" className="hover:text-[--color-brand-primary]">Design tools</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-[--color-text-primary]">Product photo visualizer</li>
          </ol>
        </nav>
      </div>

      <ProductPhotoVisualizer />
    </main>
  );
}
