"use client";

import React, { useState } from "react";
import { CreditCard, Download, Receipt, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChildSwitcher } from "@/components/school/ChildSwitcher";
import { PaymentStepper } from "@/components/school/PaymentStepper";
import { ReceiptView } from "@/components/school/ReceiptView";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatFCFA, formatDate } from "@/lib/utils";
import { MOCK_STUDENTS, MOCK_RECEIPTS, Student, PaymentReceipt } from "@/lib/mock-data";

export default function ParentScolaritePage() {
  const myChildren = [MOCK_STUDENTS[0], MOCK_STUDENTS[1]];
  const [selectedChild, setSelectedChild] = useState<Student>(myChildren[0]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<PaymentReceipt | null>(null);

  const childReceipts = MOCK_RECEIPTS.filter(
    (r) => r.studentId === selectedChild.id
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scolarité &amp; Règlements en Ligne"
        subtitle={`État financier et quittances de paiement pour ${selectedChild.firstName}`}
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Scolarité" }]}
        actions={
          selectedChild.remainingTuition > 0 ? (
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target"
            >
              <CreditCard className="w-4 h-4" />
              <span>Régler la scolarité</span>
            </button>
          ) : undefined
        }
      />

      <ChildSwitcher
        childrenList={myChildren}
        selectedChildId={selectedChild.id}
        onSelectChild={setSelectedChild}
      />

      {/* Account Balance Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Année Académique 2026-2027
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Situation financière de {selectedChild.firstName} ({selectedChild.className})
            </h3>
          </div>
          <StatusBadge status={selectedChild.tuitionStatus} size="md" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 uppercase font-semibold block">Total Annuel</span>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {formatFCFA(selectedChild.totalTuition)}
            </span>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-xs text-emerald-800 uppercase font-semibold block">Montant Réglé</span>
            <span className="text-xl font-bold text-emerald-700 tabular-nums">
              {formatFCFA(selectedChild.paidTuition)}
            </span>
          </div>

          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
            <span className="text-xs text-rose-800 uppercase font-semibold block">Reste à payer</span>
            <span className="text-xl font-bold text-rose-700 tabular-nums">
              {formatFCFA(selectedChild.remainingTuition)}
            </span>
          </div>
        </div>

        {selectedChild.remainingTuition > 0 && !showPaymentModal && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-school-primary text-white font-semibold text-sm hover:bg-school-700 shadow-sm transition-colors touch-target min-h-[44px]"
            >
              <CreditCard className="w-4 h-4" />
              <span>Effectuer un paiement en ligne (Mobile Money)</span>
            </button>
          </div>
        )}
      </div>

      {/* Online Payment Stepper Section */}
      {showPaymentModal && (
        <div className="border-2 border-school-primary/30 rounded-2xl p-2 bg-slate-50/50">
          <PaymentStepper
            student={selectedChild}
            onCancel={() => setShowPaymentModal(false)}
          />
        </div>
      )}

      {/* Receipts History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Historique des Quittances &amp; Reçus
            </h3>
            <p className="text-xs text-slate-500">
              Téléchargez et conservez vos reçus officiels émis par la comptabilité
            </p>
          </div>
          <Receipt className="w-5 h-5 text-slate-400" />
        </div>

        {childReceipts.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            Aucun reçu disponible pour cet élève actuellement.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {childReceipts.map((rec) => (
              <div
                key={rec.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {rec.receiptNumber}
                    </span>
                    <StatusBadge status={rec.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {rec.purpose} &middot; Réf : <span className="font-mono">{rec.transactionRef}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Date : {formatDate(rec.date)} &middot; Moyen : {rec.paymentMethod.replace("_", " ")}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className="font-bold text-base text-school-primary tabular-nums">
                    {formatFCFA(rec.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewingReceipt(rec)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 touch-target"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Reçu</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for viewing and printing receipt */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 my-8 shadow-2xl">
            <ReceiptView
              receipt={viewingReceipt}
              onClose={() => setViewingReceipt(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
