import {
  AbsenceRecord,
  AcademicPeriod,
  AcademicYear,
  BulletinAuditLog,
  ClassRoom,
  CompetencyDomain,
  CompetencyGradeRecord,
  CompetencyItem,
  CompetencyLevelDefinition,
  GradeRecord,
  HomeworkItem,
  SchoolSettings,
  StudentProfile,
  SubjectConfig,
  TeacherInfo,
  UpcomingEvaluation,
} from "./types/bulletin";

export const MOCK_SCHOOL_SETTINGS: SchoolSettings = {
  id: "sch-default",
  name: "Mon Établissement Scolaire",
  ministry: "MINISTÈRE DES ENSEIGNEMENTS PRIMAIRE ET SECONDAIRE",
  republic: "RÉPUBLIQUE DU BÉNIN",
  motto: "Fraternité - Justice - Travail",
  district: "",
  postalBox: "",
  phoneNumbers: "",
  directorName: "",
  logoUrl: "",
  platformName: "ECOGEST",
};

export const MOCK_ACADEMIC_YEARS: AcademicYear[] = [
  { id: "2026-2027", label: "2026 - 2027", isCurrent: true },
  { id: "2025-2026", label: "2025 - 2026", isCurrent: false },
];

export const MOCK_ACADEMIC_PERIODS: AcademicPeriod[] = [
  { id: "T1", code: "T1", name: "1er Trimestre", type: "TRIMESTRE", isCurrent: true },
  { id: "T2", code: "T2", name: "2ème Trimestre", type: "TRIMESTRE", isCurrent: false },
  { id: "T3", code: "T3", name: "3ème Trimestre", type: "TRIMESTRE", isCurrent: false },
];

export const MOCK_CLASSROOMS: ClassRoom[] = [
  {
    id: "6e-a",
    name: "6ème A",
    cycle: "SECONDAIRE",
    level: "6ème",
    stream: "Général",
    size: 42,
    mainTeacher: "M. Paul KOUASSI",
    academicYearId: "2026-2027",
  },
  {
    id: "5e-a",
    name: "5ème A",
    cycle: "SECONDAIRE",
    level: "5ème",
    stream: "Général",
    size: 38,
    mainTeacher: "Mme Clarisse SOGLO",
    academicYearId: "2026-2027",
  },
  {
    id: "4e-a",
    name: "4ème A",
    cycle: "SECONDAIRE",
    level: "4ème",
    stream: "Général",
    size: 35,
    mainTeacher: "M. Marcellin DOKPO",
    academicYearId: "2026-2027",
  },
  {
    id: "3e-a",
    name: "3ème A",
    cycle: "SECONDAIRE",
    level: "3ème",
    stream: "Général",
    size: 40,
    mainTeacher: "M. Paul KOUASSI",
    academicYearId: "2026-2027",
  },
  {
    id: "ce2-b",
    name: "CE2 B",
    cycle: "PRIMAIRE",
    level: "CE2",
    stream: "Fondamental",
    size: 30,
    mainTeacher: "Mme Bernadette ADANHO",
    academicYearId: "2026-2027",
  },
];

