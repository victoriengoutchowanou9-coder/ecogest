"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserCircle,
  Shield,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  KeyRound,
  LogOut,
  Terminal,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/Toast";

interface DevProfile {
  identifier: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  roleLabel: string;
  status: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export default function DevProfilPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<DevProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Formulaire informations
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Formulaire mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dev-admin/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          setFormName(data.profile.fullName || "");
          setFormPhone(data.profile.phone || "");
        }
      } else {
        toast("Impossible de charger les données du profil.", "error");
      }
    } catch {
      toast("Erreur réseau.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast("Le nom complet est obligatoire.", "error");
      return;
    }

    setIsSavingInfo(true);
    try {
      const res = await fetch("/api/dev-admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formName.trim(),
          phone: formPhone.trim(),
        }),
      });

      if (res.ok) {
        toast("Informations de profil mises à jour avec succès.", "success");
        loadProfile();
      } else {
        toast("Erreur lors de la mise à jour des informations.", "error");
      }
    } catch {
      toast("Erreur réseau.", "error");
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast("Veuillez renseigner votre mot de passe actuel.", "error");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast("Le nouveau mot de passe doit comporter au moins 8 caractères.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("Les deux nouveaux mots de passe ne correspondent pas.", "error");
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await fetch("/api/dev-admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast("Mot de passe modifié avec succès dans la base de données !", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast(data.error || "Impossible de modifier le mot de passe.", "error");
      }
    } catch {
      toast("Erreur réseau.", "error");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/dev-admin/logout", { method: "POST" });
    } catch {}
    toast("Déconnexion réussie.", "info");
    router.push("/connexion");
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      <PageHeader
        title="Mon Profil &amp; Sécurité Développeur"
        subtitle="Consultez votre identifiant technique, modifiez vos informations autorisées et sécurisez votre mot de passe"
        breadcrumbs={[
          { label: "Développeur", href: "/dev-admin" },
          { label: "Mon Profil" },
        ]}
        actions={
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition shadow-2xs touch-target"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        }
      />

      {/* Identity Card — Exactement comme le profil de l'Administrateur Directeur */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-school-primary via-purple-700 to-indigo-800 px-6 flex items-end">
          <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-lg translate-y-6 flex items-center justify-center border-2 border-white">
            <div className="w-full h-full rounded-xl bg-purple-50 text-school-primary flex items-center justify-center font-black text-xl">
              <Terminal className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="pt-8 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900">
                  {profile?.fullName || "Administrateur Technique ECOGEST"}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  Rôle Développeur Technique
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Compte Actif
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Identifiant Technique :{" "}
                <span className="font-mono font-bold text-slate-800">{profile?.identifier || "DEV-ROOT-001"}</span>{" "}
                &bull; Domaine de supervision :{" "}
                <strong className="text-slate-800">Administration Centrale ECOGEST Multi-Écoles</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate font-mono">{profile?.email || "admin.technique@ecogest.bj"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{profile?.phone || "+2290155445122"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Accès : <strong>Supervision Globale (Toutes Écoles)</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Deux Colonnes : Modifier Mes Informations & Changer Mon Mot de Passe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire 1 : Informations Autorisées */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-school-50 text-school-primary flex items-center justify-center font-bold">
              <UserCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Informations Autorisées</h3>
              <p className="text-[11px] text-slate-500">Mettre à jour le nom technique et le contact d'urgence</p>
            </div>
          </div>

          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Nom complet ou Titre technique :</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-school-primary focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Adresse e-mail technique :</label>
              <input
                type="email"
                disabled
                value={profile?.email || "admin.technique@ecogest.bj"}
                className="w-full p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 font-mono cursor-not-allowed"
                title="L'e-mail racine développeur est verrouillé par la configuration système."
              />
              <span className="text-[10px] text-slate-400">Verrouillé pour la sécurité du compte racine.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Téléphone de contact technique :</label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-school-primary focus:bg-white transition"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingInfo}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 transition shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingInfo ? "Enregistrement..." : "Enregistrer les modifications"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Formulaire 2 : Modification du Mot de Passe Sécurisé (PBKDF2) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
              <KeyRound className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Modifier mon mot de passe</h3>
              <p className="text-[11px] text-slate-500">Mise à jour chiffrée avec hachage PBKDF2-SHA512</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Mot de passe actuel :</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-school-primary focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Nouveau mot de passe (min 8 caractères) :</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-school-primary focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Confirmer le nouveau mot de passe :</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-school-primary focus:bg-white transition"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingPassword}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isSavingPassword ? "Modification en cours..." : "Changer le mot de passe"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bloc de Sécurité & Non-Accès aux Mots de Passe d'Autrui (Requirement 8) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Politique de Confidentialité &amp; Cryptographie ECOGEST</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Conformément aux normes de sécurité et aux exigences du logiciel ECOGEST, le rôle Développeur ne stocke et ne transmet aucun mot de passe utilisateur en clair. Les mots de passe sont tous protégés par un hachage cryptographique irréversible avec sel unique. Seul chaque utilisateur peut réinitialiser ou modifier son propre mot de passe.
        </p>
      </div>
    </div>
  );
}
