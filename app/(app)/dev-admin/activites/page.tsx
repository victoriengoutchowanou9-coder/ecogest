"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Building2,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  X,
  Terminal,
  Layers,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/Toast";

interface AuditLog {
  id: string;
  event_type: string;
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  action_title: string;
  details?: any;
  user_email?: string;
  user_role?: string;
  school_id?: string;
  school_name?: string;
  ip_address?: string;
  created_at: string;
}

export default function DevActivitesPage() {
  const { toast } = useToast();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);

  // Filtres
  const [search, setSearch] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [schoolFilter, setSchoolFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modal inspection détaillée
  const [inspectedLog, setInspectedLog] = useState<AuditLog | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (eventTypeFilter !== "ALL") params.append("eventType", eventTypeFilter);
      if (severityFilter !== "ALL") params.append("severity", severityFilter);
      if (schoolFilter !== "ALL") params.append("school", schoolFilter);
      if (roleFilter !== "ALL") params.append("role", roleFilter);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      if (search.trim()) params.append("search", search.trim());
      params.append("limit", "200");

      const res = await fetch(`/api/dev-admin/logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      } else {
        toast("Impossible de charger le journal d'activités.", "error");
      }

      // Charger liste des écoles pour le menu déroulant
      const schoolsRes = await fetch("/api/schools");
      if (schoolsRes.ok) {
        const sData = await schoolsRes.json();
        setSchools(sData.schools || []);
      }
    } catch {
      toast("Erreur réseau.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [eventTypeFilter, severityFilter, schoolFilter, roleFilter, dateFrom, dateTo]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs();
  };

  const renderSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-rose-600" /> Critique
          </span>
        );
      case "ERROR":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> Erreur
          </span>
        );
      case "WARNING":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Alerte
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Succès
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="Journal des Activités"
        subtitle="Traçabilité complète des actions, connexions, modifications et interventions sur l'application"
        breadcrumbs={[{ label: "Développeur", href: "/dev-admin" }, { label: "Journal des activités" }]}
        actions={
          <button
            onClick={loadLogs}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs touch-target"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>
        }
      />

      {/* Barre de Recherche et Filtres Multi-Critères */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par action, utilisateur, rôle, IP, établissement..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-school-primary focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white text-xs font-bold transition shadow-xs w-full md:w-auto"
          >
            Filtrer
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Type d'événement / Action */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Module / Action
            </label>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 outline-none focus:border-school-primary cursor-pointer text-xs"
            >
              <option value="ALL">Toutes les actions</option>
              <option value="CONNEXION">Connexions</option>
              <option value="DECONNEXION">Déconnexions</option>
              <option value="CREATION_COMPTE">Création d'utilisateur</option>
              <option value="MODIF_PROFIL">Modification d'utilisateur</option>
              <option value="CREATION_ETABLISSEMENT">Création d'établissement</option>
              <option value="SOUSCRIPTION_ABONNEMENT">Abonnements</option>
              <option value="ATTRIBUTION_PERMISSION">Permissions</option>
              <option value="INTERVENTION_TECHNIQUE">Interventions Développeur</option>
              <option value="ERREUR_AUTH">Tentatives échouées</option>
              <option value="APPLICATION_ERROR">Erreurs applicatives</option>
            </select>
          </div>

          {/* Sévérité / Résultat */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Résultat
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 outline-none focus:border-school-primary cursor-pointer text-xs"
            >
              <option value="ALL">Tous les résultats</option>
              <option value="INFO">Succès (Info)</option>
              <option value="WARNING">Avertissements (Warning)</option>
              <option value="ERROR">Erreurs</option>
              <option value="CRITICAL">Critiques</option>
            </select>
          </div>

          {/* Établissement */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Établissement
            </label>
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 outline-none focus:border-school-primary cursor-pointer text-xs"
            >
              <option value="ALL">Tous les établissements</option>
              {schools.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rôle */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Rôle
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 outline-none focus:border-school-primary cursor-pointer text-xs"
            >
              <option value="ALL">Tous les rôles</option>
              <option value="directeur">Directeur</option>
              <option value="censeur">Censeur</option>
              <option value="comptabilite">Comptable</option>
              <option value="enseignant">Enseignant</option>
              <option value="parent">Parent</option>
              <option value="developpeur">Développeur</option>
              <option value="system">Système</option>
            </select>
          </div>

          {/* Période */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Période
            </label>
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-1/2 px-1.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-700"
                title="Date de début"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-1/2 px-1.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-700"
                title="Date de fin"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tableau du Journal d'Audit */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-school-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Chargement du journal d'activités réel...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <ShieldAlert className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">Aucune activité enregistrée pour ces filtres.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Date &amp; Heure</th>
                  <th className="py-3.5 px-3">Utilisateur &amp; Rôle</th>
                  <th className="py-3.5 px-3">Établissement</th>
                  <th className="py-3.5 px-3">Action Effectuée</th>
                  <th className="py-3.5 px-3">Module</th>
                  <th className="py-3.5 px-3 text-center">Résultat</th>
                  <th className="py-3.5 px-3 font-mono">Adresse IP</th>
                  <th className="py-3.5 px-4 text-right">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const d = new Date(log.created_at);
                  const dateStr = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
                  const timeStr = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Date & Heure */}
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        <div className="font-semibold">{dateStr}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{timeStr}</div>
                      </td>

                      {/* Utilisateur & Rôle */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 truncate max-w-[170px]">{log.user_email || "Système Interne"}</div>
                        <div className="text-[10px] font-semibold text-school-primary uppercase">
                          {log.user_role || "Système"}
                        </div>
                      </td>

                      {/* Établissement */}
                      <td className="py-3.5 px-3 text-slate-700 truncate max-w-[180px]">
                        {log.school_name || "Administration Centrale ECOGEST"}
                      </td>

                      {/* Action effectuée */}
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-900 max-w-[240px] truncate" title={log.action_title}>
                          {log.action_title}
                        </div>
                      </td>

                      {/* Module concerné */}
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {log.event_type}
                        </span>
                      </td>

                      {/* Résultat */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {renderSeverityBadge(log.severity)}
                      </td>

                      {/* Adresse IP / Identifiant */}
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.ip_address || log.details?.ip || "—"}
                      </td>

                      {/* Bouton Voir Détails */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setInspectedLog(log)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shadow-2xs"
                          title="Inspecter le payload de l'événement"
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

      {/* Modal Fiche Détail de l'Action / Log */}
      {inspectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-school-primary text-white flex items-center justify-center font-bold text-sm">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Détails de l'Action</h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {inspectedLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectedLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Action</span>
                <span className="font-semibold text-slate-900">{inspectedLog.action_title}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Module</span>
                <span className="font-mono font-bold text-school-primary">{inspectedLog.event_type}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Auteur &amp; Rôle</span>
                <span className="font-semibold text-slate-800">{inspectedLog.user_email || "Système"} ({inspectedLog.user_role || "Système"})</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Établissement</span>
                <span className="font-semibold text-slate-800">{inspectedLog.school_name || "Général"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Horodatage précis</span>
                <span className="font-mono text-slate-800">{new Date(inspectedLog.created_at).toLocaleString("fr-FR")}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Adresse IP</span>
                <span className="font-mono text-slate-800">{inspectedLog.ip_address || "Non collectée"}</span>
              </div>
            </div>

            {/* Données techniques JSON */}
            {inspectedLog.details && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Données Techniques &amp; Payload (JSON) :
                </span>
                <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 text-[11px] font-mono overflow-x-auto max-h-60 leading-relaxed">
                  {JSON.stringify(inspectedLog.details, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInspectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
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
