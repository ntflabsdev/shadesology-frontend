import Link from "next/link";

export function CommercialAudiencePage({
  eyebrow,
  title,
  description,
  needs,
  audience,
}: {
  eyebrow: string;
  title: string;
  description: string;
  needs: string[];
  audience: string;
}) {
  return (
    <>
      <header className="bg-[--color-brand-primary] py-16 text-white">
        <div className="container max-w-4xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[--color-brand-accent]">{eyebrow}</p>
          <h1 className="text-4xl font-bold sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/80">{description}</p>
          <Link href={`/commercial/request?audience=${encodeURIComponent(audience)}`} className="mt-7 inline-flex rounded-xl bg-[--color-brand-accent] px-6 py-3 font-bold text-[--color-neutral-900]">
            Discuss a project
          </Link>
        </div>
      </header>
      <section className="section">
        <div className="container max-w-5xl">
          <h2 className="text-3xl font-bold">Project support built around your work</h2>
          <ul className="mt-8 grid gap-5 md:grid-cols-3" role="list">
            {needs.map((need) => <li key={need} className="rounded-2xl border border-[--color-border] p-6"><h3 className="font-semibold">{need}</h3></li>)}
          </ul>
          <p className="mt-8 text-[--color-text-muted]">
            Our commercial team can help scope product options, coordinate technical information and connect project stakeholders with the right specialist.
          </p>
          <Link href="/commercial" className="mt-6 inline-block font-semibold text-[--color-brand-primary] underline">Explore commercial capabilities</Link>
        </div>
      </section>
    </>
  );
}
