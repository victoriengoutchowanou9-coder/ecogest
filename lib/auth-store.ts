"use client";

import { useSyncExternalStore } from "react";
import { Role } from "@/lib/permissions";
import { subscriptionStore, SchoolProfile, SchoolPlanCode, ParentPlanCode } from "./subscription-store";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  schoolId: string;
  schoolName: string;
  phone?: string;
  isSubscriptionPaid: boolean;
  avatar?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

const STORAGE_KEY = "ecogest_auth_session_v2";

// État initial par défaut (Directeur pour le premier accès si aucune session n'existe)
const DEFAULT_AUTH_STATE: AuthState = {
  user: {
    id: "user-directeur-1",
    email: "directeur@ecogest.bj",
    fullName: "Direction Générale",
    role: "directeur",
    schoolId: "school-1",
    schoolName: "Établissement Scolaire",
    phone: "+229 97 00 00 00",
    isSubscriptionPaid: false, // En attente de paiement par défaut
  },
  isAuthenticated: true,
};

let memoryAuthState: AuthState = DEFAULT_AUTH_STATE;
let listeners: Array<() => void> = [];

function notify() {
  listeners.forEach((l) => l());
}

function loadStateFromStorage() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      memoryAuthState = JSON.parse(raw);
    }
  } catch (e) {
    console.error("[auth-store] Erreur lecture localStorage :", e);
  }
}

function saveStateToStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryAuthState));
  } catch (e) {
    console.error("[auth-store] Erreur sauvegarde localStorage :", e);
  }
}

// Initialisation au chargement côté client
if (typeof window !== "undefined") {
  loadStateFromStorage();
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

  login(params: {
    email: string;
    fullName?: string;
    role: Role;
    schoolId?: string;
    schoolName?: string;
    phone?: string;
  }) {
    const activeSchool = subscriptionStore.getActiveSchool();
    const isPaid = subscriptionStore.getSnapshot().school.status === "ACTIVE";

    const user: AuthUser = {
      id: `usr-${Date.now()}`,
      email: params.email,
      fullName: params.fullName || (params.role === "directeur" ? "Directeur" : params.role === "censeur" ? "Censeur des Études" : params.role === "enseignant" ? "Professeur" : params.role === "comptabilite" ? "Comptable" : "Parent d'Élève"),
      role: params.role,
      schoolId: params.schoolId || activeSchool.id,
      schoolName: params.schoolName || activeSchool.name,
      phone: params.phone,
      isSubscriptionPaid: params.role === "parent" ? subscriptionStore.getSnapshot().parent.status === "ACTIVE" : isPaid,
    };

    memoryAuthState = {
      user,
      isAuthenticated: true,
    };
    saveStateToStorage();
    notify();
    return user;
  },

  logout() {
    memoryAuthState = {
      user: null,
      isAuthenticated: false,
    };
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    notify();
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
    schoolCode?: string;
  }) {
    // 1. Définir le statut de souscription sur PENDING_PAYMENT
    subscriptionStore.changeSchoolPlan(params.chosenPlan);
    subscriptionStore.setSchoolStatus("PENDING_PAYMENT");

    // 2. Créer ou mettre à jour l'établissement
    const schoolId = params.schoolId || `school-${Date.now()}`;
    const createdSchool: SchoolProfile = {
      id: schoolId,
      code: params.schoolCode || `ECO-${Math.floor(100 + Math.random() * 900)}`,
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

    // 3. Connecter le directeur avec isSubscriptionPaid = false
    const user: AuthUser = {
      id: `dir-${Date.now()}`,
      email: params.schoolEmail,
      fullName: params.directorName || "Directeur",
      role: "directeur",
      schoolId: createdSchool.id,
      schoolName: createdSchool.name,
      phone: params.schoolPhone,
      isSubscriptionPaid: false,
    };

    memoryAuthState = {
      user,
      isAuthenticated: true,
    };
    saveStateToStorage();
    notify();
    return { user, school: createdSchool };
  },

  registerParent(params: {
    userId?: string;
    fullName: string;
    email: string;
    phone: string;
    schoolId: string;
    schoolName: string;
    chosenPlan: ParentPlanCode;
    relationship?: string;
  }) {
    // 1. Définir le statut du forfait parent sur PENDING_PAYMENT
    subscriptionStore.changeParentPlan(params.chosenPlan);
    subscriptionStore.setParentStatus("PENDING_PAYMENT");

    // 2. Connecter le parent avec l'établissement choisi et isSubscriptionPaid = false
    const user: AuthUser = {
      id: params.userId || `parent-${Date.now()}`,
      email: params.email,
      fullName: params.fullName,
      role: "parent",
      schoolId: params.schoolId,
      schoolName: params.schoolName,
      phone: params.phone,
      isSubscriptionPaid: false,
    };

    memoryAuthState = {
      user,
      isAuthenticated: true,
    };
    saveStateToStorage();
    notify();
    return user;
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
    saveStateToStorage();
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
    login: authStore.login,
    logout: authStore.logout,
    registerSchool: authStore.registerSchool,
    registerParent: authStore.registerParent,
    validatePayment: authStore.validatePayment,
  };
}
