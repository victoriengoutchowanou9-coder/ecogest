export type Role =
  | "directeur"
  | "censeur"
  | "enseignant"
  | "comptabilite"
  | "parent";

/**
 * Entrée du registre de modules — inspiré du moduleRegistry GESTIO 229.
 *
 * Champs enrichis :
 * - `description`        : affiché en tooltip dans la Sidebar desktop
 * - `permission`         : clé de permission pour le futur RoleGuard (ex: "notes:write")
 * - `mobileTabPriority`  : ordre dans la BottomTabBar (1 = plus prioritaire).
 *                          Remplace le slice(0,4) aveugle.
 * - `isNew`              : affiche un badge "Nouveau" sur l'item
 */
export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string;
  description?: string;
  permission?: string;
  mobileTabPriority?: number;
  isNew?: boolean;
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
        description: "Vue globale : effectifs, finances, alertes et KPIs",
        permission: "dashboard:read",
        mobileTabPriority: 1,
      },
      {
        title: "Classes & Matières",
        href: "/directeur/classes",
        iconName: "GraduationCap",
        description: "Gérer les classes, divisions et matières enseignées",
        permission: "classes:manage",
        mobileTabPriority: 2,
      },
      {
        title: "Personnel & Utilisateurs",
        href: "/directeur/utilisateurs",
        iconName: "Users",
        description: "Comptes enseignants, comptables et administrateurs",
        permission: "users:manage",
        mobileTabPriority: 4,
      },
      {
        title: "Années scolaires",
        href: "/directeur/annees",
        iconName: "CalendarDays",
        description: "Créer et archiver les années scolaires",
        permission: "years:manage",
        mobileTabPriority: 3,
      },
      {
        title: "Résultats publics",
        href: "/directeur/publications",
        iconName: "Globe",
        description: "Publier les résultats et examens sur la vitrine",
        permission: "publications:manage",
      },
      {
        title: "Examens & Calendrier",
        href: "/directeur/examens",
        iconName: "CalendarDays",
        description: "Planification globale des examens et sessions officielles",
        permission: "exams:read",
      },
      {
        title: "Journal d'audit",
        href: "/directeur/audit",
        iconName: "ShieldAlert",
        description: "Traçabilité des actions sensibles et connexions",
        permission: "audit:read",
      },
      {
        title: "Paramètres établissement",
        href: "/directeur/parametres",
        iconName: "Settings",
        description: "Logo, nom, coordonnées et configuration générale",
        permission: "settings:manage",
      },
      {
        title: "Abonnement",
        href: "/directeur/abonnement",
        iconName: "CreditCard",
        description: "Formules mensuelles (6k, 10k, 25k FCFA), renouvellement et limites",
        permission: "subscription:manage",
        mobileTabPriority: 5,
      },
      {
        title: "Console Support",
        href: "/directeur/support",
        iconName: "LifeBuoy",
        description: "Gestion des tickets d'assistance et requêtes utilisateurs",
        permission: "support:manage",
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
        description: "Synthèse : présences, alertes pédagogiques, cours et contributions",
        permission: "dashboard:read",
        mobileTabPriority: 1,
      },
      {
        title: "Matières & Coefficients",
        href: "/censeur/matieres",
        iconName: "BookOpen",
        description: "Enregistrement des matières, attribution aux classes et coefficients",
        permission: "subjects:manage",
        mobileTabPriority: 2,
      },
      {
        title: "Enseignants & Horaires",
        href: "/censeur/enseignants",
        iconName: "Users",
        description: "Création des comptes enseignants, affectations et emplois du temps",
        permission: "teachers:manage",
        mobileTabPriority: 3,
      },
      {
        title: "Élèves & Affectations",
        href: "/censeur/eleves",
        iconName: "GraduationCap",
        description: "Liste des élèves inscrits, affectation et changement de classe",
        permission: "students:manage",
      },
      {
        title: "Demandes d'accès parents",
        href: "/censeur/demandes-parents",
        iconName: "UserCheck",
        badge: "Validation",
        description: "Traitement et validation des demandes d'accès des parents aux élèves",
        permission: "parents:validate",
        mobileTabPriority: 4,
      },
      {
        title: "Notes & Délibérations",
        href: "/censeur/notes",
        iconName: "BookOpenCheck",
        description: "Validation des notes, notes manquantes et délibérations officielles",
        permission: "notes:validate",
      },
      {
        title: "Examens & Calendrier",
        href: "/censeur/examens",
        iconName: "CalendarDays",
        description: "Planification et publication du calendrier d'examens par classe et trimestre",
        permission: "exams:manage",
      },
      {
        title: "Registre de classe",
        href: "/censeur/registre",
        iconName: "FileSpreadsheet",
        description: "Registre officiel d'appel et d'identification téléchargeable en PDF",
        permission: "classes:read",
      },
      {
        title: "Discipline & Incidents",
        href: "/censeur/discipline",
        iconName: "ShieldAlert",
        description: "Enregistrement des incidents disciplinaires, sanctions et historique",
        permission: "discipline:manage",
      },
      {
        title: "Cours, Devoirs & TD",
        href: "/censeur/activites",
        iconName: "CalendarDays",
        description: "Programmation et suivi des devoirs surveillés et séances de TD",
        permission: "curriculum:manage",
      },
      {
        title: "Pointage & Présences",
        href: "/censeur/presences",
        iconName: "CheckSquare",
        description: "Contrôle des présences élèves, régularisation et audit de pointage",
        permission: "attendance:manage",
      },
      {
        title: "Messages des Parents",
        href: "/censeur/messages",
        iconName: "MessageSquare",
        description: "Consultation des messages parents et réponses directes",
        permission: "messages:read",
      },
      {
        title: "Suivi des contributions",
        href: "/censeur/contributions",
        iconName: "DollarSign",
        description: "Suivi pédagogique des contributions scolaires et alertes de paiement",
        permission: "finance:read",
      },
      {
        title: "Centre de Support",
        href: "/support",
        iconName: "LifeBuoy",
        description: "Assistance technique, FAQ et ouverture de tickets",
        permission: "support:read",
      },
    ],
  },
  enseignant: {
    role: "enseignant",
    roleLabel: "Enseignant",
    basePath: "/enseignant",
    items: [
      {
        title: "Tableau de bord",
        href: "/enseignant",
        iconName: "LayoutDashboard",
        description: "Vue synthétique : classes, effectifs, prochains cours et tâches",
        permission: "dashboard:read",
        mobileTabPriority: 1,
      },
      {
        title: "Mes classes & cours",
        href: "/enseignant/classes",
        iconName: "BookOpen",
        description: "Classes assignées, listes d'élèves, matières et coefficients",
        permission: "courses:read",
        mobileTabPriority: 2,
      },
      {
        title: "Saisie des notes",
        href: "/enseignant/notes",
        iconName: "FileSpreadsheet",
        description: "Grille d'évaluation, calculs automatiques et soumission",
        permission: "notes:write",
        mobileTabPriority: 3,
      },
      {
        title: "Appel & Présences",
        href: "/enseignant/presences",
        iconName: "CheckSquare",
        description: "Pointage des présences, retards, absences et historique",
        permission: "attendance:write",
        mobileTabPriority: 4,
      },
      {
        title: "Cahier de textes",
        href: "/enseignant/cahier-de-textes",
        iconName: "BookMarked",
        description: "Suivi des leçons, devoirs assignés et prochaines évaluations",
        permission: "curriculum:write",
      },
      {
        title: "Bulletins & Appréciations",
        href: "/enseignant/bulletins",
        iconName: "Award",
        description: "Rédaction des appréciations de discipline et moyennes de matière",
        permission: "reports:write",
      },
      {
        title: "Emploi du temps",
        href: "/enseignant/emploi-du-temps",
        iconName: "CalendarDays",
        description: "Planning hebdomadaire des cours avec salles et horaires",
        permission: "schedule:read",
      },
      {
        title: "Messages & Annonces",
        href: "/enseignant/messages",
        iconName: "Bell",
        description: "Annonces de la direction, échéances et communications",
        permission: "messages:read",
        badge: "2",
      },
      {
        title: "Profil enseignant",
        href: "/enseignant/profil",
        iconName: "UserCircle",
        description: "Informations professionnelles et affectations pédagogiques",
        permission: "profile:read",
      },
      {
        title: "Centre de Support",
        href: "/support",
        iconName: "LifeBuoy",
        description: "Assistance technique, FAQ et tickets",
        permission: "support:read",
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
        description: "Encaissements, indicateurs clés et solde disponible",
        permission: "finance:read",
        mobileTabPriority: 1,
      },
      {
        title: "Suivi des élèves & frais",
        href: "/comptabilite/eleves",
        iconName: "Users2",
        description: "Soldes de scolarité par classe, statuts et relances",
        permission: "students:finance",
        mobileTabPriority: 2,
      },
      {
        title: "Encaisser un paiement",
        href: "/comptabilite/paiement",
        iconName: "Receipt",
        description: "Encaissement en espèces et émission du reçu officiel",
        permission: "payments:create",
        mobileTabPriority: 3,
      },
      {
        title: "Historique & Reçus",
        href: "/comptabilite/recus",
        iconName: "History",
        description: "Consultation, impression et historique permanent des reçus",
        permission: "receipts:read",
        mobileTabPriority: 4,
      },
      {
        title: "Gestion des Dépenses",
        href: "/comptabilite/depenses",
        iconName: "TrendingDown",
        description: "Enregistrement, validation et suivi des dépenses d'établissement",
        permission: "expenses:manage",
      },
      {
        title: "Salaires & Paie",
        href: "/comptabilite/salaires",
        iconName: "Briefcase",
        description: "Fiches de paie du personnel, validation et bulletins individuels",
        permission: "payroll:manage",
      },
      {
        title: "Trésorerie & Caisse",
        href: "/comptabilite/tresorerie",
        iconName: "Wallet",
        description: "Livre de caisse sans doublon : entrées et sorties réelles",
        permission: "treasury:read",
      },
      {
        title: "Centre de Support",
        href: "/support",
        iconName: "LifeBuoy",
        description: "Assistance technique, FAQ et tickets",
        permission: "support:read",
      },
    ],
  },
  parent: {
    role: "parent",
    roleLabel: "Parent",
    basePath: "/parent",
    items: [
      {
        title: "Tableau de bord",
        href: "/parent",
        iconName: "Home",
        description: "Vue synthétique de la scolarité de vos enfants",
        permission: "dashboard:read",
        mobileTabPriority: 1,
      },
      {
        title: "Bulletins de notes",
        href: "/parent/notes",
        iconName: "Award",
        description: "Bulletins officiels Bénin format A4 portrait, téléchargeables et imprimables",
        permission: "grades:read",
        mobileTabPriority: 2,
      },
      {
        title: "Absences & Retards",
        href: "/parent/presences",
        iconName: "Clock",
        description: "Suivi exclusif des heures d'absences, retards et motifs",
        permission: "attendance:read",
        mobileTabPriority: 3,
      },
      {
        title: "Paiements par tranche",
        href: "/parent/scolarite",
        iconName: "CreditCard",
        description: "Solde restant, échéancier de tranches et paiement sécurisé",
        permission: "payments:read",
        mobileTabPriority: 4,
      },
      {
        title: "Emploi du temps",
        href: "/parent/emploi-du-temps",
        iconName: "CalendarDays",
        description: "Planning hebdomadaire des cours du Lundi au Samedi avec enseignants",
        permission: "schedule:read",
        mobileTabPriority: 5,
      },
      {
        title: "Calendrier des examens",
        href: "/parent/examens",
        iconName: "CalendarDays",
        description: "Dates, horaires, salles et matières d'examen de vos enfants",
        permission: "exams:read",
        mobileTabPriority: 6,
      },
      {
        title: "Profil du parent",
        href: "/parent/profil",
        iconName: "UserCircle",
        description: "Coordonnées, enfants rattachés et alertes SMS / WhatsApp",
        permission: "profile:read",
      },
      {
        title: "Notifications",
        href: "/parent/notifications",
        iconName: "Bell",
        description: "Alertes sur les notes, retards et avis de paiement",
        permission: "notifications:read",
        badge: "3",
      },
      {
        title: "Messages",
        href: "/parent/messages",
        iconName: "MessageSquare",
        description: "Échanges directs avec les enseignants et l'administration",
        permission: "messages:read",
        badge: "1",
      },
      {
        title: "Abonnement",
        href: "/parent/abonnement",
        iconName: "CreditCard",
        description: "Forfaits Parent 1 (200F) ou Parent 2 (300F) et renouvellement",
        permission: "subscription:read",
        mobileTabPriority: 6,
      },
      {
        title: "Centre de Support",
        href: "/support",
        iconName: "LifeBuoy",
        description: "Assistance technique, FAQ et tickets",
        permission: "support:read",
      },
    ],
  },
};

