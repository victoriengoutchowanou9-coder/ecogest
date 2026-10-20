"use client";

import React, { useState, useMemo } from "react";
import {
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Save,
  Search,
  Plus,
  FileText,
  DoorOpen,
  X,
  FileCheck,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useSurveillantStore } from "@/lib/surveillant-store";
import { useAuth } from "@/lib/auth-store";
import { useToast } from "@/components/ui/Toast";
import { CenseurAttendanceItem } from "@/lib/censeur-store";

export default function SurveillantPresencesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    attendance,
    students,
    classrooms,
    recordAttendance,
    saveBatchClassAttendance,
    recordExceptionalExit,
    exits,
  } = useSurveillantStore();

  const [selectedClassId, setSelectedClassId] = useState(classrooms[0]?.id || "6e-a");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSession, setSelectedSession] = useState("08:00 - 12:00 (Matinée)");
  const [activeTab, setActiveTab] = useState<"POINTAGE" | "EXITS">("POINTAGE");

  // Local state for interactive pointage table
  const currentClass = useMemo(() => {
    return classrooms.find((c) => c.id === selectedClassId) || classrooms[0];
  }, [classrooms, selectedClassId]);

  const classStudents = useMemo(() => {
    if (!currentClass) return [];
    return students.filter((s) => s.classId === currentClass.id);
  }, [students, currentClass]);

  // Map of studentId -> { status, latenessMinutes, reason, justificationStatus }
  const [pointageState, setPointageState] = useState<
    Record<
      string,
      {
        status: CenseurAttendanceItem["status"];
        latenessMinutes: number;
        reason: string;
      }
    >
  >({});

  // Initialize pointage state from stored attendance or defaults
  React.useEffect(() => {
    const next: Record<string, { status: CenseurAttendanceItem["status"]; latenessMinutes: number; reason: string }> = {};

    classStudents.forEach((st) => {
      // Find today's record if any
      const existing = attendance.find(
        (a) => a.studentId === st.id && a.date === selectedDate
      );

      if (existing) {
        let lateness = 0;
        if (existing.status === "RETARD") {
          const match = (existing.justificationNotes || "").match(/(\d+)\s*min/);
          lateness = match ? parseInt(match[1]) : 15;
        }
        next[st.id] = {
          status: existing.status,
          latenessMinutes: lateness,
          reason: existing.justificationNotes || "",
        };
      } else {
        // By default, present
        next[st.id] = {
          status: "PRESENT",
          latenessMinutes: 0,
          reason: "",
        };
      }
    });

    setPointageState(next);
  }, [classStudents, attendance, selectedDate]);

  // Handle status change for an individual student
  const handleStatusChange = (studentId: string, newStatus: CenseurAttendanceItem["status"]) => {
    setPointageState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: newStatus,
        latenessMinutes: newStatus === "RETARD" ? (prev[studentId]?.latenessMinutes || 15) : 0,
        reason: newStatus === "ABS_JUSTIFIEE" ? (prev[studentId]?.reason || "Maladie") : prev[studentId]?.reason || "",
      },
    }));
  };

  const handleLatenessChange = (studentId: string, minutes: number) => {
    setPointageState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        latenessMinutes: minutes,
      },
    }));
  };

  const handleReasonChange = (studentId: string, reason: string) => {
    setPointageState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        reason,
      },
    }));
  };

  // Save all pointage for current class
  const handleSaveAll = () => {
    if (!currentClass) return;

    const entries = classStudents.map((st) => {
      const p = pointageState[st.id] || { status: "PRESENT", latenessMinutes: 0, reason: "" };
      return {
        studentId: st.id,
        studentName: `${st.lastName} ${st.firstName}`,
        matricule: st.matricule,
        status: p.status,
        latenessMinutes: p.latenessMinutes,
        reason: p.reason,
      };
    });

    saveBatchClassAttendance(
      currentClass.id,
      currentClass.name,
      entries,
      selectedSession,
      "Pointage officiel Surveillant Général"
    );

    toast(
      `Pointage de la classe ${currentClass.name} enregistré pour le ${selectedDate}. Les données sont synchronisées sur toute la plateforme.`,
      "success"
    );
  };

  // Exit modal state
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [exitStudentId, setExitStudentId] = useState(classStudents[0]?.id || "");
  const [exitTime, setExitTime] = useState("10:30");
  const [exitReturnTime, setExitReturnTime] = useState("Demain");
  const [exitReason, setExitReason] = useState("");
  const [exitParentNotified, setExitParentNotified] = useState(true);
  const [exitAccompanying, setExitAccompanying] = useState("");

  const handleExitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === exitStudentId);
    if (!st) return;

    recordExceptionalExit({
      studentId: st.id,
      studentName: `${st.lastName} ${st.firstName}`,
      matricule: st.matricule,
      className: st.className,
      exitTime,
      expectedReturnTime: exitReturnTime,
      reason: exitReason.trim() || "Raison médicale / familiale",
      authorizedBy: user?.fullName ? `${user.fullName} (Surveillance)` : "Surveillant Général",
      parentNotified: exitParentNotified,
      accompanyingPerson: exitAccompanying.trim() || undefined,
    });

    toast(`Sortie exceptionnelle autorisée et consignée pour ${st.lastName} ${st.firstName}.`, "success");
    setIsExitModalOpen(false);
    setExitReason("");
    setExitAccompanying("");
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Gestion des Présences, Retards &amp; Sorties"
        subtitle="Appel officiel par classe, pointage des retards et traitement des justificatifs"
        breadcrumbs={[{ label: "Surveillant", href: "/surveillant" }, { label: "Présences & Absences" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExitModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs md:text-sm shadow-sm transition touch-target"
            >
              <DoorOpen className="w-4 h-4 text-orange-600" />
              <span>Sortie exceptionnelle</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary text-white font-bold text-xs md:text-sm shadow-sm hover:bg-school-primary/90 transition touch-target"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer le pointage</span>
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("POINTAGE")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === "POINTAGE"
              ? "border-school-primary text-school-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pointage d&apos;Appel par Classe</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("EXITS")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === "EXITS"
              ? "border-school-primary text-school-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>Registre des Sorties Exceptionnelles ({exits.length})</span>
        </button>
      </div>

      {activeTab === "POINTAGE" && (
        <div className="space-y-4">
          {/* Barre de sélection classe & date */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <label className="font-bold text-slate-700">Classe :</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 bg-white"
              >
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.cycle})
                  </option>
                ))}
              </select>

              <label className="font-bold text-slate-700 ml-2">Date :</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
              />

              <label className="font-bold text-slate-700 ml-2">Créneau :</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-800"
              >
                <option value="08:00 - 12:00 (Matinée)">08:00 - 12:00 (Matinée)</option>
                <option value="15:00 - 18:00 (Après-midi)">15:00 - 18:00 (Après-midi)</option>
                <option value="Journée Complète">Journée Complète</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs">
                Effectif classe : <strong>{classStudents.length} élèves</strong>
              </span>
            </div>
          </div>

          {/* Tableau d'appel façon modèle ECOGEST */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  Feuille de Pointage &mdash; {currentClass?.name} ({selectedDate})
                </h4>
                <p className="text-[11px] text-slate-500">
                  Enregistrement direct des présences, retards en minutes et motifs
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveAll}
                className="px-3.5 py-1.5 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-primary/90 transition shadow-2xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">N°</th>
                    <th className="py-3 px-4">Élève &amp; Matricule</th>
                    <th className="py-3 px-4">Statut Présence</th>
                    <th className="py-3 px-4">Retard (min)</th>
                    <th className="py-3 px-4">Motif / Justificatif</th>
                    <th className="py-3 px-3">Parent contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((st, index) => {
                    const p = pointageState[st.id] || {
                      status: "PRESENT",
                      latenessMinutes: 0,
                      reason: "",
                    };

                    return (
                      <tr
                        key={st.id}
                        className={`transition-colors ${
                          p.status === "ABSENT" || p.status === "ABS_NON_JUSTIFIEE"
                            ? "bg-rose-50/40"
                            : p.status === "RETARD"
                            ? "bg-amber-50/40"
                            : p.status === "ABS_JUSTIFIEE"
                            ? "bg-blue-50/40"
                            : "hover:bg-slate-50/70"
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <p className="text-xs sm:text-sm">{st.lastName} {st.firstName}</p>
                          <p className="text-[10px] font-mono text-slate-500">{st.matricule}</p>
                        </td>

                        {/* Statut présence buttons */}
                        <td className="py-3.5 px-4">
                          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 gap-1">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(st.id, "PRESENT")}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                p.status === "PRESENT"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Présent
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(st.id, "RETARD")}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                p.status === "RETARD"
                                  ? "bg-amber-600 text-white shadow-xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Retard
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(st.id, "ABSENT")}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                p.status === "ABSENT" || p.status === "ABS_NON_JUSTIFIEE"
                                  ? "bg-rose-600 text-white shadow-xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Absent
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(st.id, "ABS_JUSTIFIEE")}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                p.status === "ABS_JUSTIFIEE"
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Justifié
                            </button>
                          </div>
                        </td>

                        {/* Retard en minutes */}
                        <td className="py-3.5 px-4">
                          {p.status === "RETARD" ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={1}
                                max={180}
                                value={p.latenessMinutes || 15}
                                onChange={(e) => handleLatenessChange(st.id, parseInt(e.target.value) || 0)}
                                className="w-16 px-2 py-1 rounded-lg border border-amber-300 font-bold text-center text-xs bg-white text-amber-900"
                              />
                              <span className="text-slate-500 font-semibold text-xs">min</span>
                            </div>
                          ) : (
                            <span className="text-slate-300">&mdash;</span>
                          )}
                        </td>

                        {/* Motif de l'absence / retard */}
                        <td className="py-3.5 px-4">
                          {p.status !== "PRESENT" ? (
                            <input
                              type="text"
                              placeholder={
                                p.status === "RETARD"
                                  ? "Motif retard (ex: Panne, Transport...)"
                                  : "Motif absence (ex: Maladie, Voyage...)"
                              }
                              value={p.reason || ""}
                              onChange={(e) => handleReasonChange(st.id, e.target.value)}
                              className="w-full max-w-xs px-2.5 py-1 rounded-lg border border-slate-300 text-xs bg-white text-slate-800"
                            />
                          ) : (
                            <span className="text-slate-300">&mdash;</span>
                          )}
                        </td>

                        {/* Parent contact */}
                        <td className="py-3.5 px-3">
                          <p className="font-semibold text-slate-800 truncate max-w-[120px]">{st.parentName}</p>
                          <p className="text-[10px] font-mono text-slate-500">{st.parentPhone}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "EXITS" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Journal des Sorties Exceptionnelles de Journée
              </h4>
              <p className="text-xs text-slate-500">
                Autorisations délivrées par le Surveillant Général avec accusé parental
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsExitModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Délivrer un bon de sortie</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Élève &amp; Classe</th>
                  <th className="py-3 px-3">Heure Sortie</th>
                  <th className="py-3 px-3">Retour prévu</th>
                  <th className="py-3 px-4">Motif</th>
                  <th className="py-3 px-4">Accompagnateur</th>
                  <th className="py-3 px-3">Notification Parent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exits.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {ex.studentName} ({ex.className})
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-orange-700">{ex.exitTime}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{ex.expectedReturnTime || "Fin de journée"}</td>
                    <td className="py-3 px-4 text-slate-700">{ex.reason}</td>
                    <td className="py-3 px-4 text-slate-600">{ex.accompanyingPerson || "Élève seul"}</td>
                    <td className="py-3 px-3">
                      {ex.parentNotified ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Notifié</span>
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold text-[11px]">Non requis</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL : NOUVELLE SORTIE EXCEPTIONNELLE */}
      {isExitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-orange-600" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Autorisation de sortie exceptionnelle
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExitModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExitSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Élève demandeur *</label>
                <select
                  value={exitStudentId}
                  onChange={(e) => setExitStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-800"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.lastName} {st.firstName} &mdash; {st.className}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Heure de sortie *</label>
                  <input
                    type="time"
                    required
                    value={exitTime}
                    onChange={(e) => setExitTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Retour attendu</label>
                  <input
                    type="text"
                    placeholder="Ex: 14h00 ou Demain"
                    value={exitReturnTime}
                    onChange={(e) => setExitReturnTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Motif de la sortie *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Malaise fébrile, convocation familiale, rendez-vous"
                  value={exitReason}
                  onChange={(e) => setExitReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Personne accompagnante (le cas échéant)</label>
                <input
                  type="text"
                  placeholder="Nom de la mère / du père / tuteur venu chercher l'élève"
                  value={exitAccompanying}
                  onChange={(e) => setExitAccompanying(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notifParent"
                  checked={exitParentNotified}
                  onChange={(e) => setExitParentNotified(e.target.checked)}
                  className="w-4 h-4 rounded text-school-primary"
                />
                <label htmlFor="notifParent" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Parent informé et accord vérifié par téléphone
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExitModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold shadow-sm"
                >
                  Délivrer le bon de sortie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
