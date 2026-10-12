import type { Metadata } from "next";
import Link from "next/link";
import { AIQuoteBuilder } from "@/components/assistant/AIQuoteBuilder";

export const metadata: Metadata = {
  title: "AI Quote Builder | Shadesology",
  description: "Turn a natural-language project brief into a draft quote, with confidence scoring and staff review guardrails.",
};

export default function AIQuoteBuilderPage() {
  return (
    <main className="container py-12">
      <div className="mb-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[--color-text-muted]">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-[--color-brand-primary]">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/support" className="hover:text-[--color-brand-primary]">Support</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-[--color-text-primary]">AI quote builder</li>
          </ol>
        </nav>
      </div>

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[--color-brand-primary]">Phase 6.3</p>
        <h1 className="mt-2 text-4xl font-bold text-[--color-text-primary]">AI quote builder</h1>
        <p className="mt-3 max-w-3xl text-[--color-text-muted]">
          Convert project notes, photos and rough dimensions into a draft quote. The output is reviewed by staff before it can be sent to a customer.
        </p>
      </div>

      <AIQuoteBuilder />
    </main>
  );
}
