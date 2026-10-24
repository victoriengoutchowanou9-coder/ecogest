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
  // ─── Cycle Primaire ────────────────────────────────────────────────────────
  {
    id: "cp-a",
    name: "CP A",
    cycle: "PRIMAIRE",
    level: "CP",
    stream: "Apprentissages Fondamentaux",
    size: 32,
    mainTeacher: "Mme Bernadette SOSSOU",
    academicYearId: "2026-2027",
  },
  {
    id: "ce2-b",
    name: "CE2 B",
    cycle: "PRIMAIRE",
    level: "CE2",
    stream: "Approfondissement",
    size: 35,
    mainTeacher: "M. Marcellin KPADONOU",
    academicYearId: "2026-2027",
  },
  {
    id: "cm2-a",
    name: "CM2 A",
    cycle: "PRIMAIRE",
    level: "CM2",
    stream: "Consolidation (CEP)",
    size: 38,
    mainTeacher: "M. Théophile AÏSSI",
    academicYearId: "2026-2027",
  },
  // ─── Cycle Secondaire ──────────────────────────────────────────────────────
  {
    id: "6e-b",
    name: "6ème B",
    cycle: "SECONDAIRE",
    level: "6ème",
    stream: "Enseignement Général",
    size: 45,
    mainTeacher: "Mme DOSSOU Sylvie",
    academicYearId: "2026-2027",
  },
  {
    id: "3e-a",
    name: "3ème A",
    cycle: "SECONDAIRE",
    level: "3ème",
    stream: "Enseignement Général (BEPC)",
    size: 42,
    mainTeacher: "M. TOSSOU Koffi",
    academicYearId: "2026-2027",
  },
  {
    id: "tle-c",
    name: "Terminale C",
    cycle: "SECONDAIRE",
    level: "Terminale",
    stream: "Scientifique (C)",
    size: 38,
    mainTeacher: "M. HOUNNOU Emmanuel",
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
    matricule: "ECO-2026-0042",
    educMasterNumber: "EM-2026-78452-BJ",
    lastName: "ADANHOUN",
    firstName: "Koffi Parfait",
    gender: "M",
    birthDate: "12 Avril 2011",
    birthPlace: "Cotonou",
    classId: "3e-a",
    className: "3ème A",
    parentName: "M. Marc ADANHOUN",
    parentPhone: "+229 97 12 34 56",
  },
  {
    id: "std-02",
    matricule: "ECO-2026-0089",
    educMasterNumber: "EM-2026-89104-BJ",
    lastName: "ADANHOUN",
    firstName: "Amina Victoire",
    gender: "F",
    birthDate: "25 Août 2014",
    birthPlace: "Porto-Novo",
    classId: "3e-a",
    className: "3ème A",
    parentName: "M. Marc ADANHOUN",
    parentPhone: "+229 97 12 34 56",
  },
  {
    id: "std-03",
    matricule: "ECO-2026-0112",
    educMasterNumber: "EM-2026-65412-BJ",
    lastName: "SOULEYMANE",
    firstName: "Bio Rachid",
    gender: "M",
    birthDate: "19 Janvier 2011",
    birthPlace: "Parakou",
    classId: "3e-a",
    className: "3ème A",
    parentName: "Mme Fatima SOULEYMANE",
    parentPhone: "+229 96 44 88 12",
  },
  {
    id: "std-04",
    matricule: "ECO-2026-0145",
    educMasterNumber: "EM-2026-92147-BJ",
    lastName: "AGBOSSA",
    firstName: "Gloria Estelle",
    gender: "F",
    birthDate: "03 Novembre 2011",
    birthPlace: "Ouidah",
    classId: "3e-a",
    className: "3ème A",
    parentName: "M. Luc AGBOSSA",
    parentPhone: "+229 95 33 22 11",
  },
  {
    id: "std-05",
    matricule: "ECO-2026-0182",
    educMasterNumber: "EM-2026-33214-BJ",
    lastName: "DOSSOU",
    firstName: "Fabrice Carlos",
    gender: "M",
    birthDate: "15 Février 2011",
    birthPlace: "Cotonou",
    classId: "3e-a",
    className: "3ème A",
    parentName: "M. Jean DOSSOU",
    parentPhone: "+229 97 45 61 23",
  },
  {
    id: "std-06",
    matricule: "ECO-2026-0210",
    educMasterNumber: "EM-2026-55481-BJ",
    lastName: "HOUNTONDJI",
    firstName: "Sèna Priscille",
    gender: "F",
    birthDate: "28 Juin 2011",
    birthPlace: "Abomey-Calavi",
    classId: "3e-a",
    className: "3ème A",
    parentName: "Mme Claire HOUNTONDJI",
    parentPhone: "+229 96 11 22 44",
  },
  {
    id: "std-07",
    matricule: "ECO-2026-0245",
    educMasterNumber: "EM-2026-11478-BJ",
    lastName: "KANHONOU",
    firstName: "Rodrigue",
    gender: "M",
    birthDate: "09 Septembre 2010",
    birthPlace: "Lokossa",
    classId: "3e-a",
    className: "3ème A",
    parentName: "M. Mathias KANHONOU",
    parentPhone: "+229 94 88 77 66",
  },
  {
    id: "std-08",
    matricule: "ECO-2026-0290",
    educMasterNumber: "EM-2026-44789-BJ",
    lastName: "GOMEZ",
    firstName: "Chantal",
    gender: "F",
    birthDate: "04 Décembre 2011",
    birthPlace: "Cotonou",
    classId: "3e-a",
    className: "3ème A",
    parentName: "M. Félix GOMEZ",
    parentPhone: "+229 95 66 55 44",
  },
  // ─── Élèves du Cycle Primaire ──────────────────────────────────────────────
  {
    id: "std-p01",
    matricule: "ECO-PRIM-2026-0012",
    educMasterNumber: "EM-2026-11234-BJ",
    lastName: "ADANHOUN",
    firstName: "Samuel Ézéchiel",
    gender: "M",
    birthDate: "18 Juin 2017",
    birthPlace: "Cotonou",
    classId: "ce2-b",
    className: "CE2 B",
    cycle: "PRIMAIRE",
    parentName: "M. Marc ADANHOUN",
    parentPhone: "+229 97 12 34 56",
  },
  {
    id: "std-p02",
    matricule: "ECO-PRIM-2026-0045",
    educMasterNumber: "EM-2026-11567-BJ",
    lastName: "KPADONOU",
    firstName: "Chloé Fagnon",
    gender: "F",
    birthDate: "03 Septembre 2017",
    birthPlace: "Porto-Novo",
    classId: "ce2-b",
    className: "CE2 B",
    cycle: "PRIMAIRE",
    parentName: "M. Marcellin KPADONOU",
    parentPhone: "+229 96 11 22 33",
  },
  {
    id: "std-p03",
    matricule: "ECO-PRIM-2026-0078",
    educMasterNumber: "EM-2026-11890-BJ",
    lastName: "HOUNTON",
    firstName: "David Akanni",
    gender: "M",
    birthDate: "22 Novembre 2017",
    birthPlace: "Abomey-Calavi",
    classId: "ce2-b",
    className: "CE2 B",
    cycle: "PRIMAIRE",
    parentName: "Mme Pauline HOUNTON",
    parentPhone: "+229 95 88 44 22",
  },
  {
    id: "std-p04",
    matricule: "ECO-PRIM-2026-0091",
    educMasterNumber: "EM-2026-11999-BJ",
    lastName: "TOSSOU",
    firstName: "Grâce Syntiche",
    gender: "F",
    birthDate: "14 Février 2017",
    birthPlace: "Cotonou",
    classId: "ce2-b",
    className: "CE2 B",
    cycle: "PRIMAIRE",
    parentName: "M. TOSSOU Koffi",
    parentPhone: "+229 97 00 11 22",
  },
  {
    id: "std-p05",
    matricule: "ECO-PRIM-2026-0105",
    educMasterNumber: "EM-2026-12105-BJ",
    lastName: "SOULEYMANE",
    firstName: "Emmanuel",
    gender: "M",
    birthDate: "10 Mai 2020",
    birthPlace: "Parakou",
    classId: "cp-a",
    className: "CP A",
    cycle: "PRIMAIRE",
    parentName: "Mme Fatima SOULEYMANE",
    parentPhone: "+229 96 44 88 12",
  },
];

