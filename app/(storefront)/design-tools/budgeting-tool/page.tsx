import type { Metadata } from "next";
import Link from "next/link";
import { BudgetingTool } from "@/components/configurator/BudgetingTool";

export const metadata: Metadata = {
  title: "Budgeting Tool | Shadesology",
  description: "Compare upgrade bundles and monthly financing against a project budget for custom shade solutions.",
};

export default function BudgetingToolPage() {
  return (
    <main className="container py-12">
      <div className="mb-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[--color-text-muted]">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-[--color-brand-primary]">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/design-tools" className="hover:text-[--color-brand-primary]">Design tools</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-[--color-text-primary]">Budgeting tool</li>
          </ol>
        </nav>
      </div>

      <BudgetingTool />
    </main>
  );
}
