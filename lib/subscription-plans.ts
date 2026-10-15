// =============================================================================
// FORMULES D'ABONNEMENT — EDUCOGEST PRO
// Module partagé (Client & Serveur) sans dépendances React
// =============================================================================

export type SchoolPlanCode = "BASIC" | "STANDARD" | "PREMIUM";
export type ParentPlanCode = "PARENT_1" | "PARENT_2";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "TRIAL";

export interface SchoolPlanDefinition {
  code: SchoolPlanCode;
  name: string;
  tagline: string;
  priceFcfa: number;
  period: string;
  maxSchools: number;
  maxUsers: number | null; // null = illimité
  popular?: boolean;
  features: string[];
}

export interface ParentPlanDefinition {
  code: ParentPlanCode;
  name: string;
  tagline: string;
  priceFcfa: number;
  period: string;
  maxChildren: number;
  popular?: boolean;
  features: string[];
}

export const SCHOOL_PLANS: Record<SchoolPlanCode, SchoolPlanDefinition> = {
  BASIC: {
    code: "BASIC",
    name: "Formule Basic",
    tagline: "Idéal pour petits établissements démarrant la numérisation",
    priceFcfa: 6000,
    period: "mois",
    maxSchools: 1,
    maxUsers: 5,
    features: [
      "1 seul établissement scolaire",
      "Jusqu'à 5 utilisateurs actifs (Directeur, Censeur, Comptable, 2 Enseignants)",
      "Gestion administrative des classes et des effectifs",
      "Saisie et calcul automatique des notes (interros ÷ 3, devoirs ÷ 3)",
      "Génération des bulletins scolaires officiels A4",
      "Encaissement de scolarité en espèces & reçus imprimables",
    ],
  },
  STANDARD: {
    code: "STANDARD",
    name: "Formule Standard",
    tagline: "Pour collèges et lycées avec équipe pédagogique complète",
    priceFcfa: 10000,
    period: "mois",
    maxSchools: 1,
    maxUsers: 25,
    popular: true,
    features: [
      "1 seul établissement scolaire",
      "Jusqu'à 25 utilisateurs actifs (Directeur, Censeur, Comptable, 22 Enseignants)",
      "Toutes les fonctionnalités de la Formule Basic",
      "Registre d'émargement et pointage numérique des professeurs",
      "Cahier de textes numérique avec impression officielle de séance",
      "Alertes de notes manquantes et relances automatiques",
      "Tableau de bord financier animé & suivi du reste à recouvrer",
      "Gestion des salaires et suivi des dépenses",
    ],
  },
  PREMIUM: {
    code: "PREMIUM",
    name: "Formule Premium",
    tagline: "Multi-établissements et utilisateurs illimités pour groupes scolaires",
    priceFcfa: 25000,
    period: "mois",
    maxSchools: 2,
    maxUsers: null, // illimité
    features: [
      "Jusqu'à 2 établissements scolaires distincts",
      "Même compte Directeur/Admin pour piloter les 2 établissements",
      "Nombre d'utilisateurs ILLIMITÉ pour chaque établissement",
      "Cloisonnement strict : élèves, classes, notes et finances 100% étanches",
      "Nom, logo, image de couverture, pays et ville propres à chaque école",
      "Toutes les fonctionnalités pédagogiques, financières et administratives",
      "Bascule instantanée d'un établissement à l'autre en un clic",
      "Support prioritaire 7j/7 et sauvegardes renforcées",
    ],
  },
};

export const PARENT_PLANS: Record<ParentPlanCode, ParentPlanDefinition> = {
  PARENT_1: {
    code: "PARENT_1",
    name: "Parent 1",
    tagline: "Suivi scolaire complet pour 1 élève",
    priceFcfa: 200,
    period: "mois",
    maxChildren: 1,
    features: [
      "Accès au suivi d'un (1) seul élève",
      "Consultation des notes et moyennes certifiées",
      "Suivi exclusif des absences et retards",
      "Emploi du temps hebdomadaire avec noms des professeurs",
      "Consultation du cahier de textes et devoirs à faire",
      "Dates des évaluations et devoirs surveillés programmés",
      "Historique du solde de scolarité et tranches réglées",
      "Vérification d'accès sécurisée par le Censeur des études",
    ],
  },
  PARENT_2: {
    code: "PARENT_2",
    name: "Parent 2",
    tagline: "Formule famille : jusqu'à 2 élèves",
    priceFcfa: 300,
    period: "mois",
    maxChildren: 2,
    popular: true,
    features: [
      "Accès au suivi de deux (2) élèves maximum",
      "Toutes les fonctionnalités de la formule Parent 1",
      "Bascule instantanée entre les enfants en un clic",
      "Suivi individualisé des absences et retards pour chaque enfant",
      "Consultation séparée des bulletins et des devoirs",
      "Économique pour les fratries inscrites dans l'établissement",
      "Vérification sécurisée par matricule pour chaque élève",
    ],
  },
};

export interface SchoolProfile {
  id: string;
  code: string;
  name: string;
  shortName: string;
  slug: string;
  logo: string;
  coverImage?: string;
  country: string;
  region: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  devise: string;
  currency: string;
  activeYear: string;
}
