"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarDays,
  Globe,
  ShieldAlert,
  Settings,
  UserCheck,
  BookOpenCheck,
  AlertTriangle,
  BookOpen,
  FileSpreadsheet,
  CheckSquare,
  DollarSign,
  Users2,
  Receipt,
  History,
  Home,
  Award,
  Clock,
  CreditCard,
  LogOut,
} from "lucide-react";
import { Role, ROLE_NAVIGATIONS } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-5 h-5 shrink-0" />,
  Users: <Users className="w-5 h-5 shrink-0" />,
  GraduationCap: <GraduationCap className="w-5 h-5 shrink-0" />,
  CalendarDays: <CalendarDays className="w-5 h-5 shrink-0" />,
  Globe: <Globe className="w-5 h-5 shrink-0" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5 shrink-0" />,
  Settings: <Settings className="w-5 h-5 shrink-0" />,
  UserCheck: <UserCheck className="w-5 h-5 shrink-0" />,
  BookOpenCheck: <BookOpenCheck className="w-5 h-5 shrink-0" />,
  AlertTriangle: <AlertTriangle className="w-5 h-5 shrink-0" />,
  BookOpen: <BookOpen className="w-5 h-5 shrink-0" />,
  FileSpreadsheet: <FileSpreadsheet className="w-5 h-5 shrink-0" />,
  CheckSquare: <CheckSquare className="w-5 h-5 shrink-0" />,
  DollarSign: <DollarSign className="w-5 h-5 shrink-0" />,
  Users2: <Users2 className="w-5 h-5 shrink-0" />,
  Receipt: <Receipt className="w-5 h-5 shrink-0" />,
  History: <History className="w-5 h-5 shrink-0" />,
  Home: <Home className="w-5 h-5 shrink-0" />,
  Award: <Award className="w-5 h-5 shrink-0" />,
  Clock: <Clock className="w-5 h-5 shrink-0" />,
  CreditCard: <CreditCard className="w-5 h-5 shrink-0" />,
};

interface SidebarProps {
  currentRole: Role;
  onNavigate?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRole, onNavigate, className }) => {
  const pathname = usePathname();
  const currentNav = ROLE_NAVIGATIONS[currentRole];

  return (
    <aside
      className={cn(
        "flex flex-col justify-between h-[calc(100vh-4rem)] border-r border-slate-200 bg-white py-4 px-3 w-64 shrink-0 overflow-y-auto",
        className
      )}
    >
      <div className="space-y-6">
        {/* Role Header Banner */}
        <div className="px-3 py-2 bg-school-50 rounded-xl border border-school-100">
          <p className="text-[11px] font-semibold text-school-primary uppercase tracking-wider">
            Espace Actif
          </p>
          <p className="text-sm font-bold text-school-primary truncate mt-0.5">
            {currentNav.roleLabel}
          </p>
        </div>

        {/* Dynamic Navigation Menu Items */}
        <nav className="space-y-1" aria-label="Navigation principale">
          {currentNav.items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== currentNav.basePath && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors touch-target",
                  isActive
                    ? "bg-school-primary text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  {ICONS[item.iconName] || <Home className="w-5 h-5 shrink-0" />}
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-amber-100 text-amber-800"
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
        <Link
          href="/connexion"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors touch-target"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Déconnexion</span>
        </Link>
      </div>
    </aside>
  );
};
