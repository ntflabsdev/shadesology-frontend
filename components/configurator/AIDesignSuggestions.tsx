"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { aiDesignGuardrails, aiRecommendations } from "@/lib/aiDesignSuggestions";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function AIDesignSuggestions() {
  const [selectedPhoto, setSelectedPhoto] = useState<string>(
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  );

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedPhoto(URL.createObjectURL(file));
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[0.9fr_1.5fr]">
      <aside className="rounded-3xl border border-[--color-border] bg-[--color-neutral-50] p-5 shadow-[var(--shadow-sm)]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-[--color-text-primary]">Property input</h2>
          <span className="rounded-full bg-[--color-brand-primary]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[--color-brand-primary]">
            AI guardrails
          </span>
        </div>

        <div className="space-y-5">
          <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[--color-border] bg-white px-4 py-5 text-sm font-medium text-[--color-brand-primary] hover:border-[--color-brand-primary]">
            Upload property photo
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>

          <div className="rounded-2xl border border-[--color-border] bg-white p-4">
            <img src={selectedPhoto} alt="Property preview" className="h-56 w-full rounded-xl object-cover" />
          </div>

          <div className="rounded-2xl border border-[--color-border] bg-white p-4">
            <p className="text-sm font-semibold text-[--color-text-primary]">Guardrail checks</p>
            <ul className="mt-3 space-y-2 text-sm text-[--color-text-muted]">
              {aiDesignGuardrails.disallowedClaims.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <section className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[--color-brand-primary]">AI design suggestions</p>
          <h2 className="mt-2 text-3xl font-bold text-[--color-text-primary]">Catalog-safe recommendations</h2>
        </div>

        {aiRecommendations.map((recommendation) => (
          <article key={recommendation.productKey} className="overflow-hidden rounded-3xl border border-[--color-border] bg-white shadow-[var(--shadow-sm)]">
            <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
              <img src={recommendation.image} alt={recommendation.title} className="h-full min-h-[220px] w-full object-cover" />
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-2xl font-bold text-[--color-text-primary]">{recommendation.title}</h3>
                  <span className="rounded-full bg-[--color-brand-primary]/10 px-2 py-1 text-xs font-semibold text-[--color-brand-primary]">
                    {recommendation.confidence}% fit
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[--color-neutral-50] p-3">
                    <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Recommended finish</p>
                    <p className="mt-2 text-sm font-semibold text-[--color-text-primary]">{recommendation.recommendedFinish}</p>
                  </div>
                  <div className="rounded-2xl bg-[--color-neutral-50] p-3">
                    <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Projection</p>
                    <p className="mt-2 text-sm font-semibold text-[--color-text-primary]">{recommendation.recommendedProjection}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-semibold text-[--color-text-primary]">Why this fits</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recommendation.reasons.map((reason) => (
                      <span key={reason} className="rounded-full border border-[--color-border] px-2.5 py-1 text-xs font-medium text-[--color-text-muted]">
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-[--color-border] pt-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Starting estimate</p>
                    <p className="mt-1 text-2xl font-bold text-[--color-brand-primary]">{currency.format(recommendation.estimatedPrice)}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" size="md">Open config</Button>
                    <Button type="button" variant="primary" size="md">Use suggestion</Button>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-[--color-neutral-50] p-3">
                  <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Catalog guardrails</p>
                  <ul className="mt-2 space-y-1 text-sm text-[--color-text-muted]">
                    {recommendation.catalogGuardrails.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
