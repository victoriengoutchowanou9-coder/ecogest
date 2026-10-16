"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Printer,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChildSwitcher } from "@/components/school/ChildSwitcher";
import { MOCK_STUDENTS, Student } from "@/lib/mock-data";
import { useCenseurStore } from "@/lib/censeur-store";
import { MOCK_PARENT_PROFILE } from "@/lib/mock-bulletin-db";

interface ScheduleSlot {
  id: string;
  day: "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi";
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
  category: "LITTÉRAIRE" | "SCIENTIFIQUE" | "AUTRE";
}

const SCHEDULE_DATA: ScheduleSlot[] = [
  // Lundi
  { id: "s-1", day: "Lundi", startTime: "07h00", endTime: "09h00", subject: "Mathématiques", teacher: "M. HOUNNOU E.", room: "Salle 12", category: "SCIENTIFIQUE" },
  { id: "s-2", day: "Lundi", startTime: "09h15", endTime: "11h15", subject: "Français", teacher: "M. TOSSOU K.", room: "Salle 12", category: "LITTÉRAIRE" },
  { id: "s-3", day: "Lundi", startTime: "15h00", endTime: "17h00", subject: "Histoire-Géographie", teacher: "M. BIO G.", room: "Salle 12", category: "LITTÉRAIRE" },

  // Mardi
  { id: "s-4", day: "Mardi", startTime: "07h00", endTime: "09h00", subject: "Physique-Chimie (PCT)", teacher: "M. GBEDO P.", room: "Labo Sciences", category: "SCIENTIFIQUE" },
  { id: "s-5", day: "Mardi", startTime: "09h15", endTime: "11h15", subject: "Anglais", teacher: "Mme DOSSOU S.", room: "Salle 12", category: "LITTÉRAIRE" },
  { id: "s-6", day: "Mardi", startTime: "15h00", endTime: "17h00", subject: "Éducation Physique (EPS)", teacher: "M. AKPOVI J.", room: "Terrain de sport", category: "AUTRE" },

  // Mercredi
  { id: "s-7", day: "Mercredi", startTime: "07h00", endTime: "09h00", subject: "Sciences de la Vie et de la Terre (SVT)", teacher: "Mme KOUDJO F.", room: "Salle 12", category: "SCIENTIFIQUE" },
  { id: "s-8", day: "Mercredi", startTime: "09h15", endTime: "12h15", subject: "Mathématiques (TD)", teacher: "M. HOUNNOU E.", room: "Salle 12", category: "SCIENTIFIQUE" },

  // Jeudi
  { id: "s-9", day: "Jeudi", startTime: "07h00", endTime: "09h00", subject: "Français", teacher: "M. TOSSOU K.", room: "Salle 12", category: "LITTÉRAIRE" },
  { id: "s-10", day: "Jeudi", startTime: "09h15", endTime: "11h15", subject: "Physique-Chimie (PCT)", teacher: "M. GBEDO P.", room: "Salle 12", category: "SCIENTIFIQUE" },
  { id: "s-11", day: "Jeudi", startTime: "15h00", endTime: "17h00", subject: "Dessin & Arts Plastiques", teacher: "Mme ZANNOU M.", room: "Atelier Art", category: "AUTRE" },

  // Vendredi
  { id: "s-12", day: "Vendredi", startTime: "07h00", endTime: "09h00", subject: "Anglais", teacher: "Mme DOSSOU S.", room: "Salle 12", category: "LITTÉRAIRE" },
  { id: "s-13", day: "Vendredi", startTime: "09h15", endTime: "11h15", subject: "Sciences de la Vie et de la Terre (SVT)", teacher: "Mme KOUDJO F.", room: "Salle 12", category: "SCIENTIFIQUE" },
  { id: "s-14", day: "Vendredi", startTime: "15h00", endTime: "17h00", subject: "Travaux Pratiques / Informatique", teacher: "M. HOUNSOU D.", room: "Salle Info", category: "AUTRE" },

  // Samedi
  { id: "s-15", day: "Samedi", startTime: "07h00", endTime: "09h00", subject: "Devoirs Surveillés / Évaluations", teacher: "Administration", room: "Grand Hall", category: "AUTRE" },
  { id: "s-16", day: "Samedi", startTime: "09h15", endTime: "11h15", subject: "Activités Culturelles & Conduite", teacher: "M. TOSSOU K.", room: "Salle 12", category: "AUTRE" },
];

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"] as const;

