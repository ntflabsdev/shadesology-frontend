"use client";

import { startTransition, useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { addToCart } from "@/lib/cart";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type PortalResponse<T> = { success: boolean; data: T; message?: string };
type CompanyProfile = {
  user: { firstName: string; lastName: string; email: string; pricingGroup: string };
  company: {
    _id: string;
    name: string;
    pricingGroup: string;
    creditLimit: number;
    paymentTerms: string;
    outstandingBalance: number;
    isCompanyAdmin: boolean;
  };
};
type OrderRow = {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  purchaseOrderNumber?: string;
  createdAt: string;
  items: { product: string; variant: string; quantity: number; selectedOptions?: Record<string, unknown> }[];
};
type QuoteRow = {
  _id: string;
  referenceNumber: string;
  status: string;
  total?: number;
  createdAt: string;
  dealerQuote?: { markupPercent: number; total: number };
};
type DealerCatalogItem = {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  unitCost: number;
};
type DealerQuoteDraftItem = { variantId: string; quantity: number };
type ResourceRow = { _id: string; title: { en?: string } | string; type: string; currentVersion: string; expiryDate?: string };
type ClaimRow = { _id: string; model: string; serialNumber: string; status: string; issue: string; createdAt: string };
type TrainingRow = { _id: string; title: { en?: string } | string; currentVersion: string; completedAt: string | null };
type MemberRow = { _id: string; firstName: string; lastName: string; email: string; role: string; isCompanyAdmin: boolean };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });
  const result = await response.json() as PortalResponse<T>;
  if (!response.ok) throw new Error(result.message || `Request failed (${response.status}).`);
  return result.data;
}

function title(value: ResourceRow["title"] | TrainingRow["title"]) {
  return typeof value === "string" ? value : value?.en || "Untitled";
}

