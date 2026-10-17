"use client";

import { useState, useEffect, useSyncExternalStore } from "react";

// =============================================================================
// TYPES & CONSTANTES DES ABONNEMENTS (RE-EXPORT DE SUBSCRIPTION-PLANS)
// =============================================================================

export {
  SCHOOL_PLANS,
  PARENT_PLANS,
  type SchoolPlanCode,
  type ParentPlanCode,
  type SubscriptionStatus,
  type SchoolPlanDefinition,
  type ParentPlanDefinition,
  type SchoolProfile,
  type TeachingType,
} from "./subscription-plans";

import {
  SCHOOL_PLANS,
  PARENT_PLANS,
  type SchoolPlanCode,
  type ParentPlanCode,
  type SubscriptionStatus,
  type SchoolPlanDefinition,
  type ParentPlanDefinition,
  type SchoolProfile,
} from "./subscription-plans";

export interface SchoolSubscriptionState {
  currentPlan: SchoolPlanCode;
  status: SubscriptionStatus;
  startDate: string;
  expiresAt: string;
  autoRenew: boolean;
  activeSchoolId: string;
  schools: SchoolProfile[];
  usersCount: number; // Utilisateurs actuels
}

export interface ParentSubscriptionState {
  currentPlan: ParentPlanCode;
  status: SubscriptionStatus;
  startDate: string;
  expiresAt: string;
  autoRenew: boolean;
  childrenCount: number;
}

const INITIAL_SCHOOLS: SchoolProfile[] = [
  {
    id: "school-1",
    code: "ECO-001",
    name: "Établissement Scolaire",
    shortName: "Établissement",
    slug: "etablissement",
    logo: "",
    coverImage: "",
    country: "Bénin",
    region: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    devise: "Travail - Rigueur - Réussite",
    currency: "FCFA",
    activeYear: "2026-2027",
    teachingType: "PRIMAIRE_SECONDAIRE",
  },
];

const STORAGE_KEY_SCHOOL = "educogest_school_subscription_v2";
const STORAGE_KEY_PARENT = "educogest_parent_subscription_v2";

const DEFAULT_SCHOOL_STATE: SchoolSubscriptionState = {
  currentPlan: "STARTER",
  status: "TRIAL",
  startDate: "2026-10-01",
  expiresAt: "2026-11-01",
  autoRenew: false,
  activeSchoolId: "school-1",
  schools: [INITIAL_SCHOOLS[0]],
  usersCount: 0,
};

const DEFAULT_PARENT_STATE: ParentSubscriptionState = {
  currentPlan: "PARENT_1",
  status: "ACTIVE",
  startDate: "2026-10-01",
  expiresAt: "2026-11-01",
  autoRenew: true,
  childrenCount: 0,
};

// =============================================================================
// GESTION DU STORE EN MÉMOIRE ET SYNCHRONISATION
// =============================================================================

let memorySchoolState: SchoolSubscriptionState = DEFAULT_SCHOOL_STATE;
let memoryParentState: ParentSubscriptionState = DEFAULT_PARENT_STATE;
let listeners: Array<() => void> = [];

function notify() {
  listeners.forEach((l) => l());
}

function loadStateFromStorage() {
  if (typeof window === "undefined") return;
  try {
    const rawSchool = localStorage.getItem(STORAGE_KEY_SCHOOL);
    if (rawSchool) {
      memorySchoolState = { ...DEFAULT_SCHOOL_STATE, ...JSON.parse(rawSchool) };
    }
    const rawParent = localStorage.getItem(STORAGE_KEY_PARENT);
    if (rawParent) {
      memoryParentState = { ...DEFAULT_PARENT_STATE, ...JSON.parse(rawParent) };
    }
  } catch (e) {
    console.warn("Erreur chargement abonnements storage:", e);
  }
}

function saveSchoolState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SCHOOL, JSON.stringify(memorySchoolState));
    notify();
  } catch (e) {
    console.error("Erreur sauvegarde abonnement école:", e);
  }
}

function saveParentState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_PARENT, JSON.stringify(memoryParentState));
    notify();
  } catch (e) {
    console.error("Erreur sauvegarde abonnement parent:", e);
  }
}

