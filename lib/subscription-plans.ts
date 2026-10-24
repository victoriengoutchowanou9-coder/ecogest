// =============================================================================
// FORMULES D'ABONNEMENT — ECOGEST PRO
// Module partagé (Client & Serveur) sans dépendances React
// =============================================================================

export type SchoolPlanCode = "STARTER" | "BASIC" | "STANDARD" | "PREMIUM";
export type ParentPlanCode = "PARENT_1" | "PARENT_2";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "TRIAL" | "PENDING_PAYMENT";

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
  STARTER: {
    code: "STARTER",
    name: "Starter Gratuit (1 mois)",
    tagline: "Essai gratuit 1 mois offert · 20 utilisateurs établissement inclus",
    priceFcfa: 0,
    period: "1 mois",
    maxSchools: 1,
    maxUsers: 20,
    features: [
      "1 seul établissement scolaire",
      "1 mois gratuit complet à l'inscription (0 FCFA requis)",
      "Jusqu'à 20 utilisateurs établissement (Directeur, Censeur, Enseignants, etc.)",
      "Les comptes Parents ne sont pas décomptés de cette limite",
      "Gestion administrative des classes, effectifs et matières",
      "Saisie et calcul automatique des notes et moyennes",
      "Génération des bulletins scolaires officiels A4",
      "Encaissement de scolarité & reçus imprimables",
      "Invitation à choisir une formule payante à la fin du mois gratuit",
    ],
  },
  BASIC: {
    code: "BASIC",
    name: "Formule Starter",
    tagline: "Formule payante pour établissements en croissance · 40 utilisateurs",
    priceFcfa: 6000,
    period: "mois",
    maxSchools: 1,
    maxUsers: 40,
    features: [
      "1 seul établissement scolaire",
      "Formule payante (pas de gratuité associée)",
      "Jusqu'à 40 utilisateurs établissement (Directeur, Censeur, Enseignants, etc.)",
      "Les comptes Parents sont gérés séparément (non comptabilisés)",
      "Gestion administrative complète des classes et effectifs",
      "Saisie et calcul automatique des notes et moyennes",
      "Génération des bulletins scolaires officiels A4",
      "Encaissement de scolarité & reçus certifiés",
      "Historique financier et relances de paiement",
    ],
  },
  STANDARD: {
    code: "STANDARD",
    name: "Formule Pro",
    tagline: "Capacité étendue pour collèges et lycées · 70 utilisateurs",
    priceFcfa: 10000,
    period: "mois",
    maxSchools: 1,
    maxUsers: 70,
    popular: true,
    features: [
      "1 seul établissement scolaire",
      "Formule payante à capacité étendue",
      "Jusqu'à 70 utilisateurs établissement (Directeur, Censeur, Comptable, Enseignants)",
      "Les comptes Parents sont gérés séparément (non comptabilisés)",
      "Registre d'émargement et pointage numérique des professeurs",
      "Cahier de textes numérique avec impression officielle de séance",
      "Planification complète des sessions d'examens",
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
      "Nombre d'utilisateurs établissement ILLIMITÉ pour chaque école",
      "Les comptes Parents sont gérés séparément",
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

export type TeachingType = "PRIMAIRE" | "SECONDAIRE" | "PRIMAIRE_SECONDAIRE";

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
  teachingType?: TeachingType;
  directorName?: string;
  directorSignatureUrl?: string;
}
