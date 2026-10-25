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
  hasConsumedTrial: boolean; // Usage unique du mois gratuit STARTER
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
    code: "",
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
    directorName: "Direction de l'Établissement",
    directorSignatureUrl: "",
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
  hasConsumedTrial: false,
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
      const parsed = JSON.parse(rawSchool);
      if (parsed) {
        if (Array.isArray(parsed.schools)) {
          parsed.schools = parsed.schools.map((s: SchoolProfile) => ({
            ...s,
            code: s.code === "ECO-001" ? "" : (s.code || ""),
          }));
          // ISOLATION STRICTE : Pas de multi-écoles ni d'interconnexion résiduelle
          if (parsed.activeSchoolId && parsed.schools.length > 0) {
            const active = parsed.schools.find((s: SchoolProfile) => s && s.id === parsed.activeSchoolId);
            parsed.schools = active ? [active] : [parsed.schools[0]];
          }
        }
        memorySchoolState = { ...DEFAULT_SCHOOL_STATE, ...parsed };
      }
    }
    if (memorySchoolState.status === "PENDING_PAYMENT") {
      memorySchoolState.status = "ACTIVE";
    }
    // Verrouillage strict : si la période d'essai est échue, bloquer l'état en EXPIRED et marquer l'essai comme consommé
    if (memorySchoolState.status === "TRIAL" && memorySchoolState.expiresAt) {
      if (Date.now() > new Date(memorySchoolState.expiresAt).getTime()) {
        memorySchoolState.status = "EXPIRED";
        memorySchoolState.hasConsumedTrial = true;
      }
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
    if (memorySchoolState.status === status) return;
    memorySchoolState = { ...memorySchoolState, status };
    saveSchoolState();
  },

  setParentStatus(status: SubscriptionStatus) {
    if (memoryParentState.status === status) return;
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
    const validSchools = (memorySchoolState.schools || []).filter((s): s is SchoolProfile => Boolean(s && s.id));
    const school = validSchools.find((s) => s.id === memorySchoolState.activeSchoolId);
    const active = school || validSchools[0] || INITIAL_SCHOOLS[0];
    if (active && active.code === "ECO-001") {
      active.code = "";
    }
    return active;
  },

  // Synchronise ou injecte immédiatement l'établissement lié à l'utilisateur connecté
  syncSchoolWithUser(params: {
    id?: string;
    name: string;
    code?: string;
    shortName?: string;
    city?: string;
    country?: string;
    phone?: string;
    email?: string;
  }) {
    if (!params.name || !params.name.trim()) return;
    const cleanName = params.name.trim();
    const cleanCode = params.code && params.code !== "ECO-001" ? params.code.trim() : "";
    const cleanId = params.id || memorySchoolState.activeSchoolId || `school-${Date.now()}`;

    const validSchools = (memorySchoolState.schools || []).filter((s): s is SchoolProfile => Boolean(s && s.id));
    const existingIndex = validSchools.findIndex(
      (s) => s.id === cleanId || s.name.toLowerCase() === cleanName.toLowerCase()
    );

    const existing = existingIndex >= 0 ? validSchools[existingIndex] : null;
    const targetCode = cleanCode || (existing && existing.code !== "ECO-001" ? existing.code : "");
    const targetShortName = params.shortName || (existing ? existing.shortName : undefined) || cleanName.slice(0, 15);
    const targetCity = params.city || (existing ? existing.city : "") || "";
    const targetCountry = params.country || (existing ? existing.country : "Bénin") || "Bénin";
    const targetPhone = params.phone || (existing ? existing.phone : "") || "";
    const targetEmail = params.email || (existing ? existing.email : "") || "";

    // Si l'école est déjà active et strictement identique, ne pas déclencher de mise à jour inutile
    if (
      memorySchoolState.schools.length === 1 &&
      memorySchoolState.activeSchoolId === cleanId &&
      existing &&
      existing.id === cleanId &&
      existing.name === cleanName &&
      existing.code === targetCode &&
      existing.shortName === targetShortName &&
      existing.city === targetCity &&
      existing.country === targetCountry &&
      existing.phone === targetPhone &&
      existing.email === targetEmail
    ) {
      return;
    }

    const isolatedSchoolProfile: SchoolProfile = {
      id: cleanId,
      code: targetCode,
      name: cleanName,
      shortName: targetShortName,
      slug: cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      logo: existing ? existing.logo : "",
      coverImage: existing ? existing.coverImage : "",
      country: targetCountry,
      region: existing ? existing.region : "",
      city: targetCity,
      address: params.city ? `${params.city}, ${targetCountry}` : (existing ? existing.address : ""),
      phone: targetPhone,
      email: targetEmail,
      devise: "Travail - Rigueur - Réussite",
      currency: "FCFA",
      activeYear: "2026-2027",
      teachingType: "PRIMAIRE_SECONDAIRE",
    };

    // ISOLATION ABSOLUE : Un compte ne contient QUE son propre établissement unique
    memorySchoolState = {
      ...memorySchoolState,
      schools: [isolatedSchoolProfile],
      activeSchoolId: cleanId,
    };
    saveSchoolState();
  },

  // Basculer d'établissement (avec résolution intelligente si ID non présent)
  switchActiveSchool(schoolId: string, fallbackName?: string, fallbackCode?: string) {
    const validSchools = (memorySchoolState.schools || []).filter((s): s is SchoolProfile => Boolean(s && s.id));
    const target = validSchools.find((s) => s.id === schoolId);
    if (!target) {
      if (fallbackName) {
        this.syncSchoolWithUser({ id: schoolId, name: fallbackName, code: fallbackCode });
        return true;
      }
      return false;
    }
    memorySchoolState = { ...memorySchoolState, activeSchoolId: schoolId };
    saveSchoolState();
    return true;
  },

  // Mettre à jour le profil de l'établissement
  updateSchoolProfile(schoolId: string, updates: Partial<SchoolProfile>) {
    memorySchoolState = {
      ...memorySchoolState,
      schools: (memorySchoolState.schools || [])
        .filter((s): s is SchoolProfile => Boolean(s && s.id))
        .map((s) => (s.id === schoolId ? { ...s, ...updates } : s)),
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
    const plan = SCHOOL_PLANS[memorySchoolState.currentPlan] || SCHOOL_PLANS.STARTER;
    const current = proposedTotal ?? memorySchoolState.usersCount;
    if (plan.maxUsers === null) {
      return { allowed: true, current, max: null, plan: plan.code };
    }
    if (current >= plan.maxUsers) {
      const priceText = plan.priceFcfa === 0 ? "Gratuit 1 mois" : `${plan.priceFcfa.toLocaleString()} FCFA/mois`;
      return {
        allowed: false,
        reason: `La limite de ${plan.maxUsers} utilisateurs établissement pour le forfait ${plan.name} (${priceText}) est atteinte. Les comptes Parents ne sont pas décomptés de cette limite. Veuillez surclasser votre abonnement.`,
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
    const plan = SCHOOL_PLANS[memorySchoolState.currentPlan] || SCHOOL_PLANS.STARTER;
    const validSchools = (memorySchoolState.schools || []).filter((s): s is SchoolProfile => Boolean(s && s.id));
    const isInitialPlaceholderOnly =
      validSchools.length <= 1 &&
      (!validSchools[0] ||
        validSchools[0].id === "school-1" ||
        validSchools[0].name === "Établissement Scolaire");
    const current = isInitialPlaceholderOnly ? 0 : validSchools.length;
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
  createSchool(newSchool: Omit<SchoolProfile, "id"> & { id?: string }): { success: boolean; error?: string; school?: SchoolProfile } {
    const isInitialPlaceholderOnly =
      memorySchoolState.schools.length <= 1 &&
      (!memorySchoolState.schools[0] ||
        memorySchoolState.schools[0].id === "school-1" ||
        memorySchoolState.schools[0].name === "Établissement Scolaire");

    const created: SchoolProfile = {
      ...newSchool,
      id: newSchool.id || `school-${Date.now()}`,
      code: newSchool.code && newSchool.code !== "ECO-001" ? newSchool.code : "",
    };

    const nextSchools = isInitialPlaceholderOnly
      ? [created]
      : [...memorySchoolState.schools.filter((s) => s.id !== created.id), created];

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

  // Activer le mois d'essai gratuit Starter (30 jours) - Usage unique strict
  activateStarterTrial(schoolId?: string) {
    if (
      memorySchoolState.hasConsumedTrial ||
      (memorySchoolState.expiresAt && Date.now() > new Date(memorySchoolState.expiresAt).getTime())
    ) {
      console.warn("Mois d'essai gratuit STARTER déjà consommé pour cet établissement. Action bloquée.");
      return;
    }
    const today = new Date();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    memorySchoolState = {
      ...memorySchoolState,
      currentPlan: "STARTER",
      status: "TRIAL",
      startDate: today.toISOString().split("T")[0],
      expiresAt: expires.toISOString().split("T")[0],
      autoRenew: false,
      hasConsumedTrial: true,
      ...(schoolId ? { activeSchoolId: schoolId } : {}),
    };
    saveSchoolState();
  },

  canActivateTrial(): boolean {
    if (memorySchoolState.hasConsumedTrial) return false;
    if (memorySchoolState.status === "EXPIRED") return false;
    if (
      memorySchoolState.status === "TRIAL" &&
      Date.now() > new Date(memorySchoolState.expiresAt).getTime()
    ) {
      return false;
    }
    return true;
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
      const expired = Date.now() > expires;
      if (expired && !memorySchoolState.hasConsumedTrial) {
        memorySchoolState.hasConsumedTrial = true;
        memorySchoolState.status = "EXPIRED";
        saveSchoolState();
      }
      return expired;
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
    const plan = PARENT_PLANS[memoryParentState.currentPlan] || PARENT_PLANS.PARENT_1;
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
    // Calculer la nouvelle date d'expiration (1 mois)
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const validSchools = (memorySchoolState.schools || []).filter((s): s is SchoolProfile => Boolean(s && s.id));

    memorySchoolState = {
      ...memorySchoolState,
      currentPlan: newPlan,
      status: "ACTIVE",
      hasConsumedTrial: true,
      startDate: new Date().toISOString().split("T")[0],
      expiresAt: nextMonth.toISOString().split("T")[0],
      schools: validSchools,
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
    if (memorySchoolState.usersCount === count) return;
    memorySchoolState = { ...memorySchoolState, usersCount: count };
    saveSchoolState();
  },

  // Mettre à jour le nombre d'enfants parent
  setChildrenCount(count: number) {
    if (memoryParentState.childrenCount === count) return;
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

// Actions stables (références constantes hors du hook pour éviter les re-renders infinis dans useEffect)
const STABLE_ACTIONS = {
  activateStarterTrial: subscriptionStore.activateStarterTrial.bind(subscriptionStore),
  canActivateTrial: subscriptionStore.canActivateTrial.bind(subscriptionStore),
  canAddUser: subscriptionStore.canAddUser.bind(subscriptionStore),
  canAddSchool: subscriptionStore.canAddSchool.bind(subscriptionStore),
  switchActiveSchool: subscriptionStore.switchActiveSchool.bind(subscriptionStore),
  syncSchoolWithUser: subscriptionStore.syncSchoolWithUser.bind(subscriptionStore),
  updateSchoolProfile: subscriptionStore.updateSchoolProfile.bind(subscriptionStore),
  createSchool: subscriptionStore.createSchool.bind(subscriptionStore),
  changeSchoolPlan: subscriptionStore.changeSchoolPlan.bind(subscriptionStore),
  renewSchoolSubscription: subscriptionStore.renewSchoolSubscription.bind(subscriptionStore),
  setSchoolStatus: subscriptionStore.setSchoolStatus.bind(subscriptionStore),
  setUsersCount: subscriptionStore.setUsersCount.bind(subscriptionStore),
  canParentAddChild: subscriptionStore.canParentAddChild.bind(subscriptionStore),
  changeParentPlan: subscriptionStore.changeParentPlan.bind(subscriptionStore),
  renewParentSubscription: subscriptionStore.renewParentSubscription.bind(subscriptionStore),
  setParentStatus: subscriptionStore.setParentStatus.bind(subscriptionStore),
  setChildrenCount: subscriptionStore.setChildrenCount.bind(subscriptionStore),
};

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

  const safeSchoolPlan = schoolState?.currentPlan || "STARTER";
  const safeSchoolPlanDef = SCHOOL_PLANS[safeSchoolPlan] || SCHOOL_PLANS.STARTER;

  const safeParentPlan = parentState?.currentPlan || "PARENT_1";
  const safeParentPlanDef = PARENT_PLANS[safeParentPlan] || PARENT_PLANS.PARENT_1;

  return {
    // Établissement
    schoolPlan: safeSchoolPlan,
    schoolPlanDef: safeSchoolPlanDef,
    schoolStatus: schoolState?.status || "TRIAL",
    schoolStartDate: schoolState?.startDate || "2026-10-01",
    schoolExpiresAt: schoolState?.expiresAt || "2026-11-01",
    schools: (schoolState?.schools || []).filter((s): s is SchoolProfile => Boolean(s && s.id)),
    activeSchool,
    usersCount: schoolState?.usersCount || 0,
    hasConsumedTrial: Boolean(schoolState?.hasConsumedTrial),
    isTrialActive: subscriptionStore.isTrialActive(),
    trialDaysRemaining: subscriptionStore.getTrialDaysRemaining(),
    isExpired: subscriptionStore.isExpired(),
    ...STABLE_ACTIONS,

    // Parent
    parentPlan: safeParentPlan,
    parentPlanDef: safeParentPlanDef,
    parentStatus: parentState?.status || "ACTIVE",
    parentStartDate: parentState?.startDate || "2026-10-01",
    parentExpiresAt: parentState?.expiresAt || "2026-11-01",
    childrenCount: parentState?.childrenCount || 0,
  };
}
