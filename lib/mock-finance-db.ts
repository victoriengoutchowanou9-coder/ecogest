export type PaymentMethod = "ESPECES";

export type TuitionStatus = "PAID" | "PARTIAL" | "LATE" | "UNPAID";

export type ExpenseCategory =
  | "Salaires"
  | "Fournitures"
  | "Loyer"
  | "Eau"
  | "Électricité"
  | "Internet"
  | "Entretien"
  | "Réparations"
  | "Transport"
  | "Matériel"
  | "Frais administratifs"
  | "Autres dépenses";

export type ExpenseStatus = "EN_ATTENTE" | "VALIDEE" | "PAYEE" | "ANNULEE";

export type PayrollStatus =
  | "BROUILLON"
  | "A_VALIDER"
  | "VALIDE"
  | "PAYE"
  | "PARTIELLEMENT_PAYE"
  | "IMPAYE";

export interface StudentTuitionRecord {
  id: string;
  studentId: string;
  matricule: string;
  firstName: string;
  lastName: string;
  gender: "M" | "F";
  classId: string;
  className: string;
  academicYearId: string;
  totalTuition: number;
  paidTuition: number;
  remainingTuition: number;
  tuitionStatus: TuitionStatus;
  lastPaymentDate?: string;
  lastReceiptNumber?: string;
  nextDueDate?: string;
}

export interface CashReceiptRecord {
  id: string;
  receiptNumber: string;
  date: string; // ISO string
  studentId: string;
  studentName: string;
  matricule: string;
  classId: string;
  className: string;
  academicYearId: string;
  amount: number;
  previousPaidAmount: number;
  remainingAfterPayment: number;
  paymentMethod: PaymentMethod;
  purpose: string;
  receivedBy: string;
  status: "VALIDATED" | "CANCELLED";
  transactionRef: string;
  notes?: string;
}

export interface ExpenseRecord {
  id: string;
  label: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  beneficiary: string;
  paymentMethod: PaymentMethod;
  transactionRef: string;
  attachmentName?: string;
  author: string;
  status: ExpenseStatus;
  academicYearId: string;
  validatedBy?: string;
  validatedAt?: string;
  paidAt?: string;
  paidBy?: string;
  salaryPayrollId?: string; // Linked salary to prevent double-counting in treasury
}

export interface StaffMember {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  roleTitle: string;
  contractType: "CDI" | "CDD" | "Vacataire";
  phone: string;
  email: string;
  baseSalary: number;
  primes: number;
  indemnities: number;
  deductions: number;
  netSalary: number; // baseSalary + primes + indemnities - deductions
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  roleTitle: string;
  matricule: string;
  month: string; // e.g. "Octobre 2026"
  academicYearId: string;
  baseSalary: number;
  primes: number;
  indemnities: number;
  deductions: number;
  netSalary: number;
  paidAmount: number;
  status: PayrollStatus;
  createdAt: string;
  createdBy: string;
  validatedAt?: string;
  validatedBy?: string;
  paidAt?: string;
  paidBy?: string;
  paymentMethod?: PaymentMethod;
  paymentRef?: string;
  linkedExpenseId?: string; // Links to expense category "Salaires" to prevent duplicate treasury exits
}

export interface TreasuryEntry {
  id: string;
  type: "ENTREE" | "SORTIE";
  category: string;
  label: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  reference: string;
  author: string;
  sourceType: "SCOLARITE" | "DEPENSE" | "SALAIRE";
  sourceId: string;
}

