export type SubjectCategory = "LITTÉRAIRE" | "SCIENTIFIQUE" | "AUTRE";

export type EvaluationGrade = number | "ABS" | "ABS_NJ" | null;

export type BulletinStatus =
  | "BROUILLON"
  | "EN_VERIFICATION"
  | "VALIDE"
  | "PUBLIE"
  | "MODIFIE_APRES_PUBLICATION";

export interface BulletinAuditLog {
  id: string;
  bulletinId: string;
  date: string;
  authorName: string;
  authorRole: "enseignant" | "censeur" | "directeur" | "admin";
  action: string;
  subjectName?: string;
  fieldName?: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
}

export interface SchoolSettings {
  id: string;
  name: string;
  ministry: string;
  republic: string;
  motto: string;
  district: string;
  postalBox: string;
  phoneNumbers: string;
  directorName: string;
  logoUrl?: string;
  platformName: string;
}

export type EducationCycle = "PRIMAIRE" | "SECONDAIRE";

export interface AcademicYear {
  id: string;
  label: string;
  isCurrent: boolean;
}

export interface AcademicPeriod {
  id: string;
  name: string;
  code: string;
  type: "TRIMESTRE" | "SEMESTRE";
  isCurrent: boolean;
}

export interface ClassRoom {
  id: string;
  name: string;
  cycle: EducationCycle;
  level: string;
  stream: string;
  size: number;
  mainTeacher: string;
  academicYearId: string;
}

export interface StudentProfile {
  id: string;
  matricule: string;
  educMasterNumber: string;
  lastName: string;
  firstName: string;
  gender: "M" | "F";
  birthDate: string;
  birthPlace: string;
  classId: string;
  className: string;
  cycle?: EducationCycle;
  parentName: string;
  parentPhone: string;
  photoUrl?: string;
}

export interface SubjectConfig {
  id: string;
  code: string;
  name: string;
  cycle?: EducationCycle;
  coef: number;
  category: SubjectCategory;
  isConduite?: boolean;
  order: number;
  stream?: string;
  customScale?: number; // e.g. 10 or 40, automatically converted to 20
}

/**
 * ─── CYCLE PRIMAIRE : Typages pour l'évaluation par compétences ─────────────
 */

export type CompetencyAcquisitionLevel = "A" | "ECA" | "NA" | "EXP";

export interface CompetencyLevelDefinition {
  code: CompetencyAcquisitionLevel; // "A" | "ECA" | "NA" | "EXP"
  label: string; // "Acquis", "En cours d'acquisition", "Non acquis", "Dépassé"
  shortLabel: string;
  badgeClass: string; // classes Tailwind (ex: bg-emerald-100 text-emerald-800)
  isAcquired: boolean;
}

export interface CompetencyDomain {
  id: string;
  code: string;
  name: string; // ex: "Français & Communication", "Mathématiques & Logique"
  description?: string;
  order: number;
  cycle: "PRIMAIRE";
}

export interface CompetencyItem {
  id: string;
  domainId: string;
  code: string;
  name: string; // ex: "Identifier les phonèmes et les graphèmes", "Poser et effectuer une addition"
  description?: string;
  targetLevel?: string; // "CI", "CP", "CE1", "CE2", "CM1", "CM2", "TOUS"
  order: number;
}

export interface CompetencyGradeRecord {
  id: string;
  studentId: string;
  competencyId: string;
  periodId: string;
  levelCode: string; // code dans CompetencyLevelDefinition ("A", "ECA", "NA", "EXP")
  noteSur10?: number | null; // note chiffrée facultative si l'établissement l'utilise
  teacherObservation?: string | null;
  assessedAt?: string;
}

export interface ComputedPrimaryCompetencyRow {
  competencyId: string;
  competencyName: string;
  domainId: string;
  domainName: string;
  levelCode: string | null;
  levelLabel: string;
  levelShortLabel: string;
  badgeClass: string;
  teacherObservation: string;
  noteSur10: number | null;
}

export interface ComputedPrimaryDomainGroup {
  domainId: string;
  domainName: string;
  competencies: ComputedPrimaryCompetencyRow[];
  acquisitionRate: number; // Taux de compétences acquises en %
  domainAppreciation?: string;
}

