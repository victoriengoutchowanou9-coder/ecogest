"use client";

import React, { useState } from "react";
import { Download, Smartphone, Check } from "lucide-react";
import { usePWA } from "./PWAProvider";
import { PWAInstallModal } from "./PWAInstallModal";
import { cn } from "@/lib/utils";

interface PWAInstallButtonProps {
  variant?: "primary" | "outline" | "compact" | "pill";
  label?: string;
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = "pill",
  label = "Installer ECOGEST",
  className,
}) => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    isDesktop,
    showIOSModal,
    setShowIOSModal,
    triggerInstall,
  } = usePWA();

  const [installing, setInstalling] = useState(false);

  // ⚠️ Requirement 2 & 3 :
  // - Ne jamais afficher le bouton comme disponible si l'application est déjà installée
  // - Ne jamais afficher si le navigateur ne le permet pas
  if (isInstalled || !isInstallable) {
    return null;
  }

  const handleClick = async () => {
    setInstalling(true);
    try {
      await triggerInstall();
    } finally {
      setInstalling(false);
    }
  };

  return (
    <>
      {variant === "compact" ? (
        <button
          type="button"
          onClick={handleClick}
          disabled={installing}
          className={cn(
            "p-2 rounded-xl text-school-primary hover:bg-school-50 border border-school-200 transition-colors shadow-2xs",
            className
          )}
          title="Installer l'application ECOGEST sur votre appareil"
          aria-label="Installer l'application ECOGEST"
        >
          <Download className="w-4 h-4" />
        </button>
      ) : variant === "primary" ? (
        <button
          type="button"
          onClick={handleClick}
          disabled={installing}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-sm transition",
            className
          )}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      ) : variant === "outline" ? (
        <button
          type="button"
          onClick={handleClick}
          disabled={installing}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-school-300 text-school-primary bg-white hover:bg-school-50 text-xs font-bold transition shadow-2xs",
            className
          )}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      ) : (
        // Mode "pill" raffiné et discret pour les barres de navigation
        <button
          type="button"
          onClick={handleClick}
          disabled={installing}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-school-50 to-blue-50 text-school-primary border border-school-200 hover:border-school-300 hover:shadow-xs text-xs font-bold transition-all",
            className
          )}
          title="Installer ECOGEST comme application sur cet appareil"
        >
          <Download className="w-3.5 h-3.5 text-school-primary animate-bounce" />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">Installer</span>
        </button>
      )}

      {/* Modal explicative guidée (iOS, instructions manuelles, etc.) */}
      <PWAInstallModal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
        isIOS={isIOS}
        isAndroid={isAndroid}
        isDesktop={isDesktop}
      />
    </>
  );
};
