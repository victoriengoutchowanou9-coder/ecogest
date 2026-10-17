"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { useToast } from "@/components/ui/Toast";

export default function ContactPage() {
  const { toast } = useToast();

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    toast("Votre message a été transmis avec succès à l'équipe ECOGEST ! Nous vous répondrons dans les plus brefs délais.", "success");
    setTimeout(() => {
      setIsSent(false);
      setLastName("");
      setFirstName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <PublicNavbar currentPath="/contact" />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-school-primary text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-school-200">
          <Mail className="w-3.5 h-3.5 text-amber-400" />
          <span>CONTACT ET ÉCHANGE DIRECT</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
          Contactez-nous
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Une question sur un forfait, une demande de formation ou un accompagnement spécifique ? Notre équipe est à votre entière écoute.
        </p>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form (Requirements: Nom, Prénom, Email, Téléphone, Sujet, Message, Envoyer) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-school-primary uppercase tracking-wider">
                Formulaire de correspondance
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                Laissez-nous un message
              </h2>
              <p className="text-xs text-slate-500">
                Remplissez les informations ci-dessous. Un conseiller prendra contact avec vous sous 24h.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Nom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : DOKPO"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Marcellin"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="votre.email@ecole.bj"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+229 97 12 34 56"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Sujet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Demande de devis pour un complexe scolaire de 800 élèves"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Message *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Détaillez votre demande ou votre projet d'établissement..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-school-primary hover:bg-school-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 touch-target"
              >
                <Send className="w-4 h-4" />
                <span>Envoyer le message</span>
              </button>
            </form>
          </div>

          {/* Right Column : Coordonnées Officielles */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 text-xs text-slate-700">
              <div className="space-y-1">
                <span className="text-xs font-bold text-school-primary uppercase tracking-wider">
                  Informations de contact
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Coordonnées officielles ECOGEST
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0 text-school-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold">Siège Social</strong>
                    <span className="text-slate-600 block">Immeuble Kpassè, Boulevard de la Marina</span>
                    <span className="text-slate-500 text-[11px]">Cotonou, République du Bénin &bull; BP 1842</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0 text-school-primary">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <strong className="block text-slate-900 font-bold">Téléphone officiel ECOGEST</strong>
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href="tel:+2290155445122"
                          className="font-mono text-sm font-bold text-slate-900 hover:text-school-primary transition-colors tracking-wide"
                        >
                          +229 01 55 44 51 22
                        </a>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          Ligne principale
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        <a
                          href="tel:+2290161771334"
                          className="font-mono text-sm font-bold text-slate-900 hover:text-school-primary transition-colors tracking-wide"
                        >
                          +229 01 61 77 13 34
                        </a>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          Ligne support
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0 text-emerald-600">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <strong className="block text-slate-900 font-bold">WhatsApp officiel ECOGEST</strong>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        7j/7 direct
                      </span>
                    </div>
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href="https://wa.me/22955445122"
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-sm font-bold text-emerald-700 hover:underline tracking-wide"
                        >
                          +229 55 44 51 22
                        </a>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Échanges directs
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-emerald-100/70">
                        <a
                          href="https://wa.me/22961771334"
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-sm font-bold text-emerald-700 hover:underline tracking-wide"
                        >
                          +229 61 77 13 34
                        </a>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Support technique
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0 text-blue-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold">Courriers électroniques</strong>
                    <span className="text-slate-600 block">contact@ecogest.bj (Général)</span>
                    <span className="text-slate-600 block">support@ecogest.bj (Assistance)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0 text-amber-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold">Heures d&apos;accueil</strong>
                    <span className="text-slate-600 block">Lundi à Vendredi : 07h30 &ndash; 18h30</span>
                    <span className="text-slate-600 block">Samedi : 08h00 &ndash; 13h00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Chat Reminder */}
            <div className="bg-school-50 border border-school-200 rounded-3xl p-6 text-xs text-school-900 space-y-3">
              <div className="flex items-center gap-2 font-bold">
                <Sparkles className="w-4 h-4 text-school-primary" />
                <span>Besoin d&apos;une réponse immédiate ?</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Notre assistance par chat en direct est active. Vous pouvez directement dialoguer avec notre support en ligne.
              </p>
              <Link
                href="/chat-support"
                className="inline-flex items-center gap-1.5 font-bold text-school-primary hover:underline text-xs"
              >
                <span>Démarrer le chat en direct</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
