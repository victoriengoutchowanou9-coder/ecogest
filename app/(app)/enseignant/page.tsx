"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  FileSpreadsheet,
  CheckSquare,
  BookMarked,
  Award,
  CalendarDays,
  Bell,
  ArrowRight,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  ChevronRight,
  UserCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import {
  MOCK_TEACHER_PROFILE,
  MOCK_TEACHER_TASKS,
  MOCK_DIRECTION_ANNOUNCEMENTS,
  TeacherTask,
} from "@/lib/mock-teacher-db";

export default function EnseignantDashboardPage() {
  const profile = MOCK_TEACHER_PROFILE;
  const [tasks, setTasks] = useState<TeacherTask[]>(MOCK_TEACHER_TASKS);

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isDone: !t.isDone } : t))
    );
  };

  const pendingTasksCount = tasks.filter((t) => !t.isDone).length;
  const totalStudents = profile.classesAssigned.reduce((acc, c) => acc + c.studentsCount, 0);

  const upcomingSessions = [
    {
      id: "s-1",
      time: "08:00 - 10:00",
      class: "3ème A",
      subject: "Mathématiques",
      room: "Salle 12",
      status: "TERMINE",
    },
    {
      id: "s-2",
      time: "10:15 - 12:15",
      class: "Terminale C",
      subject: "Mathématiques",
      room: "Salle 08",
      status: "A_FAIRE",
    },
    {
      id: "s-3",
      time: "15:00 - 17:00",
      class: "1ère D",
      subject: "Mathématiques",
      room: "Salle 14",
      status: "A_VENIR",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord Enseignant"
        subtitle={`Bienvenue, ${profile.fullName} &middot; Professeur Titulaire ${profile.mainClassName} &middot; Année 2026-2027`}
        breadcrumbs={[{ label: "Enseignant" }, { label: "Tableau de bord" }]}
        actions={
          <Link
            href="/enseignant/profil"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-colors"
          >
            <UserCircle className="w-4 h-4 text-school-primary" />
            <span>Mon Profil &amp; Affectations</span>
          </Link>
        }
      />

      {/* Top 4 KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Classes affectées"
          value={`${profile.classesAssigned.length} divisions`}
          subtitle="3ème A, Tle C, 1ère D"
          icon={<GraduationCap className="w-6 h-6" />}
          variant="info"
        />
        <StatCard
          title="Élèves suivis"
          value={`${totalStudents}`}
          subtitle="Au total sur vos 3 cours"
          icon={<Users className="w-6 h-6" />}
          variant="default"
        />
        <StatCard
          title="Volume horaire"
          value={`${profile.weeklyHours} h / sem`}
          subtitle="Temps complet certifié"
          icon={<Clock className="w-6 h-6" />}
          variant="default"
        />
        <StatCard
          title="Tâches en attente"
          value={`${pendingTasksCount}`}
          subtitle={pendingTasksCount > 0 ? "Actions prioritaires" : "Toutes effectuées"}
          icon={<AlertCircle className="w-6 h-6" />}
          variant={pendingTasksCount > 0 ? "warning" : "success"}
        />
      </div>

      {/* Quick Action Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/enseignant/notes"
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-school-primary hover:shadow-xs transition-all flex flex-col items-center text-center group"
        >
          <div className="p-3 rounded-xl bg-school-50 text-school-primary group-hover:scale-105 transition-transform">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 mt-2">Saisie des notes</span>
          <span className="text-[10px] text-slate-400">Interros &amp; devoirs</span>
        </Link>

        <Link
          href="/enseignant/presences"
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-600 hover:shadow-xs transition-all flex flex-col items-center text-center group"
        >
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform">
            <CheckSquare className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 mt-2">Faire l&apos;appel</span>
          <span className="text-[10px] text-slate-400">Présences &amp; retards</span>
        </Link>

        <Link
          href="/enseignant/cahier-de-textes"
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-purple-600 hover:shadow-xs transition-all flex flex-col items-center text-center group"
        >
          <div className="p-3 rounded-xl bg-purple-50 text-purple-700 group-hover:scale-105 transition-transform">
            <BookMarked className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 mt-2">Cahier de textes</span>
          <span className="text-[10px] text-slate-400">Leçons &amp; devoirs</span>
        </Link>

        <Link
          href="/enseignant/bulletins"
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-amber-600 hover:shadow-xs transition-all flex flex-col items-center text-center group"
        >
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 mt-2">Appréciations</span>
          <span className="text-[10px] text-slate-400">Bulletins officiels</span>
        </Link>
      </div>

      {/* Main Two Columns: Sessions Today & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Prochains cours d'aujourd'hui */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Prochains cours d&apos;aujourd&apos;hui</h3>
                <p className="text-[11px] text-slate-500">Séances programmées à l&apos;emploi du temps</p>
              </div>
            </div>
            <Link
              href="/enseignant/emploi-du-temps"
              className="text-xs font-bold text-school-primary hover:underline"
            >
              Semaine complète &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {session.time}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">
                      {session.room}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    {session.class} &middot; {session.subject}
                  </h4>
                </div>

                <div>
                  {session.status === "TERMINE" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Appel fait</span>
                    </span>
                  ) : session.status === "A_FAIRE" ? (
                    <Link
                      href="/enseignant/presences"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-school-primary hover:bg-school-700 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
                    >
                      <span>Pointer l&apos;appel</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      À venir
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Box 2: Tâches en attente & Échéances */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tâches pédagogiques en attente</h3>
                <p className="text-[11px] text-slate-500">Saisies de notes, appels et bilans trimestriels</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              {pendingTasksCount} restante(s)
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border transition-colors flex items-start justify-between gap-3 ${
                  task.isDone
                    ? "bg-slate-50 border-slate-200 opacity-60"
                    : "bg-white border-slate-200 shadow-2xs hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-2.5 flex-1">
                  <input
                    type="checkbox"
                    checked={task.isDone}
                    onChange={() => toggleTask(task.id)}
                    className="mt-1 w-4 h-4 accent-school-primary rounded cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          task.isDone ? "line-through text-slate-400" : "text-slate-900"
                        }`}
                      >
                        {task.title}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                          task.priority === "HAUTE"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{task.description}</p>
                    <p className="text-[10px] text-slate-400">Échéance : {task.dueDate}</p>
                  </div>
                </div>

                {!task.isDone && (
                  <Link
                    href={task.link}
                    className="p-1.5 text-school-primary hover:bg-school-50 rounded-lg shrink-0"
                    title="Aller à la tâche"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Classes Affectées & Matières */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-school-primary" />
            <h3 className="text-sm font-bold text-slate-900">Mes Classes Affectées &amp; Matières</h3>
          </div>
          <Link
            href="/enseignant/classes"
            className="text-xs font-bold text-school-primary hover:underline"
          >
            Consulter les listes d&apos;élèves &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profile.classesAssigned.map((item) => (
            <div
              key={item.classId}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold text-slate-900">{item.className}</span>
                {item.isMain && (
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    Prof. Titulaire
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-semibold">
                {item.subject} &middot; <span className="font-mono">Coef. {item.coef}</span>
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs text-slate-500">
                <span>{item.studentsCount} élèves</span>
                <span className="font-mono font-bold text-slate-700">{item.hoursPerWeek}h / semaine</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
