"use client";

import React from "react";
import { FileText, ShieldCheck, Mail, Phone, Building2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/lib/auth-store";
import { useSubscriptionStore } from "@/lib/subscription-store";
import { ChangePasswordSection } from "@/components/account/ChangePasswordSection";

export default function SecretariatProfilPage() {
  const { user } = useAuth();
  const { activeSchool } = useSubscriptionStore();

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      <PageHeader
        title="Mon Profil & Paramètres du Compte"
        subtitle="Consultez vos informations de Secrétariat et gérez votre mot de passe d'accès"
        breadcrumbs={[
          { label: "Secrétariat", href: "/secretariat" },
          { label: "Mon Profil" },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-teal-700 via-emerald-700 to-slate-800 px-6 flex items-end">
          <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-lg translate-y-6 flex items-center justify-center border-2 border-white">
            <div className="w-full h-full rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black text-xl">
              {user?.fullName?.charAt(0) || "S"}
            </div>
          </div>
        </div>

        <div className="pt-8 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">{user?.fullName || "Secrétaire Pédagogique"}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  Secrétariat
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Compte Actif
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Identifiant : <span className="font-mono font-bold text-slate-800">{user?.identifier || "Non défini"}</span> &bull; Établissement : <strong className="text-slate-800">{activeSchool.name}</strong>{activeSchool.code && activeSchool.code !== "ECO-001" ? ` (Code : ${activeSchool.code})` : ""}
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
              <span>Année active : <strong>{activeSchool.activeYear}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordSection />
    </div>
  );
}
