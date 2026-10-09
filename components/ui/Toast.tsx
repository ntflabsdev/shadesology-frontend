"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number; // ms — 0 = persist until manually dismissed
}

interface ToastContextValue {
  toast: (opts: Omit<ToastItem, "id">) => string;
  dismiss: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="#16A34A" strokeWidth="1.5" />
      <path d="M6 10l2.5 2.5L14 7" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="#DC2626" strokeWidth="1.5" />
      <path d="M7 7l6 6M13 7l-6 6" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3L18 17H2L10 3z" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 9v3M10 14h.01" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="#2563EB" strokeWidth="1.5" />
      <path d="M10 9v5M10 7h.01" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-l-4 border-[--color-success]",
  error:   "border-l-4 border-[--color-error]",
  warning: "border-l-4 border-[--color-warning]",
  info:    "border-l-4 border-blue-600",
};

const subscribeToMount = () => () => {};
const getClientMountSnapshot = () => true;
const getServerMountSnapshot = () => false;

// ─── Single Toast item ────────────────────────────────────────────────────────

function ToastMessage({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const duration = item.duration ?? 5000;

  useEffect(() => {
    if (duration === 0) return;
    timerRef.current = setTimeout(() => onDismiss(item.id), duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [item.id, duration, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={[
        "w-full max-w-sm rounded-lg bg-[--color-surface] shadow-[--shadow-lg] p-4",
        "flex items-start gap-3",
        VARIANT_STYLES[item.variant],
      ].join(" ")}
    >
      <span className="shrink-0 mt-0.5">{ICONS[item.variant]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[--color-text-primary]">{item.title}</p>
        {item.description && (
          <p className="mt-0.5 text-xs text-[--color-text-muted]">{item.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label={`Dismiss notification: ${item.title}`}
        className="shrink-0 rounded p-0.5 text-[--color-text-muted] hover:text-[--color-text-primary] focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M4.22 3.22a.75.75 0 0 0-1.06 1.06L6.94 8l-3.78 3.72a.75.75 0 1 0 1.06 1.06L8 9.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L9.06 8l3.72-3.72a.75.75 0 0 0-1.06-1.06L8 6.94 4.22 3.22z" />
        </svg>
      </button>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const mounted = useSyncExternalStore(
    subscribeToMount,
    getClientMountSnapshot,
    getServerMountSnapshot,
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<ToastItem, "id">): string => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...opts, id }]);
    return id;
  }, []);

  const region = (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-60 flex flex-col gap-2 items-end pointer-events-none"
    >
      {toasts.map((item) => (
        <div key={item.id} className="pointer-events-auto w-full max-w-sm">
          <ToastMessage item={item} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {mounted ? createPortal(region, document.body) : null}
    </ToastContext.Provider>
  );
}
