"use client";

import React, { useState } from "react";
import { Calendar, Plus, CheckCircle2, Archive, Lock, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SCHOOL_YEARS } from "@/lib/permissions";
import { useToast } from "@/components/ui/Toast";

export default function AnneesScolairesPage() {
  const { toast } = useToast();
  const [years, setYears] = useState(SCHOOL_YEARS);
  const [activeYear, setActiveYear] = useState("2026-2027");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newYearName, setNewYearName] = useState("2027-2028");

  const handleCreateYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearName.trim()) return;
    if (years.some((y) => y.id === newYearName.trim())) {
      toast("Cette année scolaire existe déjà", "error");
      return;
    }
    const newY = { id: newYearName.trim(), label: newYearName.trim(), isCurrent: false };
    setYears([newY, ...years]);
    setIsModalOpen(false);
    toast(`Nouvelle année ${newYearName} créée avec succès`, "success");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Gestion des Années Scolaires"
        subtitle="Configuration des périodes académiques, passage de classe et archivage"
        breadcrumbs={[{ label: "Directeur", href: "/directeur" }, { label: "Années scolaires" }]}
        actions={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-school-primary text-white font-semibold text-xs md:text-sm hover:bg-school-700 shadow-sm touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Ouvrir une nouvelle année</span>
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {years.map((year) => {
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

      {/* Modal Créer une année */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-school-primary" />
                <h3 className="font-bold text-slate-900">Ouvrir une nouvelle année</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateYear} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Libellé de l'année scolaire</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 2027-2028"
                  value={newYearName}
                  onChange={(e) => setNewYearName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-school-primary/20 font-mono"
                />
                <p className="text-xs text-slate-500">
                  Format recommandé : AAAA-AAAA (ex: 2027-2028).
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-semibold hover:bg-school-700 shadow-sm"
                >
                  Créer l'année
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
