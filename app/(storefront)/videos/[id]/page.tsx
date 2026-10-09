import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VideoPlayer } from "@/components/media/VideoPlayer";
import { getVideo, t } from "@/lib/api";
import { getRequestLocale } from "@/i18n/server";
import { getHostedVideoEmbedUrl } from "@/lib/video";

interface Props {
  params: Promise<{ id: string }>;
}

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const video = await getVideo(id);
    return {
      title: t(video.title) || "Shadesology video",
      description: t(video.description) || `${video.category} video from Shadesology`,
      openGraph: { images: video.thumbnail?.url ? [{ url: video.thumbnail.url, alt: t(video.thumbnail.alt) }] : undefined },
    };
  } catch {
    return { title: "Video | Shadesology" };
  }
}

export default async function VideoDetailPage({ params }: Props) {
  const { id } = await params;
  const [video, locale] = await Promise.all([getVideo(id).catch(() => null), getRequestLocale()]);
  if (!video) notFound();
  const title = t(video.title, locale) || "Shadesology video";
  const description = t(video.description, locale) || `${video.category} video from Shadesology`;
  const embedUrl = getHostedVideoEmbedUrl(video.videoUrl);
  const structuredVideo = video.thumbnail?.url && embedUrl ? {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: title,
    description,
    thumbnailUrl: [video.thumbnail.url],
    embedUrl,
    uploadDate: video.createdAt,
    publisher: { "@type": "Organization", name: "Shadesology", url: "https://shadesology.com" },
  } : null;

  return (
    <>
      {structuredVideo && <Script id="video-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredVideo).replace(/</g, "\\u003c") }} />}
      <main className="container max-w-5xl py-10">
        <Link href="/videos" className="text-sm font-semibold text-[--color-brand-primary] underline">← Video library</Link>
        <p className="mt-6 text-xs font-bold uppercase tracking-widest text-[--color-brand-primary]">{video.category}</p>
        <h1 className="mt-2 text-3xl font-bold">{title}</h1>
        {t(video.description, locale) && <p className="mt-3 max-w-3xl text-[--color-text-muted]">{t(video.description, locale)}</p>}
        <div className="mt-7"><VideoPlayer video={video} title={title} /></div>
        {video.products.length > 0 && <section className="mt-8"><h2 className="text-xl font-bold">Related products</h2><ul className="mt-3 flex flex-wrap gap-3">{video.products.map((product) => <li key={product._id}><Link href={`/products/${product.slug}`} className="rounded-lg border border-[--color-border] px-4 py-2 font-semibold text-[--color-brand-primary] underline">{t(product.name, locale)}</Link></li>)}</ul></section>}
      </main>
    </>
  );
}
