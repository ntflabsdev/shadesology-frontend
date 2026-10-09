"use client";

import { startTransition, useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type DocumentRow = {
  _id: string;
  title: { en?: string } | string;
  description?: { en?: string } | string;
  type: string;
  currentVersion: string;
  expiryDate?: string | null;
  fileSizeBytes?: number;
};
type FolderRow = { _id: string; name: string; description: string; documents: DocumentRow[] };
type DownloadRow = { document: { title: { en?: string } | string; type: string } | null; createdAt: string };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || `Request failed (${response.status}).`);
  return result.data as T;
}

function label(value: { en?: string } | string | undefined) {
  return typeof value === "string" ? value : value?.en || "Untitled";
}

export default function SpecifierPortalPage() {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [folders, setFolders] = useState<FolderRow[]>([]);
  const [downloads, setDownloads] = useState<DownloadRow[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [folderName, setFolderName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const search = new URLSearchParams();
      if (query) search.set("q", query);
      if (type) search.set("type", type);
      const [nextDocuments, nextFolders, nextDownloads] = await Promise.all([
        api<DocumentRow[]>(`/api/portals/specifier/documents?${search.toString()}`),
        api<FolderRow[]>("/api/portals/specifier/folders"),
        api<DownloadRow[]>("/api/portals/specifier/downloads/mine"),
      ]);
      startTransition(() => {
        setError("");
        setDocuments(nextDocuments);
        setFolders(nextFolders);
        setDownloads(nextDownloads);
        setSelected((current) => current.filter((id) => nextDocuments.some((doc) => doc._id === id)));
      });
    } catch (cause) {
      startTransition(() => setError(cause instanceof Error ? cause.message : "Unable to load the specifier portal."));
    }
  }, [query, type]);

  useEffect(() => { void load(); }, [load]);

  async function download(ids: string[]) {
    try {
      setError("");
      if (ids.length === 1) {
        const data = await api<{ downloadUrl: string }>(`/api/portals/specifier/documents/${ids[0]}/download`);
        window.open(data.downloadUrl, "_blank", "noopener,noreferrer");
      } else {
        const links = await api<{ _id: string; downloadUrl: string }[]>("/api/portals/specifier/documents/bulk-links", {
          method: "POST",
          body: JSON.stringify({ documentIds: ids }),
        });
        links.forEach((link) => window.open(link.downloadUrl, "_blank", "noopener,noreferrer"));
      }
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to download the selected resource.");
    }
  }

  async function createFolder(event: FormEvent) {
    event.preventDefault();
    try {
      const folder = await api<FolderRow>("/api/portals/specifier/folders", {
        method: "POST",
        body: JSON.stringify({ name: folderName, documents: selected }),
      });
      setFolderName("");
      setNotice(`Project folder "${folder.name}" created.`);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create this folder.");
    }
  }

  async function submitSupport(event: FormEvent) {
    event.preventDefault();
    try {
      await api("/api/portals/specifier/support", {
        method: "POST",
        body: JSON.stringify({ subject, message }),
      });
      setSubject("");
      setMessage("");
      setNotice("Technical support request submitted.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to submit your support request.");
    }
  }

  return (
    <main className="container max-w-6xl py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-[--color-brand-primary]">Professional account</p>
          <h1 className="mt-2 text-4xl font-bold">Specifier resource library</h1>
          <p className="mt-2 text-[--color-text-muted]">CAD, BIM, product specifications, engineering data and project folders.</p>
        </div>
        <Link href="/specifier/apply" className="font-semibold text-[--color-brand-primary] underline">Application status / apply</Link>
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">{notice}</p>}
      <section className="mb-8 rounded-xl border border-[--color-border] p-5" aria-labelledby="library-heading">
        <h2 id="library-heading" className="mb-4 text-xl font-semibold">Technical resources</h2>
        <div className="mb-4 flex flex-wrap gap-3">
          <label className="sr-only" htmlFor="resource-search">Search resources</label>
          <input id="resource-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by product or document" className="min-w-64 rounded border p-2" />
          <label className="sr-only" htmlFor="resource-type">Document type</label>
          <select id="resource-type" value={type} onChange={(event) => setType(event.target.value)} className="rounded border p-2">
            <option value="">All types</option>
            <option value="cad">CAD</option><option value="bim">BIM</option><option value="spec_sheet">Specification</option>
            <option value="engineering_report">Engineering</option><option value="certificate">Certification</option><option value="other">Other</option>
          </select>
          <button type="button" disabled={!selected.length} onClick={() => void download(selected)} className="rounded border px-4 py-2 font-semibold disabled:opacity-50">Download selected ({selected.length})</button>
        </div>
        {documents.length === 0 ? <p className="text-sm text-[--color-text-muted]">No resources match your search.</p> : <ul className="divide-y divide-[--color-border]">{documents.map((doc) => <li key={doc._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <label className="flex items-center gap-3"><input type="checkbox" checked={selected.includes(doc._id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, doc._id] : current.filter((id) => id !== doc._id))} /><span><strong>{label(doc.title)}</strong><small className="block text-[--color-text-muted]">{doc.type} · version {doc.currentVersion}{doc.expiryDate ? ` · expires ${new Date(doc.expiryDate).toLocaleDateString()}` : ""}</small></span></label>
          <button type="button" onClick={() => void download([doc._id])} className="font-semibold text-[--color-brand-primary] underline">Open securely</button>
        </li>)}</ul>}
      </section>
      <section className="mb-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-[--color-border] p-5">
          <h2 className="mb-4 text-xl font-semibold">Project folders</h2>
          <form onSubmit={createFolder} className="mb-4 flex gap-2"><label className="sr-only" htmlFor="folder-name">New project folder name</label><input id="folder-name" required minLength={2} value={folderName} onChange={(event) => setFolderName(event.target.value)} placeholder="Project name" className="min-w-0 flex-1 rounded border p-2" /><button className="rounded border px-3 py-2 font-semibold">Create</button></form>
          {folders.length === 0 ? <p className="text-sm text-[--color-text-muted]">No project folders yet.</p> : <ul className="space-y-3">{folders.map((folder) => <li key={folder._id} className="rounded bg-[--color-surface-alt] p-3"><strong>{folder.name}</strong><p className="text-sm">{folder.documents.length} saved resources</p><button type="button" onClick={() => void download(folder.documents.map((doc) => doc._id).slice(0, 20))} disabled={!folder.documents.length} className="mt-2 text-sm font-semibold underline disabled:opacity-50">Download folder resources</button></li>)}</ul>}
        </div>
        <div className="rounded-xl border border-[--color-border] p-5">
          <h2 className="mb-4 text-xl font-semibold">Technical support</h2>
          <form onSubmit={submitSupport} className="space-y-3">
            <label className="block text-sm">Subject<input required minLength={3} value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-1 w-full rounded border p-2" /></label>
            <label className="block text-sm">Project / technical question<textarea required minLength={10} rows={4} value={message} onChange={(event) => setMessage(event.target.value)} className="mt-1 w-full rounded border p-2" /></label>
            <button className="rounded-lg bg-[--color-brand-primary] px-4 py-2 font-semibold text-white">Submit request</button>
          </form>
        </div>
      </section>
      <section className="rounded-xl border border-[--color-border] p-5">
        <h2 className="mb-4 text-xl font-semibold">Your recent downloads</h2>
        {downloads.length === 0 ? <p className="text-sm text-[--color-text-muted]">No downloads yet.</p> : <ul className="space-y-2">{downloads.map((item, index) => <li key={`${item.createdAt}-${index}`} className="border-t border-[--color-border] py-2 text-sm">{item.document ? label(item.document.title) : "Removed resource"} · {new Date(item.createdAt).toLocaleString()}</li>)}</ul>}
      </section>
    </main>
  );
}
