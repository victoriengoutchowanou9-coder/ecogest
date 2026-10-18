"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Sparkles, RefreshCw } from "lucide-react";
import { usePWA } from "./PWAProvider";

export const PWAInstallBanner: React.FC = () => {
  const {
    isInstallable,
    isInstalled,
    triggerInstall,
    updateAvailable,
    applyUpdate,
  } = usePWA();

  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a précédemment masqué la bannière pendant cette session
    if (typeof window !== "undefined") {
      const isDismissed = sessionStorage.getItem("ecogest_pwa_banner_dismissed");
      if (isDismissed === "true") {
        setDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("ecogest_pwa_banner_dismissed", "true");
    }
  };

  // 1. Bannière prioritaire de mise à jour si une nouvelle version d'ECOGEST est détectée (Requirement 7)
  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5">
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-school-primary text-white flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Mise à jour ECOGEST disponible</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Nouveau
              </span>
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Une nouvelle version de l'application est prête avec des améliorations et corrections.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={applyUpdate}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Actualiser l'application
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Bannière discrète d'installation (uniquement si non installée, installable et non masquée)
  if (isInstalled || !isInstallable || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 animate-in slide-in-from-bottom-4">
      <div className="bg-white/95 backdrop-blur-md p-3.5 md:p-4 rounded-2xl shadow-xl border border-school-200/80 flex items-center gap-3">
        {/* App Icon */}
        <div className="w-11 h-11 rounded-xl bg-school-primary text-white flex items-center justify-center font-black text-lg shadow-md shadow-school-primary/20 shrink-0">
          E
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
            <span>Installer l'application ECOGEST</span>
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            Accès direct &amp; confort d'une application native
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => triggerInstall()}
            className="px-3 py-1.5 rounded-xl bg-school-primary hover:bg-school-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Installer</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Ignorer la notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
