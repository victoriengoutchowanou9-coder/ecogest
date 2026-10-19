"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  UserCheck,
  ShieldCheck,
  History,
  X,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useCenseurStore, CenseurAttendanceItem } from "@/lib/censeur-store";

export default function CenseurPresencesPage() {
  const {
    attendanceItems,
    attendanceAuditLogs,
    classrooms,
    updateAttendanceStatus,
    confirmAttendance,
  } = useCenseurStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);

  // State for modification modal
  const [editingItem, setEditingItem] = useState<CenseurAttendanceItem | null>(null);
  const [newStatus, setNewStatus] = useState<CenseurAttendanceItem["status"]>("PRESENT");
  const [editReason, setEditReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // State for audit log modal
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Filtered attendance items
  const filteredItems = useMemo(() => {
    return attendanceItems.filter((item) => {
      const matchSearch =
        item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.matricule.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase());

      const matchClass = selectedClass === "all" || item.classId === selectedClass;
      const matchStatus = selectedStatus === "all" || item.status === selectedStatus;
      const matchDate = !selectedDate || item.date === selectedDate;

      return matchSearch && matchClass && matchStatus && matchDate;
    });
  }, [attendanceItems, searchQuery, selectedClass, selectedStatus, selectedDate]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = attendanceItems.length;
    const presents = attendanceItems.filter((i) => i.status === "PRESENT").length;
    const absents = attendanceItems.filter(
      (i) => i.status === "ABSENT" || i.status === "ABS_NON_JUSTIFIEE" || i.status === "ABS_JUSTIFIEE"
    ).length;
    const retards = attendanceItems.filter((i) => i.status === "RETARD").length;
    const unconfirmed = attendanceItems.filter((i) => !i.isConfirmedByCenseur).length;

    return { total, presents, absents, retards, unconfirmed };
  }, [attendanceItems]);

  const handleOpenEdit = (item: CenseurAttendanceItem) => {
    setEditingItem(item);
    setNewStatus(item.status);
    setEditReason(item.justificationNotes || "");
    setErrorMessage("");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editReason.trim() && newStatus !== editingItem.status) {
      setErrorMessage("Veuillez indiquer un motif obligatoire pour cette régularisation administrative.");
      return;
    }

    updateAttendanceStatus(editingItem.id, newStatus, editReason.trim(), "Censeur des Études");
    setEditingItem(null);
  };

  const getStatusBadge = (status: CenseurAttendanceItem["status"]) => {
    switch (status) {
      case "PRESENT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Présent
          </span>
        );
      case "RETARD":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Retard
          </span>
        );
      case "ABS_JUSTIFIEE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Abs. Justifiée
          </span>
        );
      case "ABS_NON_JUSTIFIEE":
      case "ABSENT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Abs. Non Justifiée
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pointage & Présence des Élèves"
        subtitle="Supervision quotidienne de l'assiduité, validation des appels et régularisations avec traçabilité"
        breadcrumbs={[{ label: "Censeur", href: "/censeur" }, { label: "Pointage & Présences" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAuditModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
            >
              <History className="w-4 h-4 text-slate-500" />
              Historique & Audit ({attendanceAuditLogs.length})
            </button>

            <Link
              href="/censeur/emargement"
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-school-primary bg-school-50 border border-school-200 rounded-xl hover:bg-school-100/60 transition shadow-sm"
            >
              <UserCheck className="w-4 h-4" />
              Émargement Enseignants &rarr;
            </Link>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Taux de présence"
          value={`${stats.total ? Math.round((stats.presents / stats.total) * 100) : 0}%`}
          subtitle={`${stats.presents} présents sur ${stats.total}`}
          icon={<CheckSquare className="w-6 h-6" />}
          variant="success"
        />
        <StatCard
          title="Absences constatées"
          value={stats.absents}
          subtitle="Toutes classes confondues"
          icon={<AlertCircle className="w-6 h-6" />}
          variant="danger"
        />
        <StatCard
          title="Retards signalés"
          value={stats.retards}
          subtitle="Nécessite contrôle d'entrée"
          icon={<Clock className="w-6 h-6" />}
          variant="warning"
        />
        <StatCard
          title="À valider / confirmer"
          value={stats.unconfirmed}
          subtitle="Pointages en attente Censeur"
          icon={<ShieldCheck className="w-6 h-6" />}
          variant={stats.unconfirmed > 0 ? "warning" : "info"}
        />
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher élève, matricule, matière..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
            <span className="text-slate-400 font-medium">Date :</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-0 text-xs font-semibold focus:outline-none text-slate-800"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate("")}
                className="text-[10px] text-slate-400 hover:text-slate-700 underline ml-1"
                title="Afficher toutes les dates"
              >
                Toutes
              </button>
            )}
          </div>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-school-primary"
          >
            <option value="all">Toutes les classes</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-school-primary"
          >
            <option value="all">Tous les statuts</option>
            <option value="PRESENT">Présent</option>
            <option value="RETARD">Retard</option>
            <option value="ABSENT">Absent</option>
            <option value="ABS_JUSTIFIEE">Absence justifiée</option>
            <option value="ABS_NON_JUSTIFIEE">Absence non justifiée</option>
          </select>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Registres des présences ({filteredItems.length} enregistrements)
            </h3>
            <p className="text-xs text-slate-500">
              Pointages transmis par les professeurs pour la séance sélectionnée
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            Date : {selectedDate || "Toutes"}
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-700">Aucun enregistrement trouvé</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Aucun élève ne correspond à vos critères de recherche pour cette séance.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Élève & Matricule</th>
                  <th className="py-3 px-4">Classe</th>
                  <th className="py-3 px-4">Matière & Séance</th>
                  <th className="py-3 px-4">Saisi par</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4">Validation Censeur</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.studentName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{item.matricule}</div>
                      {item.justificationNotes && (
                        <div className="text-[10px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-1 inline-block border border-amber-200/50">
                          Note : {item.justificationNotes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{item.className}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{item.subject}</div>
                      <div className="text-[11px] text-slate-500">{item.sessionTime}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-600 font-medium">{item.recordedByTeacher}</span>
                    </td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(item.status)}</td>
                    <td className="py-3 px-4">
                      {item.isConfirmedByCenseur ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Validé Censeur
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3" />
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {!item.isConfirmedByCenseur && (
                        <button
                          onClick={() => confirmAttendance(item.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition"
                          title="Confirmer la conformité du pointage"
                        >
                          Valider
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Attendance Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Régularisation de présence</h3>
                <p className="text-xs text-slate-500">Mise à jour officielle sous contrôle du Censeur</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-slate-900">{editingItem.studentName}</div>
              <div className="text-[11px] text-slate-500">
                Matricule : {editingItem.matricule} &middot; Classe : {editingItem.className}
              </div>
              <div className="text-[11px] text-slate-500">
                Séance : {editingItem.subject} ({editingItem.sessionTime})
              </div>
              <div className="text-[11px] text-slate-600 mt-1">
                Statut actuel :{" "}
                <strong className="text-slate-900">{editingItem.status}</strong> (saisi par{" "}
                {editingItem.recordedByTeacher})
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nouveau statut réglementaire *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) =>
                    setNewStatus(e.target.value as CenseurAttendanceItem["status"])
                  }
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-school-primary focus:ring-1 focus:ring-school-primary font-medium"
                >
                  <option value="PRESENT">Présent</option>
                  <option value="RETARD">Retard (Entrée autorisée)</option>
                  <option value="ABS_JUSTIFIEE">Absence justifiée (Certificat médical / Billet officiel)</option>
                  <option value="ABS_NON_JUSTIFIEE">Absence non justifiée (Irrégularité)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Motif de modification & Justification *
                </label>
                <textarea
                  rows={3}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="Ex : Certificat médical n°482 présenté par le parent, régularisation d'erreur de saisie, etc."
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-school-primary focus:ring-1 focus:ring-school-primary"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Ce motif est obligatoire et sera tracé de façon permanente dans l&apos;audit trail administratif.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-school-primary hover:bg-school-primary/90 rounded-xl shadow-sm transition"
                >
                  Enregistrer & Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Trail Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-school-primary" />
                  Audit Trail — Historique des modifications
                </h3>
                <p className="text-xs text-slate-500">
                  Journal inaltérable des corrections apportées sur les pointages élèves
                </p>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 my-4 space-y-3 pr-1">
              {attendanceAuditLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Aucune modification de pointage n&apos;a encore été effectuée.
                </div>
              ) : (
                attendanceAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{log.studentName}</span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {log.date} à {log.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                      <span>Classe : {log.className}</span>
                      <span>&bull;</span>
                      <span>
                        Changement :{" "}
                        <span className="font-semibold text-rose-600 line-through">
                          {log.previousStatus}
                        </span>{" "}
                        &rarr;{" "}
                        <span className="font-semibold text-emerald-600">{log.newStatus}</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-100">
                      <strong>Motif légal :</strong> {log.reason}
                    </div>
                    <div className="text-[10px] text-slate-400 text-right">
                      Auteur : {log.author}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
