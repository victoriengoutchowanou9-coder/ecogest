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
import { Role, ROLE_NAVIGATIONS, RoleNavigation } from "@/lib/permissions";

export interface RoleContext {
  /** Rôle actif détecté depuis l'URL */
  role: Role;
  /** Entrée complète du registre de navigation pour ce rôle */
  nav: RoleNavigation;
  /** Chemin de base du rôle (ex: "/directeur") */
  basePath: string;
  /** Label lisible (ex: "Directeur / Administration") */
  roleLabel: string;
}

/**
 * Extrait le rôle depuis le pathname.
 * Ex: "/directeur/classes" → "directeur"
 * Ex: "/parent/notes" → "parent"
 * Fallback : "directeur"
 */
export function extractRoleFromPath(pathname: string | null): Role {
  if (!pathname) return "directeur";
  if (pathname.startsWith("/parent")) return "parent";
  if (pathname.startsWith("/comptabilite")) return "comptabilite";
  if (pathname.startsWith("/censeur")) return "censeur";
  if (pathname.startsWith("/secretariat")) return "secretariat";
  if (pathname.startsWith("/surveillant")) return "surveillant";
  if (pathname.startsWith("/enseignant")) return "enseignant";
  if (pathname.startsWith("/directeur")) return "directeur";
  return "directeur";
}

/**
 * Hook principal — retourne le contexte rôle complet.
 *
 * @example
 * const { role, nav, basePath, roleLabel } = useRole();
 * // role = "directeur"
 * // nav.items = [...7 items]
 * // basePath = "/directeur"
 */
export function useRole(): RoleContext {
  const pathname = usePathname();
  const role = extractRoleFromPath(pathname);
  const nav = ROLE_NAVIGATIONS[role];

  return {
    role,
    nav,
    basePath: nav.basePath,
    roleLabel: nav.roleLabel,
  };
}
