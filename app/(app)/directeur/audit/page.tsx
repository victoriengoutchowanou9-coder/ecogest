"use client";

import React, { useState } from "react";
import { ShieldAlert, User, Clock, Terminal } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordCard } from "@/components/ui/RecordCard";
import { FilterBar } from "@/components/ui/FilterBar";

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

export default function AuditJournalPage() {
  const [search, setSearch] = useState("");

  const filtered = AUDIT_DATA.filter(
    (item) =>
      item.actor.toLowerCase().includes(search.toLowerCase()) ||
      item.action.toLowerCase().includes(search.toLowerCase()) ||
      item.target.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<AuditEntry>[] = [
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal d'Audit &amp; Sécurité"
        subtitle="Historique immuable de toutes les opérations sensibles et connexions au système"
        breadcrumbs={[{ label: "Directeur", href: "/directeur" }, { label: "Journal d'audit" }]}
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filtrer les actions, utilisateurs..."
        onReset={() => setSearch("")}
      />

      <DataTable
        data={filtered}
        columns={columns}
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
    </div>
  );
}
