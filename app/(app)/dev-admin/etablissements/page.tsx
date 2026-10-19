"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  CreditCard,
  X,
  AlertTriangle,
  User,
  Users,
  GraduationCap,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { SCHOOL_PLANS } from "@/lib/subscription-plans";

interface EnrichedSchool {
  id: string;
  code: string;
  name: string;
  shortName: string;
  country: string;
  region: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  activeYear: string;
  createdAt: string;
  directorName: string;
  directorEmail: string;
  usersCount: number;
  studentsCount: number;
  planName: string;
  subscriptionStatus: "ACTIVE" | "TRIAL" | "EXPIRED" | "SUSPENDED";
  subscriptionExpiresAt: string;
  status: "ACTIF" | "BLOQUE";
}

export default function DevEtablissementsPage() {
  const { toast } = useToast();

  const [schools, setSchools] = useState<EnrichedSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [planFilter, setPlanFilter] = useState("ALL");

  // Modal Fiche Détaillée
  const [selectedSchool, setSelectedSchool] = useState<EnrichedSchool | null>(null);

  // Modal Bloquer / Débloquer
  const [blockModalSchool, setBlockModalSchool] = useState<EnrichedSchool | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);

  // Modal Supprimer
  const [deleteModalSchool, setDeleteModalSchool] = useState<EnrichedSchool | null>(null);
  const [confirmNameInput, setConfirmNameInput] = useState("");
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  // Modal Faire un Abonnement
  const [subModalSchool, setSubModalSchool] = useState<EnrichedSchool | null>(null);
  const [subPlanCode, setSubPlanCode] = useState<string>("BASIC");
  const [subDuration, setSubDuration] = useState<number>(1);
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);

  const loadSchools = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dev-admin/schools");
      if (res.ok) {
        const data = await res.json();
        setSchools(data.schools || []);
      } else {
        toast("Impossible de charger les établissements.", "error");
      }
    } catch {
      toast("Erreur réseau.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  // Filtrage
  const filteredSchools = schools.filter((s) => {
    const matchesSearch =
      search.trim() === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      s.directorName.toLowerCase().includes(search.toLowerCase()) ||
      s.directorEmail.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || s.status === statusFilter;

    const matchesPlan =
      planFilter === "ALL" || s.planName.toLowerCase().includes(planFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Action Bloquer / Débloquer
  const handleToggleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockModalSchool) return;

    const nextStatus = blockModalSchool.status === "BLOQUE" ? "ACTIF" : "BLOQUE";
    setIsSubmittingBlock(true);

    try {
      const res = await fetch("/api/dev-admin/schools", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: blockModalSchool.id,
          status: nextStatus,
          reason: blockReason.trim() || undefined,
        }),
      });

      if (res.ok) {
        toast(
          `Établissement ${nextStatus === "BLOQUE" ? "bloqué" : "débloqué"} avec succès.`,
          nextStatus === "BLOQUE" ? "info" : "success"
        );
        setBlockModalSchool(null);
        setBlockReason("");
        loadSchools();
      } else {
        toast("Erreur lors de la modification du statut.", "error");
      }
    } catch {
      toast("Erreur de connexion.", "error");
    } finally {
      setIsSubmittingBlock(false);
    }
  };

  // Action Supprimer définitivement
  const handleDeleteSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteModalSchool) return;

    if (confirmNameInput.trim() !== deleteModalSchool.name.trim()) {
      toast("Le nom saisi ne correspond pas exactement.", "error");
      return;
    }

    setIsSubmittingDelete(true);

    try {
      const res = await fetch(`/api/dev-admin/schools?id=${deleteModalSchool.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast("Établissement supprimé définitivement de la base.", "success");
        setDeleteModalSchool(null);
        setConfirmNameInput("");
        loadSchools();
      } else {
        toast("Échec de la suppression de l'établissement.", "error");
      }
    } catch {
      toast("Erreur de connexion.", "error");
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  // Action Faire un abonnement
  const handleGrantSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subModalSchool) return;

    setIsSubmittingSub(true);

    try {
      const res = await fetch("/api/dev-admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "SCHOOL",
          targetId: subModalSchool.id,
          targetName: subModalSchool.name,
          planCode: subPlanCode,
          durationMonths: subDuration,
          notes: "Abonnement validé directement par le Développeur Technique",
        }),
      });

      if (res.ok) {
        toast(`Abonnement validé avec succès pour ${subModalSchool.name}.`, "success");
        setSubModalSchool(null);
        loadSchools();
      } else {
        toast("Échec de l'attribution de l'abonnement.", "error");
      }
    } catch {
      toast("Erreur de connexion.", "error");
    } finally {
      setIsSubmittingSub(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="Gestion des Établissements Scolaires"
        subtitle="Supervision, consultation des fiches techniques, blocage et gestion des abonnements des écoles"
        breadcrumbs={[{ label: "Développeur", href: "/dev-admin" }, { label: "Établissements" }]}
        actions={
          <button
            onClick={loadSchools}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs touch-target"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>
        }
      />

      {/* Barre de Filtres & Recherche (conforme aux filtres de l'espace Administrateur) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, ville, code, directeur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-school-primary focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-school-primary cursor-pointer w-full md:w-auto"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIF">Actifs uniquement</option>
            <option value="BLOQUE">Bloqués / Suspendus</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-school-primary cursor-pointer w-full md:w-auto"
          >
            <option value="ALL">Toutes les formules</option>
            <option value="starter">Starter</option>
            <option value="basic">Basic</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>

      {/* Tableau des Établissements */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-school-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Chargement des établissements depuis la base...</p>
          </div>
        ) : filteredSchools.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <Building2 className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">Aucun établissement ne correspond aux filtres.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Établissement</th>
                  <th className="py-3.5 px-3">Localisation</th>
                  <th className="py-3.5 px-3">Directeur / Admin</th>
                  <th className="py-3.5 px-3 text-center">Utilisateurs</th>
                  <th className="py-3.5 px-3 text-center">Élèves</th>
                  <th className="py-3.5 px-3">Formule &amp; Abonnement</th>
                  <th className="py-3.5 px-3">Dates</th>
                  <th className="py-3.5 px-3 text-center">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchools.map((sch) => (
                  <tr key={sch.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Établissement */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{sch.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Code: {sch.code}</div>
                    </td>

                    {/* Localisation */}
                    <td className="py-3.5 px-3 text-slate-600">
                      <div>{sch.city}</div>
                      <div className="text-[10px] text-slate-400">{sch.region}, {sch.country}</div>
                    </td>

                    {/* Directeur */}
                    <td className="py-3.5 px-3 text-slate-700">
                      <div className="font-semibold">{sch.directorName}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">{sch.directorEmail}</div>
                    </td>

                    {/* Nb Utilisateurs */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                        <Users className="w-3 h-3 text-slate-500" />
                        {sch.usersCount}
                      </span>
                    </td>

                    {/* Nb Élèves */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                        <GraduationCap className="w-3 h-3 text-slate-500" />
                        {sch.studentsCount}
                      </span>
                    </td>

                    {/* Formule & Statut Abonnement */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{sch.planName}</div>
                      <div className="mt-0.5">
                        {sch.subscriptionStatus === "ACTIVE" ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Actif
                          </span>
                        ) : sch.subscriptionStatus === "TRIAL" ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Essai 1 mois
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Expiré
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="py-3.5 px-3 text-[11px] text-slate-500 space-y-0.5">
                      <div>Inscrit : {new Date(sch.createdAt).toLocaleDateString("fr-FR")}</div>
                      <div className="text-slate-700 font-medium">Expire : {sch.subscriptionExpiresAt}</div>
                    </td>

                    {/* Statut Établissement */}
                    <td className="py-3.5 px-3 text-center">
                      {sch.status === "ACTIF" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Actif
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1">
                          <Ban className="w-3 h-3 text-rose-600" />
                          Bloqué
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Fiche détaillée */}
                        <button
                          type="button"
                          onClick={() => setSelectedSchool(sch)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shadow-2xs"
                          title="Consulter la fiche détaillée"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Faire un abonnement */}
                        <button
                          type="button"
                          onClick={() => setSubModalSchool(sch)}
                          className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 shadow-2xs"
                          title="Attribuer / renouveler un abonnement"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>

                        {/* Bloquer / Débloquer */}
                        <button
                          type="button"
                          onClick={() => setBlockModalSchool(sch)}
                          className={`p-1.5 rounded-lg border shadow-2xs ${
                            sch.status === "BLOQUE"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                          }`}
                          title={sch.status === "BLOQUE" ? "Débloquer l'établissement" : "Bloquer l'établissement"}
                        >
                          {sch.status === "BLOQUE" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        </button>

                        {/* Supprimer définitivement */}
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteModalSchool(sch);
                            setConfirmNameInput("");
                          }}
                          className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 shadow-2xs"
                          title="Supprimer définitivement l'établissement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL 1 : FICHE DÉTAILLÉE DE L'ÉTABLISSEMENT                        */}
      {/* =================================================================== */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-school-primary text-white flex items-center justify-center font-bold text-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{selectedSchool.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">Code Établissement : {selectedSchool.code}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSchool(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grille informations supervision */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Localisation</span>
                <p className="font-semibold text-slate-900">{selectedSchool.city}, {selectedSchool.region}</p>
                <p className="text-slate-500">{selectedSchool.address || "Adresse non spécifiée"}, {selectedSchool.country}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Direction &amp; Contact</span>
                <p className="font-semibold text-slate-900">{selectedSchool.directorName}</p>
                <p className="text-slate-500">{selectedSchool.directorEmail} &bull; {selectedSchool.phone}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Effectifs Supervisés</span>
                <p className="font-semibold text-slate-900">{selectedSchool.usersCount} utilisateurs enregistrés</p>
                <p className="text-slate-500">{selectedSchool.studentsCount} élèves inscrits &bull; Année {selectedSchool.activeYear}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Abonnement &amp; Validité</span>
                <p className="font-semibold text-slate-900">{selectedSchool.planName}</p>
                <p className="text-slate-500">Statut : <strong>{selectedSchool.subscriptionStatus}</strong> &bull; Échéance : {selectedSchool.subscriptionExpiresAt}</p>
              </div>
            </div>

            {/* Notice de supervision (respect de l'intégrité métier) */}
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Supervision Technique &amp; Traçabilité
              </span>
              <p className="text-[11px] leading-relaxed">
                Le rôle Développeur supervise les accès et paramètres d'infrastructure de cet établissement. Conformément à la politique de sécurité ECOGEST, les notes et données pédagogiques privées restent étanches et sous l'autorité du Directeur.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedSchool(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2 : BLOQUER / DÉBLOQUER ÉTABLISSEMENT                         */}
      {/* =================================================================== */}
      {blockModalSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                  blockModalSchool.status === "BLOQUE"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {blockModalSchool.status === "BLOQUE" ? <CheckCircle2 className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  {blockModalSchool.status === "BLOQUE" ? "Débloquer l'établissement" : "Bloquer l'établissement"}
                </h3>
                <p className="text-xs text-slate-500">{blockModalSchool.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {blockModalSchool.status === "BLOQUE"
                ? "La réactivation permettra aux utilisateurs et au directeur de cet établissement d'accéder à nouveau à leur espace ECOGEST."
                : "Le blocage suspendra immédiatement l'accès de tous les utilisateurs et directeurs rattachés à cet établissement."}
            </p>

            <form onSubmit={handleToggleBlock} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Motif technique / administratif (optionnel) :
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Impayé d'abonnement, maintenance exceptionnelle..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-school-primary focus:bg-white transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBlockModalSchool(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBlock}
                  className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition flex items-center gap-1.5 ${
                    blockModalSchool.status === "BLOQUE"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {isSubmittingBlock ? "Enregistrement..." : blockModalSchool.status === "BLOQUE" ? "Confirmer le déblocage" : "Confirmer le blocage"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3 : SUPPRIMER DÉFINITIVEMENT L'ÉTABLISSEMENT                  */}
      {/* =================================================================== */}
      {deleteModalSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-base text-rose-950">Suppression Définitive</h3>
                <p className="text-xs text-slate-500">Action irréversible</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 leading-relaxed">
              ⚠️ Attention : La suppression supprimera définitivement l'établissement <strong>{deleteModalSchool.name}</strong>, ses comptes utilisateurs et ses données associées.
            </div>

            <form onSubmit={handleDeleteSchool} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Pour confirmer, veuillez saisir le nom exact de l'établissement :
                </label>
                <input
                  type="text"
                  required
                  placeholder={deleteModalSchool.name}
                  value={confirmNameInput}
                  onChange={(e) => setConfirmNameInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteModalSchool(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDelete || confirmNameInput.trim() !== deleteModalSchool.name.trim()}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm"
                >
                  {isSubmittingDelete ? "Suppression en cours..." : "Supprimer définitivement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4 : FAIRE UN ABONNEMENT À CET ÉTABLISSEMENT                   */}
      {/* =================================================================== */}
      {subModalSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">Attribuer / Renouveler Abonnement</h3>
                <p className="text-xs text-slate-500">{subModalSchool.name}</p>
              </div>
            </div>

            <form onSubmit={handleGrantSubscription} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Formule d'abonnement :</label>
                <select
                  value={subPlanCode}
                  onChange={(e) => setSubPlanCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-school-primary cursor-pointer"
                >
                  <option value="STARTER">Starter Gratuit (1 mois offert - 0 FCFA - 20 utilisateurs)</option>
                  <option value="BASIC">Formule Starter (6 000 FCFA/mois - 40 utilisateurs)</option>
                  <option value="STANDARD">Formule Pro (10 000 FCFA/mois - 70 utilisateurs)</option>
                  <option value="PREMIUM">Formule Premium (25 000 FCFA/mois - Illimité &amp; 2 écoles)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Durée de validité (mois) :</label>
                <select
                  value={subDuration}
                  onChange={(e) => setSubDuration(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-school-primary cursor-pointer"
                >
                  <option value={1}>1 Mois</option>
                  <option value={3}>3 Mois (Trimestre)</option>
                  <option value={6}>6 Mois (Semestre)</option>
                  <option value={12}>12 Mois (Année complète)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubModalSchool(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSub}
                  className="px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white text-xs font-bold transition shadow-sm"
                >
                  {isSubmittingSub ? "Enregistrement..." : "Activer l'abonnement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