export const SCHOOL_YEARS = [
  { id: "2026-2027", label: "2026 - 2027 (En cours)" },
  { id: "2025-2026", label: "2025 - 2026 (Archivée)" },
  { id: "2024-2025", label: "2024 - 2025 (Archivée)" },
];

export interface SchoolInfo {
  id: string;
  code: string;
  name: string;
  shortName: string;
  slug: string;
  devise: string;
  phone: string;
  email: string;
  address: string;
  coordinates: { lat: number; lng: number };
  currency: string;
  activeYear: string;
}

export const AVAILABLE_SCHOOLS: SchoolInfo[] = [
  {
    id: "school-1",
    code: "CCPA-229",
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
  },
  {
    id: "school-2",
    code: "CMS-229",
    name: "Collège Monseigneur Steinmetz",
    shortName: "CMS - Lokossa",
    slug: "cms-lokossa",
    devise: "Excellence - Rigueur - Devoir",
    phone: "+229 97 11 22 33",
    email: "direction@cms-lokossa.bj",
    address: "Agnivedji, Lokossa, Mono, Bénin",
    coordinates: { lat: 6.638, lng: 1.7167 },
    currency: "FCFA",
    activeYear: "2026-2027",
  },
  {
    id: "school-3",
    code: "CSR-229",
    name: "Complexe Scolaire La Rose",
    shortName: "CS La Rose - Calavi",
    slug: "cs-la-rose-calavi",
    devise: "Savoir - Vertu - Réussite",
    phone: "+229 96 45 67 89",
    email: "secretariat@cs-larose.bj",
    address: "Tankpè, Abomey-Calavi, Atlantique, Bénin",
    coordinates: { lat: 6.4485, lng: 2.3556 },
    currency: "FCFA",
    activeYear: "2026-2027",
  },
];

export const CURRENT_SCHOOL: SchoolInfo = AVAILABLE_SCHOOLS[0];

