"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  FileSpreadsheet,
  CheckSquare,
  Clock,
  ArrowRight,
  GraduationCap,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";

export default function EnseignantDashboardPage() {
  const teacherCourses = [
    { id: "c-1", className: "3ème A", subject: "Mathématiques", hours: "4h / semaine", studentsCount: 48, nextSession: "Aujourd'hui 08:00 - 10:00" },
    { id: "c-2", className: "Terminale C", subject: "Mathématiques", hours: "6h / semaine", studentsCount: 32, nextSession: "Aujourd'hui 10:15 - 12:15" },
    { id: "c-3", className: "1ère D", subject: "Mathématiques", hours: "5h / semaine", studentsCount: 38, nextSession: "Demain 08:00 - 10:00" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Espace Enseignant"
        subtitle="Bienvenue, Prof. Justin HOUNKPONOU &middot; Année 2026-2027"
        breadcrumbs={[{ label: "Enseignant" }, { label: "Mes classes & cours" }]}
      />

      {/* Top metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Mes classes"
          value="3 divisions"
          subtitle="118 élèves au total"
          icon={<Users className="w-6 h-6" />}
          variant="info"
        />
        <StatCard
          title="Volume horaire"
          value="15 h"
          subtitle="Par semaine"
          icon={<Clock className="w-6 h-6" />}
          variant="default"
        />
        <StatCard
          title="Évaluations saisies"
          value="85 %"
          subtitle="Semestre 1 à jour"
          icon={<FileSpreadsheet className="w-6 h-6" />}
          variant="success"
        />
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/enseignant/presences"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-school-accent hover:shadow-md transition-all flex items-center justify-between group touch-target"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                Faire l&apos;appel du cours
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pointage des présences, retards et absences en un tap
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/enseignant/notes"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-school-accent hover:shadow-md transition-all flex items-center justify-between group touch-target"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-school-50 text-school-primary">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                Saisir les notes
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Grille rapide avec calcul automatique des moyennes
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Assigned Classes List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Mes affectations pédagogiques
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teacherCourses.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{c.className}</h4>
                  <p className="text-xs font-semibold text-school-primary">{c.subject}</p>
                </div>
                <span className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-600">
                  {c.studentsCount} élèves
                </span>
              </div>

              <div className="text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                <span className="block font-medium">Prochain créneau :</span>
                <span className="font-semibold text-slate-700">{c.nextSession}</span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Link
                  href="/enseignant/presences"
                  className="text-xs font-bold text-school-primary hover:underline touch-target"
                >
                  Faire l&apos;appel &rarr;
                </Link>
                <Link
                  href="/enseignant/notes"
                  className="text-xs font-bold text-slate-600 hover:underline touch-target"
                >
                  Notes &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
