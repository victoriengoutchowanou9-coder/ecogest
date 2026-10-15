/**
 * RoleContext — Adapté du pattern TenantContext de GESTIO 229
 *
 * Provider React qui expose le rôle actif à toute l'arborescence.
 * Élimine complètement le prop-drilling currentRole dans AppShell.
 *
 * Usage dans AppShell :
 *   <RoleProvider>
 *     <Topbar />
 *     <Sidebar />
 *     <BottomTabBar />
 *   </RoleProvider>
 *
 * Usage dans n'importe quel composant enfant :
 *   const { role, nav } = useRoleContext();
 */

"use client";

import React, { createContext, useContext } from "react";
import { RoleContext, useRole } from "@/lib/hooks/useRole";

// ─── Context ──────────────────────────────────────────────────────────────────

const RoleCtx = createContext<RoleContext | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * Wraps les composants layout.
 * Doit être placé dans un composant "use client" (AppShell ou équivalent).
 */
export function RoleProvider({ children }: { children: React.ReactNode }) {
  const roleContext = useRole();

  return <RoleCtx.Provider value={roleContext}>{children}</RoleCtx.Provider>;
}

// ─── Consumer hook ────────────────────────────────────────────────────────────

/**
 * Consomme le contexte rôle.
 * Lève une erreur claire si utilisé hors d'un RoleProvider.
 *
 * @example
 * const { role, nav, roleLabel } = useRoleContext();
 */
export function useRoleContext(): RoleContext {
  const ctx = useContext(RoleCtx);
  if (!ctx) {
    throw new Error(
      "[useRoleContext] Doit être utilisé à l'intérieur d'un <RoleProvider>. " +
        "Vérifiez que AppShell entoure bien vos composants layout."
    );
  }
  return ctx;
}
