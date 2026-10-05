"use client";

import React, { useState } from "react";
import { Plus, Users, Shield, Mail, Phone, CheckCircle2, UserX } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordCard } from "@/components/ui/RecordCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";

interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Directeur" | "Censeur" | "Enseignant" | "Comptable" | "Parent";
  status: "ACTIF" | "SUSPENDU";
  lastLogin: string;
}

const INITIAL_USERS: UserAccount[] = [
  { id: "u-01", name: "Père Gilbert KPATINVOH", email: "directeur@ccpa-cotonou.bj", phone: "+229 97 00 00 01", role: "Directeur", status: "ACTIF", lastLogin: "Aujourd'hui 07:45" },
  { id: "u-02", name: "M. Marcellin DOKPO", email: "censeur@ccpa-cotonou.bj", phone: "+229 97 00 00 02", role: "Censeur", status: "ACTIF", lastLogin: "Aujourd'hui 08:10" },
  { id: "u-03", name: "Prof. Justin HOUNKPONOU", email: "prof.hounkponou@ccpa-cotonou.bj", phone: "+229 96 11 22 33", role: "Enseignant", status: "ACTIF", lastLogin: "Hier 16:30" },
  { id: "u-04", name: "M. Clément KPONOU", email: "comptable@ccpa-cotonou.bj", phone: "+229 97 55 44 33", role: "Comptable", status: "ACTIF", lastLogin: "Aujourd'hui 09:00" },
  { id: "u-05", name: "M. Marc ADANHOUN", email: "parent.adanhouan@gmail.com", phone: "+229 97 12 34 56", role: "Parent", status: "ACTIF", lastLogin: "24/09/2026" },
];

export default function UtilisateursPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns: Column<UserAccount>[] = [
    {
      key: "name",
      header: "Nom & Prénom",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900">{item.name}</span>
          <span className="block text-xs text-slate-500">{item.email}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rôle",
      render: (item) => (
        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold">
          {item.role}
        </span>
      ),
    },
    {
      key: "phone",
      header: "Téléphone",
      render: (item) => <span className="text-slate-700 text-xs font-mono">{item.phone}</span>,
    },
    {
      key: "status",
      header: "Statut",
      render: (item) => (
        <StatusBadge
          status={item.status === "ACTIF" ? "VALIDATED" : "LOCKED"}
          label={item.status === "ACTIF" ? "Actif" : "Suspendu"}
          size="sm"
        />
      ),
    },
    {
      key: "lastLogin",
      header: "Dernière connexion",
      render: (item) => <span className="text-slate-500 text-xs">{item.lastLogin}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Comptes &amp; Rôles"
        subtitle="Contrôle des accès, attributions des privilèges et journal des connexions"
        breadcrumbs={[{ label: "Directeur", href: "/directeur" }, { label: "Utilisateurs" }]}
        actions={
          <button
            onClick={() => toast("Invitation d'un nouvel utilisateur ouverte", "info")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un compte</span>
          </button>
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par nom, email..."
        filters={[
          {
            key: "role",
            label: "Rôle",
            value: roleFilter,
            onChange: setRoleFilter,
            options: [
              { value: "ALL", label: "Tous les rôles" },
              { value: "Directeur", label: "Directeur" },
              { value: "Censeur", label: "Censeur" },
              { value: "Enseignant", label: "Enseignant" },
              { value: "Comptable", label: "Comptable" },
              { value: "Parent", label: "Parent" },
            ],
          },
        ]}
        onReset={() => {
          setSearch("");
          setRoleFilter("ALL");
        }}
      />

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item.id}
        renderMobileCard={(item) => (
          <RecordCard
            title={item.name}
            subtitle={item.email}
            badge={<span className="text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded">{item.role}</span>}
            details={[
              { label: "Téléphone", value: item.phone },
              { label: "Statut", value: item.status },
              { label: "Connexion", value: item.lastLogin },
            ]}
          />
        )}
      />
    </div>
  );
}
