"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  ShieldAlert,
  FileQuestion,
  Scale,
  Calendar,
  Bell,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Eye,
  FileSpreadsheet,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useSurveillantStore } from "@/lib/surveillant-store";
import { useSubscriptionStore } from "@/lib/subscription-store";

export default function SurveillantDashboardPage() {
  const { stats, incidents, sanctions, slots, activities } = useSurveillantStore();
  const { activeSchool } = useSubscriptionStore();

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Surveillance Générale &amp; Vie Scolaire"
        subtitle={`Contrôle des présences, discipline, planning de surveillance et assiduité des élèves de ${activeSchool.name}`}
        breadcrumbs={[{ label: "Surveillant Général", href: "/surveillant" }, { label: "Tableau de bord" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/surveillant/presences"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-school-primary text-white font-semibold text-xs md:text-sm shadow-sm hover:bg-school-primary/90 transition touch-target"
            >
              <Clock className="w-4 h-4" />
              <span>Pointage du jour</span>
            </Link>
            <Link
              href="/surveillant/discipline"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs md:text-sm shadow-sm transition touch-target"
            >
              <ShieldAlert className="w-4 h-4 text-orange-600" />
              <span>Signaler un incident</span>
            </Link>
          </div>
        }
      />

      {/* Règle de fonctionnement & Séparation */}
      <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/70 border border-orange-200 text-xs text-orange-950 flex items-start gap-3.5 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold text-sm text-orange-950 block">
            Rôle du Surveillant Général &mdash; Discipline, Présences &amp; Vie Scolaire
          </strong>
          <p className="text-slate-600 leading-relaxed">
            Le Surveillant général veille à l&apos;ordre, à la ponctualité, à l&apos;appel des présences et à la discipline de l&apos;établissement.
            Conformément aux contrôles ECOGEST : <strong>les sanctions importantes (exclusions temporaires, retenues graves) sont soumises à la validation préalable de Monsieur le Directeur</strong>,
            afin de garantir l&apos;équité et le respect des droits des élèves.
          </p>
        </div>
      </div>

      {/* Cartes KPI du jour */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Élèves Présents */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">👥 Élèves présents</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.presentsCount}</p>
          <p className="text-[11px] text-slate-500">Pointés présents aujourd&apos;hui</p>
        </div>

        {/* Élèves Absents */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">❌ Élèves absents</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-600">{stats.absentsCount}</p>
          <p className="text-[11px] text-slate-500">
            {stats.pendingJustifications} en attente de justificatif
          </p>
        </div>

        {/* Retards */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">⏰ Retards du jour</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{stats.latenessCount}</p>
          <p className="text-[11px] text-slate-500">Entrées tardives enregistrées</p>
        </div>

        {/* Incidents Disciplinaires */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">🚨 Incidents en cours</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-orange-600">{stats.openIncidents}</p>
          <p className="text-[11px] text-slate-500">Dossiers ouverts ou sous suivi</p>
        </div>
      </div>

      {/* Deuxième rangée : Sanctions & Alertes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Sanctions actives */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900">{stats.activeSanctions}</span>
            <p className="text-[11px] text-slate-500">Sanctions en cours d&apos;exécution</p>
          </div>
        </div>

        {/* Validation Directeur requise */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900">{stats.pendingDirectorApprovals}</span>
            <p className="text-[11px] text-slate-500">Sanction(s) soumises au Directeur</p>
          </div>
        </div>

        {/* Surveillance active */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900">{slots.length}</span>
            <p className="text-[11px] text-slate-500">Postes de surveillance planifiés</p>
          </div>
        </div>

        {/* Activités planifiées */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900">{activities.length}</span>
            <p className="text-[11px] text-slate-500">Sorties &amp; Activités scolaires</p>
          </div>
        </div>
      </div>

      {/* Sections Incidents Récents & Surveillance du jour */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incidents Disciplinaires Récents */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Derniers incidents disciplinaires enregistrés
                </h3>
                <p className="text-xs text-slate-500">
                  Suivi des comportements et actions correctives
                </p>
              </div>
            </div>
            <Link
              href="/surveillant/discipline"
              className="text-xs font-bold text-school-primary hover:underline flex items-center gap-1"
            >
              <span>Tout voir</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {incidents.slice(0, 3).map((inc) => (
              <div
                key={inc.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">{inc.studentName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-700">
                      {inc.className}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      inc.status === "RESOLU"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {inc.status}
                  </span>
                </div>

                <p className="font-semibold text-rose-800">
                  Motif : {inc.incidentType}
                </p>
                <p className="text-slate-600 leading-relaxed">{inc.description}</p>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Sanction : <strong className="text-slate-800">{inc.sanction}</strong></span>
                  <span>Enregistré le {inc.date} par {inc.recordedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Planning de surveillance du jour & Activités */}
        <div className="space-y-6">
          {/* Postes de surveillance */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-school-primary" />
                <span>Postes de Surveillance</span>
              </h3>
              <Link href="/surveillant/surveillance" className="text-xs text-school-primary font-bold hover:underline">
                Planning
              </Link>
            </div>

            <div className="space-y-2.5">
              {slots.slice(0, 3).map((slot) => (
                <div key={slot.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Zone : {slot.zone}</span>
                    <span className="font-mono text-[10px] text-slate-500">{slot.timeSlot}</span>
                  </div>
                  <p className="text-slate-600 font-medium">Surveillant : {slot.surveillantName}</p>
                  {slot.notes && <p className="text-[10px] text-slate-400 italic">{slot.notes}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Alertes d'absences répétées */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-rose-600" />
                <span>Alertes d&apos;Assiduité</span>
              </h3>
              <Link href="/surveillant/rapports" className="text-xs text-school-primary font-bold hover:underline">
                Bilan
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              {stats.frequentAbsentees.length === 0 ? (
                <p className="text-slate-400 text-center py-4 text-xs">
                  Aucune absence répétée anormale constatée
                </p>
              ) : (
                stats.frequentAbsentees.slice(0, 2).map((item) => (
                  <div key={item.student.id} className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-rose-900 space-y-1">
                    <p className="font-bold">{item.student.lastName} {item.student.firstName} ({item.student.className})</p>
                    <p className="text-[11px] text-rose-700">
                      <strong>{item.count} absences constatées</strong> sans régularisation
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
