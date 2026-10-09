"use client";

import React, { useId } from "react";

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  hint?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  hint?: string;
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export function RadioGroup({
  name,
  label,
  options,
  value,
  onChange,
  error,
  hint,
  orientation = "vertical",
  className = "",
}: RadioGroupProps) {
  const uid     = useId();
  const groupId = `${uid}-group`;
  const errorId = `${groupId}-error`;
  const hintId  = `${groupId}-hint`;

  const describedBy = [
    error ? errorId : null,
    hint  ? hintId  : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <fieldset
      aria-describedby={describedBy}
      className={`border-0 p-0 m-0 ${className}`}
    >
      {label && (
        <legend className="text-sm font-medium text-[--color-text-primary] mb-2">
          {label}
        </legend>
      )}

      <div
        className={
          orientation === "horizontal"
            ? "flex flex-wrap gap-4"
            : "flex flex-col gap-2.5"
        }
      >
        {options.map((opt) => {
          const optId = `${uid}-${opt.value}`;
          return (
            <label
              key={opt.value}
              htmlFor={optId}
              className={[
                "inline-flex items-start gap-2.5 cursor-pointer select-none",
                opt.disabled ? "opacity-60 cursor-not-allowed" : "",
              ].join(" ")}
            >
              <input
                type="radio"
                id={optId}
                name={name}
                value={opt.value}
                checked={value === opt.value}
                disabled={opt.disabled}
                onChange={() => onChange?.(opt.value)}
                className={[
                  "mt-0.5 h-4 w-4 shrink-0 accent-[--color-brand-primary] cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]",
                  "disabled:cursor-not-allowed",
                ].join(" ")}
              />
              <span className="flex flex-col text-sm">
                <span className="text-[--color-text-primary] leading-snug">{opt.label}</span>
                {opt.hint && (
                  <span className="text-xs text-[--color-text-muted] mt-0.5">{opt.hint}</span>
                )}
              </span>
            </label>
          );
        })}
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
    </fieldset>
  );
}
