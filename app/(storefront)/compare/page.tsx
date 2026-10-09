import { ComparePageClient } from "@/components/catalog/ProductComparison";

interface Props {
  searchParams: Promise<{ ids?: string }>;
}

export default async function ComparePage({ searchParams }: Props) {
  const { ids = "" } = await searchParams;
  const productSlugs = ids.split(",").filter(Boolean);

  return (
    <section className="container section">
      <h1 className="mb-6 text-3xl font-bold">Compare products</h1>
      <ComparePageClient ids={productSlugs} />
    </section>
  );
}
