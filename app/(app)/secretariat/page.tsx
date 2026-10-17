"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  FileText,
  UserPlus,
  ArrowRightLeft,
  UserMinus,
  School,
  AlertTriangle,
  Clock,
  Printer,
  CalendarDays,
  Shield,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Mail,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useSecretariatStore } from "@/lib/secretariat-store";
import { useSubscriptionStore } from "@/lib/subscription-store";

export default function SecretariatDashboardPage() {
  const { stats, students, classrooms, documents, events } = useSecretariatStore();
  const { activeSchool } = useSubscriptionStore();

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Secrétariat Pédagogique &amp; Administratif"
        subtitle={`Gestion des dossiers scolaires, inscriptions, certificats officiels et effectifs de ${activeSchool.name}`}
        breadcrumbs={[{ label: "Secrétariat", href: "/secretariat" }, { label: "Tableau de bord" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/secretariat/eleves"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-school-primary text-white font-semibold text-xs md:text-sm shadow-sm hover:bg-school-primary/90 transition touch-target"
            >
              <UserPlus className="w-4 h-4" />
              <span>Inscrire un élève</span>
            </Link>
            <Link
              href="/secretariat/documents"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs md:text-sm shadow-sm transition touch-target"
            >
              <FileText className="w-4 h-4 text-school-primary" />
              <span>Générer un document</span>
            </Link>
          </div>
        }
      />

      {/* Règle de séparation des responsabilités */}
      <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs text-teal-950 flex items-start gap-3.5 shadow-xs">
        <Shield className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold text-sm text-teal-950 block">
            Rôle du Secrétariat Pédagogique &mdash; Séparation des Responsabilités
          </strong>
          <p className="text-slate-600 leading-relaxed">
            Le Secrétariat s&apos;occupe de la gestion administrative des élèves, des inscriptions, des transferts, des attestations et de la communication avec les familles.
            Conformément aux règles de contrôle d&apos;ECOGEST : <strong>la création des classes et des matières appartient au Directeur et au Censeur</strong>,
            et <strong>les notes validées par le corps enseignant ne peuvent pas être modifiées</strong> par le secrétariat.
          </p>
        </div>
      </div>

      {/* Cartes KPI Principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Inscrits */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Élèves inscrits</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalEnrolled}</span>
            <span className="text-xs font-semibold text-emerald-600">({stats.activeStudents} actifs)</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {stats.boysCount} Garçons &bull; {stats.girlsCount} Filles
          </p>
        </div>

        {/* Nouveaux Élèves */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Nouveaux élèves</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.newStudents}</span>
            <span className="text-xs text-slate-500 font-medium">Session 2026</span>
          </div>
          <p className="text-[11px] text-slate-500">Inscriptions enregistrées au secrétariat</p>
        </div>

        {/* Élèves Transférés */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Élèves transférés</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.transferredStudents}</span>
            <span className="text-xs text-slate-500 font-medium">Certificats émis</span>
          </div>
          <p className="text-[11px] text-slate-500">Départs avec certificat de radiation</p>
        </div>

        {/* Documents à traiter / émis */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Documents officiels</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.pendingDocuments}</span>
            <span className="text-xs text-slate-500 font-medium">Certificats &amp; Fiches</span>
          </div>
          <p className="text-[11px] text-slate-500">Émis et certifiés cette année</p>
        </div>
      </div>

      {/* Effectifs par classe & Alertes administratives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Effectifs par classe */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <School className="w-5 h-5 text-school-primary" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Effectifs par classe (Base de données partagée)
                </h3>
                <p className="text-xs text-slate-500">
                  Classes créées par la Direction &bull; Consultation et listes officielles
                </p>
              </div>
            </div>
            <Link
              href="/secretariat/classes"
              className="text-xs font-bold text-school-primary hover:underline flex items-center gap-1"
            >
              <span>Voir les listes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {classrooms.map((c) => {
              const classStat = stats.byClass[c.id] || { total: 0, boys: 0, girls: 0, name: c.name };
              const ratio = c.size > 0 ? Math.min(100, Math.round((classStat.total / c.size) * 100)) : 0;

              return (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{c.name}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white border border-slate-200 text-slate-700">
                        {c.cycle}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Professeur titulaire : <strong>{c.mainTeacher || "Non assigné"}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="font-black text-slate-900 text-sm">
                        {classStat.total} <span className="text-[11px] font-normal text-slate-500">/ {c.size} places</span>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {classStat.boys} G &bull; {classStat.girls} F
                      </p>
                    </div>

                    <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden hidden sm:block">
                      <div
                        className="bg-school-primary h-2 rounded-full"
                        style={{ width: `${Math.max(5, ratio)}%` }}
                      />
                    </div>

                    <Link
                      href={`/secretariat/classes?classId=${c.id}`}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 font-bold hover:bg-slate-100 transition shadow-2xs"
                    >
                      Liste PDF
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alertes administratives & Agenda */}
        <div className="space-y-6">
          {/* Documents récents */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Derniers documents émis</span>
              </h3>
              <Link href="/secretariat/documents" className="text-xs text-school-primary font-bold hover:underline">
                Tous
              </Link>
            </div>

            <div className="space-y-2.5">
              {documents.slice(0, 3).map((d) => (
                <div key={d.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{d.title}</span>
                    <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {d.referenceNumber}
                    </span>
                  </div>
                  <p className="text-slate-600 truncate">{d.studentName} &bull; {d.className}</p>
                  <p className="text-[10px] text-slate-400">Délivré le {d.issueDate} par {d.issuedBy}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Agenda & Événements */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-school-primary" />
                <span>Événements à venir</span>
              </h3>
              <Link href="/secretariat/agenda" className="text-xs text-school-primary font-bold hover:underline">
                Agenda
              </Link>
            </div>

            <div className="space-y-2.5">
              {events.slice(0, 2).map((evt) => (
                <div key={evt.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-900 block">{evt.title}</span>
                  <p className="text-[11px] text-slate-500">
                    Date : <strong>{evt.date}</strong> {evt.time ? `à ${evt.time}` : ""} &bull; {evt.location}
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                    Public : {evt.targetAudience}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
