"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Clock,
  CreditCard,
  Calendar,
  CalendarDays,
  ArrowRight,
  GraduationCap,
  Download,
  AlertCircle,
  Bell,
  MessageSquare,
  Printer,
  Sparkles,
  BookOpen,
  FileCheck,
  CheckCircle2,
  User,
  AlertTriangle,
  UserCircle,
  Megaphone,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCommunicationStore } from "@/lib/communication-store";
import { ChildSwitcher } from "@/components/school/ChildSwitcher";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatFCFA, formatDate } from "@/lib/utils";
import { Student } from "@/lib/mock-data";
import {
  MOCK_HOMEWORK_ITEMS,
  MOCK_UPCOMING_EVALUATIONS,
  MOCK_ABSENCE_RECORDS,
} from "@/lib/mock-bulletin-db";
import { useCenseurStore } from "@/lib/censeur-store";
import { useAuthStore } from "@/lib/auth-store";
import { StudentProfile } from "@/lib/types/bulletin";
import { useSubscriptionStore } from "@/lib/subscription-store";
import { Plus, Search, ShieldCheck, X } from "lucide-react";

export default function ParentDashboardPage() {
  const { user: currentUser } = useAuthStore();
  const { studentsList, parentAccessRequests, submitParentAccessRequest } = useCenseurStore();

  const parentPhone = currentUser?.phone || "";
  const parentEmail = currentUser?.email || "";
  const parentId = currentUser?.id || "";
  const parentIdent = currentUser?.identifier || "";

  // Initial base children + any children whose access has been validated and activated by Censeur
  const myChildren = React.useMemo(() => {
    const list: Student[] = [];
    const activatedRequests = parentAccessRequests.filter(
      (r) =>
        (r.parentPhone === parentPhone ||
          r.parentEmail === parentEmail ||
          r.parentId === parentId ||
          r.parentId === parentIdent) &&
        r.status === "ACCEPTEE" &&
        r.isAccessActivated
    );

    activatedRequests.forEach((req) => {
      if (!list.some((c) => c.id === req.studentId)) {
        const full = studentsList.find((s) => s.id === req.studentId);
        if (full) {
          list.push({
            id: full.id,
            matricule: full.matricule,
            firstName: full.firstName,
            lastName: full.lastName,
            classId: full.classId,
            className: full.className,
            gender: full.gender,
            birthDate: full.birthDate,
            parentName: full.parentName,
            parentPhone: full.parentPhone,
            status: "INSCRIT",
            average: 0,
            rank: 0,
            absencesCount: 0,
            totalTuition: 0,
            paidTuition: 0,
            remainingTuition: 0,
            tuitionStatus: "PAID",
          });
        }
      }
    });

    return list;
  }, [parentAccessRequests, studentsList, parentPhone, parentEmail, parentId, parentIdent]);

  const [selectedChild, setSelectedChild] = useState<Student | undefined>(undefined);

  // If selected child is not in list anymore, fallback to first
  React.useEffect(() => {
    if (myChildren.length > 0) {
      if (!selectedChild || !myChildren.some((c) => c.id === selectedChild.id)) {
        setSelectedChild(myChildren[0]);
      }
    } else {
      setSelectedChild(undefined);
    }
  }, [myChildren, selectedChild]);

  const { announcements, markAnnouncementRead } = useCommunicationStore();

  const parentAnnouncements = React.useMemo(() => {
    return announcements.filter((a) => {
      if (a.targetAudience === "ALL" || a.targetAudience === "PARENTS") return true;
      if (selectedChild) {
        if (a.targetAudience === "CLASS" || a.targetAudience === "PARENTS_CLASS") {
          return (
            a.targetClassId === selectedChild.classId ||
            (Boolean(a.targetClassName) && Boolean(selectedChild.className) && a.targetClassName?.toLowerCase() === selectedChild.className.toLowerCase())
          );
        }
      }
      return false;
    });
  }, [announcements, selectedChild]);

  // Subscription store integration
  const { canParentAddChild, parentPlanDef, parentPlan } = useSubscriptionStore();
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");

  // Request Access Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedStudent, setSearchedStudent] = useState<StudentProfile | null>(null);
  const [searchError, setSearchError] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  // Filter homework and evaluations for selected child
  const childHomework = selectedChild ? MOCK_HOMEWORK_ITEMS.filter((h) => h.childId === selectedChild.id) : [];
  const childEvaluations = selectedChild ? MOCK_UPCOMING_EVALUATIONS.filter((e) => e.childId === selectedChild.id) : [];
  const childAbsences = selectedChild ? MOCK_ABSENCE_RECORDS.filter((a) => a.childId === selectedChild.id) : [];

  // Check pending requests for this parent
  const pendingRequests = parentAccessRequests.filter(
    (r) =>
      (r.parentPhone === parentPhone ||
        r.parentEmail === parentEmail ||
        r.parentId === parentId ||
        r.parentId === parentIdent) &&
      r.status === "EN_ATTENTE"
  );

  const handleSearchStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    setSearchedStudent(null);
    setRequestSent(false);

    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchError("Veuillez saisir le matricule ou le numéro Educ Master de l'élève.");
      return;
    }

    const found = studentsList.find(
      (s) =>
        s.matricule.toLowerCase() === q ||
        s.educMasterNumber.toLowerCase() === q ||
        s.id.toLowerCase() === q
    );

    if (found) {
      setSearchedStudent(found);
    } else {
      setSearchError(
        "Aucun élève trouvé avec cet identifiant. Vérifiez le matricule ou l'Educ Master sur la fiche d'inscription."
      );
    }
  };

  const handleSendRequest = () => {
    if (!searchedStudent) return;

    submitParentAccessRequest({
      parentId: currentUser?.identifier || currentUser?.id || "parent",
      parentName: currentUser?.fullName || "Parent d'élève",
      parentPhone: currentUser?.phone || "",
      parentEmail: currentUser?.email || "",
      studentId: searchedStudent.id,
      studentName: `${searchedStudent.lastName} ${searchedStudent.firstName}`,
      matricule: searchedStudent.matricule,
      className: searchedStudent.className,
      academicYear: "2026 - 2027",
    });

    setRequestSent(true);
  };

  const handleOpenRequestModal = () => {
    const check = canParentAddChild(myChildren.length);
    if (!check.allowed) {
      setLimitMessage(check.reason || "Limite d'enfants atteinte.");
      setIsLimitModalOpen(true);
      return;
    }
    setIsRequestModalOpen(true);
    setSearchQuery("");
    setSearchedStudent(null);
    setSearchError("");
    setRequestSent(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parent"
        subtitle="Suivi de la scolarité, des évaluations et de la vie scolaire de vos enfants"
        breadcrumbs={[{ label: "Parent" }, { label: "Accueil" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenRequestModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-school-primary text-white hover:bg-school-primary/90 text-xs font-bold shadow-2xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Demander l&apos;accès à un enfant</span>
            </button>
            <Link
              href="/parent/profil"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-colors"
            >
              <UserCircle className="w-4 h-4 text-school-primary" />
              <span>Mon Profil Parent</span>
            </Link>
          </div>
        }
      />

      {/* Pending Requests Alert Banner */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 flex items-start gap-3.5 text-amber-900 text-xs shadow-xs">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-0.5">
            <p className="font-bold text-amber-950">
              Demande d&apos;accès en cours de traitement par le Censeur :
            </p>
            <p className="text-amber-800 leading-relaxed">
              Votre demande pour{" "}
              <strong>{pendingRequests.map((r) => r.studentName).join(", ")}</strong> ({pendingRequests[0].className}) a bien été
              transmise. Les données scolaires seront affichées dès validation par la direction des études.
            </p>
          </div>
        </div>
      )}

      {!selectedChild ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">Aucun élève actuellement rattaché</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pour accéder aux bulletins officiels, notes, devoirs, assiduité et scolarité, veuillez rattacher votre enfant avec son matricule officiel ou son numéro Educ Master.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenRequestModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-school-primary hover:bg-school-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Demander l&apos;accès à un enfant</span>
          </button>
        </div>
      ) : (
        <>
          {/* Child Switcher Component (Mes enfants) */}
          <ChildSwitcher
            childrenList={myChildren}
            selectedChildId={selectedChild.id}
            onSelectChild={setSelectedChild}
          />

          {/* Annonces officielles de la Direction destinées aux parents */}
          {parentAnnouncements.length > 0 && (
            <div className="bg-gradient-to-r from-school-50/80 via-white to-sky-50/50 rounded-2xl border border-school-200 p-4 md:p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-school-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-school-primary" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Avis &amp; Communications Officielles de l&apos;Établissement
                  </h3>
                </div>
                <Link
                  href="/parent/notifications"
                  className="text-xs font-bold text-school-primary hover:underline"
                >
                  Toutes les alertes &rarr;
                </Link>
              </div>

              <div className="space-y-2.5">
                {parentAnnouncements.slice(0, 3).map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {ann.priority === "URGENT" && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200">
                            Urgent
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-slate-900">{ann.title}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ann.publishedAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {ann.content}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                      <span>Émis par : <strong className="text-slate-700">{ann.authorName}</strong></span>
                      {!ann.isRead && (
                        <button
                          type="button"
                          onClick={() => markAnnouncementRead(ann.id)}
                          className="font-bold text-school-primary hover:underline text-[11px]"
                        >
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
          <div className="flex items-center gap-2">
            <StatusBadge status={selectedChild.tuitionStatus} size="md" />
            <Link
              href="/parent/notes"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-school-50 text-school-primary hover:bg-school-100 text-xs font-bold transition-colors"
            >
              <Award className="w-4 h-4" />
              <span>Bulletin Officiel A4</span>
            </Link>
          </div>
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Moyenne Générale</span>
            <span className="text-lg md:text-xl font-bold text-school-primary tabular-nums">
              {selectedChild.average} / 20
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Rang : {selectedChild.rank}e sur 42</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Absences &amp; Retards</span>
            <span className="text-lg md:text-xl font-bold text-slate-800 tabular-nums">
              {childAbsences.length} signalement(s)
            </span>
            <span className="text-[11px] text-emerald-600 block mt-0.5 font-medium">
              {childAbsences.filter((a) => !a.isJustified).length === 0 ? "Tous justifiés" : "Justificatif en attente"}
            </span>
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
                Échéance Tranche 2 : {formatDate(selectedChild.nextDueDate)}
              </span>
            ) : (
              <span className="text-[11px] text-emerald-600 block mt-0.5 font-medium">À jour</span>
            )}
          </div>
        </div>
      </div>

      {/* TWO NEW REQUESTED WIDGETS: Devoirs à la maison & Dates d'évaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget 1: Consultation des Devoirs à la maison */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Devoirs à la maison</h3>
                <p className="text-[11px] text-slate-500">Travaux et devoirs assignés par les professeurs</p>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              {childHomework.length} devoir(s)
            </span>
          </div>

          <div className="space-y-3">
            {childHomework.map((hw) => (
              <div
                key={hw.id}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-school-primary">{hw.subject}</span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Pour le {hw.dueDate}
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-slate-900">{hw.title}</h4>
                <p className="text-[11px] text-slate-600 leading-snug">{hw.description}</p>
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                  <span>Enseignant : {hw.teacher}</span>
                  <span className={hw.isCompleted ? "text-emerald-600 font-bold" : "text-amber-600 font-medium"}>
                    {hw.isCompleted ? "✓ Terminé" : "⏳ À faire"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 2: Dates d'évaluation programmées */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Dates d&apos;évaluation programmées</h3>
                <p className="text-[11px] text-slate-500">Interrogations, devoirs surveillés et compositions</p>
              </div>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
              {childEvaluations.length} examen(s)
            </span>
          </div>

          <div className="space-y-3">
            {childEvaluations.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{ev.subject}</span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    {ev.type} (Coef. {ev.coef})
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-700 font-semibold">
                  <span className="flex items-center gap-1 text-school-primary font-mono font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    {ev.date} &bull; {ev.startTime} - {ev.endTime}
                  </span>
                  <span>({ev.room})</span>
                </div>
                <p className="text-[11px] text-slate-600 italic">
                  Thèmes : {ev.topics}
                </p>
                <p className="text-[10px] text-slate-400">Enseignant : {ev.teacher}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </>
      )}

      {/* Navigation Quick Links to Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Bulletins de notes */}
        <Link
          href="/parent/notes"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-school-accent transition-all flex flex-col justify-between group touch-target"
        >
          <div>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 w-fit mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-school-primary transition-colors">
              Bulletins de notes
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Format officiel Bénin A4 portrait (3 interros, 2 devoirs), calculs dynamiques et impression PDF
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-school-primary pt-3 border-t border-slate-100">
            <span>Voir le bulletin officiel</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Suivi des Absences & Retards uniquement */}
        <Link
          href="/parent/presences"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-school-accent transition-all flex flex-col justify-between group touch-target"
        >
          <div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 w-fit mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-school-primary transition-colors">
              Absences &amp; Retards
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Suivi exclusif des heures manquées, des retards en classe et transmission des justificatifs
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-school-primary pt-3 border-t border-slate-100">
            <span>Consulter les signalements</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Paiements scolarité par tranche */}
        <Link
          href="/parent/scolarite"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-school-accent transition-all flex flex-col justify-between group touch-target"
        >
          <div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 w-fit mb-3">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-school-primary transition-colors">
              Paiements par tranche
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Tranches 1, 2 et 3, paiement sécurisé Mobile Money (Moov / MTN) et reçus fiscaux
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-school-primary pt-3 border-t border-slate-100">
            <span>Régler une tranche</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Emploi du temps avec enseignants */}
        <Link
          href="/parent/emploi-du-temps"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-school-accent transition-all flex flex-col justify-between group touch-target"
        >
          <div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 w-fit mb-3">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-school-primary transition-colors">
              Emploi du temps
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Planning hebdomadaire Lundi au Samedi avec professeurs, salles et créneaux horaires
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-school-primary pt-3 border-t border-slate-100">
            <span>Voir l&apos;emploi du temps</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Profil du Parent */}
        <Link
          href="/parent/profil"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-school-accent transition-all flex flex-col justify-between group touch-target"
        >
          <div>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 w-fit mb-3">
              <UserCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-school-primary transition-colors">
              Profil du Parent
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Coordonnées, enfants rattachés, contacts d&apos;urgence et alertes SMS / WhatsApp
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-school-primary pt-3 border-t border-slate-100">
            <span>Gérer mon profil</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Notifications */}
        <Link
          href="/parent/notifications"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-school-accent transition-all flex flex-col justify-between group touch-target"
        >
          <div>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 w-fit mb-3">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-school-primary transition-colors">
              Notifications
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Alertes de publication de bulletins, échéances de tranches et convocations
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-school-primary pt-3 border-t border-slate-100">
            <span>Consulter les alertes</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Modal: Demande d'accès à un enfant */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-school-primary" />
                  Demander l&apos;accès à un enfant
                </h3>
                <p className="text-xs text-slate-500">
                  Rattachement sécurisé d&apos;un élève à votre compte parent
                </p>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestSent ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Demande transmise avec succès !</h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Votre demande d&apos;accès pour <strong>{searchedStudent?.lastName} {searchedStudent?.firstName}</strong> ({searchedStudent?.className})
                  a été envoyée au <strong>Censeur des Études</strong>.
                  <br />
                  Pour des raisons de sécurité, l&apos;accès sera actif dès validation officielle par l&apos;administration.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-5 py-2 text-xs font-semibold text-white bg-school-primary hover:bg-school-primary/90 rounded-xl transition shadow-xs"
                  >
                    Compris
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <form onSubmit={handleSearchStudent} className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Numéro Matricule ou N° Educ Master de l&apos;élève *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Ex : ECO-2026-0112 ou EM-2026-65412-BJ"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs uppercase font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-school-primary"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shrink-0"
                    >
                      Rechercher
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Ce numéro figure sur le reçu d&apos;inscription ou l&apos;attestation d&apos;admission de l&apos;élève.
                  </p>
                </form>

                {searchError && (
                  <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{searchError}</span>
                  </div>
                )}

                {/* Display Student Verification Details */}
                {searchedStudent && (
                  <div className="bg-school-50/70 border border-school-200 rounded-2xl p-4 space-y-3 animate-in fade-in">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-school-primary flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      <span>Fiche de vérification d&apos;identité</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-school-100 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {searchedStudent.lastName} {searchedStudent.firstName}
                          </h4>
                          <p className="text-xs font-semibold text-school-primary mt-0.5">
                            Classe : {searchedStudent.className} &middot; Année : 2026 - 2027
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {searchedStudent.matricule}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Date de naissance</span>
                          <span className="font-medium text-slate-800">{searchedStudent.birthDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Lieu de naissance</span>
                          <span className="font-medium text-slate-800">{searchedStudent.birthPlace}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[10px]">N° National Educ Master</span>
                          <span className="font-mono text-slate-700 font-semibold">{searchedStudent.educMasterNumber}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                      <strong>Vérification parentale :</strong> Confirmez-vous qu&apos;il s&apos;agit bien de votre enfant ?
                      Une demande sera transmise pour vérification par la direction.
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setSearchedStudent(null)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={handleSendRequest}
                        className="px-4 py-2 text-xs font-semibold text-white bg-school-primary hover:bg-school-primary/90 rounded-xl shadow-xs transition"
                      >
                        Envoyer la demande d&apos;accès
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Avertissement Limite Enfants Forfait Parent (Requirement 2 & 3) */}
      {isLimitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Limite d&apos;élèves du forfait parent atteinte
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {limitMessage}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900">
                  Formule actuelle : {parentPlanDef.name} ({parentPlanDef.priceFcfa} FCFA/mois)
                </p>
                <p className="text-slate-500">
                  Élèves rattachés : <strong>{myChildren.length}</strong> /{" "}
                  <strong>{parentPlanDef.maxChildren} max</strong>
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLimitModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Fermer
                </button>
                {parentPlan === "PARENT_1" && (
                  <Link
                    href="/parent/abonnement"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Passer au forfait PARENT 2 (300 F)</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

