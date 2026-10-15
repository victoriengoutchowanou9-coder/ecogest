"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Receipt,
  Eye,
  Printer,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Calendar,
  Wallet,
  Filter,
  Plus,
  Download,
  Search,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ReceiptView } from "@/components/school/ReceiptView";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatFCFA, formatDate, formatDateTime } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { useFinanceStore } from "@/lib/finance-store";
import { CashReceiptRecord } from "@/lib/mock-finance-db";

export default function ComptabiliteRecusPage() {
  const { toast } = useToast();
  const { receipts } = useFinanceStore();

  // Filters
  const [selectedYear, setSelectedYear] = useState<string>("2026-2027");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("ALL");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  const [selectedReceipt, setSelectedReceipt] = useState<CashReceiptRecord | null>(null);
  const [receiptToCancel, setReceiptToCancel] = useState<CashReceiptRecord | null>(null);

  // Distinct classes list
  const classesList = useMemo(() => {
    const set = new Set<string>();
    receipts.forEach((r) => set.add(r.className));
    return Array.from(set);
  }, [receipts]);

  // Filtered receipts: permanent history for the selected academic year
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const matchYear = r.academicYearId === selectedYear;
      const matchClass = selectedClass === "ALL" || r.className === selectedClass;
      const q = search.toLowerCase().trim();
      const matchSearch =
        q === "" ||
        r.receiptNumber.toLowerCase().includes(q) ||
        r.studentName.toLowerCase().includes(q) ||
        r.matricule.toLowerCase().includes(q) ||
        r.transactionRef.toLowerCase().includes(q);

      return matchYear && matchClass && matchSearch;
    });
  }, [receipts, selectedYear, selectedClass, search]);

  const totalAmountFiltered = useMemo(() => {
    return filteredReceipts
      .filter((r) => r.status === "VALIDATED")
      .reduce((acc, r) => acc + r.amount, 0);
  }, [filteredReceipts]);

  const handleCancelReceipt = () => {
    if (!receiptToCancel) return;
    toast(`Fonction d'annulation soumise à visa du Censeur et de la Direction.`, "info");
    setReceiptToCancel(null);
  };

  const columns: Column<CashReceiptRecord>[] = [
    {
      key: "receiptNumber",
      header: "N° Reçu & Date/Heure",
      render: (item) => (
        <div>
          <span className="font-mono font-bold text-slate-900 text-xs block">
            {item.receiptNumber}
          </span>
          <span className="text-[11px] text-slate-500">{formatDateTime(item.date)}</span>
        </div>
      ),
    },
    {
      key: "student",
      header: "Élève & Classe",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 text-xs block">{item.studentName}</span>
          <span className="text-[11px] text-slate-500 font-mono">
            {item.className} &bull; {item.matricule}
          </span>
        </div>
      ),
    },
    {
      key: "purpose",
      header: "Objet",
      render: (item) => (
        <div>
          <span className="text-xs font-semibold text-slate-800 block">{item.purpose}</span>
          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <Wallet className="w-3 h-3 inline" /> Espèce
          </span>
        </div>
      ),
    },
    {
      key: "previousPaidAmount",
      header: "Déjà payé avant",
      render: (item) => (
        <span className="text-xs font-mono text-slate-500 tabular-nums">
          {formatFCFA(item.previousPaidAmount)}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Montant Encaissé",
      render: (item) => (
        <span className="font-black text-sm text-school-primary tabular-nums">
          {formatFCFA(item.amount)}
        </span>
      ),
    },
    {
      key: "remainingAfterPayment",
      header: "Solde Restant",
      render: (item) => (
        <span className="text-xs font-bold tabular-nums">
          {item.remainingAfterPayment === 0 ? (
            <span className="text-emerald-700">0 FCFA (Soldé)</span>
          ) : (
            <span className="text-rose-600">{formatFCFA(item.remainingAfterPayment)}</span>
          )}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (item) => (
        <StatusBadge
          status={item.status}
          label={item.status === "VALIDATED" ? "Validé" : "Annulé"}
          size="sm"
        />
      ),
    },
    {
      key: "actions",
      header: "Action",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedReceipt(item)}
            className="p-1.5 text-slate-600 hover:text-school-primary rounded-lg hover:bg-slate-100 touch-target"
            title="Consulter & Imprimer"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Historique & Journal des Reçus de Caisse"
        subtitle="Historique permanent des encaissements en espèces. Les règlements d'élèves soldés restent toujours enregistrés"
        breadcrumbs={[{ label: "Comptabilité", href: "/comptabilite" }, { label: "Reçus" }]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/comptabilite/paiement"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target"
            >
              <Plus className="w-4 h-4" />
              <span>Encaisser un paiement</span>
            </Link>
          </div>
        }
      />

      {/* Filters Bar: Année, Période, Classe, Recherche */}
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
              Période
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent"
            >
              <option value="ALL">Toute la période</option>
              <option value="T1">1er Trimestre (T1)</option>
              <option value="T2">2ème Trimestre (T2)</option>
              <option value="T3">3ème Trimestre (T3)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Filtrer par classe
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent"
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
              Rechercher un reçu / élève
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="N° reçu, nom ou matricule..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs md:text-sm text-slate-800 focus:border-school-accent"
              />
            </div>
          </div>
        </div>

        {/* Total info banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{filteredReceipts.length} reçu(s) permanent(s)</span>
            <span>&bull;</span>
            <span>Total encaissé sur la sélection : <strong className="text-emerald-700 font-bold">{formatFCFA(totalAmountFiltered)}</strong></span>
          </div>
          <span className="text-[11px] text-slate-400">
            Moyen de règlement : <strong>Espèce exclusif</strong>
          </span>
        </div>
      </div>

      {/* Receipts Table */}
      <DataTable
        columns={columns}
        data={filteredReceipts}
        keyExtractor={(item) => item.id}
        emptyMessage="Aucun reçu trouvé pour les critères sélectionnés."
      />

      {/* Receipt Modal Preview & Print */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 my-8 shadow-2xl">
            <ReceiptView
              receipt={selectedReceipt}
              onClose={() => setSelectedReceipt(null)}
            />
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!receiptToCancel}
        title="Annulation contrôlée de reçu de caisse"
        description={`Êtes-vous sûr de vouloir annuler le reçu n° ${receiptToCancel?.receiptNumber} émis au nom de ${receiptToCancel?.studentName} ? Cette opération nécessite un visa de contrôle.`}
        confirmLabel="Confirmer l'annulation"
        cancelLabel="Garder le reçu"
        isDestructive
        onConfirm={handleCancelReceipt}
        onCancel={() => setReceiptToCancel(null)}
      />
    </div>
  );
}
