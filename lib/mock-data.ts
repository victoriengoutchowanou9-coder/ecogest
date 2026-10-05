export interface Student {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  classId: string;
  className: string;
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

export const MOCK_STUDENTS: Student[] = [
  {
    id: "std-01",
    matricule: "ECO-2026-0042",
    firstName: "Koffi",
    lastName: "ADANHOUN",
    classId: "3e-a",
    className: "3ème A",
    gender: "M",
    birthDate: "2011-04-12",
    parentName: "M. Marc ADANHOUN",
    parentPhone: "+229 97 12 34 56",
    status: "INSCRIT",
    average: 15.4,
    rank: 3,
    absencesCount: 2,
    totalTuition: 280000,
    paidTuition: 280000,
    remainingTuition: 0,
    tuitionStatus: "PAID",
  },
  {
    id: "std-02",
    matricule: "ECO-2026-0089",
    firstName: "Amina",
    lastName: "ADANHOUN",
    classId: "6e-b",
    className: "6ème B",
    gender: "F",
    birthDate: "2014-08-25",
    parentName: "M. Marc ADANHOUN",
    parentPhone: "+229 97 12 34 56",
    status: "INSCRIT",
    average: 16.8,
    rank: 1,
    absencesCount: 0,
    totalTuition: 220000,
    paidTuition: 150000,
    remainingTuition: 70000,
    tuitionStatus: "PARTIAL",
    nextDueDate: "2026-10-15",
  },
  {
    id: "std-03",
    matricule: "ECO-2026-0112",
    firstName: "Bio",
    lastName: "SOULEYMANE",
    classId: "tle-c",
    className: "Terminale C",
    gender: "M",
    birthDate: "2008-01-19",
    parentName: "Mme Fatima SOULEYMANE",
    parentPhone: "+229 96 44 88 12",
    status: "INSCRIT",
    average: 14.2,
    rank: 5,
    absencesCount: 4,
    totalTuition: 350000,
    paidTuition: 100000,
    remainingTuition: 250000,
    tuitionStatus: "LATE",
    nextDueDate: "2026-09-01",
  },
  {
    id: "std-04",
    matricule: "ECO-2026-0145",
    firstName: "Gloria",
    lastName: "AGBOSSA",
    classId: "1ere-d",
    className: "1ère D",
    gender: "F",
    birthDate: "2009-11-03",
    parentName: "M. Luc AGBOSSA",
    parentPhone: "+229 95 33 22 11",
    status: "INSCRIT",
    average: 12.7,
    rank: 12,
    absencesCount: 1,
    totalTuition: 320000,
    paidTuition: 0,
    remainingTuition: 320000,
    tuitionStatus: "UNPAID",
    nextDueDate: "2026-10-01",
  },
  {
    id: "std-05",
    matricule: "ECO-2026-0178",
    firstName: "Jean-Eudes",
    lastName: "DOSSOU",
    classId: "3e-a",
    className: "3ème A",
    gender: "M",
    birthDate: "2011-06-30",
    parentName: "Mme Clarisse DOSSOU",
    parentPhone: "+229 61 77 88 99",
    status: "INSCRIT",
    average: 13.9,
    rank: 8,
    absencesCount: 3,
    totalTuition: 280000,
    paidTuition: 180000,
    remainingTuition: 100000,
    tuitionStatus: "PARTIAL",
    nextDueDate: "2026-11-15",
  },
];

export const MOCK_RECEIPTS: PaymentReceipt[] = [
  {
    id: "rec-001",
    receiptNumber: "RC-2026-0842",
    date: "2026-09-24T10:30:00Z",
    studentId: "std-01",
    studentName: "Koffi ADANHOUN",
    matricule: "ECO-2026-0042",
    className: "3ème A",
    amount: 150000,
    paymentMethod: "MTN_MOMO",
    purpose: "Scolarité Tranche 1",
    receivedBy: "C. KPONOU (Comptable)",
    academicYear: "2026-2027",
    status: "VALIDATED",
    transactionRef: "MOMO-BJ-89342718",
  },
  {
    id: "rec-002",
    receiptNumber: "RC-2026-0843",
    date: "2026-09-25T14:15:00Z",
    studentId: "std-01",
    studentName: "Koffi ADANHOUN",
    matricule: "ECO-2026-0042",
    className: "3ème A",
    amount: 130000,
    paymentMethod: "ESPECES",
    purpose: "Scolarité Tranche 2",
    receivedBy: "C. KPONOU (Comptable)",
    academicYear: "2026-2027",
    status: "VALIDATED",
    transactionRef: "ESP-2026-09-0843",
  },
  {
    id: "rec-003",
    receiptNumber: "RC-2026-0844",
    date: "2026-09-26T09:00:00Z",
    studentId: "std-02",
    studentName: "Amina ADANHOUN",
    matricule: "ECO-2026-0089",
    className: "6ème B",
    amount: 150000,
    paymentMethod: "MOOV_MONEY",
    purpose: "Scolarité Tranche 1",
    receivedBy: "C. KPONOU (Comptable)",
    academicYear: "2026-2027",
    status: "VALIDATED",
    transactionRef: "MOOV-FLO-5519823",
  },
  {
    id: "rec-004",
    receiptNumber: "RC-2026-0845",
    date: "2026-09-27T11:45:00Z",
    studentId: "std-03",
    studentName: "Bio SOULEYMANE",
    matricule: "ECO-2026-0112",
    className: "Terminale C",
    amount: 100000,
    paymentMethod: "VIREMENT",
    purpose: "Frais d'inscription",
    receivedBy: "C. KPONOU (Comptable)",
    academicYear: "2026-2027",
    status: "VALIDATED",
    transactionRef: "VIR-BOA-2026-4431",
  },
];

export const MOCK_TEACHER_ATTENDANCES: TeacherAttendance[] = [
  {
    id: "att-001",
    teacherId: "prof-01",
    teacherName: "Prof. Justin HOUNKPONOU",
    subject: "Mathématiques",
    className: "Terminale C",
    date: "2026-09-28",
    scheduledTime: "08:00 - 10:00 (2h)",
    status: "PRESENT",
    arrivalHour: "07:52",
    departureHour: "10:05",
    hoursDone: 2,
    notes: "Cours conforme au syllabus",
  },
  {
    id: "att-002",
    teacherId: "prof-02",
    teacherName: "Mme Reine ZANNOU",
    subject: "Français",
    className: "3ème A",
    date: "2026-09-28",
    scheduledTime: "10:15 - 12:15 (2h)",
    status: "RETARD",
    arrivalHour: "10:35",
    departureHour: "12:15",
    hoursDone: 1.6,
    notes: "Retard de 20 min pour incident de circulation",
  },
  {
    id: "att-003",
    teacherId: "prof-03",
    teacherName: "M. Pamphile BIO",
    subject: "PCT",
    className: "1ère D",
    date: "2026-09-28",
    scheduledTime: "15:00 - 17:00 (2h)",
    status: "ABSENT",
    hoursDone: 0,
    notes: "Absence justifiée par motif médical",
  },
];

export const MOCK_GRADES_CLASS_3A: StudentGrade[] = [
  {
    id: "grd-01",
    studentId: "std-01",
    studentName: "Koffi ADANHOUN",
    matricule: "ECO-2026-0042",
    interro1: 16.5,
    interro2: 15.0,
    devoir1: 17.0,
    devoir2: 15.5,
    average: 16.0,
    status: "LOCKED",
  },
  {
    id: "grd-02",
    studentId: "std-05",
    studentName: "Jean-Eudes DOSSOU",
    matricule: "ECO-2026-0178",
    interro1: 13.0,
    interro2: 12.5,
    devoir1: 14.5,
    devoir2: 13.0,
    average: 13.25,
    status: "VALIDATED",
  },
  {
    id: "grd-03",
    studentId: "std-06",
    studentName: "Sandrine TOSSOU",
    matricule: "ECO-2026-0201",
    interro1: 11.0,
    interro2: 14.0,
    devoir1: 12.0,
    devoir2: null,
    average: 12.33,
    status: "DRAFT",
  },
  {
    id: "grd-04",
    studentId: "std-07",
    studentName: "Benoît AKAKPO",
    matricule: "ECO-2026-0202",
    interro1: 18.0,
    interro2: 17.5,
    devoir1: 19.0,
    devoir2: 18.0,
    average: 18.13,
    status: "DRAFT",
  },
];

export const MOCK_FINANCIAL_STATS = {
  totalExpected: 142500000,
  totalCollected: 98750000,
  totalRemaining: 43750000,
  collectionRate: 69.3,
  studentsCount: 520,
  paidCount: 310,
  partialCount: 160,
  unpaidCount: 50,
  monthlyTrend: [
    { month: "Juil", attendu: 25000000, encaisse: 24500000 },
    { month: "Août", attendu: 30000000, encaisse: 28000000 },
    { month: "Sept", attendu: 35000000, encaisse: 26500000 },
    { month: "Oct (prévu)", attendu: 20000000, encaisse: 10500000 },
    { month: "Nov (prévu)", attendu: 18000000, encaisse: 5500000 },
    { month: "Déc (prévu)", attendu: 14500000, encaisse: 3750000 },
  ],
};
