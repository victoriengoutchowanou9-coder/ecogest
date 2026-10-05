import React from "react";
import { cn, formatFCFA } from "@/lib/utils";

interface MoneyInputProps {
  value: number;
  onChange: (val: number) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  quickAmounts?: number[];
  className?: string;
}

export const MoneyInput: React.FC<MoneyInputProps> = ({
  value,
  onChange,
  label,
  placeholder = "Ex: 50000",
  error,
  disabled,
  min = 0,
  max,
  quickAmounts = [10000, 25000, 50000, 100000, 150000],
  className,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, "");
    const num = rawVal ? parseInt(rawVal, 10) : 0;
    onChange(num);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          disabled={disabled}
          value={value === 0 ? "" : value.toString()}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            "block w-full rounded-lg border border-slate-300 py-3 pl-4 pr-16 text-slate-900 placeholder:text-slate-400 focus:border-school-accent focus:ring-1 focus:ring-school-accent text-base tabular-nums touch-target",
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500",
            disabled && "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
          <span className="font-semibold text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
            FCFA
          </span>
        </div>
      </div>

      {value > 0 && (
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>Montant saisi :</span>
          <span className="font-semibold text-school-primary tabular-nums">
            {formatFCFA(value)}
          </span>
        </div>
      )}

      {/* Quick Select Buttons */}
      {quickAmounts && quickAmounts.length > 0 && !disabled && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => onChange(amt)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md border font-medium transition-colors touch-target min-h-[36px]",
                value === amt
                  ? "bg-school-primary text-white border-school-primary"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              )}
            >
              +{formatFCFA(amt)}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  );
};
