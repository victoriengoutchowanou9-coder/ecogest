"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { useToast } from "@/components/ui/Toast";

interface ChangePasswordSectionProps {
  userEmailOrIdentifier?: string;
  className?: string;
}

export function ChangePasswordSection({ userEmailOrIdentifier, className = "" }: ChangePasswordSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const identifier = userEmailOrIdentifier || user?.identifier || user?.email || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!identifier) {
      setErrorMsg("Impossible d'identifier l'utilisateur connecté.");
      return;
    }

    if (!oldPassword) {
      setErrorMsg("Veuillez saisir votre ancien mot de passe.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("Le nouveau mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("La confirmation ne correspond pas au nouveau mot de passe.");
      return;
    }

    if (oldPassword === newPassword) {
      setErrorMsg("Le nouveau mot de passe doit être différent de l'ancien mot de passe.");
      return;
    }

    setLoading(true);

    try {
      // Modification du mot de passe exclusivement via Supabase
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change",
          identifierOrEmail: identifier,
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "L'ancien mot de passe est incorrect ou le service est indisponible.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Votre mot de passe a été modifié avec succès dans Supabase !");
      toast("Mot de passe mis à jour avec succès.", "success");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setErrorMsg("Une erreur est survenue lors de la modification du mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 ${className}`}>
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-school-primary/10 text-school-primary flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Modifier le mot de passe</h3>
            <p className="text-xs text-slate-500">
              Chaque utilisateur peut modifier son mot de passe en toute autonomie et sécurité
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          Sécurisé
        </span>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        {/* Ancien mot de passe */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Ancien mot de passe <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Saisissez votre mot de passe actuel"
              required
              className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary"
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Nouveau mot de passe */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Nouveau mot de passe <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 caractères"
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirmation nouveau mot de passe */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Confirmation du nouveau mot de passe <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Répétez le nouveau mot de passe"
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-school-primary hover:bg-school-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 touch-target disabled:opacity-50"
          >
            {loading ? (
              <span>Enregistrement en cours...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Enregistrer</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
