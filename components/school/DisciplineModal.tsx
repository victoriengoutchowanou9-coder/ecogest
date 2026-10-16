"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  X,
  Save,
  Calendar,
} from "lucide-react";
import { StudentProfile, DisciplineIncident } from "@/lib/types/bulletin";
import { useDisciplineStore } from "@/lib/discipline-store";
import { useToast } from "@/components/ui/Toast";

interface DisciplineModalProps {
  student: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

const INCIDENT_TYPES = [
  "Retards répétés / Assiduité",
  "Absence injustifiée",
  "Insolence / Manquement au respect",
  "Bagarre / Violence physique",
  "Dégradation de matériel",
  "Fraude / Tricherie lors d'une évaluation",
  "Uniforme non conforme",
  "Usage de téléphone ou objet prohibé",
  "Autre manquement au règlement",
];

const SANCTIONS = [
  "Avertissement verbal",
  "Avertissement écrit",
  "Blâme officiel",
  "Heures de retenue / colle",
  "Exclusion temporaire de cours (1 jour)",
  "Exclusion temporaire d'établissement (3 jours)",
  "Exclusion temporaire d'établissement (8 jours)",
  "Convocation immédiate des parents",
  "Traduction devant le Conseil de Discipline",
];

const LOCATIONS = [
  "Salle de classe",
  "Cour de récréation",
  "Couloir / Escalier",
  "Réfectoire / Cantine",
  "Labo Sciences",
  "Terrain d'EPS",
  "Portail / Entrée",
  "Extérieur de l'établissement",
];

export const DisciplineModal: React.FC<DisciplineModalProps> = ({
  student,
  isOpen,
  onClose,
  userRole = "censeur",
}) => {
  const { toast } = useToast();
  const { getIncidentsForStudent, addDisciplineIncident, updateIncidentStatus } = useDisciplineStore();

  const [activeTab, setActiveTab] = useState<"history" | "new">("history");

  // New incident form
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [incidentType, setIncidentType] = useState(INCIDENT_TYPES[0]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [involvedParties, setInvolvedParties] = useState(student.lastName + " " + student.firstName);
  const [recordedBy, setRecordedBy] = useState("Censeur des Études");
  const [sanction, setSanction] = useState(SANCTIONS[0]);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"OUVERT" | "EN_COURS" | "RESOLU">("EN_COURS");

  const incidents = getIncidentsForStudent(student.id);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast("Veuillez renseigner la description de l'incident.", "error");
      return;
    }

    addDisciplineIncident(
      {
        studentId: student.id,
        studentName: `${student.lastName} ${student.firstName}`,
        matricule: student.matricule,
        className: student.className,
        date: incidentDate,
        incidentType,
        description: description.trim(),
        location,
        involvedParties: involvedParties.trim(),
        recordedBy: recordedBy.trim(),
        sanction,
        comment: comment.trim(),
        status,
      },
      userRole,
      "Censeur des Études"
    );

    toast(`Incident disciplinaire enregistré avec succès pour ${student.firstName}`, "success");
    setDescription("");
    setComment("");
    setActiveTab("history");
  };

  const handleStatusChange = (id: string, newStatus: "OUVERT" | "EN_COURS" | "RESOLU") => {
    updateIncidentStatus(id, newStatus);
    toast(`Statut de l'incident mis à jour : ${newStatus}`, "success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-amber-50 via-rose-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Dossier Disciplinaire & Conduite
              </h3>
              <p className="text-xs text-slate-500">
                {student.lastName} {student.firstName} &bull; {student.className} &bull; {student.matricule}
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

        {/* Tab switch */}
        <div className="px-6 py-2 border-b border-slate-200 bg-slate-50 flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "history"
                ? "bg-white text-school-primary shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Historique des incidents ({incidents.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("new")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "new"
                ? "bg-white text-school-primary shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enregistrer un incident</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "history" ? (
            <div className="space-y-4">
              {incidents.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold text-slate-700">Aucun incident disciplinaire enregistré</p>
                  <p className="text-xs mt-1 text-slate-500">
                    L'élève possède un dossier de conduite exemplaire.
                  </p>
                </div>
              ) : (
                incidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            {inc.incidentType}
                          </span>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              inc.status === "RESOLU"
                                ? "bg-emerald-100 text-emerald-800"
                                : inc.status === "EN_COURS"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {inc.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {inc.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {inc.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            Rapporteur : {inc.recordedBy}
                          </span>
                        </div>
                      </div>

                      {/* Status toggle button */}
                      <select
                        value={inc.status}
                        onChange={(e) =>
                          handleStatusChange(
                            inc.id,
                            e.target.value as "OUVERT" | "EN_COURS" | "RESOLU"
                          )
                        }
                        className="text-xs py-1 px-2.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none"
                      >
                        <option value="OUVERT">Statut : OUVERT</option>
                        <option value="EN_COURS">Statut : EN COURS</option>
                        <option value="RESOLU">Statut : RÉSOLU</option>
                      </select>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {inc.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Mesure / Sanction infligée
                        </span>
                        <span className="font-bold text-rose-700">{inc.sanction}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Commentaire / Suivi
                        </span>
                        <span className="text-slate-600">{inc.comment || "Aucun commentaire"}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date de l'incident
                  </label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Type d'incident
                  </label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-primary"
                  >
                    {INCIDENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description détaillée des faits
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-primary"
                  placeholder="Circonstances exactes, faits constatés..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lieu de l'incident
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-primary"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Personnel ayant enregistré l'incident
                  </label>
                  <input
                    type="text"
                    value={recordedBy}
                    onChange={(e) => setRecordedBy(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-primary"
                    placeholder="Nom et fonction..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Personnes concernées / Témoins
                  </label>
                  <input
                    type="text"
                    value={involvedParties}
                    onChange={(e) => setInvolvedParties(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-primary"
                    placeholder="Élèves, enseignants ou témoins..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mesure ou sanction prise
                  </label>
                  <select
                    value={sanction}
                    onChange={(e) => setSanction(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-primary font-semibold text-rose-700"
                  >
                    {SANCTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Commentaire / Suivi
                  </label>
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-primary"
                    placeholder="Ex: Engagement écrit, convocation envoyée..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Statut initial du dossier
                  </label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "OUVERT" | "EN_COURS" | "RESOLU")
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-primary font-semibold"
                  >
                    <option value="EN_COURS">EN COURS (Enquête ou sanction en exécution)</option>
                    <option value="OUVERT">OUVERT (En attente d'arbitrage)</option>
                    <option value="RESOLU">RÉSOLU (Sanction purgée / Dossier clos)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-school-primary hover:bg-school-700 text-white font-semibold text-xs shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer l'incident</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
