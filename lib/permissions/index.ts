export type Role =
  | "directeur"
  | "censeur"
  | "enseignant"
  | "comptabilite"
  | "parent";

export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string;
  description?: string;
}

export interface RoleNavigation {
  role: Role;
  roleLabel: string;
  basePath: string;
  items: NavItem[];
}

export const ROLE_NAVIGATIONS: Record<Role, RoleNavigation> = {
  directeur: {
    role: "directeur",
    roleLabel: "Directeur / Administration",
    basePath: "/directeur",
    items: [
      {
        title: "Tableau de bord",
        href: "/directeur",
        iconName: "LayoutDashboard",
      },
      {
        title: "Classes & Matières",
        href: "/directeur/classes",
        iconName: "GraduationCap",
      },
      {
        title: "Personnel & Utilisateurs",
        href: "/directeur/utilisateurs",
        iconName: "Users",
      },
      {
        title: "Années scolaires",
        href: "/directeur/annees",
        iconName: "CalendarDays",
      },
      {
        title: "Résultats publics",
        href: "/directeur/publications",
        iconName: "Globe",
      },
      {
        title: "Journal d'audit",
        href: "/directeur/audit",
        iconName: "ShieldAlert",
      },
      {
        title: "Paramètres établissement",
        href: "/directeur/parametres",
        iconName: "Settings",
      },
    ],
  },
  censeur: {
    role: "censeur",
    roleLabel: "Censeur des Études",
    basePath: "/censeur",
    items: [
      {
        title: "Tableau de bord",
        href: "/censeur",
        iconName: "LayoutDashboard",
      },
      {
        title: "Émargement Enseignants",
        href: "/censeur/emargement",
        iconName: "UserCheck",
      },
      {
        title: "Notes & Délibérations",
        href: "/censeur/notes",
        iconName: "BookOpenCheck",
        badge: "Validation",
      },
      {
        title: "Alertes notes manquantes",
        href: "/censeur/alertes",
        iconName: "AlertTriangle",
      },
    ],
  },
  enseignant: {
    role: "enseignant",
    roleLabel: "Espace Enseignant",
    basePath: "/enseignant",
    items: [
      {
        title: "Mes classes & cours",
        href: "/enseignant",
        iconName: "BookOpen",
      },
      {
        title: "Saisie des notes",
        href: "/enseignant/notes",
        iconName: "FileSpreadsheet",
      },
      {
        title: "Appel & Présences",
        href: "/enseignant/presences",
        iconName: "CheckSquare",
      },
    ],
  },
  comptabilite: {
    role: "comptabilite",
    roleLabel: "Comptabilité & Finances",
    basePath: "/comptabilite",
    items: [
      {
        title: "Tableau de bord financier",
        href: "/comptabilite",
        iconName: "DollarSign",
      },
      {
        title: "Suivi des élèves & frais",
        href: "/comptabilite/eleves",
        iconName: "Users2",
      },
      {
        title: "Encaisser un paiement",
        href: "/comptabilite/paiement",
        iconName: "Receipt",
      },
      {
        title: "Historique & Reçus",
        href: "/comptabilite/recus",
        iconName: "History",
      },
    ],
  },
  parent: {
    role: "parent",
    roleLabel: "Espace Parent",
    basePath: "/parent",
    items: [
      {
        title: "Tableau de bord",
        href: "/parent",
        iconName: "Home",
      },
      {
        title: "Notes & Bulletins",
        href: "/parent/notes",
        iconName: "Award",
      },
      {
        title: "Présences & Retards",
        href: "/parent/presences",
        iconName: "Clock",
      },
      {
        title: "Scolarité & Paiements",
        href: "/parent/scolarite",
        iconName: "CreditCard",
      },
    ],
  },
};

export const SCHOOL_YEARS = [
  { id: "2026-2027", label: "2026 - 2027 (En cours)" },
  { id: "2025-2026", label: "2025 - 2026 (Archivée)" },
  { id: "2024-2025", label: "2024 - 2025 (Archivée)" },
];

export const CURRENT_SCHOOL = {
  name: "Collège Catholique Père Aupiais",
  shortName: "CCPA - Cotonou",
  slug: "ccpa-cotonou",
  devise: "Travail - Foi - Discipline",
  phone: "+229 97 00 00 01",
  email: "contact@ccpa-cotonou.bj",
  address: "Cadjehoun, Cotonou, Bénin",
  coordinates: { lat: 6.3582, lng: 2.3985 },
  currency: "FCFA",
  activeYear: "2026-2027",
};
