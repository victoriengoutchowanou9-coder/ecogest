"use client";

import React, { useState, useMemo } from "react";
import {
  UserPlus,
  Search,
  History,
  GraduationCap,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { StudentProfile, ClassRoom } from "@/lib/types/bulletin";
import { useDisciplineStore } from "@/lib/discipline-store";
import { useBulletinStore } from "@/lib/bulletin-store";
import { useToast } from "@/components/ui/Toast";

interface StudentReadmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReadmissionSuccess?: (student: StudentProfile) => void;
}

export const StudentReadmissionModal: React.FC<StudentReadmissionModalProps> = ({
  isOpen,
  onClose,
  onReadmissionSuccess,
}) => {
  const { toast } = useToast();
  const { students, readmitStudent, readmissionLogs } = useDisciplineStore();
  const { classrooms } = useBulletinStore();

  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [targetClassId, setTargetClassId] = useState(classrooms[0]?.id || "3e-a");
  const [academicYear, setAcademicYear] = useState("2026 - 2027");
  const [observation, setObservation] = useState("Réadmission autorisée après vérification administrative et apurement du dossier scolaire.");

  // Filtrer les élèves non actifs ou archivés pouvant être réadmis
  const readmissionCandidates = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.lastName.toLowerCase().includes(search.toLowerCase()) ||
        s.firstName.toLowerCase().includes(search.toLowerCase()) ||
        s.matricule.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [students, search]);

  if (!isOpen) return null;

  const handleReadmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast("Veuillez sélectionner un élève à réadmettre.", "error");
      return;
    }

    const targetClass = classrooms.find((c) => c.id === targetClassId) || classrooms[0];

    readmitStudent(
      selectedStudent.id,
      targetClass.id,
      targetClass.name,
      academicYear,
      observation.trim(),
      "Censeur des Études"
    );

    toast(
      `L'élève ${selectedStudent.lastName} ${selectedStudent.firstName} a été réadmis avec succès en ${targetClass.name} !`,
      "success"
    );

    if (onReadmissionSuccess) {
      onReadmissionSuccess({
        ...selectedStudent,
        status: "READMIS",
        classId: targetClass.id,
        className: targetClass.name,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 via-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Recherche & Réadmission d'un Ancien Élève
              </h3>
              <p className="text-xs text-slate-500">
                Réintégration officielle dans une classe et une nouvelle année scolaire avec conservation intégrale du dossier historique.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleReadmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Étape 1 : Recherche d'un ancien élève dans les archives */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Rechercher l'élève dans l'historique permanent
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, prénom ou matricule..."
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Candidate list */}
            <div className="mt-3 max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
              {readmissionCandidates.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">
                  Aucun dossier trouvé correspondant à votre recherche.
                </div>
              ) : (
                readmissionCandidates.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedStudent(s);
                    }}
                    className={`w-full p-3 text-left transition-colors flex items-center justify-between text-xs ${
                      selectedStudent?.id === s.id
                        ? "bg-indigo-50 border-l-4 border-indigo-600 text-indigo-900 font-semibold"
                        : "hover:bg-slate-100/80 text-slate-700"
                    }`}
                  >
                    <div>
                      <div className="font-bold">
                        {s.lastName} {s.firstName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {s.matricule} &bull; Dernière classe connue : {s.className}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === "ACTIF"
                            ? "bg-emerald-100 text-emerald-800"
                            : s.status === "READMIS"
                            ? "bg-indigo-100 text-indigo-800"
                            : s.status === "TRANSFERE"
                            ? "bg-amber-100 text-amber-800"
                            : s.status === "EXCLU"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-slate-200 text-slate-800"
                        }`}
                      >
                        {s.status || "ACTIF"}
                      </span>
                      {selectedStudent?.id === s.id && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Étape 2 : Paramètres de réadmission */}
          {selectedStudent && (
            <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200 space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-200/80 pb-2">
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                  2. Configuration de la réadmission
                </span>
                <span className="text-xs font-bold text-indigo-800">
                  Élève sélectionné : {selectedStudent.lastName} {selectedStudent.firstName}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nouvelle Année Scolaire
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="2026 - 2027">2026 - 2027 (En cours)</option>
                    <option value="2027 - 2028">2027 - 2028 (Prochaine)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Classe d'affectation
                  </label>
                  <select
                    value={targetClassId}
                    onChange={(e) => setTargetClassId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.level} - {c.cycle})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motif / Observation de réadmission
                </label>
                <textarea
                  rows={2}
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Justification administrative ou pédagogique..."
                  required
                />
              </div>
            </div>
          )}

          {/* Historique récent des réadmissions */}
          {readmissionLogs.length > 0 && (
            <div>
              <span className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                <span>Dernières réadmissions enregistrées</span>
              </span>
              <div className="space-y-2">
                {readmissionLogs.slice(0, 3).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{log.studentName}</span>
                      <span className="text-slate-500 font-mono text-[11px] ml-2">
                        ({log.matricule})
                      </span>
                      <span className="block text-[11px] text-slate-600 mt-0.5">
                        {log.previousClass} &rarr; <strong>{log.newClassName}</strong> ({log.academicYear})
                      </span>
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      <div>{log.readmittedAt}</div>
                      <div>Par : {log.readmittedBy}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Fermer
            </button>
            <button
              type="submit"
              disabled={!selectedStudent}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Confirmer la réadmission</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
