import Link from "next/link";

interface Props {
  title: string;
  url: string;
  imageUrl?: string;
}

export function ProductShareBar({ title, url, imageUrl }: Props) {
  const pinterest = new URL("https://www.pinterest.com/pin/create/button/");
  pinterest.searchParams.set("url", url);
  pinterest.searchParams.set("description", title);
  if (imageUrl) pinterest.searchParams.set("media", imageUrl);

  return (
    <nav aria-label="Share this product" className="flex flex-wrap items-center gap-3 text-sm">
      <span className="font-medium">Share:</span>
      <Link
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md border border-[--color-border] px-3 py-2 hover:bg-[--color-neutral-50]"
      >
        Facebook
      </Link>
      <Link
        href={pinterest.toString()}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md border border-[--color-border] px-3 py-2 hover:bg-[--color-neutral-50]"
      >
        Pin it
      </Link>
    </nav>
  );
}
