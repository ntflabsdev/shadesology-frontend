import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequestLocale } from "@/i18n/server";
import { formatDate } from "@/i18n/format";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface InstallerProfile {
  businessName: string;
  description?: { en?: string } | string;
  address: { city: string; state: string; zip?: string };
  phone?: string;
  email?: string;
  website?: string;
  coverageAreas: { postcode: string; radiusMiles: number }[];
  specialities: string[];
  certifications: { name?: string; issuedAt?: string; expiresAt?: string }[];
  certifiedProductTypes?: { _id: string; name: { en?: string } | string; slug: string }[];
  isVerified: boolean;
}

export default async function InstallerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const response = await fetch(`${BASE}/api/installers/${encodeURIComponent(slug)}`, { next: { revalidate: 300 } });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Installer profile could not be loaded.");
  const json = await response.json();
  const installer = json.data as InstallerProfile;
  const description = typeof installer.description === "string" ? installer.description : installer.description?.en;

  return (
    <main className="container max-w-4xl py-12">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm">
        <Link href="/find-installer" className="text-[--color-brand-primary] hover:underline">Find an installer</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span>{installer.businessName}</span>
      </nav>
      <header className="rounded-2xl bg-[--color-brand-primary] p-8 text-white">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold">{installer.businessName}</h1>
          {installer.isVerified && <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">Verified installer</span>}
        </div>
        <p className="mt-2 text-white/80">{installer.address.city}, {installer.address.state}</p>
        {description && <p className="mt-5 max-w-2xl leading-relaxed">{description}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          {installer.phone && <a href={`tel:${installer.phone}`} className="rounded-lg bg-white px-4 py-2 font-semibold text-[--color-brand-primary]">Call {installer.phone}</a>}
          {installer.email && <a href={`mailto:${installer.email}`} className="rounded-lg border border-white/70 px-4 py-2 font-semibold text-white">Email installer</a>}
          {installer.website && <a href={installer.website} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/70 px-4 py-2 font-semibold text-white">Visit website</a>}
        </div>
      </header>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section aria-labelledby="coverage-heading" className="rounded-xl border border-[--color-border] p-6">
          <h2 id="coverage-heading" className="text-xl font-bold">Coverage areas</h2>
          {installer.coverageAreas.length ? (
            <ul className="mt-3 space-y-2">
              {installer.coverageAreas.map((area) => <li key={`${area.postcode}-${area.radiusMiles}`} className="flex justify-between gap-4 border-b border-gray-100 py-2 text-sm last:border-0">
                <span>{area.postcode}</span><span className="text-[--color-text-muted]">Within {area.radiusMiles} miles</span>
              </li>)}
            </ul>
          ) : <p className="mt-3 text-sm text-[--color-text-muted]">Contact the installer to confirm service availability.</p>}
        </section>

        <section aria-labelledby="specialities-heading" className="rounded-xl border border-[--color-border] p-6">
          <h2 id="specialities-heading" className="text-xl font-bold">Specialities</h2>
          {installer.specialities.length ? <ul className="mt-3 flex flex-wrap gap-2">{installer.specialities.map((item) => <li key={item} className="rounded-full bg-gray-100 px-3 py-1 text-sm">{item}</li>)}</ul> : <p className="mt-3 text-sm text-[--color-text-muted]">Contact for product availability.</p>}
        </section>

        <section aria-labelledby="certifications-heading" className="rounded-xl border border-[--color-border] p-6 md:col-span-2">
          <h2 id="certifications-heading" className="text-xl font-bold">Certifications</h2>
          {installer.certifications.length || installer.certifiedProductTypes?.length ? (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {installer.certifications.map((item, index) => <li key={`${item.name}-${index}`} className="rounded-lg bg-gray-50 p-3 text-sm">
                <span className="font-semibold">{item.name || "Installer certification"}</span>
                {item.expiresAt && <span className="ml-2 text-[--color-text-muted]">Expires {formatDate(item.expiresAt, locale)}</span>}
              </li>)}
              {installer.certifiedProductTypes?.map((item) => <li key={item._id} className="rounded-lg bg-gray-50 p-3 text-sm">
                Certified for {typeof item.name === "string" ? item.name : item.name?.en || item.slug}
              </li>)}
            </ul>
          ) : <p className="mt-3 text-sm text-[--color-text-muted]">Certification details are available on request.</p>}
        </section>
      </div>
    </main>
  );
}
