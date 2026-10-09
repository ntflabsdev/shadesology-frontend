"use client";

import React from "react";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  /** Optional alignment override */
  align?: "left" | "center" | "right";
  /** CSS min-width */
  minWidth?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  /** Key getter for React keys — defaults to index */
  rowKey?: (row: T, index: number) => string | number;
  caption?: string;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  striped?: boolean;
  /** If true, wraps in a horizontally scrollable container */
  scrollable?: boolean;
}

export function DataTable<T extends object>({
  columns,
  data,
  rowKey,
  caption,
  loading = false,
  emptyMessage = "No data available.",
  className = "",
  striped = true,
  scrollable = true,
}: DataTableProps<T>) {
  const alignClass = (align?: "left" | "center" | "right") => {
    if (align === "center") return "text-center";
    if (align === "right")  return "text-right";
    return "text-left";
  };

  const getCellValue = (row: T, col: Column<T>) => {
    return (row as Record<string, unknown>)[col.key as string];
  };

  const tableEl = (
    <table
      className={`w-full text-sm border-collapse ${className}`}
      role="table"
    >
      {caption && (
        <caption className="sr-only">{caption}</caption>
      )}
      <thead>
        <tr className="border-b border-[--color-border]">
          {columns.map((col) => (
            <th
              key={String(col.key)}
              scope="col"
              style={{ minWidth: col.minWidth }}
              className={[
                "px-4 py-3 font-semibold text-[--color-text-primary] whitespace-nowrap",
                alignClass(col.align),
              ].join(" ")}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td
              colSpan={columns.length}
              className="px-4 py-8 text-center text-[--color-text-muted]"
              aria-live="polite"
              aria-busy="true"
            >
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Loading…
              </span>
            </td>
          </tr>
        ) : data.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="px-4 py-8 text-center text-[--color-text-muted]"
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((row, i) => (
            <tr
              key={rowKey ? rowKey(row, i) : i}
              className={[
                "border-b border-[--color-border] last:border-0",
                "transition-colors hover:bg-[--color-neutral-50]",
                striped && i % 2 === 1 ? "bg-[--color-surface-alt]" : "",
              ].join(" ")}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={[
                    "px-4 py-3 text-[--color-text-primary]",
                    alignClass(col.align),
                  ].join(" ")}
                >
                  {col.render
                    ? col.render(getCellValue(row, col), row, i)
                    : String(getCellValue(row, col) ?? "")}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  if (!scrollable) return tableEl;

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-[--color-border]">
      {tableEl}
    </div>
  );
}
