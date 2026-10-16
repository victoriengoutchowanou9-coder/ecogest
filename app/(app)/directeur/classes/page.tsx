"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  GraduationCap,
  Users,
  BookOpen,
  Edit,
  Trash2,
  X,
  Check,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Building2,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordCard } from "@/components/ui/RecordCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { useToast } from "@/components/ui/Toast";
import { EducationCycle, ClassRoom } from "@/lib/types/bulletin";
import { useBulletinStore } from "@/lib/bulletin-store";
import { useSubscriptionStore } from "@/lib/subscription-store";
import { useDisciplineStore } from "@/lib/discipline-store";
import { useCenseurStore } from "@/lib/censeur-store";
import { ClassRegisterPDF } from "@/components/school/ClassRegisterPDF";

const PRIMARY_LEVELS = ["CI", "CP", "CE1", "CE2", "CM1", "CM2"];
const SECONDARY_LEVELS = ["6ème", "5ème", "4ème", "3ème", "2nde", "1ère", "Terminale"];

export default function ClassesPage() {
  const { toast } = useToast();
  const { classrooms, saveClassroom, deleteClassroom, school, years } = useBulletinStore();
  const { activeSchool } = useSubscriptionStore();
  const { students } = useDisciplineStore();
  const { teacherAccounts } = useCenseurStore();

  const [registeredTeachers, setRegisteredTeachers] = useState<
    Array<{ id: string; name: string; specialty?: string }>
  >([]);

  // Charger automatiquement les professeurs enregistrés dans ECOGEST
  React.useEffect(() => {
    const list: Array<{ id: string; name: string; specialty?: string }> = [];
    const seen = new Set<string>();

    const addTeacher = (id: string, name: string, specialty?: string) => {
      const cleanName = (name || "").trim();
      const key = cleanName.toLowerCase();
      if (cleanName && !seen.has(key)) {
        seen.add(key);
        list.push({ id, name: cleanName, specialty });
      }
    };

    // 1. Depuis le registre du Censeur
    if (Array.isArray(teacherAccounts)) {
      teacherAccounts.forEach((t) => {
        addTeacher(t.id, t.name, t.specialty || t.roleTitle);
      });
    }

    // 2. Depuis le registre des utilisateurs locaux
    try {
      const rawUsers = localStorage.getItem("ecogest_school_users_registry");
      if (rawUsers) {
        const parsed = JSON.parse(rawUsers);
        if (Array.isArray(parsed)) {
          parsed.forEach((u: any) => {
            const role = (u.role || "").toLowerCase();
            if (role.includes("enseignant") || role.includes("prof")) {
              addTeacher(u.id, u.name, "Enseignant");
            }
          });
        }
      }
    } catch (e) {
      console.warn("Erreur chargement utilisateurs enseignants:", e);
    }

    // 3. Depuis l'API utilisateurs / Supabase
    fetch("/api/auth/users")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.users && Array.isArray(data.users)) {
          data.users.forEach((u: any) => {
            const role = (u.role || "").toLowerCase();
            if (role.includes("enseignant") || role.includes("prof")) {
              addTeacher(u.id, u.full_name || u.name, "Enseignant");
            }
          });
          setRegisteredTeachers([...list]);
        }
      })
      .catch(() => {});

    setRegisteredTeachers(list);
  }, [teacherAccounts]);

  const [search, setSearch] = useState("");
  const [cycleFilter, setCycleFilter] = useState<"ALL" | "PRIMAIRE" | "SECONDAIRE">("ALL");

  // State pour affichage du registre PDF
  const [selectedClassForRegister, setSelectedClassForRegister] = useState<ClassRoom | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);

  const [formName, setFormName] = useState("");
  const [formCycle, setFormCycle] = useState<EducationCycle>("SECONDAIRE");
  const [formLevel, setFormLevel] = useState("6ème");
  const [formDivision, setFormDivision] = useState("A");
  const [formStream, setFormStream] = useState("Enseignement Général");
  const [formRoom, setFormRoom] = useState("");
  const [formTeacher, setFormTeacher] = useState("");
  const [formStudentsCount, setFormStudentsCount] = useState(35);

  const schoolTeachingType = activeSchool.teachingType || "PRIMAIRE_SECONDAIRE";

  const openNewClassModal = () => {
    setEditingClass(null);
    const initialCycle: EducationCycle = schoolTeachingType === "PRIMAIRE" ? "PRIMAIRE" : "SECONDAIRE";
    const initialLvl = initialCycle === "PRIMAIRE" ? "CP" : "6ème";
    setFormCycle(initialCycle);
    setFormLevel(initialLvl);
    setFormDivision("A");
    setFormName(`${initialLvl} A`);
    setFormStream(initialCycle === "PRIMAIRE" ? "Apprentissages Fondamentaux" : "Enseignement Général");
    setFormRoom("");
    setFormTeacher("");
    setFormStudentsCount(0);
    setIsModalOpen(true);
  };

  const openEditModal = (cls: ClassRoom) => {
    setEditingClass(cls);
    setFormName(cls.name);
    setFormCycle(cls.cycle);
    setFormLevel(cls.level);
    setFormStream(cls.stream);
    setFormDivision(cls.name.split(" ").slice(1).join(" ") || "A");
    setFormRoom("");
    setFormTeacher(cls.mainTeacher);
    setFormStudentsCount(cls.size || 0);
    setIsModalOpen(true);
  };

  const handleLevelChange = (lvl: string) => {
    setFormLevel(lvl);
    setFormName(`${lvl} ${formDivision}`.trim());
  };

  const handleDivisionChange = (div: string) => {
    setFormDivision(div);
    setFormName(`${formLevel} ${div}`.trim());
  };

  const handleCycleChange = (cycle: EducationCycle) => {
    setFormCycle(cycle);
    const nextLvl = cycle === "PRIMAIRE" ? "CP" : "6ème";
    setFormLevel(nextLvl);
    setFormName(`${nextLvl} ${formDivision}`.trim());
    setFormStream(cycle === "PRIMAIRE" ? "Apprentissages Fondamentaux" : "Enseignement Général");
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const classRoomData: ClassRoom = {
      id: editingClass ? editingClass.id : `c-${Date.now()}`,
      name: formName.trim(),
      cycle: formCycle,
      level: formLevel,
      stream: formStream,
      size: Number(formStudentsCount) || 0,
      mainTeacher: formTeacher.trim() || "Non assigné",
      academicYearId: "2026-2027",
    };

    saveClassroom(classRoomData);
    toast(
      editingClass
        ? `Classe ${formName} mise à jour avec succès`
        : `Nouvelle classe ${formName} (${formCycle === "PRIMAIRE" ? "Primaire" : "Secondaire"}) enregistrée avec succès`,
      "success"
    );
    setIsModalOpen(false);
  };

  const filtered = classrooms.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.mainTeacher.toLowerCase().includes(search.toLowerCase());
    const matchesCycle = cycleFilter === "ALL" || c.cycle === cycleFilter;
    return matchesSearch && matchesCycle;
  });

  // Si l'utilisateur a cliqué sur afficher le registre PDF d'une classe
  if (selectedClassForRegister) {
    const classStudents = students.filter((s) => s.classId === selectedClassForRegister.id);
    return (
      <ClassRegisterPDF
        classroom={selectedClassForRegister}
        students={classStudents}
        academicYear={years[0]}
        schoolSettings={school}
        onBack={() => setSelectedClassForRegister(null)}
      />
    );
  }

  const columns: Column<ClassRoom>[] = [
    {
      key: "name",
      header: "Classe & Cycle",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{item.name}</span>
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
            <span className="block text-xs text-slate-500 mt-0.5">
              Niveau : {item.level} &bull; {item.stream}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "size",
      header: "Effectif",
      render: (item) => (
        <span className="inline-flex items-center gap-1 font-semibold text-slate-900 tabular-nums text-xs">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>{item.size} élèves</span>
        </span>
      ),
    },
    {
      key: "mainTeacher",
      header: "Enseignant / Prof. Principal",
      render: (item) => (
        <span className="text-slate-700 text-xs font-medium">{item.mainTeacher}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions & Registre",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setSelectedClassForRegister(item)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-school-50 text-slate-700 hover:text-school-primary text-xs font-semibold border border-slate-200 transition-colors"
            title="Consulter et imprimer le registre officiel de classe en PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Registre PDF</span>
          </button>
          <button
            type="button"
            onClick={() => openEditModal(item)}
            className="p-1.5 text-slate-500 hover:text-school-primary rounded-lg hover:bg-slate-100"
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
        title="Structure des Niveaux & Classes"
        subtitle={`Configuration des divisions pédagogiques de ${activeSchool.name} (Type : ${
          schoolTeachingType === "PRIMAIRE"
            ? "Primaire"
            : schoolTeachingType === "SECONDAIRE"
            ? "Secondaire"
            : "Primaire + Secondaire"
        })`}
        breadcrumbs={[{ label: "Directeur", href: "/directeur" }, { label: "Classes & Matières" }]}
        actions={
          <button
            type="button"
            onClick={openNewClassModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Classe</span>
          </button>
        }
      />

      {/* Teaching Type context banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-school-50 via-slate-50 to-white border border-school-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-school-primary text-white flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Type d'enseignement actif
            </h4>
            <p className="text-sm font-black text-slate-900">
              {schoolTeachingType === "PRIMAIRE"
                ? "Primaire (CI, CP, CE1, CE2, CM1, CM2)"
                : schoolTeachingType === "SECONDAIRE"
                ? "Secondaire (6ème, 5ème, 4ème, 3ème, 2nde, 1ère, Terminale)"
                : "Primaire + Secondaire (Bivalent : CI à la Terminale)"}
            </p>
          </div>
        </div>
        <Link
          href="/directeur/parametres"
          className="text-xs font-bold text-school-primary hover:underline"
        >
          Modifier le type dans les Paramètres &rarr;
        </Link>
      </div>

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher une classe, un professeur..."
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
            subtitle={`${item.cycle === "PRIMAIRE" ? "Primaire" : "Secondaire"} • Niveau : ${item.level}`}
            icon={<GraduationCap className="w-5 h-5" />}
            badge={
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                {item.size} élèves
              </span>
            }
            details={[
              { label: "Stream / Filière", value: item.stream },
              {
                label: item.cycle === "PRIMAIRE" ? "Maître titulaire" : "Prof. Principal",
                value: item.mainTeacher,
              },
            ]}
            actions={
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedClassForRegister(item)}
                  className="text-xs font-bold text-school-primary hover:underline flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Registre PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Modifier
                </button>
              </div>
            }
          />
        )}
      />

      {/* Modal Création / Édition de Classe & Division */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-school-primary" />
                <span>{editingClass ? `Modifier ${editingClass.name}` : "Créer une nouvelle classe & division"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="p-6 space-y-4">
              {/* Choix du cycle */}
              {schoolTeachingType === "PRIMAIRE_SECONDAIRE" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Cycle d&apos;enseignement
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleCycleChange("PRIMAIRE")}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        formCycle === "PRIMAIRE"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>🎒 Cycle Primaire</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCycleChange("SECONDAIRE")}
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
              )}

              {/* Choix du niveau et de la division */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Niveau officiel ({formCycle === "PRIMAIRE" ? "Primaire" : "Secondaire"})
                  </label>
                  <select
                    value={formLevel}
                    onChange={(e) => handleLevelChange(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-semibold focus:ring-2 focus:ring-school-primary"
                  >
                    {formCycle === "PRIMAIRE"
                      ? PRIMARY_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))
                      : SECONDARY_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Division / Lettre
                  </label>
                  <input
                    type="text"
                    value={formDivision}
                    onChange={(e) => handleDivisionChange(e.target.value)}
                    placeholder="Ex: A, B, C, 1, Rouge..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-primary font-bold"
                    required
                  />
                </div>
              </div>

              {/* Intitulé complet généré */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom officiel complet de la classe
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: 6ème A, CM2 B..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-school-primary/20"
                />
              </div>

              {/* Filière / Stream */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Filière / Spécialité
                </label>
                <input
                  type="text"
                  value={formStream}
                  onChange={(e) => setFormStream(e.target.value)}
                  placeholder="Ex: Enseignement Général, Scientifique (C), Littéraire (A)..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    {formCycle === "PRIMAIRE" ? "Maître(sse) Titulaire" : "Professeur Principal"} *
                  </label>
                  {registeredTeachers.length > 0 ? (
                    <select
                      required
                      value={formTeacher}
                      onChange={(e) => setFormTeacher(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-school-primary focus:outline-none"
                    >
                      <option value="">-- Sélectionner un professeur --</option>
                      {formTeacher && !registeredTeachers.some((t) => t.name.toLowerCase() === formTeacher.toLowerCase()) && (
                        <option value={formTeacher}>{formTeacher} (Assigné actuellement)</option>
                      )}
                      {registeredTeachers.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name} {t.specialty ? `(${t.specialty})` : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-amber-800">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Aucun professeur enregistré</span>
                      </p>
                      <p className="text-[11px] text-amber-700 leading-snug">
                        Veuillez d&apos;abord créer le compte du professeur dans ECOGEST avant de pouvoir l&apos;assigner comme professeur principal.
                      </p>
                      <Link
                        href="/directeur/utilisateurs"
                        className="inline-flex items-center gap-1 pt-0.5 font-bold text-xs text-school-primary hover:underline"
                      >
                        <span>Créer un compte professeur &rarr;</span>
                      </Link>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Effectif prévu</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formStudentsCount}
                    onChange={(e) => setFormStudentsCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
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
                  className="px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-sm"
                >
                  {editingClass ? "Mettre à jour" : "Créer la division"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
