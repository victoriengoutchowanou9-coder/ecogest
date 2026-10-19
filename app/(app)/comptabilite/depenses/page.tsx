"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingDown,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Printer,
  Calendar,
  Wallet,
  ShieldCheck,
  Check,
  Trash2,
  Ban,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatFCFA, formatDate, formatDateTime } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { useFinanceStore } from "@/lib/finance-store";
import { ExpenseRecord, ExpenseCategory, ExpenseStatus } from "@/lib/mock-finance-db";

const CATEGORIES: ExpenseCategory[] = [
  "Salaires",
  "Fournitures",
  "Loyer",
  "Eau",
  "Électricité",
  "Internet",
  "Entretien",
  "Réparations",
  "Transport",
  "Matériel",
  "Frais administratifs",
  "Autres dépenses",
];

export default function ComptabiliteDepensesPage() {
  const { toast } = useToast();
  const {
    expenses,
    addExpense,
    validateExpense,
    payExpense,
    cancelExpense,
    deleteExpense,
  } = useFinanceStore();

  const [selectedYear, setSelectedYear] = useState<string>("2026-2027");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToValidate, setExpenseToValidate] = useState<ExpenseRecord | null>(null);
  const [expenseToPay, setExpenseToPay] = useState<ExpenseRecord | null>(null);
  const [expenseToCancel, setExpenseToCancel] = useState<ExpenseRecord | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseRecord | null>(null);

  // Form state
  const [formLabel, setFormLabel] = useState("");
  const [formCategory, setFormCategory] = useState<ExpenseCategory>("Fournitures");
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState<number>(25000);
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [formBeneficiary, setFormBeneficiary] = useState("");
  const [formAttachment, setFormAttachment] = useState("");

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchYear = e.academicYearId === selectedYear;
      const matchCat = selectedCategory === "ALL" || e.category === selectedCategory;
      const matchStat = selectedStatus === "ALL" || e.status === selectedStatus;
      const q = search.toLowerCase().trim();
      const matchSearch =
        q === "" ||
        e.label.toLowerCase().includes(q) ||
        e.beneficiary.toLowerCase().includes(q) ||
        e.transactionRef.toLowerCase().includes(q);

      return matchYear && matchCat && matchStat && matchSearch;
    });
  }, [expenses, selectedYear, selectedCategory, selectedStatus, search]);

  // Aggregate stats
  const stats = useMemo(() => {
    const list = expenses.filter((e) => e.academicYearId === selectedYear);
    const totalExpenses = list.reduce((acc, e) => acc + e.amount, 0);
    const paidExpenses = list
      .filter((e) => e.status === "PAYEE")
      .reduce((acc, e) => acc + e.amount, 0);
    const pendingExpenses = list
      .filter((e) => e.status === "EN_ATTENTE" || e.status === "VALIDEE")
      .reduce((acc, e) => acc + e.amount, 0);

    return {
      totalExpenses,
      paidExpenses,
      pendingExpenses,
      count: list.length,
    };
  }, [expenses, selectedYear]);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    expenses
      .filter((e) => e.academicYearId === selectedYear && e.status === "PAYEE")
      .forEach((e) => {
        map[e.category] = (map[e.category] || 0) + e.amount;
      });
    return map;
  }, [expenses, selectedYear]);

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLabel.trim() || !formBeneficiary.trim() || formAmount <= 0) {
      toast("Veuillez remplir le libellé, le bénéficiaire et un montant valide.", "info");
      return;
    }

    addExpense({
      label: formLabel,
      category: formCategory,
      description: formDescription,
      amount: formAmount,
      date: formDate,
      beneficiary: formBeneficiary,
      paymentMethod: "ESPECES",
      attachmentName: formAttachment || undefined,
      author: "C. KPONOU (Comptable)",
      status: "EN_ATTENTE",
      academicYearId: selectedYear,
    });

    setIsModalOpen(false);
    toast("Dépense enregistrée avec succès. En attente de validation.", "success");

    // Reset
    setFormLabel("");
    setFormDescription("");
    setFormBeneficiary("");
    setFormAttachment("");
  };

  const handleConfirmValidate = () => {
    if (!expenseToValidate) return;
    validateExpense(expenseToValidate.id, "Père Rodrigue GNANVI (Directeur)");
    toast(`Dépense « ${expenseToValidate.label} » validée par la direction.`, "success");
    setExpenseToValidate(null);
  };

  const handleConfirmPay = () => {
    if (!expenseToPay) return;
    payExpense(expenseToPay.id, "C. KPONOU (Comptable)");
    toast(
      `Paiement de ${formatFCFA(expenseToPay.amount)} en espèces validé. Sortie de caisse effective.`,
      "success"
    );
    setExpenseToPay(null);
  };

  const handleConfirmCancel = () => {
    if (!expenseToCancel) return;
    cancelExpense(expenseToCancel.id);
    toast(`Dépense « ${expenseToCancel.label} » annulée.`, "info");
    setExpenseToCancel(null);
  };

  const handleConfirmDelete = () => {
    if (!expenseToDelete) return;
    deleteExpense(expenseToDelete.id);
    toast(`Dépense « ${expenseToDelete.label} » définitivement supprimée.`, "success");
    setExpenseToDelete(null);
  };

  const columns: Column<ExpenseRecord>[] = [
    {
      key: "label",
      header: "Libellé & Motif",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs md:text-sm">{item.label}</span>
          <span className="text-[11px] text-slate-500 line-clamp-1">{item.description}</span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
            Réf : {item.transactionRef} &bull; Saisi par {item.author}
          </span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Catégorie",
      render: (item) => (
        <div>
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
            {item.category}
          </span>
          {item.salaryPayrollId && (
            <span className="block text-[9px] text-indigo-700 font-bold mt-0.5">
              &bull; Fiche de paie liée
            </span>
          )}
        </div>
      ),
    },
    {
      key: "beneficiary",
      header: "Bénéficiaire & Date",
      render: (item) => (
        <div>
          <span className="font-bold text-xs text-slate-800 block">{item.beneficiary}</span>
          <span className="text-[11px] text-slate-500">{formatDate(item.date)}</span>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Montant FCFA",
      render: (item) => (
        <span className="font-black text-sm text-rose-700 tabular-nums">
          {formatFCFA(item.amount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (item) => (
        <span
          className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
            item.status === "PAYEE"
              ? "bg-emerald-100 text-emerald-800"
              : item.status === "VALIDEE"
              ? "bg-blue-100 text-blue-800"
              : item.status === "EN_ATTENTE"
              ? "bg-amber-100 text-amber-800"
              : "bg-rose-100 text-rose-800"
          }`}
        >
          {item.status === "PAYEE"
            ? "Payée (Décaissée)"
            : item.status === "VALIDEE"
            ? "Validée (À payer)"
            : item.status === "EN_ATTENTE"
            ? "En attente"
            : "Annulée"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          {item.status === "EN_ATTENTE" && (
            <>
              <button
                type="button"
                onClick={() => setExpenseToValidate(item)}
                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold"
                title="Valider la dépense"
              >
                Valider
              </button>
              <button
                type="button"
                onClick={() => setExpenseToCancel(item)}
                className="p-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100"
                title="Annuler la dépense"
              >
                <Ban className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setExpenseToDelete(item)}
                className="p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                title="Supprimer la dépense"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {item.status === "VALIDEE" && (
            <>
              <button
                type="button"
                onClick={() => setExpenseToPay(item)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-xs"
                title="Payer en espèces"
              >
                Payer espèces
              </button>
              <button
                type="button"
                onClick={() => setExpenseToCancel(item)}
                className="p-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100"
                title="Annuler l'autorisation"
              >
                <Ban className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {item.status === "ANNULEE" && (
            <button
              type="button"
              onClick={() => setExpenseToDelete(item)}
              className="p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
              title="Supprimer la dépense annulée"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {item.status === "PAYEE" && (
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sortie caisse
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Gestion des Dépenses de l'Établissement"
        subtitle="Enregistrement des motifs, validation directionnelle et traçabilité des décaissements réels en espèces"
        breadcrumbs={[{ label: "Comptabilité", href: "/comptabilite" }, { label: "Dépenses" }]}
        actions={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Engager une dépense</span>
          </button>
        }
      />

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs uppercase font-bold text-slate-400 block">Total Dépenses Engagées</span>
          <span className="text-xl font-black text-slate-900 tabular-nums">{formatFCFA(stats.totalExpenses)}</span>
          <span className="text-[11px] text-slate-500 block">{stats.count} opérations enregistrées</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs uppercase font-bold text-emerald-700 block">Dépenses Effectivement Payées</span>
          <span className="text-xl font-black text-rose-600 tabular-nums">{formatFCFA(stats.paidExpenses)}</span>
          <span className="text-[11px] text-slate-500 block">seules sorties réelles de trésorerie</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs uppercase font-bold text-amber-600 block">Dépenses en Attente / Non payées</span>
          <span className="text-xl font-black text-amber-600 tabular-nums">{formatFCFA(stats.pendingExpenses)}</span>
          <span className="text-[11px] text-slate-400 block">ne diminuent pas la caisse</span>
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
              Catégorie de dépense
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent"
            >
              <option value="ALL">Toutes les catégories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Statut
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target focus:border-school-accent"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente de validation</option>
              <option value="VALIDEE">Validée (prête pour décaissement)</option>
              <option value="PAYEE">Payée en espèces</option>
              <option value="ANNULEE">Annulée</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Rechercher par motif / bénéficiaire
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Fournisseur, SBEE, motif..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs md:text-sm text-slate-800 focus:border-school-accent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Ribbon */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Répartition des sorties effectives par catégorie :
        </h4>
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(categoryStats).map(([cat, total]) => (
            <span
              key={cat}
              className="px-3 py-1 rounded-xl bg-white border border-slate-200 font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <span>{cat} :</span>
              <strong className="text-rose-700 tabular-nums">{formatFCFA(total)}</strong>
            </span>
          ))}
          {Object.keys(categoryStats).length === 0 && (
            <span className="text-xs text-slate-400 italic">Aucune dépense payée sur cette sélection</span>
          )}
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        emptyMessage="Aucune dépense ne correspond aux critères de filtre."
      />

      {/* Create Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Engager une nouvelle dépense</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Libellé de la dépense *</label>
                <input
                  type="text"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="Ex : Achat fournitures de bureau, facture électricité..."
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Catégorie officielle *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 font-semibold"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Montant (FCFA) *</label>
                  <input
                    type="number"
                    min="1"
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 font-bold tabular-nums text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bénéficiaire / Fournisseur *</label>
                  <input
                    type="text"
                    value={formBeneficiary}
                    onChange={(e) => setFormBeneficiary(e.target.value)}
                    placeholder="Ex : Papeterie Notre Dame, SBEE..."
                    className="w-full rounded-xl border border-slate-300 py-2 px-3"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motif détaillé de la dépense *</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Justification et détails de l'achat ou de la prestation..."
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Justificatif (Nom du fichier)</label>
                <input
                  type="text"
                  value={formAttachment}
                  onChange={(e) => setFormAttachment(e.target.value)}
                  placeholder="Ex : Facture_N452.pdf, Recu_SBEE.png..."
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-600"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                Mode de règlement : <strong>Espèce exclusif</strong> &bull; La dépense sera initiée avec le statut <strong>En attente</strong>.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-school-primary text-white font-semibold hover:bg-school-700"
                >
                  Enregistrer la dépense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Validate Dialog */}
      <ConfirmDialog
        isOpen={!!expenseToValidate}
        title="Validation de la dépense"
        description={`Confirmez-vous la validation de la dépense « ${expenseToValidate?.label} » pour un montant de ${formatFCFA(expenseToValidate?.amount)} ? Cette action autorise le décaissement.`}
        confirmLabel="Valider la dépense"
        cancelLabel="Annuler"
        onConfirm={handleConfirmValidate}
        onCancel={() => setExpenseToValidate(null)}
      />

      {/* Pay Dialog */}
      <ConfirmDialog
        isOpen={!!expenseToPay}
        title="Paiement en espèces au guichet"
        description={`Êtes-vous sur le point de décaisser ${formatFCFA(expenseToPay?.amount)} en espèces pour « ${expenseToPay?.beneficiary} » ? Cette opération enregistrera une sortie effective de trésorerie.`}
        confirmLabel="Payer en espèces"
        cancelLabel="Annuler"
        onConfirm={handleConfirmPay}
        onCancel={() => setExpenseToPay(null)}
      />

      {/* Cancel Dialog */}
      <ConfirmDialog
        isOpen={!!expenseToCancel}
        title="Annulation de la dépense"
        description={`Confirmez-vous l'annulation de la dépense « ${expenseToCancel?.label} » ? Elle ne pourra plus faire l'objet d'un décaissement en caisse.`}
        confirmLabel="Confirmer l'annulation"
        cancelLabel="Garder active"
        onConfirm={handleConfirmCancel}
        onCancel={() => setExpenseToCancel(null)}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!expenseToDelete}
        title="Suppression définitive de la dépense"
        description={`Êtes-vous sûr de vouloir supprimer définitivement la dépense « ${expenseToDelete?.label} » (${formatFCFA(expenseToDelete?.amount)}) ? Cette action est irréversible.`}
        confirmLabel="Supprimer définitivement"
        cancelLabel="Conserver"
        onConfirm={handleConfirmDelete}
        onCancel={() => setExpenseToDelete(null)}
      />
    </div>
  );
}
