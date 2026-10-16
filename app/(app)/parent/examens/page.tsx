"use client";

import React, { useState, useMemo } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Printer,
  Sparkles,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChildSwitcher } from "@/components/school/ChildSwitcher";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordCard } from "@/components/ui/RecordCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useExamStore } from "@/lib/exam-store";
import { MOCK_BULLETIN_STUDENTS, MOCK_ACADEMIC_PERIODS } from "@/lib/mock-bulletin-db";
import { ExamScheduleItem } from "@/lib/types/bulletin";

export default function ParentExamensPage() {
  const { exams } = useExamStore();

  // Children: Koffi (3ème A) and Samuel (CE2 B)
  const myChildren = useMemo(() => {
    const secondaryChild =
      MOCK_BULLETIN_STUDENTS.find((s) => s.id === "std-01") || MOCK_BULLETIN_STUDENTS[0];
    const primaryChild =
      MOCK_BULLETIN_STUDENTS.find((s) => s.id === "std-p01") || MOCK_BULLETIN_STUDENTS[1];
    return [secondaryChild, primaryChild].filter(Boolean);
  }, []);

  const [selectedChild, setSelectedChild] = useState(myChildren[0]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("T1");

  // Strict isolation: only exams matching the selected child's class!
  const childExams = useMemo(() => {
    return exams.filter((ex) => {
      const matchClass = ex.classId === selectedChild.classId;
      const matchPeriod = selectedPeriodId === "ALL" || ex.periodId === selectedPeriodId;
      return matchClass && matchPeriod;
    });
  }, [exams, selectedChild.classId, selectedPeriodId]);

  const columns: Column<ExamScheduleItem>[] = [
    {
      key: "date",
      header: "Date & Horaires",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 text-xs sm:text-sm">
            {new Date(item.date).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span className="block text-[11px] font-mono text-school-primary font-bold mt-0.5">
            {item.startTime} &mdash; {item.endTime}
          </span>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Matière & Salle",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 text-xs sm:text-sm">{item.subjectName}</span>
          <span className="block text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400" />
            {item.room}
          </span>
        </div>
      ),
    },
    {
      key: "supervisor",
      header: "Surveillant(e)",
      render: (item) => (
        <span className="text-xs text-slate-700 font-medium flex items-center gap-1">
          <User className="w-3.5 h-3.5 text-slate-400" />
          {item.supervisorName}
        </span>
      ),
    },
    {
      key: "notes",
      header: "Consignes / Matériel",
      render: (item) => (
        <span className="text-xs text-slate-600 italic">
          {item.notes || "Matériel standard"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (item) => (
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
            item.status === "TERMINE"
              ? "bg-slate-100 text-slate-800"
              : item.status === "EN_COURS"
              ? "bg-emerald-100 text-emerald-800"
              : item.status === "REPORTE"
              ? "bg-amber-100 text-amber-800"
              : item.status === "ANNULE"
              ? "bg-rose-100 text-rose-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {item.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendrier des Examens & Compositions"
        subtitle={`Planning officiel des épreuves pour ${selectedChild.firstName} (${selectedChild.className})`}
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Calendrier des examens" }]}
        actions={
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer le calendrier</span>
          </button>
        }
      />

      {/* Child Switcher Component */}
      <div className="no-print">
        <ChildSwitcher
          childrenList={myChildren.map((c) => ({
            id: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            classId: c.classId,
            className: c.className,
            matricule: c.matricule,
            gender: c.gender,
            average: 15.4,
            rank: 3,
            birthDate: c.birthDate,
            parentName: c.parentName,
            parentPhone: c.parentPhone,
            status: "INSCRIT",
            absencesCount: 2,
            totalTuition: 280000,
            paidTuition: 280000,
            remainingTuition: 0,
            tuitionStatus: "PAID",
          }))}
          selectedChildId={selectedChild.id}
          onSelectChild={(child) => {
            const match = myChildren.find((c) => c.id === child.id);
            if (match) setSelectedChild(match);
          }}
        />
      </div>

      {/* Filter by trimester */}
      <div className="no-print p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Trimestre d'examen :
          </label>
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="text-xs font-semibold p-2 rounded-xl border border-slate-300 bg-white"
          >
            <option value="ALL">Tous les trimestres</option>
            {MOCK_ACADEMIC_PERIODS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Classe rattachée : <strong className="text-slate-900">{selectedChild.className}</strong> &bull; {childExams.length} épreuves programmées
        </div>
      </div>

      {childExams.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">
            Aucun examen programmé pour {selectedChild.className} sur cette période
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Le calendrier officiel des compositions et devoirs surveillés apparaîtra ici dès sa publication par le Censeur des études.
          </p>
        </div>
      ) : (
        <DataTable
          data={childExams}
          columns={columns}
          keyExtractor={(item) => item.id}
          renderMobileCard={(item) => (
            <RecordCard
              title={item.subjectName}
              subtitle={`${item.date} • ${item.startTime} - ${item.endTime}`}
              badge={<span className="text-[10px] font-bold uppercase">{item.status}</span>}
              details={[
                { label: "Salle", value: item.room },
                { label: "Surveillant", value: item.supervisorName },
                { label: "Consignes", value: item.notes || "Standard" },
              ]}
            />
          )}
        />
      )}
    </div>
  );
}
