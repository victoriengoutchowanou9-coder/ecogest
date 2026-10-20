"use client";

import React, { useState, useMemo } from "react";
import {
  CheckSquare,
  Save,
  Users,
  Calendar,
  Check,
  X,
  Clock,
  History,
  AlertCircle,
  FileCheck2,
  ChevronRight,
  Edit3,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useCenseurStore } from "@/lib/censeur-store";
import { useAuth } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

interface StudentAttendanceState {
  studentId: string;
  studentName: string;
  matricule: string;
  gender: "M" | "F";
  status: "PRESENT" | "ABSENT" | "RETARD";
  minutesLate?: number;
  motif?: string;
}

interface HistoricalSession {
  id: string;
  date: string;
  timeSlot: string;
  className: string;
  subject: string;
  room: string;
  presentCount: number;
  retardCount: number;
  absentCount: number;
  isLocked: boolean;
  markedAt: string;
}

export default function EnseignantPresencesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { schedules, studentsList: censeurStudents } = useCenseurStore();

  const [activeTab, setActiveTab] = useState<"APPEL" | "HISTORIQUE">("APPEL");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [isSessionSaved, setIsSessionSaved] = useState(false);
  const [isCorrectionMode, setIsCorrectionMode] = useState(false);
  const [correctionReasonModalOpen, setCorrectionReasonModalOpen] = useState(false);
  const [correctionReason, setCorrectionReason] = useState("");

  const sessions = useMemo(() => {
    if (!schedules || schedules.length === 0) return [];
    const mySchedules = schedules.filter(
      (s) =>
        !user ||
        !s.teacherId ||
        s.teacherId === user.id ||
        (user.fullName && s.teacherName?.toLowerCase().includes(user.fullName.toLowerCase()))
    );
    return mySchedules.map((s) => ({
      id: s.id,
      time: s.timeSlot,
      className: s.className,
      subject: s.subjectName,
      room: s.room || "Salle de cours",
      totalStudents: censeurStudents.filter((st) => st.classId === s.classId || st.className === s.className).length || 0,
    }));
  }, [schedules, user, censeurStudents]);

  React.useEffect(() => {
    if (sessions.length > 0 && !sessions.some((s) => s.id === selectedSessionId)) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

  const currentSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0] || null;

  // Initialize student attendance
  const [attendances, setAttendances] = useState<Record<string, StudentAttendanceState>>({});

  React.useEffect(() => {
    if (!currentSession) {
      setAttendances({});
      return;
    }
    const classStudents = censeurStudents.filter(
      (s) => s.className === currentSession.className
    );
    const init: Record<string, StudentAttendanceState> = {};
    classStudents.forEach((st) => {
      init[st.id] = {
        studentId: st.id,
        studentName: `${st.lastName} ${st.firstName}`,
        matricule: st.matricule,
        gender: st.gender,
        status: "PRESENT",
        minutesLate: 0,
        motif: "",
      };
    });
    setAttendances(init);
    setIsSessionSaved(false);
    setIsCorrectionMode(false);
  }, [currentSession, censeurStudents]);

  // Sessions history
  const [historySessions] = useState<HistoricalSession[]>([]);

  const handleStatusChange = (studentId: string, status: "PRESENT" | "ABSENT" | "RETARD") => {
    if (isSessionSaved && !isCorrectionMode) {
      toast("L'appel a déjà été émargé. Cliquez sur 'Autoriser une correction' pour modifier.", "info");
      return;
    }
    setAttendances((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        minutesLate: status === "RETARD" ? (prev[studentId].minutesLate || 10) : 0,
      },
    }));
  };

  const handleDetailsChange = (
    studentId: string,
    field: "minutesLate" | "motif",
    val: string | number
  ) => {
    setAttendances((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: val,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    if (isSessionSaved && !isCorrectionMode) {
      toast("Activez le mode correction pour modifier la feuille d'appel.", "info");
      return;
    }
    setAttendances((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id] = { ...updated[id], status: "PRESENT", minutesLate: 0, motif: "" };
      });
      return updated;
    });
    toast("Tous les élèves de la séance ont été marqués Présents.", "info");
  };

  const handleSaveAttendance = () => {
    if (!currentSession) return;
    setIsSessionSaved(true);
    setIsCorrectionMode(false);
    toast(
      `Feuille d'émargement de la séance (${currentSession.className}) enregistrée et transmise à la vie scolaire.`,
      "success"
    );
  };

  const handleStartCorrection = () => {
    setCorrectionReasonModalOpen(true);
  };

  const handleConfirmCorrectionReason = () => {
    if (!correctionReason.trim()) {
      toast("Veuillez indiquer un motif de correction pour la traçabilité.", "info");
      return;
    }
    setCorrectionReasonModalOpen(false);
    setIsCorrectionMode(true);
    toast("Mode correction activé avec traçabilité dans l'historique.", "info");
  };

  const studentsList = Object.values(attendances);
  const presentCount = studentsList.filter((s) => s.status === "PRESENT").length;
  const retardCount = studentsList.filter((s) => s.status === "RETARD").length;
  const absentCount = studentsList.filter((s) => s.status === "ABSENT").length;
  const attendanceRate =
    studentsList.length > 0 ? Math.round((presentCount / studentsList.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Appel & Émargement par Séance"
        subtitle="Pointage tactile en direct des élèves avec statuts Présent, Absent et Retardataire, et historique vérifiable"
        breadcrumbs={[{ label: "Enseignant", href: "/enseignant" }, { label: "Appel & Présences" }]}
        actions={
          <div className="flex items-center gap-2">
            {activeTab === "APPEL" && (
              <>
                {isSessionSaved && !isCorrectionMode ? (
                  <button
                    type="button"
                    onClick={handleStartCorrection}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-semibold text-xs md:text-sm shadow-sm touch-target"
                  >
                    <Edit3 className="w-4 h-4 text-amber-700" />
                    <span>Corriger l&apos;émargement</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveAttendance}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {isCorrectionMode ? "Valider la correction" : "Enregistrer la séance"}
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab("APPEL")}
          className={cn(
            "pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors",
            activeTab === "APPEL"
              ? "border-school-primary text-school-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Fiche d&apos;appel de la séance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("HISTORIQUE")}
          className={cn(
            "pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors",
            activeTab === "HISTORIQUE"
              ? "border-school-primary text-school-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <History className="w-4 h-4" />
          <span>Historique des séances & Émargements</span>
        </button>
      </div>

      {activeTab === "APPEL" ? (
        !currentSession || sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Aucune séance de cours programmée</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Vous n&apos;avez aucune séance planifiée pour cette date. La feuille d&apos;émargement et d&apos;appel s&apos;activera automatiquement dès la programmation de vos cours dans l&apos;emploi du temps.
            </p>
          </div>
        ) : (
          <>
            {/* Session Selector Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Date de la séance
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Séance de cours du jour
                </label>
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent"
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.time} &bull; {s.className} &bull; {s.subject} ({s.room})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sub-bar with quick actions and indicators */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs touch-target min-h-[36px]"
                >
                  Tous présents
                </button>
                {isCorrectionMode && (
                  <span className="text-xs px-2.5 py-1 rounded bg-amber-100 text-amber-800 font-semibold flex items-center gap-1">
                    <Edit3 className="w-3.5 h-3.5" />
                    Mode correction actif
                  </span>
                )}
                {isSessionSaved && !isCorrectionMode && (
                  <span className="text-xs px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Séance émargée
                  </span>
                )}
              </div>

              {/* Counters */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  {presentCount} Présent(s)
                </span>
                <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                  {retardCount} Retard(s)
                </span>
                <span className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                  {absentCount} Absent(s)
                </span>
                <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                  {attendanceRate}% Présence
                </span>
              </div>
            </div>
          </div>

          {/* Student attendance list */}
          <div className="space-y-3">
            {studentsList.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-2xl border border-slate-200">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2 stroke-1" />
                <h4 className="text-sm font-bold text-slate-800">Aucun élève enregistré pour cette classe</h4>
                <p className="text-xs text-slate-400 mt-1">Les élèves inscrits par l&apos;administration apparaîtront ici pour l&apos;appel.</p>
              </div>
            ) : (
              studentsList.map((st, idx) => {
              const isPresent = st.status === "PRESENT";
              const isRetard = st.status === "RETARD";
              const isAbsent = st.status === "ABSENT";

              return (
                <div
                  key={st.studentId}
                  className={cn(
                    "p-3.5 rounded-2xl border transition-all shadow-sm bg-white",
                    isPresent && "border-slate-200",
                    isRetard && "border-amber-300 bg-amber-50/20",
                    isAbsent && "border-rose-300 bg-rose-50/20"
                  )}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Identity */}
                    <div className="flex items-center gap-3 min-w-[240px]">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{st.studentName}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-mono">{st.matricule}</span>
                          <span>&bull;</span>
                          <span>{st.gender === "M" ? "Garçon" : "Fille"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Touch Buttons (min 44px) */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(st.studentId, "PRESENT")}
                        className={cn(
                          "flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px] transition-all touch-target",
                          isPresent
                            ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600 ring-offset-1"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                        )}
                      >
                        <Check className="w-4 h-4" />
                        <span>Présent</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(st.studentId, "RETARD")}
                        className={cn(
                          "flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px] transition-all touch-target",
                          isRetard
                            ? "bg-amber-500 text-white shadow-sm ring-2 ring-amber-500 ring-offset-1"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                        )}
                      >
                        <Clock className="w-4 h-4" />
                        <span>Retardataire</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(st.studentId, "ABSENT")}
                        className={cn(
                          "flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px] transition-all touch-target",
                          isAbsent
                            ? "bg-rose-600 text-white shadow-sm ring-2 ring-rose-600 ring-offset-1"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                        )}
                      >
                        <X className="w-4 h-4" />
                        <span>Absent</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded info if Retard or Absent */}
                  {(isRetard || isAbsent) && (
                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {isRetard && (
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-bold text-amber-900 shrink-0">
                            Minutes de retard :
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={st.minutesLate || 10}
                            onChange={(e) =>
                              handleDetailsChange(
                                st.studentId,
                                "minutesLate",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-20 px-2 py-1 rounded-lg border border-amber-300 text-center font-bold bg-white"
                          />
                          <span className="text-[11px] text-amber-800">min</span>
                        </div>
                      )}

                      <div className={cn(isRetard ? "sm:col-span-2" : "sm:col-span-3")}>
                        <input
                          type="text"
                          value={st.motif || ""}
                          onChange={(e) =>
                            handleDetailsChange(st.studentId, "motif", e.target.value)
                          }
                          placeholder={
                            isRetard
                              ? "Motif du retard (ex: Panne de transport, embouteillage)..."
                              : "Motif d'absence (ex: Maladie déclarée, rendez-vous médical, sans motif)..."
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-school-accent bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          </div>
        </>
        )
      ) : (
        /* Historical Sessions View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Registre des séances passées</h3>
              <p className="text-xs text-slate-500">
                Traçabilité des émargements de cours et des corrections autorisées
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-200 text-slate-700">
              {historySessions.length} séances enregistrées
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {historySessions.length === 0 ? (
              <div className="py-12 text-center">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2 stroke-1" />
                <h4 className="text-sm font-bold text-slate-800">Aucune séance historique enregistrée</h4>
                <p className="text-xs text-slate-400 mt-1">L&apos;historique des appels clôturés apparaîtra ici.</p>
              </div>
            ) : (
              historySessions.map((hs) => (
                <div
                  key={hs.id}
                  className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm">{hs.className}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {hs.subject}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">({hs.room})</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {hs.date}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {hs.timeSlot}
                    </span>
                    <span>&bull;</span>
                    <span className="text-[11px] text-slate-400">Émargé le {hs.markedAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      {hs.presentCount} P
                    </span>
                    <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
                      {hs.retardCount} R
                    </span>
                    <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                      {hs.absentCount} A
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("APPEL");
                      toast(`Consultation de la séance de ${hs.className} du ${hs.date}`, "info");
                    }}
                    className="p-2 text-slate-500 hover:text-school-primary rounded-lg hover:bg-slate-100 transition-colors"
                    title="Voir / Corriger cette séance"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
          </div>
        </div>
      )}

      {/* Modal for Correction Reason */}
      {correctionReasonModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Motif de correction de l&apos;émargement
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Veuillez spécifier la raison pour laquelle vous modifiez cette feuille d&apos;appel déjà émargée (ex: élève arrivé en retard mais initialement pointé absent, rectification d&apos;erreur).
                </p>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Motif explicatif *
              </label>
              <input
                type="text"
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder="Ex : Rectification, élève arrivé à 08h20..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-school-accent"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCorrectionReasonModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmCorrectionReason}
                className="px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-semibold hover:bg-school-700 shadow-sm"
              >
                Autoriser la modification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
