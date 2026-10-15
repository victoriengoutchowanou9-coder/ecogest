"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  MOCK_BULLETIN_STUDENTS,
  MOCK_CLASSROOMS,
  MOCK_SUBJECTS,
  MOCK_TEACHERS,
} from "./mock-bulletin-db";
import { StudentProfile, SubjectConfig } from "./types/bulletin";

export interface TeacherCourseSchedule {
  id: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  dayOfWeek: "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi";
  timeSlot: string;
  room: string;
  status: "PROGRAMME" | "EN_COURS" | "TERMINE";
}

export interface StudentAssignmentHistory {
  id: string;
  studentId: string;
  studentName: string;
  matricule: string;
  previousClassId: string;
  previousClassName: string;
  newClassId: string;
  newClassName: string;
  date: string;
  author: string;
  reason: string;
}

export interface CenseurAttendanceItem {
  id: string;
  studentId: string;
  studentName: string;
  matricule: string;
  classId: string;
  className: string;
  date: string;
  sessionTime: string;
  subject: string;
  recordedByTeacher: string;
  status: "PRESENT" | "ABSENT" | "RETARD" | "ABS_JUSTIFIEE" | "ABS_NON_JUSTIFIEE";
  justificationNotes?: string;
  isConfirmedByCenseur: boolean;
}

export interface AttendanceAuditLog {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  time: string;
  previousStatus: string;
  newStatus: string;
  author: string;
  reason: string;
}

export interface HomeworkProgram {
  id: string;
  type: "DEVOIR" | "TD";
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherName: string;
  date: string;
  timeSlot: string;
  room: string;
  title: string;
  instructions: string;
  status: "PROGRAMME" | "EN_COURS" | "TERMINE" | "ANNULE";
}

export interface ParentMessageItem {
  id: string;
  parentName: string;
  parentPhone: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  time: string;
  subject: string;
  message: string;
  status: "NON_LU" | "LU" | "REPONDU";
  replyText?: string;
  repliedAt?: string;
  repliedBy?: string;
}

// 1. Matière enrichie pour la gestion pédagogique du Censeur
export interface CenseurSubjectItem {
  id: string;
  code: string;
  name: string;
  coef: number;
  category: "LITTÉRAIRE" | "SCIENTIFIQUE" | "AUTRE";
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  weeklyHours: number;
  isConduite?: boolean;
}

// 2. Fiche de compte enseignant
export interface CenseurTeacherAccount {
  id: string;
  name: string;
  identifier: string; // login / matricule
  email: string;
  phone: string;
  specialty: string;
  roleTitle: string;
  status: "ACTIF" | "INACTIF";
  assignedClasses: { classId: string; className: string }[];
  assignedSubjects: { subjectId: string; subjectName: string }[];
  allowedPermissions: string[]; // ex: "saisie_notes", "appel_presence", "cahier_textes", "bulletins"
  weeklyHours: number;
  createdAt: string;
}

// 3. Demande d'accès d'un parent à un enfant
export interface ParentChildAccessRequest {
  id: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  studentId: string;
  studentName: string;
  matricule: string;
  className: string;
  academicYear: string;
  requestDate: string;
  requestTime: string;
  status: "EN_ATTENTE" | "ACCEPTEE" | "REFUSEE";
  isAccessActivated: boolean;
  validatedBy?: string;
  validatedAt?: string;
  refusalReason?: string;
}

// Initial mock datasets
export const INITIAL_TEACHER_SCHEDULES: TeacherCourseSchedule[] = [
  { id: "sch-1", teacherId: "tea-4", teacherName: "Prof. Justin HOUNKPONOU", subjectId: "mat-math", subjectName: "Mathématiques", classId: "3e-a", className: "3ème A", dayOfWeek: "Lundi", timeSlot: "08:00 - 10:00", room: "Salle 12", status: "PROGRAMME" },
  { id: "sch-2", teacherId: "tea-1", teacherName: "M. TOSSOU Koffi", subjectId: "mat-fra", subjectName: "Français", classId: "3e-a", className: "3ème A", dayOfWeek: "Lundi", timeSlot: "10:15 - 12:15", room: "Salle 12", status: "PROGRAMME" },
  { id: "sch-3", teacherId: "tea-5", teacherName: "M. Pamphile BIO", subjectId: "mat-pct", subjectName: "Physique, Chimie & Tech.", classId: "3e-a", className: "3ème A", dayOfWeek: "Mardi", timeSlot: "08:00 - 10:00", room: "Labo Sciences", status: "PROGRAMME" },
  { id: "sch-4", teacherId: "tea-4", teacherName: "Prof. Justin HOUNKPONOU", subjectId: "mat-math", subjectName: "Mathématiques", classId: "tle-c", className: "Terminale C", dayOfWeek: "Mardi", timeSlot: "10:15 - 12:15", room: "Salle 08", status: "PROGRAMME" },
  { id: "sch-5", teacherId: "tea-2", teacherName: "Mme Sylvie DOSSOU", subjectId: "mat-ang", subjectName: "Anglais", classId: "3e-a", className: "3ème A", dayOfWeek: "Mercredi", timeSlot: "08:00 - 10:00", room: "Salle 12", status: "PROGRAMME" },
  { id: "sch-6", teacherId: "tea-6", teacherName: "Mme Reine ZANNOU", subjectId: "mat-svt", subjectName: "SVT", classId: "3e-a", className: "3ème A", dayOfWeek: "Mercredi", timeSlot: "10:15 - 12:15", room: "Salle 12", status: "PROGRAMME" },
  { id: "sch-7", teacherId: "tea-7", teacherName: "M. AKPOVI Julien", subjectId: "mat-eps", subjectName: "EPS", classId: "3e-a", className: "3ème A", dayOfWeek: "Jeudi", timeSlot: "15:00 - 17:00", room: "Terrain Principal", status: "PROGRAMME" },
  { id: "sch-8", teacherId: "tea-4", teacherName: "Prof. Justin HOUNKPONOU", subjectId: "mat-math", subjectName: "Mathématiques", classId: "1ere-d", className: "1ère D", dayOfWeek: "Vendredi", timeSlot: "08:00 - 10:00", room: "Salle 14", status: "PROGRAMME" },
];

