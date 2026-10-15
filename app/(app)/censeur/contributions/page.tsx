"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  DollarSign,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  ShieldAlert,
  Info,
  ChevronRight,
  UserX,
  CreditCard,
  Building,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useFinanceStore } from "@/lib/finance-store";
import { TuitionStatus } from "@/lib/mock-finance-db";

export default function CenseurContributionsPage() {
  const { students } = useFinanceStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | TuitionStatus>("ALL");

  // Distinct classes from student tuition records
  const classList = useMemo(() => {
    const map = new Map<string, string>();
    students.forEach((s) => {
      if (!map.has(s.classId)) {
        map.set(s.classId, s.className);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [students]);

  // Dynamic pedagogical contribution alerts
  const lateCount = useMemo(() => students.filter((s) => s.tuitionStatus === "LATE").length, [students]);
  const unpaidCount = useMemo(() => students.filter((s) => s.tuitionStatus === "UNPAID").length, [students]);
  const partialCount = useMemo(() => students.filter((s) => s.tuitionStatus === "PARTIAL").length, [students]);
  const paidCount = useMemo(() => students.filter((s) => s.tuitionStatus === "PAID").length, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const fullName = `${s.lastName} ${s.firstName}`.toLowerCase();
      const matchSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        s.matricule.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.className.toLowerCase().includes(searchQuery.toLowerCase());

      const matchClass = selectedClass === "all" || s.classId === selectedClass;
      const matchStatus = selectedStatus === "ALL" || s.tuitionStatus === selectedStatus;

      return matchSearch && matchClass && matchStatus;
    });
  }, [students, searchQuery, selectedClass, selectedStatus]);

  const getStatusBadge = (status: TuitionStatus) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Soldé / En règle
          </span>
        );
      case "PARTIAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Paiement partiel
          </span>
        );
      case "LATE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" />
            En retard d&apos;échéance
          </span>
        );
      case "UNPAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <UserX className="w-3.5 h-3.5" />
            Impayé total
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suivi des Contributions Scolaires"
        subtitle="Consultation pédagogique des états de paiement pour l'accès aux évaluations et autorisations"
        breadcrumbs={[{ label: "Censeur", href: "/censeur" }, { label: "Suivi des contributions" }]}
      />

      {/* Official Role Notice: Read-only pedagogical alert banner */}
      <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3.5 text-amber-900 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs leading-relaxed">
          <p className="font-bold text-amber-950">
            Règle de séparation des rôles (Consultation Pédagogique Réservée) :
          </p>
          <p className="text-amber-800">
            Cet espace permet au Censeur d&apos;identifier les élèves à jour pour les autorisations
            de composition aux examens et les convocations de parents. Les encaissements en espèces
            et la gestion de caisse relèvent exclusivement du service{" "}
            <strong>Comptabilité & Finances</strong>.
          </p>
        </div>
      </div>

      {/* KPI Dynamic Pedagogical Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Contributions en retard"
          value={`${lateCount} élèves`}
          subtitle="Échéance dépassée — Alerte Censorat"
          icon={<AlertCircle className="w-6 h-6" />}
          variant={lateCount > 0 ? "danger" : "default"}
        />
        <StatCard
          title="Soldes impayés"
          value={`${unpaidCount} élèves`}
          subtitle="Aucun versement enregistré"
          icon={<UserX className="w-6 h-6" />}
          variant={unpaidCount > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Paiements partiels"
          value={`${partialCount} élèves`}
          subtitle="Suivi de la prochaine tranche"
          icon={<Clock className="w-6 h-6" />}
          variant="info"
        />
        <StatCard
          title="Élèves en règle"
          value={`${paidCount} élèves`}
          subtitle="Scolarité intégralement soldée"
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="success"
        />
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher nom élève, matricule, classe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-school-primary"
          >
            <option value="all">Toutes les classes</option>
            {classList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as "ALL" | TuitionStatus)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-school-primary"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="LATE">En retard d&apos;échéance ({lateCount})</option>
            <option value="UNPAID">Impayé ({unpaidCount})</option>
            <option value="PARTIAL">Paiement partiel ({partialCount})</option>
            <option value="PAID">Soldé / En règle ({paidCount})</option>
          </select>
        </div>
      </div>

      {/* Students Contribution Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              État des contributions scolaires ({filteredStudents.length} élèves)
            </h3>
            <p className="text-xs text-slate-500">
              Données comptables synchronisées en direct avec la caisse
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
            {filteredStudents.filter((s) => s.tuitionStatus === "PAID").length} /{" "}
            {filteredStudents.length} en règle
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-700">Aucun élève trouvé</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Aucun dossier ne correspond à vos filtres de recherche.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Élève & Matricule</th>
                  <th className="py-3 px-4">Classe</th>
                  <th className="py-3 px-4 text-right">Frais totaux</th>
                  <th className="py-3 px-4 text-right">Versé</th>
                  <th className="py-3 px-4 text-right">Reste à payer</th>
                  <th className="py-3 px-4 text-center">Statut contribution</th>
                  <th className="py-3 px-4">Échéance / Dernier versement</th>
                  <th className="py-3 px-4 text-center">Droit de composition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map((s) => {
                  const isEligibleToExam = s.tuitionStatus === "PAID" || s.tuitionStatus === "PARTIAL";
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {s.lastName} {s.firstName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">{s.matricule}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{s.className}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700">
                        {s.totalTuition.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                        {s.paidTuition.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-700">
                        {s.remainingTuition.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="py-3 px-4 text-center">{getStatusBadge(s.tuitionStatus)}</td>
                      <td className="py-3 px-4">
                        {s.nextDueDate ? (
                          <div className="text-[11px]">
                            <span className="text-slate-500">Échéance : </span>
                            <span className="font-semibold text-slate-800">{s.nextDueDate}</span>
                          </div>
                        ) : s.lastPaymentDate ? (
                          <div className="text-[11px] text-slate-500">
                            Soldé le {s.lastPaymentDate}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEligibleToExam ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Autorisé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            Bloqué (Moratoire requis)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
