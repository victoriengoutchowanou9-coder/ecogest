import React from "react";
import { cn } from "@/lib/utils";

interface RecordCardProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  details?: Array<{ label: string; value: React.ReactNode }>;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const RecordCard: React.FC<RecordCardProps> = ({
  title,
  subtitle,
  badge,
  icon,
  details,
  actions,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200",
        onClick && "cursor-pointer hover:border-school-accent active:scale-[0.99]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 rounded-lg bg-school-50 text-school-primary shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 leading-tight">{title}</h4>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {details && details.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
          {details.map((d, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{d.label}</span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5">{d.value}</span>
            </div>
          ))}
        </div>
      )}

      {actions && (
        <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          {actions}
        </div>
      )}
    </div>
  );
};
