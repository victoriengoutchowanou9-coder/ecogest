"use client";

import React, { useState, useMemo } from "react";
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  User,
  Printer,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordCard } from "@/components/ui/RecordCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useExamStore } from "@/lib/exam-store";
import { useBulletinStore } from "@/lib/bulletin-store";
import { useSubscriptionStore } from "@/lib/subscription-store";
import { ExamScheduleItem } from "@/lib/types/bulletin";

export default function DirecteurExamensPage() {
  const { exams } = useExamStore();
  const { classrooms, periods } = useBulletinStore();
  const { activeSchool } = useSubscriptionStore();

  const [selectedClassId, setSelectedClassId] = useState<string>("ALL");
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filteredExams = useMemo(() => {
    return exams.filter((ex) => {
      const matchClass = selectedClassId === "ALL" || ex.classId === selectedClassId;
      const matchPeriod = selectedPeriodId === "ALL" || ex.periodId === selectedPeriodId;
      const matchSearch =
        ex.subjectName.toLowerCase().includes(search.toLowerCase()) ||
        ex.className.toLowerCase().includes(search.toLowerCase()) ||
        ex.supervisorName.toLowerCase().includes(search.toLowerCase());
      return matchClass && matchPeriod && matchSearch;
    });
  }, [exams, selectedClassId, selectedPeriodId, search]);

  const columns: Column<ExamScheduleItem>[] = [
    {
      key: "date",
      header: "Date & Horaires",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 text-xs sm:text-sm">
            {new Date(item.date).toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="block text-[11px] font-mono text-slate-500 font-semibold mt-0.5">
            {item.startTime} &mdash; {item.endTime}
          </span>
        </div>
      ),
    },
    {
      key: "class",
      header: "Classe & Période",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 text-xs sm:text-sm">{item.className}</span>
          <span className="block text-[11px] text-slate-500">{item.periodName}</span>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Matière & Lieu",
      render: (item) => (
        <div>
          <span className="font-bold text-school-primary text-xs sm:text-sm">{item.subjectName}</span>
          <span className="block text-[11px] text-slate-500 font-mono mt-0.5">{item.room}</span>
        </div>
      ),
    },
    {
      key: "supervisor",
      header: "Surveillant(e)",
      render: (item) => <span className="text-xs text-slate-700 font-medium">{item.supervisorName}</span>,
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
        title="Supervision du Calendrier des Examens"
        subtitle={`Planning officiel des évaluations trimestrielles de ${activeSchool.name}`}
        breadcrumbs={[{ label: "Directeur", href: "/directeur" }, { label: "Examens" }]}
        actions={
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer le calendrier général</span>
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Filtrer par classe
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:bg-white"
          >
            <option value="ALL">Toutes les classes</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.level})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Filtrer par trimestre / période
          </label>
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:bg-white"
          >
            <option value="ALL">Toutes les périodes</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Recherche libre
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Matière, surveillant, salle..."
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      <DataTable
        data={filteredExams}
        columns={columns}
        keyExtractor={(item) => item.id}
        renderMobileCard={(item) => (
          <RecordCard
            title={item.subjectName}
            subtitle={`${item.className} • ${item.periodName}`}
            badge={<span className="text-[10px] font-bold uppercase">{item.status}</span>}
            details={[
              { label: "Date & Heure", value: `${item.date} (${item.startTime} - ${item.endTime})` },
              { label: "Lieu", value: item.room },
              { label: "Surveillant", value: item.supervisorName },
            ]}
          />
        )}
      />
    </div>
  );
}
