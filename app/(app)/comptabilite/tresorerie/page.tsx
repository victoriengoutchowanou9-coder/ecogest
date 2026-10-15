"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Printer,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Receipt,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatCard } from "@/components/ui/StatCard";
import { formatFCFA, formatDate, formatDateTime } from "@/lib/utils";
import { useFinanceStore } from "@/lib/finance-store";
import { TreasuryEntry } from "@/lib/mock-finance-db";
import { cn } from "@/lib/utils";

export default function ComptabiliteTresoreriePage() {
  const { getTreasuryLedger, receipts, expenses, payroll } = useFinanceStore();

  const [selectedYear, setSelectedYear] = useState<string>("2026-2027");
  const [flowFilter, setFlowFilter] = useState<"ALL" | "ENTREE" | "SORTIE">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  // Get single-ledger entries with ZERO duplicate guarantee
  const ledgerEntries = useMemo(() => {
    return getTreasuryLedger(selectedYear);
  }, [getTreasuryLedger, selectedYear, receipts, expenses, payroll]);

  // Distinct categories
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    ledgerEntries.forEach((e) => set.add(e.category));
    return Array.from(set);
  }, [ledgerEntries]);

  // Filtered ledger
  const filteredLedger = useMemo(() => {
    return ledgerEntries.filter((e) => {
      const matchFlow = flowFilter === "ALL" || e.type === flowFilter;
      const matchCat = categoryFilter === "ALL" || e.category === categoryFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        q === "" ||
        e.label.toLowerCase().includes(q) ||
        e.reference.toLowerCase().includes(q) ||
        e.author.toLowerCase().includes(q);

      return matchFlow && matchCat && matchSearch;
    });
  }, [ledgerEntries, flowFilter, categoryFilter, search]);

  // Aggregate treasury stats
  const totals = useMemo(() => {
    const totalIn = ledgerEntries
      .filter((e) => e.type === "ENTREE")
      .reduce((acc, e) => acc + e.amount, 0);

    const totalOut = ledgerEntries
      .filter((e) => e.type === "SORTIE")
      .reduce((acc, e) => acc + e.amount, 0);

    const netBalance = totalIn - totalOut;

    return {
      totalIn,
      totalOut,
      netBalance,
      entriesCount: ledgerEntries.length,
    };
  }, [ledgerEntries]);

  const handlePrint = () => {
    window.print();
  };

  const columns: Column<TreasuryEntry>[] = [
    {
      key: "date",
      header: "Date & Heure",
      render: (item) => (
        <div>
          <span className="font-semibold text-xs text-slate-800 block">
            {formatDateTime(item.date)}
          </span>
          <span className="text-[10px] font-mono text-slate-400">Réf : {item.reference}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Flux",
      render: (item) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black",
            item.type === "ENTREE"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-rose-100 text-rose-800"
          )}
        >
          {item.type === "ENTREE" ? (
            <>
              <ArrowDownLeft className="w-3.5 h-3.5" /> Entrée (Recette)
            </>
          ) : (
            <>
              <ArrowUpRight className="w-3.5 h-3.5" /> Sortie (Dépense)
            </>
          )}
        </span>
      ),
    },
    {
      key: "category",
      header: "Catégorie",
      render: (item) => (
        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {item.category}
        </span>
      ),
    },
    {
      key: "label",
      header: "Libellé de l'opération",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs md:text-sm">{item.label}</span>
          <span className="text-[11px] text-slate-500">
            Moyen : <strong>Espèce</strong> &bull; Opérateur : {item.author}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Montant FCFA",
      className: "text-right",
      render: (item) => (
        <span
          className={cn(
            "font-black text-sm tabular-nums",
            item.type === "ENTREE" ? "text-emerald-700" : "text-rose-600"
          )}
        >
          {item.type === "ENTREE" ? "+" : "-"}
          {formatFCFA(item.amount)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Livre de Trésorerie & Caisse"
        subtitle="Suivi rigoureux des flux financiers réels. Zéro double comptabilisation entre salaires, dépenses et caisse"
        breadcrumbs={[{ label: "Comptabilité", href: "/comptabilite" }, { label: "Trésorerie" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs md:text-sm shadow-sm touch-target flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Imprimer le Grand Livre</span>
            </button>
            <Link
              href="/comptabilite/paiement"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel encaissement</span>
            </Link>
          </div>
        }
      />

      {/* 3 Main Treasury Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Net Available Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400">Solde Disponible en Caisse</span>
            <Wallet className="w-5 h-5 text-school-primary" />
          </div>
          <span
            className={cn(
              "text-2xl font-black tabular-nums block",
              totals.netBalance >= 0 ? "text-emerald-700" : "text-rose-600"
            )}
          >
            {formatFCFA(totals.netBalance)}
          </span>
          <span className="text-[11px] text-slate-500 block">
            Trésorerie physique nette disponible
          </span>
        </div>

        {/* Total Cash In */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-emerald-700">Total Entrées Réelles</span>
            <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-700 tabular-nums block">
            +{formatFCFA(totals.totalIn)}
          </span>
          <span className="text-[11px] text-slate-500 block">
            Encaissements de scolarité validés en espèces
          </span>
        </div>

        {/* Total Cash Out */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-rose-700">Total Sorties Réelles</span>
            <ArrowUpRight className="w-5 h-5 text-rose-600" />
          </div>
          <span className="text-2xl font-black text-rose-600 tabular-nums block">
            -{formatFCFA(totals.totalOut)}
          </span>
          <span className="text-[11px] text-slate-500 block">
            Dépenses payées + Salaires payés (sans doublon)
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Année scolaire
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent"
            >
              <option value="2026-2027">2026 - 2027 (En cours)</option>
              <option value="2025-2026">2025 - 2026 (Archivée)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Sens du flux
            </label>
            <select
              value={flowFilter}
              onChange={(e) => setFlowFilter(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent"
            >
              <option value="ALL">Tous les flux (Entrées &amp; Sorties)</option>
              <option value="ENTREE">Entrées uniquement (Recettes)</option>
              <option value="SORTIE">Sorties uniquement (Décaissements)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Catégorie d&apos;opération
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent"
            >
              <option value="ALL">Toutes les catégories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Rechercher une opération
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Réf reçu, agent, motif..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs md:text-sm text-slate-800 focus:border-school-accent"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Règle de non-duplication :</strong> Les salaires payés apparaissent dans l&apos;historique des salaires et dans les dépenses, mais ne génèrent qu&apos;une seule sortie effective au Grand Livre.
            </span>
          </div>
          <span className="font-bold text-slate-700">{filteredLedger.length} transaction(s) constatée(s)</span>
        </div>
      </div>

      {/* Ledger Table */}
      <DataTable
        columns={columns}
        data={filteredLedger}
        keyExtractor={(item) => item.id}
        emptyMessage="Aucune transaction enregistrée dans le Grand Livre pour cette sélection."
      />
    </div>
  );
}
