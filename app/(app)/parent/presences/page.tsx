"use client";

import React, { useState } from "react";
import { Clock, CheckCircle2, AlertTriangle, XCircle, Calendar } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordCard } from "@/components/ui/RecordCard";
import { ChildSwitcher } from "@/components/school/ChildSwitcher";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MOCK_STUDENTS, Student } from "@/lib/mock-data";

interface AttendanceRecord {
  id: string;
  date: string;
  course: string;
  teacher: string;
  status: "PRESENT" | "ABSENT" | "RETARD";
  justified: boolean;
  notes?: string;
}

const ATTENDANCE_HISTORY: AttendanceRecord[] = [
  { id: "att-1", date: "28/09/2026", course: "Mathématiques (08:00 - 10:00)", teacher: "Prof. HOUNKPONOU", status: "PRESENT", justified: true },
  { id: "att-2", date: "25/09/2026", course: "Français (10:15 - 12:15)", teacher: "Mme ZANNOU", status: "RETARD", justified: true, notes: "Retard de 10 min justifié" },
  { id: "att-3", date: "22/09/2026", course: "PCT (15:00 - 17:00)", teacher: "M. BIO", status: "ABSENT", justified: true, notes: "Certificat médical transmis" },
  { id: "att-4", date: "18/09/2026", course: "Anglais (08:00 - 10:00)", teacher: "M. MENSAH", status: "PRESENT", justified: true },
];

export default function ParentPresencesPage() {
  const myChildren = [MOCK_STUDENTS[0], MOCK_STUDENTS[1]];
  const [selectedChild, setSelectedChild] = useState<Student>(myChildren[0]);

  const columns: Column<AttendanceRecord>[] = [
    {
      key: "date",
      header: "Date & Horaire",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900">{item.date}</span>
          <span className="block text-xs text-slate-500">{item.course}</span>
        </div>
      ),
    },
    {
      key: "teacher",
      header: "Enseignant",
      render: (item) => <span className="text-xs text-slate-700">{item.teacher}</span>,
    },
    {
      key: "status",
      header: "Statut",
      render: (item) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      key: "notes",
      header: "Motif / Justification",
      render: (item) => (
        <span className="text-xs text-slate-600">
          {item.notes || (item.status === "PRESENT" ? "Présence normale" : "Non justifié")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Présences &amp; Assiduité Scolaire"
        subtitle={`Historique d'assiduité en classe de ${selectedChild.firstName}`}
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Présences" }]}
      />

      <ChildSwitcher
        childrenList={myChildren}
        selectedChildId={selectedChild.id}
        onSelectChild={setSelectedChild}
      />

      {/* Summary counters */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
          <span className="text-xs font-semibold text-emerald-800 uppercase block">Présences</span>
          <span className="text-xl font-extrabold text-emerald-700 tabular-nums">98 %</span>
        </div>
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-center">
          <span className="text-xs font-semibold text-amber-800 uppercase block">Retards</span>
          <span className="text-xl font-extrabold text-amber-700 tabular-nums">1</span>
        </div>
        <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-center">
          <span className="text-xs font-semibold text-rose-800 uppercase block">Absences</span>
          <span className="text-xl font-extrabold text-rose-700 tabular-nums">2 h</span>
        </div>
      </div>

      <DataTable
        data={ATTENDANCE_HISTORY}
        columns={columns}
        keyExtractor={(item) => item.id}
        renderMobileCard={(item) => (
          <RecordCard
            title={item.course}
            subtitle={item.date}
            badge={<StatusBadge status={item.status} size="sm" />}
            details={[
              { label: "Enseignant", value: item.teacher },
              { label: "Justification", value: item.notes || "Présence normale" },
            ]}
          />
        )}
      />
    </div>
  );
}
