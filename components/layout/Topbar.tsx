import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Building2,
  Sparkles,
  Check,
  LogOut,
  Settings,
} from "lucide-react";
import { Role, ROLE_NAVIGATIONS, SCHOOL_YEARS } from "@/lib/permissions";
import { useRoleContext } from "@/lib/context/RoleContext";
import { useSubscriptionStore } from "@/lib/subscription-store";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onRoleChange: (newRole: Role) => void;
  onOpenMobileDrawer: () => void;
  activeSchoolYear: string;
  onSchoolYearChange: (year: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onRoleChange,
  onOpenMobileDrawer,
  activeSchoolYear,
  onSchoolYearChange,
}) => {
  const router = useRouter();
  const { role: currentRole } = useRoleContext();
  const { user: currentUser, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [schoolMenuOpen, setSchoolMenuOpen] = useState(false);
  const currentNav = ROLE_NAVIGATIONS[currentRole];

  const { activeSchool, schools, schoolPlan, schoolPlanDef, switchActiveSchool } =
    useSubscriptionStore();

  const roleIcons: Record<Role, React.ReactNode> = {
    directeur: <Shield className="w-4 h-4 text-purple-600" />,
    censeur: <BookOpenCheck className="w-4 h-4 text-blue-600" />,
    enseignant: <GraduationCap className="w-4 h-4 text-emerald-600" />,
    comptabilite: <CreditCard className="w-4 h-4 text-amber-600" />,
    parent: <Home className="w-4 h-4 text-indigo-600" />,
  };

  const planBadgeColors = {
    BASIC: "bg-slate-100 text-slate-800 border-slate-200",
    STANDARD: "bg-blue-50 text-blue-800 border-blue-200",
    PREMIUM: "bg-amber-50 text-amber-800 border-amber-300 font-bold",
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-3 md:px-6 backdrop-blur shadow-xs">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {/* Hamburger Mobile Button - 44px min */}
        <button
          type="button"
          onClick={onOpenMobileDrawer}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 touch-target shrink-0"
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* School Logo & Title with Multi-School Switcher */}
        <div className="relative flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-school-primary text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0 uppercase">
            {activeSchool.shortName ? activeSchool.shortName.charAt(0) : "E"}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm md:text-base text-slate-900 leading-tight truncate">
                {activeSchool.name}
              </span>

              {/* Multiple schools selector button (for Premium or multi-schools) */}
              {schools.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSchoolMenuOpen(!schoolMenuOpen)}
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 flex items-center gap-0.5 shrink-0"
                  title="Changer d'établissement actif"
                >
                  <span>Changer</span>
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
              <span>{activeSchool.city ? `${activeSchool.city}, ` : ""}{activeSchool.country}</span>
              <span>&bull;</span>
              <span className="font-medium text-slate-600">{activeSchool.activeYear}</span>
            </p>
          </div>

          {/* School Switcher Dropdown (Requirement 4) */}
          {schoolMenuOpen && schools.length > 1 && (
            <div className="absolute left-0 top-12 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-school-primary" />
                  <span>Vos Établissements (Formule {schoolPlan})</span>
                </p>
              </div>
              <div className="space-y-1 mt-1">
                {schools.map((sch) => {
                  const isCurrent = sch.id === activeSchool.id;
                  return (
                    <button
                      key={sch.id}
                      type="button"
                      onClick={() => {
                        switchActiveSchool(sch.id);
                        setSchoolMenuOpen(false);
                      }}
                      className={cn(
                        "w-full text-left p-2.5 rounded-xl transition flex items-center justify-between text-xs",
                        isCurrent
                          ? "bg-school-50 text-school-primary font-bold border border-school-100"
                          : "hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="truncate font-semibold text-slate-900">{sch.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {sch.city}, {sch.country}
                        </p>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-school-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Subscription Plan Badge + School Year + User Profile Menu */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Subscription Plan Badge */}
        <Link
          href={currentRole === "parent" ? "/parent/abonnement" : "/directeur/abonnement"}
          className={cn(
            "hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold hover:shadow-xs transition",
            planBadgeColors[schoolPlan]
          )}
          title="Gérer les forfaits et limites d'abonnement"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{schoolPlanDef.name}</span>
          <span className="text-[10px] opacity-75">
            ({schoolPlanDef.priceFcfa.toLocaleString()} F/m)
          </span>
        </Link>

        {/* School Year Selector */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
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

        {/* User Profile Menu (Rôle Cloisonné & Déconnexion) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 touch-target transition-all"
            aria-expanded={userMenuOpen}
            aria-label="Menu du compte utilisateur"
          >
            <div className="w-8 h-8 rounded-full bg-school-primary text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {currentUser?.fullName?.charAt(0) || "U"}
            </div>
            <div className="text-left hidden sm:block min-w-0 max-w-[130px]">
              <p className="text-xs font-bold text-slate-900 truncate">
                {currentUser?.fullName || "Utilisateur"}
              </p>
              <p className="text-[10px] font-semibold text-school-primary truncate capitalize">
                {currentNav.roleLabel.split("/")[0].trim()}
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
                  {currentUser?.fullName || "Utilisateur"}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {currentUser?.email || activeSchool.email || "Compte actif"}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-school-50 text-school-primary border border-school-200">
                    {currentNav.roleLabel.split("/")[0].trim()}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate">
                    {currentUser?.schoolName || activeSchool.name}
                  </span>
                </div>
              </div>

              <div className="space-y-1 py-1.5 text-xs">
                <Link
                  href={
                    currentRole === "directeur"
                      ? "/directeur/parametres"
                      : currentRole === "enseignant"
                      ? "/enseignant/profil"
                      : currentRole === "parent"
                      ? "/parent/profil"
                      : currentNav.basePath
                  }
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Mon Profil</span>
                </Link>

                <Link
                  href={currentRole === "parent" ? "/parent/abonnement" : "/directeur/abonnement"}
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Mon Abonnement</span>
                </Link>
              </div>

              <div className="pt-1.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                    router.push("/connexion");
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
