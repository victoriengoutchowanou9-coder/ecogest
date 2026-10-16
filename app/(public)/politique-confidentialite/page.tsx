"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Database,
  UserCheck,
  FileText,
  KeyRound,
  EyeOff,
  Scale,
  Sparkles,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <PublicNavbar currentPath="/politique-confidentialite" />

      {/* Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-school-primary text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-school-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>PROTECTION &amp; SOUVERAINETÉ DES DONNÉES</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
          Politique de Confidentialité
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Protection des données à caractère personnel, chiffrement au repos ENCv1 et conformité APDP Bénin.
        </p>

        {/* Tab switcher */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
          <Link
            href="/conditions-utilisation"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white hover:text-school-200 transition"
          >
            Conditions d&apos;utilisation
          </Link>
          <span className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 shadow-sm">
            Politique de confidentialité
          </span>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 flex-1 w-full text-xs text-slate-700 leading-relaxed">
        
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
          
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <span className="text-[11px] font-mono text-slate-400">Norme active : ENCv1 &bull; Révision Octobre 2026</span>
            <p className="text-slate-600 text-xs">
              La présente Politique de Confidentialité expose les engagements stricts pris par EducoGest quant à la collecte, au traitement, au chiffrement et à la conservation des données scolaires et personnelles.
            </p>
          </div>

          {/* 1. Données collectées */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full"></span>
              1. Données collectées
            </h2>
            <p>
              Dans le cadre de l&apos;exploitation du progiciel, les catégories de données suivantes sont recueillies :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Données des élèves :</strong> nom, prénoms, date et lieu de naissance, matricule, identifiant EducMaster, classe, notes, moyennes, appréciations, assiduité, fiche médicale d&apos;urgence et dossier disciplinaire.</li>
              <li><strong>Données des parents / tuteurs :</strong> nom, prénom, numéro de téléphone, adresse email et reçus de règlement des écolages.</li>
              <li><strong>Données des enseignants et personnels :</strong> nom, prénom, spécialité académique, volume d&apos;heures enseignées et relevé d&apos;émargement.</li>
            </ul>
          </section>

          {/* 2. Utilisation des données */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full"></span>
              2. Utilisation des données
            </h2>
            <p>
              Les données sont utilisées exclusivement pour le suivi pédagogique de l&apos;élève, l&apos;édition des bulletins officiels, la gestion de la trésorerie scolaire et la communication école-famille. <strong>EducoGest ne vend, ne commercialise et ne loue aucune donnée scolaire à des tiers ou annonceurs publicitaires.</strong>
            </p>
          </section>

          {/* 3. Protection et Chiffrement des données au repos (ENCv1) */}
          <section className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>3. Protection et Chiffrement des données au repos (Norme ENCv1)</span>
            </div>
            <p className="text-slate-600">
              Conformément aux normes les plus strictes de sécurité, les informations sensibles (antécédents médicaux, allergies, numéros d&apos;urgence, sanctions disciplinaires) sont <strong>chiffrées au repos</strong> via des algorithmes de niveau militaire (AES-GCM 256 bits).
            </p>
            <p className="text-slate-600">
              Chaque établissement scolaire dispose d&apos;une clé cryptographique isolée (Master Tenant Key). Tout accès aux données chiffrées est consigné de manière immuable dans le registre d&apos;audit de l&apos;établissement.
            </p>
          </section>

          {/* 4. Données des élèves et dossiers médicaux */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full"></span>
              4. Données des élèves et dossiers médicaux
            </h2>
            <p>
              Les données de santé (groupe sanguin, allergies, consignes d&apos;urgence) sont strictement cloisonnées : seuls le Directeur, le Censeur et le personnel de santé scolaire agréé disposent de l&apos;autorisation d&apos;accès. Les professeurs et comptables n&apos;ont aucune visibilité sur ces fiches confidentielles.
            </p>
          </section>

          {/* 5. Conservation et suppression des données */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full"></span>
              5. Conservation et suppression des données
            </h2>
            <p>
              Les dossiers scolaires sont conservés de manière pérenne pour permettre la réadmission ultérieure d&apos;un élève ou la réédition de duplicatas de bulletins officiels. En cas de départ définitif, l&apos;apprenant est basculé sous le statut d&apos;archive historique sans suppression destructrice. La suppression définitive peut être demandée par le représentant légal selon les dispositions de la loi.
            </p>
          </section>

          {/* 6. Droits des utilisateurs */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full"></span>
              6. Droits des utilisateurs (Accès, Rectification, Suppression)
            </h2>
            <p>
              Tout parent ou apprenant dispose d&apos;un droit d&apos;accès, de rectification et d&apos;opposition concernant ses données personnelles, exerçable directement auprès du secrétariat de son établissement ou par courriel à <strong>privacy@educogest.bj</strong>.
            </p>
          </section>

          {/* 7. Sécurité des Sauvegardes */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full"></span>
              7. Sécurité des Sauvegardes
            </h2>
            <p>
              Des instantanés de sauvegarde redondants sont générés quotidiennement et stockés sur des serveurs chiffrés géo-distribués. En cas de défaillance matérielle d&apos;un appareil de l&apos;école, les données sont immédiatement restaurées sans altération de la scolarité.
            </p>
          </section>

          {/* 8. Cookies et traceurs */}
          <section className="space-y-2 pt-2 border-t border-slate-100" id="cookies">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-amber-500 rounded-full"></span>
              8. Politique relative aux Cookies
            </h2>
            <p>
              EducoGest utilise uniquement des cookies et tokens de session strictement indispensables au fonctionnement technique de la plateforme (authentification sécurisée, mémorisation de l&apos;enfant sélectionné, préférences linguistiques). Aucun cookie tiers de profilage commercial ou publicitaire n&apos;est utilisé sur nos applications.
            </p>
          </section>

        </div>

      </main>

      <PublicFooter />
    </div>
  );
}
