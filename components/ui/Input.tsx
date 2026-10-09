"use client";

import React, { useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  /** Full width — defaults to true */
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  hint,
  leftAddon,
  rightAddon,
  fullWidth = true,
  className = "",
  id,
  ...props
}: InputProps) {
  const uid = useId();
  const inputId = id ?? uid;
  const errorId = `${inputId}-error`;
  const hintId  = `${inputId}-hint`;

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
          htmlFor={inputId}
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

      <div className="relative flex items-center">
        {leftAddon && (
          <span className="absolute left-3 text-[--color-text-muted] pointer-events-none">
            {leftAddon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={[
            "block w-full rounded-md border bg-white text-[--color-text-primary] text-sm",
            "px-3 py-2.5 transition-colors placeholder:text-[--color-text-muted]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-primary-light] focus-visible:border-[--color-brand-primary]",
            "disabled:bg-[--color-neutral-100] disabled:text-[--color-text-muted] disabled:cursor-not-allowed",
            error
              ? "border-[--color-error] focus-visible:ring-red-300"
              : "border-[--color-border] hover:border-[--color-neutral-400]",
            leftAddon  ? "pl-9"  : "",
            rightAddon ? "pr-9"  : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {rightAddon && (
          <span className="absolute right-3 text-[--color-text-muted] pointer-events-none">
            {rightAddon}
          </span>
        )}
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
