"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpenCheck,
  Calendar,
  Printer,
  ShieldAlert,
  Search,
  CheckCircle2,
  Lock,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  Award,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useSecretariatStore } from "@/lib/secretariat-store";
import { useBulletinStore } from "@/lib/bulletin-store";
import { useToast } from "@/components/ui/Toast";

export default function SecretariatExamensPage() {
  const { toast } = useToast();
  const { classrooms, students } = useSecretariatStore();
  const { grades, subjects, bulletinStatuses } = useBulletinStore();

  const [activeTab, setActiveTab] = useState<"EXAMS" | "RESULTS">("RESULTS");
  const [selectedClassId, setSelectedClassId] = useState(classrooms[0]?.id || "6e-a");
  const [selectedPeriod, setSelectedPeriod] = useState("T1");
  const [search, setSearch] = useState("");

  const currentClass = useMemo(() => {
    return classrooms.find((c) => c.id === selectedClassId) || classrooms[0];
  }, [classrooms, selectedClassId]);

  const classStudents = useMemo(() => {
    if (!currentClass) return [];
    return students.filter((s) => s.classId === currentClass.id);
  }, [students, currentClass]);

  // Exam schedules mock
  const examSchedules = useMemo(() => {
    return [
      {
        id: "ex-01",
        className: "6ème A",
        subject: "Français (Composition & Dictée)",
        date: "2026-11-23",
        time: "08:00 - 10:00",
        room: "Salle 04",
        status: "PROGRAMME",
      },
      {
        id: "ex-02",
        className: "6ème A",
        subject: "Mathématiques",
        date: "2026-11-23",
        time: "10:30 - 12:30",
        room: "Salle 04",
        status: "PROGRAMME",
      },
      {
        id: "ex-03",
        className: "5ème A",
        subject: "Histoire-Géographie",
        date: "2026-11-24",
        time: "08:00 - 10:00",
        room: "Salle 12",
        status: "PROGRAMME",
      },
      {
        id: "ex-04",
        className: "3ème A",
        subject: "Physique, Chimie & Technologie (PCT)",
        date: "2026-11-25",
        time: "08:00 - 10:30",
        room: "Laboratoire 1",
        status: "PROGRAMME",
      },
    ];
  }, []);

  const handlePrintBulletin = (studentName: string) => {
    toast(`Lancement de l'impression du bulletin officiel pour ${studentName}...`, "info");
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Examens &amp; Résultats Scolaires Validés"
        subtitle="Consultation des calendriers officiels, délibérations validées et impression des bulletins de notes"
        breadcrumbs={[{ label: "Secrétariat", href: "/secretariat" }, { label: "Examens & Résultats" }]}
      />

      {/* Règle de verrouillage des notes */}
      <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-rose-950 flex items-start gap-3.5 shadow-xs">
        <Lock className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold text-sm text-rose-950 block">
            Règle de Sécurité Pédagogique : Verrouillage Strict des Notes
          </strong>
          <p className="text-slate-600 leading-relaxed">
            Le Secrétariat pédagogique a un droit de <strong>consultation des résultats</strong> et d&apos;<strong>impression des bulletins officiels</strong> validés par le conseil des professeurs.
            <strong className="text-rose-900"> Aucune note ou moyenne ne peut être modifiée par le secrétariat</strong>.
            Toute rectification de note requiert obligatoirement la saisie par l&apos;enseignant de la matière et la validation formelle par le Censeur des Études.
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("RESULTS")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === "RESULTS"
              ? "border-school-primary text-school-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Résultats &amp; Bulletins Validés</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("EXAMS")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === "EXAMS"
              ? "border-school-primary text-school-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendrier des Sessions d&apos;Examens</span>
        </button>
      </div>

      {activeTab === "RESULTS" && (
        <div className="space-y-4">
          {/* Sélecteurs de classe et trimestre */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <label className="font-bold text-slate-700">Classe :</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-slate-800 bg-white"
              >
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.cycle})
                  </option>
                ))}
              </select>

              <label className="font-bold text-slate-700 ml-2">Période :</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-slate-800 bg-white"
              >
                <option value="T1">1er Trimestre</option>
                <option value="T2">2ème Trimestre</option>
                <option value="T3">3ème Trimestre</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Délibérations validées par le Censorat</span>
              </span>
            </div>
          </div>

          {/* Tableau des moyennes de classe */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Procès-Verbal des Résultats &mdash; {currentClass?.name} ({selectedPeriod})
                </h4>
                <p className="text-xs text-slate-500">
                  Notes scellées en lecture seule &bull; Prêtes pour l&apos;impression des bulletins
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer les bulletins du groupe</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Rang</th>
                    <th className="py-3 px-4">Élève</th>
                    <th className="py-3 px-3">Matricule</th>
                    <th className="py-3 px-3">Moyenne Générale</th>
                    <th className="py-3 px-3">Mention</th>
                    <th className="py-3 px-3">Statut Notes</th>
                    <th className="py-3 px-4 text-right">Bulletin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((st, index) => {
                    const fakeAvg = (14.8 - index * 0.9).toFixed(2);
                    const mention =
                      parseFloat(fakeAvg) >= 14
                        ? "Bien"
                        : parseFloat(fakeAvg) >= 12
                        ? "Assez Bien"
                        : parseFloat(fakeAvg) >= 10
                        ? "Passable"
                        : "Insuffisant";

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {index === 0 ? "1er" : `${index + 1}ème`}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {st.lastName} {st.firstName}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">{st.matricule}</td>
                        <td className="py-3 px-3">
                          <span className="font-black text-sm text-school-primary">
                            {fakeAvg} / 20
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{mention}</td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Lock className="w-3 h-3" />
                            <span>Validé Censeur</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handlePrintBulletin(`${st.lastName} ${st.firstName}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-bold hover:bg-teal-100 transition"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Imprimer</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "EXAMS" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm">
              Calendrier des Épreuves et Devoirs Surveillés
            </h4>
            <p className="text-xs text-slate-500">
              Planification pédagogique établie par le Censeur des Études
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {examSchedules.map((ex) => (
              <div key={ex.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{ex.subject}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                      {ex.className}
                    </span>
                  </div>
                  <p className="text-slate-500">
                    Salle : <strong>{ex.room}</strong> &bull; Horaires : <strong>{ex.time}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {ex.date}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    {ex.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
