"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Lock, ShieldAlert } from "lucide-react";
import { DevTopbar } from "./DevTopbar";
import { DevSidebar } from "./DevSidebar";
import { DevMobileDrawer } from "./DevMobileDrawer";
import { DevBottomTabBar } from "./DevBottomTabBar";

interface DevShellProps {
  children: React.ReactNode;
}

export const DevShell: React.FC<DevShellProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [developerEmail, setDeveloperEmail] = useState("admin.technique@ecogest.bj");
  const [developerIdentifier, setDeveloperIdentifier] = useState("DEV-ROOT-001");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    async function checkDevSession() {
      try {
        const res = await fetch("/api/dev-admin/session");
        if (!res.ok) {
          router.push("/dev-admin/connexion");
          return;
        }
        const data = await res.json();
        if (!data.authenticated) {
          router.push("/dev-admin/connexion");
          return;
        }
        setDeveloperEmail(data.email || "admin.technique@ecogest.bj");
        setDeveloperIdentifier(data.identifier || "DEV-ROOT-001");
        setIsLoadingAuth(false);
      } catch {
        router.push("/dev-admin/connexion");
      }
    }
    checkDevSession();
  }, [router]);

  const handleGlobalRefresh = () => {
    setIsRefreshing(true);
    // Déclenche un événement personnalisé ou recharge doux
    window.dispatchEvent(new Event("ecogest-dev-refresh"));
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-school-primary/10 text-school-primary flex items-center justify-center mb-3 border border-school-primary/20">
          <div className="w-6 h-6 border-2 border-school-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Chargement de la Console Développeur...</h3>
        <p className="text-xs text-slate-500 mt-1">Vérification sécurisée des autorisations techniques</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Topbar: Fixed at top */}
      <DevTopbar
        onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
        developerEmail={developerEmail}
        developerIdentifier={developerIdentifier}
        onRefresh={handleGlobalRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <DevSidebar className="hidden lg:flex sticky top-16" />

        {/* Mobile Full-Height Drawer */}
        <DevMobileDrawer
          isOpen={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          developerEmail={developerEmail}
          developerIdentifier={developerIdentifier}
        />

        {/* Main Content Area — Exactement la même disposition que l'Espace Administrateur */}
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <DevBottomTabBar />
    </div>
  );
};
