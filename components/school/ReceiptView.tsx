"use client";

import React from "react";
import { Printer, Download, CheckCircle2, ShieldCheck, Wallet, ArrowLeft } from "lucide-react";
import { formatFCFA, formatDateTime } from "@/lib/utils";
import { CURRENT_SCHOOL } from "@/lib/permissions";
import { CashReceiptRecord } from "@/lib/mock-finance-db";
import { PaymentReceipt } from "@/lib/mock-data";

export interface GenericReceipt {
  id: string;
  receiptNumber: string;
  date: string;
  studentId?: string;
  studentName: string;
  matricule: string;
  classId?: string;
  className: string;
  academicYearId?: string;
  academicYear?: string;
  amount: number;
  previousPaidAmount?: number;
  remainingAfterPayment?: number;
  paymentMethod?: string;
  purpose: string;
  receivedBy: string;
  status?: string;
  transactionRef: string;
  notes?: string;
}

interface ReceiptViewProps {
  receipt: CashReceiptRecord | PaymentReceipt | GenericReceipt;
  onClose?: () => void;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({ receipt, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const academicYear =
    ("academicYearId" in receipt ? receipt.academicYearId : (receipt as any).academicYear) ||
    "2026-2027";
  const previousPaid =
    "previousPaidAmount" in receipt && receipt.previousPaidAmount !== undefined
      ? receipt.previousPaidAmount
      : 0;
  const remainingAfter =
    "remainingAfterPayment" in receipt && receipt.remainingAfterPayment !== undefined
      ? receipt.remainingAfterPayment
      : 0;
  const paymentMethodLabel = receipt.paymentMethod === "ESPECES" ? "Espèce" : receipt.paymentMethod || "Espèce";

  return (
    <div className="space-y-4">
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">Quittance Officielle de Caisse</h2>
          <p className="text-xs text-slate-500">Document comptable officiel imprimable</p>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl touch-target"
            >
              Fermer
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-school-primary text-white text-xs font-semibold rounded-xl hover:bg-school-700 shadow-sm touch-target"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer le reçu</span>
          </button>
        </div>
      </div>

      {/* Printable Receipt Container */}
      <div className="receipt-container bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm text-slate-900 space-y-6">
        {/* Header: School Info + Receipt Meta */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-school-primary text-white font-black flex items-center justify-center text-sm shadow-sm">
                E
              </div>
              <h1 className="text-lg font-black text-school-primary uppercase tracking-wide">
                {CURRENT_SCHOOL.name}
              </h1>
            </div>
            <p className="text-xs text-slate-500 italic mt-0.5">{CURRENT_SCHOOL.devise}</p>
            <p className="text-xs text-slate-600 mt-1">
              {CURRENT_SCHOOL.address} &bull; Tél : {CURRENT_SCHOOL.phone}
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-lg bg-slate-100 text-slate-900 text-xs font-mono font-bold border border-slate-200">
              {receipt.receiptNumber}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Date & heure : <strong className="text-slate-800">{formatDateTime(receipt.date)}</strong>
            </p>
            <p className="text-xs font-semibold text-school-primary mt-0.5">
              Année scolaire : {academicYear}
            </p>
          </div>
        </div>

        {/* Student & Payment Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] block">
              Élève / Débiteur
            </span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {receipt.studentName}
            </p>
            <p className="text-slate-600 font-mono mt-0.5">
              Matricule : {receipt.matricule}
            </p>
            <p className="text-slate-600 font-semibold mt-0.5">
              Classe : {receipt.className}
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-slate-400 uppercase font-bold text-[10px] block">
              Modalité de règlement
            </span>
            <p className="text-sm font-bold text-emerald-700 mt-0.5 flex sm:justify-end items-center gap-1">
              <Wallet className="w-3.5 h-3.5 inline" />
              <span>{paymentMethodLabel} (Caisse de l&apos;établissement)</span>
            </p>
            <p className="text-slate-600 font-mono mt-0.5">
              Réf. Caisse : {receipt.transactionRef}
            </p>
            <p className="text-slate-600 mt-0.5">
              Encaissé par : <strong className="text-slate-800">{receipt.receivedBy}</strong>
            </p>
          </div>
        </div>

        {/* Financial Breakdown Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold">
              <tr>
                <th className="px-4 py-2.5">Objet du Versement</th>
                <th className="px-4 py-2.5 text-center">Déjà Payé avant</th>
                <th className="px-4 py-2.5 text-right font-black text-emerald-800">Montant Encaissé</th>
                <th className="px-4 py-2.5 text-right">Nouveau Solde Restant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900">
                  {receipt.purpose}
                </td>
                <td className="px-4 py-3 text-center tabular-nums text-slate-600 font-mono">
                  {formatFCFA(previousPaid)}
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums text-emerald-700 text-sm">
                  {formatFCFA(receipt.amount)}
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums text-slate-800">
                  {formatFCFA(remainingAfter)}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200">
              <tr>
                <th colSpan={2} className="px-4 py-3 text-right text-xs font-bold text-slate-700">
                  TOTAL REÇU EN ESPÈCES :
                </th>
                <th className="px-4 py-3 text-right text-base font-black text-school-primary tabular-nums">
                  {formatFCFA(receipt.amount)}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                  {remainingAfter === 0 ? (
                    <span className="text-emerald-700 font-bold">SCOLARITÉ SOLDÉE</span>
                  ) : (
                    <span>Reste : {formatFCFA(remainingAfter)}</span>
                  )}
                </th>
              </tr>
            </tfoot>
          </table>
        </div>

        {"notes" in receipt && (receipt as any).notes && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
            <strong>Observations :</strong> {(receipt as any).notes}
          </div>
        )}

        {/* Footer with Seal & Signature Area */}
        <div className="pt-6 grid grid-cols-2 items-end border-t border-slate-200 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Paiement certifié & enregistré en caisse</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Document officiel généré par le module Comptabilité & Finances ECOGEST.
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs font-bold text-slate-800">Le Caissier / Comptable</p>
            <p className="text-[11px] text-slate-500">{receipt.receivedBy}</p>
            <div className="h-16 mt-2 flex items-center justify-end">
              <div className="border-2 border-dashed border-slate-300 rounded-xl px-4 py-2 text-[10px] text-slate-500 uppercase font-black text-center">
                Visa & Cachet Caisse
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
