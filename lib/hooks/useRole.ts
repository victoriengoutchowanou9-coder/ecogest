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

let lastActiveRole: Role = "directeur";

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
 * Préserve l'espace actif (Censeur, Comptabilité, etc.) lors de la navigation
 * vers les routes partagées (/support...) sans réinitialiser arbitrairement vers Directeur.
 */
export function useRole(): RoleContext {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const userRole: Role = normalizeRole(user?.role);
  const pathRole = extractRoleFromPath(pathname);

  // Mémorisation de l'espace actif dès qu'un chemin de rôle explicite est visité
  if (pathRole) {
    lastActiveRole = pathRole;
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("ecogest_active_viewing_role", pathRole);
      } catch {}
    }
  }

  // Détection du paramètre optionnel ?role= dans l'URL (ex: /support?role=censeur)
  let queryRole: Role | null = null;
  if (typeof window !== "undefined") {
    try {
      const q = new URLSearchParams(window.location.search).get("role");
      if (q && ROLE_NAVIGATIONS[q as Role]) {
        queryRole = q as Role;
      }
    } catch {}
  }

  // Récupération de l'espace mémorisé dans la session
  let savedRole: Role | null = null;
  if (typeof window !== "undefined") {
    try {
      const s = sessionStorage.getItem("ecogest_active_viewing_role") as Role | null;
      if (s && ROLE_NAVIGATIONS[s]) {
        savedRole = s;
      }
    } catch {}
  }

  // Ordre de priorité :
  // 1. Préfixe d'URL explicite (/censeur/..., /comptabilite/...)
  // 2. Paramètre de requête ?role=
  // 3. Espace mémorisé dans la session de consultation active
  // 4. Dernier rôle actif en mémoire
  // 5. Rôle naturel de l'utilisateur authentifié
  // 6. Repli sécurisé "directeur"
  const role: Role =
    pathRole ||
    queryRole ||
    savedRole ||
    lastActiveRole ||
    (userRole && ROLE_NAVIGATIONS[userRole] ? userRole : "directeur");

  const nav = ROLE_NAVIGATIONS[role] || ROLE_NAVIGATIONS.directeur;

  return {
    role,
    nav,
    basePath: nav.basePath,
    roleLabel: nav.roleLabel,
  };
}
