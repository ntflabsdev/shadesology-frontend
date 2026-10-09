"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocaleSettings } from "@/components/i18n/LocaleProvider";
import { formatDate } from "@/i18n/format";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface ProductType {
  _id: string;
  name: { en?: string } | string;
  slug: string;
}

interface PortalProfile {
  businessName: string;
  coverageAreas: { postcode: string; radiusMiles: number; lat?: number; lng?: number }[];
  specialities: string[];
  certifiedProductTypes: ProductType[];
  responseRatePercent?: number;
  avgResponseHours?: number;
  jobsCompleted?: number;
}

interface PortalLead {
  _id: string;
  status: string;
  offeredAt: string;
  lead: {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    issueType?: string;
    message?: string;
    productType?: string;
    region?: string;
    orderNumber?: string;
    installDate?: string;
    createdAt?: string;
  } | null;
}

interface TechnicalDocument {
  id: string;
  title: { en?: string } | string;
  description?: { en?: string } | string;
  version: string;
  downloadUrl: string;
  expiresIn: number | null;
}

function label(value: { en?: string } | string | undefined) {
  return typeof value === "string" ? value : value?.en || "";
}

export default function InstallerPortalPage() {
  const { locale } = useLocaleSettings();
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [leads, setLeads] = useState<PortalLead[]>([]);
  const [coverageText, setCoverageText] = useState("");
  const [documents, setDocuments] = useState<Record<string, TechnicalDocument[]>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const [profileResponse, leadsResponse] = await Promise.all([
        fetch(`${BASE}/api/installers/portal/profile`, { credentials: "include", cache: "no-store" }),
        fetch(`${BASE}/api/installers/portal/leads`, { credentials: "include", cache: "no-store" }),
      ]);
      const [profileJson, leadsJson] = await Promise.all([profileResponse.json(), leadsResponse.json()]);
      if (!profileResponse.ok) throw new Error(profileJson.message || "Installer portal access denied.");
      if (!leadsResponse.ok) throw new Error(leadsJson.message || "Assigned leads could not be loaded.");
      setProfile(profileJson.data);
      setCoverageText((profileJson.data.coverageAreas || []).map((area: PortalProfile["coverageAreas"][number]) =>
        `${area.postcode}:${area.radiusMiles}${area.lat !== undefined && area.lng !== undefined ? `:${area.lat}:${area.lng}` : ""}`).join(", "));
      setLeads(leadsJson.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Installer portal could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial authenticated data loading is an external side effect.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  async function request(path: string, method: string, body?: unknown) {
    setBusy(path);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${BASE}${path}`, {
        method,
        credentials: "include",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "The request could not be completed.");
      setNotice(json.message || "Changes saved.");
      await load();
      return json.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "The request could not be completed.");
      return null;
    } finally {
      setBusy("");
    }
  }

  async function loadDocuments(productType: ProductType) {
    const params = new URLSearchParams({ productType: productType._id });
    setBusy(`documents-${productType._id}`);
    setError("");
    try {
      const response = await fetch(`${BASE}/api/installers/portal/documents?${params}`, { credentials: "include" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Technical documents could not be loaded.");
      setDocuments((current) => ({ ...current, [productType._id]: json.data || [] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Technical documents could not be loaded.");
    } finally {
      setBusy("");
    }
  }

  async function saveCoverage(event: React.FormEvent) {
    event.preventDefault();
    const coverageAreas = coverageText.split(",").map((value) => {
      const [postcode, rawRadius, rawLat, rawLng] = value.trim().split(":");
      return {
        postcode: postcode?.trim(),
        radiusMiles: rawRadius ? Number(rawRadius) : 25,
        ...(rawLat && rawLng ? { lat: Number(rawLat), lng: Number(rawLng) } : {}),
      };
    }).filter((area) => area.postcode);
    await request("/api/installers/portal/coverage", "PUT", { coverageAreas });
  }

  if (loading) return <main className="container py-12"><p role="status">Loading installer portal…</p></main>;

  return (
    <main className="container max-w-6xl py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[--color-brand-primary]">Installer network</p>
          <h1 className="mt-1 text-3xl font-bold">{profile?.businessName || "Installer portal"}</h1>
          <p className="mt-2 text-sm text-[--color-text-muted]">Customer contact information is revealed only after you accept an assigned lead.</p>
        </div>
        <div className="text-sm text-[--color-text-muted]">
          Response rate: {profile?.responseRatePercent ?? 0}% · Completed jobs: {profile?.jobsCompleted ?? 0}
        </div>
      </header>

      {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

      <section className="mt-8">
        <h2 className="text-xl font-bold">Assigned installation leads</h2>
        {leads.length === 0 ? <p className="mt-3 rounded-xl border p-5 text-sm text-[--color-text-muted]">No leads are assigned to your profile right now.</p> : (
          <ul className="mt-4 grid gap-4 lg:grid-cols-2">
            {leads.map((assignment) => {
              const offered = assignment.status === "offered";
              const lead = assignment.lead;
              return <li key={assignment._id} className="rounded-xl border border-[--color-border] bg-white p-5">
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="font-bold">{lead?.subject || lead?.issueType || "Installation request"}</h3>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize">{assignment.status.replaceAll("_", " ")}</span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div><dt className="text-[--color-text-muted]">Product</dt><dd>{lead?.productType || "—"}</dd></div>
                  <div><dt className="text-[--color-text-muted]">Area</dt><dd>{lead?.region || "—"}</dd></div>
                  <div><dt className="text-[--color-text-muted]">Received</dt><dd>{formatDate(assignment.offeredAt, locale)}</dd></div>
                  {lead?.orderNumber && <div><dt className="text-[--color-text-muted]">Order</dt><dd>{lead.orderNumber}</dd></div>}
                </dl>
                {lead?.message && <p className="mt-3 whitespace-pre-wrap text-sm">{lead.message}</p>}
                {offered ? (
                  <div className="mt-4 flex gap-2">
                    <button type="button" disabled={busy !== ""} onClick={() => void request(`/api/installers/portal/leads/${assignment._id}/respond/accept`, "PATCH")} className="rounded-lg bg-[--color-brand-primary] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Accept and view contact</button>
                    <button type="button" disabled={busy !== ""} onClick={() => void request(`/api/installers/portal/leads/${assignment._id}/respond/decline`, "PATCH")} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50">Decline</button>
                  </div>
                ) : (
                  <>
                    <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">
                      <p>{lead?.name || "Customer"} · {lead?.email || "No email"} · {lead?.phone || "No phone"}</p>
                    </div>
                    {["accepted", "contacted", "scheduled", "in_progress"].includes(assignment.status) && (
                      <label className="mt-4 block text-sm font-medium">
                        Update customer-visible job status
                        <select
                          className="mt-1 block w-full rounded border border-gray-300 bg-white p-2"
                          value=""
                          onChange={(event) => {
                            if (event.target.value) void request(`/api/installers/portal/leads/${assignment._id}/status`, "PATCH", { status: event.target.value });
                          }}
                        >
                          <option value="">Choose status</option>
                          <option value="contacted">Contacted</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="in_progress">In progress</option>
                          <option value="completed">Completed</option>
                          <option value="unable_to_complete">Unable to complete</option>
                        </select>
                      </label>
                    )}
                  </>
                )}
              </li>;
            })}
          </ul>
        )}
      </section>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border bg-white p-5">
          <h2 className="text-xl font-bold">Coverage area</h2>
          <p className="mt-1 text-sm text-[--color-text-muted]">Enter `ZIP:radius in miles` or `ZIP:radius:latitude:longitude`, separated by commas, to enable radius matching and distance sorting.</p>
          <form onSubmit={saveCoverage} className="mt-4 space-y-3">
            <label htmlFor="coverage-zips" className="sr-only">Coverage ZIP codes</label>
            <textarea id="coverage-zips" rows={3} value={coverageText} onChange={(event) => setCoverageText(event.target.value)} className="w-full rounded border border-gray-300 p-3 text-sm" placeholder="33101:25, 33102:40" />
            <button disabled={busy !== ""} className="rounded-lg bg-[--color-brand-primary] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save coverage</button>
          </form>
        </section>

        <section className="rounded-xl border bg-white p-5">
          <h2 className="text-xl font-bold">Certified product resources</h2>
          {!profile?.certifiedProductTypes.length ? <p className="mt-2 text-sm text-[--color-text-muted]">No product certifications are linked to your profile yet.</p> : (
            <ul className="mt-3 space-y-3">
              {profile.certifiedProductTypes.map((productType) => <li key={productType._id} className="rounded-lg bg-gray-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{label(productType.name) || productType.slug}</h3>
                  <button type="button" disabled={busy !== ""} onClick={() => void loadDocuments(productType)} className="text-sm font-semibold text-[--color-brand-primary] underline">Load manuals</button>
                </div>
                {documents[productType._id]?.map((document) => <a key={document.id} href={document.downloadUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block text-sm text-[--color-brand-primary] underline">{label(document.title)} · v{document.version}</a>)}
                {documents[productType._id]?.length === 0 && <p className="mt-2 text-xs text-[--color-text-muted]">No technical documents are published for this product type.</p>}
              </li>)}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
