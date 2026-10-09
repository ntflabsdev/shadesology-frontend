"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocaleSettings } from "@/components/i18n/LocaleProvider";
import { formatDate } from "@/i18n/format";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface ApplicationStatus {
  application: {
    _id: string;
    referenceNumber: string;
    status: string;
    resolution?: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  installer: { status: string; isActive: boolean; slug?: string } | null;
}

export default function InstallerApplicationStatusPage() {
  const { locale } = useLocaleSettings();
  const [data, setData] = useState<ApplicationStatus | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch(`${BASE}/api/installers/application/mine`, { credentials: "include", cache: "no-store" });
        const json = await response.json();
        if (!response.ok) throw new Error(json.message || "Sign in to view your application.");
        if (active) setData(json.data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Application status could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <main className="container max-w-2xl py-14">
      <h1 className="text-3xl font-bold">Installer application status</h1>
      <p className="mt-2 text-sm text-[--color-text-muted]">Your application and review status are private to your account.</p>
      {loading && <p role="status" className="mt-6">Loading status…</p>}
      {error && <div role="alert" className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">{error}<p className="mt-3"><Link href="/login" className="font-semibold underline">Sign in</Link></p></div>}
      {data && !data.application && <section className="mt-6 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">No installer application found</h2>
        <Link href="/installer-signup" className="mt-4 inline-flex rounded-lg bg-[--color-brand-primary] px-4 py-2 font-semibold text-white">Start an application</Link>
      </section>}
      {data?.application && <section className="mt-6 rounded-xl border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Reference {data.application.referenceNumber}</h2>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold capitalize">{data.application.status.replaceAll("_", " ")}</span>
        </div>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-[--color-text-muted]">Submitted</dt><dd>{formatDate(data.application.createdAt, locale, { dateStyle: "medium", timeStyle: "short" })}</dd></div>
          <div><dt className="text-[--color-text-muted]">Last updated</dt><dd>{formatDate(data.application.updatedAt, locale, { dateStyle: "medium", timeStyle: "short" })}</dd></div>
          {data.installer && <div><dt className="text-[--color-text-muted]">Network profile</dt><dd className="capitalize">{data.installer.status}</dd></div>}
        </dl>
        {data.application.resolution && <p className="mt-5 rounded-lg bg-gray-50 p-4 text-sm">{data.application.resolution}</p>}
        {data.installer?.status === "approved" && data.installer.isActive && <Link href="/installer/portal" className="mt-5 inline-flex rounded-lg bg-[--color-brand-primary] px-4 py-2 font-semibold text-white">Open installer portal</Link>}
      </section>}
    </main>
  );
}
