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

// Initial clean production datasets
export const INITIAL_STUDENTS_TUITION: StudentTuitionRecord[] = [];
export const INITIAL_CASH_RECEIPTS: CashReceiptRecord[] = [];
export const INITIAL_STAFF: StaffMember[] = [];
export const INITIAL_PAYROLL: PayrollRecord[] = [];
export const INITIAL_EXPENSES: ExpenseRecord[] = [];
