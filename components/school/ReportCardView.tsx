"use client";

import React, { useState, useMemo } from "react";
import {
  Printer,
  Download,
  Upload,
  Layers,
  User,
  X,
  FileText,
  RotateCcw,
  ShieldCheck,
  Edit3,
  History,
  CheckCircle2,
} from "lucide-react";
import {
  MOCK_SCHOOL_SETTINGS,
  MOCK_ACADEMIC_YEARS,
  MOCK_ACADEMIC_PERIODS,
  MOCK_CLASSROOMS,
  MOCK_BULLETIN_STUDENTS,
  MOCK_SUBJECTS,
  MOCK_GRADE_RECORDS,
  MOCK_TEACHERS,
  MOCK_AUDIT_LOGS_MAP,
} from "@/lib/mock-bulletin-db";
import { computeClassBulletins } from "@/lib/bulletin-utils";
import { BeninOfficialBulletin } from "./BeninOfficialBulletin";
import { BulletinBatchPrinter } from "./BulletinBatchPrinter";
import { Student } from "@/lib/mock-data";
import { BulletinAuditLog, GradeRecord } from "@/lib/types/bulletin";

interface ReportCardViewProps {
  student?: Student | { id: string; [key: string]: any };
  studentId?: string;
  period?: string;
  periodId?: string;
  onClose?: () => void;
  allowBatch?: boolean;
}

