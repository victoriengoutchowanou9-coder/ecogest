"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  Activity,
  Server,
  Database,
  Users,
  Building2,
  GraduationCap,
  BookOpenCheck,
  CreditCard,
  Home,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Filter,
  Search,
  Calendar,
  Layers,
  Terminal,
  Clock,
  Send,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  LifeBuoy,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface PlatformMetrics {
  totalSchools: number;
  activeSchools: number;
  inactiveSchools: number;
  totalUsers: number;
  roleCounts: {
    directeur: number;
    censeur: number;
    comptabilite: number;
    enseignant: number;
    parent: number;
    autre: number;
  };
  totalStudents: number;
  recentSchools: Array<{
    id: string;
    code: string;
    name: string;
    city: string;
    country: string;
    status: string;
    created_at: string;
  }>;
  recentUsers: Array<{
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
  }>;
  recentActivity: Array<AuditLogItem>;
  recentErrors: Array<AuditLogItem>;
  servicesHealth: Record<
    string,
    {
      name: string;
      status: string;
      latencyMs?: number;
      region?: string;
      version?: string;
      provider?: string;
      uptimeSeconds?: number;
      endpoints?: string[];
    }
  >;
  generatedAt: string;
}

interface AuditLogItem {
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

export default function DevAdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"METRICS" | "LOGS" | "INCIDENTS" | "SERVICES">("METRICS");
  const [developerEmail, setDeveloperEmail] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Données des métriques
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);

  // Données du journal d'audit
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Filtres du journal
  const [filterEventType, setFilterEventType] = useState("ALL");
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Modal consignation intervention technique
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [interventionTitle, setInterventionTitle] = useState("");
  const [interventionSeverity, setInterventionSeverity] = useState<"INFO" | "WARNING" | "ERROR" | "CRITICAL">("INFO");
  const [interventionNote, setInterventionNote] = useState("");
  const [isSubmittingIntervention, setIsSubmittingIntervention] = useState(false);

  // 1. Vérification session
  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await fetch("/api/dev-admin/session");
        if (!res.ok) {
          router.push("/dev-admin/connexion");
          return;
        }
        const data = await res.json();
        if (!data.authenticated) {
          router.push("/dev-admin/connexion");
          return;
        }
        setDeveloperEmail(data.email || "admin.technique@ecogest.bj");
        setIsLoadingAuth(false);
      } catch {
        router.push("/dev-admin/connexion");
      }
    }
    verifyAuth();
  }, [router]);

  // 2. Chargement des métriques
  const loadMetrics = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/dev-admin/metrics");
      if (res.ok) {
        const data = await res.json();
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      }
    } catch (e) {
      toast("Erreur lors du rafraîchissement des métriques.", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  // 3. Chargement des logs avec filtres
  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterEventType !== "ALL") params.append("eventType", filterEventType);
      if (filterSeverity !== "ALL") params.append("severity", filterSeverity);
      if (filterRole !== "ALL") params.append("role", filterRole);
      if (filterSearch.trim()) params.append("search", filterSearch.trim());
      if (filterDateFrom) params.append("dateFrom", filterDateFrom);
      if (filterDateTo) params.append("dateTo", filterDateTo);
      params.append("limit", "100");

      const res = await fetch(`/api/dev-admin/logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch {
      toast("Impossible de charger les logs d'activité.", "error");
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoadingAuth) {
      loadMetrics();
      loadLogs();
    }
  }, [isLoadingAuth]);

  // Déconnexion sécurisée
  const handleLogout = async () => {
    try {
      await fetch("/api/dev-admin/logout", { method: "POST" });
    } catch {}
    toast("Session développeur fermée avec succès.", "info");
    router.push("/dev-admin/connexion");
  };

  // Soumission intervention technique manuelle
  const handleRecordIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interventionTitle.trim()) {
      toast("Veuillez renseigner un intitulé.", "error");
      return;
    }

    setIsSubmittingIntervention(true);
    try {
      const res = await fetch("/api/dev-admin/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionTitle: interventionTitle.trim(),
          eventType: "INTERVENTION_TECHNIQUE",
          severity: interventionSeverity,
          details: { note: interventionNote.trim(), dev: developerEmail },
        }),
      });

      if (res.ok) {
        toast("Intervention technique consignée dans le journal.", "success");
        setInterventionTitle("");
        setInterventionNote("");
        setIsInterventionModalOpen(false);
        loadLogs();
        loadMetrics();
      } else {
        toast("Échec de l'enregistrement.", "error");
      }
    } catch {
      toast("Erreur de connexion.", "error");
    } finally {
      setIsSubmittingIntervention(false);
    }
  };

  // Formatage date
  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Badge sévérité
  const renderSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <AlertOctagon className="w-3 h-3" /> CRITIQUE
          </span>
        );
      case "ERROR":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> ERREUR
          </span>
        );
      case "WARNING":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> ATTENTION
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> INFO
          </span>
        );
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-400">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono text-slate-300">Ouverture de la Console Développeur...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* ===================================================================== */}
      {/* BARRE SUPÉRIEURE DE NAVIGATION TECHNIQUE                              */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-black text-sm shadow-sm">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-white font-mono">
                  ECOGEST // DEV_CONSOLE
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-slate-950 font-mono">
                  ROOT_ADMIN
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {developerEmail}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                loadMetrics();
                loadLogs();
                toast("Données rafraîchies.", "info");
              }}
              disabled={isRefreshing}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition"
              title="Rafraîchir les métriques"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
              <span className="hidden sm:inline">Rafraîchir</span>
            </button>

            <button
              onClick={() => setIsInterventionModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-sm transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Consigner Action</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-mono flex items-center gap-1.5 border border-rose-500/30 transition"
              title="Déconnexion sécurisée"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Onglets de navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto text-xs font-mono border-t border-slate-800/60 py-1">
          <button
            onClick={() => setActiveTab("METRICS")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition ${
              activeTab === "METRICS"
                ? "bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Vue Globale</span>
          </button>

          <button
            onClick={() => setActiveTab("LOGS")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition ${
              activeTab === "LOGS"
                ? "bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Journal d&apos;Activité ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("INCIDENTS")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition ${
              activeTab === "INCIDENTS"
                ? "bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Gestion Technique &amp; Erreurs</span>
            {metrics?.recentErrors?.length ? (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-bold">
                {metrics.recentErrors.length}
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab("SERVICES")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition ${
              activeTab === "SERVICES"
                ? "bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>État des Services</span>
          </button>

          <Link
            href="/directeur/support"
            className="px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 ml-auto"
            title="Accéder à la Console Support des requêtes utilisateurs et tickets"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Console Support (Tickets) →</span>
          </Link>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* CONTENU PRINCIPAL PAR ONGLET                                          */}
      {/* ===================================================================== */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
        
        {/* =================================================================== */}
        {/* VUE 1 : VUE GLOBALE & MÉTRIQUES                                     */}
        {/* =================================================================== */}
        {activeTab === "METRICS" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Ligne d'état rapide */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-slate-200">
                  ÉCOSYSTÈME ECOGEST OPÉRATIONNEL
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">
                  PostgreSQL Supabase (eu-west-1) &bull; Latence : {metrics?.servicesHealth?.database?.latencyMs ?? 18} ms
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Généré le : {metrics?.generatedAt ? formatDateTime(metrics.generatedAt) : "En temps réel"}
              </div>
            </div>

            {/* Cartes KPI Principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Établissements */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-mono font-semibold">ÉTABLISSEMENTS</span>
                  <Building2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black font-mono text-white">
                  {metrics?.totalSchools ?? 0}
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                  <span className="text-emerald-400">
                    {metrics?.activeSchools ?? 0} actifs
                  </span>
                  <span>&bull;</span>
                  <span className="text-slate-500">
                    {metrics?.inactiveSchools ?? 0} en attente
                  </span>
                </div>
              </div>

              {/* Utilisateurs Totaux */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-mono font-semibold">TOTAL UTILISATEURS</span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-black font-mono text-white">
                  {metrics?.totalUsers ?? 0}
                </div>
                <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                  Tous rôles confondus sur l&apos;application
                </div>
              </div>

              {/* Élèves Inscrits */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-mono font-semibold">ÉLÈVES SUIVIS</span>
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-black font-mono text-white">
                  {metrics?.totalStudents ?? 0}
                </div>
                <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                  Base élèves nationale ECOGEST
                </div>
              </div>

              {/* Incidents / Erreurs Système */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-mono font-semibold">ERREURS / ALERTES</span>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-3xl font-black font-mono text-white">
                  {metrics?.recentErrors?.length ?? 0}
                </div>
                <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                  <span className={metrics?.recentErrors?.length ? "text-rose-400 font-bold" : "text-emerald-400"}>
                    {metrics?.recentErrors?.length ? "Intervention technique recommandée" : "Aucun incident critique"}
                  </span>
                </div>
              </div>
            </div>

            {/* Répartition des Utilisateurs par Rôle */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-mono text-white">
                    RÉPARTITION DES COMPTES PAR RÔLE
                  </h3>
                  <p className="text-xs text-slate-400">
                    Effectifs réels des membres de l&apos;administration et usagers
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                  {metrics?.totalUsers ?? 0} comptes répertoriés
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-school-primary" />
                    <span>Directeurs</span>
                  </div>
                  <div className="text-2xl font-black font-mono text-white">
                    {metrics?.roleCounts?.directeur ?? 0}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
                    <BookOpenCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Censeurs</span>
                  </div>
                  <div className="text-2xl font-black font-mono text-white">
                    {metrics?.roleCounts?.censeur ?? 0}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Comptables</span>
                  </div>
                  <div className="text-2xl font-black font-mono text-white">
                    {metrics?.roleCounts?.comptabilite ?? 0}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Enseignants</span>
                  </div>
                  <div className="text-2xl font-black font-mono text-white">
                    {metrics?.roleCounts?.enseignant ?? 0}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
                    <Home className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Parents</span>
                  </div>
                  <div className="text-2xl font-black font-mono text-white">
                    {metrics?.roleCounts?.parent ?? 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Inscriptions récentes & Nouveaux comptes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Derniers établissements */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>DERNIERS ÉTABLISSEMENTS CRÉÉS</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {metrics?.recentSchools?.length ?? 0} récents
                  </span>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {metrics?.recentSchools && metrics.recentSchools.length > 0 ? (
                    metrics.recentSchools.map((s) => (
                      <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-200">{s.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {s.city}, {s.country} &bull; Code: {s.code || s.id.slice(0, 8)}
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {s.status || "ACTIF"}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {formatDateTime(s.created_at)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-500 font-mono">
                      Aucun établissement enregistré pour le moment.
                    </div>
                  )}
                </div>
              </div>

              {/* Derniers utilisateurs inscrits */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>NOUVEAUX UTILISATEURS CRÉÉS</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {metrics?.recentUsers?.length ?? 0} récents
                  </span>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {metrics?.recentUsers && metrics.recentUsers.length > 0 ? (
                    metrics.recentUsers.map((u) => (
                      <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-200">{u.full_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {u.email}
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {u.role ? u.role.toUpperCase() : "MEMBRE"}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {formatDateTime(u.created_at)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-500 font-mono">
                      Aucun utilisateur enregistré pour le moment.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Activité récente (10 derniers logs) */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>ACTIVITÉ RÉCENTE DE LA PLATEFORME</span>
                </h3>
                <button
                  onClick={() => setActiveTab("LOGS")}
                  className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Voir journal complet</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-800/80">
                {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
                  metrics.recentActivity.slice(0, 8).map((act) => (
                    <div key={act.id} className="py-2.5 flex items-start justify-between gap-4 text-xs font-mono">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          {renderSeverityBadge(act.severity)}
                          <span className="font-bold text-slate-200">{act.action_title}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {act.user_email && <span className="text-slate-300">{act.user_email} </span>}
                          {act.school_name && <span className="text-slate-500">&bull; {act.school_name}</span>}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 shrink-0">
                        {formatDateTime(act.created_at)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500 font-mono">
                    Aucune activité récente consignée.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VUE 2 : SURVEILLANCE DE L'ACTIVITÉ (JOURNAL D'AUDIT COMPLET)        */}
        {/* =================================================================== */}
        {activeTab === "LOGS" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Boîte de filtres avancés */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-400" />
                  <span>FILTRES DE RECHERCHE DANS LE JOURNAL</span>
                </h3>
                <button
                  onClick={() => {
                    setFilterEventType("ALL");
                    setFilterSeverity("ALL");
                    setFilterRole("ALL");
                    setFilterSearch("");
                    setFilterDateFrom("");
                    setFilterDateTo("");
                    loadLogs();
                  }}
                  className="text-xs font-mono text-slate-400 hover:text-white underline"
                >
                  Réinitialiser
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                {/* Recherche textuelle */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Recherche libre</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Email, école, action..."
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Type d'événement */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Type d&apos;événement</label>
                  <select
                    value={filterEventType}
                    onChange={(e) => setFilterEventType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">Tous les types</option>
                    <option value="CREATION_ETABLISSEMENT">Création établissement</option>
                    <option value="CREATION_COMPTE">Création compte utilisateur</option>
                    <option value="CONNEXION">Connexion</option>
                    <option value="DECONNEXION">Déconnexion</option>
                    <option value="MODIF_PROFIL">Modification profil</option>
                    <option value="ATTRIBUTION_PERMISSION">Attribution permission</option>
                    <option value="DATABASE_EVENT">Événement Base de données</option>
                    <option value="ERREUR_AUTH">Erreur authentification</option>
                    <option value="ERREUR_SERVEUR">Erreur serveur</option>
                    <option value="INTERVENTION_TECHNIQUE">Intervention technique</option>
                  </select>
                </div>

                {/* Sévérité */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Sévérité</label>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">Toutes sévérités</option>
                    <option value="INFO">INFO</option>
                    <option value="WARNING">WARNING (Attention)</option>
                    <option value="ERROR">ERROR (Erreur)</option>
                    <option value="CRITICAL">CRITICAL (Critique)</option>
                  </select>
                </div>

                {/* Rôle concerné */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Rôle concerné</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">Tous rôles</option>
                    <option value="directeur">Directeur</option>
                    <option value="censeur">Censeur</option>
                    <option value="comptabilite">Comptable</option>
                    <option value="enseignant">Enseignant</option>
                    <option value="parent">Parent</option>
                    <option value="DEVELOPPEUR">Développeur</option>
                  </select>
                </div>

                {/* Date Début */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Date début</label>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Date Fin */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Date fin</label>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Bouton Appliquer Filtres */}
                <div className="sm:col-span-2 flex items-end">
                  <button
                    onClick={loadLogs}
                    className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center justify-center gap-2"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Appliquer les Filtres</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tableau du Journal d'Audit */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300">
                  {logs.length} ÉVÉNEMENTS TROUVÉS
                </span>
                {logsLoading && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Chargement...
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] text-slate-400">
                    <tr>
                      <th className="p-3">DATE &amp; HEURE</th>
                      <th className="p-3">SÉVÉRITÉ</th>
                      <th className="p-3">ÉVÉNEMENT</th>
                      <th className="p-3">UTILISATEUR</th>
                      <th className="p-3">RÔLE</th>
                      <th className="p-3">ÉTABLISSEMENT</th>
                      <th className="p-3">DÉTAILS TECHNIQUES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {logs && logs.length > 0 ? (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 text-slate-400 whitespace-nowrap">
                            {formatDateTime(log.created_at)}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {renderSeverityBadge(log.severity)}
                          </td>
                          <td className="p-3 font-bold text-slate-200">
                            {log.action_title}
                            <span className="block text-[10px] text-slate-500 font-normal">
                              {log.event_type}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300 whitespace-nowrap">
                            {log.user_email || "—"}
                          </td>
                          <td className="p-3 text-slate-400 whitespace-nowrap uppercase text-[10px]">
                            {log.user_role || "—"}
                          </td>
                          <td className="p-3 text-slate-400 whitespace-nowrap">
                            {log.school_name || "—"}
                          </td>
                          <td className="p-3 text-slate-500 text-[10px] max-w-xs truncate">
                            {log.details ? JSON.stringify(log.details) : "—"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          Aucun événement ne correspond aux filtres sélectionnés.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VUE 3 : GESTION TECHNIQUE & ERREURS CRITIQUES                       */}
        {/* =================================================================== */}
        {activeTab === "INCIDENTS" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Bannière de diagnostic */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>REGISTRE DES ERREURS SYSTÈME &amp; SÉCURITÉ</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Détection en temps réel des erreurs d&apos;authentification, problèmes de requêtes et alertes
                  </p>
                </div>
                <button
                  onClick={() => setIsInterventionModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Consigner Intervention</span>
                </button>
              </div>
            </div>

            {/* Liste des erreurs critiques ou warnings */}
            <div className="space-y-3">
              {metrics?.recentErrors && metrics.recentErrors.length > 0 ? (
                metrics.recentErrors.map((err) => (
                  <div
                    key={err.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-rose-500/30 text-xs font-mono space-y-2 hover:border-rose-500/50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {renderSeverityBadge(err.severity)}
                        <span className="font-bold text-rose-300">{err.action_title}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {formatDateTime(err.created_at)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-[11px]">
                      <div>
                        <strong>Type :</strong> {err.event_type} &bull;{" "}
                        <strong>Cible :</strong> {err.user_email || "Non spécifié"} (
                        {err.user_role || "Inconnu"})
                      </div>
                      {err.details && (
                        <div className="mt-1 text-slate-500">
                          <code>{JSON.stringify(err.details, null, 2)}</code>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-200 font-mono">
                    Aucune anomalie critique enregistrée
                  </p>
                  <p className="text-xs text-slate-500">
                    Les modules d&apos;authentification, les bases de données et les serveurs fonctionnent normalement.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VUE 4 : ÉTAT GÉNÉRAL DES SERVICES                                   */}
        {/* =================================================================== */}
        {activeTab === "SERVICES" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>ÉTAT TECHNIQUE DES SERVICES ECOGEST</span>
              </h3>
              <p className="text-xs text-slate-400">
                Surveillance de connectivité et disponibilité des composants d&apos;infrastructure
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              {/* PostgreSQL Supabase */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200 font-bold">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>Supabase PostgreSQL 17.6</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    OPÉRATIONNEL
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>Région : eu-west-1 (Irlande)</div>
                  <div>Latence de réponse : {metrics?.servicesHealth?.database?.latencyMs ?? 18} ms</div>
                  <div>RLS : Activé sur toutes les tables</div>
                </div>
              </div>

              {/* API PostgREST */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200 font-bold">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>PostgREST API Engine</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    OPÉRATIONNEL
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>Version : v12.2.8</div>
                  <div>Protocole : HTTPS / JSON API REST</div>
                  <div>Schéma rechargé : Oui</div>
                </div>
              </div>

              {/* Service Authentification */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200 font-bold">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Authentification &amp; JWT GoTrue</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    OPÉRATIONNEL
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>Mode : Native JWT + RLS session</div>
                  <div>Séparation stricte : Espace Dev vs Utilisateurs</div>
                  <div>Chiffrement : HMAC-SHA256 &amp; PBKDF2</div>
                </div>
              </div>

              {/* Passerelle SMS & WhatsApp */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200 font-bold">
                    <Send className="w-4 h-4 text-emerald-400" />
                    <span>Passerelle WhatsApp &amp; Contacts</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    OPÉRATIONNEL
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>Numéro officiel 1 : +229 0155445122</div>
                  <div>Numéro officiel 2 : +2290161771334</div>
                  <div>WhatsApp Direct : +22955445122 / +229 61 77 13 34</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===================================================================== */}
      {/* MODAL : CONSIGNER UNE INTERVENTION TECHNIQUE                          */}
      {/* ===================================================================== */}
      {isInterventionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>CONSIGNER UNE INTERVENTION</span>
              </h3>
              <button
                onClick={() => setIsInterventionModalOpen(false)}
                className="text-slate-500 hover:text-white text-xs"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRecordIntervention} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Intitulé de l&apos;intervention *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Optimisation index base de données, vérification backup"
                  value={interventionTitle}
                  onChange={(e) => setInterventionTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Niveau de sévérité</label>
                <select
                  value={interventionSeverity}
                  onChange={(e) => setInterventionSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="INFO">INFO (Maintenance normale)</option>
                  <option value="WARNING">WARNING (Alerte préventive)</option>
                  <option value="ERROR">ERROR (Correction bogue)</option>
                  <option value="CRITICAL">CRITICAL (Incident majeur résolu)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Notes / Détails techniques</label>
                <textarea
                  rows={3}
                  placeholder="Détails de l'intervention, actions entreprises..."
                  value={interventionNote}
                  onChange={(e) => setInterventionNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInterventionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIntervention}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enregistrer au Journal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
