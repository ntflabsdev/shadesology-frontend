"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";

const defaultImage =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80";

const surfaces = ["Siding", "Trim", "Roof", "Door", "Accent"] as const;

type Surface = (typeof surfaces)[number];

const palette = [
  { name: "Sandstone", value: "#D6C3A0" },
  { name: "Olive", value: "#6F7D5B" },
  { name: "Warm white", value: "#F4EFE7" },
  { name: "Charcoal", value: "#424A4D" },
  { name: "Terracotta", value: "#B96E46" },
  { name: "Forest", value: "#345C45" },
  { name: "Slate blue", value: "#6A7F9E" },
  { name: "Stone grey", value: "#B3B3B0" },
] as const;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function HouseColorVisualizer() {
  const [imageSrc, setImageSrc] = useState<string>(defaultImage);
  const [selectedSurface, setSelectedSurface] = useState<Surface>("Siding");
  const [selectedColor, setSelectedColor] = useState<string>(palette[0].value);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(105);
  const [split, setSplit] = useState<number>(57);
  const [history, setHistory] = useState<Array<{ surface: Surface; color: string; brightness: number; contrast: number }>>([
    { surface: "Siding", color: palette[0].value, brightness: 100, contrast: 105 },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const current = history[historyIndex] ?? history[history.length - 1];

  const overlayStyle = useMemo(
    () => ({
      backgroundColor: current.color,
      opacity: 0.72,
      mixBlendMode: "multiply" as const,
      filter: `brightness(${brightness}%) contrast(${contrast}%)`,
    }),
    [current.color, brightness, contrast],
  );

  const applyColor = () => {
    const next = { surface: selectedSurface, color: selectedColor, brightness, contrast };
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, next];
    });
    setHistoryIndex((prev) => prev + 1);
  };

  const undo = () => {
    setHistoryIndex((prev) => clamp(prev - 1, 0, history.length - 1));
  };

  const redo = () => {
    setHistoryIndex((prev) => clamp(prev + 1, 0, history.length - 1));
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const nextUrl = URL.createObjectURL(file);
    setImageSrc(nextUrl);
  };

  const saveDesign = () => {
    const payload = {
      selectedSurface,
      selectedColor,
      brightness,
      contrast,
      split,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("shadesology_house_visualizer", JSON.stringify(payload));
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[0.9fr_1.5fr]">
      <aside className="rounded-3xl border border-[--color-border] bg-[--color-neutral-50] p-5 shadow-[var(--shadow-sm)]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-[--color-text-primary]">Project controls</h2>
          <span className="rounded-full bg-[--color-brand-primary]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[--color-brand-primary]">
            Stage A
          </span>
        </div>

        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-[--color-text-primary]">Upload photo</p>
            <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[--color-border] bg-white px-4 py-5 text-sm font-medium text-[--color-brand-primary] hover:border-[--color-brand-primary]">
              Choose house photo
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-[--color-text-primary]">Surface</p>
            <div className="grid grid-cols-2 gap-2">
              {surfaces.map((surface) => (
                <button
                  key={surface}
                  type="button"
                  onClick={() => setSelectedSurface(surface)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                    selectedSurface === surface
                      ? "border-[--color-brand-primary] bg-[--color-brand-primary]/5 text-[--color-brand-primary]"
                      : "border-[--color-border] bg-white text-[--color-text-primary]"
                  }`}
                >
                  {surface}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-[--color-text-primary]">Color palette</p>
            <div className="grid grid-cols-4 gap-3">
              {palette.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  aria-label={color.name}
                  onClick={() => setSelectedColor(color.value)}
                  className={`h-12 rounded-xl border-2 transition-all ${
                    selectedColor === color.value ? "border-[--color-brand-primary]" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[--color-text-primary]">
              Brightness: {brightness}%
              <input
                type="range"
                min="60"
                max="140"
                value={brightness}
                onChange={(event) => setBrightness(Number(event.target.value))}
                className="mt-2 w-full accent-[--color-brand-primary]"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[--color-text-primary]">
              Contrast: {contrast}%
              <input
                type="range"
                min="80"
                max="160"
                value={contrast}
                onChange={(event) => setContrast(Number(event.target.value))}
                className="mt-2 w-full accent-[--color-brand-primary]"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[--color-text-primary]">
              Before/after split: {split}%
              <input
                type="range"
                min="10"
                max="90"
                value={split}
                onChange={(event) => setSplit(Number(event.target.value))}
                className="mt-2 w-full accent-[--color-brand-primary]"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="primary" size="md" onClick={applyColor}>Apply color</Button>
            <Button type="button" variant="ghost" size="md" onClick={undo}>Undo</Button>
            <Button type="button" variant="outline" size="md" onClick={redo}>Redo</Button>
          </div>

          <Button type="button" variant="secondary" size="lg" className="w-full" onClick={saveDesign}>
            Save design concept
          </Button>
        </div>
      </aside>

      <section className="rounded-3xl border border-[--color-border] bg-white p-4 shadow-[var(--shadow-md)] sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[--color-brand-primary]">House color visualizer</p>
            <h2 className="mt-2 text-3xl font-bold text-[--color-text-primary]">Preview exterior finish</h2>
          </div>
          <div className="rounded-full bg-[--color-neutral-100] px-3 py-1.5 text-xs font-semibold text-[--color-text-muted]">
            {selectedSurface} • {selectedColor}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-[--color-border] bg-[--color-neutral-100]">
          <div className="relative h-[520px] w-full">
            <img
              src={imageSrc}
              alt="House exterior preview"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div
              className="absolute inset-0"
              style={overlayStyle}
            />

            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${split}%` }}
            >
              <img
                src={imageSrc}
                alt="Original house preview"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ filter: "grayscale(0.1) brightness(1.05)" }}
              />
            </div>

            <div
              className="absolute inset-y-0"
              style={{ left: `calc(${split}% - 1px)`, width: "2px", backgroundColor: "rgba(255,255,255,0.9)" }}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl bg-[--color-neutral-50] p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Current finish</p>
            <p className="mt-2 text-xl font-bold text-[--color-text-primary]">{selectedSurface}</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="h-7 w-7 rounded-full border border-[--color-border]" style={{ backgroundColor: selectedColor }} />
              <span className="text-sm font-medium text-[--color-text-primary]">{selectedColor}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-[--color-neutral-50] p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Lighting</p>
            <p className="mt-2 text-xl font-bold text-[--color-text-primary]">{brightness}%</p>
            <p className="mt-1 text-sm text-[--color-text-muted]">Brightness adjustment</p>
          </div>

          <div className="rounded-2xl bg-[--color-neutral-50] p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Queue</p>
            <p className="mt-2 text-xl font-bold text-[--color-text-primary]">Ready</p>
            <p className="mt-1 text-sm text-[--color-text-muted]">Photo-safe preview</p>
          </div>
        </div>
      </section>
    </div>
  );
}
