"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";

interface GalleryImage {
  url: string;
  alt: string;
  type: string;
}

interface Props {
  images: GalleryImage[];
  videoUrl?: string;
  productName: string;
}

const PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiIGZvbnQtc2l6ZT0iMjAiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

export function MediaGallery({ images, videoUrl, productName }: Props) {
  const allMedia = [
    ...images.map((img) => ({ ...img, mediaType: "image" as const })),
    ...(videoUrl ? [{ url: videoUrl, alt: `${productName} video`, type: "video", mediaType: "video" as const }] : []),
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const active = allMedia[activeIdx];

  if (allMedia.length === 0) {
    return (
      <div className="aspect-product bg-[--color-neutral-100] rounded-2xl flex items-center justify-center">
        <span className="text-[--color-neutral-400]">No image available</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main media */}
      <div
        className="relative aspect-product bg-[--color-neutral-50] rounded-2xl overflow-hidden border border-[--color-border] cursor-zoom-in"
        onClick={active.mediaType === "image" ? () => setZoomed(true) : undefined}
        role={active.mediaType === "image" ? "button" : undefined}
        aria-label={active.mediaType === "image" ? `View ${active.alt} (click to zoom)` : undefined}
        tabIndex={active.mediaType === "image" ? 0 : undefined}
        onKeyDown={active.mediaType === "image" ? (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setZoomed(true);
          }
        } : undefined}
      >
        {active.mediaType === "video" ? (
          <video
            src={active.url}
            controls
            className="w-full h-full object-contain"
            aria-label={active.alt}
          />
        ) : (
          <Image
            src={active.url || PLACEHOLDER}
            alt={active.alt || productName}
            data-pin-media={active.url || undefined}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={activeIdx === 0}
            unoptimized={!active.url || active.url.startsWith("data:")}
          />
        )}
        {active.mediaType === "image" && (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full" aria-hidden="true">
            Zoom
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {allMedia.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Product media">
          {allMedia.map((media, i) => (
            <button
              key={i}
              aria-pressed={i === activeIdx}
              aria-label={`Show ${media.mediaType === "video" ? "video" : "image"} ${i + 1}: ${media.alt}`}
              onClick={() => setActiveIdx(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === activeIdx
                  ? "border-[--color-brand-primary]"
                  : "border-[--color-border] hover:border-[--color-brand-primary]/50"
              }`}
            >
              {media.mediaType === "video" ? (
                <div className="w-full h-full bg-[--color-neutral-200] flex items-center justify-center text-lg" aria-hidden="true">
                  ▶
                </div>
              ) : (
                <Image
                  src={media.url || PLACEHOLDER}
                  alt={media.alt || ""}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                  unoptimized={!media.url || media.url.startsWith("data:")}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Zoom lightbox */}
      <Modal
        isOpen={zoomed && active.mediaType === "image"}
        onClose={() => setZoomed(false)}
        title={`Zoomed image: ${productName}`}
        size="full"
      >
        <div className="relative min-h-[60vh] w-full">
          {active.mediaType === "image" && (
            <Image
              src={active.url}
              alt={active.alt || productName}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
