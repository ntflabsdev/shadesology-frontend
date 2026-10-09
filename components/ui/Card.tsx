import React from "react";

type ValidTag = keyof React.JSX.IntrinsicElements;

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Adds a hover lift effect — useful for clickable cards */
  hoverable?: boolean;
  /** Removes padding — useful when you want to fill the card with media */
  noPadding?: boolean;
  /** Render as a different element */
  as?: ValidTag;
}

export function Card({
  children,
  className = "",
  hoverable = false,
  noPadding = false,
  as: Tag = "div",
}: CardProps) {
  return (
    <Tag
      className={[
        "rounded-xl border border-[--color-border] bg-[--color-surface] shadow-[--shadow-sm]",
        noPadding ? "" : "p-6",
        hoverable
          ? "transition-shadow duration-200 hover:shadow-[--shadow-md] hover:-translate-y-0.5"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>{children}</div>
  );
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={className}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-[--color-border] ${className}`}>
      {children}
    </div>
  );
}
