"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordCard } from "@/components/ui/RecordCard";
import { FilterBar } from "@/components/ui/FilterBar";
import {
  getSensitiveAccessLogs,
  SensitiveAccessAuditLog,
  SensitiveDataType,
} from "@/lib/security/encryption";

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  ipAddress: string;
  status: "SUCCES" | "ECHEC";
}

const AUDIT_DATA: AuditEntry[] = [
  { id: "aud-01", timestamp: "28/09/2026 14:15:22", actor: "C. KPONOU (Comptable)", action: "Enregistrement Paiement 130 000 FCFA", target: "Reçu RC-2026-0843 (Koffi ADANHOUN)", ipAddress: "197.234.221.14", status: "SUCCES" },
  { id: "aud-02", timestamp: "28/09/2026 11:30:10", actor: "M. Marcellin DOKPO (Censeur)", action: "Validation des notes Semestre 1", target: "Classe 3ème A - Mathématiques", ipAddress: "197.234.221.10", status: "SUCCES" },
  { id: "aud-03", timestamp: "28/09/2026 10:40:05", actor: "Prof. Justin HOUNKPONOU", action: "Saisie de notes", target: "Devoir 1 - Tle C", ipAddress: "197.234.221.45", status: "SUCCES" },
  { id: "aud-04", timestamp: "27/09/2026 18:22:15", actor: "Inconnu", action: "Tentative de connexion avec mot de passe erroné", target: "Compte admin@ecole.bj", ipAddress: "41.85.160.98", status: "ECHEC" },
  { id: "aud-05", timestamp: "27/09/2026 09:12:00", actor: "M. Marcellin DOKPO (Censeur)", action: "Émargement enseignant enregistré", target: "M. Pamphile BIO (Absent)", ipAddress: "197.234.221.10", status: "SUCCES" },
];

const INITIAL_SENSITIVE_LOGS: SensitiveAccessAuditLog[] = [
  {
    id: "sens-init-01",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    authorName: "M. Marcellin DOKPO",
    authorRole: "censeur",
    studentId: "std-01",
    studentName: "Koffi Parfait ADANHOUN",
    dataType: "MEDICAL",
    action: "VIEW",
    details: "Consultation du dossier de santé (allergies et groupe sanguin)",
  },
  {
    id: "sens-init-02",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    authorName: "Dr. K. AGBANDJE",
    authorRole: "medecin",
    studentId: "std-03",
    studentName: "Bio Rachid SOULEYMANE",
    dataType: "MEDICAL",
    action: "EDIT",
    details: "Chiffrement et mise à jour du protocole drépanocytaire et contacts d'urgence",
  },
  {
    id: "sens-init-03",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    authorName: "M. Marcellin DOKPO",
    authorRole: "censeur",
    studentId: "std-03",
    studentName: "Bio Rachid SOULEYMANE",
    dataType: "DISCIPLINE",
    action: "EDIT",
    details: "Enregistrement de sanction disciplinaire (Retards répétés)",
  },
  {
    id: "sens-init-04",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    authorName: "M. Marcellin DOKPO",
    authorRole: "censeur",
    studentId: "std-07",
    studentName: "Mariam CHABI",
    dataType: "CONTACT_ELEVE",
    action: "READMISSION",
    details: "Réadmission officielle dans la classe de 3ème A pour l'année 2026 - 2027",
  },
];

