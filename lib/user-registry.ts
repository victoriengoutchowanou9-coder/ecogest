"use client";

import { Role } from "@/lib/permissions";
import { subscriptionStore, SchoolProfile } from "./subscription-store";

export interface SystemUser {
  id: string;
  identifier: string; // Ex: 4827DIR01, 4827CEN01, 4827ENS01, 4827PAR01
  email: string;
  fullName: string;
  role: Role;
  schoolId: string;
  schoolName: string;
  schoolCode: string; // Exact 4 digits
  password?: string; // Jamais persisté en clair
  status: "ACTIF" | "SUSPENDU";
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  specialty?: string;
  permissions?: string[];
  assignedClasses?: { classId: string; className: string }[];
  assignedSubjects?: { subjectId: string; subjectName: string }[];
}

const STORAGE_KEY_USERS = "ecogest_global_users_registry_v4";
const USERS_UPDATE_EVENT = "ecogest_users_registry_update";

function loadUsers(): SystemUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Sécurité : éliminer tout mot de passe qui aurait été précédemment stocké
        return parsed.map((u: any) => {
          const { password, ...safeUser } = u;
          return safeUser as SystemUser;
        });
      }
    }
  } catch (e) {
    console.warn("Erreur lecture registre utilisateurs:", e);
  }
  return [];
}

function saveUsers(users: SystemUser[]): void {
  if (typeof window === "undefined") return;
  try {
    // Sécurité : interdiction absolue de persister des mots de passe dans le navigateur
    const sanitized = users.map((u: any) => {
      const { password, ...safeUser } = u;
      return safeUser;
    });
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(sanitized));
    window.dispatchEvent(new Event(USERS_UPDATE_EVENT));
    window.dispatchEvent(new Event("ecogest_shared_data_update"));
  } catch (e) {
    console.error("Erreur sauvegarde registre utilisateurs:", e);
  }
}

/**
 * Valide qu'un code établissement comporte exactement 4 chiffres et qu'il est unique.
 */
export function validateSchoolCode(code: string, currentSchoolId?: string): { valid: boolean; error?: string } {
  const trimmed = (code || "").trim();
  if (!/^\d{4}$/.test(trimmed)) {
    return {
      valid: false,
      error: "Le code établissement doit comporter exactement 4 chiffres (ex : 4827).",
    };
  }

  const schools = subscriptionStore.getSchoolState().schools;
  const conflict = schools.find((s) => s.code === trimmed && s.id !== currentSchoolId);
  if (conflict) {
    return {
      valid: false,
      error: `Le code établissement « ${trimmed} » est déjà utilisé par « ${conflict.name} ». Chaque établissement doit posséder un code unique à 4 chiffres.`,
    };
  }

  return { valid: true };
}

/**
 * Génère un identifiant unique pour un utilisateur, préfixé par le code établissement à 4 chiffres.
 * Exemples :
 * - Directeur : 4827DIR01
 * - Censeur : 4827CEN01
 * - Surveillant : 4827SUR01
 * - Secrétaire : 4827SEC01
 * - Comptable : 4827CPT01
 * - Enseignant : 4827ENS01, 4827ENS02...
 * - Parent : 4827PAR01, 4827PAR02...
 */
export function generateUserIdentifier(schoolCode: string, role: Role): string {
  const cleanCode = (schoolCode || "0000").replace(/\D/g, "").slice(0, 4).padStart(4, "0");

  const rolePrefixes: Record<Role, string> = {
    directeur: "DIR",
    censeur: "CEN",
    surveillant: "SUR",
    secretariat: "SEC",
    comptabilite: "CPT",
    enseignant: "ENS",
    parent: "PAR",
  };

  const tag = rolePrefixes[role] || "USR";
  const users = loadUsers();

  // Compter les utilisateurs existants pour cet établissement et ce rôle
  let seq = 1;
  let candidate = `${cleanCode}${tag}${String(seq).padStart(2, "0")}`;

  while (users.some((u) => u.identifier?.toUpperCase() === candidate.toUpperCase())) {
    seq++;
    candidate = `${cleanCode}${tag}${String(seq).padStart(2, "0")}`;
  }

  return candidate;
}

/**
 * Enregistre un utilisateur dans le registre persistant.
 */
