export interface Testimonial {
  quote: string;
  customerName: string;
  location?: string;
  photoUrl?: string;
  photoAlt?: string;
  videoUrl?: string;
  certification?: string;
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-[--color-border] bg-white">
      {testimonial.videoUrl ? (
        <video controls preload="metadata" className="aspect-video w-full bg-black" aria-label={`Video testimonial from ${testimonial.customerName}`}>
          <source src={testimonial.videoUrl} />
          Your browser does not support embedded video.
        </video>
      ) : testimonial.photoUrl ? (
        <div
          role="img"
          aria-label={testimonial.photoAlt || `Photo shared by ${testimonial.customerName}`}
          className="aspect-video w-full bg-cover bg-center"
          style={{ backgroundImage: `url("${testimonial.photoUrl.replace(/["\\]/g, "")}")` }}
        />
      ) : null}
      <blockquote className="p-5">
        <p className="text-base leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
        <figcaption className="mt-4 text-sm font-semibold">
          {testimonial.customerName}
          {testimonial.location && <span className="font-normal text-[--color-text-muted]"> · {testimonial.location}</span>}
          {testimonial.certification && <span className="mt-1 block text-xs text-[--color-brand-primary]">{testimonial.certification}</span>}
        </figcaption>
      </blockquote>
    </figure>
  );
}
