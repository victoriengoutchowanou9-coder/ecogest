"use client";

import { useState } from "react";
import {
  Compass,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  LogOut,
  Send,
} from "lucide-react";
import { useSurveillantStore, SchoolActivityRecord } from "@/lib/surveillant-store";
import { useAuth } from "@/lib/auth-store";

const ACTIVITY_TYPES: Array<{
  value: SchoolActivityRecord["type"];
  label: string;
}> = [
  { value: "SORTIE_SCOLAIRE", label: "Sortie pédagogique / Voyage scolaire" },
  { value: "ACTIVITE_EXTRASCOLAIRE", label: "Activité extrascolaire / Club" },
  { value: "MANIFESTATION", label: "Manifestation sportive ou culturelle" },
  { value: "DEPLACEMENT_ELEVES", label: "Déplacement officiel d'élèves" },
];

export default function ActivitesScolairesPage() {
  const { user } = useAuth();
  const {
    activities,
    exits,
    classrooms,
    students,
    addActivity,
    recordExceptionalExit,
  } = useSurveillantStore();

  const [activeTab, setActiveTab] = useState<"activites" | "sorties_exceptionnelles">("activites");

  // Modal Activite
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [type, setType] = useState<SchoolActivityRecord["type"]>("SORTIE_SCOLAIRE");
  const [title, setTitle] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = useState("08:00 - 15:00");
  const [destination, setDestination] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState("Augustin SOSSOU (Surveillant Général)");
  const [authorizedCount, setAuthorizedCount] = useState(40);
  const [parentalAuth, setParentalAuth] = useState(true);
  const [notes, setNotes] = useState("");

  // Modal Sortie Exceptionnelle
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [exitStudentId, setExitStudentId] = useState("");
  const [exitTime, setExitTime] = useState(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
  const [expectedReturn, setExpectedReturn] = useState("Fin de journée");
  const [exitReason, setExitReason] = useState("");
  const [accompanying, setAccompanying] = useState("");
  const [parentNotified, setParentNotified] = useState(true);

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    addActivity({
      type,
      title,
      classNames: selectedClasses.length > 0 ? selectedClasses : ["Toutes classes"],
      date,
      timeSlot,
      destination,
      responsiblePerson,
      authorizedStudentCount: Number(authorizedCount),
      parentalAuthorizationRequired: parentalAuth,
      status: "PLANIFIEE",
      notes,
    });

    setIsActivityModalOpen(false);
    setTitle("");
    setDestination("");
    setNotes("");
  };

  const handleRecordExit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === exitStudentId);
    if (!student) {
      alert("Veuillez sélectionner un élève.");
      return;
    }

    recordExceptionalExit({
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      className: student.className,
      matricule: student.matricule,
      exitTime,
      expectedReturnTime: expectedReturn,
      reason: exitReason,
      authorizedBy: user?.fullName ? `${user.fullName} (Surveillance)` : "Surveillant Général",
      parentNotified,
      accompanyingPerson: accompanying,
    });

    setIsExitModalOpen(false);
    setExitStudentId("");
    setExitReason("");
    setAccompanying("");
  };

  const toggleClass = (className: string) => {
    if (selectedClasses.includes(className)) {
      setSelectedClasses(selectedClasses.filter((c) => c !== className));
    } else {
      setSelectedClasses([...selectedClasses, className]);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            Vie Périscolaire & Mouvements
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Activités, Événements & Autorisations de Sortie
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Encadrement des sorties scolaires, manifestations sportives et registre des billets de sortie en cours de journée.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExitModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            Billet de Sortie Exceptionnelle
          </button>
          <button
            onClick={() => setIsActivityModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Planifier une Activité
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("activites")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
            activeTab === "activites"
              ? "bg-emerald-700 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          Sorties & Manifestations Planifiées ({activities.length})
        </button>
        <button
          onClick={() => setActiveTab("sorties_exceptionnelles")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
            activeTab === "sorties_exceptionnelles"
              ? "bg-emerald-700 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          Registre des Sorties Exceptionnelles ({exits.length})
        </button>
      </div>

      {/* TAB 1: ACTIVITES */}
      {activeTab === "activites" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities.length === 0 ? (
            <div className="col-span-full bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
              <Compass className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="font-medium text-gray-700">Aucune sortie planifiée</p>
              <p className="text-xs text-gray-400 mt-1">
                Planifiez des sorties pédagogiques, journées sportives ou clubs.
              </p>
            </div>
          ) : (
            activities.map((act) => (
              <div
                key={act.id}
                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    {act.type.replace(/_/g, " ")}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                    {act.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900">{act.title}</h3>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{act.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{act.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Destination : {act.destination}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {act.classNames.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-600 space-y-1">
                  <div>
                    <span className="font-semibold text-gray-800">Responsable :</span>{" "}
                    {act.responsiblePerson}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Effectif prévu :</span>{" "}
                    {act.authorizedStudentCount} élèves
                  </div>
                  {act.parentalAuthorizationRequired && (
                    <div className="text-emerald-800 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Autorisation parentale écrite obligatoire
                    </div>
                  )}
                  {act.notes && (
                    <div className="text-gray-500 italic pt-1 border-t border-gray-200/60 mt-1">
                      {act.notes}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: REGISTRE DES SORTIES EXCEPTIONNELLES */}
      {activeTab === "sorties_exceptionnelles" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">
              Mouvements & Départs Exceptionnels du Jour
            </h3>
            <span className="text-xs text-gray-500">
              Traçabilité sécurisée des départs en cours de journée
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {exits.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <LogOut className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="font-medium text-gray-700">Aucune sortie exceptionnelle</p>
                <p className="text-xs text-gray-400">Tous les élèves sont dans l'enceinte.</p>
              </div>
            ) : (
              exits.map((exit) => (
                <div key={exit.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">
                          {exit.studentName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                          {exit.className}
                        </span>
                        <span className="text-xs font-mono text-gray-400">
                          {exit.matricule}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-1">
                        <span className="font-semibold text-rose-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Sortie à {exit.exitTime}
                        </span>
                        {exit.expectedReturnTime && (
                          <span>Retour prévu : {exit.expectedReturnTime}</span>
                        )}
                        {exit.accompanyingPerson && (
                          <span>Accompagné par : {exit.accompanyingPerson}</span>
                        )}
                        <span>Autorisé par : {exit.authorizedBy}</span>
                      </div>

                      <p className="text-xs text-gray-700 mt-2 bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="font-medium">Motif :</span> {exit.reason}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {exit.parentNotified ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Parent prévenu
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 flex items-center gap-1 border border-amber-200">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Parent non notifié
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL : NOUVELLE ACTIVITÉ */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-emerald-700">
                <Compass className="w-5 h-5" />
                <h3 className="font-bold text-gray-900 text-lg">
                  Planifier une Activité ou Sortie
                </h3>
              </div>
              <button
                onClick={() => setIsActivityModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Type d'activité *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as SchoolActivityRecord["type"])}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {ACTIVITY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Intitulé de l'activité *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Visite du Port Autonome de Cotonou"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Classes concernées
                </label>
                <div className="flex flex-wrap gap-2">
                  {classrooms.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => toggleClass(c.name)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        selectedClasses.includes(c.name)
                          ? "bg-emerald-700 text-white border-emerald-700"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Horaires
                  </label>
                  <input
                    type="text"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Lieu / Destination *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Cotonou, Salle Polyvalente..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Encadrant responsable
                  </label>
                  <input
                    type="text"
                    value={responsiblePerson}
                    onChange={(e) => setResponsiblePerson(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Effectif autorisé
                  </label>
                  <input
                    type="number"
                    value={authorizedCount}
                    onChange={(e) => setAuthorizedCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="parentalAuth"
                  checked={parentalAuth}
                  onChange={(e) => setParentalAuth(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-500"
                />
                <label htmlFor="parentalAuth" className="text-xs text-gray-700 font-medium">
                  Exiger l'autorisation parentale préalable
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                >
                  Enregistrer l'activité
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL : BILLET DE SORTIE EXCEPTIONNELLE */}
      {isExitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-rose-700">
                <LogOut className="w-5 h-5" />
                <h3 className="font-bold text-gray-900 text-lg">
                  Billet de Sortie Exceptionnelle
                </h3>
              </div>
              <button
                onClick={() => setIsExitModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordExit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Élève demandeur *
                </label>
                <select
                  required
                  value={exitStudentId}
                  onChange={(e) => setExitStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  <option value="">Sélectionnez l'élève...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.lastName} {s.firstName} ({s.className})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Heure effective de départ *
                  </label>
                  <input
                    type="text"
                    required
                    value={exitTime}
                    onChange={(e) => setExitTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Retour prévu
                  </label>
                  <input
                    type="text"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Motif du départ *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Malaise médical, urgence familiale, convocation extérieure..."
                  value={exitReason}
                  onChange={(e) => setExitReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Personne accompagnatrice / Récupérateur
                </label>
                <input
                  type="text"
                  placeholder="Mère, Tuteur légal, Transporteur..."
                  value={accompanying}
                  onChange={(e) => setAccompanying(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="parentNotif"
                  checked={parentNotified}
                  onChange={(e) => setParentNotified(e.target.checked)}
                  className="rounded text-rose-700 focus:ring-rose-500"
                />
                <label htmlFor="parentNotif" className="text-xs text-gray-700 font-medium">
                  Parent immédiatement prévenu par appel ou SMS
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsExitModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium rounded-xl bg-rose-700 hover:bg-rose-800 text-white shadow-sm"
                >
                  Délivrer le Billet de Sortie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