export function registerSystemUser(user: Omit<SystemUser, "id" | "createdAt"> & { id?: string; createdAt?: string }): SystemUser {
  const users = loadUsers();

  // Vérifier doublon email
  const cleanEmail = user.email.trim().toLowerCase();
  const existingByEmail = users.find((u) => u.email.toLowerCase() === cleanEmail && u.id !== user.id);
  if (existingByEmail) {
    throw new Error(`L'adresse e-mail « ${user.email} » est déjà utilisée par un autre compte.`);
  }

  // Vérifier doublon identifiant
  const cleanIdentifier = user.identifier.trim().toUpperCase();
  const existingByIdentifier = users.find((u) => u.identifier.toUpperCase() === cleanIdentifier && u.id !== user.id);
  if (existingByIdentifier) {
    throw new Error(`L'identifiant « ${user.identifier} » existe déjà dans le système.`);
  }

  const newUser: SystemUser = {
    ...user,
    id: user.id || `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    identifier: cleanIdentifier,
    email: cleanEmail,
    createdAt: user.createdAt || new Date().toISOString(),
  };

  // Mettre à jour si existant ou ajouter
  const index = users.findIndex((u) => u.id === newUser.id);
  let updated: SystemUser[];
  if (index >= 0) {
    updated = [...users];
    updated[index] = newUser;
  } else {
    updated = [...users, newUser];
  }

  saveUsers(updated);
  return newUser;
}

/**
 * Authentification locale DÉSACTIVÉE : Supabase est la source exclusive d'authentification.
 */
export function authenticateSystemUser(
  _identifierOrEmail: string,
  _password: string
): { success: boolean; error?: string; user?: SystemUser } {
  return {
    success: false,
    error: "L'authentification locale est définitivement désactivée. Supabase est la source unique et exclusive d'authentification.",
  };
}

/**
 * Récupère tous les utilisateurs d'un établissement spécifique.
 */
export function getSchoolUsers(schoolId: string): SystemUser[] {
  const users = loadUsers();
  if (!schoolId) return [];
  return users.filter((u) => u.schoolId === schoolId);
}

/**
 * Bascule le statut d'un compte (ACTIF / SUSPENDU).
 */
export function toggleUserStatus(userId: string): SystemUser | null {
  const users = loadUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return null;

  const nextStatus: "ACTIF" | "SUSPENDU" = target.status === "ACTIF" ? "SUSPENDU" : "ACTIF";
  const updated = users.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u));
  saveUsers(updated);
  return { ...target, status: nextStatus };
}

/**
 * Met à jour un utilisateur dans le registre.
 */
export function updateSystemUser(userId: string, updates: Partial<SystemUser>): SystemUser | null {
  const users = loadUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return null;

  const updatedUser = { ...target, ...updates };
  const updated = users.map((u) => (u.id === userId ? updatedUser : u));
  saveUsers(updated);
  return updatedUser;
}

/**
 * Met à jour le statut d'un utilisateur.
 */
export function updateSystemUserStatus(userId: string, status: "ACTIF" | "SUSPENDU"): SystemUser | null {
  return updateSystemUser(userId, { status });
}

/**
 * Supprime un utilisateur du registre.
 */
export function deleteSystemUser(userId: string): boolean {
  const users = loadUsers();
  const next = users.filter((u) => u.id !== userId);
  if (next.length === users.length) return false;
  saveUsers(next);
  return true;
}

/**
 * Récupère tous les utilisateurs globaux (pour synchronisation / administration).
 */
export function getAllSystemUsers(): SystemUser[] {
  return loadUsers();
}

// -------------------------------------------------------------
// GESTION DU MOT DE PASSE & RÉCUPÉRATION SÉCURISÉE (SANS DIRECTEUR)
// -------------------------------------------------------------

interface PasswordResetRequest {
  identifierOrEmail: string;
  otp: string;
  expiresAt: number;
}

const STORAGE_KEY_RESET_OTP = "ecogest_pwd_reset_otps_v1";

function loadResetOTPs(): PasswordResetRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_RESET_OTP) || localStorage.getItem(STORAGE_KEY_RESET_OTP);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Erreur lecture reset OTPs:", e);
  }
  return [];
}

function saveResetOTPs(requests: PasswordResetRequest[]): void {
  if (typeof window === "undefined") return;
  try {
    const clean = requests.filter((r) => r.expiresAt > Date.now());
    sessionStorage.setItem(STORAGE_KEY_RESET_OTP, JSON.stringify(clean));
    localStorage.setItem(STORAGE_KEY_RESET_OTP, JSON.stringify(clean));
  } catch (e) {
    console.error("Erreur sauvegarde reset OTPs:", e);
  }
}

export function changeUserPassword(
  _identifierOrEmail: string,
  _oldPassword: string,
  _newPassword: string
): { success: boolean; error?: string } {
  return {
    success: false,
    error: "La modification locale du mot de passe est désactivée. Utilisez l'API sécurisée /api/auth/password.",
  };
}

export function requestPasswordResetOTP(_identifierOrEmail: string): {
  success: boolean;
  error?: string;
  otp?: string;
  emailMasked?: string;
  userFullName?: string;
} {
  return {
    success: false,
    error: "La réinitialisation locale est désactivée. Utilisez l'API sécurisée /api/auth/otp.",
  };
}

export function resetUserPasswordWithOTP(
  _identifierOrEmail: string,
  _otp: string,
  _newPassword: string
): { success: boolean; error?: string } {
  return {
    success: false,
    error: "La réinitialisation locale est désactivée. Utilisez l'API sécurisée /api/auth/password.",
  };
}

