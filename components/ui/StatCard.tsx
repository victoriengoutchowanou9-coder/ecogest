import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
  className,
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

  return (
    <div
      className={cn(
        "rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md",
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
