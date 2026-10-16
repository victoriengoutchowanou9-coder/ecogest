"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Shield,
  BookOpenCheck,
  GraduationCap,
  CreditCard,
  Home,
  ArrowRight,
  Lock,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Zap,
  Check,
  Building2,
  Users,
  FileSpreadsheet,
  Clock,
  Layers,
  HelpCircle,
  UserPlus,
} from "lucide-react";

export default function HomePage() {
  const [billingPeriod, setBillingPeriod] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");

  const softwareModules = [
    {
      title: "Direction & Administration",
      badge: "Gouvernance",
      desc: "Configuration de l'établissement, structure des divisions, ouverture des années scolaires, gestion des comptes utilisateurs et hiérarchie des permissions.",
      features: [
        "Création des comptes Censeur, Comptable et Enseignants",
        "Gestion des classes, effectifs et professeurs principaux",
        "Archivage et bascule des années académiques",
      ],
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      color: "border-purple-200 bg-purple-50/40",
      btnText: "Tester l'espace Directeur",
      href: "/directeur",
    },
    {
      title: "Censorat des Études & Pédagogie",
      badge: "Pédagogie & Audit",
      desc: "Supervision complète de l'enseignement : validation des notes, coefficients par matière, émargement des professeurs, suivi des devoirs surveillés et TD.",
      features: [
        "Gestion des matières et coefficients selon les cycles",
        "Validation rigoureuse des demandes d'accès parents par matricule",
        "Pointage et registre d'émargement des enseignants",
        "Alertes de notes manquantes et relances automatiques",
      ],
      icon: <BookOpenCheck className="w-6 h-6 text-blue-600" />,
      color: "border-blue-200 bg-blue-50/40",
      btnText: "Tester l'espace Censeur",
      href: "/censeur",
    },
    {
      title: "Espace Enseignants",
      badge: "Pratique de classe",
      desc: "Outils quotidiens pour les professeurs : saisie rapide des notes en tableau, calculs automatiques certifiés, appel par séance et cahier de textes numérique.",
      features: [
        "Saisie conforme des évaluations et calcul automatique de la moyenne",
        "Appel en un tap : présents, retards, absents justifiés",
        "Cahier de textes numérique avec impression officielle de fiche",
        "Rédaction des appréciations par matière pour les bulletins",
      ],
      icon: <GraduationCap className="w-6 h-6 text-emerald-600" />,
      color: "border-emerald-200 bg-emerald-50/40",
      btnText: "Tester l'espace Enseignant",
      href: "/enseignant",
    },
    {
      title: "Comptabilité & Gestion Financière",
      badge: "Trésorerie & Recouvrement",
      desc: "Gestion rigoureuse des finances scolaires : encaissement des tranches en espèces, émission de reçus infalsifiables, gestion des dépenses et paies.",
      features: [
        "Tableau de bord financier dynamique avec cartes interactives",
        "Encaissement sécurisé et impression immédiate du reçu officiel",
        "Suivi du reste à recouvrer par classe et par élève",
        "Registre des dépenses payées et fiches de paie du personnel",
      ],
      icon: <CreditCard className="w-6 h-6 text-amber-600" />,
      color: "border-amber-200 bg-amber-50/40",
      btnText: "Tester l'espace Comptabilité",
      href: "/comptabilite",
    },
    {
      title: "Portail Parents & Élèves",
      badge: "Suivi & Transparence",
      desc: "Espace de confiance pour les familles : demande d'accès sécurisée avec vérification d'identité, suivi exclusif des absences et retards, et bulletins officiels.",
      features: [
        "Recherche et rattachement sécurisé de l'élève par Matricule",
        "Validation préalable obligatoire par le Censeur des études",
        "Suivi précis des retards et absences sans encombrement inutile",
        "Consultation de l'emploi du temps, devoirs et calendrier",
      ],
      icon: <Home className="w-6 h-6 text-indigo-600" />,
      color: "border-indigo-200 bg-indigo-50/40",
      btnText: "Tester l'espace Parent",
      href: "/parent",
    },
  ];

  const problemsSolved = [
    {
      title: "Erreurs et lenteurs des calculs de moyennes et de bulletins",
      problem: "Des semaines entières perdues à recalculer manuellement les moyennes trimestrielles sur des fiches volantes, avec un risque élevé d'erreurs de coefficients et des contestations de notes par les parents.",
      solution: "Automatisation totale et instantanée de tous les calculs de notes. Dès que l'enseignant saisit ses notes, les moyennes coefficientées, rangs et bulletins scolaires normalisés sont générés en un clic.",
      icon: <FileSpreadsheet className="w-5 h-5 text-rose-500" />,
      badge: "Pédagogie",
    },
    {
      title: "Opacité de la trésorerie et difficultés de recouvrement des scolarités",
      problem: "Carnets à souches papier faciles à égarer ou contrefaire, méconnaissance en temps réel des impayés par classe et litiges réguliers lors des versements en espèces avec les parents.",
      solution: "Enregistrement sécurisé de chaque paiement avec reçu infalsifiable à identifiant unique. La direction et le comptable visualisent en temps réel le taux de recouvrement et le reste à recouvrer par élève.",
      icon: <CreditCard className="w-5 h-5 text-amber-500" />,
      badge: "Finances",
    },
    {
      title: "Manque d'information des parents et absentéisme non maîtrisé",
      problem: "Les parents découvrent les absences chroniques, les retards et la baisse de niveau de leur enfant trop tardivement, en fin d'année scolaire lors du conseil de classe.",
      solution: "Portail parent dédié permettant aux familles de consulter directement l'assiduité, les retards signalés, les devoirs à venir et les bulletins validés par le censeur.",
      icon: <Users className="w-5 h-5 text-indigo-500" />,
      badge: "Communication",
    },
    {
      title: "Lourdeur administrative et perte de registres de classe",
      problem: "Cahiers de textes physiques égarés, appels de présence fastidieux en début d'heure et impossibilité pour la direction de suivre fidèlement l'émargement et l'avancement des programmes.",
      solution: "Dématérialisation complète : appel de classe en 30 secondes sur mobile ou PC, cahier de textes numérique centralisé et registre d'émargement auditable à tout moment par le censeur.",
      icon: <Clock className="w-5 h-5 text-emerald-500" />,
      badge: "Organisation",
    },
  ];

  const subscriptionPlans = [
    {
      id: "STARTER",
      name: "Formule Starter",
      tagline: "Pour écoles en amorçage ou effectif modéré",
      priceMonthly: 6000,
      priceAnnual: 60000,
      capacity: "Jusqu'à 300 élèves & 20 utilisateurs",
      isPopular: false,
      ctaHref: "/inscription?plan=STARTER",
      features: [
        "1 établissement scolaire",
        "Capacité jusqu'à 300 élèves",
        "Comptes Direction, Censeur et Enseignants (max 20)",
        "Gestion des élèves, classes et matières",
        "Saisie des notes et calcul automatique des moyennes",
        "Génération des bulletins scolaires normalisés PDF",
        "Gestion basique de la caisse et des scolarités",
        "Support standard par email et ticket",
      ],
    },
    {
      id: "PRO",
      name: "Formule Pro",
      tagline: "Capacité étendue pour collèges et lycées",
      priceMonthly: 10000,
      priceAnnual: 100000,
      capacity: "Jusqu'à 1 000 élèves & 60 utilisateurs",
      isPopular: true,
      ctaHref: "/inscription?plan=PRO",
      features: [
        "1 établissement scolaire",
        "Capacité étendue jusqu'à 1 000 élèves",
        "Jusqu'à 60 comptes utilisateurs (profs, admin, compta)",
        "Les 5 modules métiers interconnectés",
        "Validation & publication des bulletins par le Censeur",
        "Module complet d'émargement et suivi disciplinaire",
        "Comptabilité avancée, dépenses et salaires",
        "Support prioritaire par WhatsApp et téléphone",
      ],
    },
    {
      id: "INSTITUTION",
      name: "Formule Institution",
      tagline: "Pour complexes scolaires et gestion multi-sites",
      priceMonthly: 25000,
      priceAnnual: 250000,
      capacity: "2 établissements inclus & Utilisateurs illimités",
      isPopular: false,
      ctaHref: "/inscription?plan=INSTITUTION",
      features: [
        "Gestion de 2 établissements scolaires complets",
        "Nombre d'élèves et de divisions illimité",
        "Nombre d'utilisateurs et enseignants illimité",
        "Bascule instantanée entre établissements",
        "Toutes les fonctionnalités des modules incluses",
        "Reçus de paiement certifiés infalsifiables",
        "Exports légaux et statistiques d'audit consolidées",
        "Gestionnaire de compte dédié et assistance 24/7",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-school-primary text-white flex items-center justify-center font-black text-xl shadow-md shadow-school-primary/20">
              E
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                ECOGEST
              </span>
              <span className="block text-[11px] text-slate-500 font-medium leading-none">
                Gestion scolaire tout en un
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#modules-logiciel"
              className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-school-primary transition-colors px-3 py-1.5"
            >
              Modules du logiciel
            </a>
            <a
              href="#problemes-resolus"
              className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-school-primary transition-colors px-3 py-1.5"
            >
              Problèmes résolus
            </a>
            <a
              href="#tarifs"
              className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-school-primary transition-colors px-3 py-1.5"
            >
              Tarifs
            </a>
            <Link
              href="/inscription"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-sm transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Inscription</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-8 md:py-12 space-y-20">
        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/pexels-tosin-olowoleni-2148141635-34162713.jpg')",
            }}
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-school-950/90 to-slate-900/75 backdrop-blur-[1px]" />

          <div className="relative z-10 p-8 md:p-14 text-white space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-school-100 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>LA SOLUTION DE RÉFÉRENCE POUR L&apos;ENSEIGNEMENT GÉNÉRAL &amp; TECHNIQUE</span>
            </div>

            <div className="max-w-3xl space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Le logiciel Pro pour piloter vos établissements scolaires.
              </h1>
              <p className="text-sm md:text-base text-slate-200 leading-relaxed max-w-2xl">
                <strong>ECOGEST</strong> simplifie, centralise et sécurise toute la gestion de votre collège ou lycée :
                direction administrative, censorat pédagogique, bulletins scolaires normalisés, gestion des scolarités en espèces avec reçus officiels et portail de suivi parental.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="#modules-logiciel"
                className="px-6 py-3 rounded-xl bg-white text-school-primary font-bold text-sm hover:bg-slate-100 shadow-md transition flex items-center gap-2 touch-target"
              >
                <span>Découvrir les modules</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#tarifs"
                className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm border border-white/30 backdrop-blur-sm transition flex items-center gap-2 touch-target"
              >
                <span>Voir les tarifs d&apos;abonnement</span>
              </a>
            </div>
          </div>
        </section>

        {/* Modules du Logiciel ECOGEST */}
        <section id="modules-logiciel" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-school-primary uppercase tracking-wider">
              Architecture Intégrée
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              5 modules métiers parfaitement interconnectés
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Chaque utilisateur dispose d&apos;une interface adaptée à ses prérogatives pour éliminer les doubles saisies et garantir l&apos;intégrité des informations scolaires.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {softwareModules.map((mod) => (
              <div
                key={mod.title}
                className={`p-6 rounded-2xl border ${mod.color} bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-white shadow-sm border border-slate-100">
                      {mod.icon}
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">
                      {mod.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{mod.title}</h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{mod.desc}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {mod.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-school-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    href={mod.href}
                    className="inline-flex items-center justify-between w-full text-xs font-bold text-school-primary hover:text-school-700 group"
                  >
                    <span>{mod.btnText}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Présentation des problèmes que le logiciel résout */}
        <section id="problemes-resolus" className="space-y-8 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-school-primary uppercase tracking-wider">
              Défis &amp; Solutions Scolaires
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Quels problèmes concrets le logiciel ECOGEST résout-il ?
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Diriger un collège ou un lycée comporte de lourds défis administratifs, pédagogiques et financiers. Voici comment ECOGEST transforme le quotidien de vos équipes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {problemsSolved.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  {/* Problem Callout */}
                  <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Difficulté rencontrée sur le terrain :</span>
                    </div>
                    <p className="text-xs text-rose-900/90 leading-relaxed">
                      {item.problem}
                    </p>
                  </div>

                  {/* Solution Callout */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Réponse concrète apportée par ECOGEST :</span>
                    </div>
                    <p className="text-xs text-emerald-950 leading-relaxed">
                      {item.solution}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Présentation du tarif d'abonnement */}
        <section id="tarifs" className="space-y-8 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-school-primary uppercase tracking-wider">
              Tarifs Transparents
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Des forfaits d&apos;abonnement adaptés à votre structure
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Investissez dans une solution fiable et éprouvée pour moderniser durablement la gestion de votre collège ou lycée.
            </p>

            {/* Billing period switcher */}
            <div className="pt-2 flex items-center justify-center gap-2">
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setBillingPeriod("MONTHLY")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                    billingPeriod === "MONTHLY"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Mensuel
                </button>
                <button
                  type="button"
                  onClick={() => setBillingPeriod("ANNUAL")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    billingPeriod === "ANNUAL"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>Annuel</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-100 text-emerald-700">
                    2 mois offerts
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {subscriptionPlans.map((plan) => {
              const price =
                billingPeriod === "MONTHLY" ? plan.priceMonthly : plan.priceAnnual;
              const periodLabel = billingPeriod === "MONTHLY" ? "/ mois" : "/ an";

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border p-6 flex flex-col justify-between transition-all bg-white ${
                    plan.isPopular
                      ? "border-school-primary ring-2 ring-school-primary/20 shadow-lg relative"
                      : "border-slate-200 shadow-xs hover:shadow-md"
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-school-primary text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                      Recommandé pour Collèges &amp; Lycées
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{plan.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">{plan.tagline}</p>
                    </div>

                    <div className="py-2 border-y border-slate-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">
                          {price.toLocaleString("fr-FR")}
                        </span>
                        <span className="text-xs font-bold text-slate-500">FCFA {periodLabel}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-school-primary block mt-1">
                        {plan.capacity}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-slate-700">
                          <Check className="w-3.5 h-3.5 text-school-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link
                      href={plan.ctaHref}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        plan.isPopular
                          ? "bg-school-primary text-white hover:bg-school-700 shadow-sm"
                          : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                      }`}
                    >
                      <span>Souscrire à cette formule</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Parent Subscription Information Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-school-50 via-indigo-50/50 to-slate-50 border border-school-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-school-200 text-school-primary flex items-center justify-center shrink-0">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  Vous êtes parent ou tuteur légal d&apos;élève ?
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Suivez en direct les présences, devoirs et bulletins scolaires de vos enfants dès <strong>200 FCFA / mois</strong>.
                </p>
              </div>
            </div>
            <Link
              href="/tarifs"
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 shadow-2xs shrink-0 transition"
            >
              Consulter les tarifs parents &rarr;
            </Link>
          </div>
        </section>
      </main>

      {/* Comprehensive Software Footer */}
      <PublicFooter />
    </div>
  );
}
