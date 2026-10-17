"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  History,
  Sparkles,
  ShieldCheck,
  Zap,
  Bug,
  Layout,
  Layers,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Tag,
  Search,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function MisesAJourPage() {
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  const releases = [
    {
      version: "ECOGEST 3.1",
      date: "Octobre 2026",
      badge: "Documents Responsives & Sécurité des Rôles",
      badgeColor: "bg-emerald-600 text-white",
      summary: "Refonte ergonomique et responsive des attestations et documents scolaires officiels (format A4 certifié Bénin, contrôles de zoom pour ordinateur), bouton d'abonnement établissement réservé au Directeur seul et console support technique réservée au profil Développeur.",
      sections: [
        {
          type: "Génération de Documents & Attestations",
          icon: <Sparkles className="w-4 h-4 text-purple-600" />,
          items: [
            "Affichage 100% responsive sur ordinateurs, PC portables et tablettes : intégration d'une barre d'outils avec zoom dynamique (80% à 120%) évitant tout débordement ou troncature.",
            "Conformité réglementaire République du Bénin : armoiries, devise, en-tête ministériel, cartouche de signature double (Secrétaire pédagogique & Chef d'établissement) et code de vérification anti-fraude.",
            "Impression haute fidélité A4 : feuille de style d'impression (@media print) dédiée garantissant une sortie papier ou PDF standardisée sans éléments d'interface parasites.",
          ],
        },
        {
          type: "Cloisonnement & Permissions",
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
          items: [
            "Bouton d'abonnement établissement restreint : affiché uniquement pour le compte du Directeur de l'établissement (masqué pour le Secrétariat, le Surveillant général, les Enseignants, le Censeur et la Comptabilité).",
            "Console Support technique réservée au Développeur : déplacée exclusivement dans la console d'administration développeur (/dev-admin) pour la gestion centrale des tickets.",
          ],
        },
      ],
    },
    {
      version: "ECOGEST 3.0",
      date: "Octobre 2026",
      badge: "Mise à jour Majeure : Vie Scolaire & Secrétariat",
      badgeColor: "bg-school-primary text-white",
      summary: "Intégration institutionnelle complète des espaces Secrétariat Pédagogique et Surveillant Général, séparation stricte des responsabilités administratives et disciplinaires, génération des documents scolaires officiels A4 et base de données commune temps réel pour chaque établissement.",
      sections: [
        {
          type: "Espace Secrétariat Pédagogique",
          icon: <Sparkles className="w-4 h-4 text-purple-600" />,
          items: [
            "Gestion administrative des élèves : inscription complète, attribution automatique des matricules et identifiants nationaux, affectation et réaffectation de classe, gestion des transferts et sorties.",
            "Dossiers et documents scolaires officiels A4 : génération et impression immédiate avec en-tête République du Bénin du Certificat de scolarité, Attestation de fréquentation, Certificat de radiation, Fiche d'inscription et Fiche individuelle de l'élève.",
            "Gestion des parents/tuteurs : répertoire de contact, association parent → enfants et vérification des demandes d'accès.",
            "Protection stricte des responsabilités : consultation seule des classes créées par le Directeur/Censeur et consultation/impression des bulletins validés sans possibilité de modifier une note.",
          ],
        },
        {
          type: "Espace Surveillant Général & Vie Scolaire",
          icon: <Zap className="w-4 h-4 text-rose-600" />,
          items: [
            "Tableau de bord de discipline : suivi en direct des présents, absents, retards minutés, incidents ouverts, sanctions en cours et alertes de récidive.",
            "Pointage et présences : appel par classe avec enregistrement des retards en minutes, motifs, validation des justificatifs et registre des sorties exceptionnelles en journée.",
            "Gestion des incidents disciplinaires : consignation détaillée (élève, classe, date/heure, type de fait, description, témoins, action prise, statut) avec historique disciplinaire complet.",
            "Workflow de validation des sanctions : encadrement hiérarchique avec visa obligatoire du Directeur pour les sanctions lourdes (retenues, exclusions temporaires) avant notification aux parents.",
            "Organisation de la surveillance : planning et répartition des surveillants par zone (entrées, sorties, récréations, couloirs, cour, examens).",
            "Communication et convocations : émission de demandes de justificatifs, convocations de parents et traçabilité des réponses.",
          ],
        },
        {
          type: "Base de Données Commune & Synchronisation",
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
          items: [
            "Source unique de vérité : une classe ou un élève créé par le Directeur ou le Secrétariat apparaît instantanément pour le Censeur, le Surveillant général, les Enseignants et les Parents.",
            "Aucune ressaisie ou silo de données entre les différents services de l'établissement.",
          ],
        },
      ],
    },
    {
      version: "ECOGEST 2.6",
      date: "Octobre 2026",
      badge: "Censeur & Données Inter-Rôles",
      badgeColor: "bg-slate-700 text-white",
      summary: "Fenêtre de définition de l'heure 100% responsive (Effacer / Annuler / Définir), registre de classe adaptatif (tableau & fiches), affectation automatique multi-classes dans Matières et circulation unifiée des données réelles entre les rôles.",
      sections: [
        {
          type: "Section Censeur & Pédagogie",
          icon: <Zap className="w-4 h-4 text-amber-600" />,
          items: [
            "Fenêtre de définition horaire des examens 100% responsive : boutons Effacer, Annuler et Définir toujours visibles et proportionnés sans débordement sur mobile, tablette et ordinateur.",
            "Registre officiel de classe responsive : bascule d'affichage Tableau officiel / Fiches apprenants avec en-tête national et signatures adaptatifs.",
            "Matières et coefficients : sélection automatique parmi les classes réelles du Directeur avec possibilité d'affecter une matière à plusieurs classes en une seule étape.",
          ],
        },
        {
          type: "Architecture & Données Partagées",
          icon: <Sparkles className="w-4 h-4 text-purple-600" />,
          items: [
            "Synchronisation unifiée et temps réel des classes, enseignants, matières et effectifs entre le Directeur, le Censeur, les Enseignants et les Parents.",
            "Préservation stricte des permissions et des droits d'accès basés sur les rôles.",
          ],
        },
      ],
    },
    {
      version: "ECOGEST 2.5",
      date: "Octobre 2026",
      badge: "Mise à jour Récente",
      badgeColor: "bg-emerald-600 text-white",
      summary: "Harmonisation officielle de la marque ECOGEST, fiche récapitulative de l'établissement, attribution automatique du professeur principal, gestion complète des résultats publics et console de support synchronisée.",
      sections: [
        {
          type: "Nouvelles fonctionnalités",
          icon: <Zap className="w-4 h-4 text-amber-600" />,
          items: [
            "Fiche récapitulative de l'établissement dans les paramètres Directeur avec bascule d'édition et respect strict des quotas multi-établissements.",
            "Sélection automatique du Professeur principal parmi les enseignants enregistrés lors de la création de classe.",
            "Publication des résultats publics d'examens avec gestion complète (création, modification, consultation, visibilité).",
            "Console de support technique alimentée exclusivement par les tickets réels avec suivi persistant des statuts.",
          ],
        },
        {
          type: "Amélioration de l'interface & Clarté",
          icon: <Sparkles className="w-4 h-4 text-purple-600" />,
          items: [
            "Uniformisation du nom officiel ECOGEST sur l'ensemble des interfaces, documents et pages publiques.",
            "Espace Abonnement Directeur recentré sur les informations et tarifs propres à l'établissement.",
          ],
        },
      ],
    },
    {
      version: "ECOGEST 2.4 PRO",
      date: "Octobre 2026",
      badge: "Mise à jour Majeure",
      badgeColor: "bg-school-primary text-white",
      summary: "Intégration du module officiel Examens, des fiches médicales chiffrées (ENCv1), de la gestion des incidents disciplinaires, du Registre de classe officiel (PDF) et du workflow de validation des notes par le Censeur.",
      sections: [
        {
          type: "Nouveau module",
          icon: <Sparkles className="w-4 h-4 text-purple-600" />,
          items: [
            "Module Planification des Examens : calendrier par classe et trimestre, gestion des salles, affectation des surveillants et affichage exclusif côté parents.",
            "Module Registre de Classe Officiel : génération et export en PDF conforme aux directives du Ministère (Bénin).",
            "Module Gestion de la Discipline : consignation des incidents, sanctions, mesures conservatoires et historique persistant.",
          ],
        },
        {
          type: "Amélioration de sécurité",
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
          items: [
            "Chiffrement des données sensibles au repos ENCv1 (AES-GCM 256 bits) : antécédents médicaux, coordonnées parentales et discipline.",
            "Journalisation immuable des accès et contrôles basés sur les rôles (RBAC).",
            "Isolation cryptographique par établissement scolaire.",
          ],
        },
        {
          type: "Nouvelles fonctionnalités",
          icon: <Zap className="w-4 h-4 text-amber-600" />,
          items: [
            "Workflow Censeur : validation de notes par matière, validation globale, demande de correction avec motif et republication certifiée.",
            "Historique permanent des apprenants et moteur de réadmission pour les années scolaires suivantes.",
            "Configuration bivalente complète : Primaire (CI-CM2) et Secondaire (6e-Terminale) avec divisions illimitées.",
          ],
        },
        {
          type: "Corrections de bugs & Performances",
          icon: <Bug className="w-4 h-4 text-rose-600" />,
          items: [
            "Optimisation du temps de calcul des moyennes générales pondérées sur de grands effectifs.",
            "Correction de l'alignement typographique lors de l'impression A4 des bulletins secondaires.",
          ],
        },
      ],
    },
    {
      version: "ECOGEST 2.2",
      date: "Septembre 2026",
      badge: "Cycle Primaire",
      badgeColor: "bg-blue-600 text-white",
      summary: "Refonte de l'évaluation pédagogique pour le cycle primaire avec notation par compétences (A, ECA, NA, EXP) conforme au programme béninois.",
      sections: [
        {
          type: "Nouveau module",
          icon: <Sparkles className="w-4 h-4 text-purple-600" />,
          items: [
            "Bulletin officiel Primaire par domaines de compétences et taux d'acquisition global.",
            "Saisie simplifiée pour les instituteurs avec appréciations prédéfinies.",
          ],
        },
        {
          type: "Amélioration de l'interface",
          icon: <Layout className="w-4 h-4 text-blue-600" />,
          items: [
            "Nouveau sélecteur d'enfant dans l'espace parent pour les fratries inscrites.",
            "Mode d'affichage plein écran pour les fiches de présence et d'émargement.",
          ],
        },
      ],
    },
    {
      version: "ECOGEST 2.0",
      date: "Août 2026",
      badge: "Finances & Salaires",
      badgeColor: "bg-amber-600 text-white",
      summary: "Intégration de la gestion financière avancée, encaissements de scolarités par tranches, reçus sécurisés avec QR Code et livres de dépenses.",
      sections: [
        {
          type: "Nouvelles fonctionnalités",
          icon: <Zap className="w-4 h-4 text-amber-600" />,
          items: [
            "Génération immédiate de reçus de paiement infalsifiables avec QR Code de vérification.",
            "Calcul automatisé des salaires et vacations selon le registre d'émargement des enseignants.",
            "Tableau de bord financier dynamique pour le Directeur et le Comptable.",
          ],
        },
        {
          type: "Améliorations des performances",
          icon: <Zap className="w-4 h-4 text-emerald-600" />,
          items: [
            "Synchronisation locale multi-onglets ultra-rapide sans latence.",
            "Réduction de 40% du poids des bundles JavaScript pour les connexions mobiles modestes.",
          ],
        },
      ],
    },
    {
      version: "ECOGEST 1.5",
      date: "Juin 2026",
      badge: "Liaison Parents",
      badgeColor: "bg-indigo-600 text-white",
      summary: "Lancement officiel du Portail Parent et du système de notifications d'assiduité en temps réel.",
      sections: [
        {
          type: "Nouvelles fonctionnalités",
          icon: <Sparkles className="w-4 h-4 text-purple-600" />,
          items: [
            "Demande d'accès parent sécurisée avec vérification par le Censorat.",
            "Suivi précis des retards et absences par matière.",
            "Consultation mobile des devoirs surveillés et TD.",
          ],
        },
        {
          type: "Corrections de bugs",
          icon: <Bug className="w-4 h-4 text-rose-600" />,
          items: [
            "Résolution des incohérences d'arrondi sur les moyennes trimestrielles à deux décimales.",
          ],
        },
      ],
    },
    {
      version: "ECOGEST 1.0",
      date: "Mars 2026",
      badge: "Lancement Initial",
      badgeColor: "bg-slate-700 text-white",
      summary: "Première version publique du progiciel ECOGEST pour les établissements de Cotonou et Porto-Novo.",
      sections: [
        {
          type: "Nouvelles fonctionnalités",
          icon: <Sparkles className="w-4 h-4 text-purple-600" />,
          items: [
            "Espaces Direction, Censeur, Enseignants et Comptabilité.",
            "Gestion des classes, effectifs et saisie des notes semestrielles et trimestrielles.",
            "Édition des premiers bulletins officiels A4.",
          ],
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <PublicNavbar currentPath="/mises-a-jour" />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-school-primary text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-school-200">
          <History className="w-3.5 h-3.5 text-amber-400" />
          <span>JOURNAL DES ÉVOLUTIONS DU PROGICIEL</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
          Mises à jour &amp; Nouveautés
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Découvrez l&apos;historique chronologique des améliorations continues, modules ajoutés et optimisations de sécurité déployés sur ECOGEST.
        </p>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 flex-1 w-full">
        
        {/* Release Timeline */}
        <div className="space-y-8 relative before:absolute before:inset-0 before:left-5 md:before:left-32 before:w-0.5 before:bg-slate-200">
          {releases.map((rel, idx) => (
            <div key={idx} className="relative flex flex-col md:flex-row gap-6 items-start">
              
              {/* Date Column (Desktop) */}
              <div className="md:w-28 shrink-0 md:text-right pt-2 pl-12 md:pl-0">
                <span className="font-black text-sm text-slate-900 block">{rel.date}</span>
                <span className="text-[11px] text-slate-400 font-mono">Archive légale</span>
              </div>

              {/* Node Dot */}
              <div className="absolute left-3.5 md:left-30 top-2.5 w-3.5 h-3.5 rounded-full bg-school-primary border-4 border-white shadow-sm ring-2 ring-school-primary/20"></div>

              {/* Card Content */}
              <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 ml-10 md:ml-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                        {rel.version}
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${rel.badgeColor}`}>
                        {rel.badge}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 md:hidden mt-0.5 block">{rel.date}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
                    Déployé en production
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {rel.summary}
                </p>

                {/* Subsections of additions */}
                <div className="space-y-4 pt-2">
                  {rel.sections.map((sec, sIdx) => (
                    <div key={sIdx} className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        {sec.icon}
                        <span>{sec.type}</span>
                      </div>
                      <ul className="space-y-1.5 pl-6 text-xs text-slate-600 list-disc">
                        {sec.items.map((item, iIdx) => (
                          <li key={iIdx} className="leading-relaxed">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Suggestion Card */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <h3 className="text-lg font-black text-slate-900">
            Une suggestion pour la prochaine version ?
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Nous co-construisons ECOGEST avec les directeurs, censeurs et enseignants d&apos;Afrique de l&apos;Ouest. Partagez-nous vos besoins pédagogiques.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition shadow-xs"
          >
            <span>Soumettre une idée d&apos;amélioration</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