export const INITIAL_HOMEWORK_PROGRAMS: HomeworkProgram[] = [
  {
    id: "hw-1",
    type: "DEVOIR",
    classId: "3e-a",
    className: "3ème A",
    subjectId: "mat-math",
    subjectName: "Mathématiques",
    teacherName: "Prof. Justin HOUNKPONOU",
    date: "2026-10-22",
    timeSlot: "08:00 - 10:00 (2h)",
    room: "Salle 12",
    title: "Devoir Surveillé n°2 du 1er Trimestre",
    instructions: "Calculatrices scientifiques autorisées. Matériel de géométrie obligatoire (règle, compas).",
    status: "PROGRAMME",
  },
  {
    id: "hw-2",
    type: "TD",
    classId: "3e-a",
    className: "3ème A",
    subjectId: "mat-pct",
    subjectName: "PCT",
    teacherName: "M. Pamphile BIO",
    date: "2026-10-18",
    timeSlot: "15:00 - 17:00 (2h)",
    room: "Labo Sciences",
    title: "Séance de Travaux Dirigés : Dosages et Électrolyse",
    instructions: "Apporter la blouse blanche obligatoire et le manuel d'expérimentation CIAM.",
    status: "PROGRAMME",
  },
  {
    id: "hw-3",
    type: "DEVOIR",
    classId: "tle-c",
    className: "Terminale C",
    subjectId: "mat-math",
    subjectName: "Mathématiques",
    teacherName: "Prof. Justin HOUNKPONOU",
    date: "2026-10-25",
    timeSlot: "08:00 - 12:00 (4h)",
    room: "Amphithéâtre",
    title: "Devoir Départemental Préparatoire au Baccalauréat",
    instructions: "Épreuve type Bac National Bénin. Aucun retardataire admis après 08h15.",
    status: "PROGRAMME",
  },
];

export const INITIAL_ATTENDANCE_ITEMS: CenseurAttendanceItem[] = [
  { id: "att-st-1", studentId: "std-01", studentName: "Koffi Parfait ADANHOUN", matricule: "ECO-2026-0042", classId: "3e-a", className: "3ème A", date: "2026-10-14", sessionTime: "08:00 - 10:00", subject: "Mathématiques", recordedByTeacher: "Prof. HOUNKPONOU", status: "PRESENT", isConfirmedByCenseur: true },
  { id: "att-st-2", studentId: "std-02", studentName: "Amina Victoire ADANHOUN", matricule: "ECO-2026-0089", classId: "3e-a", className: "3ème A", date: "2026-10-14", sessionTime: "08:00 - 10:00", subject: "Mathématiques", recordedByTeacher: "Prof. HOUNKPONOU", status: "PRESENT", isConfirmedByCenseur: true },
  { id: "att-st-3", studentId: "std-03", studentName: "Bio Rachid SOULEYMANE", matricule: "ECO-2026-0112", classId: "3e-a", className: "3ème A", date: "2026-10-14", sessionTime: "08:00 - 10:00", subject: "Mathématiques", recordedByTeacher: "Prof. HOUNKPONOU", status: "RETARD", justificationNotes: "Arrivé à 08h25 (incident de circulation)", isConfirmedByCenseur: false },
  { id: "att-st-4", studentId: "std-04", studentName: "Gloria Estelle AGBOSSA", matricule: "ECO-2026-0145", classId: "3e-a", className: "3ème A", date: "2026-10-14", sessionTime: "08:00 - 10:00", subject: "Mathématiques", recordedByTeacher: "Prof. HOUNKPONOU", status: "ABSENT", isConfirmedByCenseur: false },
  { id: "att-st-5", studentId: "std-05", studentName: "Fabrice Carlos DOSSOU", matricule: "ECO-2026-0182", classId: "3e-a", className: "3ème A", date: "2026-10-14", sessionTime: "08:00 - 10:00", subject: "Mathématiques", recordedByTeacher: "Prof. HOUNKPONOU", status: "PRESENT", isConfirmedByCenseur: true },
  { id: "att-st-6", studentId: "std-06", studentName: "Sèna Priscille HOUNTONDJI", matricule: "ECO-2026-0210", classId: "3e-a", className: "3ème A", date: "2026-10-14", sessionTime: "08:00 - 10:00", subject: "Mathématiques", recordedByTeacher: "Prof. HOUNKPONOU", status: "ABSENT", isConfirmedByCenseur: false },
  { id: "att-st-7", studentId: "std-07", studentName: "Rodrigue KANHONOU", matricule: "ECO-2026-0245", classId: "3e-a", className: "3ème A", date: "2026-10-14", sessionTime: "08:00 - 10:00", subject: "Mathématiques", recordedByTeacher: "Prof. HOUNKPONOU", status: "PRESENT", isConfirmedByCenseur: true },
  { id: "att-st-8", studentId: "std-08", studentName: "Chantal GOMEZ", matricule: "ECO-2026-0290", classId: "3e-a", className: "3ème A", date: "2026-10-14", sessionTime: "08:00 - 10:00", subject: "Mathématiques", recordedByTeacher: "Prof. HOUNKPONOU", status: "PRESENT", isConfirmedByCenseur: true },
];

