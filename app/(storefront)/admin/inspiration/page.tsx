"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function slugify(value: string) {
  return value.toLocaleLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface UploadResult {
  name: string;
  status: "uploaded" | "failed";
  message: string;
}

export default function AdminInspirationPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [style, setStyle] = useState("");
  const [setting, setSetting] = useState("");
  const [color, setColor] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [error, setError] = useState("");

  async function uploadBatch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (files.length === 0) {
      setError("Choose at least one image.");
      return;
    }
    if (files.length > 50) {
      setError("Upload no more than 50 images at a time.");
      return;
    }

    setBusy(true);
    setError("");
    setResults([]);
    const nextResults: UploadResult[] = [];

    for (const [index, file] of files.entries()) {
      try {
        const mediaForm = new FormData();
        mediaForm.append("file", file);
        const mediaResponse = await fetch("/api/media", {
          method: "POST",
          credentials: "include",
          body: mediaForm,
        });
        const mediaResult = await mediaResponse.json();
        if (!mediaResponse.ok) throw new Error(mediaResult.errors?.[0]?.message || mediaResult.message || `Image upload failed (${mediaResponse.status}).`);
        const mediaDoc = mediaResult.doc || mediaResult.data?.doc || mediaResult;
        const imageUrl = mediaDoc.url;
        if (!imageUrl) throw new Error("The media service did not return an image URL.");

        const baseSlug = slugify(file.name) || `inspiration-${index + 1}`;
        const commonRecord = {
          title: { en: file.name.replace(/\.[^.]+$/, "") },
          slug: `${baseSlug}-${Date.now()}-${index + 1}`,
          style,
          setting,
          color,
          isActive: true,
          status: "published",
          image: { url: imageUrl, alt: { en: file.name.replace(/\.[^.]+$/, "") } },
          alt: { en: file.name.replace(/\.[^.]+$/, "") },
        };
        const legacyResponse = await fetch(`${API}/admin/inspiration-items`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(commonRecord),
        });
        if (legacyResponse.status === 410) {
          const cmsResponse = await fetch("/api/inspiration-items", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...commonRecord,
              image: mediaDoc.id || mediaDoc._id,
              _status: "published",
            }),
          });
          const cmsResult = await cmsResponse.json();
          if (!cmsResponse.ok) throw new Error(cmsResult.errors?.[0]?.message || cmsResult.message || `Could not save image record (${cmsResponse.status}).`);
        } else if (!legacyResponse.ok) {
          const legacyResult = await legacyResponse.json();
          throw new Error(legacyResult.message || `Could not save image record (${legacyResponse.status}).`);
        }

        nextResults.push({ name: file.name, status: "uploaded", message: "Uploaded, resized and tagged." });
      } catch (uploadError) {
        nextResults.push({
          name: file.name,
          status: "failed",
          message: uploadError instanceof Error ? uploadError.message : "Upload failed.",
        });
      }
      setResults([...nextResults]);
    }
    setFiles([]);
    setBusy(false);
  }

  return (
    <main className="container max-w-4xl py-10">
      <header>
        <h1 className="text-3xl font-bold">Bulk inspiration image upload</h1>
        <p className="mt-2 text-sm text-[--color-text-muted]">Select up to 50 images. They are uploaded to the existing media library, resized by its image pipeline, and saved as published inspiration records with shared tags.</p>
      </header>
      <form onSubmit={(event) => void uploadBatch(event)} className="mt-7 space-y-5 rounded-2xl border border-[--color-border] bg-white p-5">
        <label className="block">
          <span className="mb-2 block font-semibold">Images</span>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={busy} onChange={(event) => setFiles(Array.from(event.target.files || []))} className="block w-full rounded-lg border border-[--color-border] p-3" />
          <span className="mt-1 block text-xs text-[--color-text-muted]">JPEG, PNG, WebP or AVIF · maximum 50 images per batch</span>
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-medium">Style<input value={style} onChange={(event) => setStyle(event.target.value)} maxLength={80} className="mt-1 w-full rounded-lg border border-[--color-border] px-3 py-2" /></label>
          <label className="text-sm font-medium">Setting<input value={setting} onChange={(event) => setSetting(event.target.value)} maxLength={80} className="mt-1 w-full rounded-lg border border-[--color-border] px-3 py-2" /></label>
          <label className="text-sm font-medium">Color<input value={color} onChange={(event) => setColor(event.target.value)} maxLength={80} className="mt-1 w-full rounded-lg border border-[--color-border] px-3 py-2" /></label>
        </div>
        <p className="text-sm text-[--color-text-muted]">{files.length} image{files.length === 1 ? "" : "s"} selected</p>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <button type="submit" disabled={busy || files.length === 0} className="rounded-lg bg-[--color-brand-primary] px-5 py-2.5 font-semibold text-white disabled:opacity-50">{busy ? "Uploading batch…" : "Upload and tag images"}</button>
      </form>
      {results.length > 0 && <section className="mt-8" aria-labelledby="batch-results"><h2 id="batch-results" className="text-xl font-bold">Batch results</h2><ul className="mt-3 divide-y rounded-xl border border-[--color-border] bg-white" role="list">{results.map((result, index) => <li key={`${result.name}-${index}`} className="flex flex-wrap justify-between gap-2 p-3 text-sm"><span className="font-medium">{result.name}</span><span className={result.status === "uploaded" ? "text-green-800" : "text-red-700"}>{result.message}</span></li>)}</ul></section>}
    </main>
  );
}
