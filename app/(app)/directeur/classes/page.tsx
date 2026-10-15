"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, GraduationCap, Users, BookOpen, Edit, Trash2, X, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordCard } from "@/components/ui/RecordCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { useToast } from "@/components/ui/Toast";
import { EducationCycle } from "@/lib/types/bulletin";

interface SchoolClass {
  id: string;
  name: string;
  cycle: EducationCycle;
  level: string;
  room: string;
  studentsCount: number;
  mainTeacher: string;
  subjectsCount: number;
}

const INITIAL_CLASSES: SchoolClass[] = [
  // ─── Cycle Primaire ────────────────────────────────────────────────────────
  { id: "c-prim-01", name: "CP A", cycle: "PRIMAIRE", level: "CP", room: "Bâtiment Primaire - Salle 1", studentsCount: 32, mainTeacher: "Mme Bernadette SOSSOU", subjectsCount: 6 },
  { id: "c-prim-02", name: "CE2 B", cycle: "PRIMAIRE", level: "CE2", room: "Bâtiment Primaire - Salle 4", studentsCount: 35, mainTeacher: "M. Marcellin KPADONOU", subjectsCount: 6 },
  { id: "c-prim-03", name: "CM2 A", cycle: "PRIMAIRE", level: "CM2 (Examen CEP)", room: "Bâtiment Primaire - Salle 6", studentsCount: 38, mainTeacher: "M. Théophile AÏSSI", subjectsCount: 6 },
  // ─── Cycle Secondaire ──────────────────────────────────────────────────────
  { id: "c-01", name: "6ème A", cycle: "SECONDAIRE", level: "Premier Cycle", room: "Salle 101", studentsCount: 45, mainTeacher: "Mme Reine ZANNOU", subjectsCount: 9 },
  { id: "c-02", name: "6ème B", cycle: "SECONDAIRE", level: "Premier Cycle", room: "Salle 102", studentsCount: 44, mainTeacher: "M. Paul MENSAH", subjectsCount: 9 },
  { id: "c-03", name: "5ème A", cycle: "SECONDAIRE", level: "Premier Cycle", room: "Salle 103", studentsCount: 42, mainTeacher: "M. Roger DEGBE", subjectsCount: 9 },
  { id: "c-04", name: "3ème A", cycle: "SECONDAIRE", level: "Premier Cycle (Examen BEPC)", room: "Salle 201", studentsCount: 48, mainTeacher: "Prof. Justin HOUNKPONOU", subjectsCount: 11 },
  { id: "c-05", name: "1ère D", cycle: "SECONDAIRE", level: "Second Cycle", room: "Salle 301", studentsCount: 38, mainTeacher: "M. Pamphile BIO", subjectsCount: 10 },
  { id: "c-06", name: "Terminale C", cycle: "SECONDAIRE", level: "Second Cycle (Examen Bac)", room: "Salle 304", studentsCount: 32, mainTeacher: "Prof. Justin HOUNKPONOU", subjectsCount: 11 },
];

