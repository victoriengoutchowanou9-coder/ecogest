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
  Smartphone,
  Terminal,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function MisesAJourPage() {
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  const releases = [
    {
      version: "ECOGEST 3.3.7",
      date: "19 Octobre 2026",
      badge: "Supervision Développeur & Suppression Sécurisée de Comptes",
      badgeColor: "bg-rose-600 text-white",
      summary: "Capacité accordée au développeur et à l'administrateur technique de supprimer définitivement un compte utilisateur (tous rôles confondus). Intégration d'un endpoint API DELETE sécurisé, d'une modale de confirmation avec saisie obligatoire de l'e-mail de validation, d'une journalisation d'audit critique et de la protection inviolable des comptes développeurs racines.",
      sections: [
        {
          type: "Suppression Définitive & API Backend Sécurisée",
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
          items: [
            "Implémentation de l'endpoint DELETE /api/dev-admin/users protégé par authentification développeur obligatoire.",
            "Suppression effective et immédiate dans la table school_users de la base PostgreSQL Supabase.",
            "Traçabilité totale : enregistrement automatique dans system_audit_logs d'un événement critique (SUPPRESSION_COMPTE) consignant l'identité de l'opérateur, la cible et le motif.",
          ],
        },
        {
          type: "Sécurité & Protection Anti-Erreur",
          icon: <CheckCircle2 className="w-4 h-4 text-blue-600" />,
          items: [
            "Interdiction absolue et verrouillée côté serveur de supprimer un compte DEVELOPPEUR ou son propre compte connecté.",
            "Modale de confirmation renforcée exigeant la saisie exacte de l'adresse e-mail de l'utilisateur ciblé avant toute suppression.",
            "Possibilité d'ajouter un motif explicite consigné pour l'historique d'exploitation technique.",
          ],
        },
        {
          type: "Interface Développeur & Expérience Utilisateur",
          icon: <Layout className="w-4 h-4 text-slate-700" />,
          items: [
            "Bouton d'action directe de suppression (icône Corbeille) sur chaque ligne du tableau de supervision.",
            "Bouton de suppression également accessible directement depuis la modale de fiche détaillée d'un utilisateur.",
            "Actualisation instantanée des listes et des compteurs métriques du tableau de bord.",
          ],
        },
      ],
    },
    {
      version: "ECOGEST 3.3.6",
      date: "19 Octobre 2026",
      badge: "Persistance Session Supabase & Maintien Connexion",
      badgeColor: "bg-school-primary text-white",
      summary: "Correction critique du comportement de déconnexion automatique lors de l'actualisation de la page. Intégration complète de la persistance de session Supabase (Supabase Auth & PostgreSQL), écran de chargement de vérification asynchrone, élimination de tout fallback local non sécurisé et clôture propre des sessions lors de la déconnexion.",
      sections: [
        {
          type: "Persistance & Restauration de Session Supabase",
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
          items: [
            "Supabase maintenu comme unique source de vérité : vérification systématique de l'authenticité de la session via getSession(), getUser() et l'API serveur sécurisée /api/auth/session.",
            "Suppression définitive de tout stockage de session non vérifié dans localStorage ou sessionStorage.",
            "Conservation ininterrompue de l'utilisateur connecté, de son rôle, de son établissement et de ses permissions lors du rechargement de page (F5) et de la réouverture d'onglet.",
          ],
        },
        {
          type: "Protection des Routes & Expérience Utilisateur",
          icon: <Layout className="w-4 h-4 text-slate-700" />,
          items: [
            "Introduction d'un état d'attente de chargement (isLoading / isInitialized) dans AppShell pour empêcher toute redirection prématurée vers la page de connexion.",
            "Affichage d'un écran de chargement fluide et sécurisé (« Vérification de la session en cours... Connexion sécurisée avec Supabase ») pendant la validation de la session.",
            "Redirection vers /connexion exécutée uniquement si Supabase a formellement conclu à l'absence de session valide ou à un compte suspendu.",
          ],
        },
        {
          type: "Déconnexion Sécurisée & Session Serveur",
          icon: <CheckCircle2 className="w-4 h-4 text-blue-600" />,
          items: [
            "Mise à jour du bouton de déconnexion dans la barre latérale pour invoquer supabase.auth.signOut(), révoquer le cookie de session sécurisé et purger l'état mémoire.",
            "Gestion de la tolérance réseau : les micro-coupures de connexion temporaires ne déclenchent plus de déconnexion brutale de l'utilisateur.",
          ],
        },
      ],
    },
    {
      version: "ECOGEST 3.3.5",
      date: "19 Octobre 2026",
      badge: "Synchronisation Supervision Développeur & Base Supabase",
      badgeColor: "bg-emerald-600 text-white",
      summary: "Synchronisation complète en temps réel entre les comptes établissements et l'espace « Développeur & Supervision technique ». Affichage de l'identifiant normalisé (ex: 4345DIR01), de la fonction officielle « Direction Générale », statut du compte, et réconciliation automatique des comptes lors de l'inscription et de la connexion.",
      sections: [
        {
          type: "Synchronisation Base de Données Supabase",
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
          items: [
            "Enregistrement immédiat et automatisé de chaque établissement et responsable dans les tables distantes Supabase (schools et school_users).",
            "Création de l'endpoint de synchronisation continue (/api/auth/sync) pour garantir le rattachement de tous les comptes à la supervision centrale.",
            "Normalisation et persistance de l'identifiant directeur et de la fonction « Direction Générale ».",
          ],
        },
        {
          type: "Espace Développeur & Supervision Technique",
          icon: <Layout className="w-4 h-4 text-slate-700" />,
          items: [
            "Affichage dédié de la colonne Identifiant Officiel (ex : 4345DIR01) dans la table de supervision des utilisateurs.",
            "Attribution du badge officiel « Direction Générale » pour les comptes de direction d'établissement.",
            "Maintien de la confidentialité totale de la console développeur, inaccessible et invisible sur les interfaces publiques.",
          ],
        },
      ],
    },
    {
      version: "ECOGEST 3.3.4",
      date: "19 Octobre 2026",
      badge: "Épuration Interface & Clarté Visuelle",
      badgeColor: "bg-slate-800 text-white",
      summary: "Épuration ciblée de la barre de navigation logicielle : suppression du bouton profil utilisateur et de son menu déroulant en haut à droite pour offrir un espace de travail visuellement plus propre et aéré, tout en préservant l'accès direct aux fonctions de déconnexion et de profil.",
      sections: [
        {
          type: "Épuration de la Barre Supérieure (Topbar)",
          icon: <Layout className="w-4 h-4 text-slate-700" />,
          items: [
            "Suppression du bouton menu profil utilisateur (avatar circulaire, nom, rôle et chevron) situé en haut à droite de l'écran.",
            "Suppression du menu contextuel flottant redondant au profit d'une interface plus légère et sans encombrement.",
            "Conservation intacte des contrôles essentiels : sélecteur de l'année scolaire active, raccourci de forfait pour la direction et bouton PWA.",
          ],
        },
        {
          type: "Ergonomie & Continuité des Accès",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          items: [
            "Accès fluide et sécurisé à la déconnexion directement depuis la barre latérale gauche (Sidebar) et le tiroir mobile.",
            "Préservation complète de toutes les fonctionnalités métier et des profils selon chaque rôle utilisateur.",
          ],
        },
      ],
    },
    {
      version: "ECOGEST 3.3.3",
      date: "19 Octobre 2026",
      badge: "Sécurité & Authentification Développeur Furtive",
      badgeColor: "bg-indigo-600 text-white",
      summary: "Suppression définitive de tout élément visuel public vers l'espace développeur, authentification unique et invisible via la page de connexion standard, détection serveur du rôle développeur sans fuite d'informations, redirection automatique sécurisée, middleware de protection des routes et verrouillage RLS strict des tables techniques.",
      sections: [
        {
          type: "Confidentialité & Page de Connexion Standard",
          icon: <ShieldCheck className="w-4 h-4 text-indigo-600" />,
          items: [
            "Suppression totale du lien public « Espace Développeur & Supervision Technique → » sur ordinateur et mobile.",
            "Formulaire de connexion unifié : les développeurs et administrateurs techniques s'authentifient via la page de connexion standard comme tous les autres utilisateurs.",
            "Zéro fuite d'information : en cas d'erreur de mot de passe ou d'identifiant, un message neutre unique (« Identifiant ou mot de passe incorrect. ») est renvoyé sans révéler le statut ou l'existence d'un compte développeur.",
            "Suppression de la page dédiée de connexion technique : toute tentative d'accès manuel à l'ancienne URL est automatiquement déroutée vers la connexion standard.",
          ],
        },
        {
          type: "Contrôle Serveur, Middleware & Sécurité RLS",
          icon: <Terminal className="w-4 h-4 text-purple-600" />,
          items: [
            "Détection serveur dynamique : vérification de rôle effectuée exclusivement côté serveur avec hachage cryptographique PBKDF2 et comparaison en temps constant.",
            "Middleware Next.js strict : intercepte immédiatement tout accès à l'espace /dev-admin/* et exige un jeton chiffré et signé valide (redirection HTTP automatique vers /connexion).",
            "Politiques RLS Supabase verrouillées : interdiction de lecture publique sur les tables techniques (developer_sessions et system_audit_logs), accès restreint au service_role.",
            "Déconnexion sécurisée : la clôture de session développeur redirige immédiatement vers la page de connexion principale avec purge du cookie HttpOnly.",
          ],
        },
      ],
    },
    {
      version: "ECOGEST 3.3.2",
      date: "19 Octobre 2026",
      badge: "Refonte Forfaits & Quotas Établissement",
      badgeColor: "bg-emerald-600 text-white",
      summary: "Harmonisation complète des forfaits d'abonnement : Starter Gratuit 1 mois à 0 FCFA avec 20 utilisateurs établissement, Formule Starter payante à 6 000 FCFA/mois portée à 40 utilisateurs, Formule Pro étendue à 70 utilisateurs à 10 000 FCFA/mois, sanctuarisation de l'exclusion des comptes parents des plafonds de quotas, synchronisation intégrale du tunnel d'inscription, du panneau directeur et de la console développeur.",
      sections: [
        {
          type: "Nouvelle Grille Tarifaire & Quotas Établissement",
          icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
          items: [
            "Starter Gratuit (1 mois offert) : 0 FCFA requis à l'inscription, 20 comptes utilisateurs établissement inclus (Directeur, Censeur, Enseignants, Secrétaire, Surveillant).",
            "Formule Starter (Payante) : 6 000 FCFA/mois, quota augmenté à 40 utilisateurs établissement (sans gratuité associée) pour établissements en phase de croissance.",
            "Formule Pro : 10 000 FCFA/mois, capacité étendue à 70 utilisateurs établissement pour collèges et lycées avec équipe pédagogique complète.",
            "Formule Premium : 25 000 FCFA/mois, pilotage de 2 établissements scolaires complets avec nombre d'utilisateurs établissement illimité.",
            "Sanctuarisation des comptes Parents : les parents d'élèves sont gérés séparément et ne sont plus jamais décomptés du quota d'utilisateurs de l'école.",
          ],
        },
        {
          type: "Tunnel d'Inscription & Interfaces Directeurs",
          icon: <Layers className="w-4 h-4 text-school-primary" />,
          items: [
            "Inscription école optimisée : sélection immédiate du Starter Gratuit 1 mois à la création de l'établissement sans carte bancaire ni paiement préalable.",
            "Bannières contextuelles dynamiques : messages d'explication et de confirmation transparents selon le forfait choisi lors de l'enregistrement.",
            "Espace Directeur & Paramètres : affichage transparent des nouveaux plafonds (20, 40, 70 ou illimités) et boutons de surclassement directs.",
            "Console Développeur synchronisée : sélection des forfaits avec libellés et quotas actualisés pour les attributions manuelles et le suivi.",
          ],
        },
      ],
    },
    {
      version: "ECOGEST 3.3",
      date: "18 Octobre 2026",
      badge: "PWA Installable & Espace Développeur Centralisé",
      badgeColor: "bg-school-primary text-white",
      summary: "Transformation progressive web app (PWA) installable sur Android, iOS (iPhone/iPad), Windows et macOS avec raccourci dédié, icônes officielles, cache sécurisé sans mise en cache des données privées, et déploiement complet de la console technique de supervision Développeur.",
      sections: [
        {
          type: "Installation PWA Multi-Plateforme",
          icon: <Smartphone className="w-4 h-4 text-emerald-600" />,
          items: [
            "Application installable sur mobile et ordinateur : raccourci sur écran d'accueil/bureau, lancement en mode autonome sans barre d'adresse du navigateur.",
            "Lancement direct vers la Connexion : l'application installée ouvre automatiquement la page de connexion sécurisée dès son ouverture par l'utilisateur.",
            "Bouton élégant « Installer ECOGEST » intégré dans toutes les barres de navigation (Administration, Développeur et Site Public) se masquant automatiquement une fois installé.",
            "Guide pas à pas interactif adapté par système d'exploitation (Safari iOS bouton Partager, Chrome Android, Chrome/Edge Desktop).",
            "Service Worker v3.3 sécurisé : zéro mise en cache des données scolaires privées (notes, finances, utilisateurs, Supabase direct) et basculement propre hors-ligne.",
            "Système de détection de nouvelle version avec actualisation en un clic.",
          ],
        },
        {
          type: "Espace Développeur & Supervision Technique",
          icon: <Terminal className="w-4 h-4 text-purple-600" />,
          items: [
            "Console technique de supervision reprenant la charte ergonomique officielle ECOGEST.",
            "Tableau de bord de télémétrie en temps réel : établissements actifs, volume d'élèves, enseignants, personnels, santé système et alertes.",
            "Supervision des établissements, des comptes utilisateurs et des abonnements avec filtres avancés.",
            "Journal d'audit des activités techniques et suivi centralisé des incidents & erreurs applicatives.",
            "Gestion autonome du profil développeur et sécurité des sessions.",
          ],
        },
      ],
    },
    {
      version: "ECOGEST 3.2",
      date: "18 Octobre 2026",
      badge: "Sécurité, Isolation Multi-Établissements & Autonomie",
      badgeColor: "bg-school-primary text-white",
      summary: "Mise à jour majeure de sécurité et d'autonomie : gestion autonome et réinitialisation sécurisée du mot de passe par code OTP (sans intervention du directeur), alignement responsive du bouton Profil dans toute la navigation (Sidebar, Topbar et barre mobile), isolation étanche des données par établissement (client & Supabase RLS) et résolution de l'exception client sur l'enregistrement du personnel.",
      sections: [
        {
          type: "Autonomie & Sécurité du Mot de Passe",
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
          items: [
            "Modification autonome du mot de passe dans tous les profils (Directeur, Censeur, Secrétariat, Surveillant, Enseignant, Comptabilité, Parent) : ancien mot de passe, nouveau mot de passe et confirmation avec visibilité sécurisée.",
            "Procédure « Mot de passe oublié ? » sur la page de connexion : récupération autonome par code de sécurité OTP à 6 chiffres valide 15 minutes, sans devoir contacter le directeur.",
            "Route API /api/auth/password pour synchronisation et hachage en base de données Supabase (school_users).",
          ],
        },
        {
          type: "Isolation Totale Multi-Établissements",
          icon: <Layers className="w-4 h-4 text-purple-600" />,
          items: [
            "Cloisonnement strict par établissement : aucun établissement ne peut accéder aux élèves, finances, classes, cours ou personnels d'un autre établissement.",
            "Migration de tous les stores vers des clés partitionnées par identifiant d'établissement (school_id).",
            "Politiques de sécurité Supabase RLS (Row Level Security) éliminant les accès permissifs et vérifiant systématiquement le rattachement school_id.",
          ],
        },
        {
          type: "Repositionnement du Profil & Fiabilité",
          icon: <Layout className="w-4 h-4 text-blue-600" />,
          items: [
            "Alignement visuel du Profil : intégration dans la navigation principale de tous les rôles, sur ordinateur et dans la barre d'onglets mobile (BottomTabBar à 5 accès réguliers).",
            "Correction de l'erreur client lors de l'enregistrement des personnels : sécurisation des valeurs indéfinies et liaison automatique à l'établissement actif.",
          ],
        },
      ],
    },
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
