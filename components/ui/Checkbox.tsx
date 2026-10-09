"use client";

import React, { useId } from "react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  error?: string;
  hint?: string;
}

export function Checkbox({ label, error, hint, className = "", id, ...props }: CheckboxProps) {
  const uid       = useId();
  const checkId   = id ?? uid;
  const errorId   = `${checkId}-error`;
  const hintId    = `${checkId}-hint`;

  const describedBy = [
    error ? errorId : null,
    hint  ? hintId  : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="inline-flex items-start gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          id={checkId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={[
            "mt-0.5 h-4 w-4 shrink-0 rounded border border-[--color-border]",
            "accent-[--color-brand-primary] cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]",
            "disabled:cursor-not-allowed disabled:opacity-60",
          ].join(" ")}
          {...props}
        />
        <span className="text-sm text-[--color-text-primary] leading-snug">{label}</span>
      </label>

      {hint && !error && (
        <p id={hintId} className="pl-6 text-xs text-[--color-text-muted]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="pl-6 text-xs text-[--color-error]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
