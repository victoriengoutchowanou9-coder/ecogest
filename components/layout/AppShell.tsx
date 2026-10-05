"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Role, ROLE_NAVIGATIONS, CURRENT_SCHOOL } from "@/lib/permissions";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { MobileDrawer } from "./MobileDrawer";
import { BottomTabBar } from "./BottomTabBar";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  // Detect current role from URL pathname or default to directeur
  const getRoleFromPath = (): Role => {
    if (pathname?.startsWith("/parent")) return "parent";
    if (pathname?.startsWith("/comptabilite")) return "comptabilite";
    if (pathname?.startsWith("/censeur")) return "censeur";
    if (pathname?.startsWith("/enseignant")) return "enseignant";
    return "directeur";
  };

  const [currentRole, setCurrentRole] = useState<Role>(getRoleFromPath());
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeSchoolYear, setActiveSchoolYear] = useState(CURRENT_SCHOOL.activeYear);

  // Sync role when URL changes
  React.useEffect(() => {
    setCurrentRole(getRoleFromPath());
  }, [pathname]);

  const handleRoleChange = (newRole: Role) => {
    setCurrentRole(newRole);
    router.push(ROLE_NAVIGATIONS[newRole].basePath);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Topbar: Fixed at top */}
      <Topbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
        activeSchoolYear={activeSchoolYear}
        onSchoolYearChange={setActiveSchoolYear}
      />

      <div className="flex flex-1">
        {/* Desktop Sidebar: Hidden on small screens, visible on lg+ */}
        <Sidebar
          currentRole={currentRole}
          className="hidden lg:flex sticky top-16"
        />

        {/* Mobile Full-Height Drawer */}
        <MobileDrawer
          isOpen={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          currentRole={currentRole}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar currentRole={currentRole} />
    </div>
  );
};