export const INITIAL_PARENT_MESSAGES: ParentMessageItem[] = [
  {
    id: "msg-1",
    parentName: "M. Marc ADANHOUN",
    parentPhone: "+229 97 12 34 56",
    studentId: "std-01",
    studentName: "Koffi Parfait ADANHOUN",
    className: "3ème A",
    date: "14/10/2026",
    time: "07:30",
    subject: "Demande d'autorisation d'absence pour consultation ophtalmologique",
    message: "Bonjour M. le Censeur, je vous informe que mon fils Koffi devra s'absenter ce jeudi après-midi à partir de 15h pour son rendez-vous médical annuel. Le certificat sera déposé au censorat dès vendredi.",
    status: "REPONDU",
    replyText: "Bien reçu M. Adanhoun. L'absence est notée et justifiée dans le registre officiel des présences.",
    repliedAt: "14/10/2026 08:15",
    repliedBy: "Censeur des Études",
  },
  {
    id: "msg-2",
    parentName: "Mme Fatima SOULEYMANE",
    parentPhone: "+229 96 44 88 12",
    studentId: "std-03",
    studentName: "Bio Rachid SOULEYMANE",
    className: "3ème A",
    date: "13/10/2026",
    time: "18:20",
    subject: "Clarification sur l'horaire du Devoir Surveillé de Mathématiques",
    message: "Bonsoir M. le Censeur, Bio m'a parlé d'un devoir programmé jeudi prochain. Pourriez-vous me confirmer l'horaire et si une calculatrice spécifique est exigée ?",
    status: "LU",
  },
  {
    id: "msg-3",
    parentName: "M. Luc AGBOSSA",
    parentPhone: "+229 95 33 22 11",
    studentId: "std-04",
    studentName: "Gloria Estelle AGBOSSA",
    className: "3ème A",
    date: "14/10/2026",
    time: "08:10",
    subject: "Signaler une absence imprévue ce matin",
    message: "Bonjour la Direction des études, Gloria a une forte fièvre ce matin et nous l'emmenons au dispensaire. Elle ne pourra pas assister aux cours aujourd'hui.",
    status: "NON_LU",
  },
];

// Initial Censeur Subjects List
export const INITIAL_CENSEUR_SUBJECTS: CenseurSubjectItem[] = [
  { id: "sub-1", code: "FRA", name: "Français", coef: 3, category: "LITTÉRAIRE", classId: "3e-a", className: "3ème A", teacherId: "tea-1", teacherName: "M. TOSSOU Koffi", weeklyHours: 5 },
  { id: "sub-2", code: "ANG", name: "Anglais", coef: 2, category: "LITTÉRAIRE", classId: "3e-a", className: "3ème A", teacherId: "tea-2", teacherName: "Mme Sylvie DOSSOU", weeklyHours: 3 },
  { id: "sub-3", code: "HG", name: "Histoire-Géographie", coef: 2, category: "LITTÉRAIRE", classId: "3e-a", className: "3ème A", teacherId: "tea-3", teacherName: "M. BIO G.", weeklyHours: 3 },
  { id: "sub-4", code: "MATH", name: "Mathématiques", coef: 3, category: "SCIENTIFIQUE", classId: "3e-a", className: "3ème A", teacherId: "tea-4", teacherName: "Prof. Justin HOUNKPONOU", weeklyHours: 5 },
  { id: "sub-5", code: "PCT", name: "Physique, Chimie & Technologie", coef: 2, category: "SCIENTIFIQUE", classId: "3e-a", className: "3ème A", teacherId: "tea-5", teacherName: "M. Pamphile BIO", weeklyHours: 4 },
  { id: "sub-6", code: "SVT", name: "Sciences de la Vie et de la Terre", coef: 2, category: "SCIENTIFIQUE", classId: "3e-a", className: "3ème A", teacherId: "tea-6", teacherName: "Mme Reine ZANNOU", weeklyHours: 3 },
  { id: "sub-7", code: "EPS", name: "Éducation Physique et Sportive", coef: 1, category: "AUTRE", classId: "3e-a", className: "3ème A", teacherId: "tea-7", teacherName: "M. AKPOVI Julien", weeklyHours: 2 },
  { id: "sub-8", code: "DESS", name: "Dessin & Arts Plastiques", coef: 1, category: "AUTRE", classId: "3e-a", className: "3ème A", teacherId: "tea-8", teacherName: "Mme ZANNOU M.", weeklyHours: 2 },
  { id: "sub-9", code: "TP", name: "Travaux Pratiques / Tech.", coef: 1, category: "AUTRE", classId: "3e-a", className: "3ème A", teacherId: "tea-9", teacherName: "M. HOUNSOU D.", weeklyHours: 2 },
  { id: "sub-10", code: "COND", name: "Conduite & Assiduité", coef: 1, category: "AUTRE", classId: "3e-a", className: "3ème A", teacherId: "tea-1", teacherName: "M. TOSSOU Koffi", weeklyHours: 1, isConduite: true },
  { id: "sub-11", code: "MATH", name: "Mathématiques", coef: 6, category: "SCIENTIFIQUE", classId: "tle-c", className: "Terminale C", teacherId: "tea-4", teacherName: "Prof. Justin HOUNKPONOU", weeklyHours: 6 },
  { id: "sub-12", code: "PCT", name: "Physique-Chimie", coef: 5, category: "SCIENTIFIQUE", classId: "tle-c", className: "Terminale C", teacherId: "tea-5", teacherName: "M. Pamphile BIO", weeklyHours: 6 },
];