/**
 * Realistic grades with:
 * 3 Interrogations (interro1, interro2, interro3)
 * 2 Devoirs (devoir1, devoir2)
 * Conduite note
 */
export const MOCK_GRADE_RECORDS: GradeRecord[] = [
  // Student 1: Koffi ADANHOUN (Good student, ~15.4)
  { id: "g-1-1", studentId: "std-01", subjectId: "mat-fra", periodId: "T1", interro1: 14.0, interro2: 15.0, interro3: 14.5, devoir1: 15.0, devoir2: 16.0 },
  { id: "g-1-2", studentId: "std-01", subjectId: "mat-ang", periodId: "T1", interro1: 17.0, interro2: 18.0, interro3: 17.5, devoir1: 16.0, devoir2: 18.0 },
  { id: "g-1-3", studentId: "std-01", subjectId: "mat-hg", periodId: "T1", interro1: 15.0, interro2: 14.5, interro3: 15.5, devoir1: 14.5, devoir2: 16.0 },
  { id: "g-1-4", studentId: "std-01", subjectId: "mat-math", periodId: "T1", interro1: 16.0, interro2: 15.5, interro3: 16.5, devoir1: 15.5, devoir2: 17.0 },
  { id: "g-1-5", studentId: "std-01", subjectId: "mat-pct", periodId: "T1", interro1: 15.0, interro2: 14.0, interro3: 16.0, devoir1: 14.0, devoir2: 16.0 },
  { id: "g-1-6", studentId: "std-01", subjectId: "mat-svt", periodId: "T1", interro1: 14.0, interro2: 13.5, interro3: 14.5, devoir1: 13.5, devoir2: 14.5 },
  { id: "g-1-7", studentId: "std-01", subjectId: "mat-eps", periodId: "T1", interro1: 16.0, interro2: 16.0, interro3: 16.0, devoir1: 16.0, devoir2: 16.0 },
  { id: "g-1-8", studentId: "std-01", subjectId: "mat-dessin", periodId: "T1", interro1: 14.0, interro2: 15.0, interro3: 14.0, devoir1: 15.0, devoir2: 14.0 },
  { id: "g-1-9", studentId: "std-01", subjectId: "mat-tp", periodId: "T1", interro1: 15.5, interro2: 16.0, interro3: 15.0, devoir1: 16.0, devoir2: 15.0 },
  // MEL is deliberately left blank to test exclusion rule and "…" display
  { id: "g-1-10", studentId: "std-01", subjectId: "mat-mel", periodId: "T1" },
  { id: "g-1-11", studentId: "std-01", subjectId: "mat-conduite", periodId: "T1", noteConduite: 18.0, teacherAppreciation: "Excellente conduite et ponctualité" },

  // Student 2: Amina ADANHOUN (Top student, ~16.8)
  { id: "g-2-1", studentId: "std-02", subjectId: "mat-fra", periodId: "T1", interro1: 16.5, interro2: 17.0, interro3: 16.5, devoir1: 17.0, devoir2: 17.0 },
  { id: "g-2-2", studentId: "std-02", subjectId: "mat-ang", periodId: "T1", interro1: 18.0, interro2: 18.5, interro3: 19.0, devoir1: 18.5, devoir2: 19.0 },
  { id: "g-2-3", studentId: "std-02", subjectId: "mat-hg", periodId: "T1", interro1: 16.0, interro2: 16.5, interro3: 16.0, devoir1: 16.5, devoir2: 17.0 },
  { id: "g-2-4", studentId: "std-02", subjectId: "mat-math", periodId: "T1", interro1: 17.0, interro2: 16.0, interro3: 17.5, devoir1: 16.0, devoir2: 17.5 },
  { id: "g-2-5", studentId: "std-02", subjectId: "mat-pct", periodId: "T1", interro1: 15.5, interro2: 16.0, interro3: 16.5, devoir1: 16.0, devoir2: 16.5 },
  { id: "g-2-6", studentId: "std-02", subjectId: "mat-svt", periodId: "T1", interro1: 15.0, interro2: 15.5, interro3: 16.0, devoir1: 15.5, devoir2: 16.0 },
  { id: "g-2-7", studentId: "std-02", subjectId: "mat-eps", periodId: "T1", interro1: 15.0, interro2: 15.0, interro3: 15.0, devoir1: 15.0, devoir2: 15.0 },
  { id: "g-2-8", studentId: "std-02", subjectId: "mat-dessin", periodId: "T1", interro1: 16.0, interro2: 17.0, interro3: 16.0, devoir1: 17.0, devoir2: 16.0 },
  { id: "g-2-9", studentId: "std-02", subjectId: "mat-tp", periodId: "T1", interro1: 16.0, interro2: 16.0, interro3: 16.0, devoir1: 16.0, devoir2: 16.0 },
  { id: "g-2-10", studentId: "std-02", subjectId: "mat-mel", periodId: "T1" },
  { id: "g-2-11", studentId: "std-02", subjectId: "mat-conduite", periodId: "T1", noteConduite: 19.0, teacherAppreciation: "Élève exemplaire" },

  // Student 3: Bio SOULEYMANE (~13.8)
  { id: "g-3-1", studentId: "std-03", subjectId: "mat-fra", periodId: "T1", interro1: 13.0, interro2: 13.5, interro3: 13.0, devoir1: 13.5, devoir2: 14.0 },
  { id: "g-3-2", studentId: "std-03", subjectId: "mat-ang", periodId: "T1", interro1: 14.0, interro2: 13.0, interro3: 14.5, devoir1: 13.0, devoir2: 14.5 },
  { id: "g-3-3", studentId: "std-03", subjectId: "mat-hg", periodId: "T1", interro1: 14.5, interro2: 14.0, interro3: 14.5, devoir1: 14.0, devoir2: 15.0 },
  { id: "g-3-4", studentId: "std-03", subjectId: "mat-math", periodId: "T1", interro1: 15.0, interro2: 14.0, interro3: 14.5, devoir1: 14.0, devoir2: 14.5 },
  { id: "g-3-5", studentId: "std-03", subjectId: "mat-pct", periodId: "T1", interro1: 13.5, interro2: 14.0, interro3: 13.5, devoir1: 14.0, devoir2: 13.5 },
  { id: "g-3-6", studentId: "std-03", subjectId: "mat-svt", periodId: "T1", interro1: 13.0, interro2: 13.0, interro3: 13.5, devoir1: 13.0, devoir2: 13.5 },
  { id: "g-3-7", studentId: "std-03", subjectId: "mat-eps", periodId: "T1", interro1: 14.0, interro2: 14.0, interro3: 14.0, devoir1: 14.0, devoir2: 14.0 },
  { id: "g-3-8", studentId: "std-03", subjectId: "mat-dessin", periodId: "T1", interro1: 13.0, interro2: 13.5, interro3: 13.0, devoir1: 13.5, devoir2: 13.0 },
  { id: "g-3-9", studentId: "std-03", subjectId: "mat-tp", periodId: "T1", interro1: 14.0, interro2: 14.0, interro3: 14.0, devoir1: 14.0, devoir2: 14.0 },
  { id: "g-3-10", studentId: "std-03", subjectId: "mat-mel", periodId: "T1" },
  { id: "g-3-11", studentId: "std-03", subjectId: "mat-conduite", periodId: "T1", noteConduite: 15.0 },

  // Student 4: Gloria AGBOSSA (~12.4)
  { id: "g-4-1", studentId: "std-04", subjectId: "mat-fra", periodId: "T1", interro1: 12.0, interro2: 11.5, interro3: 12.5, devoir1: 11.5, devoir2: 13.0 },
  { id: "g-4-2", studentId: "std-04", subjectId: "mat-ang", periodId: "T1", interro1: 13.0, interro2: 12.5, interro3: 13.0, devoir1: 12.5, devoir2: 13.0 },
  { id: "g-4-3", studentId: "std-04", subjectId: "mat-hg", periodId: "T1", interro1: 12.5, interro2: 13.0, interro3: 12.5, devoir1: 13.0, devoir2: 12.5 },
  { id: "g-4-4", studentId: "std-04", subjectId: "mat-math", periodId: "T1", interro1: 11.5, interro2: 12.0, interro3: 11.5, devoir1: 12.0, devoir2: 12.5 },
  { id: "g-4-5", studentId: "std-04", subjectId: "mat-pct", periodId: "T1", interro1: 12.0, interro2: 11.0, interro3: 12.0, devoir1: 11.0, devoir2: 12.0 },
  { id: "g-4-6", studentId: "std-04", subjectId: "mat-svt", periodId: "T1", interro1: 12.5, interro2: 12.0, interro3: 12.5, devoir1: 12.0, devoir2: 12.5 },
  { id: "g-4-7", studentId: "std-04", subjectId: "mat-eps", periodId: "T1", interro1: 15.0, interro2: 15.0, interro3: 15.0, devoir1: 15.0, devoir2: 15.0 },
  { id: "g-4-8", studentId: "std-04", subjectId: "mat-dessin", periodId: "T1", interro1: 12.0, interro2: 12.0, interro3: 12.0, devoir1: 12.0, devoir2: 12.0 },
  { id: "g-4-9", studentId: "std-04", subjectId: "mat-tp", periodId: "T1", interro1: 13.0, interro2: 13.0, interro3: 13.0, devoir1: 13.0, devoir2: 13.0 },
  { id: "g-4-10", studentId: "std-04", subjectId: "mat-mel", periodId: "T1" },
  { id: "g-4-11", studentId: "std-04", subjectId: "mat-conduite", periodId: "T1", noteConduite: 14.0 },

  // Student 5: Fabrice DOSSOU (~15.42)
  { id: "g-5-1", studentId: "std-05", subjectId: "mat-fra", periodId: "T1", interro1: 15.0, interro2: 14.5, interro3: 15.5, devoir1: 14.5, devoir2: 16.0 },
  { id: "g-5-2", studentId: "std-05", subjectId: "mat-ang", periodId: "T1", interro1: 16.0, interro2: 16.0, interro3: 16.5, devoir1: 16.0, devoir2: 16.5 },
  { id: "g-5-3", studentId: "std-05", subjectId: "mat-hg", periodId: "T1", interro1: 15.0, interro2: 15.5, interro3: 15.0, devoir1: 15.5, devoir2: 15.0 },
  { id: "g-5-4", studentId: "std-05", subjectId: "mat-math", periodId: "T1", interro1: 16.5, interro2: 15.0, interro3: 16.0, devoir1: 15.0, devoir2: 16.0 },
  { id: "g-5-5", studentId: "std-05", subjectId: "mat-pct", periodId: "T1", interro1: 14.0, interro2: 14.5, interro3: 14.0, devoir1: 14.5, devoir2: 15.0 },
  { id: "g-5-6", studentId: "std-05", subjectId: "mat-svt", periodId: "T1", interro1: 14.5, interro2: 14.0, interro3: 14.5, devoir1: 14.0, devoir2: 15.0 },
  { id: "g-5-7", studentId: "std-05", subjectId: "mat-eps", periodId: "T1", interro1: 16.0, interro2: 16.0, interro3: 16.0, devoir1: 16.0, devoir2: 16.0 },
  { id: "g-5-8", studentId: "std-05", subjectId: "mat-dessin", periodId: "T1", interro1: 15.0, interro2: 14.5, interro3: 15.0, devoir1: 14.5, devoir2: 15.0 },
  { id: "g-5-9", studentId: "std-05", subjectId: "mat-tp", periodId: "T1", interro1: 15.0, interro2: 15.0, interro3: 15.0, devoir1: 15.0, devoir2: 15.0 },
  { id: "g-5-10", studentId: "std-05", subjectId: "mat-mel", periodId: "T1" },
  { id: "g-5-11", studentId: "std-05", subjectId: "mat-conduite", periodId: "T1", noteConduite: 17.0 },

  // Student 6: Sèna HOUNTONDJI (~10.8)
  { id: "g-6-1", studentId: "std-06", subjectId: "mat-fra", periodId: "T1", interro1: 11.0, interro2: 10.5, interro3: 11.0, devoir1: 10.5, devoir2: 11.5 },
  { id: "g-6-2", studentId: "std-06", subjectId: "mat-ang", periodId: "T1", interro1: 12.0, interro2: 11.5, interro3: 12.0, devoir1: 11.5, devoir2: 12.0 },
  { id: "g-6-3", studentId: "std-06", subjectId: "mat-hg", periodId: "T1", interro1: 10.5, interro2: 11.0, interro3: 10.5, devoir1: 11.0, devoir2: 10.5 },
  { id: "g-6-4", studentId: "std-06", subjectId: "mat-math", periodId: "T1", interro1: 9.5, interro2: 10.0, interro3: 9.5, devoir1: 10.0, devoir2: 10.5 },
  { id: "g-6-5", studentId: "std-06", subjectId: "mat-pct", periodId: "T1", interro1: 10.0, interro2: 9.5, interro3: 10.0, devoir1: 9.5, devoir2: 10.0 },
  { id: "g-6-6", studentId: "std-06", subjectId: "mat-svt", periodId: "T1", interro1: 11.0, interro2: 10.5, interro3: 11.0, devoir1: 10.5, devoir2: 11.0 },
  { id: "g-6-7", studentId: "std-06", subjectId: "mat-eps", periodId: "T1", interro1: 13.0, interro2: 13.0, interro3: 13.0, devoir1: 13.0, devoir2: 13.0 },
  { id: "g-6-8", studentId: "std-06", subjectId: "mat-dessin", periodId: "T1", interro1: 11.0, interro2: 11.0, interro3: 11.0, devoir1: 11.0, devoir2: 11.0 },
  { id: "g-6-9", studentId: "std-06", subjectId: "mat-tp", periodId: "T1", interro1: 11.5, interro2: 11.5, interro3: 11.5, devoir1: 11.5, devoir2: 11.5 },
  { id: "g-6-10", studentId: "std-06", subjectId: "mat-mel", periodId: "T1" },
  { id: "g-6-11", studentId: "std-06", subjectId: "mat-conduite", periodId: "T1", noteConduite: 13.0 },

  // Student 7: Rodrigue KANHONOU (~8.4)
  { id: "g-7-1", studentId: "std-07", subjectId: "mat-fra", periodId: "T1", interro1: 8.0, interro2: 8.5, interro3: 8.0, devoir1: 8.5, devoir2: 9.0 },
  { id: "g-7-2", studentId: "std-07", subjectId: "mat-ang", periodId: "T1", interro1: 9.0, interro2: 8.0, interro3: 9.0, devoir1: 8.0, devoir2: 8.5 },
  { id: "g-7-3", studentId: "std-07", subjectId: "mat-hg", periodId: "T1", interro1: 8.5, interro2: 8.0, interro3: 8.5, devoir1: 8.0, devoir2: 9.0 },
  { id: "g-7-4", studentId: "std-07", subjectId: "mat-math", periodId: "T1", interro1: 7.5, interro2: 8.0, interro3: 7.5, devoir1: 8.0, devoir2: 7.5 },
  { id: "g-7-5", studentId: "std-07", subjectId: "mat-pct", periodId: "T1", interro1: 8.0, interro2: 7.5, interro3: 8.0, devoir1: 7.5, devoir2: 8.0 },
  { id: "g-7-6", studentId: "std-07", subjectId: "mat-svt", periodId: "T1", interro1: 8.5, interro2: 8.0, interro3: 8.5, devoir1: 8.0, devoir2: 8.5 },
  { id: "g-7-7", studentId: "std-07", subjectId: "mat-eps", periodId: "T1", interro1: 12.0, interro2: 12.0, interro3: 12.0, devoir1: 12.0, devoir2: 12.0 },
  { id: "g-7-8", studentId: "std-07", subjectId: "mat-dessin", periodId: "T1", interro1: 10.0, interro2: 9.5, interro3: 10.0, devoir1: 9.5, devoir2: 10.0 },
  { id: "g-7-9", studentId: "std-07", subjectId: "mat-tp", periodId: "T1", interro1: 9.0, interro2: 9.0, interro3: 9.0, devoir1: 9.0, devoir2: 9.0 },
  { id: "g-7-10", studentId: "std-07", subjectId: "mat-mel", periodId: "T1" },
  { id: "g-7-11", studentId: "std-07", subjectId: "mat-conduite", periodId: "T1", noteConduite: 11.0 },

  // Student 8: Chantal GOMEZ (~7.4 - lowest average)
  { id: "g-8-1", studentId: "std-08", subjectId: "mat-fra", periodId: "T1", interro1: 7.0, interro2: 7.5, interro3: 7.0, devoir1: 7.5, devoir2: 7.0 },
  { id: "g-8-2", studentId: "std-08", subjectId: "mat-ang", periodId: "T1", interro1: 8.0, interro2: 7.0, interro3: 8.0, devoir1: 7.0, devoir2: 7.5 },
  { id: "g-8-3", studentId: "std-08", subjectId: "mat-hg", periodId: "T1", interro1: 7.5, interro2: 7.0, interro3: 7.5, devoir1: 7.0, devoir2: 8.0 },
  { id: "g-8-4", studentId: "std-08", subjectId: "mat-math", periodId: "T1", interro1: 6.5, interro2: 7.0, interro3: 6.5, devoir1: 7.0, devoir2: 6.5 },
  { id: "g-8-5", studentId: "std-08", subjectId: "mat-pct", periodId: "T1", interro1: 7.0, interro2: 6.5, interro3: 7.0, devoir1: 6.5, devoir2: 7.0 },
  { id: "g-8-6", studentId: "std-08", subjectId: "mat-svt", periodId: "T1", interro1: 7.5, interro2: 7.0, interro3: 7.5, devoir1: 7.0, devoir2: 7.5 },
  { id: "g-8-7", studentId: "std-08", subjectId: "mat-eps", periodId: "T1", interro1: 11.0, interro2: 11.0, interro3: 11.0, devoir1: 11.0, devoir2: 11.0 },
  { id: "g-8-8", studentId: "std-08", subjectId: "mat-dessin", periodId: "T1", interro1: 8.0, interro2: 8.0, interro3: 8.0, devoir1: 8.0, devoir2: 8.0 },
  { id: "g-8-9", studentId: "std-08", subjectId: "mat-tp", periodId: "T1", interro1: 8.0, interro2: 8.0, interro3: 8.0, devoir1: 8.0, devoir2: 8.0 },
  { id: "g-8-10", studentId: "std-08", subjectId: "mat-mel", periodId: "T1" },
  { id: "g-8-11", studentId: "std-08", subjectId: "mat-conduite", periodId: "T1", noteConduite: 10.0 },
];

