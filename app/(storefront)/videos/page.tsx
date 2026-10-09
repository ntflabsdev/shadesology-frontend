import Script from "next/script";
import type { Metadata } from "next";
import { VideoLibrary } from "@/components/videos/VideoLibrary";
import { getVideos, t } from "@/lib/api";
import { getRequestLocale } from "@/i18n/server";
import { getHostedVideoEmbedUrl } from "@/lib/video";

export const metadata: Metadata = {
  title: "Video Library | Shadesology",
  description: "Watch installation, product demo, walkthrough, testimonial and maintenance videos.",
};

export const revalidate = 300;

export default async function VideosPage() {
  const [videos, locale] = await Promise.all([getVideos(), getRequestLocale()]);
  const structuredVideos = videos.filter((video) => video.thumbnail?.url && getHostedVideoEmbedUrl(video.videoUrl)).map((video) => ({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: t(video.title, locale) || "Shadesology video",
    description: t(video.description, locale) || `${video.category} video from Shadesology`,
    thumbnailUrl: [video.thumbnail?.url],
    embedUrl: getHostedVideoEmbedUrl(video.videoUrl),
    uploadDate: video.createdAt,
    publisher: { "@type": "Organization", name: "Shadesology", url: "https://shadesology.com" },
  }));

  return (
    <>
      {structuredVideos.map((video, index) => <Script key={index} id={`video-jsonld-${index}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(video).replace(/</g, "\\u003c") }} />)}
      <header className="bg-[--color-brand-primary] py-14 text-white">
        <div className="container">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/75">See how it works</p>
          <h1 className="mt-2 text-4xl font-bold">Video library</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/85">Explore product demos, installation guidance, project walkthroughs, customer stories and maintenance tips.</p>
        </div>
      </header>
      <VideoLibrary videos={videos} locale={locale} />
    </>
  );
}
