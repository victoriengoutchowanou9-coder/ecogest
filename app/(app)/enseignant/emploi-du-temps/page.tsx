"use client";

import React, { useState, useMemo } from "react";
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
import { useCenseurStore } from "@/lib/censeur-store";
import { useAuth } from "@/lib/auth-store";
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
  const { user } = useAuth();
  const { schedules } = useCenseurStore();

  const [activeView, setActiveView] = useState<"GRID" | "LIST">("GRID");
  const [selectedDay, setSelectedDay] = useState<string>("Lundi");

  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"] as const;

  // Calcul dynamique des créneaux réels de l'enseignant (aucun mock en dur)
  const scheduleSlots: ScheduleSlot[] = useMemo(() => {
    if (!schedules || schedules.length === 0) return [];
    const mySchedules = schedules.filter(
      (s) =>
        !user ||
        !s.teacherId ||
        s.teacherId === user.id ||
        (user.fullName && s.teacherName?.toLowerCase().includes(user.fullName.toLowerCase()))
    );

    const colors = [
      "border-l-blue-600 bg-blue-50/70 text-blue-950",
      "border-l-indigo-600 bg-indigo-50/70 text-indigo-950",
      "border-l-emerald-600 bg-emerald-50/70 text-emerald-950",
      "border-l-purple-600 bg-purple-50/70 text-purple-950",
      "border-l-amber-600 bg-amber-50/70 text-amber-950",
    ];

    return mySchedules.map((s, idx) => {
      const parts = (s.timeSlot || "").split("-");
      return {
        id: s.id,
        day: s.dayOfWeek,
        timeSlot: s.timeSlot,
        startTime: parts[0]?.trim() || "08:00",
        endTime: parts[1]?.trim() || "10:00",
        className: s.className,
        subject: s.subjectName,
        room: s.room || "Salle de cours",
        type: "COURS",
        color: colors[idx % colors.length],
      };
    });
  }, [schedules, user]);

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
              {user?.fullName || MOCK_TEACHER_PROFILE.fullName}
            </h3>
            <p className="text-xs text-slate-500">
              Spécialité : {(user as any)?.specialty || MOCK_TEACHER_PROFILE.speciality} &bull; Volume : {scheduleSlots.length > 0 ? `${scheduleSlots.length * 2}h / semaine` : "0h programmée"}
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

      {scheduleSlots.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Aucun cours programmé</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Votre emploi du temps n&apos;a pas encore été configuré par la direction pédagogique ou le censeur des études.
          </p>
        </div>
      ) : activeView === "GRID" ? (
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
            {scheduleSlots.filter((s) => s.day === selectedDay).length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Aucun cours programmé pour {selectedDay}.
              </div>
            ) : (
              scheduleSlots
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
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
