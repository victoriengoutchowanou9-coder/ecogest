"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  Terminal,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Server,
  Database,
  Cpu,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function DevAdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [passkey, setPasskey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);

  // Vérifier si une session développeur valide existe déjà
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const res = await fetch("/api/dev-admin/session");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            router.push("/dev-admin");
            return;
          }
        }
      } catch {
        // pas de session
      } finally {
        setIsVerifyingSession(false);
      }
    }
    checkExistingSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !passkey.trim()) {
      setErrorMessage("Veuillez renseigner votre identifiant et votre code de sécurité.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/dev-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          passkey: passkey.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(data.error || "Accès refusé. Informations invalides.");
        toast("Échec d'authentification développeur.", "error");
        return;
      }

      toast("Authentification développeur réussie. Chargement de la console...", "success");
      router.push("/dev-admin");
    } catch (err: any) {
      setErrorMessage("Erreur de connexion au serveur d'authentification.");
      toast("Erreur de connexion.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifyingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono">Vérification de l&apos;environnement d&apos;accès...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* En-tête discret */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-mono tracking-wider font-semibold text-slate-300">
            ECOGEST_CORE_SYS // SECURE_ENGINE
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            NODE_ONLINE
          </span>
          <span className="hidden sm:inline text-slate-600">PORT: 443 / TLS 1.3</span>
        </div>
      </div>

      {/* Carte centrale d'authentification */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
          {/* Liseré supérieur décoratif */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />

          {/* Badge & Titre */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-inner mb-2">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Console Développeur
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Administration Technique &bull; Surveillance Système
            </p>
          </div>

          {/* Alerte de sécurité stricte */}
          <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Espace Haute Sécurité Réservé</span>
              <p className="text-amber-300/80 leading-relaxed">
                Cet espace est strictement réservé à l&apos;administrateur technique. Toute tentative d&apos;accès non autorisée est tracée et enregistrée dans le journal de sécurité.
              </p>
            </div>
          </div>

          {/* Erreur éventuelle */}
          {errorMessage && (
            <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Formulaire de connexion développeur */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 font-mono flex items-center justify-between">
                <span>IDENTIFIANT_TECHNIQUE</span>
                <span className="text-[10px] text-slate-500">EMAIL DEV</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="admin.technique@ecogest.bj"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 font-mono flex items-center justify-between">
                <span>PASSKEY_SECRET</span>
                <span className="text-[10px] text-slate-500">CLÉ CHIFFRÉE</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••••••"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-500 hover:text-slate-300 absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-mono min-h-[46px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>AUTHENTIFICATION...</span>
                  </div>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>OUVRIR LA CONSOLE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Lien de retour discret */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <Link
              href="/"
              className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors font-mono"
            >
              &larr; Retour au site public ECOGEST
            </Link>
          </div>
        </div>

        {/* Notice d'audit */}
        <p className="text-center text-[11px] text-slate-600 font-mono mt-4">
          Session cryptée HMAC-SHA256 &bull; Protection CSRF &amp; HttpOnly Cookie
        </p>
      </div>

      {/* Pied de page technique */}
      <div className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 font-mono gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            Supabase PostgreSQL 17.6
          </span>
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            Next.js App Engine
          </span>
        </div>
        <div>ECOGEST DevAdmin Module &bull; v2.4-pro</div>
      </div>
    </div>
  );
}
