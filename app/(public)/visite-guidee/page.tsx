"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Settings,
  UserCheck,
  GraduationCap,
  Users,
  BookOpen,
  Clock,
  FileCheck2,
  CalendarDays,
  CheckCircle,
  FileSpreadsheet,
  CreditCard,
  TrendingDown,
  Briefcase,
  MessageSquare,
  Home,
  Laptop,
  LayoutDashboard,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Play,
  HelpCircle,
  Check,
  Shield,
  Layers,
  Award,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function VisiteGuideePage() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      num: 1,
      title: "Création de l'établissement",
      icon: <Building2 className="w-5 h-5 text-purple-600" />,
      category: "Initialisation",
      desc: "Inscription en quelques clics du responsable d'école. Définition du nom officiel, du pays, de la région, de la ville, de la devise et du contact légal.",
      details: [
        "Formulaire guidé pour écoles publiques et privées",
        "Génération instantanée de l'espace numérique sécurisé",
        "Attribution de l'identifiant unique d'établissement",
      ],
      mockup: {
        badge: "Module Enregistrement",
        screen: "Formulaire d'enregistrement de l'école (CCPA Cotonou)",
        visual: (
          <div className="bg-slate-900 p-4 rounded-xl text-white font-mono text-[11px] space-y-2">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span>POST /api/schools/register</span>
              <span className="text-emerald-400">201 Created</span>
            </div>
            <p className="text-purple-300">&#123; &quot;schoolName&quot;: &quot;Complexe Scolaire Privé Les Palmiers&quot;, &quot;city&quot;: &quot;Cotonou&quot; &#125;</p>
            <div className="p-2 bg-emerald-950/60 rounded border border-emerald-500/30 text-emerald-300">
              &check; Espace établissement initialisé &bull; Clé de coffre-fort ENCv1 générée
            </div>
          </div>
        ),
      },
    },
    {
      num: 2,
      title: "Configuration de l'école",
      icon: <Settings className="w-5 h-5 text-blue-600" />,
      category: "Paramétrage",
      desc: "Sélection du type d'enseignement : Primaire (CI à CM2), Secondaire (6e à Terminale), ou Primaire + Secondaire (bivalent). Définition de l'année scolaire et du barème.",
      details: [
        "Prise en charge du système éducatif béninois et sous-régional",
        "Gestion bivalente compétences primaires & notes chiffrées secondaires",
        "Paramétrage des trimestres et semestres académiques",
      ],
      mockup: {
        badge: "Paramètres & Enseignement",
        screen: "Choix du Type : Primaire + Secondaire",
        visual: (
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px]">BIVALENT</span>
              <span>Enseignement Primaire + Secondaire activé</span>
            </div>
            <p className="text-slate-600 text-[11px]">Niveaux configurés : CI, CP, CE1, CE2, CM1, CM2 &bull; 6e, 5e, 4e, 3e, 2nde, 1ère, Tle.</p>
          </div>
        ),
      },
    },
    {
      num: 3,
      title: "Création des comptes utilisateurs",
      icon: <UserCheck className="w-5 h-5 text-emerald-600" />,
      category: "Gouvernance",
      desc: "Création des accès pour le Censeur, le Comptable, le Secrétaire et l'ensemble des Enseignants avec gestion stricte des privilèges (RBAC).",
      details: [
        "Rôles sécurisés : Directeur, Censeur, Comptable, Enseignant, Parent",
        "Identifiants uniques avec mot de passe temporaire et réinitialisation",
        "Traçabilité intégrale de chaque connexion dans le journal d'audit",
      ],
      mockup: {
        badge: "Gestion des Accès",
        screen: "Attribution des Rôles",
        visual: (
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-purple-50 rounded-lg border border-purple-200 font-bold text-purple-900">Directeur (Admin Total)</div>
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 font-bold text-blue-900">Censeur (Pédagogie)</div>
            <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 font-bold text-amber-900">Comptable (Finances)</div>
            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 font-bold text-emerald-900">Enseignant (Notes)</div>
          </div>
        ),
      },
    },
    {
      num: 4,
      title: "Gestion des élèves",
      icon: <GraduationCap className="w-5 h-5 text-indigo-600" />,
      category: "Scolarité",
      desc: "Fiches élèves complètes avec N° Matricule légal, Identifiant national EducMaster, état civil, photo d'identité, dossier médical chiffré et historique des statuts.",
      details: [
        "Conservation permanente du dossier historique sans suppression",
        "Statuts d'apprenant : Actif, Ancien, Transféré, Exclu, Diplômé, Réadmis",
        "Recherche universelle par nom, prénom ou N° EducMaster",
      ],
      mockup: {
        badge: "Fiche Apprenant",
        screen: "Koffi Parfait ADANHOUN &bull; 3ème A",
        visual: (
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900">ADANHOUN Koffi Parfait</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">ACTIF</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">Matricule: ECO-2026-0042 &bull; EducMaster: EM-2026-0421-BJ</p>
            <p className="text-[11px] text-slate-600">Dossier médical: Chiffré ENCv1 &bull; Groupe sanguin: O+</p>
          </div>
        ),
      },
    },
    {
      num: 5,
      title: "Gestion des enseignants",
      icon: <Users className="w-5 h-5 text-teal-600" />,
      category: "Corps Professoral",
      desc: "Répertoire des professeurs titulaires et vacataires, spécialités académiques, classes attribuées, taux horaire et coordonnées.",
      details: [
        "Affectation aux classes et aux disciplines enseignées",
        "Désignation des Professeurs Principaux par division",
        "Suivi du volume horaire hebdomadaire contractuel",
      ],
      mockup: {
        badge: "Fiche Enseignant",
        screen: "Prof. Justin HOUNKPONOU (Mathématiques)",
        visual: (
          <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-900 space-y-1">
            <span className="font-bold block">Prof. Justin HOUNKPONOU &bull; Mathématiques</span>
            <span className="text-[11px] text-teal-700 block">Classes : 3ème A (Prof. Principal), Terminale C &bull; 18h/semaine</span>
          </div>
        ),
      },
    },
    {
      num: 6,
      title: "Gestion des classes et matières",
      icon: <BookOpen className="w-5 h-5 text-amber-600" />,
      category: "Pédagogie",
      desc: "Création flexible des divisions (ex: 6e A, 6e B, CM2 A), affectation des matières, paramétrage officiel des coefficients littéraires et scientifiques.",
      details: [
        "Coefficients conformes aux arrêtés ministériels",
        "Matières spécifiques et options facultatives",
        "Calculs automatisés des moyennes pondérées",
      ],
      mockup: {
        badge: "Classes & Divisions",
        screen: "Configuration 3ème A (Effectif: 45 élèves)",
        visual: (
          <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex justify-between items-center">
            <span>Français (Coef 3) &bull; Maths (Coef 3) &bull; PCT (Coef 2) &bull; SVT (Coef 2)</span>
            <span className="font-bold text-amber-700">Total Coef: 16</span>
          </div>
        ),
      },
    },
    {
      num: 7,
      title: "Gestion des absences et du pointage",
      icon: <Clock className="w-5 h-5 text-rose-600" />,
      category: "Discipline & Vie Scolaire",
      desc: "Appel par séance en un tap côté professeur, émargement des enseignants, enregistrement des motifs d'absence et alertes automatiques.",
      details: [
        "Distinction absences justifiées / non justifiées et retards",
        "Notification parentale immédiate en cas d'absence imprévue",
        "Registre officiel d'émargement pour validation des paies de vacation",
      ],
      mockup: {
        badge: "Feuille de Présence",
        screen: "Appel de 08h00 - 3ème A",
        visual: (
          <div className="flex items-center gap-3 text-xs p-2 bg-rose-50 rounded-lg border border-rose-200 text-rose-900">
            <span className="font-bold">Présents: 43</span>
            <span>&bull;</span>
            <span className="text-rose-700 font-bold">Absents: 2</span>
            <span>&bull;</span>
            <span className="text-amber-700 font-bold">Retards: 1</span>
          </div>
        ),
      },
    },
    {
      num: 8,
      title: "Gestion des devoirs et TD",
      icon: <FileCheck2 className="w-5 h-5 text-sky-600" />,
      category: "Travail Continu",
      desc: "Cahier de textes numérique partagé : consignation du déroulement des leçons, programmation des devoirs de maison et travaux dirigés avec dates limites.",
      details: [
        "Consultation en temps réel par les élèves et leurs parents",
        "Téléchargement des énoncés et ressources pédagogiques",
        "Validation pédagogique par le Censeur des études",
      ],
      mockup: {
        badge: "Cahier de Textes",
        screen: "Devoir Surveillé N°1 de Mathématiques",
        visual: (
          <div className="p-2 bg-sky-50 rounded-lg border border-sky-200 text-[11px] text-sky-900">
            <strong>TD N°2 : Trigonométrie et Théorème de Pythagore</strong> &bull; À rendre pour le Vendredi 24 Octobre
          </div>
        ),
      },
    },
    {
      num: 9,
      title: "Gestion des examens",
      icon: <CalendarDays className="w-5 h-5 text-violet-600" />,
      category: "Planification",
      desc: "Calendrier d'examens structuré par classe et par trimestre : dates, horaires précis, matières, salles d'examen, affectation des surveillants et suivi du statut.",
      details: [
        "Publication sécurisée et modification selon permissions",
        "Visibilité cloisonnée côté parents strictement limitée à leur enfant",
        "Export et affichage pour les tableaux d'épreuves de l'école",
      ],
      mockup: {
        badge: "Calendrier Examens",
        screen: "Session Trimestre 1 - Épreuves Écrites",
        visual: (
          <div className="p-2 bg-violet-50 rounded-lg border border-violet-200 text-xs text-violet-900 space-y-1">
            <div className="flex justify-between font-bold">
              <span>Français (08h00 - 10h00)</span>
              <span className="text-violet-700">Salle 04 &bull; M. BIO</span>
            </div>
            <p className="text-[11px] text-violet-600">Statut : PROGRAMMÉ &bull; 45 candidats</p>
          </div>
        ),
      },
    },
    {
      num: 10,
      title: "Saisie et validation des notes",
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      category: "Workflow d'Audit",
      desc: "Workflow de notation rigoureux : saisie par l'enseignant, calculs automatiques des moyennes d'interros et devoirs, validation officielle par le Censeur avant publication.",
      details: [
        "Formule officielle : (MoyInterros + 2 * Devoirs) / 3",
        "Le Censeur peut valider, demander une correction formelle ou modifier avec motif",
        "Invisibilité totale pour les parents tant que la délibération n'est pas validée",
      ],
      mockup: {
        badge: "Workflow Censeur",
        screen: "Contrôle de conformité des notes",
        visual: (
          <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-900 flex items-center justify-between">
            <span>Interro 1: 15 &bull; Interro 2: 14 &bull; Devoir 1: 16</span>
            <span className="font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">Moyenne: 15.33 / 20</span>
          </div>
        ),
      },
    },
    {
      num: 11,
      title: "Génération des bulletins",
      icon: <FileSpreadsheet className="w-5 h-5 text-school-primary" />,
      category: "Diplomatie Scolaire",
      desc: "Génération instantanée des bulletins officiels béninois au format A4 avec QR Code d'authenticité infalsifiable, classement, tableau d'honneur et appréciations.",
      details: [
        "Double modèle : compétences pour le Primaire & coefficients pour le Secondaire",
        "Impression unitaire ou en lot par classe en un seul clic",
        "Système anti-fraude avec vérification en ligne par scan QR Code",
      ],
      mockup: {
        badge: "Bulletin Officiel Bénin",
        screen: "Format A4 République du Bénin",
        visual: (
          <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-sm text-center text-xs space-y-1">
            <p className="font-black text-slate-900 uppercase text-[10px]">RÉPUBLIQUE DU BÉNIN &bull; BULLETIN DE NOTES DU 1ER TRIMESTRE</p>
            <p className="font-bold text-school-primary text-sm">Moyenne Générale : 15.84 / 20 &bull; Rang : 2ème / 45</p>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">Tableau d&apos;Honneur avec Félicitations</span>
          </div>
        ),
      },
    },
    {
      num: 12,
      title: "Gestion de la scolarité et des paiements",
      icon: <CreditCard className="w-5 h-5 text-amber-600" />,
      category: "Finances & Caisse",
      desc: "Enregistrement des versements d'écolage par tranche, génération immédiate de reçus conformes avec QR Code, suivi du reste à recouvrer par famille.",
      details: [
        "Paiements en espèces, virement bancaire ou Mobile Money (MTN / Moov)",
        "Calcul automatique du solde restant et des échéances",
        "Historique des reçus infalsifiables horodatés",
      ],
      mockup: {
        badge: "Reçu de Paiement",
        screen: "Reçu RC-2026-0843",
        visual: (
          <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex justify-between items-center">
            <div>
              <span className="font-bold block">Montant versé : 130 000 FCFA</span>
              <span className="text-[10px] text-amber-700">Reste dû : 0 FCFA (Soldé)</span>
            </div>
            <span className="font-mono text-[10px] px-2 py-1 rounded bg-amber-200 font-bold">REÇU VALIDE</span>
          </div>
        ),
      },
    },
    {
      num: 13,
      title: "Comptabilité et dépenses",
      icon: <TrendingDown className="w-5 h-5 text-rose-600" />,
      category: "Trésorerie",
      desc: "Registre des charges d'exploitation de l'établissement : fournitures, loyers, entretien, électricité, eau, carburant et dépenses pédagogiques avec pièces justificatives.",
      details: [
        "Ventilation analytique par catégorie de dépense",
        "Calcul en temps réel du solde net de trésorerie disponible",
        "Export du grand livre et bilan périodique",
      ],
      mockup: {
        badge: "Livre des Dépenses",
        screen: "Catégorisation des Charges",
        visual: (
          <div className="p-2 bg-rose-50 rounded-lg border border-rose-200 text-[11px] text-rose-900 flex justify-between">
            <span>Achat rames de papier &bull; Facture F-982</span>
            <span className="font-bold text-rose-700">- 45 000 FCFA</span>
          </div>
        ),
      },
    },
    {
      num: 14,
      title: "Gestion du personnel et des salaires",
      icon: <Briefcase className="w-5 h-5 text-slate-700" />,
      category: "Ressources Humaines",
      desc: "Établissement des fiches de paie mensuelles pour le personnel administratif, technique et enseignant (salaires fixes et décomptes d'heures de vacation).",
      details: [
        "Calcul automatique basé sur le registre d'émargement",
        "Prise en compte des acomptes et primes",
        "Génération et impression des bulletins de salaire",
      ],
      mockup: {
        badge: "Bulletins de Paie",
        screen: "Fiche de rémunération mensuelle",
        visual: (
          <div className="p-2 bg-slate-100 rounded-lg border border-slate-300 text-xs text-slate-800 flex justify-between">
            <span>Prof. Justin HOUNKPONOU (72 heures de vacation)</span>
            <span className="font-bold">Net à payer : 216 000 FCFA</span>
          </div>
        ),
      },
    },
    {
      num: 15,
      title: "Communication avec les parents",
      icon: <MessageSquare className="w-5 h-5 text-teal-600" />,
      category: "Liaison École - Famille",
      desc: "Messagerie interne sécurisée, diffusion des communiqués officiels, convocations aux réunions de parents d'élèves et alertes disciplinaires.",
      details: [
        "Diffusion ciblée par classe, cycle ou générale",
        "Accusé de lecture automatique pour les communications importantes",
        "Canal sécurisé sans divulgation des numéros privés",
      ],
      mockup: {
        badge: "Circulaire Officielle",
        screen: "Avis aux Parents de 3ème",
        visual: (
          <div className="p-2 bg-teal-50 rounded-lg border border-teal-200 text-[11px] text-teal-900">
            <strong>Communiqué Direction :</strong> Réunion préparatoire aux examens du BEPC ce Samedi à 10h00.
          </div>
        ),
      },
    },
    {
      num: 16,
      title: "Portail Parent",
      icon: <Home className="w-5 h-5 text-indigo-600" />,
      category: "Espace Famille",
      desc: "Espace parent intuitif et sécurisé pour suivre la scolarité de ses enfants : notes validées, assiduité, calendrier d'examens, devoirs et situation des écolages.",
      details: [
        "Bascule instantanée en cas de fratrie (plusieurs enfants inscrits)",
        "Téléchargement direct des bulletins certifiés en PDF",
        "Demande d'accès sécurisée par Matricule et validation administrative",
      ],
      mockup: {
        badge: "Vue Parent Mobile",
        screen: "Tableau de Bord Famille ADANHOUN",
        visual: (
          <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between">
            <div>
              <span className="font-bold block">Enfant suivi : Koffi (3ème A)</span>
              <span className="text-[10px] text-indigo-700">Moyenne T1 : 15.84 &bull; 0 absence non justifiée</span>
            </div>
            <span className="px-2 py-1 rounded bg-indigo-600 text-white text-[10px] font-bold">Consulter</span>
          </div>
        ),
      },
    },
    {
      num: 17,
      title: "Portail Enseignant",
      icon: <Laptop className="w-5 h-5 text-emerald-600" />,
      category: "Espace Professeur",
      desc: "Interface ergonomique pensée pour simplifier le travail quotidien du professeur : saisie rapide des notes en tableau, pointage de présence et appréciations.",
      details: [
        "Compatible smartphone, tablette et ordinateur portable",
        "Mode hors-ligne local avec synchronisation automatique",
        "Accès direct aux listes de classe et contacts d'urgence",
      ],
      mockup: {
        badge: "Vue Professeur",
        screen: "Carnet de notes numérique",
        visual: (
          <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-900">
            <strong>Saisie Mathématiques 3ème A :</strong> 45/45 notes enregistrées &bull; Transmis au Censeur pour validation.
          </div>
        ),
      },
    },
    {
      num: 18,
      title: "Tableau de bord de la Direction",
      icon: <LayoutDashboard className="w-5 h-5 text-purple-600" />,
      category: "Pilotage Stratégique",
      desc: "Cockpit général pour le Directeur et le Fondateur : indicateurs d'effectifs en temps réel, taux de recouvrement des frais, taux de réussite et audit de sécurité.",
      details: [
        "Vue globale des performances académiques et financières",
        "Contrôle du coffre-fort et du chiffrement au repos des données (ENCv1)",
        "Alertes prédictives sur les impayés et retards pédagogiques",
      ],
      mockup: {
        badge: "Cockpit Directeur",
        screen: "Indicateurs Clés Établissement",
        visual: (
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
              <span className="block text-[10px] text-purple-700 font-semibold">Effectif</span>
              <strong className="text-purple-900 text-sm">648</strong>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="block text-[10px] text-emerald-700 font-semibold">Recouvrement</span>
              <strong className="text-emerald-900 text-sm">88.4%</strong>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
              <span className="block text-[10px] text-blue-700 font-semibold">Réussite</span>
              <strong className="text-blue-900 text-sm">92.1%</strong>
            </div>
          </div>
        ),
      },
    },
  ];

  const currentStepData = steps.find((s) => s.num === activeStep) || steps[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <PublicNavbar currentPath="/visite-guidee" />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-school-primary text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-school-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>VISITE GUIDÉE OFFICIELLE &bull; 18 ÉTAPES CLÉS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Découvrez ECOGEST pas à pas
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            De la création de votre établissement à l&apos;émission des bulletins certifiés et au suivi financier, explorez le fonctionnement intégral du progiciel de référence.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-school-primary text-white font-bold text-xs sm:text-sm hover:bg-school-700 shadow-lg shadow-school-primary/30 transition touch-target"
            >
              <span>Commencer maintenant</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-sm transition touch-target"
            >
              <Play className="w-3.5 h-3.5 text-amber-400" />
              <span>Demander une démonstration</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Step Explorer */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 flex-1 w-full">
        
        {/* Step Navigation Pill Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {steps.map((st) => {
              const isSelected = st.num === activeStep;
              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => setActiveStep(st.num)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? "bg-school-primary text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isSelected ? "bg-white text-school-primary" : "bg-slate-200 text-slate-700"
                  }`}>
                    {st.num}
                  </span>
                  <span className="hidden md:inline">{st.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Highlighted Step Feature Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Description Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-school-50 text-school-primary border border-school-200">
                Étape {currentStepData.num} sur 18
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {currentStepData.category}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shadow-xs">
                {currentStepData.icon}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {currentStepData.title}
              </h2>
            </div>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {currentStepData.desc}
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                Fonctionnalités clés incluses :
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {currentStepData.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev > 1 ? prev - 1 : 18))}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                &larr; Étape précédente
              </button>
              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev < 18 ? prev + 1 : 1))}
                className="px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-xs transition"
              >
                Étape suivante &rarr;
              </button>
            </div>
          </div>

          {/* Right Visual/Mockup Column */}
          <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-school-primary" />
                {currentStepData.mockup.badge}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Capture interactive</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700">
              Aperçu : <strong>{currentStepData.mockup.screen}</strong>
            </div>

            {/* Render Visual */}
            <div>{currentStepData.mockup.visual}</div>

            <div className="text-[11px] text-slate-500 italic text-center pt-2 border-t border-slate-200/60">
              Accessible depuis votre navigateur sur PC, tablette et smartphone.
            </div>
          </div>

        </div>

        {/* 18 Steps Full Grid Overview */}
        <section className="space-y-6 pt-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-slate-900">
              Vue panoramique des 18 modules
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm">
              Cliquez sur un module pour afficher sa description détaillée.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {steps.map((st) => (
              <div
                key={st.num}
                onClick={() => {
                  setActiveStep(st.num);
                  window.scrollTo({ top: 380, behavior: "smooth" });
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition hover:shadow-md ${
                  st.num === activeStep
                    ? "border-school-primary bg-school-50/70 ring-2 ring-school-primary/30"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-700">
                    {st.num}
                  </span>
                  {st.icon}
                </div>
                <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{st.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{st.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Call to Action Card */}
        <section className="bg-linear-to-r from-slate-900 via-slate-800 to-school-primary rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-black">
            Prêt à transformer la gestion de votre établissement ?
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Rejoignez les dizaines d&apos;écoles et complexes scolaires qui ont modernisé leur gouvernance grâce à ECOGEST PRO.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-school-primary text-white font-bold text-sm hover:bg-school-700 shadow-md transition"
            >
              <span>Commencer maintenant</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition"
            >
              <span>Demander une démonstration</span>
            </Link>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
