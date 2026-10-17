"use client";

import React, { useState, useMemo } from "react";
import {
  Download,
  Award,
  FileText,
  Printer,
  Layers,
  Sparkles,
  BookOpen,
  Lock,
  ShieldAlert,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChildSwitcher } from "@/components/school/ChildSwitcher";
import { ReportCardView } from "@/components/school/ReportCardView";
import { BeninOfficialBulletin } from "@/components/school/BeninOfficialBulletin";
import { BeninPrimaryBulletin } from "@/components/school/BeninPrimaryBulletin";
import {
  MOCK_ACADEMIC_PERIODS,
  MOCK_CLASSROOMS,
} from "@/lib/mock-bulletin-db";
import { useBulletinStore } from "@/lib/bulletin-store";
import { useCenseurStore } from "@/lib/censeur-store";
import { useAuthStore } from "@/lib/auth-store";
import { StudentProfile } from "@/lib/types/bulletin";

export default function ParentNotesPage() {
  const { user: currentUser } = useAuthStore();
  const {
    getClassBulletins,
    getPrimaryStudentBulletin,
    subjects,
    grades,
    primaryGrades,
    isBulletinPublished,
  } = useBulletinStore();
  const { studentsList, parentAccessRequests } = useCenseurStore();

  const [activeSection, setActiveSection] = useState<"NOTES" | "BULLETIN">("NOTES");

  const myChildren = useMemo(() => {
    const parentPhone = currentUser?.phone || "";
    const parentEmail = currentUser?.email || "";
    const parentId = currentUser?.id || "";
    const parentIdent = currentUser?.identifier || "";

    const activatedRequests = parentAccessRequests.filter(
      (r) =>
        (r.parentPhone === parentPhone ||
          r.parentEmail === parentEmail ||
          r.parentId === parentId ||
          r.parentId === parentIdent) &&
        r.status === "ACCEPTEE" &&
        r.isAccessActivated
    );
    const activeStudentIds = new Set(activatedRequests.map((r) => r.studentId));
    return studentsList.filter((s) => activeStudentIds.has(s.id));
  }, [parentAccessRequests, studentsList, currentUser]);

  const [selectedChild, setSelectedChild] = useState<StudentProfile | undefined>(myChildren[0]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("T1");
  const [showFullModal, setShowFullModal] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "official">("official");

  React.useEffect(() => {
    if (myChildren.length > 0) {
      if (!selectedChild || !myChildren.some((c) => c.id === selectedChild.id)) {
        setSelectedChild(myChildren[0]);
      }
    } else {
      setSelectedChild(undefined);
    }
  }, [myChildren, selectedChild]);

  const activePeriod = useMemo(() => {
    return (
      MOCK_ACADEMIC_PERIODS.find((p) => p.id === selectedPeriodId) ||
      MOCK_ACADEMIC_PERIODS[0]
    );
  }, [selectedPeriodId]);

  const activeClass = useMemo(() => {
    if (!selectedChild) return MOCK_CLASSROOMS[0] || { id: "", name: "" };
    return (
      MOCK_CLASSROOMS.find((c) => c.id === selectedChild.classId) ||
      MOCK_CLASSROOMS[0] || { id: "", name: "" }
    );
  }, [selectedChild]);

  const isPrimary = selectedChild ? (selectedChild.cycle === "PRIMAIRE" || selectedChild.classId === "ce2-b") : false;
  const isPublished = selectedChild ? isBulletinPublished(selectedChild.id, selectedChild.classId, selectedPeriodId) : false;

  // Liste des notes individuelles de l'élève pour la période sélectionnée
  const studentSubjectGrades = useMemo(() => {
    if (!selectedChild) return [];
    return subjects.map((sub) => {
      const rec = grades.find(
        (g) => g.studentId === selectedChild.id && g.subjectId === sub.id && g.periodId === selectedPeriodId
      );
      return {
        subject: sub,
        gradeRecord: rec,
      };
    });
  }, [selectedChild, subjects, grades, selectedPeriodId]);

  // Secondary Bulletin calculation
  const secondaryBulletin = useMemo(() => {
    if (!selectedChild || isPrimary || !activeClass.id) return null;
    const bulletinsMap = getClassBulletins(activeClass.id, selectedPeriodId);
    return bulletinsMap.get(selectedChild.id) || bulletinsMap.values().next().value;
  }, [selectedChild, isPrimary, getClassBulletins, activeClass?.id, selectedPeriodId, subjects, grades]);

  // Primary Competency Bulletin calculation
  const primaryBulletin = useMemo(() => {
    if (!selectedChild || !isPrimary) return null;
    return getPrimaryStudentBulletin(selectedChild.id, selectedChild.classId, selectedPeriodId);
  }, [selectedChild, isPrimary, getPrimaryStudentBulletin, selectedPeriodId, primaryGrades]);

  const handlePrint = () => {
    window.print();
  };

  if (!selectedChild) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Bulletins & Évaluations Officielles"
          subtitle="Modèle Officiel Bénin · Calculs conformes"
          breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Bulletins de notes" }]}
        />
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Aucun élève rattaché</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Veuillez rattacher votre enfant depuis l&apos;accueil de votre espace parent pour consulter ses bulletins de notes officiels.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulletins & Évaluations Officielles"
        subtitle={`Suivi pédagogique de ${selectedChild.firstName} (${selectedChild.className}) &middot; Modèle Officiel Bénin`}
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Bulletins de notes" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / Télécharger en PDF</span>
            </button>
          </div>
        }
      />

      {/* Child Switcher Component */}
      <div className="no-print">
        <ChildSwitcher
          childrenList={myChildren.map((c) => ({
            id: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            className: c.className,
            matricule: c.matricule,
            gender: c.gender,
            average: 0,
            rank: 0,
            birthDate: c.birthDate,
            parentName: c.parentName,
            parentPhone: c.parentPhone,
            status: "INSCRIT",
            absencesCount: 0,
            totalTuition: 0,
            paidTuition: 0,
            remainingTuition: 0,
            tuitionStatus: "PAID",
            classId: c.classId,
          }))}
          selectedChildId={selectedChild.id}
          onSelectChild={(child) => {
            const found = myChildren.find((s) => s.id === child.id);
            if (found) setSelectedChild(found);
          }}
        />
      </div>

      {/* Distinction claire : Notes d'évaluations individuelles vs Bulletin Trimestriel */}
      <div className="no-print flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveSection("NOTES")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeSection === "NOTES"
              ? "border-school-primary text-school-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Notes &amp; Évaluations individuelles</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("BULLETIN")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeSection === "BULLETIN"
              ? "border-school-primary text-school-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Bulletin Trimestriel Récapitulatif</span>
        </button>
      </div>

      {/* Top Filter Bar */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Trimestre académique
            </label>
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs md:text-sm font-semibold text-slate-800 touch-target min-h-[40px] focus:ring-2 focus:ring-school-primary/20"
            >
              {MOCK_ACADEMIC_PERIODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.isCurrent ? "(Trimestre Actuel)" : ""}
                </option>
              ))}
            </select>
          </div>

          {activeSection === "BULLETIN" && (
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Affichage
              </label>
              <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setViewMode("official")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    viewMode === "official"
                      ? "bg-white text-school-primary shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Bulletin Officiel Bénin (A4)
                </button>
                <button
                  type="button"
                  onClick={() => setShowFullModal(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                >
                  <Layers className="w-3.5 h-3.5 text-school-primary" />
                  <span>Gestion avancée / Lot</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {activeSection === "BULLETIN" && (
          <>
            {!isPublished ? (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl">
                <Lock className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-amber-900 block">
                    Période en cours de délibération ({activePeriod.name})
                  </span>
                  <span className="text-[11px] text-amber-800 font-medium">
                    Validation du Censeur en cours &bull; Consultation débloquée dès publication officielle
                  </span>
                </div>
              </div>
            ) : isPrimary && primaryBulletin ? (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl">
                <Sparkles className="w-7 h-7 text-emerald-700 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-emerald-800 block">
                    Maîtrise des Compétences ({primaryBulletin.period.name})
                  </span>
                  <span className="text-lg font-black text-emerald-900 tabular-nums">
                    {primaryBulletin.overallAcquisitionRate}% &middot; {primaryBulletin.acquiredCount} / {primaryBulletin.totalCompetencies} acquises
                  </span>
                  <span className="text-[11px] font-medium text-emerald-700 block">
                    Livret Primaire : <strong>Cycle Primaire &bull; Sans calcul forcé de rang</strong>
                  </span>
                </div>
              </div>
            ) : secondaryBulletin ? (
              <div className="flex items-center gap-3 bg-school-50 border border-school-100 px-4 py-2.5 rounded-xl">
                <Award className="w-7 h-7 text-school-primary shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">
                    Moyenne Générale ({secondaryBulletin.period.name})
                  </span>
                  <span className="text-lg font-black text-school-primary tabular-nums">
                    {secondaryBulletin.generalAverage.toFixed(2)} / 20 &middot; {secondaryBulletin.rankFormatted}
                  </span>
                  <span className="text-[11px] font-medium text-slate-600 block">
                    Mention : <strong className="text-slate-900 uppercase">{secondaryBulletin.mention}</strong>
                  </span>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* SECTION 1: NOTES & ÉVALUATIONS INDIVIDUELLES */}
      {activeSection === "NOTES" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <span className="font-bold">Contrôle de validation des notes :</span> Chaque note saisie par un enseignant passe par un contrôle préalable du Censeur avant d&apos;être considérée comme définitive. Les notes en attente restent provisoires jusqu&apos;à validation finale.
            </div>
          </div>

          {studentSubjectGrades.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
              Aucune matière enregistrée dans cet établissement.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Matière</th>
                      <th className="py-3 px-3 text-center">Coef</th>
                      <th className="py-3 px-3 text-center">Interro 1</th>
                      <th className="py-3 px-3 text-center">Interro 2</th>
                      <th className="py-3 px-3 text-center">Interro 3</th>
                      <th className="py-3 px-3 text-center font-bold">Devoir 1</th>
                      <th className="py-3 px-3 text-center font-bold">Devoir 2</th>
                      <th className="py-3 px-4 text-center">Statut Censeur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentSubjectGrades.map(({ subject, gradeRecord }) => {
                      const hasAny =
                        gradeRecord &&
                        (gradeRecord.interro1 !== undefined ||
                          gradeRecord.interro2 !== undefined ||
                          gradeRecord.interro3 !== undefined ||
                          gradeRecord.devoir1 !== undefined ||
                          gradeRecord.devoir2 !== undefined);

                      return (
                        <tr key={subject.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {subject.name}
                          </td>
                          <td className="py-3.5 px-3 text-center text-slate-500">
                            {subject.coef}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono">
                            {gradeRecord?.interro1 !== undefined && gradeRecord?.interro1 !== null
                              ? `${gradeRecord.interro1}/20`
                              : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono">
                            {gradeRecord?.interro2 !== undefined && gradeRecord?.interro2 !== null
                              ? `${gradeRecord.interro2}/20`
                              : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono">
                            {gradeRecord?.interro3 !== undefined && gradeRecord?.interro3 !== null
                              ? `${gradeRecord.interro3}/20`
                              : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900">
                            {gradeRecord?.devoir1 !== undefined && gradeRecord?.devoir1 !== null
                              ? `${gradeRecord.devoir1}/20`
                              : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900">
                            {gradeRecord?.devoir2 !== undefined && gradeRecord?.devoir2 !== null
                              ? `${gradeRecord.devoir2}/20`
                              : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {!hasAny ? (
                              <span className="text-xs text-slate-400 italic">Non renseignée</span>
                            ) : gradeRecord?.isValidated ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Validée par le Censeur
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3.5 h-3.5" />
                                En cours de validation
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: BULLETIN TRIMESTRIEL OFFICIEL */}
      {activeSection === "BULLETIN" && (
        <>
          {!isPublished ? (
            <div className="bg-white p-8 md:p-14 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <Lock className="w-8 h-8" />
              </div>
              <div className="max-w-lg mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Bulletin en cours de délibération &amp; validation officielle
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Les notes et évaluations de <strong>{selectedChild.firstName}</strong> pour le {activePeriod.name} sont actuellement en cours d&apos;examen par le Censeur des études.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Conformément à la réglementation de l&apos;établissement, le bulletin officiel récapitulatif reste confidentiel et indisponible jusqu&apos;à sa validation définitive et publication par l&apos;administration.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-slate-600 font-medium">
                <span>Workflow :</span>
                <span className="font-semibold text-slate-700">Enseignant (Saisie)</span>
                <span>&rarr;</span>
                <span className="font-bold text-amber-700">Censeur (Validation en cours)</span>
                <span>&rarr;</span>
                <span className="text-slate-400">Parents (Publication du Bulletin)</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="no-print bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>
                  <strong>Aperçu conforme République du Bénin :</strong>{" "}
                  {isPrimary
                    ? "Livret officiel du Cycle Primaire (MEMP), évaluation par compétences et observation qualitative."
                    : "Bulletin officiel du Cycle Secondaire (MESTFP), moyenne générale, coefficients et rangs."}
                </span>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="text-xs font-bold text-school-primary underline hover:text-school-700 ml-2 shrink-0"
                >
                  Lancer l&apos;impression
                </button>
              </div>

              <div className="bg-white p-3 md:p-6 rounded-2xl border border-slate-300 shadow-sm overflow-x-auto">
                {isPrimary && primaryBulletin ? (
                  <BeninPrimaryBulletin bulletin={primaryBulletin} />
                ) : secondaryBulletin ? (
                  <BeninOfficialBulletin bulletin={secondaryBulletin} />
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    Aucun bulletin ou livret d&apos;évaluation disponible pour cet élève sur cette période.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Advanced Modal / Batch Generator */}
      {showFullModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-4 md:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <ReportCardView
              studentId={selectedChild.id}
              periodId={selectedPeriodId}
              onClose={() => setShowFullModal(false)}
              allowBatch={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
