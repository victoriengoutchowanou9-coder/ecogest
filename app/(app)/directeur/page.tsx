"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  DollarSign,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Settings,
  BookOpenCheck,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatFCFA } from "@/lib/utils";
import { MOCK_FINANCIAL_STATS, MOCK_STUDENTS } from "@/lib/mock-data";

export default function DirecteurDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord de Direction"
        subtitle="Vue globale sur les effectifs, finances, assiduité et alertes de l'établissement"
        breadcrumbs={[{ label: "Directeur" }, { label: "Tableau de bord" }]}
        actions={
          <Link
            href="/directeur/parametres"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 touch-target"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Paramètres</span>
          </Link>
        }
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Élèves inscrits"
          value={MOCK_FINANCIAL_STATS.studentsCount}
          subtitle="Toutes classes confondues"
          icon={<GraduationCap className="w-6 h-6" />}
          variant="info"
        />
        <StatCard
          title="Taux de recouvrement"
          value={`${MOCK_FINANCIAL_STATS.collectionRate} %`}
          subtitle={formatFCFA(MOCK_FINANCIAL_STATS.totalCollected)}
          icon={<DollarSign className="w-6 h-6" />}
          variant="success"
        />
        <StatCard
          title="Enseignants actifs"
          value="0"
          subtitle="Effectif du personnel"
          icon={<Users className="w-6 h-6" />}
          variant="default"
        />
        <StatCard
          title="Assiduité globale"
          value="—"
          subtitle="Taux moyen de présence"
          icon={<CheckSquare className="w-6 h-6" />}
          variant="default"
        />
      </div>

      {/* Critical Alerts Banner Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
          <BookOpenCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>État du système &amp; Alertes</span>
        </div>
        <p className="text-xs text-slate-500">
          Aucune alerte critique enregistrée pour le moment. Le système fonctionne normalement.
        </p>
      </div>

      {/* Grid: Recouvrement overview & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bilan financier synthétique</h3>
              <p className="text-xs text-slate-500">Répartition des frais de scolarité</p>
            </div>
            <span className="text-xs font-bold text-school-primary bg-school-50 px-2 py-1 rounded">
              Année 2026-2027
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Attendu</span>
              <span className="text-sm md:text-base font-bold text-slate-800 tabular-nums">
                {formatFCFA(MOCK_FINANCIAL_STATS.totalExpected)}
              </span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase block">Encaissé</span>
              <span className="text-sm md:text-base font-bold text-emerald-700 tabular-nums">
                {formatFCFA(MOCK_FINANCIAL_STATS.totalCollected)}
              </span>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl">
              <span className="text-[11px] font-semibold text-rose-700 uppercase block">Reste à recouvrer</span>
              <span className="text-sm md:text-base font-bold text-rose-700 tabular-nums">
                {formatFCFA(MOCK_FINANCIAL_STATS.totalRemaining)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <span>Taux d&apos;encaissement global</span>
              <span className="font-bold text-emerald-700">{MOCK_FINANCIAL_STATS.collectionRate}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all"
                style={{ width: `${MOCK_FINANCIAL_STATS.collectionRate}%` }}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/comptabilite"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-school-primary hover:underline"
            >
              <span>Accéder à la comptabilité complète</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Administration rapide
          </h3>

          <div className="space-y-2">
            <Link
              href="/directeur/classes"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-school-accent hover:bg-school-50/50 transition-colors touch-target"
            >
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-school-primary" />
                <span className="text-xs font-semibold text-slate-800">Classes &amp; Matières</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/directeur/utilisateurs"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-school-accent hover:bg-school-50/50 transition-colors touch-target"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-school-primary" />
                <span className="text-xs font-semibold text-slate-800">Comptes Utilisateurs</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/directeur/publications"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-school-accent hover:bg-school-50/50 transition-colors touch-target"
            >
              <div className="flex items-center gap-2.5">
                <BookOpenCheck className="w-4 h-4 text-school-primary" />
                <span className="text-xs font-semibold text-slate-800">Publication des examens</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/directeur/audit"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-school-accent hover:bg-school-50/50 transition-colors touch-target"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-school-primary" />
                <span className="text-xs font-semibold text-slate-800">Journal d&apos;audit sécurité</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
