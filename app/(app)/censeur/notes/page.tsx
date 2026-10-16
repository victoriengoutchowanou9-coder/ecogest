"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpenCheck,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Send,
  RotateCcw,
  Trash2,
  Edit,
  History,
  Eye,
  EyeOff,
  X,
  Save,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordCard } from "@/components/ui/RecordCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useBulletinStore } from "@/lib/bulletin-store";
import { useDisciplineStore } from "@/lib/discipline-store";
import { BeninOfficialBulletin } from "@/components/school/BeninOfficialBulletin";
import { BeninPrimaryBulletin } from "@/components/school/BeninPrimaryBulletin";
import { GradeRecord, StudentProfile, BulletinStatus } from "@/lib/types/bulletin";

export default function NotesValidationPage() {
  const { toast } = useToast();
  const {
    classrooms,
    subjects,
    grades,
    periods,
    years,
    school,
    bulletinStatuses,
    auditLogs,
    validateSubjectGrades,
    validateWholeBulletin,
    requestCorrection,
    publishBulletin,
    republishBulletin,
    unpublishBulletin,
    updateStudentGrade,
    deleteStudentGrade,
    getClassBulletins,
    getPrimaryClassBulletins,
  } = useBulletinStore();

  const { students } = useDisciplineStore();

  const [selectedClassId, setSelectedClassId] = useState("3e-a");
  const [selectedPeriodId, setSelectedPeriodId] = useState("T1");
  const [selectedSubjectId, setSelectedSubjectId] = useState("mat-math");

  // Modals state
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionReason, setCorrectionReason] = useState("");
  const [editingGrade, setEditingGrade] = useState<{
    studentId: string;
    studentName: string;
    gradeRecord: GradeRecord | null;
  } | null>(null);

  const [editInterro1, setEditInterro1] = useState<string>("");
  const [editInterro2, setEditInterro2] = useState<string>("");
  const [editDevoir1, setEditDevoir1] = useState<string>("");
  const [editDevoir2, setEditDevoir2] = useState<string>("");
  const [editReason, setEditReason] = useState<string>("");

  const [deletingGradeStudent, setDeletingGradeStudent] = useState<{
    studentId: string;
    studentName: string;
  } | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>("");

  const [previewStudentId, setPreviewStudentId] = useState<string | null>(null);
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);

  const selectedClassRoom =
    classrooms.find((c) => c.id === selectedClassId) || classrooms[0];
  const isPrimary = selectedClassRoom.cycle === "PRIMAIRE";

  const activePeriod =
    periods.find((p) => p.id === selectedPeriodId) || periods[0];

  const targetClassKey = `${selectedClassId}-${selectedPeriodId}`;
  const currentClassStatus: BulletinStatus =
    bulletinStatuses[targetClassKey] || "BROUILLON";

  const isPublished =
    currentClassStatus === "PUBLIE" ||
    currentClassStatus === "MODIFIE_APRES_PUBLICATION";

  // Élèves de la classe
  const classStudents = useMemo(() => {
    return students.filter(
      (s) => s.classId === selectedClassId && (s.status === "ACTIF" || s.status === "READMIS" || !s.status)
    );
  }, [students, selectedClassId]);

  // Notes de la matière sélectionnée
  const classGrades = useMemo(() => {
    return classStudents.map((std) => {
      const g = grades.find(
        (gr) =>
          gr.studentId === std.id &&
          gr.subjectId === selectedSubjectId &&
          gr.periodId === selectedPeriodId
      );
      const i1 = typeof g?.interro1 === "number" ? g.interro1 : null;
      const i2 = typeof g?.interro2 === "number" ? g.interro2 : null;
      const d1 = typeof g?.devoir1 === "number" ? g.devoir1 : null;
      const d2 = typeof g?.devoir2 === "number" ? g.devoir2 : null;

      // Calcul de la moyenne
      const validInterros = [i1, i2].filter((v): v is number => v !== null);
      const validDevoirs = [d1, d2].filter((v): v is number => v !== null);
      const moyInterro =
        validInterros.length > 0
          ? validInterros.reduce((a, b) => a + b, 0) / validInterros.length
          : null;
      const moyDevoir =
        validDevoirs.length > 0
          ? validDevoirs.reduce((a, b) => a + b, 0) / validDevoirs.length
          : null;

      let moy: number | null = null;
      if (moyInterro !== null && moyDevoir !== null) {
        moy = Math.round(((moyInterro + moyDevoir * 2) / 3) * 100) / 100;
      } else if (moyDevoir !== null) {
        moy = moyDevoir;
      }

      const status: "DRAFT" | "VALIDATED" | "LOCKED" = isPublished
        ? "LOCKED"
        : g?.isValidated || currentClassStatus === "VALIDE"
        ? "VALIDATED"
        : "DRAFT";

      return {
        studentId: std.id,
        studentName: `${std.lastName} ${std.firstName}`,
        matricule: std.matricule,
        interro1: i1,
        interro2: i2,
        devoir1: d1,
        devoir2: d2,
        average: moy,
        status,
        rawGradeRecord: g || null,
      };
    });
  }, [classStudents, grades, selectedSubjectId, selectedPeriodId, isPublished, currentClassStatus]);

  // Actions Censeur
  const handleValidateSubject = () => {
    validateSubjectGrades(selectedClassId, selectedSubjectId, selectedPeriodId, "Censeur des Études");
    toast(`Notes de ${selectedClassRoom.name} validées avec succès pour la matière.`, "success");
  };

  const handleValidateWholeBulletin = () => {
    validateWholeBulletin(targetClassKey, "Censeur des Études");
    toast(
      `Le bulletin complet de la classe ${selectedClassRoom.name} (${activePeriod.name}) a été officiellement validé !`,
      "success"
    );
  };

  const handlePublish = () => {
    publishBulletin(targetClassKey, "Censeur des Études");
    toast(
      `Bulletins de ${selectedClassRoom.name} PUBLIÉS avec succès ! La consultation est désormais débloquée pour les parents et élèves.`,
      "success"
    );
  };

  const handleRepublish = () => {
    republishBulletin(
      targetClassKey,
      "Republication officielle certifiée après rectification des notes par le Censorat",
      "Censeur des Études"
    );
    toast(`Bulletins republiés avec succès avec traçabilité d'audit certifiée.`, "success");
  };

  const handleUnpublish = () => {
    unpublishBulletin(targetClassKey, "Censeur des Études");
    toast(`Publication suspendue. Les notes sont désormais masquées pour les parents.`, "info");
  };

  const handleOpenCorrectionModal = () => {
    setCorrectionReason(
      "Vérification demandée sur les notes d'évaluation n°1 : écart anormal constaté."
    );
    setIsCorrectionModalOpen(true);
  };

  const handleSendCorrectionRequest = (e: React.FormEvent) => {
    e.preventDefault();
    requestCorrection(targetClassKey, correctionReason.trim(), "Censeur des Études");
    setIsCorrectionModalOpen(false);
    toast(
      `Demande de correction transmise à l'enseignant pour ${selectedClassRoom.name}.`,
      "info"
    );
  };

  const handleOpenEditGrade = (item: (typeof classGrades)[0]) => {
    setEditingGrade({
      studentId: item.studentId,
      studentName: item.studentName,
      gradeRecord: item.rawGradeRecord,
    });
    setEditInterro1(item.interro1 !== null ? String(item.interro1) : "");
    setEditInterro2(item.interro2 !== null ? String(item.interro2) : "");
    setEditDevoir1(item.devoir1 !== null ? String(item.devoir1) : "");
    setEditDevoir2(item.devoir2 !== null ? String(item.devoir2) : "");
    setEditReason("Régularisation après vérification de la copie d'examen");
  };

  const handleSaveEditGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade) return;

    const updates: Partial<GradeRecord> = {
      interro1: editInterro1 ? Number(editInterro1) : null,
      interro2: editInterro2 ? Number(editInterro2) : null,
      devoir1: editDevoir1 ? Number(editDevoir1) : null,
      devoir2: editDevoir2 ? Number(editDevoir2) : null,
      isValidated: true,
    };

    updateStudentGrade(
      editingGrade.studentId,
      selectedSubjectId,
      selectedPeriodId,
      updates,
      "Censeur des Études",
      "censeur",
      editReason
    );

    toast(`Note de ${editingGrade.studentName} rectifiée avec archivage d'audit.`, "success");
    setEditingGrade(null);
  };

  const handleDeleteGrade = (studentId: string, studentName: string) => {
    setDeletingGradeStudent({ studentId, studentName });
    setDeleteReason("Annulation de note pour motif d'absence justifiée ou doublon");
  };

  const confirmDeleteGrade = () => {
    if (!deletingGradeStudent) return;
    deleteStudentGrade(
      deletingGradeStudent.studentId,
      selectedSubjectId,
      selectedPeriodId,
      deleteReason,
      "Censeur des Études"
    );
    toast(`Note de ${deletingGradeStudent.studentName} supprimée selon permissions.`, "info");
    setDeletingGradeStudent(null);
  };

  // Tableau des colonnes
  const columns: Column<(typeof classGrades)[0]>[] = [
    {
      key: "studentName",
      header: "Élève & Matricule",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 text-xs sm:text-sm">{item.studentName}</span>
          <span className="block text-[11px] font-mono text-slate-400">{item.matricule}</span>
        </div>
      ),
    },
    {
      key: "interros",
      header: "Interrogations (/20)",
      render: (item) => (
        <span className="text-xs font-mono text-slate-700">
          Int1: <strong>{item.interro1 !== null ? item.interro1 : "—"}</strong> &bull; Int2:{" "}
          <strong>{item.interro2 !== null ? item.interro2 : "—"}</strong>
        </span>
      ),
    },
    {
      key: "devoirs",
      header: "Devoirs Surveillés (/20)",
      render: (item) => (
        <span className="text-xs font-mono text-slate-700">
          Dev1: <strong>{item.devoir1 !== null ? item.devoir1 : "—"}</strong> &bull; Dev2:{" "}
          <strong>{item.devoir2 !== null ? item.devoir2 : "—"}</strong>
        </span>
      ),
    },
    {
      key: "average",
      header: "Moyenne Période",
      render: (item) => (
        <span className="font-bold text-xs sm:text-sm text-school-primary tabular-nums">
          {item.average !== null ? `${item.average} / 20` : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut Note",
      render: (item) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      key: "actions",
      header: "Actions Censeur",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setPreviewStudentId(item.studentId)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-school-50 text-slate-700 hover:text-school-primary text-xs font-semibold border border-slate-200 transition-colors"
            title="Consulter le bulletin officiel"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Bulletin</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenEditGrade(item)}
            className="p-1.5 text-slate-500 hover:text-school-primary rounded-lg hover:bg-slate-100"
            title="Corriger la note (avec traçabilité d'audit)"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteGrade(item.studentId, item.studentName)}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
            title="Supprimer la note selon permissions"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Validation & Publication des Bulletins"
        subtitle="Contrôle pédagogique du Censeur des études &bull; Workflow certifié : Saisie &rarr; Validation &rarr; Publication Parent"
        breadcrumbs={[{ label: "Censeur", href: "/censeur" }, { label: "Notes & Délibérations" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAuditDrawer(!showAuditDrawer)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>Historique d'audit ({auditLogs.length})</span>
            </button>

            {isPublished ? (
              <>
                <button
                  type="button"
                  onClick={handleRepublish}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm"
                  title="Republier le bulletin après rectifications administratives"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Republier après correction</span>
                </button>
                <button
                  type="button"
                  onClick={handleUnpublish}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold"
                  title="Suspendre l'accès des parents"
                >
                  <EyeOff className="w-4 h-4" />
                  <span>Retirer la publication</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleOpenCorrectionModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 text-xs font-semibold"
                >
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <span>Demander correction</span>
                </button>

                <button
                  type="button"
                  onClick={handleValidateWholeBulletin}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider tout le bulletin</span>
                </button>

                <button
                  type="button"
                  onClick={handlePublish}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Publier aux Parents</span>
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Workflow & Status Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
          isPublished
            ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
            : currentClassStatus === "VALIDE"
            ? "bg-blue-50/80 border-blue-200 text-blue-950"
            : currentClassStatus === "CORRECTION_DEMANDEE"
            ? "bg-amber-50/80 border-amber-200 text-amber-950"
            : "bg-slate-50 border-slate-200 text-slate-900"
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm ${
              isPublished
                ? "bg-emerald-600"
                : currentClassStatus === "VALIDE"
                ? "bg-blue-600"
                : currentClassStatus === "CORRECTION_DEMANDEE"
                ? "bg-amber-600"
                : "bg-slate-600"
            }`}
          >
            {isPublished ? (
              <ShieldCheck className="w-6 h-6" />
            ) : currentClassStatus === "VALIDE" ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : currentClassStatus === "CORRECTION_DEMANDEE" ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <Lock className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                Classe : {selectedClassRoom.name} &bull; {activePeriod.name}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isPublished
                    ? "bg-emerald-200 text-emerald-900"
                    : currentClassStatus === "VALIDE"
                    ? "bg-blue-200 text-blue-900"
                    : currentClassStatus === "CORRECTION_DEMANDEE"
                    ? "bg-amber-200 text-amber-900"
                    : "bg-slate-200 text-slate-800"
                }`}
              >
                Statut : {currentClassStatus}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isPublished
                ? "Les bulletins de cette classe sont officiellement certifiés et visibles dans l'espace Parent et Élève."
                : currentClassStatus === "VALIDE"
                ? "Notes et bulletins validés par le Censeur. Prêts pour publication aux familles."
                : currentClassStatus === "CORRECTION_DEMANDEE"
                ? "Une demande de correction a été notifiée à l'enseignant. Notes invisibles pour les parents."
                : "Notes en cours de saisie ou révision. Invisibles pour les élèves et parents avant confirmation du Censeur."}
            </p>
          </div>
        </div>

        {/* Quick subject validation button */}
        <button
          type="button"
          onClick={handleValidateSubject}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold shadow-sm transition"
        >
          Valider les notes de la matière
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Classe
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-school-primary"
          >
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.level} - {c.cycle})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Période / Trimestre
          </label>
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-school-primary"
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Matière évaluée
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-school-primary"
          >
            {subjects
              .filter((s) => (isPrimary ? s.cycle === "PRIMAIRE" : s.cycle !== "PRIMAIRE"))
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Coef {s.coef})
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        data={classGrades}
        columns={columns}
        keyExtractor={(item) => item.studentId}
        renderMobileCard={(item) => (
          <RecordCard
            title={item.studentName}
            subtitle={`Matricule : ${item.matricule}`}
            badge={<StatusBadge status={item.status} size="sm" />}
            details={[
              {
                label: "Interros",
                value: `Int1: ${item.interro1 ?? "-"} | Int2: ${item.interro2 ?? "-"}`,
              },
              {
                label: "Devoirs",
                value: `Dev1: ${item.devoir1 ?? "-"} | Dev2: ${item.devoir2 ?? "-"}`,
              },
              { label: "Moyenne", value: item.average !== null ? `${item.average} / 20` : "-" },
            ]}
            actions={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewStudentId(item.studentId)}
                  className="text-xs font-semibold text-school-primary hover:underline"
                >
                  Voir Bulletin
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEditGrade(item)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Corriger
                </button>
              </div>
            }
          />
        )}
      />

      {/* Drawer d'historique d'audit */}
      {showAuditDrawer && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-school-primary" />
              <h3 className="font-bold text-slate-900 text-sm">
                Journal d'Audit des Délibérations & Rectifications de Notes
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAuditDrawer(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Masquer
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                Aucune modification post-publication enregistrée pour l'instant.
              </p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 text-xs flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 uppercase">{log.action}</span>
                    {log.subjectName && (
                      <span className="text-slate-500 ml-1.5 font-medium">({log.subjectName})</span>
                    )}
                    <p className="text-slate-600 mt-0.5">{log.reason}</p>
                    {log.previousValue && (
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Avant : {log.previousValue} &rarr; Après : {log.newValue}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-[11px] text-slate-400 shrink-0">
                    <div>{log.authorName} ({log.authorRole})</div>
                    <div>{new Date(log.date).toLocaleDateString("fr-FR")}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal Demande de Correction */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-amber-50">
              <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Demander une correction à l'enseignant</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCorrectionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSendCorrectionRequest} className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                La classe repassera au statut <strong>CORRECTION DEMANDÉE</strong>. Les notes resteront strictement masquées pour les parents jusqu'à la nouvelle validation.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motif & Instructions précises pour l'enseignant
                </label>
                <textarea
                  rows={3}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-school-primary"
                  placeholder="Préciser l'erreur constatée, devoir manquant..."
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCorrectionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm"
                >
                  Transmettre la demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Rectification de Note par le Censeur */}
      {editingGrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-school-primary" />
                <span>Rectification de note — {editingGrade.studentName}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingGrade(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditGrade} className="p-5 space-y-4">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-xs">
                Cette modification administrative sera automatiquement enregistrée dans le journal officiel d'audit avec votre nom, date et motif.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Interrogation 1 (/20)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="20"
                    value={editInterro1}
                    onChange={(e) => setEditInterro1(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                    placeholder="—"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Interrogation 2 (/20)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="20"
                    value={editInterro2}
                    onChange={(e) => setEditInterro2(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                    placeholder="—"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Devoir Surveillé 1 (/20)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="20"
                    value={editDevoir1}
                    onChange={(e) => setEditDevoir1(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                    placeholder="—"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Devoir Surveillé 2 (/20)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="20"
                    value={editDevoir2}
                    onChange={(e) => setEditDevoir2(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                    placeholder="—"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motif officiel de la modification
                </label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  placeholder="Ex: Rectification suite à réclamation parentale ou erreur de saisie..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingGrade(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-school-primary text-white font-bold text-xs shadow-sm hover:bg-school-700"
                >
                  Enregistrer & Tracer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Grade Dialog */}
      {deletingGradeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-slate-900 text-sm">
                Suppression de note selon permissions
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Êtes-vous sûr de vouloir supprimer la note de{" "}
              <strong>{deletingGradeStudent.studentName}</strong> pour cette matière ?
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motif obligatoire de suppression
              </label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingGradeStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDeleteGrade}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Bulletin */}
      {previewStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl p-6 relative my-8">
            <button
              type="button"
              onClick={() => setPreviewStudentId(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            {isPrimary ? (
              (() => {
                const b =
                  (previewStudentId ? getPrimaryClassBulletins(selectedClassId, selectedPeriodId).get(previewStudentId) : undefined) ||
                  getPrimaryClassBulletins(selectedClassId, selectedPeriodId).values().next().value;
                return b ? (
                  <BeninPrimaryBulletin bulletin={b} />
                ) : (
                  <div className="p-8 text-center text-slate-500">Aucun bulletin primaire trouvé.</div>
                );
              })()
            ) : (
              (() => {
                const b =
                  (previewStudentId ? getClassBulletins(selectedClassId, selectedPeriodId).get(previewStudentId) : undefined) ||
                  getClassBulletins(selectedClassId, selectedPeriodId).values().next().value;
                return b ? (
                  <BeninOfficialBulletin bulletin={b} />
                ) : (
                  <div className="p-8 text-center text-slate-500">Aucun bulletin secondaire trouvé.</div>
                );
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
}