// Initial clean production datasets with standard Beninese educational defaults
export const INITIAL_STUDENTS_TUITION: StudentTuitionRecord[] = [
  {
    id: "st-001",
    studentId: "eleve-001",
    matricule: "ECO-2026-4801",
    firstName: "Marc",
    lastName: "AGBODJAN",
    gender: "M",
    classId: "cls-6a",
    className: "6ème A",
    academicYearId: "2026-2027",
    totalTuition: 150000,
    paidTuition: 100000,
    remainingTuition: 50000,
    tuitionStatus: "PARTIAL",
    lastPaymentDate: "2026-10-05T10:30:00.000Z",
    lastReceiptNumber: "RC-2026-0850",
    nextDueDate: "2026-11-15",
  },
  {
    id: "st-002",
    studentId: "eleve-002",
    matricule: "ECO-2026-4802",
    firstName: "Inès",
    lastName: "SOGLO",
    gender: "F",
    classId: "cls-6a",
    className: "6ème A",
    academicYearId: "2026-2027",
    totalTuition: 150000,
    paidTuition: 150000,
    remainingTuition: 0,
    tuitionStatus: "PAID",
    lastPaymentDate: "2026-09-28T14:15:00.000Z",
    lastReceiptNumber: "RC-2026-0845",
  },
  {
    id: "st-003",
    studentId: "eleve-003",
    matricule: "ECO-2026-4803",
    firstName: "Koffi",
    lastName: "AGBESSI",
    gender: "M",
    classId: "cls-3a",
    className: "3ème A",
    academicYearId: "2026-2027",
    totalTuition: 180000,
    paidTuition: 120000,
    remainingTuition: 60000,
    tuitionStatus: "PARTIAL",
    lastPaymentDate: "2026-10-02T11:00:00.000Z",
    lastReceiptNumber: "RC-2026-0849",
    nextDueDate: "2026-11-30",
  },
  {
    id: "st-004",
    studentId: "eleve-004",
    matricule: "ECO-2026-4804",
    firstName: "Aurélie",
    lastName: "MENSAH",
    gender: "F",
    classId: "cls-3a",
    className: "3ème A",
    academicYearId: "2026-2027",
    totalTuition: 180000,
    paidTuition: 180000,
    remainingTuition: 0,
    tuitionStatus: "PAID",
    lastPaymentDate: "2026-09-25T09:40:00.000Z",
    lastReceiptNumber: "RC-2026-0842",
  },
  {
    id: "st-005",
    studentId: "eleve-005",
    matricule: "ECO-2026-4805",
    firstName: "Farid",
    lastName: "KOUDOSSOU",
    gender: "M",
    classId: "cls-3a",
    className: "3ème A",
    academicYearId: "2026-2027",
    totalTuition: 180000,
    paidTuition: 0,
    remainingTuition: 180000,
    tuitionStatus: "LATE",
    nextDueDate: "2026-10-10",
  },
  {
    id: "st-006",
    studentId: "eleve-006",
    matricule: "ECO-2026-4806",
    firstName: "Bienvenu",
    lastName: "TOSSOU",
    gender: "M",
    classId: "cls-4b",
    className: "4ème B",
    academicYearId: "2026-2027",
    totalTuition: 160000,
    paidTuition: 80000,
    remainingTuition: 80000,
    tuitionStatus: "PARTIAL",
    lastPaymentDate: "2026-10-08T08:50:00.000Z",
    lastReceiptNumber: "RC-2026-0853",
    nextDueDate: "2026-12-05",
  },
  {
    id: "st-007",
    studentId: "eleve-007",
    matricule: "ECO-2026-4807",
    firstName: "Gloria",
    lastName: "HOUNTONDJI",
    gender: "F",
    classId: "cls-5a",
    className: "5ème A",
    academicYearId: "2026-2027",
    totalTuition: 150000,
    paidTuition: 0,
    remainingTuition: 150000,
    tuitionStatus: "UNPAID",
    nextDueDate: "2026-10-31",
  },
  {
    id: "st-008",
    studentId: "eleve-008",
    matricule: "ECO-2026-4808",
    firstName: "Jean-Eudes",
    lastName: "BOKO",
    gender: "M",
    classId: "cls-tc",
    className: "Terminale C",
    academicYearId: "2026-2027",
    totalTuition: 220000,
    paidTuition: 220000,
    remainingTuition: 0,
    tuitionStatus: "PAID",
    lastPaymentDate: "2026-09-20T16:00:00.000Z",
    lastReceiptNumber: "RC-2026-0839",
  },
];

