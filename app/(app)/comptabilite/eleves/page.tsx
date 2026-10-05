"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordCard } from "@/components/ui/RecordCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatFCFA } from "@/lib/utils";
import { MOCK_STUDENTS, Student } from "@/lib/mock-data";

export default function ComptabiliteElevesPage() {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName.toLowerCase().includes(search.toLowerCase()) ||
      s.matricule.toLowerCase().includes(search.toLowerCase());
    const matchesClass = classFilter === "ALL" || s.className === classFilter;
    const matchesStatus = statusFilter === "ALL" || s.tuitionStatus === statusFilter;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const columns: Column<Student>[] = [
    {
      key: "student",
      header: "Élève & Matricule",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900">
            {item.firstName} {item.lastName}
          </span>
          <span className="block text-xs font-mono text-slate-400">{item.matricule}</span>
        </div>
      ),
    },
    {
      key: "className",
      header: "Classe",
      render: (item) => <span className="text-xs font-semibold text-slate-700">{item.className}</span>,
    },
    {
      key: "totalTuition",
      header: "Scolarité Totale",
      render: (item) => (
        <span className="text-xs font-mono text-slate-700 tabular-nums">
          {formatFCFA(item.totalTuition)}
        </span>
      ),
    },
    {
      key: "paidTuition",
      header: "Encaissé",
      render: (item) => (
        <span className="text-xs font-bold text-emerald-700 tabular-nums">
          {formatFCFA(item.paidTuition)}
        </span>
      ),
    },
    {
      key: "remainingTuition",
      header: "Reste à payer",
      render: (item) => (
        <span className="text-xs font-bold text-rose-700 tabular-nums">
          {formatFCFA(item.remainingTuition)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (item) => <StatusBadge status={item.tuitionStatus} size="sm" />,
    },
    {
      key: "actions",
      header: "Action",
      className: "text-right",
      render: (item) => (
        <Link
          href={`/comptabilite/paiement?studentId=${item.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-school-primary text-white text-xs font-semibold hover:bg-school-700 touch-target"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Encaisser</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fichier des Élèves &amp; Frais de Scolarité"
        subtitle="Suivi individuel des soldes, relances d'échéances et encaissements"
        breadcrumbs={[{ label: "Comptabilité", href: "/comptabilite" }, { label: "Suivi des élèves" }]}
        actions={
          <Link
            href="/comptabilite/paiement"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Encaisser un paiement</span>
          </Link>
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par nom, prénom ou matricule..."
        filters={[
          {
            key: "class",
            label: "Classe",
            value: classFilter,
            onChange: setClassFilter,
            options: [
              { value: "ALL", label: "Toutes les classes" },
              { value: "6ème B", label: "6ème B" },
              { value: "3ème A", label: "3ème A" },
              { value: "1ère D", label: "1ère D" },
              { value: "Terminale C", label: "Terminale C" },
            ],
          },
          {
            key: "status",
            label: "Statut",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "ALL", label: "Tous les statuts" },
              { value: "PAID", label: "Payé" },
              { value: "PARTIAL", label: "Partiel" },
              { value: "UNPAID", label: "Impayé" },
              { value: "LATE", label: "En retard" },
            ],
          },
        ]}
        onReset={() => {
          setSearch("");
          setClassFilter("ALL");
          setStatusFilter("ALL");
        }}
      />

      {/* Responsive DataTable: converts to mobile RecordCard under 768px */}
      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item.id}
        renderMobileCard={(item) => (
          <RecordCard
            title={`${item.firstName} ${item.lastName}`}
            subtitle={`${item.className} &middot; ${item.matricule}`}
            badge={<StatusBadge status={item.tuitionStatus} size="sm" />}
            details={[
              { label: "Scolarité", value: formatFCFA(item.totalTuition) },
              { label: "Payé", value: formatFCFA(item.paidTuition) },
              { label: "Reste", value: formatFCFA(item.remainingTuition) },
              { label: "Parent", value: item.parentName },
            ]}
            actions={
              <Link
                href={`/comptabilite/paiement?studentId=${item.id}`}
                className="w-full text-center px-4 py-2.5 bg-school-primary text-white text-xs font-semibold rounded-lg hover:bg-school-700 touch-target"
              >
                Encaisser un paiement
              </Link>
            }
          />
        )}
      />
    </div>
  );
}
