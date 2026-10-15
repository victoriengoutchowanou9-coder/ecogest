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

// Initial mock data
export const INITIAL_STUDENTS_TUITION: StudentTuitionRecord[] = [
  {
    id: "st-01",
    studentId: "std-01",
    matricule: "ECO-2026-0042",
    firstName: "Koffi",
    lastName: "ADANHOUN",
    gender: "M",
    classId: "3e-a",
    className: "3ème A",
    academicYearId: "2026-2027",
    totalTuition: 280000,
    paidTuition: 280000,
    remainingTuition: 0,
    tuitionStatus: "PAID",
    lastPaymentDate: "2026-09-25T14:15:00Z",
    lastReceiptNumber: "RC-2026-0843",
  },
  {
    id: "st-02",
    studentId: "std-02",
    matricule: "ECO-2026-0089",
    firstName: "Amina",
    lastName: "ADANHOUN",
    gender: "F",
    classId: "3e-a",
    className: "3ème A",
    academicYearId: "2026-2027",
    totalTuition: 280000,
    paidTuition: 180000,
    remainingTuition: 100000,
    tuitionStatus: "PARTIAL",
    lastPaymentDate: "2026-09-26T09:00:00Z",
    lastReceiptNumber: "RC-2026-0844",
    nextDueDate: "2026-10-25",
  },
  {
    id: "st-03",
    studentId: "std-03",
    matricule: "ECO-2026-0112",
    firstName: "Bio",
    lastName: "SOULEYMANE",
    gender: "M",
    classId: "3e-a",
    className: "3ème A",
    academicYearId: "2026-2027",
    totalTuition: 280000,
    paidTuition: 80000,
    remainingTuition: 200000,
    tuitionStatus: "LATE",
    lastPaymentDate: "2026-09-10T11:00:00Z",
    lastReceiptNumber: "RC-2026-0792",
    nextDueDate: "2026-09-30",
  },
  {
    id: "st-04",
    studentId: "std-04",
    matricule: "ECO-2026-0145",
    firstName: "Gloria",
    lastName: "AGBOSSA",
    gender: "F",
    classId: "3e-a",
    className: "3ème A",
    academicYearId: "2026-2027",
    totalTuition: 280000,
    paidTuition: 0,
    remainingTuition: 280000,
    tuitionStatus: "UNPAID",
    nextDueDate: "2026-10-15",
  },
  {
    id: "st-05",
    studentId: "std-05",
    matricule: "ECO-2026-0182",
    firstName: "Fabrice",
    lastName: "DOSSOU",
    gender: "M",
    classId: "3e-a",
    className: "3ème A",
    academicYearId: "2026-2027",
    totalTuition: 280000,
    paidTuition: 150000,
    remainingTuition: 130000,
    tuitionStatus: "PARTIAL",
    lastPaymentDate: "2026-10-02T10:20:00Z",
    lastReceiptNumber: "RC-2026-0855",
    nextDueDate: "2026-11-15",
  },
  {
    id: "st-06",
    studentId: "std-06",
    matricule: "ECO-2026-0210",
    firstName: "Sèna",
    lastName: "HOUNTONDJI",
    gender: "F",
    classId: "3e-a",
    className: "3ème A",
    academicYearId: "2026-2027",
    totalTuition: 280000,
    paidTuition: 280000,
    remainingTuition: 0,
    tuitionStatus: "PAID",
    lastPaymentDate: "2026-09-28T16:00:00Z",
    lastReceiptNumber: "RC-2026-0849",
  },
  {
    id: "st-07",
    studentId: "std-07",
    matricule: "ECO-2026-0245",
    firstName: "Rodrigue",
    lastName: "KANHONOU",
    gender: "M",
    classId: "tle-c",
    className: "Terminale C",
    academicYearId: "2026-2027",
    totalTuition: 350000,
    paidTuition: 200000,
    remainingTuition: 150000,
    tuitionStatus: "PARTIAL",
    lastPaymentDate: "2026-09-18T10:00:00Z",
    lastReceiptNumber: "RC-2026-0810",
    nextDueDate: "2026-10-30",
  },
  {
    id: "st-08",
    studentId: "std-08",
    matricule: "ECO-2026-0290",
    firstName: "Chantal",
    lastName: "GOMEZ",
    gender: "F",
    classId: "tle-c",
    className: "Terminale C",
    academicYearId: "2026-2027",
    totalTuition: 350000,
    paidTuition: 350000,
    remainingTuition: 0,
    tuitionStatus: "PAID",
    lastPaymentDate: "2026-09-15T09:30:00Z",
    lastReceiptNumber: "RC-2026-0802",
  },
  {
    id: "st-09",
    studentId: "std-09",
    matricule: "ECO-2026-0315",
    firstName: "Arsène",
    lastName: "MENSAH",
    gender: "M",
    classId: "tle-c",
    className: "Terminale C",
    academicYearId: "2026-2027",
    totalTuition: 350000,
    paidTuition: 0,
    remainingTuition: 350000,
    tuitionStatus: "UNPAID",
    nextDueDate: "2026-10-15",
  },
  {
    id: "st-10",
    studentId: "std-10",
    matricule: "ECO-2026-0350",
    firstName: "Victoire",
    lastName: "TOSSOU",
    gender: "F",
    classId: "1ere-d",
    className: "1ère D",
    academicYearId: "2026-2027",
    totalTuition: 320000,
    paidTuition: 160000,
    remainingTuition: 160000,
    tuitionStatus: "PARTIAL",
    lastPaymentDate: "2026-09-22T14:40:00Z",
    lastReceiptNumber: "RC-2026-0831",
    nextDueDate: "2026-11-01",
  },
  {
    id: "st-11",
    studentId: "std-11",
    matricule: "ECO-2026-0388",
    firstName: "Paul",
    lastName: "ZANNOU",
    gender: "M",
    classId: "6e-b",
    className: "6ème B",
    academicYearId: "2026-2027",
    totalTuition: 220000,
    paidTuition: 220000,
    remainingTuition: 0,
    tuitionStatus: "PAID",
    lastPaymentDate: "2026-09-12T08:15:00Z",
    lastReceiptNumber: "RC-2026-0795",
  },
  {
    id: "st-12",
    studentId: "std-12",
    matricule: "ECO-2026-0410",
    firstName: "Clarisse",
    lastName: "AKPONA",
    gender: "F",
    classId: "6e-b",
    className: "6ème B",
    academicYearId: "2026-2027",
    totalTuition: 220000,
    paidTuition: 50000,
    remainingTuition: 170000,
    tuitionStatus: "LATE",
    lastPaymentDate: "2026-09-08T11:00:00Z",
    lastReceiptNumber: "RC-2026-0780",
    nextDueDate: "2026-09-25",
  },
];

