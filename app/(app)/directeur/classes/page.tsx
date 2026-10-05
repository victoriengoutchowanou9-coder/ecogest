"use client";

import React, { useState } from "react";
import { Plus, GraduationCap, Users, BookOpen, Edit, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordCard } from "@/components/ui/RecordCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { useToast } from "@/components/ui/Toast";

interface SchoolClass {
  id: string;
  name: string;
  level: string;
  room: string;
  studentsCount: number;
  mainTeacher: string;
  subjectsCount: number;
}

const INITIAL_CLASSES: SchoolClass[] = [
  { id: "c-01", name: "6ème A", level: "Premier Cycle", room: "Salle 101", studentsCount: 45, mainTeacher: "Mme Reine ZANNOU", subjectsCount: 9 },
  { id: "c-02", name: "6ème B", level: "Premier Cycle", room: "Salle 102", studentsCount: 44, mainTeacher: "M. Paul MENSAH", subjectsCount: 9 },
  { id: "c-03", name: "5ème A", level: "Premier Cycle", room: "Salle 103", studentsCount: 42, mainTeacher: "M. Roger DEGBE", subjectsCount: 9 },
  { id: "c-04", name: "3ème A", level: "Premier Cycle (Examen)", room: "Salle 201", studentsCount: 48, mainTeacher: "Prof. Justin HOUNKPONOU", subjectsCount: 11 },
  { id: "c-05", name: "1ère D", level: "Second Cycle", room: "Salle 301", studentsCount: 38, mainTeacher: "M. Pamphile BIO", subjectsCount: 10 },
  { id: "c-06", name: "Terminale C", level: "Second Cycle (Examen)", room: "Salle 304", studentsCount: 32, mainTeacher: "Prof. Justin HOUNKPONOU", subjectsCount: 11 },
];

export default function ClassesPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<SchoolClass[]>(INITIAL_CLASSES);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");

  const filtered = classes.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.mainTeacher.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === "ALL" || c.level.includes(levelFilter);
    return matchesSearch && matchesLevel;
  });

  const columns: Column<SchoolClass>[] = [
    {
      key: "name",
      header: "Classe",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900">{item.name}</span>
          <span className="block text-xs text-slate-500">{item.level}</span>
        </div>
      ),
    },
    {
      key: "room",
      header: "Salle",
      render: (item) => <span className="text-slate-700 text-xs font-mono">{item.room}</span>,
    },
    {
      key: "studentsCount",
      header: "Effectif",
      render: (item) => (
        <span className="inline-flex items-center gap-1 font-semibold text-slate-900 tabular-nums">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>{item.studentsCount} élèves</span>
        </span>
      ),
    },
    {
      key: "mainTeacher",
      header: "Professeur Principal",
      render: (item) => <span className="text-slate-700">{item.mainTeacher}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => toast(`Édition de la classe ${item.name}`, "info")}
            className="p-1.5 text-slate-500 hover:text-school-primary rounded-lg hover:bg-slate-100 touch-target"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Classes &amp; Matières"
        subtitle="Configuration des divisions pédagogiques, salles de cours et professeurs principaux"
        breadcrumbs={[{ label: "Directeur", href: "/directeur" }, { label: "Classes & Matières" }]}
        actions={
          <button
            onClick={() => toast("Formulaire de création de classe ouvert", "info")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Classe</span>
          </button>
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher une classe, professeur..."
        filters={[
          {
            key: "level",
            label: "Cycle",
            value: levelFilter,
            onChange: setLevelFilter,
            options: [
              { value: "ALL", label: "Tous les cycles" },
              { value: "Premier", label: "Premier Cycle" },
              { value: "Second", label: "Second Cycle" },
            ],
          },
        ]}
        onReset={() => {
          setSearch("");
          setLevelFilter("ALL");
        }}
      />

      {/* Responsive DataTable: switches to cards under 768px */}
      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item.id}
        renderMobileCard={(item) => (
          <RecordCard
            title={item.name}
            subtitle={item.level}
            icon={<GraduationCap className="w-5 h-5" />}
            badge={<span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">{item.room}</span>}
            details={[
              { label: "Effectif", value: `${item.studentsCount} élèves` },
              { label: "Prof. Principal", value: item.mainTeacher },
            ]}
            actions={
              <button
                onClick={() => toast(`Détails de la classe ${item.name}`, "info")}
                className="text-xs font-semibold text-school-primary hover:underline touch-target"
              >
                Gérer les matières &rarr;
              </button>
            }
          />
        )}
      />
    </div>
  );
}
