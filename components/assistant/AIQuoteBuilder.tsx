"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { generateDraftQuote } from "@/lib/aiQuoteBuilder";

const sampleProject = `12 ft patio awning for a south-facing deck, with a sandstone fabric and motorized control. We need a wall mount and a 10 ft projection with standard installation. Please quote for a home project.`;

export function AIQuoteBuilder() {
  const [projectDescription, setProjectDescription] = useState(sampleProject);
  const [budget, setBudget] = useState(6500);
  const [drawingIncluded, setDrawingIncluded] = useState(true);

  const draft = useMemo(
    () => generateDraftQuote({ description: projectDescription, budget, drawingIncluded }),
    [projectDescription, budget, drawingIncluded],
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-3xl border border-[--color-border] bg-white p-6 shadow-[var(--shadow-md)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[--color-brand-primary]">AI quote builder</p>
            <h2 className="mt-2 text-3xl font-bold text-[--color-text-primary]">Draft a quote from project notes</h2>
          </div>
          <span className="rounded-full bg-[--color-brand-primary]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[--color-brand-primary]">
            Human review required
          </span>
        </div>

        <div className="mt-6 space-y-5">
          <label className="block text-sm font-medium text-[--color-text-primary]">
            Project description
            <textarea
              value={projectDescription}
              onChange={(event) => setProjectDescription(event.target.value)}
              rows={8}
              className="mt-2 w-full rounded-2xl border border-[--color-border] px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[--color-text-primary]">
              Target budget ($)
              <input
                type="number"
                value={budget}
                onChange={(event) => setBudget(Number(event.target.value || 0))}
                className="mt-2 w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>

            <div className="flex items-end">
              <label className="flex w-full items-center justify-between rounded-xl border border-[--color-border] bg-[--color-neutral-50] px-3 py-3 text-sm font-medium text-[--color-text-primary]">
                Drawings attached
                <input
                  type="checkbox"
                  checked={drawingIncluded}
                  onChange={(event) => setDrawingIncluded(event.target.checked)}
                  className="h-4 w-4 accent-[--color-brand-primary]"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-[--color-border] bg-[--color-neutral-50] p-4">
            <p className="text-sm font-semibold text-[--color-text-primary]">AI extraction</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white p-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[--color-text-muted]">Product type</p>
                <p className="mt-1 text-sm font-semibold text-[--color-text-primary]">{draft.productType}</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[--color-text-muted]">Confidence</p>
                <p className="mt-1 text-sm font-semibold text-[--color-brand-primary]">{draft.confidence}%</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[--color-text-muted]">Width</p>
                <p className="mt-1 text-sm font-semibold text-[--color-text-primary]">{draft.dims.width}</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[--color-text-muted]">Mounting</p>
                <p className="mt-1 text-sm font-semibold text-[--color-text-primary]">{draft.dims.mounting}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-[--color-border] bg-[--color-neutral-50] p-6 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-[--color-text-primary]">Draft quote</h3>
            <span className="rounded-full bg-[--color-brand-primary]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[--color-brand-primary]">
              Queue: {draft.queue}
            </span>
          </div>

          <div className="mt-5 rounded-2xl bg-white p-4 shadow-[var(--shadow-sm)]">
            <p className="text-sm text-[--color-text-muted]">Estimated total</p>
            <p className="mt-2 text-3xl font-bold text-[--color-brand-primary]">${draft.totalEstimate.toLocaleString()}</p>
            <p className="mt-2 text-sm text-[--color-text-muted]">{draft.summary}</p>
          </div>

          <div className="mt-5 space-y-3">
            {draft.quoteLines.map((line) => (
              <div key={line.label} className="flex items-center justify-between gap-3 rounded-xl border border-[--color-border] bg-white p-3 text-sm">
                <div>
                  <p className="font-medium text-[--color-text-primary]">{line.label}</p>
                  <p className="text-[--color-text-muted]">Qty {line.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[--color-text-primary]">${line.total.toLocaleString()}</p>
                  <p className="text-[--color-text-muted]">@ ${line.unitPrice.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[--color-border] bg-white p-6 shadow-[var(--shadow-sm)]">
          <h3 className="text-xl font-bold text-[--color-text-primary]">Review checkpoints</h3>

          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-semibold text-[--color-text-primary]">Flags</p>
              <ul className="mt-2 space-y-2 text-sm text-[--color-text-muted]">
                {draft.flags.map((flag) => (
                  <li key={flag} className="flex gap-2">
                    <span aria-hidden="true">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-[--color-text-primary]">Clarifications</p>
              <ul className="mt-2 space-y-2 text-sm text-[--color-text-muted]">
                {draft.clarifications.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <Button type="button" variant="outline" className="w-full" size="lg">
              Send to staff review
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