export const INITIAL_CASH_RECEIPTS: CashReceiptRecord[] = [
  {
    id: "rec-001",
    receiptNumber: "RC-2026-0850",
    date: "2026-10-05T10:30:00.000Z",
    studentId: "eleve-001",
    studentName: "Marc AGBODJAN",
    matricule: "ECO-2026-4801",
    classId: "cls-6a",
    className: "6ème A",
    academicYearId: "2026-2027",
    amount: 100000,
    previousPaidAmount: 0,
    remainingAfterPayment: 50000,
    paymentMethod: "ESPECES",
    purpose: "Frais de scolarité - Tranches 1 & 2",
    receivedBy: "C. KPONOU (Comptable)",
    status: "VALIDATED",
    transactionRef: "ESP-2026-10-0850",
    notes: "Versement effectué en espèces au guichet",
  },
  {
    id: "rec-002",
    receiptNumber: "RC-2026-0845",
    date: "2026-09-28T14:15:00.000Z",
    studentId: "eleve-002",
    studentName: "Inès SOGLO",
    matricule: "ECO-2026-4802",
    classId: "cls-6a",
    className: "6ème A",
    academicYearId: "2026-2027",
    amount: 150000,
    previousPaidAmount: 0,
    remainingAfterPayment: 0,
    paymentMethod: "ESPECES",
    purpose: "Frais de scolarité - Paiement Intégral",
    receivedBy: "C. KPONOU (Comptable)",
    status: "VALIDATED",
    transactionRef: "ESP-2026-09-0845",
    notes: "Paiement soldé à la rentrée",
  },
  {
    id: "rec-003",
    receiptNumber: "RC-2026-0849",
    date: "2026-10-02T11:00:00.000Z",
    studentId: "eleve-003",
    studentName: "Koffi AGBESSI",
    matricule: "ECO-2026-4803",
    classId: "cls-3a",
    className: "3ème A",
    academicYearId: "2026-2027",
    amount: 120000,
    previousPaidAmount: 0,
    remainingAfterPayment: 60000,
    paymentMethod: "ESPECES",
    purpose: "Frais de scolarité - Tranches 1 & 2",
    receivedBy: "C. KPONOU (Comptable)",
    status: "VALIDATED",
    transactionRef: "ESP-2026-10-0849",
  },
  {
    id: "rec-004",
    receiptNumber: "RC-2026-0853",
    date: "2026-10-08T08:50:00.000Z",
    studentId: "eleve-006",
    studentName: "Bienvenu TOSSOU",
    matricule: "ECO-2026-4806",
    classId: "cls-4b",
    className: "4ème B",
    academicYearId: "2026-2027",
    amount: 80000,
    previousPaidAmount: 0,
    remainingAfterPayment: 80000,
    paymentMethod: "ESPECES",
    purpose: "Frais de scolarité - Tranche 1",
    receivedBy: "C. KPONOU (Comptable)",
    status: "VALIDATED",
    transactionRef: "ESP-2026-10-0853",
  },
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: "stf-001",
    matricule: "PERS-2026-01",
    firstName: "Père Rodrigue",
    lastName: "GNANVI",
    roleTitle: "Directeur de l'Établissement",
    contractType: "CDI",
    phone: "+229 97 00 11 22",
    email: "direction@ecogest.bj",
    baseSalary: 280000,
    primes: 40000,
    indemnities: 20000,
    deductions: 15000,
    netSalary: 325000,
  },
  {
    id: "stf-002",
    matricule: "PERS-2026-02",
    firstName: "Constant",
    lastName: "KPONOU",
    roleTitle: "Comptable & Gestionnaire de Caisse",
    contractType: "CDI",
    phone: "+229 96 11 22 33",
    email: "comptable@ecogest.bj",
    baseSalary: 220000,
    primes: 25000,
    indemnities: 15000,
    deductions: 10000,
    netSalary: 250000,
  },
  {
    id: "stf-003",
    matricule: "PERS-2026-03",
    firstName: "Bio",
    lastName: "KANHONOU",
    roleTitle: "Professeur de Mathématiques",
    contractType: "CDI",
    phone: "+229 95 22 33 44",
    email: "bkanhonou@ecogest.bj",
    baseSalary: 185000,
    primes: 20000,
    indemnities: 10000,
    deductions: 8000,
    netSalary: 207000,
  },
  {
    id: "stf-004",
    matricule: "PERS-2026-04",
    firstName: "Chantal",
    lastName: "DOSSOU",
    roleTitle: "Professeur de Français",
    contractType: "CDI",
    phone: "+229 94 33 44 55",
    email: "cdossou@ecogest.bj",
    baseSalary: 180000,
    primes: 20000,
    indemnities: 10000,
    deductions: 8000,
    netSalary: 202000,
  },
  {
    id: "stf-005",
    matricule: "PERS-2026-05",
    firstName: "Paul",
    lastName: "ASSOGBA",
    roleTitle: "Professeur de SVT",
    contractType: "CDD",
    phone: "+229 97 44 55 66",
    email: "passogba@ecogest.bj",
    baseSalary: 175000,
    primes: 15000,
    indemnities: 10000,
    deductions: 7000,
    netSalary: 193000,
  },
  {
    id: "stf-006",
    matricule: "PERS-2026-06",
    firstName: "Alice",
    lastName: "HOUENOU",
    roleTitle: "Secrétaire Pédagogique",
    contractType: "CDI",
    phone: "+229 96 55 66 77",
    email: "secretariat@ecogest.bj",
    baseSalary: 140000,
    primes: 15000,
    indemnities: 10000,
    deductions: 5000,
    netSalary: 160000,
  },
  {
    id: "stf-007",
    matricule: "PERS-2026-07",
    firstName: "Thomas",
    lastName: "KPADONOU",
    roleTitle: "Surveillant Général",
    contractType: "CDI",
    phone: "+229 95 66 77 88",
    email: "surveillant@ecogest.bj",
    baseSalary: 130000,
    primes: 10000,
    indemnities: 10000,
    deductions: 5000,
    netSalary: 145000,
  },
  {
    id: "stf-008",
    matricule: "PERS-2026-08",
    firstName: "Mathias",
    lastName: "ADANHO",
    roleTitle: "Agent de Sécurité & Entretien",
    contractType: "CDI",
    phone: "+229 94 77 88 99",
    email: "securite@ecogest.bj",
    baseSalary: 75000,
    primes: 5000,
    indemnities: 5000,
    deductions: 2000,
    netSalary: 83000,
  },
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: "exp-001",
    label: "Achat fournitures de rentrée & craies",
    category: "Fournitures",
    description: "Craies blanches et de couleur, rames de papier A4 pour examens, registres",
    amount: 145000,
    date: "2026-09-18T10:00:00.000Z",
    beneficiary: "Librairie Papeterie Notre Dame",
    paymentMethod: "ESPECES",
    transactionRef: "DEP-ESP-2026-001",
    author: "C. KPONOU (Comptable)",
    status: "PAYEE",
    academicYearId: "2026-2027",
    validatedBy: "Père Rodrigue GNANVI",
    validatedAt: "2026-09-18T11:00:00.000Z",
    paidAt: "2026-09-18T14:30:00.000Z",
    paidBy: "C. KPONOU (Comptable)",
  },
  {
    id: "exp-002",
    label: "Facture électricité SBEE - Septembre 2026",
    category: "Électricité",
    description: "Consommation électrique des salles de classe, bureaux et informatique",
    amount: 98500,
    date: "2026-10-04T09:00:00.000Z",
    beneficiary: "SBEE Agence Cotonou",
    paymentMethod: "ESPECES",
    transactionRef: "DEP-ESP-2026-002",
    author: "C. KPONOU (Comptable)",
    status: "PAYEE",
    academicYearId: "2026-2027",
    validatedBy: "Père Rodrigue GNANVI",
    validatedAt: "2026-10-04T10:30:00.000Z",
    paidAt: "2026-10-04T11:45:00.000Z",
    paidBy: "C. KPONOU (Comptable)",
  },
  {
    id: "exp-003",
    label: "Entretien et révision du photocopieur central",
    category: "Réparations",
    description: "Remplacement du tambour et recharge de toner noir haute capacité",
    amount: 65000,
    date: "2026-10-12T14:00:00.000Z",
    beneficiary: "Bénin Copieur Service",
    paymentMethod: "ESPECES",
    transactionRef: "DEP-ESP-2026-003",
    author: "C. KPONOU (Comptable)",
    status: "VALIDEE",
    academicYearId: "2026-2027",
    validatedBy: "Père Rodrigue GNANVI",
    validatedAt: "2026-10-12T15:20:00.000Z",
  },
  {
    id: "exp-004",
    label: "Abonnement Internet fibre école - Octobre 2026",
    category: "Internet",
    description: "Connexion haut débit pour administration et salle informatique",
    amount: 45000,
    date: "2026-10-15T08:30:00.000Z",
    beneficiary: "Celtiis Bénin",
    paymentMethod: "ESPECES",
    transactionRef: "DEP-ESP-2026-004",
    author: "C. KPONOU (Comptable)",
    status: "EN_ATTENTE",
    academicYearId: "2026-2027",
  },
];

