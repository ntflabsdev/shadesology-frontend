"use client";

import React, { useEffect, useRef, useCallback, useId, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type DrawerSide = "left" | "right" | "bottom";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  side?: DrawerSide;
  /** Width for left/right drawers */
  width?: "sm" | "md" | "lg";
  hideCloseButton?: boolean;
  footer?: React.ReactNode;
}

const sideTransformClosed: Record<DrawerSide, string> = {
  left:   "-translate-x-full",
  right:  "translate-x-full",
  bottom: "translate-y-full",
};

const sidePosition: Record<DrawerSide, string> = {
  left:   "inset-y-0 left-0",
  right:  "inset-y-0 right-0",
  bottom: "inset-x-0 bottom-0",
};

const widthClasses: Record<string, string> = {
  sm: "w-72",
  md: "w-80 sm:w-96",
  lg: "w-full sm:w-[480px]",
};

const subscribeToMount = () => () => {};
const getClientMountSnapshot = () => true;
const getServerMountSnapshot = () => false;

/**
 * WCAG 2.1 compliant off-canvas drawer.
 * - Focus trapped inside while open.
 * - Escape key closes the drawer.
 * - Focus returns to the triggering element on close.
 * - Body scroll locked while open.
 * - role="dialog" + aria-modal + aria-labelledby.
 * - CSS transition — respects prefers-reduced-motion via globals.css.
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = "right",
  width = "md",
  hideCloseButton = false,
  footer,
}: DrawerProps) {
  const panelRef   = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const titleId    = `drawer-title-${useId()}`;
  const mounted = useSyncExternalStore(
    subscribeToMount,
    getClientMountSnapshot,
    getServerMountSnapshot,
  );

  const getFocusableElements = useCallback(() => {
    if (!panelRef.current) return [];
    return Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input:not([disabled]), ' +
          'select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.closest("[hidden]"));
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      const focusIsOutside = !panelRef.current?.contains(document.activeElement);

      if (e.shiftKey) {
        if (focusIsOutside || document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (focusIsOutside || document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [getFocusableElements, onClose]
  );

  useEffect(() => {
    if (!isOpen || !mounted) return;

    triggerRef.current = document.activeElement;
    document.body.style.overflow = "hidden";

    // Focus the first focusable element (or panel itself)
    setTimeout(() => {
      const focusable = getFocusableElements();
      (focusable[0] ?? panelRef.current)?.focus();
    }, 50); // wait for transition

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      (triggerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [isOpen, mounted, getFocusableElements, handleKeyDown]);

  const isVertical = side === "bottom";

  const content = (
    <div
      className={[
        "fixed inset-0 z-50",
        "transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
      ].join(" ")}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={[
          "absolute z-10 bg-[--color-surface] shadow-[--shadow-xl] flex flex-col",
          "transition-transform duration-300 ease-in-out focus:outline-none",
          sidePosition[side],
          isVertical
            ? "rounded-t-2xl max-h-[85vh]"
            : `rounded-none h-full ${widthClasses[width] ?? widthClasses.md}`,
          isOpen ? "translate-x-0 translate-y-0" : sideTransformClosed[side],
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[--color-border]">
          <h2
            id={titleId}
            className="text-base font-semibold text-[--color-text-primary]"
          >
            {title}
          </h2>
          {!hideCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1 text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-[--color-neutral-100] focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-4 border-t border-[--color-border] bg-[--color-surface-alt]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return mounted ? createPortal(content, document.body) : null;
}
