export type Role =
  | "directeur"
  | "censeur"
  | "secretariat"
  | "surveillant"
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
        title: "Mon Profil & Compte",
        href: "/directeur/profil",
        iconName: "UserCircle",
        description: "Informations du compte et modification du mot de passe",
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
        title: "Support & Assistance",
        href: "/support",
        iconName: "LifeBuoy",
        description: "Centre d'aide et assistance technique pour l'établissement",
        permission: "support:read",
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
        title: "Mon Profil & Compte",
        href: "/censeur/profil",
        iconName: "UserCircle",
        description: "Informations du compte et modification du mot de passe",
        permission: "dashboard:read",
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
  secretariat: {
    role: "secretariat",
    roleLabel: "Secrétariat Pédagogique",
    basePath: "/secretariat",
    items: [
      {
        title: "Tableau de bord",
        href: "/secretariat",
        iconName: "LayoutDashboard",
        description: "Vue globale : inscriptions, transferts, effectifs et documents à traiter",
        permission: "dashboard:read",
        mobileTabPriority: 1,
      },
      {
        title: "Gestion des élèves",
        href: "/secretariat/eleves",
        iconName: "GraduationCap",
        description: "Inscriptions, fiches élèves, transferts et historique scolaire",
        permission: "students:manage",
        mobileTabPriority: 2,
      },
      {
        title: "Parents & Tuteurs",
        href: "/secretariat/parents",
        iconName: "Users",
        description: "Fiches parents, rattachements et demandes d'accès",
        permission: "parents:manage",
        mobileTabPriority: 3,
      },
      {
        title: "Classes & Effectifs",
        href: "/secretariat/classes",
        iconName: "School",
        description: "Consultation des classes créées, effectifs et listes officielles",
        permission: "classes:read",
        mobileTabPriority: 4,
      },
      {
        title: "Dossiers & Documents",
        href: "/secretariat/documents",
        iconName: "FileText",
        description: "Certificats de scolarité, attestations, radiations et fiches d'inscription (PDF)",
        permission: "documents:manage",
        mobileTabPriority: 5,
      },
      {
        title: "Examens & Résultats",
        href: "/secretariat/examens",
        iconName: "BookOpenCheck",
        description: "Consultation des calendriers, résultats validés et impression des bulletins",
        permission: "exams:read",
      },
      {
        title: "Gestion Administrative",
        href: "/secretariat/agenda",
        iconName: "CalendarDays",
        description: "Calendrier scolaire, réunions, convocations et événements",
        permission: "admin:schedule",
      },
      {
        title: "Communications",
        href: "/secretariat/messages",
        iconName: "Mail",
        description: "Messages aux parents, annonces aux classes et communications enseignants",
        permission: "messages:manage",
      },
      {
        title: "Rapports & Stats",
        href: "/secretariat/rapports",
        iconName: "BarChart3",
        description: "Effectifs par classe, parité garçons/filles et statistiques d'inscription",
        permission: "reports:read",
      },
      {
        title: "Mon Profil & Compte",
        href: "/secretariat/profil",
        iconName: "UserCircle",
        description: "Informations du compte et modification du mot de passe",
        permission: "dashboard:read",
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
  surveillant: {
    role: "surveillant",
    roleLabel: "Surveillant Général",
    basePath: "/surveillant",
    items: [
      {
        title: "Tableau de bord",
        href: "/surveillant",
        iconName: "LayoutDashboard",
        description: "Synthèse : élèves présents, absents, retards, incidents et alertes",
        permission: "dashboard:read",
        mobileTabPriority: 1,
      },
      {
        title: "Présences & Absences",
        href: "/surveillant/presences",
        iconName: "Clock",
        description: "Pointage d'appel, retards, sorties exceptionnelles et justificatifs",
        permission: "attendance:manage",
        mobileTabPriority: 2,
      },
      {
        title: "Discipline & Incidents",
        href: "/surveillant/discipline",
        iconName: "ShieldAlert",
        description: "Enregistrement d'incidents, indiscipline, violences et dégradations",
        permission: "discipline:manage",
        mobileTabPriority: 3,
      },
      {
        title: "Sanctions & Suivi",
        href: "/surveillant/sanctions",
        iconName: "Scale",
        description: "Avertissements, retenues, exclusions et validation Directeur",
        permission: "sanctions:manage",
        mobileTabPriority: 4,
      },
      {
        title: "Planning Surveillance",
        href: "/surveillant/surveillance",
        iconName: "Eye",
        description: "Surveillance entrées, sorties, récréations, cours et examens",
        permission: "surveillance:manage",
      },
      {
        title: "Activités Scolaires",
        href: "/surveillant/activites",
        iconName: "CalendarDays",
        description: "Sorties scolaires, extrascolaires et autorisations de déplacement",
        permission: "activities:manage",
      },
      {
        title: "Communication Parents",
        href: "/surveillant/messages",
        iconName: "MessageSquare",
        description: "Convocations, signalement d'incidents et demandes de justification",
        permission: "messages:manage",
      },
      {
        title: "Rapports & Stats",
        href: "/surveillant/rapports",
        iconName: "FileSpreadsheet",
        description: "Rapport quotidien, absences répétées et bilan disciplinaire",
        permission: "reports:read",
      },
      {
        title: "Mon Profil & Compte",
        href: "/surveillant/profil",
        iconName: "UserCircle",
        description: "Informations du compte et modification du mot de passe",
        permission: "dashboard:read",
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
        title: "Mon Profil & Compte",
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
        title: "Mon Profil & Compte",
        href: "/comptabilite/profil",
        iconName: "UserCircle",
        description: "Informations du compte et modification du mot de passe",
        permission: "dashboard:read",
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
    code: "",
    name: "Établissement Scolaire",
    shortName: "Établissement",
    slug: "etablissement",
    devise: "Travail - Rigueur - Réussite",
    phone: "",
    email: "",
    address: "",
    coordinates: { lat: 6.3582, lng: 2.3985 },
    currency: "FCFA",
    activeYear: "2026-2027",
  },
];

export const CURRENT_SCHOOL: SchoolInfo = AVAILABLE_SCHOOLS[0];

