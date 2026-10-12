import type { Metadata } from "next";
import Link from "next/link";
import { HouseColorVisualizer } from "@/components/configurator/HouseColorVisualizer";

export const metadata: Metadata = {
  title: "House Color Visualizer | Shadesology",
  description: "Preview exterior color updates against a house photo before making a final selection.",
};

export default function HouseColorVisualizerPage() {
  return (
    <main className="container py-12">
      <div className="mb-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[--color-text-muted]">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-[--color-brand-primary]">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/design-tools" className="hover:text-[--color-brand-primary]">Design tools</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-[--color-text-primary]">House color visualizer</li>
          </ol>
        </nav>
      </div>

      <HouseColorVisualizer />
    </main>
  );
}
