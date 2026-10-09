"use client";

export function PrintProjectButton() {
  return (
    <button type="button" onClick={() => window.print()} className="rounded-lg border border-[--color-border] px-4 py-2 text-sm font-semibold print:hidden">
      Print or save as PDF
    </button>
  );
}