/**
 * Traçabilité & Audit après publication
 */
export const MOCK_AUDIT_LOGS_MAP = new Map<string, BulletinAuditLog[]>([
  [
    "std-01",
    [
      {
        id: "aud-001",
        bulletinId: "blt-std-01-T1",
        date: "2026-10-13 14:22",
        authorName: "M. TOSSOU Koffi",
        authorRole: "enseignant",
        action: "RECTIFICATION_NOTE_APRES_PUBLICATION",
        subjectName: "Français",
        fieldName: "devoir2",
        previousValue: "15.00",
        newValue: "16.00",
        reason: "Rectification suite à recours légitime de l'apprenant : omission du barème de la dissertation.",
      },
    ],
  ],
]);

/**
 * Consultation des Devoirs à la maison
 */
export const MOCK_HOMEWORK_ITEMS: HomeworkItem[] = [
  {
    id: "hw-1",
    childId: "std-01",
    childName: "Koffi ADANHOUN",
    className: "3ème A",
    subject: "Mathématiques",
    teacher: "M. HOUNNOU E.",
    title: "Exercices 14 à 18 p. 45 (Théorème de Thalès)",
    description: "Démontrer le parallélisme des droites et calculer les longueurs des segments dans la figure 3.",
    assignedDate: "12 Octobre 2026",
    dueDate: "16 Octobre 2026",
    isCompleted: false,
  },
  {
    id: "hw-2",
    childId: "std-01",
    childName: "Koffi ADANHOUN",
    className: "3ème A",
    subject: "Français",
    teacher: "M. TOSSOU K.",
    title: "Commentaire composé sur L'Enfant Noir",
    description: "Rédiger l'introduction et le premier axe d'analyse du passage étudié en classe (pages 22-24).",
    assignedDate: "11 Octobre 2026",
    dueDate: "17 Octobre 2026",
    isCompleted: false,
  },
  {
    id: "hw-3",
    childId: "std-02",
    childName: "Amina ADANHOUN",
    className: "6ème B",
    subject: "Anglais",
    teacher: "Mme DOSSOU S.",
    title: "Workbook Unit 2 Exercises 1-4",
    description: "Compléter les phrases avec les pronoms possessifs et le présent simple.",
    assignedDate: "13 Octobre 2026",
    dueDate: "18 Octobre 2026",
    isCompleted: true,
  },
  {
    id: "hw-4",
    childId: "std-01",
    childName: "Koffi ADANHOUN",
    className: "3ème A",
    subject: "PCT",
    teacher: "M. GBEDO P.",
    title: "Rapport de manipulation TP n°2",
    description: "Tracer la courbe de la tension en fonction de l'intensité et calculer la résistance équivalente.",
    assignedDate: "10 Octobre 2026",
    dueDate: "15 Octobre 2026",
    isCompleted: true,
  },
];

