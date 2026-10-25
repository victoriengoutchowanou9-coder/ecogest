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
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatFCFA } from "@/lib/utils";
import { useSubscriptionStore } from "@/lib/subscription-store";
import { useFinanceStore } from "@/lib/finance-store";
import { useBulletinStore } from "@/lib/bulletin-store";
import { useCenseurStore } from "@/lib/censeur-store";

export default function DirecteurDashboardPage() {
  const {
    schoolStatus,
    schoolPlanDef,
    schoolExpiresAt,
    isTrialActive,
    trialDaysRemaining,
    isExpired,
  } = useSubscriptionStore();

  const { getFinancialStats } = useFinanceStore();
  const { students } = useBulletinStore();
  const { teacherAccounts } = useCenseurStore();

  const financialSummary = getFinancialStats({ academicYearId: "2026-2027" });
  const enrolledStudentsCount = students.length;
  const activeTeachersCount = teacherAccounts.length;

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

      {/* Bannière Période d'essai 1 mois gratuit Starter */}
      {schoolStatus === "TRIAL" && !isExpired && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-slate-900 text-sm">
                  Formule Starter — 1 Mois d&apos;Essai Gratuit Actif
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {trialDaysRemaining} jour{trialDaysRemaining > 1 ? "s" : ""} restant{trialDaysRemaining > 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Votre établissement bénéficie de l&apos;accès complet aux fonctionnalités essentielles de gestion scolaire jusqu&apos;au <strong>{schoolExpiresAt}</strong>.
              </p>
            </div>
          </div>
          <Link
            href="/directeur/abonnement"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 transition shrink-0"
          >
            <span>Voir les formules &amp; options</span>
            <ArrowRight className="w-3.5 h-3.5 text-school-primary" />
          </Link>
        </div>
      )}

      {/* Bannière Expiration Période d'essai */}
      {isExpired && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="space-y-1">
              <span className="font-extrabold text-rose-950 text-sm">
                Période d&apos;essai gratuit Starter expirée
              </span>
              <p className="text-xs text-rose-800 leading-relaxed">
                Votre période d&apos;essai gratuit de 1 mois est arrivée à échéance le <strong>{schoolExpiresAt}</strong>. Veuillez choisir une formule pour continuer à utiliser toutes les fonctionnalités sans interruption.
              </p>
            </div>
          </div>
          <Link
            href="/directeur/abonnement"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-sm transition shrink-0"
          >
            <span>Choisir une formule payante</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Élèves inscrits"
          value={enrolledStudentsCount}
          subtitle={enrolledStudentsCount > 0 ? "Toutes classes confondues" : "Aucun élève enregistré"}
          icon={<GraduationCap className="w-6 h-6" />}
          variant="info"
        />
        <StatCard
          title="Taux de recouvrement"
          value={`${financialSummary.collectionRate} %`}
          subtitle={formatFCFA(financialSummary.totalTuitionCollected)}
          icon={<DollarSign className="w-6 h-6" />}
          variant="success"
        />
        <StatCard
          title="Enseignants actifs"
          value={activeTeachersCount}
          subtitle={activeTeachersCount > 0 ? "Effectif du personnel" : "Aucun enseignant créé"}
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
                {formatFCFA(financialSummary.totalTuitionExpected)}
              </span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase block">Encaissé</span>
              <span className="text-sm md:text-base font-bold text-emerald-700 tabular-nums">
                {formatFCFA(financialSummary.totalTuitionCollected)}
              </span>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl">
              <span className="text-[11px] font-semibold text-rose-700 uppercase block">Reste à recouvrer</span>
              <span className="text-sm md:text-base font-bold text-rose-700 tabular-nums">
                {formatFCFA(financialSummary.totalTuitionRemaining)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <span>Taux d&apos;encaissement global</span>
              <span className="font-bold text-emerald-700">{financialSummary.collectionRate}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all"
                style={{ width: `${Math.min(100, financialSummary.collectionRate)}%` }}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/comptabilite"
              prefetch={false}
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
              href="/censeur"
              prefetch={false}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-school-accent hover:bg-school-50/50 transition-colors touch-target"
            >
              <div className="flex items-center gap-2.5">
                <BookOpenCheck className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-slate-800">Espace Censeur des Études</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/directeur/classes"
              prefetch={false}
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
              prefetch={false}
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
              prefetch={false}
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
              prefetch={false}
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