// Initialisation côté client
if (typeof window !== "undefined") {
  loadStateFromStorage();
}

// =============================================================================
// API DE MANIPULATION & VÉRIFICATION DES LIMITES
// =============================================================================

export const subscriptionStore = {
  getSnapshot() {
    return {
      school: memorySchoolState,
      parent: memoryParentState,
    };
  },

  setSchoolStatus(status: SubscriptionStatus) {
    memorySchoolState = { ...memorySchoolState, status };
    saveSchoolState();
  },

  setParentStatus(status: SubscriptionStatus) {
    memoryParentState = { ...memoryParentState, status };
    saveParentState();
  },

  getSchoolState(): SchoolSubscriptionState {
    return memorySchoolState;
  },

  getParentState(): ParentSubscriptionState {
    return memoryParentState;
  },

  getActiveSchool(): SchoolProfile {
    const school = memorySchoolState.schools.find((s) => s.id === memorySchoolState.activeSchoolId);
    return school || memorySchoolState.schools[0] || INITIAL_SCHOOLS[0];
  },

  // Basculer d'établissement (pour le forfait Premium)
  switchActiveSchool(schoolId: string) {
    const target = memorySchoolState.schools.find((s) => s.id === schoolId);
    if (!target) return false;
    memorySchoolState = { ...memorySchoolState, activeSchoolId: schoolId };
    saveSchoolState();
    return true;
  },

  // Mettre à jour le profil de l'établissement
  updateSchoolProfile(schoolId: string, updates: Partial<SchoolProfile>) {
    memorySchoolState = {
      ...memorySchoolState,
      schools: memorySchoolState.schools.map((s) =>
        s.id === schoolId ? { ...s, ...updates } : s
      ),
    };
    saveSchoolState();
  },

  // Vérifier si l'établissement peut ajouter un nouvel utilisateur
  canAddUser(proposedTotal?: number): {
    allowed: boolean;
    reason?: string;
    current: number;
    max: number | null;
    plan: SchoolPlanCode;
  } {
    const plan = SCHOOL_PLANS[memorySchoolState.currentPlan];
    const current = proposedTotal ?? memorySchoolState.usersCount;
    if (plan.maxUsers === null) {
      return { allowed: true, current, max: null, plan: plan.code };
    }
    if (current >= plan.maxUsers) {
      return {
        allowed: false,
        reason: `La limite de ${plan.maxUsers} utilisateurs actifs pour le forfait ${plan.name} (${plan.priceFcfa.toLocaleString()} FCFA/mois) est atteinte. Veuillez surclasser votre abonnement.`,
        current,
        max: plan.maxUsers,
        plan: plan.code,
      };
    }
    return { allowed: true, current, max: plan.maxUsers, plan: plan.code };
  },

  // Vérifier si l'établissement peut ajouter une 2ème école selon l'abonnement
  canAddSchool(): {
    allowed: boolean;
    reason?: string;
    current: number;
    max: number;
    plan: SchoolPlanCode;
  } {
    const plan = SCHOOL_PLANS[memorySchoolState.currentPlan];
    const isInitialPlaceholderOnly =
      memorySchoolState.schools.length === 1 &&
      memorySchoolState.schools[0].id === "school-1" &&
      memorySchoolState.schools[0].name === "Établissement Scolaire";
    const current = isInitialPlaceholderOnly ? 0 : memorySchoolState.schools.length;
    if (current >= plan.maxSchools) {
      return {
        allowed: false,
        reason:
          plan.code === "PREMIUM"
            ? `Vous avez déjà atteint le maximum de ${plan.maxSchools} établissements autorisés par votre formule.`
            : `Votre formule actuelle (${plan.name} à ${plan.priceFcfa.toLocaleString()} FCFA/mois) est limitée à ${plan.maxSchools} seul établissement. Pour gérer un 2ème établissement, passez au forfait PREMIUM (25 000 FCFA/mois).`,
        current,
        max: plan.maxSchools,
        plan: plan.code,
      };
    }
    return { allowed: true, current, max: plan.maxSchools, plan: plan.code };
  },

  // Créer un nouvel établissement (contrôlé par le forfait et préservant les existants)
  createSchool(newSchool: Omit<SchoolProfile, "id">): { success: boolean; error?: string; school?: SchoolProfile } {
    const isInitialPlaceholderOnly =
      memorySchoolState.schools.length === 1 &&
      memorySchoolState.schools[0].id === "school-1" &&
      memorySchoolState.schools[0].name === "Établissement Scolaire";

    if (!isInitialPlaceholderOnly) {
      const check = this.canAddSchool();
      if (!check.allowed) {
        return { success: false, error: check.reason };
      }
    }

    const created: SchoolProfile = {
      ...newSchool,
      id: (newSchool as any).id || `school-${Date.now()}`,
    };

    const nextSchools = isInitialPlaceholderOnly
      ? [created]
      : [...memorySchoolState.schools, created];

    const today = new Date();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    memorySchoolState = {
      ...memorySchoolState,
      currentPlan: "STARTER",
      status: "TRIAL",
      startDate: today.toISOString().split("T")[0],
      expiresAt: expires.toISOString().split("T")[0],
      schools: nextSchools,
      activeSchoolId: created.id,
    };
    saveSchoolState();
    return { success: true, school: created };
  },

  // Activer le mois d'essai gratuit Starter (30 jours)
  activateStarterTrial(schoolId?: string) {
    const today = new Date();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    memorySchoolState = {
      ...memorySchoolState,
      currentPlan: "STARTER",
      status: "TRIAL",
      startDate: today.toISOString().split("T")[0],
      expiresAt: expires.toISOString().split("T")[0],
      autoRenew: false,
      ...(schoolId ? { activeSchoolId: schoolId } : {}),
    };
    saveSchoolState();
  },

  isTrialActive(): boolean {
    if (memorySchoolState.status !== "TRIAL") return false;
    const expires = new Date(memorySchoolState.expiresAt).getTime();
    return Date.now() <= expires;
  },

  getTrialDaysRemaining(): number {
    const expires = new Date(memorySchoolState.expiresAt).getTime();
    const diff = expires - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  },

  isExpired(): boolean {
    if (memorySchoolState.status === "EXPIRED") return true;
    if (memorySchoolState.status === "TRIAL") {
      const expires = new Date(memorySchoolState.expiresAt).getTime();
      return Date.now() > expires;
    }
    return false;
  },

  // Vérifier si le parent peut associer un élève
  canParentAddChild(currentChildrenCount?: number): {
    allowed: boolean;
    reason?: string;
    current: number;
    max: number;
    plan: ParentPlanCode;
  } {
    const plan = PARENT_PLANS[memoryParentState.currentPlan];
    const current = currentChildrenCount ?? memoryParentState.childrenCount;
    if (current >= plan.maxChildren) {
      return {
        allowed: false,
        reason:
          plan.code === "PARENT_1"
            ? `Le forfait PARENT 1 (200 FCFA/mois) est limité à 1 seul élève. Passez à la formule PARENT 2 (300 FCFA/mois) pour suivre jusqu'à 2 élèves.`
            : `Le forfait PARENT 2 (300 FCFA/mois) autorise un maximum strict de 2 élèves. L'association d'un troisième élève n'est pas autorisée.`,
        current,
        max: plan.maxChildren,
        plan: plan.code,
      };
    }
    return { allowed: true, current, max: plan.maxChildren, plan: plan.code };
  },

  // Changer de forfait établissement
  changeSchoolPlan(newPlan: SchoolPlanCode) {
    const planDef = SCHOOL_PLANS[newPlan];
    // Calculer la nouvelle date d'expiration (1 mois)
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Si passage à Premium et qu'on a qu'une école, on prépare la 2ème école exemple
    let nextSchools = [...memorySchoolState.schools];
    if (newPlan === "PREMIUM" && nextSchools.length === 1) {
      nextSchools.push(INITIAL_SCHOOLS[1]);
    }

    memorySchoolState = {
      ...memorySchoolState,
      currentPlan: newPlan,
      status: "ACTIVE",
      startDate: new Date().toISOString().split("T")[0],
      expiresAt: nextMonth.toISOString().split("T")[0],
      schools: nextSchools,
    };
    saveSchoolState();
  },

  // Renouveler forfait établissement
  renewSchoolSubscription() {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    memorySchoolState = {
      ...memorySchoolState,
      status: "ACTIVE",
      expiresAt: nextMonth.toISOString().split("T")[0],
    };
    saveSchoolState();
  },

  // Changer de forfait parent
  changeParentPlan(newPlan: ParentPlanCode) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    memoryParentState = {
      ...memoryParentState,
      currentPlan: newPlan,
      status: "ACTIVE",
      startDate: new Date().toISOString().split("T")[0],
      expiresAt: nextMonth.toISOString().split("T")[0],
    };
    saveParentState();
  },

  // Renouveler forfait parent
  renewParentSubscription() {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    memoryParentState = {
      ...memoryParentState,
      status: "ACTIVE",
      expiresAt: nextMonth.toISOString().split("T")[0],
    };
    saveParentState();
  },

  // Mettre à jour le nombre d'utilisateurs
  setUsersCount(count: number) {
    memorySchoolState = { ...memorySchoolState, usersCount: count };
    saveSchoolState();
  },

  // Mettre à jour le nombre d'enfants parent
  setChildrenCount(count: number) {
    memoryParentState = { ...memoryParentState, childrenCount: count };
    saveParentState();
  },

  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};

