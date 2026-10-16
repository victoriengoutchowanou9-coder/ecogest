"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  Filter,
  ArrowRightLeft,
  History,
  CheckCircle2,
  Clock,
  UserCheck,
  Building,
  Calendar,
  AlertCircle,
  HeartPulse,
  ShieldAlert,
  UserPlus,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCenseurStore } from "@/lib/censeur-store";
import { useDisciplineStore } from "@/lib/discipline-store";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StudentProfile, StudentStatus } from "@/lib/types/bulletin";
import { MedicalRecordModal } from "@/components/school/MedicalRecordModal";
import { DisciplineModal } from "@/components/school/DisciplineModal";
import { StudentReadmissionModal } from "@/components/school/StudentReadmissionModal";

export default function CenseurElevesPage() {
  const { toast } = useToast();
  const { classrooms, assignmentHistory, moveStudentClass } = useCenseurStore();
  const { students: disciplineStudents } = useDisciplineStore();

  const [search, setSearch] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [selectedStudentToMove, setSelectedStudentToMove] = useState<StudentProfile | null>(null);
  const [targetClassId, setTargetClassId] = useState<string>("3e-a");
  const [moveReason, setMoveReason] = useState<string>("Redéploiement pédagogique");
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // New interactive modals
  const [selectedMedicalStudent, setSelectedMedicalStudent] = useState<StudentProfile | null>(null);
  const [selectedDisciplineStudent, setSelectedDisciplineStudent] = useState<StudentProfile | null>(null);
  const [showReadmissionModal, setShowReadmissionModal] = useState(false);

  // Filter students across extended archive & status
  const filteredStudents = useMemo(() => {
    return disciplineStudents.filter((st) => {
      const matchSearch =
        !search ||
        st.lastName.toLowerCase().includes(search.toLowerCase()) ||
        st.firstName.toLowerCase().includes(search.toLowerCase()) ||
        st.matricule.toLowerCase().includes(search.toLowerCase());
      const matchClass = selectedClassFilter === "ALL" || st.classId === selectedClassFilter;
      const studentStatus = st.status || "ACTIF";
      const matchStatus = selectedStatusFilter === "ALL" || studentStatus === selectedStatusFilter;
      return matchSearch && matchClass && matchStatus;
    });
  }, [disciplineStudents, search, selectedClassFilter, selectedStatusFilter]);

  // Handle class move confirmation
  const handleConfirmMove = () => {
    if (!selectedStudentToMove) return;
    const targetClass = classrooms.find((c) => c.id === targetClassId);
    if (!targetClass) return;

    if (targetClass.id === selectedStudentToMove.classId) {
      toast("L'élève est déjà affecté à cette classe.", "info");
      setSelectedStudentToMove(null);
      return;
    }

    moveStudentClass(
      selectedStudentToMove.id,
      targetClass.id,
      targetClass.name,
      moveReason || "Changement de classe décidé par le Censeur",
      "Censeur des Études"
    );

    toast(
      `${selectedStudentToMove.lastName} ${selectedStudentToMove.firstName} a été réaffecté en ${targetClass.name}. Action enregistrée dans l'historique légal.`,
      "success"
    );
    setSelectedStudentToMove(null);
  };

  const getStatusBadge = (status?: StudentStatus) => {
    switch (status) {
      case "ACTIF":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Actif</span>;
      case "READMIS":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">Réadmis</span>;
      case "ANCIEN":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">Ancien élève</span>;
      case "DIPLOME":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">Diplômé / Terminé</span>;
      case "TRANSFERE":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Transféré</span>;
      case "DESISTE":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Désisté</span>;
      case "EXCLU":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Exclu</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Actif</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Élèves, Dossiers &amp; Historique Scolaire"
        subtitle="Gestion des effectifs, dossiers médicaux sécurisés, discipline, réadmissions et registre officiel"
        breadcrumbs={[{ label: "Censeur", href: "/censeur" }, { label: "Élèves & Dossiers" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowReadmissionModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-school-primary text-white font-semibold text-xs md:text-sm shadow-sm hover:bg-school-primary/90 touch-target"
            >
              <UserPlus className="w-4 h-4" />
              <span>Réadmettre un élève</span>
            </button>
            <Link
              href="/censeur/registre"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs md:text-sm shadow-sm touch-target"
            >
              <FileText className="w-4 h-4 text-school-primary" />
              <span>Registre de classe (PDF)</span>
            </Link>
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs md:text-sm shadow-sm touch-target"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>Historique mutations ({assignmentHistory.length})</span>
            </button>
          </div>
        }
      />

      {/* Filter and Stats Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher élève par nom, matricule..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-school-accent"
            />
          </div>

          {/* Filter by Class */}
          <div>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-semibold text-slate-800 touch-target focus:border-school-accent"
            >
              <option value="ALL">Toutes les classes</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.size} élèves)
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-semibold text-slate-800 touch-target focus:border-school-accent"
            >
              <option value="ALL">Tous les statuts scolaires</option>
              <option value="ACTIF">Actif (Inscrit)</option>
              <option value="READMIS">Réadmis</option>
              <option value="ANCIEN">Ancien élève</option>
              <option value="DIPLOME">Diplômé / Terminé</option>
              <option value="TRANSFERE">Transféré</option>
              <option value="DESISTE">Désisté</option>
              <option value="EXCLU">Exclu</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          Total : <strong>{filteredStudents.length}</strong> dossier(s) trouvé(s)
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                <th className="py-3 px-4">Élève &amp; N° Educ Master</th>
                <th className="py-3 px-4">Sexe &amp; Naissance</th>
                <th className="py-3 px-4">Classe Actuelle</th>
                <th className="py-3 px-4">Parent / Contact</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Dossier de Santé &amp; Discipline</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                  {/* Identity */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-sm">
                      {st.lastName} {st.firstName}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono block">
                      Matricule : {st.matricule} &bull; {st.educMasterNumber}
                    </span>
                  </td>

                  {/* Gender and Birth */}
                  <td className="py-3 px-4 text-slate-600">
                    <span className="font-semibold text-slate-800">
                      {st.gender === "M" ? "Masculin (M)" : "Féminin (F)"}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {st.birthDate} ({st.birthPlace || "Cotonou"})
                    </span>
                  </td>

                  {/* Current Class */}
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-school-50 text-school-primary font-bold text-xs border border-school-100 inline-block">
                      {st.className}
                    </span>
                  </td>

                  {/* Parent */}
                  <td className="py-3 px-4 text-slate-600">
                    <span className="font-medium text-slate-800">{st.parentName}</span>
                    <span className="text-[11px] text-slate-500 font-mono block">{st.parentPhone}</span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(st.status)}
                  </td>

                  {/* Health & Discipline triggers */}
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedMedicalStudent(st)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold transition-colors"
                        title="Ouvrir le dossier médical sécurisé (chiffré)"
                      >
                        <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Santé</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDisciplineStudent(st)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-800 text-[11px] font-semibold transition-colors"
                        title="Consulter et consigner les incidents disciplinaires"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <span>Discipline</span>
                      </button>
                    </div>
                  </td>

                  {/* Actions: Move class */}
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudentToMove(st);
                        setTargetClassId(st.classId === "3e-a" ? "6e-b" : "3e-a");
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs touch-target"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-school-primary" />
                      <span>Affecter</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Move Class Modal */}
      {selectedStudentToMove && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-school-primary" />
                <h3 className="font-bold text-sm text-slate-900">
                  Réaffectation pédagogique de l&apos;élève
                </h3>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p>
                Élève : <strong>{selectedStudentToMove.lastName} {selectedStudentToMove.firstName}</strong>
              </p>
              <p>
                Classe actuelle : <strong>{selectedStudentToMove.className}</strong>
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nouvelle classe d&apos;affectation
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:border-school-accent"
                >
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.level} - {c.stream})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Motif de la mutation / réaffectation
                </label>
                <input
                  type="text"
                  value={moveReason}
                  onChange={(e) => setMoveReason(e.target.value)}
                  placeholder="Ex : Rééquilibrage d'effectif, réorientation..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-school-accent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedStudentToMove(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmMove}
                className="px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-sm"
              >
                Confirmer l&apos;affectation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-school-primary" />
                <h3 className="font-bold text-sm text-slate-900">
                  Registre d&apos;Audit des Mutations &amp; Affectations
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold"
              >
                Fermer
              </button>
            </div>

            {assignmentHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs italic">
                Aucune réaffectation enregistrée pour le moment.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {assignmentHistory.map((h) => (
                  <div key={h.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{h.studentName} ({h.matricule})</span>
                      <span className="text-[11px] text-slate-400 font-mono">{h.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold">{h.previousClassName}</span>
                      <span>&rarr;</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">{h.newClassName}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Motif : {h.reason} &bull; Par : <strong>{h.author}</strong>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dossier Médical Modal */}
      {selectedMedicalStudent && (
        <MedicalRecordModal
          student={selectedMedicalStudent}
          userRole="censeur"
          isOpen={true}
          onClose={() => setSelectedMedicalStudent(null)}
        />
      )}

      {/* Incident Disciplinaire Modal */}
      {selectedDisciplineStudent && (
        <DisciplineModal
          student={selectedDisciplineStudent}
          userRole="censeur"
          isOpen={true}
          onClose={() => setSelectedDisciplineStudent(null)}
        />
      )}

      {/* Readmission Modal */}
      <StudentReadmissionModal
        isOpen={showReadmissionModal}
        onClose={() => setShowReadmissionModal(false)}
        onReadmissionSuccess={(student) => {
          toast(`${student.lastName} ${student.firstName} a été réadmis avec succès en ${student.className}.`, "success");
        }}
      />
    </div>
  );
}
