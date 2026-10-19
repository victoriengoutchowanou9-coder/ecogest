"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  GraduationCap,
  Clock,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  Award,
  Sparkles,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useCenseurStore, CenseurSubjectItem } from "@/lib/censeur-store";

export default function CenseurMatieresPage() {
  const {
    subjectsList,
    classrooms,
    teacherAccounts,
    addSubject,
    updateSubject,
    deleteSubject,
  } = useCenseurStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState("all");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<CenseurSubjectItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formCategory, setFormCategory] = useState<"LITTÉRAIRE" | "SCIENTIFIQUE" | "AUTRE">("LITTÉRAIRE");
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [formTeacherId, setFormTeacherId] = useState(teacherAccounts[0]?.id || "tea-1");
  const [formCoef, setFormCoef] = useState(2);
  const [formWeeklyHours, setFormWeeklyHours] = useState(3);
  const [formError, setFormError] = useState("");

  // Filtered List
  const filteredSubjects = useMemo(() => {
    return subjectsList.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.teacherName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchClass = selectedClass === "all" || s.classId === selectedClass;
      const matchCategory = selectedCategory === "all" || s.category === selectedCategory;
      const matchTeacher = selectedTeacher === "all" || s.teacherId === selectedTeacher;

      return matchSearch && matchClass && matchCategory && matchTeacher;
    });
  }, [subjectsList, searchQuery, selectedClass, selectedCategory, selectedTeacher]);

  // Statistics
  const stats = useMemo(() => {
    const total = subjectsList.length;
    const lit = subjectsList.filter((s) => s.category === "LITTÉRAIRE").length;
    const sci = subjectsList.filter((s) => s.category === "SCIENTIFIQUE").length;
    const totalHours = subjectsList.reduce((acc, curr) => acc + (curr.weeklyHours || 0), 0);

    return { total, lit, sci, totalHours };
  }, [subjectsList]);

  const handleOpenAddModal = () => {
    setFormName("");
    setFormCode("");
    setFormCategory("LITTÉRAIRE");
    setSelectedClassIds(classrooms.length > 0 ? [classrooms[0].id] : []);
    setFormTeacherId(teacherAccounts[0]?.id || "tea-1");
    setFormCoef(2);
    setFormWeeklyHours(3);
    setFormError("");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (subject: CenseurSubjectItem) => {
    setEditingSubject(subject);
    setFormName(subject.name);
    setFormCode(subject.code);
    setFormCategory(subject.category);
    setSelectedClassIds([subject.classId]);
    setFormTeacherId(subject.teacherId);
    setFormCoef(subject.coef);
    setFormWeeklyHours(subject.weeklyHours);
    setFormError("");
  };

  const toggleClass = (id: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      setFormError("Veuillez renseigner le nom et le code de la matière.");
      return;
    }

    if (selectedClassIds.length === 0) {
      setFormError("Veuillez sélectionner au moins une classe concernée parmi les classes de l'établissement.");
      return;
    }

    const teacher = teacherAccounts.find((t) => t.id === formTeacherId);

    if (editingSubject) {
      const targetClassId = selectedClassIds[0] || editingSubject.classId;
      const cls = classrooms.find((c) => c.id === targetClassId);
      updateSubject(editingSubject.id, {
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        category: formCategory,
        classId: targetClassId,
        className: cls ? cls.name : targetClassId,
        teacherId: formTeacherId,
        teacherName: teacher ? teacher.name : "Enseignant",
        coef: Number(formCoef),
        weeklyHours: Number(formWeeklyHours),
      });
      setEditingSubject(null);
    } else {
      // Enregistrement de la matière pour chaque classe sélectionnée
      selectedClassIds.forEach((classId) => {
        const cls = classrooms.find((c) => c.id === classId);
        addSubject({
          name: formName.trim(),
          code: formCode.trim().toUpperCase(),
          category: formCategory,
          classId: classId,
          className: cls ? cls.name : classId,
          teacherId: formTeacherId,
          teacherName: teacher ? teacher.name : "Enseignant",
          coef: Number(formCoef),
          weeklyHours: Number(formWeeklyHours),
        });
      });
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Matières"
        subtitle="Définition des disciplines, affectation aux classes, désignation des enseignants titulaires et coefficients"
        breadcrumbs={[{ label: "Censeur", href: "/censeur" }, { label: "Matières & Coefficients" }]}
        actions={
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-school-primary hover:bg-school-primary/90 rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Enregistrer une matière
          </button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total matières"
          value={stats.total}
          subtitle="Toutes classes confondues"
          icon={<BookOpen className="w-6 h-6" />}
          variant="info"
        />
        <StatCard
          title="Disciplines Littéraires"
          value={stats.lit}
          subtitle="Français, Anglais, Histoire-Géo"
          icon={<Award className="w-6 h-6" />}
          variant="default"
        />
        <StatCard
          title="Disciplines Scientifiques"
          value={stats.sci}
          subtitle="Maths, PCT, SVT"
          icon={<Sparkles className="w-6 h-6" />}
          variant="success"
        />
        <StatCard
          title="Volume horaire global"
          value={`${stats.totalHours} h/sem`}
          subtitle="Charge hebdomadaire dispensée"
          icon={<Clock className="w-6 h-6" />}
          variant="default"
        />
      </div>

      {/* Coherence Alert Banner */}
      <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-4 flex items-start gap-3.5 text-sky-900 text-xs">
        <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-sky-950">Synchronisation Pédagogique Garantie :</p>
          <p className="text-sky-800 leading-relaxed">
            Les coefficients et matières définis ici sont directement synchronisés avec l&apos;espace Enseignant
            et les bulletins de notes officiels. Toute modification est immédiatement prise en compte dans les calculs
            sans duplication de données.
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher nom, code, enseignant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-school-primary"
          >
            <option value="all">Toutes les classes</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-school-primary"
          >
            <option value="all">Toutes les catégories</option>
            <option value="LITTÉRAIRE">Littéraire</option>
            <option value="SCIENTIFIQUE">Scientifique</option>
            <option value="AUTRE">Autre discipline</option>
          </select>

          {/* Teacher Filter */}
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-school-primary"
          >
            <option value="all">Tous les enseignants</option>
            {teacherAccounts.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Liste des matières et affectations ({filteredSubjects.length})
            </h3>
            <p className="text-xs text-slate-500">
              Coefficients officiels et titulaires désignés par classe
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
            {classrooms.length} classes configurées
          </span>
        </div>

        {filteredSubjects.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-700">Aucune matière trouvée</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Aucune matière ne correspond à vos filtres. Cliquez sur « Enregistrer une matière » pour en ajouter une.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Code & Intitulé</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Classe associée</th>
                  <th className="py-3 px-4">Enseignant Titulaire</th>
                  <th className="py-3 px-4 text-center">Coefficient</th>
                  <th className="py-3 px-4 text-center">Volume horaire</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSubjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {sub.code}
                        </span>
                        <span className="font-bold text-slate-900">{sub.name}</span>
                        {sub.isConduite && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                            Note Unique
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          sub.category === "LITTÉRAIRE"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : sub.category === "SCIENTIFIQUE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {sub.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 bg-slate-100/70 px-2 py-1 rounded-md">
                        {sub.className}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-school-primary shrink-0" />
                        <span className="font-medium text-slate-900">{sub.teacherName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-school-50 text-school-primary font-bold text-xs border border-school-200">
                        {sub.coef}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-slate-700">{sub.weeklyHours} h/sem</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(sub)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                        >
                          <Edit2 className="w-3 h-3" />
                          Modifier
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Êtes-vous sûr de vouloir supprimer la matière « ${sub.name} » pour la classe ${sub.className} ?`)) {
                              deleteSubject(sub.id);
                            }
                          }}
                          className="p-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Supprimer la matière"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingSubject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingSubject ? "Modifier la matière" : "Enregistrer une nouvelle matière"}
                </h3>
                <p className="text-xs text-slate-500">
                  Paramètres officiels de la matière et synchronisation des coefficients
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingSubject(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nom & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom de la matière *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : Mathématiques"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-school-primary focus:ring-1 focus:ring-school-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Code / Raccourci *</label>
                  <input
                    type="text"
                    placeholder="Ex : MATH"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full text-xs uppercase font-mono bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-school-primary focus:ring-1 focus:ring-school-primary"
                    required
                  />
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catégorie *</label>
                <select
                  value={formCategory}
                  onChange={(e) =>
                    setFormCategory(e.target.value as "LITTÉRAIRE" | "SCIENTIFIQUE" | "AUTRE")
                  }
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-school-primary"
                >
                  <option value="LITTÉRAIRE">Littéraire (Français, Langues, HG)</option>
                  <option value="SCIENTIFIQUE">Scientifique (Maths, PCT, SVT)</option>
                  <option value="AUTRE">Autre (EPS, Dessin, Conduite, TP)</option>
                </select>
              </div>

              {/* Coefficient & Volume horaire */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Coefficient de la matière *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formCoef}
                    onChange={(e) => setFormCoef(Number(e.target.value))}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-school-primary"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Utilisé pour le calcul de la moyenne coefficientée dans le bulletin.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Volume horaire hebdomadaire (heures/semaine)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formWeeklyHours}
                    onChange={(e) => setFormWeeklyHours(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-school-primary"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Temps de cours programmé par semaine dans l&apos;emploi du temps.
                  </p>
                </div>
              </div>

              {/* Classes concernées (Alimentées automatiquement depuis les classes enregistrées par le Directeur) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Classes concernées * ({selectedClassIds.length} sélectionnée{selectedClassIds.length > 1 ? "s" : ""})
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSelectedClassIds(classrooms.map((c) => c.id))}
                      className="text-school-primary font-bold hover:underline"
                    >
                      Toutes
                    </button>
                    <span className="text-slate-300">&bull;</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedClassIds(
                          classrooms
                            .filter((c) => c.cycle === "SECONDAIRE" || !c.cycle)
                            .map((c) => c.id)
                        )
                      }
                      className="text-slate-600 font-semibold hover:underline"
                    >
                      Secondaire
                    </button>
                    <span className="text-slate-300">&bull;</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedClassIds(
                          classrooms.filter((c) => c.cycle === "PRIMAIRE").map((c) => c.id)
                        )
                      }
                      className="text-slate-600 font-semibold hover:underline"
                    >
                      Primaire
                    </button>
                    <span className="text-slate-300">&bull;</span>
                    <button
                      type="button"
                      onClick={() => setSelectedClassIds([])}
                      className="text-slate-400 hover:text-slate-600 hover:underline"
                    >
                      Effacer
                    </button>
                  </div>
                </div>

                {classrooms.length === 0 ? (
                  <div className="p-3 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                      Aucune classe n'a été enregistrée par le Directeur. Veuillez d'abord créer les classes dans le compte Directeur (rubrique Classes) pour pouvoir leur associer des matières.
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    {classrooms.map((c) => {
                      const isChecked = selectedClassIds.includes(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => toggleClass(c.id)}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition select-none ${
                            isChecked
                              ? "bg-white border-school-primary text-school-primary shadow-xs ring-1 ring-school-primary/20"
                              : "bg-white/70 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by div onClick
                            className="rounded text-school-primary focus:ring-school-primary w-3.5 h-3.5 pointer-events-none"
                          />
                          <span className="truncate">{c.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <p className="text-[10px] text-slate-500">
                  Exemple : Mathématiques (Coeff : 4) &rarr; Classes : 6e, 5e, 4e, 3e.
                </p>
              </div>

              {/* Enseignant Titulaire / Responsable */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enseignant Titulaire / Responsable
                </label>
                <select
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-school-primary"
                >
                  {teacherAccounts.length > 0 ? (
                    teacherAccounts.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.specialty})
                      </option>
                    ))
                  ) : (
                    <option value="tea-default">Enseignant de la matière</option>
                  )}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingSubject(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-school-primary hover:bg-school-primary/90 rounded-xl shadow-sm transition"
                >
                  {editingSubject ? "Mettre à jour" : "Enregistrer la matière"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
