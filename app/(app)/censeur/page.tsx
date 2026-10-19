"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpenCheck,
  UserCheck,
  AlertTriangle,
  GraduationCap,
  Clock,
  ArrowRight,
  CheckCircle2,
  Users,
  CalendarDays,
  CheckSquare,
  MessageSquare,
  DollarSign,
  ShieldAlert,
  Inbox,
  FileText,
  BadgeAlert,
  BookOpen,
  MapPin,
  Sparkles,
  FileSpreadsheet,
  UserCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MOCK_TEACHER_ATTENDANCES } from "@/lib/mock-data";
import { useCenseurStore } from "@/lib/censeur-store";
import { useFinanceStore } from "@/lib/finance-store";

export default function CenseurDashboardPage() {
  const {
    attendanceItems,
    homeworkPrograms,
    parentMessages,
    schedules,
    studentsList,
    subjectsList,
    teacherAccounts,
    parentAccessRequests,
  } = useCenseurStore();

  const { students: financeStudents } = useFinanceStore();

  // Computations for Censeur Priority Indicators
  const unreadMessagesCount = useMemo(
    () => parentMessages.filter((m) => m.status === "NON_LU").length,
    [parentMessages]
  );

  const pendingAttendanceCount = useMemo(
    () => attendanceItems.filter((a) => !a.isConfirmedByCenseur).length,
    [attendanceItems]
  );

  const lateTuitionCount = useMemo(
    () => financeStudents.filter((s) => s.tuitionStatus === "LATE").length,
    [financeStudents]
  );

  const upcomingHomeworkCount = useMemo(
    () => homeworkPrograms.filter((h) => h.status === "PROGRAMME").length,
    [homeworkPrograms]
  );

  const pendingParentRequestsCount = useMemo(
    () => parentAccessRequests.filter((r) => r.status === "EN_ATTENTE").length,
    [parentAccessRequests]
  );

  // Today's schedule snapshot
  const todaySchedules = useMemo(() => {
    const dayNames = [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ];
    const todayName = dayNames[new Date().getDay()];
    const todayItems = schedules.filter((s) => s.dayOfWeek === todayName);
    return todayItems.length > 0 ? todayItems : schedules.slice(0, 4);
  }, [schedules]);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Tableau de bord — Censeur des Études"
        subtitle="Supervision académique, organisation des cours, respect des horaires et suivi pédagogique"
        breadcrumbs={[{ label: "Censeur" }, { label: "Tableau de bord" }]}
      />

      {/* Role Reminder Header */}
      <div className="bg-gradient-to-r from-school-900 via-school-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-school-100 backdrop-blur-sm border border-white/20">
            <GraduationCap className="w-3.5 h-3.5" />
            Direction Pédagogique & Vie Scolaire
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Supervision académique de l&apos;Établissement
          </h2>
          <p className="text-xs md:text-sm text-school-100/90 leading-relaxed">
            Vous assurez l&apos;encadrement du jour, l&apos;organisation des cours, la validation souveraine
            des pointages, le calendrier des devoirs surveillés et le traitement sécurisé des demandes des parents.
          </p>
        </div>
      </div>

      {/* 
        LES 4 CARTES PRINCIPALES DU CENSEUR (Points 7, 8, 9, 10, 11, 12, 13)
        Style rigoureusement identique au système d'encadrement des cartes de Direction Pédagogique
      */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Activités Pédagogiques & Encadrement du Jour
          </h3>
          <span className="text-xs text-slate-500 font-medium">Accès interactifs prioritaires</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CARTE 1 : ENCADREMENT DU JOUR */}
          <Link
            href="/censeur/activites"
            className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-school-300 hover:shadow-md transition-all duration-200 active:scale-[0.98] flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Aujourd&apos;hui
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                ENCADREMENT DU JOUR
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                {todaySchedules.length} cours programmés, professeurs en salle et activités pédagogiques.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-school-primary">
              <span className="font-bold text-slate-900">{todaySchedules.length} séances prévues</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* CARTE 2 : POINTAGE À VALIDER */}
          <Link
            href="/censeur/presences"
            className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-amber-300 hover:shadow-md transition-all duration-200 active:scale-[0.98] flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CheckSquare className="w-5 h-5" />
                </div>
                {pendingAttendanceCount > 0 ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                    À valider
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    À jour
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                POINTAGE À VALIDER
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Vérification des appels, retards, absences justifiées et régularisations.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-school-primary">
              <span className="font-bold text-amber-700">{pendingAttendanceCount} pointages en attente</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* CARTE 3 : MESSAGES PARENTS NON LUS */}
          <Link
            href="/censeur/messages"
            className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-rose-300 hover:shadow-md transition-all duration-200 active:scale-[0.98] flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                {unreadMessagesCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 animate-pulse">
                    Nouveau
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                MESSAGES PARENTS NON LUS
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Demandes d&apos;absence des familles, requêtes académiques et réponses officielles.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-school-primary">
              <span className="font-bold text-rose-700">
                {unreadMessagesCount > 0 ? `${unreadMessagesCount} non lus` : "Aucun message non lu"}
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* CARTE 4 : DEVOIRS & TD À PROGRAMMER */}
          <Link
            href="/censeur/activites"
            className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all duration-200 active:scale-[0.98] flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Planning
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                DEVOIRS & TD
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Programmation des Devoirs Surveillés (DS), TD, salles et consignes d&apos;examen.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-school-primary">
              <span className="font-bold text-emerald-700">{upcomingHomeworkCount} sessions à venir</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* SECTION 8 : ENCADREMENT DU JOUR (Détail des activités du jour) */}
      <div id="encadrement-du-jour" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-school-primary" />
              <span>Encadrement Pédagogique du Jour (Planning des cours & encadrement)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Surveillance des cours dispensés aujourd&apos;hui, enseignants en salle et créneaux horaires
            </p>
          </div>
          <Link
            href="/censeur/enseignants"
            className="text-xs font-bold text-school-primary hover:underline flex items-center gap-1"
          >
            <span>Voir l&apos;emploi du temps complet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {todaySchedules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {todaySchedules.map((sch) => (
              <Link
                key={sch.id}
                href="/censeur/enseignants"
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-school-300 hover:bg-school-50/20 transition-all space-y-2 text-xs group block"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 group-hover:border-school-300">
                    {sch.className}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-slate-600">{sch.timeSlot}</span>
                </div>
                <div>
                  <h4 className="font-bold text-school-primary group-hover:underline">{sch.subjectName}</h4>
                  <p className="text-slate-600 text-[11px] mt-0.5">{sch.teacherName}</p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {sch.room}
                  </span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <span>En cours</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">Aucune séance planifiée pour le moment</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Consultez ou enrichissez l&apos;emploi du temps complet pour programmer des cours.</p>
          </div>
        )}
      </div>

      {/* Navigation Quick Access Grid — Modules Censeur */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          Modules de Direction Pédagogique
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* 1. Matières & Coefficients */}
          <Link
            href="/censeur/matieres"
            className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-school-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                Matières & Coefficients
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Enregistrement des matières, attribution aux classes et coefficients synchronisés.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-school-primary">
              <span>{subjectsList.length} matières configurées</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. Enseignants & Horaires */}
          <Link
            href="/censeur/enseignants"
            className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-school-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                Enseignants & Horaires
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Création des comptes enseignants, affectations et emplois du temps hebdomadaires.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-school-primary">
              <span>{teacherAccounts.length} enseignants</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. Élèves & Affectations */}
          <Link
            href="/censeur/eleves"
            className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-school-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                Élèves & Affectations
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Dossiers scolaires, réaffectation de classe avec traçabilité et historique.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-school-primary">
              <span>{studentsList.length} élèves inscrits</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 4. Demandes d'accès parents */}
          <Link
            href="/censeur/demandes-parents"
            className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-school-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserCheck className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                Demandes d&apos;accès parents
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Validation d&apos;identité et activation sécurisée des accès parents aux enfants.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-school-primary">
              <span className={pendingParentRequestsCount > 0 ? "text-amber-700 font-bold" : ""}>
                {pendingParentRequestsCount > 0 ? `${pendingParentRequestsCount} en attente` : "À jour"}
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 5. Notes & Délibérations */}
          <Link
            href="/censeur/notes"
            className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-school-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpenCheck className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                Notes & Délibérations
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Contrôle des notes trimestrielles, délibérations et verrouillage officiel.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-school-primary">
              <span>Valider les notes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 6. Examens & Calendrier */}
          <Link
            href="/censeur/examens"
            className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-school-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                Examens & Calendrier
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Planification des épreuves officielles, sessions d&apos;examens et calendrier.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-school-primary">
              <span>Planifier & Publier</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 7. Registre de classe officiel */}
          <Link
            href="/censeur/registre"
            className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-school-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                Registre de classe
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Registre officiel d&apos;appel et d&apos;identification téléchargeable en PDF A4.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-school-primary">
              <span>Générer en PDF</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 8. Discipline & Incidents */}
          <Link
            href="/censeur/discipline"
            className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-school-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                Discipline & Incidents
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Enregistrement des manquements disciplinaires, sanctions et historique.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-school-primary">
              <span>Suivi disciplinaire</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 9. Cours, Devoirs & TD */}
          <Link
            href="/censeur/activites"
            className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-school-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                Cours, Devoirs & TD
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Programmation des devoirs surveillés (DS), TD, salles et directives.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-school-primary">
              <span>{upcomingHomeworkCount} sessions prévues</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 10. Pointage & Présences */}
          <Link
            href="/censeur/presences"
            className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-school-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                Pointage & Présences
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Contrôle des présences élèves, régularisation et audit de pointage quotidien.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-school-primary">
              <span className={pendingAttendanceCount > 0 ? "text-amber-700 font-bold" : ""}>
                {pendingAttendanceCount > 0 ? `${pendingAttendanceCount} à valider` : "Tout validé"}
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 11. Messages des Parents */}
          <Link
            href="/censeur/messages"
            className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-school-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                Messages des Parents
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Consultation des messages parents, demandes d&apos;absence et réponses directes.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-school-primary">
              <span className={unreadMessagesCount > 0 ? "text-rose-600 font-bold" : ""}>
                {unreadMessagesCount > 0 ? `${unreadMessagesCount} non lus` : "À jour"}
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 12. Suivi des contributions */}
          <Link
            href="/censeur/contributions"
            className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-school-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                Suivi des contributions
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Alertes de scolarité pour l&apos;accès aux examens et convocations parents.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-school-primary">
              <span className="font-bold text-amber-700">{lateTuitionCount} élèves en retard</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 13. Émargement Enseignants */}
          <Link
            href="/censeur/emargement"
            className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-school-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserCheck className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                Émargement Enseignants
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Fiches d&apos;émargement hebdomadaire et respect des horaires de cours.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-school-primary">
              <span>Consulter</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 14. Alertes Pédagogiques */}
          <Link
            href="/censeur/alertes"
            className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-school-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BadgeAlert className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                Alertes Pédagogiques
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Notes manquantes, retards de saisie et relance automatique des professeurs.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-school-primary">
              <span>Voir les alertes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 15. Mon Profil & Compte */}
          <Link
            href="/censeur/profil"
            className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-school-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserCircle className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                Mon Profil & Compte
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Coordonnées professionnelles, sécurité du compte et mot de passe.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-school-primary">
              <span>Gérer mon compte</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Snapshot Section: Émargement du jour & Priorités */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Émargement du jour (Pointages enseignants)
              </h3>
              <p className="text-xs text-slate-500">Heures d&apos;arrivée et état de présence</p>
            </div>
            <Link
              href="/censeur/emargement"
              className="text-xs font-semibold text-school-primary hover:underline flex items-center gap-1"
            >
              Voir tout &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {MOCK_TEACHER_ATTENDANCES.slice(0, 4).map((att) => (
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

        {/* Action / Urgent Alerts Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <BadgeAlert className="w-4 h-4 text-amber-600" />
              Priorités Administratives
            </h3>

            <div className="space-y-2.5">
              {pendingParentRequestsCount > 0 && (
                <Link
                  href="/censeur/demandes-parents"
                  className="flex items-center justify-between p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 transition"
                >
                  <div>
                    <span className="text-xs font-bold text-amber-800 block">
                      {pendingParentRequestsCount} demande(s) parent à valider
                    </span>
                    <span className="text-[11px] text-slate-500">Vérifier identité élève</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
                </Link>
              )}

              {unreadMessagesCount > 0 && (
                <Link
                  href="/censeur/messages"
                  className="flex items-center justify-between p-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 transition"
                >
                  <div>
                    <span className="text-xs font-bold text-rose-800 block">
                      {unreadMessagesCount} message(s) non lus
                    </span>
                    <span className="text-[11px] text-slate-500">Demandes d&apos;absence</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-rose-600 shrink-0" />
                </Link>
              )}

              {lateTuitionCount > 0 && (
                <Link
                  href="/censeur/contributions"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 transition"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {lateTuitionCount} élèves en retard de frais
                    </span>
                    <span className="text-[11px] text-slate-500">Suivi des autorisations d&apos;examen</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                </Link>
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Données pédagogiques unifiées et synchronisées en direct.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
