"use client";

import { useCallback, useEffect, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface ProductType {
  _id: string;
  slug: string;
  name: { en?: string } | string;
}

interface Installer {
  _id: string;
  businessName: string;
  email?: string;
  address: { city: string; state: string };
  status: string;
  isActive: boolean;
  rankingScore: number;
  responseRatePercent?: number;
  jobsCompleted?: number;
  certifiedProductTypes: string[];
  specialities: string[];
}

interface Application {
  _id: string;
  referenceNumber: string;
  status: string;
  createdAt: string;
  applicant?: { firstName: string; lastName: string; email: string };
  data?: { businessName?: string; city?: string; state?: string; insuranceExpiry?: string };
  documents?: { label: string }[];
}

interface Referral {
  _id?: string;
  region: string;
  enabled: boolean;
  partnerName: string;
  partnerUrl: string;
  clicks: number;
}

function nameOf(value: ProductType["name"]) {
  return typeof value === "string" ? value : value.en || "";
}

export default function AdminInstallersPage() {
  const [installers, setInstallers] = useState<Installer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<{ counts: Record<string, number>; responseRatePercent: number } | null>(null);
  const [newReferral, setNewReferral] = useState<Referral>({ region: "", enabled: false, partnerName: "", partnerUrl: "", clicks: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const endpoints = [
        "/admin/installers?limit=100",
        "/admin/approvals?type=installer_application&limit=100",
        "/admin/product-types?limit=100",
        "/admin/installers/referrals",
        "/admin/installers/lead-flow",
      ];
      const responses = await Promise.all(endpoints.map((path) => fetch(`${BASE}${path}`, { credentials: "include", cache: "no-store" })));
      const json = await Promise.all(responses.map((response) => response.json()));
      const failed = responses.findIndex((response) => !response.ok);
      if (failed >= 0) throw new Error(json[failed].message || `Could not load installer management (${responses[failed].status}).`);
      setInstallers(json[0].data || []);
      setApplications(json[1].data || []);
      setProductTypes(json[2].data || []);
      setReferrals(json[3].data || []);
      setStats(json[4].data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Installer management could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial authenticated data loading is an external side effect.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  async function send(path: string, method: string, body?: unknown) {
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
      if (!response.ok) throw new Error(json.message || "The change could not be saved.");
      setNotice(json.message || "Changes saved.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The change could not be saved.");
    } finally {
      setBusy("");
    }
  }

  function updateInstaller(id: string, patch: Partial<Installer>) {
    setInstallers((current) => current.map((installer) => installer._id === id ? { ...installer, ...patch } : installer));
  }

  async function saveReferral(event: React.FormEvent) {
    event.preventDefault();
    await send("/admin/installers/referrals", "PUT", newReferral);
    setNewReferral({ region: "", enabled: false, partnerName: "", partnerUrl: "", clicks: 0 });
  }

  return (
    <main className="container max-w-7xl py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Installer network</h1>
          <p className="mt-2 text-sm text-[--color-text-muted]">Review applications, manage installer coverage and certifications, and control regional referrals.</p>
        </div>
        <button type="button" onClick={() => { setLoading(true); void load(); }} className="rounded-lg border px-4 py-2 text-sm font-semibold">Refresh</button>
      </header>

      {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
      {stats && <section aria-label="Installer lead response statistics" className="mt-6 grid gap-3 sm:grid-cols-4">
        {Object.entries(stats.counts || {}).map(([status, count]) => <div key={status} className="rounded-xl border bg-white p-4">
          <p className="text-sm capitalize text-[--color-text-muted]">{status.replaceAll("_", " ")}</p><p className="mt-1 text-2xl font-bold">{count}</p>
        </div>)}
        <div className="rounded-xl border bg-white p-4"><p className="text-sm text-[--color-text-muted]">Overall response rate</p><p className="mt-1 text-2xl font-bold">{stats.responseRatePercent}%</p></div>
      </section>}

      <section className="mt-8">
        <h2 className="text-xl font-bold">Pending applications</h2>
        {loading ? <p className="py-5">Loading…</p> : applications.filter((application) => ["pending", "in_review"].includes(application.status)).length === 0
          ? <p className="mt-3 rounded-xl border p-5 text-sm text-[--color-text-muted]">No installer applications are awaiting review.</p>
          : <div className="mt-3 space-y-3">
            {applications.filter((application) => ["pending", "in_review"].includes(application.status)).map((application) => <article key={application._id} className="rounded-xl border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{application.data?.businessName || "Installer applicant"}</h3>
                  <p className="text-sm text-[--color-text-muted]">{application.applicant?.firstName} {application.applicant?.lastName} · {application.applicant?.email} · {application.data?.city}, {application.data?.state}</p>
                  <p className="mt-1 text-xs text-[--color-text-muted]">Ref {application.referenceNumber} · Insurance expires {application.data?.insuranceExpiry ? new Date(application.data.insuranceExpiry).toLocaleDateString() : "not recorded"}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold capitalize">{application.status.replaceAll("_", " ")}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                {application.documents?.map((document, index) => <a key={`${application._id}-${index}`} href={`${BASE}/admin/installers/applications/${application._id}/documents/${index}`} target="_blank" rel="noopener noreferrer" className="text-[--color-brand-primary] underline">{document.label || `Document ${index + 1}`}</a>)}
                <button type="button" disabled={busy !== ""} onClick={() => void send(`/admin/approvals/${application._id}/approve`, "PATCH", { resolution: "Installer application approved." })} className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white disabled:opacity-50">Approve</button>
                <button type="button" disabled={busy !== ""} onClick={() => void send(`/admin/approvals/${application._id}/reject`, "PATCH", { resolution: "Installer application requires changes." })} className="rounded-lg border border-red-300 px-4 py-2 font-semibold text-red-700 disabled:opacity-50">Reject</button>
              </div>
            </article>)}
          </div>}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Installer profiles</h2>
        {installers.length === 0 ? <p className="mt-3 rounded-xl border p-5 text-sm text-[--color-text-muted]">No installer profiles yet.</p> : (
          <div className="mt-3 space-y-4">
            {installers.map((installer) => <article key={installer._id} className="rounded-xl border bg-white p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h3 className="font-bold">{installer.businessName}</h3>
                  <p className="text-sm text-[--color-text-muted]">{installer.address?.city}, {installer.address?.state} · {installer.email}</p>
                  <p className="mt-1 text-xs capitalize text-[--color-text-muted]">{installer.status} · {installer.responseRatePercent ?? 0}% response · {installer.jobsCompleted ?? 0} completed jobs</p>
                </div>
                <label className="text-sm">Ranking score
                  <input type="number" min={0} max={1000} value={installer.rankingScore ?? 0} onChange={(event) => updateInstaller(installer._id, { rankingScore: Number(event.target.value) })} className="ml-2 w-24 rounded border px-2 py-1" />
                </label>
              </div>
              <fieldset className="mt-4">
                <legend className="text-sm font-semibold">Certified product types</legend>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                  {productTypes.map((productType) => <label key={productType._id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(installer.certifiedProductTypes || []).includes(productType._id)}
                      onChange={(event) => {
                        const existing = installer.certifiedProductTypes || [];
                        const next = event.target.checked ? [...existing, productType._id] : existing.filter((id) => id !== productType._id);
                        updateInstaller(installer._id, { certifiedProductTypes: next });
                      }}
                    />
                    {nameOf(productType.name) || productType.slug}
                  </label>)}
                </div>
              </fieldset>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" disabled={busy !== ""} onClick={() => void send(`/admin/installers/${installer._id}`, "PATCH", { rankingScore: installer.rankingScore, certifiedProductTypes: installer.certifiedProductTypes || [] })} className="rounded-lg bg-[--color-brand-primary] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save profile settings</button>
                {installer.status === "approved" && <button type="button" disabled={busy !== ""} onClick={() => void send(`/admin/installers/${installer._id}`, "PATCH", installer.isActive ? { status: "suspended", isActive: false } : { status: "approved", isActive: true })} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50">{installer.isActive ? "Suspend" : "Restore"}</button>}
              </div>
            </article>)}
          </div>
        )}
      </section>

      <section className="mt-10 rounded-xl border bg-white p-5">
        <h2 className="text-xl font-bold">Regional referral handoff</h2>
        <p className="mt-1 text-sm text-[--color-text-muted]">Disable a region here to switch off a third-party handoff without a code change.</p>
        <ul className="mt-4 space-y-2">
          {referrals.map((referral) => <li key={referral.region} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 p-3 text-sm">
            <span><strong>{referral.region}</strong> · {referral.partnerName} · {referral.clicks} tracked clicks</span>
            <button type="button" disabled={busy !== ""} onClick={() => void send("/admin/installers/referrals", "PUT", { ...referral, enabled: !referral.enabled })} className={`rounded px-3 py-1.5 font-semibold ${referral.enabled ? "bg-green-100 text-green-900" : "bg-gray-200 text-gray-800"}`}>{referral.enabled ? "Enabled — switch off" : "Disabled — enable"}</button>
          </li>)}
        </ul>
        <form onSubmit={saveReferral} className="mt-5 grid gap-3 border-t pt-5 sm:grid-cols-2">
          <label className="text-sm">Region code<input required maxLength={20} value={newReferral.region} onChange={(event) => setNewReferral((current) => ({ ...current, region: event.target.value.toUpperCase() }))} className="mt-1 w-full rounded border px-3 py-2" placeholder="FL" /></label>
          <label className="text-sm">Partner name<input required value={newReferral.partnerName} onChange={(event) => setNewReferral((current) => ({ ...current, partnerName: event.target.value }))} className="mt-1 w-full rounded border px-3 py-2" /></label>
          <label className="text-sm sm:col-span-2">HTTPS partner URL<input required type="url" value={newReferral.partnerUrl} onChange={(event) => setNewReferral((current) => ({ ...current, partnerUrl: event.target.value }))} className="mt-1 w-full rounded border px-3 py-2" /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newReferral.enabled} onChange={(event) => setNewReferral((current) => ({ ...current, enabled: event.target.checked }))} /> Enable this region immediately</label>
          <button disabled={busy !== ""} className="justify-self-start rounded-lg bg-[--color-brand-primary] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save region</button>
        </form>
      </section>
    </main>
  );
}