export default function ClassesPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<SchoolClass[]>(INITIAL_CLASSES);
  const [search, setSearch] = useState("");
  const [cycleFilter, setCycleFilter] = useState<"ALL" | "PRIMAIRE" | "SECONDAIRE">("ALL");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [formName, setFormName] = useState("");
  const [formCycle, setFormCycle] = useState<EducationCycle>("SECONDAIRE");
  const [formLevel, setFormLevel] = useState("Premier Cycle");
  const [formRoom, setFormRoom] = useState("");
  const [formTeacher, setFormTeacher] = useState("");
  const [formStudentsCount, setFormStudentsCount] = useState(35);

  const openNewClassModal = () => {
    setEditingClass(null);
    setFormName("");
    setFormCycle("SECONDAIRE");
    setFormLevel("Premier Cycle");
    setFormRoom("Salle 105");
    setFormTeacher("Prof. Justin HOUNKPONOU");
    setFormStudentsCount(35);
    setIsModalOpen(true);
  };

  const openEditModal = (cls: SchoolClass) => {
    setEditingClass(cls);
    setFormName(cls.name);
    setFormCycle(cls.cycle);
    setFormLevel(cls.level);
    setFormRoom(cls.room);
    setFormTeacher(cls.mainTeacher);
    setFormStudentsCount(cls.studentsCount);
    setIsModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingClass) {
      setClasses(
        classes.map((c) =>
          c.id === editingClass.id
            ? {
                ...c,
                name: formName.trim(),
                cycle: formCycle,
                level: formLevel,
                room: formRoom,
                mainTeacher: formTeacher,
                studentsCount: Number(formStudentsCount) || c.studentsCount,
              }
            : c
        )
      );
      toast(`Classe ${formName} mise à jour avec succès`, "success");
    } else {
      const newClass: SchoolClass = {
        id: `c-${Date.now()}`,
        name: formName.trim(),
        cycle: formCycle,
        level: formLevel,
        room: formRoom || "Salle...",
        studentsCount: Number(formStudentsCount) || 0,
        mainTeacher: formTeacher || "Non assigné",
        subjectsCount: formCycle === "PRIMAIRE" ? 6 : 10,
      };
      setClasses([...classes, newClass]);
      toast(`Nouvelle classe ${formName} (${formCycle === "PRIMAIRE" ? "Primaire" : "Secondaire"}) créée avec succès`, "success");
    }
    setIsModalOpen(false);
  };

  const filtered = classes.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.mainTeacher.toLowerCase().includes(search.toLowerCase());
    const matchesCycle = cycleFilter === "ALL" || c.cycle === cycleFilter;
    return matchesSearch && matchesCycle;
  });

  const columns: Column<SchoolClass>[] = [
    {
      key: "name",
      header: "Classe & Cycle",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{item.name}</span>
              {item.cycle === "PRIMAIRE" ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Primaire
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Secondaire
                </span>
              )}
            </div>
            <span className="block text-xs text-slate-500 mt-0.5">{item.level}</span>
          </div>
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
      header: "Enseignant / Prof. Principal",
      render: (item) => <span className="text-slate-700">{item.mainTeacher}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openEditModal(item)}
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
        subtitle="Configuration bivalente des divisions pédagogiques : Primaire (compétences) et Secondaire (notes/coefficients)"
        breadcrumbs={[{ label: "Directeur", href: "/directeur" }, { label: "Classes & Matières" }]}
        actions={
          <button
            type="button"
            onClick={openNewClassModal}
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
        searchPlaceholder="Rechercher une classe, enseignant..."
        filters={[
          {
            key: "cycle",
            label: "Cycle d'enseignement",
            value: cycleFilter,
            onChange: (val) => setCycleFilter(val as any),
            options: [
              { value: "ALL", label: "Tous les cycles" },
              { value: "PRIMAIRE", label: "Cycle Primaire (CI à CM2)" },
              { value: "SECONDAIRE", label: "Cycle Secondaire (6ème à Tle)" },
            ],
          },
        ]}
        onReset={() => {
          setSearch("");
          setCycleFilter("ALL");
        }}
      />

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item.id}
        renderMobileCard={(item) => (
          <RecordCard
            title={item.name}
            subtitle={`${item.cycle === "PRIMAIRE" ? "Primaire" : "Secondaire"} • ${item.level}`}
            icon={<GraduationCap className="w-5 h-5" />}
            badge={<span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">{item.room}</span>}
            details={[
              { label: "Effectif", value: `${item.studentsCount} élèves` },
              { label: item.cycle === "PRIMAIRE" ? "Maître titulaire" : "Prof. Principal", value: item.mainTeacher },
            ]}
            actions={
              <Link
                href="/censeur/matieres"
                className="text-xs font-semibold text-school-primary hover:underline touch-target"
              >
                Gérer les matières &rarr;
              </Link>
            }
          />
        )}
      />

      {/* Modal Créer / Modifier une classe */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-school-primary" />
                <h3 className="font-bold text-slate-900">
                  {editingClass ? `Modifier ${editingClass.name}` : "Créer une nouvelle classe"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Cycle d&apos;enseignement</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormCycle("PRIMAIRE");
                      setFormLevel("CP");
                      if (!editingClass) setFormTeacher("Mme Bernadette SOSSOU");
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      formCycle === "PRIMAIRE"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>🌱 Cycle Primaire</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormCycle("SECONDAIRE");
                      setFormLevel("Premier Cycle");
                      if (!editingClass) setFormTeacher("Prof. Justin HOUNKPONOU");
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      formCycle === "SECONDAIRE"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-800 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>🎓 Cycle Secondaire</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Nom de la classe</label>
                <input
                  type="text"
                  required
                  placeholder={formCycle === "PRIMAIRE" ? "Ex: CE2 B ou CM1 A" : "Ex: 4ème B ou 2nde C"}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-school-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Niveau pédagogique</label>
                  {formCycle === "PRIMAIRE" ? (
                    <select
                      value={formLevel}
                      onChange={(e) => setFormLevel(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="CI">CI (Cours d&apos;Initiation)</option>
                      <option value="CP">CP (Cours Préparatoire)</option>
                      <option value="CE1">CE1 (Cours Élémentaire 1)</option>
                      <option value="CE2">CE2 (Cours Élémentaire 2)</option>
                      <option value="CM1">CM1 (Cours Moyen 1)</option>
                      <option value="CM2 (Examen CEP)">CM2 (Examen CEP)</option>
                    </select>
                  ) : (
                    <select
                      value={formLevel}
                      onChange={(e) => setFormLevel(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="Premier Cycle">Premier Cycle (6e, 5e, 4e)</option>
                      <option value="Premier Cycle (Examen BEPC)">Premier Cycle (Examen BEPC - 3e)</option>
                      <option value="Second Cycle">Second Cycle (2nde, 1ère)</option>
                      <option value="Second Cycle (Examen Bac)">Second Cycle (Examen Bac - Tle)</option>
                    </select>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Salle de cours</label>
                  <input
                    type="text"
                    required
                    placeholder="Salle 104"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    {formCycle === "PRIMAIRE" ? "Maître(sse) Titulaire" : "Professeur Principal"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={formCycle === "PRIMAIRE" ? "Ex: Mme Bernadette SOSSOU" : "Ex: Prof. Justin HOUNKPONOU"}
                    value={formTeacher}
                    onChange={(e) => setFormTeacher(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Effectif d&apos;élèves</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formStudentsCount}
                    onChange={(e) => setFormStudentsCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
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
                  {editingClass ? "Mettre à jour" : "Créer la classe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
