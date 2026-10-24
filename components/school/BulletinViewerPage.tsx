"use client";

import React, { useState, useMemo } from "react";
import {
  Award,
  Search,
  CheckCircle2,
  Lock,
  Unlock,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Filter,
  Layers,
  Sliders,
  Check,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { BeninOfficialBulletin } from "@/components/school/BeninOfficialBulletin";
import { BulletinBatchPrinter } from "@/components/school/BulletinBatchPrinter";
import { useBulletinStore } from "@/lib/bulletin-store";
import { useToast } from "@/components/ui/Toast";
import { ComputedBulletin, StudentProfile } from "@/lib/types/bulletin";

interface BulletinViewerPageProps {
  role: "directeur" | "censeur" | "secretariat" | "enseignant";
  basePath: string;
}

export const BulletinViewerPage: React.FC<BulletinViewerPageProps> = ({ role, basePath }) => {
  const { toast } = useToast();
  const {
    classrooms,
    periods,
    students,
    subjects,
    grades,
    school,
    getClassBulletins,
    getClassAnnualBulletins,
    closeAndPublishPeriod,
    reopenPeriod,
    isPeriodClosed,
  } = useBulletinStore();

  // Filtres
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || "");
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("T1"); // "T1", "T2", "T3" ou "ANNUEL"
  const [passingThreshold, setPassingThreshold] = useState<number>(10.0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isBatchPrinting, setIsBatchPrinting] = useState<boolean>(false);

  // Synchroniser la classe sélectionnée si la liste change
  React.useEffect(() => {
    if (classrooms.length > 0 && (!selectedClassId || !classrooms.some((c) => c.id === selectedClassId))) {
      setSelectedClassId(classrooms[0].id);
    }
  }, [classrooms, selectedClassId]);

  const activeClass = useMemo(() => {
    return classrooms.find((c) => c.id === selectedClassId) || classrooms[0];
  }, [classrooms, selectedClassId]);

  const isAnnual = selectedPeriodId === "ANNUEL";
  const periodClosed = !isAnnual && isPeriodClosed(selectedPeriodId);

  // Calcul des bulletins (Périodique ou Annuel)
  const bulletinsMap: Map<string, ComputedBulletin> = useMemo(() => {
    if (!activeClass?.id) return new Map();
    if (isAnnual) {
      return getClassAnnualBulletins(activeClass.id, passingThreshold);
    }
    return getClassBulletins(activeClass.id, selectedPeriodId);
  }, [getClassBulletins, getClassAnnualBulletins, activeClass?.id, selectedPeriodId, isAnnual, passingThreshold, subjects, grades]);

  // Élèves de la classe active
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === activeClass?.id);
  }, [students, activeClass?.id]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(classStudents[0]?.id || "");

  React.useEffect(() => {
    if (classStudents.length > 0 && (!selectedStudentId || !classStudents.some((s) => s.id === selectedStudentId))) {
      setSelectedStudentId(classStudents[0].id);
    }
  }, [classStudents, selectedStudentId]);

  // Élèves filtrés par recherche
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return classStudents;
    return classStudents.filter(
      (s) =>
        s.lastName.toLowerCase().includes(q) ||
        s.firstName.toLowerCase().includes(q) ||
        s.matricule.toLowerCase().includes(q) ||
        (s.educMasterNumber && s.educMasterNumber.toLowerCase().includes(q))
    );
  }, [classStudents, searchQuery]);

  // Bulletin de l'élève sélectionné
  const currentBulletin = useMemo(() => {
    if (!selectedStudentId) {
      return bulletinsMap.values().next().value || null;
    }
    return bulletinsMap.get(selectedStudentId) || bulletinsMap.values().next().value || null;
  }, [bulletinsMap, selectedStudentId]);

  // Liste de tous les bulletins de la classe pour l'impression batch
  const allClassBulletins: ComputedBulletin[] = useMemo(() => {
    return classStudents
      .map((s) => bulletinsMap.get(s.id))
      .filter((b): b is ComputedBulletin => Boolean(b));
  }, [classStudents, bulletinsMap]);

  // Navigation élève suivant / précédent
  const currentIndex = filteredStudents.findIndex((s) => s.id === selectedStudentId);
  const handleNextStudent = () => {
    if (currentIndex < filteredStudents.length - 1) {
      setSelectedStudentId(filteredStudents[currentIndex + 1].id);
    }
  };
  const handlePrevStudent = () => {
    if (currentIndex > 0) {
      setSelectedStudentId(filteredStudents[currentIndex - 1].id);
    }
  };

  // Déclenchement de l'impression
  const handlePrintIndividual = () => {
    setIsBatchPrinting(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintWholeClass = () => {
    setIsBatchPrinting(true);
    toast("Préparation de l'impression de toute la classe en un seul PDF...", "info");
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Clôture du trimestre/semestre par le DIRECTEUR
  const handleToggleClosePeriod = () => {
    if (periodClosed) {
      reopenPeriod(selectedPeriodId);
      toast(`La période a été rouverte pour des ajustements administratifs.`, "info");
    } else {
      const pName = periods.find((p) => p.id === selectedPeriodId)?.name || selectedPeriodId;
      closeAndPublishPeriod(selectedPeriodId, school.directorName || "Direction de l'Établissement");
      toast(
        `Félicitations ! Le ${pName} a été clôturé officiellement. Les bulletins sont désormais consultables par les parents.`,
        "success"
      );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* En-tête de page (masqué à l'impression) */}
      <div className="no-print">
        <PageHeader
          title={isAnnual ? "Bulletins Annuels & Décisions de Passage" : "Bulletins Périodiques & Délibérations"}
          subtitle="Modèle officiel béninois conforme · Calcul automatique, rangs, moyennes et export PDF"
          breadcrumbs={[
            { label: role.charAt(0).toUpperCase() + role.slice(1), href: basePath },
            { label: "Bulletins scolaires" },
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {/* BOUTON DU DIRECTEUR : CLÔTURE ET PUBLICATION DU SEMESTRE */}
              {role === "directeur" && !isAnnual && (
                <button
                  type="button"
                  onClick={handleToggleClosePeriod}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                    periodClosed
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                  title={
                    periodClosed
                      ? "Période déjà clôturée. Cliquer pour rouvrir en cas de correction exceptionnelle."
                      : "Clôturer officiellement la période et débloquer les bulletins pour les parents."
                  }
                >
                  {periodClosed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Trimestre Clôturé &amp; Publié</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Clôturer &amp; Publier la période</span>
                    </>
                  )}
                </button>
              )}

              {/* Bouton d'impression individuel */}
              <button
                type="button"
                onClick={handlePrintIndividual}
                disabled={!currentBulletin}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition touch-target"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Imprimer cet élève (PDF)</span>
              </button>

              {/* Bouton d'impression de toute la classe en un seul PDF */}
              <button
                type="button"
                onClick={handlePrintWholeClass}
                disabled={allClassBulletins.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary text-white font-bold text-xs hover:bg-school-700 shadow-sm transition touch-target"
              >
                <Layers className="w-4 h-4" />
                <span>Imprimer toute la classe (1 PDF)</span>
              </button>
            </div>
          }
        />
      </div>

      {/* Barre de Filtres Principaux (masquée à l'impression) */}
      <div className="no-print bg-white rounded-3xl border border-slate-200 p-4 md:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* 1. Sélection de la Classe */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-school-primary" />
              <span>Classe :</span>
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-school-primary"
            >
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({students.filter((s) => s.classId === c.id).length} élèves)
                </option>
              ))}
            </select>
          </div>

          {/* 2. Sélection de la Période (Trimestres ou Annuel) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-school-primary" />
              <span>Période / Type :</span>
            </label>
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-school-primary"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              <option value="ANNUEL">
                ★ BULLETIN ANNUEL (Passage de classe)
              </option>
            </select>
          </div>

          {/* 3. Seuil de passage si Annuel */}
          {isAnnual ? (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                <span>Seuil de passage :</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="8"
                  max="14"
                  value={passingThreshold}
                  onChange={(e) => setPassingThreshold(parseFloat(e.target.value) || 10)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/50 text-xs font-black text-slate-900 text-center"
                />
                <span className="text-xs font-bold text-slate-500">/ 20</span>
              </div>
            </div>
          ) : (
            /* État de publication / Clôture */
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Statut de consultation :</label>
              <div className="flex items-center h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                {periodClosed ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Visible par les parents</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>En cours de saisie (non clôturé)</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 4. Recherche rapide d'élève */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Rechercher un élève :</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nom, matricule..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-school-primary"
              />
            </div>
          </div>
        </div>

        {/* Sélecteur d'élève avec indicateurs de rang et moyenne */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevStudent}
              disabled={currentIndex <= 0}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
              title="Élève précédent"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>

            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 min-w-[240px] focus:outline-none focus:ring-2 focus:ring-school-primary"
            >
              {filteredStudents.map((s, idx) => {
                const b = bulletinsMap.get(s.id);
                const avgText = b && b.totalCoef > 0 ? `${b.generalAverage.toFixed(2)}/20` : "Sans note";
                const rankText = b?.rankFormatted || "—";
                return (
                  <option key={s.id} value={s.id}>
                    {idx + 1}. {s.lastName.toUpperCase()} {s.firstName} ({avgText} &bull; Rang: {rankText})
                  </option>
                );
              })}
            </select>

            <button
              type="button"
              onClick={handleNextStudent}
              disabled={currentIndex >= filteredStudents.length - 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
              title="Élève suivant"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>
              Élève <strong>{currentIndex + 1}</strong> sur <strong>{filteredStudents.length}</strong>
            </span>
            <span className="text-slate-300">&bull;</span>
            <span>Effectif réel classe : <strong>{classStudents.length}</strong></span>
          </div>
        </div>
      </div>

      {/* ZONE D'APERÇU DU BULLETIN OFFICIEL */}
      <div>
        {classStudents.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Aucun élève dans cette classe</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Veuillez inscrire ou affecter des élèves dans cette classe pour générer leurs bulletins scolaires officiels.
            </p>
          </div>
        ) : isBatchPrinting ? (
          /* Mode impression multipages de toute la classe */
          <div className="space-y-4">
            <div className="no-print p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs text-indigo-900">
              <span className="font-semibold">
                Affichage prêt pour impression groupée : {allClassBulletins.length} bulletins prêts à imprimer en 1 seul PDF.
              </span>
              <button
                type="button"
                onClick={() => setIsBatchPrinting(false)}
                className="font-bold underline hover:text-indigo-950"
              >
                Revenir à l&apos;aperçu individuel
              </button>
            </div>
            <BulletinBatchPrinter bulletins={allClassBulletins} customLogoUrl={school.logoUrl} />
          </div>
        ) : currentBulletin ? (
          /* Mode aperçu individuel interactif */
          <div className="overflow-x-auto pb-4">
            <BeninOfficialBulletin bulletin={currentBulletin} customLogoUrl={school.logoUrl} />
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <p className="text-xs text-slate-500">Chargement des données du bulletin...</p>
          </div>
        )}
      </div>
    </div>
  );
};
