"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpenCheck,
  UserCheck,
  AlertTriangle,
  GraduationCap,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MOCK_TEACHER_ATTENDANCES } from "@/lib/mock-data";

export default function CenseurDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord Pédagogique"
        subtitle="Supervision académique : émargement des enseignants, validation des notes et délibérations"
        breadcrumbs={[{ label: "Censeur" }, { label: "Tableau de bord" }]}
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Émargement du jour"
          value="45 / 48"
          subtitle="Profs présents ce matin"
          icon={<UserCheck className="w-6 h-6" />}
          variant="success"
        />
        <StatCard
          title="Notes en attente"
          value="8 classes"
          subtitle="Prêtes pour validation finale"
          icon={<BookOpenCheck className="w-6 h-6" />}
          variant="warning"
        />
        <StatCard
          title="Notes manquantes"
          value="12"
          subtitle="Alertes envoyées aux profs"
          icon={<AlertTriangle className="w-6 h-6" />}
          variant="danger"
        />
        <StatCard
          title="Moyenne générale école"
          value="13.4 / 20"
          subtitle="Semestre en cours"
          icon={<GraduationCap className="w-6 h-6" />}
          variant="info"
        />
      </div>

      {/* Quick shortcuts & Today's Attendance snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Émargement du jour (Derniers pointages)</h3>
              <p className="text-xs text-slate-500">Heures d&apos;arrivée et état de présence des enseignants</p>
            </div>
            <Link
              href="/censeur/emargement"
              className="text-xs font-semibold text-school-primary hover:underline"
            >
              Voir tout &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {MOCK_TEACHER_ATTENDANCES.map((att) => (
              <div key={att.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-slate-900">{att.teacherName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {att.subject} &middot; {att.className} &middot; {att.scheduledTime}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-600 hidden sm:inline">
                    {att.arrivalHour ? `Arrivé à ${att.arrivalHour}` : "-"}
                  </span>
                  <StatusBadge status={att.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Actions Censeur
          </h3>
          <div className="space-y-2.5">
            <Link
              href="/censeur/notes"
              className="flex items-center justify-between p-3.5 rounded-xl border border-school-200 bg-school-50/50 hover:bg-school-100/50 transition-colors touch-target"
            >
              <div>
                <span className="text-xs font-bold text-school-primary block">
                  Valider les notes des classes
                </span>
                <span className="text-[11px] text-slate-500">Verrouillage officiel pour bulletins</span>
              </div>
              <ArrowRight className="w-4 h-4 text-school-primary shrink-0" />
            </Link>

            <Link
              href="/censeur/alertes"
              className="flex items-center justify-between p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-100/40 transition-colors touch-target"
            >
              <div>
                <span className="text-xs font-bold text-rose-700 block">
                  Alertes notes non saisies
                </span>
                <span className="text-[11px] text-slate-500">Relancer les enseignants en retard</span>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-700 shrink-0" />
            </Link>

            <Link
              href="/censeur/emargement"
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors touch-target"
            >
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Fiche d&apos;émargement hebdomadaire
                </span>
                <span className="text-[11px] text-slate-500">Bilan des heures effectuées</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
