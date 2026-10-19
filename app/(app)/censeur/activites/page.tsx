"use client";

import React, { useState, useMemo } from "react";
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  Clock,
  BookOpen,
  MapPin,
  CheckCircle,
  AlertTriangle,
  FileText,
  X,
  GraduationCap,
  Sparkles,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useCenseurStore, HomeworkProgram } from "@/lib/censeur-store";

export default function CenseurActivitesPage() {
  const {
    homeworkPrograms,
    classrooms,
    subjects,
    teachers,
    addHomeworkProgram,
    updateHomeworkStatus,
    deleteHomeworkProgram,
  } = useCenseurStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"ALL" | "DEVOIR" | "TD">("ALL");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [formType, setFormType] = useState<"DEVOIR" | "TD">("DEVOIR");
  const [formClassId, setFormClassId] = useState(classrooms[0]?.id || "3e-a");
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || "mat-math");
  const [formTeacherName, setFormTeacherName] = useState(teachers[0]?.name || "Prof. Justin HOUNKPONOU");
  const [formDate, setFormDate] = useState("2026-10-25");
  const [formTimeSlot, setFormTimeSlot] = useState("08:00 - 10:00 (2h)");
  const [formRoom, setFormRoom] = useState("Salle 12");
  const [formTitle, setFormTitle] = useState("");
  const [formInstructions, setFormInstructions] = useState("");
  const [formError, setFormError] = useState("");

  // Filters
  const filteredPrograms = useMemo(() => {
    return homeworkPrograms.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.room.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = selectedType === "ALL" || p.type === selectedType;
      const matchClass = selectedClass === "all" || p.classId === selectedClass;
      const matchStatus = selectedStatus === "all" || p.status === selectedStatus;

      return matchSearch && matchType && matchClass && matchStatus;
    });
  }, [homeworkPrograms, searchQuery, selectedType, selectedClass, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = homeworkPrograms.length;
    const devoirs = homeworkPrograms.filter((p) => p.type === "DEVOIR").length;
    const tds = homeworkPrograms.filter((p) => p.type === "TD").length;
    const programmes = homeworkPrograms.filter((p) => p.status === "PROGRAMME").length;

    return { total, devoirs, tds, programmes };
  }, [homeworkPrograms]);

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError("Veuillez renseigner l'intitulé de l'évaluation ou du TD.");
      return;
    }

    const cls = classrooms.find((c) => c.id === formClassId);
    const sub = subjects.find((s) => s.id === formSubjectId);

    // Conflict check (same room, date, and overlapping slot)
    const conflict = homeworkPrograms.find(
      (p) =>
        p.date === formDate &&
        p.room.toLowerCase().trim() === formRoom.toLowerCase().trim() &&
        p.timeSlot.split(" ")[0] === formTimeSlot.split(" ")[0]
    );

    if (conflict) {
      if (
        !confirm(
          `Attention : La salle « ${formRoom} » est déjà réservée le ${formDate} à ce créneau pour « ${conflict.title} » (${conflict.className}). Souhaitez-vous quand même enregistrer ?`
        )
      ) {
        return;
      }
    }

    addHomeworkProgram({
      type: formType,
      classId: formClassId,
      className: cls ? cls.name : formClassId,
      subjectId: formSubjectId,
      subjectName: sub ? sub.name : "Matière",
      teacherName: formTeacherName,
      date: formDate,
      timeSlot: formTimeSlot,
      room: formRoom,
      title: formTitle.trim(),
      instructions: formInstructions.trim() || "Aucune consigne spécifique.",
      status: "PROGRAMME",
    });

    setShowAddModal(false);
    setFormTitle("");
    setFormInstructions("");
    setFormError("");
  };

  const getStatusBadge = (status: HomeworkProgram["status"]) => {
    switch (status) {
      case "PROGRAMME":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            Programmé
          </span>
        );
      case "EN_COURS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5" />
            En cours
          </span>
        );
      case "TERMINE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Terminé
          </span>
        );
      case "ANNULE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Annulé
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cours, Devoirs & TD"
        subtitle="Planification académique, programmation des Devoirs Surveillés (DS) et des Travaux Dirigés"
        breadcrumbs={[{ label: "Censeur", href: "/censeur" }, { label: "Cours, Devoirs & TD" }]}
        actions={
          <button
            onClick={() => {
              setShowAddModal(true);
              setFormError("");
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-school-primary hover:bg-school-primary/90 rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Programmer un Devoir ou TD
          </button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total activités"
          value={stats.total}
          subtitle="Devoirs et TD programmés"
          icon={<CalendarDays className="w-6 h-6" />}
          variant="info"
        />
        <StatCard
          title="Devoirs Surveillés (DS)"
          value={stats.devoirs}
          subtitle="Évaluations formelles de trimestre"
          icon={<FileText className="w-6 h-6" />}
          variant="warning"
        />
        <StatCard
          title="Travaux Dirigés (TD)"
          value={stats.tds}
          subtitle="Renforcement & exercices pratiques"
          icon={<BookOpen className="w-6 h-6" />}
          variant="success"
        />
        <StatCard
          title="Sessions à venir"
          value={stats.programmes}
          subtitle="En attente d'exécution"
          icon={<Clock className="w-6 h-6" />}
          variant="default"
        />
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher intitulé, enseignant, salle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Type Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedType("ALL")}
              className={`px-3 py-1 rounded-lg transition ${
                selectedType === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedType("DEVOIR")}
              className={`px-3 py-1 rounded-lg transition ${
                selectedType === "DEVOIR" ? "bg-white text-school-primary shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Devoirs (DS)
            </button>
            <button
              onClick={() => setSelectedType("TD")}
              className={`px-3 py-1 rounded-lg transition ${
                selectedType === "TD" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Séances TD
            </button>
          </div>

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

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-school-primary"
          >
            <option value="all">Tous les états</option>
            <option value="PROGRAMME">Programmé</option>
            <option value="EN_COURS">En cours</option>
            <option value="TERMINE">Terminé</option>
            <option value="ANNULE">Annulé</option>
          </select>
        </div>
      </div>

      {/* Programmed Activities List / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrograms.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-700">Aucune activité programmée</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Aucun devoir ou TD ne correspond à vos filtres. Cliquez sur « Programmer un Devoir ou TD » pour en créer un.
            </p>
          </div>
        ) : (
          filteredPrograms.map((prog) => (
            <div
              key={prog.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        prog.type === "DEVOIR"
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : "bg-teal-100 text-teal-700 border border-teal-200"
                      }`}
                    >
                      {prog.type === "DEVOIR" ? "Devoir Surveillé" : "Séance TD"}
                    </span>
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {prog.className}
                    </span>
                  </div>
                  {getStatusBadge(prog.status)}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{prog.title}</h4>
                  <p className="text-xs font-medium text-school-primary mt-0.5">{prog.subjectName}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Date : <strong className="text-slate-800">{prog.date}</strong> ({prog.timeSlot})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Salle : <strong className="text-slate-800">{prog.room}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Professeur : {prog.teacherName}</span>
                  </div>
                </div>

                {prog.instructions && (
                  <div className="text-[11px] text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                    <strong className="text-amber-800 block mb-0.5">Consignes d&apos;examen :</strong>
                    {prog.instructions}
                  </div>
                )}
              </div>

              {/* Status Update Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">Modifier l&apos;état :</span>
                <div className="flex items-center gap-1.5">
                  <select
                    value={prog.status}
                    onChange={(e) =>
                      updateHomeworkStatus(prog.id, e.target.value as HomeworkProgram["status"])
                    }
                    className="text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:border-school-primary"
                  >
                    <option value="PROGRAMME">Programmé</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="TERMINE">Terminé</option>
                    <option value="ANNULE">Annulé</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Supprimer définitivement l'activité « ${prog.title} » ?`)) {
                        deleteHomeworkProgram(prog.id);
                      }
                    }}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                    title="Supprimer cette activité"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add Homework / TD */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Programmer un Devoir Surveillé ou un TD
                </h3>
                <p className="text-xs text-slate-500">Planification pédagogique officielle sous contrôle du Censeur</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-4">
              {formError && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Type d&apos;activité académique *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType("DEVOIR")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      formType === "DEVOIR"
                        ? "bg-rose-50 border-rose-300 text-rose-800 ring-2 ring-rose-200"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Devoir Surveillé (DS)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType("TD")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      formType === "TD"
                        ? "bg-teal-50 border-teal-300 text-teal-800 ring-2 ring-teal-200"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Travaux Dirigés (TD)
                  </button>
                </div>
              </div>

              {/* Intitulé */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Intitulé de l&apos;activité *
                </label>
                <input
                  type="text"
                  placeholder="Ex : Devoir Surveillé n°1 du 1er Trimestre"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-school-primary focus:ring-1 focus:ring-school-primary"
                  required
                />
              </div>

              {/* Class & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Classe *</label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-school-primary"
                  >
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Matière *</label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-school-primary"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Teacher & Room */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Enseignant responsable *</label>
                  <select
                    value={formTeacherName}
                    onChange={(e) => setFormTeacherName(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-school-primary"
                  >
                    {teachers.map((t) => {
                      const subjName = subjects.find((s) => s.id === t.subjectId)?.name || "Enseignant";
                      return (
                        <option key={t.id} value={t.name}>
                          {t.name} ({subjName})
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Salle d&apos;examen / TD *</label>
                  <input
                    type="text"
                    placeholder="Ex : Salle 12, Amphithéâtre..."
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-school-primary"
                    required
                  />
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date prévue *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-school-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Plage horaire *</label>
                  <input
                    type="text"
                    placeholder="Ex : 08:00 - 10:00 (2h)"
                    value={formTimeSlot}
                    onChange={(e) => setFormTimeSlot(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-school-primary"
                    required
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Consignes pédagogiques & Matériel autorisé
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex : Calculatrice non programmable autorisée, compas et règle exigés..."
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-school-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-school-primary hover:bg-school-primary/90 rounded-xl shadow-sm transition"
                >
                  Enregistrer & Publier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
