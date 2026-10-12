import type { Metadata } from "next";
import Link from "next/link";
import { MaintenanceReminders } from "@/components/assistant/MaintenanceReminders";

export const metadata: Metadata = {
  title: "Maintenance Reminders | Shadesology",
  description:
    "Track seasonal maintenance reminders, due dates and service windows for customer shade products.",
};

export default function MaintenancePage() {
  return (
    <main className="container py-12">
      <div className="mb-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[--color-text-muted]">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-[--color-brand-primary]">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/support" className="hover:text-[--color-brand-primary]">Support</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-[--color-text-primary]">Maintenance reminders</li>
          </ol>
        </nav>
      </div>

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[--color-brand-primary]">Phase 6.4</p>
        <h1 className="mt-2 text-4xl font-bold text-[--color-text-primary]">Maintenance reminders</h1>
        <p className="mt-3 max-w-3xl text-[--color-text-muted]">
          Keep products healthy with planned cleaning, safety checks and seasonal service windows. Customers can review upcoming reminders and staff can log completed care tasks.
        </p>
      </div>

      <MaintenanceReminders />
    </main>
  );
}
