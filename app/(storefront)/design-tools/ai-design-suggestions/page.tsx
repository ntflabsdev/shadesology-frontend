import type { Metadata } from "next";
import Link from "next/link";
import { AIDesignSuggestions } from "@/components/configurator/AIDesignSuggestions";

export const metadata: Metadata = {
  title: "AI Design Suggestions | Shadesology",
  description: "See catalog-safe shadings, color and projection recommendations generated from a property photo.",
};

export default function AIDesignSuggestionsPage() {
  return (
    <main className="container py-12">
      <div className="mb-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[--color-text-muted]">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-[--color-brand-primary]">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/design-tools" className="hover:text-[--color-brand-primary]">Design tools</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-[--color-text-primary]">AI design suggestions</li>
          </ol>
        </nav>
      </div>

      <AIDesignSuggestions />
    </main>
  );
}
