"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Printer,
  ChevronLeft,
  ChevronRight,
  Download,
  BookOpen,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/Toast";
import { MOCK_TEACHER_PROFILE } from "@/lib/mock-teacher-db";
import { cn } from "@/lib/utils";

interface ScheduleSlot {
  id: string;
  day: "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi";
  timeSlot: string;
  startTime: string;
  endTime: string;
  className: string;
  subject: string;
  room: string;
  type: "COURS" | "TD" | "EVALUATION" | "REUNION";
  color: string;
}

export default function EnseignantEmploiDuTempsPage() {
  const { toast } = useToast();

  const [activeView, setActiveView] = useState<"GRID" | "LIST">("GRID");
  const [selectedDay, setSelectedDay] = useState<string>("Lundi");

  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"] as const;

  const scheduleSlots: ScheduleSlot[] = [
    // Lundi
    {
      id: "slot-1",
      day: "Lundi",
      timeSlot: "08:00 - 10:00",
      startTime: "08:00",
      endTime: "10:00",
      className: "3ème A",
      subject: "Mathématiques",
      room: "Salle 04",
      type: "COURS",
      color: "border-l-blue-600 bg-blue-50/70 text-blue-950",
    },
    {
      id: "slot-2",
      day: "Lundi",
      timeSlot: "10:15 - 12:15",
      startTime: "10:15",
      endTime: "12:15",
      className: "Terminale C",
      subject: "Mathématiques",
      room: "Salle 08",
      type: "COURS",
      color: "border-l-indigo-600 bg-indigo-50/70 text-indigo-950",
    },

    // Mardi
    {
      id: "slot-3",
      day: "Mardi",
      timeSlot: "08:00 - 10:00",
      startTime: "08:00",
      endTime: "10:00",
      className: "1ère D",
      subject: "Mathématiques",
      room: "Salle Labo 2",
      type: "COURS",
      color: "border-l-emerald-600 bg-emerald-50/70 text-emerald-950",
    },
    {
      id: "slot-4",
      day: "Mardi",
      timeSlot: "15:00 - 17:00",
      startTime: "15:00",
      endTime: "17:00",
      className: "Terminale C",
      subject: "Mathématiques (TD)",
      room: "Salle 08",
      type: "TD",
      color: "border-l-indigo-600 bg-indigo-50/70 text-indigo-950",
    },

    // Mercredi
    {
      id: "slot-5",
      day: "Mercredi",
      timeSlot: "08:00 - 10:00",
      startTime: "08:00",
      endTime: "10:00",
      className: "3ème A",
      subject: "Mathématiques",
      room: "Salle 04",
      type: "COURS",
      color: "border-l-blue-600 bg-blue-50/70 text-blue-950",
    },

    // Jeudi
    {
      id: "slot-6",
      day: "Jeudi",
      timeSlot: "10:15 - 12:15",
      startTime: "10:15",
      endTime: "12:15",
      className: "Terminale C",
      subject: "Mathématiques",
      room: "Salle 08",
      type: "COURS",
      color: "border-l-indigo-600 bg-indigo-50/70 text-indigo-950",
    },
    {
      id: "slot-7",
      day: "Jeudi",
      timeSlot: "15:00 - 17:00",
      startTime: "15:00",
      endTime: "17:00",
      className: "1ère D",
      subject: "Mathématiques",
      room: "Salle Labo 2",
      type: "COURS",
      color: "border-l-emerald-600 bg-emerald-50/70 text-emerald-950",
    },

    // Vendredi
    {
      id: "slot-8",
      day: "Vendredi",
      timeSlot: "08:00 - 09:00",
      startTime: "08:00",
      endTime: "09:00",
      className: "1ère D",
      subject: "Mathématiques",
      room: "Salle Labo 2",
      type: "COURS",
      color: "border-l-emerald-600 bg-emerald-50/70 text-emerald-950",
    },

    // Samedi
    {
      id: "slot-9",
      day: "Samedi",
      timeSlot: "08:00 - 11:00",
      startTime: "08:00",
      endTime: "11:00",
      className: "Tous niveaux",
      subject: "Devoirs Surveillés & Évaluations",
      room: "Grand Amphi",
      type: "EVALUATION",
      color: "border-l-purple-600 bg-purple-50/70 text-purple-950",
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Emploi du Temps Hebdomadaire"
        subtitle="Planning des cours, créneaux horaires, salles de classe et affectations pédagogiques"
        breadcrumbs={[{ label: "Enseignant", href: "/enseignant" }, { label: "Emploi du temps" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs md:text-sm shadow-sm touch-target flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Imprimer mon emploi du temps</span>
            </button>
          </div>
        }
      />

      {/* Profile quick stats ribbon */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-school-primary flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {MOCK_TEACHER_PROFILE.fullName}
            </h3>
            <p className="text-xs text-slate-500">
              Spécialité : {MOCK_TEACHER_PROFILE.speciality} &bull; Volume : {MOCK_TEACHER_PROFILE.weeklyHours}h / semaine
            </p>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveView("GRID")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeView === "GRID"
                ? "bg-white text-school-primary shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Grille de la semaine
          </button>
          <button
            type="button"
            onClick={() => setActiveView("LIST")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeView === "LIST"
                ? "bg-white text-school-primary shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Vue détaillée par jour
          </button>
        </div>
      </div>

      {activeView === "GRID" ? (
        /* Weekly Grid (Lundi à Samedi) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {days.map((day) => {
            const daySlots = scheduleSlots.filter((s) => s.day === day);
            const isToday = day === "Mercredi"; // sample current day

            return (
              <div
                key={day}
                className={cn(
                  "bg-white rounded-2xl border shadow-sm p-4 flex flex-col space-y-3",
                  isToday ? "border-school-accent ring-1 ring-school-accent" : "border-slate-200"
                )}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900 text-sm">{day}</span>
                  {isToday ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Aujourd&apos;hui
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {daySlots.length} cours
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 flex-1">
                  {daySlots.length === 0 ? (
                    <div className="h-28 flex items-center justify-center text-xs text-slate-400 italic">
                      Pas de cours
                    </div>
                  ) : (
                    daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={cn(
                          "p-3 rounded-xl border border-slate-200 border-l-4 shadow-xs space-y-1.5",
                          slot.color
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{slot.className}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/80">
                            {slot.type}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold">{slot.subject}</div>
                        <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {slot.timeSlot}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {slot.room}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Day View */
        <div className="space-y-4">
          {/* Day selection tabs */}
          <div className="flex flex-wrap gap-2">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all touch-target",
                  selectedDay === day
                    ? "bg-school-primary text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {scheduleSlots
              .filter((s) => s.day === selectedDay)
              .map((slot) => (
                <div key={slot.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 flex flex-col items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 mb-0.5" />
                      <span className="text-[9px] font-bold">{slot.startTime}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{slot.className}</span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
                          {slot.subject}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold">
                          {slot.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {slot.timeSlot}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-school-primary" />
                          {slot.room}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/enseignant/classes"
                    className="self-end sm:self-auto px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 touch-target"
                  >
                    Voir la classe
                  </Link>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
