"use client";

import { useSyncExternalStore } from "react";
import { Role, normalizeRole } from "@/lib/permissions";
import { subscriptionStore, SchoolProfile, SchoolPlanCode, ParentPlanCode } from "./subscription-store";
import { generateUserIdentifier, validateSchoolCode } from "./user-registry";
import { supabase } from "./supabase";

export interface AuthUser {
  id: string;
  identifier: string; // Ex: 4827DIR01
  email: string;
  fullName: string;
  role: Role;
  schoolId: string;
  schoolName: string;
  schoolCode: string; // 4 chiffres obligatoires
  phone?: string;
  isSubscriptionPaid: boolean;
  avatar?: string;
  permissions?: string[];
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

// État initial par défaut : EN COURS DE VÉRIFICATION AVEC SUPABASE
const DEFAULT_AUTH_STATE: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
};

let memoryAuthState: AuthState = DEFAULT_AUTH_STATE;
let listeners: Array<() => void> = [];

function notify() {
  listeners.forEach((l) => l());
}

let checkSessionPromise: Promise<boolean> | null = null;

/**
 * Vérification rigoureuse et exclusive de la session avec Supabase.
 * SUPABASE EST L'UNIQUE SOURCE DE VÉRITÉ.
 */
export async function checkSupabaseSession(): Promise<boolean> {
  if (checkSessionPromise) return checkSessionPromise;

  checkSessionPromise = (async () => {
    try {
      // 1. Vérifier si une session Supabase Auth (GoTrue) existe côté client
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!sessionError && session?.user) {
          const email = session.user.email;
          const res = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: session.user.id, email }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.valid && json.user) {
              authStore.setAuthenticated(json.user, json.school);
              return true;
            }
          }
        }
      } catch (e) {
        console.warn("[auth-store] Supabase Auth getSession :", e);
      }

      // 2. Vérifier la session persistante Supabase via /api/auth/session (cookie HTTP-only validé dans PostgreSQL)
      const res = await fetch("/api/auth/session", {
        method: "GET",
        headers: { "Cache-Control": "no-cache" },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.valid && json.user) {
          authStore.setAuthenticated(json.user, json.school);
          return true;
        }
      } else if (res.status === 401 || res.status === 403) {
        // Supabase confirme explicitement qu'aucune session n'existe ou que le compte est suspendu
        authStore.setUnauthenticated();
        return false;
      }
    } catch (err) {
      console.error("[auth-store] Erreur réseau lors de la récupération de session Supabase :", err);
      // RÈGLE 9 : Une erreur temporaire ne doit pas être interprétée automatiquement comme une déconnexion
      if (memoryAuthState.user && memoryAuthState.isAuthenticated) {
        memoryAuthState = {
          ...memoryAuthState,
          isLoading: false,
          isInitialized: true,
        };
        notify();
        return true;
      }
    } finally {
      checkSessionPromise = null;
    }

    authStore.setUnauthenticated();
    return false;
  })();

  return checkSessionPromise;
}

// Initialisation côté client au chargement
if (typeof window !== "undefined") {
  try {
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_OUT") {
        authStore.setUnauthenticated();
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await checkSupabaseSession();
      }
    });
  } catch (err) {
    console.warn("[auth-store] onAuthStateChange setup warning:", err);
  }

  // Démarrer la vérification de session dès le chargement du module
  checkSupabaseSession();
}

