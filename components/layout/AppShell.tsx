"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShieldAlert, CreditCard, Sparkles, ArrowRight, Lock } from "lucide-react";
import { ROLE_NAVIGATIONS, CURRENT_SCHOOL, Role } from "@/lib/permissions";
import { RoleProvider, useRoleContext } from "@/lib/context/RoleContext";
import { useAuthStore } from "@/lib/auth-store";
import { useSubscriptionStore } from "@/lib/subscription-store";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { MobileDrawer } from "./MobileDrawer";
import { BottomTabBar } from "./BottomTabBar";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShellInner — composant interne qui consomme le RoleContext et AuthStore.
 */
function AppShellInner({ children }: { children: React.ReactNode }) {
  const { role: routeRole } = useRoleContext();
  const pathname = usePathname();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const { schoolStatus, schoolPlanDef, parentStatus, parentPlanDef } = useSubscriptionStore();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeSchoolYear, setActiveSchoolYear] = useState(CURRENT_SCHOOL.activeYear);

  const { isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    if (!currentUser || !isAuthenticated) {
      router.push("/connexion");
    }
  }, [currentUser, isAuthenticated, router]);

  if (!currentUser || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-school-primary/20 text-school-primary flex items-center justify-center mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Authentification requise</h2>
        <p className="text-xs text-slate-400 mb-6 max-w-sm">
          Vous devez être authentifié avec un identifiant et un mot de passe valides pour accéder aux données de cet établissement.
        </p>
        <Link
          href="/connexion"
          className="px-6 py-2.5 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-md transition"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  const handleRoleChange = (newRole: Role) => {
    router.push(ROLE_NAVIGATIONS[newRole].basePath);
  };

  // Détection du rôle requis pour la route courante
  const requiredRole: Role = pathname.startsWith("/parent")
    ? "parent"
    : pathname.startsWith("/censeur")
    ? "censeur"
    : pathname.startsWith("/secretariat")
    ? "secretariat"
    : pathname.startsWith("/surveillant")
    ? "surveillant"
    : pathname.startsWith("/enseignant")
    ? "enseignant"
    : pathname.startsWith("/comptabilite")
    ? "comptabilite"
    : "directeur";

  // 1. Contrôle de cloisonnement strict des profils
  const isRoleMismatch = currentUser && currentUser.role !== requiredRole;

  // 2. Contrôle du statut d'abonnement
  const isSchoolPending =
    currentUser?.role === "directeur" &&
    schoolStatus === "PENDING_PAYMENT" &&
    pathname !== "/directeur/abonnement";

  const isParentPending =
    currentUser?.role === "parent" &&
    parentStatus === "PENDING_PAYMENT" &&
    pathname !== "/parent/abonnement";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Topbar: Fixed at top */}
      <Topbar
        onRoleChange={handleRoleChange}
        onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
        activeSchoolYear={activeSchoolYear}
        onSchoolYearChange={setActiveSchoolYear}
      />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden lg:flex sticky top-16" />

        {/* Mobile Full-Height Drawer */}
        <MobileDrawer
          isOpen={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            {/* Cas 1 : Rôle non autorisé (Tentative d'accéder à un autre espace) */}
            {isRoleMismatch ? (
              <div className="bg-white rounded-3xl border border-rose-200 p-8 md:p-12 text-center max-w-xl mx-auto shadow-sm space-y-4 my-12 animate-in fade-in">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Accès Réservé &mdash; Profil Non Autorisé
                  </h2>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                    Vous êtes actuellement connecté avec le profil{" "}
                    <strong className="text-slate-900 uppercase font-mono">
                      {currentUser?.role}
                    </strong>
                    . Cet espace est strictement réservé au rôle{" "}
                    <strong className="text-school-primary uppercase font-mono">
                      {requiredRole}
                    </strong>
                    . Chaque utilisateur dispose de son propre environnement dédié.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href={ROLE_NAVIGATIONS[currentUser.role].basePath}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-xs transition"
                  >
                    <span>
                      Retourner à mon espace{" "}
                      {ROLE_NAVIGATIONS[currentUser.role].roleLabel.split("/")[0].trim()}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : isSchoolPending ? (
              /* Cas 2 : Directeur - Abonnement établissement en attente de paiement */
              <div className="bg-amber-50 rounded-3xl border-2 border-amber-300 p-6 md:p-10 text-center max-w-2xl mx-auto shadow-md space-y-5 my-8 animate-in fade-in">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
                    Abonnement en attente de validation
                  </span>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-3">
                    Activation requise pour {currentUser.schoolName}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-600 mt-2 leading-relaxed">
                    Votre établissement a été enregistré avec la formule{" "}
                    <strong className="text-slate-900">{schoolPlanDef.name}</strong> (
                    {schoolPlanDef.priceFcfa.toLocaleString()} FCFA/mois). Pour débloquer
                    l&apos;accès complet à vos classes, élèves et modules opérationnels, veuillez
                    régler votre abonnement.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/directeur/abonnement"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-school-primary text-white text-xs md:text-sm font-bold hover:bg-school-700 shadow-sm transition"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Finaliser et Payer l&apos;Abonnement</span>
                  </Link>
                </div>
              </div>
            ) : isParentPending ? (
              /* Cas 3 : Parent - Abonnement en attente d'activation */
              <div className="bg-amber-50 rounded-3xl border-2 border-amber-300 p-6 md:p-10 text-center max-w-2xl mx-auto shadow-md space-y-5 my-8 animate-in fade-in">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
                    Activation du compte Parent
                  </span>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-3">
                    Abonnement pour {currentUser.schoolName}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-600 mt-2 leading-relaxed">
                    Votre compte est rattaché à l&apos;établissement{" "}
                    <strong>{currentUser.schoolName}</strong>. Pour suivre les notes, l&apos;assiduité
                    et les devoirs de votre enfant, veuillez activer votre forfait mensuel (
                    {parentPlanDef.priceFcfa} FCFA/mois).
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/parent/abonnement"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-school-primary text-white text-xs md:text-sm font-bold hover:bg-school-700 shadow-sm transition"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Activer mon abonnement Parent</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Accès normal autorisé */
              children
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar />
    </div>
  );
}

/**
 * AppShell — Shell principal de l'application.
 */
export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <RoleProvider>
      <AppShellInner>{children}</AppShellInner>
    </RoleProvider>
  );
};
