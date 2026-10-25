"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Building2,
  Users,
  Calendar,
  CreditCard,
  RefreshCw,
  ArrowRight,
  Zap,
  Info,
  Check,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/Toast";
import {
  useSubscriptionStore,
  SCHOOL_PLANS,
  SchoolPlanCode,
} from "@/lib/subscription-store";
import { useAuthStore } from "@/lib/auth-store";

export default function DirecteurAbonnementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const {
    schoolPlan,
    schoolPlanDef,
    schoolStatus,
    schoolStartDate,
    schoolExpiresAt,
    schools,
    usersCount,
    hasConsumedTrial,
    changeSchoolPlan,
    renewSchoolSubscription,
  } = useSubscriptionStore();
  const { validatePayment, user: currentUser } = useAuthStore();

  const [confirmModalPlan, setConfirmModalPlan] = useState<SchoolPlanCode | null>(null);

  // Paiement Mobile Money & Carte SasPay
  const [paymentMethod, setPaymentMethod] = useState<"MTN" | "MOOV" | "CARTE">("MTN");
  const [paymentPhone, setPaymentPhone] = useState("+229 ");
  const [paymentRef, setPaymentRef] = useState("");
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
            validatePayment("SCHOOL");
            if (data.planCode) {
              changeSchoolPlan(data.planCode);
            }
            toast(
              `Paiement SasPay validé avec succès (${(
                data.amount || schoolPlanDef.priceFcfa
              ).toLocaleString()} FCFA) ! Votre établissement est actif.`,
              "success"
            );
            router.replace("/directeur/abonnement");
          }
        })
        .catch(() => {});
    }
  }, [referenceParam, sessionIdParam, statusParam]);

  const handlePayAndActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayingLoading(true);

    try {
      const activeSchool = schools[0];
      const effectivePlanCode: SchoolPlanCode =
        schoolPlan === "STARTER" ? "BASIC" : schoolPlan;

      const emailToSend =
        currentUser?.email && currentUser.email.includes("@")
          ? currentUser.email
          : activeSchool?.email && activeSchool.email.includes("@")
          ? activeSchool.email
          : "direction@ecogest.app";

      const nameToSend =
        currentUser?.fullName || activeSchool?.name || "Direction Établissement";

      const res = await fetch("/api/subscriptions/saspay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "SCHOOL",
          planCode: effectivePlanCode,
          schoolId: activeSchool?.id || currentUser?.schoolId || "school-1",
          userId: currentUser?.id,
          customerEmail: emailToSend,
          customerName: nameToSend,
          customerPhone: paymentPhone || currentUser?.phone || activeSchool?.phone || "",
        }),
      });

      const data = await res.json();
      if (data.success && data.checkoutUrl) {
        toast("Redirection sécurisée vers la page de paiement SasPay...", "info");
        window.location.href = data.checkoutUrl;
        return;
      } else {
        const errDetail =
          typeof data.error === "object" ? JSON.stringify(data.error) : data.error;
        toast(errDetail || "Impossible d'initialiser le paiement SasPay.", "error");
      }
    } catch (err: any) {
      toast("Erreur de connexion au serveur de paiement SasPay.", "error");
    } finally {
      setPayingLoading(false);
    }
  };

  const handleApplyPlan = async (code: SchoolPlanCode) => {
    const targetPlan = SCHOOL_PLANS[code];
    if (targetPlan.priceFcfa > 0) {
      try {
        const activeSchool = schools[0];
        const emailToSend =
          currentUser?.email && currentUser.email.includes("@")
            ? currentUser.email
            : activeSchool?.email && activeSchool.email.includes("@")
            ? activeSchool.email
            : "direction@ecogest.app";

        const nameToSend =
          currentUser?.fullName || activeSchool?.name || "Direction Établissement";

        const res = await fetch("/api/subscriptions/saspay/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityType: "SCHOOL",
            planCode: code,
            schoolId: activeSchool?.id || currentUser?.schoolId || "school-1",
            userId: currentUser?.id,
            customerEmail: emailToSend,
            customerName: nameToSend,
            customerPhone: currentUser?.phone || activeSchool?.phone || "",
          }),
        });

        const data = await res.json();
        if (data.success && data.checkoutUrl) {
          toast(
            `Redirection vers SasPay pour le règlement de la formule ${targetPlan.name}...`,
            "info"
          );
          window.location.href = data.checkoutUrl;
          return;
        } else {
          const errDetail =
            typeof data.error === "object" ? JSON.stringify(data.error) : data.error;
          toast(errDetail || "Erreur lors de l'initialisation du paiement.", "error");
          return;
        }
      } catch (err) {
        toast("Erreur de connexion avec la passerelle SasPay.", "error");
        return;
      }
    }

    changeSchoolPlan(code);
    validatePayment("SCHOOL");
    setConfirmModalPlan(null);
    const priceText =
      targetPlan.priceFcfa === 0
        ? "Gratuit 1 mois"
        : `${targetPlan.priceFcfa.toLocaleString()} FCFA/mois`;
    toast(
      `Félicitations ! Votre établissement est désormais sous la ${targetPlan.name} (${priceText}).`,
      "success"
    );
  };

  const handleRenew = async () => {
    if (schoolPlanDef.priceFcfa > 0) {
      try {
        const activeSchool = schools[0];
        const emailToSend =
          currentUser?.email && currentUser.email.includes("@")
            ? currentUser.email
            : activeSchool?.email && activeSchool.email.includes("@")
            ? activeSchool.email
            : "direction@ecogest.app";

        const nameToSend =
          currentUser?.fullName || activeSchool?.name || "Direction Établissement";

        const res = await fetch("/api/subscriptions/saspay/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityType: "SCHOOL",
            planCode: schoolPlan,
            schoolId: activeSchool?.id || currentUser?.schoolId || "school-1",
            userId: currentUser?.id,
            customerEmail: emailToSend,
            customerName: nameToSend,
            customerPhone: activeSchool?.phone || currentUser?.phone || paymentPhone || "",
          }),
        });

        const data = await res.json();
        if (data.success && data.checkoutUrl) {
          toast("Redirection vers SasPay pour le renouvellement...", "info");
          window.location.href = data.checkoutUrl;
          return;
        } else {
          const errDetail =
            typeof data.error === "object" ? JSON.stringify(data.error) : data.error;
          toast(errDetail || "Impossible d'initialiser le renouvellement.", "error");
          return;
        }
      } catch (e) {
        toast("Erreur de communication avec le serveur SasPay.", "error");
        return;
      }
    }

    renewSchoolSubscription();
    validatePayment("SCHOOL");
    toast(
      `Votre abonnement ${schoolPlanDef.name} a été renouvelé avec succès pour 1 mois supplémentaire !`,
      "success"
    );
  };

  // Calcul du nombre de jours restants
  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (new Date(schoolExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  return (
    <div className="space-y-8 max-w-6xl">
      <PageHeader
        title="Gestion de l'Abonnement de l'Établissement"
        subtitle="Suivi de votre formule mensuelle, quotas d'utilisateurs, renouvellement et gestion multi-établissements"
        breadcrumbs={[{ label: "Directeur", href: "/directeur" }, { label: "Abonnement" }]}
        actions={
          <button
            type="button"
            onClick={handleRenew}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-school-primary text-white font-bold text-xs md:text-sm hover:bg-school-700 shadow-sm touch-target"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Renouveler pour 1 mois</span>
          </button>
        }
      />

      {/* Module de Paiement & Activation Immédiate si En Attente */}
      {schoolStatus === "PENDING_PAYMENT" && (
        <div className="bg-white rounded-3xl border-2 border-amber-400 p-6 md:p-8 shadow-lg space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Régler l&apos;abonnement pour débloquer votre établissement
                </h3>
                <p className="text-xs text-slate-500">
                  Montant à régler : <strong className="text-school-primary font-mono text-sm">{schoolPlanDef.priceFcfa.toLocaleString()} FCFA</strong> pour la formule <strong>{schoolPlanDef.name}</strong>
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 self-start sm:self-auto border border-amber-200">
              Étape Obligatoire
            </span>
          </div>

          <form onSubmit={handlePayAndActivate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Moyen de règlement :</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARTE")}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                    paymentMethod === "CARTE"
                      ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-400 font-bold"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    CARD
                  </span>
                  <div>
                    <p className="text-xs text-slate-900">Carte / Virement</p>
                    <p className="text-[10px] text-slate-500">Visa, Mastercard</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Numéro de débit Mobile Money / Contact *
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Référence de transaction / Code reçu (optionnel)
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="Ex : TXN-89230192"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={payingLoading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-bold shadow-md transition flex items-center justify-center gap-2"
              >
                {payingLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Traitement et validation en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Valider le paiement ({schoolPlanDef.priceFcfa.toLocaleString()} FCFA) &amp; Activer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bannière de l'Abonnement Actuel */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-school-950 to-slate-900 text-white p-6 md:p-8 shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Formule Actuelle</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                schoolStatus === "ACTIVE"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : schoolStatus === "TRIAL"
                  ? "bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 font-bold"
                  : schoolStatus === "PENDING_PAYMENT"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              }`}>
                {schoolStatus === "ACTIVE"
                  ? "Actif & Validé"
                  : schoolStatus === "TRIAL"
                  ? "Essai Gratuit 1 Mois Actif"
                  : schoolStatus === "PENDING_PAYMENT"
                  ? "En attente de paiement"
                  : "Expiré"}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-2">
              {schoolPlanDef.name} &mdash;{" "}
              <span className="text-amber-400">{schoolPlanDef.priceFcfa.toLocaleString()} FCFA</span>
              <span className="text-sm font-normal text-slate-300"> / mois</span>
            </h2>
            <p className="text-xs text-slate-300">{schoolPlanDef.tagline}</p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto bg-white/5 p-3 rounded-2xl border border-white/10 text-xs">
            <div>
              <p className="text-[11px] text-slate-400">Date de début :</p>
              <p className="font-bold text-slate-200">{schoolStartDate}</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-[11px] text-slate-400">Expire le :</p>
              <p className="font-bold text-amber-300">{schoolExpiresAt}</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-right">
              <p className="text-[11px] text-slate-400">Restant :</p>
              <p className="font-extrabold text-emerald-400">{daysRemaining} jours</p>
            </div>
          </div>
        </div>

        {/* Jauges d'utilisation en temps réel (Requirement 3, 5) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Jauge Établissements */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Building2 className="w-4 h-4 text-school-accent" />
                <span>Établissements autorisés</span>
              </span>
              <span className="font-bold text-white">
                {schools.length} / {schoolPlanDef.maxSchools} établissement
                {schoolPlanDef.maxSchools > 1 ? "s" : ""}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-amber-400 h-2.5 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (schools.length / schoolPlanDef.maxSchools) * 100)}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {schoolPlan === "PREMIUM"
                ? "Vous disposez de 2 établissements avec gestion cloisonnée."
                : "1 établissement unique. Passez à PREMIUM pour gérer jusqu'à 2 écoles."}
            </p>
          </div>

          {/* Jauge Utilisateurs */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Utilisateurs actifs</span>
              </span>
              <span className="font-bold text-white">
                {schoolPlanDef.maxUsers === null
                  ? `${usersCount} utilisateurs (Illimité)`
                  : `${usersCount} / ${schoolPlanDef.maxUsers} max`}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-2.5 rounded-full transition-all"
                style={{
                  width:
                    schoolPlanDef.maxUsers === null
                      ? "30%"
                      : `${Math.min(100, (usersCount / schoolPlanDef.maxUsers) * 100)}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {schoolPlanDef.maxUsers === null
                ? "Nombre illimité d'enseignants, comptables et censeurs."
                : `${Math.max(0, schoolPlanDef.maxUsers - usersCount)} places restantes pour de nouveaux comptes.`}
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* FORMULES DE L'ÉTABLISSEMENT DISPONIBLES                               */}
      {/* ===================================================================== */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h3 className="text-xl font-extrabold text-slate-900">
            Choisissez la formule adaptée à votre établissement
          </h3>
          <p className="text-xs text-slate-500">
            Passez à tout moment à une formule supérieure pour débloquer plus d&apos;utilisateurs et le multi-établissements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.keys(SCHOOL_PLANS) as SchoolPlanCode[]).map((code) => {
            const plan = SCHOOL_PLANS[code];
            const isCurrent = schoolPlan === code;

            return (
              <div
                key={code}
                className={`relative rounded-3xl p-6 bg-white border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? "border-school-primary shadow-xl ring-2 ring-school-primary/20"
                    : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-sm">
                    Plus populaire
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 text-lg">{plan.name}</h4>
                    {isCurrent && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-school-50 text-school-primary border border-school-200">
                        Actuel
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">
                        {plan.priceFcfa === 0 ? "0" : plan.priceFcfa.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">FCFA / {plan.period}</span>
                      {plan.priceFcfa === 0 && (
                        <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          1 mois offert
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{plan.tagline}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>Établissements :</span>
                      <span className="text-school-primary">
                        {plan.maxSchools} établissement{plan.maxSchools > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>Utilisateurs :</span>
                      <span className="text-emerald-700">
                        {plan.maxUsers === null ? "Illimités" : `${plan.maxUsers} utilisateurs max`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Fonctionnalités incluses :
                    </p>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-school-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100">
                  {isCurrent ? (
                    code === "STARTER" && hasConsumedTrial ? (
                      <div className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold text-center border border-slate-200">
                        Mois d&apos;essai déjà consommé
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRenew}
                        className="w-full py-2.5 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 transition shadow-sm touch-target"
                      >
                        Renouveler ce forfait
                      </button>
                    )
                  ) : code === "STARTER" && hasConsumedTrial ? (
                    <div className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold text-center border border-slate-200">
                      Offre d&apos;essai non rééligible
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmModalPlan(code)}
                      className="w-full py-2.5 rounded-xl border border-slate-300 hover:border-school-primary text-slate-800 hover:text-school-primary hover:bg-school-50 text-xs font-bold transition touch-target"
                    >
                      {plan.priceFcfa > schoolPlanDef.priceFcfa
                        ? "Passer au forfait supérieur"
                        : "Choisir ce forfait"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Confirmation de Changement de Forfait */}
      {confirmModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Basculer vers la {SCHOOL_PLANS[confirmModalPlan].name} ?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Nouveau tarif :{" "}
                  <strong className="text-slate-800">
                    {SCHOOL_PLANS[confirmModalPlan].priceFcfa === 0
                      ? "Gratuit (1 mois offert)"
                      : `${SCHOOL_PLANS[confirmModalPlan].priceFcfa.toLocaleString()} FCFA / mois`}
                  </strong>
                  . Vos données, classes et élèves existants sont intégralement conservés et sécurisés.
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                <p className="font-semibold text-slate-900">Ce qui change immédiatement :</p>
                <p>
                  &bull; Établissements autorisés :{" "}
                  <strong>{SCHOOL_PLANS[confirmModalPlan].maxSchools}</strong>
                </p>
                <p>
                  &bull; Limite d&apos;utilisateurs :{" "}
                  <strong>
                    {SCHOOL_PLANS[confirmModalPlan].maxUsers === null
                      ? "Illimités"
                      : `${SCHOOL_PLANS[confirmModalPlan].maxUsers} utilisateurs`}
                  </strong>
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
                  className="px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-sm"
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
