export interface TeacherProfile {
  id: string;
  matricule: string;
  fullName: string;
  gender: "M" | "F";
  birthDate: string;
  email: string;
  phone: string;
  speciality: string;
  diploma: string;
  grade: string;
  hireDate: string;
  address: string;
  isMainTeacher: boolean;
  mainClassName?: string;
  weeklyHours: number;
  classesAssigned: {
    classId: string;
    className: string;
    cycle?: "PRIMAIRE" | "SECONDAIRE";
    subject: string;
    coef: number;
    hoursPerWeek: number;
    studentsCount: number;
    isMain: boolean;
  }[];
}

export interface CahierDeTexteEntry {
  id: string;
  classId: string;
  className: string;
  subject: string;
  date: string;
  timeSlot: string;
  chapitre: string;
  titreLecon: string;
  objectifs: string;
  resumeContenu: string;
  exercicesAssignes?: string;
  exercicesDueDate?: string;
  prochaineEvaluation?: {
    type: string;
    date: string;
    topics: string;
  };
}

export interface TeacherBulletinAppreciation {
  studentId: string;
  studentName: string;
  matricule: string;
  className: string;
  subject: string;
  moyenne: number;
  rank: number;
  appreciation: string;
  isTransmitted: boolean;
  transmissionDate?: string;
}

export interface TeacherAttendanceSession {
  id: string;
  date: string;
  classId: string;
  className: string;
  subject: string;
  timeSlot: string;
  room: string;
  isCompleted: boolean;
  attendees: {
    studentId: string;
    studentName: string;
    matricule: string;
    status: "PRESENT" | "ABSENT" | "RETARD";
    arrivalTime?: string;
    motif?: string;
  }[];
}

export interface TeacherTask {
  id: string;
  title: string;
  description: string;
  priority: "HAUTE" | "MOYENNE" | "BASSE";
  dueDate: string;
  category: "NOTES" | "APPEL" | "BULLETINS" | "CAHIER_DE_TEXTES";
  link: string;
  isDone: boolean;
}

export interface DirectionAnnouncement {
  id: string;
  title: string;
  category: "DIRECTION" | "ECHEANCE" | "PEDAGOGIE";
  date: string;
  deadline?: string;
  author: string;
  content: string;
  priority: "URGENT" | "NORMAL";
  isRead: boolean;
}

export const MOCK_TEACHER_PROFILE: TeacherProfile = {
  id: "tea-01",
  matricule: "ENS-2026-MATH-042",
  fullName: "Prof. Justin HOUNKPONOU",
  gender: "M",
  birthDate: "14 Juin 1982",
  email: "justin.hounkponou@ecoduc.bj",
  phone: "+229 97 22 33 44",
  speciality: "Mathématiques & Informatique",
  diploma: "CAPES Mathématiques / Maîtrise ès Sciences",
  grade: "Professeur Certifié Hors Classe",
  hireDate: "01 Octobre 2012",
  address: "Quartier Ste Rita, Cotonou, Bénin",
  isMainTeacher: true,
  mainClassName: "3ème A",
  weeklyHours: 15,
  classesAssigned: [
    {
      classId: "3e-a",
      className: "3ème A",
      cycle: "SECONDAIRE",
      subject: "Mathématiques",
      coef: 3,
      hoursPerWeek: 4,
      studentsCount: 42,
      isMain: true,
    },
    {
      classId: "ce2-b",
      className: "CE2 B (Cycle Primaire)",
      cycle: "PRIMAIRE",
      subject: "Français & Mathématiques (Compétences)",
      coef: 1,
      hoursPerWeek: 12,
      studentsCount: 35,
      isMain: false,
    },
    {
      classId: "tle-c",
      className: "Terminale C",
      cycle: "SECONDAIRE",
      subject: "Mathématiques",
      coef: 5,
      hoursPerWeek: 6,
      studentsCount: 38,
      isMain: false,
    },
    {
      classId: "1ere-d",
      className: "1ère D",
      subject: "Mathématiques",
      coef: 4,
      hoursPerWeek: 5,
      studentsCount: 38,
      isMain: false,
    },
  ],
};

export const MOCK_TEACHER_TASKS: TeacherTask[] = [
  {
    id: "tsk-1",
    title: "Saisie des notes Devoir 2 - 3ème A",
    description: "14 copies restantes à reporter avant la clôture du censeur des études.",
    priority: "HAUTE",
    dueDate: "20 Octobre 2026",
    category: "NOTES",
    link: "/enseignant/notes",
    isDone: false,
  },
  {
    id: "tsk-2",
    title: "Pointer l'appel - Terminale C (10h15 - 12h15)",
    description: "Séance d'analyse numérique en Salle 08 non encore émargée.",
    priority: "HAUTE",
    dueDate: "Aujourd'hui 12:30",
    category: "APPEL",
    link: "/enseignant/presences",
    isDone: false,
  },
  {
    id: "tsk-3",
    title: "Rédiger les appréciations de bulletins - 3ème A",
    description: "42 appréciations individuelles à finaliser pour le conseil du 1er Trimestre.",
    priority: "MOYENNE",
    dueDate: "24 Octobre 2026",
    category: "BULLETINS",
    link: "/enseignant/bulletins",
    isDone: false,
  },
  {
    id: "tsk-4",
    title: "Renseigner le cahier de textes - 1ère D",
    description: "Ajouter la leçon n°4 sur le barycentre et les devoirs assignés.",
    priority: "MOYENNE",
    dueDate: "Demain 18:00",
    category: "CAHIER_DE_TEXTES",
    link: "/enseignant/cahier-de-textes",
    isDone: false,
  },
];

