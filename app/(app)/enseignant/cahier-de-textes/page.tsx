"use client";

import React, { useState } from "react";
import {
  BookMarked,
  Plus,
  Calendar,
  Clock,
  BookOpen,
  FileText,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Trash2,
  Edit2,
  Printer,
  ChevronDown,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/Toast";
import {
  MOCK_CAHIER_DE_TEXTES,
  MOCK_TEACHER_PROFILE,
  CahierDeTexteEntry,
} from "@/lib/mock-teacher-db";
import { cn } from "@/lib/utils";

export default function EnseignantCahierDeTextesPage() {
  const { toast } = useToast();

  const [entries, setEntries] = useState<CahierDeTexteEntry[]>(MOCK_CAHIER_DE_TEXTES);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New entry form state
  const [formClassId, setFormClassId] = useState("3e-a");
  const [formDate, setFormDate] = useState("2026-10-15");
  const [formTimeSlot, setFormTimeSlot] = useState("08:00 - 10:00");
  const [formChapitre, setFormChapitre] = useState("");
  const [formTitre, setFormTitre] = useState("");
  const [formObjectifs, setFormObjectifs] = useState("");
  const [formResume, setFormResume] = useState("");
  const [formExercices, setFormExercices] = useState("");
  const [formExercicesDueDate, setFormExercicesDueDate] = useState("");
  const [formEvalType, setFormEvalType] = useState("");
  const [formEvalDate, setFormEvalDate] = useState("");
  const [formEvalTopics, setFormEvalTopics] = useState("");

  const filteredEntries = entries.filter((item) => {
    const matchesClass =
      selectedClassFilter === "ALL" || item.classId === selectedClassFilter;
    const matchesSearch =
      searchQuery === "" ||
      item.titreLecon.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.chapitre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.resumeContenu.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitre.trim() || !formChapitre.trim() || !formResume.trim()) {
      toast("Veuillez remplir au moins le chapitre, le titre et le résumé du cours.", "info");
      return;
    }

    const assignedClass = MOCK_TEACHER_PROFILE.classesAssigned.find(
      (c) => c.classId === formClassId
    );

    const newEntry: CahierDeTexteEntry = {
      id: `cdt-${Date.now()}`,
      classId: formClassId,
      className: assignedClass ? assignedClass.className : "Classe",
      subject: "Mathématiques",
      date: formDate,
      timeSlot: formTimeSlot,
      chapitre: formChapitre,
      titreLecon: formTitre,
      objectifs: formObjectifs,
      resumeContenu: formResume,
      exercicesAssignes: formExercices || undefined,
      exercicesDueDate: formExercicesDueDate || undefined,
      prochaineEvaluation: formEvalType
        ? {
            type: formEvalType,
            date: formEvalDate,
            topics: formEvalTopics,
          }
        : undefined,
    };

    setEntries([newEntry, ...entries]);
    setIsModalOpen(false);
    toast("Nouvelle séance enregistrée au cahier de textes avec succès !", "success");

    // Reset form
    setFormChapitre("");
    setFormTitre("");
    setFormObjectifs("");
    setFormResume("");
    setFormExercices("");
    setFormExercicesDueDate("");
    setFormEvalType("");
    setFormEvalDate("");
    setFormEvalTopics("");
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
    toast("Séance supprimée du cahier de textes.", "info");
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Cahier de Textes Pédagogique"
        subtitle="Saisie des leçons enseignées, des contenus de cours, des devoirs de maison et des prochaines évaluations"
        breadcrumbs={[{ label: "Enseignant", href: "/enseignant" }, { label: "Cahier de textes" }]}
        actions={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Renseigner une séance</span>
          </button>
        }
      />

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-auto">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Filtrer par classe
            </label>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full sm:w-56 rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent"
            >
              <option value="ALL">Toutes mes classes</option>
              {MOCK_TEACHER_PROFILE.classesAssigned.map((c) => (
                <option key={c.classId} value={c.classId}>
                  {c.className} ({c.studentsCount} élèves)
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-auto flex-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Rechercher une notion
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex : Thalès, logarithme, barycentre..."
                className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs md:text-sm text-slate-800 focus:border-school-accent"
              />
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-school-primary" />
          <span>
            {filteredEntries.length} fiche(s) de cours enregistrée(s)
          </span>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <BookMarked className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">Aucune séance trouvée</h3>
            <p className="text-xs text-slate-500 mt-1">
              Aucune fiche de cours ne correspond aux filtres appliqués.
            </p>
          </div>
        ) : (
          filteredEntries.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-slate-300 transition-colors"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs">
                    {item.className}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs">
                    {item.subject}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.date}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {item.timeSlot}
                  </span>
                </div>

                <div className="flex items-center gap-1 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      toast("Ouverture de l'impression de la fiche...", "info");
                      if (typeof window !== "undefined") {
                        window.print();
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    title="Imprimer la fiche"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Chapter */}
              <div>
                <span className="text-xs font-bold text-school-primary uppercase tracking-wider block mb-1">
                  {item.chapitre}
                </span>
                <h3 className="text-base font-bold text-slate-900">{item.titreLecon}</h3>
                {item.objectifs && (
                  <p className="text-xs text-slate-600 italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <strong>Objectifs visés :</strong> {item.objectifs}
                  </p>
                )}
              </div>

              {/* Content summary */}
              <div className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-200 p-3 rounded-xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Contenu dispensé en séance :
                </span>
                {item.resumeContenu}
              </div>

              {/* Homework and Next Evaluation badges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {/* Devoirs / Exercices */}
                {item.exercicesAssignes && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">Exercices à faire :</span>
                        {item.exercicesDueDate && (
                          <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-semibold">
                            Pour le {item.exercicesDueDate}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-amber-900">{item.exercicesAssignes}</p>
                    </div>
                  </div>
                )}

                {/* Prochaine évaluation */}
                {item.prochaineEvaluation && (
                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-950 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">Prochaine Évaluation :</span>
                        <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded font-semibold">
                          {item.prochaineEvaluation.date}
                        </span>
                      </div>
                      <p className="mt-1 font-semibold text-purple-900">
                        {item.prochaineEvaluation.type}
                      </p>
                      <p className="text-[11px] text-purple-800">
                        {item.prochaineEvaluation.topics}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for creating a new Cahier de textes entry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-school-primary" />
                <h3 className="font-bold text-slate-900 text-base">
                  Renseigner une séance au Cahier de Textes
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Classe concernée *</label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 font-semibold"
                  >
                    {MOCK_TEACHER_PROFILE.classesAssigned.map((c) => (
                      <option key={c.classId} value={c.classId}>
                        {c.className}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Date de la séance *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Créneau horaire *</label>
                  <input
                    type="text"
                    value={formTimeSlot}
                    onChange={(e) => setFormTimeSlot(e.target.value)}
                    placeholder="08:00 - 10:00"
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">
                  Chapitre du programme officiel *
                </label>
                <input
                  type="text"
                  value={formChapitre}
                  onChange={(e) => setFormChapitre(e.target.value)}
                  placeholder="Ex : Chapitre 3 : Théorème de Thalès et applications"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">
                  Titre de la leçon enseignée *
                </label>
                <input
                  type="text"
                  value={formTitre}
                  onChange={(e) => setFormTitre(e.target.value)}
                  placeholder="Ex : Propriété réciproque de Thalès dans le triangle"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">
                  Objectifs pédagogiques
                </label>
                <input
                  type="text"
                  value={formObjectifs}
                  onChange={(e) => setFormObjectifs(e.target.value)}
                  placeholder="Ex : Démontrer le parallélisme de deux droites..."
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">
                  Résumé du contenu de cours enseigné *
                </label>
                <textarea
                  rows={3}
                  value={formResume}
                  onChange={(e) => setFormResume(e.target.value)}
                  placeholder="Énoncé du théorème, cas particuliers, résolutions d'exercices d'application en classe..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                  required
                />
              </div>

              {/* Devoirs & Exercices assignés */}
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
                <span className="font-bold text-amber-900 block">Travail de maison / Exercices assignés</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={formExercices}
                      onChange={(e) => setFormExercices(e.target.value)}
                      placeholder="Ex : Exercices 19 et 20 p. 52..."
                      className="w-full rounded-lg border border-amber-300 py-1.5 px-2 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formExercicesDueDate}
                      onChange={(e) => setFormExercicesDueDate(e.target.value)}
                      placeholder="Pour le... (ex: 21 Octobre)"
                      className="w-full rounded-lg border border-amber-300 py-1.5 px-2 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Prochaine évaluation */}
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200 space-y-2">
                <span className="font-bold text-purple-900 block">Prochaine Évaluation programmée (Optionnelle)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <input
                      type="text"
                      value={formEvalType}
                      onChange={(e) => setFormEvalType(e.target.value)}
                      placeholder="Type (ex: Interro 2, Devoir 1)"
                      className="w-full rounded-lg border border-purple-300 py-1.5 px-2 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formEvalDate}
                      onChange={(e) => setFormEvalDate(e.target.value)}
                      placeholder="Date (ex: 24 Octobre 2026)"
                      className="w-full rounded-lg border border-purple-300 py-1.5 px-2 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formEvalTopics}
                      onChange={(e) => setFormEvalTopics(e.target.value)}
                      placeholder="Notions ciblées"
                      className="w-full rounded-lg border border-purple-300 py-1.5 px-2 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-school-primary text-white font-semibold hover:bg-school-700 shadow-sm"
                >
                  Enregistrer la séance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
