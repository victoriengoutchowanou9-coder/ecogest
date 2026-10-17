"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Calendar,
  X,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useSecretariatStore, AdminCalendarEvent } from "@/lib/secretariat-store";
import { useToast } from "@/components/ui/Toast";

export default function SecretariatAgendaPage() {
  const { toast } = useToast();
  const { events, addEvent, classrooms } = useSecretariatStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState<AdminCalendarEvent["type"]>("REUNION");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("09:00");
  const [location, setLocation] = useState("Salle de réunion");
  const [targetAudience, setTargetAudience] = useState<AdminCalendarEvent["targetAudience"]>("TOUS");
  const [description, setDescription] = useState("");

  const filteredEvents = events.filter((e) => {
    if (filterType === "ALL") return true;
    return e.type === filterType;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast("Veuillez renseigner un titre pour l'événement.", "error");
      return;
    }

    addEvent({
      title: title.trim(),
      type,
      date,
      time,
      location: location.trim(),
      targetAudience,
      description: description.trim(),
      createdBy: "Secrétariat Pédagogique",
    });

    toast("Événement ou réunion programmé(e) avec succès.", "success");
    setIsAddModalOpen(false);
    setTitle("");
    setDescription("");
  };

  const getEventBadge = (type: AdminCalendarEvent["type"]) => {
    switch (type) {
      case "REUNION":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Réunion</span>;
      case "CONVOCATION":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Convocation</span>;
      case "EVENEMENT":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Événement</span>;
      case "EXAMEN":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">Examen</span>;
      case "CONGE":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Congé / Vacances</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Gestion Administrative &amp; Calendrier Scolaire"
        subtitle="Planning officiel des réunions, événements, assemblées et convocations de l'établissement"
        breadcrumbs={[{ label: "Secrétariat", href: "/secretariat" }, { label: "Agenda & Événements" }]}
        actions={
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-school-primary text-white font-semibold text-xs md:text-sm shadow-sm hover:bg-school-primary/90 transition touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Programmer un événement</span>
          </button>
        }
      />

      {/* Filtres par type */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {["ALL", "REUNION", "EVENEMENT", "CONVOCATION", "CONGE"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilterType(f)}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              filterType === f
                ? "bg-school-primary text-white shadow-2xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f === "ALL" ? "Tous les événements" : f}
          </button>
        ))}
      </div>

      {/* Liste des événements chronologiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-sm text-slate-900 leading-tight">{evt.title}</h4>
                {getEventBadge(evt.type)}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-2 font-mono font-bold text-slate-800">
                <CalendarDays className="w-3.5 h-3.5 text-school-primary shrink-0" />
                <span>{evt.date} {evt.time ? `à ${evt.time}` : ""}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{evt.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Audience : <strong>{evt.targetAudience}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL : PROGRAMMER UN ÉVÉNEMENT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Programmer un événement ou réunion
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Intitulé de l&apos;événement *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Réunion de cadrage trimestriel"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold"
                  >
                    <option value="REUNION">Réunion pédagogique</option>
                    <option value="EVENEMENT">Événement scolaire</option>
                    <option value="CONVOCATION">Convocation administrative</option>
                    <option value="CONGE">Congés / Suspension des cours</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Public cible *</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold"
                  >
                    <option value="TOUS">Tout l&apos;établissement</option>
                    <option value="PARENTS">Parents d&apos;élèves</option>
                    <option value="ENSEIGNANTS">Corps Enseignant</option>
                    <option value="ADMINISTRATION">Administration</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Heure</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Lieu / Salle</label>
                <input
                  type="text"
                  placeholder="Ex : Salle polyvalente"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Ordre du jour / Description</label>
                <textarea
                  rows={2}
                  placeholder="Points à l'ordre du jour..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-school-primary text-white font-bold shadow-sm"
                >
                  Enregistrer l&apos;événement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
