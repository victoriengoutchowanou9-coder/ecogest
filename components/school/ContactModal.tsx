"use client";

import React, { useEffect } from "react";
import {
  X,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // prevent background scroll
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-school-primary px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-400 font-black">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-school-200 block">
                Assistance &amp; Échange Direct
              </span>
              <h2 id="contact-modal-title" className="text-base sm:text-lg font-black text-white">
                Coordonnées officielles ECOGEST
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Fermer la fenêtre de contact"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto text-xs text-slate-700">
          <p className="text-slate-600 text-xs leading-relaxed">
            Pour toute souscription, assistance technique, formation de votre personnel ou démonstration personnalisée, nos conseillers sont joignables directement aux coordonnées officielles ci-dessous.
          </p>

          <div className="space-y-4">
            {/* 1. Téléphone Officiel */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-school-primary shrink-0 shadow-2xs">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Téléphone officiel
                  </span>
                  <div className="mt-1.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href="tel:+2290155445122"
                        className="font-mono text-sm font-bold text-slate-900 hover:text-school-primary transition-colors tracking-wide"
                      >
                        +229 01 55 44 51 22
                      </a>
                      <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Ligne principale
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/70">
                      <a
                        href="tel:+2290161771334"
                        className="font-mono text-sm font-bold text-slate-900 hover:text-school-primary transition-colors tracking-wide"
                      >
                        +229 01 61 77 13 34
                      </a>
                      <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Ligne support
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. WhatsApp Officiel */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 hover:border-emerald-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-600 shrink-0 shadow-2xs">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                      WhatsApp officiel ECOGEST
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      7j/7 direct
                    </span>
                  </div>
                  <div className="mt-1.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href="https://wa.me/22955445122"
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-sm font-bold text-emerald-800 hover:underline flex items-center gap-1.5 tracking-wide"
                      >
                        <span>+229 55 44 51 22</span>
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                      </a>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                        Échanges directs
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-emerald-200/70">
                      <a
                        href="https://wa.me/22961771334"
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-sm font-bold text-emerald-800 hover:underline flex items-center gap-1.5 tracking-wide"
                      >
                        <span>+229 61 77 13 34</span>
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                      </a>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                        Support technique
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Courriers Électroniques */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 hover:border-blue-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-blue-200 text-blue-600 shrink-0 shadow-2xs">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                    Courriers électroniques officiels
                  </span>
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href="mailto:contact@ecogest.bj"
                        className="font-mono text-xs font-bold text-blue-900 hover:underline"
                      >
                        contact@ecogest.bj
                      </a>
                      <span className="text-[10px] text-blue-700 font-medium">Direction &amp; Commercial</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-blue-200/70">
                      <a
                        href="mailto:support@ecogest.bj"
                        className="font-mono text-xs font-bold text-blue-900 hover:underline"
                      >
                        support@ecogest.bj
                      </a>
                      <span className="text-[10px] text-blue-700 font-medium">Assistance &amp; Tickets</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Siège Social & Horaires */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <MapPin className="w-4 h-4 text-school-primary" />
                  <span className="text-[11px]">Siège Social</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Immeuble Kpassè, Boulevard de la Marina, Cotonou &bull; BP 1842
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-[11px]">Horaires d&apos;accueil</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Lun &ndash; Ven : 07h30 &ndash; 18h30<br />
                  Samedi : 08h00 &ndash; 13h00
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Plateforme sécurisée &amp; certifiée
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