export default function AuditJournalPage() {
  const [activeTab, setActiveTab] = useState<"GENERAL" | "SENSITIVE">("GENERAL");
  const [search, setSearch] = useState("");
  const [sensitiveLogs, setSensitiveLogs] = useState<SensitiveAccessAuditLog[]>([]);

  useEffect(() => {
    const loaded = getSensitiveAccessLogs();
    if (loaded && loaded.length > 0) {
      setSensitiveLogs(loaded);
    } else {
      setSensitiveLogs(INITIAL_SENSITIVE_LOGS);
    }

    const handleUpdate = () => {
      const refreshed = getSensitiveAccessLogs();
      if (refreshed && refreshed.length > 0) {
        setSensitiveLogs(refreshed);
      }
    };

    window.addEventListener("educogest_sensitive_audit_update", handleUpdate);
    return () => window.removeEventListener("educogest_sensitive_audit_update", handleUpdate);
  }, []);

  // Filter general logs
  const filteredGeneral = AUDIT_DATA.filter(
    (item) =>
      item.actor.toLowerCase().includes(search.toLowerCase()) ||
      item.action.toLowerCase().includes(search.toLowerCase()) ||
      item.target.toLowerCase().includes(search.toLowerCase())
  );

  // Filter sensitive logs
  const filteredSensitive = sensitiveLogs.filter(
    (item) =>
      item.authorName.toLowerCase().includes(search.toLowerCase()) ||
      item.studentName.toLowerCase().includes(search.toLowerCase()) ||
      item.dataType.toLowerCase().includes(search.toLowerCase()) ||
      (item.details && item.details.toLowerCase().includes(search.toLowerCase()))
  );

  const generalColumns: Column<AuditEntry>[] = [
    {
      key: "timestamp",
      header: "Date & Heure",
      render: (item) => <span className="text-xs font-mono text-slate-600">{item.timestamp}</span>,
    },
    {
      key: "actor",
      header: "Utilisateur",
      render: (item) => <span className="font-semibold text-slate-800 text-xs">{item.actor}</span>,
    },
    {
      key: "action",
      header: "Action réalisée",
      render: (item) => (
        <div>
          <span className="text-slate-900 font-medium text-xs">{item.action}</span>
          <span className="block text-[11px] text-slate-400 font-mono">{item.target}</span>
        </div>
      ),
    },
    {
      key: "ipAddress",
      header: "Adresse IP",
      render: (item) => <span className="text-xs font-mono text-slate-500">{item.ipAddress}</span>,
    },
    {
      key: "status",
      header: "Résultat",
      render: (item) => (
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded ${
            item.status === "SUCCES"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {item.status}
        </span>
      ),
    },
  ];

  const getDataTypeBadge = (type: SensitiveDataType) => {
    switch (type) {
      case "MEDICAL":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <HeartPulse className="w-3 h-3" />
            <span>Dossier Médical</span>
          </span>
        );
      case "DISCIPLINE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <ShieldAlert className="w-3 h-3" />
            <span>Discipline</span>
          </span>
        );
      case "CONTACT_ELEVE":
      case "CONTACT_PARENT":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <User className="w-3 h-3" />
            <span>Coordonnées Privées</span>
          </span>
        );
    }
  };

  const getActionBadge = (action: SensitiveAccessAuditLog["action"]) => {
    switch (action) {
      case "VIEW":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Lecture
          </span>
        );
      case "EDIT":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Modification
          </span>
        );
      case "READMISSION":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            Réadmission
          </span>
        );
      case "EXPORT":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Export chiffré
          </span>
        );
    }
  };

  const sensitiveColumns: Column<SensitiveAccessAuditLog>[] = [
    {
      key: "timestamp",
      header: "Horodatage",
      render: (item) => (
        <span className="text-xs font-mono text-slate-600 block">
          {new Date(item.timestamp).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "authorName",
      header: "Opérateur (RBAC)",
      render: (item) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block">{item.authorName}</span>
          <span className="text-[10px] uppercase font-mono text-slate-400">Rôle : {item.authorRole}</span>
        </div>
      ),
    },
    {
      key: "studentName",
      header: "Élève concerné",
      render: (item) => (
        <span className="font-bold text-slate-900 text-xs">{item.studentName}</span>
      ),
    },
    {
      key: "dataType",
      header: "Type de Donnée",
      render: (item) => getDataTypeBadge(item.dataType),
    },
    {
      key: "action",
      header: "Action",
      render: (item) => getActionBadge(item.action),
    },
    {
      key: "details",
      header: "Détails de l'opération sécurisée",
      render: (item) => (
        <span className="text-xs text-slate-600">{item.details || "Accès aux attributs chiffrés"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal d'Audit &amp; Sécurité des Données"
        subtitle="Historique immuable de toutes les opérations sensibles, connexions et accès aux données chiffrées"
        breadcrumbs={[{ label: "Directeur", href: "/directeur" }, { label: "Journal d'audit" }]}
      />

      {/* Security Architecture & Encryption Card (Feature 8) */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-school-primary p-5 rounded-2xl text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">
              Coffre-Fort &amp; Chiffrement au Repos Actif (Norme ENCv1)
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Protection AES-GCM 256 bits activée
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Toutes les informations médicales (allergies, pathologies, contacts d&apos;urgence), dossiers disciplinaires et coordonnées privées sont chiffrés au repos avec isolation cryptographique stricte par établissement. Tout accès est automatiquement consigné dans le registre immuable ci-dessous.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-300" />
            <span>Clé Maître par Établissement</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-sky-300" />
            <span>Contrôle RBAC Strict</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-300" />
            <span>Sauvegardes Protégées</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("GENERAL")}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 ${
            activeTab === "GENERAL"
              ? "border-school-primary text-school-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Opérations Système &amp; Connexions ({filteredGeneral.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("SENSITIVE")}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "SENSITIVE"
              ? "border-school-primary text-school-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-school-primary" />
          <span>Accès aux Données Chiffrées (Santé, Discipline, Coordonnées) ({filteredSensitive.length})</span>
        </button>
      </div>

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder={
          activeTab === "GENERAL"
            ? "Filtrer les actions, utilisateurs, adresses IP..."
            : "Filtrer par auteur, élève, type de donnée..."
        }
        onReset={() => setSearch("")}
      />

      {activeTab === "GENERAL" ? (
        <DataTable
          data={filteredGeneral}
          columns={generalColumns}
          keyExtractor={(item) => item.id}
          renderMobileCard={(item) => (
            <RecordCard
              title={item.action}
              subtitle={item.target}
              badge={
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    item.status === "SUCCES" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {item.status}
                </span>
              }
              details={[
                { label: "Date", value: item.timestamp },
                { label: "Auteur", value: item.actor },
                { label: "IP", value: item.ipAddress },
              ]}
            />
          )}
        />
      ) : (
        <DataTable
          data={filteredSensitive}
          columns={sensitiveColumns}
          keyExtractor={(item) => item.id}
          renderMobileCard={(item) => (
            <RecordCard
              title={`${item.studentName} — ${item.details || item.action}`}
              subtitle={`Opérateur : ${item.authorName} (${item.authorRole})`}
              badge={getDataTypeBadge(item.dataType)}
              details={[
                {
                  label: "Date",
                  value: new Date(item.timestamp).toLocaleString("fr-FR"),
                },
                { label: "Action", value: item.action },
              ]}
            />
          )}
        />
      )}
    </div>
  );
}