// Initial Teacher Accounts List
export const INITIAL_TEACHER_ACCOUNTS: CenseurTeacherAccount[] = [
  {
    id: "tea-4",
    name: "Prof. Justin HOUNKPONOU",
    identifier: "jhounkponou",
    email: "justin.hounkponou@educogest.bj",
    phone: "+229 97 11 22 33",
    specialty: "Mathématiques",
    roleTitle: "Professeur Titulaire",
    status: "ACTIF",
    assignedClasses: [
      { classId: "3e-a", className: "3ème A" },
      { classId: "tle-c", className: "Terminale C" },
      { classId: "1ere-d", className: "1ère D" },
    ],
    assignedSubjects: [
      { subjectId: "sub-4", subjectName: "Mathématiques" },
      { subjectId: "sub-11", subjectName: "Mathématiques Tle" },
    ],
    allowedPermissions: ["saisie_notes", "appel_presence", "cahier_textes", "bulletins"],
    weeklyHours: 16,
    createdAt: "2026-09-01",
  },
  {
    id: "tea-1",
    name: "M. Koffi TOSSOU",
    identifier: "ktossou",
    email: "koffi.tossou@educogest.bj",
    phone: "+229 95 22 33 44",
    specialty: "Français",
    roleTitle: "Professeur Titulaire / Prof. Principal",
    status: "ACTIF",
    assignedClasses: [
      { classId: "3e-a", className: "3ème A" },
      { classId: "6e-b", className: "6ème B" },
    ],
    assignedSubjects: [
      { subjectId: "sub-1", subjectName: "Français" },
      { subjectId: "sub-10", subjectName: "Conduite" },
    ],
    allowedPermissions: ["saisie_notes", "appel_presence", "cahier_textes", "bulletins"],
    weeklyHours: 14,
    createdAt: "2026-09-01",
  },
  {
    id: "tea-2",
    name: "Mme Sylvie DOSSOU",
    identifier: "sdossou",
    email: "sylvie.dossou@educogest.bj",
    phone: "+229 94 33 44 55",
    specialty: "Anglais",
    roleTitle: "Professeur Certifié",
    status: "ACTIF",
    assignedClasses: [
      { classId: "3e-a", className: "3ème A" },
      { classId: "6e-b", className: "6ème B" },
    ],
    assignedSubjects: [{ subjectId: "sub-2", subjectName: "Anglais" }],
    allowedPermissions: ["saisie_notes", "appel_presence", "cahier_textes", "bulletins"],
    weeklyHours: 12,
    createdAt: "2026-09-02",
  },
  {
    id: "tea-5",
    name: "M. Pamphile BIO",
    identifier: "pbio",
    email: "pamphile.bio@educogest.bj",
    phone: "+229 96 44 55 66",
    specialty: "Physique, Chimie & Tech.",
    roleTitle: "Professeur Certifié",
    status: "ACTIF",
    assignedClasses: [
      { classId: "3e-a", className: "3ème A" },
      { classId: "tle-c", className: "Terminale C" },
    ],
    assignedSubjects: [
      { subjectId: "sub-5", subjectName: "Physique, Chimie & Technologie" },
      { subjectId: "sub-12", subjectName: "Physique-Chimie Tle" },
    ],
    allowedPermissions: ["saisie_notes", "appel_presence", "cahier_textes", "bulletins"],
    weeklyHours: 14,
    createdAt: "2026-09-02",
  },
  {
    id: "tea-6",
    name: "Mme Reine ZANNOU",
    identifier: "rzannou",
    email: "reine.zannou@educogest.bj",
    phone: "+229 97 55 66 77",
    specialty: "Sciences de la Vie et de la Terre",
    roleTitle: "Professeur Certifié",
    status: "ACTIF",
    assignedClasses: [{ classId: "3e-a", className: "3ème A" }],
    assignedSubjects: [{ subjectId: "sub-6", subjectName: "Sciences de la Vie et de la Terre" }],
    allowedPermissions: ["saisie_notes", "appel_presence", "cahier_textes"],
    weeklyHours: 10,
    createdAt: "2026-09-03",
  },
  {
    id: "tea-7",
    name: "M. Julien AKPOVI",
    identifier: "jakpovi",
    email: "julien.akpovi@educogest.bj",
    phone: "+229 95 66 77 88",
    specialty: "Éducation Physique et Sportive",
    roleTitle: "Éducateur Sportif",
    status: "ACTIF",
    assignedClasses: [
      { classId: "3e-a", className: "3ème A" },
      { classId: "6e-b", className: "6ème B" },
    ],
    assignedSubjects: [{ subjectId: "sub-7", subjectName: "EPS" }],
    allowedPermissions: ["saisie_notes", "appel_presence"],
    weeklyHours: 8,
    createdAt: "2026-09-03",
  },
];