// =============================================================================
// REACT HOOKS
// =============================================================================

export function useSubscriptionStore() {
  const schoolState = useSyncExternalStore(
    subscriptionStore.subscribe,
    subscriptionStore.getSchoolState,
    () => DEFAULT_SCHOOL_STATE
  );

  const parentState = useSyncExternalStore(
    subscriptionStore.subscribe,
    subscriptionStore.getParentState,
    () => DEFAULT_PARENT_STATE
  );

  const activeSchool = subscriptionStore.getActiveSchool();

  return {
    // Établissement
    schoolPlan: schoolState.currentPlan,
    schoolPlanDef: SCHOOL_PLANS[schoolState.currentPlan],
    schoolStatus: schoolState.status,
    schoolStartDate: schoolState.startDate,
    schoolExpiresAt: schoolState.expiresAt,
    schools: schoolState.schools,
    activeSchool,
    usersCount: schoolState.usersCount,
    isTrialActive: subscriptionStore.isTrialActive(),
    trialDaysRemaining: subscriptionStore.getTrialDaysRemaining(),
    isExpired: subscriptionStore.isExpired(),
    activateStarterTrial: subscriptionStore.activateStarterTrial.bind(subscriptionStore),
    canAddUser: subscriptionStore.canAddUser.bind(subscriptionStore),
    canAddSchool: subscriptionStore.canAddSchool.bind(subscriptionStore),
    switchActiveSchool: subscriptionStore.switchActiveSchool.bind(subscriptionStore),
    updateSchoolProfile: subscriptionStore.updateSchoolProfile.bind(subscriptionStore),
    createSchool: subscriptionStore.createSchool.bind(subscriptionStore),
    changeSchoolPlan: subscriptionStore.changeSchoolPlan.bind(subscriptionStore),
    renewSchoolSubscription: subscriptionStore.renewSchoolSubscription.bind(subscriptionStore),
    setSchoolStatus: subscriptionStore.setSchoolStatus.bind(subscriptionStore),
    setUsersCount: subscriptionStore.setUsersCount.bind(subscriptionStore),

    // Parent
    parentPlan: parentState.currentPlan,
    parentPlanDef: PARENT_PLANS[parentState.currentPlan],
    parentStatus: parentState.status,
    parentStartDate: parentState.startDate,
    parentExpiresAt: parentState.expiresAt,
    childrenCount: parentState.childrenCount,
    canParentAddChild: subscriptionStore.canParentAddChild.bind(subscriptionStore),
    changeParentPlan: subscriptionStore.changeParentPlan.bind(subscriptionStore),
    renewParentSubscription: subscriptionStore.renewParentSubscription.bind(subscriptionStore),
    setParentStatus: subscriptionStore.setParentStatus.bind(subscriptionStore),
    setChildrenCount: subscriptionStore.setChildrenCount.bind(subscriptionStore),
  };
}
