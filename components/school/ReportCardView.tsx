"use client";

import React from "react";
import { Printer, Download, Award, ShieldCheck, X } from "lucide-react";
import { CURRENT_SCHOOL } from "@/lib/permissions";
import { Student } from "@/lib/mock-data";

export interface ReportSubject {
  name: string;
  category: "LITTÉRAIRE" | "SCIENTIFIQUE" | "AUTRE";
  coef: number;
  interros: number[];
  devoir: number;
  moyenne: number;
  rang: number;
  appreciation: string;
  professeur: string;
}

interface ReportCardViewProps {
  student: Student;
  period?: string;
  onClose?: () => void;
  subjects?: ReportSubject[];
}

const DEFAULT_SUBJECTS: ReportSubject[] = [
  {
    name: "Français",
    category: "LITTÉRAIRE",
    coef: 3,
    interros: [14.0, 13.5],
    devoir: 15.0,
    moyenne: 14.3,
    rang: 4,
    appreciation: "Bonne maîtrise de l'expression écrite et analyse solide.",
    professeur: "M. TOSSOU K."
  },
  {
    name: "Anglais",
    category: "LITTÉRAIRE",
    coef: 2,
    interros: [17.0, 18.0],
    devoir: 16.5,
    moyenne: 17.0,
    rang: 1,
    appreciation: "Excellent niveau d'expression et aisance remarquable.",
    professeur: "Mme DOSSOU S."
  },
  {
    name: "Histoire-Géographie",
    category: "LITTÉRAIRE",
    coef: 2,
    interros: [15.0, 16.0],
    devoir: 15.5,
    moyenne: 15.4,
    rang: 3,
    appreciation: "Travail très sérieux et rigoureux.",
    professeur: "M. BIO G."
  },
  {
    name: "Mathématiques",
    category: "SCIENTIFIQUE",
    coef: 3,
    interros: [16.5, 15.0],
    devoir: 17.0,
    moyenne: 16.3,
    rang: 2,
    appreciation: "Très bon esprit de logique et régularité exemplaire.",
    professeur: "M. HOUNNOU E."
  },
  {
    name: "Physique, Chimie & Technologie (PCT)",
    category: "SCIENTIFIQUE",
    coef: 2,
    interros: [15.0, 14.0],
    devoir: 16.0,
    moyenne: 15.3,
    rang: 3,
    appreciation: "Notions scientifiques bien assimilées.",
    professeur: "M. GBEDO P."
  },
  {
    name: "Sciences de la Vie et de la Terre (SVT)",
    category: "SCIENTIFIQUE",
    coef: 2,
    interros: [13.0, 14.0],
    devoir: 14.5,
    moyenne: 14.0,
    rang: 6,
    appreciation: "Résultats satisfaisants, continuez ainsi.",
    professeur: "Mme KOUDJO F."
  },
  {
    name: "Éducation Physique et Sportive (EPS)",
    category: "AUTRE",
    coef: 1,
    interros: [16.0],
    devoir: 16.0,
    moyenne: 16.0,
    rang: 5,
    appreciation: "Très bonne participation et discipline.",
    professeur: "M. AKPOVI J."
  }
];

