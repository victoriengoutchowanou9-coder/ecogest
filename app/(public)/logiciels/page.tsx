"use client";

import React from "react";
import Link from "next/link";
import {
  Layers,
  Sparkles,
  Smartphone,
  CreditCard,
  Building2,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Laptop,
  Store,
  Clock,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function LogicielsPage() {
  const softwareSolutions = [
    {
      id: "PRO",
      name: "ECOGEST PRO",
      badge: "Solution Principale & Active",
      badgeColor: "bg-school-primary text-white",
      icon: <Laptop className="w-6 h-6 text-school-primary" />,
      desc: "Le progiciel de référence pour la gestion administrative, pédagogique, financière et le suivi des élèves en Afrique de l'Ouest.",
      features: [
        "Structure bivalente : Primaire (CI-CM2) & Secondaire (6e-Tle)",
        "Validation des notes Censeur & Bulletins officiels Bénin (A4 avec QR Code)",
        "Module de planification des examens avec cloisonnement parents",
        "Encaissement des écolages, reçus sécurisés et fiches de paie",
        "Coffre-fort chiffré au repos (ENCv1) pour les fiches médicales",
      ],
      targetAudience: "Directions d'école, Censeurs, Comptables, Enseignants et Fondateurs.",
      advantages: "Tout-en-un, zéro calcul manuel d'erreur de moyenne, conformité ministérielle totale.",
      btnText: "Découvrir ECOGEST PRO",
      btnHref: "/demo",
      isLive: true,
    },
    {
      id: "MOBILE",
      name: "ECOGEST Mobile App",
      badge: "Application Compagnon",
      badgeColor: "bg-indigo-600 text-white",
      icon: <Smartphone className="w-6 h-6 text-indigo-600" />,
      desc: "L'application mobile tout-terrain conçue pour les enseignants en classe et les parents en mobilité.",
      features: [
        "Pointage et appel d'assiduité en un tap par séance",
        "Saisie instantanée des notes d'interrogations hors-ligne",
        "Notifications push d'absences et de retards pour les parents",
        "Téléchargement direct des bulletins de notes délibérés",
      ],
      targetAudience: "Professeurs titulaires et vacataires, Parents et tuteurs d'élèves.",
      advantages: "Ultra-rapide, fonctionne même avec un débit 3G modeste, synchronisation automatique.",
      btnText: "Découvrir la version Mobile",
      btnHref: "/visite-guidee",
      isLive: true,
    },
    {
      id: "CAISSE",
      name: "ECOGEST Caisse & Cantine (POS)",
      badge: "Module Spécialisé",
      badgeColor: "bg-amber-600 text-white",
      icon: <Store className="w-6 h-6 text-amber-600" />,
      desc: "Solution de point de vente et de gestion des services annexes : cantine scolaire, librairie interne, vente d'uniformes et de fournitures.",
      features: [
        "Gestion des stocks de manuels et uniformes scolaires",
        "Comptes prépayés cantine pour les élèves avec carte à code-barres",
        "Rapprochement quotidien des recettes de caisse",
        "Intégration directe avec la trésorerie générale d'ECOGEST PRO",
      ],
      targetAudience: "Gestionnaires de cantine, intendants, secrétaires de scolarité.",
      advantages: "Supprime les pertes d'argent liquide à la cantine, transparence totale des flux.",
      btnText: "Découvrir Caisse & Cantine",
      btnHref: "/contact?subject=Interet-Caisse-Cantine",
      isLive: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <PublicNavbar currentPath="/logiciels" />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-school-primary text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-school-200">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>ÉCOSYSTÈME LOGICIEL ECOGEST</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
          Nos Solutions &amp; Logiciels
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Découvrez la suite d&apos;outils informatiques développés pour répondre à l&apos;ensemble des besoins de la communauté éducative.
        </p>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 flex-1 w-full text-xs text-slate-700">
        
        {/* Software Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {softwareSolutions.map((soft) => (
            <div
              key={soft.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:shadow-md transition"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                    {soft.icon}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${soft.badgeColor}`}>
                    {soft.badge}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900">{soft.name}</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{soft.desc}</p>
                </div>

                {/* Target Audience & Key Advantages */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-[11px]">
                  <p>
                    <strong className="text-slate-900 font-bold">Public cible :</strong>{" "}
                    <span className="text-slate-600">{soft.targetAudience}</span>
                  </p>
                  <p>
                    <strong className="text-slate-900 font-bold">Avantages :</strong>{" "}
                    <span className="text-slate-600">{soft.advantages}</span>
                  </p>
                </div>

                {/* Main Features */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Fonctionnalités principales :
                  </span>
                  <ul className="space-y-1.5 text-slate-600">
                    {soft.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  href={soft.btnHref}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-school-primary text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>{soft.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </section>

        {/* Required Future Software Notice */}
        <section className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-school-50 text-school-primary flex items-center justify-center font-bold mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">
            Découvrez prochainement nos autres solutions logicielles.
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Notre département de recherche &amp; développement prépare de nouvelles extensions pour l&apos;apprentissage assisté par IA, la gestion des bibliothèques et le transport scolaire.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-school-primary hover:underline"
            >
              <span>Être informé en avant-première</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
