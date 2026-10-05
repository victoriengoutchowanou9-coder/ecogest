"use client";

import React, { useState } from "react";
import { Download, Award, FileText, CheckCircle2, Lock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordCard } from "@/components/ui/RecordCard";
import { ChildSwitcher } from "@/components/school/ChildSwitcher";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MOCK_STUDENTS, Student } from "@/lib/mock-data";
import { useToast } from "@/components/ui/Toast";
import { ReportCardView } from "@/components/school/ReportCardView";

interface SubjectGrade {
  subject: string;
  coef: number;
  interros: string;
  devoir: string;
  moyenne: number;
  appreciation: string;
}

const GRADES_DATA: SubjectGrade[] = [
  { subject: "Mathématiques", coef: 3, interros: "16.5 / 15.0", devoir: "17.0", moyenne: 16.3, appreciation: "Très bon travail, régulier" },
  { subject: "Français", coef: 3, interros: "14.0 / 13.5", devoir: "15.0", moyenne: 14.3, appreciation: "Bonne maîtrise de l'expression écrite" },
  { subject: "Anglais", coef: 2, interros: "17.0 / 18.0", devoir: "16.5", moyenne: 17.0, appreciation: "Excellent niveau d'anglais" },
  { subject: "PCT (Physique-Chimie)", coef: 2, interros: "15.0 / 14.0", devoir: "16.0", moyenne: 15.3, appreciation: "Bien assimilé" },
  { subject: "SVT", coef: 2, interros: "13.0 / 14.0", devoir: "14.5", moyenne: 14.0, appreciation: "Satisfaisant" },
  { subject: "Histoire-Géographie", coef: 2, interros: "15.0 / 16.0", devoir: "15.5", moyenne: 15.4, appreciation: "Très sérieux" },
];

export default function ParentNotesPage() {
  const { toast } = useToast();
  const myChildren = [MOCK_STUDENTS[0], MOCK_STUDENTS[1]];
  const [selectedChild, setSelectedChild] = useState<Student>(myChildren[0]);
  const [selectedPeriod, setSelectedPeriod] = useState("1er Semestre");
  const [showReportModal, setShowReportModal] = useState(false);

  const columns: Column<SubjectGrade>[] = [
    {
      key: "subject",
      header: "Matière",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900">{item.subject}</span>
          <span className="block text-xs text-slate-400">Coef. {item.coef}</span>
        </div>
      ),
    },
    {
      key: "interros",
      header: "Interrogations",
      render: (item) => <span className="text-xs font-mono text-slate-700">{item.interros}</span>,
    },
    {
      key: "devoir",
      header: "Devoir",
      render: (item) => <span className="text-xs font-mono text-slate-700">{item.devoir}</span>,
    },
    {
      key: "moyenne",
      header: "Moyenne / 20",
      render: (item) => (
        <span className="text-sm font-bold text-school-primary tabular-nums">
          {item.moyenne}
        </span>
      ),
    },
    {
      key: "appreciation",
      header: "Appréciation du professeur",
      render: (item) => <span className="text-xs text-slate-600 italic">{item.appreciation}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notes &amp; Bulletins Trimestriels"
        subtitle={`Relevé des évaluations de ${selectedChild.firstName} (${selectedChild.className})`}
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Notes & Bulletins" }]}
        actions={
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target"
          >
            <Download className="w-4 h-4" />
            <span>Bulletin Officiel Imprimable</span>
          </button>
        }
      />

      <ChildSwitcher
        childrenList={myChildren}
        selectedChildId={selectedChild.id}
        onSelectChild={setSelectedChild}
      />

      {/* Period Selector & General Average */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Période académique
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target min-h-[40px]"
          >
            <option value="Semestre 1">1er Semestre (Définitif)</option>
            <option value="Semestre 2">2ème Semestre (En cours)</option>
          </select>
        </div>

        <div className="flex items-center gap-3 bg-school-50 border border-school-100 px-4 py-2.5 rounded-xl">
          <Award className="w-6 h-6 text-school-primary" />
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Moyenne Générale</span>
            <span className="text-lg font-bold text-school-primary tabular-nums">
              {selectedChild.average} / 20 &middot; {selectedChild.rank}e de la classe
            </span>
          </div>
        </div>
      </div>

      {/* Responsive DataTable: converts to RecordCard under 768px */}
      <DataTable
        data={GRADES_DATA}
        columns={columns}
        keyExtractor={(item) => item.subject}
        renderMobileCard={(item) => (
          <RecordCard
            title={item.subject}
            subtitle={`Coefficient : ${item.coef}`}
            badge={
              <span className="text-sm font-bold text-school-primary bg-school-50 px-2.5 py-1 rounded-lg">
                {item.moyenne} / 20
              </span>
            }
            details={[
              { label: "Interrogations", value: item.interros },
              { label: "Devoir", value: item.devoir },
              { label: "Appréciation", value: item.appreciation },
            ]}
          />
        )}
      />

      {/* Official Report Card Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-4 md:p-6 my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <ReportCardView
              student={selectedChild}
              period={selectedPeriod}
              onClose={() => setShowReportModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
