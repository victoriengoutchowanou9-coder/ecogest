"use client";

import React from "react";
import { Printer, Download, CheckCircle2, ShieldCheck } from "lucide-react";
import { formatFCFA, formatDateTime } from "@/lib/utils";
import { CURRENT_SCHOOL } from "@/lib/permissions";
import { PaymentReceipt } from "@/lib/mock-data";

interface ReceiptViewProps {
  receipt: PaymentReceipt;
  onClose?: () => void;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({ receipt, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">Reçu Officiel de Caisse</h2>
          <p className="text-xs text-slate-500">Document légal conforme aux normes comptables</p>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg touch-target"
            >
              Fermer
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-school-primary text-white text-xs font-semibold rounded-lg hover:bg-school-700 shadow-sm touch-target"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      {/* Printable Receipt Container */}
      <div className="receipt-container bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm text-slate-900 space-y-6">
        {/* Header: School Info + Receipt Meta */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-school-primary text-white font-bold flex items-center justify-center text-sm">
                E
              </div>
              <h1 className="text-lg font-bold text-school-primary uppercase tracking-wide">
                {CURRENT_SCHOOL.name}
              </h1>
            </div>
            <p className="text-xs text-slate-500 italic mt-0.5">{CURRENT_SCHOOL.devise}</p>
            <p className="text-xs text-slate-600 mt-1">
              {CURRENT_SCHOOL.address} · Tél : {CURRENT_SCHOOL.phone}
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-xs font-mono font-bold">
              {receipt.receiptNumber}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Date : {formatDateTime(receipt.date)}
            </p>
            <p className="text-xs font-semibold text-school-primary mt-0.5">
              Année : {receipt.academicYear}
            </p>
          </div>
        </div>

        {/* Student & Payment Info Grid */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px] block">
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

          <div className="text-right">
            <span className="text-slate-400 uppercase font-semibold text-[10px] block">
              Modalité de règlement
            </span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {receipt.paymentMethod.replace("_", " ")}
            </p>
            <p className="text-slate-600 font-mono mt-0.5">
              Réf : {receipt.transactionRef}
            </p>
            <p className="text-slate-600 mt-0.5">
              Agent : {receipt.receivedBy}
            </p>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="px-4 py-2.5">Désignation</th>
                <th className="px-4 py-2.5 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {receipt.purpose}
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums text-slate-900">
                  {formatFCFA(receipt.amount)}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-700">
                  TOTAL ENCAISSÉ :
                </th>
                <th className="px-4 py-3 text-right text-sm font-extrabold text-school-primary tabular-nums">
                  {formatFCFA(receipt.amount)}
                </th>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer with Seal & Signature Area */}
        <div className="pt-6 grid grid-cols-2 items-end border-t border-slate-200 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Paiement certifié & enregistré</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Document généré électroniquement par le système ECODUC / GESTIO 229.
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold text-slate-700">Cachet & Signature de la Caisse</p>
            <div className="h-16 mt-2 flex items-center justify-end">
              <div className="border-2 border-dashed border-slate-300 rounded-lg px-4 py-2 text-[10px] text-slate-400 uppercase font-bold text-center">
                Visa Comptabilité
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
