"use client";

import React from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[--color-brand-primary] text-white hover:bg-[--color-brand-primary-light] focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]",
  secondary:
    "bg-[--color-brand-accent] text-[--color-neutral-900] hover:bg-[--color-brand-accent-dark] focus-visible:ring-2 focus-visible:ring-[--color-brand-primary]",
  outline:
    "border-2 border-[--color-brand-primary] text-[--color-brand-primary] hover:bg-[--color-brand-primary] hover:text-white focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]",
  ghost:
    "text-[--color-brand-primary] hover:bg-[--color-neutral-100] focus-visible:ring-2 focus-visible:ring-[--color-brand-primary]",
  danger:
    "bg-[--color-error] text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-400",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 rounded",
  md: "text-sm px-5 py-2.5 rounded-md",
  lg: "text-base px-7 py-3.5 rounded-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  isLoading,
  leftIcon,
  rightIcon,
  fullWidth,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-150 focus-visible:outline-none disabled:opacity-60 disabled:pointer-events-none";
  const classes = [
    base,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {content}
    </button>
  );
}