/**
 * Dates d'évaluation & devoirs surveillés programmés
 */
export const MOCK_UPCOMING_EVALUATIONS: UpcomingEvaluation[] = [
  {
    id: "eval-1",
    childId: "std-01",
    childName: "Koffi ADANHOUN",
    className: "3ème A",
    subject: "Mathématiques",
    teacher: "M. HOUNNOU E.",
    type: "Devoir Surveillé",
    date: "19 Octobre 2026",
    startTime: "08h00",
    endTime: "10h00",
    coef: 3,
    room: "Salle 12",
    topics: "Calcul littéral, factorisation, racines carrées et propriété de Thalès.",
  },
  {
    id: "eval-2",
    childId: "std-01",
    childName: "Koffi ADANHOUN",
    className: "3ème A",
    subject: "Français",
    teacher: "M. TOSSOU K.",
    type: "Devoir Surveillé",
    date: "21 Octobre 2026",
    startTime: "08h00",
    endTime: "10h00",
    coef: 3,
    room: "Salle 12",
    topics: "Dissertation littéraire et questions de grammaire (subordonnées relatives).",
  },
  {
    id: "eval-3",
    childId: "std-01",
    childName: "Koffi ADANHOUN",
    className: "3ème A",
    subject: "Physique-Chimie (PCT)",
    teacher: "M. GBEDO P.",
    type: "Interrogation Écrite",
    date: "23 Octobre 2026",
    startTime: "10h15",
    endTime: "11h15",
    coef: 2,
    room: "Labo Sciences",
    topics: "Loi d'Ohm, puissance électrique et réactions acido-basiques.",
  },
  {
    id: "eval-4",
    childId: "std-02",
    childName: "Amina ADANHOUN",
    className: "6ème B",
    subject: "Sciences de la Vie et de la Terre (SVT)",
    teacher: "Mme KOUDJO F.",
    type: "Devoir Surveillé",
    date: "24 Octobre 2026",
    startTime: "09h00",
    endTime: "10h30",
    coef: 2,
    room: "Salle 05",
    topics: "La respiration chez les êtres vivants et les milieux de vie.",
  },
];

