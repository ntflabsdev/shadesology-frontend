"use client";

import { useEffect, useState } from "react";
import { trackConversion } from "@/lib/conversion";
import { getCart } from "@/lib/cart";
import { HoneypotField } from "@/components/forms/HoneypotField";
import { submitLead } from "@/lib/leads";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
type ChatStatus = { online: boolean; message: string; routing: string; provider: string };

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ChatStatus | null>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`${BASE}/api/content/chat/status`)
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok) throw new Error(json.message || "Chat status unavailable.");
        if (active) setStatus(json.data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Chat is unavailable.");
      });
    return () => { active = false; };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      let cartContext: { cartValue?: number; cartItems?: number } = {};
      try {
        const cart = await getCart();
        cartContext = {
          cartValue: cart.totals.orderSubtotal,
          cartItems: cart.items.reduce((count, item) => count + item.quantity, 0),
        };
      } catch (contextError) {
        console.warn("[ChatWidget] Could not load optional cart context:", contextError);
      }
      await submitLead("leads", {
          ...form, enquiryType: "chat", source: "chat_widget",
          context: {
            pageUrl: window.location.href,
            ...cartContext,
          },
        });
      setNotice("Thanks. Your message is saved and our team will follow up.");
      setForm({ name: "", email: "", message: "", website: "" });
      trackConversion("chat_message_submitted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your message.");
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && <section aria-label="Chat with Shadesology" className="mb-3 w-[min(22rem,calc(100vw-2rem))] rounded-xl border bg-white p-4 shadow-xl">
        <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">Chat with our team</h2><p className="mt-1 text-xs text-[--color-text-muted]">{status?.message ?? "Checking business hours…"}</p></div><button type="button" aria-label="Close chat" onClick={() => setOpen(false)} className="rounded border px-2 py-1">×</button></div>
        {notice ? <p role="status" className="mt-3 rounded bg-green-50 p-3 text-sm text-green-800">{notice}</p> : <form onSubmit={submit} className="mt-3 space-y-2">
          <label className="block text-sm">Name<input required maxLength={201} autoComplete="name" className="mt-1 w-full rounded border p-2" value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} /></label>
          <label className="block text-sm">Email<input required type="email" maxLength={254} autoComplete="email" className="mt-1 w-full rounded border p-2" value={form.email} onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))} /></label>
          <label className="block text-sm">How can we help?<textarea required minLength={10} maxLength={10000} rows={3} className="mt-1 w-full rounded border p-2" value={form.message} onChange={(event) => setForm((value) => ({ ...value, message: event.target.value }))} /></label>
          <HoneypotField value={form.website} onChange={(event) => setForm((value) => ({ ...value, website: event.target.value }))} />
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button disabled={busy} data-conversion-event="primary_cta_click" className="w-full rounded-lg bg-[--color-brand-primary] px-4 py-2 font-semibold text-white disabled:opacity-50">{busy ? "Sending…" : status?.online ? "Send message to support" : "Leave a message"}</button>
        </form>}
      </section>}
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="ml-auto block rounded-full bg-[--color-brand-primary] px-5 py-3 font-semibold text-white shadow-lg">
        {open ? "Close chat" : "Chat with us"}
      </button>
    </div>
  );
}
