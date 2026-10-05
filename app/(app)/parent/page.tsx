"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Clock,
  CreditCard,
  Calendar,
  ArrowRight,
  GraduationCap,
  Download,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ChildSwitcher } from "@/components/school/ChildSwitcher";
import { formatFCFA, formatDate } from "@/lib/utils";
import { MOCK_STUDENTS, Student } from "@/lib/mock-data";

export default function ParentDashboardPage() {
  // Parent children (e.g. Koffi 3ème A and Amina 6ème B)
  const myChildren = [MOCK_STUDENTS[0], MOCK_STUDENTS[1]];
  const [selectedChild, setSelectedChild] = useState<Student>(myChildren[0]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord Parent"
        subtitle={`Bienvenue, ${selectedChild.parentName} &middot; Année 2026-2027`}
        breadcrumbs={[{ label: "Parent" }, { label: "Tableau de bord" }]}
      />

      {/* Child Switcher Component */}
      <ChildSwitcher
        childrenList={myChildren}
        selectedChildId={selectedChild.id}
        onSelectChild={setSelectedChild}
      />

      {/* Child Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-school-primary text-white font-bold text-lg flex items-center justify-center">
              {selectedChild.firstName.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {selectedChild.firstName} {selectedChild.lastName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Classe : <span className="font-semibold text-school-primary">{selectedChild.className}</span> &middot; Matricule : <span className="font-mono">{selectedChild.matricule}</span>
              </p>
            </div>
          </div>
          <StatusBadge status={selectedChild.tuitionStatus} size="md" />
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Moyenne</span>
            <span className="text-lg md:text-xl font-bold text-school-primary tabular-nums">
              {selectedChild.average} / 20
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Rang : {selectedChild.rank}e</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Absences</span>
            <span className="text-lg md:text-xl font-bold text-slate-800 tabular-nums">
              {selectedChild.absencesCount} heure(s)
            </span>
            <span className="text-[11px] text-emerald-600 block mt-0.5 font-medium">Assiduité 98%</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Scolarité payée</span>
            <span className="text-lg md:text-xl font-bold text-emerald-700 tabular-nums">
              {formatFCFA(selectedChild.paidTuition)}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">sur {formatFCFA(selectedChild.totalTuition)}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Solde restant</span>
            <span className="text-lg md:text-xl font-bold text-rose-700 tabular-nums">
              {formatFCFA(selectedChild.remainingTuition)}
            </span>
            {selectedChild.nextDueDate ? (
              <span className="text-[11px] text-amber-700 block mt-0.5 font-medium">
                Échéance : {formatDate(selectedChild.nextDueDate)}
              </span>
            ) : (
              <span className="text-[11px] text-emerald-600 block mt-0.5 font-medium">À jour</span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Quick Links to Child Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/parent/notes"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-school-accent transition-all flex flex-col justify-between group touch-target"
        >
          <div>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 w-fit mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-school-primary transition-colors">
              Notes &amp; Bulletins
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Consulter les notes par matière et télécharger les bulletins de notes
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-school-primary pt-3 border-t border-slate-100">
            <span>Voir les notes</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/parent/presences"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-school-accent transition-all flex flex-col justify-between group touch-target"
        >
          <div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 w-fit mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-school-primary transition-colors">
              Présences &amp; Retards
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Historique des appels en classe, retards et motifs d&apos;absences
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-school-primary pt-3 border-t border-slate-100">
            <span>Voir les présences</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/parent/scolarite"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-school-accent transition-all flex flex-col justify-between group touch-target"
        >
          <div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 w-fit mb-3">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-school-primary transition-colors">
              Scolarité &amp; Paiement
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Régler les tranches en ligne par Mobile Money et obtenir les reçus
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-school-primary pt-3 border-t border-slate-100">
            <span>Payer en ligne</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
