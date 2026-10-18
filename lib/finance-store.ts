"use client";

import { useState, useEffect } from "react";
import {
  StudentTuitionRecord,
  CashReceiptRecord,
  ExpenseRecord,
  PayrollRecord,
  StaffMember,
  TreasuryEntry,
  INITIAL_STUDENTS_TUITION,
  INITIAL_CASH_RECEIPTS,
  INITIAL_EXPENSES,
  INITIAL_STAFF,
  INITIAL_PAYROLL,
} from "./mock-finance-db";
import { getScopedStorageKey } from "./school-context";

const getStudentsKey = () => getScopedStorageKey("educogest_finance_students_v2");
const getReceiptsKey = () => getScopedStorageKey("educogest_finance_receipts_v2");
const getExpensesKey = () => getScopedStorageKey("educogest_finance_expenses_v2");
const getPayrollKey = () => getScopedStorageKey("educogest_finance_payroll_v2");
const getStaffKey = () => getScopedStorageKey("educogest_finance_staff_v2");

const FINANCE_STORAGE_EVENT = "educogest_finance_storage_update";
const SHARED_STORAGE_EVENT = "ecogest_shared_data_update";

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
    window.dispatchEvent(new Event(FINANCE_STORAGE_EVENT));
    window.dispatchEvent(new Event(SHARED_STORAGE_EVENT));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

/**
 * Primary React Hook to access and manipulate the unified Financial State
 */
