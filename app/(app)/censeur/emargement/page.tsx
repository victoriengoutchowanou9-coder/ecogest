"use client";

import React, { useState } from "react";
import { UserCheck, Clock, Check, X, AlertTriangle, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordCard } from "@/components/ui/RecordCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MOCK_TEACHER_ATTENDANCES, TeacherAttendance } from "@/lib/mock-data";
import { useToast } from "@/components/ui/Toast";

export default function EmargementPage() {
  const { toast } = useToast();
  const [attendances, setAttendances] = useState<TeacherAttendance[]>(MOCK_TEACHER_ATTENDANCES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = attendances.filter((a) => {
    const matchesSearch =
      a.teacherName.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase()) ||
      a.className.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<TeacherAttendance>[] = [
    {
      key: "teacherName",
      header: "Enseignant & Cours",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900">{item.teacherName}</span>
          <span className="block text-xs text-slate-500">
            {item.subject} &middot; {item.className}
          </span>
        </div>
      ),
    },
    {
      key: "scheduledTime",
      header: "Horaire prévu",
      render: (item) => <span className="text-xs font-mono text-slate-700">{item.scheduledTime}</span>,
    },
    {
      key: "arrivalHour",
      header: "Pointage",
      render: (item) => (
        <span className="text-xs font-mono text-slate-700">
          {item.arrivalHour ? `${item.arrivalHour} - ${item.departureHour || "..."}` : "-"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (item) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      key: "hoursDone",
      header: "Heures",
      render: (item) => (
        <span className="text-xs font-bold text-slate-800 tabular-nums">
          {item.hoursDone} h
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Émargement &amp; Présence des Enseignants"
        subtitle="Registre officiel des heures effectuées, pointages et justifications d'absence"
        breadcrumbs={[{ label: "Censeur", href: "/censeur" }, { label: "Émargement" }]}
        actions={
          <button
            onClick={() => toast("Enregistrement rapide d'un pointage", "info")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-school-primary text-white font-semibold text-xs md:text-sm hover:bg-school-700 shadow-sm touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Pointage</span>
          </button>
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un professeur, matière, classe..."
        filters={[
          {
            key: "status",
            label: "Statut",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "ALL", label: "Tous les statuts" },
              { value: "PRESENT", label: "Présent" },
              { value: "RETARD", label: "Retard" },
              { value: "ABSENT", label: "Absent" },
            ],
          },
        ]}
        onReset={() => {
          setSearch("");
          setStatusFilter("ALL");
        }}
      />

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item.id}
        renderMobileCard={(item) => (
          <RecordCard
            title={item.teacherName}
            subtitle={`${item.subject} (${item.className})`}
            badge={<StatusBadge status={item.status} size="sm" />}
            details={[
              { label: "Horaire", value: item.scheduledTime },
              { label: "Pointage", value: item.arrivalHour ? `${item.arrivalHour} - ${item.departureHour || "..."}` : "-" },
              { label: "Heures", value: `${item.hoursDone} h` },
              { label: "Observations", value: item.notes || "Aucune" },
            ]}
          />
        )}
      />
    </div>
  );
}
