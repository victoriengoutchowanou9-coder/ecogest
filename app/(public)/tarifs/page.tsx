"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  Sparkles,
  Building2,
  Users,
  ShieldCheck,
  CreditCard,
  HelpCircle,
  ArrowRight,
  PhoneCall,
  Smartphone,
  School,
  Lock,
  Layers,
  Award,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function TarifsPage() {
  const [billingPeriod, setBillingPeriod] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");

  const schoolPlans = [
    {
      id: "STARTER",
      name: "Formule Starter",
      tagline: "Pour écoles en amorçage ou effectif modéré",
      priceMonthly: 6000,
      priceAnnual: 60000, // 2 mois offerts
      establishments: "1 établissement unique",
      usersCapacity: "Jusqu'à 300 élèves & 40 utilisateurs",
      isPopular: false,
      colorBadge: "bg-slate-100 text-slate-800",
      ctaHref: "/inscription?plan=STARTER",
      features: [
        "1 établissement scolaire",
        "Capacité jusqu'à 300 élèves",
        "Comptes Direction, Censeur, Enseignants (max 40)",
        "Gestion des élèves, classes et matières",
        "Saisie des notes et calcul des moyennes",
        "Génération des bulletins officiels PDF",
        "Gestion basique de la caisse et scolarités",
        "Support standard par email et ticket",
      ],
      notIncluded: [
        "Multi-établissements (2 écoles)",
        "Utilisateurs illimités",
        "Rappels automatiques WhatsApp",
        "Accompagnement et formation personnalisée",
      ],
    },
    {
      id: "PRO",
      name: "Formule Pro",
      tagline: "Capacité étendue pour collèges et lycées",
      priceMonthly: 10000,
      priceAnnual: 100000,
      establishments: "1 établissement unique",
      usersCapacity: "Capacité étendue : jusqu'à 1 000 élèves & 70 utilisateurs",
      isPopular: true,
      colorBadge: "bg-school-primary text-white",
      ctaHref: "/inscription?plan=PRO",
      importantNote: "Ce forfait est destiné à 1 seul établissement avec une capacité d'utilisateurs étendue (n'inclut pas la gestion de deux établissements).",
      features: [
        "1 établissement scolaire",
        "Capacité étendue jusqu'à 1 000 élèves",
        "Jusqu'à 70 comptes utilisateurs (profs, administration)",
        "Module complet Planification des Examens",
        "Validation et publication des bulletins par le Censeur",
        "Registre de classe officiel conforme Ministère",
        "Dossiers médicaux chiffrés et suivi disciplinaire",
        "Historique des anciens élèves et réadmission",
        "Comptabilité avancée, dépenses et salaires",
        "Support prioritaire par WhatsApp et téléphone",
      ],
      notIncluded: [
        "Multi-établissements (2 écoles)",
        "Utilisateurs illimités",
      ],
    },
    {
      id: "INSTITUTION",
      name: "Formule Institution",
      tagline: "Pour complexes scolaires et gestion multi-sites",
      priceMonthly: 25000,
      priceAnnual: 250000,
      establishments: "2 établissements complets inclus",
      usersCapacity: "Utilisateurs & élèves illimités",
      isPopular: false,
      colorBadge: "bg-purple-600 text-white",
      ctaHref: "/inscription?plan=INSTITUTION",
      highlightNotice: "Permet la gestion de 2 établissements avec utilisateurs illimités.",
      features: [
        "Gestion simultanée de 2 établissements scolaires",
        "Nombre d'élèves et de divisions ILLIMITÉ",
        "Nombre d'utilisateurs et enseignants ILLIMITÉ",
        "Bascule instantanée entre les deux établissements",
        "Toutes les fonctionnalités des modules incluses",
        "Coffre-fort ENCv1 avec isolation stricte des données",
        "Reçus de paiement avec QR Code infalsifiable",
        "Exports légaux et statistiques d'audit immuables",
        "Formation initiale sur site pour toute l'équipe",
        "Gestionnaire de compte dédié et assistance 24/7",
      ],
      notIncluded: [],
    },
  ];

  const parentPlans = [
    {
      id: "PARENT_1",
      name: "Abonnement 1 Élève",
      priceMonthly: 200,
      priceAnnual: 2000,
      target: "Idéal pour suivre un enfant scolarisé",
      features: [
        "Suivi assidu de 1 élève",
        "Consultation en temps réel des absences et retards",
        "Consultation des notes et moyennes après validation",
        "Accès au calendrier des devoirs et examens",
        "Téléchargement des bulletins officiels certifiés",
        "Messagerie directe avec l'établissement",
      ],
    },
    {
      id: "PARENT_2",
      name: "Abonnement 2 Élèves (Fratrie)",
      priceMonthly: 300,
      priceAnnual: 3000,
      target: "Spécialement conçu pour les fratries",
      features: [
        "Suivi simultané de 2 élèves",
        "Bascule d'un enfant à l'autre en un tap",
        "Toutes les fonctionnalités du forfait 1 élève",
        "Économie mensuelle sur le suivi familial",
        "Historique complet des années précédentes",
        "Notifications prioritaires par SMS et WhatsApp",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <PublicNavbar currentPath="/tarifs" />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-school-primary text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-school-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>TARIFICATION TRANSPARENTE ET ACCESSIBLE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
          Des forfaits adaptés à chaque établissement
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Sans frais cachés, sans engagement de durée obligatoire. Choisissez l&apos;offre qui correspond au dimensionnement de votre école.
        </p>

        {/* Billing Toggle (Monthly / Annual) */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md pt-1">
          <button
            type="button"
            onClick={() => setBillingPeriod("MONTHLY")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              billingPeriod === "MONTHLY"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-white hover:text-school-200"
            }`}
          >
            Facturation Mensuelle
          </button>
          <button
            type="button"
            onClick={() => setBillingPeriod("ANNUAL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              billingPeriod === "ANNUAL"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-white hover:text-school-200"
            }`}
          >
            <span>Facturation Annuelle</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500 text-white font-black">
              2 mois offerts
            </span>
          </button>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 flex-1 w-full">
        
        {/* Section 1 : Forfaits Établissements (6 000, 10 000, 25 000 FCFA) */}
        <section className="space-y-6" id="forfaits-ecoles">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Abonnements pour Établissements Scolaires
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Définis pour les écoles primaires, collèges, lycées et complexes scolaires.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {schoolPlans.map((plan) => {
              const price =
                billingPeriod === "MONTHLY"
                  ? `${plan.priceMonthly.toLocaleString("fr-FR")} FCFA`
                  : `${plan.priceAnnual.toLocaleString("fr-FR")} FCFA`;
              const periodSuffix = billingPeriod === "MONTHLY" ? " / mois" : " / an";

              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl bg-white border flex flex-col justify-between transition-all duration-200 relative ${
                    plan.isPopular
                      ? "border-school-primary shadow-xl ring-2 ring-school-primary/20"
                      : "border-slate-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-school-primary text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                      Recommandé pour Collèges &amp; Lycées
                    </div>
                  )}

                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="space-y-2">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${plan.colorBadge}`}>
                        {plan.name}
                      </span>
                      <p className="text-xs text-slate-500">{plan.tagline}</p>
                    </div>

                    <div className="border-y border-slate-100 py-4 space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-slate-900">
                          {price}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">{periodSuffix}</span>
                      </div>
                      <div className="text-xs text-slate-600 font-medium space-y-1 pt-1">
                        <p className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Building2 className="w-3.5 h-3.5 text-school-primary" />
                          <span>{plan.establishments}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{plan.usersCapacity}</span>
                        </p>
                      </div>
                    </div>

                    {/* Specific Clarification Notices (Requirements) */}
                    {plan.highlightNotice && (
                      <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs font-bold text-purple-900">
                        &check; {plan.highlightNotice}
                      </div>
                    )}
                    {plan.importantNote && (
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                        &bull; {plan.importantNote}
                      </div>
                    )}

                    {/* Features List */}
                    <div className="space-y-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                        Fonctionnalités incluses :
                      </span>
                      <ul className="space-y-2 text-xs text-slate-700">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                        {plan.notIncluded.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-400">
                            <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                            <span className="line-through">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="p-6 sm:p-8 pt-0 border-t border-slate-100 mt-6">
                    <Link
                      href={plan.ctaHref}
                      className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 touch-target ${
                        plan.isPopular
                          ? "bg-school-primary hover:bg-school-700 text-white shadow-md shadow-school-primary/20"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      <span>Choisir ce forfait</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#matrice-comparative"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition shadow-2xs"
            >
              <Layers className="w-4 h-4 text-school-primary" />
              <span>Comparer les forfaits en détail</span>
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition shadow-2xs"
            >
              <PhoneCall className="w-4 h-4 text-school-primary" />
              <span>Nous contacter pour un devis personnalisé</span>
            </Link>
          </div>
        </section>

        {/* Section 2 : Forfaits Parents (200F et 300F) */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8" id="forfaits-parents">
          <div className="text-center space-y-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Portail Parents &amp; Élèves
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Abonnements pour les Familles
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Tarification ultra-accessible permettant aux parents de suivre la scolarité de leurs enfants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {parentPlans.map((pp) => (
              <div
                key={pp.id}
                className="p-6 rounded-2xl border border-indigo-100 bg-linear-to-b from-indigo-50/50 to-white flex flex-col justify-between space-y-6 shadow-xs"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">{pp.name}</h3>
                      <p className="text-xs text-slate-500">{pp.target}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">
                      Parent
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 py-2 border-y border-indigo-100">
                    <span className="text-3xl font-black text-indigo-700">{pp.priceMonthly} FCFA</span>
                    <span className="text-xs text-slate-500 font-semibold"> / an</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-700">
                    {pp.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/inscription?type=parent"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-center shadow-sm transition"
                >
                  Souscrire pour mon enfant
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 : Modalités de Paiement & Conditions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-school-primary" />
              <h3 className="font-bold text-sm text-slate-900">Modalités de paiement acceptées</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nous facilitons le règlement de vos abonnements avec des moyens locaux instantanés :
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700 pt-1">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>MTN Mobile Money</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Moov Money Flooz</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span>Carte Bancaire (Visa / Mastercard)</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Virement ou Caisse École</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Conditions d&apos;utilisation</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nos forfaits incluent la maintenance continue, les sauvegardes automatiques quotidiennes et la mise en conformité continue avec les programmes officiels.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li>Aucun engagement obligatoire : résiliation possible à chaque échéance mensuelle.</li>
              <li>Données entièrement récupérables en cas de fin d&apos;abonnement (exports Excel et PDF).</li>
              <li>Chiffrement au repos ENCv1 et hébergement hautement sécurisé garanti.</li>
            </ul>
          </div>
        </section>

        {/* Section 4 : Matrice Comparative Complète */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6" id="matrice-comparative">
          <div className="text-center space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Tableau comparatif des fonctionnalités
            </h3>
            <p className="text-slate-500 text-xs">
              Vue synthétique de l&apos;ensemble des services par niveau d&apos;abonnement établissement.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Fonctionnalité / Service</th>
                  <th className="py-3 px-4 text-center">Starter (6 000 F)</th>
                  <th className="py-3 px-4 text-center bg-school-50/50 text-school-primary">Pro (10 000 F)</th>
                  <th className="py-3 px-4 text-center">Institution (25 000 F)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-4 font-semibold">Nombre d&apos;établissements gérés</td>
                  <td className="py-3 px-4 text-center">1 école</td>
                  <td className="py-3 px-4 text-center bg-school-50/20 font-bold">1 école</td>
                  <td className="py-3 px-4 text-center font-bold text-purple-700">2 établissements</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Capacité d&apos;élèves inscrits</td>
                  <td className="py-3 px-4 text-center">Jusqu&apos;à 300 élèves</td>
                  <td className="py-3 px-4 text-center bg-school-50/20 font-bold">Jusqu&apos;à 1 000 élèves</td>
                  <td className="py-3 px-4 text-center font-bold text-purple-700">Illimité</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Comptes enseignants &amp; personnel</td>
                  <td className="py-3 px-4 text-center">20 max</td>
                  <td className="py-3 px-4 text-center bg-school-50/20 font-bold">60 max</td>
                  <td className="py-3 px-4 text-center font-bold text-purple-700">Illimité</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Bulletins officiels Bénin (A4 avec QR Code)</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">&check;</td>
                  <td className="py-3 px-4 text-center bg-school-50/20 text-emerald-600 font-bold">&check;</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">&check;</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Module de Planification des Examens</td>
                  <td className="py-3 px-4 text-center text-slate-300">&mdash;</td>
                  <td className="py-3 px-4 text-center bg-school-50/20 text-emerald-600 font-bold">&check;</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">&check;</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Validation &amp; Publication Censeur</td>
                  <td className="py-3 px-4 text-center text-slate-300">&mdash;</td>
                  <td className="py-3 px-4 text-center bg-school-50/20 text-emerald-600 font-bold">&check;</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">&check;</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Registre de classe officiel (PDF officiel)</td>
                  <td className="py-3 px-4 text-center text-slate-300">&mdash;</td>
                  <td className="py-3 px-4 text-center bg-school-50/20 text-emerald-600 font-bold">&check;</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">&check;</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Dossier médical chiffré &amp; Discipline</td>
                  <td className="py-3 px-4 text-center text-slate-300">&mdash;</td>
                  <td className="py-3 px-4 text-center bg-school-50/20 text-emerald-600 font-bold">&check;</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">&check;</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Comptabilité, Salaires &amp; Dépenses</td>
                  <td className="py-3 px-4 text-center text-slate-500">Basique</td>
                  <td className="py-3 px-4 text-center bg-school-50/20 font-bold text-slate-800">Avancé</td>
                  <td className="py-3 px-4 text-center font-bold text-purple-700">Intégral + Multi-sites</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Formation &amp; Accompagnement dédié</td>
                  <td className="py-3 px-4 text-center text-slate-300">&mdash;</td>
                  <td className="py-3 px-4 text-center bg-school-50/20 text-slate-500">En ligne</td>
                  <td className="py-3 px-4 text-center font-bold text-purple-700">Sur site + Référent Dédié</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
