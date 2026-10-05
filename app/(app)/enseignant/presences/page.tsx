"use client";

import React, { useState } from "react";
import { CheckSquare, Save, Users, Calendar, Check, X, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AttendanceRow, AttendanceStatus } from "@/components/school/AttendanceRow";
import { MOCK_STUDENTS } from "@/lib/mock-data";
import { useToast } from "@/components/ui/Toast";

export default function EnseignantPresencesPage() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState("3ème A");
  const [attendances, setAttendances] = useState<Record<string, AttendanceStatus>>({
    "std-01": "PRESENT",
    "std-02": "PRESENT",
    "std-03": "RETARD",
    "std-04": "ABSENT",
    "std-05": "PRESENT",
  });

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendances((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    MOCK_STUDENTS.forEach((s) => {
      updated[s.id] = "PRESENT";
    });
    setAttendances(updated);
    toast("Tous les élèves ont été marqués Présents.", "info");
  };

  const handleSaveAttendance = () => {
    toast("Feuille d'appel enregistrée avec succès !", "success");
  };

  const presentCount = Object.values(attendances).filter((s) => s === "PRESENT").length;
  const retardCount = Object.values(attendances).filter((s) => s === "RETARD").length;
  const absentCount = Object.values(attendances).filter((s) => s === "ABSENT").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appel de Présence en Classe"
        subtitle="Pointage instantané en un tap avec boutons tactiles ergonomiques (min 44px)"
        breadcrumbs={[{ label: "Enseignant", href: "/enseignant" }, { label: "Appel & Présences" }]}
        actions={
          <button
            type="button"
            onClick={handleSaveAttendance}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer l&apos;appel</span>
          </button>
        }
      />

      {/* Control bar + Live summary */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Classe du cours
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target min-h-[40px]"
            >
              <option value="3ème A">3ème A - Mathématiques (08:00 - 10:00)</option>
              <option value="Terminale C">Terminale C - Mathématiques (10:15 - 12:15)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="self-end px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 touch-target min-h-[40px]"
          >
            Tous présents
          </button>
        </div>

        {/* Live counter badges */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            {presentCount} Présent(s)
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
            {retardCount} Retard(s)
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
            {absentCount} Absent(s)
          </span>
        </div>
      </div>

      {/* Student rows */}
      <div className="space-y-2.5">
        {MOCK_STUDENTS.map((student) => (
          <AttendanceRow
            key={student.id}
            studentName={`${student.firstName} ${student.lastName}`}
            matricule={student.matricule}
            status={attendances[student.id] || "PRESENT"}
            onChange={(newStatus) => handleStatusChange(student.id, newStatus)}
          />
        ))}
      </div>
    </div>
  );
}
