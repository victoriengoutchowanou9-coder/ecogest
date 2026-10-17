"use client";

import React from "react";
import {
  BarChart3,
  Users,
  GraduationCap,
  Printer,
  Download,
  School,
  ArrowRightLeft,
  UserMinus,
  CheckCircle2,
  PieChart,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useSecretariatStore } from "@/lib/secretariat-store";
import { useSubscriptionStore } from "@/lib/subscription-store";

export default function SecretariatRapportsPage() {
  const { stats, classrooms, students, documents } = useSecretariatStore();
  const { activeSchool } = useSubscriptionStore();

  const handlePrintReport = () => {
    window.print();
  };

  const parityRatio =
    stats.totalEnrolled > 0
      ? Math.round((stats.girlsCount / stats.totalEnrolled) * 100)
      : 50;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Rapports &amp; Statistiques d'Effectifs"
        subtitle={`Bilan démographique, parité garçons/filles et flux d'inscriptions de ${activeSchool.name}`}
        breadcrumbs={[{ label: "Secrétariat", href: "/secretariat" }, { label: "Rapports" }]}
        actions={
          <button
            type="button"
            onClick={handlePrintReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-school-primary text-white font-semibold text-xs md:text-sm shadow-sm hover:bg-school-primary/90 transition touch-target"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer le rapport de rentrée</span>
          </button>
        }
      />

      {/* Synthèse générale */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Effectif Total Inscrit
          </span>
          <p className="text-3xl font-black text-slate-900">{stats.totalEnrolled}</p>
          <p className="text-xs text-emerald-600 font-semibold">{stats.activeStudents} élèves assidus</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Répartition Paritaire
          </span>
          <p className="text-3xl font-black text-school-primary">{parityRatio}%</p>
          <p className="text-xs text-slate-500 font-semibold">
            {stats.boysCount} Garçons ({100 - parityRatio}%) &bull; {stats.girlsCount} Filles ({parityRatio}%)
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Nouveaux Inscrits
          </span>
          <p className="text-3xl font-black text-emerald-700">{stats.newStudents}</p>
          <p className="text-xs text-slate-500 font-semibold">Inscrits en session 2026</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Mouvements &amp; Départs
          </span>
          <p className="text-3xl font-black text-purple-700">
            {stats.transferredStudents + stats.droppedOutStudents}
          </p>
          <p className="text-xs text-slate-500 font-semibold">
            {stats.transferredStudents} transférés &bull; {stats.droppedOutStudents} sortants
          </p>
        </div>
      </div>

      {/* Tableau détaillé des effectifs par classe */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Tableau Démographique par Classe &amp; Division
            </h3>
            <p className="text-xs text-slate-500">
              Données officielles consolidées pour le Ministère &bull; Année Scolaire 2026 - 2027
            </p>
          </div>
          <button
            type="button"
            onClick={handlePrintReport}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Classe</th>
                <th className="py-3 px-3">Cycle</th>
                <th className="py-3 px-4">Professeur Titulaire</th>
                <th className="py-3 px-3 text-right">Garçons</th>
                <th className="py-3 px-3 text-right">Filles</th>
                <th className="py-3 px-3 text-right">Total Inscrit</th>
                <th className="py-3 px-3 text-right">Capacité</th>
                <th className="py-3 px-4 text-right">Taux d&apos;occupation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classrooms.map((c) => {
                const s = stats.byClass[c.id] || { total: 0, boys: 0, girls: 0, name: c.name };
                const occRate = c.size > 0 ? Math.round((s.total / c.size) * 100) : 0;

                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">{c.name}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {c.cycle}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {c.mainTeacher || "Non assigné"}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-blue-700">{s.boys}</td>
                    <td className="py-3.5 px-3 text-right font-bold text-pink-700">{s.girls}</td>
                    <td className="py-3.5 px-3 text-right font-black text-slate-900 text-sm">
                      {s.total}
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-500 font-mono">{c.size} places</td>
                    <td className="py-3.5 px-4 text-right font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          occRate >= 90
                            ? "bg-rose-100 text-rose-800"
                            : occRate >= 70
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {occRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td className="py-3.5 px-4" colSpan={3}>
                  TOTAL ÉTABLISSEMENT
                </td>
                <td className="py-3.5 px-3 text-right text-blue-800">{stats.boysCount} G</td>
                <td className="py-3.5 px-3 text-right text-pink-800">{stats.girlsCount} F</td>
                <td className="py-3.5 px-3 text-right text-base text-school-primary">
                  {stats.totalEnrolled} élèves
                </td>
                <td className="py-3.5 px-3 text-right text-slate-600">
                  {classrooms.reduce((acc, c) => acc + (c.size || 0), 0)} places
                </td>
                <td className="py-3.5 px-4 text-right">
                  {classrooms.reduce((acc, c) => acc + (c.size || 0), 0) > 0
                    ? Math.round(
                        (stats.totalEnrolled /
                          classrooms.reduce((acc, c) => acc + (c.size || 0), 0)) *
                          100
                      )
                    : 0}
                  %
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
