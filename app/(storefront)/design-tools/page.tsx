import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design Tools | Shadesology",
  description: "Interactive product configurators, visualizers and calculators for custom shade products.",
};

const tools = [
  {
    title: "Retractable awning configurator",
    description: "Size a patio awning, compare fabric options, and estimate project scope.",
    href: "/design-tools/retractable-awning",
    badge: "Active",
  },
  {
    title: "Solar heat gain calculator",
    description: "Estimate how much heat enters through glass and how shade can reduce it.",
    href: "/design-tools/solar-heat-gain",
    badge: "Active",
  },
  {
    title: "Sizing & projection calculator",
    description: "Model coverage, projection depth and sun-angle fit for a shade layout before purchase.",
    href: "/design-tools/sizing-and-projection",
    badge: "Active",
  },
  {
    title: "Budgeting tool",
    description: "Map a project budget against package upgrades, financing and realistic target spend.",
    href: "/design-tools/budgeting-tool",
    badge: "Active",
  },
  {
    title: "Commercial ROI calculator",
    description: "Estimate payback, energy savings and usable-day gains for a commercial shade project.",
    href: "/design-tools/commercial-roi",
    badge: "Active",
  },
  {
    title: "Wind load calculator",
    description: "Compare wind exposure and structural load assumptions for custom shade systems.",
    href: "/design-tools/wind-load",
    badge: "Active",
  },
  {
    title: "Fabric finder",
    description: "Compare material, appearance and application fit before specifying a system.",
    href: "/design-tools/fabric-finder",
    badge: "Active",
  },
  {
    title: "House color visualizer",
    description: "Preview outdoor color combinations against exterior finishes and materials.",
    href: "/design-tools/house-color-visualizer",
    badge: "Active",
  },
  {
    title: "Product photo visualizer",
    description: "Place a canopy, awning or screen over a real project photo to test fit and scale.",
    href: "/design-tools/product-photo-visualizer",
    badge: "Active",
  },
  {
    title: "3D viewer & AR",
    description: "Explore a 3D product model, check device compatibility and launch a real-scale AR preview path.",
    href: "/design-tools/3d-viewer",
    badge: "Active",
  },
  {
    title: "AI design suggestions",
    description: "Get catalog-safe product, finish and projection recommendations from a property photo.",
    href: "/design-tools/ai-design-suggestions",
    badge: "Active",
  },
];

export default function DesignToolsPage() {
  return (
    <>
      <header className="bg-[--color-brand-primary] text-white py-12">
        <div className="container max-w-5xl">
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-white/80">
            <ol className="flex items-center gap-2">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-white font-medium">Design tools</li>
            </ol>
          </nav>
          <h1 className="text-3xl font-bold md:text-5xl">Design tools for custom shade planning</h1>
          <p className="mt-4 max-w-2xl text-white/80">
            From project sizing and fabric selection to solar-impact estimates, these tools help specifiers and homeowners move from concept to quote.
          </p>
        </div>
      </header>

      <main className="container py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {tools.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="group rounded-3xl border border-[--color-border] bg-white p-6 shadow-[var(--shadow-sm)] transition-transform hover:-translate-y-0.5 hover:border-[--color-brand-primary]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-[--color-brand-primary]/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[--color-brand-primary]">
                  {tool.badge}
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-[--color-text-primary] group-hover:text-[--color-brand-primary]">
                {tool.title}
              </h2>
              <p className="mt-3 text-[--color-text-muted]">{tool.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[--color-brand-primary]">
                Open tool →
              </span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
