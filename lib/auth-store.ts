"use client";

import { useSyncExternalStore } from "react";
import { Role } from "@/lib/permissions";
import { subscriptionStore, SchoolProfile, SchoolPlanCode, ParentPlanCode } from "./subscription-store";
import { registerSystemUser, generateUserIdentifier, validateSchoolCode, SystemUser } from "./user-registry";

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
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

const STORAGE_KEY = "ecogest_auth_session_v2";

// État initial par défaut : STRICTEMENT NON CONNECTÉ
const DEFAULT_AUTH_STATE: AuthState = {
  user: null,
  isAuthenticated: false,
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
      const parsed = JSON.parse(raw);
      if (parsed && parsed.user && parsed.isAuthenticated) {
        if (parsed.user.schoolCode === "ECO-001") {
          parsed.user.schoolCode = "";
        }
        memoryAuthState = parsed;
        if (parsed.user.schoolName) {
          subscriptionStore.syncSchoolWithUser({
            id: parsed.user.schoolId,
            name: parsed.user.schoolName,
            code: parsed.user.schoolCode,
            phone: parsed.user.phone,
          });
        }
        return;
      }
    }
    memoryAuthState = DEFAULT_AUTH_STATE;
  } catch (e) {
    console.error("[auth-store] Erreur lecture localStorage :", e);
    memoryAuthState = DEFAULT_AUTH_STATE;
  }
}

function saveStateToStorage() {
  if (typeof window === "undefined") return;
  try {
    if (memoryAuthState.user && memoryAuthState.isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryAuthState));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
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
    id?: string;
    identifier?: string;
    email: string;
    fullName?: string;
    role: Role;
    schoolId?: string;
    schoolName?: string;
    schoolCode?: string;
    phone?: string;
  }) {
    // Synchroniser immédiatement l'établissement avec subscriptionStore
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

    const identifier = params.identifier || generateUserIdentifier(schoolCode || "0000", params.role);

    const user: AuthUser = {
      id: params.id || `usr-${Date.now()}`,
      identifier,
      email: params.email,
      fullName: params.fullName || (
        params.role === "directeur" ? "Directeur" :
        params.role === "censeur" ? "Censeur des Études" :
        params.role === "secretariat" ? "Secrétaire Pédagogique" :
        params.role === "surveillant" ? "Surveillant Général" :
        params.role === "enseignant" ? "Professeur" :
        params.role === "comptabilite" ? "Comptable" :
        "Parent d'Élève"
      ),
      role: params.role,
      schoolId,
      schoolName,
      schoolCode,
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
      // Supprimer les flags de session temporaire
      sessionStorage.clear();
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
    schoolCode: string; // 4 chiffres obligatoires
    password?: string;
  }) {
    // Validation du code établissement à 4 chiffres
    const codeCheck = validateSchoolCode(params.schoolCode);
    if (!codeCheck.valid) {
      throw new Error(codeCheck.error || "Code établissement invalide.");
    }

    const cleanSchoolCode = params.schoolCode.trim();

    // 1. Créer ou mettre à jour l'établissement
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

    // 2. Activer automatiquement 1 MOIS D'ESSAI GRATUIT avec la formule Starter (Règle 1)
    subscriptionStore.activateStarterTrial(createdSchool.id);

    // 3. Générer l'identifiant unique du Directeur avec le préfixe à 4 chiffres (ex: 4827DIR01)
    const dirIdentifier = generateUserIdentifier(cleanSchoolCode, "directeur");
    const directorPassword = params.password || "Directeur2026!";

    // 4. Enregistrer dans le registre persistant des utilisateurs
    const systemUser = registerSystemUser({
      identifier: dirIdentifier,
      email: params.schoolEmail,
      fullName: params.directorName || "Directeur",
      role: "directeur",
      schoolId: createdSchool.id,
      schoolName: createdSchool.name,
      schoolCode: cleanSchoolCode,
      password: directorPassword,
      phone: params.schoolPhone,
      status: "ACTIF",
    });

    // 5. Connecter le directeur avec accès immédiat (1 mois gratuit Starter)
    const user: AuthUser = {
      id: systemUser.id,
      identifier: dirIdentifier,
      email: params.schoolEmail,
      fullName: params.directorName || "Directeur",
      role: "directeur",
      schoolId: createdSchool.id,
      schoolName: createdSchool.name,
      schoolCode: cleanSchoolCode,
      phone: params.schoolPhone,
      isSubscriptionPaid: true,
    };

    memoryAuthState = {
      user,
      isAuthenticated: true,
    };
    saveStateToStorage();
    notify();
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
    // 1. Définir le statut du forfait parent sur PENDING_PAYMENT
    subscriptionStore.changeParentPlan(params.chosenPlan);
    subscriptionStore.setParentStatus("PENDING_PAYMENT");

    // Récupérer le code établissement
    let schoolCode = params.schoolCode;
    if (!schoolCode) {
      const sch = subscriptionStore.getSchoolState().schools.find((s) => s.id === params.schoolId);
      schoolCode = sch?.code || "0000";
    }

    // 2. Générer l'identifiant unique du Parent avec le préfixe de l'établissement (ex: 4827PAR01)
    const parentIdentifier = generateUserIdentifier(schoolCode, "parent");
    const parentPassword = params.password || "Parent2026!";

    // 3. Enregistrer dans le registre persistant
    const systemUser = registerSystemUser({
      identifier: parentIdentifier,
      email: params.email,
      fullName: params.fullName,
      role: "parent",
      schoolId: params.schoolId,
      schoolName: params.schoolName,
      schoolCode,
      password: parentPassword,
      phone: params.phone,
      status: "ACTIF",
    });

    // 4. Connecter le parent avec l'établissement choisi et isSubscriptionPaid = false
    const user: AuthUser = {
      id: systemUser.id,
      identifier: parentIdentifier,
      email: params.email,
      fullName: params.fullName,
      role: "parent",
      schoolId: params.schoolId,
      schoolName: params.schoolName,
      schoolCode,
      phone: params.phone,
      isSubscriptionPaid: false,
    };

    memoryAuthState = {
      user,
      isAuthenticated: true,
    };
    saveStateToStorage();
    notify();
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

export const useAuth = useAuthStore;

