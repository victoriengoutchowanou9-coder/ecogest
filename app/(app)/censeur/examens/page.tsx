"use client";

import React, { useState, useMemo } from "react";
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  User,
  BookOpen,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordCard } from "@/components/ui/RecordCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { useExamStore } from "@/lib/exam-store";
import { useBulletinStore } from "@/lib/bulletin-store";
import { ExamScheduleItem } from "@/lib/types/bulletin";

export default function CenseurExamensPage() {
  const { toast } = useToast();
  const { exams, addExam, updateExam, deleteExam } = useExamStore();
  const { classrooms, subjects, periods } = useBulletinStore();

  const [selectedClassId, setSelectedClassId] = useState<string>("ALL");
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamScheduleItem | null>(null);

  const [formClassId, setFormClassId] = useState(classrooms[0]?.id || "");
  const [formPeriodId, setFormPeriodId] = useState("T1");
  const [formSubjectName, setFormSubjectName] = useState(subjects[0]?.name || "");
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [formStartTime, setFormStartTime] = useState("08:00");
  const [formEndTime, setFormEndTime] = useState("11:00");
  const [formRoom, setFormRoom] = useState("");
  const [formSupervisor, setFormSupervisor] = useState("");
  const [formStatus, setFormStatus] = useState<ExamScheduleItem["status"]>("PROGRAMME");
  const [formNotes, setFormNotes] = useState("");

  // Time Picker Modal State (Responsive & Persistant)
  const [timePickerTarget, setTimePickerTarget] = useState<"start" | "end" | null>(null);
  const [pickerHour, setPickerHour] = useState("08");
  const [pickerMinute, setPickerMinute] = useState("00");

  const openTimePicker = (target: "start" | "end") => {
    const currentTime = target === "start" ? formStartTime : formEndTime;
    const parts = (currentTime || "08:00").split(":");
    setPickerHour(parts[0] || "08");
    setPickerMinute(parts[1] || "00");
    setTimePickerTarget(target);
  };

  const handleApplyTime = () => {
    const formatted = `${pickerHour.padStart(2, "0")}:${pickerMinute.padStart(2, "0")}`;
    if (timePickerTarget === "start") {
      setFormStartTime(formatted);
    } else if (timePickerTarget === "end") {
      setFormEndTime(formatted);
    }
    setTimePickerTarget(null);
  };

  const handleClearTime = () => {
    if (timePickerTarget === "start") {
      setFormStartTime("00:00");
    } else if (timePickerTarget === "end") {
      setFormEndTime("00:00");
    }
    setTimePickerTarget(null);
  };

  const filteredExams = useMemo(() => {
    return exams.filter((ex) => {
      const matchClass = selectedClassId === "ALL" || ex.classId === selectedClassId;
      const matchPeriod = selectedPeriodId === "ALL" || ex.periodId === selectedPeriodId;
      const matchSearch =
        ex.subjectName.toLowerCase().includes(search.toLowerCase()) ||
        ex.className.toLowerCase().includes(search.toLowerCase()) ||
        ex.supervisorName.toLowerCase().includes(search.toLowerCase()) ||
        ex.room.toLowerCase().includes(search.toLowerCase());
      return matchClass && matchPeriod && matchSearch;
    });
  }, [exams, selectedClassId, selectedPeriodId, search]);

  const openNewModal = () => {
    setEditingExam(null);
    setFormClassId(classrooms[0]?.id || "");
    setFormPeriodId("T1");
    setFormSubjectName(subjects[0]?.name || "");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormStartTime("08:00");
    setFormEndTime("11:00");
    setFormRoom("");
    setFormSupervisor("");
    setFormStatus("PROGRAMME");
    setFormNotes("");
    setIsModalOpen(true);
  };

  const openEditModal = (ex: ExamScheduleItem) => {
    setEditingExam(ex);
    setFormClassId(ex.classId);
    setFormPeriodId(ex.periodId);
    setFormSubjectName(ex.subjectName);
    setFormDate(ex.date);
    setFormStartTime(ex.startTime);
    setFormEndTime(ex.endTime);
    setFormRoom(ex.room);
    setFormSupervisor(ex.supervisorName);
    setFormStatus(ex.status);
    setFormNotes(ex.notes || "");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = classrooms.find((c) => c.id === formClassId) || classrooms[0];
    const targetPeriod = periods.find((p) => p.id === formPeriodId) || periods[0];

    if (editingExam) {
      updateExam(editingExam.id, {
        classId: formClassId,
        className: targetClass.name,
        periodId: formPeriodId,
        periodName: targetPeriod.name,
        subjectName: formSubjectName,
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        room: formRoom,
        supervisorName: formSupervisor,
        status: formStatus,
        notes: formNotes.trim(),
      });
      toast(`Épreuve de ${formSubjectName} mise à jour avec succès.`, "success");
    } else {
      addExam({
        classId: formClassId,
        className: targetClass.name,
        periodId: formPeriodId,
        periodName: targetPeriod.name,
        subjectId: `mat-${Date.now()}`,
        subjectName: formSubjectName,
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        room: formRoom,
        supervisorName: formSupervisor,
        status: formStatus,
        notes: formNotes.trim(),
      });
      toast(`Nouvel examen de ${formSubjectName} programmé pour la classe ${targetClass.name}.`, "success");
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Confirmez-vous la suppression de l'examen de ${name} du calendrier officiel ?`)) {
      deleteExam(id);
      toast(`Examen de ${name} supprimé du calendrier.`, "info");
    }
  };

  const columns: Column<ExamScheduleItem>[] = [
    {
      key: "date",
      header: "Date & Horaires",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 text-xs sm:text-sm">
            {new Date(item.date).toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="block text-[11px] font-mono text-slate-500 font-semibold mt-0.5">
            {item.startTime} &mdash; {item.endTime}
          </span>
        </div>
      ),
    },
    {
      key: "class",
      header: "Classe & Période",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 text-xs sm:text-sm">{item.className}</span>
          <span className="block text-[11px] text-slate-500">{item.periodName}</span>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Matière & Salle",
      render: (item) => (
        <div>
          <span className="font-bold text-school-primary text-xs sm:text-sm">{item.subjectName}</span>
          <span className="block text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400" />
            {item.room}
          </span>
        </div>
      ),
    },
    {
      key: "supervisor",
      header: "Surveillant(e) / Titulaire",
      render: (item) => (
        <span className="text-xs text-slate-700 font-medium flex items-center gap-1">
          <User className="w-3.5 h-3.5 text-slate-400" />
          {item.supervisorName}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (item) => (
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
            item.status === "TERMINE"
              ? "bg-slate-100 text-slate-800"
              : item.status === "EN_COURS"
              ? "bg-emerald-100 text-emerald-800"
              : item.status === "REPORTE"
              ? "bg-amber-100 text-amber-800"
              : item.status === "ANNULE"
              ? "bg-rose-100 text-rose-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => openEditModal(item)}
            className="p-1.5 text-slate-500 hover:text-school-primary rounded-lg hover:bg-slate-100"
            title="Modifier l'examen"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(item.id, item.subjectName)}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
            title="Supprimer l'examen"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planification & Calendrier des Examens"
        subtitle="Gestion officielle du calendrier d'épreuves et de compositions par classe et par trimestre"
        breadcrumbs={[{ label: "Censeur", href: "/censeur" }, { label: "Examens" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer le calendrier</span>
            </button>
            <button
              type="button"
              onClick={openNewModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Programmer un examen</span>
            </button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Filtrer par classe
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:bg-white"
          >
            <option value="ALL">Toutes les classes</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.level})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Filtrer par trimestre / période
          </label>
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:bg-white"
          >
            <option value="ALL">Toutes les périodes</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Recherche libre
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Matière, surveillant, salle..."
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={filteredExams}
        columns={columns}
        keyExtractor={(item) => item.id}
        renderMobileCard={(item) => (
          <RecordCard
            title={item.subjectName}
            subtitle={`${item.className} • ${item.periodName}`}
            badge={<span className="text-[10px] font-bold uppercase">{item.status}</span>}
            details={[
              { label: "Date & Heure", value: `${item.date} (${item.startTime} - ${item.endTime})` },
              { label: "Salle", value: item.room },
              { label: "Surveillant", value: item.supervisorName },
            ]}
            actions={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="text-xs font-semibold text-school-primary hover:underline"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.subjectName)}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Supprimer
                </button>
              </div>
            }
          />
        )}
      />

      {/* Modal Programmation / Modification d'Examen */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-school-primary" />
                <span>{editingExam ? "Modifier l'épreuve d'examen" : "Programmer une nouvelle épreuve"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Classe</label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                    required
                  >
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.level})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trimestre / Période
                  </label>
                  <select
                    value={formPeriodId}
                    onChange={(e) => setFormPeriodId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                    required
                  >
                    {periods.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Matière de l'examen
                </label>
                <input
                  type="text"
                  value={formSubjectName}
                  onChange={(e) => setFormSubjectName(e.target.value)}
                  placeholder="Ex: Mathématiques, Français (Dissertation)..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Heure de Début
                  </label>
                  <button
                    type="button"
                    onClick={() => openTimePicker("start")}
                    className="w-full flex items-center justify-between text-xs p-2.5 rounded-xl border border-slate-300 bg-white hover:border-school-primary font-mono font-bold text-slate-800 transition"
                    title="Cliquer pour définir l'heure de début"
                  >
                    <span>{formStartTime || "--:--"}</span>
                    <Clock className="w-3.5 h-3.5 text-school-primary shrink-0" />
                  </button>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Heure de Fin
                  </label>
                  <button
                    type="button"
                    onClick={() => openTimePicker("end")}
                    className="w-full flex items-center justify-between text-xs p-2.5 rounded-xl border border-slate-300 bg-white hover:border-school-primary font-mono font-bold text-slate-800 transition"
                    title="Cliquer pour définir l'heure de fin"
                  >
                    <span>{formEndTime || "--:--"}</span>
                    <Clock className="w-3.5 h-3.5 text-school-primary shrink-0" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salle / Lieu</label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    placeholder="Ex: Salle 12, Amphi..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enseignant ou Surveillant
                  </label>
                  <input
                    type="text"
                    value={formSupervisor}
                    onChange={(e) => setFormSupervisor(e.target.value)}
                    placeholder="Ex: Surveillant de salle"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Statut</label>
                  <select
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(e.target.value as ExamScheduleItem["status"])
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="PROGRAMME">PROGRAMMÉ</option>
                    <option value="EN_COURS">EN COURS</option>
                    <option value="TERMINE">TERMINÉ</option>
                    <option value="REPORTE">REPORTÉ</option>
                    <option value="ANNULE">ANNULÉ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Consignes / Notes d'examen
                  </label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Calculatrices autorisées, blouse..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white font-bold text-xs shadow-sm"
                >
                  {editingExam ? "Mettre à jour" : "Publier l'examen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fenêtre de définition de l'heure (100% responsive, boutons Effacer/Annuler/Définir toujours visibles) */}
      {timePickerTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[340px] sm:max-w-sm overflow-hidden p-4 sm:p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-school-primary" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  {timePickerTarget === "start" ? "Définir l'heure de début" : "Définir l'heure de fin"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setTimePickerTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Aperçu grand format */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Heure sélectionnée
              </span>
              <div className="text-2xl sm:text-3xl font-mono font-black text-school-primary tracking-wider">
                {pickerHour.padStart(2, "0")} : {pickerMinute.padStart(2, "0")}
              </div>
            </div>

            {/* Sélecteur Heures & Minutes */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Heure (00h à 23h)
                </label>
                <div className="grid grid-cols-6 gap-1 max-h-28 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                  {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setPickerHour(h)}
                      className={`py-1 rounded-lg text-xs font-mono font-bold transition ${
                        pickerHour === h
                          ? "bg-school-primary text-white shadow-sm"
                          : "text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Minutes</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["00", "15", "30", "45"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPickerMinute(m)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                        pickerMinute === m
                          ? "bg-school-primary text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      :{m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Boutons d'action : 100% responsive, espacement réduit et optimisé, aucun bouton caché */}
            <div className="grid grid-cols-3 gap-2 w-full pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClearTime}
                className="w-full py-2 px-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-center truncate"
              >
                Effacer
              </button>
              <button
                type="button"
                onClick={() => setTimePickerTarget(null)}
                className="w-full py-2 px-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition text-center truncate"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleApplyTime}
                className="w-full py-2 px-2 text-xs font-bold text-white bg-school-primary hover:bg-school-700 rounded-xl transition shadow-sm text-center truncate"
              >
                Définir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
