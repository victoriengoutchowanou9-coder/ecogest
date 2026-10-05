import React from "react";
import { AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg touch-target"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={cn(
              "p-3 rounded-full shrink-0",
              isDestructive ? "bg-rose-100 text-rose-600" : "bg-school-50 text-school-primary"
            )}
          >
            {isDestructive ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
          </div>
          <div>
            <h3 id="confirm-dialog-title" className="text-lg font-bold text-slate-900">
              {title}
            </h3>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="touch-target px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "touch-target px-4 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors",
              isDestructive
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-school-primary hover:bg-school-700"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
