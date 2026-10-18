"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  showIOSModal: boolean;
  setShowIOSModal: (show: boolean) => void;
  triggerInstall: () => Promise<boolean>;
  updateAvailable: boolean;
  applyUpdate: () => void;
}

const PWAContext = createContext<PWAContextType | null>(null);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  // Détection du mode autonome (PWA déjà installée) et de la plateforme
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Détection de l'état "déjà installé"
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://");

    setIsInstalled(isStandalone);

    // Si l'utilisateur lance l'application installée depuis son appareil (mode standalone)
    // et arrive sur la racine "/" ou la vitrine publique, le diriger directement vers la page de connexion
    if (isStandalone && (pathname === "/" || pathname === "")) {
      router.replace("/connexion");
    }

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };
    mediaQuery.addEventListener("change", handleDisplayModeChange);

    // 2. Détection de la plateforme OS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
    const isAndroidDevice = /android/.test(ua);
    const isDesktopDevice = !isIOSDevice && !isAndroidDevice;

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsDesktop(isDesktopDevice);

    // 3. Écoute de l'événement natif d'installation navigateur
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // 4. Enregistrement du Service Worker & Détection de nouvelles versions
    if ("serviceWorker" in navigator && process.env.NODE_ENV !== "test") {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          // Si un worker attend déjà d'être activé
          if (reg.waiting) {
            setWaitingWorker(reg.waiting);
            setUpdateAvailable(true);
          }

          // Détection d'un nouveau worker téléchargé
          reg.addEventListener("updatefound", () => {
            const installing = reg.installing;
            if (!installing) return;

            installing.addEventListener("statechange", () => {
              if (installing.state === "installed" && navigator.serviceWorker.controller) {
                // Nouvelle version en attente
                setWaitingWorker(installing);
                setUpdateAvailable(true);
              }
            });
          });
        })
        .catch((err) => {
          console.warn("[PWA] Échec enregistrement sw.js :", err);
        });

      // Rafraîchir lorsque le nouveau Service Worker prend le contrôle
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    return () => {
      mediaQuery.removeEventListener("change", handleDisplayModeChange);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Déclenchement de l'installation selon la plateforme
  const triggerInstall = useCallback(async (): Promise<boolean> => {
    // Si déjà installé, rien à faire
    if (isInstalled) return false;

    // Si prompt natif prêt (Chrome, Edge, Samsung Internet, Android...)
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setDeferredPrompt(null);
          return true;
        }
        return false;
      } catch (err) {
        console.error("[PWA] Erreur lors de l'appel deferredPrompt :", err);
        return false;
      }
    }

    // Sur iOS Safari (pas de beforeinstallprompt natif) -> ouvrir la modale explicative guidée
    if (isIOS) {
      setShowIOSModal(true);
      return true;
    }

    // Si navigateur de bureau ou autre sans invite active, afficher les instructions
    setShowIOSModal(true);
    return false;
  }, [deferredPrompt, isInstalled, isIOS]);

  // Appliquer la mise à jour détectée
  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  }, [waitingWorker]);

  // L'application est installable si elle n'est pas déjà installée ET (prompt natif dispo OU sur iOS)
  const isInstallable = !isInstalled && (Boolean(deferredPrompt) || isIOS);

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isIOS,
        isAndroid,
        isDesktop,
        showIOSModal,
        setShowIOSModal,
        triggerInstall,
        updateAvailable,
        applyUpdate,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error("usePWA must be used within a PWAProvider");
  }
  return context;
}
