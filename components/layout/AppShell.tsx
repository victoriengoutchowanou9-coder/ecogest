"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_NAVIGATIONS, CURRENT_SCHOOL } from "@/lib/permissions";
import { RoleProvider, useRoleContext } from "@/lib/context/RoleContext";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { MobileDrawer } from "./MobileDrawer";
import { BottomTabBar } from "./BottomTabBar";
import type { Role } from "@/lib/permissions";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShellInner — composant interne qui consomme le RoleContext.
 * Séparé de AppShell pour pouvoir accéder au context après le Provider.
 */
function AppShellInner({ children }: { children: React.ReactNode }) {
  const { role } = useRoleContext();
  const router = useRouter();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeSchoolYear, setActiveSchoolYear] = useState(CURRENT_SCHOOL.activeYear);

  const handleRoleChange = (newRole: Role) => {
    router.push(ROLE_NAVIGATIONS[newRole].basePath);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Topbar: Fixed at top — lit le rôle via useRoleContext(), pas de prop */}
      <Topbar
        onRoleChange={handleRoleChange}
        onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
        activeSchoolYear={activeSchoolYear}
        onSchoolYearChange={setActiveSchoolYear}
      />

      <div className="flex flex-1">
        {/* Desktop Sidebar: lit le rôle via useRoleContext() */}
        <Sidebar className="hidden lg:flex sticky top-16" />

        {/* Mobile Full-Height Drawer */}
        <MobileDrawer
          isOpen={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar />
    </div>
  );
}

/**
 * AppShell — Shell principal de l'application.
 *
 * Intègre le pattern RoleProvider inspiré du TenantContext GESTIO 229 :
 * - Wraps AppShellInner dans un <RoleProvider>
 * - Tous les composants enfants (Topbar, Sidebar, BottomTabBar) lisent
 *   le rôle via useRoleContext() — aucun prop-drilling currentRole.
 */
export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <RoleProvider>
      <AppShellInner>{children}</AppShellInner>
    </RoleProvider>
  );
};