// Initial Parent Child Access Requests
export const INITIAL_PARENT_ACCESS_REQUESTS: ParentChildAccessRequest[] = [
  {
    id: "req-1",
    parentId: "parent-001",
    parentName: "M. Marc ADANHOUN",
    parentPhone: "+229 97 12 34 56",
    parentEmail: "marc.adanhoun@gmail.com",
    studentId: "std-01",
    studentName: "Koffi Parfait ADANHOUN",
    matricule: "ECO-2026-0042",
    className: "3ème A",
    academicYear: "2026 - 2027",
    requestDate: "12/10/2026",
    requestTime: "09:30",
    status: "ACCEPTEE",
    isAccessActivated: true,
    validatedBy: "Censeur des Études",
    validatedAt: "12/10/2026 10:15",
  },
  {
    id: "req-2",
    parentId: "parent-001",
    parentName: "M. Marc ADANHOUN",
    parentPhone: "+229 97 12 34 56",
    parentEmail: "marc.adanhoun@gmail.com",
    studentId: "std-02",
    studentName: "Amina Victoire ADANHOUN",
    matricule: "ECO-2026-0089",
    className: "6ème B",
    academicYear: "2026 - 2027",
    requestDate: "12/10/2026",
    requestTime: "09:35",
    status: "ACCEPTEE",
    isAccessActivated: true,
    validatedBy: "Censeur des Études",
    validatedAt: "12/10/2026 10:15",
  },
  {
    id: "req-3",
    parentId: "parent-002",
    parentName: "Mme Fatima SOULEYMANE",
    parentPhone: "+229 96 44 88 12",
    parentEmail: "fatima.souleymane@yahoo.fr",
    studentId: "std-03",
    studentName: "Bio Rachid SOULEYMANE",
    matricule: "ECO-2026-0112",
    className: "3ème A",
    academicYear: "2026 - 2027",
    requestDate: "14/10/2026",
    requestTime: "08:45",
    status: "EN_ATTENTE",
    isAccessActivated: false,
  },
  {
    id: "req-4",
    parentId: "parent-003",
    parentName: "M. Luc AGBOSSA",
    parentPhone: "+229 95 33 22 11",
    parentEmail: "luc.agbossa@gmail.com",
    studentId: "std-04",
    studentName: "Gloria Estelle AGBOSSA",
    matricule: "ECO-2026-0145",
    className: "3ème A",
    academicYear: "2026 - 2027",
    requestDate: "14/10/2026",
    requestTime: "10:15",
    status: "EN_ATTENTE",
    isAccessActivated: false,
  },
];

const STORAGE_KEY_SCHEDULES = "educogest_censeur_schedules_v1";
const STORAGE_KEY_ASSIGNMENTS_HISTORY = "educogest_censeur_assign_hist_v1";
const STORAGE_KEY_ATTENDANCE = "educogest_censeur_attendance_v1";
const STORAGE_KEY_ATTENDANCE_AUDIT = "educogest_censeur_att_audit_v1";
const STORAGE_KEY_HOMEWORK = "educogest_censeur_homework_v1";
const STORAGE_KEY_MESSAGES = "educogest_censeur_messages_v1";
const STORAGE_KEY_STUDENTS = "educogest_censeur_students_v1";
const STORAGE_KEY_CENSEUR_SUBJECTS = "educogest_censeur_subjects_v1";
const STORAGE_KEY_TEACHER_ACCOUNTS = "educogest_censeur_teachers_v1";
const STORAGE_KEY_PARENT_REQUESTS = "educogest_censeur_parent_requests_v1";

const STORAGE_EVENT = "educogest_censeur_storage_update";
const BULLETIN_SUBJECTS_STORAGE_KEY = "educogest_bulletin_subjects_v2";
const BULLETIN_STORAGE_EVENT = "educogest_bulletin_storage_update";

function safeGetStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function safeSetStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

