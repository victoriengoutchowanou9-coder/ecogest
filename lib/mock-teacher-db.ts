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
  id: "tea-default",
  matricule: "—",
  fullName: "Enseignant",
  gender: "M",
  birthDate: "—",
  email: "—",
  phone: "—",
  speciality: "Générale",
  diploma: "—",
  grade: "—",
  hireDate: "—",
  address: "—",
  isMainTeacher: false,
  weeklyHours: 0,
  classesAssigned: [],
};

export const MOCK_TEACHER_TASKS: TeacherTask[] = [];

export const MOCK_DIRECTION_ANNOUNCEMENTS: DirectionAnnouncement[] = [];

export const MOCK_CAHIER_DE_TEXTES: CahierDeTexteEntry[] = [];

export const MOCK_TEACHER_BULLETIN_APPRECIATIONS: TeacherBulletinAppreciation[] = [];

export const MOCK_TEACHER_ATTENDANCE_SESSIONS: TeacherAttendanceSession[] = [];