export const authStore = {
  getSnapshot(): AuthState {
    return memoryAuthState;
  },

  subscribe(listener: () => void): () => void {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  setAuthenticated(userData: any, schoolData?: any) {
    const activeSchool = subscriptionStore.getActiveSchool();
    const isPaid = subscriptionStore.getSnapshot().school.status === "ACTIVE";

    const schoolId = schoolData?.id || userData.schoolId || activeSchool.id;
    const schoolName = schoolData?.name || userData.schoolName || activeSchool.name;
    const rawCode = schoolData?.code || userData.schoolCode || activeSchool.code || "";
    const schoolCode = rawCode === "ECO-001" ? "" : rawCode;

    if (schoolName) {
      subscriptionStore.syncSchoolWithUser({
        id: schoolId,
        name: schoolName,
        code: schoolCode,
        shortName: schoolData?.short_name || schoolData?.shortName,
        city: schoolData?.city,
        country: schoolData?.country,
        phone: schoolData?.phone || userData.phone,
        email: schoolData?.email || userData.email,
      });
    }

    const cleanRole = normalizeRole(userData.role);
    const identifier = userData.identifier || generateUserIdentifier(schoolCode || "0000", cleanRole);

    const user: AuthUser = {
      id: userData.id,
      identifier,
      email: userData.email,
      fullName: userData.fullName || userData.full_name || "Utilisateur",
      role: cleanRole,
      schoolId,
      schoolName,
      schoolCode,
      phone: userData.phone,
      permissions: userData.permissions,
      isSubscriptionPaid: cleanRole === "parent" ? subscriptionStore.getSnapshot().parent.status === "ACTIVE" : isPaid,
    };

    memoryAuthState = {
      user,
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
    };
    notify();
    return user;
  },

  setUnauthenticated() {
    memoryAuthState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
    };
    notify();
  },

  login(params: {
    id?: string;
    identifier?: string;
    email: string;
    fullName?: string;
    role: Role;
    schoolId?: string;
    schoolName?: string;
    schoolCode?: string;
    phone?: string;
    permissions?: string[];
  }) {
    if (params.schoolName) {
      subscriptionStore.syncSchoolWithUser({
        id: params.schoolId,
        name: params.schoolName,
        code: params.schoolCode,
        phone: params.phone,
      });
    }

    const activeSchool = subscriptionStore.getActiveSchool();
    const isPaid = subscriptionStore.getSnapshot().school.status === "ACTIVE";

    const schoolId = params.schoolId || activeSchool.id;
    const schoolName = params.schoolName || activeSchool.name;
    const rawCode = params.schoolCode || activeSchool.code || "";
    const schoolCode = rawCode === "ECO-001" ? "" : rawCode;

    const cleanRole = normalizeRole(params.role);
    const identifier = params.identifier || generateUserIdentifier(schoolCode || "0000", cleanRole);

    const user: AuthUser = {
      id: params.id || `usr-${Date.now()}`,
      identifier,
      email: params.email,
      fullName: params.fullName || (
        cleanRole === "directeur" ? "Directeur" :
        cleanRole === "censeur" ? "Censeur des Études" :
        cleanRole === "secretariat" ? "Secrétaire Pédagogique" :
        cleanRole === "surveillant" ? "Surveillant Général" :
        cleanRole === "enseignant" ? "Professeur" :
        cleanRole === "comptabilite" || cleanRole === "comptable" ? "Comptable" :
        "Parent d'Élève"
      ),
      role: cleanRole,
      schoolId,
      schoolName,
      schoolCode,
      phone: params.phone,
      permissions: params.permissions,
      isSubscriptionPaid: cleanRole === "parent" ? subscriptionStore.getSnapshot().parent.status === "ACTIVE" : isPaid,
    };

    memoryAuthState = {
      user,
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
    };
    notify();
    return user;
  },

  async logout() {
    try {
      await supabase.auth.signOut();
    } catch {}
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {}
    this.setUnauthenticated();
  },

  registerSchool(params: {
    schoolId?: string;
    directorName: string;
    schoolName: string;
    schoolEmail: string;
    schoolPhone: string;
    schoolCity: string;
    schoolRegion?: string;
    schoolCountry?: string;
    chosenPlan: SchoolPlanCode;
    schoolCode: string; // 4 chiffres obligatoires
    password?: string;
  }) {
    const codeCheck = validateSchoolCode(params.schoolCode);
    if (!codeCheck.valid) {
      throw new Error(codeCheck.error || "Code établissement invalide.");
    }

    const cleanSchoolCode = params.schoolCode.trim();
    const schoolId = params.schoolId || `school-${Date.now()}`;
    const createdSchool: SchoolProfile = {
      id: schoolId,
      code: cleanSchoolCode,
      name: params.schoolName,
      shortName: params.schoolName.slice(0, 15),
      slug: params.schoolName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      logo: "",
      coverImage: "",
      country: params.schoolCountry || "Bénin",
      region: params.schoolRegion || "",
      city: params.schoolCity,
      address: `${params.schoolCity}, ${params.schoolRegion || ""}, ${params.schoolCountry || "Bénin"}`.trim(),
      phone: params.schoolPhone,
      email: params.schoolEmail,
      devise: "Travail - Rigueur - Réussite",
      currency: "FCFA",
      activeYear: "2026-2027",
      teachingType: "PRIMAIRE_SECONDAIRE",
    };

    subscriptionStore.createSchool(createdSchool);
    subscriptionStore.activateStarterTrial(createdSchool.id);

    const dirIdentifier = generateUserIdentifier(cleanSchoolCode, "directeur");

    const user = this.login({
      id: params.schoolId,
      identifier: dirIdentifier,
      email: params.schoolEmail,
      fullName: params.directorName || "Directeur",
      role: "directeur",
      schoolId: createdSchool.id,
      schoolName: createdSchool.name,
      schoolCode: cleanSchoolCode,
      phone: params.schoolPhone,
    });

    return { user, school: createdSchool, identifier: dirIdentifier };
  },

  registerParent(params: {
    userId?: string;
    fullName: string;
    email: string;
    phone: string;
    schoolId: string;
    schoolName: string;
    schoolCode?: string;
    chosenPlan: ParentPlanCode;
    relationship?: string;
    password?: string;
  }) {
    subscriptionStore.changeParentPlan(params.chosenPlan);
    subscriptionStore.setParentStatus("PENDING_PAYMENT");

    let schoolCode = params.schoolCode;
    if (!schoolCode) {
      const sch = subscriptionStore.getSchoolState().schools.find((s) => s.id === params.schoolId);
      schoolCode = sch?.code || "0000";
    }

    const parentIdentifier = generateUserIdentifier(schoolCode, "parent");

    const user = this.login({
      id: params.userId,
      identifier: parentIdentifier,
      email: params.email,
      fullName: params.fullName,
      role: "parent",
      schoolId: params.schoolId,
      schoolName: params.schoolName,
      schoolCode,
      phone: params.phone,
    });

    return { user, identifier: parentIdentifier };
  },

  validatePayment(type: "SCHOOL" | "PARENT") {
    if (type === "SCHOOL") {
      subscriptionStore.setSchoolStatus("ACTIVE");
      if (memoryAuthState.user && memoryAuthState.user.role === "directeur") {
        memoryAuthState = {
          ...memoryAuthState,
          user: {
            ...memoryAuthState.user,
            isSubscriptionPaid: true,
          },
        };
      }
    } else {
      subscriptionStore.setParentStatus("ACTIVE");
      if (memoryAuthState.user && memoryAuthState.user.role === "parent") {
        memoryAuthState = {
          ...memoryAuthState,
          user: {
            ...memoryAuthState.user,
            isSubscriptionPaid: true,
          },
        };
      }
    }
    notify();
  },
};

export function useAuthStore() {
  const state = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    () => DEFAULT_AUTH_STATE
  );

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    login: authStore.login,
    logout: authStore.logout,
    checkSession: checkSupabaseSession,
    registerSchool: authStore.registerSchool,
    registerParent: authStore.registerParent,
    validatePayment: authStore.validatePayment,
    setAuthenticated: authStore.setAuthenticated,
    setUnauthenticated: authStore.setUnauthenticated,
  };
}

export const useAuth = useAuthStore;
