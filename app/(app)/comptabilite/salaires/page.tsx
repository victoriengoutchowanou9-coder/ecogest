"use client";

import React, { useState, useMemo } from "react";
import {
  Briefcase,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Printer,
  Calendar,
  Wallet,
  Eye,
  ShieldCheck,
  Users,
  Check,
  Send,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatFCFA, formatDate, formatDateTime } from "@/lib/utils";
import { useSubscriptionStore } from "@/lib/subscription-store";
import { useToast } from "@/components/ui/Toast";
import { useFinanceStore } from "@/lib/finance-store";
import { PayrollRecord, StaffMember, PayrollStatus } from "@/lib/mock-finance-db";
import { cn } from "@/lib/utils";

export default function ComptabiliteSalairesPage() {
  const { toast } = useToast();
  const { activeSchool } = useSubscriptionStore();
  const { staff, payroll, updatePayrollStatus, paySalaryRecord, createPayrollRecord } =
    useFinanceStore();

  const [activeTab, setActiveTab] = useState<"PAIE" | "PERSONNEL">("PAIE");
  const [selectedYear, setSelectedYear] = useState<string>("2026-2027");
  const [selectedMonth, setSelectedMonth] = useState<string>("Octobre 2026");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);
  const [payrollToValidate, setPayrollToValidate] = useState<PayrollRecord | null>(null);
  const [payrollToPay, setPayrollToPay] = useState<PayrollRecord | null>(null);

  // Month list
  const months = ["Septembre 2026", "Octobre 2026", "Novembre 2026", "Décembre 2026"];

  // Filtered payroll
  const filteredPayroll = useMemo(() => {
    return payroll.filter((p) => {
      const matchYear = p.academicYearId === selectedYear;
      const matchMonth = selectedMonth === "ALL" || p.month === selectedMonth;
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        q === "" ||
        p.staffName.toLowerCase().includes(q) ||
        p.roleTitle.toLowerCase().includes(q) ||
        p.matricule.toLowerCase().includes(q);

      return matchYear && matchMonth && matchStatus && matchSearch;
    });
  }, [payroll, selectedYear, selectedMonth, statusFilter, search]);

  // Aggregate monthly stats
  const payrollStats = useMemo(() => {
    const list = payroll.filter(
      (p) => p.academicYearId === selectedYear && (selectedMonth === "ALL" || p.month === selectedMonth)
    );
    const totalMass = list.reduce((acc, p) => acc + p.netSalary, 0);
    const totalPaid = list
      .filter((p) => p.status === "PAYE")
      .reduce((acc, p) => acc + p.paidAmount, 0);
    const totalRemaining = totalMass - totalPaid;

    const paidCount = list.filter((p) => p.status === "PAYE").length;
    const validatedCount = list.filter((p) => p.status === "VALIDE").length;
    const pendingCount = list.filter((p) => p.status === "A_VALIDER" || p.status === "BROUILLON").length;

    return {
      totalMass,
      totalPaid,
      totalRemaining,
      paidCount,
      validatedCount,
      pendingCount,
      totalStaff: staff.length,
    };
  }, [payroll, staff, selectedYear, selectedMonth]);

  const handleCreateMonthPayroll = () => {
    staff.forEach((st) => {
      createPayrollRecord(st.id, selectedMonth, selectedYear);
    });
    toast(`Fiches de paie de ${selectedMonth} préparées pour l'ensemble du personnel.`, "info");
  };

  const handleRequestValidation = (id: string) => {
    updatePayrollStatus(id, "A_VALIDER");
    toast("Fiche transmise à la Direction pour visa de validation.", "info");
  };

  const handleConfirmValidate = () => {
    if (!payrollToValidate) return;
    updatePayrollStatus(payrollToValidate.id, "VALIDE", "Père Rodrigue GNANVI (Directeur)");
    toast(`Salaire de ${payrollToValidate.staffName} validé par la Direction. Prêt au paiement.`, "success");
    setPayrollToValidate(null);
  };

  const handleConfirmPay = () => {
    if (!payrollToPay) return;
    paySalaryRecord(payrollToPay.id, "C. KPONOU (Comptable)");
    toast(
      `Salaire de ${formatFCFA(payrollToPay.netSalary)} payé en espèces à ${payrollToPay.staffName}. Une seule sortie enregistrée en caisse.`,
      "success"
    );
    setPayrollToPay(null);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const payrollColumns: Column<PayrollRecord>[] = [
    {
      key: "staff",
      header: "Personnel & Fonction",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs md:text-sm">{item.staffName}</span>
          <span className="text-[11px] text-slate-500 font-medium">{item.roleTitle}</span>
          <span className="text-[10px] text-slate-400 font-mono block">{item.matricule}</span>
        </div>
      ),
    },
    {
      key: "baseSalary",
      header: "Salaire de Base",
      render: (item) => (
        <span className="text-xs font-mono text-slate-700 tabular-nums">
          {formatFCFA(item.baseSalary)}
        </span>
      ),
    },
    {
      key: "primes",
      header: "Primes & Ind.",
      render: (item) => (
        <span className="text-xs font-mono text-emerald-700 tabular-nums font-semibold">
          +{formatFCFA(item.primes + item.indemnities)}
        </span>
      ),
    },
    {
      key: "deductions",
      header: "Retenues",
      render: (item) => (
        <span className="text-xs font-mono text-rose-600 tabular-nums">
          -{formatFCFA(item.deductions)}
        </span>
      ),
    },
    {
      key: "netSalary",
      header: "Salaire Net",
      render: (item) => (
        <span className="font-black text-sm text-indigo-900 tabular-nums">
          {formatFCFA(item.netSalary)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (item) => {
        let label = item.status;
        let color = "bg-slate-100 text-slate-700";
        if (item.status === "PAYE") {
          label = "Payé" as any;
          color = "bg-emerald-100 text-emerald-800";
        } else if (item.status === "VALIDE") {
          label = "Validé" as any;
          color = "bg-blue-100 text-blue-800";
        } else if (item.status === "A_VALIDER") {
          label = "À valider" as any;
          color = "bg-amber-100 text-amber-800";
        } else if (item.status === "BROUILLON") {
          label = "Brouillon" as any;
          color = "bg-slate-100 text-slate-600";
        }
        return (
          <span className={cn("inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold", color)}>
            {label}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions & Bulletin",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* View Bulletin */}
          <button
            type="button"
            onClick={() => setSelectedSlip(item)}
            className="p-1.5 text-slate-600 hover:text-school-primary rounded-lg hover:bg-slate-100 touch-target"
            title="Consulter le Bulletin de Paie"
          >
            <FileText className="w-4 h-4" />
          </button>

          {item.status === "BROUILLON" && (
            <button
              type="button"
              onClick={() => handleRequestValidation(item.id)}
              className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold"
            >
              Soumettre
            </button>
          )}

          {item.status === "A_VALIDER" && (
            <button
              type="button"
              onClick={() => setPayrollToValidate(item)}
              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 text-xs font-bold"
            >
              Valider (Direction)
            </button>
          )}

          {item.status === "VALIDE" && (
            <button
              type="button"
              onClick={() => setPayrollToPay(item)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-xs"
            >
              Payer espèces
            </button>
          )}

          {item.status === "PAYE" && (
            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Payé
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Gestion des Salaires & Bulletins de Paie"
        subtitle="Calcul des rémunérations nettes, validation directionnelle et paiement en espèces avec sortie unique en trésorerie"
        breadcrumbs={[{ label: "Comptabilité", href: "/comptabilite" }, { label: "Salaires" }]}
        actions={
          <button
            type="button"
            onClick={handleCreateMonthPayroll}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Préparer la paie du mois</span>
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab("PAIE")}
          className={cn(
            "pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors",
            activeTab === "PAIE"
              ? "border-school-primary text-school-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <Briefcase className="w-4 h-4" />
          <span>État des Salaires ({selectedMonth})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PERSONNEL")}
          className={cn(
            "pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors",
            activeTab === "PERSONNEL"
              ? "border-school-primary text-school-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <Users className="w-4 h-4" />
          <span>Fichier du Personnel ({staff.length} membres)</span>
        </button>
      </div>

      {activeTab === "PAIE" ? (
        <>
          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs uppercase font-bold text-slate-400 block">
                Masse Salariale Nette
              </span>
              <span className="text-xl font-black text-indigo-950 tabular-nums">
                {formatFCFA(payrollStats.totalMass)}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {payrollStats.paidCount + payrollStats.validatedCount + payrollStats.pendingCount} fiches préparées
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs uppercase font-bold text-emerald-700 block">
                Salaires Effectivement Payés
              </span>
              <span className="text-xl font-black text-emerald-700 tabular-nums">
                {formatFCFA(payrollStats.totalPaid)}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {payrollStats.paidCount} salaires décaissés en caisse
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs uppercase font-bold text-amber-600 block">
                Salaires Restant à Payer
              </span>
              <span className="text-xl font-black text-amber-600 tabular-nums">
                {formatFCFA(payrollStats.totalRemaining)}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {payrollStats.validatedCount} validés prêts au paiement
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Année scolaire
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent"
                >
                  <option value="2026-2027">2026 - 2027 (En cours)</option>
                  <option value="2025-2026">2025 - 2026 (Archivée)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Mois de paie
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent"
                >
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Statut de paie
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="BROUILLON">Brouillon</option>
                  <option value="A_VALIDER">À valider</option>
                  <option value="VALIDE">Validé (Prêt à payer)</option>
                  <option value="PAYE">Payé en espèces</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Rechercher un employé
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nom ou fonction..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs md:text-sm text-slate-800 focus:border-school-accent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-school-primary" />
              <span>
                <strong>Confidentialité garantie :</strong> Données salariales accessibles uniquement aux utilisateurs autorisés (Direction &amp; Comptabilité).
              </span>
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={payrollColumns}
            data={filteredPayroll}
            keyExtractor={(item) => item.id}
            emptyMessage="Aucune fiche de paie enregistrée pour ce mois. Cliquez sur 'Préparer la paie du mois'."
          />
        </>
      ) : (
        /* Staff Directory Tab */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Fiches du Personnel Enseignant &amp; Administratif</h3>
              <p className="text-xs text-slate-500">
                Rémunération contractuelle de base, primes et indemnités statutaires
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-blue-100 text-blue-900">
              {staff.length} employés
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {staff.map((st) => (
              <div
                key={st.id}
                className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">
                      {st.firstName} {st.lastName}
                    </h4>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {st.contractType}
                    </span>
                    <span className="text-xs font-mono text-slate-400">({st.matricule})</span>
                  </div>
                  <p className="text-xs text-school-primary font-semibold mt-0.5">{st.roleTitle}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Contact : {st.phone} &bull; {st.email}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Base</span>
                    <span className="font-bold text-slate-800">{formatFCFA(st.baseSalary)}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase text-emerald-600 font-bold block">Primes/Ind.</span>
                    <span className="font-bold text-emerald-700">+{formatFCFA(st.primes + st.indemnities)}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase text-rose-600 font-bold block">Retenues</span>
                    <span className="font-bold text-rose-600">-{formatFCFA(st.deductions)}</span>
                  </div>

                  <div className="text-right pl-3 border-l border-slate-200">
                    <span className="text-[10px] uppercase text-indigo-900 font-black block">Salaire Net</span>
                    <span className="text-sm font-black text-indigo-900 tabular-nums">
                      {formatFCFA(st.netSalary)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Pay Slip Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 my-8 shadow-2xl space-y-6">
            <div className="no-print flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Bulletin Individuel de Paie</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSlip(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg touch-target"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-school-primary text-white text-xs font-semibold rounded-lg hover:bg-school-700 shadow-sm touch-target"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer le bulletin</span>
                </button>
              </div>
            </div>

            {/* Printable Bulletin Container */}
            <div className="p-6 border border-slate-200 rounded-2xl space-y-6 bg-white text-slate-900">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-base font-black text-school-primary uppercase">
                    {activeSchool.name}
                  </h2>
                  <p className="text-xs text-slate-500">{activeSchool.address}</p>
                  <p className="text-xs text-slate-500">Tél : {activeSchool.phone || "+229"}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-mono">
                    BULLETIN DE PAIE
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-1">Période : {selectedSlip.month}</p>
                  <p className="text-xs text-slate-500">Année : {selectedSlip.academicYearId}</p>
                </div>
              </div>

              {/* Staff Details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Employé</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedSlip.staffName}</p>
                  <p className="text-slate-600 font-mono">Matricule : {selectedSlip.matricule}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Fonction</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedSlip.roleTitle}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Mode : Espèce au guichet</p>
                </div>
              </div>

              {/* Earnings & Deductions Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                    <tr>
                      <th className="px-4 py-2.5">Éléments de Rémunération</th>
                      <th className="px-4 py-2.5 text-right">Gains (+)</th>
                      <th className="px-4 py-2.5 text-right">Retenues (-)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-slate-800">Salaire de base indiciaire</td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums">{formatFCFA(selectedSlip.baseSalary)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-400">-</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-slate-800">Primes de responsabilité / pédagogique</td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-emerald-700">+{formatFCFA(selectedSlip.primes)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-400">-</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-slate-800">Indemnités de transport et logement</td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-emerald-700">+{formatFCFA(selectedSlip.indemnities)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-400">-</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-slate-800">Retenues sociales / d&apos;assurance</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-400">-</td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-rose-600">-{formatFCFA(selectedSlip.deductions)}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-800">NET À PAYER :</th>
                      <th colSpan={2} className="px-4 py-3 text-right text-base font-black text-indigo-900 tabular-nums">
                        {formatFCFA(selectedSlip.netSalary)}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Status and Signatures */}
              <div className="pt-4 grid grid-cols-2 items-end border-t border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">État du règlement</span>
                  <span
                    className={`inline-block px-2.5 py-1 rounded text-xs font-bold mt-1 ${
                      selectedSlip.status === "PAYE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {selectedSlip.status === "PAYE" ? "Payé en espèces" : "En attente de paiement"}
                  </span>
                  {selectedSlip.paidAt && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Date de règlement : {formatDate(selectedSlip.paidAt)}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="font-bold text-slate-800">Visa &amp; Signature de la Direction</p>
                  <div className="h-14 mt-2 flex items-center justify-end">
                    <div className="border border-dashed border-slate-300 rounded-lg px-3 py-1.5 text-[10px] text-slate-400 uppercase font-bold text-center">
                      P. Rodrigue GNANVI &bull; Directeur
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validate Dialog */}
      <ConfirmDialog
        isOpen={!!payrollToValidate}
        title="Validation de la fiche de paie"
        description={`Confirmez-vous la validation de la rémunération nette de ${formatFCFA(payrollToValidate?.netSalary)} pour ${payrollToValidate?.staffName} (${payrollToValidate?.month}) ? Cette étape autorise formellement le décaissement.`}
        confirmLabel="Valider la fiche"
        cancelLabel="Annuler"
        onConfirm={handleConfirmValidate}
        onCancel={() => setPayrollToValidate(null)}
      />

      {/* Pay Dialog */}
      <ConfirmDialog
        isOpen={!!payrollToPay}
        title="Paiement du salaire en espèces"
        description={`Êtes-vous sur le point de verser ${formatFCFA(payrollToPay?.netSalary)} en espèces à ${payrollToPay?.staffName} pour le mois de ${payrollToPay?.month} ? Cette opération produira UNE SEULE sortie réelle en trésorerie.`}
        confirmLabel="Verser le salaire"
        cancelLabel="Annuler"
        onConfirm={handleConfirmPay}
        onCancel={() => setPayrollToPay(null)}
      />
    </div>
  );
}
