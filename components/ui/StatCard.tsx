import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
  compact?: boolean;
  valueClassName?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
  className,
  compact = false,
  valueClassName,
  onClick,
}) => {
  const variantStyles = {
    default: "border-slate-200 bg-white",
    success: "border-emerald-200 bg-emerald-50/40",
    warning: "border-amber-200 bg-amber-50/40",
    danger: "border-rose-200 bg-rose-50/40",
    info: "border-sky-200 bg-sky-50/40",
  };

  const iconBgStyles = {
    default: "bg-school-50 text-school-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    info: "bg-sky-100 text-sky-700",
  };

  // Compact Framing (harmonized with financial indicator reference cards)
  if (compact) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-slate-300 active:scale-[0.98] cursor-pointer select-none min-h-[96px] h-full",
          className
        )}
      >
        <div className="flex items-center justify-center gap-1.5 mb-1 text-slate-400">
          {icon && (
            <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
              {icon}
            </span>
          )}
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate block">
            {title}
          </span>
        </div>

        <div className="my-auto py-0.5">
          {typeof value === "string" || typeof value === "number" ? (
            <span
              className={cn(
                "text-base md:text-lg font-black text-slate-900 tabular-nums block leading-tight",
                valueClassName
              )}
            >
              {value}
            </span>
          ) : (
            <div className="flex items-center justify-center">{value}</div>
          )}
        </div>

        {subtitle && (
          <span className="text-[10px] text-slate-500 block truncate mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] cursor-pointer select-none",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {value}
          </p>
        </div>
        {icon && (
          <div className={cn("p-2.5 rounded-lg flex items-center justify-center shrink-0", iconBgStyles[variant])}>
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs md:text-sm">
          {trend && (
            <span
              className={cn(
                "font-semibold",
                trend.isPositive ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {trend.value}
            </span>
          )}
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
