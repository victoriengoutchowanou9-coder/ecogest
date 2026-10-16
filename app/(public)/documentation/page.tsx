"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Shield,
  BookOpenCheck,
  CreditCard,
  GraduationCap,
  Home,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Sparkles,
  HelpCircle,
  FileText,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProfile, setActiveProfile] = useState<string>("ALL");
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  const docSections = [
    {
      profile: "Direction",
      roleBadge: "Administration & Pilotage",
      color: "border-purple-200 bg-purple-50/40 text-purple-900",
      icon: <Shield className="w-5 h-5 text-purple-600" />,
      articles: [
        {
          id: "dir-01",
          title: "Créer son établissement",
          desc: "Procédure d'inscription initiale, déclaration du nom officiel, ville, devise nationale et génération du coffre-fort numérique.",
          content: "La création de l'établissement s'effectue en renseignant le formulaire d'enregistrement officiel. Dès validation, un tenant isolé est instancié avec une clé de chiffrement au repos maître conforme au protocole ENCv1.",
        },
        {
          id: "dir-02",
          title: "Configurer son école",
          desc: "Définition du type d'enseignement : Primaire (CI-CM2), Secondaire (6e-Terminale) ou Primaire + Secondaire bivalent.",
          content: "Dans 'Paramètres de l'établissement', sélectionnez la typologie de votre école. Les divisions et niveaux correspondants s'activent immédiatement dans tous les modules (notes, examens, bulletins).",
        },
        {
          id: "dir-03",
          title: "Créer les comptes",
          desc: "Génération des accès nominatifs pour le personnel avec attribution de mots de passe temporaires.",
          content: "Accédez à la section 'Utilisateurs' pour créer les comptes Censeur, Comptable et Enseignants. Chaque compte bénéficie d'une authentification sécurisée et de restrictions RBAC.",
        },
        {
          id: "dir-04",
          title: "Gérer les utilisateurs",
          desc: "Modification des rôles, désactivation d'accès, réinitialisation de mots de passe et contrôle des droits.",
          content: "Le Directeur peut à tout moment suspendre un accès, réinitialiser un compte bloqué ou modifier le rôle d'un membre de l'équipe pédagogique.",
        },
        {
          id: "dir-05",
          title: "Configurer les années scolaires",
          desc: "Ouverture de la nouvelle année académique, bascule des classes et archivage des années précédentes.",
          content: "La bascule d'année préserve l'intégralité des données historiques des apprenants et permet de reconduire les effectifs sans aucune perte d'informations antérieures.",
        },
      ],
    },
    {
      profile: "Censeur",
      roleBadge: "Supervision Pédagogique",
      color: "border-blue-200 bg-blue-50/40 text-blue-900",
      icon: <BookOpenCheck className="w-5 h-5 text-blue-600" />,
      articles: [
        {
          id: "cen-01",
          title: "Gérer les élèves",
          desc: "Immatriculation officielle, matricule légal, EducMaster, fiches médicales chiffrées et gestion des réadmissions.",
          content: "Le Censeur enregistre les élèves, renseigne les antécédents médicaux de façon confidentielle et gère le cycle de vie de l'apprenant (Actif, Ancien, Transféré, Réadmis).",
        },
        {
          id: "cen-02",
          title: "Gérer les enseignants",
          desc: "Affectation des professeurs par discipline, nomination des professeurs principaux et suivi du volume horaire.",
          content: "Dans l'onglet 'Enseignants', associez chaque professeur à ses classes d'intervention et paramétrez son taux horaire pour le registre d'émargement.",
        },
        {
          id: "cen-03",
          title: "Gérer les matières",
          desc: "Configuration des coefficients littéraires et scientifiques selon le niveau et le cycle de l'élève.",
          content: "Définissez les pondérations officielles par matière (ex : Français Coef 3 en 3ème, Mathématiques Coef 6 en Tle C).",
        },
        {
          id: "cen-04",
          title: "Gérer les emplois du temps",
          desc: "Élaboration des grilles hebdomadaires par division et attribution des créneaux aux professeurs.",
          content: "Construisez la grille horaire de chaque classe. Les enseignants et parents retrouvent instantanément leur planning synchronisé sur leurs portails respectifs.",
        },
        {
          id: "cen-05",
          title: "Valider les pointages",
          desc: "Contrôle des présences et validation des fiches d'émargement pour la transmission au service comptable.",
          content: "Vérifiez quotidiennement les feuilles d'émargement des professeurs et approuvez les heures effectives pour l'établissement des paies.",
        },
        {
          id: "cen-06",
          title: "Valider les notes",
          desc: "Workflow d'audit : validation matière par matière, validation globale, demande de correction formelle et publication.",
          content: "Les notes saisies par les professeurs restent invisibles aux parents tant que le Censeur ne les a pas formellement confirmées et publiées.",
        },
        {
          id: "cen-07",
          title: "Programmer les examens",
          desc: "Établissement du calendrier officiel des épreuves écrites et orales par classe et par trimestre.",
          content: "Renseignez les dates, horaires de début/fin, salles d'examen et surveillants. Les parents ne visualisent que les examens correspondant à leurs enfants.",
        },
        {
          id: "cen-08",
          title: "Gérer les devoirs et TD",
          desc: "Supervision du cahier de textes numérique et suivi de la charge de devoirs imposée aux élèves.",
          content: "Assurez la régularité des évaluations formatives et des devoirs de maison programmés par l'équipe pédagogique.",
        },
      ],
    },
    {
      profile: "Comptable",
      roleBadge: "Gestion Financière",
      color: "border-amber-200 bg-amber-50/40 text-amber-900",
      icon: <CreditCard className="w-5 h-5 text-amber-600" />,
      articles: [
        {
          id: "com-01",
          title: "Enregistrer les paiements",
          desc: "Encaissement des tranches de scolarité et édition immédiate du reçu infalsifiable avec QR Code.",
          content: "Saisissez les versements en espèces ou Mobile Money. Le système calcule immédiatement le solde et imprime le reçu officiel certifié.",
        },
        {
          id: "com-02",
          title: "Suivre les impayés",
          desc: "Extraction de l'état des restes à recouvrer par classe et génération de listes de relance parentale.",
          content: "Consultez en un coup d'œil les familles débitrices pour émettre des rappels préventifs avant les périodes d'examens.",
        },
        {
          id: "com-03",
          title: "Enregistrer les dépenses",
          desc: "Saisie des charges d'exploitation, factures de fonctionnement et pièces justificatives comptables.",
          content: "Ventilez les décaissements par poste analytique (loyer, électricité, rames de papier, réparations) avec archivage des numéros de facture.",
        },
        {
          id: "com-04",
          title: "Gérer les salaires",
          desc: "Calcul automatique des rémunérations mensuelles selon le volume d'émargement et les primes contractuelles.",
          content: "Le module salaires croise le registre de présence du Censeur et génère les bulletins de paie nets sans risque d'erreur de calcul.",
        },
        {
          id: "com-05",
          title: "Consulter les rapports financiers",
          desc: "Bilan des encaissements, solde de trésorerie net disponible et export pour le Fondateur de l'école.",
          content: "Générez les synthèses mensuelles et annuelles en PDF ou Excel pour la gouvernance de l'établissement.",
        },
      ],
    },
    {
      profile: "Enseignant",
      roleBadge: "Pratique de Classe",
      color: "border-emerald-200 bg-emerald-50/40 text-emerald-900",
      icon: <GraduationCap className="w-5 h-5 text-emerald-600" />,
      articles: [
        {
          id: "ens-01",
          title: "Consulter ses classes",
          desc: "Liste complète des apprenants par division, trombinoscope et repérage des cas particuliers.",
          content: "Le professeur accède à la liste d'émargement de ses classes attribuées avec photo et coordonnées d'urgence des parents.",
        },
        {
          id: "ens-02",
          title: "Saisir les notes",
          desc: "Remplissage du carnet de notes : 3 interrogations, devoirs surveillés et calcul immédiat de la moyenne /20.",
          content: "Une grille intuitive permet d'enregistrer les notes au fil de l'eau sur PC ou smartphone, avec sauvegarde automatique.",
        },
        {
          id: "ens-03",
          title: "Définir les coefficients de sa matière",
          desc: "Vérification des pondérations appliquées dans ses divisions selon le programme en vigueur.",
          content: "L'enseignant visualise les coefficients assignés à sa discipline et peut signaler toute particularité au Censeur.",
        },
        {
          id: "ens-04",
          title: "Remplir les appréciations",
          desc: "Rédaction des mentions et encouragements personnalisés pour chaque élève avant les conseils de classe.",
          content: "Saisissez les avis pédagogiques qui apparaîtront directement sur le bulletin trimestriel officiel de l'élève.",
        },
        {
          id: "ens-05",
          title: "Consulter les bulletins",
          desc: "Visualisation des bulletins finalisés et archivés une fois la délibération du conseil de classe validée.",
          content: "Consultez le relevé général de la classe avec les rangs, mentions et moyennes globales avant distribution.",
        },
      ],
    },
    {
      profile: "Parent",
      roleBadge: "Espace Famille",
      color: "border-indigo-200 bg-indigo-50/40 text-indigo-900",
      icon: <Home className="w-5 h-5 text-indigo-600" />,
      articles: [
        {
          id: "par-01",
          title: "Demander l'accès à son enfant",
          desc: "Procédure de rattachement sécurisée par Matricule / EducMaster validée par le Censorat.",
          content: "Renseignez le numéro matricule fourni par l'école lors de l'inscription. Dès validation administrative, le dossier de l'enfant s'affiche sur votre espace.",
        },
        {
          id: "par-02",
          title: "Consulter les résultats",
          desc: "Accès aux notes validées, moyennes trimestrielles et téléchargement des bulletins certifiés en PDF.",
          content: "Les notes s'affichent dès publication officielle par le Censeur, garantissant la fiabilité des résultats délibérés.",
        },
        {
          id: "par-03",
          title: "Consulter les absences",
          desc: "Suivi en temps réel des absences et retards enregistrés lors des séances de cours.",
          content: "Soyez prévenu immédiatement en cas de retard ou manquement injustifié avec précision de la date et de l'heure.",
        },
        {
          id: "par-04",
          title: "Consulter les devoirs",
          desc: "Accès au cahier de textes numérique pour vérifier le travail à faire à la maison et les dates de rendu.",
          content: "Consultez les exercices, lectures et révisions programmés par les professeurs de votre enfant.",
        },
        {
          id: "par-05",
          title: "Consulter les examens",
          desc: "Calendrier précis des épreuves trimestrielles et examens blancs réservé à la classe de votre enfant.",
          content: "Visualisez les dates, horaires et matières des compositions sans confusion avec les autres niveaux.",
        },
        {
          id: "par-06",
          title: "Consulter les informations de l'école",
          desc: "Circulaires, avis de réunion de parents, calendrier des vacances scolaires et coordonnées officielles.",
          content: "Recevez les annonces officielles de la Direction sans risque de perte de papier dans le cartable.",
        },
      ],
    },
  ];

  // Filtering articles by search query and profile
  const filteredSections = useMemo(() => {
    return docSections
      .filter((sec) => activeProfile === "ALL" || sec.profile.toLowerCase() === activeProfile.toLowerCase())
      .map((sec) => {
        const matchingArticles = sec.articles.filter((art) => {
          if (!searchQuery) return true;
          const query = searchQuery.toLowerCase();
          return (
            art.title.toLowerCase().includes(query) ||
            art.desc.toLowerCase().includes(query) ||
            art.content.toLowerCase().includes(query)
          );
        });
        return { ...sec, articles: matchingArticles };
      })
      .filter((sec) => sec.articles.length > 0);
  }, [searchQuery, activeProfile]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <PublicNavbar currentPath="/documentation" />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-school-primary text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-school-200">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>CENTRE DE DOCUMENTATION EDUCOGEST</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
          Guides &amp; Manuels d&apos;utilisation
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Retrouvez les guides détaillés pas à pas organisés pour chaque profil d&apos;utilisateur de votre établissement.
        </p>

        {/* Search Bar (Requirement) */}
        <div className="max-w-xl mx-auto pt-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher dans la documentation (ex : bulletins, notes, examens...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium shadow-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-school-primary"
            />
          </div>
        </div>
      </section>

      {/* Profile Filters */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 flex-1 w-full">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {["ALL", "Direction", "Censeur", "Comptable", "Enseignant", "Parent"].map((prof) => (
            <button
              key={prof}
              type="button"
              onClick={() => setActiveProfile(prof)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeProfile === prof
                  ? "bg-school-primary text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {prof === "ALL" ? "Tous les profils" : prof}
            </button>
          ))}
        </div>

        {/* Articles by Profile */}
        <div className="space-y-12">
          {filteredSections.map((sec, idx) => (
            <section key={idx} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center">
                  {sec.icon}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>Espace {sec.profile}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {sec.articles.length} guides
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">{sec.roleBadge}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sec.articles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArticle(art)}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-school-primary/60 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-school-primary transition-colors flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-slate-400 group-hover:text-school-primary" />
                          <span>{art.title}</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-school-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {art.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-school-primary font-bold">
                      <span>Lire le guide</span>
                      <span>&rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {filteredSections.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">Aucun article trouvé</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Aucun guide ne correspond à &quot;{searchQuery}&quot;. Essayez un autre mot-clé ou réinitialisez la recherche.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveProfile("ALL");
                }}
                className="px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-bold"
              >
                Réinitialiser la recherche
              </button>
            </div>
          )}
        </div>

        {/* Support Callout */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-black text-slate-900 text-base sm:text-lg">
              Vous ne trouvez pas la réponse à votre question ?
            </h3>
            <p className="text-xs text-slate-500">
              Notre équipe d&apos;assistance pédagogique et technique est joignable 6j/7 pour vous accompagner.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/chat-support"
              className="px-4 py-2.5 rounded-xl bg-school-primary hover:bg-school-700 text-white font-bold text-xs shadow-xs transition"
            >
              Ouvrir le chat en direct
            </Link>
            <Link
              href="/assistance"
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
            >
              Nos contacts
            </Link>
          </div>
        </section>

      </main>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-school-primary" />
                <h3 className="font-bold text-base text-slate-900">{selectedArticle.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-900 p-3 bg-slate-50 rounded-xl border border-slate-200">
                {selectedArticle.desc}
              </p>
              <div className="space-y-2">
                <span className="font-bold text-slate-800 block uppercase tracking-wider text-[11px]">
                  Instructions détaillées :
                </span>
                <p>{selectedArticle.content}</p>
                <p>
                  Pour toute assistance complémentaire concernant cette procédure, vous pouvez vous adresser au Censorat ou initier une session avec le support technique EducoGest.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700"
              >
                Fermer ce guide
              </button>
            </div>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
}
