"use client";

import { useCallback, useEffect, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const CONTACT_KEYS = [
  "email", "firstName", "lastName", "phone", "company", "leadSource",
  "enquiryType", "productInterest", "segment", "pricingTier", "leadStatus",
  "marketingConsent",
];
const DEAL_KEYS = ["syncKey", "dealType", "quoteRef", "orderRef"];
const DEFAULT_CONTACT = {
  email: "email",
  firstName: "firstname",
  lastName: "lastname",
  phone: "phone",
  company: "company",
  leadSource: "lead_source",
  enquiryType: "enquiry_type",
  productInterest: "product_interest",
  segment: "segment",
  pricingTier: "pricing_tier",
  leadStatus: "lead_status",
  marketingConsent: "shadesology_marketing_consent",
};
const DEFAULT_DEAL = {
  syncKey: "shadesology_sync_key",
  dealType: "shadesology_deal_type",
  quoteRef: "shadesology_quote_ref",
  orderRef: "shadesology_order_ref",
};

type Config = {
  contactProperties: Record<string, string>;
  dealProperties: Record<string, string>;
  quoteStageMap: Record<string, string>;
  orderStageMap: Record<string, string>;
  leadStatusMap: Record<string, string>;
};
type EntityCounts = { entity: string; pending: number; synced: number; failed: number; skipped: number };
type Dashboard = {
  mode: string;
  entities: EntityCounts[];
  deadLetterCounts: Record<string, number>;
  recentFailures: { entity: string; id: string; error: string; updatedAt: string }[];
};

const DEFAULT_CONFIG: Config = {
  contactProperties: DEFAULT_CONTACT,
  dealProperties: DEFAULT_DEAL,
  quoteStageMap: {},
  orderStageMap: {},
  leadStatusMap: {},
};

async function responseData<T>(response: Response): Promise<T> {
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || `Request failed (${response.status}).`);
  return json.data as T;
}

