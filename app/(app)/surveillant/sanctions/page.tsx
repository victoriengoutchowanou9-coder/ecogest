"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Scale,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  UserCheck,
  ShieldAlert,
  Printer,
  X,
  Check,
  Info,
  Calendar,
  Lock,
} from "lucide-react";
import { useSurveillantStore, SanctionRecord } from "@/lib/surveillant-store";
import { useAuth } from "@/lib/auth-store";

const SANCTION_TYPES: Array<{
  value: SanctionRecord["type"];
  label: string;
  requiresDirector: boolean;
  desc: string;
}> = [
  {
    value: "AVERTISSEMENT",
    label: "Avertissement écrit",
    requiresDirector: false,
    desc: "Notification formelle enregistrée au dossier",
  },
  {
    value: "OBSERVATION",
    label: "Observation sur le carnet",
    requiresDirector: false,
    desc: "Mention sur le livret scolaire et carnet de correspondance",
  },
  {
    value: "CONVOCATION_PARENT",
    label: "Convocation des parents / tuteurs",
    requiresDirector: false,
    desc: "Entretien obligatoire avec la vie scolaire",
  },
  {
    value: "RETENUE",
    label: "Retenue / Consigne",
    requiresDirector: true,
    desc: "Heures supplémentaires sous surveillance (soumise à avis direction)",
  },
  {
    value: "EXCLUSION_TEMPORAIRE",
    label: "Exclusion temporaire (Mise à pied)",
    requiresDirector: true,
    desc: "Éviction des cours de 1 à 3 jours (validation Directeur obligatoire)",
  },
  {
    value: "TRAVAIL_DISCIPLINAIRE",
    label: "Travail disciplinaire / TIG scolaire",
    requiresDirector: false,
    desc: "Réparation pédagogique, nettoyage ou tâche citoyenne",
  },
];

