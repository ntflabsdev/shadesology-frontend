"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";

const getDeviceInfo = () => {
  if (typeof window === "undefined") {
    return { supportsWebGL: true, platform: "desktop" as const };
  }

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|Mobile/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);

  return {
    supportsWebGL: Boolean(gl),
    platform: isMobile ? ("mobile" as const) : isTablet ? ("tablet" as const) : ("desktop" as const),
  };
};

const presets = [
  { id: "awning", name: "Retractable awning", color: "#DCCBAA", frame: "#4A5C4E", accent: "#D4A853" },
  { id: "pergola", name: "Fabric pergola", color: "#C6B7A3", frame: "#1B4332", accent: "#B96E46" },
  { id: "screen", name: "Privacy screen", color: "#C0C9C6", frame: "#425063", accent: "#6A7F9E" },
  { id: "tensile", name: "Tensile canopy", color: "#EFE0C6", frame: "#5C4D3D", accent: "#7F7C6B" },
] as const;

export function ThreeDViewer() {
  const initialDevice = useMemo(() => getDeviceInfo(), []);
  const [selectedPreset, setSelectedPreset] = useState<(typeof presets)[number]["id"]>("awning");
  const [rotationX, setRotationX] = useState(24);
  const [rotationY, setRotationY] = useState(36);
  const [zoom, setZoom] = useState(1);
  const [lighting, setLighting] = useState("daylight");

  const supportsWebGL = initialDevice.supportsWebGL;
  const platform = initialDevice.platform;

  const preset = presets.find((item) => item.id === selectedPreset) ?? presets[0];

  const objectStyle = useMemo(
    () => ({
      transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${zoom})`,
      background: `linear-gradient(135deg, ${preset.frame}, ${preset.accent})`,
    }),
    [rotationX, rotationY, zoom, preset],
  );

  const lightingMode =
    lighting === "daylight"
      ? "linear-gradient(120deg, rgba(255,255,255,0.95), rgba(255,235,190,0.7))"
      : lighting === "evening"
        ? "linear-gradient(120deg, rgba(88,66,88,0.9), rgba(255,180,122,0.72))"
        : "linear-gradient(120deg, rgba(18,22,30,0.9), rgba(83,118,177,0.68))";

  return (
    <div className="grid gap-8 xl:grid-cols-[0.9fr_1.5fr]">
      <aside className="rounded-3xl border border-[--color-border] bg-[--color-neutral-50] p-5 shadow-[var(--shadow-sm)]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-[--color-text-primary]">Viewer controls</h2>
          <span className="rounded-full bg-[--color-brand-primary]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[--color-brand-primary]">
            3D
          </span>
        </div>

        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-[--color-text-primary]">Model</p>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedPreset(item.id)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm font-medium ${
                    selectedPreset === item.id
                      ? "border-[--color-brand-primary] bg-[--color-brand-primary]/5 text-[--color-brand-primary]"
                      : "border-[--color-border] bg-white text-[--color-text-primary]"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[--color-text-primary]">
              Zoom: {zoom.toFixed(2)}x
              <input type="range" min="0.7" max="1.6" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="mt-2 w-full accent-[--color-brand-primary]" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[--color-text-primary]">
              Rotate X: {rotationX}°
              <input type="range" min="0" max="90" value={rotationX} onChange={(event) => setRotationX(Number(event.target.value))} className="mt-2 w-full accent-[--color-brand-primary]" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[--color-text-primary]">
              Rotate Y: {rotationY}°
              <input type="range" min="0" max="360" value={rotationY} onChange={(event) => setRotationY(Number(event.target.value))} className="mt-2 w-full accent-[--color-brand-primary]" />
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-[--color-text-primary]">Lighting preset</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "daylight", label: "Day" },
                { id: "evening", label: "Sunset" },
                { id: "night", label: "Night" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLighting(item.id)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                    lighting === item.id
                      ? "border-[--color-brand-primary] bg-[--color-brand-primary]/5 text-[--color-brand-primary]"
                      : "border-[--color-border] bg-white text-[--color-text-primary]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[--color-border] bg-white p-4 text-sm text-[--color-text-muted]">
            <p className="font-semibold text-[--color-text-primary]">Device capability</p>
            <p className="mt-2">{supportsWebGL ? "3D renderer is available on this device." : "WebGL unavailable — static fallback is enabled."}</p>
            <p className="mt-1">Platform: {platform}</p>
          </div>
        </div>
      </aside>

      <section className="rounded-3xl border border-[--color-border] bg-white p-4 shadow-[var(--shadow-md)] sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[--color-brand-primary]">3D viewer</p>
            <h2 className="mt-2 text-3xl font-bold text-[--color-text-primary]">Interactive product model</h2>
          </div>
          <div className="rounded-full bg-[--color-neutral-100] px-3 py-1.5 text-xs font-semibold text-[--color-text-muted]">
            {preset.name}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[--color-border] bg-[--color-neutral-100] p-6">
          <div className="relative mx-auto h-[440px] w-full max-w-[720px] overflow-hidden rounded-[1.5rem] border border-[--color-border] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.7),_rgba(194,214,227,0.28)_35%,_rgba(15,23,42,0.08)_100%)]">
            <div className="absolute inset-0" style={{ background: lightingMode }} />

            {!supportsWebGL ? (
              <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                <div className="max-w-md rounded-3xl border border-[--color-border] bg-white/80 p-6 shadow-[var(--shadow-md)] backdrop-blur-sm">
                  <p className="text-lg font-bold text-[--color-text-primary]">Static fallback view</p>
                  <p className="mt-2 text-sm text-[--color-text-muted]">This device does not support the live 3D viewer, so you can continue with the product image preview and configuration flow.</p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center [perspective:1200px]">
                <div
                  className="relative h-[220px] w-[320px] [transform-style:preserve-3d]"
                  style={objectStyle}
                >
                  <div className="absolute inset-x-8 top-8 h-4 rounded-full bg-white/70 shadow-[0_0_25px_rgba(255,255,255,0.8)]" style={{ transform: "translateZ(80px)" }} />
                  <div className="absolute inset-x-7 top-10 h-[120px] rounded-[1.5rem] border-2 border-white/70" style={{ backgroundColor: preset.color, transform: "translateZ(60px)" }} />
                  <div className="absolute inset-x-6 top-16 h-[104px] rounded-[1.2rem] border border-white/50" style={{ backgroundColor: preset.accent, opacity: 0.7, transform: "translateZ(90px)" }} />
                  <div className="absolute left-4 top-12 h-[110px] w-6 rounded-full bg-white/25" style={{ transform: "translateZ(110px) rotateY(90deg)" }} />
                  <div className="absolute right-4 top-12 h-[110px] w-6 rounded-full bg-white/25" style={{ transform: "translateZ(110px) rotateY(90deg)" }} />
                  <div className="absolute left-[50%] top-[-8px] h-[140px] w-[72px] -translate-x-1/2 rounded-[1.7rem] border border-white/50" style={{ backgroundColor: preset.frame, transform: "translateZ(80px) rotateX(90deg)" }} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl bg-[--color-neutral-50] p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">AR status</p>
            <p className="mt-2 text-xl font-bold text-[--color-text-primary]">
              {supportsWebGL ? "AR-ready preview available" : "Fallback mode enabled"}
            </p>
            <p className="mt-1 text-sm text-[--color-text-muted]">Supported browsers can launch a real-scale preview on modern iOS and Android devices.</p>
          </div>

          <div className="rounded-2xl bg-[--color-neutral-50] p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Support matrix</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full bg-[#E9F7EE] px-2 py-1 text-[#186A3B]">Desktop: yes</span>
              <span className="rounded-full bg-[#EAF2FF] px-2 py-1 text-[#1D4ED8]">Tablet: partial</span>
              <span className="rounded-full bg-[#FFF6E5] px-2 py-1 text-[#A16207]">Mobile: browser checked</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="primary" size="lg">Launch AR preview</Button>
          <Button type="button" variant="outline" size="lg">Save screenshot</Button>
        </div>
      </section>
    </div>
  );
}
