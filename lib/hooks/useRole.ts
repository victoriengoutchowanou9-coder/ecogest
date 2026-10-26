/**
 * useRole — Adapté du pattern useTenant de GESTIO 229
 *
 * Extrait le rôle actif depuis l'URL pathname (/directeur, /censeur…)
 * et retourne le contexte complet : role, navigation, basePath.
 *
 * Remplace le prop-drilling AppShell → Topbar → Sidebar → BottomTabBar.
 * Utiliser useRole() directement dans chaque composant layout.
 */

"use client";

import { usePathname } from "next/navigation";
import { Role, ROLE_NAVIGATIONS, RoleNavigation, normalizeRole } from "@/lib/permissions";
import { useAuthStore } from "@/lib/auth-store";

export interface RoleContext {
  /** Rôle actif détecté depuis l'URL ou le compte authentifié */
  role: Role;
  /** Entrée complète du registre de navigation pour ce rôle */
  nav: RoleNavigation;
  /** Chemin de base du rôle (ex: "/directeur") */
  basePath: string;
  /** Label lisible (ex: "Directeur / Administration") */
  roleLabel: string;
}

/**
 * Extrait le rôle depuis le pathname s'il a un préfixe explicite.
 * Ex: "/censeur/notes" → "censeur"
 * Ex: "/support" → null (route neutre partagée)
 */
export function extractRoleFromPath(pathname: string | null): Role | null {
  if (!pathname) return null;
  if (pathname.startsWith("/parent")) return "parent";
  if (pathname.startsWith("/comptabilite")) return "comptabilite";
  if (pathname.startsWith("/censeur")) return "censeur";
  if (pathname.startsWith("/secretariat")) return "secretariat";
  if (pathname.startsWith("/surveillant")) return "surveillant";
  if (pathname.startsWith("/enseignant")) return "enseignant";
  if (pathname.startsWith("/directeur")) return "directeur";
  return null;
}

/**
 * Hook principal — retourne le contexte rôle complet.
 * Déterministe et identique côté serveur et côté client pour garantir l'affichage sans conflit d'hydratation.
 */
export function useRole(): RoleContext {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const userRole: Role = normalizeRole(user?.role);
  const pathRole = extractRoleFromPath(pathname);

  // Détermination stricte et immédiate de l'espace actif :
  // 1. Préfixe d'URL explicite (/directeur, /censeur, /comptabilite...)
  // 2. Rôle naturel de l'utilisateur connecté
  // 3. Repli par défaut "directeur"
  const role: Role =
    pathRole ||
    (userRole && ROLE_NAVIGATIONS[userRole] ? userRole : "directeur");

  const nav = ROLE_NAVIGATIONS[role] || ROLE_NAVIGATIONS.directeur;

  return {
    role,
    nav,
    basePath: nav.basePath,
    roleLabel: nav.roleLabel,
  };
}