export default function DealerPortalPage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [catalog, setCatalog] = useState<DealerCatalogItem[]>([]);
  const [quoteItems, setQuoteItems] = useState<DealerQuoteDraftItem[]>([]);
  const [quoteVariantId, setQuoteVariantId] = useState("");
  const [quoteQuantity, setQuoteQuantity] = useState("1");
  const [markupPercent, setMarkupPercent] = useState("20");
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [training, setTraining] = useState<TrainingRow[]>([]);
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [claimModel, setClaimModel] = useState("");
  const [claimSerial, setClaimSerial] = useState("");
  const [claimIssue, setClaimIssue] = useState("");
  const [claimPhoto, setClaimPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const [nextProfile, nextOrders, nextQuotes, nextCatalog, nextResources, nextTraining, nextClaims] = await Promise.all([
        request<CompanyProfile>("/api/portals/dealer/profile"),
        request<OrderRow[]>("/api/portals/dealer/orders"),
        request<QuoteRow[]>("/api/portals/dealer/quotes"),
        request<DealerCatalogItem[]>("/api/portals/dealer/catalog?limit=100"),
        request<ResourceRow[]>("/api/portals/dealer/documents"),
        request<TrainingRow[]>("/api/portals/dealer/training"),
        request<ClaimRow[]>("/api/portals/dealer/claims"),
      ]);
      startTransition(() => {
        setError("");
        setProfile(nextProfile);
        setOrders(nextOrders);
        setQuotes(nextQuotes);
        setCatalog(nextCatalog);
        setResources(nextResources);
        setTraining(nextTraining);
        setClaims(nextClaims);
      });
      if (nextProfile.company.isCompanyAdmin) {
        const [nextMembers, invitations] = await Promise.all([
          request<MemberRow[]>("/api/portals/company/members"),
          request<unknown[]>("/api/portals/company/invitations"),
        ]);
        startTransition(() => setMembers(nextMembers));
        void invitations;
      }
    } catch (cause) {
      startTransition(() => setError(cause instanceof Error ? cause.message : "Unable to load the dealer portal."));
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function openResource(id: string) {
    try {
      const data = await request<{ downloadUrl: string }>(`/api/portals/dealer/documents/${id}/download`);
      window.open(data.downloadUrl, "_blank", "noopener,noreferrer");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to open this resource.");
    }
  }

  async function updateTraining(id: string, completed: boolean) {
    try {
      await request(`/api/portals/dealer/training/${id}/progress`, {
        method: "PUT",
        body: JSON.stringify({ completed }),
      });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update training progress.");
    }
  }

  async function reorder(order: OrderRow) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (!order.items?.length || order.items.some((item) => !item.product || !item.variant || !Number.isInteger(item.quantity) || item.quantity < 1)) {
        throw new Error("This order does not contain enough item details to reorder.");
      }
      for (const item of order.items) {
        await addToCart(item.product, item.variant, item.quantity, item.selectedOptions || {});
      }
      setMessage(`${order.orderNumber} items were added to your cart. Prices and availability will be checked again.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to reorder this order.");
    } finally {
      setBusy(false);
    }
  }

  function addQuoteItem() {
    const quantity = Number(quoteQuantity);
    if (!quoteVariantId || !Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
      setError("Choose a catalog model and enter a quantity from 1 to 1000.");
      return;
    }
    const existing = quoteItems.find((item) => item.variantId === quoteVariantId);
    if (existing && existing.quantity + quantity > 1000) {
      setError("A quote line cannot exceed a quantity of 1000.");
      return;
    }
    setError("");
    setQuoteItems((current) => {
      const existing = current.find((item) => item.variantId === quoteVariantId);
      if (existing) {
        return current.map((item) => item.variantId === quoteVariantId
          ? { ...item, quantity: item.quantity + quantity }
          : item);
      }
      return [...current, { variantId: quoteVariantId, quantity }];
    });
    setQuoteQuantity("1");
  }

  async function createDealerQuote(event: FormEvent) {
    event.preventDefault();
    const markup = Number(markupPercent);
    if (!Number.isFinite(markup) || markup < 0 || markup > 1000 || !quoteItems.length) {
      setError("Enter a markup from 0 to 1000% and add at least one catalog item.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const quote = await request<{ referenceNumber: string; dealerQuote: { total: number } }>("/api/portals/dealer/quotes", {
        method: "POST",
        body: JSON.stringify({ markupPercent: markup, items: quoteItems }),
      });
      setQuoteItems([]);
      setMessage(`Dealer quote ${quote.referenceNumber} saved · resale total $${quote.dealerQuote.total.toLocaleString()}.`);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save the dealer quote.");
    } finally {
      setBusy(false);
    }
  }

  async function invite(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await request("/api/portals/company/invitations", {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail }),
      });
      setInviteEmail("");
      setMessage("Invitation sent.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to send the invitation.");
    } finally {
      setBusy(false);
    }
  }

  async function submitClaim(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      let photos: { key: string; filename: string }[] = [];
      if (claimPhoto) {
        const upload = await request<{ key: string; uploadUrl: string; fields: Record<string, string> }>(
          "/api/portals/dealer/claims/upload-url",
          {
            method: "POST",
            body: JSON.stringify({ filename: claimPhoto.name, contentType: claimPhoto.type, sizeBytes: claimPhoto.size }),
          },
        );
        const form = new FormData();
        Object.entries(upload.fields).forEach(([key, value]) => form.append(key, value));
        form.append("file", claimPhoto);
        const result = await fetch(upload.uploadUrl, { method: "POST", body: form });
        if (!result.ok) throw new Error("Warranty photo upload failed.");
        photos = [{ key: upload.key, filename: claimPhoto.name }];
      }
      await request("/api/portals/dealer/claims", {
        method: "POST",
        body: JSON.stringify({ model: claimModel, serialNumber: claimSerial, issue: claimIssue, photos }),
      });
      setClaimModel("");
      setClaimSerial("");
      setClaimIssue("");
      setClaimPhoto(null);
      setMessage("Warranty claim submitted.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to submit the warranty claim.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container max-w-6xl py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-[--color-brand-primary]">Dealer account</p>
          <h1 className="mt-2 text-4xl font-bold">Dealer portal</h1>
          <p className="mt-2 text-[--color-text-muted]">Orders, technical resources, training and account support.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/products" className="rounded-lg border border-[--color-border] px-5 py-3 font-semibold">Shop catalog</Link>
          <Link href="/quote/basket" className="rounded-lg bg-[--color-brand-primary] px-5 py-3 font-semibold text-white">Request a quote</Link>
        </div>
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}
      {message && <p role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">{message}</p>}
      {!profile ? <p aria-live="polite">Loading your dealer account…</p> : (
        <>
          <section className="mb-8 grid gap-4 md:grid-cols-3" aria-label="Company account">
            <div className="rounded-xl border border-[--color-border] p-5"><h2 className="font-semibold">{profile.company.name}</h2><p className="mt-2 text-sm">Pricing tier: {profile.company.pricingGroup || "Pending assignment"}</p></div>
            <div className="rounded-xl border border-[--color-border] p-5"><h2 className="font-semibold">Payment terms</h2><p className="mt-2 text-sm">{profile.company.paymentTerms} · Credit limit ${profile.company.creditLimit.toLocaleString()}</p></div>
            <div className="rounded-xl border border-[--color-border] p-5"><h2 className="font-semibold">Outstanding balance</h2><p className="mt-2 text-sm">${profile.company.outstandingBalance.toLocaleString()}</p></div>
          </section>
          <section className="mb-8 rounded-xl border border-[--color-border] p-5">
            <h2 className="mb-4 text-xl font-semibold">Order history</h2>
            {orders.length === 0 ? <p className="text-sm text-[--color-text-muted]">No company orders yet.</p> : (
              <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Order</th><th className="p-2">Date</th><th className="p-2">Status</th><th className="p-2">PO reference</th><th className="p-2">Total</th><th className="p-2">Action</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id} className="border-t border-[--color-border]"><td className="p-2">{order.orderNumber}</td><td className="p-2">{new Date(order.createdAt).toLocaleDateString()}</td><td className="p-2">{order.status} · {order.paymentStatus}</td><td className="p-2">{order.purchaseOrderNumber || "—"}</td><td className="p-2">${Number(order.total || 0).toLocaleString()}</td><td className="p-2"><button type="button" disabled={busy} onClick={() => void reorder(order)} className="font-semibold text-[--color-brand-primary] underline disabled:opacity-50">Reorder</button></td></tr>)}</tbody></table></div>
            )}
          </section>
          <section className="mb-8 rounded-xl border border-[--color-border] p-5">
            <h2 className="mb-4 text-xl font-semibold">Dealer resale quote builder</h2>
            <p className="mb-4 text-sm text-[--color-text-muted]">Set a markup on your dealer cost. Prices are recalculated by the server and saved to your company account.</p>
            <form onSubmit={createDealerQuote} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_9rem_auto]">
                <label className="text-sm">Catalog model<select value={quoteVariantId} onChange={(event) => setQuoteVariantId(event.target.value)} className="mt-1 w-full rounded border p-2"><option value="">Select a model</option>{catalog.map((item) => <option key={item.variantId} value={item.variantId}>{item.productName} · {item.variantName} · {item.sku} · ${item.unitCost.toLocaleString()}</option>)}</select></label>
                <label className="text-sm">Quantity<input type="number" min={1} max={1000} step={1} value={quoteQuantity} onChange={(event) => setQuoteQuantity(event.target.value)} className="mt-1 w-full rounded border p-2" /></label>
                <button type="button" onClick={addQuoteItem} className="self-end rounded border px-4 py-2 font-semibold">Add item</button>
              </div>
              <label className="block max-w-xs text-sm">Markup over dealer cost (%)<input type="number" min={0} max={1000} step="0.1" required value={markupPercent} onChange={(event) => setMarkupPercent(event.target.value)} className="mt-1 w-full rounded border p-2" /></label>
              {quoteItems.length > 0 && <ul className="divide-y divide-[--color-border]">{quoteItems.map((line) => {
                const item = catalog.find((candidate) => candidate.variantId === line.variantId);
                const markup = Number(markupPercent);
                const resalePrice = item && Number.isFinite(markup) ? Math.round(item.unitCost * (1 + markup / 100) * 100) / 100 : null;
                return <li key={line.variantId} className="flex flex-wrap justify-between gap-2 py-2 text-sm"><span>{item?.productName} · {item?.variantName} × {line.quantity}</span><span>{resalePrice == null ? "Enter a valid markup" : `$${(resalePrice * line.quantity).toLocaleString()} resale`}</span><button type="button" onClick={() => setQuoteItems((current) => current.filter((entry) => entry.variantId !== line.variantId))} className="text-red-700 underline">Remove</button></li>;
              })}</ul>}
              <button disabled={busy || !quoteItems.length} className="rounded-lg bg-[--color-brand-primary] px-4 py-2 font-semibold text-white disabled:opacity-60">{busy ? "Saving…" : "Save dealer quote"}</button>
            </form>
          </section>
          <section className="mb-8 rounded-xl border border-[--color-border] p-5">
            <h2 className="mb-4 text-xl font-semibold">Company quotes</h2>
            {quotes.length === 0 ? <p className="text-sm text-[--color-text-muted]">No company quotes yet.</p> : <ul className="space-y-2">{quotes.map((quote) => <li key={quote._id} className="flex justify-between gap-3 border-t border-[--color-border] py-2"><span>{quote.referenceNumber} · {quote.status}{quote.dealerQuote ? ` · ${quote.dealerQuote.markupPercent}% markup` : ""}</span><span>{quote.dealerQuote ? `$${quote.dealerQuote.total.toLocaleString()}` : quote.total != null ? `$${quote.total.toLocaleString()}` : "Awaiting price"}</span></li>)}</ul>}
          </section>
          <section className="mb-8 rounded-xl border border-[--color-border] p-5">
            <h2 className="mb-4 text-xl font-semibold">Marketing and technical library</h2>
            {resources.length === 0 ? <p className="text-sm text-[--color-text-muted]">No dealer resources are currently available.</p> : <ul className="grid gap-3 sm:grid-cols-2">{resources.map((resource) => <li key={resource._id} className="flex items-center justify-between gap-3 rounded-lg bg-[--color-surface-alt] p-3"><span>{title(resource.title)} <small className="block">{resource.type} · v{resource.currentVersion}</small></span><button type="button" onClick={() => void openResource(resource._id)} className="font-semibold text-[--color-brand-primary] underline">Download</button></li>)}</ul>}
          </section>
          <section className="mb-8 rounded-xl border border-[--color-border] p-5">
            <h2 className="mb-4 text-xl font-semibold">Product training</h2>
            {training.length === 0 ? <p className="text-sm text-[--color-text-muted]">No training items are currently available.</p> : <ul className="space-y-3">{training.map((item) => <li key={item._id} className="flex flex-wrap items-center justify-between gap-3 border-t border-[--color-border] py-3"><button type="button" onClick={() => void openResource(item._id)} className="text-left font-medium underline">{title(item.title)}</button><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(item.completedAt)} onChange={(event) => void updateTraining(item._id, event.target.checked)} />Completed</label></li>)}</ul>}
          </section>
          <section className="mb-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-[--color-border] p-5">
              <h2 className="mb-4 text-xl font-semibold">Submit a warranty claim</h2>
              <form onSubmit={submitClaim} className="space-y-3">
                <label className="block text-sm">Product model<input required minLength={2} value={claimModel} onChange={(event) => setClaimModel(event.target.value)} className="mt-1 w-full rounded border p-2" /></label>
                <label className="block text-sm">Serial number (optional)<input value={claimSerial} onChange={(event) => setClaimSerial(event.target.value)} className="mt-1 w-full rounded border p-2" /></label>
                <label className="block text-sm">Issue details<textarea required minLength={10} value={claimIssue} onChange={(event) => setClaimIssue(event.target.value)} className="mt-1 w-full rounded border p-2" rows={4} /></label>
                <label className="block text-sm">Photo (optional, max 10 MB)<input type="file" accept="image/jpeg,image/png,image/webp,image/heic" onChange={(event) => setClaimPhoto(event.target.files?.[0] || null)} className="mt-1 block w-full" /></label>
                <button disabled={busy} className="rounded-lg bg-[--color-brand-primary] px-4 py-2 font-semibold text-white disabled:opacity-60">{busy ? "Submitting…" : "Submit claim"}</button>
              </form>
            </div>
            <div className="rounded-xl border border-[--color-border] p-5">
              <h2 className="mb-4 text-xl font-semibold">Warranty claim tracking</h2>
              {claims.length === 0 ? <p className="text-sm text-[--color-text-muted]">No claims submitted.</p> : <ul className="space-y-3">{claims.map((claim) => <li key={claim._id} className="border-t border-[--color-border] pt-3"><strong>{claim.model}</strong> · {claim.status}<p className="text-sm text-[--color-text-muted]">{claim.issue}</p></li>)}</ul>}
            </div>
          </section>
          {profile.company.isCompanyAdmin && <section className="rounded-xl border border-[--color-border] p-5">
            <h2 className="mb-4 text-xl font-semibold">Team members</h2>
            <ul className="mb-4 space-y-2">{members.map((member) => <li key={member._id} className="text-sm">{member.firstName} {member.lastName} · {member.email}{member.isCompanyAdmin ? " (admin)" : ""}</li>)}</ul>
            <form onSubmit={invite} className="flex flex-wrap gap-2"><label className="sr-only" htmlFor="team-invite">Team member email</label><input id="team-invite" type="email" required value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="team member email" className="min-w-60 rounded border p-2" /><button disabled={busy} className="rounded-lg border px-4 py-2 font-semibold disabled:opacity-60">Invite member</button></form>
          </section>}
        </>
      )}
    </main>
  );
}
