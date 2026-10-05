"use client";

import React, { useState } from "react";
import { Save, Lock, AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { GradeInputRow } from "@/components/school/GradeInputRow";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MOCK_GRADES_CLASS_3A, StudentGrade } from "@/lib/mock-data";
import { useToast } from "@/components/ui/Toast";

export default function EnseignantNotesPage() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState("3ème A");
  const [selectedSubject, setSelectedSubject] = useState("Mathématiques");
  const [selectedPeriod, setSelectedPeriod] = useState("Semestre 1");
  const [grades, setGrades] = useState<StudentGrade[]>(MOCK_GRADES_CLASS_3A);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [selectedStudentForUnlock, setSelectedStudentForUnlock] = useState<string>("");

  const handleGradeChange = (
    studentId: string,
    field: "interro1" | "interro2" | "devoir1" | "devoir2",
    value: number | null
  ) => {
    setGrades((prev) =>
      prev.map((g) => {
        if (g.studentId === studentId) {
          const updated = { ...g, [field]: value };
          // Recalculate average
          const evals = [
            { val: updated.interro1, coef: 1 },
            { val: updated.interro2, coef: 1 },
            { val: updated.devoir1, coef: 2 },
            { val: updated.devoir2, coef: 2 },
          ].filter((e) => e.val !== null);

          const totalCoef = evals.reduce((a, b) => a + b.coef, 0);
          const totalScore = evals.reduce((a, b) => a + (b.val || 0) * b.coef, 0);
          updated.average = totalCoef > 0 ? parseFloat((totalScore / totalCoef).toFixed(2)) : null;
          return updated;
        }
        return g;
      })
    );
  };

  const handleSaveDraft = () => {
    toast("Notes enregistrées en brouillon avec succès.", "success");
  };

  const handleRequestUnlock = (studentName: string) => {
    setSelectedStudentForUnlock(studentName);
    setUnlockModalOpen(true);
  };

  const handleConfirmUnlockRequest = () => {
    setUnlockModalOpen(false);
    toast(
      `Demande de déverrouillage pour ${selectedStudentForUnlock} transmise au Censeur des études.`,
      "info"
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grille de Saisie Rapide des Notes"
        subtitle="Saisie directe au clavier numérique avec calcul instantané des moyennes"
        breadcrumbs={[{ label: "Enseignant", href: "/enseignant" }, { label: "Saisie des notes" }]}
        actions={
          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer le travail</span>
          </button>
        }
      />

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Classe
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target min-h-[40px]"
          >
            <option value="3ème A">3ème A (48 élèves)</option>
            <option value="Terminale C">Terminale C (32 élèves)</option>
            <option value="1ère D">1ère D (38 élèves)</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Matière
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target min-h-[40px]"
          >
            <option value="Mathématiques">Mathématiques</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Période
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target min-h-[40px]"
          >
            <option value="Semestre 1">1er Semestre</option>
            <option value="Semestre 2">2ème Semestre</option>
          </select>
        </div>

        <div className="ml-auto text-xs text-slate-500 hidden sm:block">
          Pondération : Int (coef 1) &middot; Devoirs (coef 2)
        </div>
      </div>

      {/* Grade Rows List */}
      <div className="space-y-2.5">
        {grades.map((g) => (
          <GradeInputRow
            key={g.id}
            studentName={g.studentName}
            matricule={g.matricule}
            interro1={g.interro1}
            interro2={g.interro2}
            devoir1={g.devoir1}
            devoir2={g.devoir2}
            status={g.status}
            onGradeChange={(field, val) => handleGradeChange(g.studentId, field, val)}
            onRequestUnlock={() => handleRequestUnlock(g.studentName)}
          />
        ))}
      </div>

      {/* Unlock Correction Request Modal */}
      <ConfirmDialog
        isOpen={unlockModalOpen}
        title="Demander une correction de note au Censeur"
        description={`Les notes de ${selectedStudentForUnlock} ont été verrouillées. Souhaitez-vous transmettre une demande de déverrouillage motivée au Censeur des études ?`}
        confirmLabel="Transmettre la demande"
        cancelLabel="Annuler"
        onConfirm={handleConfirmUnlockRequest}
        onCancel={() => setUnlockModalOpen(false)}
      />
    </div>
  );
}
