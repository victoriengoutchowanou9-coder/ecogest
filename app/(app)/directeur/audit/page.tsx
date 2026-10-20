"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
  User,
  Clock,
  Terminal,
  ShieldCheck,
  Lock,
  KeyRound,
  FileCheck2,
  Database,
  HeartPulse,
  Eye,
  Edit3,
  UserCheck,
  Smartphone,
  Laptop,
  PowerOff,
  UserX,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordCard } from "@/components/ui/RecordCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { useToast } from "@/components/ui/Toast";
import {
  getSensitiveAccessLogs,
  SensitiveAccessAuditLog,
  SensitiveDataType,
} from "@/lib/security/encryption";

interface RealAuditLog {
  id: string;
  school_id: string;
  user_id: string | null;
  role: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_data: any;
  new_data: any;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
  school_users?: { full_name: string; email: string } | null;
}

interface UserSessionItem {
  id: string;
  user_id: string;
  device_name: string;
  device_type: "DESKTOP" | "MOBILE" | "TABLET" | "UNKNOWN";
  ip_address: string;
  last_active_at: string;
  created_at: string;
  school_users?: { full_name: string; email: string; role: string } | null;
}

interface SchoolUserItem {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: "active" | "suspended" | "banned" | "ACTIF" | "SUSPENDU";
  created_at: string;
}

interface SecurityAlertItem {
  id: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  alert_type: string;
  title: string;
  description: string;
  user_email?: string;
  ip_address?: string;
  is_resolved: boolean;
  created_at: string;
}

