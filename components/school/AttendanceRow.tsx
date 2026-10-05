import React from "react";
import { Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "RETARD";

interface AttendanceRowProps {
  studentName: string;
  matricule: string;
  avatarUrl?: string;
  status: AttendanceStatus;
  onChange: (newStatus: AttendanceStatus) => void;
  disabled?: boolean;
}

export const AttendanceRow: React.FC<AttendanceRowProps> = ({
  studentName,
  matricule,
  avatarUrl,
  status,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm gap-3">
      {/* Student Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-school-100 text-school-800 font-semibold flex items-center justify-center text-sm shrink-0">
          {studentName.charAt(0)}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900 leading-tight">{studentName}</h4>
          <span className="text-xs text-slate-500 font-mono">{matricule}</span>
        </div>
      </div>

      {/* 3 Large Action Buttons (Min 44px touch targets) */}
      <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("PRESENT")}
          className={cn(
            "touch-target flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs md:text-sm transition-all duration-150",
            status === "PRESENT"
              ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500 ring-offset-1 font-semibold"
              : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          )}
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>Présent</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("RETARD")}
          className={cn(
            "touch-target flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs md:text-sm transition-all duration-150",
            status === "RETARD"
              ? "bg-amber-500 text-white shadow-sm ring-2 ring-amber-400 ring-offset-1 font-semibold"
              : "bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700"
          )}
        >
          <Clock className="w-4 h-4 shrink-0" />
          <span>Retard</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("ABSENT")}
          className={cn(
            "touch-target flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs md:text-sm transition-all duration-150",
            status === "ABSENT"
              ? "bg-rose-600 text-white shadow-sm ring-2 ring-rose-500 ring-offset-1 font-semibold"
              : "bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700"
          )}
        >
          <X className="w-4 h-4 shrink-0" />
          <span>Absent</span>
        </button>
      </div>
    </div>
  );
};