export function useFinanceStore() {
  const [students, setStudents] = useState<StudentTuitionRecord[]>(() =>
    safeGetStorage(getStudentsKey(), [])
  );

  const [receipts, setReceipts] = useState<CashReceiptRecord[]>(() =>
    safeGetStorage(getReceiptsKey(), [])
  );

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() =>
    safeGetStorage(getExpensesKey(), [])
  );

  const [payroll, setPayroll] = useState<PayrollRecord[]>(() =>
    safeGetStorage(getPayrollKey(), [])
  );

  const [staff, setStaff] = useState<StaffMember[]>(() =>
    safeGetStorage(getStaffKey(), [])
  );

  // Synchronisation lors d'un basculement d'école ou d'une mise à jour partagée
  useEffect(() => {
    const handleSync = () => {
      setStudents(safeGetStorage(getStudentsKey(), []));
      setReceipts(safeGetStorage(getReceiptsKey(), []));
      setExpenses(safeGetStorage(getExpensesKey(), []));
      setPayroll(safeGetStorage(getPayrollKey(), []));
      setStaff(safeGetStorage(getStaffKey(), []));
    };

    window.addEventListener(FINANCE_STORAGE_EVENT, handleSync);
    window.addEventListener(SHARED_STORAGE_EVENT, handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener(FINANCE_STORAGE_EVENT, handleSync);
      window.removeEventListener(SHARED_STORAGE_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    safeSetStorage(getStudentsKey(), students);
  }, [students]);

  useEffect(() => {
    safeSetStorage(getReceiptsKey(), receipts);
  }, [receipts]);

  useEffect(() => {
    safeSetStorage(getExpensesKey(), expenses);
  }, [expenses]);

  useEffect(() => {
    safeSetStorage(getPayrollKey(), payroll);
  }, [payroll]);

  useEffect(() => {
    safeSetStorage(getStaffKey(), staff);
  }, [staff]);

  /**
   * 1. ENCAISSEMENT DES FRAIS DE SCOLARITÉ (Strictement en Espèces)
   * Enregistre un paiement en espèces, met à jour l'élève (sans jamais le supprimer),
   * et émet un reçu officiel permanent.
   */
  const recordCashPayment = (params: {
    studentId: string;
    amount: number;
    purpose: string;
    receivedBy: string;
    academicYearId?: string;
    notes?: string;
  }): CashReceiptRecord => {
    const student = students.find((s) => s.studentId === params.studentId);
    if (!student) {
      throw new Error("Élève non trouvé.");
    }

    if (params.amount <= 0) {
      throw new Error("Le montant du paiement doit être supérieur à zéro.");
    }

    const previousPaid = student.paidTuition;
    const newPaid = previousPaid + params.amount;
    const remainingAfter = Math.max(0, student.totalTuition - newPaid);

    let newStatus: "PAID" | "PARTIAL" | "LATE" | "UNPAID" = "PARTIAL";
    if (remainingAfter === 0) {
      newStatus = "PAID";
    } else if (newPaid > 0) {
      newStatus = "PARTIAL";
    }

    const now = new Date();
    const receiptNum = `RC-2026-${String(receipts.length + 850).padStart(4, "0")}`;
    const transactionRef = `ESP-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${receiptNum.split("-")[2]}`;

    const newReceipt: CashReceiptRecord = {
      id: `rec-${Date.now()}`,
      receiptNumber: receiptNum,
      date: now.toISOString(),
      studentId: student.studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      matricule: student.matricule,
      classId: student.classId,
      className: student.className,
      academicYearId: params.academicYearId || student.academicYearId,
      amount: params.amount,
      previousPaidAmount: previousPaid,
      remainingAfterPayment: remainingAfter,
      paymentMethod: "ESPECES",
      purpose: params.purpose || "Frais de scolarité",
      receivedBy: params.receivedBy || "C. KPONOU (Comptable)",
      status: "VALIDATED",
      transactionRef,
      notes: params.notes,
    };

    // Update students state permanently (never remove student)
    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === params.studentId
          ? {
              ...s,
              paidTuition: newPaid,
              remainingTuition: remainingAfter,
              tuitionStatus: newStatus,
              lastPaymentDate: now.toISOString(),
              lastReceiptNumber: receiptNum,
            }
          : s
      )
    );

    // Append to receipts permanently
    setReceipts((prev) => [newReceipt, ...prev]);

    return newReceipt;
  };

  /**
   * 2. GESTION DES DÉPENSES
   */
  const addExpense = (newExp: Omit<ExpenseRecord, "id" | "transactionRef">) => {
    const now = new Date();
    const count = expenses.length + 1;
    const transactionRef = `DEP-ESP-${now.getFullYear()}-${String(count).padStart(3, "0")}`;

    const created: ExpenseRecord = {
      ...newExp,
      id: `exp-${Date.now()}`,
      transactionRef,
    };

    setExpenses((prev) => [created, ...prev]);
    return created;
  };

  const validateExpense = (expenseId: string, validatedBy: string) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === expenseId
          ? {
              ...e,
              status: "VALIDEE",
              validatedBy,
              validatedAt: new Date().toISOString(),
            }
          : e
      )
    );
  };

  const payExpense = (expenseId: string, paidBy: string) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === expenseId
          ? {
              ...e,
              status: "PAYEE",
              paidBy,
              paidAt: new Date().toISOString(),
            }
          : e
      )
    );
  };

  const cancelExpense = (expenseId: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === expenseId ? { ...e, status: "ANNULEE" } : e))
    );
  };

  /**
   * 3. GESTION DE LA PAIE & SALAIRES
   */
  const createPayrollRecord = (staffId: string, month: string, academicYearId = "2026-2027") => {
    const member = staff.find((s) => s.id === staffId);
    if (!member) throw new Error("Membre du personnel introuvable.");

    // Check if payroll already exists for this staff and month
    const existing = payroll.find((p) => p.staffId === staffId && p.month === month);
    if (existing) {
      return existing;
    }

    const netSalary = member.baseSalary + member.primes + member.indemnities - member.deductions;
    const newRecord: PayrollRecord = {
      id: `pay-${Date.now()}`,
      staffId: member.id,
      staffName: `${member.firstName} ${member.lastName}`,
      roleTitle: member.roleTitle,
      matricule: member.matricule,
      month,
      academicYearId,
      baseSalary: member.baseSalary,
      primes: member.primes,
      indemnities: member.indemnities,
      deductions: member.deductions,
      netSalary,
      paidAmount: 0,
      status: "BROUILLON",
      createdAt: new Date().toISOString(),
      createdBy: "C. KPONOU (Comptable)",
    };

    setPayroll((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const updatePayrollStatus = (
    payrollId: string,
    status: "A_VALIDER" | "VALIDE",
    validatorName?: string
  ) => {
    setPayroll((prev) =>
      prev.map((p) => {
        if (p.id !== payrollId) return p;
        return {
          ...p,
          status,
          validatedAt: status === "VALIDE" ? new Date().toISOString() : p.validatedAt,
          validatedBy: status === "VALIDE" ? (validatorName || "Père Rodrigue GNANVI") : p.validatedBy,
        };
      })
    );
  };

  /**
   * Payer un salaire :
   * - Passe le bulletin à PAYE
   * - Crée ou synchronise la dépense dans la catégorie Salaires avec un lien ID unique
   * - GARANTIE : La trésorerie n'enregistre qu'une seule sortie d'argent effective !
   */
  const paySalaryRecord = (payrollId: string, paidBy = "C. KPONOU (Comptable)") => {
    const record = payroll.find((p) => p.id === payrollId);
    if (!record) throw new Error("Fiche de paie introuvable.");

    if (record.status !== "VALIDE") {
      throw new Error("Le salaire doit être validé par la direction avant paiement.");
    }

    const now = new Date();
    const paymentRef = `PAY-ESP-${now.getFullYear()}-${String(payroll.length + 1).padStart(3, "0")}`;
    const linkedExpenseId = `exp-sal-${Date.now()}`;

    // 1. Update payroll state
    setPayroll((prev) =>
      prev.map((p) =>
        p.id === payrollId
          ? {
              ...p,
              status: "PAYE",
              paidAmount: p.netSalary,
              paidAt: now.toISOString(),
              paidBy,
              paymentMethod: "ESPECES",
              paymentRef,
              linkedExpenseId,
            }
          : p
      )
    );

    // 2. Reflected in expense list under "Salaires" with salaryPayrollId linked to avoid double-entry in treasury
    const salaryExpense: ExpenseRecord = {
      id: linkedExpenseId,
      label: `Paiement salaire ${record.month} - ${record.staffName}`,
      category: "Salaires",
      description: `Règlement net du salaire de ${record.month} en espèces au guichet`,
      amount: record.netSalary,
      date: now.toISOString(),
      beneficiary: record.staffName,
      paymentMethod: "ESPECES",
      transactionRef: paymentRef,
      author: paidBy,
      status: "PAYEE",
      academicYearId: record.academicYearId,
      validatedBy: record.validatedBy || "Père Rodrigue GNANVI",
      validatedAt: record.validatedAt || now.toISOString(),
      paidAt: now.toISOString(),
      paidBy,
      salaryPayrollId: payrollId, // CRITICAL: This link tells the treasury this is already counted in payroll!
    };

    setExpenses((prev) => [salaryExpense, ...prev]);
  };

  /**
   * 4. GRAND LIVRE DE TRÉSORERIE (Zéro doublon garanti)
   * Entrées = Reçus d'encaissements validés
   * Sorties = Dépenses payées (hors celles liées aux salaires) + Salaires payés
   */
  const getTreasuryLedger = (academicYearId = "2026-2027"): TreasuryEntry[] => {
    const entries: TreasuryEntry[] = [];

    // ENTRÉES : Tous les reçus validés de l'année scolaire
    receipts
      .filter((r) => r.academicYearId === academicYearId && r.status === "VALIDATED")
      .forEach((r) => {
        entries.push({
          id: `tr-in-${r.id}`,
          type: "ENTREE",
          category: "Frais de scolarité",
          label: `Encaissement ${r.studentName} (${r.className}) - ${r.purpose}`,
          amount: r.amount,
          date: r.date,
          paymentMethod: r.paymentMethod,
          reference: r.receiptNumber,
          author: r.receivedBy,
          sourceType: "SCOLARITE",
          sourceId: r.id,
        });
      });

    // SORTIES 1 : Les dépenses générales payées (excluant celles avec salaryPayrollId pour éviter les doublons)
    expenses
      .filter(
        (e) =>
          e.academicYearId === academicYearId &&
          e.status === "PAYEE" &&
          !e.salaryPayrollId // Exclut les dépenses générées par les salaires
      )
      .forEach((e) => {
        entries.push({
          id: `tr-out-exp-${e.id}`,
          type: "SORTIE",
          category: e.category,
          label: `${e.label} (Bénéficiaire : ${e.beneficiary})`,
          amount: e.amount,
          date: e.paidAt || e.date,
          paymentMethod: e.paymentMethod,
          reference: e.transactionRef,
          author: e.paidBy || e.author,
          sourceType: "DEPENSE",
          sourceId: e.id,
        });
      });

    // SORTIES 2 : Les salaires payés (chacun ne compte qu'une seule fois)
    payroll
      .filter((p) => p.academicYearId === academicYearId && p.status === "PAYE")
      .forEach((p) => {
        entries.push({
          id: `tr-out-sal-${p.id}`,
          type: "SORTIE",
          category: "Salaires",
          label: `Salaire ${p.month} - ${p.staffName} (${p.roleTitle})`,
          amount: p.paidAmount,
          date: p.paidAt || p.createdAt,
          paymentMethod: p.paymentMethod || "ESPECES",
          reference: p.paymentRef || p.id,
          author: p.paidBy || "Comptable",
          sourceType: "SALAIRE",
          sourceId: p.id,
        });
      });

    // Tri antéchronologique (les plus récents d'abord)
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return entries;
  };

  /**
   * 5. CALCULATE FINANCIAL SUMMARY KPIs (filtrables par Année, Période et Mois)
   */
  const getFinancialStats = (filters?: {
    academicYearId?: string;
    period?: string;
    month?: string;
  }) => {
    const yearId = filters?.academicYearId || "2026-2027";

    const filteredStudents = students.filter((s) => s.academicYearId === yearId);
    const totalStudents = filteredStudents.length;
    const totalTuitionExpected = filteredStudents.reduce((acc, s) => acc + s.totalTuition, 0);
    const totalTuitionCollected = filteredStudents.reduce((acc, s) => acc + s.paidTuition, 0);
    const totalTuitionRemaining = totalTuitionExpected - totalTuitionCollected;

    const paidCount = filteredStudents.filter((s) => s.tuitionStatus === "PAID").length;
    const partialCount = filteredStudents.filter((s) => s.tuitionStatus === "PARTIAL").length;
    const lateCount = filteredStudents.filter((s) => s.tuitionStatus === "LATE").length;
    const unpaidCount = filteredStudents.filter((s) => s.tuitionStatus === "UNPAID").length;

    // Filtered expenses
    const filteredExpenses = expenses.filter((e) => e.academicYearId === yearId);
    const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
    const totalExpensesPaid = filteredExpenses
      .filter((e) => e.status === "PAYEE")
      .reduce((acc, e) => acc + e.amount, 0);

    // Filtered payroll
    const filteredPayroll = payroll.filter((p) => p.academicYearId === yearId);
    // Current month salary mass
    const currentMonthPayroll = filteredPayroll.filter((p) => p.month.includes("Octobre"));
    const monthlySalaryMass = currentMonthPayroll.reduce((acc, p) => acc + p.netSalary, 0);
    const salariesRemainingToPay = currentMonthPayroll
      .filter((p) => p.status !== "PAYE")
      .reduce((acc, p) => acc + (p.netSalary - p.paidAmount), 0);

    // Available cash balance in Treasury
    const ledger = getTreasuryLedger(yearId);
    const totalCashIn = ledger
      .filter((e) => e.type === "ENTREE")
      .reduce((acc, e) => acc + e.amount, 0);
    const totalCashOut = ledger
      .filter((e) => e.type === "SORTIE")
      .reduce((acc, e) => acc + e.amount, 0);
    const availableCashBalance = totalCashIn - totalCashOut;

    return {
      totalStudents,
      totalTuitionExpected,
      totalTuitionCollected,
      totalTuitionRemaining,
      collectionRate:
        totalTuitionExpected > 0
          ? Math.round((totalTuitionCollected / totalTuitionExpected) * 100)
          : 0,
      paidCount,
      partialCount,
      lateCount,
      unpaidCount,
      totalExpenses,
      totalExpensesPaid,
      monthlySalaryMass,
      salariesRemainingToPay,
      availableCashBalance,
      totalCashIn,
      totalCashOut,
    };
  };

  return {
    students,
    receipts,
    expenses,
    payroll,
    staff,
    recordCashPayment,
    addExpense,
    validateExpense,
    payExpense,
    cancelExpense,
    createPayrollRecord,
    updatePayrollStatus,
    paySalaryRecord,
    getTreasuryLedger,
    getFinancialStats,
  };
}