export const MOCK_SUBJECTS: SubjectConfig[] = [
  // ─── Matières Secondaire ───────────────────────────────────────────────────
  // Littéraires
  { id: "mat-fra", code: "FRA", name: "Français", cycle: "SECONDAIRE", coef: 3, category: "LITTÉRAIRE", order: 1 },
  { id: "mat-ang", code: "ANG", name: "Anglais", cycle: "SECONDAIRE", coef: 2, category: "LITTÉRAIRE", order: 2 },
  { id: "mat-hg", code: "HG", name: "Histoire-Géographie", cycle: "SECONDAIRE", coef: 2, category: "LITTÉRAIRE", order: 3 },
  // Scientifiques
  { id: "mat-math", code: "MATH", name: "Mathématiques", cycle: "SECONDAIRE", coef: 3, category: "SCIENTIFIQUE", order: 4 },
  { id: "mat-pct", code: "PCT", name: "Physique, Chimie & Technologie (PCT)", cycle: "SECONDAIRE", coef: 2, category: "SCIENTIFIQUE", order: 5 },
  { id: "mat-svt", code: "SVT", name: "Sciences de la Vie et de la Terre (SVT)", cycle: "SECONDAIRE", coef: 2, category: "SCIENTIFIQUE", order: 6 },
  // Autres
  { id: "mat-eps", code: "EPS", name: "Éducation Physique et Sportive (EPS)", cycle: "SECONDAIRE", coef: 1, category: "AUTRE", order: 7 },
  { id: "mat-dessin", code: "DESS", name: "Dessin & Arts Plastiques", cycle: "SECONDAIRE", coef: 1, category: "AUTRE", order: 8 },
  { id: "mat-tp", code: "TP", name: "Travaux Pratiques / Tech.", cycle: "SECONDAIRE", coef: 1, category: "AUTRE", order: 9 },
  { id: "mat-mel", code: "MEL", name: "MEL (Matière d'Éveil / Langue)", cycle: "SECONDAIRE", coef: 1, category: "AUTRE", order: 10 },
  { id: "mat-conduite", code: "COND", name: "Conduite", cycle: "SECONDAIRE", coef: 1, category: "AUTRE", isConduite: true, order: 11 },

  // ─── Domaines & Matières Primaire ──────────────────────────────────────────
  { id: "prim-fra", code: "P-FRA", name: "Français (Lecture, Écriture, Vocabulaire)", cycle: "PRIMAIRE", coef: 3, category: "LITTÉRAIRE", order: 101 },
  { id: "prim-math", code: "P-MATH", name: "Mathématiques & Numération", cycle: "PRIMAIRE", coef: 3, category: "SCIENTIFIQUE", order: 102 },
  { id: "prim-eveil", code: "P-EST", name: "Éducation Scientifique et Technologique (EST)", cycle: "PRIMAIRE", coef: 2, category: "SCIENTIFIQUE", order: 103 },
  { id: "prim-social", code: "P-ES", name: "Éducation Sociale & Morale (ES)", cycle: "PRIMAIRE", coef: 2, category: "AUTRE", order: 104 },
  { id: "prim-arts", code: "P-ART", name: "Éducation Artistique & Manuelle", cycle: "PRIMAIRE", coef: 1, category: "AUTRE", order: 105 },
  { id: "prim-eps", code: "P-EPS", name: "Éducation Physique et Sportive (EPS)", cycle: "PRIMAIRE", coef: 1, category: "AUTRE", order: 106 },
];

export const MOCK_TEACHERS: TeacherInfo[] = [];

export const DEFAULT_COMPETENCY_LEVELS: CompetencyLevelDefinition[] = [
  {
    code: "EXP",
    label: "Expert / Dépassé",
    shortLabel: "EXP",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    isAcquired: true,
  },
  {
    code: "A",
    label: "Acquis",
    shortLabel: "A",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    isAcquired: true,
  },
  {
    code: "ECA",
    label: "En cours d'acquisition",
    shortLabel: "ECA",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    isAcquired: false,
  },
  {
    code: "NA",
    label: "Non acquis",
    shortLabel: "NA",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
    isAcquired: false,
  },
];

export const MOCK_COMPETENCY_LEVELS = DEFAULT_COMPETENCY_LEVELS;

export const MOCK_PRIMARY_DOMAINS: CompetencyDomain[] = [
  {
    id: "dom-fra",
    code: "FRA",
    name: "Français & Communication",
    description: "Lecture, écriture cursive, vocabulaire, compréhension et expression orale",
    order: 1,
    cycle: "PRIMAIRE",
  },
  {
    id: "dom-math",
    code: "MATH",
    name: "Mathématiques & Numération",
    description: "Nombres, calcul mental, géométrie, grandeurs et résolution de problèmes",
    order: 2,
    cycle: "PRIMAIRE",
  },
  {
    id: "dom-est",
    code: "EST",
    name: "Éducation Scientifique et Technologique (EST)",
    description: "Sciences de la nature, technologie, environnement et hygiène corporelle",
    order: 3,
    cycle: "PRIMAIRE",
  },
  {
    id: "dom-es",
    code: "ES",
    name: "Éducation Sociale & Morale (ES)",
    description: "Histoire, géographie locale, civisme, règles de vie et symboles républicains",
    order: 4,
    cycle: "PRIMAIRE",
  },
  {
    id: "dom-art",
    code: "ART",
    name: "Éducation Artistique & Manuelle",
    description: "Dessin, calligraphie, chant et activités manuelles",
    order: 5,
    cycle: "PRIMAIRE",
  },
  {
    id: "dom-eps",
    code: "EPS",
    name: "Éducation Physique et Sportive (EPS)",
    description: "Motricité globale, jeux collectifs et esprit d'équipe",
    order: 6,
    cycle: "PRIMAIRE",
  },
];

