import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Specifier Resources | Shadesology",
  description: "Professional CAD, BIM, specifications and technical resources for Shadesology specifiers.",
};

export default function SpecifierPage() {
  return (
    <main className="container max-w-4xl py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-[--color-brand-primary]">Professional resources</p>
      <h1 className="mt-3 text-4xl font-bold">Specifier portal</h1>
      <p className="mt-4 max-w-2xl text-[--color-text-muted]">Find product specifications, CAD and BIM files, engineering documents and certification resources for your projects.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/specifier/apply" className="rounded-lg bg-[--color-brand-primary] px-5 py-3 font-semibold text-white">Apply for specifier access</Link>
        <Link href="/specifier/portal" className="rounded-lg border border-[--color-border] px-5 py-3 font-semibold">Sign in to the portal</Link>
      </div>
    </main>
  );
}