export const INITIAL_CASH_RECEIPTS: CashReceiptRecord[] = [
  {
    id: "rec-001",
    receiptNumber: "RC-2026-0842",
    date: "2026-09-24T10:30:00Z",
    studentId: "std-01",
    studentName: "Koffi ADANHOUN",
    matricule: "ECO-2026-0042",
    classId: "3e-a",
    className: "3ème A",
    academicYearId: "2026-2027",
    amount: 150000,
    previousPaidAmount: 0,
    remainingAfterPayment: 130000,
    paymentMethod: "ESPECES",
    purpose: "Frais de scolarité - Tranche 1",
    receivedBy: "C. KPONOU (Comptable)",
    status: "VALIDATED",
    transactionRef: "ESP-2026-09-0842",
    notes: "Règlement en espèces au guichet",
  },
  {
    id: "rec-002",
    receiptNumber: "RC-2026-0843",
    date: "2026-09-25T14:15:00Z",
    studentId: "std-01",
    studentName: "Koffi ADANHOUN",
    matricule: "ECO-2026-0042",
    classId: "3e-a",
    className: "3ème A",
    academicYearId: "2026-2027",
    amount: 130000,
    previousPaidAmount: 150000,
    remainingAfterPayment: 0,
    paymentMethod: "ESPECES",
    purpose: "Frais de scolarité - Tranche 2 (Solde)",
    receivedBy: "C. KPONOU (Comptable)",
    status: "VALIDATED",
    transactionRef: "ESP-2026-09-0843",
    notes: "Scolarité entièrement soldée en espèces",
  },
  {
    id: "rec-003",
    receiptNumber: "RC-2026-0844",
    date: "2026-09-26T09:00:00Z",
    studentId: "std-02",
    studentName: "Amina ADANHOUN",
    matricule: "ECO-2026-0089",
    classId: "3e-a",
    className: "3ème A",
    academicYearId: "2026-2027",
    amount: 180000,
    previousPaidAmount: 0,
    remainingAfterPayment: 100000,
    paymentMethod: "ESPECES",
    purpose: "Frais de scolarité - Tranche 1 & Avance Tranche 2",
    receivedBy: "C. KPONOU (Comptable)",
    status: "VALIDATED",
    transactionRef: "ESP-2026-09-0844",
  },
  {
    id: "rec-004",
    receiptNumber: "RC-2026-0849",
    date: "2026-09-28T16:00:00Z",
    studentId: "std-06",
    studentName: "Sèna HOUNTONDJI",
    matricule: "ECO-2026-0210",
    classId: "3e-a",
    className: "3ème A",
    academicYearId: "2026-2027",
    amount: 280000,
    previousPaidAmount: 0,
    remainingAfterPayment: 0,
    paymentMethod: "ESPECES",
    purpose: "Frais de scolarité - Paiement Intégral Annuel",
    receivedBy: "C. KPONOU (Comptable)",
    status: "VALIDATED",
    transactionRef: "ESP-2026-09-0849",
    notes: "Paiement en espèces complet reçu",
  },
  {
    id: "rec-005",
    receiptNumber: "RC-2026-0855",
    date: "2026-10-02T10:20:00Z",
    studentId: "std-05",
    studentName: "Fabrice DOSSOU",
    matricule: "ECO-2026-0182",
    classId: "3e-a",
    className: "3ème A",
    academicYearId: "2026-2027",
    amount: 150000,
    previousPaidAmount: 0,
    remainingAfterPayment: 130000,
    paymentMethod: "ESPECES",
    purpose: "Frais de scolarité - Tranche 1",
    receivedBy: "C. KPONOU (Comptable)",
    status: "VALIDATED",
    transactionRef: "ESP-2026-10-0855",
  },
  {
    id: "rec-006",
    receiptNumber: "RC-2026-0802",
    date: "2026-09-15T09:30:00Z",
    studentId: "std-08",
    studentName: "Chantal GOMEZ",
    matricule: "ECO-2026-0290",
    classId: "tle-c",
    className: "Terminale C",
    academicYearId: "2026-2027",
    amount: 350000,
    previousPaidAmount: 0,
    remainingAfterPayment: 0,
    paymentMethod: "ESPECES",
    purpose: "Frais de scolarité - Intégralité annuelle",
    receivedBy: "C. KPONOU (Comptable)",
    status: "VALIDATED",
    transactionRef: "ESP-2026-09-0802",
  },
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: "stf-01",
    matricule: "ENS-2026-MATH-042",
    firstName: "Justin",
    lastName: "HOUNKPONOU",
    roleTitle: "Professeur de Mathématiques (Titulaire 3ème A)",
    contractType: "CDI",
    phone: "+229 97 22 33 44",
    email: "justin.hounkponou@ecoduc.bj",
    baseSalary: 260000,
    primes: 25000,
    indemnities: 15000,
    deductions: 10000,
    netSalary: 290000,
  },
  {
    id: "stf-02",
    matricule: "ENS-2026-FRA-018",
    firstName: "Koffi",
    lastName: "TOSSOU",
    roleTitle: "Professeur de Français",
    contractType: "CDI",
    phone: "+229 96 11 22 33",
    email: "koffi.tossou@ecoduc.bj",
    baseSalary: 240000,
    primes: 20000,
    indemnities: 15000,
    deductions: 10000,
    netSalary: 265000,
  },
  {
    id: "stf-03",
    matricule: "ENS-2026-PCT-029",
    firstName: "Pamphile",
    lastName: "GBEDO",
    roleTitle: "Professeur de Physique-Chimie",
    contractType: "CDI",
    phone: "+229 95 44 55 66",
    email: "pamphile.gbedo@ecoduc.bj",
    baseSalary: 250000,
    primes: 20000,
    indemnities: 15000,
    deductions: 10000,
    netSalary: 275000,
  },
  {
    id: "stf-04",
    matricule: "ADM-2026-CENS-002",
    firstName: "Emmanuel",
    lastName: "HOUNNOU",
    roleTitle: "Censeur des Études",
    contractType: "CDI",
    phone: "+229 97 01 02 03",
    email: "censeur@ecoduc.bj",
    baseSalary: 320000,
    primes: 40000,
    indemnities: 25000,
    deductions: 15000,
    netSalary: 370000,
  },
  {
    id: "stf-05",
    matricule: "ADM-2026-CPT-003",
    firstName: "Clément",
    lastName: "KPONOU",
    roleTitle: "Comptable & Gestionnaire de Caisse",
    contractType: "CDI",
    phone: "+229 96 77 88 99",
    email: "comptable@ecoduc.bj",
    baseSalary: 280000,
    primes: 30000,
    indemnities: 20000,
    deductions: 12000,
    netSalary: 318000,
  },
  {
    id: "stf-06",
    matricule: "SRV-2026-MAINT-010",
    firstName: "Basile",
    lastName: "SOGLO",
    roleTitle: "Agent d'Entretien & Maintenance",
    contractType: "CDD",
    phone: "+229 94 33 22 11",
    email: "basile.soglo@ecoduc.bj",
    baseSalary: 110000,
    primes: 10000,
    indemnities: 10000,
    deductions: 5000,
    netSalary: 125000,
  },
];