export function useCenseurStore() {
  const [schedules, setSchedules] = useState<TeacherCourseSchedule[]>(() =>
    safeGetStorage(STORAGE_KEY_SCHEDULES, INITIAL_TEACHER_SCHEDULES)
  );

  const [assignmentHistory, setAssignmentHistory] = useState<StudentAssignmentHistory[]>(() =>
    safeGetStorage(STORAGE_KEY_ASSIGNMENTS_HISTORY, [])
  );

  const [attendanceItems, setAttendanceItems] = useState<CenseurAttendanceItem[]>(() =>
    safeGetStorage(STORAGE_KEY_ATTENDANCE, INITIAL_ATTENDANCE_ITEMS)
  );

  const [attendanceAuditLogs, setAttendanceAuditLogs] = useState<AttendanceAuditLog[]>(() =>
    safeGetStorage(STORAGE_KEY_ATTENDANCE_AUDIT, [])
  );

  const [homeworkPrograms, setHomeworkPrograms] = useState<HomeworkProgram[]>(() =>
    safeGetStorage(STORAGE_KEY_HOMEWORK, INITIAL_HOMEWORK_PROGRAMS)
  );

  const [parentMessages, setParentMessages] = useState<ParentMessageItem[]>(() =>
    safeGetStorage(STORAGE_KEY_MESSAGES, INITIAL_PARENT_MESSAGES)
  );

  const [studentsList, setStudentsList] = useState<StudentProfile[]>(() =>
    safeGetStorage(STORAGE_KEY_STUDENTS, MOCK_BULLETIN_STUDENTS)
  );

  const [subjectsList, setSubjectsList] = useState<CenseurSubjectItem[]>(() =>
    safeGetStorage(STORAGE_KEY_CENSEUR_SUBJECTS, INITIAL_CENSEUR_SUBJECTS)
  );

  const [teacherAccounts, setTeacherAccounts] = useState<CenseurTeacherAccount[]>(() =>
    safeGetStorage(STORAGE_KEY_TEACHER_ACCOUNTS, INITIAL_TEACHER_ACCOUNTS)
  );

  const [parentAccessRequests, setParentAccessRequests] = useState<ParentChildAccessRequest[]>(() =>
    safeGetStorage(STORAGE_KEY_PARENT_REQUESTS, INITIAL_PARENT_ACCESS_REQUESTS)
  );

  useEffect(() => {
    const handleUpdate = () => {
      setSchedules(safeGetStorage(STORAGE_KEY_SCHEDULES, INITIAL_TEACHER_SCHEDULES));
      setAssignmentHistory(safeGetStorage(STORAGE_KEY_ASSIGNMENTS_HISTORY, []));
      setAttendanceItems(safeGetStorage(STORAGE_KEY_ATTENDANCE, INITIAL_ATTENDANCE_ITEMS));
      setAttendanceAuditLogs(safeGetStorage(STORAGE_KEY_ATTENDANCE_AUDIT, []));
      setHomeworkPrograms(safeGetStorage(STORAGE_KEY_HOMEWORK, INITIAL_HOMEWORK_PROGRAMS));
      setParentMessages(safeGetStorage(STORAGE_KEY_MESSAGES, INITIAL_PARENT_MESSAGES));
      setStudentsList(safeGetStorage(STORAGE_KEY_STUDENTS, MOCK_BULLETIN_STUDENTS));
      setSubjectsList(safeGetStorage(STORAGE_KEY_CENSEUR_SUBJECTS, INITIAL_CENSEUR_SUBJECTS));
      setTeacherAccounts(safeGetStorage(STORAGE_KEY_TEACHER_ACCOUNTS, INITIAL_TEACHER_ACCOUNTS));
      setParentAccessRequests(safeGetStorage(STORAGE_KEY_PARENT_REQUESTS, INITIAL_PARENT_ACCESS_REQUESTS));
    };

    window.addEventListener(STORAGE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(STORAGE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // 1. Move/Assign Student to a class with audit trail
  const moveStudentClass = useCallback(
    (
      studentId: string,
      newClassId: string,
      newClassName: string,
      reason: string = "Redéploiement pédagogique",
      author: string = "Censeur des Études"
    ) => {
      let prevClassId = "";
      let prevClassName = "";
      let studentName = "";
      let matricule = "";

      setStudentsList((prev) => {
        const next = prev.map((s) => {
          if (s.id === studentId) {
            prevClassId = s.classId;
            prevClassName = s.className;
            studentName = `${s.lastName} ${s.firstName}`;
            matricule = s.matricule;
            return { ...s, classId: newClassId, className: newClassName };
          }
          return s;
        });
        safeSetStorage(STORAGE_KEY_STUDENTS, next);
        return next;
      });

      if (prevClassId && prevClassId !== newClassId) {
        const log: StudentAssignmentHistory = {
          id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          studentId,
          studentName,
          matricule,
          previousClassId: prevClassId,
          previousClassName: prevClassName,
          newClassId,
          newClassName,
          date: new Date().toLocaleDateString("fr-FR"),
          author,
          reason,
        };

        setAssignmentHistory((prev) => {
          const next = [log, ...prev];
          safeSetStorage(STORAGE_KEY_ASSIGNMENTS_HISTORY, next);
          return next;
        });
      }
    },
    []
  );

  // 2. Modify & confirm student attendance status with mandatory audit log
  const updateAttendanceStatus = useCallback(
    (
      attendanceId: string,
      newStatus: CenseurAttendanceItem["status"],
      reason: string,
      author: string = "Censeur des Études"
    ) => {
      let studentId = "";
      let studentName = "";
      let className = "";
      let date = "";
      let previousStatus = "";

      setAttendanceItems((prev) => {
        const next = prev.map((item) => {
          if (item.id === attendanceId) {
            studentId = item.studentId;
            studentName = item.studentName;
            className = item.className;
            date = item.date;
            previousStatus = item.status;
            return {
              ...item,
              status: newStatus,
              isConfirmedByCenseur: true,
              justificationNotes: reason || item.justificationNotes,
            };
          }
          return item;
        });
        safeSetStorage(STORAGE_KEY_ATTENDANCE, next);
        return next;
      });

      if (previousStatus && previousStatus !== newStatus) {
        const auditLog: AttendanceAuditLog = {
          id: `att-aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          studentId,
          studentName,
          className,
          date,
          time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          previousStatus,
          newStatus,
          author,
          reason: reason || "Régularisation administrative du Censeur",
        };

        setAttendanceAuditLogs((prev) => {
          const next = [auditLog, ...prev];
          safeSetStorage(STORAGE_KEY_ATTENDANCE_AUDIT, next);
          return next;
        });
      }
    },
    []
  );

  // Confirm attendance without modifying
  const confirmAttendance = useCallback((attendanceId: string) => {
    setAttendanceItems((prev) => {
      const next = prev.map((item) =>
        item.id === attendanceId ? { ...item, isConfirmedByCenseur: true } : item
      );
      safeSetStorage(STORAGE_KEY_ATTENDANCE, next);
      return next;
    });
  }, []);

  // 3. Add or update Homework / TD Program
  const addHomeworkProgram = useCallback((program: Omit<HomeworkProgram, "id">) => {
    const newItem: HomeworkProgram = {
      ...program,
      id: `hw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setHomeworkPrograms((prev) => {
      const next = [newItem, ...prev];
      safeSetStorage(STORAGE_KEY_HOMEWORK, next);
      return next;
    });
  }, []);

  const updateHomeworkStatus = useCallback((id: string, status: HomeworkProgram["status"]) => {
    setHomeworkPrograms((prev) => {
      const next = prev.map((h) => (h.id === id ? { ...h, status } : h));
      safeSetStorage(STORAGE_KEY_HOMEWORK, next);
      return next;
    });
  }, []);

  // 4. Reply to parent message
  const replyToParentMessage = useCallback(
    (messageId: string, replyText: string, repliedBy: string = "Censeur des Études") => {
      setParentMessages((prev) => {
        const next = prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                status: "REPONDU" as const,
                replyText,
                repliedAt: `${new Date().toLocaleDateString("fr-FR")} ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
                repliedBy,
              }
            : m
        );
        safeSetStorage(STORAGE_KEY_MESSAGES, next);
        return next;
      });
    },
    []
  );

  const markMessageAsRead = useCallback((messageId: string) => {
    setParentMessages((prev) => {
      const next = prev.map((m) =>
        m.id === messageId && m.status === "NON_LU" ? { ...m, status: "LU" as const } : m
      );
      safeSetStorage(STORAGE_KEY_MESSAGES, next);
      return next;
    });
  }, []);

  // 5. SUBJECTS MANAGEMENT (GESTION DES MATIÈRES)
  const addSubject = useCallback((subject: Omit<CenseurSubjectItem, "id">) => {
    const newSub: CenseurSubjectItem = {
      ...subject,
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setSubjectsList((prev) => {
      const next = [newSub, ...prev];
      safeSetStorage(STORAGE_KEY_CENSEUR_SUBJECTS, next);
      return next;
    });

    // Also synchronize into bulletin subjects store if relevant
    try {
      const currentBulletinSubs = safeGetStorage<SubjectConfig[]>(BULLETIN_SUBJECTS_STORAGE_KEY, MOCK_SUBJECTS);
      const exists = currentBulletinSubs.some((s) => s.code.toLowerCase() === newSub.code.toLowerCase());
      if (!exists) {
        const newBulletinSub: SubjectConfig = {
          id: `mat-${newSub.code.toLowerCase()}`,
          code: newSub.code,
          name: newSub.name,
          coef: newSub.coef,
          category: newSub.category,
          order: currentBulletinSubs.length + 1,
          isConduite: newSub.isConduite,
        };
        const updated = [...currentBulletinSubs, newBulletinSub];
        if (typeof window !== "undefined") {
          localStorage.setItem(BULLETIN_SUBJECTS_STORAGE_KEY, JSON.stringify(updated));
          window.dispatchEvent(new Event(BULLETIN_STORAGE_EVENT));
        }
      }
    } catch (e) {
      console.error("Error syncing bulletin subjects:", e);
    }
  }, []);

  const updateSubject = useCallback((id: string, updates: Partial<CenseurSubjectItem>) => {
    let updatedCode = "";
    let updatedCoef = 0;

    setSubjectsList((prev) => {
      const next = prev.map((s) => {
        if (s.id === id) {
          const res = { ...s, ...updates };
          updatedCode = res.code;
          updatedCoef = res.coef;
          return res;
        }
        return s;
      });
      safeSetStorage(STORAGE_KEY_CENSEUR_SUBJECTS, next);
      return next;
    });

    // Sync coefficient with bulletin store
    if (updates.coef && updatedCode) {
      try {
        const currentBulletinSubs = safeGetStorage<SubjectConfig[]>(BULLETIN_SUBJECTS_STORAGE_KEY, MOCK_SUBJECTS);
        const updated = currentBulletinSubs.map((s) => {
          if (s.code.toLowerCase() === updatedCode.toLowerCase()) {
            return { ...s, coef: updates.coef! };
          }
          return s;
        });
        if (typeof window !== "undefined") {
          localStorage.setItem(BULLETIN_SUBJECTS_STORAGE_KEY, JSON.stringify(updated));
          window.dispatchEvent(new Event(BULLETIN_STORAGE_EVENT));
        }
      } catch (e) {
        console.error("Error syncing coef with bulletin store:", e);
      }
    }
  }, []);

  // 6. TEACHER ACCOUNTS MANAGEMENT
  const createTeacherAccount = useCallback(
    (teacher: Omit<CenseurTeacherAccount, "id" | "createdAt">) => {
      const newTeacher: CenseurTeacherAccount = {
        ...teacher,
        id: `tea-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setTeacherAccounts((prev) => {
        const next = [newTeacher, ...prev];
        safeSetStorage(STORAGE_KEY_TEACHER_ACCOUNTS, next);
        return next;
      });
      return newTeacher;
    },
    []
  );

  const updateTeacherAccount = useCallback((id: string, updates: Partial<CenseurTeacherAccount>) => {
    setTeacherAccounts((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      safeSetStorage(STORAGE_KEY_TEACHER_ACCOUNTS, next);
      return next;
    });
  }, []);

  // 7. PARENT CHILD ACCESS REQUESTS & VALIDATION
  const submitParentAccessRequest = useCallback(
    (
      data: Omit<
        ParentChildAccessRequest,
        "id" | "requestDate" | "requestTime" | "status" | "isAccessActivated"
      >
    ) => {
      const newRequest: ParentChildAccessRequest = {
        ...data,
        id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        requestDate: new Date().toLocaleDateString("fr-FR"),
        requestTime: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        status: "EN_ATTENTE",
        isAccessActivated: false,
      };

      setParentAccessRequests((prev) => {
        const next = [newRequest, ...prev];
        safeSetStorage(STORAGE_KEY_PARENT_REQUESTS, next);
        return next;
      });
      return newRequest;
    },
    []
  );

  const validateParentAccessRequest = useCallback(
    (
      requestId: string,
      approved: boolean,
      activateAccess: boolean = true,
      reason?: string,
      validator: string = "Censeur des Études"
    ) => {
      setParentAccessRequests((prev) => {
        const next = prev.map((req) => {
          if (req.id === requestId) {
            return {
              ...req,
              status: (approved ? "ACCEPTEE" : "REFUSEE") as "ACCEPTEE" | "REFUSEE",
              isAccessActivated: approved ? activateAccess : false,
              validatedBy: validator,
              validatedAt: `${new Date().toLocaleDateString("fr-FR")} ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
              refusalReason: approved ? undefined : reason || "Demande non conforme aux dossiers d'inscription",
            };
          }
          return req;
        });
        safeSetStorage(STORAGE_KEY_PARENT_REQUESTS, next);
        return next;
      });
    },
    []
  );

  const toggleChildAccessActivation = useCallback((requestId: string, activate: boolean) => {
    setParentAccessRequests((prev) => {
      const next = prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            isAccessActivated: activate,
            status: (activate ? "ACCEPTEE" : req.status) as ParentChildAccessRequest["status"],
          };
        }
        return req;
      });
      safeSetStorage(STORAGE_KEY_PARENT_REQUESTS, next);
      return next;
    });
  }, []);

  // Helper: get authorized children for a parent
  const getAuthorizedChildrenForParent = useCallback(
    (parentIdOrPhone: string) => {
      const activeRequests = parentAccessRequests.filter(
        (r) =>
          (r.parentId === parentIdOrPhone || r.parentPhone === parentIdOrPhone) &&
          r.status === "ACCEPTEE" &&
          r.isAccessActivated
      );

      const activeStudentIds = new Set(activeRequests.map((r) => r.studentId));
      return studentsList.filter((s) => activeStudentIds.has(s.id));
    },
    [parentAccessRequests, studentsList]
  );

  return {
    schedules,
    assignmentHistory,
    attendanceItems,
    attendanceAuditLogs,
    homeworkPrograms,
    parentMessages,
    studentsList,
    subjectsList,
    teacherAccounts,
    parentAccessRequests,
    classrooms: MOCK_CLASSROOMS,
    subjects: MOCK_SUBJECTS,
    teachers: MOCK_TEACHERS,
    moveStudentClass,
    updateAttendanceStatus,
    confirmAttendance,
    addHomeworkProgram,
    updateHomeworkStatus,
    replyToParentMessage,
    markMessageAsRead,
    addSubject,
    updateSubject,
    createTeacherAccount,
    updateTeacherAccount,
    submitParentAccessRequest,
    validateParentAccessRequest,
    toggleChildAccessActivation,
    getAuthorizedChildrenForParent,
  };
}
