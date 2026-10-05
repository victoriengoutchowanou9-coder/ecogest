import Link from "next/link";
import {
  Shield,
  BookOpenCheck,
  GraduationCap,
  CreditCard,
  Home,
  Globe,
  ArrowRight,
  School,
  Lock,
} from "lucide-react";
import { CURRENT_SCHOOL } from "@/lib/permissions";

export default function HomePage() {
  const roles = [
    {
      role: "directeur",
      title: "Directeur / Administration",
      desc: "Tableau de bord global, alertes, gestion des classes, matières et utilisateurs.",
      href: "/directeur",
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      bg: "hover:border-purple-300",
    },
    {
      role: "censeur",
      title: "Censeur des Études",
      desc: "Émargement des enseignants, validation des notes et alertes notes manquantes.",
      href: "/censeur",
      icon: <BookOpenCheck className="w-6 h-6 text-blue-600" />,
      bg: "hover:border-blue-300",
    },
    {
      role: "enseignant",
      title: "Espace Enseignant",
      desc: "Saisie rapide de notes en grille, appel de présence en un tap.",
      href: "/enseignant",
      icon: <GraduationCap className="w-6 h-6 text-emerald-600" />,
      bg: "hover:border-emerald-300",
    },
    {
      role: "comptabilite",
      title: "Comptabilité & Finances",
      desc: "Suivi scolarité, encaissement, reçu imprimable et gestion des impayés.",
      href: "/comptabilite",
      icon: <CreditCard className="w-6 h-6 text-amber-600" />,
      bg: "hover:border-amber-300",
    },
    {
      role: "parent",
      title: "Espace Parent",
      desc: "Suivi des notes, présences, solde scolarité et paiement en ligne sécurisé.",
      href: "/parent",
      icon: <Home className="w-6 h-6 text-indigo-600" />,
      bg: "hover:border-indigo-300",
    },
    {
      role: "public",
      title: "Vitrine Publique de l'École",
      desc: "Présentation, carte GPS OpenStreetMap, taux de réussite et contacts.",
      href: `/ecole/${CURRENT_SCHOOL.slug}`,
      icon: <Globe className="w-6 h-6 text-cyan-600" />,
      bg: "hover:border-cyan-300",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 md:p-8">
      <div className="max-w-5xl mx-auto w-full pt-8 pb-12">
        {/* Brand Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-school-50 border border-school-100 text-school-primary text-xs font-semibold">
            <School className="w-4 h-4" />
            <span>GESTIO 229 · Plateforme Éducative</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            ECODUC
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Système d&apos;information et de gestion scolaire unifiée. Choisissez un espace pour tester les flux et composants selon les spécifications.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((item) => (
            <Link
              key={item.role}
              href={item.href}
              className={`p-5 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between group ${item.bg}`}
            >
              <div>
                <div className="p-3 rounded-xl bg-slate-50 inline-block mb-3">
                  {item.icon}
                </div>
                <h2 className="text-base font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                  {item.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-school-primary">
                <span>Accéder à l&apos;espace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Auth link */}
        <div className="mt-8 text-center">
          <Link
            href="/connexion"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-school-primary font-medium"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Accéder à l&apos;écran de connexion (/connexion)</span>
          </Link>
        </div>
      </div>

      <footer className="text-center py-4 border-t border-slate-200 text-xs text-slate-400">
        ECODUC &copy; 2026 - Conforme aux standards d&apos;accessibilité WCAG, mobile first.
      </footer>
    </div>
  );
}
