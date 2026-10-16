"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Shield,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function ConditionsUtilisationPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <PublicNavbar currentPath="/conditions-utilisation" />

      {/* Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-school-primary text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-school-200">
          <Scale className="w-3.5 h-3.5 text-amber-400" />
          <span>DOCUMENTS JURIDIQUES &amp; CONTRACTUELS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
          Conditions Générales d&apos;Utilisation
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Régissant l&apos;accès et l&apos;exploitation du progiciel de gestion scolaire EducoGest PRO.
        </p>

        {/* Tab switcher */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
          <span className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 shadow-sm">
            Conditions d&apos;utilisation
          </span>
          <Link
            href="/politique-confidentialite"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white hover:text-school-200 transition"
          >
            Politique de confidentialité
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 flex-1 w-full text-xs text-slate-700 leading-relaxed">
        
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
          
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <span className="text-[11px] font-mono text-slate-400">Dernière révision : 1er Octobre 2026</span>
            <p className="text-slate-600 text-xs">
              Les présentes Conditions Générales d&apos;Utilisation (ci-après « CGU ») régissent les relations contractuelles entre la société éditrice d&apos;EducoGest et tout utilisateur (établissements scolaires, personnel éducatif, parents d&apos;élèves).
            </p>
          </div>

          {/* 1. Conditions d'accès au service */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-school-primary rounded-full"></span>
              1. Conditions d&apos;accès au service
            </h2>
            <p>
              L&apos;accès à EducoGest est subordonné à la souscription préalable d&apos;un abonnement valide par l&apos;établissement ou par le parent d&apos;élève. Chaque utilisateur accède au service via des identifiants personnels et confidentiels dont il est l&apos;unique gardien.
            </p>
          </section>

          {/* 2. Utilisation du logiciel */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-school-primary rounded-full"></span>
              2. Utilisation du logiciel
            </h2>
            <p>
              EducoGest concède à l&apos;établissement scolaire un droit d&apos;usage non exclusif, personnel et non transférable du progiciel, strictement limité aux besoins de gestion administrative, pédagogique et financière de ses propres élèves et personnels.
            </p>
          </section>

          {/* 3. Responsabilités des utilisateurs */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-school-primary rounded-full"></span>
              3. Responsabilités des utilisateurs
            </h2>
            <p>
              L&apos;établissement garantit l&apos;exactitude des informations saisies (notes, états civils, présences, écolages). Tout acte posé sous le compte d&apos;un utilisateur (validation de notes par le Censeur, encaissement par le Comptable) est présumé avoir été accompli par le titulaire dudit compte.
            </p>
          </section>

          {/* 4. Gestion des comptes */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-school-primary rounded-full"></span>
              4. Gestion des comptes et habilitations (RBAC)
            </h2>
            <p>
              Le Directeur de l&apos;établissement est administrateur principal de son tenant. Il a la charge de définir les rôles des utilisateurs (Directeur, Censeur, Enseignants, Comptable, Secrétaire) et de désactiver immédiatement les accès de tout personnel ayant quitté l&apos;établissement.
            </p>
          </section>

          {/* 5. Abonnements et tarification */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-school-primary rounded-full"></span>
              5. Abonnements et Modalités Financières
            </h2>
            <p>
              Les tarifs applicables sont ceux en vigueur au moment de la souscription (6 000 FCFA/mois pour le forfait Starter, 10 000 FCFA/mois pour le forfait Pro à capacité étendue, 25 000 FCFA/mois pour le forfait Institution multi-établissements ; et 200 à 300 FCFA/mois pour les forfaits parents). Les abonnements sont payables par mois ou par an.
            </p>
          </section>

          {/* 6. Suspension ou résiliation */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-school-primary rounded-full"></span>
              6. Suspension ou résiliation
            </h2>
            <p>
              L&apos;établissement peut résilier son abonnement à la fin de chaque période mensuelle échue. En cas de non-paiement prolongé après relances formelles, l&apos;accès peut être suspendu temporairement. En tout état de cause, l&apos;établissement conserve le droit d&apos;exporter l&apos;intégralité de ses bases de données d&apos;élèves et de bulletins.
            </p>
          </section>

          {/* 7. Propriété intellectuelle */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-school-primary rounded-full"></span>
              7. Propriété intellectuelle
            </h2>
            <p>
              L&apos;ensemble des architectures logicielles, algorithmes de calcul de notes, modèles de bulletins officiels, logos, marques et interfaces graphiques d&apos;EducoGest demeure la propriété exclusive de l&apos;éditeur.
            </p>
          </section>

          {/* 8. Limitation de responsabilité */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-school-primary rounded-full"></span>
              8. Limitation de responsabilité
            </h2>
            <p>
              EducoGest s&apos;engage à une obligation de moyens pour assurer la disponibilité continue du service (objectif de disponibilité de 99.8%). L&apos;éditeur ne saurait être tenu responsable des conséquences résultant d&apos;une mauvaise saisie de notes ou d&apos;une défaillance du réseau électrique ou Internet local de l&apos;établissement.
            </p>
          </section>

        </div>

      </main>

      <PublicFooter />
    </div>
  );
}
