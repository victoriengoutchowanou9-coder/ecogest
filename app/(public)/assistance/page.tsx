"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MessageSquare,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  HelpCircle,
  Headphones,
  ExternalLink,
  ShieldCheck,
  Building,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { useToast } from "@/components/ui/Toast";

export default function AssistanceContactsPage() {
  const { toast } = useToast();
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketSender, setTicketSender] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketCategory, setTicketCategory] = useState("TECHNIQUE");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    toast("Ticket d'assistance créé avec succès ! Numéro de dossier : #TK-2026-9481.", "success");
    setTimeout(() => {
      setIsSubmitted(false);
      setTicketSubject("");
      setTicketSender("");
      setTicketEmail("");
      setTicketMessage("");
    }, 2500);
  };

  const contactChannels = [
    {
      title: "Téléphone d'urgence & Support",
      detail: "+229 21 30 45 80 / +229 97 00 11 22",
      sub: "Ligne directe pour les directeurs et censeurs",
      hours: "Lun - Sam : 07h30 - 19h00 (UTC+1)",
      icon: <Phone className="w-6 h-6 text-school-primary" />,
      actionText: "Appeler le support",
      actionHref: "tel:+22921304580",
    },
    {
      title: "WhatsApp Officiel",
      detail: "+229 96 12 34 56",
      sub: "Échange instantané, capture d'écran et vocal",
      hours: "Réponse en moins de 10 minutes",
      icon: <MessageSquare className="w-6 h-6 text-emerald-600" />,
      actionText: "Discuter sur WhatsApp",
      actionHref: "https://wa.me/22996123456",
    },
    {
      title: "Email d'assistance dédié",
      detail: "support@educogest.bj",
      sub: "Pour les requêtes formelles, exports et factures",
      hours: "Prise en charge sous 4 heures ouvrées",
      icon: <Mail className="w-6 h-6 text-blue-600" />,
      actionText: "Envoyer un email",
      actionHref: "mailto:support@educogest.bj",
    },
    {
      title: "Chat en direct interactif",
      detail: "Disponible directement sur la plateforme",
      sub: "Résolution pas à pas avec conseiller connecté",
      hours: "Disponible immédiatement",
      icon: <Headphones className="w-6 h-6 text-purple-600" />,
      actionText: "Ouvrir le chat",
      actionHref: "/chat-support",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <PublicNavbar currentPath="/assistance" />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-school-primary text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-school-200">
          <Headphones className="w-3.5 h-3.5 text-amber-400" />
          <span>CANAUX D&apos;ASSISTANCE OFFICIELS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
          Contacts d&apos;assistance EducoGest
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Une équipe dédiée pour accompagner les écoles, fondateurs, enseignants et parents au quotidien.
        </p>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 flex-1 w-full">
        
        {/* 4 Official Contact Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactChannels.map((c, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-5 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                  {c.icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{c.title}</h3>
                  <p className="text-xs font-bold text-school-primary mt-1">{c.detail}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{c.sub}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <span className="text-[10px] text-slate-400 block font-mono">{c.hours}</span>
                <a
                  href={c.actionHref}
                  target={c.actionHref.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-school-primary text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>{c.actionText}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </section>

        {/* Assistance Ticket Form & Physical Office */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form: Créer un ticket */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-school-primary uppercase tracking-wider">
                Formulaire prioritaire
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                Ouvrir un ticket d&apos;assistance
              </h2>
              <p className="text-xs text-slate-500">
                Nos techniciens vous répondent dans les plus brefs délais avec confirmation par email et SMS.
              </p>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Nom &amp; Prénoms *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : M. Marcellin DOKPO"
                    value={ticketSender}
                    onChange={(e) => setTicketSender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Email professionnel *</label>
                  <input
                    type="email"
                    required
                    placeholder="censeur@ecole.bj"
                    value={ticketEmail}
                    onChange={(e) => setTicketEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Catégorie de la demande</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                  >
                    <option value="TECHNIQUE">Incident technique / Affichage</option>
                    <option value="PEDAGOGIQUE">Coefficients / Calcul de notes / Bulletins</option>
                    <option value="FINANCES">Comptabilité / Écolages / Reçus</option>
                    <option value="COMPTES">Création d&apos;utilisateurs / Accès bloqué</option>
                    <option value="AUTRE">Autre questionnement</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Sujet du ticket *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Rectification d'un coefficient de SVT"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Description détaillée du problème *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Expliquez la situation rencontrée, la classe ou l'élève concerné..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-school-primary hover:bg-school-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 touch-target"
              >
                <Send className="w-4 h-4" />
                <span>Contacter l&apos;assistance</span>
              </button>
            </form>
          </div>

          {/* Right Info: Office & SLA */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-school-primary" />
                <h3 className="font-bold text-sm text-slate-900">Siège &amp; Équipe d&apos;intervention</h3>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Nos spécialistes interviennent également directement dans vos établissements scolaires pour la formation initiale et les installations en réseau local :
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-700">
                <p className="font-bold text-slate-900">EducoGest Technologies Bénin</p>
                <p className="flex items-center gap-1.5 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Immeuble Kpassè, Boulevard de la Marina, Cotonou, Bénin</span>
                </p>
                <p className="text-[11px] text-slate-500">Boîte Postale : BP 1842 Cotonou</p>
              </div>
            </div>

            <div className="bg-school-50 border border-school-200 rounded-3xl p-6 text-xs text-school-900 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="w-4 h-4 text-school-primary" />
                <span>Engagement de service (SLA)</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                En période d&apos;examens ou d&apos;émission de bulletins trimestriels, notre permanence technique reste active le soir jusqu&apos;à 21h00 pour garantir zéro interruption dans vos délibérations.
              </p>
            </div>
          </div>

        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