export default function AuditJournalPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"AUDIT" | "SESSIONS" | "USERS" | "ALERTS" | "SENSITIVE">("AUDIT");

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<RealAuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditSearch, setAuditSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  // Sessions State
  const [sessions, setSessions] = useState<UserSessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Users State
  const [users, setUsers] = useState<SchoolUserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Alerts State
  const [alerts, setAlerts] = useState<SecurityAlertItem[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  // Sensitive Logs State
  const [sensitiveLogs, setSensitiveLogs] = useState<SensitiveAccessAuditLog[]>([]);

  // 1. Fetch Audit Logs
  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const res = await fetch("/api/audit/logs?limit=200");
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch {
      toast("Erreur de chargement du journal d'audit.", "error");
    } finally {
      setLoadingAudit(false);
    }
  };

  // 2. Fetch Active Sessions
  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch {
      toast("Erreur de chargement des sessions.", "error");
    } finally {
      setLoadingSessions(false);
    }
  };

  // 3. Fetch Users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/auth/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      toast("Erreur de chargement des utilisateurs.", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  // 4. Fetch Security Alerts
  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const res = await fetch("/api/security/alerts");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch {
      toast("Erreur de chargement des alertes de sécurité.", "error");
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    fetchSessions();
    fetchUsers();
    fetchAlerts();
    setSensitiveLogs(getSensitiveAccessLogs());
  }, []);

  // Déconnexion distante
  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/sessions?sessionId=${sessionId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Appareil déconnecté à distance avec succès.", "success");
        fetchSessions();
      } else {
        toast(data.error || "Impossible de déconnecter l'appareil.", "error");
      }
    } catch {
      toast("Erreur réseau.", "error");
    }
  };

  // Modification du statut utilisateur (effet immédiat)
  const handleToggleUserStatus = async (user: SchoolUserItem) => {
    const isCurrentlyActive = user.status === "active" || user.status === "ACTIF";
    const nextStatus = isCurrentlyActive ? "suspended" : "active";
    const actionLabel = isCurrentlyActive ? "suspendre" : "réactiver";

    if (!confirm(`Confirmez-vous vouloir ${actionLabel} le compte de ${user.full_name} ? L'effet est immédiat.`)) {
      return;
    }

    try {
      const res = await fetch("/api/auth/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Compte ${nextStatus === "active" ? "activé" : "suspendu"} avec succès.`, "success");
        fetchUsers();
      } else {
        toast(data.error || "Erreur de mise à jour.", "error");
      }
    } catch {
      toast("Erreur serveur.", "error");
    }
  };

  // Résolution d'une alerte
  const handleResolveAlert = async (alertId: string) => {
    try {
      const res = await fetch("/api/security/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, resolutionNotes: "Alerte acquittée par la Direction." }),
      });
      if (res.ok) {
        toast("Alerte résolue.", "success");
        fetchAlerts();
      }
    } catch {
      toast("Erreur lors de la résolution.", "error");
    }
  };

  // Filtrage des logs d'audit
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchAction = actionFilter === "ALL" || log.action === actionFilter;
      const q = auditSearch.toLowerCase();
      const matchSearch =
        q === "" ||
        log.action.toLowerCase().includes(q) ||
        (log.school_users?.full_name || "").toLowerCase().includes(q) ||
        (log.school_users?.email || "").toLowerCase().includes(q) ||
        (log.ip || "").includes(q) ||
        log.resource_type.toLowerCase().includes(q);
      return matchAction && matchSearch;
    });
  }, [auditLogs, actionFilter, auditSearch]);

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(auditLogs.map((l) => l.action))).sort();
  }, [auditLogs]);

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <PageHeader
        title="Journal d'Audit & Sécurité de l'Établissement"
        subtitle="Traçabilité certifiée et immuable des actions, gestion des sessions actives et contrôle des statuts de compte."
        breadcrumbs={[{ label: "Directeur" }, { label: "Sécurité & Audit" }]}
        actions={
          <button
            onClick={() => {
              fetchAuditLogs();
              fetchSessions();
              fetchUsers();
              fetchAlerts();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("AUDIT")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "AUDIT"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Journal d'Audit Immuable ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("SESSIONS")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "SESSIONS"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Sessions & Appareils Actifs ({sessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("USERS")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "USERS"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Statuts des Comptes ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ALERTS")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "ALERTS"
              ? "border-rose-600 text-rose-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Alertes de Sécurité ({alerts.filter((a) => !a.is_resolved).length})</span>
        </button>

        <button
          onClick={() => setActiveTab("SENSITIVE")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "SENSITIVE"
              ? "border-amber-600 text-amber-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Accès Chiffrés ({sensitiveLogs.length})</span>
        </button>
      </div>

      {/* 1. ONGLET AUDIT */}
      {activeTab === "AUDIT" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex-1">
              <FilterBar
                searchQuery={auditSearch}
                onSearchChange={setAuditSearch}
                searchPlaceholder="Rechercher action, utilisateur, IP, ressource..."
                onReset={() => setAuditSearch("")}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">Toutes les actions ({auditLogs.length})</option>
                {uniqueActions.map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Date / Heure</th>
                    <th className="px-4 py-3">Auteur</th>
                    <th className="px-4 py-3">Rôle</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Ressource</th>
                    <th className="px-4 py-3">Détails / Diff</th>
                    <th className="px-4 py-3">Adresse IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingAudit ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        Chargement des journaux certifiés...
                      </td>
                    </tr>
                  ) : filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        Aucun journal correspondant aux critères.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                          {new Date(log.created_at).toLocaleString("fr-FR")}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {log.school_users?.full_name || log.user_id || "Système"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {log.role || "service"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-800 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {log.resource_type} {log.resource_id ? `(#${log.resource_id.slice(0, 8)})` : ""}
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate text-slate-500 font-mono text-[10px]">
                          {log.new_data ? JSON.stringify(log.new_data) : "-"}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                          {log.ip || "127.0.0.1"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. ONGLET SESSIONS */}
      {activeTab === "SESSIONS" && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-3">
            <Laptop className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Contrôle des Appareils Connectés</p>
              <p className="text-blue-700 mt-0.5">
                Chaque rôle est limité en nombre d'appareils actifs simultanés. En tant qu'administrateur, vous pouvez déconnecter immédiatement n'importe quel appareil suspect.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingSessions ? (
              <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                Chargement des sessions actives...
              </div>
            ) : sessions.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                Aucune session active enregistrée.
              </div>
            ) : (
              sessions.map((sess) => (
                <div key={sess.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                        {sess.device_type === "MOBILE" ? (
                          <Smartphone className="w-5 h-5" />
                        ) : (
                          <Laptop className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{sess.device_name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{sess.ip_address || "IP non renseignée"}</p>
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Session active" />
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1 text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-800">Utilisateur :</span>{" "}
                      {sess.school_users?.full_name || sess.user_id}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">Dernière activité :</span>{" "}
                      {new Date(sess.last_active_at).toLocaleString("fr-FR")}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRevokeSession(sess.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-rose-300 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition"
                  >
                    <PowerOff className="w-3.5 h-3.5" />
                    <span>Déconnecter à distance</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. ONGLET COMPTES & STATUTS */}
      {activeTab === "USERS" && (
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs flex items-start gap-3">
            <UserCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Effet Immédiat sur les Comptes</p>
              <p className="text-indigo-700 mt-0.5">
                La suspension d'un compte prend effet dès la seconde suivante : la session est invalidée dans la base PostgreSQL et tout accès ultérieur est bloqué avec code 403.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3">Utilisateur</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Rôle</th>
                    <th className="px-4 py-3">Statut Actuel</th>
                    <th className="px-4 py-3 text-right">Action Immédiate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        Chargement des utilisateurs...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        Aucun utilisateur trouvé.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const isActive = u.status === "active" || u.status === "ACTIF";
                      return (
                        <tr key={u.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3 font-bold text-slate-900">{u.full_name}</td>
                          <td className="px-4 py-3 text-slate-600">{u.email}</td>
                          <td className="px-4 py-3 capitalize">{u.role}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isActive
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {isActive ? "Actif" : "Suspendu"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                                isActive
                                  ? "border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                                  : "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              }`}
                            >
                              {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              <span>{isActive ? "Suspendre l'accès" : "Réactiver le compte"}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. ONGLET ALERTES DE SÉCURITÉ */}
      {activeTab === "ALERTS" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loadingAlerts ? (
              <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                Chargement des alertes de sécurité...
              </div>
            ) : alerts.length === 0 ? (
              <div className="col-span-full py-8 text-center text-emerald-600 font-bold text-xs flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8" />
                <span>Aucune alerte de sécurité active. Tous les systèmes sont conformes.</span>
              </div>
            ) : (
              alerts.map((al) => (
                <div
                  key={al.id}
                  className={`p-4 rounded-xl border space-y-2.5 transition ${
                    al.is_resolved
                      ? "border-slate-200 bg-slate-50 opacity-70"
                      : al.severity === "CRITICAL" || al.severity === "HIGH"
                      ? "border-rose-300 bg-rose-50/50"
                      : "border-amber-300 bg-amber-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          al.severity === "CRITICAL" || al.severity === "HIGH"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {al.severity} — {al.alert_type}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs mt-1.5">{al.title}</h4>
                    </div>
                    {al.is_resolved && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Résolu
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600">{al.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                    <span>{new Date(al.created_at).toLocaleString("fr-FR")}</span>
                    {!al.is_resolved && (
                      <button
                        onClick={() => handleResolveAlert(al.id)}
                        className="font-bold text-emerald-700 hover:underline"
                      >
                        Acquitter / Résoudre
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. ONGLET DONNÉES CHIFFRÉES */}
      {activeTab === "SENSITIVE" && (
        <div className="space-y-4">
          <DataTable
            data={sensitiveLogs}
            columns={[
              {
                key: "studentName",
                header: "Élève concerné",
                render: (item: SensitiveAccessAuditLog) => (
                  <div>
                    <span className="font-bold text-slate-900">{item.studentName}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">{item.studentId}</span>
                  </div>
                ),
              },
              {
                key: "dataType",
                header: "Donnée Sensible",
                render: (item: SensitiveAccessAuditLog) => (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {item.dataType}
                  </span>
                ),
              },
              {
                key: "authorName",
                header: "Opérateur",
                render: (item: SensitiveAccessAuditLog) => (
                  <span className="text-slate-700">
                    {item.authorName} ({item.authorRole})
                  </span>
                ),
              },
              {
                key: "timestamp",
                header: "Date / Heure",
                render: (item: SensitiveAccessAuditLog) => (
                  <span className="font-mono text-slate-500 text-[11px]">
                    {new Date(item.timestamp).toLocaleString("fr-FR")}
                  </span>
                ),
              },
              {
                key: "details",
                header: "Détails de l'accès",
                render: (item: SensitiveAccessAuditLog) => (
                  <span className="text-slate-600">{item.details || item.action}</span>
                ),
              },
            ]}
            keyExtractor={(item) => item.id}
          />
        </div>
      )}
    </div>
  );
}