export const MOCK_PRIMARY_COMPETENCIES: CompetencyItem[] = [
  // Français
  { id: "comp-fra-01", domainId: "dom-fra", code: "FRA-01", name: "Lire couramment à voix haute un texte adapté", targetLevel: "CE2", order: 1 },
  { id: "comp-fra-02", domainId: "dom-fra", code: "FRA-02", name: "Comprendre et restituer l'idée principale d'un récit", targetLevel: "CE2", order: 2 },
  { id: "comp-fra-03", domainId: "dom-fra", code: "FRA-03", name: "Écrire lisiblement en écriture cursive sans rature", targetLevel: "CE2", order: 3 },
  { id: "comp-fra-04", domainId: "dom-fra", code: "FRA-04", name: "Orthographier correctement les mots d'usage courant", targetLevel: "CE2", order: 4 },
  // Mathématiques
  { id: "comp-math-01", domainId: "dom-math", code: "MATH-01", name: "Maîtriser les tables de multiplication (jusqu'à 9)", targetLevel: "CE2", order: 5 },
  { id: "comp-math-02", domainId: "dom-math", code: "MATH-02", name: "Poser et effectuer des additions et soustractions", targetLevel: "CE2", order: 6 },
  { id: "comp-math-03", domainId: "dom-math", code: "MATH-03", name: "Résoudre un problème du quotidien à 2 étapes", targetLevel: "CE2", order: 7 },
  { id: "comp-math-04", domainId: "dom-math", code: "MATH-04", name: "Reconnaître et tracer les figures géométriques planes", targetLevel: "CE2", order: 8 },
  // EST
  { id: "comp-est-01", domainId: "dom-est", code: "EST-01", name: "Identifier les régimes alimentaires des animaux", targetLevel: "CE2", order: 9 },
  { id: "comp-est-02", domainId: "dom-est", code: "EST-02", name: "Appliquer les règles d'hygiène et de santé au quotidien", targetLevel: "CE2", order: 10 },
  // ES
  { id: "comp-es-01", domainId: "dom-es", code: "ES-01", name: "Connaître les symboles de la République du Bénin", targetLevel: "CE2", order: 11 },
  { id: "comp-es-02", domainId: "dom-es", code: "ES-02", name: "Respecter les camarades et les règles de vie de la classe", targetLevel: "CE2", order: 12 },
  // Arts & EPS
  { id: "comp-art-01", domainId: "dom-art", code: "ART-01", name: "Réaliser une composition plastique soignée", targetLevel: "CE2", order: 13 },
  { id: "comp-eps-01", domainId: "dom-eps", code: "EPS-01", name: "Participer activement aux jeux collectifs en respectant les règles", targetLevel: "CE2", order: 14 },
];

export const MOCK_PRIMARY_GRADE_RECORDS: CompetencyGradeRecord[] = [];

