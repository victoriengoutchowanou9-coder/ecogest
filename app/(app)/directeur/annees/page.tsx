"use client";

import React, { useState } from "react";
import { Calendar, Plus, CheckCircle2, Archive, Lock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SCHOOL_YEARS } from "@/lib/permissions";
import { useToast } from "@/components/ui/Toast";

export default function AnneesScolairesPage() {
  const { toast } = useToast();
  const [activeYear, setActiveYear] = useState("2026-2027");

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Gestion des Années Scolaires"
        subtitle="Configuration des périodes académiques, passage de classe et archivage"
        breadcrumbs={[{ label: "Directeur", href: "/directeur" }, { label: "Années scolaires" }]}
        actions={
          <button
            onClick={() => toast("Ouverture de la création d'une nouvelle année", "info")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-school-primary text-white font-semibold text-xs md:text-sm hover:bg-school-700 shadow-sm touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Ouvrir une nouvelle année</span>
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {SCHOOL_YEARS.map((year) => {
          const isCurrent = year.id === activeYear;
          return (
            <div
              key={year.id}
              className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    isCurrent ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{year.id}</h3>
                  <p className="text-xs text-slate-500">
                    {isCurrent ? "Année académique active en cours" : "Année clôturée et archivée"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge
                  status={isCurrent ? "VALIDATED" : "LOCKED"}
                  label={isCurrent ? "En cours" : "Archivée"}
                  size="sm"
                />

                {!isCurrent && (
                  <button
                    onClick={() => {
                      setActiveYear(year.id);
                      toast(`Année active basculée sur ${year.id}`, "success");
                    }}
                    className="text-xs font-semibold text-school-primary hover:underline touch-target"
                  >
                    Activer
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
