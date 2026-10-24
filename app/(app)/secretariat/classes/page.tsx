"use client";

import React, { useState, useMemo } from "react";
import {
  School,
  Users,
  Printer,
  ShieldAlert,
  GraduationCap,
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useSecretariatStore } from "@/lib/secretariat-store";
import { ClassRegisterPDF } from "@/components/school/ClassRegisterPDF";
import { useSubscriptionStore } from "@/lib/subscription-store";

export default function SecretariatClassesPage() {
  const { classrooms, students, stats } = useSecretariatStore();
  const { activeSchool } = useSubscriptionStore();

  const [selectedClassId, setSelectedClassId] = useState(classrooms[0]?.id || "6e-a");
  const [search, setSearch] = useState("");
  const [showPrintRegister, setShowPrintRegister] = useState(false);

  const currentClass = useMemo(() => {
    return classrooms.find((c) => c.id === selectedClassId) || classrooms[0];
  }, [classrooms, selectedClassId]);

  const classStudents = useMemo(() => {
    if (!currentClass) return [];
    return students.filter((s) => s.classId === currentClass.id);
  }, [students, currentClass]);

  const filteredClassStudents = useMemo(() => {
    return classStudents.filter((s) => {
      const q = search.toLowerCase();
      return (
        !search ||
        s.lastName.toLowerCase().includes(q) ||
        s.firstName.toLowerCase().includes(q) ||
        s.matricule?.toLowerCase().includes(q)
      );
    });
  }, [classStudents, search]);

  const totalBoys = classStudents.filter((s) => s.gender === "M").length;
  const totalGirls = classStudents.filter((s) => s.gender === "F").length;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Classes &amp; Effectifs Officiels"
        subtitle="Consultation des classes créées par la Direction, suivi des effectifs et listes d'appel officielles"
        breadcrumbs={[{ label: "Secrétariat", href: "/secretariat" }, { label: "Classes & Effectifs" }]}
        actions={
          <button
            type="button"
            onClick={() => setShowPrintRegister(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-school-primary text-white font-semibold text-xs md:text-sm shadow-sm hover:bg-school-primary/90 transition touch-target"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer la liste officielle ({currentClass?.name})</span>
          </button>
        }
      />

      {/* Règle de sécurité : Pas de création de classe au secrétariat */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-3.5 shadow-xs">
        <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold text-sm text-amber-950 block">
            Règle de Contrôle : Création des Classes Réservée à la Direction &amp; Censorat
          </strong>
          <p className="text-slate-600 leading-relaxed">
            Le secrétariat consulte les classes et génère les listes officielles. Conformément aux procédures pédagogiques,
            la <strong>création, division ou suppression de classe</strong> relève exclusivement du Directeur et du Censeur des Études.
            Toute classe créée par la Direction apparaît automatiquement et instantanément ici.
          </p>
        </div>
      </div>

      {/* Sélecteur de classe (Boutons horizontaux) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {classrooms.map((c) => {
          const isSelected = c.id === currentClass?.id;
          const classStats = stats.byClass[c.id] || { total: 0, boys: 0, girls: 0 };

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelectedClassId(c.id);
                setShowPrintRegister(false);
              }}
              className={`p-3 rounded-2xl border text-left transition shrink-0 min-w-[140px] ${
                isSelected
                  ? "bg-school-primary text-white border-school-primary shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <p className="font-extrabold text-sm">{c.name}</p>
              <p className={`text-[11px] ${isSelected ? "text-school-100" : "text-slate-500"}`}>
                {classStats.total} élèves ({c.cycle})
              </p>
            </button>
          );
        })}
      </div>

      {showPrintRegister && currentClass ? (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between no-print">
            <h3 className="font-bold text-slate-900 text-sm">Aperçu officiel avant impression</h3>
            <button
              type="button"
              onClick={() => setShowPrintRegister(false)}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
            >
              &larr; Revenir à la vue liste
            </button>
          </div>
          <ClassRegisterPDF
            classroom={currentClass}
            students={classStudents}
            onBack={() => setShowPrintRegister(false)}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Carte récapitulative de la classe active */}
          {currentClass && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900">{currentClass.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Cycle {currentClass.cycle}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Scolarité annuelle : <strong>{currentClass.tuitionFee ? `${currentClass.tuitionFee.toLocaleString()} FCFA` : "Tarif officiel"}</strong> &bull; Année Scolaire : 2026-2027
                </p>
              </div>

              <div className="flex items-center gap-6 shrink-0 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Inscrits</span>
                  <span className="text-lg font-black text-slate-900">{classStudents.length} élèves</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Garçons</span>
                  <span className="text-lg font-bold text-blue-700">{totalBoys} G</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Filles</span>
                  <span className="text-lg font-bold text-pink-700">{totalGirls} F</span>
                </div>
              </div>
            </div>
          )}

          {/* Recherche dans la classe */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={`Rechercher un élève de ${currentClass?.name || ""}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPrintRegister(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-school-primary" />
              <span>Générer registre PDF</span>
            </button>
          </div>

          {/* Liste des élèves de la classe */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">N°</th>
                    <th className="py-3 px-4">Nom &amp; Prénoms</th>
                    <th className="py-3 px-4">Matricule</th>
                    <th className="py-3 px-3">Sexe</th>
                    <th className="py-3 px-4">Date &amp; Lieu de Naissance</th>
                    <th className="py-3 px-4">Parent / Tuteur</th>
                    <th className="py-3 px-4">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClassStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        Aucun élève trouvé dans cette classe
                      </td>
                    </tr>
                  ) : (
                    filteredClassStudents.map((st, index) => (
                      <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-400">{index + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 text-xs sm:text-sm">
                          {st.lastName} {st.firstName}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-600">{st.matricule}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.gender === "M" ? "bg-blue-50 text-blue-800" : "bg-pink-50 text-pink-800"}`}>
                            {st.gender === "M" ? "M" : "F"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {st.birthDate ? new Date(st.birthDate).toLocaleDateString("fr-FR") : "-"}
                          {st.birthPlace ? ` (${st.birthPlace})` : ""}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{st.parentName || "Non renseigné"}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{st.parentPhone || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