export default function SanctionsPage() {
  const { user } = useAuth();
  const {
    sanctions,
    students,
    classrooms,
    proposeSanction,
    validateSanctionByDirector,
  } = useSurveillantStore();

  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modal Proposer une Sanction
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [type, setType] = useState<SanctionRecord["type"]>("AVERTISSEMENT");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState("");

  // Print Preview
  const [printSanction, setPrintSanction] = useState<SanctionRecord | null>(null);

  const selectedTypeConfig = SANCTION_TYPES.find((t) => t.value === type);

  const filteredSanctions = useMemo(() => {
    return sanctions.filter((s) => {
      const matchSearch =
        s.studentName.toLowerCase().includes(search.toLowerCase()) ||
        s.matricule.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase());

      const matchClass = selectedClass === "ALL" || s.className === selectedClass;
      const matchType = selectedType === "ALL" || s.type === selectedType;
      const matchStatus =
        selectedStatus === "ALL" ||
        s.status === selectedStatus ||
        s.directorApprovalStatus === selectedStatus;

      return matchSearch && matchClass && matchType && matchStatus;
    });
  }, [sanctions, search, selectedClass, selectedType, selectedStatus]);

  const kpis = useMemo(() => {
    const total = sanctions.length;
    const pendingApproval = sanctions.filter((s) => s.directorApprovalStatus === "EN_ATTENTE").length;
    const active = sanctions.filter((s) => s.status === "EN_COURS").length;
    const completed = sanctions.filter((s) => s.status === "PURGEE").length;
    return { total, pendingApproval, active, completed };
  }, [sanctions]);

  const handleProposeSanction = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === studentId);
    if (!student) {
      alert("Veuillez sélectionner un élève.");
      return;
    }

    const requiresDirector = selectedTypeConfig?.requiresDirector ?? false;

    proposeSanction({
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      matricule: student.matricule,
      className: student.className,
      type,
      description,
      startDate,
      endDate: endDate || undefined,
      duration: duration || undefined,
      requiresDirectorApproval: requiresDirector,
      issuedBy: user?.fullName ? `${user.fullName} (Surveillance)` : "Surveillant Général",
    });

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setStudentId("");
    setType("AVERTISSEMENT");
    setDescription("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setDuration("");
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 text-sm font-semibold uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4" />
            Règlement Intérieur & Discipline
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sanctions Disciplinaires & Validation Direction
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestion des avertissements, retenues, TIG scolaires et propositions d'exclusion soumises à la validation du Directeur.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Prononcer / Proposer une Sanction
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">Total Sanctions</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{kpis.total}</p>
          <p className="text-xs text-gray-400 mt-1">Depuis le début de l'année</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-medium">En Attente Directeur</span>
            <Lock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-amber-700">{kpis.pendingApproval}</p>
          <p className="text-xs text-amber-500 mt-1">Exclusions & retenues lourdes</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <span className="text-xs font-medium">En Cours d'application</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-blue-700">{kpis.active}</p>
          <p className="text-xs text-blue-500 mt-1">Actuellement en vigueur</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-medium">Sanctions Purgées</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">{kpis.completed}</p>
          <p className="text-xs text-emerald-500 mt-1">Dossiers clôturés</p>
        </div>
      </div>

      {/* Alert workflow notification */}
      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-900">
          <span className="font-semibold">Protocole d'intégrité institutionnelle :</span> Le Surveillant général instruit et applique les avertissements, observations, et travaux scolaires. Pour toute mesure lourde (mise à pied, exclusion temporaire, retenue), l'approbation de M. le Directeur est formellement requise avant notification exécutoire aux parents.
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
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="ALL">Tous les types de sanctions</option>
              {SANCTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="EN_ATTENTE">⏳ En attente validation Directeur</option>
              <option value="APPROUVEE">✅ Approuvée par la Direction</option>
              <option value="REJETEE">❌ Rejetée par la Direction</option>
              <option value="EN_COURS">🔵 En cours d'application</option>
              <option value="PURGEE">🟢 Purgée / Terminée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sanctions List */}
      <div className="space-y-3">
        {filteredSanctions.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
            <Scale className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-medium text-gray-700">Aucune sanction trouvée</p>
            <p className="text-xs text-gray-400 mt-1">
              Les mesures disciplinaires prises apparaîtront ici.
            </p>
          </div>
        ) : (
          filteredSanctions.map((sanction) => {
            const config = SANCTION_TYPES.find((t) => t.value === sanction.type);
            return (
              <div
                key={sanction.id}
                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Left */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-gray-900">
                        {sanction.studentName}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                        {sanction.className}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        {sanction.matricule}
                      </span>

                      {/* Approval badge */}
                      {sanction.requiresDirectorApproval && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                            sanction.directorApprovalStatus === "EN_ATTENTE"
                              ? "bg-amber-100 text-amber-800"
                              : sanction.directorApprovalStatus === "APPROUVEE"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {sanction.directorApprovalStatus === "EN_ATTENTE" && (
                            <>
                              <Clock className="w-3 h-3" />
                              Visa Direction : En attente
                            </>
                          )}
                          {sanction.directorApprovalStatus === "APPROUVEE" && (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Visa Direction : Accordé
                            </>
                          )}
                          {sanction.directorApprovalStatus === "REJETEE" && (
                            <>
                              <X className="w-3 h-3" />
                              Visa Direction : Rejeté
                            </>
                          )}
                        </span>
                      )}

                      {/* Status badge */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          sanction.status === "EN_COURS"
                            ? "bg-blue-100 text-blue-800"
                            : sanction.status === "PURGEE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {sanction.status === "EN_COURS"
                          ? "En cours"
                          : sanction.status === "PURGEE"
                          ? "Purgée"
                          : "Annulée"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="font-semibold text-indigo-700">
                        {config?.label || sanction.type}
                      </span>
                      {sanction.duration && (
                        <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                          <Clock className="w-3.5 h-3.5" />
                          Durée : {sanction.duration}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Prise d'effet : {sanction.startDate}
                        {sanction.endDate ? ` au ${sanction.endDate}` : ""}
                      </span>
                      <span>Émise par : {sanction.issuedBy}</span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700 mt-2">
                      <span className="font-medium text-gray-900">Motif de la sanction : </span>
                      {sanction.description}
                    </div>

                    {sanction.directorNote && (
                      <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                        <Lock className="w-3.5 h-3.5 text-amber-700 mt-0.5" />
                        <div>
                          <span className="font-bold">Avis Direction Générale :</span>{" "}
                          {sanction.directorNote}
                          {sanction.approvedAt && ` (Le ${sanction.approvedAt})`}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                    {/* Director quick action simulator (for Pair-programming testing / demo) */}
                    {sanction.directorApprovalStatus === "EN_ATTENTE" && (
                      <div className="flex items-center gap-1.5 p-1.5 bg-amber-50 rounded-lg border border-amber-200">
                        <span className="text-[10px] font-semibold text-amber-900 uppercase">
                          Action Directeur :
                        </span>
                        <button
                          onClick={() =>
                            validateSanctionByDirector(
                              sanction.id,
                              true,
                              "Sanction approuvée après examen du rapport du Surveillant général."
                            )
                          }
                          className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                        >
                          Approuver
                        </button>
                        <button
                          onClick={() =>
                            validateSanctionByDirector(
                              sanction.id,
                              false,
                              "Mesure allégée en avertissement simple."
                            )
                          }
                          className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                        >
                          Rejeter
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPrintSanction(sanction)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Imprimer Avis
                      </button>

                      <Link
                        href="/surveillant/messages"
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5"
                      >
                        Informer Parent
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL : PROPOSER UNE SANCTION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-indigo-700">
                <Scale className="w-5 h-5" />
                <h3 className="font-bold text-gray-900 text-lg">
                  Prononcer ou Proposer une Sanction
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProposeSanction} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Élève sanctionné *
                </label>
                <select
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">Sélectionnez l'élève...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.lastName} {s.firstName} ({s.className}) - Matr: {s.matricule}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nature de la sanction *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as SanctionRecord["type"])}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {SANCTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} {t.requiresDirector ? "(Validation Directeur requise)" : ""}
                    </option>
                  ))}
                </select>
                {selectedTypeConfig?.requiresDirector && (
                  <p className="text-xs text-amber-700 font-medium mt-1 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    ⚠️ Cette mesure sera soumise au visa formel de M. le Directeur avant notification officielle exécutoire.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Date d'effet *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Durée de la sanction (ex: 2 jours, 3 heures)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: 2 jours d'exclusion"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Motif circonstancié et articles du règlement intérieur enfreints *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Exposé des motifs ayant conduit à cette sanction..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
                  className="px-4 py-2 text-sm font-medium rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white shadow-sm"
                >
                  {selectedTypeConfig?.requiresDirector ? "Soumettre à la Direction" : "Enregistrer la Sanction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT PREVIEW MODAL - RESPONSIVE & ADAPTÉ PC ET A4 */}
      {printSanction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in">
          {/* Style d'impression dédié A4 */}
          <style jsx global>{`
            @media print {
              @page {
                size: A4 portrait;
                margin: 12mm 15mm 12mm 15mm;
              }
              html, body {
                background: #ffffff !important;
                color: #000000 !important;
              }
              body * {
                visibility: hidden !important;
              }
              #printable-sanction-doc,
              #printable-sanction-doc * {
                visibility: visible !important;
              }
              #printable-sanction-doc {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
                background: #ffffff !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-700 overflow-hidden my-auto max-h-[95vh] flex flex-col">
            {/* Toolbar no-print */}
            <div className="no-print flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-xs sm:text-sm">
                  Aperçu Officiel &mdash; Notification de Sanction Disciplinaire
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintSanction(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document sheet */}
            <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-950 flex justify-center">
              <div
                id="printable-sanction-doc"
                className="bg-white rounded-2xl w-full max-w-[800px] p-6 sm:p-10 shadow-2xl border border-slate-300 text-slate-900 space-y-6"
              >
                {/* Republic Header */}
                <div className="border-b-2 border-slate-900 pb-4">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 text-center sm:text-left">
                    <div className="space-y-1">
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                        RÉPUBLIQUE DU BÉNIN
                      </p>
                      <p className="text-[9px] text-slate-600 font-semibold uppercase leading-tight">
                        MINISTÈRE DES ENSEIGNEMENTS SECONDAIRE, TECHNIQUE ET DE LA FORMATION PROFESSIONNELLE
                      </p>
                      <div className="flex h-1 w-24 mx-auto sm:mx-0 rounded-full overflow-hidden mt-1">
                        <span className="w-1/3 bg-emerald-600"></span>
                        <span className="w-1/3 bg-amber-400"></span>
                        <span className="w-1/3 bg-rose-600"></span>
                      </div>
                    </div>

                    <div className="text-center sm:text-right space-y-0.5">
                      <p className="text-xs sm:text-sm font-black uppercase text-slate-900">
                        SURVEILLANCE GÉNÉRALE &bull; VIE SCOLAIRE
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Collège &amp; Complexe Scolaire d&apos;Excellence ECOGEST
                      </p>
                      <p className="text-[10px] font-mono text-slate-600">
                        Réf: SANCT-{printSanction.id.toUpperCase().slice(0, 10)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center my-4 py-3 bg-slate-50 rounded-xl border-2 border-slate-800">
                  <span className="font-black uppercase tracking-wide text-sm sm:text-base text-slate-900">
                    AVIS OFFICIEL DE SANCTION DISCIPLINAIRE
                  </span>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-800">
                  <p className="leading-relaxed">
                    Il est solennellement porté à la connaissance des parents / tuteurs légaux de l&apos;apprenant(e) :
                  </p>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-semibold sm:w-1/3">Nom &amp; Prénoms :</span>
                      <strong className="text-slate-900 uppercase sm:w-2/3">{printSanction.studentName}</strong>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-semibold sm:w-1/3">Matricule Établissement :</span>
                      <span className="font-mono font-bold text-slate-800 sm:w-2/3">{printSanction.matricule}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-semibold sm:w-1/3">Classe :</span>
                      <strong className="text-slate-900 sm:w-2/3">{printSanction.className}</strong>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between py-1">
                      <span className="text-slate-500 font-semibold sm:w-1/3">Nature de la mesure :</span>
                      <strong className="text-indigo-800 sm:w-2/3">{printSanction.type}</strong>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Motifs constatés :</h4>
                    <p className="p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed text-slate-700">
                      {printSanction.description}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-2 text-xs pt-1">
                    <div>
                      <span className="text-slate-500">Prise d&apos;effet :</span>{" "}
                      <strong>{printSanction.startDate}</strong>
                    </div>
                    {printSanction.duration && (
                      <div>
                        <span className="text-slate-500">Durée :</span>{" "}
                        <strong>{printSanction.duration}</strong>
                      </div>
                    )}
                  </div>

                  {printSanction.requiresDirectorApproval && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>
                        <strong>Visa Direction :</strong> Mesure instruite par la Surveillance générale et rendue exécutoire par la Direction de l&apos;Établissement.
                      </span>
                    </div>
                  )}
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t-2 border-slate-900 text-xs text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-10">
                    <div>
                      <p className="font-bold text-slate-900 uppercase">Le Surveillant Général</p>
                      <p className="text-[10px] text-slate-500">Service de la Vie Scolaire</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{printSanction.issuedBy}</p>
                      <p className="text-[10px] text-slate-400 italic">[Cachet &amp; Signature]</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-10">
                    <div>
                      <p className="font-bold text-slate-900 uppercase">Le Chef d&apos;Établissement</p>
                      <p className="text-[10px] text-slate-500">Direction Générale</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Direction de l&apos;Établissement</p>
                      <p className="text-[10px] text-slate-400 italic">[Visa &amp; Sceau officiel]</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-1">
                  <span>Document officiel généré via ECOGEST Pro &bull; Vie Scolaire &amp; Discipline</span>
                  <span className="font-mono">ID: {printSanction.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
