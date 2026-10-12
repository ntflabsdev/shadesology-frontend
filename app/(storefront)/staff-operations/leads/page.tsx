"use client";

import { useCallback, useEffect, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
type Rule = { enquiryType: string; productType: string; region: string; notifyEmail: string };
type Lead = { _id: string; enquiryType: string; leadQueue?: "consumer" | "commercial"; name: string; email: string; productType: string; region: string; status: string; createdAt: string; subject?: string; issueType?: string; message?: string; company?: string; applicationData?: Record<string, string>; attachments?: { filename: string }[]; installerAssignment?: { installer?: string; status?: string } };
type Installer = { _id: string; businessName: string; status: string; isActive: boolean };
const newRule = (): Rule => ({ enquiryType: "", productType: "", region: "", notifyEmail: "" });
const enquiryTypes = ["contact", "quote", "service_request", "dealer", "installer", "commercial_lease", "commercial_project", "chat", "warranty_registration"];

export default function AdminLeadsPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [installers, setInstallers] = useState<Installer[]>([]);
  const [assignmentDrafts, setAssignmentDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [queue, setQueue] = useState<"consumer" | "commercial">("consumer");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [routingResponse, leadsResponse, installersResponse] = await Promise.all([
        fetch(`${BASE}/admin/leads/routing`, { credentials: "include", cache: "no-store" }),
        fetch(`${BASE}/admin/leads?queue=${queue}&limit=50`, { credentials: "include", cache: "no-store" }),
        fetch(`${BASE}/admin/installers?status=approved&limit=100`, { credentials: "include", cache: "no-store" }),
      ]);
      const [routingJson, leadsJson, installersJson] = await Promise.all([routingResponse.json(), leadsResponse.json(), installersResponse.json()]);
      if (!routingResponse.ok) throw new Error(routingJson.message || "Could not load lead routing.");
      if (!leadsResponse.ok) throw new Error(leadsJson.message || "Could not load leads.");
      if (!installersResponse.ok) throw new Error(installersJson.message || "Could not load installer profiles.");
      setRules(routingJson.data ?? []);
      setLeads(leadsJson.data ?? []);
      setInstallers(installersJson.data ?? []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load lead management.");
    } finally { setLoading(false); }
  }, [queue]);
  useEffect(() => { void (async () => { await load(); })(); }, [load]);

  async function saveRules(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch(`${BASE}/admin/leads/routing`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Could not save lead routing.");
      setRules(json.data ?? []);
      setNotice("Lead routing saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save lead routing.");
    } finally { setSaving(false); }
  }

  async function assignLead(leadId: string) {
    const installerId = assignmentDrafts[leadId];
    if (!installerId) {
      setError("Choose an active installer before assigning the lead.");
      return;
    }
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${BASE}/admin/installers/leads/${leadId}/assign`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installerId }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Could not assign installer lead.");
      setNotice("Lead offered to installer.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not assign installer lead.");
    }
  }

  const inputClass = "w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm";
  return (
    <main className="container max-w-6xl py-10">
      <h1 className="text-3xl font-bold">Leads & routing</h1>
      <p className="mt-2 text-sm text-[--color-text-muted]">Lead submissions are stored before autoresponders or staff notifications are queued. Matching rules prioritize the most specific product, region and enquiry type; unmatched leads go to the configured default support email.</p>
      {error && <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
      <section className="mt-6 rounded-xl border bg-white p-5">
        <h2 className="text-xl font-semibold">Notification routing rules</h2>
        <form onSubmit={saveRules} className="mt-4 space-y-3">
          {rules.map((rule, index) => <div key={index} className="grid gap-2 rounded border p-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-xs">Enquiry type<select className={inputClass} value={rule.enquiryType} onChange={(event) => setRules((current) => current.map((row, i) => i === index ? { ...row, enquiryType: event.target.value } : row))}><option value="">Any</option>{enquiryTypes.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select></label>
            <label className="text-xs">Product type<input className={inputClass} maxLength={100} value={rule.productType} onChange={(event) => setRules((current) => current.map((row, i) => i === index ? { ...row, productType: event.target.value } : row))} /></label>
            <label className="text-xs">Region<input className={inputClass} maxLength={100} value={rule.region} onChange={(event) => setRules((current) => current.map((row, i) => i === index ? { ...row, region: event.target.value } : row))} /></label>
            <label className="text-xs">Notify email<input required type="email" className={inputClass} value={rule.notifyEmail} onChange={(event) => setRules((current) => current.map((row, i) => i === index ? { ...row, notifyEmail: event.target.value } : row))} /></label>
            <button type="button" onClick={() => setRules((current) => current.filter((_, i) => i !== index))} className="self-end rounded border border-red-300 px-3 py-2 text-sm text-red-700">Remove rule</button>
          </div>)}
          <div className="flex gap-2"><button type="button" onClick={() => setRules((current) => [...current, newRule()])} className="rounded border px-4 py-2 text-sm">Add rule</button><button disabled={saving} className="rounded-lg bg-[--color-brand-primary] px-5 py-2 font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save routing"}</button></div>
        </form>
      </section>
      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{queue === "commercial" ? "Commercial project queue" : "Consumer lead queue"}</h2>
          <label className="text-sm font-medium">Queue
            <select className="ml-2 rounded border px-3 py-2" value={queue} onChange={(event) => setQueue(event.target.value as "consumer" | "commercial")}>
              <option value="consumer">Consumer</option>
              <option value="commercial">Commercial</option>
            </select>
          </label>
        </div>
        {loading ? <p className="py-5">Loading…</p> : leads.length === 0 ? <p className="py-5 text-sm text-[--color-text-muted]">No leads recorded yet.</p> : <div className="mt-3 overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left text-sm"><thead><tr className="border-b bg-gray-50"><th className="p-3">Received</th><th className="p-3">Type</th><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Product / region</th><th className="p-3">Details</th><th className="p-3">Attachments</th><th className="p-3">Installer</th><th className="p-3">Status</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead._id} className="border-b last:border-0"><td className="p-3">{new Date(lead.createdAt).toLocaleString()}</td><td className="p-3">{lead.enquiryType.replaceAll("_", " ")}</td><td className="p-3">{lead.name}</td><td className="p-3">{lead.email}</td><td className="p-3">{[lead.productType, lead.region].filter(Boolean).join(" · ") || "—"}</td><td className="max-w-sm p-3"><details><summary className="cursor-pointer font-medium">Open</summary><div className="mt-2 space-y-1 whitespace-pre-wrap text-xs"><p><strong>{lead.subject || lead.issueType || "Message"}</strong></p>{lead.company && <p>Company: {lead.company}</p>}<p>{lead.message}</p>{lead.applicationData && <pre className="overflow-auto rounded bg-gray-50 p-2">{JSON.stringify(lead.applicationData, null, 2)}</pre>}</div></details></td><td className="p-3">{lead.attachments?.map((attachment, index) => <a key={index} href={`${BASE}/admin/leads/${lead._id}/attachments/${index}`} target="_blank" rel="noopener noreferrer" className="mr-2 text-[--color-brand-primary] underline">{attachment.filename || `Photo ${index + 1}`}</a>)}</td><td className="p-3"><div className="flex min-w-48 flex-col gap-2"><span className="text-xs capitalize">{lead.installerAssignment?.status || "Not assigned"}</span><select aria-label={`Assign ${lead.name} to an installer`} className="rounded border px-2 py-1 text-xs" value={assignmentDrafts[lead._id] || ""} onChange={(event) => setAssignmentDrafts((current) => ({ ...current, [lead._id]: event.target.value }))}><option value="">Choose installer</option>{installers.filter((installer) => installer.isActive).map((installer) => <option key={installer._id} value={installer._id}>{installer.businessName}</option>)}</select><button type="button" onClick={() => void assignLead(lead._id)} className="rounded border px-2 py-1 text-xs font-semibold">Offer lead</button></div></td><td className="p-3 capitalize">{lead.status}</td></tr>)}</tbody></table></div>}
      </section>
    </main>
  );
}
