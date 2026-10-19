"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Users2,
  Clock,
  Filter,
  Search,
  Receipt,
  Download,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatFCFA, formatDate, formatDateTime } from "@/lib/utils";
import { useFinanceStore } from "@/lib/finance-store";
import { StudentTuitionRecord } from "@/lib/mock-finance-db";

export default function ComptabiliteElevesPage() {
  const { students } = useFinanceStore();

  const [selectedYear, setSelectedYear] = useState<string>("2026-2027");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  // Unique classes list
  const classesList = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => set.add(s.className));
    return Array.from(set);
  }, [students]);

  // Students belonging to the selected year & class
  const classStudents = useMemo(() => {
    return students.filter(
      (s) => s.academicYearId === selectedYear && (selectedClass === "ALL" || s.className === selectedClass)
    );
  }, [students, selectedYear, selectedClass]);

  // Class aggregates
  const classStats = useMemo(() => {
    const totalStudents = classStudents.length;
    const totalExpected = classStudents.reduce((acc, s) => acc + s.totalTuition, 0);
    const totalCollected = classStudents.reduce((acc, s) => acc + s.paidTuition, 0);
    const totalRemaining = totalExpected - totalCollected;

    const paidCount = classStudents.filter((s) => s.tuitionStatus === "PAID").length;
    const partialCount = classStudents.filter((s) => s.tuitionStatus === "PARTIAL").length;
    const lateCount = classStudents.filter((s) => s.tuitionStatus === "LATE").length;
    const unpaidCount = classStudents.filter((s) => s.tuitionStatus === "UNPAID").length;

    return {
      totalStudents,
      totalExpected,
      totalCollected,
      totalRemaining,
      paidCount,
      partialCount,
      lateCount,
      unpaidCount,
    };
  }, [classStudents]);

  // Filtered detailed list (including search & status, WITHOUT deleting paid students)
  const filteredList = useMemo(() => {
    return classStudents.filter((s) => {
      const matchStatus = statusFilter === "ALL" || s.tuitionStatus === statusFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        q === "" ||
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.matricule.toLowerCase().includes(q);

      return matchStatus && matchSearch;
    });
  }, [classStudents, statusFilter, search]);

  const columns: Column<StudentTuitionRecord>[] = [
    {
      key: "student",
      header: "Nom & Prénom / Matricule",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs md:text-sm">
            {item.firstName} {item.lastName}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {item.matricule} &bull; {item.gender === "M" ? "Garçon" : "Fille"}
          </span>
        </div>
      ),
    },
    {
      key: "className",
      header: "Classe",
      render: (item) => (
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {item.className}
        </span>
      ),
    },
    {
      key: "totalTuition",
      header: "Frais Attendus",
      render: (item) => (
        <span className="text-xs font-mono text-slate-700 tabular-nums">
          {formatFCFA(item.totalTuition)}
        </span>
      ),
    },
    {
      key: "paidTuition",
      header: "Montant Payé",
      render: (item) => (
        <span className="text-xs font-bold text-emerald-700 tabular-nums">
          {formatFCFA(item.paidTuition)}
        </span>
      ),
    },
    {
      key: "remainingTuition",
      header: "Solde Restant",
      render: (item) => (
        <span className="text-xs font-bold tabular-nums">
          {item.remainingTuition === 0 ? (
            <span className="text-emerald-700 font-semibold">0 FCFA</span>
          ) : (
            <span className="text-rose-600">{formatFCFA(item.remainingTuition)}</span>
          )}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (item) => <StatusBadge status={item.tuitionStatus} size="sm" />,
    },
    {
      key: "lastPayment",
      header: "Dernier Règlement",
      render: (item) => (
        <div>
          {item.lastPaymentDate ? (
            <>
              <span className="text-xs font-semibold text-slate-800 block">
                {formatDate(item.lastPaymentDate)}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {item.lastReceiptNumber || "-"}
              </span>
            </>
          ) : (
            <span className="text-xs text-slate-400 italic">Aucun versement</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Action",
      className: "text-right",
      render: (item) => (
        <Link
          href={`/comptabilite/paiement?studentId=${item.studentId}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-school-primary text-white text-xs font-semibold hover:bg-school-700 touch-target shadow-xs"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Encaisser</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Suivi des Frais de Scolarité par Classe"
        subtitle="État des recouvrements, suivi individuel des soldes et relances d'échéances sans suppression des élèves ayant soldé"
        breadcrumbs={[{ label: "Comptabilité", href: "/comptabilite" }, { label: "Suivi des élèves" }]}
        actions={
          <Link
            href="/comptabilite/paiement"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Encaisser un paiement</span>
          </Link>
        }
      />

      {/* Class & Year Selectors Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Année scolaire
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent"
            >
              <option value="2026-2027">2026 - 2027 (En cours)</option>
              <option value="2025-2026">2025 - 2026 (Archivée)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Sélectionner la classe
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent"
            >
              <option value="ALL">Toutes les classes</option>
              {classesList.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Statut financier
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="PAID">Payé (Soldé)</option>
              <option value="PARTIAL">Partiellement payé</option>
              <option value="LATE">En retard</option>
              <option value="UNPAID">Impayé</option>
            </select>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Rechercher un élève
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom ou matricule..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs md:text-sm text-slate-800 focus:border-school-accent"
            />
          </div>
        </div>
      </div>

      {/* Class Statistics Grid (Required 8 aggregates) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Total Élèves
          </span>
          <span className="text-base font-black text-slate-900">{classStats.totalStudents}</span>
          <span className="text-[10px] text-slate-500 block">inscrits</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Frais Attendus
          </span>
          <span className="text-sm font-black text-slate-900 tabular-nums">
            {formatFCFA(classStats.totalExpected)}
          </span>
          <span className="text-[10px] text-slate-500 block">budget classe</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Total Encaissé
          </span>
          <span className="text-sm font-black text-emerald-700 tabular-nums">
            {formatFCFA(classStats.totalCollected)}
          </span>
          <span className="text-[10px] text-slate-500 block">en espèces</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Reste à Recouvrer
          </span>
          <span className="text-sm font-black text-rose-600 tabular-nums">
            {formatFCFA(classStats.totalRemaining)}
          </span>
          <span className="text-[10px] text-slate-500 block">solde restant</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Payé Intégral
          </span>
          <span className="text-base font-black text-emerald-700">{classStats.paidCount}</span>
          <span className="text-[10px] text-emerald-600 font-semibold block">élèves soldés</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Partiellement
          </span>
          <span className="text-base font-black text-amber-700">{classStats.partialCount}</span>
          <span className="text-[10px] text-amber-600 font-semibold block">avances reçues</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            En Retard
          </span>
          <span className="text-base font-black text-rose-600">{classStats.lateCount}</span>
          <span className="text-[10px] text-rose-600 font-semibold block">échéance échue</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Impayés
          </span>
          <span className="text-base font-black text-rose-700">{classStats.unpaidCount}</span>
          <span className="text-[10px] text-rose-700 font-semibold block">aucun versement</span>
        </div>
      </div>

      {/* Detailed Student List Table */}
      <DataTable
        columns={columns}
        data={filteredList}
        keyExtractor={(item) => item.id}
        emptyMessage="Aucun élève trouvé pour cette classe et ces critères."
      />
    </div>
  );
}
