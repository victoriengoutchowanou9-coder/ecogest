"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  UserX,
  MessageSquare,
  Scale,
  Calendar,
  MapPin,
  Users,
  Eye,
  Check,
  X,
  History,
} from "lucide-react";
import { useSurveillantStore } from "@/lib/surveillant-store";
import { useAuth } from "@/lib/auth-store";
import { DisciplineIncident } from "@/lib/types/bulletin";

const INCIDENT_TYPES = [
  "Retard",
  "Absence injustifiée",
  "Indiscipline en classe",
  "Violence physique ou verbale",
  "Dégradation de matériel",
  "Non-respect du règlement intérieur",
  "Sortie non autorisée",
  "Autre manquement",
];

export default function DisciplineIncidentsPage() {
  const { user } = useAuth();
  const {
    incidents,
    students,
    classrooms,
    addIncident,
    updateIncidentStatus,
    sendParentDisciplineMessage,
  } = useSurveillantStore();

  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modal Signaler un incident
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [incidentType, setIncidentType] = useState(INCIDENT_TYPES[2]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
  const [location, setLocation] = useState("Cour de récréation");
  const [involvedParties, setInvolvedParties] = useState("");
  const [description, setDescription] = useState("");
  const [sanction, setSanction] = useState("");
  const [comment, setComment] = useState("");

  // Modal Historique élève
  const [historyStudent, setHistoryStudent] = useState<any | null>(null);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchSearch =
        inc.studentName.toLowerCase().includes(search.toLowerCase()) ||
        inc.matricule.toLowerCase().includes(search.toLowerCase()) ||
        inc.incidentType.toLowerCase().includes(search.toLowerCase()) ||
        inc.description.toLowerCase().includes(search.toLowerCase());

      const matchClass = selectedClass === "ALL" || inc.className === selectedClass;
      const matchType = selectedType === "ALL" || inc.incidentType.includes(selectedType);
      const matchStatus = selectedStatus === "ALL" || inc.status === selectedStatus;

      return matchSearch && matchClass && matchType && matchStatus;
    });
  }, [incidents, search, selectedClass, selectedType, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = incidents.length;
    const open = incidents.filter((i) => i.status === "OUVERT").length;
    const inProgress = incidents.filter((i) => i.status === "EN_COURS").length;
    const resolved = incidents.filter((i) => i.status === "RESOLU").length;
    return { total, open, inProgress, resolved };
  }, [incidents]);

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) {
      alert("Veuillez sélectionner un élève.");
      return;
    }

    addIncident({
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      matricule: student.matricule,
      className: student.className,
      date: `${date} ${time}`,
      incidentType,
      description,
      location,
      involvedParties: involvedParties || "Élève seul",
      recordedBy: user?.fullName ? `${user.fullName} (Surveillance)` : "Surveillant Général",
      sanction: sanction || "En cours d'appréciation",
      comment: comment || "Rapport consigné au registre disciplinaire",
      status: "OUVERT",
    });

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedStudentId("");
    setIncidentType(INCIDENT_TYPES[2]);
    setDescription("");
    setLocation("Cour de récréation");
    setInvolvedParties("");
    setSanction("");
    setComment("");
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-rose-700 text-sm font-semibold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            Vie Scolaire & Discipline
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Incidents Disciplinaires
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Enregistrement, traçabilité des faits, témoins, mesures prises et suivi du dossier élève.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Signaler un Incident
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">Total Consignés</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">Registres vie scolaire</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-xs font-medium">Ouverts (À traiter)</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-rose-700">{stats.open}</p>
          <p className="text-xs text-rose-500 mt-1">Nécessitent une mesure</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-medium">En Cours d'examen</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-amber-700">{stats.inProgress}</p>
          <p className="text-xs text-amber-500 mt-1">Auditions / Parents avisés</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-medium">Résolus & Clôturés</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">{stats.resolved}</p>
          <p className="text-xs text-emerald-500 mt-1">Sanction purgée ou classé</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher élève, matricule, motif..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            >
              <option value="ALL">Toutes les classes</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            >
              <option value="ALL">Tous les types d'incidents</option>
              {INCIDENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="OUVERT">🔴 Ouvert</option>
              <option value="EN_COURS">🟡 En cours</option>
              <option value="RESOLU">🟢 Résolu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {filteredIncidents.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
            <ShieldAlert className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-medium text-gray-700">Aucun incident enregistré</p>
            <p className="text-xs text-gray-400 mt-1">
              Tous les manquements enregistrés apparaîtront ici avec leur chaîne de traitement.
            </p>
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const student = students.find((s) => s.id === incident.studentId);
            return (
              <div
                key={incident.id}
                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Left: Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-gray-900">
                        {incident.studentName}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                        {incident.className}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        {incident.matricule}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          incident.status === "OUVERT"
                            ? "bg-rose-100 text-rose-800"
                            : incident.status === "EN_COURS"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {incident.status === "OUVERT"
                          ? "🔴 Ouvert"
                          : incident.status === "EN_COURS"
                          ? "🟡 En cours"
                          : "🟢 Résolu"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1 font-medium text-rose-700">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {incident.incidentType}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {incident.date}
                      </span>
                      {incident.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {incident.location}
                        </span>
                      )}
                      {incident.involvedParties && (
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          Témoins: {incident.involvedParties}
                        </span>
                      )}
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700 mt-2">
                      <span className="font-medium text-gray-900">Faits constatés : </span>
                      {incident.description}
                    </div>

                    {incident.sanction && (
                      <div className="text-xs text-gray-600 flex items-center gap-1.5 mt-1">
                        <Scale className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="font-semibold text-gray-800">Mesure / Décision :</span>{" "}
                        {incident.sanction}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <div className="flex items-center gap-1">
                      {incident.status !== "RESOLU" && (
                        <button
                          onClick={() => updateIncidentStatus(incident.id, "RESOLU")}
                          title="Clôturer comme résolu"
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Résoudre
                        </button>
                      )}
                      {incident.status === "OUVERT" && (
                        <button
                          onClick={() => updateIncidentStatus(incident.id, "EN_COURS")}
                          title="Passer en cours de traitement"
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors inline-flex items-center gap-1"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          En cours
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/surveillant/sanctions`}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors inline-flex items-center gap-1"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        Sanctionner
                      </Link>

                      <button
                        onClick={() => {
                          if (student) {
                            sendParentDisciplineMessage({
                              studentId: student.id,
                              studentName: `${student.firstName} ${student.lastName}`,
                              className: student.className,
                              parentName: student.parentName,
                              parentPhone: student.parentPhone,
                              type: "SIGNALEMENT_INCIDENT",
                              subject: `Signalement incident disciplinaire : ${student.firstName} ${student.lastName}`,
                              message: `Bonjour M./Mme ${student.parentName}. Nous vous informons que votre enfant a fait l'objet d'un rapport disciplinaire pour : ${incident.incidentType}. Description : ${incident.description}. Merci de contacter la surveillance générale.`,
                              sentBy: "Augustin SOSSOU (Surveillant Général)",
                            });
                            alert(`Message d'alerte envoyé au parent de ${student.firstName} ${student.lastName} (${student.parentPhone})`);
                          }
                        }}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors inline-flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Alerter Parent
                      </button>

                      <button
                        onClick={() => setHistoryStudent(student || { id: incident.studentId, firstName: incident.studentName, lastName: "", className: incident.className, matricule: incident.matricule })}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors inline-flex items-center gap-1"
                      >
                        <History className="w-3.5 h-3.5" />
                        Historique
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL : NOUVEL INCIDENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-rose-700">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-gray-900 text-lg">
                  Consigner un Incident Disciplinaire
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Élève concerné * (Base partagée établissement)
                </label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  <option value="">Sélectionnez l'élève...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.lastName} {s.firstName} ({s.className}) - Matr: {s.matricule}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Date de l'incident *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Heure constatée *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: 08:15"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Type d'incident *
                </label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  {INCIDENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Lieu des faits
                  </label>
                  <input
                    type="text"
                    placeholder="Cour, Salle 5A, Réfectoire..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Témoins éventuels / Autres parties
                  </label>
                  <input
                    type="text"
                    placeholder="Camarades, Enseignant de service..."
                    value={involvedParties}
                    onChange={(e) => setInvolvedParties(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description précise des faits *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Circonstances exactes de l'infraction ou du comportement..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Action immédiate prise / Sanction envisagée
                </label>
                <input
                  type="text"
                  placeholder="Rappel à l'ordre, convocation, mise à pied proposée..."
                  value={sanction}
                  onChange={(e) => setSanction(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium rounded-xl bg-rose-700 hover:bg-rose-800 text-white shadow-sm"
                >
                  Enregistrer l'incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL : HISTORIQUE DISCIPLINAIRE ÉLÈVE */}
      {historyStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-gray-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-rose-700">
                <History className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    Dossier Disciplinaire : {historyStudent.firstName} {historyStudent.lastName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Classe : {historyStudent.className} | Matr : {historyStudent.matricule}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHistoryStudent(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {incidents.filter((i) => i.studentId === historyStudent.id).length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                  <p className="font-medium text-gray-700">Aucun antécédent disciplinaire</p>
                  <p className="text-xs text-gray-400">Cet élève a un comportement exemplaire consigné.</p>
                </div>
              ) : (
                incidents
                  .filter((i) => i.studentId === historyStudent.id)
                  .map((inc) => (
                    <div key={inc.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-rose-800">{inc.incidentType}</span>
                        <span className="text-xs text-gray-400">{inc.date}</span>
                      </div>
                      <p className="text-gray-700 text-xs mb-1.5">{inc.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-200/50 pt-1 mt-1">
                        <span>Lieu : {inc.location || "Non précisé"}</span>
                        <span className="font-medium text-indigo-700">Statut : {inc.status}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setHistoryStudent(null)}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
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
