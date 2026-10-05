"use client";

import React, { useState } from "react";
import { BookOpenCheck, CheckCircle2, Lock, AlertTriangle, ShieldCheck, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordCard } from "@/components/ui/RecordCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MOCK_GRADES_CLASS_3A, MOCK_STUDENTS, StudentGrade, Student } from "@/lib/mock-data";
import { useToast } from "@/components/ui/Toast";
import { ReportCardView } from "@/components/school/ReportCardView";

export default function NotesValidationPage() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState("3ème A");
  const [selectedSubject, setSelectedSubject] = useState("Mathématiques");
  const [grades, setGrades] = useState<StudentGrade[]>(MOCK_GRADES_CLASS_3A);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | null>(null);

  const missingCount = grades.filter(
    (g) => g.interro1 === null || g.interro2 === null || g.devoir1 === null || g.devoir2 === null
  ).length;

  const allLocked = grades.every((g) => g.status === "LOCKED" || g.status === "VALIDATED");

  const handleValidateAll = () => {
    setGrades((prev) =>
      prev.map((g) => ({
        ...g,
        status: "LOCKED",
      }))
    );
    setIsConfirmOpen(false);
    toast(`Les notes de ${selectedClass} en ${selectedSubject} ont été validées et verrouillées.`, "success");
  };

  const columns: Column<StudentGrade>[] = [
    {
      key: "studentName",
      header: "Élève & Matricule",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900">{item.studentName}</span>
          <span className="block text-xs font-mono text-slate-400">{item.matricule}</span>
        </div>
      ),
    },
    {
      key: "interros",
      header: "Interrogations",
      render: (item) => (
        <span className="text-xs font-mono text-slate-700">
          Int1: {item.interro1 !== null ? item.interro1 : "-"} | Int2: {item.interro2 !== null ? item.interro2 : "-"}
        </span>
      ),
    },
    {
      key: "devoirs",
      header: "Devoirs Surveillés",
      render: (item) => (
        <span className="text-xs font-mono text-slate-700">
          Dev1: {item.devoir1 !== null ? item.devoir1 : "-"} | Dev2: {item.devoir2 !== null ? item.devoir2 : "-"}
        </span>
      ),
    },
    {
      key: "average",
      header: "Moyenne",
      render: (item) => (
        <span className="font-bold text-sm text-school-primary tabular-nums">
          {item.average !== null ? `${item.average} / 20` : "-"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (item) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      key: "actions",
      header: "Bulletin",
      render: (item) => {
        const student = MOCK_STUDENTS.find((s) => s.id === item.studentId) || {
          id: item.studentId,
          matricule: item.matricule,
          firstName: item.studentName.split(" ")[0] || "Élève",
          lastName: item.studentName.split(" ").slice(1).join(" ") || "",
          classId: "3e-a",
          className: selectedClass,
          gender: "M",
          birthDate: "2011-05-10",
          parentName: "Parent",
          parentPhone: "+229 97 00 00 00",
          status: "INSCRIT",
          average: item.average ?? 14.5,
          rank: 3,
          absencesCount: 2,
          totalTuition: 280000,
          paidTuition: 280000,
          remainingTuition: 0,
          tuitionStatus: "PAID",
        };
        return (
          <button
            type="button"
            onClick={() => setSelectedStudentForReport(student as Student)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-school-50 text-slate-700 hover:text-school-primary text-xs font-semibold border border-slate-200 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Bulletin</span>
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Validation &amp; Délibération des Notes"
        subtitle="Contrôle de complétude et verrouillage officiel avant impression des bulletins"
        breadcrumbs={[{ label: "Censeur", href: "/censeur" }, { label: "Validation des notes" }]}
        actions={
          <button
            type="button"
            disabled={allLocked}
            onClick={() => setIsConfirmOpen(true)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs md:text-sm shadow-sm touch-target ${
              allLocked
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{allLocked ? "Notes déjà verrouillées" : "Valider & Verrouiller la classe"}</span>
          </button>
        }
      />

      {/* Selectors & Completeness Indicator */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
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
              <option value="6ème B">6ème B (44 élèves)</option>
              <option value="Terminale C">Terminale C (32 élèves)</option>
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
              <option value="Mathématiques">Mathématiques (Prof. HOUNKPONOU)</option>
              <option value="Français">Français (Mme ZANNOU)</option>
              <option value="PCT">PCT (M. BIO)</option>
            </select>
          </div>
        </div>

        {/* Missing note indicator */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
          {missingCount > 0 ? (
            <>
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-amber-900 block">
                  {missingCount} note(s) manquante(s)
                </span>
                <span className="text-[11px] text-slate-500">Certaines évaluations sont incomplètes</span>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-900 block">
                  Toutes les notes sont saisies
                </span>
                <span className="text-[11px] text-slate-500">Prêt pour verrouillage définitif</span>
              </div>
            </>
          )}
        </div>
      </div>

      <DataTable
        data={grades}
        columns={columns}
        keyExtractor={(item) => item.id}
        renderMobileCard={(item) => (
          <RecordCard
            title={item.studentName}
            subtitle={item.matricule}
            badge={<StatusBadge status={item.status} size="sm" />}
            details={[
              { label: "Int1 / Int2", value: `${item.interro1 ?? "-"} / ${item.interro2 ?? "-"}` },
              { label: "Dev1 / Dev2", value: `${item.devoir1 ?? "-"} / ${item.devoir2 ?? "-"}` },
              { label: "Moyenne", value: `${item.average ?? "-"} / 20` },
            ]}
          />
        )}
      />

      {/* Sensitive Action Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Valider et verrouiller ces notes ?"
        description={`Cette action va figer définitivement les notes de ${selectedSubject} pour la classe de ${selectedClass}. Les enseignants ne pourront plus les modifier sans autorisation expresse du Censeur.`}
        confirmLabel="Oui, valider et verrouiller"
        cancelLabel="Annuler"
        onConfirm={handleValidateAll}
        onCancel={() => setIsConfirmOpen(false)}
      />

      {/* Official Report Card Modal for Deliberation */}
      {selectedStudentForReport && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-4 md:p-6 my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <ReportCardView
              student={selectedStudentForReport}
              period="1er Semestre"
              onClose={() => setSelectedStudentForReport(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