export default function AdminCrmPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [quoteMapText, setQuoteMapText] = useState("{}");
  const [orderMapText, setOrderMapText] = useState("{}");
  const [leadMapText, setLeadMapText] = useState("{}");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboardResponse, configResponse] = await Promise.all([
        fetch(`${BASE}/admin/crm`, { credentials: "include", cache: "no-store" }),
        fetch(`${BASE}/admin/crm/config`, { credentials: "include", cache: "no-store" }),
      ]);
      const [currentDashboard, currentConfig] = await Promise.all([
        responseData<Dashboard>(dashboardResponse),
        responseData<Partial<Config>>(configResponse),
      ]);
      const next = {
        ...DEFAULT_CONFIG,
        ...currentConfig,
        contactProperties: { ...DEFAULT_CONTACT, ...currentConfig.contactProperties },
        dealProperties: { ...DEFAULT_DEAL, ...currentConfig.dealProperties },
      };
      setDashboard(currentDashboard);
      setConfig(next);
      setQuoteMapText(JSON.stringify(next.quoteStageMap, null, 2));
      setOrderMapText(JSON.stringify(next.orderStageMap, null, 2));
      setLeadMapText(JSON.stringify(next.leadStatusMap, null, 2));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load CRM status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => { await load(); })();
  }, [load]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload: Config = {
        ...config,
        quoteStageMap: JSON.parse(quoteMapText),
        orderStageMap: JSON.parse(orderMapText),
        leadStatusMap: JSON.parse(leadMapText),
      };
      const saved = await responseData<Config>(await fetch(`${BASE}/admin/crm/config`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }));
      setConfig({
        ...DEFAULT_CONFIG,
        ...saved,
        contactProperties: { ...DEFAULT_CONTACT, ...saved.contactProperties },
        dealProperties: { ...DEFAULT_DEAL, ...saved.dealProperties },
      });
      setNotice("HubSpot property and status mappings saved and validated against the selected portal.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save CRM configuration.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm";
  return (
    <main className="container max-w-6xl py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">CRM integration</h1>
          <p className="mt-2 text-sm text-[--color-text-muted]">
            {dashboard ? `HubSpot mode: ${dashboard.mode}. Source records remain in MongoDB if CRM delivery is delayed.` : "CRM queue health and portal field mappings."}
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="rounded border px-4 py-2 text-sm">Refresh status</button>
      </div>
      {error && <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

      <section className="mt-6 rounded-xl border bg-white p-5" aria-labelledby="crm-queue-heading">
        <h2 id="crm-queue-heading" className="text-xl font-semibold">Sync queue</h2>
        {loading ? <p className="py-4">Loading…</p> : (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead><tr className="border-b bg-gray-50"><th className="p-3">Entity</th><th className="p-3">Pending</th><th className="p-3">Synced</th><th className="p-3">Failed</th><th className="p-3">Skipped</th></tr></thead>
                <tbody>{dashboard?.entities.map((item) => (
                  <tr key={item.entity} className="border-b last:border-0">
                    <th scope="row" className="p-3 font-medium">{item.entity}</th>
                    <td className="p-3">{item.pending}</td><td className="p-3">{item.synced}</td><td className="p-3">{item.failed}</td><td className="p-3">{item.skipped}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-[--color-text-muted]">
              Dead-letter jobs: {dashboard?.deadLetterCounts.waiting ?? 0} waiting, {dashboard?.deadLetterCounts.failed ?? 0} failed.
            </p>
            {(dashboard?.recentFailures.length ?? 0) > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold">Recent sync failures</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {dashboard?.recentFailures.map((item) => (
                    <li key={`${item.entity}-${item.id}`} className="rounded border border-red-200 bg-red-50 p-3">
                      <strong>{item.entity}</strong> · {item.id} · {item.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </section>

      <section className="mt-8 rounded-xl border bg-white p-5" aria-labelledby="crm-mapping-heading">
        <h2 id="crm-mapping-heading" className="text-xl font-semibold">HubSpot field mappings</h2>
        <p className="mt-1 text-sm text-[--color-text-muted]">Property names are checked against the currently selected HubSpot portal before saving.</p>
        <form onSubmit={save} className="mt-4 space-y-6">
          <fieldset>
            <legend className="font-semibold">Contact properties</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CONTACT_KEYS.map((key) => (
                <label key={key} className="text-xs">{key}
                  <input required className={inputClass} value={config.contactProperties[key] ?? ""} onChange={(event) => setConfig((current) => ({ ...current, contactProperties: { ...current.contactProperties, [key]: event.target.value } }))} />
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="font-semibold">Deal properties</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {DEAL_KEYS.map((key) => (
                <label key={key} className="text-xs">{key}
                  <input required className={inputClass} value={config.dealProperties[key] ?? ""} onChange={(event) => setConfig((current) => ({ ...current, dealProperties: { ...current.dealProperties, [key]: event.target.value } }))} />
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 lg:grid-cols-3">
            <label className="text-xs">Quote stage ID → local quote status (JSON)
              <textarea rows={7} className={`${inputClass} mt-1 font-mono`} value={quoteMapText} onChange={(event) => setQuoteMapText(event.target.value)} />
            </label>
            <label className="text-xs">Order stage ID → local order status (JSON)
              <textarea rows={7} className={`${inputClass} mt-1 font-mono`} value={orderMapText} onChange={(event) => setOrderMapText(event.target.value)} />
            </label>
            <label className="text-xs">HubSpot lead status → local lead status (JSON)
              <textarea rows={7} className={`${inputClass} mt-1 font-mono`} value={leadMapText} onChange={(event) => setLeadMapText(event.target.value)} />
            </label>
          </div>
          <button disabled={saving} className="rounded-lg bg-[--color-brand-primary] px-5 py-2 font-semibold text-white disabled:opacity-50">
            {saving ? "Saving…" : "Save CRM mappings"}
          </button>
        </form>
      </section>
    </main>
  );
}
