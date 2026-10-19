"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Mail,
  Smartphone,
  ArrowRight,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface AccountVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  phone: string;
  fullName?: string;
  purpose?: "REGISTRATION" | "PASSWORD_RESET";
  onVerified: (verificationToken: string) => Promise<void> | void;
}

export function AccountVerificationModal({
  isOpen,
  onClose,
  email,
  phone,
  fullName = "Utilisateur",
  purpose = "REGISTRATION",
  onVerified,
}: AccountVerificationModalProps) {
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedChannel, setSelectedChannel] = useState<"EMAIL" | "SMS">("EMAIL");
  const [maskedTarget, setMaskedTarget] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  // Compte à rebours du renvoi de code (60 secondes)
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Réinitialisation lorsque la modale s'ouvre
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrorMsg(null);
      setDigits(["", "", "", "", "", ""]);
      setRemainingAttempts(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Envoi du code OTP via le canal sélectionné
  const handleSelectChannelAndSend = async (channel: "EMAIL" | "SMS") => {
    setSelectedChannel(channel);
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose,
          channel,
          email,
          phone,
          fullName,
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

      setMaskedTarget(data.maskedTarget || (channel === "EMAIL" ? email : phone));
      setCooldown(data.cooldownSeconds || 60);
      setStep(2);
      setDigits(["", "", "", "", "", ""]);
      setRemainingAttempts(null);
      toast(
        `Code de confirmation envoyé par ${channel === "EMAIL" ? "e-mail" : "SMS"} !`,
        "success"
      );

      // Focus automatique sur le premier chiffre
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMsg("Une erreur réseau est survenue lors de l'envoi du code.");
    } finally {
      setLoading(false);
    }
  };

  // Renvoyer le code OTP
  const handleResendCode = async () => {
    if (cooldown > 0 || loading) return;
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose,
          channel: selectedChannel,
          email,
          phone,
          fullName,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.cooldownRemaining) {
          setCooldown(data.cooldownRemaining);
        }
        setErrorMsg(data.error || "Impossible de renvoyer le code.");
        return;
      }

      setCooldown(data.cooldownSeconds || 60);
      setDigits(["", "", "", "", "", ""]);
      setRemainingAttempts(null);
      toast(
        `Nouveau code envoyé par ${selectedChannel === "EMAIL" ? "e-mail" : "SMS"} !`,
        "success"
      );
      inputRefs.current[0]?.focus();
    } catch {
      setErrorMsg("Erreur lors du renvoi du code.");
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la saisie des 6 chiffres
  const handleDigitChange = (index: number, value: string) => {
    // Si l'utilisateur colle un code complet
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

    // Passer au champ suivant
    if (cleanChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Vérification finale du code saisi
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      setErrorMsg("Veuillez saisir les 6 chiffres du code reçu.");
      return;
    }

    setErrorMsg(null);
    setVerifying(true);

    try {
      const target = selectedChannel === "EMAIL" ? email : phone;
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose,
          channel: selectedChannel,
          target,
          code,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setRemainingAttempts(
          typeof data.remainingAttempts === "number" ? data.remainingAttempts : null
        );
        setErrorMsg(data.error || "Code de validation incorrect.");
        setVerifying(false);
        return;
      }

      toast("Vérification réussie avec succès !", "success");
      await onVerified(data.verificationToken || "");
    } catch {
      setErrorMsg("Une erreur est survenue lors de la vérification.");
      setVerifying(false);
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
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold">Vérification de votre compte</h3>
          <p className="text-xs text-white/80 mt-1">
            {step === 1
              ? "Choisissez votre méthode de vérification pour sécuriser votre compte"
              : "Saisissez le code temporaire pour confirmer et activer votre compte"}
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

          {step === 1 ? (
            /* ÉTAPE 1 : CHOIX DE LA MÉTHODE */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Comment souhaitez-vous recevoir votre code de confirmation ?
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Sélectionnez le canal de réception de votre choix :
                </p>
              </div>

              {/* Option 1 : E-mail */}
              <button
                type="button"
                onClick={() => handleSelectChannelAndSend("EMAIL")}
                disabled={loading || !email}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-school-primary hover:bg-blue-50/50 transition-all flex items-center justify-between group disabled:opacity-50"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-school-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">Par e-mail</span>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-school-primary font-semibold rounded-full">
                        Recommandé
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono mt-0.5 block truncate max-w-[220px]">
                      {email || "Non renseigné"}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-school-primary group-hover:translate-x-1 transition-all" />
              </button>

              {/* Option 2 : SMS */}
              <button
                type="button"
                onClick={() => handleSelectChannelAndSend("SMS")}
                disabled={loading || !phone}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-school-primary hover:bg-blue-50/50 transition-all flex items-center justify-between group disabled:opacity-50"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">Par numéro de téléphone</span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 font-semibold rounded-full">
                        SMS Direct
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                      {phone || "Non renseigné"}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-school-primary group-hover:translate-x-1 transition-all" />
              </button>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            /* ÉTAPE 2 : SAISIE DU CODE */
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs">
                <p className="font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-school-primary" />
                  Code envoyé avec succès
                </p>
                <p className="text-[11px] text-blue-700 mt-1">
                  Un code de confirmation à 6 chiffres a été envoyé par{" "}
                  <strong>{selectedChannel === "EMAIL" ? "e-mail" : "SMS"}</strong> à :{" "}
                  <strong className="font-mono text-slate-900">{maskedTarget}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 text-center mb-2">
                  Entrez le code reçu
                </label>
                {/* 6 cases de code PIN */}
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
                <p className="text-[11px] text-slate-500 text-center mt-2">
                  Code temporaire valable pendant 10 minutes
                </p>
              </div>

              {/* Renvoyer le code & changer de méthode */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={cooldown > 0 || loading}
                  className="text-xs font-semibold text-school-primary hover:text-school-700 disabled:text-slate-400 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  {cooldown > 0
                    ? `Renvoyer le code (${cooldown}s)`
                    : "Renvoyer le code"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMsg(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 underline transition-colors"
                >
                  Changer de méthode
                </button>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!codeComplete || verifying}
                  className="px-5 py-2.5 rounded-xl bg-school-primary hover:bg-school-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Validation en cours...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Valider mon compte</span>
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
