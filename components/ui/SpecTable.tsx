/**
 * SpecTable — renders a product specification table from key-value pairs.
 *
 * Designed for the PDP "Specifications" module. Rows are generated from
 * structured AttributeDefinition data, not free text.
 *
 * Accessibility: uses <table> with scope="row" on the label column.
 * Mobile: stacks into a definition-list-style layout below 640px.
 */

import React from "react";

export interface SpecRow {
  label: string;
  value: React.ReactNode;
  /** Highlight this row (e.g. in a comparison diff view) */
  highlight?: boolean;
  /** Show even if value is empty/null */
  showEmpty?: boolean;
}

export interface SpecGroup {
  heading?: string;
  rows: SpecRow[];
}

interface SpecTableProps {
  /** Either a flat list of rows or grouped rows */
  data: SpecRow[] | SpecGroup[];
  caption?: string;
  className?: string;
}

function isGrouped(data: SpecRow[] | SpecGroup[]): data is SpecGroup[] {
  return data.length > 0 && "rows" in data[0];
}

function SpecRows({ rows }: { rows: SpecRow[] }) {
  return (
    <>
      {rows.map((row, i) => {
        if (!row.showEmpty && (row.value === null || row.value === undefined || row.value === "")) {
          return null;
        }
        return (
          <tr
            key={i}
            className={[
              "border-b border-[--color-border] last:border-0",
              row.highlight ? "bg-amber-50" : i % 2 === 0 ? "" : "bg-[--color-surface-alt]",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {/* Label */}
            <th
              scope="row"
              className="w-2/5 px-4 py-2.5 text-sm font-medium text-[--color-text-primary] text-left align-top whitespace-nowrap"
            >
              {row.label}
            </th>
            {/* Value */}
            <td className="px-4 py-2.5 text-sm text-[--color-text-primary]">
              {row.value}
            </td>
          </tr>
        );
      })}
    </>
  );
}

export function SpecTable({ data, caption, className = "" }: SpecTableProps) {
  const grouped = isGrouped(data);

  return (
    <div className={`w-full overflow-x-auto rounded-lg border border-[--color-border] ${className}`}>
      <table className="w-full text-sm border-collapse" role="table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <tbody>
          {grouped
            ? (data as SpecGroup[]).map((group, gi) => (
                <React.Fragment key={gi}>
                  {group.heading && (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[--color-text-muted] bg-[--color-neutral-100] border-b border-[--color-border]"
                      >
                        {group.heading}
                      </td>
                    </tr>
                  )}
                  <SpecRows rows={group.rows} />
                </React.Fragment>
              ))
            : <SpecRows rows={data as SpecRow[]} />}
        </tbody>
      </table>
    </div>
  );
}
