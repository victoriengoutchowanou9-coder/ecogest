"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  School,
  Calendar,
  User,
  ChevronDown,
  ExternalLink,
  Shield,
  CreditCard,
  GraduationCap,
  BookOpenCheck,
  Home,
} from "lucide-react";
import { Role, ROLE_NAVIGATIONS, SCHOOL_YEARS, CURRENT_SCHOOL } from "@/lib/permissions";
import { cn } from "@/lib/utils";

interface TopbarProps {
  currentRole: Role;
  onRoleChange: (newRole: Role) => void;
  onOpenMobileDrawer: () => void;
  activeSchoolYear: string;
  onSchoolYearChange: (year: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentRole,
  onRoleChange,
  onOpenMobileDrawer,
  activeSchoolYear,
  onSchoolYearChange,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const currentNav = ROLE_NAVIGATIONS[currentRole];

  const roleIcons: Record<Role, React.ReactNode> = {
    directeur: <Shield className="w-4 h-4 text-purple-600" />,
    censeur: <BookOpenCheck className="w-4 h-4 text-blue-600" />,
    enseignant: <GraduationCap className="w-4 h-4 text-emerald-600" />,
    comptabilite: <CreditCard className="w-4 h-4 text-amber-600" />,
    parent: <Home className="w-4 h-4 text-indigo-600" />,
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 md:px-6 backdrop-blur shadow-xs">
      <div className="flex items-center gap-3">
        {/* Hamburger Mobile Button - 44px min */}
        <button
          type="button"
          onClick={onOpenMobileDrawer}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 touch-target"
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* School Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-school-primary text-white flex items-center justify-center font-bold text-base shadow-sm">
            E
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm md:text-base text-school-primary leading-tight">
                ECODUC
              </span>
              <span className="text-[10px] bg-school-50 text-school-primary font-semibold px-1.5 py-0.5 rounded border border-school-100">
                GESTIO 229
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block truncate max-w-[200px] md:max-w-xs">
              {CURRENT_SCHOOL.shortName}
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls: School Year always visible + Role switcher + Public link */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* School Year Selector (Required: always visible in Topbar) */}
        <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
          <select
            value={activeSchoolYear}
            onChange={(e) => onSchoolYearChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            aria-label="Année scolaire en cours"
          >
            {SCHOOL_YEARS.map((y) => (
              <option key={y.id} value={y.id}>
                {y.id}
              </option>
            ))}
          </select>
        </div>

        {/* Public Page Quick Link */}
        <Link
          href={`/ecole/${CURRENT_SCHOOL.slug}`}
          target="_blank"
          className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-school-primary hover:bg-slate-100 rounded-lg transition-colors"
          title="Consulter la vitrine publique"
        >
          <span>Vitrine</span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 touch-target"
            aria-expanded={roleMenuOpen}
            aria-label="Changer de rôle actif pour la démonstration"
          >
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex">{roleIcons[currentRole]}</span>
              <span className="text-xs md:text-sm font-semibold text-slate-800">
                {currentNav.roleLabel.split("/")[0].trim()}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in"
              role="menu"
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Changer d'espace (Rôle)
                </p>
              </div>
              {(Object.keys(ROLE_NAVIGATIONS) as Role[]).map((r) => {
                const nav = ROLE_NAVIGATIONS[r];
                const isSelected = r === currentRole;
                return (
                  <button
                    key={r}
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      onRoleChange(r);
                      setRoleMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs md:text-sm text-left transition-colors touch-target min-h-[40px]",
                      isSelected
                        ? "bg-school-50 text-school-primary font-bold"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {roleIcons[r]}
                      <span>{nav.roleLabel}</span>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-school-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
