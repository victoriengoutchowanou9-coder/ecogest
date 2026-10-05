"use client";

import React from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Users2,
  Clock,
  ArrowRight,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatFCFA, formatDate } from "@/lib/utils";
import { MOCK_FINANCIAL_STATS, MOCK_RECEIPTS } from "@/lib/mock-data";

export default function ComptabiliteDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord Financier"
        subtitle="Suivi des encaissements de scolarité, trésorerie et gestion des impayés"
        breadcrumbs={[{ label: "Comptabilité" }, { label: "Tableau de bord" }]}
        actions={
          <Link
            href="/comptabilite/paiement"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Encaisser un paiement</span>
          </Link>
        }
      />

      {/* Top 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Attendu"
          value={formatFCFA(MOCK_FINANCIAL_STATS.totalExpected)}
          subtitle="Exercice 2026-2027"
          icon={<DollarSign className="w-6 h-6" />}
          variant="default"
        />
        <StatCard
          title="Total Encaissé"
          value={formatFCFA(MOCK_FINANCIAL_STATS.totalCollected)}
          subtitle={`${MOCK_FINANCIAL_STATS.collectionRate}% de recouvrement`}
          icon={<TrendingUp className="w-6 h-6" />}
          trend={{ value: "+12.4% ce mois", isPositive: true }}
          variant="success"
        />
        <StatCard
          title="Solde Restant"
          value={formatFCFA(MOCK_FINANCIAL_STATS.totalRemaining)}
          subtitle="À percevoir sur l'année"
          icon={<Clock className="w-6 h-6" />}
          variant="warning"
        />
        <StatCard
          title="Retards & Impayés"
          value={`${MOCK_FINANCIAL_STATS.unpaidCount} élèves`}
          subtitle="Tranches échues"
          icon={<AlertTriangle className="w-6 h-6" />}
          variant="danger"
        />
      </div>

      {/* Grid: Monthly Trend & Recent Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Bar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Évolution mensuelle des encaissements</h3>
              <p className="text-xs text-slate-500">Montants comparés en FCFA</p>
            </div>
            <Link
              href="/comptabilite/eleves"
              className="text-xs font-semibold text-school-primary hover:underline"
            >
              Fichier élèves &rarr;
            </Link>
          </div>

          {/* Simple custom responsive bar visualization */}
          <div className="space-y-3 pt-2">
            {MOCK_FINANCIAL_STATS.monthlyTrend.map((m) => {
              const pct = Math.min(100, Math.round((m.encaisse / m.attendu) * 100));
              return (
                <div key={m.month} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{m.month}</span>
                    <span className="text-slate-500 tabular-nums">
                      <strong className="text-slate-800">{formatFCFA(m.encaisse)}</strong> / {formatFCFA(m.attendu)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-school-primary rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Payments List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Derniers règlements</h3>
            <Link
              href="/comptabilite/recus"
              className="text-xs font-semibold text-school-primary hover:underline"
            >
              Tous les reçus &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100 space-y-1">
            {MOCK_RECEIPTS.slice(0, 4).map((rec) => (
              <div key={rec.id} className="py-2.5 flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{rec.studentName}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {rec.receiptNumber} &middot; {rec.paymentMethod.replace("_", " ")}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 tabular-nums block">
                    {formatFCFA(rec.amount)}
                  </span>
                  <span className="text-[10px] text-slate-400">{formatDate(rec.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
