"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";

const defaultImage =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80";

const productPresets = [
  { id: "pergola", name: "Fabric pergola", color: "#D9C7A4", accent: "#1B4332" },
  { id: "awning", name: "Retractable awning", color: "#7C897E", accent: "#D4A853" },
  { id: "screen", name: "Privacy screen", color: "#9BA5A2", accent: "#425063" },
  { id: "tensile", name: "Tensile canopy", color: "#EEE4D2", accent: "#B96E46" },
] as const;

export function ProductPhotoVisualizer() {
  const [imageSrc, setImageSrc] = useState<string>(defaultImage);
  const [selectedPreset, setSelectedPreset] = useState<(typeof productPresets)[number]["id"]>("pergola");
  const [scale, setScale] = useState<number>(90);
  const [rotation, setRotation] = useState<number>(0);
  const [xOffset, setXOffset] = useState<number>(8);
  const [yOffset, setYOffset] = useState<number>(16);
  const [shadow, setShadow] = useState<number>(24);
  const [opacity, setOpacity] = useState<number>(88);
  const [showGuidance, setShowGuidance] = useState<boolean>(true);

  const preset = productPresets.find((item) => item.id === selectedPreset) ?? productPresets[0];

  const productStyle = useMemo(
    () => ({
      transform: `translate(${xOffset}px, ${yOffset}px) rotate(${rotation}deg) scale(${scale / 100})`,
      opacity: opacity / 100,
      filter: `drop-shadow(0 ${shadow}px 14px rgba(0,0,0,0.18))`,
    }),
    [xOffset, yOffset, rotation, scale, opacity, shadow],
  );

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const next = URL.createObjectURL(file);
    setImageSrc(next);
    setShowGuidance(false);
  };

  const resetLayout = () => {
    setScale(90);
    setRotation(0);
    setXOffset(8);
    setYOffset(16);
    setShadow(24);
    setOpacity(88);
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[0.9fr_1.5fr]">
      <aside className="rounded-3xl border border-[--color-border] bg-[--color-neutral-50] p-5 shadow-[var(--shadow-sm)]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-[--color-text-primary]">Photo overlay controls</h2>
          <span className="rounded-full bg-[--color-brand-primary]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[--color-brand-primary]">
            Stage B
          </span>
        </div>

        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-[--color-text-primary]">Upload project photo</p>
            <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[--color-border] bg-white px-4 py-5 text-sm font-medium text-[--color-brand-primary] hover:border-[--color-brand-primary]">
              Choose photo
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-[--color-text-primary]">Overlay product</p>
            <div className="grid grid-cols-2 gap-2">
              {productPresets.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setSelectedPreset(product.id)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm font-medium ${
                    selectedPreset === product.id
                      ? "border-[--color-brand-primary] bg-[--color-brand-primary]/5 text-[--color-brand-primary]"
                      : "border-[--color-border] bg-white text-[--color-text-primary]"
                  }`}
                >
                  {product.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[--color-text-primary]">
              Scale: {scale}%
              <input type="range" min="40" max="140" value={scale} onChange={(event) => setScale(Number(event.target.value))} className="mt-2 w-full accent-[--color-brand-primary]" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[--color-text-primary]">
              Rotation: {rotation}°
              <input type="range" min="-20" max="20" value={rotation} onChange={(event) => setRotation(Number(event.target.value))} className="mt-2 w-full accent-[--color-brand-primary]" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[--color-text-primary]">
              Horizontal offset: {xOffset}px
              <input type="range" min="-80" max="80" value={xOffset} onChange={(event) => setXOffset(Number(event.target.value))} className="mt-2 w-full accent-[--color-brand-primary]" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[--color-text-primary]">
              Vertical offset: {yOffset}px
              <input type="range" min="-80" max="80" value={yOffset} onChange={(event) => setYOffset(Number(event.target.value))} className="mt-2 w-full accent-[--color-brand-primary]" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[--color-text-primary]">
              Shadow intensity: {shadow}px
              <input type="range" min="0" max="48" value={shadow} onChange={(event) => setShadow(Number(event.target.value))} className="mt-2 w-full accent-[--color-brand-primary]" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[--color-text-primary]">
              Layer opacity: {opacity}%
              <input type="range" min="40" max="100" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} className="mt-2 w-full accent-[--color-brand-primary]" />
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="primary" size="md" onClick={resetLayout}>Reset layout</Button>
            <Button type="button" variant="outline" size="md" onClick={() => setShowGuidance((prev) => !prev)}>
              {showGuidance ? "Hide guidance" : "Show guidance"}
            </Button>
          </div>
        </div>
      </aside>

      <section className="rounded-3xl border border-[--color-border] bg-white p-4 shadow-[var(--shadow-md)] sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[--color-brand-primary]">Product photo visualizer</p>
            <h2 className="mt-2 text-3xl font-bold text-[--color-text-primary]">Preview product placement</h2>
          </div>
          <div className="rounded-full bg-[--color-neutral-100] px-3 py-1.5 text-xs font-semibold text-[--color-text-muted]">
            {preset.name}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-[--color-border] bg-[--color-neutral-100]">
          <div className="relative h-[560px] w-full">
            <img src={imageSrc} alt="Project preview with product overlay" className="absolute inset-0 h-full w-full object-cover" />

            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-[240px] w-[520px]" style={productStyle}>
                <div
                  className="absolute left-0 top-0 h-[160px] w-full rounded-t-[28px] border-2 border-[--color-border]"
                  style={{
                    backgroundColor: preset.color,
                    borderColor: preset.accent,
                    boxShadow: `0 12px 28px rgba(0,0,0,0.14)`,
                  }}
                />

                <div
                  className="absolute left-8 top-[140px] h-[18px] w-[calc(100%-64px)] rounded-full"
                  style={{ backgroundColor: preset.accent, opacity: 0.82 }}
                />

                <div className="absolute left-8 top-[140px] h-[18px] w-[62%] rounded-full bg-white/30" />

                {selectedPreset === "screen" && (
                  <>
                    <div className="absolute inset-x-10 top-12 h-[110px] rounded-[20px] border-2 border-[--color-border] bg-white/20" />
                    <div className="absolute inset-x-12 top-14 grid h-[80px] grid-cols-6 gap-2 opacity-60">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="rounded-full bg-white/80" style={{ height: "100%" }} />
                      ))}
                    </div>
                  </>
                )}

                {selectedPreset === "awning" && (
                  <div className="absolute inset-x-8 bottom-[40px] h-[70px] rounded-[18px] border-2 border-[--color-border]" style={{ backgroundColor: preset.color }} />
                )}

                {selectedPreset === "tensile" && (
                  <div className="absolute inset-x-10 top-8 h-[120px] border-[10px] border-[--color-border]" style={{ clipPath: "polygon(0 100%, 10% 0, 90% 0, 100% 100%)", backgroundColor: preset.color }} />
                )}
              </div>
            </div>

            {showGuidance && (
              <div className="absolute bottom-6 left-6 max-w-md rounded-2xl border border-white/40 bg-black/25 p-4 text-sm text-white backdrop-blur-sm">
                For best results, use a wide exterior photo where the mounting area is visible and the camera is level.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-[--color-neutral-50] p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Product</p>
            <p className="mt-2 text-xl font-bold text-[--color-text-primary]">{preset.name}</p>
          </div>
          <div className="rounded-2xl bg-[--color-neutral-50] p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Scale</p>
            <p className="mt-2 text-xl font-bold text-[--color-text-primary]">{scale}%</p>
          </div>
          <div className="rounded-2xl bg-[--color-neutral-50] p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Suggested fit</p>
            <p className="mt-2 text-xl font-bold text-[--color-text-primary]">Exterior wall</p>
          </div>
        </div>
      </section>
    </div>
  );
}
