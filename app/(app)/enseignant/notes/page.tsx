"use client";

import React, { useState, useMemo } from "react";
import {
  Save,
  Send,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  Filter,
  BarChart2,
  Calculator,
  Info,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import {
  MOCK_ACADEMIC_YEARS,
  MOCK_ACADEMIC_PERIODS,
  MOCK_BULLETIN_STUDENTS,
} from "@/lib/mock-bulletin-db";
import { useBulletinStore } from "@/lib/bulletin-store";
import { MOCK_TEACHER_PROFILE } from "@/lib/mock-teacher-db";
import { roundToTwoDecimals, getAppreciationFromGrade } from "@/lib/bulletin-utils";
import { cn } from "@/lib/utils";

interface StudentGradeEntry {
  studentId: string;
  matricule: string;
  educMasterNumber: string;
  studentName: string;
  gender: "M" | "F";
  interro1: number | null;
  interro2: number | null;
  interro3: number | null;
  devoir1: number | null;
  devoir2: number | null;
  appreciation: string;
  status: "BROUILLON" | "SOUMIS" | "VERROUILLE";
}

export default function EnseignantNotesPage() {
  const { toast } = useToast();
  const { subjects, grades, updateSubjectCoef, updateStudentGrade } = useBulletinStore();

  // Selectors
  const [selectedYear, setSelectedYear] = useState<string>("2026-2027");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("T1");
  const [selectedClassId, setSelectedClassId] = useState<string>("3e-a");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("mat-math");
  const [evalFilter, setEvalFilter] = useState<"ALL" | "INT1" | "INT2" | "INT3" | "DEV1" | "DEV2">("ALL");

  // Current Subject and Coefficient
  const currentSubject = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubjectId) || subjects[3];
  }, [subjects, selectedSubjectId]);

  const [coefInput, setCoefInput] = useState<number>(currentSubject.coef);

  React.useEffect(() => {
    setCoefInput(currentSubject.coef);
  }, [currentSubject.coef, selectedSubjectId]);

  const handleSaveCoef = () => {
    if (coefInput < 1 || coefInput > 10) {
      toast("Le coefficient doit être compris entre 1 et 10.", "error");
      return;
    }
    updateSubjectCoef(selectedSubjectId, coefInput, MOCK_TEACHER_PROFILE.fullName);
    toast(`Coefficient de « ${currentSubject.name} » fixé à ${coefInput}.`, "success");
  };

  // Selected class info
  const assignedClasses = MOCK_TEACHER_PROFILE.classesAssigned;
  const currentClassAssignment =
    assignedClasses.find((c) => c.classId === selectedClassId) || assignedClasses[0];
  const coef = currentSubject.coef;

  // Initialize grades from reactive store
  const initialStudentGrades = useMemo(() => {
    return MOCK_BULLETIN_STUDENTS.map((st) => {
      const existingGrade = grades.find(
        (g) => g.studentId === st.id && g.subjectId === selectedSubjectId && g.periodId === selectedPeriod
      );

      const i1 = typeof existingGrade?.interro1 === "number" ? existingGrade.interro1 : null;
      const i2 = typeof existingGrade?.interro2 === "number" ? existingGrade.interro2 : null;
      const i3 = typeof existingGrade?.interro3 === "number" ? existingGrade.interro3 : null;
      const d1 = typeof existingGrade?.devoir1 === "number" ? existingGrade.devoir1 : null;
      const d2 = typeof existingGrade?.devoir2 === "number" ? existingGrade.devoir2 : null;

      // Compute initial appreciation
      const validInts = [i1, i2, i3].filter((v): v is number => v !== null);
      const avgInt = validInts.length > 0 ? (i1 || 0) + (i2 || 0) + (i3 || 0) / 3 : null;
      const validNotes = [avgInt, d1, d2].filter((v): v is number => v !== null);
      const avg20 =
        avgInt !== null && d1 !== null && d2 !== null
          ? ((avgInt + d1 + d2) / 3)
          : null;

      return {
        studentId: st.id,
        matricule: st.matricule,
        educMasterNumber: st.educMasterNumber,
        studentName: `${st.lastName} ${st.firstName}`,
        gender: st.gender,
        interro1: i1,
        interro2: i2,
        interro3: i3,
        devoir1: d1,
        devoir2: d2,
        appreciation: avg20 !== null ? getAppreciationFromGrade(avg20) : "…",
        status: "BROUILLON" as const,
      };
    });
  }, []);

  const [studentsGrades, setStudentsGrades] = useState<StudentGradeEntry[]>(initialStudentGrades);
  const [gridStatus, setGridStatus] = useState<"BROUILLON" | "SOUMIS" | "VERROUILLE">("BROUILLON");
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [selectedStudentForUnlock, setSelectedStudentForUnlock] = useState<string>("");

  // Handler for individual cell changes with validation (0-20)
  const handleGradeChange = (
    studentId: string,
    field: "interro1" | "interro2" | "interro3" | "devoir1" | "devoir2",
    rawVal: string
  ) => {
    if (gridStatus === "VERROUILLE") {
      toast("La grille est verrouillée. Veuillez demander une autorisation de modification.", "error");
      return;
    }

    let parsedVal: number | null = null;
    if (rawVal.trim() !== "") {
      const clean = rawVal.replace(",", ".");
      const num = parseFloat(clean);
      if (isNaN(num) || num < 0 || num > 20) {
        toast("La note doit être un nombre décimal compris entre 0,00 et 20,00.", "info");
        return;
      }
      parsedVal = roundToTwoDecimals(num);
    }

    setStudentsGrades((prev) =>
      prev.map((item) => {
        if (item.studentId !== studentId) return item;
        const updated = { ...item, [field]: parsedVal };

        // Recalculate automatic appreciation
        const i1 = updated.interro1;
        const i2 = updated.interro2;
        const i3 = updated.interro3;
        const d1 = updated.devoir1;
        const d2 = updated.devoir2;

        if (i1 !== null && i2 !== null && i3 !== null && d1 !== null && d2 !== null) {
          const moyInt = (i1 + i2 + i3) / 3;
          const moy20 = (moyInt + d1 + d2) / 3;
          updated.appreciation = getAppreciationFromGrade(moy20);
        }
        return updated;
      })
    );
  };

  const handleAppreciationChange = (studentId: string, value: string) => {
    setStudentsGrades((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, appreciation: value } : item))
    );
  };

  // Compute row values based on the official formula:
  // (interro1 + interro2 + interro3) / 3 = moy. interro
  // (moy. interro + devoir1 + devoir2) / 3 = moy. / 20
  // note coef = moy. / 20 * coef
  const computedRows = useMemo(() => {
    return studentsGrades.map((s) => {
      const hasInts = s.interro1 !== null || s.interro2 !== null || s.interro3 !== null;
      let moyInterro: number | null = null;
      if (s.interro1 !== null && s.interro2 !== null && s.interro3 !== null) {
        moyInterro = roundToTwoDecimals((s.interro1 + s.interro2 + s.interro3) / 3);
      } else if (hasInts) {
        // partial
        const active = [s.interro1, s.interro2, s.interro3].filter((x): x is number => x !== null);
        const sum = active.reduce((a, b) => a + b, 0);
        moyInterro = roundToTwoDecimals(sum / 3);
      }

      let moySurVingt: number | null = null;
      let noteCoef: number | null = null;

      if (moyInterro !== null && s.devoir1 !== null && s.devoir2 !== null) {
        moySurVingt = roundToTwoDecimals((moyInterro + s.devoir1 + s.devoir2) / 3);
        noteCoef = roundToTwoDecimals(moySurVingt * coef);
      } else if (moyInterro !== null || s.devoir1 !== null || s.devoir2 !== null) {
        // If at least one element exists
        const components = [moyInterro, s.devoir1, s.devoir2].filter((c): c is number => c !== null);
        if (components.length > 0) {
          const sum = components.reduce((a, b) => a + b, 0);
          moySurVingt = roundToTwoDecimals(sum / 3);
          noteCoef = roundToTwoDecimals(moySurVingt * coef);
        }
      }

      return {
        ...s,
        moyInterro,
        moySurVingt,
        noteCoef,
      };
    });
  }, [studentsGrades, coef]);

  // Aggregate stats
  const stats = useMemo(() => {
    const validAverages = computedRows
      .map((r) => r.moySurVingt)
      .filter((m): m is number => m !== null);

    const totalStudents = computedRows.length;
    const completedCount = computedRows.filter(
      (r) =>
        r.interro1 !== null &&
        r.interro2 !== null &&
        r.interro3 !== null &&
        r.devoir1 !== null &&
        r.devoir2 !== null
    ).length;

    if (validAverages.length === 0) {
      return {
        classAverage: 0,
        highest: 0,
        lowest: 0,
        passRate: 0,
        completedCount,
        totalStudents,
      };
    }

    const sum = validAverages.reduce((acc, curr) => acc + curr, 0);
    const avg = roundToTwoDecimals(sum / validAverages.length);
    const highest = Math.max(...validAverages);
    const lowest = Math.min(...validAverages);
    const passCount = validAverages.filter((v) => v >= 10).length;
    const passRate = roundToTwoDecimals((passCount / validAverages.length) * 100);

    return {
      classAverage: avg,
      highest,
      lowest,
      passRate,
      completedCount,
      totalStudents,
    };
  }, [computedRows]);

  const handleSaveDraft = () => {
    studentsGrades.forEach((st) => {
      updateStudentGrade(st.studentId, selectedSubjectId, selectedPeriod, {
        interro1: st.interro1,
        interro2: st.interro2,
        interro3: st.interro3,
        devoir1: st.devoir1,
        devoir2: st.devoir2,
        teacherAppreciation: st.appreciation,
      });
    });
    toast("Grille des notes et appréciations enregistrée avec succès dans les bulletins.", "success");
  };

  const handleOpenSubmitModal = () => {
    if (stats.completedCount < stats.totalStudents) {
      toast(
        `Attention : ${stats.totalStudents - stats.completedCount} élève(s) n'ont pas encore l'ensemble des 3 interrogations et 2 devoirs.`,
        "info"
      );
    }
    setSubmitModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    setGridStatus("SOUMIS");
    setSubmitModalOpen(false);
    toast(
      "Notes soumises avec succès au Censeur des Études pour vérification et validation officielle.",
      "success"
    );
  };

  const handleRequestUnlock = (studentName?: string) => {
    setSelectedStudentForUnlock(studentName || "la classe");
    setUnlockModalOpen(true);
  };

  const handleConfirmUnlock = () => {
    setUnlockModalOpen(false);
    toast(
      `Demande d'autorisation de modification transmise au Censeur pour ${selectedStudentForUnlock}.`,
      "info"
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Saisie Pédagogique des Notes"
        subtitle="Grille conforme au cahier des charges officiel du Bénin : (Int 1 + Int 2 + Int 3) / 3 puis (Moy. Int + Dev 1 + Dev 2) / 3"
        breadcrumbs={[{ label: "Enseignant", href: "/enseignant" }, { label: "Saisie des notes" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={gridStatus === "VERROUILLE"}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs md:text-sm shadow-sm touch-target disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>Enregistrer brouillon</span>
            </button>

            {gridStatus === "BROUILLON" ? (
              <button
                type="button"
                onClick={handleOpenSubmitModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target"
              >
                <Send className="w-4 h-4" />
                <span>Soumettre pour validation</span>
              </button>
            ) : gridStatus === "SOUMIS" ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Soumis au Censeur (En vérification)</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleRequestUnlock()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-semibold text-xs touch-target"
              >
                <Unlock className="w-4 h-4" />
                <span>Demander déverrouillage</span>
              </button>
            )}
          </div>
        }
      />

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Année scolaire */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Année scolaire
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent focus:ring-1 focus:ring-school-accent"
            >
              {MOCK_ACADEMIC_YEARS.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.label} {y.isCurrent ? "(En cours)" : ""}
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
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent focus:ring-1 focus:ring-school-accent"
            >
              {MOCK_ACADEMIC_PERIODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Classe */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Classe affectée
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent focus:ring-1 focus:ring-school-accent"
            >
              {assignedClasses.map((c) => (
                <option key={c.classId} value={c.classId}>
                  {c.className} ({c.studentsCount} élèves) {c.isMain ? "⭐ Titulaire" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Matière & Coef */}
          <div className="lg:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Matière &amp; Coefficient (défini par l&apos;enseignant)
            </label>
            <div className="flex items-center gap-1.5">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full rounded-xl border border-blue-400 bg-blue-50/40 py-2 px-2 text-xs font-bold text-blue-900 focus:border-blue-600"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={coefInput}
                  onChange={(e) => setCoefInput(parseInt(e.target.value, 10) || 1)}
                  className="w-12 text-center py-2 px-1 rounded-xl border border-slate-300 font-black text-xs bg-white"
                  title="Modifier le coefficient"
                />
                <button
                  type="button"
                  onClick={handleSaveCoef}
                  className="px-2.5 py-2 rounded-xl bg-school-primary text-white text-[11px] font-bold hover:bg-school-700 shadow-2xs"
                  title="Enregistrer le coefficient"
                >
                  Fixer
                </button>
              </div>
            </div>
          </div>

          {/* Type d'évaluation / Mode d'affichage */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Filtre d&apos;évaluation
            </label>
            <select
              value={evalFilter}
              onChange={(e) => setEvalFilter(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent focus:ring-1 focus:ring-school-accent"
            >
              <option value="ALL">Toutes (Grille Complète)</option>
              <option value="INT1">Interrogation 1</option>
              <option value="INT2">Interrogation 2</option>
              <option value="INT3">Interrogation 3</option>
              <option value="DEV1">Devoir Surveillé 1</option>
              <option value="DEV2">Devoir Surveillé 2</option>
            </select>
          </div>
        </div>

        {/* Formule rappel officielle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-school-primary shrink-0" />
            <span className="font-medium">
              <strong>Formule officielle Bénin :</strong> Moy. Interro = (Int 1 + Int 2 + Int 3) ÷ 3 &bull; Moy. / 20 = (Moy. Int + Dev 1 + Dev 2) ÷ 3 &bull; Note Coef = Moy. / 20 × {coef}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] text-slate-500">Précision à 2 décimales &bull; Pas de division par zéro</span>
          </div>
        </div>
      </div>

      {/* Class KPIs live strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Complétion</span>
          <span className="text-base md:text-lg font-black text-slate-900">
            {stats.completedCount} / {stats.totalStudents}
          </span>
          <span className="text-[10px] text-slate-500 block">
            {roundToTwoDecimals((stats.completedCount / stats.totalStudents) * 100)}% notés
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Moyenne Classe</span>
          <span className="text-base md:text-lg font-black text-school-primary tabular-nums">
            {stats.classAverage.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500 block">sur 20</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Plus Forte Note</span>
          <span className="text-base md:text-lg font-black text-emerald-600 tabular-nums">
            {stats.highest.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500 block">sur 20</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Plus Faible Note</span>
          <span className="text-base md:text-lg font-black text-rose-600 tabular-nums">
            {stats.lowest.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500 block">sur 20</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Taux de Réussite</span>
          <span className="text-base md:text-lg font-black text-blue-600 tabular-nums">
            {stats.passRate}%
          </span>
          <span className="text-[10px] text-slate-500 block">&ge; 10 / 20</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Statut Grille</span>
          <span
            className={cn(
              "text-xs font-bold inline-block px-2 py-0.5 rounded-md mt-1",
              gridStatus === "BROUILLON"
                ? "bg-amber-100 text-amber-800"
                : gridStatus === "SOUMIS"
                ? "bg-blue-100 text-blue-800"
                : "bg-emerald-100 text-emerald-800"
            )}
          >
            {gridStatus === "BROUILLON" ? "Brouillon" : gridStatus === "SOUMIS" ? "Soumis" : "Verrouillé"}
          </span>
        </div>
      </div>

      {/* Main Grade Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                <th className="py-3 px-3 w-12 text-center">N°</th>
                <th className="py-3 px-3 min-w-[200px]">Élève (Nom & Prénoms)</th>
                <th className="py-3 px-2 min-w-[100px] text-slate-500">N° Educ Master</th>

                {/* 3 Interrogations */}
                {(evalFilter === "ALL" || evalFilter === "INT1") && (
                  <th className="py-3 px-2 text-center min-w-[70px] bg-amber-50/50">Int 1</th>
                )}
                {(evalFilter === "ALL" || evalFilter === "INT2") && (
                  <th className="py-3 px-2 text-center min-w-[70px] bg-amber-50/50">Int 2</th>
                )}
                {(evalFilter === "ALL" || evalFilter === "INT3") && (
                  <th className="py-3 px-2 text-center min-w-[70px] bg-amber-50/50">Int 3</th>
                )}

                {/* Moyenne Interro */}
                {evalFilter === "ALL" && (
                  <th className="py-3 px-2 text-center min-w-[80px] bg-amber-100/70 font-black text-amber-900 border-x border-amber-200">
                    Moy. Int
                  </th>
                )}

                {/* 2 Devoirs */}
                {(evalFilter === "ALL" || evalFilter === "DEV1") && (
                  <th className="py-3 px-2 text-center min-w-[70px] bg-blue-50/50">Dev 1</th>
                )}
                {(evalFilter === "ALL" || evalFilter === "DEV2") && (
                  <th className="py-3 px-2 text-center min-w-[70px] bg-blue-50/50">Dev 2</th>
                )}

                {/* Moyenne / 20 */}
                {evalFilter === "ALL" && (
                  <th className="py-3 px-2 text-center min-w-[85px] bg-emerald-100/80 font-black text-emerald-950 border-x border-emerald-200">
                    Moy. / 20
                  </th>
                )}

                {/* Note Coef */}
                {evalFilter === "ALL" && (
                  <th className="py-3 px-2 text-center min-w-[85px] bg-indigo-50 font-black text-indigo-950">
                    Note Coef ({coef})
                  </th>
                )}

                {/* Appréciation Enseignant */}
                {evalFilter === "ALL" && (
                  <th className="py-3 px-3 min-w-[180px]">Appréciation</th>
                )}

                <th className="py-3 px-2 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {computedRows.map((row, idx) => (
                <tr
                  key={row.studentId}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="py-2.5 px-3 text-center text-slate-400 font-mono font-medium">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{row.studentName}</div>
                    <span className="text-[10px] text-slate-500 font-mono">{row.matricule}</span>
                  </td>
                  <td className="py-2.5 px-2 text-[10px] font-mono text-slate-500">
                    {row.educMasterNumber}
                  </td>

                  {/* Int 1 */}
                  {(evalFilter === "ALL" || evalFilter === "INT1") && (
                    <td className="py-2 px-1 text-center bg-amber-50/20">
                      <input
                        type="text"
                        inputMode="decimal"
                        disabled={gridStatus === "VERROUILLE"}
                        value={row.interro1 !== null ? row.interro1 : ""}
                        onChange={(e) => handleGradeChange(row.studentId, "interro1", e.target.value)}
                        placeholder="-"
                        className="w-14 h-9 text-center font-bold text-xs rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </td>
                  )}

                  {/* Int 2 */}
                  {(evalFilter === "ALL" || evalFilter === "INT2") && (
                    <td className="py-2 px-1 text-center bg-amber-50/20">
                      <input
                        type="text"
                        inputMode="decimal"
                        disabled={gridStatus === "VERROUILLE"}
                        value={row.interro2 !== null ? row.interro2 : ""}
                        onChange={(e) => handleGradeChange(row.studentId, "interro2", e.target.value)}
                        placeholder="-"
                        className="w-14 h-9 text-center font-bold text-xs rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </td>
                  )}

                  {/* Int 3 */}
                  {(evalFilter === "ALL" || evalFilter === "INT3") && (
                    <td className="py-2 px-1 text-center bg-amber-50/20">
                      <input
                        type="text"
                        inputMode="decimal"
                        disabled={gridStatus === "VERROUILLE"}
                        value={row.interro3 !== null ? row.interro3 : ""}
                        onChange={(e) => handleGradeChange(row.studentId, "interro3", e.target.value)}
                        placeholder="-"
                        className="w-14 h-9 text-center font-bold text-xs rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </td>
                  )}

                  {/* Moyenne Interro (Auto) */}
                  {evalFilter === "ALL" && (
                    <td className="py-2 px-2 text-center bg-amber-50/60 font-bold tabular-nums text-amber-950 border-x border-amber-200">
                      {row.moyInterro !== null ? row.moyInterro.toFixed(2) : "…"}
                    </td>
                  )}

                  {/* Devoir 1 */}
                  {(evalFilter === "ALL" || evalFilter === "DEV1") && (
                    <td className="py-2 px-1 text-center bg-blue-50/20">
                      <input
                        type="text"
                        inputMode="decimal"
                        disabled={gridStatus === "VERROUILLE"}
                        value={row.devoir1 !== null ? row.devoir1 : ""}
                        onChange={(e) => handleGradeChange(row.studentId, "devoir1", e.target.value)}
                        placeholder="-"
                        className="w-14 h-9 text-center font-bold text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </td>
                  )}

                  {/* Devoir 2 */}
                  {(evalFilter === "ALL" || evalFilter === "DEV2") && (
                    <td className="py-2 px-1 text-center bg-blue-50/20">
                      <input
                        type="text"
                        inputMode="decimal"
                        disabled={gridStatus === "VERROUILLE"}
                        value={row.devoir2 !== null ? row.devoir2 : ""}
                        onChange={(e) => handleGradeChange(row.studentId, "devoir2", e.target.value)}
                        placeholder="-"
                        className="w-14 h-9 text-center font-bold text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </td>
                  )}

                  {/* Moyenne / 20 (Auto) */}
                  {evalFilter === "ALL" && (
                    <td
                      className={cn(
                        "py-2 px-2 text-center font-black tabular-nums border-x border-emerald-200",
                        row.moySurVingt === null
                          ? "text-slate-400 bg-slate-50"
                          : row.moySurVingt >= 10
                          ? "text-emerald-700 bg-emerald-50/60"
                          : "text-rose-600 bg-rose-50/40"
                      )}
                    >
                      {row.moySurVingt !== null ? row.moySurVingt.toFixed(2) : "…"}
                    </td>
                  )}

                  {/* Note Coef */}
                  {evalFilter === "ALL" && (
                    <td className="py-2 px-2 text-center font-bold tabular-nums text-indigo-900 bg-indigo-50/30">
                      {row.noteCoef !== null ? row.noteCoef.toFixed(2) : "…"}
                    </td>
                  )}

                  {/* Appréciation */}
                  {evalFilter === "ALL" && (
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        disabled={gridStatus === "VERROUILLE"}
                        value={row.appreciation}
                        onChange={(e) => handleAppreciationChange(row.studentId, e.target.value)}
                        placeholder="Appréciation..."
                        className="w-full h-8 px-2 text-xs rounded border border-slate-200 focus:border-school-accent focus:ring-1 focus:ring-school-accent disabled:bg-slate-100 text-slate-700"
                      />
                    </td>
                  )}

                  {/* Action */}
                  <td className="py-2 px-2 text-center">
                    {gridStatus === "VERROUILLE" && (
                      <button
                        type="button"
                        onClick={() => handleRequestUnlock(row.studentName)}
                        title="Demander une correction au Censeur"
                        className="p-1.5 text-slate-400 hover:text-school-accent rounded hover:bg-slate-100"
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for submission */}
      <ConfirmDialog
        isOpen={submitModalOpen}
        title="Soumettre les notes pour validation officielle"
        description={`Vous êtes sur le point de transmettre les notes de Mathématiques pour la classe de ${currentClassAssignment.className} (${stats.completedCount}/${stats.totalStudents} élèves complétés) au Censeur des études. Une fois validée par la direction, toute modification nécessitera un déverrouillage autorisé avec enregistrement dans le journal d'audit.`}
        confirmLabel="Confirmer et Soumettre"
        cancelLabel="Vérifier encore"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setSubmitModalOpen(false)}
      />

      {/* Request Unlock Modal */}
      <ConfirmDialog
        isOpen={unlockModalOpen}
        title="Demande d'autorisation de correction"
        description={`Souhaitez-vous soumettre une requête officielle de réouverture de la saisie pour ${selectedStudentForUnlock} au Censeur des études ?`}
        confirmLabel="Transmettre la requête"
        cancelLabel="Annuler"
        onConfirm={handleConfirmUnlock}
        onCancel={() => setUnlockModalOpen(false)}
      />
    </div>
  );
}
