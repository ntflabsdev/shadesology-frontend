import type { Metadata } from "next";
import { CommercialProjectEnquiryForm } from "@/components/commercial/CommercialProjectEnquiryForm";

export const metadata: Metadata = {
  title: "Commercial Project Enquiry | Shadesology",
  description: "Share your commercial shade project requirements with the Shadesology team.",
};

export default async function CommercialRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ audience?: string }>;
}) {
  const { audience = "" } = await searchParams;
  return (
    <main className="container max-w-4xl py-12">
      <p className="text-sm font-semibold uppercase tracking-widest text-[--color-brand-primary]">Commercial division</p>
      <h1 className="mt-2 text-4xl font-bold">Tell us about your project</h1>
      <p className="mt-3 max-w-2xl text-[--color-text-muted]">A commercial specialist will review your requirements and follow up with next steps.</p>
      <div className="mt-8 rounded-2xl border border-[--color-border] bg-white p-6 sm:p-8">
        <CommercialProjectEnquiryForm initialAudience={audience} />
      </div>
    </main>
  );
}
