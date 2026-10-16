"use client";

import React from "react";
import { Printer, Download, ArrowLeft, ShieldCheck, FileSpreadsheet } from "lucide-react";
import { StudentProfile, ClassRoom, SchoolSettings, AcademicYear } from "@/lib/types/bulletin";
import { MOCK_SCHOOL_SETTINGS, MOCK_ACADEMIC_YEARS } from "@/lib/mock-bulletin-db";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface ClassRegisterPDFProps {
  classroom: ClassRoom;
  students: StudentProfile[];
  academicYear?: AcademicYear;
  schoolSettings?: SchoolSettings;
  onBack?: () => void;
}

export const ClassRegisterPDF: React.FC<ClassRegisterPDFProps> = ({
  classroom,
  students,
  academicYear = MOCK_ACADEMIC_YEARS[0],
  schoolSettings = MOCK_SCHOOL_SETTINGS,
  onBack,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const totalBoys = students.filter((s) => s.gender === "M").length;
  const totalGirls = students.filter((s) => s.gender === "F").length;

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              title="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-school-primary" />
              <span>Registre Officiel de Classe — {classroom.name}</span>
            </h2>
            <p className="text-xs text-slate-500">
              Année Scolaire {academicYear.label} &bull; Effectif total : {students.length} élèves ({totalBoys} G, {totalGirls} F)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / Télécharger en PDF</span>
          </button>
        </div>
      </div>

      {/* Official Beninese Printable Register Sheet */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none font-sans text-slate-900 print:text-black">
        {/* Header officiel République du Bénin */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-start gap-4">
            <div className="text-center w-56">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 print:text-black">
                {schoolSettings.republic}
              </p>
              <p className="text-[9px] italic text-slate-600 print:text-black">
                {schoolSettings.motto}
              </p>
              <div className="w-16 h-0.5 bg-slate-900 mx-auto my-1.5" />
              <p className="text-[9px] font-bold uppercase text-slate-700 leading-tight print:text-black">
                {schoolSettings.ministry}
              </p>
              <p className="text-[8px] text-slate-500 mt-0.5">
                Direction Départementale de l'Enseignement
              </p>
            </div>

            <div className="text-center flex-1">
              <h1 className="text-base sm:text-lg font-black uppercase text-slate-900 print:text-black tracking-wide">
                {schoolSettings.name}
              </h1>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                {schoolSettings.district} &bull; {schoolSettings.postalBox}
              </p>
              <p className="text-[10px] text-slate-500">
                Tél : {schoolSettings.phoneNumbers}
              </p>
              <div className="inline-block mt-2 px-3 py-1 bg-slate-100 print:bg-transparent print:border print:border-black rounded-lg border border-slate-200">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  REGISTRE MATRICULE OFFICIEL DES ÉLÈVES
                </span>
              </div>
            </div>

            <div className="text-right w-56 text-xs">
              <p className="text-slate-500 font-medium">Année Scolaire :</p>
              <p className="font-bold text-slate-900 text-sm">{academicYear.label}</p>
              <p className="text-slate-500 font-medium mt-1">Cycle d'enseignement :</p>
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 border border-slate-300">
                {classroom.cycle === "PRIMAIRE" ? "ENSEIGNEMENT PRIMAIRE" : "ENSEIGNEMENT SECONDAIRE"}
              </span>
            </div>
          </div>

          {/* Cartouche d'identification de la classe */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Classe</span>
              <span className="font-bold text-slate-900 text-sm">{classroom.name}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Niveau / Filière</span>
              <span className="font-bold text-slate-900 text-sm">{classroom.level} ({classroom.stream})</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Professeur Principal</span>
              <span className="font-bold text-slate-900 text-sm">{classroom.mainTeacher || "Non assigné"}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Effectif Inscrit</span>
              <span className="font-bold text-slate-900 text-sm">{students.length} (G: {totalBoys} | F: {totalGirls})</span>
            </div>
          </div>
        </div>

        {/* Tableau du Registre */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 print:bg-slate-200 text-slate-900 uppercase font-black text-[10px] tracking-wider border-y-2 border-slate-900">
                <th className="py-2.5 px-2 border-r border-slate-300 w-10 text-center">N°</th>
                <th className="py-2.5 px-3 border-r border-slate-300 w-32">Matricule</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Nom & Prénoms</th>
                <th className="py-2.5 px-2 border-r border-slate-300 w-12 text-center">Sexe</th>
                <th className="py-2.5 px-3 border-r border-slate-300 w-36">Date & Lieu de Naissance</th>
                <th className="py-2.5 px-3 border-r border-slate-300 w-44">Parent / Tuteur Légal</th>
                <th className="py-2.5 px-3 border-r border-slate-300 w-28 text-center">Statut Élève</th>
                <th className="py-2.5 px-2 w-24 text-center print:table-cell">Émargement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 border-b border-slate-900">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    Aucun élève inscrit dans cette classe pour le moment.
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => (
                  <tr
                    key={student.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/70 print:bg-transparent"}
                  >
                    <td className="py-2 px-2 border-r border-slate-200 text-center font-bold text-slate-600">
                      {String(idx + 1).padStart(2, "0")}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-mono font-semibold text-slate-800">
                      {student.matricule}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900 uppercase">
                      {student.lastName} <span className="capitalize font-medium text-slate-800">{student.firstName}</span>
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 text-center font-bold">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                          student.gender === "M"
                            ? "bg-blue-50 text-blue-800 border border-blue-200"
                            : "bg-pink-50 text-pink-800 border border-pink-200"
                        }`}
                      >
                        {student.gender}
                      </span>
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-slate-700">
                      <div>{student.birthDate}</div>
                      <div className="text-[10px] text-slate-500 italic">à {student.birthPlace || "Bénin"}</div>
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-slate-700">
                      <div className="font-semibold text-slate-800 truncate">{student.parentName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{student.parentPhone}</div>
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          student.status === "ACTIF" || !student.status
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : student.status === "READMIS"
                            ? "bg-indigo-50 text-indigo-800 border border-indigo-200"
                            : student.status === "TRANSFERE"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : student.status === "EXCLU"
                            ? "bg-rose-50 text-rose-800 border border-rose-200"
                            : "bg-slate-100 text-slate-800 border border-slate-300"
                        }`}
                      >
                        {student.status || "ACTIF"}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center text-slate-400">
                      <div className="h-6 border-b border-dotted border-slate-300" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pied de page et signatures certifiées */}
        <div className="mt-8 pt-4 border-t-2 border-slate-900 grid grid-cols-3 gap-4 text-center text-xs">
          <div>
            <p className="font-bold text-slate-900 uppercase">Le Professeur Principal</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Attestation de conformité des effectifs</p>
            <div className="h-16 mt-2 flex items-center justify-center italic text-slate-400 text-[10px]">
              (Signature)
            </div>
            <p className="font-semibold text-slate-800">{classroom.mainTeacher || "—"}</p>
          </div>

          <div>
            <p className="font-bold text-slate-900 uppercase">Le Censeur des Études</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Contrôle pédagogique & vérification</p>
            <div className="h-16 mt-2 flex items-center justify-center italic text-slate-400 text-[10px]">
              (Sceau & Signature)
            </div>
            <p className="font-semibold text-slate-800">Censeur des Études</p>
          </div>

          <div>
            <p className="font-bold text-slate-900 uppercase">Le Chef d'Établissement</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Visa d'approbation officiel</p>
            <div className="h-16 mt-2 flex items-center justify-center italic text-slate-400 text-[10px]">
              (Cachet officiel & Signature)
            </div>
            <p className="font-semibold text-slate-800">{schoolSettings.directorName}</p>
          </div>
        </div>

        {/* Security badge at bottom */}
        <div className="mt-6 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-school-primary" />
            <span>Document officiel certifié généré par la plateforme EducoGest Pro Bénin</span>
          </div>
          <div>Édité le {new Date().toLocaleDateString("fr-FR")} à {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      </div>
    </div>
  );
};
