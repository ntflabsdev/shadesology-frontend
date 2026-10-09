"use client";

import React, { useId } from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

export function Select({
  label,
  error,
  hint,
  options,
  placeholder,
  fullWidth = true,
  className = "",
  id,
  ...props
}: SelectProps) {
  const uid     = useId();
  const selectId = id ?? uid;
  const errorId  = `${selectId}-error`;
  const hintId   = `${selectId}-hint`;

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
          htmlFor={selectId}
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

      <div className="relative">
        <select
          id={selectId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={[
            "block w-full appearance-none rounded-md border bg-white text-[--color-text-primary] text-sm",
            "px-3 py-2.5 pr-9 transition-colors",
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
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[--color-text-muted]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </span>
      </div>

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
