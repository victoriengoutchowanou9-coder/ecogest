"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Clock,
  Phone,
  MessageSquare,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Headphones,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function PolitiqueSupportPage() {
  const slaLevels = [
    {
      level: "Niveau 1 : Urgence Critique",
      sla: "< 15 minutes",
      cases: "Blocage complet d'accès au progiciel, indisponibilité du serveur en pleine délibération de bulletins ou session d'examens.",
      action: "Prise en charge immédiate par un ingénieur d'astreinte avec appel téléphonique direct.",
    },
    {
      level: "Niveau 2 : Incident Important",
      sla: "< 2 heures ouvrées",
      cases: "Difficulté de calcul sur une matière spécifique, anomalie d'affichage sur un reçu d'écolage ou blocage d'un compte enseignant.",
      action: "Diagnostic à distance, rectification de paramétrage ou télémaintenance assistée.",
    },
    {
      level: "Niveau 3 : Question d'Usage & Configuration",
      sla: "< 6 heures ouvrées",
      cases: "Demande de conseil sur la configuration des coefficients, ajout de division ou aide à l'archivage annuel.",
      action: "Accompagnement méthodologique et mise à disposition des guides pas à pas.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <PublicNavbar currentPath="/politique-support" />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-school-primary text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-school-200">
          <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
          <span>CONDITIONS &amp; CHARTE DE SERVICE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
          Politique de soutien EducoGest
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Notre engagement formel pour assurer la continuité opérationnelle, la réactivité et la sérénité de vos équipes pédagogiques.
        </p>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 flex-1 w-full text-xs text-slate-700 leading-relaxed">
        
        {/* Section 1 : Horaires et Canaux */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Clock className="w-6 h-6 text-school-primary" />
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                1. Horaires et Canaux de Prise en Charge
              </h2>
              <p className="text-slate-500 text-xs">Disponibilité garantie pour l&apos;ensemble de nos abonnés.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-xs">Horaires d&apos;ouverture standard</span>
              <p className="text-slate-600">
                Du <strong>Lundi au Vendredi</strong> : 07h30 à 19h00 (UTC+1)<br />
                Le <strong>Samedi</strong> : 08h00 à 14h00 (UTC+1)
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-emerald-950">
              <span className="font-bold block text-xs">Permanence périodes d&apos;examens et bulletins</span>
              <p className="text-emerald-800">
                Astreinte étendue jusqu&apos;à <strong>21h30</strong> en fin de trimestre lors des clôtures de conseils de classe et des délibérations.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-900 block">Canaux d&apos;accès autorisés :</span>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Lignes téléphoniques officielles ECOGEST (+229 0155445122 / +2290161771334)</li>
              <li>WhatsApp officiel ECOGEST (+22955445122 / +229 61 77 13 34) avec possibilité d&apos;envoi de captures et vocaux</li>
              <li>Chat d&apos;assistance interactif intégré au logiciel</li>
              <li>Courriel de ticketing (support@educogest.bj)</li>
            </ul>
          </div>
        </section>

        {/* Section 2 : Engagements SLA */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                2. Niveaux de Service &amp; Temps de Réponse (SLA)
              </h2>
              <p className="text-slate-500 text-xs">Classification objective des demandes et délais maximaux.</p>
            </div>
          </div>

          <div className="space-y-4">
            {slaLevels.map((sla, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{sla.level}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-school-primary text-white">
                    Garantie : {sla.sla}
                  </span>
                </div>
                <p className="text-slate-600 text-xs">
                  <strong>Cas types :</strong> {sla.cases}
                </p>
                <p className="text-slate-500 text-[11px] italic">
                  <strong>Action mise en œuvre :</strong> {sla.action}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 : Assistance à la configuration & technique */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                3. Types de Problèmes Pris en Charge
              </h2>
              <p className="text-slate-500 text-xs">Périmètre d&apos;intervention couvert par votre abonnement.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">Assistance à la Configuration</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Aide au paramétrage des filières, divisions et matières du cursus béninois.</li>
                <li>Importation initiale des listes d&apos;élèves et professeurs depuis vos fichiers Excel.</li>
                <li>Configuration des tranches d&apos;écolage et des dates d&apos;échéance.</li>
                <li>Mise en page des en-têtes officiels avec logo de l&apos;école.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">Assistance Technique &amp; Logicielle</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Résolution des messages d&apos;erreur ou de blocage de session.</li>
                <li>Vérification de l&apos;intégrité cryptographique des coffres-forts ENCv1.</li>
                <li>Aide à l&apos;impression des bulletins PDF grand format ou registres.</li>
                <li>Récupération et restauration des données en cas de manipulation erronée.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4 : Procédure d'Urgence 24/7 */}
        <section className="bg-linear-to-r from-slate-900 to-school-primary text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-black text-white">Procédure en Cas de Problème Urgent (Astreinte 24/7)</h3>
          </div>
          <p className="text-slate-200 text-xs leading-relaxed">
            Si votre établissement rencontre une indisponibilité bloquante en dehors des heures ouvrées lors d&apos;une délibération cruciale, composez immédiatement notre ligne d&apos;astreinte 24/7 au <strong>+229 97 00 11 22</strong> en précisant votre code établissement.
          </p>
          <div className="pt-2">
            <Link
              href="/assistance"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shadow-xs"
            >
              <span>Accéder aux contacts d&apos;assistance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
