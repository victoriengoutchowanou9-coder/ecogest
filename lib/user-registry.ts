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
  password: string;
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
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Erreur lecture registre utilisateurs:", e);
  }
  return [];
}

function saveUsers(users: SystemUser[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
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
 * Authentifie un utilisateur avec son Identifiant ou E-mail + Mot de passe obligatoire.
 */
export function authenticateSystemUser(
  identifierOrEmail: string,
  password: string
): { success: boolean; error?: string; user?: SystemUser } {
  const query = (identifierOrEmail || "").trim();
  const pwd = (password || "").trim();

  if (!query) {
    return { success: false, error: "Veuillez saisir votre identifiant ou votre adresse e-mail." };
  }
  if (!pwd) {
    return { success: false, error: "Veuillez saisir votre mot de passe." };
  }

  const users = loadUsers();
  const found = users.find(
    (u) =>
      u.identifier?.toUpperCase() === query.toUpperCase() ||
      u.email?.toLowerCase() === query.toLowerCase()
  );

  if (!found) {
    return {
      success: false,
      error: "Identifiant ou adresse e-mail introuvable. Veuillez vérifier vos informations de connexion.",
    };
  }

  if (found.status === "SUSPENDU") {
    return {
      success: false,
      error: "Ce compte utilisateur est actuellement suspendu. Veuillez contacter la Direction de votre établissement.",
    };
  }

  if (found.password !== pwd) {
    return {
      success: false,
      error: "Mot de passe incorrect. Veuillez vérifier votre saisie.",
    };
  }

  return {
    success: true,
    user: found,
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

/**
 * Modifie le mot de passe d'un utilisateur après vérification de l'ancien mot de passe.
 * Fonctionne de façon autonome pour chaque utilisateur (Direction, Censeur, Enseignant, Parent, etc.).
 */
export function changeUserPassword(
  identifierOrEmail: string,
  oldPassword: string,
  newPassword: string
): { success: boolean; error?: string } {
  const query = (identifierOrEmail || "").trim();
  const oldPwd = (oldPassword || "").trim();
  const newPwd = (newPassword || "").trim();

  if (!query) {
    return { success: false, error: "Utilisateur non identifié." };
  }
  if (!oldPwd) {
    return { success: false, error: "Veuillez renseigner votre mot de passe actuel." };
  }
  if (!newPwd || newPwd.length < 6) {
    return { success: false, error: "Le nouveau mot de passe doit comporter au moins 6 caractères." };
  }
  if (oldPwd === newPwd) {
    return { success: false, error: "Le nouveau mot de passe doit être différent de l'ancien mot de passe." };
  }

  const users = loadUsers();
  const userIndex = users.findIndex(
    (u) =>
      u.identifier?.toUpperCase() === query.toUpperCase() ||
      u.email?.toLowerCase() === query.toLowerCase()
  );

  if (userIndex === -1) {
    return { success: false, error: "Compte introuvable dans le système." };
  }

  if (users[userIndex].password !== oldPwd) {
    return { success: false, error: "L'ancien mot de passe est incorrect." };
  }

  users[userIndex].password = newPwd;
  saveUsers(users);

  return { success: true };
}

/**
 * Génère un code OTP sécurisé pour la réinitialisation de mot de passe (procédure « Mot de passe oublié ? »).
 */
export function requestPasswordResetOTP(identifierOrEmail: string): {
  success: boolean;
  error?: string;
  otp?: string;
  emailMasked?: string;
  userFullName?: string;
} {
  const query = (identifierOrEmail || "").trim();
  if (!query) {
    return { success: false, error: "Veuillez renseigner votre identifiant ou adresse e-mail." };
  }

  const users = loadUsers();
  const user = users.find(
    (u) =>
      u.identifier?.toUpperCase() === query.toUpperCase() ||
      u.email?.toLowerCase() === query.toLowerCase()
  );

  if (!user) {
    return {
      success: false,
      error: "Aucun compte ne correspond à cet identifiant ou cette adresse e-mail.",
    };
  }

  if (user.status === "SUSPENDU") {
    return {
      success: false,
      error: "Ce compte est actuellement suspendu. Veuillez contacter l'administration de votre établissement.",
    };
  }

  // Génération d'un OTP à 6 chiffres valide 15 minutes
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000;

  const existingRequests = loadResetOTPs().filter(
    (r) => r.identifierOrEmail.toLowerCase() !== query.toLowerCase()
  );
  existingRequests.push({
    identifierOrEmail: query.toLowerCase(),
    otp,
    expiresAt,
  });
  saveResetOTPs(existingRequests);

  // Masquage de l'e-mail (ex: j***n@domain.com)
  const parts = user.email.split("@");
  const local = parts[0] || "";
  const domain = parts[1] || "ecogest.bj";
  const maskedLocal = local.length <= 2 ? local[0] + "***" : `${local[0]}***${local[local.length - 1]}`;
  const emailMasked = `${maskedLocal}@${domain}`;

  return {
    success: true,
    otp,
    emailMasked,
    userFullName: user.fullName,
  };
}

/**
 * Réinitialise le mot de passe à l'aide de l'OTP de validation.
 */
export function resetUserPasswordWithOTP(
  identifierOrEmail: string,
  otp: string,
  newPassword: string
): { success: boolean; error?: string } {
  const query = (identifierOrEmail || "").trim().toLowerCase();
  const code = (otp || "").trim();
  const newPwd = (newPassword || "").trim();

  if (!query || !code) {
    return { success: false, error: "Identifiant et code de sécurité requis." };
  }

  if (!newPwd || newPwd.length < 6) {
    return { success: false, error: "Le nouveau mot de passe doit comporter au moins 6 caractères." };
  }

  const requests = loadResetOTPs();
  const validRequest = requests.find(
    (r) =>
      r.identifierOrEmail === query &&
      r.otp === code &&
      r.expiresAt > Date.now()
  );

  if (!validRequest) {
    return {
      success: false,
      error: "Code de sécurité invalide ou expiré (durée de validité : 15 minutes). Veuillez faire une nouvelle demande.",
    };
  }

  const users = loadUsers();
  const userIndex = users.findIndex(
    (u) =>
      u.identifier?.toUpperCase() === query.toUpperCase() ||
      u.email?.toLowerCase() === query.toLowerCase()
  );

  if (userIndex === -1) {
    return { success: false, error: "Utilisateur introuvable dans le système." };
  }

  users[userIndex].password = newPwd;
  saveUsers(users);

  // Supprimer l'OTP utilisé
  saveResetOTPs(requests.filter((r) => r !== validRequest));

  return { success: true };
}

