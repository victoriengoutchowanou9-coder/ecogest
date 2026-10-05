import React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  renderMobileCard?: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  renderMobileCard,
  keyExtractor,
  emptyMessage = "Aucune donnée disponible",
  className,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-slate-50/50">
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Mobile Card View (< 768px) - Strictly prevents horizontal scroll */}
      <div className="block md:hidden space-y-3">
        {data.map((item, index) =>
          renderMobileCard ? (
            <React.Fragment key={keyExtractor(item, index)}>
              {renderMobileCard(item, index)}
            </React.Fragment>
          ) : (
            <div
              key={keyExtractor(item, index)}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-2"
            >
              {columns.map((col) => (
                <div key={col.key} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                  <span className="text-xs font-semibold text-slate-500">{col.header}</span>
                  <div className="text-sm text-slate-800 text-right">{col.render(item)}</div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col" className={cn("px-4 py-3.5", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                className="hover:bg-slate-50/80 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3.5 align-middle", col.className)}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