export const ReportCardView: React.FC<ReportCardViewProps> = ({
  student,
  period = "1er Semestre",
  onClose,
  subjects = DEFAULT_SUBJECTS,
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Calculations
  const totalCoef = subjects.reduce((acc, s) => acc + s.coef, 0);
  const totalPoints = subjects.reduce((acc, s) => acc + (s.moyenne * s.coef), 0);
  const generalAverage = totalCoef > 0 ? Number((totalPoints / totalCoef).toFixed(2)) : 0;
  
  const classStats = {
    classSize: 42,
    highestAvg: 17.45,
    lowestAvg: 7.20,
    classAvg: 12.85,
    rank: student.rank || 3,
  };

  const getCouncilAppreciation = (avg: number) => {
    if (avg >= 16) return { mention: "TRÈS BIEN", badge: "Tableau d'Honneur avec Félicitations", color: "text-emerald-700" };
    if (avg >= 14) return { mention: "BIEN", badge: "Tableau d'Honneur avec Encouragements", color: "text-blue-700" };
    if (avg >= 12) return { mention: "ASSEZ BIEN", badge: "Tableau d'Honneur", color: "text-indigo-700" };
    if (avg >= 10) return { mention: "PASSABLE", badge: "Peut mieux faire", color: "text-amber-700" };
    return { mention: "INSUFFISANT", badge: "Avertissement travail", color: "text-red-700" };
  };

  const council = getCouncilAppreciation(generalAverage);

  return (
    <div className="space-y-4">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">Bulletin Officiel de Notes</h2>
          <p className="text-xs text-slate-500">Document légal conforme aux normes ministérielles</p>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg touch-target"
            >
              <X className="w-4 h-4" />
              <span>Fermer</span>
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-school-primary text-white text-xs font-semibold rounded-lg hover:bg-school-700 shadow-sm touch-target"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer / PDF</span>
          </button>
        </div>
      </div>

      {/* Official Printable Bulletin Document */}
      <div className="receipt-container bg-white p-6 md:p-8 rounded-2xl border border-slate-300 shadow-sm text-slate-900 space-y-5">
        
        {/* Official Header */}
        <div className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-4 text-center">
          <div className="text-left text-[11px] leading-tight text-slate-700 uppercase font-semibold">
            <p>RÉPUBLIQUE DU BÉNIN</p>
            <p className="text-[10px] text-slate-500 font-normal">Ministère des Enseignements Secondaire, Technique et de la Formation Professionnelle</p>
            <p className="text-[10px] text-slate-500 font-normal mt-0.5">DDESTFP - Littoral</p>
          </div>

          <div className="space-y-1">
            <div className="w-10 h-10 mx-auto rounded-full bg-school-primary text-white font-black flex items-center justify-center text-base shadow-sm">
              E
            </div>
            <h1 className="text-sm font-extrabold text-school-primary uppercase tracking-tight">
              {CURRENT_SCHOOL.name}
            </h1>
            <p className="text-[9px] text-slate-500 italic">{CURRENT_SCHOOL.devise}</p>
          </div>

          <div className="text-right text-[11px] leading-tight text-slate-700">
            <p className="font-bold">ANNÉE SCOLAIRE</p>
            <p className="text-xs font-mono font-extrabold text-school-primary">{CURRENT_SCHOOL.activeYear}</p>
            <p className="font-bold mt-1 text-slate-900 bg-slate-100 px-2 py-0.5 rounded inline-block text-[11px]">
              {period.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Student & Class Identification Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Nom &amp; Prénoms</span>
            <span className="font-bold text-slate-900 text-sm">{student.lastName} {student.firstName}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Matricule &amp; Sexe</span>
            <span className="font-mono font-bold text-slate-800">{student.matricule} ({student.gender})</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Classe &amp; Effectif</span>
            <span className="font-bold text-slate-900">{student.className} · {classStats.classSize} élèves</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Date de naissance</span>
            <span className="font-medium text-slate-800">{student.birthDate}</span>
          </div>
        </div>

        {/* Grades Table */}
        <div className="border border-slate-900 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 text-white font-semibold uppercase text-[10px]">
              <tr>
                <th className="px-3 py-2 border-r border-slate-700">Disciplines</th>
                <th className="px-2 py-2 text-center border-r border-slate-700 w-12">Coef</th>
                <th className="px-2 py-2 text-center border-r border-slate-700 w-24">Interrogations</th>
                <th className="px-2 py-2 text-center border-r border-slate-700 w-16">Devoir</th>
                <th className="px-2 py-2 text-center border-r border-slate-700 w-16">Moy / 20</th>
                <th className="px-2 py-2 text-center border-r border-slate-700 w-16">Moy x Coef</th>
                <th className="px-2 py-2 text-center border-r border-slate-700 w-12">Rang</th>
                <th className="px-3 py-2">Appréciation du Professeur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {subjects.map((item, idx) => {
                const weighted = (item.moyenne * item.coef).toFixed(1);
                return (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="px-3 py-2 font-bold text-slate-900 border-r border-slate-200">
                      {item.name}
                      <span className="block text-[9px] text-slate-400 font-normal">{item.professeur}</span>
                    </td>
                    <td className="px-2 py-2 text-center font-bold text-slate-700 border-r border-slate-200">
                      {item.coef}
                    </td>
                    <td className="px-2 py-2 text-center font-mono text-[11px] text-slate-600 border-r border-slate-200">
                      {item.interros.join(" - ")}
                    </td>
                    <td className="px-2 py-2 text-center font-mono text-[11px] font-semibold text-slate-800 border-r border-slate-200">
                      {item.devoir.toFixed(1)}
                    </td>
                    <td className="px-2 py-2 text-center font-mono font-bold text-slate-900 border-r border-slate-200 bg-slate-50">
                      {item.moyenne.toFixed(2)}
                    </td>
                    <td className="px-2 py-2 text-center font-mono font-bold text-school-primary border-r border-slate-200">
                      {weighted}
                    </td>
                    <td className="px-2 py-2 text-center text-xs font-semibold text-slate-700 border-r border-slate-200">
                      {item.rang}<sup>{item.rang === 1 ? "er" : "e"}</sup>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-600 italic">
                      {item.appreciation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 border-t-2 border-slate-900 font-bold text-slate-900 text-xs">
              <tr>
                <td className="px-3 py-2 border-r border-slate-300">TOTAUX</td>
                <td className="px-2 py-2 text-center border-r border-slate-300">{totalCoef}</td>
                <td colSpan={3} className="px-2 py-2 text-right border-r border-slate-300 text-[11px]">
                  TOTAL DES POINTS :
                </td>
                <td className="px-2 py-2 text-center font-extrabold text-school-primary border-r border-slate-300">
                  {totalPoints.toFixed(2)}
                </td>
                <td colSpan={2} className="px-3 py-2 text-left text-[11px] text-slate-500">
                  Base 20 points
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Global Performance Summary & Council Evaluation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Box 1: Performance */}
          <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block border-b border-slate-200 pb-1">
              Bilan Pédagogique
            </span>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600">Moyenne de l&apos;élève :</span>
              <span className="text-base font-extrabold text-school-primary font-mono">{generalAverage} / 20</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600">Rang de l&apos;élève :</span>
              <span className="font-bold text-slate-900">{classStats.rank}<sup>{classStats.rank === 1 ? "er" : "e"}</sup> sur {classStats.classSize}</span>
            </div>
            <div className="flex justify-between items-center py-0.5 text-[11px] text-slate-500">
              <span>Moyenne classe (Min - Max) :</span>
              <span className="font-mono">{classStats.lowestAvg} — {classStats.highestAvg}</span>
            </div>
            <div className="flex justify-between items-center py-0.5 text-[11px] text-slate-500">
              <span>Moyenne générale classe :</span>
              <span className="font-mono font-medium text-slate-700">{classStats.classAvg} / 20</span>
            </div>
          </div>

          {/* Box 2: Assiduite & Conduite */}
          <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block border-b border-slate-200 pb-1">
              Assiduité &amp; Discipline
            </span>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600">Absences justifiées :</span>
              <span className="font-mono font-semibold text-slate-800">2 h</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600">Absences non justifiées :</span>
              <span className="font-mono font-semibold text-slate-800">0 h</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600">Retards enregistrés :</span>
              <span className="font-mono font-semibold text-slate-800">1</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600">Conduite / Tenue :</span>
              <span className="font-bold text-emerald-700">Très Bonne</span>
            </div>
          </div>

          {/* Box 3: Decision du Conseil */}
          <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 space-y-1.5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block border-b border-slate-200 pb-1">
                Avis du Conseil de Classe
              </span>
              <div className="mt-2 text-center space-y-1">
                <span className="text-xs font-semibold text-slate-500">Mention accordée :</span>
                <p className={`text-sm font-extrabold ${council.color}`}>{council.mention}</p>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>{council.badge}</span>
                </div>
              </div>
            </div>
            <p className="text-[9px] text-center text-slate-400 mt-2">
              Décision souveraine du conseil des professeurs.
            </p>
          </div>
        </div>

        {/* Official Signatures Grid */}
        <div className="pt-4 grid grid-cols-3 border-t-2 border-slate-900 text-center text-xs">
          <div className="space-y-10">
            <p className="font-bold text-slate-700">Le Professeur Principal</p>
            <p className="text-[10px] text-slate-400 italic">Signature</p>
          </div>

          <div className="space-y-10">
            <p className="font-bold text-slate-700">Le Censeur des Études</p>
            <p className="text-[10px] text-slate-400 italic">Visa &amp; Signature</p>
          </div>

          <div className="space-y-8">
            <p className="font-bold text-slate-700">Le Chef d&apos;Établissement</p>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-2 max-w-[130px] mx-auto text-[9px] text-slate-400 font-bold uppercase">
              Cachet &amp; Signature
            </div>
          </div>
        </div>

        {/* Security & Verification Footer */}
        <div className="pt-2 flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-200">
          <div className="flex items-center gap-1 text-slate-500">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Document numérique officiel certifié par ECODUC / GESTIO 229</span>
          </div>
          <span className="font-mono">ID: {student.matricule}-{period.replace(/\s+/g, '')}-2026</span>
        </div>

      </div>
    </div>
  );
};