export const MOCK_CAHIER_DE_TEXTES: CahierDeTexteEntry[] = [
  {
    id: "cdt-1",
    classId: "3e-a",
    className: "3ème A",
    subject: "Mathématiques",
    date: "14 Octobre 2026",
    timeSlot: "08:00 - 10:00",
    chapitre: "Chapitre 3 : Théorème de Thalès et applications",
    titreLecon: "Configuration de Thalès dans le triangle et calculs de longueurs",
    objectifs: "Savoir identifier des droites parallèles coupées par deux sécantes et écrire les rapports égaux.",
    resumeContenu: "Rappel de la propriété directe de Thalès. Présentation de la figure clé papillon et triangle emboîté. Résolution commentée de l'exercice type 1 p. 48.",
    exercicesAssignes: "Exercices 14, 15 et 18 page 51 du manuel CIAM 3ème.",
    exercicesDueDate: "19 Octobre 2026",
    prochaineEvaluation: {
      type: "Interrogation Écrite n°3",
      date: "21 Octobre 2026",
      topics: "Théorème de Thalès et calculs de segments proportionnels.",
    },
  },
  {
    id: "cdt-2",
    classId: "tle-c",
    className: "Terminale C",
    subject: "Mathématiques",
    date: "13 Octobre 2026",
    timeSlot: "10:15 - 12:15",
    chapitre: "Chapitre 4 : Fonctions Logarithmes & Exponentielles",
    titreLecon: "Étude de la fonction logarithme népérien et dérivée logarithmique",
    objectifs: "Maîtriser les limites remarquables et les équations différentielles simples associées.",
    resumeContenu: "Propriétés algébriques de ln(x). Théorème de la bijection continue. Démonstration de lim(x->+inf) ln(x)/x = 0.",
    exercicesAssignes: "Problème 8 feuille de TD n°3 (Questions 1 à 4).",
    exercicesDueDate: "17 Octobre 2026",
  },
  {
    id: "cdt-3",
    classId: "1ere-d",
    className: "1ère D",
    subject: "Mathématiques",
    date: "12 Octobre 2026",
    timeSlot: "08:00 - 10:00",
    chapitre: "Chapitre 2 : Polynômes du second degré",
    titreLecon: "Signe du trinôme et inéquations du second degré",
    objectifs: "Savoir dresser le tableau de signes selon le signe du discriminant delta.",
    resumeContenu: "Cas delta > 0, delta = 0 et delta < 0. Démonstration du signe de a à l'extérieur des racines. Applications pratiques.",
    exercicesAssignes: "Exercices 9 et 12 p. 34.",
    exercicesDueDate: "15 Octobre 2026",
    prochaineEvaluation: {
      type: "Devoir Surveillé n°1",
      date: "23 Octobre 2026",
      topics: "Second degré, formes canoniques et factorisations.",
    },
  },
];

export const MOCK_DIRECTION_ANNOUNCEMENTS: DirectionAnnouncement[] = [
  {
    id: "ann-1",
    title: "Échéance officielle de transmission des notes du 1er Trimestre",
    category: "ECHEANCE",
    date: "14 Octobre 2026",
    deadline: "25 Octobre 2026 à 23h59",
    author: "M. le Censeur des Études",
    content: "Chers collègues, la plateforme sera verrouillée pour la génération des bulletins officiels le 25 Octobre. Merci de valider l'ensemble des 3 interrogations et 2 devoirs obligatoires avant cette date de rigueur.",
    priority: "URGENT",
    isRead: false,
  },
  {
    id: "ann-2",
    title: "Calendrier des Conseils de Classe du 1er Trimestre",
    category: "DIRECTION",
    date: "12 Octobre 2026",
    author: "Père Rodrigue GNANVI, Chef d'Établissement",
    content: "Les délibérations débuteront le lundi 27 Octobre selon le planning affiché en salle des professeurs. La présence de tous les professeurs titulaires est obligatoire.",
    priority: "NORMAL",
    isRead: false,
  },
  {
    id: "ann-3",
    title: "Animation Pédagogique Départementale (DDESTFP Littoral)",
    category: "PEDAGOGIE",
    date: "08 Octobre 2026",
    author: "Inspection Pédagogique de Mathématiques",
    content: "Rencontre d'harmonisation sur les nouvelles épreuves types BEPC et BAC série C au CEG Gbégamey le samedi 31 Octobre de 09h à 12h.",
    priority: "NORMAL",
    isRead: true,
  },
];
