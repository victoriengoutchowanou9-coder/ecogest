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
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  FileText,
  MessageSquare,
  Paperclip,
  Check,
  X,
  Info,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface PlatformMetrics {
  totalSchools: number;
  activeSchools: number;
  inactiveSchools: number;
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  roleCounts: {
    directeur: number;
    censeur: number;
    comptabilite: number;
    enseignant: number;
    parent: number;
    surveillant: number;
    secretariat: number;
    developpeur: number;
    autre: number;
  };
  totalStudents: number;
  totalParents: number;
  totalTeachers: number;
  totalSupportTickets: number;
  recentSchools: Array<{
    id: string;
    code: string;
    name: string;
    city: string;
    country: string;
    created_at: string;
  }>;
  recentUsers: Array<{
    id: string;
    full_name: string;
    email: string;
    role: string;
    status?: string;
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

interface SupportTicketItem {
  id: string;
  subject: string;
  category: string;
  priority: "NORMALE" | "HAUTE" | "URGENTE";
  status: "OUVERT" | "EN_COURS" | "RESOLU" | "FERME";
  description: string;
  attachmentName?: string;
  userId: string;
  userName: string;
  userRole: string;
  userEmail: string;
  userPhone: string;
  schoolId: string;
  schoolName: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    senderName: string;
    senderRole: string;
    message: string;
    timestamp: string;
    isStaff: boolean;
  }>;
}

export default function DevAdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"METRICS" | "LOGS" | "SUPPORT" | "INCIDENTS" | "SERVICES">("METRICS");
  const [developerEmail, setDeveloperEmail] = useState("");
  const [developerIdentifier, setDeveloperIdentifier] = useState("DEV-ROOT-001");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Données des métriques
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);

  // Données du journal d'audit
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Liste des établissements pour filtrage
  const [availableSchools, setAvailableSchools] = useState<Array<{ id: string; name: string }>>([]);

  // Filtres du journal d'audit
  const [filterSchool, setFilterSchool] = useState("ALL");
  const [filterUser, setFilterUser] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterEventType, setFilterEventType] = useState("ALL");
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Tickets de support
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("ALL");
  const [ticketSchoolFilter, setTicketSchoolFilter] = useState("ALL");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState("");
  const [ticketNewStatus, setTicketNewStatus] = useState<string>("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Modal consignation intervention technique
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [interventionTitle, setInterventionTitle] = useState("");
  const [interventionSeverity, setInterventionSeverity] = useState<"INFO" | "WARNING" | "ERROR" | "CRITICAL">("INFO");
  const [interventionNote, setInterventionNote] = useState("");
  const [isSubmittingIntervention, setIsSubmittingIntervention] = useState(false);

  // Modal modification de mot de passe
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Modal détails d'un log
  const [inspectedLog, setInspectedLog] = useState<AuditLogItem | null>(null);

  // 1. Vérification session développeur côté serveur
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
        setDeveloperIdentifier(data.identifier || "DEV-ROOT-001");
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
    } catch {
      toast("Erreur lors du rafraîchissement des métriques.", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  // 3. Chargement de la liste des établissements
  const loadSchoolsList = async () => {
    try {
      const res = await fetch("/api/schools");
      if (res.ok) {
        const data = await res.json();
        if (data.schools && Array.isArray(data.schools)) {
          setAvailableSchools(data.schools.map((s: any) => ({ id: s.id, name: s.name })));
        }
      }
    } catch {}
  };

  // 4. Chargement des logs avec filtres
  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterEventType !== "ALL") params.append("eventType", filterEventType);
      if (filterSeverity !== "ALL") params.append("severity", filterSeverity);
      if (filterRole !== "ALL") params.append("role", filterRole);
      if (filterSchool !== "ALL") params.append("school", filterSchool);
      if (filterUser.trim()) params.append("user", filterUser.trim());
      if (filterSearch.trim()) params.append("search", filterSearch.trim());
      if (filterDateFrom) params.append("dateFrom", filterDateFrom);
      if (filterDateTo) params.append("dateTo", filterDateTo);
      params.append("limit", "150");

      const res = await fetch(`/api/dev-admin/logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch {
      toast("Impossible de charger le journal d'activité.", "error");
    } finally {
      setLogsLoading(false);
    }
  };

  // 5. Chargement des tickets de support
  const loadTickets = async () => {
    setTicketsLoading(true);
    try {
      const params = new URLSearchParams();
      if (ticketStatusFilter !== "ALL") params.append("status", ticketStatusFilter);
      if (ticketSchoolFilter !== "ALL") params.append("school", ticketSchoolFilter);
      if (ticketSearch.trim()) params.append("search", ticketSearch.trim());

      const res = await fetch(`/api/dev-admin/tickets?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        if (selectedTicket) {
          const updated = (data.tickets || []).find((t: any) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch {
      toast("Impossible de charger les tickets de support.", "error");
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoadingAuth) {
      loadMetrics();
      loadSchoolsList();
      loadLogs();
      loadTickets();
    }
  }, [isLoadingAuth]);

  // Réinitialiser les filtres du journal
  const handleResetLogFilters = () => {
    setFilterSchool("ALL");
    setFilterUser("");
    setFilterRole("ALL");
    setFilterEventType("ALL");
    setFilterSeverity("ALL");
    setFilterSearch("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setTimeout(() => {
      loadLogs();
    }, 50);
  };

  // Déconnexion complète sécurisée
  const handleLogout = async () => {
    try {
      await fetch("/api/dev-admin/logout", { method: "POST" });
    } catch {}
    toast("Session développeur fermée avec succès.", "info");
    router.push("/dev-admin/connexion");
  };

  // Envoi d'une réponse à un ticket
  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!ticketReplyText.trim() && !ticketNewStatus) {
      toast("Veuillez saisir une réponse ou modifier le statut.", "error");
      return;
    }

    setIsSubmittingReply(true);
    try {
      const res = await fetch("/api/dev-admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          status: ticketNewStatus || selectedTicket.status,
          replyMessage: ticketReplyText.trim(),
        }),
      });

      if (res.ok) {
        toast("Réponse envoyée et ticket mis à jour.", "success");
        setTicketReplyText("");
        setTicketNewStatus("");
        loadTickets();
        loadMetrics();
        loadLogs();
      } else {
        toast("Échec de la réponse au ticket.", "error");
      }
    } catch {
      toast("Erreur de connexion.", "error");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Modification du mot de passe Développeur
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast("Veuillez saisir votre mot de passe actuel.", "error");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast("Le nouveau mot de passe doit comporter au moins 8 caractères.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("Les mots de passe ne correspondent pas.", "error");
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const res = await fetch("/api/dev-admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast("Mot de passe modifié avec succès dans la base de données !", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsPasswordModalOpen(false);
        loadLogs();
      } else {
        toast(data.error || "Impossible de modifier le mot de passe.", "error");
      }
    } catch {
      toast("Erreur réseau.", "error");
    } finally {
      setIsSubmittingPassword(false);
    }
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
          details: {
            note: interventionNote.trim(),
            dev: developerEmail,
            identifier: developerIdentifier,
          },
        }),
      });

      if (res.ok) {
        toast("Intervention technique consignée dans le journal d'audit.", "success");
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

  // Formatage date et heure séparées ou combinées
  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        date: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }),
        time: d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        full: d.toLocaleString("fr-FR"),
      };
    } catch {
      return { date: dateStr, time: "", full: dateStr };
    }
  };

  // Badge sévérité
  const renderSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1">
            <AlertOctagon className="w-3 h-3" /> CRITIQUE
          </span>
        );
      case "ERROR":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> ERREUR
          </span>
        );
      case "WARNING":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> ATTENTION
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> INFO
          </span>
        );
    }
  };

  // Badge statut ticket
  const renderTicketStatusBadge = (status: string) => {
    switch (status) {
      case "OUVERT":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            OUVERT
          </span>
        );
      case "EN_COURS":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            EN COURS
          </span>
        );
      case "RESOLU":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            RÉSOLU
          </span>
        );
      case "FERME":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">
            FERMÉ
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] text-slate-400">{status}</span>;
    }
  };

  // Badge priorité ticket
  const renderTicketPriorityBadge = (p: string) => {
    switch (p) {
      case "URGENTE":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
            URGENTE
          </span>
        );
      case "HAUTE":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            HAUTE
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] text-slate-400 border border-slate-800">
            NORMALE
          </span>
        );
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-400">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono text-slate-300">Vérification de la session Développeur...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* ===================================================================== */}
      {/* BARRE SUPÉRIEURE DE NAVIGATION TECHNIQUE                              */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-black text-sm shadow-sm">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-white font-mono">
                  ECOGEST // DEV_CONSOLE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500 text-slate-950 font-mono">
                  {developerIdentifier}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span>{developerEmail}</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-emerald-400">RÔLE : DÉVELOPPEUR TECHNIQUE</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                loadMetrics();
                loadLogs();
                loadTickets();
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
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition"
              title="Modifier le mot de passe Développeur"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Mot de passe</span>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto text-xs font-mono border-t border-slate-800/60 py-1.5">
          <button
            onClick={() => setActiveTab("METRICS")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition ${
              activeTab === "METRICS"
                ? "bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Vue Globale &amp; Métriques</span>
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
            <span>Journal d&apos;Activité / Audit ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("SUPPORT")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition ${
              activeTab === "SUPPORT"
                ? "bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
            <span>Support &amp; Requêtes ({tickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("INCIDENTS")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition ${
              activeTab === "INCIDENTS"
                ? "bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
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
        </div>
      </header>

      {/* ===================================================================== */}
      {/* CONTENU PRINCIPAL PAR ONGLET                                          */}
      {/* ===================================================================== */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
        
        {/* =================================================================== */}
        {/* VUE 1 : VUE GLOBALE & MÉTRIQUES RÉELLES                             */}
        {/* =================================================================== */}
        {activeTab === "METRICS" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Ligne d'état d'infrastructure */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-slate-200">
                  PLATEFORME ECOGEST : OPÉRATIONNELLE
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">
                  PostgreSQL Supabase (eu-west-1) &bull; Latence : {metrics?.servicesHealth?.database?.latencyMs ?? 20} ms
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Généré en direct : {metrics?.generatedAt ? formatDateTime(metrics.generatedAt).full : "En temps réel"}
              </div>
            </div>

            {/* Cartes KPI Principales exigées par le cahier des charges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Établissements créés */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-mono font-semibold">ÉTABLISSEMENTS CRÉÉS</span>
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
                    {metrics?.inactiveSchools ?? 0} désactivés
                  </span>
                </div>
              </div>

              {/* 2. Total Utilisateurs & Actifs vs Désactivés */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-mono font-semibold">TOTAL UTILISATEURS</span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-black font-mono text-white">
                  {metrics?.totalUsers ?? 0}
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    {metrics?.activeUsers ?? 0} actifs
                  </span>
                  <span>&bull;</span>
                  <span className="text-rose-400 flex items-center gap-1">
                    <UserX className="w-3 h-3" />
                    {metrics?.inactiveUsers ?? 0} désactivés
                  </span>
                </div>
              </div>

              {/* 3. Élèves suivis */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-mono font-semibold">ÉLÈVES INSCRITS</span>
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-black font-mono text-white">
                  {metrics?.totalStudents ?? 0}
                </div>
                <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                  Base élèves enregistrée en base
                </div>
              </div>

              {/* 4. Tickets de support */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-mono font-semibold">TICKETS DE SUPPORT</span>
                  <LifeBuoy className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-3xl font-black font-mono text-white">
                  {tickets.length}
                </div>
                <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                  <button
                    onClick={() => setActiveTab("SUPPORT")}
                    className="text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <span>Superviser le support ({tickets.filter(t => t.status === "OUVERT").length} ouverts)</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Répartition spécifique par Rôle : Directeurs, Censeurs, Enseignants, Parents, etc. */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-mono text-white">
                    RÉPARTITION DÉTAILLÉE PAR RÔLE
                  </h3>
                  <p className="text-xs text-slate-400">
                    Effectifs réels des membres de l&apos;administration et usagers
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  {metrics?.totalUsers ?? 0} comptes persistants
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

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Comptables</span>
                  </div>
                  <div className="text-2xl font-black font-mono text-white">
                    {metrics?.roleCounts?.comptabilite ?? 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Inscriptions récentes & Nouveaux comptes réels */}
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
                            ACTIF
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {formatDateTime(s.created_at).full}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-500 font-mono">
                      Aucune activité enregistrée.
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
                            {formatDateTime(u.created_at).full}
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

            {/* Activité récente (derniers logs) */}
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
                  <span>Voir journal complet ({logs.length})</span>
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
                          {act.user_role && <span className="text-indigo-400">({act.user_role}) </span>}
                          {act.school_name && <span className="text-slate-500">&bull; {act.school_name}</span>}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 shrink-0">
                        {formatDateTime(act.created_at).full}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500 font-mono">
                    Aucune activité enregistrée.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VUE 2 : JOURNAL DES ACTIONS & AUDIT COMPLET                         */}
        {/* =================================================================== */}
        {activeTab === "LOGS" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Boîte de filtres avancés exigés */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-400" />
                  <span>FILTRAGE DU JOURNAL D&apos;AUDIT</span>
                </h3>
                <button
                  onClick={handleResetLogFilters}
                  className="text-xs font-mono text-slate-400 hover:text-white underline"
                >
                  Réinitialiser tous les filtres
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                {/* 1. Établissement */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Établissement</label>
                  <select
                    value={filterSchool}
                    onChange={(e) => setFilterSchool(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 truncate"
                  >
                    <option value="ALL">Tous les établissements</option>
                    {availableSchools.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Utilisateur */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Utilisateur (Email / Nom)</label>
                  <input
                    type="text"
                    placeholder="Ex: directeur@ecole.bj"
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 3. Rôle */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Rôle</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">Tous les rôles</option>
                    <option value="directeur">Directeur</option>
                    <option value="censeur">Censeur</option>
                    <option value="comptabilite">Comptable</option>
                    <option value="enseignant">Enseignant</option>
                    <option value="parent">Parent</option>
                    <option value="surveillant">Surveillant</option>
                    <option value="secretariat">Secrétaire</option>
                    <option value="DEVELOPPEUR">Développeur</option>
                    <option value="SYSTEM">Système Global</option>
                  </select>
                </div>

                {/* 4. Type d'action */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Type d&apos;action</label>
                  <select
                    value={filterEventType}
                    onChange={(e) => setFilterEventType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">Tous les types d&apos;action</option>
                    <option value="CREATION_ETABLISSEMENT">Création établissement</option>
                    <option value="CREATION_COMPTE">Création compte</option>
                    <option value="CONNEXION">Connexion</option>
                    <option value="DECONNEXION">Déconnexion</option>
                    <option value="CREATION_TICKET_SUPPORT">Ticket de support</option>
                    <option value="REPONSE_TICKET_SUPPORT">Réponse support</option>
                    <option value="MODIF_PROFIL">Modification profil / mot de passe</option>
                    <option value="ATTRIBUTION_PERMISSION">Attribution de droits</option>
                    <option value="ERREUR_AUTH">Erreur authentification</option>
                    <option value="INTERVENTION_TECHNIQUE">Intervention technique</option>
                  </select>
                </div>

                {/* 5. Date Début */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Date début</label>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 6. Date Fin */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Date fin</label>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 7. Recherche libre */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] text-slate-400">Recherche textuelle libre</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Mots-clés, action, email, école..."
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Bouton Appliquer */}
                <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-1">
                  <button
                    onClick={loadLogs}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Appliquer les Filtres</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tableau du Journal d'Audit détaillé */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300">
                  {logs.length} ACTIVITÉS ENREGISTRÉES DANS LE JOURNAL
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
                  <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] text-slate-400">
                    <tr>
                      <th className="p-3">DATE &amp; HEURE</th>
                      <th className="p-3">UTILISATEUR</th>
                      <th className="p-3">RÔLE</th>
                      <th className="p-3">ÉTABLISSEMENT</th>
                      <th className="p-3">ACTION EFFECTUÉE</th>
                      <th className="p-3">ÉLÉMENT CONCERNÉ</th>
                      <th className="p-3">RÉSULTAT</th>
                      <th className="p-3 text-right">DÉTAILS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {logs && logs.length > 0 ? (
                      logs.map((log) => {
                        const dt = formatDateTime(log.created_at);
                        const isError = log.severity === "ERROR" || log.severity === "CRITICAL";
                        const resultText = isError ? "Échec" : "Succès";
                        const targetElement =
                          log.details?.target ||
                          log.details?.plan ||
                          log.details?.ticketId ||
                          log.event_type.replace(/_/g, " ");

                        return (
                          <tr key={log.id} className="hover:bg-slate-800/40 transition">
                            {/* Date et Heure */}
                            <td className="p-3 whitespace-nowrap">
                              <div className="text-slate-200 font-semibold">{dt.date}</div>
                              <div className="text-[10px] text-slate-500">{dt.time}</div>
                            </td>

                            {/* Utilisateur */}
                            <td className="p-3 text-slate-300 whitespace-nowrap">
                              {log.user_email || "Système"}
                            </td>

                            {/* Rôle */}
                            <td className="p-3 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 uppercase border border-slate-700">
                                {log.user_role || "SYSTEM"}
                              </span>
                            </td>

                            {/* Établissement concerné */}
                            <td className="p-3 text-slate-300 whitespace-nowrap font-medium">
                              {log.school_name || "Administration Centrale"}
                            </td>

                            {/* Action effectuée */}
                            <td className="p-3 text-white font-bold">
                              {log.action_title}
                            </td>

                            {/* Élément concerné */}
                            <td className="p-3 text-slate-400 whitespace-nowrap text-[11px]">
                              {targetElement}
                            </td>

                            {/* Résultat */}
                            <td className="p-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  isError
                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                }`}
                              >
                                {resultText}
                              </span>
                            </td>

                            {/* Bouton détails */}
                            <td className="p-3 text-right whitespace-nowrap">
                              <button
                                onClick={() => setInspectedLog(log)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-700 transition"
                                title="Voir les données brutes"
                              >
                                Examiner
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-slate-500 font-mono">
                          Aucune activité enregistrée.
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
        {/* VUE 3 : SUPPORT TECHNIQUE & GESTION DES TICKETS                     */}
        {/* =================================================================== */}
        {activeTab === "SUPPORT" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Barre de contrôle du support */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                    <LifeBuoy className="w-4 h-4 text-amber-400" />
                    <span>SUPERVISION DU SUPPORT TECHNIQUE</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tickets réels émis par les directeurs, enseignants et parents
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    {tickets.filter((t) => t.status === "OUVERT").length} en attente
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {tickets.filter((t) => t.status === "RESOLU").length} résolus
                  </span>
                </div>
              </div>

              {/* Filtres support */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                <div>
                  <label className="text-[10px] text-slate-400">Recherche</label>
                  <input
                    type="text"
                    placeholder="Sujet, auteur, numéro de ticket..."
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">Statut</label>
                  <select
                    value={ticketStatusFilter}
                    onChange={(e) => setTicketStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">Tous les statuts</option>
                    <option value="OUVERT">OUVERT</option>
                    <option value="EN_COURS">EN COURS</option>
                    <option value="RESOLU">RÉSOLU</option>
                    <option value="FERME">FERMÉ</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">Établissement d&apos;origine</label>
                  <select
                    value={ticketSchoolFilter}
                    onChange={(e) => setTicketSchoolFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 truncate"
                  >
                    <option value="ALL">Tous les établissements</option>
                    {availableSchools.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Disposition Split-View (Liste des tickets & Détail du ticket) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Colonne gauche : Liste des tickets */}
              <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden space-y-2">
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-300">
                    {tickets.length} TICKETS RÉELS
                  </span>
                  {ticketsLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />}
                </div>

                <div className="divide-y divide-slate-800/70 max-h-[600px] overflow-y-auto">
                  {tickets && tickets.length > 0 ? (
                    tickets.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className={`p-4 cursor-pointer transition text-xs font-mono ${
                          selectedTicket?.id === t.id
                            ? "bg-emerald-500/10 border-l-4 border-emerald-500"
                            : "hover:bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] font-bold text-slate-400">{t.id}</span>
                          <div className="flex items-center gap-1.5">
                            {renderTicketPriorityBadge(t.priority)}
                            {renderTicketStatusBadge(t.status)}
                          </div>
                        </div>

                        <div className="font-bold text-white line-clamp-1 mb-1">
                          {t.subject}
                        </div>

                        <div className="text-[11px] text-slate-400 space-y-0.5">
                          <div>
                            <strong>De :</strong> {t.userName} ({t.userRole})
                          </div>
                          <div className="text-slate-500 truncate">
                            <strong>École :</strong> {t.schoolName || "Non spécifié"}
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 mt-2 text-right">
                          {t.createdAt}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-xs text-slate-500 font-mono">
                      Aucun ticket de support enregistré.
                    </div>
                  )}
                </div>
              </div>

              {/* Colonne droite : Détail et réponse du Développeur */}
              <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 font-mono text-xs">
                {selectedTicket ? (
                  <>
                    {/* En-tête du ticket */}
                    <div className="border-b border-slate-800 pb-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white">{selectedTicket.id}</span>
                          {renderTicketStatusBadge(selectedTicket.status)}
                          {renderTicketPriorityBadge(selectedTicket.priority)}
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Créé le {selectedTicket.createdAt}
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-white font-sans">
                        {selectedTicket.subject}
                      </h2>

                      {/* Données auteur et école */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500">Auteur : </span>
                          <strong className="text-slate-200">{selectedTicket.userName}</strong> (
                          {selectedTicket.userRole})
                        </div>
                        <div>
                          <span className="text-slate-500">Établissement : </span>
                          <strong className="text-slate-200">{selectedTicket.schoolName || "N/A"}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Email : </span>
                          <span className="text-indigo-400">{selectedTicket.userEmail || "Non fourni"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Téléphone : </span>
                          <span className="text-emerald-400">{selectedTicket.userPhone || "Non fourni"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Historique des messages / échanges */}
                    <div className="space-y-3">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Historique des échanges ({selectedTicket.messages?.length || 0})
                      </div>

                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                          selectedTicket.messages.map((m) => (
                            <div
                              key={m.id}
                              className={`p-3.5 rounded-2xl border text-xs ${
                                m.isStaff
                                  ? "bg-emerald-500/10 border-emerald-500/30 ml-4"
                                  : "bg-slate-950 border-slate-800 mr-4"
                              }`}
                            >
                              <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-400">
                                <span className={m.isStaff ? "font-bold text-emerald-300" : "font-bold text-slate-200"}>
                                  {m.senderName} ({m.senderRole})
                                </span>
                                <span className="text-[10px] text-slate-500">{m.timestamp}</span>
                              </div>
                              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {m.message}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 rounded-xl bg-slate-950 text-slate-500">
                            {selectedTicket.description}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Formulaire de réponse directe Développeur */}
                    <form onSubmit={handleSendTicketReply} className="border-t border-slate-800 pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300">
                          Répondre au ticket (en tant que Support Développeur)
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-slate-500">Changer statut :</label>
                          <select
                            value={ticketNewStatus}
                            onChange={(e) => setTicketNewStatus(e.target.value)}
                            className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white text-[11px] focus:outline-none focus:border-emerald-500"
                          >
                            <option value="">Statut actuel ({selectedTicket.status})</option>
                            <option value="EN_COURS">Passer EN COURS</option>
                            <option value="RESOLU">Marquer RÉSOLU</option>
                            <option value="FERME">FERMER le ticket</option>
                          </select>
                        </div>
                      </div>

                      <textarea
                        rows={3}
                        placeholder="Rédigez une réponse officielle pour le créateur du ticket..."
                        value={ticketReplyText}
                        onChange={(e) => setTicketReplyText(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed text-xs"
                      />

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmittingReply}
                          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center gap-2 shadow-md disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Envoyer la réponse</span>
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="p-16 text-center text-slate-500 space-y-2">
                    <LifeBuoy className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="font-bold text-slate-300">Sélectionnez un ticket pour superviser</p>
                    <p className="text-[11px]">
                      Vous pourrez consulter l&apos;intégralité de l&apos;échange et y répondre directement.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VUE 4 : GESTION TECHNIQUE & ERREURS CRITIQUES                       */}
        {/* =================================================================== */}
        {activeTab === "INCIDENTS" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Diagnostic */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>REGISTRE DES ERREURS SYSTÈME &amp; SÉCURITÉ</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Détection en temps réel des erreurs d&apos;authentification et alertes techniques
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

            {/* Liste des erreurs */}
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
                        {formatDateTime(err.created_at).full}
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
                <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2 font-mono">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-200">
                    Aucune anomalie ou erreur enregistrée.
                  </p>
                  <p className="text-xs text-slate-500">
                    Les modules d&apos;authentification et la base de données fonctionnent de manière optimale.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VUE 5 : ÉTAT GÉNÉRAL DES SERVICES                                   */}
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
                  <div>Latence de réponse : {metrics?.servicesHealth?.database?.latencyMs ?? 20} ms</div>
                  <div>Séparation stricte : Multi-tenancy par école (school_id)</div>
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
                  <div>Protocole : HTTPS / JSON REST</div>
                  <div>RLS : Activé</div>
                </div>
              </div>

              {/* Service Authentification */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200 font-bold">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Authentification &amp; Sessions Sécurisées</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    OPÉRATIONNEL
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>Chiffrement mot de passe : PBKDF2-SHA512 (100k itérations)</div>
                  <div>Jeton de session : Cookie HttpOnly signé HMAC-SHA256</div>
                  <div>Indépendance absolue : Développeur séparé des écoles</div>
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
                  <div>Support Bénin &amp; International</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===================================================================== */}
      {/* MODAL : MODIFIER LE MOT DE PASSE DU COMPTE DÉVELOPPEUR                */}
      {/* ===================================================================== */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>MODIFIER LE MOT DE PASSE DÉVELOPPEUR</span>
              </h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-500 hover:text-white text-base"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Mot de passe actuel *</label>
                <div className="relative">
                  <input
                    type={showPasswordFields ? "text" : "password"}
                    required
                    placeholder="Saisissez votre mot de passe actuel"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPasswordFields ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Nouveau mot de passe (min 8 car.) *</label>
                <input
                  type={showPasswordFields ? "text" : "password"}
                  required
                  placeholder="Nouveau mot de passe sécurisé"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Confirmer le nouveau mot de passe *</label>
                <input
                  type={showPasswordFields ? "text" : "password"}
                  required
                  placeholder="Confirmez le nouveau mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300">
                Le nouveau mot de passe sera haché avec PBKDF2-SHA512 et immédiatement persisté dans la base PostgreSQL Supabase.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Enregistrer le mot de passe</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL : CONSIGNER UNE INTERVENTION TECHNIQUE                          */}
      {/* ===================================================================== */}
      {isInterventionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>CONSIGNER UNE ACTION / INTERVENTION</span>
              </h3>
              <button
                onClick={() => setIsInterventionModalOpen(false)}
                className="text-slate-500 hover:text-white text-base"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRecordIntervention} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Intitulé de l&apos;action *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Sauvegarde BDD, vérification certificats, support école"
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
                  <option value="INFO">INFO (Action normale de routine)</option>
                  <option value="WARNING">WARNING (Alerte préventive)</option>
                  <option value="ERROR">ERROR (Correction anomalie)</option>
                  <option value="CRITICAL">CRITICAL (Incident critique résolu)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Notes / Détails techniques</label>
                <textarea
                  rows={3}
                  placeholder="Détails de l'action entreprise, établissement ciblé..."
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

      {/* ===================================================================== */}
      {/* MODAL : EXAMINER DÉTAILS D'UN ÉVÉNEMENT D'AUDIT                       */}
      {/* ===================================================================== */}
      {inspectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400" />
                <span>DÉTAIL DE L&apos;ÉVÉNEMENT D&apos;AUDIT</span>
              </h3>
              <button
                onClick={() => setInspectedLog(null)}
                className="text-slate-500 hover:text-white text-base"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <span className="text-slate-500">ID d&apos;enregistrement : </span>
                <span className="text-slate-300 font-bold">{inspectedLog.id}</span>
              </div>
              <div>
                <span className="text-slate-500">Date &amp; Heure exacte : </span>
                <span className="text-slate-200">{formatDateTime(inspectedLog.created_at).full}</span>
              </div>
              <div>
                <span className="text-slate-500">Type d&apos;événement : </span>
                <span className="text-emerald-400">{inspectedLog.event_type}</span>
              </div>
              <div>
                <span className="text-slate-500">Niveau de sévérité : </span>
                {renderSeverityBadge(inspectedLog.severity)}
              </div>
              <div>
                <span className="text-slate-500">Utilisateur à l&apos;origine : </span>
                <span className="text-slate-200">{inspectedLog.user_email || "Système"}</span> (
                {inspectedLog.user_role || "N/A"})
              </div>
              <div>
                <span className="text-slate-500">Établissement concerné : </span>
                <span className="text-slate-200">{inspectedLog.school_name || "Administration Centrale"}</span>
              </div>
              <div>
                <span className="text-slate-500">Action : </span>
                <span className="text-white font-bold">{inspectedLog.action_title}</span>
              </div>

              <div className="pt-2">
                <span className="text-slate-500 block mb-1">Charge utile JSON (details) :</span>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
                  {JSON.stringify(inspectedLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
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
