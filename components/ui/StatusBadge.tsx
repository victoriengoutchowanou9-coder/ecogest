import React from "react";
import { CheckCircle2, Clock, AlertTriangle, XCircle, FileEdit, CheckCheck, Lock, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { SchoolStatus } from "@/styles/tokens";

interface StatusBadgeProps {
  status: SchoolStatus | string;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = "md",
  className,
}) => {
  const normalized = (status || "").toUpperCase();

  let config = {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    label: label || "Inconnu",
    icon: <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
  };

  switch (normalized) {
    case "PAID":
    case "PAYÉ":
    case "PAYE":
      config = {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        label: label || "Payé",
        icon: <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" aria-hidden="true" />,
      };
      break;

    case "PARTIAL":
    case "PARTIEL":
      config = {
        bg: "bg-amber-50",
        text: "text-amber-800",
        border: "border-amber-200",
        label: label || "Partiel",
        icon: <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" aria-hidden="true" />,
      };
      break;

    case "UNPAID":
    case "IMPAYÉ":
    case "IMPAYE":
      config = {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        label: label || "Impayé",
        icon: <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" aria-hidden="true" />,
      };
      break;

    case "LATE":
    case "EN RETARD":
    case "RETARD":
      config = {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        label: label || "En retard",
        icon: <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600" aria-hidden="true" />,
      };
      break;

    case "DRAFT":
    case "BROUILLON":
      config = {
        bg: "bg-slate-100",
        text: "text-slate-700",
        border: "border-slate-300",
        label: label || "Brouillon",
        icon: <FileEdit className="w-3.5 h-3.5 shrink-0 text-slate-500" aria-hidden="true" />,
      };
      break;

    case "VALIDATED":
    case "VALIDÉ":
    case "VALIDE":
      config = {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        border: "border-emerald-300",
        label: label || "Validé",
        icon: <CheckCheck className="w-3.5 h-3.5 shrink-0 text-emerald-700" aria-hidden="true" />,
      };
      break;

    case "LOCKED":
    case "VERROUILLÉ":
    case "VERROUILLE":
      config = {
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-300",
        label: label || "Verrouillé",
        icon: <Lock className="w-3.5 h-3.5 shrink-0 text-gray-500" aria-hidden="true" />,
      };
      break;

    case "PRESENT":
      config = {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        label: label || "Présent",
        icon: <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" aria-hidden="true" />,
      };
      break;

    case "ABSENT":
      config = {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        label: label || "Absent",
        icon: <XCircle className="w-3.5 h-3.5 shrink-0 text-red-600" aria-hidden="true" />,
      };
      break;

    case "INFO":
    default:
      config = {
        bg: "bg-sky-50",
        text: "text-sky-700",
        border: "border-sky-200",
        label: label || status,
        icon: <Info className="w-3.5 h-3.5 shrink-0 text-sky-600" aria-hidden="true" />,
      };
      break;
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs md:text-sm font-medium gap-1.5",
    lg: "px-3 py-1.5 text-sm md:text-base font-semibold gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border shadow-sm select-none",
        sizeClasses[size],
        config.bg,
        config.text,
        config.border,
        className
      )}
      role="status"
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