export const MOCK_BULLETIN_STUDENTS: StudentProfile[] = [
  {
    id: "std-01",
    matricule: "ECO-2026-0012",
    educMasterNumber: "EM-BN-009821",
    lastName: "DOSSOU",
    firstName: "Jean-Eudes",
    gender: "M",
    birthDate: "2012-04-14",
    birthPlace: "Cotonou",
    classId: "6e-a",
    className: "6ème A",
    cycle: "SECONDAIRE",
    parentName: "M. Thomas DOSSOU",
    parentPhone: "+229 97 11 22 33",
    parentEmail: "thomas.dossou@gmail.com",
    status: "ACTIF",
  },
  {
    id: "std-02",
    matricule: "ECO-2026-0015",
    educMasterNumber: "EM-BN-009825",
    lastName: "AGBO",
    firstName: "Marie-Josée",
    gender: "F",
    birthDate: "2012-08-20",
    birthPlace: "Porto-Novo",
    classId: "6e-a",
    className: "6ème A",
    cycle: "SECONDAIRE",
    parentName: "Mme Clarisse AGBO",
    parentPhone: "+229 95 44 22 11",
    parentEmail: "clarisse.agbo@yahoo.fr",
    status: "ACTIF",
  },
  {
    id: "std-03",
    matricule: "ECO-2026-0018",
    educMasterNumber: "EM-BN-009830",
    lastName: "KANHONOU",
    firstName: "Rodrigue",
    gender: "M",
    birthDate: "2012-01-09",
    birthPlace: "Abomey-Calavi",
    classId: "6e-a",
    className: "6ème A",
    cycle: "SECONDAIRE",
    parentName: "M. Bernard KANHONOU",
    parentPhone: "+229 96 22 33 44",
    parentEmail: "b.kanhonou@ecole.bj",
    status: "ACTIF",
  },
  {
    id: "std-04",
    matricule: "ECO-2026-0022",
    educMasterNumber: "EM-BN-009841",
    lastName: "MENSAH",
    firstName: "Prudence",
    gender: "F",
    birthDate: "2011-03-12",
    birthPlace: "Ouidah",
    classId: "5e-a",
    className: "5ème A",
    cycle: "SECONDAIRE",
    parentName: "Mme Sophie MENSAH",
    parentPhone: "+229 94 55 66 77",
    parentEmail: "sophie.mensah@gmail.com",
    status: "ACTIF",
  },
  {
    id: "std-05",
    matricule: "ECO-2026-0028",
    educMasterNumber: "EM-BN-009849",
    lastName: "HOUNGBEDJI",
    firstName: "Arnaud",
    gender: "M",
    birthDate: "2011-11-05",
    birthPlace: "Cotonou",
    classId: "5e-a",
    className: "5ème A",
    cycle: "SECONDAIRE",
    parentName: "M. Gabriel HOUNGBEDJI",
    parentPhone: "+229 97 88 99 00",
    parentEmail: "houngbedji.g@yahoo.fr",
    status: "ACTIF",
  },
  {
    id: "std-06",
    matricule: "ECO-2026-0035",
    educMasterNumber: "EM-BN-009855",
    lastName: "SOSSOU",
    firstName: "Emilienne",
    gender: "F",
    birthDate: "2010-06-18",
    birthPlace: "Lokossa",
    classId: "4e-a",
    className: "4ème A",
    cycle: "SECONDAIRE",
    parentName: "M. Pierre SOSSOU",
    parentPhone: "+229 95 12 34 56",
    parentEmail: "p.sossou@gmail.com",
    status: "ACTIF",
  },
  {
    id: "std-07",
    matricule: "ECO-2026-0042",
    educMasterNumber: "EM-BN-009862",
    lastName: "TCHIBOZO",
    firstName: "Kévine",
    gender: "M",
    birthDate: "2009-09-25",
    birthPlace: "Cotonou",
    classId: "3e-a",
    className: "3ème A",
    cycle: "SECONDAIRE",
    parentName: "Mme Félicité TCHIBOZO",
    parentPhone: "+229 97 00 11 22",
    parentEmail: "tchibozo.f@gmail.com",
    status: "ACTIF",
  },
  {
    id: "std-08",
    matricule: "ECO-2026-0049",
    educMasterNumber: "EM-BN-009871",
    lastName: "ADANHO",
    firstName: "Bénédicte",
    gender: "F",
    birthDate: "2015-05-10",
    birthPlace: "Abomey",
    classId: "ce2-b",
    className: "CE2 B",
    cycle: "PRIMAIRE",
    parentName: "M. Florent ADANHO",
    parentPhone: "+229 96 44 55 66",
    parentEmail: "florent.adanho@gmail.com",
    status: "ACTIF",
  },
  {
    id: "std-09",
    matricule: "ECO-2026-0055",
    educMasterNumber: "EM-BN-009880",
    lastName: "KPATINVO",
    firstName: "Gilles",
    gender: "M",
    birthDate: "2011-07-02",
    birthPlace: "Parakou",
    classId: "5e-a",
    className: "5ème A",
    cycle: "SECONDAIRE",
    parentName: "M. Paul KPATINVO",
    parentPhone: "+229 95 77 88 99",
    parentEmail: "kpatinvo.p@gmail.com",
    status: "TRANSFERE",
  },
  {
    id: "std-10",
    matricule: "ECO-2026-0061",
    educMasterNumber: "EM-BN-009892",
    lastName: "ZANNOU",
    firstName: "Christelle",
    gender: "F",
    birthDate: "2010-12-14",
    birthPlace: "Cotonou",
    classId: "4e-a",
    className: "4ème A",
    cycle: "SECONDAIRE",
    parentName: "Mme Jeanne ZANNOU",
    parentPhone: "+229 94 33 22 11",
    parentEmail: "jeanne.zannou@yahoo.com",
    status: "DESISTE",
  },
];

export const MOCK_PRIMARY_BULLETIN_STUDENTS: StudentProfile[] = [];

export const MOCK_GRADE_RECORDS: GradeRecord[] = [];

export const MOCK_AUDIT_LOGS_MAP = new Map<string, BulletinAuditLog[]>();

export const MOCK_HOMEWORK_ITEMS: HomeworkItem[] = [];

export const MOCK_UPCOMING_EVALUATIONS: UpcomingEvaluation[] = [];

export const MOCK_ABSENCE_RECORDS: AbsenceRecord[] = [];

export interface ParentProfileChild {
  id: string;
  name: string;
  className: string;
  matricule: string;
  educMaster: string;
}

export interface ParentProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profession: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  children: ParentProfileChild[];
  notifications: {
    smsAlerts: boolean;
    emailAlerts: boolean;
    whatsappAlerts: boolean;
    notifyOnAbsence: boolean;
    notifyOnGrades: boolean;
    notifyOnDueTuition: boolean;
  };
}

export const MOCK_PARENT_PROFILE: ParentProfile = {
  id: "parent-default",
  fullName: "Parent d'Élève",
  email: "",
  phoneNumber: "",
  profession: "",
  address: "",
  emergencyContact: {
    name: "",
    phone: "",
  },
  children: [],
  notifications: {
    smsAlerts: true,
    emailAlerts: true,
    whatsappAlerts: true,
    notifyOnAbsence: true,
    notifyOnGrades: true,
    notifyOnDueTuition: true,
  },
};