export interface ComputedPrimaryBulletin {
  id: string;
  cycle: "PRIMAIRE";
  student: StudentProfile;
  classRoom: ClassRoom;
  school: SchoolSettings;
  period: AcademicPeriod;
  academicYear: AcademicYear;
  domainGroups: ComputedPrimaryDomainGroup[];
  totalCompetencies: number;
  acquiredCount: number;
  inProgressCount: number;
  notAcquiredCount: number;
  overallAcquisitionRate: number; // en % (ex: 85%)
  hasGrades: boolean;
  averageNoteSur10: number | null;
  absencesCount: number;
  justifiedAbsencesCount: number;
  latenessCount: number;
  titulaireAppreciation: string;
  directorAppreciation?: string;
  barcodeValue: string;
  verificationUrl: string;
  status: BulletinStatus;
  version: number;
  publishedAt?: string;
  auditLogs: BulletinAuditLog[];
}

export interface TeacherInfo {
  id: string;
  name: string;
  subjectId?: string;
  title?: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  subjectId: string;
  periodId: string;
  // 3 cases d'interrogations
  interro1?: EvaluationGrade;
  interro2?: EvaluationGrade;
  interro3?: EvaluationGrade;
  // 2 cases de devoirs
  devoir1?: EvaluationGrade;
  devoir2?: EvaluationGrade;
  // Conduite directe
  noteConduite?: EvaluationGrade;
  teacherAppreciation?: string | null;
  isValidated?: boolean;
}

export interface ComputedSubjectRow {
  subjectId: string;
  subjectName: string;
  category: SubjectCategory;
  coef: number;
  isConduite: boolean;
  hasGrade: boolean;
  // 3 interros
  interro1: EvaluationGrade;
  interro2: EvaluationGrade;
  interro3: EvaluationGrade;
  moyInterro: number | null;
  // 2 devoirs
  devoir1: EvaluationGrade;
  devoir2: EvaluationGrade;
  moyenne20: number | null;
  noteCoef: number | null;
  rankInSubject: number | null;
  isExAequo: boolean;
  rankFormatted: string;
  appreciation: string;
  teacherName?: string;
}

export interface DecisionConseil {
  felicitation: boolean;
  encouragement: boolean;
  tableauHonneur: boolean;
  avertissement: boolean;
}

export interface ComputedBulletin {
  id: string;
  cycle?: EducationCycle;
  student: StudentProfile;
  classRoom: ClassRoom;
  school: SchoolSettings;
  period: AcademicPeriod;
  academicYear: AcademicYear;
  rows: ComputedSubjectRow[];
  totalCoef: number;
  totalNoteCoef: number;
  generalAverage: number;
  generalAverageInWords: string;
  rank: number;
  isRankExAequo: boolean;
  rankFormatted: string;
  mention: string;
  groupAverages: {
    litteraire: number | null;
    scientifique: number | null;
    autre: number | null;
  };
  classStats: {
    highestAvg: number;
    lowestAvg: number;
    classAvg: number;
    effectiveCount: number;
  };
  decisionConseil: DecisionConseil;
  titulaireAppreciation: string;
  barcodeValue: string;
  verificationUrl: string;
  status: BulletinStatus;
  version: number;
  publishedAt?: string;
  auditLogs: BulletinAuditLog[];
}

export interface HomeworkItem {
  id: string;
  childId: string;
  childName: string;
  className: string;
  subject: string;
  teacher: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  isCompleted: boolean;
}

export interface UpcomingEvaluation {
  id: string;
  childId: string;
  childName: string;
  className: string;
  subject: string;
  teacher: string;
  type: "Interrogation Écrite" | "Devoir Surveillé" | "Composition Trimestrielle";
  date: string;
  startTime: string;
  endTime: string;
  coef: number;
  room: string;
  topics: string;
}

export interface AbsenceRecord {
  id: string;
  childId: string;
  childName: string;
  className: string;
  date: string;
  timeSlot: string;
  subject: string;
  teacher: string;
  type: "ABSENCE" | "RETARD";
  duration: string; // e.g. "2 heures" or "15 min"
  isJustified: boolean;
  motif?: string;
  justificationDocument?: string;
}
