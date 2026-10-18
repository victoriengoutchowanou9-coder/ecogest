"use client";

import React, { useState } from "react";
import { KeyRound, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, X, ShieldAlert, ArrowRight, RefreshCw } from "lucide-react";
import { requestPasswordResetOTP, resetUserPasswordWithOTP } from "@/lib/user-registry";
import { useToast } from "@/components/ui/Toast";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose, onSuccess }: ForgotPasswordModalProps) {
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [identifierOrEmail, setIdentifierOrEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [emailMasked, setEmailMasked] = useState<string | null>(null);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = requestPasswordResetOTP(identifierOrEmail);
      if (!res.success) {
        setErrorMsg(res.error || "Compte introuvable.");
        setLoading(false);
        return;
      }

      setEmailMasked(res.emailMasked || null);
      if (res.otp) {
        setDemoOtp(res.otp);
      }

      // Sync backend
      try {
        await fetch("/api/auth/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "request-reset",
            identifierOrEmail,
          }),
        });
      } catch (err) {
        console.warn("Backend request-reset note non bloquante:", err);
      }

      toast("Code de sécurité envoyé avec succès !", "success");
      setStep(2);
    } catch (err: any) {
      setErrorMsg("Une erreur est survenue lors de l'envoi du code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!otp.trim()) {
      setErrorMsg("Veuillez saisir le code de vérification à 6 chiffres.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("La confirmation ne correspond pas au nouveau mot de passe.");
      return;
    }

    setLoading(true);

    try {
      const res = resetUserPasswordWithOTP(identifierOrEmail, otp, newPassword);
      if (!res.success) {
        setErrorMsg(res.error || "Code invalide ou expiré.");
        setLoading(false);
        return;
      }

      // Sync backend
      try {
        await fetch("/api/auth/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "reset",
            identifierOrEmail,
            otp,
            newPassword,
          }),
        });
      } catch (err) {
        console.warn("Backend reset note non bloquante:", err);
      }

      setSuccessMsg("Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter.");
      toast("Mot de passe réinitialisé avec succès !", "success");
      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
        setStep(1);
        setIdentifierOrEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setSuccessMsg(null);
        setErrorMsg(null);
      }, 2000);
    } catch (err: any) {
      setErrorMsg("Une erreur est survenue lors de la réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setStep(1);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-school-primary to-school-800 text-white relative">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-3">
            <KeyRound className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold">Récupération du mot de passe</h3>
          <p className="text-xs text-white/80 mt-1">
            Réinitialisez votre mot de passe de façon autonome sans intervention de la Direction
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Identifiant ou adresse e-mail du compte
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifierOrEmail}
                    onChange={(e) => setIdentifierOrEmail(e.target.value)}
                    placeholder="Ex: 4827ENS01 ou prof@ecole.bj"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Saisissez l&apos;identifiant fourni lors de votre inscription ou votre adresse e-mail.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-school-primary hover:bg-school-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Recherche...</span>
                  ) : (
                    <>
                      <span>Envoyer le code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {emailMasked && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                  <p className="font-semibold">Code de sécurité généré pour votre compte</p>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Adresse associée : <strong className="font-mono">{emailMasked}</strong>
                  </p>
                  {demoOtp && (
                    <div className="mt-2 p-2 bg-white rounded-lg border border-blue-200 text-center">
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold">Code de validation</span>
                      <span className="text-lg font-mono font-black text-school-primary tracking-widest">{demoOtp}</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Code de vérification (6 chiffres) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Ex: 123456"
                  required
                  maxLength={6}
                  className="w-full px-3.5 py-2.5 text-center text-lg tracking-widest font-mono font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary"
                />
              </div>

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

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  &larr; Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-school-primary hover:bg-school-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Vérification...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Réinitialiser mon mot de passe</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
