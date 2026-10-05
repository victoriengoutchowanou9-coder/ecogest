import React from "react";
import { Lock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface GradeInputRowProps {
  studentName: string;
  matricule: string;
  interro1: number | null;
  interro2: number | null;
  devoir1: number | null;
  devoir2: number | null;
  status: "DRAFT" | "VALIDATED" | "LOCKED";
  onGradeChange: (field: "interro1" | "interro2" | "devoir1" | "devoir2", value: number | null) => void;
  onRequestUnlock?: () => void;
}

export const GradeInputRow: React.FC<GradeInputRowProps> = ({
  studentName,
  matricule,
  interro1,
  interro2,
  devoir1,
  devoir2,
  status,
  onGradeChange,
  onRequestUnlock,
}) => {
  const isLocked = status === "LOCKED";

  // Calculate weighted average
  // Interros coeff 1 each, Devoirs coeff 2 each
  const grades = [
    { val: interro1, coef: 1 },
    { val: interro2, coef: 1 },
    { val: devoir1, coef: 2 },
    { val: devoir2, coef: 2 },
  ].filter((g) => g.val !== null);

  const totalCoef = grades.reduce((acc, curr) => acc + curr.coef, 0);
  const totalScore = grades.reduce((acc, curr) => acc + (curr.val || 0) * curr.coef, 0);
  const calculatedAverage = totalCoef > 0 ? (totalScore / totalCoef).toFixed(2) : "-";

  const handleInputChange = (
    field: "interro1" | "interro2" | "devoir1" | "devoir2",
    strVal: string
  ) => {
    if (isLocked) return;
    if (strVal === "") {
      onGradeChange(field, null);
      return;
    }
    const clean = strVal.replace(",", ".");
    const num = parseFloat(clean);
    if (!isNaN(num) && num >= 0 && num <= 20) {
      onGradeChange(field, num);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm gap-3">
      {/* Student identity & lock badge */}
      <div className="flex items-center justify-between md:justify-start gap-3 min-w-[200px]">
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-semibold text-slate-900">{studentName}</h4>
            {isLocked && (
              <span title="Notes verrouillées par le Censeur">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500 font-mono">{matricule}</span>
        </div>
        <StatusBadge status={status} size="sm" className="md:hidden" />
      </div>

      {/* Grade Inputs Grid */}
      <div className="grid grid-cols-4 sm:flex items-center gap-2">
        <div className="flex flex-col">
          <label className="text-[10px] uppercase font-semibold text-slate-400 mb-0.5 text-center">Int 1</label>
          <input
            type="text"
            inputMode="decimal"
            disabled={isLocked}
            value={interro1 !== null ? interro1 : ""}
            onChange={(e) => handleInputChange("interro1", e.target.value)}
            placeholder="/20"
            className={cn(
              "w-14 sm:w-16 h-10 text-center font-semibold rounded-lg border border-slate-300 text-sm tabular-nums focus:border-school-accent focus:ring-1 focus:ring-school-accent",
              isLocked && "bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
            )}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] uppercase font-semibold text-slate-400 mb-0.5 text-center">Int 2</label>
          <input
            type="text"
            inputMode="decimal"
            disabled={isLocked}
            value={interro2 !== null ? interro2 : ""}
            onChange={(e) => handleInputChange("interro2", e.target.value)}
            placeholder="/20"
            className={cn(
              "w-14 sm:w-16 h-10 text-center font-semibold rounded-lg border border-slate-300 text-sm tabular-nums focus:border-school-accent focus:ring-1 focus:ring-school-accent",
              isLocked && "bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
            )}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] uppercase font-semibold text-slate-400 mb-0.5 text-center">Dev 1</label>
          <input
            type="text"
            inputMode="decimal"
            disabled={isLocked}
            value={devoir1 !== null ? devoir1 : ""}
            onChange={(e) => handleInputChange("devoir1", e.target.value)}
            placeholder="/20"
            className={cn(
              "w-14 sm:w-16 h-10 text-center font-semibold rounded-lg border border-slate-300 text-sm tabular-nums focus:border-school-accent focus:ring-1 focus:ring-school-accent",
              isLocked && "bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
            )}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] uppercase font-semibold text-slate-400 mb-0.5 text-center">Dev 2</label>
          <input
            type="text"
            inputMode="decimal"
            disabled={isLocked}
            value={devoir2 !== null ? devoir2 : ""}
            onChange={(e) => handleInputChange("devoir2", e.target.value)}
            placeholder="/20"
            className={cn(
              "w-14 sm:w-16 h-10 text-center font-semibold rounded-lg border border-slate-300 text-sm tabular-nums focus:border-school-accent focus:ring-1 focus:ring-school-accent",
              isLocked && "bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
            )}
          />
        </div>
      </div>

      {/* Average & Lock / Correction action */}
      <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
        <div className="text-right">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Moyenne</span>
          <span className={cn(
            "text-base font-bold tabular-nums",
            Number(calculatedAverage) >= 10 ? "text-emerald-700" : Number(calculatedAverage) > 0 ? "text-rose-600" : "text-slate-400"
          )}>
            {calculatedAverage} / 20
          </span>
        </div>

        <div className="hidden md:block">
          <StatusBadge status={status} size="sm" />
        </div>

        {isLocked && onRequestUnlock && (
          <button
            type="button"
            onClick={onRequestUnlock}
            className="text-xs text-school-accent hover:underline flex items-center gap-1 font-medium touch-target min-h-[36px]"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Demander correction</span>
          </button>
        )}
      </div>
    </div>
  );
};
