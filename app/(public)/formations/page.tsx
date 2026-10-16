"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  Laptop,
  Video,
  MapPin,
  Users,
  Shield,
  BookOpenCheck,
  CreditCard,
  Building2,
  CheckCircle2,
  Send,
  Calendar,
  Clock,
  ArrowRight,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { useToast } from "@/components/ui/Toast";

export default function FormationsPage() {
  const { toast } = useToast();
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("SUR_SITE");
  const [targetAudience, setTargetAudience] = useState("TOUS");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    toast("Demande de formation enregistrée avec succès ! Notre responsable pédagogique prendra attache avec votre école sous 24h.", "success");
    setTimeout(() => {
      setShowTrainingModal(false);
      setIsSubmitted(false);
      setSchoolName("");
      setContactName("");
      setPhone("");
    }, 2000);
  };

  const trainingModules = [
    {
      title: "Formation à l'utilisation générale du logiciel",
      target: "Tout le personnel de l'établissement",
      icon: <Laptop className="w-5 h-5 text-school-primary" />,
      desc: "Prise en main globale, navigation intuitive, sécurité des identifiants et réflexes quotidiens.",
      points: [
        "Navigation fluide et ergonomie des modules",
        "Connexion sécurisée et gestion de mot de passe",
        "Accès rapide aux fiches apprenants",
      ],
    },
    {
      title: "Formation des Directeurs & Fondateurs",
      target: "Direction & Administrateurs",
      icon: <Shield className="w-5 h-5 text-purple-600" />,
      desc: "Pilotage stratégique, ouverture des années scolaires, gouvernance des utilisateurs et indicateurs de performance.",
      points: [
        "Supervision du cockpit décisionnel en temps réel",
        "Attribution et révocation des privilèges RBAC",
        "Audit des données chiffrées et conformité légale",
      ],
    },
    {
      title: "Formation des Censeurs des Études",
      target: "Censorat & Surveillance Générale",
      icon: <BookOpenCheck className="w-5 h-5 text-blue-600" />,
      desc: "Supervision pédagogique, contrôle des notes, planification des examens et édition des registres officiels.",
      points: [
        "Workflow de validation des notes matière par matière",
        "Génération et signature du Registre de classe officiel (PDF)",
        "Gestion confidentielle de la discipline et réadmissions",
      ],
    },
    {
      title: "Formation des Comptables & Caissiers",
      target: "Service Financier & Trésorerie",
      icon: <CreditCard className="w-5 h-5 text-amber-600" />,
      desc: "Encaissement des écolages, émission de reçus avec QR Code, gestion des dépenses et calcul des salaires.",
      points: [
        "Enregistrement des versements en espèces ou Mobile Money",
        "Édition immédiate de reçus conformes infalsifiables",
        "Rapprochement avec le registre d'émargement pour les paies",
      ],
    },
    {
      title: "Formation des Enseignants",
      target: "Corps Professoral titulaire et vacataire",
      icon: <GraduationCap className="w-5 h-5 text-emerald-600" />,
      desc: "Saisie rapide des notes en tableau, pointage d'assiduité par séance et cahier de textes numérique.",
      points: [
        "Prise en main sur smartphone et ordinateur portable",
        "Appel rapide en classe en un tap",
        "Calculs certifiés sans erreur de coefficient",
      ],
    },
    {
      title: "Formation à la configuration initiale",
      target: "Secrétariat de Direction & Référents IT",
      icon: <Building2 className="w-5 h-5 text-teal-600" />,
      desc: "Importation des effectifs depuis Excel, paramétrage des divisions et structure bivalente de l'école.",
      points: [
        "Configuration des séries (Littéraires, Scientifiques)",
        "Affectation massive des professeurs et élèves",
        "Personnalisation des logos et en-têtes d'établissement",
      ],
    },
  ];

  const formats = [
    {
      title: "Formation en ligne (E-learning)",
      icon: <Laptop className="w-6 h-6 text-school-primary" />,
      badge: "Autonome & 24/7",
      desc: "Modules vidéo interactifs, guides téléchargeables et quiz d'évaluation disponibles à tout moment pour former vos nouvelles recrues.",
    },
    {
      title: "Formation à distance (Webinaire visio)",
      icon: <Video className="w-6 h-6 text-blue-600" />,
      badge: "Direct & Interactif",
      desc: "Sessions animées en visioconférence par un expert EducoGest avec partage d'écran, session de questions-réponses et cas pratiques de votre école.",
    },
    {
      title: "Formation sur site (Dans votre école)",
      icon: <MapPin className="w-6 h-6 text-emerald-600" />,
      badge: "Immersion Complète",
      desc: "Un formateur dédié se déplace directement dans vos locaux (salle des professeurs, salle informatique) pour accompagner vos équipes sur leurs propres postes.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <PublicNavbar currentPath="/formations" />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-school-primary text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-school-200">
          <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
          <span>ACADÉMIE DE FORMATION EDUCOGEST</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
          Formations pour Établissements Scolaires
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Accompagnez vos équipes pour une adoption rapide, sereine et maîtrisée du progiciel de gestion scolaire.
        </p>

        <div className="pt-3">
          <button
            type="button"
            onClick={() => setShowTrainingModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-school-primary hover:bg-school-700 text-white font-bold text-xs sm:text-sm shadow-md transition touch-target"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Demander une formation</span>
          </button>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 flex-1 w-full text-xs text-slate-700">
        
        {/* Section 1 : Formats de formation */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-school-primary uppercase tracking-wider">
              Flexibilité pédagogique
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Plusieurs formats adaptés à votre calendrier
            </h2>
            <p className="text-slate-500 text-xs">Choisissez la modalité qui convient le mieux à la disponibilité de vos professeurs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {formats.map((f, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                      {f.icon}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">{f.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowTrainingModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-300 hover:border-school-primary text-slate-800 font-bold text-xs transition"
                >
                  Sélectionner ce format
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2 : Les Modules de formation par profil */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Programmes de Formation par Profil Métier
            </h2>
            <p className="text-slate-500 text-xs">Des cursus ciblés pour chaque membre de votre communauté éducative.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingModules.map((tm, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white border border-slate-200 shrink-0">
                      {tm.icon}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">{tm.title}</h4>
                      <span className="text-[10px] font-semibold text-slate-500">{tm.target}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{tm.desc}</p>

                  <ul className="space-y-1 pt-1 border-t border-slate-200/60 text-slate-600">
                    {tm.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Modal Demande de Formation (Requirement) */}
      {showTrainingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-school-primary" />
                <h3 className="font-bold text-base text-slate-900">Demander une session de formation</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTrainingModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Remplissez le formulaire ci-dessous pour planifier une formation personnalisée pour votre établissement.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Nom de votre école *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Complexe Scolaire St Michel"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Nom du contact *</label>
                  <input
                    type="text"
                    required
                    placeholder="M. Marcellin DOKPO"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Format souhaité</label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                  >
                    <option value="SUR_SITE">Formation sur site (Dans l&apos;école)</option>
                    <option value="VISIO">Formation à distance (Webinaire)</option>
                    <option value="EN_LIGNE">E-learning &amp; Guides vidéo</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Public concerné</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                  >
                    <option value="TOUS">Toute l&apos;équipe (Complet)</option>
                    <option value="ENSEIGNANTS">Enseignants uniquement</option>
                    <option value="DIRECTION_CENSEUR">Direction &amp; Censeurs</option>
                    <option value="COMPTABILITE">Comptabilité &amp; Caisse</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTrainingModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-school-primary text-white font-bold text-xs hover:bg-school-700 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirmer la demande</span>
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
