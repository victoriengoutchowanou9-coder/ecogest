"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { School, Lock, User, ArrowRight, ShieldCheck, CheckCircle } from "lucide-react";
import { ROLE_NAVIGATIONS, Role, CURRENT_SCHOOL } from "@/lib/permissions";
import { useToast } from "@/components/ui/Toast";

export default function ConnexionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [identifiant, setIdentifiant] = useState("directeur@ccpa-cotonou.bj");
  const [password, setPassword] = useState("••••••••");
  const [selectedRole, setSelectedRole] = useState<Role>("directeur");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifiant) {
      toast("Veuillez renseigner votre identifiant ou adresse e-mail.", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast(`Connexion réussie en tant que ${ROLE_NAVIGATIONS[selectedRole].roleLabel}`, "success");
      router.push(ROLE_NAVIGATIONS[selectedRole].basePath);
    }, 600);
  };

  const handleRoleQuickSelect = (r: Role) => {
    setSelectedRole(r);
    switch (r) {
      case "directeur":
        setIdentifiant("directeur@ccpa-cotonou.bj");
        break;
      case "censeur":
        setIdentifiant("censeur@ccpa-cotonou.bj");
        break;
      case "enseignant":
        setIdentifiant("prof.hounkponou@ccpa-cotonou.bj");
        break;
      case "comptabilite":
        setIdentifiant("comptable@ccpa-cotonou.bj");
        break;
      case "parent":
        setIdentifiant("parent.adanhouan@gmail.com");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-school-primary text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md">
            E
          </div>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900 tracking-tight">
            ECODUC
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {CURRENT_SCHOOL.name} · GESTIO 229
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Espace de connexion</h2>
            <p className="text-xs text-slate-500">
              Saisissez vos identifiants pour accéder à votre espace
            </p>
          </div>

          {/* Quick Role Preset Pills for Demo */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Rôle de démonstration
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["directeur", "censeur", "enseignant", "comptabilite", "parent"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleQuickSelect(r)}
                  className={`px-2 py-1.5 text-xs font-semibold rounded-lg border transition-colors touch-target min-h-[38px] capitalize ${
                    selectedRole === r
                      ? "bg-school-primary text-white border-school-primary"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Identifiant, Matricule ou E-mail
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                  required
                  placeholder="Ex: parent@ecole.bj"
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-school-accent focus:ring-1 focus:ring-school-accent touch-target min-h-[44px]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-slate-700">
                  Mot de passe
                </label>
                <a href="#" className="text-xs text-school-accent hover:underline">
                  Oublié ?
                </a>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-school-accent focus:ring-1 focus:ring-school-accent touch-target min-h-[44px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-school-primary text-white font-semibold text-sm hover:bg-school-700 shadow-sm transition-colors touch-target min-h-[44px]"
            >
              <span>{loading ? "Connexion en cours..." : "Se connecter"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400">
            Protection des données certifiée par GESTIO 229 &middot; RLS Active
          </div>
        </div>

        {/* Back home */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-school-primary font-medium"
          >
            &larr; Retour au portail principal
          </Link>
        </div>
      </div>
    </div>
  );
}
