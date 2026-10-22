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
 * Privilégie le rôle authentifié de l'utilisateur sur les routes partagées (/support, etc.).
 */
export function useRole(): RoleContext {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const rawRole = (user?.role || "").trim().toLowerCase();
  const userRole: Role = rawRole.includes("censeur")
    ? "censeur"
    : rawRole.includes("directeur") || rawRole.includes("admin")
    ? "directeur"
    : rawRole.includes("enseignant") || rawRole.includes("prof")
    ? "enseignant"
    : rawRole.includes("surveillant")
    ? "surveillant"
    : rawRole.includes("secretari")
    ? "secretariat"
    : rawRole.includes("comptab")
    ? "comptabilite"
    : rawRole.includes("parent")
    ? "parent"
    : (rawRole as Role) || "directeur";

  const pathRole = extractRoleFromPath(pathname);

  // Si l'URL a un préfixe de rôle précis (/censeur, /directeur...), on prend le rôle de l'URL.
  // Pour les pages partagées (/support, etc.), on prend TOUJOURS le rôle authentifié de l'utilisateur.
  // Repli sécurisé : "directeur" uniquement si aucun utilisateur n'est identifié.
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
