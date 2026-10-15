"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Clock,
  BookOpen,
  Search,
  FileSpreadsheet,
  CheckSquare,
  Award,
  CalendarDays,
  FileText,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MOCK_TEACHER_PROFILE } from "@/lib/mock-teacher-db";
import { MOCK_BULLETIN_STUDENTS } from "@/lib/mock-bulletin-db";

export default function EnseignantClassesPage() {
  const profile = MOCK_TEACHER_PROFILE;
  const [selectedClassId, setSelectedClassId] = useState("3e-a");
  const [searchTerm, setSearchTerm] = useState("");

  const currentAssignment =
    profile.classesAssigned.find((c) => c.classId === selectedClassId) ||
    profile.classesAssigned[0];

  const students = MOCK_BULLETIN_STUDENTS.filter((s) => s.classId === selectedClassId || selectedClassId === "3e-a");

  const filteredStudents = students.filter(
    (s) =>
      `${s.lastName} ${s.firstName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.educMasterNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes Classes &amp; Cours"
        subtitle="Consultation des classes assignées, listes d'élèves, coefficients et emplois du temps"
        breadcrumbs={[{ label: "Enseignant", href: "/enseignant" }, { label: "Mes classes & cours" }]}
      />

      {/* Class Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {profile.classesAssigned.map((item) => {
          const isActive = item.classId === selectedClassId;
          return (
            <button
              key={item.classId}
              type="button"
              onClick={() => setSelectedClassId(item.classId)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                isActive
                  ? "bg-school-primary text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>{item.className}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {item.studentsCount} élèves
              </span>
            </button>
          );
        })}
      </div>

      {/* Class Overview Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-school-primary text-white flex items-center justify-center font-bold text-base">
              {currentAssignment.className.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{currentAssignment.className}</h2>
                {currentAssignment.isMain && (
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    Vous êtes Professeur Titulaire
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Matière enseignée : <strong className="text-slate-900">{currentAssignment.subject}</strong> &middot;{" "}
                Coefficient officiel : <strong className="font-mono text-school-primary">Coef. {currentAssignment.coef}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/enseignant/notes"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-school-50 text-school-primary hover:bg-school-100 text-xs font-bold transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Saisir les notes</span>
            </Link>
            <Link
              href="/enseignant/presences"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Faire l&apos;appel</span>
            </Link>
          </div>
        </div>

        {/* 3 Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500 block">Effectif total</span>
            <strong className="text-base font-bold text-slate-900 font-mono">
              {currentAssignment.studentsCount} élèves inscrits
            </strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500 block">Volume horaire</span>
            <strong className="text-base font-bold text-slate-900 font-mono">
              {currentAssignment.hoursPerWeek} heures / semaine
            </strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500 block">Horaires de cours</span>
            <strong className="text-base font-bold text-slate-900">
              Lundi 08h-10h &bull; Mercredi 09h-11h
            </strong>
          </div>
        </div>
      </div>

      {/* Student List Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Liste des élèves &middot; {currentAssignment.className}
            </h3>
            <p className="text-xs text-slate-500">
              {filteredStudents.length} élève(s) répertorié(s)
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher élève, matricule, Educ Master..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-primary/20"
            />
          </div>
        </div>

        {/* Table of Students */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10px]">
                <th className="p-3">N°</th>
                <th className="p-3">Nom &amp; Prénoms</th>
                <th className="p-3">Matricule</th>
                <th className="p-3">N° Educ Master</th>
                <th className="p-3 text-center">Sexe</th>
                <th className="p-3">Date de Naissance</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((std, idx) => (
                <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                  <td className="p-3">
                    <span className="font-bold text-slate-900 uppercase">{std.lastName}</span>{" "}
                    <span className="font-medium text-slate-800">{std.firstName}</span>
                  </td>
                  <td className="p-3 font-mono text-slate-600">{std.matricule}</td>
                  <td className="p-3 font-mono font-bold text-school-primary">{std.educMasterNumber}</td>
                  <td className="p-3 text-center font-bold text-slate-700">{std.gender}</td>
                  <td className="p-3 text-slate-600">{std.birthDate} ({std.birthPlace})</td>
                  <td className="p-3 text-right">
                    <Link
                      href="/enseignant/notes"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-school-primary hover:underline"
                    >
                      <span>Notes</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
