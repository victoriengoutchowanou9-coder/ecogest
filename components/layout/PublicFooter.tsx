"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Shield,
  BookOpenCheck,
  CreditCard,
  GraduationCap,
  Home,
  MessageCircle,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Lock,
  ArrowRight,
  Globe,
  Share2,
} from "lucide-react";

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 text-xs mt-auto">
      {/* Main 5-Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* 1. PRODUIT */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-school-primary rounded-full inline-block"></span>
              Produit
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/visite-guidee"
                  className="hover:text-white hover:underline transition-colors flex items-center justify-between group"
                >
                  <span>Visite guidée</span>
                  <span className="text-[10px] bg-school-primary/20 text-school-300 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    18 étapes
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tarifs"
                  className="hover:text-white hover:underline transition-colors flex items-center justify-between group"
                >
                  <span>Tarifs et forfaits</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                    Dès 6 000 F
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/demo"
                  className="hover:text-white hover:underline transition-colors flex items-center justify-between group"
                >
                  <span>Démo en ligne</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                    Interactive
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/mises-a-jour"
                  className="hover:text-white hover:underline transition-colors flex items-center justify-between group"
                >
                  <span>Mises à jour</span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                    v2.4 PRO
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* 2. SOUTIEN */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-sky-500 rounded-full inline-block"></span>
              Soutien
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/documentation"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/chat-support"
                  className="hover:text-white hover:underline transition-colors flex items-center gap-2"
                >
                  <span>Chat en direct</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </Link>
              </li>
              <li>
                <Link
                  href="/assistance"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Contacts d&apos;assistance
                </Link>
              </li>
              <li>
                <Link
                  href="/politique-support"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Politique de soutien
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. QUI SOMMES-NOUS ? */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-amber-500 rounded-full inline-block"></span>
              Qui sommes-nous ?
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/a-propos"
                  className="hover:text-white hover:underline transition-colors"
                >
                  À propos de nous
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Contactez-nous
                </Link>
              </li>
              <li>
                <Link
                  href="/conditions-utilisation"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Conditions d&apos;utilisation
                </Link>
              </li>
              <li>
                <Link
                  href="/politique-confidentialite"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. MON COMPTE */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full inline-block"></span>
              Mon compte
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/inscription"
                  className="inline-flex items-center gap-1.5 text-white font-bold hover:text-school-300 transition-colors"
                >
                  <span>S&apos;inscrire</span>
                  <ArrowRight className="w-3.5 h-3.5 text-school-400" />
                </Link>
              </li>
              <li>
                <Link
                  href="/connexion"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Se connecter
                </Link>
              </li>
              <li className="pt-2 text-[11px] text-slate-500 border-t border-slate-800/80">
                <span>Accès réservés aux personnels agréés et tuteurs légaux.</span>
              </li>
            </ul>
          </div>

          {/* 5. SERVICES CONNEXES */}
          <div className="space-y-4 col-span-2 md:col-span-1">
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full inline-block"></span>
              Services connexes
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/formations"
                  className="hover:text-white hover:underline transition-colors flex items-center justify-between"
                >
                  <span>Formation</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">
                    Sur site / Visio
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/logiciels"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Logiciel
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Separator */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Brand & Slogan */}
            <div className="text-center md:text-left space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-school-primary text-white flex items-center justify-center font-black text-sm shadow-md">
                  E
                </div>
                <span className="font-black text-base text-white tracking-tight">
                  EducoGest
                </span>
                <span className="text-[10px] font-semibold text-school-400 bg-school-900/60 px-2 py-0.5 rounded border border-school-700/50">
                  v2.4 PRO
                </span>
              </div>
              <p className="text-slate-400 text-xs font-medium">
                La gestion scolaire simplifiée, centralisée et accessible.
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500 font-semibold mr-1">Suivez-nous :</span>
              {/* Facebook */}
              <a
                href="https://facebook.com/educogest"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook EducoGest"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-school-primary hover:text-white text-slate-400 flex items-center justify-center transition-all border border-slate-800"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="https://linkedin.com/company/educogest"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn EducoGest"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-blue-600 hover:text-white text-slate-400 flex items-center justify-center transition-all border border-slate-800"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              {/* Twitter / X */}
              <a
                href="https://twitter.com/educogest"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter X EducoGest"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-700 hover:text-white text-slate-400 flex items-center justify-center transition-all border border-slate-800"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* WhatsApp */}
              <a
                href="https://wa.me/22996123456"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp EducoGest"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-emerald-600 hover:text-white text-slate-400 flex items-center justify-center transition-all border border-slate-800"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
              </a>
            </div>

          </div>

          {/* Copyright & Secondary Legal Links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 pt-4 border-t border-slate-900">
            <div>
              &copy; {new Date().getFullYear()} EducoGest &mdash; Tous droits r&eacute;serv&eacute;s.
            </div>
            <div className="flex flex-wrap items-center gap-3 font-medium">
              <Link
                href="/conditions-utilisation"
                className="hover:text-slate-300 transition-colors"
              >
                Conditions d&apos;utilisation
              </Link>
              <span>|</span>
              <Link
                href="/politique-confidentialite"
                className="hover:text-slate-300 transition-colors"
              >
                Confidentialit&eacute;
              </Link>
              <span>|</span>
              <Link
                href="/politique-confidentialite#cookies"
                className="hover:text-slate-300 transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
