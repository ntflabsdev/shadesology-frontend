import type { Metadata } from "next";
import Link from "next/link";
import { ThreeDViewer } from "@/components/configurator/ThreeDViewer";

export const metadata: Metadata = {
  title: "3D Viewer & AR | Shadesology",
  description: "Preview a product in 3D and see the AR support matrix before capture or configuration handoff.",
};

export default function ThreeDViewerPage() {
  return (
    <main className="container py-12">
      <div className="mb-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[--color-text-muted]">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-[--color-brand-primary]">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/design-tools" className="hover:text-[--color-brand-primary]">Design tools</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-[--color-text-primary]">3D viewer & AR</li>
          </ol>
        </nav>
      </div>

      <ThreeDViewer />
    </main>
  );
}
