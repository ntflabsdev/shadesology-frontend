"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const STORAGE_KEY = "shadesology-consent-v1";
const CONSENT_ID_KEY = "shadesology-consent-id";

interface Preferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
}

function parsePreferences(raw: string | null): Preferences | null {
  try {
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<Preferences>;
    if (typeof value.analytics !== "boolean" || typeof value.marketing !== "boolean") return null;
    return { necessary: true, analytics: value.analytics, marketing: value.marketing };
  } catch {
    return null;
  }
}

function readStoredConsent() {
  return localStorage.getItem(STORAGE_KEY);
}

function subscribeConsent(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("shadesology:consent-updated", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("shadesology:consent-updated", onChange);
  };
}

export function CookieConsent() {
  const storedConsent = useSyncExternalStore(subscribeConsent, readStoredConsent, () => null);
  const savedPreferences = useMemo(() => parsePreferences(storedConsent), [storedConsent]);
  const [reopened, setReopened] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const visible = reopened || !savedPreferences;

  useEffect(() => {
    const openSettings = () => {
      setAnalytics(savedPreferences?.analytics ?? false);
      setMarketing(savedPreferences?.marketing ?? false);
      setCustomizing(true);
      setReopened(true);
      setError("");
    };
    window.addEventListener("privacy:open-settings", openSettings);
    return () => window.removeEventListener("privacy:open-settings", openSettings);
  }, [savedPreferences]);

  async function savePreferences(preferences: Preferences) {
    setSaving(true);
    setError("");
    try {
      const consentId = localStorage.getItem(CONSENT_ID_KEY) ?? crypto.randomUUID();
      const response = await fetch(`${API_BASE}/api/privacy/consent`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consentId,
          analytics: preferences.analytics,
          marketing: preferences.marketing,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Your privacy choices could not be saved.");

      localStorage.setItem(CONSENT_ID_KEY, consentId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      window.dispatchEvent(new Event("shadesology:consent-updated"));
      setAnalytics(preferences.analytics);
      setMarketing(preferences.marketing);
      setReopened(false);
      setCustomizing(false);
      window.dispatchEvent(new CustomEvent("shadesology:consent-updated", { detail: preferences }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your privacy choices could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (!visible) return null;

  return (
    <aside
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl rounded-xl border border-[--color-border] bg-white p-5 shadow-[--shadow-xl] sm:inset-x-6"
      aria-label="Cookie and privacy preferences"
    >
      <h2 className="text-lg font-semibold">Your privacy choices</h2>
      <p className="mt-2 text-sm text-[--color-text-muted]">
        Necessary browser storage keeps the site working. Analytics and marketing remain off unless you choose to allow them.
        Read our <Link className="font-medium underline" href="/privacy">privacy information</Link>.
      </p>

      {customizing && (
        <fieldset className="mt-4 space-y-3 border-t border-[--color-border] pt-4">
          <legend className="font-medium">Optional cookie categories</legend>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked disabled aria-label="Necessary cookies always active" />
            <span><strong>Necessary</strong> — security, cart and core site storage (always active).</span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
            <span><strong>Analytics</strong> — help us understand site use and improve the experience.</span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} />
            <span><strong>Marketing</strong> — allow advertising and campaign measurement technologies.</span>
          </label>
        </fieldset>
      )}

      {error && <p role="alert" className="mt-3 text-sm text-[--color-error]">{error}</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        {!customizing ? (
          <>
            <button type="button" disabled={saving} onClick={() => void savePreferences({ necessary: true, analytics: false, marketing: false })} className="rounded-md border border-[--color-border] px-4 py-2 text-sm font-semibold disabled:opacity-60">
              Reject optional
            </button>
            <button type="button" onClick={() => setCustomizing(true)} className="rounded-md border border-[--color-border] px-4 py-2 text-sm font-semibold">
              Customize
            </button>
            <button type="button" disabled={saving} onClick={() => void savePreferences({ necessary: true, analytics: true, marketing: true })} className="rounded-md bg-[--color-brand-primary] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              Accept all
            </button>
          </>
        ) : (
          <>
            <button type="button" disabled={saving} onClick={() => void savePreferences({ necessary: true, analytics: false, marketing: false })} className="rounded-md border border-[--color-border] px-4 py-2 text-sm font-semibold disabled:opacity-60">
              Reject optional
            </button>
            <button type="button" disabled={saving} onClick={() => void savePreferences({ necessary: true, analytics, marketing })} className="rounded-md bg-[--color-brand-primary] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? "Saving…" : "Save choices"}
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
