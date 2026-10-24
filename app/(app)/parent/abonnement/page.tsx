"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Home,
  CheckCircle2,
  Users,
  Calendar,
  CreditCard,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Bell,
  Clock,
  BookOpen,
  DollarSign,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/Toast";
import {
  useSubscriptionStore,
  PARENT_PLANS,
  ParentPlanCode,
} from "@/lib/subscription-store";
import { useAuthStore } from "@/lib/auth-store";

export default function ParentAbonnementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const {
    parentPlan,
    parentPlanDef,
    parentStatus,
    parentStartDate,
    parentExpiresAt,
    childrenCount,
    changeParentPlan,
    renewParentSubscription,
  } = useSubscriptionStore();
  const { validatePayment, user: currentUser } = useAuthStore();

  const [confirmModalPlan, setConfirmModalPlan] = useState<ParentPlanCode | null>(null);

  // Paiement Mobile Money Parent
  const [paymentMethod, setPaymentMethod] = useState<"MTN" | "MOOV">("MTN");
  const [paymentPhone, setPaymentPhone] = useState("+229 ");
  const [payingLoading, setPayingLoading] = useState(false);

  // Vérification automatique au retour de SasPay
  const referenceParam = searchParams.get("reference");
  const sessionIdParam = searchParams.get("session_id") || searchParams.get("sessionId");
  const statusParam = searchParams.get("status");

  useEffect(() => {
    if ((referenceParam || sessionIdParam) && statusParam === "success") {
      fetch(
        `/api/subscriptions/saspay/verify?reference=${encodeURIComponent(
          referenceParam || ""
        )}&sessionId=${encodeURIComponent(sessionIdParam || "")}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.status === "PAID") {
            validatePayment("PARENT");
            if (data.planCode) {
              changeParentPlan(data.planCode);
            }
            toast(
              `Paiement SasPay validé avec succès (${(
                data.amount || parentPlanDef.priceFcfa
              ).toLocaleString()} FCFA) ! Votre compte parent est activé.`,
              "success"
            );
            router.replace("/parent/abonnement");
          }
        })
        .catch(() => {});
    }
  }, [referenceParam, sessionIdParam, statusParam]);

  const handlePayAndActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayingLoading(true);

    try {
      const res = await fetch("/api/subscriptions/saspay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "PARENT",
          planCode: parentPlan,
          parentId: currentUser?.id || "parent-1",
          customerEmail: currentUser?.email,
          customerName: currentUser?.fullName || "Parent Éducatif",
          customerPhone: paymentPhone,
        }),
      });

      const data = await res.json();
      if (data.success && data.checkoutUrl) {
        toast("Redirection sécurisée vers la page de paiement SasPay...", "info");
        window.location.href = data.checkoutUrl;
        return;
      } else {
        toast(data.error || "Impossible d'initialiser le paiement SasPay.", "error");
      }
    } catch (err: any) {
      toast("Erreur de connexion au serveur de paiement SasPay.", "error");
    } finally {
      setPayingLoading(false);
    }
  };

  const handleApplyPlan = async (code: ParentPlanCode) => {
    const targetPlan = PARENT_PLANS[code];
    if (targetPlan.priceFcfa > 0) {
      try {
        const res = await fetch("/api/subscriptions/saspay/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityType: "PARENT",
            planCode: code,
            parentId: currentUser?.id || "parent-1",
            customerEmail: currentUser?.email,
            customerName: currentUser?.fullName || "Parent Éducatif",
          }),
        });

        const data = await res.json();
        if (data.success && data.checkoutUrl) {
          toast(
            `Redirection vers SasPay pour le règlement du forfait ${targetPlan.name}...`,
            "info"
          );
          window.location.href = data.checkoutUrl;
          return;
        }
      } catch (err) {}
    }

    changeParentPlan(code);
    validatePayment("PARENT");
    setConfirmModalPlan(null);
    toast(
      `Votre compte est désormais sous la formule ${targetPlan.name} (${targetPlan.priceFcfa} FCFA/mois).`,
      "success"
    );
  };

  const handleRenew = async () => {
    if (parentPlanDef.priceFcfa > 0) {
      try {
        const res = await fetch("/api/subscriptions/saspay/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityType: "PARENT",
            planCode: parentPlan,
            parentId: currentUser?.id || "parent-1",
            customerEmail: currentUser?.email,
            customerName: currentUser?.fullName || "Parent Éducatif",
          }),
        });

        const data = await res.json();
        if (data.success && data.checkoutUrl) {
          toast(
            `Redirection vers SasPay pour renouveler ${parentPlanDef.name} (${parentPlanDef.priceFcfa} FCFA)...`,
            "info"
          );
          window.location.href = data.checkoutUrl;
          return;
        }
      } catch (err) {}
    }

    renewParentSubscription();
    validatePayment("PARENT");
    toast(
      `Votre forfait ${parentPlanDef.name} a été renouvelé avec succès pour un mois !`,
      "success"
    );
  };

  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (new Date(parentExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  return (
    <div className="space-y-8 max-w-5xl">
      <PageHeader
        title="Mon Abonnement Parent"
        subtitle="Suivi de votre formule mensuelle, quotas d'enfants rattachés et renouvellement"
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Abonnement" }]}
        actions={
          <button
            type="button"
            onClick={handleRenew}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-school-primary text-white font-bold text-xs md:text-sm hover:bg-school-700 shadow-sm touch-target"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Renouveler (30 jours)</span>
          </button>
        }
      />

      {/* Module de Paiement & Activation Immédiate si En Attente */}
      {parentStatus === "PENDING_PAYMENT" && (
        <div className="bg-white rounded-3xl border-2 border-amber-400 p-6 md:p-8 shadow-lg space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Activer votre abonnement Parent
                </h3>
                <p className="text-xs text-slate-500">
                  Montant à régler : <strong className="text-indigo-600 font-mono text-sm">{parentPlanDef.priceFcfa} FCFA</strong> pour le forfait <strong>{parentPlanDef.name}</strong> ({parentPlanDef.maxChildren} enfant(s))
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 self-start sm:self-auto border border-amber-200">
              Activation Requise
            </span>
          </div>

          <form onSubmit={handlePayAndActivate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Moyen de règlement Mobile Money :</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("MTN")}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                    paymentMethod === "MTN"
                      ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-400 font-bold"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black text-xs shrink-0">
                    MTN
                  </span>
                  <div>
                    <p className="text-xs text-slate-900">MTN MoMo Bénin</p>
                    <p className="text-[10px] text-slate-500 font-mono">*880# / Direct</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("MOOV")}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                    paymentMethod === "MOOV"
                      ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-400 font-bold"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    MOOV
                  </span>
                  <div>
                    <p className="text-xs text-slate-900">Moov Money Bénin</p>
                    <p className="text-[10px] text-slate-500 font-mono">*855# / Direct</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Numéro de débit Mobile Money (Bénin) *
              </label>
              <input
                type="text"
                required
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                placeholder="+229 97 00 00 00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
              />
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={payingLoading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-bold shadow-md transition flex items-center justify-center gap-2"
              >
                {payingLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Validation du paiement en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Payer {parentPlanDef.priceFcfa} FCFA &amp; Débloquer mon suivi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bannière Forfait Parent Actuel */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 shadow-xl border border-indigo-900 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-400/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Formule Actuelle</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                parentStatus === "ACTIVE"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : parentStatus === "PENDING_PAYMENT"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              }`}>
                {parentStatus === "ACTIVE"
                  ? "Actif & Validé"
                  : parentStatus === "PENDING_PAYMENT"
                  ? "En attente de paiement"
                  : "Expiré"}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-2">
              {parentPlanDef.name} &mdash;{" "}
              <span className="text-amber-400">{parentPlanDef.priceFcfa} FCFA</span>
              <span className="text-sm font-normal text-slate-300"> / mois</span>
            </h2>
            <p className="text-xs text-slate-300">{parentPlanDef.tagline}</p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto bg-white/5 p-3 rounded-2xl border border-white/10 text-xs">
            <div>
              <p className="text-[11px] text-slate-400">Date de début :</p>
              <p className="font-bold text-slate-200">{parentStartDate}</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-[11px] text-slate-400">Expire le :</p>
              <p className="font-bold text-amber-300">{parentExpiresAt}</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-right">
              <p className="text-[11px] text-slate-400">Restant :</p>
              <p className="font-extrabold text-emerald-400">{daysRemaining} jours</p>
            </div>
          </div>
        </div>

        {/* Quota d'enfants autorisés */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2 max-w-lg">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-300">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Enfants suivis sur votre compte</span>
            </span>
            <span className="font-bold text-white">
              {childrenCount} / {parentPlanDef.maxChildren} enfant
              {parentPlanDef.maxChildren > 1 ? "s" : ""}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-400 h-2.5 rounded-full transition-all"
              style={{
                width: `${Math.min(100, (childrenCount / parentPlanDef.maxChildren) * 100)}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            {parentPlan === "PARENT_1"
              ? "Forfait 1 élève. Pour suivre un second enfant, passez au forfait PARENT 2 (300 FCFA/mois)."
              : "Forfait famille : 2 élèves maximum autorisés par compte parent."}
          </p>
        </div>
      </div>

      {/* Comparatif des 2 forfaits parents côte à côte */}
      <div className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h3 className="text-xl font-extrabold text-slate-900">
            Formules d&apos;abonnement pour les Parents
          </h3>
          <p className="text-xs text-slate-500">
            Tarifs ultra-accessibles pour accompagner la scolarité et l&apos;assiduité de vos enfants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {(Object.keys(PARENT_PLANS) as ParentPlanCode[]).map((code) => {
            const plan = PARENT_PLANS[code];
            const isCurrent = parentPlan === code;

            return (
              <div
                key={code}
                className={`relative rounded-3xl p-6 bg-white border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? "border-indigo-600 shadow-xl ring-2 ring-indigo-600/20"
                    : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider shadow-sm">
                    Recommandé Famille
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 text-lg">{plan.name}</h4>
                    {isCurrent && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Forfait Actuel
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">{plan.priceFcfa}</span>
                      <span className="text-xs font-semibold text-slate-500">FCFA / mois</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{plan.tagline}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span>Nombre d&apos;élèves autorisés :</span>
                    <span className="text-indigo-600 font-bold">
                      {plan.maxChildren} élève{plan.maxChildren > 1 ? "s max" : ""}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Services inclus :
                    </p>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100">
                  {isCurrent ? (
                    <button
                      type="button"
                      onClick={handleRenew}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-sm touch-target"
                    >
                      Renouveler ce forfait
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmModalPlan(code)}
                      className="w-full py-2.5 rounded-xl border border-slate-300 hover:border-indigo-600 text-slate-800 hover:text-indigo-600 hover:bg-indigo-50 text-xs font-bold transition touch-target"
                    >
                      {plan.priceFcfa > parentPlanDef.priceFcfa
                        ? "Passer au forfait supérieur (300 F)"
                        : "Choisir ce forfait"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fonctionnalités de suivi disponibles pour le Parent (Requirement 2) */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <span>Fonctionnalités incluses dans votre espace parent</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              Notes &amp; Résultats
            </span>
            <p className="text-slate-500">Moyennes certifiées, bulletins trimestriels A4.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-rose-600" />
              Absences &amp; Retards
            </span>
            <p className="text-slate-500">Historique d&apos;assiduité et alertes temps réel.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Devoirs &amp; Planning
            </span>
            <p className="text-slate-500">Emploi du temps avec enseignants et devoirs à faire.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-600" />
              Frais &amp; Scolarité
            </span>
            <p className="text-slate-500">Tranches réglées, solde et reçus officiels.</p>
          </div>
        </div>
      </div>

      {/* Modal Confirmation Changement de Forfait Parent */}
      {confirmModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Changer pour la formule {PARENT_PLANS[confirmModalPlan].name} ?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Nouveau tarif :{" "}
                  <strong className="text-slate-800">
                    {PARENT_PLANS[confirmModalPlan].priceFcfa} FCFA / mois
                  </strong>
                  . Vous pourrez suivre jusqu&apos;à{" "}
                  <strong>
                    {PARENT_PLANS[confirmModalPlan].maxChildren} élève
                    {PARENT_PLANS[confirmModalPlan].maxChildren > 1 ? "s" : ""}
                  </strong>
                  .
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModalPlan(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPlan(confirmModalPlan)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm"
                >
                  Confirmer et Activer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
