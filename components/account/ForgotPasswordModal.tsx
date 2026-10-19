"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  KeyRound,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose, onSuccess }: ForgotPasswordModalProps) {
  const { toast } = useToast();

  // 1: Saisie identifiant/email/téléphone
  // 2: Choix méthode de réception (E-mail vs SMS)
  // 3: Saisie du code à 6 chiffres et du nouveau mot de passe
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [identifierInput, setIdentifierInput] = useState("");
  const [accountInfo, setAccountInfo] = useState<{
    fullName: string;
    email: string;
    maskedEmail: string | null;
    hasEmail: boolean;
    phone: string;
    maskedPhone: string | null;
    hasPhone: boolean;
  } | null>(null);

  const [selectedChannel, setSelectedChannel] = useState<"EMAIL" | "SMS">("EMAIL");
  const [activeTarget, setActiveTarget] = useState("");
  const [maskedTarget, setMaskedTarget] = useState("");

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  // Compte à rebours de 60 secondes pour le renvoi de code
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Réinitialiser les champs à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIdentifierInput("");
      setAccountInfo(null);
      setDigits(["", "", "", "", "", ""]);
      setNewPassword("");
      setConfirmPassword("");
      setErrorMsg(null);
      setSuccessMsg(null);
      setRemainingAttempts(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ÉTAPE 1 : Recherche du compte
  const handleLookupAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = identifierInput.trim();
    if (!query) {
      setErrorMsg("Veuillez renseigner votre identifiant, e-mail ou numéro de téléphone.");
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifierOrEmail: query }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(data.error || "Aucun compte correspondant n'a été trouvé.");
        setLoading(false);
        return;
      }

      setAccountInfo({
        fullName: data.fullName || "Utilisateur",
        email: data.email || "",
        maskedEmail: data.maskedEmail || null,
        hasEmail: Boolean(data.hasEmail),
        phone: data.phone || "",
        maskedPhone: data.maskedPhone || null,
        hasPhone: Boolean(data.hasPhone),
      });

      // Si le compte a les deux ou seulement l'un
      if (data.hasEmail && !data.hasPhone) {
        // Envoi direct par email
        await handleSendOtp("EMAIL", data.email, data.maskedEmail || data.email, data.fullName);
      } else if (!data.hasEmail && data.hasPhone) {
        // Envoi direct par SMS
        await handleSendOtp("SMS", data.phone, data.maskedPhone || data.phone, data.fullName);
      } else {
        // L'utilisateur choisit la méthode
        setStep(2);
      }
    } catch {
      setErrorMsg("Une erreur réseau est survenue lors de la recherche du compte.");
    } finally {
      setLoading(false);
    }
  };

  // ÉTAPE 2 : Envoi du code selon le canal choisi
  const handleSendOtp = async (
    channel: "EMAIL" | "SMS",
    targetValue?: string,
    maskedValue?: string,
    name?: string
  ) => {
    const target = targetValue || (channel === "EMAIL" ? accountInfo?.email : accountInfo?.phone) || "";
    const masked = maskedValue || (channel === "EMAIL" ? accountInfo?.maskedEmail : accountInfo?.maskedPhone) || target;
    const userFullName = name || accountInfo?.fullName || "Utilisateur";

    if (!target) {
      setErrorMsg("Coordonnées de contact introuvables pour ce canal.");
      return;
    }

    setSelectedChannel(channel);
    setActiveTarget(target);
    setMaskedTarget(masked);
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose: "PASSWORD_RESET",
          channel,
          email: channel === "EMAIL" ? target : undefined,
          phone: channel === "SMS" ? target : undefined,
          fullName: userFullName,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.cooldownRemaining) {
          setCooldown(data.cooldownRemaining);
        }
        setErrorMsg(data.error || "Impossible d'envoyer le code.");
        setLoading(false);
        return;
      }

      setCooldown(data.cooldownSeconds || 60);
      setDigits(["", "", "", "", "", ""]);
      setRemainingAttempts(null);
      setStep(3);
      toast(
        `Code de sécurité envoyé par ${channel === "EMAIL" ? "e-mail" : "SMS"} !`,
        "success"
      );

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch {
      setErrorMsg("Une erreur est survenue lors de l'envoi du code.");
    } finally {
      setLoading(false);
    }
  };

  // Renvoyer le code
  const handleResendOtp = async () => {
    if (cooldown > 0 || loading) return;
    await handleSendOtp(selectedChannel, activeTarget, maskedTarget);
  };

  // Gestion saisie code PIN
  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6);
      if (pasted) {
        const newDigits = [...digits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = pasted[i] || "";
        }
        setDigits(newDigits);
        const nextIndex = Math.min(pasted.length, 5);
        inputRefs.current[nextIndex]?.focus();
        return;
      }
    }

    const cleanChar = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanChar;
    setDigits(newDigits);

    if (cleanChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ÉTAPE 3 : Validation du code et réinitialisation du mot de passe
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const otpCode = digits.join("");
    if (otpCode.length !== 6) {
      setErrorMsg("Veuillez saisir le code complet à 6 chiffres.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMsg("Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("La confirmation ne correspond pas au nouveau mot de passe.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset",
          identifierOrEmail: activeTarget,
          channel: selectedChannel,
          otp: otpCode,
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (typeof data.remainingAttempts === "number") {
          setRemainingAttempts(data.remainingAttempts);
        }
        setErrorMsg(data.error || "Code invalide ou expiré.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter.");
      toast("Mot de passe réinitialisé avec succès !", "success");
      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
        setStep(1);
      }, 2000);
    } catch {
      setErrorMsg("Une erreur est survenue lors de la réinitialisation du mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  const codeComplete = digits.every((d) => d.length === 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-school-primary to-school-800 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-3">
            <KeyRound className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold">Récupération de mot de passe</h3>
          <p className="text-xs text-white/80 mt-1">
            {step === 1 && "Identifiez votre compte pour recevoir un code de sécurité"}
            {step === 2 && "Choisissez comment recevoir votre code de vérification"}
            {step === 3 && "Saisissez le code reçu et définissez votre nouveau mot de passe"}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span>{errorMsg}</span>
                {remainingAttempts !== null && remainingAttempts > 0 && (
                  <span className="block font-semibold mt-0.5">
                    Tentative(s) restante(s) : {remainingAttempts}
                  </span>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ÉTAPE 1 : IDENTIFICATION */}
          {step === 1 && (
            <form onSubmit={handleLookupAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Identifiant, e-mail ou numéro de téléphone
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifierInput}
                    onChange={(e) => setIdentifierInput(e.target.value)}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    data-lpignore="true"
                    placeholder="Identifiant, e-mail ou téléphone (+229...)"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Saisissez l&apos;e-mail, le numéro de téléphone ou l&apos;identifiant officiel rattaché à votre compte.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading || !identifierInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-school-primary hover:bg-school-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Recherche...</span>
                    </>
                  ) : (
                    <>
                      <span>Continuer</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ÉTAPE 2 : CHOIX DU CANAL (EMAIL vs SMS) */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Choisissez comment recevoir votre code de vérification :
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Compte trouvé pour <strong>{accountInfo?.fullName}</strong>.
                </p>
              </div>

              {/* Option E-mail */}
              {accountInfo?.hasEmail && (
                <button
                  type="button"
                  onClick={() => handleSendOtp("EMAIL")}
                  disabled={loading}
                  className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-school-primary hover:bg-blue-50/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-school-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800 block">Par e-mail</span>
                      <span className="text-xs text-slate-500 font-mono">
                        {accountInfo.maskedEmail}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-school-primary group-hover:translate-x-1 transition-all" />
                </button>
              )}

              {/* Option SMS */}
              {accountInfo?.hasPhone && (
                <button
                  type="button"
                  onClick={() => handleSendOtp("SMS")}
                  disabled={loading}
                  className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-school-primary hover:bg-blue-50/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800 block">Par SMS</span>
                      <span className="text-xs text-slate-500 font-mono">
                        {accountInfo.maskedPhone}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-school-primary group-hover:translate-x-1 transition-all" />
                </button>
              )}

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : SAISIE DU CODE ET NOUVEAU MOT DE PASSE */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-school-primary" />
                  Code de sécurité envoyé
                </p>
                <p className="text-[11px] text-blue-700 mt-1">
                  Un code de validation à 6 chiffres a été expédié par{" "}
                  <strong>{selectedChannel === "EMAIL" ? "e-mail" : "SMS"}</strong> à :{" "}
                  <strong className="font-mono text-slate-900">{maskedTarget}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 text-center mb-2">
                  Entrez le code reçu
                </label>
                <div className="flex items-center justify-center gap-2">
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-13 text-center text-xl font-bold font-mono rounded-xl border-2 border-slate-300 focus:border-school-primary focus:ring-2 focus:ring-school-primary/20 outline-none transition-all shadow-sm"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between mt-2 pt-1">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={cooldown > 0 || loading}
                    className="text-xs font-semibold text-school-primary hover:text-school-700 disabled:text-slate-400 flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    {cooldown > 0 ? `Renvoyer le code (${cooldown}s)` : "Renvoyer le code"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-slate-500 hover:text-slate-700 underline"
                  >
                    Changer de méthode
                  </button>
                </div>
              </div>

              {/* Nouveau mot de passe */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nouveau mot de passe (min. 8 caractères)
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="w-full pl-3.5 pr-10 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="w-full pl-3.5 pr-10 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary"
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
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!codeComplete || loading}
                  className="px-5 py-2.5 rounded-xl bg-school-primary hover:bg-school-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Réinitialisation...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Réinitialiser le mot de passe</span>
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
