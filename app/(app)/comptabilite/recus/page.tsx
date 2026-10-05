"use client";

import React, { useState } from "react";
import { Receipt, Eye, Printer, AlertTriangle, Ban, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordCard } from "@/components/ui/RecordCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ReceiptView } from "@/components/school/ReceiptView";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatFCFA, formatDate } from "@/lib/utils";
import { MOCK_RECEIPTS, PaymentReceipt } from "@/lib/mock-data";
import { useToast } from "@/components/ui/Toast";

export default function ComptabiliteRecusPage() {
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<PaymentReceipt[]>(MOCK_RECEIPTS);
  const [search, setSearch] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [receiptToCancel, setReceiptToCancel] = useState<PaymentReceipt | null>(null);

  const filtered = receipts.filter(
    (r) =>
      r.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.matricule.toLowerCase().includes(search.toLowerCase()) ||
      r.transactionRef.toLowerCase().includes(search.toLowerCase())
  );

  const handleCancelReceipt = () => {
    if (!receiptToCancel) return;
    setReceipts((prev) =>
      prev.map((r) =>
        r.id === receiptToCancel.id ? { ...r, status: "CANCELLED" as const } : r
      )
    );
    toast(`Le reçu ${receiptToCancel.receiptNumber} a été annulé avec succès.`, "info");
    setReceiptToCancel(null);
  };

  const columns: Column<PaymentReceipt>[] = [
    {
      key: "receiptNumber",
      header: "N° Reçu & Date",
      render: (item) => (
        <div>
          <span className="font-mono font-bold text-slate-900">{item.receiptNumber}</span>
          <span className="block text-xs text-slate-500">{formatDate(item.date)}</span>
        </div>
      ),
    },
    {
      key: "student",
      header: "Élève & Classe",
      render: (item) => (
        <div>
          <span className="font-semibold text-slate-800">{item.studentName}</span>
          <span className="block text-xs text-slate-500">
            {item.className} &middot; {item.matricule}
          </span>
        </div>
      ),
    },
    {
      key: "purpose",
      header: "Objet",
      render: (item) => <span className="text-xs text-slate-700">{item.purpose}</span>,
    },
    {
      key: "amount",
      header: "Montant",
      render: (item) => (
        <span className="font-bold text-sm text-school-primary tabular-nums">
          {formatFCFA(item.amount)}
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
      header: "Actions",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedReceipt(item)}
            className="p-1.5 text-slate-600 hover:text-school-primary rounded-lg hover:bg-slate-100 touch-target"
            title="Aperçu & Imprimer"
          >
            <Eye className="w-4 h-4" />
          </button>
          {item.status === "VALIDATED" && (
            <button
              type="button"
              onClick={() => setReceiptToCancel(item)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 touch-target"
              title="Annulation contrôlée"
            >
              <Ban className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal des Reçus &amp; Pièces Comptables"
        subtitle="Consultation, impression officielle et annulation contrôlée des quittances émises"
        breadcrumbs={[{ label: "Comptabilité", href: "/comptabilite" }, { label: "Reçus" }]}
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par numéro de reçu, élève ou référence de transaction..."
        onReset={() => setSearch("")}
      />

      {/* Receipt Modal Preview */}
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

      {/* Responsive DataTable converting to RecordCard under 768px */}
      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item.id}
        renderMobileCard={(item) => (
          <RecordCard
            title={item.studentName}
            subtitle={`${item.receiptNumber} &middot; ${formatDate(item.date)}`}
            badge={
              <StatusBadge
                status={item.status}
                label={item.status === "VALIDATED" ? "Validé" : "Annulé"}
                size="sm"
              />
            }
            details={[
              { label: "Montant", value: formatFCFA(item.amount) },
              { label: "Objet", value: item.purpose },
              { label: "Moyen", value: item.paymentMethod.replace("_", " ") },
              { label: "Classe", value: item.className },
            ]}
            actions={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(item)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-school-primary text-white hover:bg-school-700 touch-target"
                >
                  Voir / Imprimer
                </button>
                {item.status === "VALIDATED" && (
                  <button
                    type="button"
                    onClick={() => setReceiptToCancel(item)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 touch-target"
                  >
                    Annuler
                  </button>
                )}
              </div>
            }
          />
        )}
      />

      {/* Controlled Cancellation Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(receiptToCancel)}
        title="Confirmer l'annulation du reçu ?"
        description={`Le reçu ${receiptToCancel?.receiptNumber} d'un montant de ${formatFCFA(
          receiptToCancel?.amount
        )} sera définitivement invalidé dans les écritures comptables et réimputé comme solde débiteur sur l'élève.`}
        confirmLabel="Oui, annuler ce reçu"
        cancelLabel="Ne pas annuler"
        isDestructive={true}
        onConfirm={handleCancelReceipt}
        onCancel={() => setReceiptToCancel(null)}
      />
    </div>
  );
}
