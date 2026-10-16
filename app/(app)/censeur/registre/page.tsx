"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Printer,
  GraduationCap,
  Users,
  Search,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ClassRegisterPDF } from "@/components/school/ClassRegisterPDF";
import { useBulletinStore } from "@/lib/bulletin-store";
import { useDisciplineStore } from "@/lib/discipline-store";

export default function CenseurRegistrePage() {
  const { classrooms, school, years } = useBulletinStore();
  const { students } = useDisciplineStore();

  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || "3e-a");

  const selectedClass =
    classrooms.find((c) => c.id === selectedClassId) || classrooms[0];

  const classStudents = students.filter(
    (s) => s.classId === selectedClass.id
  );

  return (
    <div className="space-y-6">
      {/* Top selector */}
      <div className="no-print p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-school-primary text-white flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Sélectionnez la classe pour générer le Registre Officiel
            </h3>
            <p className="text-xs text-slate-500">
              Format officiel République du Bénin &bull; Téléchargeable et imprimable en PDF A4
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-school-primary"
          >
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.level} &bull; {c.cycle === "PRIMAIRE" ? "Primaire" : "Secondaire"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Render Official Beninese Printable Register */}
      <ClassRegisterPDF
        classroom={selectedClass}
        students={classStudents.length > 0 ? classStudents : students.slice(0, 8)}
        academicYear={years[0]}
        schoolSettings={school}
      />
    </div>
  );
}
