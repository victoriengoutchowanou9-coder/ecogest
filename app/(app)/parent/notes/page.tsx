"use client";

import React, { useState, useMemo } from "react";
import {
  Download,
  Award,
  FileText,
  Printer,
  Layers,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChildSwitcher } from "@/components/school/ChildSwitcher";
import { ReportCardView } from "@/components/school/ReportCardView";
import { BeninOfficialBulletin } from "@/components/school/BeninOfficialBulletin";
import {
  MOCK_BULLETIN_STUDENTS,
  MOCK_ACADEMIC_PERIODS,
  MOCK_CLASSROOMS,
} from "@/lib/mock-bulletin-db";
import { useBulletinStore } from "@/lib/bulletin-store";
import { MOCK_STUDENTS } from "@/lib/mock-data";

export default function ParentNotesPage() {
  const { getClassBulletins, subjects, grades } = useBulletinStore();

  const myChildren = [MOCK_BULLETIN_STUDENTS[0], MOCK_BULLETIN_STUDENTS[1]];
  const [selectedChild, setSelectedChild] = useState(myChildren[0]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("T1");
  const [showFullModal, setShowFullModal] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "official">("official");

  const activePeriod = useMemo(() => {
    return (
      MOCK_ACADEMIC_PERIODS.find((p) => p.id === selectedPeriodId) ||
      MOCK_ACADEMIC_PERIODS[0]
    );
  }, [selectedPeriodId]);

  const activeClass = MOCK_CLASSROOMS[0];

  // Dynamic class calculation engine from shared reactive store
  const bulletinsMap = useMemo(() => {
    return getClassBulletins(activeClass.id, selectedPeriodId);
  }, [getClassBulletins, activeClass.id, selectedPeriodId, subjects, grades]);

  const studentBulletin = bulletinsMap.get(selectedChild.id) || bulletinsMap.values().next().value;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulletins & Évaluations Officielles"
        subtitle={`Suivi pédagogique de ${selectedChild.firstName} (${selectedChild.className}) &middot; Modèle Officiel Bénin`}
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Bulletins de notes" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / Télécharger en PDF</span>
            </button>
          </div>
        }
      />

      {/* Child Switcher Component */}
      <div className="no-print">
        <ChildSwitcher
          childrenList={myChildren.map((c) => {
            const legacy = MOCK_STUDENTS.find((s) => s.id === c.id);
            return {
              id: c.id,
              firstName: c.firstName,
              lastName: c.lastName,
              className: c.className,
              matricule: c.matricule,
              gender: c.gender,
              average: legacy?.average ?? 15.4,
              rank: legacy?.rank ?? 3,
              birthDate: c.birthDate,
              parentName: c.parentName,
              parentPhone: c.parentPhone,
              status: "INSCRIT",
              absencesCount: 2,
              totalTuition: 280000,
              paidTuition: 280000,
              remainingTuition: 0,
              tuitionStatus: "PAID",
              classId: c.classId,
            };
          })}
          selectedChildId={selectedChild.id}
          onSelectChild={(child) => {
            const found = MOCK_BULLETIN_STUDENTS.find((s) => s.id === child.id);
            if (found) setSelectedChild(found);
          }}
        />
      </div>

      {/* Top Filter and Performance Bar */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Trimestre académique
            </label>
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target min-h-[40px] focus:ring-2 focus:ring-school-primary/20"
            >
              {MOCK_ACADEMIC_PERIODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.isCurrent ? "(Trimestre Actuel)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Affichage
            </label>
            <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewMode("official")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === "official"
                    ? "bg-white text-school-primary shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Bulletin Officiel Bénin (A4)
              </button>
              <button
                type="button"
                onClick={() => setShowFullModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5 text-school-primary" />
                <span>Gestion avancée / Lot</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Student Stats Banner */}
        {studentBulletin && (
          <div className="flex items-center gap-3 bg-school-50 border border-school-100 px-4 py-2.5 rounded-xl">
            <Award className="w-7 h-7 text-school-primary shrink-0" />
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Moyenne Générale ({studentBulletin.period.name})
              </span>
              <span className="text-lg font-black text-school-primary tabular-nums">
                {studentBulletin.generalAverage.toFixed(2)} / 20 &middot; {studentBulletin.rankFormatted}
              </span>
              <span className="text-[11px] font-medium text-slate-600 block">
                Mention : <strong className="text-slate-900 uppercase">{studentBulletin.mention}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Official Benin Bulletin View */}
      {studentBulletin && (
        <div className="space-y-4">
          <div className="no-print bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>
              <strong>Aperçu conforme République du Bénin :</strong> Document A4 portrait 1 page, prêt à l&apos;impression directe ou au téléchargement PDF avec QR code et Code-barres officiels.
            </span>
            <button
              type="button"
              onClick={handlePrint}
              className="text-xs font-bold text-school-primary underline hover:text-school-700 ml-2"
            >
              Lancer l&apos;impression
            </button>
          </div>

          <div className="bg-white p-3 md:p-6 rounded-2xl border border-slate-300 shadow-sm overflow-x-auto">
            <BeninOfficialBulletin bulletin={studentBulletin} />
          </div>
        </div>
      )}

      {/* Advanced Modal / Batch Generator */}
      {showFullModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-4 md:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <ReportCardView
              studentId={selectedChild.id}
              periodId={selectedPeriodId}
              onClose={() => setShowFullModal(false)}
              allowBatch={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
