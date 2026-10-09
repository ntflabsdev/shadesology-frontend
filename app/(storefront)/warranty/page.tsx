import Link from "next/link";
import type { Metadata } from "next";
import { WarrantyRegistrationForm } from "@/components/warranty/WarrantyRegistrationForm";

export const metadata: Metadata = {
  title: "Warranty | Shadesology",
  description:
    "Shadesology product warranty information — coverage terms, what's included, and how to submit a claim.",
};

const WARRANTY_TABLE = [
  { product: "Retractable Awnings", frame: "5 years", fabric: "3–5 years", motor: "2 years" },
  { product: "Fabric Pergolas",     frame: "5 years", fabric: "3–5 years", motor: "2 years" },
  { product: "Louvered Roofs",      frame: "5 years", fabric: "N/A",       motor: "2 years" },
  { product: "Shade Sails",         frame: "2 years", fabric: "3 years",   motor: "N/A"     },
  { product: "Retractable Screens", frame: "3 years", fabric: "2 years",   motor: "2 years" },
  { product: "Umbrellas",           frame: "2 years", fabric: "2 years",   motor: "2 years" },
  { product: "Pool Covers",         frame: "3 years", fabric: "3 years",   motor: "2 years" },
  { product: "Tensile Structures",  frame: "10 years",fabric: "5 years",   motor: "N/A"     },
];

export default function WarrantyPage() {
  return (
    <>
      <header className="bg-[--color-brand-primary] text-white py-14">
        <div className="container">
          <h1 className="text-4xl font-bold mb-2">Warranty Information</h1>
          <p className="text-white/80">Coverage terms for all Shadesology products.</p>
        </div>
      </header>

      <div className="container py-14 max-w-4xl">
        {/* Coverage table */}
        <section aria-labelledby="coverage-heading" className="mb-12">
          <h2 id="coverage-heading" className="text-2xl font-bold mb-6">Coverage by Product</h2>
          <div className="overflow-x-auto rounded-2xl border border-[--color-border]">
            <table className="w-full text-sm border-collapse" aria-label="Warranty coverage by product type">
              <thead>
                <tr className="bg-[--color-brand-primary] text-white">
                  <th className="text-left px-5 py-3 font-semibold">Product</th>
                  <th className="text-left px-5 py-3 font-semibold">Frame / Structure</th>
                  <th className="text-left px-5 py-3 font-semibold">Fabric</th>
                  <th className="text-left px-5 py-3 font-semibold">Motor / Mechanism</th>
                </tr>
              </thead>
              <tbody>
                {WARRANTY_TABLE.map((row, i) => (
                  <tr key={row.product} className={i % 2 === 0 ? "bg-white" : "bg-[--color-neutral-50]"}>
                    <td className="px-5 py-3 font-medium text-[--color-text-primary]">{row.product}</td>
                    <td className="px-5 py-3 text-[--color-text-muted]">{row.frame}</td>
                    <td className="px-5 py-3 text-[--color-text-muted]">{row.fabric}</td>
                    <td className="px-5 py-3 text-[--color-text-muted]">{row.motor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[--color-text-muted] mt-3">
            * Warranty periods apply to products installed by a certified Shadesology installer. 
            DIY installation voids the frame warranty. See full terms below.
          </p>
        </section>

        {/* What's covered */}
        <section aria-labelledby="covered-heading" className="mb-12">
          <h2 id="covered-heading" className="text-2xl font-bold mb-5">What&apos;s Covered</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-green-50 border border-green-200 p-5">
              <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Covered
              </h3>
              <ul className="text-sm text-green-700 space-y-1.5">
                <li>Manufacturing defects in materials and workmanship</li>
                <li>Frame corrosion under normal conditions</li>
                <li>Fabric fading beyond expected rates</li>
                <li>Motor or mechanism failures under normal use</li>
                <li>Structural component failures</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-red-50 border border-red-200 p-5">
              <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Not Covered
              </h3>
              <ul className="text-sm text-red-700 space-y-1.5">
                <li>Damage caused by extreme weather events (storm, hail)</li>
                <li>Improper installation or DIY installation</li>
                <li>Accidental damage or misuse</li>
                <li>Normal wear and tear, including fading within expected rates</li>
                <li>Modifications not authorised by Shadesology</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Claim */}
        <section aria-labelledby="claim-heading" className="mb-12">
          <h2 id="claim-heading" className="text-2xl font-bold mb-4">How to Make a Claim</h2>
          <ol className="space-y-4">
            {[
              "Contact our support team with your order number and a description of the issue.",
              "Provide photos or videos showing the defect clearly.",
              "Our team will assess the claim within 3 business days.",
              "If approved, we will arrange repair, replacement or refund as appropriate.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="shrink-0 w-8 h-8 rounded-full bg-[--color-brand-primary] text-white text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-[--color-text-muted] pt-1">{step}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex gap-4 flex-wrap">
            <Link href="/support/service" className="px-6 py-2.5 rounded-xl bg-[--color-brand-primary] text-white font-semibold hover:bg-[--color-brand-primary-light] transition-colors">
              Submit a Claim
            </Link>
            <Link href="/contact" className="px-6 py-2.5 rounded-xl border-2 border-[--color-brand-primary] text-[--color-brand-primary] font-semibold hover:bg-[--color-brand-primary] hover:text-white transition-colors">
              Contact Support
            </Link>
          </div>
        </section>
        <WarrantyRegistrationForm />
      </div>
    </>
  );
}
