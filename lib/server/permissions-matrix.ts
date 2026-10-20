import { Role } from "@/lib/permissions";
import { AuthenticatedUserContext } from "@/lib/server/supabase-admin";

export type Resource =
  | "grades"
  | "bulletins"
  | "students"
  | "classes"
  | "subjects"
  | "payments"
  | "users"
  | "audit_logs"
  | "sessions"
  | "settings"
  | "subscriptions";

export type Action =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "validate"
  | "publish"
  | "unlock";

/**
 * Matrice formelle des permissions par rôle : Role x Resource x Action
 */
export const ROLE_PERMISSIONS_MATRIX: Record<
  string,
  Partial<Record<Resource, Action[]>>
> = {
  directeur: {
    grades: ["read", "create", "update", "delete", "unlock"],
    bulletins: ["read", "create", "update", "delete", "validate", "publish"],
    students: ["read", "create", "update", "delete"],
    classes: ["read", "create", "update", "delete"],
    subjects: ["read", "create", "update", "delete"],
    payments: ["read", "create", "update"],
    users: ["read", "create", "update", "delete"],
    audit_logs: ["read"],
    sessions: ["read", "delete"],
    settings: ["read", "update"],
    subscriptions: ["read", "update"],
  },
  censeur: {
    grades: ["read", "create", "update", "delete", "unlock"],
    bulletins: ["read", "create", "update", "validate", "publish"],
    students: ["read", "create", "update"],
    classes: ["read", "update"],
    subjects: ["read", "create", "update"],
    payments: ["read"],
    users: ["read"],
    audit_logs: ["read"],
    sessions: ["read"],
    settings: ["read"],
    subscriptions: ["read"],
  },
  enseignant: {
    grades: ["read", "create", "update"], // Restreint à ses classes/matières
    bulletins: ["read"],
    students: ["read"],
    classes: ["read"],
    subjects: ["read"],
    payments: [],
    users: [],
    audit_logs: [],
    sessions: ["read"],
    settings: ["read"],
    subscriptions: [],
  },
  comptabilite: {
    grades: [],
    bulletins: [],
    students: ["read"],
    classes: ["read"],
    subjects: [],
    payments: ["read", "create", "update"],
    users: ["read"],
    audit_logs: ["read"],
    sessions: ["read"],
    settings: ["read"],
    subscriptions: ["read", "create", "update"],
  },
  secretariat: {
    grades: ["read"],
    bulletins: ["read"],
    students: ["read", "create", "update"],
    classes: ["read"],
    subjects: ["read"],
    payments: ["read"],
    users: ["read"],
    audit_logs: [],
    sessions: ["read"],
    settings: ["read"],
    subscriptions: ["read"],
  },
  surveillant: {
    grades: ["read"],
    bulletins: ["read"],
    students: ["read"],
    classes: ["read"],
    subjects: ["read"],
    payments: [],
    users: [],
    audit_logs: [],
    sessions: ["read"],
    settings: ["read"],
    subscriptions: [],
  },
  parent: {
    grades: ["read"], // Restreint à ses enfants
    bulletins: ["read"], // Restreint à ses enfants et aux bulletins publiés
    students: ["read"], // Restreint à ses enfants
    classes: ["read"],
    subjects: ["read"],
    payments: ["read", "create"], // Ses propres paiements
    users: [],
    audit_logs: [],
    sessions: ["read"],
    settings: [],
    subscriptions: ["read", "create"],
  },
  eleve: {
    grades: ["read"], // Ses propres notes
    bulletins: ["read"], // Son propre bulletin publié
    students: ["read"],
    classes: ["read"],
    subjects: ["read"],
    payments: [],
    users: [],
    audit_logs: [],
    sessions: ["read"],
    settings: [],
    subscriptions: [],
  },
};

/**
 * Vérifie si un rôle possède une permission sur une ressource
 */
export function hasPermission(
  role: string,
  resource: Resource,
  action: Action
): boolean {
  const normalizedRole = (role || "").toLowerCase();
  const roleRules = ROLE_PERMISSIONS_MATRIX[normalizedRole];
  if (!roleRules) return false;

  const allowedActions = roleRules[resource];
  if (!allowedActions) return false;

  return allowedActions.includes(action);
}

/**
 * Asserte l'autorisation côté serveur et lève une erreur explicite si refusé
 */
export function assertRolePermission(
  userContext: AuthenticatedUserContext,
  resource: Resource,
  action: Action
): void {
  // 1. Contrôle immédiat du statut de compte
  if (userContext.status !== "active") {
    throw new Error("Compte utilisateur inactif, suspendu ou banni.");
  }

  // 2. Contrôle de la matrice des permissions
  const allowed = hasPermission(userContext.role, resource, action);
  if (!allowed) {
    throw new Error(
      `Accès refusé : le rôle '${userContext.role}' n'a pas la permission '${action}' sur la ressource '${resource}'.`
    );
  }
}