export const ReportCardView: React.FC<ReportCardViewProps> = ({
  student,
  studentId: propStudentId,
  period = "1er Trimestre",
  periodId: propPeriodId,
  onClose,
  allowBatch = true,
}) => {
  const effectiveStudentId = propStudentId || student?.id || MOCK_BULLETIN_STUDENTS[0].id;
  const [selectedStudentId, setSelectedStudentId] = useState<string>(effectiveStudentId);

  const initialPeriodId = propPeriodId || (period.includes("2") ? "T2" : period.includes("3") ? "T3" : "T1");
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(initialPeriodId);

  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [customLogoUrl, setCustomLogoUrl] = useState<string>("");

  // Dynamic state for grades and audit logs (allows post-publication rectification)
  const [gradesState, setGradesState] = useState<GradeRecord[]>(MOCK_GRADE_RECORDS);
  const [auditLogsState, setAuditLogsState] = useState<Map<string, BulletinAuditLog[]>>(MOCK_AUDIT_LOGS_MAP);

  // Post-publication edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSubjectId, setEditSubjectId] = useState("mat-fra");
  const [editField, setEditField] = useState<"devoir1" | "devoir2" | "interro1" | "interro2" | "interro3">("devoir2");
  const [editNewGrade, setEditNewGrade] = useState("16");
  const [editReason, setEditReason] = useState("");

  const activePeriod = useMemo(() => {
    return (
      MOCK_ACADEMIC_PERIODS.find((p) => p.id === selectedPeriodId) ||
      MOCK_ACADEMIC_PERIODS[0]
    );
  }, [selectedPeriodId]);

  const activeClass = MOCK_CLASSROOMS[0];
  const activeYear = MOCK_ACADEMIC_YEARS[0];

  // Dynamic class computation engine
  const bulletinsMap = useMemo(() => {
    return computeClassBulletins(
      MOCK_SCHOOL_SETTINGS,
      activeYear,
      activePeriod,
      activeClass,
      MOCK_BULLETIN_STUDENTS,
      MOCK_SUBJECTS,
      gradesState,
      MOCK_TEACHERS,
      auditLogsState
    );
  }, [activePeriod, activeClass, activeYear, gradesState, auditLogsState]);

  const currentBulletin = bulletinsMap.get(selectedStudentId) || bulletinsMap.values().next().value;

  const allClassBulletins = useMemo(() => {
    return Array.from(bulletinsMap.values());
  }, [bulletinsMap]);

  const handlePrint = () => {
    window.print();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setCustomLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Post-publication modification handler
  const handleApplyPostPublicationModification = (e: React.FormEvent) => {
    e.preventDefault();
    const newNum = parseFloat(editNewGrade);
    if (isNaN(newNum) || newNum < 0 || newNum > 20) return;
    if (!editReason.trim()) return;

    // 1. Find previous value
    const targetGrade = gradesState.find(
      (g) => g.studentId === selectedStudentId && g.subjectId === editSubjectId && g.periodId === selectedPeriodId
    );
    const prevVal = targetGrade ? String(targetGrade[editField] ?? "-") : "-";

    // 2. Update grades
    setGradesState((prev) =>
      prev.map((g) => {
        if (g.studentId === selectedStudentId && g.subjectId === editSubjectId && g.periodId === selectedPeriodId) {
          return {
            ...g,
            [editField]: newNum,
          };
        }
        return g;
      })
    );

    // 3. Create audit log
    const subjectObj = MOCK_SUBJECTS.find((s) => s.id === editSubjectId);
    const newAuditLog: BulletinAuditLog = {
      id: `aud-${Date.now()}`,
      bulletinId: currentBulletin?.id || `blt-${selectedStudentId}`,
      date: new Date().toISOString().replace("T", " ").slice(0, 16),
      authorName: "M. TOSSOU Koffi",
      authorRole: "enseignant",
      action: "RECTIFICATION_NOTE_POST_PUBLICATION",
      subjectName: subjectObj?.name || editSubjectId,
      fieldName: editField,
      previousValue: prevVal,
      newValue: newNum.toFixed(2),
      reason: editReason.trim(),
    };

    setAuditLogsState((prev) => {
      const copy = new Map(prev);
      const existing = copy.get(selectedStudentId) || [];
      copy.set(selectedStudentId, [newAuditLog, ...existing]);
      return copy;
    });

    setIsEditModalOpen(false);
    setEditReason("");
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="no-print bg-slate-900 text-white p-3.5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">
              Période :
            </span>
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {MOCK_ACADEMIC_PERIODS.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Student Selector */}
          {!isBatchMode && (
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700 min-w-0 max-w-full sm:max-w-xs">
              <User className="w-3.5 h-3.5 text-school-accent shrink-0" />
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer truncate max-w-[180px] sm:max-w-[240px]"
                aria-label="Sélectionner un élève"
              >
                {MOCK_BULLETIN_STUDENTS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white truncate">
                    {s.lastName} {s.firstName} ({s.educMasterNumber || s.matricule})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Batch Mode Toggle */}
          {allowBatch && (
            <button
              type="button"
              onClick={() => setIsBatchMode(!isBatchMode)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors touch-target ${
                isBatchMode
                  ? "bg-amber-500 text-slate-950 border-amber-400 font-bold"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {isBatchMode ? "Vue Individuelle" : "Génération en lot (Classe entière)"}
              </span>
            </button>
          )}

          {/* Post-Publication Rectification Trigger */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-slate-700 transition-colors touch-target"
            title="Modifier une note après publication avec justification et traçabilité"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Rectifier post-publication</span>
          </button>

          {/* Upload Logo button */}
          <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 cursor-pointer transition-colors touch-target">
            <Upload className="w-3.5 h-3.5" />
            <span>Changer logo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </label>

          {customLogoUrl && (
            <button
              type="button"
              onClick={() => setCustomLogoUrl("")}
              title="Réinitialiser le logo"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons: Print / PDF and Close */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-colors touch-target"
          >
            <Printer className="w-4 h-4" />
            <span>
              {isBatchMode
                ? `Imprimer / PDF (${allClassBulletins.length} élèves)`
                : "Télécharger en PDF / Imprimer"}
            </span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 border border-slate-700 transition-colors touch-target"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Render Document */}
      <div className="w-full overflow-x-auto pb-4">
        {isBatchMode ? (
          <BulletinBatchPrinter
            bulletins={allClassBulletins}
            customLogoUrl={customLogoUrl}
          />
        ) : (
          currentBulletin && (
            <BeninOfficialBulletin
              bulletin={currentBulletin}
              customLogoUrl={customLogoUrl}
            />
          )
        )}
      </div>

      {/* Post-Publication Rectification Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Rectification post-publication autorisée &amp; traçable
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyPostPublicationModification} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Matière</label>
                <select
                  value={editSubjectId}
                  onChange={(e) => setEditSubjectId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900"
                >
                  {MOCK_SUBJECTS.filter((s) => !s.isConduite).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Coef. {s.coef})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Évaluation à modifier</label>
                  <select
                    value={editField}
                    onChange={(e) => setEditField(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900"
                  >
                    <option value="interro1">Interrogation 1</option>
                    <option value="interro2">Interrogation 2</option>
                    <option value="interro3">Interrogation 3</option>
                    <option value="devoir1">Devoir 1</option>
                    <option value="devoir2">Devoir 2</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nouvelle note / 20</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="20"
                    value={editNewGrade}
                    onChange={(e) => setEditNewGrade(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Motif officiel de rectification (Obligatoire pour l&apos;audit)
                </label>
                <textarea
                  rows={3}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="Ex : Erreur matérielle lors de la saisie de la copie réclamée..."
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm"
                >
                  Valider et Tracer la Rectification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