/**
 * Suivi des Absences et Retards uniquement (sans présences)
 */
export const MOCK_ABSENCE_RECORDS: AbsenceRecord[] = [
  {
    id: "abs-1",
    childId: "std-01",
    childName: "Koffi ADANHOUN",
    className: "3ème A",
    date: "12 Octobre 2026",
    timeSlot: "07h00 - 07h15",
    subject: "Français",
    teacher: "M. TOSSOU K.",
    type: "RETARD",
    duration: "15 min",
    isJustified: true,
    motif: "Embouteillage carrefour Cadjehoun suite à fortes pluies.",
  },
  {
    id: "abs-2",
    childId: "std-01",
    childName: "Koffi ADANHOUN",
    className: "3ème A",
    date: "07 Octobre 2026",
    timeSlot: "07h00 - 09h00",
    subject: "Mathématiques",
    teacher: "M. HOUNNOU E.",
    type: "ABSENCE",
    duration: "2 heures",
    isJustified: true,
    motif: "Consultation médicale au CNHU (Certificat médical déposé au censeur).",
    justificationDocument: "Certificat_Medical_CNHU_07102026.pdf",
  },
  {
    id: "abs-3",
    childId: "std-01",
    childName: "Koffi ADANHOUN",
    className: "3ème A",
    date: "25 Septembre 2026",
    timeSlot: "15h00 - 15h10",
    subject: "Histoire-Géographie",
    teacher: "M. BIO G.",
    type: "RETARD",
    duration: "10 min",
    isJustified: false,
    motif: "Arrivée tardive après la récréation.",
  },
];

