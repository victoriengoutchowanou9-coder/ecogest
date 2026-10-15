"use client";

import React, { useState, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Receipt,
  ArrowLeft,
  User,
  Search,
  CheckCircle2,
  Wallet,
  ShieldCheck,
  Printer,
  History,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReceiptView } from "@/components/school/ReceiptView";
import { Skeleton } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { useToast } from "@/components/ui/Toast";
import { formatFCFA, cn } from "@/lib/utils";
import { useFinanceStore } from "@/lib/finance-store";
import { CashReceiptRecord, StudentTuitionRecord } from "@/lib/mock-finance-db";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStudentId = searchParams.get("studentId");
  const { toast } = useToast();

  const { students, recordCashPayment } = useFinanceStore();

  // 1. Classe sélectionnée
  const [selectedClassId, setSelectedClassId] = useState<string>("ALL");

  // 2. Recherche élève
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 3. Élève sélectionné
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || (students[0]?.studentId ?? "")
  );

  // 8. Montant encaissé
  const [amount, setAmount] = useState<number>(50000);
  const [purpose, setPurpose] = useState<string>("Frais de scolarité");
  const [notes, setNotes] = useState<string>("");

  // État de validation
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<CashReceiptRecord | null>(null);

  // Available classes
  const classesList = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => set.add(s.className));
    return Array.from(set);
  }, [students]);

  // Filtered students by class and search
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = selectedClassId === "ALL" || s.className === selectedClassId;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === "" ||
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.matricule.toLowerCase().includes(q);
      return matchClass && matchSearch;
    });
  }, [students, selectedClassId, searchQuery]);

  // Current selected student record
  const currentStudent = useMemo(() => {
    return students.find((s) => s.studentId === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  // Quick preset amount handlers
  const handleQuickAmount = (val: number) => {
    setAmount(val);
  };

  const handlePayFullRemaining = () => {
    if (currentStudent) {
      setAmount(currentStudent.remainingTuition);
    }
  };

  const handleSubmitCashPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentStudent) {
      toast("Veuillez sélectionner un élève valide.", "error");
      return;
    }

    if (amount <= 0) {
      toast("Le montant encaissé doit être supérieur à 0 FCFA.", "error");
      return;
    }

    if (amount > currentStudent.remainingTuition && currentStudent.remainingTuition > 0) {
      toast(
        `Attention : Le montant saisi (${formatFCFA(amount)}) est supérieur au solde restant (${formatFCFA(currentStudent.remainingTuition)}).`,
        "info"
      );
    }

    try {
      const receipt = recordCashPayment({
        studentId: currentStudent.studentId,
        amount,
        purpose,
        receivedBy: "C. KPONOU (Comptable)",
        notes,
      });

      setGeneratedReceipt(receipt);
      setIsSuccess(true);
      toast(`Paiement de ${formatFCFA(amount)} en espèces validé avec succès !`, "success");
    } catch (err: any) {
      toast(err.message || "Erreur lors de l'enregistrement du paiement.", "error");
    }
  };

  const handleStartNewPayment = () => {
    setIsSuccess(false);
    setGeneratedReceipt(null);
    setNotes("");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Encaissement des Frais de Scolarité"
        subtitle="Guichet de caisse en espèces : sélection de classe, calcul automatique du solde et émission du reçu légal"
        breadcrumbs={[
          { label: "Comptabilité", href: "/comptabilite" },
          { label: "Encaisser un paiement" },
        ]}
        actions={
          <Link
            href="/comptabilite/recus"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs md:text-sm shadow-sm touch-target"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Historique des reçus</span>
          </Link>
        }
      />

      {isSuccess && generatedReceipt ? (
        /* Success Screen with Printable Receipt */
        <div className="space-y-6 animate-in fade-in">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-950 text-sm">
                  Paiement enregistré avec succès en caisse !
                </h3>
                <p className="text-xs text-emerald-800">
                  Reçu n° <strong>{generatedReceipt.receiptNumber}</strong> émis au nom de {generatedReceipt.studentName}.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartNewPayment}
              className="px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 touch-target shadow-sm"
            >
              Encaisser un autre élève
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <ReceiptView receipt={generatedReceipt} />
          </div>
        </div>
      ) : (
        /* 8-Step Payment Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 1. Class & 2. Student Search + Selection */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">1. Sélection de la classe</h3>
              <p className="text-xs text-slate-500">Filtrer par niveau d&apos;enseignement</p>
            </div>

            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent"
            >
              <option value="ALL">Toutes les classes ({students.length} élèves)</option>
              {classesList.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>

            <div>
              <h3 className="text-sm font-bold text-slate-900">2. Rechercher l&apos;élève</h3>
              <div className="relative mt-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nom, prénom ou matricule..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs md:text-sm text-slate-800 focus:border-school-accent"
                />
              </div>
            </div>

            {/* Student list picker */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">
                  Aucun élève trouvé
                </div>
              ) : (
                filteredStudents.map((st) => {
                  const isSelected = currentStudent?.studentId === st.studentId;
                  const isPaid = st.tuitionStatus === "PAID";

                  return (
                    <button
                      key={st.studentId}
                      type="button"
                      onClick={() => {
                        setSelectedStudentId(st.studentId);
                        if (st.remainingTuition > 0) {
                          setAmount(Math.min(st.remainingTuition, 50000));
                        }
                      }}
                      className={cn(
                        "w-full p-3 rounded-xl border text-left transition-all touch-target flex items-start justify-between gap-2",
                        isSelected
                          ? "border-school-primary bg-school-50/70 ring-2 ring-school-primary"
                          : "border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          {st.firstName} {st.lastName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {st.matricule} &bull; {st.className}
                        </div>
                      </div>

                      <div className="text-right">
                        <StatusBadge status={st.tuitionStatus} size="sm" />
                        <span className="block text-[11px] font-bold text-slate-700 mt-1 tabular-nums">
                          {isPaid ? "Soldé" : `Reste ${formatFCFA(st.remainingTuition)}`}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: 4-8. Student details, Tuition figures, and Cash payment input */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
            {currentStudent ? (
              <form onSubmit={handleSubmitCashPayment} className="space-y-5">
                {/* 4. Informations de l'élève */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Élève sélectionné
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        {currentStudent.firstName} {currentStudent.lastName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono">{currentStudent.matricule}</span>
                        <span>&bull;</span>
                        <span className="font-semibold text-slate-700">{currentStudent.className}</span>
                        <span>&bull;</span>
                        <span>{currentStudent.gender === "M" ? "Garçon" : "Fille"}</span>
                      </div>
                    </div>
                    <StatusBadge status={currentStudent.tuitionStatus} />
                  </div>

                  {/* 5, 6, 7. Frais attendus, Déjà payé, Solde restant */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 text-center">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Frais Attendus</span>
                      <span className="text-xs md:text-sm font-bold text-slate-900 tabular-nums">
                        {formatFCFA(currentStudent.totalTuition)}
                      </span>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 font-semibold block">Déjà Encaissé</span>
                      <span className="text-xs md:text-sm font-bold text-emerald-700 tabular-nums">
                        {formatFCFA(currentStudent.paidTuition)}
                      </span>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-rose-200">
                      <span className="text-[10px] text-rose-700 font-semibold block">Solde Restant</span>
                      <span className="text-xs md:text-sm font-black text-rose-600 tabular-nums">
                        {formatFCFA(currentStudent.remainingTuition)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Moyen de Paiement : STRICTEMENT ESPÈCE */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Moyen de Paiement
                  </label>
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-900">
                      <Wallet className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <strong className="text-xs font-bold block">Paiement en Espèces (Caisse de l&apos;école)</strong>
                        <span className="text-[11px] text-emerald-700">
                          Règlement physique direct en caisse. Aucun autre moyen requis.
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                      Espèce
                    </span>
                  </div>
                </div>

                {/* 8. Saisie du montant réellement encaissé */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      8. Montant réellement encaissé (FCFA) *
                    </label>
                    {currentStudent.remainingTuition > 0 && (
                      <button
                        type="button"
                        onClick={handlePayFullRemaining}
                        className="text-xs text-school-primary font-bold hover:underline"
                      >
                        Régler la totalité ({formatFCFA(currentStudent.remainingTuition)})
                      </button>
                    )}
                  </div>

                  <input
                    type="number"
                    min="1"
                    step="500"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-lg font-black text-slate-900 tabular-nums focus:border-school-accent focus:ring-1 focus:ring-school-accent"
                    required
                  />

                  {/* Quick Presets */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[11px] text-slate-400">Montants rapides :</span>
                    {[25000, 50000, 100000, 150000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleQuickAmount(val)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 text-xs"
                      >
                        {formatFCFA(val)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Objet / Motif du versement */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Motif du versement *
                  </label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs md:text-sm font-semibold text-slate-800"
                  >
                    <option value="Frais de scolarité - Tranche 1">Frais de scolarité - Tranche 1</option>
                    <option value="Frais de scolarité - Tranche 2">Frais de scolarité - Tranche 2</option>
                    <option value="Frais de scolarité - Tranche 3">Frais de scolarité - Tranche 3</option>
                    <option value="Frais de scolarité - Paiement Intégral">Frais de scolarité - Paiement Intégral</option>
                    <option value="Frais d'inscription / Réinscription">Frais d&apos;inscription / Réinscription</option>
                  </select>
                </div>

                {/* Observations / Notes */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Observations (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex : Reçu des mains du père, reliquat attendu fin de mois..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-school-accent"
                  />
                </div>

                {/* Submit action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Agent : <strong>C. KPONOU (Comptable)</strong>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-school-primary text-white font-bold text-sm hover:bg-school-700 shadow-md transition-all touch-target"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Valider l&apos;encaissement en espèces</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8 text-center text-slate-400">
                Sélectionnez un élève dans la liste à gauche
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EncaisserPaiementPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 max-w-4xl mx-auto p-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
