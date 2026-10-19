"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  X,
  LayoutDashboard,
  Building2,
  Users,
  ShieldAlert,
  AlertTriangle,
  CreditCard,
  Server,
  LifeBuoy,
  UserCircle,
  LogOut,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface DevMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  developerEmail?: string;
  developerIdentifier?: string;
}

export const DevMobileDrawer: React.FC<DevMobileDrawerProps> = ({
  isOpen,
  onClose,
  developerEmail = "admin.technique@ecogest.bj",
  developerIdentifier = "DEV-ROOT-001",
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      await fetch("/api/dev-admin/logout", { method: "POST" });
    } catch {}
    toast("Déconnexion réussie.", "info");
    router.push("/connexion");
  };

  const navItems = [
    { title: "Tableau de bord", href: "/dev-admin", icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
    { title: "Établissements", href: "/dev-admin/etablissements", icon: <Building2 className="w-5 h-5 shrink-0" /> },
    { title: "Utilisateurs", href: "/dev-admin/utilisateurs", icon: <Users className="w-5 h-5 shrink-0" /> },
    { title: "Journal des activités", href: "/dev-admin/activites", icon: <ShieldAlert className="w-5 h-5 shrink-0" /> },
    { title: "Erreurs & incidents", href: "/dev-admin/erreurs", icon: <AlertTriangle className="w-5 h-5 shrink-0" /> },
    { title: "Abonnements", href: "/dev-admin/abonnements", icon: <CreditCard className="w-5 h-5 shrink-0" /> },
    { title: "Système & Services", href: "/dev-admin/systeme", icon: <Server className="w-5 h-5 shrink-0" /> },
    { title: "Support & Requêtes", href: "/dev-admin/support", icon: <LifeBuoy className="w-5 h-5 shrink-0" /> },
    { title: "Mon Profil", href: "/dev-admin/profil", icon: <UserCircle className="w-5 h-5 shrink-0" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between p-4 z-10 animate-in slide-in-from-left duration-200">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-school-primary text-white flex items-center justify-center font-bold">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-slate-900 block leading-tight">
                  ECOGEST Dev
                </span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">
                  {developerIdentifier}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
            {navItems.map((item) => {
              const isActive =
                item.href === "/dev-admin"
                  ? pathname === "/dev-admin"
                  : pathname === item.href || pathname?.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
                    isActive
                      ? "bg-school-primary text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={() => {
              onClose();
              handleLogout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
};