export default function ParentSchedulePage() {
  const { studentsList, parentAccessRequests } = useCenseurStore();

  const myChildren: Student[] = React.useMemo(() => {
    const activatedRequests = parentAccessRequests.filter(
      (r) =>
        (r.parentPhone === MOCK_PARENT_PROFILE.phoneNumber || r.parentId === MOCK_PARENT_PROFILE.id) &&
        r.status === "ACCEPTEE" &&
        r.isAccessActivated
    );
    const activeStudentIds = new Set(activatedRequests.map((r) => r.studentId));
    return studentsList
      .filter((s) => activeStudentIds.has(s.id))
      .map((s) => ({
        id: s.id,
        matricule: s.matricule,
        firstName: s.firstName,
        lastName: s.lastName,
        classId: s.classId,
        className: s.className,
        gender: s.gender,
        birthDate: s.birthDate,
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        status: "INSCRIT",
        average: 0,
        rank: 0,
        absencesCount: 0,
        totalTuition: 0,
        paidTuition: 0,
        remainingTuition: 0,
        tuitionStatus: "PAID",
      }));
  }, [parentAccessRequests, studentsList]);

  const [selectedChild, setSelectedChild] = useState<Student | undefined>(myChildren[0]);
  const [activeDay, setActiveDay] = useState<typeof DAYS[number]>("Lundi");

  React.useEffect(() => {
    if (myChildren.length > 0) {
      if (!selectedChild || !myChildren.some((c) => c.id === selectedChild.id)) {
        setSelectedChild(myChildren[0]);
      }
    } else {
      setSelectedChild(undefined);
    }
  }, [myChildren, selectedChild]);

  const categoryStyles = {
    LITTÉRAIRE: "bg-blue-50 border-blue-200 text-blue-900",
    SCIENTIFIQUE: "bg-emerald-50 border-emerald-200 text-emerald-900",
    AUTRE: "bg-purple-50 border-purple-200 text-purple-900",
  };

  const handlePrint = () => {
    window.print();
  };

  if (!selectedChild) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Emploi du Temps Hebdomadaire"
          subtitle="Planning des cours · Lundi au Samedi"
          breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Emploi du temps" }]}
        />
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Aucun élève rattaché</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Veuillez rattacher votre enfant depuis l&apos;accueil de votre espace parent pour consulter son emploi du temps hebdomadaire.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emploi du Temps Hebdomadaire"
        subtitle={`Planning des cours de ${selectedChild.firstName} (${selectedChild.className}) &middot; Lundi au Samedi`}
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Emploi du temps" }]}
        actions={
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer l&apos;emploi du temps</span>
          </button>
        }
      />

      {/* Child Switcher */}
      <div className="no-print">
        <ChildSwitcher
          childrenList={myChildren}
          selectedChildId={selectedChild.id}
          onSelectChild={setSelectedChild}
        />
      </div>

      {/* Mobile Day Selector Tabs */}
      <div className="md:hidden no-print flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto gap-1">
        {DAYS.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setActiveDay(day)}
            className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
              activeDay === day
                ? "bg-school-primary text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Mobile Single Day View */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-base font-bold text-slate-900">{activeDay}</h3>
          <span className="text-xs text-slate-500">
            {SCHEDULE_DATA.filter((s) => s.day === activeDay).length} séance(s)
          </span>
        </div>
        <div className="space-y-3">
          {SCHEDULE_DATA.filter((s) => s.day === activeDay).map((slot) => (
            <div
              key={slot.id}
              className={`p-4 rounded-2xl border ${categoryStyles[slot.category]} space-y-2 shadow-xs`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold flex items-center gap-1 text-slate-700">
                  <Clock className="w-3.5 h-3.5" />
                  {slot.startTime} - {slot.endTime}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-slate-200">
                  {slot.category}
                </span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900">{slot.subject}</h4>
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {slot.teacher}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  {slot.room}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Weekly Timetable Grid (Lundi à Samedi) */}
      <div className="hidden md:block bg-white p-5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="min-w-[850px]">
          <div className="grid grid-cols-6 gap-3 pb-3 border-b border-slate-200 text-center font-bold text-xs uppercase text-slate-700">
            {DAYS.map((day) => (
              <div key={day} className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-6 gap-3 pt-3">
            {DAYS.map((day) => {
              const daySlots = SCHEDULE_DATA.filter((s) => s.day === day);
              return (
                <div key={day} className="space-y-3 min-h-[350px]">
                  {daySlots.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      Pas de cours
                    </div>
                  ) : (
                    daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-xl border ${categoryStyles[slot.category]} space-y-1.5 shadow-2xs hover:shadow-xs transition-shadow`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span className="font-mono">{slot.startTime} - {slot.endTime}</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                          {slot.subject}
                        </h4>
                        <div className="text-[10.5px] text-slate-700 space-y-1 pt-1.5 border-t border-slate-200/60">
                          <p className="font-bold text-slate-900 flex items-center gap-1 truncate">
                            <User className="w-3 h-3 text-school-primary shrink-0" />
                            <span>{slot.teacher}</span>
                          </p>
                          <p className="font-medium text-slate-600 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <span>{slot.room}</span>
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
