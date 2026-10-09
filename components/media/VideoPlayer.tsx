"use client";

import { useState } from "react";
import type { T } from "@/lib/api";
import { getHostedVideoEmbedUrl } from "@/lib/video";

export interface HostedVideo {
  _id: string;
  videoUrl: string;
  title: T;
  description?: T;
  category?: string;
  thumbnail?: { url: string; alt?: T } | null;
  chapters?: { title: string; seconds: number }[];
  transcript?: T;
  captionsUrl?: string;
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

export function VideoPlayer({ video, title }: { video: HostedVideo; title: string }) {
  const [startAt, setStartAt] = useState(0);
  const src = getHostedVideoEmbedUrl(video.videoUrl, startAt);
  const transcript = typeof video.transcript === "string" ? video.transcript : video.transcript?.en;

  if (!src) {
    return (
      <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        This video URL is not supported. Open the video on its hosting platform:{" "}
        <a className="font-semibold underline" href={video.videoUrl} target="_blank" rel="noopener noreferrer">watch video</a>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-video overflow-hidden rounded-2xl bg-black">
        <iframe
          key={`${video._id}-${startAt}`}
          src={src}
          title={title}
          className="h-full w-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      {video.chapters && video.chapters.length > 0 && (
        <nav aria-label="Video chapters">
          <h3 className="mb-2 text-sm font-semibold">Chapters</h3>
          <ul className="flex flex-wrap gap-2">
            {video.chapters.map((chapter, index) => (
              <li key={`${chapter.seconds}-${index}`}>
                <button
                  type="button"
                  onClick={() => setStartAt(chapter.seconds)}
                  className="rounded-full border border-[--color-border] px-3 py-1.5 text-sm hover:border-[--color-brand-primary] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span className="font-mono text-xs">{formatTime(chapter.seconds)}</span>{" "}
                  {chapter.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {transcript && (
        <details className="rounded-xl border border-[--color-border] p-4">
          <summary className="cursor-pointer font-semibold">Read video transcript</summary>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[--color-text-muted]">{transcript}</p>
        </details>
      )}
      {video.captionsUrl && (
        <a href={video.captionsUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[--color-brand-primary] underline">
          Download captions
        </a>
      )}
    </div>
  );
}
