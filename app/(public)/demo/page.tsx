"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Play,
  Sparkles,
  Shield,
  BookOpenCheck,
  CreditCard,
  GraduationCap,
  Home,
  ArrowRight,
  CheckCircle2,
  Calendar,
  FileSpreadsheet,
  Layers,
  Users,
  Lock,
  MessageSquare,
  HelpCircle,
  Eye,
  Send,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { useToast } from "@/components/ui/Toast";

export default function DemoPage() {
  const { toast } = useToast();
  const [showCustomDemoModal, setShowCustomDemoModal] = useState(false);
  const [customFormSubmitted, setCustomFormSubmitted] = useState(false);

  // Form states
  const [schoolName, setSchoolName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleCustomDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomFormSubmitted(true);
    toast("Demande de démonstration transmise avec succès ! Notre équipe pédagogique vous contactera sous 24h.", "success");
    setTimeout(() => {
      setShowCustomDemoModal(false);
      setCustomFormSubmitted(false);
      setSchoolName("");
      setContactName("");
      setEmail("");
      setPhone("");
    }, 2000);
  };

  const spaces = [
    {
      role: "Direction & Fondateur",
      path: "/directeur",
      badge: "Administration & Pilotage",
      color: "border-purple-200 bg-purple-50/50 text-purple-900",
      btnColor: "bg-purple-600 hover:bg-purple-700 text-white",
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      desc: "Supervision globale de l'établissement, ouverture des années scolaires, gestion des comptes utilisateurs, audit de sécurité et pilotage financier.",
      highlights: [
        "Tableau de bord stratégique en temps réel",
        "Création des divisions, classes et coefficients",
        "Journal d'audit immuable et chiffrement au repos ENCv1",
      ],
    },
    {
      role: "Censorat des Études",
      path: "/censeur",
      badge: "Supervision Pédagogique",
      color: "border-blue-200 bg-blue-50/50 text-blue-900",
      btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
      icon: <BookOpenCheck className="w-6 h-6 text-blue-600" />,
      desc: "Cœur pédagogique : contrôle des notes, validation des bulletins avant publication, planification des examens, registre d'émargement et discipline.",
      highlights: [
        "Validation officielle des notes matière par matière",
        "Génération et signature du Registre de classe officiel (PDF)",
        "Gestion confidentielle des dossiers médicaux et sanctions",
      ],
    },
    {
      role: "Comptabilité & Caisse",
      path: "/comptabilite",
      badge: "Gestion Financière",
      color: "border-amber-200 bg-amber-50/50 text-amber-900",
      btnColor: "bg-amber-600 hover:bg-amber-700 text-white",
      icon: <CreditCard className="w-6 h-6 text-amber-600" />,
      desc: "Trésorerie et recouvrement : encaissement sécurisé des tranches de scolarité, émission de reçus avec QR Code infalsifiable, gestion des dépenses et paies.",
      highlights: [
        "Suivi du reste à recouvrer par élève et par classe",
        "Reçus conformes imprimables en un clic",
        "Fiches de paie automatisées selon l'émargement",
      ],
    },
    {
      role: "Espace Enseignants",
      path: "/enseignant",
      badge: "Pratique Quotidienne",
      color: "border-emerald-200 bg-emerald-50/50 text-emerald-900",
      btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
      icon: <GraduationCap className="w-6 h-6 text-emerald-600" />,
      desc: "Saisie ergonomique des notes en tableau, appel par séance, cahier de textes numérique avec impression officielle et appréciation générale.",
      highlights: [
        "Saisie conforme : 3 interros, devoirs, moyenne automatique",
        "Appel rapide : présents, retards, absents justifiés",
        "Mode compatible smartphone en salle de classe",
      ],
    },
    {
      role: "Portail Parents & Élèves",
      path: "/parent",
      badge: "Liaison Famille",
      color: "border-indigo-200 bg-indigo-50/50 text-indigo-900",
      btnColor: "bg-indigo-600 hover:bg-indigo-700 text-white",
      icon: <Home className="w-6 h-6 text-indigo-600" />,
      desc: "Espace de confiance pour les familles : consultation des notes après publication, suivi des absences et retards, calendrier d'examens et bulletins téléchargeables.",
      highlights: [
        "Bascule instantanée entre frères et sœurs (fratrie)",
        "Accès exclusif et cloisonné aux épreuves de leur classe",
        "Notes masquées jusqu'à la délibération officielle",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <PublicNavbar currentPath="/demo" />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-school-primary text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-school-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>DÉMONSTRATION INTERACTIVE EN DIRECT</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
          Testez ECOGEST avant de souscrire
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Accédez librement aux 5 espaces métiers pré-configurés avec des données réalistes de démonstration (notes, élèves, examens, comptabilité).
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <a
            href="#espaces-metiers"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-school-primary text-white font-bold text-xs sm:text-sm hover:bg-school-700 shadow-md transition touch-target"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Lancer la démo</span>
          </a>
          <button
            type="button"
            onClick={() => setShowCustomDemoModal(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-sm transition touch-target"
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>Demander une démonstration personnalisée</span>
          </button>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 flex-1 w-full">
        
        {/* Section 1 : Les 5 Espaces Métiers */}
        <section className="space-y-6" id="espaces-metiers">
          <div className="text-center space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-school-primary">
              Sélectionnez un rôle pour tester
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Les Tableaux de Bord Métiers
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Chaque utilisateur dispose d&apos;une interface dédiée adaptée à ses responsabilités.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((sp, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                      {sp.icon}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {sp.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900">{sp.role}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{sp.desc}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Points forts à tester :
                    </span>
                    <ul className="text-xs text-slate-700 space-y-1">
                      {sp.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Link
                  href={sp.path}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs ${sp.btnColor}`}
                >
                  <span>Explorer l&apos;espace {sp.role.split(" ")[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2 : Aperçu des 4 Piliers Fonctionnels */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Les Piliers Fonctionnels du Progiciel
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Une couverture complète des besoins académiques, financiers et légaux de votre école.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <CreditCard className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-purple-950">Modules Financiers</h4>
              <p className="text-slate-600 leading-relaxed">
                Suivi des écolages par tranches, encaissements, reçus conformes avec QR Code, grand livre des dépenses et paies du personnel.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <BookOpenCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-blue-950">Modules Pédagogiques</h4>
              <p className="text-slate-600 leading-relaxed">
                Coefficients modulables, devoirs surveillés, cahier de textes numérique partagé et calculs automatisés sans risque d&apos;erreur.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-emerald-950">Gestion des Élèves</h4>
              <p className="text-slate-600 leading-relaxed">
                Matricule officiel et N° EducMaster, fiches médicales chiffrées (ENCv1), discipline, conservation des anciens élèves et réadmission.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-amber-950">Examens &amp; Bulletins</h4>
              <p className="text-slate-600 leading-relaxed">
                Calendrier d&apos;examens par classe, workflow de validation Censeur, délibérations sécurisées et bulletins officiels Bénin (A4).
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 : Call To Action */}
        <section className="bg-linear-to-r from-slate-900 via-slate-800 to-school-primary rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-black">
            Convaincu par la démonstration ?
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Créez le compte de votre école en moins de 3 minutes et commencez à configurer vos classes dès aujourd&apos;hui.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-school-primary text-white font-bold text-sm hover:bg-school-700 shadow-md transition"
            >
              <span>Créer mon compte établissement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tarifs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition"
            >
              <span>Consulter la grille des tarifs</span>
            </Link>
          </div>
        </section>

      </main>

      {/* Modal Démonstration Personnalisée */}
      {showCustomDemoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-school-primary" />
                <h3 className="font-bold text-base text-slate-900">
                  Demande de Démonstration Personnalisée
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomDemoModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Un conseiller ECOGEST réalisera une présentation visio adaptée à votre établissement (primaire, secondaire ou complexe).
            </p>

            <form onSubmit={handleCustomDemoSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Nom de l&apos;école *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Complexe Ste Marie"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Votre nom et fonction *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : M. DOKPO (Directeur)"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Email professionnel *</label>
                  <input
                    type="email"
                    required
                    placeholder="directeur@ecole.bj"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Téléphone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+229 97 00 11 22"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Date ou créneau souhaité</label>
                <input
                  type="text"
                  placeholder="Ex : Mardi matin, ou Vendredi à 15h"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Besoins spécifiques</label>
                <textarea
                  rows={2}
                  placeholder="Précisez votre type d'enseignement, effectif approximatif..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCustomDemoModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-school-primary text-white font-bold text-xs hover:bg-school-700 shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer ma demande</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
}
