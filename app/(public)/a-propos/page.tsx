"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Building2,
  GraduationCap,
  Users,
  ShieldCheck,
  Target,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  School,
  Globe2,
  Award,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function AProposPage() {
  const values = [
    {
      title: "Rigueur et Conformité Pédagogique",
      desc: "Respect strict des programmes officiels, arrêtés ministériels, coefficients réels et barèmes en vigueur au Bénin et dans la sous-région ouest-africaine.",
      icon: <Award className="w-5 h-5 text-purple-600" />,
    },
    {
      title: "Transparence et Clarté",
      desc: "Créer un climat de confiance solide entre les directeurs, les fondateurs, les professeurs et les parents d'élèves grâce à des données auditées et infalsifiables.",
      icon: <HeartHandshake className="w-5 h-5 text-emerald-600" />,
    },
    {
      title: "Accessibilité et Simplicité",
      desc: "Une interface fluide, accessible sur smartphone comme sur ordinateur, optimisée pour les débits internet locaux et sans lourdeur technique superflue.",
      icon: <Users className="w-5 h-5 text-blue-600" />,
    },
    {
      title: "Sécurité & Souveraineté des Données",
      desc: "Chiffrement systématique au repos (norme ENCv1), protection de l'intimité médicale des élèves et conformité stricte aux exigences de protection des données.",
      icon: <ShieldCheck className="w-5 h-5 text-amber-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <PublicNavbar currentPath="/a-propos" />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-school-primary text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-school-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>NOTRE HISTOIRE &amp; NOTRE MISSION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
          À propos d&apos;ECOGEST
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Le progiciel conçu au Bénin pour centraliser, simplifier et moderniser durablement la gestion de nos écoles et lycées.
        </p>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 flex-1 w-full text-xs text-slate-700 leading-relaxed">
        
        {/* Section 1 : Pourquoi ECOGEST a été créé & Le Problème résolu */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
          <div className="space-y-2">
            <span className="text-xs font-bold text-school-primary uppercase tracking-wider">
              Genèse &amp; Constat de terrain
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Pourquoi ECOGEST a-t-il été créé ?
            </h2>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Pendant des décennies, la gestion des établissements scolaires en Afrique de l&apos;Ouest a reposé sur des registres papier volumineux, des fichiers Excel dispersés et des calculs manuels fastidieux de moyennes trimestrielles.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
              <span className="font-bold text-rose-950 text-xs block">Les difficultés historiques :</span>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
                <li>Erreurs de calcul fréquentes dans les coefficients et classements de bulletins.</li>
                <li>Perte de dossiers historiques lors du départ ou transfert d&apos;un apprenant.</li>
                <li>Manque de visibilité en temps réel pour les fondateurs sur les frais de scolarité recouvrés.</li>
                <li>Absence d&apos;information précoce pour les parents sur les absences répétées de leurs enfants.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <span className="font-bold text-emerald-950 text-xs block">La réponse apportée par ECOGEST :</span>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
                <li>Centralisation unifiée : pédagogie, finance, scolarité et vie scolaire sous un même toit.</li>
                <li>Conformité légale immédiate avec les modèles officiels béninois (A4, QR Code, EducMaster).</li>
                <li>Cloisonnement rigoureux garantissant l&apos;invisibilité des notes jusqu&apos;à la délibération du Censeur.</li>
                <li>Suivi parental instantané accessible même avec une connexion internet modeste.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2 : Vision & Établissements ciblés */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
          <div className="space-y-2">
            <span className="text-xs font-bold text-school-primary uppercase tracking-wider">
              Écosystème &amp; Cible
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Notre vision pour la digitalisation scolaire
            </h2>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Notre ambition est de rendre l&apos;excellence administrative accessible à tous les types d&apos;écoles, des plus modestes aux plus grands complexes multi-campus.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mx-auto">
                <School className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Écoles Primaires</h3>
              <p className="text-slate-500 text-[11px]">
                Notation par compétences (CI à CM2), évaluations continues, carnets de correspondance et taux d&apos;acquisition.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mx-auto">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Collèges &amp; Lycées</h3>
              <p className="text-slate-500 text-[11px]">
                Coefficients modulables (6e à Terminale), devoirs surveillés, planification des examens et émargement.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mx-auto">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Complexes Bivalents</h3>
              <p className="text-slate-500 text-[11px]">
                Pilotage multi-cycles (Primaire + Secondaire) sur une plateforme unique avec consolidation financière.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 : Valeurs de la Plateforme */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Nos Principes Directeurs
            </h2>
            <p className="text-slate-500 text-xs">Ce qui guide chaque ligne de code et chaque mise à jour d&apos;ECOGEST.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {values.map((val, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
                    {val.icon}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{val.title}</h3>
                </div>
                <p className="text-xs text-slate-600 pl-10 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4 : CTA */}
        <section className="bg-linear-to-r from-slate-900 to-school-primary text-white rounded-3xl p-8 text-center space-y-4 shadow-md">
          <h3 className="text-xl sm:text-2xl font-black">
            Rejoignez la nouvelle génération d&apos;établissements connectés
          </h3>
          <p className="text-slate-200 text-xs max-w-lg mx-auto">
            Testez nos modules gratuitement en ligne ou planifiez un échange avec nos conseillers pédagogiques.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/demo"
              className="px-5 py-2.5 rounded-xl bg-school-primary hover:bg-school-700 text-white font-bold text-xs shadow-sm transition"
            >
              Tester la démo
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs transition"
            >
              Nous contacter
            </Link>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
