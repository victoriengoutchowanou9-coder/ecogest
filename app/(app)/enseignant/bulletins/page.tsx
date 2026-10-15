"use client";

import React, { useState, useMemo } from "react";
import {
  Award,
  Search,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Printer,
  Sparkles,
  Sliders,
  Save,
  BookOpen,
  UserCheck,
  AlertCircle,
  Filter,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { BeninOfficialBulletin } from "@/components/school/BeninOfficialBulletin";
import { useBulletinStore } from "@/lib/bulletin-store";
import { useToast } from "@/components/ui/Toast";
import { MOCK_TEACHER_PROFILE } from "@/lib/mock-teacher-db";
import { cn } from "@/lib/utils";

export default function EnseignantBulletinsPage() {
  const { toast } = useToast();
  const {
    subjects,
    classrooms,
    periods,
    students,
    grades,
    updateSubjectCoef,
    updateStudentGrade,
    getClassBulletins,
  } = useBulletinStore();

  // 1. Selectors
  const [selectedClassId, setSelectedClassId] = useState<string>("3e-a");
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("T1");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("mat-math");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Subject coefficient management state
  const currentSubject = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubjectId) || subjects[3]; // Math
  }, [subjects, selectedSubjectId]);

  const [coefInput, setCoefInput] = useState<number>(currentSubject.coef);

  // Sync coef input when selected subject changes
  React.useEffect(() => {
    setCoefInput(currentSubject.coef);
  }, [currentSubject.coef, selectedSubjectId]);

  // Save modified coefficient
  const handleSaveCoef = () => {
    if (coefInput < 1 || coefInput > 10) {
      toast("Le coefficient doit être un entier compris entre 1 et 10.", "error");
      return;
    }
    updateSubjectCoef(selectedSubjectId, coefInput, MOCK_TEACHER_PROFILE.fullName);
    toast(
      `Coefficient de « ${currentSubject.name} » fixé à ${coefInput}. Bulletins et moyennes recalculés automatiquement.`,
      "success"
    );
  };

  // 2. Computed Class Bulletins (recalculates automatically with zero division protection)
  const classBulletinsMap = useMemo(() => {
    return getClassBulletins(selectedClassId, selectedPeriodId);
  }, [getClassBulletins, selectedClassId, selectedPeriodId, subjects, grades]);

  // 3. Filtered students list for selected class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    classStudents[0]?.id || "std-01"
  );

  // Ensure selected student exists in current class
  React.useEffect(() => {
    if (classStudents.length > 0 && !classStudents.some((s) => s.id === selectedStudentId)) {
      setSelectedStudentId(classStudents[0].id);
    }
  }, [classStudents, selectedStudentId]);

  // Filtered list with search
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return classStudents;
    return classStudents.filter(
      (s) =>
        s.lastName.toLowerCase().includes(q) ||
        s.firstName.toLowerCase().includes(q) ||
        s.matricule.toLowerCase().includes(q)
    );
  }, [classStudents, searchQuery]);

  // Selected student bulletin
  const currentBulletin = useMemo(() => {
    return classBulletinsMap.get(selectedStudentId) || classBulletinsMap.values().next().value;
  }, [classBulletinsMap, selectedStudentId]);

  // Current student subject row in teacher's subject
  const currentSubjectRow = useMemo(() => {
    return currentBulletin?.rows.find((r) => r.subjectId === selectedSubjectId);
  }, [currentBulletin, selectedSubjectId]);

  // Quick navigation helpers (Previous / Next student)
  const currentIndex = filteredStudents.findIndex((s) => s.id === selectedStudentId);

  const handleNextStudent = () => {
    if (currentIndex < filteredStudents.length - 1) {
      setSelectedStudentId(filteredStudents[currentIndex + 1].id);
    }
  };

  const handlePrevStudent = () => {
    if (currentIndex > 0) {
      setSelectedStudentId(filteredStudents[currentIndex - 1].id);
    }
  };

  // Quick appreciation presets
  const handleApplyPreset = (preset: string) => {
    updateStudentGrade(selectedStudentId, selectedSubjectId, selectedPeriodId, {
      teacherAppreciation: preset,
    });
    toast("Appréciation enregistrée dans le bulletin.", "success");
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Bulletin & Appréciations"
        subtitle="Consultez et complétez les bulletins officiels de vos élèves pour votre matière (modèle officiel unique Bénin)"
        breadcrumbs={[{ label: "Enseignant", href: "/enseignant" }, { label: "Bulletin & Appréciations" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / Exporter PDF</span>
            </button>
          </div>
        }
      />

      {/* 1. Context and Subject Coefficient Management Bar */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Classe */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Classe
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent"
              >
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.size} élèves)
                  </option>
                ))}
              </select>
            </div>

            {/* Période */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Période
              </label>
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent"
              >
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.isCurrent ? "(En cours)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Matière de l'enseignant */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Ma Matière enseignée
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="rounded-xl border border-blue-400 bg-blue-50/40 py-2 px-3 text-xs md:text-sm font-bold text-blue-900 touch-target focus:border-blue-600"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Coefficient definition by teacher */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Coefficient de ma matière
              </span>
              <span className="text-xs font-semibold text-slate-700">
                Défini par l&apos;enseignant
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                max="10"
                value={coefInput}
                onChange={(e) => setCoefInput(parseInt(e.target.value, 10) || 1)}
                className="w-14 px-2 py-1.5 text-sm font-black text-center rounded-lg border border-slate-300 bg-white focus:border-school-accent"
              />
              <button
                type="button"
                onClick={handleSaveCoef}
                className="px-3 py-1.5 rounded-lg bg-school-primary hover:bg-school-700 text-white font-bold text-xs shadow-2xs flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Fixer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Rule note */}
        <div className="text-[11px] text-slate-500 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 flex items-center justify-between">
          <span>
            💡 <strong>Règle de saisie Enseignant :</strong> Vous pouvez renseigner et modifier directement les notes, le coefficient et votre appréciation sur votre matière <strong>{currentSubject.name}</strong>. Les autres matières restent affichées à titre consultatif pour garantir l&apos;intégrité du bulletin complet.
          </span>
          <span className="font-bold text-blue-800 ml-2 shrink-0">
            Coef. actuel : {currentSubject.coef}
          </span>
        </div>
      </div>

      {/* 2. Main Workspace: Students List (Left) + Full Official Bulletin (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of Students */}
        <div className="no-print lg:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Élèves de la classe ({filteredStudents.length})
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">Sélectionnez pour compléter</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou matricule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:border-school-accent"
              />
            </div>

            {/* Student Cards Scrollable List */}
            <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredStudents.map((st, idx) => {
                const b = classBulletinsMap.get(st.id);
                const subjRow = b?.rows.find((r) => r.subjectId === selectedSubjectId);
                const isSelected = st.id === selectedStudentId;

                // Status check
                const hasGrade = subjRow?.hasGrade;
                const hasAppreciation =
                  Boolean(subjRow?.appreciation) && subjRow?.appreciation !== "…";

                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStudentId(st.id)}
                    className={cn(
                      "p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 active:scale-[0.99]",
                      isSelected
                        ? "border-school-primary bg-school-50/50 shadow-xs ring-1 ring-school-primary"
                        : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-xs text-slate-900 leading-tight">
                          {st.lastName} {st.firstName}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {st.matricule}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        {subjRow?.moyenne20 !== null && subjRow?.moyenne20 !== undefined ? (
                          <span className="text-xs font-black text-school-primary tabular-nums block">
                            {subjRow.moyenne20.toFixed(2)}/20
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Non noté</span>
                        )}
                        <span className="text-[9px] text-slate-400">
                          Général : {b?.generalAverage.toFixed(2)}/20
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-medium">
                        Rang classe : <strong>{b?.rankFormatted}</strong>
                      </span>
                      {hasGrade && hasAppreciation ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Complet</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                          <Clock className="w-3 h-3" />
                          <span>À compléter</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Complete Official Benin Bulletin with Teacher In-Place Editing */}
        <div className="lg:col-span-8 space-y-4">
          {/* Quick Student Navigation Bar */}
          <div className="no-print bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevStudent}
                disabled={currentIndex <= 0}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 touch-target"
                title="Élève précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-xs">
                <span className="text-slate-500">Élève </span>
                <strong>{currentIndex + 1}</strong>
                <span className="text-slate-400"> sur {filteredStudents.length}</span>
              </div>
              <button
                type="button"
                onClick={handleNextStudent}
                disabled={currentIndex >= filteredStudents.length - 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 touch-target"
                title="Élève suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets for Teacher Appreciation */}
            <div className="flex flex-wrap items-center gap-1 text-xs">
              <span className="text-[10px] text-slate-400 font-medium">Suggestions :</span>
              <button
                type="button"
                onClick={() => handleApplyPreset("Très bon trimestre. Travail sérieux et rigoureux.")}
                className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-semibold hover:bg-emerald-100"
              >
                Félicitations
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("Travail satisfaisant, notions bien assimilées.")}
                className="px-2 py-1 rounded-lg bg-blue-50 text-blue-800 text-[10px] font-semibold hover:bg-blue-100"
              >
                Satisfaisant
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("Résultats passables. Doit s'exercer davantage.")}
                className="px-2 py-1 rounded-lg bg-amber-50 text-amber-800 text-[10px] font-semibold hover:bg-amber-100"
              >
                Efforts requis
              </button>
            </div>
          </div>

          {/* Full Official Benin Bulletin */}
          {currentBulletin ? (
            <div className="bg-white p-2 md:p-6 rounded-2xl border border-slate-300 shadow-sm overflow-x-auto">
              <BeninOfficialBulletin
                bulletin={currentBulletin}
                editableSubjectId={selectedSubjectId}
                onGradeChange={(studentId, subjectId, field, val) => {
                  updateStudentGrade(
                    studentId,
                    subjectId,
                    selectedPeriodId,
                    { [field]: val },
                    MOCK_TEACHER_PROFILE.fullName
                  );
                }}
                onAppreciationChange={(studentId, subjectId, apprec) => {
                  updateStudentGrade(
                    studentId,
                    subjectId,
                    selectedPeriodId,
                    { teacherAppreciation: apprec },
                    MOCK_TEACHER_PROFILE.fullName
                  );
                }}
                onCoefChange={(subjectId, newCoef) => {
                  updateSubjectCoef(subjectId, newCoef, MOCK_TEACHER_PROFILE.fullName);
                }}
              />
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Aucun bulletin disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
