"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  ArrowLeft,
  Menu,
  X,
  Sparkles,
  UserPlus,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

interface PublicNavbarProps {
  currentPath?: string;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ currentPath }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Accueil", href: "/" },
    { label: "Visite guidée", href: "/visite-guidee" },
    { label: "Tarifs", href: "/tarifs" },
    { label: "Démo", href: "/demo" },
    { label: "Documentation", href: "/documentation" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3.5 shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Back Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            title="Revenir à l'accueil"
          >
            <div className="w-10 h-10 rounded-xl bg-school-primary text-white flex items-center justify-center font-black text-xl shadow-md shadow-school-primary/25 group-hover:scale-105 transition-transform">
              E
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5 leading-tight">
                EDUCOGEST
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-school-50 text-school-primary border border-school-200">
                  PRO
                </span>
              </span>
              <span className="block text-[11px] text-slate-500 font-medium leading-none">
                Gestion Scolaire Complète
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = currentPath === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-school-50 text-school-primary"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Site principal</span>
          </Link>

          <Link
            href="/inscription"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-sm transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Inscription</span>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/inscription"
            className="px-3 py-1.5 rounded-xl bg-school-primary text-white text-xs font-bold"
          >
            Inscription
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 mt-3 pt-3 pb-2 space-y-2">
          <div className="pb-2 border-b border-slate-100">
            <Link
              href="/inscription"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-school-primary text-white text-xs font-bold shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Inscription</span>
            </Link>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
