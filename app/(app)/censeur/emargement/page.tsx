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
import { getScopedStorageKey } from "@/lib/school-context";

const getStorageKey = () => getScopedStorageKey("educogest_teacher_attendances_v2");

export default function EmargementPage() {
  const { toast } = useToast();
  const [attendances, setAttendances] = useState<TeacherAttendance[]>(() => {
    if (typeof window === "undefined") return MOCK_TEACHER_ATTENDANCES;
    try {
      const stored = localStorage.getItem(getStorageKey());
      return stored ? JSON.parse(stored) : MOCK_TEACHER_ATTENDANCES;
    } catch {
      return MOCK_TEACHER_ATTENDANCES;
    }
  });
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTeacher, setFormTeacher] = useState("Prof. Justin HOUNKPONOU");
  const [formSubject, setFormSubject] = useState("Mathématiques");
  const [formClass, setFormClass] = useState("Terminale C");
  const [formSchedule, setFormSchedule] = useState("08:00 - 10:00");
  const [formArrival, setFormArrival] = useState("07:55");
  const [formDeparture, setFormDeparture] = useState("10:00");
  const [formStatus, setFormStatus] = useState<"PRESENT" | "RETARD" | "ABSENT">("PRESENT");
  const [formHours, setFormHours] = useState(2);
  const [formNotes, setFormNotes] = useState("");

  const handleSavePointage = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: TeacherAttendance = {
      id: `ta-${Date.now()}`,
      teacherId: `tch-${Date.now()}`,
      teacherName: formTeacher,
      subject: formSubject,
      className: formClass,
      date: new Date().toISOString().split("T")[0],
      scheduledTime: formSchedule,
      arrivalHour: formStatus === "ABSENT" ? "" : formArrival,
      departureHour: formStatus === "ABSENT" ? "" : formDeparture,
      status: formStatus,
      hoursDone: formStatus === "ABSENT" ? 0 : Number(formHours) || 2,
      notes: formNotes || undefined,
    };
    const next = [newEntry, ...attendances];
    setAttendances(next);
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(next));
    } catch {}
    setIsModalOpen(false);
    toast(`Pointage enregistré avec succès pour ${formTeacher}`, "success");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Émargement &amp; Présence des Enseignants"
        subtitle="Registre officiel des heures effectuées, pointages et justifications d'absence"
        breadcrumbs={[{ label: "Censeur", href: "/censeur" }, { label: "Émargement" }]}
        actions={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
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

      {/* Modal Nouveau Pointage */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-school-primary" />
                <h3 className="font-bold text-slate-900">Enregistrer un pointage enseignant</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePointage} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Enseignant</label>
                <input
                  type="text"
                  required
                  value={formTeacher}
                  onChange={(e) => setFormTeacher(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-school-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Matière</label>
                  <input
                    type="text"
                    required
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Classe</label>
                  <input
                    type="text"
                    required
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Créneau prévu</label>
                  <input
                    type="text"
                    value={formSchedule}
                    onChange={(e) => setFormSchedule(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono"
                    placeholder="08:00 - 10:00"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Statut de présence</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="PRESENT">Présent</option>
                    <option value="RETARD">Retard</option>
                    <option value="ABSENT">Absent</option>
                  </select>
                </div>
              </div>

              {formStatus !== "ABSENT" && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Heure arrivée</label>
                    <input
                      type="time"
                      value={formArrival}
                      onChange={(e) => setFormArrival(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Heure départ</label>
                    <input
                      type="time"
                      value={formDeparture}
                      onChange={(e) => setFormDeparture(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Heures faites</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="8"
                      value={formHours}
                      onChange={(e) => setFormHours(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Observations / Justificatif (optionnel)</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ex: Arrivée 10 min de retard avec justificatif météo"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-semibold hover:bg-school-700 shadow-sm"
                >
                  Enregistrer le pointage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
