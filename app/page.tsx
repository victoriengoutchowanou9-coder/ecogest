import Link from "next/link";
import {
  Shield,
  BookOpenCheck,
  GraduationCap,
  CreditCard,
  Home,
  ArrowRight,
  Lock,
  CheckCircle2,
  Layers,
  FileSpreadsheet,
  QrCode,
  Users,
  Calendar,
  Sparkles,
  Award,
  ChevronRight,
  Database,
  Printer,
} from "lucide-react";

export default function HomePage() {
  const softwareModules = [
    {
      title: "Direction & Administration",
      badge: "Gouvernance",
      desc: "Configuration de l'établissement, structure des divisions, ouverture des années scolaires, gestion des comptes utilisateurs et hiérarchie des permissions.",
      features: [
        "Création des comptes Censeur, Comptable et Enseignants",
        "Gestion des classes, effectifs et professeurs principaux",
        "Archivage et bascule des années académiques",
      ],
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      color: "border-purple-200 bg-purple-50/40",
      btnText: "Tester l'espace Directeur",
      href: "/directeur",
    },
    {
      title: "Censorat des Études & Pédagogie",
      badge: "Pédagogie & Audit",
      desc: "Supervision complète de l'enseignement : validation des notes, coefficients par matière, émargement des professeurs, suivi des devoirs surveillés et TD.",
      features: [
        "Gestion des matières et coefficients selon les cycles",
        "Validation rigoureuse des demandes d'accès parents par matricule",
        "Pointage et registre d'émargement des enseignants",
        "Alertes de notes manquantes et relances automatiques",
      ],
      icon: <BookOpenCheck className="w-6 h-6 text-blue-600" />,
      color: "border-blue-200 bg-blue-50/40",
      btnText: "Tester l'espace Censeur",
      href: "/censeur",
    },
    {
      title: "Espace Enseignants",
      badge: "Pratique de classe",
      desc: "Outils quotidiens pour les professeurs : saisie rapide des notes en tableau, calculs automatiques certifiés, appel par séance et cahier de textes numérique.",
      features: [
        "Saisie conforme : 3 interros ÷ 3, devoirs ÷ 3, moyenne /20",
        "Appel en un tap : présents, retards, absents justifiés",
        "Cahier de textes numérique avec impression officielle de fiche",
        "Rédaction des appréciations par matière pour les bulletins",
      ],
      icon: <GraduationCap className="w-6 h-6 text-emerald-600" />,
      color: "border-emerald-200 bg-emerald-50/40",
      btnText: "Tester l'espace Enseignant",
      href: "/enseignant",
    },
    {
      title: "Comptabilité & Gestion Financière",
      badge: "Trésorerie & Recouvrement",
      desc: "Gestion rigoureuse des finances scolaires : encaissement des tranches en espèces, émission de reçus infalsifiables avec QR Code, gestion des dépenses et paies.",
      features: [
        "Tableau de bord financier dynamique avec cartes interactives",
        "Encaissement sécurisé et impression immédiate du reçu officiel",
        "Suivi du reste à recouvrer par classe et par élève",
        "Registre des dépenses payées et fiches de paie du personnel",
      ],
      icon: <CreditCard className="w-6 h-6 text-amber-600" />,
      color: "border-amber-200 bg-amber-50/40",
      btnText: "Tester l'espace Comptabilité",
      href: "/comptabilite",
    },
    {
      title: "Portail Parents & Élèves",
      badge: "Suivi & Transparence",
      desc: "Espace de confiance pour les familles : demande d'accès sécurisée avec vérification d'identité, suivi exclusif des absences et retards, et bulletins officiels.",
      features: [
        "Recherche de l'élève par Matricule / EducMaster",
        "Validation préalable obligatoire par le Censeur des études",
        "Suivi précis des retards et absences sans encombrement inutile",
        "Consultation de l'emploi du temps, devoirs et calendrier",
      ],
      icon: <Home className="w-6 h-6 text-indigo-600" />,
      color: "border-indigo-200 bg-indigo-50/40",
      btnText: "Tester l'espace Parent",
      href: "/parent",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navbar for the Software */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-school-primary text-white flex items-center justify-center font-black text-xl shadow-md shadow-school-primary/20">
              E
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                EDUCOGEST
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-school-50 text-school-primary border border-school-200">
                  v2.4 PRO
                </span>
              </span>
              <span className="block text-[11px] text-slate-500 font-medium leading-none">
                Progiciel Tout-en-Un de Gestion Scolaire
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#modules-logiciel"
              className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-school-primary transition-colors px-3 py-1.5"
            >
              Modules du progiciel
            </a>
            <a
              href="#espaces-demo"
              className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-school-primary transition-colors px-3 py-1.5"
            >
              Espaces &amp; Démo
            </a>
            <Link
              href="/connexion"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-sm transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Connexion Établissement</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-8 md:py-12 space-y-16">
        {/* Hero Section with Official Photograph */}
        <section className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/pexels-tosin-olowoleni-2148141635-34162713.jpg')",
            }}
          />
          {/* Gradients to highlight software messaging */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-school-950/90 to-slate-900/75 backdrop-blur-[1px]" />

          <div className="relative z-10 p-8 md:p-14 text-white space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-school-100 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>LE PROGICIEL DE RÉFÉRENCE POUR L&apos;ENSEIGNEMENT GÉNÉRAL &amp; TECHNIQUE</span>
            </div>

            <div className="max-w-3xl space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                La solution logicielle complète pour piloter vos établissements scolaires
              </h1>
              <p className="text-sm md:text-base text-slate-200 leading-relaxed max-w-2xl">
                <strong>EDUCOGEST</strong> simplifie, centralise et sécurise toute la gestion de votre collège ou lycée :
                direction administrative, censorat pédagogique, bulletins scolaires normalisés, gestion des scolarités en espèces avec reçus officiels et portail de suivi parental.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="#espaces-demo"
                className="px-6 py-3 rounded-xl bg-white text-school-primary font-bold text-sm hover:bg-slate-100 shadow-md transition flex items-center gap-2 touch-target"
              >
                <span>Accéder aux Démonstrations du Logiciel</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/connexion"
                className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm border border-white/30 backdrop-blur-sm transition flex items-center gap-2 touch-target"
              >
                <Lock className="w-4 h-4" />
                <span>Accès Sécurisé par Rôle</span>
              </Link>
            </div>

            {/* Quick feature pills */}
            <div className="pt-4 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Conforme aux normes du Ministère (Bénin)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Règle des 3 interros &amp; devoirs surveillés</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Reçus de scolarité certifiés avec QR Code</span>
              </div>
            </div>
          </div>
        </section>

        {/* Modules du Logiciel EDUCOGEST */}
        <section id="modules-logiciel" className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-school-primary uppercase tracking-wider">
              Architecture Intégrée
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              5 modules métiers parfaitement interconnectés
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Chaque utilisateur dispose d&apos;une interface adaptée à ses prérogatives pour éliminer les doubles saisies et garantir l&apos;intégrité des informations scolaires.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {softwareModules.map((mod) => (
              <div
                key={mod.title}
                className={`p-6 rounded-2xl border ${mod.color} bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-white shadow-sm border border-slate-100">
                      {mod.icon}
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">
                      {mod.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{mod.title}</h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{mod.desc}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {mod.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-school-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    href={mod.href}
                    className="inline-flex items-center justify-between w-full text-xs font-bold text-school-primary hover:text-school-700 group"
                  >
                    <span>{mod.btnText}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}

            {/* Technical Highlights Card */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-white/10 text-amber-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-white/10 border border-white/20 text-amber-300">
                    Normes Officielles
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">Bulletins &amp; Calculs Certifiés</h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Spécifiquement paramétré pour les exigences des collèges et lycées béninois et ouest-africains.
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>(Interro 1 + 2 + 3) &divide; 3 = Moyenne Interros</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>(Moy. Interros + Dev 1 + Dev 2) &divide; 3 = Moyenne /20</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Moyenne &times; Coef = Points coefficientés</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Traitement des dispenses et matières sans devoirs</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/15">
                <Link
                  href="/censeur/matieres"
                  className="inline-flex items-center justify-between w-full text-xs font-bold text-amber-300 hover:text-amber-200"
                >
                  <span>Consulter le moteur de calcul</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Accès Démo aux 5 espaces du logiciel */}
        <section id="espaces-demo" className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold text-school-primary uppercase tracking-wider">
                Environnement de Test
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                Accéder directement aux espaces utilisateurs du logiciel
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                Cliquez sur un profil pour tester les flux opérationnels, la navigation et les contrôles en conditions réelles.
              </p>
            </div>
            <Link
              href="/connexion"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-school-primary hover:underline shrink-0"
            >
              <span>Écran de connexion générale</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <Link
              href="/directeur"
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-700">Directeur</h3>
              <p className="text-[11px] text-slate-500 mt-1">Administration, comptes et pilotage</p>
              <span className="text-[11px] font-semibold text-purple-600 mt-3 inline-flex items-center gap-1">
                Ouvrir &rarr;
              </span>
            </Link>

            <Link
              href="/censeur"
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <BookOpenCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700">Censeur</h3>
              <p className="text-[11px] text-slate-500 mt-1">Pédagogie, notes et émargement</p>
              <span className="text-[11px] font-semibold text-blue-600 mt-3 inline-flex items-center gap-1">
                Ouvrir &rarr;
              </span>
            </Link>

            <Link
              href="/enseignant"
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700">Enseignant</h3>
              <p className="text-[11px] text-slate-500 mt-1">Saisie de notes et cahier de textes</p>
              <span className="text-[11px] font-semibold text-emerald-600 mt-3 inline-flex items-center gap-1">
                Ouvrir &rarr;
              </span>
            </Link>

            <Link
              href="/comptabilite"
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-700">Comptable</h3>
              <p className="text-[11px] text-slate-500 mt-1">Scolarités, reçus et dépenses</p>
              <span className="text-[11px] font-semibold text-amber-600 mt-3 inline-flex items-center gap-1">
                Ouvrir &rarr;
              </span>
            </Link>

            <Link
              href="/parent"
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <Home className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-700">Parent</h3>
              <p className="text-[11px] text-slate-500 mt-1">Suivi assiduité, notes et devoirs</p>
              <span className="text-[11px] font-semibold text-indigo-600 mt-3 inline-flex items-center gap-1">
                Ouvrir &rarr;
              </span>
            </Link>
          </div>
        </section>
      </main>

      {/* Software Product Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">EDUCOGEST PRO</span>
            <span>&bull;</span>
            <span>Le progiciel de référence pour la gestion scolaire intégrée</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} EDUCOGEST. Conforme aux standards d&apos;accessibilité WCAG, mobile first et haute disponibilité locale.
          </div>
        </div>
      </footer>
    </div>
  );
}
