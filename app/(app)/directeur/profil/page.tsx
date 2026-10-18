"use client";

import React from "react";
import { UserCircle, Shield, Mail, Phone, Building2, ShieldCheck, KeyRound, Award } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/lib/auth-store";
import { useSubscriptionStore } from "@/lib/subscription-store";
import { ChangePasswordSection } from "@/components/account/ChangePasswordSection";

export default function DirecteurProfilPage() {
  const { user } = useAuth();
  const { activeSchool, schoolPlanDef } = useSubscriptionStore();

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      <PageHeader
        title="Mon Profil & Paramètres du Compte"
        subtitle="Consultez vos informations d'administrateur et gérez votre mot de passe de connexion"
        breadcrumbs={[
          { label: "Direction", href: "/directeur" },
          { label: "Mon Profil" },
        ]}
      />

      {/* Identity Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-school-primary via-purple-700 to-indigo-800 px-6 flex items-end">
          <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-lg translate-y-6 flex items-center justify-center border-2 border-white">
            <div className="w-full h-full rounded-xl bg-purple-50 text-school-primary flex items-center justify-center font-black text-xl">
              {user?.fullName?.charAt(0) || "D"}
            </div>
          </div>
        </div>

        <div className="pt-8 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">{user?.fullName || "Directeur"}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  Direction Générale
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Compte Actif
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Identifiant : <span className="font-mono font-bold text-slate-800">{user?.identifier || "Non défini"}</span> &bull; Établissement : <strong className="text-slate-800">{activeSchool.name}</strong> (Code : {activeSchool.code || "0000"})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{user?.email || "Non renseigné"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{user?.phone || activeSchool.phone || "Non renseigné"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Formule active : <strong>{schoolPlanDef.name}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <ChangePasswordSection />
    </div>
  );
}
