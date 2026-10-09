import Link from "next/link";
import { getRequestLocale } from "@/i18n/server";
import { formatDate } from "@/i18n/format";
import { getVideos, t } from "@/lib/api";
import { VideoPlayer } from "@/components/media/VideoPlayer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resource Library | Shadesology",
  description: "Download installation manuals, BIM/CAD files, spec sheets, certifications and product brochures.",
};

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface DocResource {
  _id: string;
  title: { en: string };
  type: string;
  currentVersion?: string;
  versions?: { version: string; fileUrl?: string; uploadedAt?: string; notes?: string }[];
  effectiveDate?: string;
  expiryDate?: string;
  gating: "open" | "email_required" | "logged_in" | "role_required";
  fileUrl?: string | null;
  downloadCount: number;
  products?: { name?: { en?: string }; slug: string }[];
  productTypes?: { name?: { en?: string }; slug: string }[];
}

async function getDocuments(type?: string, product?: string, productType?: string): Promise<DocResource[]> {
  try {
    const query = new URLSearchParams();
    if (type) query.set("type", type);
    if (product) query.set("product", product);
    if (productType) query.set("productType", productType);
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await fetch(`${BASE}/api/content/documents${qs}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

const DOC_TYPE_LABELS: Record<string, string> = {
  manual:        "Installation Manual",
  spec_sheet:    "Spec Sheet",
  bim:           "BIM Object",
  cad:           "CAD File",
  certificate:   "Certificate",
  warranty:      "Warranty Document",
  price_list:    "Price List",
  order_form:    "Order Form",
  brochure:      "Brochure",
  engineering_report: "Engineering Report",
};

const GATING_LABELS: Record<string, string> = {
  open:          "Free download",
  email_required:"Email required",
  logged_in:     "Account required",
  role_required: "Trade account required",
};

const FILTER_CATEGORIES = [
  { value: "",           label: "All Documents" },
  { value: "manual",     label: "Manuals" },
  { value: "spec_sheet", label: "Spec Sheets" },
  { value: "bim",        label: "BIM / CAD" },
  { value: "certificate",label: "Certifications" },
  { value: "brochure",   label: "Brochures" },
];

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const locale = await getRequestLocale();
  const sp   = await searchParams;
  const type = sp.type || "";
  const product = sp.product || "";
  const productType = sp.productType || "";
  const [docs, allVideos] = await Promise.all([
    getDocuments(type || undefined, product || undefined, productType || undefined),
    getVideos(),
  ]);
  const guideVideos = allVideos.filter((video) => ["installation", "maintenance", "walkthrough"].includes(video.category));

  return (
    <>
      <header className="bg-[--color-brand-primary] text-white py-14">
        <div className="container max-w-4xl">
          <h1 className="text-4xl font-bold mb-2">Resource Library</h1>
          <p className="text-white/80 text-lg">
            Technical documentation, manuals, BIM/CAD files and certifications.
          </p>
        </div>
      </header>

      <div className="container max-w-4xl py-10">
        <form action="/resources" className="mb-6 grid gap-3 rounded-xl border border-[--color-border] bg-white p-4 sm:grid-cols-[1fr_1fr_auto]">
          {type && <input type="hidden" name="type" value={type} />}
          <label className="text-sm">Product model<input name="product" defaultValue={product} maxLength={120} placeholder="Filter by product model slug" className="mt-1 w-full rounded-lg border border-[--color-border] px-3 py-2" /></label>
          <label className="text-sm">Product type<input name="productType" defaultValue={productType} maxLength={120} placeholder="Filter by product type slug" className="mt-1 w-full rounded-lg border border-[--color-border] px-3 py-2" /></label>
          <button className="self-end rounded-lg bg-[--color-brand-primary] px-4 py-2 font-semibold text-white">Filter manuals</button>
        </form>
        {/* Filter tabs */}
        <nav aria-label="Document type filter" className="flex flex-wrap gap-2 mb-8">
          {FILTER_CATEGORIES.map((cat) => {
            const isActive = type === cat.value;
            return (
              <Link
                key={cat.value}
                href={cat.value ? `/resources?type=${cat.value}` : "/resources"}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[--color-brand-primary] text-white"
                    : "border border-[--color-border] text-[--color-text-primary] hover:border-[--color-brand-primary] hover:text-[--color-brand-primary]",
                ].join(" ")}
              >
                {cat.label}
              </Link>
            );
          })}
        </nav>

        {docs.length === 0 ? (
          <div className="text-center py-20 text-[--color-text-muted]">
            <p className="text-lg font-medium mb-2">No documents available yet</p>
            <p className="text-sm">Check back soon — we&apos;re loading our full library.</p>
          </div>
        ) : (
          <div className="border border-[--color-border] rounded-2xl overflow-hidden">
            <table className="w-full text-sm" aria-label="Resource library">
              <thead>
                <tr className="border-b border-[--color-border] bg-[--color-neutral-50]">
                  <th scope="col" className="px-5 py-3.5 text-left font-semibold text-[--color-text-primary]">Document</th>
                  <th scope="col" className="px-5 py-3.5 text-left font-semibold text-[--color-text-primary] hidden sm:table-cell">Type</th>
                  <th scope="col" className="px-5 py-3.5 text-left font-semibold text-[--color-text-primary] hidden md:table-cell">Version</th>
                  <th scope="col" className="px-5 py-3.5 text-left font-semibold text-[--color-text-primary]">Access</th>
                  <th scope="col" className="px-5 py-3.5 text-right font-semibold text-[--color-text-primary]">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--color-border]">
                {docs.map((doc, i) => (
                  <tr key={doc._id} className={i % 2 === 1 ? "bg-[--color-neutral-50]/50" : "bg-white"}>
                    <td className="px-5 py-3.5 font-medium text-[--color-text-primary]">
                      {doc.title ? t(doc.title, locale) : "Untitled"}
                      {(doc.products?.length || doc.productTypes?.length) ? <p className="mt-1 text-xs font-normal text-[--color-text-muted]">{[...(doc.products || []).map((productDoc) => productDoc.name?.en || productDoc.slug), ...(doc.productTypes || []).map((productTypeDoc) => productTypeDoc.name?.en || productTypeDoc.slug)].join(" · ")}</p> : null}
                      {doc.versions && doc.versions.length > 0 && (
                        <details className="mt-1 text-xs font-normal text-[--color-text-muted]">
                          <summary className="cursor-pointer">Version history ({doc.versions.length})</summary>
                          <ul className="mt-1 space-y-1">
                            {doc.versions.slice().reverse().map((version) => (
                              <li key={`${version.version}-${version.uploadedAt ?? ""}`}>
                                v{version.version}{version.uploadedAt ? ` · ${formatDate(version.uploadedAt, locale)}` : ""}
                                {doc.gating === "open" && version.fileUrl ? <> · <a className="text-[--color-brand-primary] underline" href={version.fileUrl} target="_blank" rel="noopener noreferrer">Download</a></> : ""}
                                {version.notes ? ` — ${version.notes}` : ""}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[--color-text-muted] hidden sm:table-cell">
                      {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                    </td>
                    <td className="px-5 py-3.5 text-[--color-text-muted] hidden md:table-cell">
                      {doc.currentVersion ? `v${doc.currentVersion}` : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={[
                        "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
                        doc.gating === "open"
                          ? "bg-green-100 text-green-700"
                          : doc.gating === "email_required"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-amber-50 text-amber-700",
                      ].join(" ")}>
                        {GATING_LABELS[doc.gating] ?? doc.gating}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {doc.gating === "open" && doc.fileUrl ? (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[--color-brand-primary] font-semibold hover:underline"
                          aria-label={`Download ${doc.title ? t(doc.title, locale) : "resource"}`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </a>
                      ) : (
                        <Link
                          href="/contact"
                          className="text-[--color-text-muted] hover:text-[--color-brand-primary] font-medium text-xs"
                        >
                          Request Access →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CTA to contact for custom needs */}
        <div className="mt-10 bg-[--color-neutral-50] rounded-2xl border border-[--color-border] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-[--color-text-primary]">Can&apos;t find what you need?</h2>
            <p className="text-sm text-[--color-text-muted] mt-0.5">
              Contact our technical team for custom specifications or engineering support.
            </p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-[--color-brand-primary] text-white font-semibold hover:bg-[--color-brand-primary-light] transition-colors whitespace-nowrap"
          >
            Contact Technical Team
          </Link>
        </div>
      </div>

      {guideVideos.length > 0 && (
        <section className="section border-t border-[--color-border]" aria-labelledby="guide-videos-heading">
          <div className="container max-w-5xl">
            <h2 id="guide-videos-heading" className="mb-6 text-2xl font-bold">Installation & maintenance videos</h2>
            <ul className="grid gap-6 md:grid-cols-2" role="list">
              {guideVideos.map((video) => (
                <li key={video._id} className="rounded-2xl border border-[--color-border] bg-white p-4">
                  <h3 className="mb-3 font-semibold">{t(video.title, locale) || "Product guide video"}</h3>
                  <VideoPlayer video={video} title={t(video.title, locale) || "Product guide video"} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
