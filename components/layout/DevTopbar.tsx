"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Terminal,
  ChevronDown,
  User,
  LogOut,
  RefreshCw,
  PlusCircle,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { PWAInstallButton } from "@/components/pwa/PWAInstallButton";

interface DevTopbarProps {
  onOpenMobileDrawer: () => void;
  developerEmail?: string;
  developerIdentifier?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const DevTopbar: React.FC<DevTopbarProps> = ({
  onOpenMobileDrawer,
  developerEmail = "admin.technique@ecogest.bj",
  developerIdentifier = "DEV-ROOT-001",
  onRefresh,
  isRefreshing = false,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/dev-admin/logout", { method: "POST" });
    } catch {}
    toast("Déconnexion réussie.", "info");
    router.push("/dev-admin/connexion");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-3 md:px-6 backdrop-blur shadow-xs">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {/* Hamburger Mobile Button */}
        <button
          type="button"
          onClick={onOpenMobileDrawer}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 touch-target shrink-0"
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Brand Logo & Title with Multi-School Supervision Indicator */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-school-primary text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
            <Terminal className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm md:text-base text-slate-900 leading-tight truncate">
                ECOGEST Supervision
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 font-mono">
                {developerIdentifier}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 font-medium">
              <span>Console Technique Développeur</span>
              <span>&bull;</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Système Opérationnel
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Refresh button */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition"
            title="Rafraîchir les métriques"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-school-primary")} />
            <span>Actualiser</span>
          </button>
        )}

        {/* User Profile Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 touch-target transition-all"
            aria-expanded={userMenuOpen}
            aria-label="Menu du compte développeur"
          >
            <div className="w-8 h-8 rounded-full bg-school-primary text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              D
            </div>
            <div className="text-left hidden sm:block min-w-0 max-w-[140px]">
              <p className="text-xs font-bold text-slate-900 truncate">
                Administrateur Technique
              </p>
              <p className="text-[10px] font-semibold text-school-primary truncate capitalize">
                Développeur
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in"
              role="menu"
            >
              <div className="px-3 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">
                  Administrateur Technique
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
                  {developerEmail}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-school-50 text-school-primary border border-school-200">
                    Développeur
                  </span>
                  <span className="text-[10px] text-slate-500 truncate">
                    ECOGEST Central
                  </span>
                </div>
              </div>

              <div className="space-y-1 py-1.5 text-xs">
                <Link
                  href="/dev-admin/profil"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Mon Profil &amp; Sécurité</span>
                </Link>

                <Link
                  href="/dev-admin/systeme"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>État des Services &amp; Santé</span>
                </Link>
              </div>

              <div className="pt-1.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold text-xs transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
