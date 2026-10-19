"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  GraduationCap,
  CreditCard,
  AlertTriangle,
  Server,
  Activity,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  UserX,
  Clock,
  Sparkles,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  AlertOctagon,
  FileText,
  LifeBuoy,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";

interface MetricsData {
  activeSchools: number;
  totalSchools: number;
  inactiveSchools: number;
  activeUsers: number;
  totalUsers: number;
  inactiveUsers: number;
  recentlyActiveUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  roleCounts: Record<string, number>;
  activeSubscriptions: number;
  expiringSubscriptions: number;
  expiredSubscriptions: number;
  recentErrorsCount: number;
  recentErrors: Array<any>;
  recentActivity: Array<any>;
  systemAlerts: Array<{ id: string; type: "WARNING" | "CRITICAL" | "INFO"; title: string; message: string; date: string }>;
  servicesHealth: Record<string, any>;
  generatedAt: string;
}

export default function DevDashboardPage() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardMetrics = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/dev-admin/metrics");
      if (res.ok) {
        const data = await res.json();
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      } else {
        toast("Impossible de charger les métriques réelles.", "error");
      }
    } catch {
      toast("Erreur de connexion au serveur.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardMetrics();

    // Écouter le bouton d'actualisation de la topbar
    const handleGlobalRefresh = () => loadDashboardMetrics(true);
    window.addEventListener("ecogest-dev-refresh", handleGlobalRefresh);
    return () => window.removeEventListener("ecogest-dev-refresh", handleGlobalRefresh);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="Tableau de bord Développeur"
        subtitle="Supervision technique globale, monitoring des effectifs et surveillance en temps réel d'ECOGEST"
        breadcrumbs={[{ label: "Développeur" }, { label: "Tableau de bord" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadDashboardMetrics(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs touch-target"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-school-primary" : ""}`} />
              <span>{refreshing ? "Actualisation..." : "Actualiser"}</span>
            </button>
            <Link
              href="/dev-admin/systeme"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 transition shadow-sm touch-target"
            >
              <Server className="w-3.5 h-3.5" />
              <span>État Système</span>
            </Link>
          </div>
        }
      />

      {/* Bannière État du Système & Alertes Réelles (comme sur l'espace Directeur) */}
      {metrics?.systemAlerts && metrics.systemAlerts.length > 0 && (
        <div className="space-y-3">
          {metrics.systemAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 md:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                alert.type === "CRITICAL"
                  ? "bg-rose-50 border-rose-200"
                  : alert.type === "WARNING"
                  ? "bg-amber-50 border-amber-200"
                  : "bg-emerald-50 border-emerald-200"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    alert.type === "CRITICAL"
                      ? "bg-rose-100 text-rose-700"
                      : alert.type === "WARNING"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {alert.type === "CRITICAL" ? (
                    <AlertOctagon className="w-5 h-5 text-rose-600" />
                  ) : alert.type === "WARNING" ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-black text-sm ${
                        alert.type === "CRITICAL"
                          ? "text-rose-950"
                          : alert.type === "WARNING"
                          ? "text-amber-950"
                          : "text-emerald-950"
                      }`}
                    >
                      {alert.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        alert.type === "CRITICAL"
                          ? "bg-rose-200 text-rose-900 border border-rose-300"
                          : alert.type === "WARNING"
                          ? "bg-amber-200 text-amber-900 border border-amber-300"
                          : "bg-emerald-200 text-emerald-900 border border-emerald-300"
                      }`}
                    >
                      {alert.type === "CRITICAL" ? "Critique" : alert.type === "WARNING" ? "Avertissement" : "Info"}
                    </span>
                  </div>
                  <p
                    className={`text-xs leading-relaxed ${
                      alert.type === "CRITICAL"
                        ? "text-rose-800"
                        : alert.type === "WARNING"
                        ? "text-amber-800"
                        : "text-emerald-800"
                    }`}
                  >
                    {alert.message}
                  </p>
                </div>
              </div>

              {alert.type === "CRITICAL" ? (
                <Link
                  href="/dev-admin/erreurs"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-sm transition shrink-0"
                >
                  <span>Analyser les erreurs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : alert.type === "WARNING" ? (
                <Link
                  href="/dev-admin/abonnements"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white shadow-sm transition shrink-0"
                >
                  <span>Superviser abonnements</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Grille 1 : Établissements & Utilisateurs (KPIs 1 à 4) */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-school-primary" />
          <span>Établissements &amp; Utilisateurs</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Établissements actifs"
            value={loading ? "..." : String(metrics?.activeSchools ?? 0)}
            subtitle={`${metrics?.inactiveSchools ?? 0} établissement(s) bloqué(s)`}
            icon={<Building2 className="w-6 h-6" />}
            variant="success"
          />
          <StatCard
            title="Établissements inscrits"
            value={loading ? "..." : String(metrics?.totalSchools ?? 0)}
            subtitle="Total des écoles enregistrées"
            icon={<Building2 className="w-6 h-6" />}
            variant="default"
          />
          <StatCard
            title="Utilisateurs actifs"
            value={loading ? "..." : String(metrics?.activeUsers ?? 0)}
            subtitle={`Sur un total de ${metrics?.totalUsers ?? 0} comptes`}
            icon={<UserCheck className="w-6 h-6" />}
            variant="info"
          />
          <StatCard
            title="Connectés récemment"
            value={loading ? "..." : String(metrics?.recentlyActiveUsers ?? 0)}
            subtitle="Actifs dans les dernières 48h"
            icon={<Clock className="w-6 h-6" />}
            variant="info"
          />
        </div>
      </div>

      {/* Grille 2 : Effectifs Métier & Abonnements (KPIs 5 à 9) */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-school-primary" />
          <span>Effectifs Scolaires &amp; Abonnements</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Nombre total d'élèves"
            value={loading ? "..." : String(metrics?.totalStudents ?? 0)}
            subtitle="Élèves inscrits dans la base"
            icon={<GraduationCap className="w-6 h-6" />}
            variant="default"
          />
          <StatCard
            title="Total enseignants"
            value={loading ? "..." : String(metrics?.totalTeachers ?? 0)}
            subtitle="Comptes professeurs actifs"
            icon={<Users className="w-6 h-6" />}
            variant="default"
          />
          <StatCard
            title="Personnels administratifs"
            value={loading ? "..." : String(metrics?.totalStaff ?? 0)}
            subtitle="Directeurs, Censeurs, Comptables"
            icon={<Users className="w-6 h-6" />}
            variant="default"
          />
          <StatCard
            title="Abonnements actifs"
            value={loading ? "..." : String(metrics?.activeSubscriptions ?? 0)}
            subtitle={`${metrics?.expiringSubscriptions ?? 0} proche(s) de l'expiration`}
            icon={<CreditCard className="w-6 h-6" />}
            variant="success"
          />
        </div>
      </div>

      {/* Grille 3 : Erreurs & Alertes Techniques (KPIs 10 & 11) */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>Surveillance Technique &amp; Erreurs</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Erreurs récentes"
            value={loading ? "..." : String(metrics?.recentErrorsCount ?? 0)}
            subtitle="Signalements techniques récents"
            icon={<AlertTriangle className="w-6 h-6" />}
            variant={metrics && metrics.recentErrorsCount > 0 ? "danger" : "success"}
          />
          <StatCard
            title="Abonnements à expiration"
            value={loading ? "..." : String(metrics?.expiringSubscriptions ?? 0)}
            subtitle="Échéance dans moins de 15 jours"
            icon={<CreditCard className="w-6 h-6" />}
            variant={metrics && metrics.expiringSubscriptions > 0 ? "warning" : "default"}
          />
          <StatCard
            title="Services Opérationnels"
            value={loading ? "..." : "100 %"}
            subtitle="PostgreSQL, Next.js, Auth, Storage"
            icon={<Server className="w-6 h-6" />}
            variant="success"
          />
        </div>
      </div>

      {/* Deux Colonnes : Activités Récentes & Erreurs Récentes Réelles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne 1 : Dernières activités enregistrées */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-school-50 text-school-primary flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Activité Récente Réelle</h3>
                <p className="text-[11px] text-slate-500">Dernières actions enregistrées dans le journal d'audit</p>
              </div>
            </div>
            <Link
              href="/dev-admin/activites"
              className="text-xs font-semibold text-school-primary hover:text-school-700 flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
              metrics.recentActivity.slice(0, 8).map((log: any) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs hover:border-slate-300 transition"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.event_type === "CREATION_ETABLISSEMENT"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : log.event_type === "CONNEXION"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-slate-200 text-slate-800"
                      }`}>
                        {log.event_type === "CREATION_ETABLISSEMENT" ? "Inscription École" : log.event_type}
                      </span>
                      <p className="font-semibold text-slate-900 truncate">{log.action_title}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                      <span className="font-medium text-slate-700">{log.user_email || "Système"}</span>
                      <span>&bull;</span>
                      <span className="uppercase text-[10px] font-bold text-school-primary">
                        {log.user_role || "Système"}
                      </span>
                      {log.school_name && (
                        <>
                          <span>&bull;</span>
                          <span className="font-medium text-slate-700">{log.school_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {new Date(log.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}{" "}
                    {new Date(log.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">Aucune activité récente enregistrée.</p>
            )}
          </div>
        </div>

        {/* Colonne 2 : Dernières Erreurs Signalées */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Erreurs &amp; Incidents Récents</h3>
                <p className="text-[11px] text-slate-500">Exceptions client et alertes techniques en attente</p>
              </div>
            </div>
            <Link
              href="/dev-admin/erreurs"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {metrics?.recentErrors && metrics.recentErrors.length > 0 ? (
              metrics.recentErrors.slice(0, 5).map((err: any) => (
                <div
                  key={err.id}
                  className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200">
                        {err.severity || "ERREUR"}
                      </span>
                      <p className="font-bold text-rose-950 truncate">{err.action_title}</p>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate">
                      {err.details?.error_message || err.details?.message || "Erreur système capturée"}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>Module : {err.details?.module || err.event_type}</span>
                      <span>&bull;</span>
                      <span>{err.school_name || "Central"}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {new Date(err.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <span className="font-semibold text-slate-700">Aucun incident critique récent</span>
                <span className="text-slate-500 text-[11px]">Le système fonctionne normalement sans exceptions non résolues.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
