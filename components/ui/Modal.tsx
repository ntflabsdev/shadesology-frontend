"use client";

import React, { useEffect, useRef, useCallback, useId, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Optional description shown below the title (also used as aria-describedby) */
  description?: string;
  children: React.ReactNode;
  /** Max width of the modal panel */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Hide the default close button */
  hideCloseButton?: boolean;
  /** Footer slot — rendered below the scrollable content area */
  footer?: React.ReactNode;
}

const sizeClasses: Record<string, string> = {
  sm:   "max-w-sm",
  md:   "max-w-lg",
  lg:   "max-w-2xl",
  xl:   "max-w-4xl",
  full: "max-w-full mx-4",
};

const subscribeToMount = () => () => {};
const getClientMountSnapshot = () => true;
const getServerMountSnapshot = () => false;

/**
 * WCAG 2.1 compliant modal dialog.
 * - Focus is trapped inside while open.
 * - Escape key closes the modal.
 * - Focus returns to the triggering element when closed.
 * - Scrollable backdrop locks body scroll.
 * - role="dialog" + aria-modal + aria-labelledby + aria-describedby.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  hideCloseButton = false,
  footer,
}: ModalProps) {
  const panelRef   = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const id = useId();
  const titleId = `modal-title-${id}`;
  const descId = `modal-desc-${id}`;
  const mounted = useSyncExternalStore(
    subscribeToMount,
    getClientMountSnapshot,
    getServerMountSnapshot,
  );

  // ── Trap focus ────────────────────────────────────────────────────────────
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

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !mounted) return;

    // Remember the element that triggered the modal
    triggerRef.current = document.activeElement;

    // Lock body scroll
    document.body.style.overflow = "hidden";

    // Move focus into the modal
    const focusable = getFocusableElements();
    (focusable[0] ?? panelRef.current)?.focus();

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus to the trigger
      (triggerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [isOpen, mounted, getFocusableElements, handleKeyDown]);

  if (!isOpen || !mounted) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-hidden={!isOpen}
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
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={[
          "relative z-10 w-full rounded-xl bg-[--color-surface] shadow-[--shadow-xl]",
          "flex flex-col max-h-[90vh] focus:outline-none",
          sizeClasses[size] ?? sizeClasses.md,
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[--color-border]">
          <div>
            <h2
              id={titleId}
              className="text-lg font-semibold text-[--color-text-primary]"
            >
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-sm text-[--color-text-muted]">
                {description}
              </p>
            )}
          </div>
          {!hideCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="shrink-0 rounded-md p-1 text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-[--color-neutral-100] focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[--color-border] bg-[--color-surface-alt] rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Portal to document.body
  return createPortal(content, document.body);
}