export const INITIAL_PAYROLL: PayrollRecord[] = [
  {
    id: "pay-2026-09-01",
    staffId: "stf-01",
    staffName: "Justin HOUNKPONOU",
    roleTitle: "Professeur de Mathématiques",
    matricule: "ENS-2026-MATH-042",
    month: "Septembre 2026",
    academicYearId: "2026-2027",
    baseSalary: 260000,
    primes: 25000,
    indemnities: 15000,
    deductions: 10000,
    netSalary: 290000,
    paidAmount: 290000,
    status: "PAYE",
    createdAt: "2026-09-25T08:00:00Z",
    createdBy: "C. KPONOU (Comptable)",
    validatedAt: "2026-09-28T10:00:00Z",
    validatedBy: "Père Rodrigue GNANVI (Directeur)",
    paidAt: "2026-09-30T14:00:00Z",
    paidBy: "C. KPONOU (Comptable)",
    paymentMethod: "ESPECES",
    paymentRef: "PAY-ESP-2026-09-001",
    linkedExpenseId: "exp-sal-01",
  },
  {
    id: "pay-2026-09-02",
    staffId: "stf-02",
    staffName: "Koffi TOSSOU",
    roleTitle: "Professeur de Français",
    matricule: "ENS-2026-FRA-018",
    month: "Septembre 2026",
    academicYearId: "2026-2027",
    baseSalary: 240000,
    primes: 20000,
    indemnities: 15000,
    deductions: 10000,
    netSalary: 265000,
    paidAmount: 265000,
    status: "PAYE",
    createdAt: "2026-09-25T08:00:00Z",
    createdBy: "C. KPONOU (Comptable)",
    validatedAt: "2026-09-28T10:00:00Z",
    validatedBy: "Père Rodrigue GNANVI (Directeur)",
    paidAt: "2026-09-30T14:15:00Z",
    paidBy: "C. KPONOU (Comptable)",
    paymentMethod: "ESPECES",
    paymentRef: "PAY-ESP-2026-09-002",
    linkedExpenseId: "exp-sal-02",
  },
  {
    id: "pay-2026-10-01",
    staffId: "stf-01",
    staffName: "Justin HOUNKPONOU",
    roleTitle: "Professeur de Mathématiques",
    matricule: "ENS-2026-MATH-042",
    month: "Octobre 2026",
    academicYearId: "2026-2027",
    baseSalary: 260000,
    primes: 25000,
    indemnities: 15000,
    deductions: 10000,
    netSalary: 290000,
    paidAmount: 0,
    status: "VALIDE",
    createdAt: "2026-10-10T08:00:00Z",
    createdBy: "C. KPONOU (Comptable)",
    validatedAt: "2026-10-12T11:00:00Z",
    validatedBy: "Père Rodrigue GNANVI (Directeur)",
  },
  {
    id: "pay-2026-10-02",
    staffId: "stf-02",
    staffName: "Koffi TOSSOU",
    roleTitle: "Professeur de Français",
    matricule: "ENS-2026-FRA-018",
    month: "Octobre 2026",
    academicYearId: "2026-2027",
    baseSalary: 240000,
    primes: 20000,
    indemnities: 15000,
    deductions: 10000,
    netSalary: 265000,
    paidAmount: 0,
    status: "A_VALIDER",
    createdAt: "2026-10-12T09:00:00Z",
    createdBy: "C. KPONOU (Comptable)",
  },
  {
    id: "pay-2026-10-03",
    staffId: "stf-03",
    staffName: "Pamphile GBEDO",
    roleTitle: "Professeur de Physique-Chimie",
    matricule: "ENS-2026-PCT-029",
    month: "Octobre 2026",
    academicYearId: "2026-2027",
    baseSalary: 250000,
    primes: 20000,
    indemnities: 15000,
    deductions: 10000,
    netSalary: 275000,
    paidAmount: 0,
    status: "BROUILLON",
    createdAt: "2026-10-14T08:30:00Z",
    createdBy: "C. KPONOU (Comptable)",
  },
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  // Linked Salary Expenses (Already counted in salaries! Flagged to avoid double-counting in treasury)
  {
    id: "exp-sal-01",
    label: "Paiement salaire Septembre 2026 - Justin HOUNKPONOU",
    category: "Salaires",
    description: "Règlement net du salaire de Septembre 2026 en espèces au guichet",
    amount: 290000,
    date: "2026-09-30T14:00:00Z",
    beneficiary: "Justin HOUNKPONOU",
    paymentMethod: "ESPECES",
    transactionRef: "PAY-ESP-2026-09-001",
    author: "C. KPONOU (Comptable)",
    status: "PAYEE",
    academicYearId: "2026-2027",
    validatedBy: "Père Rodrigue GNANVI",
    validatedAt: "2026-09-28T10:00:00Z",
    paidAt: "2026-09-30T14:00:00Z",
    paidBy: "C. KPONOU (Comptable)",
    salaryPayrollId: "pay-2026-09-01",
  },
  {
    id: "exp-sal-02",
    label: "Paiement salaire Septembre 2026 - Koffi TOSSOU",
    category: "Salaires",
    description: "Règlement net du salaire de Septembre 2026 en espèces au guichet",
    amount: 265000,
    date: "2026-09-30T14:15:00Z",
    beneficiary: "Koffi TOSSOU",
    paymentMethod: "ESPECES",
    transactionRef: "PAY-ESP-2026-09-002",
    author: "C. KPONOU (Comptable)",
    status: "PAYEE",
    academicYearId: "2026-2027",
    validatedBy: "Père Rodrigue GNANVI",
    validatedAt: "2026-09-28T10:00:00Z",
    paidAt: "2026-09-30T14:15:00Z",
    paidBy: "C. KPONOU (Comptable)",
    salaryPayrollId: "pay-2026-09-02",
  },
  // Operational Expenses
  {
    id: "exp-001",
    label: "Achat ramettes de papier et fournitures de rentrée",
    category: "Fournitures",
    description: "30 cartons de papier A4 pour reprographie des épreuves et cahiers de texte",
    amount: 245000,
    date: "2026-09-18T10:00:00Z",
    beneficiary: "Papeterie Notre Dame Cotonou",
    paymentMethod: "ESPECES",
    transactionRef: "DEP-ESP-2026-001",
    attachmentName: "Facture_ND_092026.pdf",
    author: "C. KPONOU (Comptable)",
    status: "PAYEE",
    academicYearId: "2026-2027",
    validatedBy: "Père Rodrigue GNANVI",
    validatedAt: "2026-09-18T09:00:00Z",
    paidAt: "2026-09-18T10:00:00Z",
    paidBy: "C. KPONOU (Comptable)",
  },
  {
    id: "exp-002",
    label: "Facture Électricité SBEE Septembre 2026",
    category: "Électricité",
    description: "Consommation électrique des bâtiments administratifs et salles de classe",
    amount: 185000,
    date: "2026-09-28T11:30:00Z",
    beneficiary: "SBEE Agence Cadjehoun",
    paymentMethod: "ESPECES",
    transactionRef: "DEP-ESP-2026-002",
    attachmentName: "Recu_SBEE_Sept2026.pdf",
    author: "C. KPONOU (Comptable)",
    status: "PAYEE",
    academicYearId: "2026-2027",
    validatedBy: "Père Rodrigue GNANVI",
    validatedAt: "2026-09-28T10:00:00Z",
    paidAt: "2026-09-28T11:30:00Z",
    paidBy: "C. KPONOU (Comptable)",
  },
  {
    id: "exp-003",
    label: "Abonnement Internet Fibre Optique - Trimestre 1",
    category: "Internet",
    description: "Connexion haut débit pour l'administration et la salle informatique",
    amount: 90000,
    date: "2026-10-05T15:00:00Z",
    beneficiary: "Moov Africa Bénin Telecom",
    paymentMethod: "ESPECES",
    transactionRef: "DEP-ESP-2026-003",
    author: "C. KPONOU (Comptable)",
    status: "PAYEE",
    academicYearId: "2026-2027",
    validatedBy: "Père Rodrigue GNANVI",
    validatedAt: "2026-10-05T14:00:00Z",
    paidAt: "2026-10-05T15:00:00Z",
    paidBy: "C. KPONOU (Comptable)",
  },
  {
    id: "exp-004",
    label: "Réparation plomberie et robinetterie blocs sanitaires",
    category: "Réparations",
    description: "Remplacement de 4 vannes d'arrêt et colmatage de fuite bloc élèves",
    amount: 65000,
    date: "2026-10-12T09:30:00Z",
    beneficiary: "ETS Plomberie Moderne",
    paymentMethod: "ESPECES",
    transactionRef: "DEP-ESP-2026-004",
    author: "C. KPONOU (Comptable)",
    status: "VALIDEE",
    academicYearId: "2026-2027",
    validatedBy: "Père Rodrigue GNANVI",
    validatedAt: "2026-10-13T16:00:00Z",
  },
  {
    id: "exp-005",
    label: "Fourniture produits d'hygiène et entretien sol",
    category: "Entretien",
    description: "Javel, détergents, balais et serpillières pour l'équipe d'entretien",
    amount: 45000,
    date: "2026-10-14T11:00:00Z",
    beneficiary: "Supermarché Étoile",
    paymentMethod: "ESPECES",
    transactionRef: "DEP-ESP-2026-005",
    author: "C. KPONOU (Comptable)",
    status: "EN_ATTENTE",
    academicYearId: "2026-2027",
  },
];
