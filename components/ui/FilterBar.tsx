import React from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filters?: Array<{
    key: string;
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (val: string) => void;
  }>;
  onReset?: () => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Rechercher par nom, matricule...",
  filters = [],
  onReset,
  className,
}) => {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    filters.some((f) => f.value && f.value !== "ALL" && f.value !== "");

  return (
    <div
      className={cn(
        "bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3",
        className
      )}
    >
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-school-accent focus:ring-1 focus:ring-school-accent touch-target min-h-[44px]"
          />
        </div>

        {/* Filter Dropdowns */}
        {filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
              <div key={filter.key} className="flex-1 sm:flex-none">
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-xs md:text-sm text-slate-700 focus:border-school-accent focus:ring-1 focus:ring-school-accent touch-target min-h-[44px]"
                >
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Reset Button */}
        {hasActiveFilters && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50 touch-target min-h-[44px]"
            title="Réinitialiser les filtres"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Effacer</span>
          </button>
        )}
      </div>
    </div>
  );
};
