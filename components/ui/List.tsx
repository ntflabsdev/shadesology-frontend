import React from "react";

interface ListProps {
  items: React.ReactNode[];
  ordered?: boolean;
  icon?: React.ReactNode;
  className?: string;
  itemClassName?: string;
}

/**
 * List — accessible ul/ol component with optional leading icon per item.
 * Defaults to a checkmark icon (good for feature lists).
 */
export function List({
  items,
  ordered = false,
  icon,
  className = "",
  itemClassName = "",
}: ListProps) {
  const Tag = ordered ? "ol" : "ul";

  const defaultIcon = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0 mt-0.5 text-[--color-brand-primary]"
    >
      <path
        d="M3 8l3.5 3.5L13 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const showIcon = !ordered && icon !== null;
  const iconEl   = showIcon ? (icon ?? defaultIcon) : null;

  return (
    <Tag
      className={[
        ordered ? "list-decimal pl-5 space-y-1.5" : "space-y-2",
        "text-sm text-[--color-text-primary]",
        className,
      ].join(" ")}
    >
      {items.map((item, i) => (
        <li
          key={i}
          className={[
            ordered ? "" : "flex items-start gap-2",
            itemClassName,
          ].join(" ")}
        >
          {!ordered && iconEl}
          <span>{item}</span>
        </li>
      ))}
    </Tag>
  );
}
