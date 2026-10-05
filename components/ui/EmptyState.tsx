import React from "react";
import { FolderX, Plus, AlertCircle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white shadow-sm",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-4">
        {icon || <FolderX className="w-7 h-7" />}
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-school-primary hover:bg-school-700 text-white text-sm font-semibold shadow-sm transition-colors touch-target"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200/80",
        className
      )}
    />
  );
};

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isAccessDenied?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  isAccessDenied = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border border-rose-200 bg-rose-50/40",
        className
      )}
    >
      <div
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center mb-4",
          isAccessDenied ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
        )}
      >
        {isAccessDenied ? <ShieldAlert className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
      </div>
      <h3 className="text-lg font-bold text-slate-900">
        {title || (isAccessDenied ? "Accès refusé" : "Une erreur est survenue")}
      </h3>
      <p className="mt-1 text-sm text-slate-600 max-w-md">
        {message ||
          (isAccessDenied
            ? "Vous n'avez pas les autorisations nécessaires pour consulter cette page."
            : "Impossible de charger les informations demandées. Veuillez réessayer.")}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium shadow-sm transition-colors touch-target"
        >
          Réessayer
        </button>
      )}
    </div>
  );
};
