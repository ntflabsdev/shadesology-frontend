"use client";

import React, { useId } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export function Textarea({
  label,
  error,
  hint,
  fullWidth = true,
  className = "",
  id,
  rows = 4,
  ...props
}: TextareaProps) {
  const uid      = useId();
  const areaId   = id ?? uid;
  const errorId  = `${areaId}-error`;
  const hintId   = `${areaId}-hint`;

  const describedBy = [
    error ? errorId : null,
    hint  ? hintId  : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label
          htmlFor={areaId}
          className="block text-sm font-medium text-[--color-text-primary] mb-1.5"
        >
          {label}
          {props.required && (
            <span className="ml-1 text-[--color-error]" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <textarea
        id={areaId}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={[
          "block w-full rounded-md border bg-white text-[--color-text-primary] text-sm",
          "px-3 py-2.5 resize-y transition-colors placeholder:text-[--color-text-muted]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent] focus-visible:border-[--color-brand-primary]",
          "disabled:bg-[--color-neutral-100] disabled:text-[--color-text-muted] disabled:cursor-not-allowed",
          error
            ? "border-[--color-error] focus-visible:ring-red-300"
            : "border-[--color-border] hover:border-[--color-neutral-400]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />

      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-[--color-text-muted]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-[--color-error]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
