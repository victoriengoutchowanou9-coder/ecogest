export interface Student {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  classId: string;
  className: string;
  cycle?: "PRIMAIRE" | "SECONDAIRE";
  gender: "M" | "F";
  birthDate: string;
  parentName: string;
  parentPhone: string;
  status: "INSCRIT" | "EN_ATTENTE" | "ARCHIVE";
  average: number;
  rank: number;
  absencesCount: number;
  totalTuition: number;
  paidTuition: number;
  remainingTuition: number;
  tuitionStatus: "PAID" | "PARTIAL" | "UNPAID" | "LATE";
  nextDueDate?: string;
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  date: string;
  studentId: string;
  studentName: string;
  matricule: string;
  className: string;
  amount: number;
  paymentMethod: "MOOV_MONEY" | "MTN_MOMO" | "ESPECES" | "VIREMENT" | "CHEQUE";
  purpose: "Scolarité Tranche 1" | "Scolarité Tranche 2" | "Scolarité Tranche 3" | "Frais d'inscription" | "Cantine" | "Transport";
  receivedBy: string;
  academicYear: string;
  status: "VALIDATED" | "CANCELLED";
  transactionRef: string;
}

export interface TeacherAttendance {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  className: string;
  date: string;
  scheduledTime: string;
  status: "PRESENT" | "ABSENT" | "RETARD" | "DISPENSE";
  arrivalHour?: string;
  departureHour?: string;
  hoursDone: number;
  notes?: string;
}

export interface StudentGrade {
  id: string;
  studentId: string;
  studentName: string;
  matricule: string;
  interro1: number | null;
  interro2: number | null;
  devoir1: number | null;
  devoir2: number | null;
  average: number | null;
  status: "DRAFT" | "VALIDATED" | "LOCKED";
}

export const MOCK_STUDENTS: Student[] = [];

export const MOCK_RECEIPTS: PaymentReceipt[] = [];

export const MOCK_TEACHER_ATTENDANCES: TeacherAttendance[] = [];

export const MOCK_GRADES_CLASS_3A: StudentGrade[] = [];

export const MOCK_FINANCIAL_STATS = {
  totalExpected: 0,
  totalCollected: 0,
  totalRemaining: 0,
  collectionRate: 0,
  studentsCount: 0,
  paidCount: 0,
  partialCount: 0,
  unpaidCount: 0,
  monthlyTrend: [],
};
