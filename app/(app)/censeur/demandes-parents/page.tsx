"use client";

import React, { useState, useMemo } from "react";
import {
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  User,
  Phone,
  Mail,
  GraduationCap,
  ShieldCheck,
  History,
  FileCheck,
  AlertCircle,
  Eye,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useCenseurStore, ParentChildAccessRequest } from "@/lib/censeur-store";
import { cn } from "@/lib/utils";

export default function CenseurDemandesParentsPage() {
  const {
    parentAccessRequests,
    studentsList,
    validateParentAccessRequest,
    toggleChildAccessActivation,
  } = useCenseurStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "EN_ATTENTE" | "ACCEPTEE" | "REFUSEE">("ALL");

  // Inspection & Validation Modal State
  const [selectedRequest, setSelectedRequest] = useState<ParentChildAccessRequest | null>(null);
  const [confirmActivation, setConfirmActivation] = useState(true);
  const [refusalReason, setRefusalReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Statistics
  const stats = useMemo(() => {
    const total = parentAccessRequests.length;
    const enAttente = parentAccessRequests.filter((r) => r.status === "EN_ATTENTE").length;
    const acceptes = parentAccessRequests.filter((r) => r.status === "ACCEPTEE" && r.isAccessActivated).length;
    const refuses = parentAccessRequests.filter((r) => r.status === "REFUSEE").length;

    return { total, enAttente, acceptes, refuses };
  }, [parentAccessRequests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return parentAccessRequests.filter((req) => {
      const matchSearch =
        req.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.parentPhone.includes(searchQuery) ||
        req.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.matricule.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.className.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = selectedStatus === "ALL" || req.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [parentAccessRequests, searchQuery, selectedStatus]);

  // Find full student profile for comparison
  const studentProfile = useMemo(() => {
    if (!selectedRequest) return null;
    return studentsList.find((s) => s.id === selectedRequest.studentId) || null;
  }, [selectedRequest, studentsList]);

  const handleOpenInspection = (req: ParentChildAccessRequest) => {
    setSelectedRequest(req);
    setConfirmActivation(req.isAccessActivated || req.status !== "REFUSEE");
    setRefusalReason(req.refusalReason || "");
    setIsRejecting(false);
    setErrorMessage("");
  };

  const handleApprove = () => {
    if (!selectedRequest) return;
    validateParentAccessRequest(
      selectedRequest.id,
      "ACCEPTEE",
      "Censeur des Études"
    );
    setSelectedRequest(null);
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    if (!refusalReason.trim()) {
      setErrorMessage("Veuillez obligatoirement renseigner le motif du refus pour la traçabilité.");
      return;
    }
    validateParentAccessRequest(
      selectedRequest.id,
      "REFUSEE",
      "Censeur des Études",
      refusalReason.trim()
    );
    setSelectedRequest(null);
  };

  const getStatusBadge = (status: ParentChildAccessRequest["status"], isActivated: boolean) => {
    switch (status) {
      case "EN_ATTENTE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            En attente de validation
          </span>
        );
      case "ACCEPTEE":
        return isActivated ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Accès ACTIVÉ
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            Acceptée (Accès Désactivé)
          </span>
        );
      case "REFUSEE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <X className="w-3.5 h-3.5" />
            Demande Refusée
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Demandes d'Accès Parents"
        subtitle="Validation administrative et activation sécurisée des accès parents aux dossiers des élèves"
        breadcrumbs={[{ label: "Censeur", href: "/censeur" }, { label: "Demandes d'accès parents" }]}
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total demandes"
          value={stats.total}
          subtitle="Toutes requêtes reçues"
          icon={<ShieldCheck className="w-6 h-6" />}
          variant="info"
        />
        <StatCard
          title="En attente Censeur"
          value={stats.enAttente}
          subtitle="Nécessite vérification"
          icon={<AlertCircle className="w-6 h-6" />}
          variant={stats.enAttente > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Accès Parents Activés"
          value={stats.acceptes}
          subtitle="Suivi scolaire opérationnel"
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="success"
        />
        <StatCard
          title="Demandes Refusées"
          value={stats.refuses}
          subtitle="Non conformes / Rejetées"
          icon={<X className="w-6 h-6" />}
          variant="default"
        />
      </div>

      {/* Security Notice */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3.5 text-amber-900 text-xs">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-950">Règle de Sécurité Stricte :</p>
          <p className="text-amber-800 leading-relaxed">
            La simple possession d&apos;un numéro de matricule ou Educ Master ne confère aucun accès automatique.
            En tant que Censeur, vous devez vérifier la concordance avec les informations d&apos;état-civil
            et le contact du responsable légal enregistré à l&apos;inscription avant d&apos;activer l&apos;accès.
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher parent, élève, matricule..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setSelectedStatus("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-xl transition",
              selectedStatus === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            Toutes ({stats.total})
          </button>
          <button
            onClick={() => setSelectedStatus("EN_ATTENTE")}
            className={cn(
              "px-3 py-1.5 rounded-xl transition",
              selectedStatus === "EN_ATTENTE"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            )}
          >
            En attente ({stats.enAttente})
          </button>
          <button
            onClick={() => setSelectedStatus("ACCEPTEE")}
            className={cn(
              "px-3 py-1.5 rounded-xl transition",
              selectedStatus === "ACCEPTEE"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            )}
          >
            Activées ({stats.acceptes})
          </button>
          <button
            onClick={() => setSelectedStatus("REFUSEE")}
            className={cn(
              "px-3 py-1.5 rounded-xl transition",
              selectedStatus === "REFUSEE"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50 text-rose-800 hover:bg-rose-100"
            )}
          >
            Refusées ({stats.refuses})
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Registres des demandes d&apos;accès parents ({filteredRequests.length})
            </h3>
            <p className="text-xs text-slate-500">
              Contrôlez les demandes et activez les autorisations d&apos;accès
            </p>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-700">Aucune demande trouvée</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Aucune demande d&apos;accès parent ne correspond aux critères sélectionnés.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Parent Demandeur</th>
                  <th className="py-3 px-4">Élève Demandé</th>
                  <th className="py-3 px-4">Classe & Année</th>
                  <th className="py-3 px-4">Date de Demande</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-center">Droit d&apos;accès</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{req.parentName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{req.parentPhone}</span>
                      </div>
                      {req.parentEmail && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                          {req.parentEmail}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{req.studentName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{req.matricule}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {req.className}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{req.academicYear}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{req.requestDate}</div>
                      <div className="text-[11px] text-slate-400">{req.requestTime}</div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(req.status, req.isAccessActivated)}
                    </td>

                    {/* Interactive Activation Checkbox */}
                    <td className="py-3 px-4 text-center">
                      {req.status === "ACCEPTEE" ? (
                        <label className="inline-flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100">
                          <input
                            type="checkbox"
                            checked={req.isAccessActivated}
                            onChange={(e) =>
                              toggleChildAccessActivation(req.id, e.target.checked)
                            }
                            className="rounded text-school-primary focus:ring-school-primary"
                          />
                          <span
                            className={cn(
                              "text-xs font-bold",
                              req.isAccessActivated ? "text-emerald-700" : "text-slate-400"
                            )}
                          >
                            {req.isAccessActivated ? "Activé" : "Désactivé"}
                          </span>
                        </label>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">En attente</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenInspection(req)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-school-primary bg-school-50 hover:bg-school-100/80 rounded-xl transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {req.status === "EN_ATTENTE" ? "Examiner & Valider" : "Détails / Audit"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspection & Validation Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-school-primary" />
                  Vérification de la Demande d&apos;Accès
                </h3>
                <p className="text-xs text-slate-500">
                  Confrontation des informations du demandeur avec les registres de l&apos;élève
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Comparison Grid: Parent Demandeur vs Fiche Registre */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Box 1: Demandeur */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Compte Parent Demandeur
                </div>
                <div>
                  <div className="font-bold text-slate-900">{selectedRequest.parentName}</div>
                  <div className="text-slate-600 mt-0.5">{selectedRequest.parentPhone}</div>
                  <div className="text-slate-500 text-[11px]">{selectedRequest.parentEmail}</div>
                </div>
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                  Demande émise le {selectedRequest.requestDate} à {selectedRequest.requestTime}
                </div>
              </div>

              {/* Box 2: Fiche Officielle de l'Élève */}
              <div className="p-3.5 bg-school-50/50 rounded-xl border border-school-200 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-school-primary">
                  Dossier Officiel Élève
                </div>
                <div>
                  <div className="font-bold text-slate-900">{selectedRequest.studentName}</div>
                  <div className="text-slate-600 font-mono text-[11px] mt-0.5">
                    Matricule : {selectedRequest.matricule}
                  </div>
                  <div className="text-slate-600 font-medium">Classe : {selectedRequest.className}</div>
                  {studentProfile && (
                    <div className="text-[11px] text-slate-500 mt-1">
                      Parent déclaré à l&apos;inscription :{" "}
                      <strong className="text-slate-800">{studentProfile.parentName}</strong> (
                      {studentProfile.parentPhone})
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Decision & Action Area */}
            {selectedRequest.status === "EN_ATTENTE" && !isRejecting ? (
              <div className="space-y-4 pt-2">
                {/* Mandatory Checkbox as requested: ☐ / ☑ Autoriser l'accès à Jean Dupont */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={confirmActivation}
                      onChange={(e) => setConfirmActivation(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-emerald-950 block">
                        Autoriser et activer l&apos;accès à {selectedRequest.studentName}
                      </span>
                      <p className="text-[11px] text-emerald-800 leading-snug">
                        Le parent pourra immédiatement consulter les notes, bulletins, emplois du temps
                        et devoirs de cet élève depuis son espace personnel.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRejecting(true)}
                    className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
                  >
                    Refuser la demande...
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={!confirmActivation}
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-xl shadow-sm transition"
                    >
                      Valider et Activer l&apos;accès
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedRequest.status === "EN_ATTENTE" && isRejecting ? (
              /* Refusal Form */
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-rose-900">
                    Motif obligatoire du refus :
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ex : Numéro de téléphone non concordant avec la fiche d'inscription physique..."
                    value={refusalReason}
                    onChange={(e) => setRefusalReason(e.target.value)}
                    className="w-full text-xs bg-white border border-rose-300 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-rose-500"
                    required
                  />
                  <p className="text-[10px] text-rose-700">
                    Ce motif sera archivé dans l&apos;audit trail de sécurité.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRejecting(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition"
                  >
                    Confirmer le refus
                  </button>
                </div>
              </div>
            ) : (
              /* Already Validated or Refused — Audit Details */
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Audit Trail de la Décision
                </div>
                <div className="space-y-1 text-slate-600">
                  <div>
                    Statut : <strong>{selectedRequest.status}</strong>
                  </div>
                  <div>
                    Décision prise par : <strong>{selectedRequest.validatedBy || "Censeur"}</strong>
                  </div>
                  {selectedRequest.validatedAt && (
                    <div>
                      Date de validation : <strong>{selectedRequest.validatedAt}</strong>
                    </div>
                  )}
                  {selectedRequest.refusalReason && (
                    <div className="text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200 mt-2">
                      <strong>Motif de refus :</strong> {selectedRequest.refusalReason}
                    </div>
                  )}
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
