"use client";

import Link from "next/link";
import { Suspense, type FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface Installer {
  _id: string;
  businessName: string;
  slug?: string;
  address: { city: string; state: string; zip?: string };
  phone?: string;
  email?: string;
  lat?: number;
  lng?: number;
  distance?: number | null;
  coverageAreas?: { postcode: string; radiusMiles: number }[];
  specialities?: string[];
  certifications?: { name?: string; expiresAt?: string }[];
  isVerified?: boolean;
  description?: { en?: string } | string;
}

interface Referral {
  region: string;
  partnerName: string;
  partnerUrl: string;
}

export default function FindInstallerPage() {
  return <Suspense fallback={<main className="container py-12" aria-busy="true">Loading installer search…</main>}><InstallerSearch /></Suspense>;
}

function InstallerSearch() {
  const searchParams = useSearchParams();
  const [postcode, setPostcode] = useState(() => searchParams.get("postcode") || "");
  const [results, setResults] = useState<Installer[]>([]);
  const [referral, setReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const [sort, setSort] = useState<"ranking" | "distance">("ranking");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  async function searchInstallers(query: string, searchSort: "ranking" | "distance", location: { lat: number; lng: number } | null) {
    if (!query) return;
    setLoading(true);
    setSearched(true);
    setError("");
    const params = new URLSearchParams({ postcode: query, sort: searchSort });
    if (location) {
      params.set("lat", String(location.lat));
      params.set("lng", String(location.lng));
    }
    try {
      const response = await fetch(`${BASE}/api/installers/search?${params}`, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Installer search could not be completed.");
      setResults(Array.isArray(json.data) ? json.data : []);
      setReferral(json.referral || null);
    } catch (err) {
      setResults([]);
      setReferral(null);
      setError(err instanceof Error ? err.message : "Installer search could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(event: FormEvent, searchSort: "ranking" | "distance" = sort) {
    event.preventDefault();
    void searchInstallers(postcode.trim(), searchSort, coordinates);
  }

  async function useMyLocation() {
    setError("");
    if (!navigator.geolocation) {
      setError("Location search is not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCoordinates(location);
        setPostcode("Nearby installers");
        void searchInstallers("Nearby installers", sort, location);
      },
      () => setError("Your location could not be read. Enter a postcode or city instead."),
      { timeout: 10000, maximumAge: 60000 },
    );
  }

  async function openReferral() {
    if (!referral) return;
    try {
      const response = await fetch(`${BASE}/api/installers/referrals/${encodeURIComponent(referral.region)}/click`, { method: "POST" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Referral service is unavailable.");
      window.location.assign(json.data.partnerUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Referral service is unavailable.");
    }
  }

  const mapPoints = useMemo(() => {
    const points = results
      .filter((installer): installer is Installer & { lat: number; lng: number } =>
        Number.isFinite(installer.lat) && Number.isFinite(installer.lng))
      .map((installer) => ({ label: installer.businessName, lat: installer.lat, lng: installer.lng }));
    if (coordinates) points.push({ label: "Your location", ...coordinates });
    if (!points.length) return [];
    const latitudes = points.map((point) => point.lat);
    const longitudes = points.map((point) => point.lng);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    const latRange = maxLat - minLat || 0.01;
    const lngRange = maxLng - minLng || 0.01;
    return points.map((point) => ({
      ...point,
      x: 50 + ((point.lng - minLng) / lngRange) * 800,
      y: 30 + ((maxLat - point.lat) / latRange) * 330,
    }));
  }, [coordinates, results]);

  return (
    <>
      <header className="bg-[--color-brand-primary] py-14 text-white">
        <div className="container">
          <h1 className="mb-2 text-4xl font-bold">Find a Local Installer</h1>
          <p className="text-white/80">Search verified shade installation professionals by postcode or city.</p>
        </div>
      </header>

      <main className="container py-12">
        <section aria-labelledby="search-heading" className="mx-auto mb-10 max-w-2xl">
          <h2 id="search-heading" className="mb-5 text-center text-2xl font-bold">Enter Your Location</h2>
          <form onSubmit={handleSearch} role="search" aria-label="Find installer by postcode or city" className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="postcode-input" className="sr-only">Postcode or city</label>
            <input
              id="postcode-input"
              type="text"
              value={postcode}
              onChange={(event) => setPostcode(event.target.value)}
              placeholder="Postcode or city (e.g. 33101 or Miami)"
              autoComplete="postal-code"
              required
              className="min-w-0 flex-1 rounded-xl border border-[--color-border] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent]"
            />
            <button type="submit" disabled={loading} className="rounded-xl bg-[--color-brand-primary] px-6 py-3 font-bold text-white disabled:opacity-60">
              {loading ? "Searching…" : "Search"}
            </button>
            <button type="button" onClick={useMyLocation} className="rounded-xl border border-[--color-border] px-4 py-3 text-sm font-semibold">
              Use my location
            </button>
          </form>
          {coordinates && <p className="mt-2 text-xs text-[--color-text-muted]">Distance search uses your current location.</p>}
        </section>

        {error && <p role="alert" className="mx-auto mb-6 max-w-2xl rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {searched && !loading && (
          <section aria-live="polite" aria-label="Search results">
            {results.length > 0 ? (
              <>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-bold">{results.length} installer{results.length !== 1 ? "s" : ""} found</h2>
                  <div className="flex flex-wrap gap-2">
                    <label className="sr-only" htmlFor="installer-sort">Sort installers</label>
                    <select
                      id="installer-sort"
                      value={sort}
                      onChange={(event) => {
                        const nextSort = event.target.value as "ranking" | "distance";
                        if (nextSort === "distance" && !coordinates) {
                          setError("Use your location to sort installers by distance.");
                          setSort("ranking");
                          return;
                        }
                        setSort(nextSort);
                        setError("");
                        void searchInstallers(postcode.trim(), nextSort, coordinates);
                      }}
                      className="rounded-lg border border-[--color-border] bg-white px-3 py-2 text-sm"
                    >
                      <option value="ranking">Recommended</option>
                      <option value="distance">Closest</option>
                    </select>
                    <div className="flex rounded-lg border border-[--color-border]" aria-label="Result view">
                      <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")} className={`px-3 py-2 text-sm ${view === "list" ? "bg-gray-100 font-semibold" : ""}`}>List</button>
                      <button type="button" aria-pressed={view === "map"} onClick={() => setView("map")} className={`px-3 py-2 text-sm ${view === "map" ? "bg-gray-100 font-semibold" : ""}`}>Map</button>
                    </div>
                  </div>
                </div>
                {view === "map" && (
                  <div className="mb-6 overflow-hidden rounded-xl border border-[--color-border] bg-slate-50 p-3">
                    {mapPoints.length ? (
                      <svg viewBox="0 0 900 400" role="img" aria-label={`Relative installer locations near ${postcode}`} className="h-80 w-full">
                        <rect x="0" y="0" width="900" height="400" rx="12" fill="#f8fafc" />
                        {[1, 2, 3, 4].map((step) => <g key={step} aria-hidden="true">
                          <line x1={step * 180} y1="0" x2={step * 180} y2="400" stroke="#dbe3ec" strokeDasharray="5 7" />
                          <line x1="0" y1={step * 80} x2="900" y2={step * 80} stroke="#dbe3ec" strokeDasharray="5 7" />
                        </g>)}
                        {mapPoints.map((point, index) => <g key={`${point.label}-${index}`}>
                          <circle cx={point.x} cy={point.y} r={point.label === "Your location" ? 10 : 8} fill={point.label === "Your location" ? "#2563eb" : "#166534"} stroke="white" strokeWidth="3" />
                          <text x={Math.min(point.x + 12, 720)} y={Math.max(point.y - 10, 18)} fontSize="13" fill="#0f172a">{point.label.slice(0, 24)}</text>
                        </g>)}
                      </svg>
                    ) : (
                      <p className="flex h-80 items-center justify-center text-sm text-[--color-text-muted]">Installer coordinates are not available for this result set yet.</p>
                    )}
                    <p className="bg-gray-50 px-2 py-2 text-xs text-[--color-text-muted]">Relative profile coordinates only. This map is rendered locally; no location data is sent to a third-party map provider.</p>
                  </div>
                )}
                <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" role="list">
                  {results.map((installer) => (
                    <li key={installer._id} className="rounded-2xl border border-[--color-border] p-5 transition-shadow hover:shadow-md">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-[--color-text-primary]">
                            {installer.slug ? <Link href={`/find-installer/${installer.slug}`} className="hover:underline">{installer.businessName}</Link> : installer.businessName}
                          </h3>
                          <p className="text-sm text-[--color-text-muted]">
                            {installer.address?.city}, {installer.address?.state}
                            {installer.distance !== undefined && installer.distance !== null && ` · ${installer.distance} mi`}
                          </p>
                        </div>
                        {installer.isVerified && <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">Verified</span>}
                      </div>
                      {installer.specialities?.length ? <ul className="mb-3 flex flex-wrap gap-1">{installer.specialities.map((speciality) => <li key={speciality} className="rounded-full bg-[--color-neutral-100] px-2 py-0.5 text-xs">{speciality}</li>)}</ul> : null}
                      <div className="flex flex-col gap-1.5">
                        {installer.phone && <a href={`tel:${installer.phone}`} className="text-sm text-[--color-brand-primary] hover:underline">{installer.phone}</a>}
                        {installer.email && <a href={`mailto:${installer.email}`} className="break-all text-sm text-[--color-brand-primary] hover:underline">{installer.email}</a>}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="mx-auto max-w-xl rounded-2xl border border-[--color-border] p-8 text-center">
                <h2 className="mb-2 text-xl font-bold">No installers found in this area yet</h2>
                <p className="mb-5 text-sm text-[--color-text-muted]">Our team can still help with your project and will follow up with local options.</p>
                {referral && <button type="button" onClick={openReferral} className="mb-4 block w-full rounded-xl bg-[--color-brand-primary] px-5 py-3 font-semibold text-white">Continue to {referral.partnerName}</button>}
                <div className="flex justify-center gap-3">
                  <Link href="/quote" className="rounded-xl bg-[--color-brand-primary] px-5 py-2.5 font-semibold text-white">Request a Quote</Link>
                  <Link href="/contact" className="rounded-xl border-2 border-[--color-brand-primary] px-5 py-2.5 font-semibold text-[--color-brand-primary]">Contact Us</Link>
                </div>
              </div>
            )}
          </section>
        )}

        {!searched && <section className="mt-10 border-t border-[--color-border] pt-10 text-center">
          <h2 className="mb-2 text-xl font-bold">Are you an installer?</h2>
          <p className="mb-4 text-[--color-text-muted]">Join the certified network and receive qualified leads in your area.</p>
          <Link href="/installer-signup" className="inline-flex rounded-xl border-2 border-[--color-brand-primary] px-6 py-2.5 font-semibold text-[--color-brand-primary] hover:bg-[--color-brand-primary] hover:text-white">Apply to Join Network</Link>
        </section>}
      </main>
    </>
  );
}
