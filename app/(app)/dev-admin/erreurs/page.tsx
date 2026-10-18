"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  AlertOctagon,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  X,
  Terminal,
  ShieldCheck,
  Building2,
  User,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useToast } from "@/components/ui/Toast";

interface TechnicalErrorItem {
  id: string;
  eventType: string;
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  actionTitle: string;
  errorMessage: string;
  page: string;
  module: string;
  frequency: number;
  status: "NOUVELLE" | "EN_COURS" | "RESOLUE";
  userEmail: string;
  userRole: string;
  schoolName: string;
  schoolId?: string;
  ipAddress: string;
  stackTrace?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

export default function DevErreursPage() {
  const { toast } = useToast();

  const [errors, setErrors] = useState<TechnicalErrorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, nouvelles: 0, enCours: 0, resolues: 0 });

  // Filtres
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  // Fiche d'analyse détaillée
  const [selectedError, setSelectedError] = useState<TechnicalErrorItem | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<"NOUVELLE" | "EN_COURS" | "RESOLUE">("EN_COURS");
  const [resolutionNote, setResolutionNote] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadErrors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (severityFilter !== "ALL") params.append("severity", severityFilter);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/dev-admin/errors?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setErrors(data.errors || []);
        if (data.stats) setStats(data.stats);
      } else {
        toast("Impossible de charger la liste des erreurs.", "error");
      }
    } catch {
      toast("Erreur réseau.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadErrors();
  }, [statusFilter, severityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadErrors();
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedError) return;

    setIsUpdatingStatus(true);
    try {
      const res = await fetch("/api/dev-admin/errors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          errorId: selectedError.id,
          status: resolutionStatus,
          resolutionNotes: resolutionNote.trim(),
        }),
      });

      if (res.ok) {
        toast(`Statut de l'erreur mis à jour : ${resolutionStatus}`, "success");
        setSelectedError(null);
        setResolutionNote("");
        loadErrors();
      } else {
        toast("Erreur lors de la mise à jour.", "error");
      }
    } catch {
      toast("Erreur de connexion.", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLUE":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Résolue
          </span>
        );
      case "EN_COURS":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            En cours
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-rose-600" />
            Nouvelle
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="Erreurs &amp; Incidents Techniques"
        subtitle="Surveillance des exceptions client (ex: Application error), erreurs API et suivi des résolutions techniques"
        breadcrumbs={[{ label: "Développeur", href: "/dev-admin" }, { label: "Erreurs & incidents" }]}
        actions={
          <button
            onClick={loadErrors}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs touch-target"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>
        }
      />

      {/* Cartes Statistiques Erreurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Signalements"
          value={loading ? "..." : String(stats.total)}
          subtitle="Toutes sévérités confondues"
          icon={<AlertTriangle className="w-6 h-6" />}
          variant="default"
        />
        <StatCard
          title="Nouvelles Erreurs"
          value={loading ? "..." : String(stats.nouvelles)}
          subtitle="Nécessitent une intervention"
          icon={<AlertOctagon className="w-6 h-6" />}
          variant={stats.nouvelles > 0 ? "danger" : "success"}
        />
        <StatCard
          title="En cours de traitement"
          value={loading ? "..." : String(stats.enCours)}
          subtitle="Diagnostics ou correctifs actifs"
          icon={<Clock className="w-6 h-6" />}
          variant={stats.enCours > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Erreurs Résolues"
          value={loading ? "..." : String(stats.resolues)}
          subtitle="Incidents clôturés"
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="success"
        />
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par message, page, module, établissement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-school-primary focus:bg-white transition"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-school-primary cursor-pointer w-full md:w-auto"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="NOUVELLE">Nouvelle</option>
            <option value="EN_COURS">En cours</option>
            <option value="RESOLUE">Résolue</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-school-primary cursor-pointer w-full md:w-auto"
          >
            <option value="ALL">Toutes les sévérités</option>
            <option value="CRITICAL">Critique</option>
            <option value="ERROR">Erreur</option>
            <option value="WARNING">Attention</option>
          </select>
        </div>
      </div>

      {/* Tableau des Erreurs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-school-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Chargement des incidents réels...</p>
          </div>
        ) : errors.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
            <p className="font-semibold text-slate-700">Aucune erreur technique répertoriée avec ces filtres.</p>
            <p className="text-slate-500 text-[11px]">L'application fonctionne normalement sans exceptions critiques.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Date &amp; Heure</th>
                  <th className="py-3.5 px-3">Page / Module</th>
                  <th className="py-3.5 px-3">Type &amp; Sévérité</th>
                  <th className="py-3.5 px-3">Message d'Erreur</th>
                  <th className="py-3.5 px-3 text-center">Fréquence</th>
                  <th className="py-3.5 px-3">Établissement / Utilisateur</th>
                  <th className="py-3.5 px-3 text-center">Statut</th>
                  <th className="py-3.5 px-4 text-right">Analyse</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {errors.map((err) => {
                  const d = new Date(err.createdAt);
                  const dateStr = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
                  const timeStr = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

                  return (
                    <tr key={err.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Date & Heure */}
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        <div className="font-semibold">{dateStr}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{timeStr}</div>
                      </td>

                      {/* Page / Module */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 truncate max-w-[140px]">{err.page}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{err.module}</div>
                      </td>

                      {/* Type & Sévérité */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          err.severity === "CRITICAL"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : err.severity === "ERROR"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}>
                          {err.severity}
                        </span>
                      </td>

                      {/* Message d'Erreur */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-900 max-w-[280px] truncate" title={err.errorMessage}>
                          {err.errorMessage}
                        </div>
                      </td>

                      {/* Fréquence */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {err.frequency}x
                        </span>
                      </td>

                      {/* Établissement / Utilisateur */}
                      <td className="py-3.5 px-3 text-slate-700">
                        <div className="font-semibold truncate max-w-[160px]">{err.schoolName}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                          {err.userEmail !== "Non renseigné" ? err.userEmail : "Non spécifié"}
                        </div>
                      </td>

                      {/* Statut */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {renderStatusBadge(err.status)}
                      </td>

                      {/* Action Analyse */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedError(err);
                            setResolutionStatus(err.status);
                            setResolutionNote(err.resolutionNotes || "");
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shadow-2xs"
                          title="Fiche d'analyse détaillée"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL FICHE DÉTAILLÉE D'ANALYSE D'ERREUR                             */}
      {/* =================================================================== */}
      {selectedError && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <AlertOctagon className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Fiche d'Analyse Technique</h3>
                  <p className="text-xs text-slate-500 font-mono">ID Incident : {selectedError.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedError(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grille informations d'incident */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Page / Module</span>
                <span className="font-semibold text-slate-900">{selectedError.page} &bull; {selectedError.module}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Sévérité / Type</span>
                <span className="font-bold text-rose-600 uppercase">{selectedError.severity} ({selectedError.eventType})</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Établissement</span>
                <span className="font-semibold text-slate-800">{selectedError.schoolName}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Utilisateur concerné</span>
                <span className="font-semibold text-slate-800">{selectedError.userEmail} ({selectedError.userRole})</span>
              </div>
            </div>

            {/* Message d'erreur complet */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Message d'Erreur Capturé :
              </span>
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-mono text-rose-950 font-semibold leading-relaxed">
                {selectedError.errorMessage}
              </div>
            </div>

            {/* Stack trace éventuelle */}
            {selectedError.stackTrace && (
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Trace Technique (Stack Trace) :
                </span>
                <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-48 leading-relaxed">
                  {selectedError.stackTrace}
                </pre>
              </div>
            )}

            {/* Formulaire de changement de statut */}
            <form onSubmit={handleUpdateStatus} className="space-y-3 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Mettre à jour le statut :</label>
                  <select
                    value={resolutionStatus}
                    onChange={(e) => setResolutionStatus(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-school-primary cursor-pointer"
                  >
                    <option value="NOUVELLE">Nouvelle (Non traitée)</option>
                    <option value="EN_COURS">En cours de diagnostic</option>
                    <option value="RESOLUE">Résolue</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Note de résolution technique :</label>
                  <input
                    type="text"
                    placeholder="Ex: Correction bug hydratation ou validation..."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-school-primary focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedError(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white text-xs font-bold transition shadow-sm"
                >
                  {isUpdatingStatus ? "Enregistrement..." : "Enregistrer la modification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
