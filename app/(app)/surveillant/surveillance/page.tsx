"use client";

import { useState, useMemo } from "react";
import {
  Eye,
  Plus,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  Shield,
  Printer,
  X,
  Filter,
  CheckCircle2,
  Users,
} from "lucide-react";
import { useSurveillantStore, SurveillanceSlot } from "@/lib/surveillant-store";

const ZONES: Array<{
  value: SurveillanceSlot["zone"];
  label: string;
  desc: string;
  color: string;
}> = [
  { value: "ENTREE", label: "Entrée principale / Portail", desc: "Contrôle uniformes, ponctualité, accès", color: "border-l-blue-500 bg-blue-50/50" },
  { value: "SORTIE", label: "Sorties d'établissement", desc: "Évacuation sécurisée, gestion des flux", color: "border-l-indigo-500 bg-indigo-50/50" },
  { value: "RECREATION", label: "Cour de récréation", desc: "Surveillance générale, préaux, cantine", color: "border-l-emerald-500 bg-emerald-50/50" },
  { value: "COULOIRS", label: "Couloirs & Escaliers", desc: "Maintien du silence et discipline d'étage", color: "border-l-amber-500 bg-amber-50/50" },
  { value: "COUR", label: "Espaces sportifs & Cour", desc: "Sécurité des aires de jeux et vestiaires", color: "border-l-teal-500 bg-teal-50/50" },
  { value: "EXAMEN", label: "Salles d'examen & Devoirs", desc: "Surveillance des épreuves et compositions", color: "border-l-rose-500 bg-rose-50/50" },
];

const DAYS: SurveillanceSlot["dayOfWeek"][] = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

export default function SurveillancePlanningPage() {
  const { slots, addSurveillanceSlot } = useSurveillantStore();

  const [selectedDay, setSelectedDay] = useState<string>("ALL");
  const [selectedZone, setSelectedZone] = useState<string>("ALL");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zone, setZone] = useState<SurveillanceSlot["zone"]>("ENTREE");
  const [dayOfWeek, setDayOfWeek] = useState<SurveillanceSlot["dayOfWeek"]>("Lundi");
  const [timeSlot, setTimeSlot] = useState("07:15 - 08:00");
  const [surveillantName, setSurveillantName] = useState("Augustin SOSSOU");
  const [surveillantPhone, setSurveillantPhone] = useState("+229 97 00 11 22");
  const [notes, setNotes] = useState("");

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const matchDay = selectedDay === "ALL" || slot.dayOfWeek === selectedDay;
      const matchZone = selectedZone === "ALL" || slot.zone === selectedZone;
      return matchDay && matchZone;
    });
  }, [slots, selectedDay, selectedZone]);

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    addSurveillanceSlot({
      zone,
      dayOfWeek,
      timeSlot,
      surveillantName,
      surveillantPhone,
      notes,
      status: "ACTIF",
    });

    setIsModalOpen(false);
    setNotes("");
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-sm font-semibold uppercase tracking-wider mb-1">
            <Eye className="w-4 h-4" />
            Organisation de la Sécurité & Vie Scolaire
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Planning & Répartition de la Surveillance
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Affectation des postes de garde : entrées, sorties, récréations, couloirs, cour et examens.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimer Tableau de Garde
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Affecter un Poste
          </button>
        </div>
      </div>

      {/* Zone summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {ZONES.map((z) => {
          const count = slots.filter((s) => s.zone === z.value).length;
          return (
            <div
              key={z.value}
              onClick={() => setSelectedZone(selectedZone === z.value ? "ALL" : z.value)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedZone === z.value
                  ? "border-teal-600 bg-teal-50 shadow-sm ring-1 ring-teal-500"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <span className="text-xs font-semibold text-gray-800 block truncate">
                {z.label.split(" / ")[0]}
              </span>
              <p className="text-xl font-bold text-teal-700 mt-1">{count}</p>
              <span className="text-[10px] text-gray-400">créneau{count > 1 ? "x" : ""}</span>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filtrer :
        </span>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedDay("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedDay === "ALL"
                ? "bg-teal-700 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tous les jours
          </button>
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedDay === d
                  ? "bg-teal-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {d}
          </button>
        ))}
        </div>
      </div>

      {/* Slots List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSlots.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
            <Eye className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-medium text-gray-700">Aucun poste de surveillance configuré</p>
            <p className="text-xs text-gray-400 mt-1">
              Cliquez sur "Affecter un Poste" pour planifier les rondes et points fixes.
            </p>
          </div>
        ) : (
          filteredSlots.map((slot) => {
            const zoneMeta = ZONES.find((z) => z.value === slot.zone);
            return (
              <div
                key={slot.id}
                className={`p-4 rounded-xl border border-gray-100 bg-white shadow-sm border-l-4 hover:shadow-md transition-shadow ${
                  zoneMeta?.color || ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white text-gray-800 border border-gray-200">
                    {slot.dayOfWeek}
                  </span>
                  <span className="text-xs font-semibold text-teal-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {slot.timeSlot}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-sm mb-1">
                  {zoneMeta?.label || slot.zone}
                </h3>

                <div className="flex items-center gap-2 text-xs text-gray-700 mt-2">
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  <span className="font-semibold">{slot.surveillantName}</span>
                </div>

                {slot.surveillantPhone && (
                  <p className="text-[11px] text-gray-400 pl-6">{slot.surveillantPhone}</p>
                )}

                {slot.notes && (
                  <div className="p-2.5 mt-3 bg-white/80 rounded-lg border border-gray-100 text-xs text-gray-600">
                    <span className="font-medium text-gray-800">Consignes : </span>
                    {slot.notes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL : NOUVELLE AFFECTATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-teal-700">
                <Eye className="w-5 h-5" />
                <h3 className="font-bold text-gray-900 text-lg">
                  Affecter un Poste de Surveillance
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Zone / Poste de surveillance *
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value as SurveillanceSlot["zone"])}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  {ZONES.map((z) => (
                    <option key={z.value} value={z.value}>
                      {z.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Jour de la semaine *
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value as SurveillanceSlot["dayOfWeek"])}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Plage horaire *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: 07:15 - 08:00"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nom du surveillant responsable *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Augustin SOSSOU / Surveillant Adjoint..."
                  value={surveillantName}
                  onChange={(e) => setSurveillantName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Téléphone / Contact direct
                </label>
                <input
                  type="text"
                  placeholder="ex: +229 97 00 11 22"
                  value={surveillantPhone}
                  onChange={(e) => setSurveillantPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Instructions spécifiques & Consignes
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Contrôle de la tenue correcte, des cartes scolaires, fouille des sacs si nécessaire..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
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
                  className="px-4 py-2 text-sm font-medium rounded-xl bg-teal-700 hover:bg-teal-800 text-white shadow-sm"
                >
                  Enregistrer l'affectation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
