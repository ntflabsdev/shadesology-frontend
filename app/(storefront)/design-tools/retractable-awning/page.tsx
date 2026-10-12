import type { Metadata } from "next";
import Link from "next/link";
import { RetractableAwningConfigurator } from "@/components/configurator/RetractableAwningConfigurator";

export const metadata: Metadata = {
  title: "Retractable Awning Configurator | Shadesology",
  description: "Configure a retractable awning with size, fabric, motor and installation choices.",
};

export default function RetractableAwningPage() {
  return (
    <main className="container py-12">
      <div className="mb-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[--color-text-muted]">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-[--color-brand-primary]">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/design-tools" className="hover:text-[--color-brand-primary]">Design tools</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-[--color-text-primary]">Retractable awning</li>
          </ol>
        </nav>
      </div>

      <RetractableAwningConfigurator />
    </main>
  );
}