/**
 * Profil du Parent
 */

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

export const MOCK_PRIMARY_BULLETIN_STUDENTS: StudentProfile[] = [
  {
    id: "prim-std-01",
    matricule: "EP-2026-0001",
    educMasterNumber: "EM-2026-11001-BJ",
    lastName: "HOUNNOU",
    firstName: "Ézéchiel",
    gender: "M",
    birthDate: "15 Janvier 2017",
    birthPlace: "Abomey-Calavi",
    classId: "ce2-b",
    className: "CE2 B",
    cycle: "PRIMAIRE",
    parentName: "M. Sylvain HOUNNOU",
    parentPhone: "+229 97 00 11 22",
    parentEmail: "sylvain.hounnou@gmail.com",
    status: "ACTIF",
  },
  {
    id: "prim-std-02",
    matricule: "EP-2026-0002",
    educMasterNumber: "EM-2026-11002-BJ",
    lastName: "TOSSOU",
    firstName: "Grâce",
    gender: "F",
    birthDate: "03 Mars 2017",
    birthPlace: "Cotonou",
    classId: "ce2-b",
    className: "CE2 B",
    cycle: "PRIMAIRE",
    parentName: "Mme Clarisse TOSSOU",
    parentPhone: "+229 95 11 22 33",
    parentEmail: "clarisse.tossou@yahoo.fr",
    status: "ACTIF",
  },
];

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
