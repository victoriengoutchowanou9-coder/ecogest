"use client";

import React, { useState } from "react";
import { CheckCircle2, Loader2, ArrowRight, ArrowLeft, ShieldCheck, Download, AlertCircle } from "lucide-react";
import { formatFCFA, cn } from "@/lib/utils";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { Student } from "@/lib/mock-data";

interface PaymentStepperProps {
  student: Student;
  onPaymentSuccess?: (receiptId: string) => void;
  onCancel?: () => void;
}

type Step = "AMOUNT" | "METHOD" | "PROCESSING" | "SUCCESS" | "FAILED";

export const PaymentStepper: React.FC<PaymentStepperProps> = ({
  student,
  onPaymentSuccess,
  onCancel,
}) => {
  const [step, setStep] = useState<Step>("AMOUNT");
  const [amount, setAmount] = useState<number>(
    student.remainingTuition > 0 ? Math.min(student.remainingTuition, 50000) : 25000
  );
  const [paymentMethod, setPaymentMethod] = useState<"MTN_MOMO" | "MOOV_MONEY" | "ESPECES">("MTN_MOMO");
  const [phoneNumber, setPhoneNumber] = useState("+229 97 ");
  const [errorMsg, setErrorMsg] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");

  const handleProceedToMethod = () => {
    if (amount <= 0) {
      setErrorMsg("Le montant doit être supérieur à 0 FCFA.");
      return;
    }
    setErrorMsg("");
    setStep("METHOD");
  };

  const handleLaunchPayment = () => {
    if (!phoneNumber || phoneNumber.trim().length < 8) {
      setErrorMsg("Veuillez saisir un numéro de téléphone valide.");
      return;
    }
    setErrorMsg("");
    setStep("PROCESSING");

    // Simulating database webhook confirmation (statut réel interrogé depuis le serveur)
    setTimeout(() => {
      const generatedReceipt = `RC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setReceiptNumber(generatedReceipt);
      setStep("SUCCESS");
      if (onPaymentSuccess) {
        onPaymentSuccess(generatedReceipt);
      }
    }, 2800);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-xl mx-auto">
      {/* Stepper Progress Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
              step === "AMOUNT"
                ? "bg-school-primary text-white"
                : "bg-emerald-100 text-emerald-800"
            )}
          >
            1
          </div>
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline">Montant</span>
        </div>

        <div className="h-0.5 w-12 bg-slate-200" />

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
              step === "METHOD"
                ? "bg-school-primary text-white"
                : step === "PROCESSING" || step === "SUCCESS"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-400"
            )}
          >
            2
          </div>
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline">Moyen</span>
        </div>

        <div className="h-0.5 w-12 bg-slate-200" />

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
              step === "PROCESSING" || step === "SUCCESS"
                ? "bg-school-primary text-white"
                : "bg-slate-100 text-slate-400"
            )}
          >
            3
          </div>
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline">Validation</span>
        </div>
      </div>

      {/* Step 1: Amount Selection */}
      {step === "AMOUNT" && (
        <div className="space-y-5 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900">Montant du règlement</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Élève : <span className="font-semibold text-slate-800">{student.firstName} {student.lastName}</span> ({student.className})
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-600">Reste à payer :</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {formatFCFA(student.remainingTuition)}
            </span>
          </div>

          <MoneyInput
            label="Saisir ou choisir le montant à payer"
            value={amount}
            onChange={(val) => setAmount(val)}
            error={errorMsg}
          />

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-medium touch-target"
              >
                Annuler
              </button>
            ) : <div />}
            <button
              type="button"
              onClick={handleProceedToMethod}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-school-primary text-white font-semibold text-sm hover:bg-school-700 shadow-sm transition-colors touch-target"
            >
              <span>Continuer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Payment Method */}
      {step === "METHOD" && (
        <div className="space-y-5 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900">Moyen de paiement</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Montant à régler : <span className="font-bold text-school-primary">{formatFCFA(amount)}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("MTN_MOMO")}
              className={cn(
                "p-4 rounded-xl border text-left transition-all touch-target",
                paymentMethod === "MTN_MOMO"
                  ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-400 font-bold"
                  : "border-slate-200 hover:bg-slate-50"
              )}
            >
              <div className="text-sm font-bold text-slate-900">MTN Mobile Money</div>
              <p className="text-xs text-slate-500 mt-1">Paiement instantané Bénin</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("MOOV_MONEY")}
              className={cn(
                "p-4 rounded-xl border text-left transition-all touch-target",
                paymentMethod === "MOOV_MONEY"
                  ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-400 font-bold"
                  : "border-slate-200 hover:bg-slate-50"
              )}
            >
              <div className="text-sm font-bold text-slate-900">Moov Money (Flooz)</div>
              <p className="text-xs text-slate-500 mt-1">Paiement instantané Bénin</p>
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Numéro de téléphone de facturation
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+229 97 00 00 00"
              className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:border-school-accent focus:ring-1 focus:ring-school-accent touch-target min-h-[44px]"
            />
            {errorMsg && <p className="text-xs text-rose-600">{errorMsg}</p>}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep("AMOUNT")}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium touch-target"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>
            <button
              type="button"
              onClick={handleLaunchPayment}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-school-primary text-white font-semibold text-sm hover:bg-school-700 shadow-sm transition-colors touch-target"
            >
              <span>Valider le paiement</span>
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Processing (En cours de confirmation) */}
      {step === "PROCESSING" && (
        <div className="py-8 text-center space-y-4 animate-in fade-in">
          <Loader2 className="w-12 h-12 text-school-primary animate-spin mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">En cours de confirmation...</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Une demande USSD de confirmation a été envoyée sur votre téléphone. Veuillez saisir votre code secret pour valider.
            </p>
          </div>
          <div className="inline-block p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono">
            Vérification du statut en base de données...
          </div>
        </div>
      )}

      {/* Step 4: Success with Receipt Download */}
      {step === "SUCCESS" && (
        <div className="py-6 text-center space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Paiement validé avec succès !</h3>
            <p className="text-xs text-slate-500 mt-1">
              Le paiement a été confirmé et enregistré sur la scolarité de {student.firstName}.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Numéro de reçu :</span>
              <span className="font-mono font-bold text-slate-900">{receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Montant payé :</span>
              <span className="font-bold text-emerald-700">{formatFCFA(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Moyen :</span>
              <span className="font-semibold text-slate-800">{paymentMethod}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm touch-target"
            >
              <Download className="w-4 h-4" />
              <span>Imprimer le reçu</span>
            </button>
            <button
              type="button"
              onClick={() => setStep("AMOUNT")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-school-primary text-white font-semibold text-sm hover:bg-school-700 touch-target"
            >
              Nouveau paiement
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
