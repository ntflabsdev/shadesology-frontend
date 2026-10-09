"use client";

import { useCallback, useEffect, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface VideoRecord {
  _id: string;
  videoUrl: string;
  category: string;
  isActive: boolean;
  status: "draft" | "published";
}

export default function AdminVideosPage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${BASE}/admin/videos?limit=100`, { credentials: "include", cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Videos could not be loaded.");
      setVideos(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Videos could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load the protected admin list after the page mounts.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  async function addVideo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${BASE}/admin/videos`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl, status: "published", isActive: true }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Video URL could not be saved.");
      setVideoUrl("");
      setNotice("Video URL saved and published.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video URL could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function removeVideo(id: string) {
    if (!window.confirm("Delete this video link?")) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${BASE}/admin/videos/${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Video could not be deleted.");
      setNotice("Video link deleted.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video could not be deleted.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container max-w-5xl py-10">
      <header>
        <h1 className="text-3xl font-bold">Video library</h1>
        <p className="mt-2 text-sm text-[--color-text-muted]">Paste a hosted YouTube, Vimeo, or Wistia URL. The URL is saved to the database; the video itself is not uploaded or duplicated.</p>
      </header>
      <form onSubmit={addVideo} className="mt-7 rounded-2xl border border-[--color-border] bg-white p-5">
        <label htmlFor="hosted-video-url" className="mb-2 block font-semibold">Hosted video URL</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input id="hosted-video-url" type="url" required value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://youtu.be/…" className="min-w-0 flex-1 rounded-lg border border-[--color-border] px-3 py-2" />
          <button type="submit" disabled={busy} className="rounded-lg bg-[--color-brand-primary] px-5 py-2 font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Save video URL"}</button>
        </div>
        <p className="mt-2 text-xs text-[--color-text-muted]">Secure HTTPS URLs from supported video hosts only.</p>
      </form>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
      <section className="mt-8" aria-labelledby="saved-video-links">
        <h2 id="saved-video-links" className="text-xl font-bold">Saved video links</h2>
        {loading ? <p className="py-5">Loading videos…</p> : videos.length === 0 ? <p className="mt-3 rounded-xl border p-5 text-sm text-[--color-text-muted]">No video URLs have been saved yet.</p> : (
          <ul className="mt-3 divide-y rounded-xl border border-[--color-border] bg-white" role="list">
            {videos.map((video) => <li key={video._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-[--color-brand-primary] underline">{video.videoUrl}</a>
                <p className="mt-1 text-xs text-[--color-text-muted]">{video.category} · {video.status}{video.isActive ? "" : " · inactive"}</p>
              </div>
              <button type="button" disabled={busy} onClick={() => void removeVideo(video._id)} className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">Delete</button>
            </li>)}
          </ul>
        )}
      </section>
    </main>
  );
}
