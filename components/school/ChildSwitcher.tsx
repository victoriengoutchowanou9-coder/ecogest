"use client";

import React from "react";
import { User, ChevronRight } from "lucide-react";
import { Student } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface ChildSwitcherProps {
  childrenList: Student[];
  selectedChildId: string;
  onSelectChild: (student: Student) => void;
  className?: string;
}

export const ChildSwitcher: React.FC<ChildSwitcherProps> = ({
  childrenList,
  selectedChildId,
  onSelectChild,
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Sélectionner un enfant
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {childrenList.map((child) => {
          const isSelected = child.id === selectedChildId;
          return (
            <button
              key={child.id}
              type="button"
              onClick={() => onSelectChild(child)}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border text-left transition-all touch-target",
                isSelected
                  ? "border-school-primary bg-school-50/70 shadow-xs ring-1 ring-school-primary"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                    isSelected
                      ? "bg-school-primary text-white"
                      : "bg-slate-100 text-slate-700"
                  )}
                >
                  {child.firstName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {child.firstName} {child.lastName}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold text-school-primary">
                      {child.className}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {child.matricule}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight
                className={cn(
                  "w-4 h-4",
                  isSelected ? "text-school-primary" : "text-slate-300"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