export const INITIAL_PAYROLL: PayrollRecord[] = [
  {
    id: "pay-sep-001",
    staffId: "stf-001",
    staffName: "Père Rodrigue GNANVI",
    roleTitle: "Directeur de l'Établissement",
    matricule: "PERS-2026-01",
    month: "Septembre 2026",
    academicYearId: "2026-2027",
    baseSalary: 280000,
    primes: 40000,
    indemnities: 20000,
    deductions: 15000,
    netSalary: 325000,
    paidAmount: 325000,
    status: "PAYE",
    createdAt: "2026-09-25T08:00:00.000Z",
    createdBy: "C. KPONOU (Comptable)",
    validatedAt: "2026-09-26T10:00:00.000Z",
    validatedBy: "Père Rodrigue GNANVI",
    paidAt: "2026-09-28T16:00:00.000Z",
    paidBy: "C. KPONOU (Comptable)",
    paymentMethod: "ESPECES",
    paymentRef: "PAY-ESP-2026-001",
    linkedExpenseId: "exp-sal-sep-001",
  },
  {
    id: "pay-sep-002",
    staffId: "stf-002",
    staffName: "Constant KPONOU",
    roleTitle: "Comptable & Gestionnaire de Caisse",
    matricule: "PERS-2026-02",
    month: "Septembre 2026",
    academicYearId: "2026-2027",
    baseSalary: 220000,
    primes: 25000,
    indemnities: 15000,
    deductions: 10000,
    netSalary: 250000,
    paidAmount: 250000,
    status: "PAYE",
    createdAt: "2026-09-25T08:00:00.000Z",
    createdBy: "C. KPONOU (Comptable)",
    validatedAt: "2026-09-26T10:00:00.000Z",
    validatedBy: "Père Rodrigue GNANVI",
    paidAt: "2026-09-28T16:05:00.000Z",
    paidBy: "C. KPONOU (Comptable)",
    paymentMethod: "ESPECES",
    paymentRef: "PAY-ESP-2026-002",
    linkedExpenseId: "exp-sal-sep-002",
  },
  {
    id: "pay-sep-003",
    staffId: "stf-003",
    staffName: "Bio KANHONOU",
    roleTitle: "Professeur de Mathématiques",
    matricule: "PERS-2026-03",
    month: "Septembre 2026",
    academicYearId: "2026-2027",
    baseSalary: 185000,
    primes: 20000,
    indemnities: 10000,
    deductions: 8000,
    netSalary: 207000,
    paidAmount: 207000,
    status: "PAYE",
    createdAt: "2026-09-25T08:00:00.000Z",
    createdBy: "C. KPONOU (Comptable)",
    validatedAt: "2026-09-26T10:00:00.000Z",
    validatedBy: "Père Rodrigue GNANVI",
    paidAt: "2026-09-28T16:10:00.000Z",
    paidBy: "C. KPONOU (Comptable)",
    paymentMethod: "ESPECES",
    paymentRef: "PAY-ESP-2026-003",
    linkedExpenseId: "exp-sal-sep-003",
  },
  {
    id: "pay-oct-001",
    staffId: "stf-003",
    staffName: "Bio KANHONOU",
    roleTitle: "Professeur de Mathématiques",
    matricule: "PERS-2026-03",
    month: "Octobre 2026",
    academicYearId: "2026-2027",
    baseSalary: 185000,
    primes: 20000,
    indemnities: 10000,
    deductions: 8000,
    netSalary: 207000,
    paidAmount: 0,
    status: "VALIDE",
    createdAt: "2026-10-15T08:00:00.000Z",
    createdBy: "C. KPONOU (Comptable)",
    validatedAt: "2026-10-16T11:00:00.000Z",
    validatedBy: "Père Rodrigue GNANVI",
  },
  {
    id: "pay-oct-002",
    staffId: "stf-004",
    staffName: "Chantal DOSSOU",
    roleTitle: "Professeur de Français",
    matricule: "PERS-2026-04",
    month: "Octobre 2026",
    academicYearId: "2026-2027",
    baseSalary: 180000,
    primes: 20000,
    indemnities: 10000,
    deductions: 8000,
    netSalary: 202000,
    paidAmount: 0,
    status: "A_VALIDER",
    createdAt: "2026-10-15T08:00:00.000Z",
    createdBy: "C. KPONOU (Comptable)",
  },
];

