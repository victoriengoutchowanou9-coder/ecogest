"use client";

import React from "react";
import { X, Share2, PlusSquare, ArrowUpRight, Smartphone, Laptop, CheckCircle2 } from "lucide-react";

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isIOS,
  isAndroid,
  isDesktop,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Logo */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-xl bg-school-primary text-white flex items-center justify-center font-black text-xl shadow-md shadow-school-primary/25 shrink-0">
            E
          </div>
          <div>
            <h2 id="pwa-install-title" className="text-base font-extrabold text-slate-900">
              Installer l'application ECOGEST
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Accès rapide et sécurisé depuis votre écran d'accueil
            </p>
          </div>
        </div>

        {/* Content tailored by OS */}
        {isIOS ? (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <p className="font-semibold mb-1">Sur iPhone et iPad (Safari) :</p>
              <p>Apple requiert d'ajouter manuellement le raccourci via le menu de partage de Safari.</p>
            </div>

            <ol className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  Touchez le bouton <strong>Partager</strong>{" "}
                  <Share2 className="inline w-4 h-4 text-blue-600 mx-0.5" /> dans la barre de navigation de Safari (en bas sur iPhone, en haut sur iPad).
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  Faites défiler vers le bas et sélectionnez{" "}
                  <strong className="text-slate-900 flex items-center gap-1 mt-0.5">
                    <PlusSquare className="inline w-4 h-4 text-slate-800" /> « Sur l'écran d'accueil »
                  </strong>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <div>
                  Touchez <strong>Ajouter</strong> en haut à droite. L'icône <strong>ECOGEST</strong> apparaîtra immédiatement sur votre écran d'accueil.
                </div>
              </li>
            </ol>
          </div>
        ) : isDesktop ? (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              <p className="font-semibold mb-1 flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-blue-700" /> Sur Ordinateur (Chrome / Edge / Brave) :
              </p>
              <p>Vous pouvez installer ECOGEST comme un logiciel de bureau indépendant avec son raccourci.</p>
            </div>

            <ol className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  Repérez l'icône d'installation{" "}
                  <ArrowUpRight className="inline w-3.5 h-3.5 text-school-primary mx-0.5" /> dans la barre d'adresse de votre navigateur (à droite).
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  Cliquez sur <strong>« Installer ECOGEST »</strong> dans le dialogue du navigateur.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <div>
                  L'application s'ouvrira dans sa propre fenêtre sans barre d'adresse et sera accessible depuis votre Bureau / Menu Démarrer.
                </div>
              </li>
            </ol>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
              <p className="font-semibold mb-1 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-700" /> Sur Android (Chrome / Samsung Internet) :
              </p>
              <p>Ajoutez ECOGEST directement comme application native Android.</p>
            </div>

            <ol className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  Appuyez sur les trois points verticaux <strong>(⋮)</strong> en haut à droite de Chrome.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  Sélectionnez <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <div>
                  Confirmez en appuyant sur <strong>Installer</strong>.
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Benefits list */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Même compte &amp; données</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Démarrage instantané</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Plein écran sans barre</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Sécurité renforcée</span>
          </div>
        </div>

        {/* Close action */}
        <div className="mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 transition"
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
};
