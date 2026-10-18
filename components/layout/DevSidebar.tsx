"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
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

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
  badge?: string;
}

const DEV_NAV_ITEMS: NavItem[] = [
  {
    title: "Tableau de bord",
    href: "/dev-admin",
    icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    description: "Vue globale, métriques réelles et indicateurs de supervision",
  },
  {
    title: "Établissements",
    href: "/dev-admin/etablissements",
    icon: <Building2 className="w-5 h-5 shrink-0" />,
    description: "Supervision, blocage et gestion des établissements scolaires",
  },
  {
    title: "Utilisateurs",
    href: "/dev-admin/utilisateurs",
    icon: <Users className="w-5 h-5 shrink-0" />,
    description: "Supervision des comptes utilisateurs tous établissements confondus",
  },
  {
    title: "Journal des activités",
    href: "/dev-admin/activites",
    icon: <ShieldAlert className="w-5 h-5 shrink-0" />,
    description: "Traçabilité complète des actions, connexions et modifications",
  },
  {
    title: "Erreurs & incidents",
    href: "/dev-admin/erreurs",
    icon: <AlertTriangle className="w-5 h-5 shrink-0" />,
    description: "Surveillance des exceptions client et erreurs applicatives",
  },
  {
    title: "Abonnements",
    href: "/dev-admin/abonnements",
    icon: <CreditCard className="w-5 h-5 shrink-0" />,
    description: "Supervision des forfaits écoles & parents et attribution",
  },
  {
    title: "Système & Services",
    href: "/dev-admin/systeme",
    icon: <Server className="w-5 h-5 shrink-0" />,
    description: "État de santé de l'application, base PostgreSQL et APIs",
  },
  {
    title: "Support & Requêtes",
    href: "/dev-admin/support",
    icon: <LifeBuoy className="w-5 h-5 shrink-0" />,
    description: "Assistance technique et requêtes d'assistance des directeurs",
  },
  {
    title: "Mon Profil",
    href: "/dev-admin/profil",
    icon: <UserCircle className="w-5 h-5 shrink-0" />,
    description: "Paramètres du compte développeur et sécurité",
  },
];

interface DevSidebarProps {
  onNavigate?: () => void;
  className?: string;
}

export const DevSidebar: React.FC<DevSidebarProps> = ({ onNavigate, className }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await fetch("/api/dev-admin/logout", { method: "POST" });
    } catch {}
    toast("Déconnexion réussie.", "info");
    router.push("/dev-admin/connexion");
  };

  return (
    <aside
      className={cn(
        "flex flex-col justify-between h-[calc(100vh-4rem)] border-r border-slate-200 bg-white py-4 px-3 w-64 shrink-0 overflow-y-auto",
        className
      )}
    >
      <div className="space-y-6">
        {/* Role Header Banner — Strictement aligné sur le style Administrateur */}
        <div className="px-3 py-2.5 bg-school-50 rounded-xl border border-school-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-school-primary text-white flex items-center justify-center shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-school-primary uppercase tracking-wider">
              Espace Actif
            </p>
            <p className="text-xs font-black text-slate-900 truncate">
              Développeur / Technique
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Menu Items */}
        <nav className="space-y-1" aria-label="Navigation Développeur">
          {DEV_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dev-admin"
                ? pathname === "/dev-admin"
                : pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                title={item.description}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors touch-target",
                  isActive
                    ? "bg-school-primary text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.icon}
                  <span className="truncate">{item.title}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0",
                      isActive ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors touch-target text-left"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
