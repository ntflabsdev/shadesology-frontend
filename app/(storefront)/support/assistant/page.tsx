import type { Metadata } from "next";
import Link from "next/link";
import { AIProductAssistant } from "@/components/assistant/AIProductAssistant";

export const metadata: Metadata = {
  title: "AI Design Assistant | Shadesology Support",
  description: "Get catalog-safe guidance for awnings, pergolas, screens and support questions from the Shadesology AI assistant.",
};

export default function SupportAssistantPage() {
  return (
    <main className="container py-12">
      <div className="mb-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[--color-text-muted]">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-[--color-brand-primary]">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/support" className="hover:text-[--color-brand-primary]">Support</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-[--color-text-primary]">AI design assistant</li>
          </ol>
        </nav>
      </div>

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[--color-brand-primary]">Phase 6</p>
        <h1 className="mt-2 text-4xl font-bold text-[--color-text-primary]">AI design assistant</h1>
        <p className="mt-3 max-w-3xl text-[--color-text-muted]">
          Get help selecting the right product, understanding product guidance and routing to the right support path without inventing unsupported technical claims.
        </p>
      </div>

      <AIProductAssistant />
    </main>
  );
}
