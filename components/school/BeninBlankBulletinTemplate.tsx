"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "./QRCodeSVG";
import { BarcodeSVG } from "./BarcodeSVG";
import { Printer, LayoutGrid, CheckSquare } from "lucide-react";

export interface BlankBulletinProps {
  schoolName?: string;
  postalBox?: string;
  phone?: string;
  academicYear?: string;
  periodName?: string;
  className?: string;
  effectiveCount?: number | string;
  variant?: "9_COLONNES" | "13_COLONNES";
  onPrint?: () => void;
}

/**
 * 13 Matières Officielles République du Bénin (Enseignement Général et Technique)
 */
export const BENIN_STANDARD_SUBJECTS = [
  { code: "EPS", name: "Éducation Physique et Sportive (EPS)", defaultCoef: 1, group: "AUTRES" },
  { code: "TP", name: "Travaux Pratiques (TP)", defaultCoef: 1, group: "AUTRES" },
  { code: "MEL", name: "Matières Électives / Langues (MEL)", defaultCoef: 2, group: "LITTERAIRE" },
  { code: "TG", name: "Technologie Générale (TG)", defaultCoef: 2, group: "SCIENTIFIQUE" },
  { code: "ECE", name: "Éducation Civique et Éthique (E.C.E)", defaultCoef: 1, group: "LITTERAIRE" },
  { code: "FRA", name: "Français", defaultCoef: 3, group: "LITTERAIRE" },
  { code: "ANG", name: "Anglais", defaultCoef: 2, group: "LITTERAIRE" },
  { code: "MATH", name: "Mathématiques", defaultCoef: 4, group: "SCIENTIFIQUE" },
  { code: "DES", name: "Dessin / Arts Plastiques", defaultCoef: 1, group: "AUTRES" },
  { code: "PCT", name: "Physique, Chimie et Technologie (PCT)", defaultCoef: 3, group: "SCIENTIFIQUE" },
  { code: "SCH_AUTO", name: "Schéma-Auto", defaultCoef: 2, group: "SCIENTIFIQUE" },
  { code: "ELECTRO", name: "Électrotechnique (Electro)", defaultCoef: 2, group: "SCIENTIFIQUE" },
  { code: "CONDUITE", name: "Conduite & Assiduité", defaultCoef: 1, group: "AUTRES" },
];

export const BeninBlankBulletinTemplate: React.FC<BlankBulletinProps> = ({
  schoolName = "ÉTABLISSEMENT SCOLAIRE",
  postalBox = "BP 000 Cotonou",
  phone = "+229 00 00 00 00",
  academicYear = "2026 - 2027",
  periodName = "1er Semestre",
  className = "Classe Vierge",
  effectiveCount = "—",
  variant: initialVariant = "9_COLONNES",
  onPrint,
}) => {
  const [variant, setVariant] = useState<"9_COLONNES" | "13_COLONNES">(initialVariant);

  const totalCoefSum = BENIN_STANDARD_SUBJECTS.reduce((acc, s) => acc + s.defaultCoef, 0);

  const handleTriggerPrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* Barre de contrôle non imprimable */}
      <div className="no-print bg-slate-900 text-white p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-white">
            Modèle Officiel Vierge &bull; République du Bénin
          </span>
          <span className="text-[11px] text-slate-300">
            (Prêt pour saisie &amp; validation des données réelles)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle 9 colonnes vs 13 colonnes */}
          <div className="inline-flex rounded-xl border border-slate-700 bg-slate-800 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setVariant("9_COLONNES")}
              className={`px-3 py-1 rounded-lg transition-colors ${
                variant === "9_COLONNES"
                  ? "bg-school-primary text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              9 Colonnes (Standard)
            </button>
            <button
              type="button"
              onClick={() => setVariant("13_COLONNES")}
              className={`px-3 py-1 rounded-lg transition-colors ${
                variant === "13_COLONNES"
                  ? "bg-school-primary text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              13 Colonnes (Détaillé)
            </button>
          </div>

          <button
            type="button"
            onClick={handleTriggerPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs touch-target transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer modèle A4</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT OFFICIEL A4 PORTRAIT */}
      <div
        className="benin-bulletin-sheet bg-white text-black font-sans leading-tight mx-auto border border-black shadow-lg print:shadow-none print:border-black p-3.5 sm:p-5 print:p-2 text-[10px] print:text-[8.5px] w-full max-w-[820px] select-text"
        style={{ boxSizing: "border-box" }}
      >
        {/* ================================================================= */}
        {/* 1) EN-TÊTE OFFICIEL EN 3 ZONES                                    */}
        {/* ================================================================= */}
        <div className="border border-black grid grid-cols-12 divide-x divide-black mb-1.5">
          {/* Zone Gauche : Logo 3x3 cm */}
          <div className="col-span-3 p-1.5 flex flex-col items-center justify-center text-center">
            <div className="w-[30mm] h-[30mm] max-w-[90px] max-h-[90px] border border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center bg-gray-50 text-center p-1">
              <span className="text-[8.5px] font-bold text-gray-700 uppercase">Logo École</span>
              <span className="text-[7px] text-gray-400 mt-0.5">3 cm x 3 cm</span>
            </div>
          </div>

          {/* Zone Centre : MINISTÈRE, NOM DE L'ÉTABLISSEMENT, BP, TÉLÉPHONE */}
          <div className="col-span-5 p-1.5 text-center flex flex-col justify-center">
            <p className="text-[8.5px] print:text-[7.5px] font-bold uppercase tracking-tight text-gray-800 leading-tight">
              MINISTÈRE DES ENSEIGNEMENTS PRIMAIRE ET SECONDAIRE
            </p>
            <h1 className="text-xs sm:text-sm print:text-xs font-black uppercase tracking-tight my-1 text-black">
              {schoolName}
            </h1>
            <p className="text-[8px] text-gray-700 leading-tight">
              Boîte Postale : {postalBox}
            </p>
            <p className="text-[8px] font-medium text-gray-700 leading-tight">
              Téléphone : {phone}
            </p>
          </div>

          {/* Zone Droite : RÉPUBLIQUE DU BÉNIN, DEVISE, ANNÉE, PÉRIODE, CLASSE, EFFECTIF */}
          <div className="col-span-4 p-1.5 text-right flex flex-col justify-between">
            <div>
              <p className="text-[9px] print:text-[8px] font-black uppercase tracking-wide">
                RÉPUBLIQUE DU BÉNIN
              </p>
              <p className="text-[7.5px] italic font-serif text-gray-700">
                Fraternité - Justice - Travail
              </p>
            </div>
            <div className="mt-1 space-y-0.5 text-[8.5px] print:text-[7.5px] text-black font-medium">
              <p>
                Année scolaire : <strong className="font-bold">{academicYear}</strong>
              </p>
              <p>
                Période : <strong className="font-bold">{periodName}</strong>
              </p>
              <p>
                Classe : <strong className="font-bold">{className}</strong>
              </p>
              <p>
                Effectif : <strong className="font-bold">{effectiveCount}</strong> élève(s)
              </p>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2) TITRE DU BULLETIN CENTRÉ                                       */}
        {/* ================================================================= */}
        <div className="border border-black bg-gray-100 py-1 px-4 text-center mb-1.5">
          <h2 className="text-xs sm:text-sm print:text-xs font-black tracking-widest uppercase text-black">
            BULLETIN DE NOTES DU {periodName.toUpperCase()}
          </h2>
        </div>

        {/* ================================================================= */}
        {/* 3) IDENTITÉ DE L'ÉLÈVE (4 LIGNES + QR CODE 3x3 CM À DROITE)       */}
        {/* ================================================================= */}
        <div className="border border-black p-1.5 mb-1.5 flex items-center justify-between gap-2">
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9.5px] print:text-[8px] flex-1">
            <div>
              <span className="text-gray-600">Nom : </span>
              <strong className="font-black uppercase tracking-wide">[ Nom de l&apos;élève ]</strong>
            </div>
            <div>
              <span className="text-gray-600">Prénoms : </span>
              <strong className="font-bold">[ Prénoms de l&apos;élève ]</strong>
            </div>
            <div>
              <span className="text-gray-600">N° Educ Master : </span>
              <strong className="font-mono font-bold">[ N° Educ Master / Matricule ]</strong>
            </div>
            <div>
              <span className="text-gray-600">Sexe : </span>
              <strong className="font-bold">[ M / F ]</strong>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Né(e) le : </span>
              <strong className="font-medium">[ Date de naissance ]</strong>
              <span className="text-gray-600"> à </span>
              <strong className="font-medium">[ Lieu de naissance ]</strong>
            </div>
          </div>

          {/* QR Code 3x3 cm */}
          <div className="shrink-0 flex items-center justify-center pl-2 border-l border-black">
            <div className="w-[30mm] h-[30mm] max-w-[65px] max-h-[65px] flex items-center justify-center">
              <QRCodeSVG value="https://ecogest.vercel.app/authentification/bulletin/officiel-benin" size={56} />
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 4) TABLEAU DES NOTES (13 MATIÈRES OFFICIELLES)                     */}
        {/* ================================================================= */}
        <div className="border border-black mb-1.5 overflow-hidden">
          <table className="w-full border-collapse text-center text-[9px] print:text-[7.8px]">
            <thead>
              <tr className="bg-gray-200 border-b border-black font-bold uppercase text-[7.5px] print:text-[6.8px] text-black">
                <th className="border-r border-black p-1 text-left w-[22%]">Matières</th>
                <th className="border-r border-black p-0.5 w-[5%]">Coef</th>

                {/* 13 colonnes : détails de toutes les interros */}
                {variant === "13_COLONNES" ? (
                  <>
                    <th className="border-r border-black p-0.5 w-[5%]">Int. 1</th>
                    <th className="border-r border-black p-0.5 w-[5%]">Int. 2</th>
                    <th className="border-r border-black p-0.5 w-[5%]">Int. 3</th>
                    <th className="border-r border-black p-0.5 w-[7%] bg-gray-300/60 font-bold">Moy. Int.</th>
                    <th className="border-r border-black p-0.5 w-[6%]">Dev. 1</th>
                    <th className="border-r border-black p-0.5 w-[6%]">Dev. 2</th>
                    <th className="border-r border-black p-0.5 w-[6%]">Compo</th>
                  </>
                ) : (
                  <>
                    <th className="border-r border-black p-0.5 w-[10%] bg-gray-300/60 font-bold">Moy. Interro</th>
                    <th className="border-r border-black p-0.5 w-[9%]">Devoir 1</th>
                    <th className="border-r border-black p-0.5 w-[9%]">Devoir 2</th>
                    <th className="border-r border-black p-0.5 w-[9%]">Compo</th>
                  </>
                )}

                <th className="border-r border-black p-0.5 w-[9%] bg-gray-100 font-black">Moy. / 20</th>
                <th className="border-r border-black p-0.5 w-[8%]">Note Coef.</th>
                <th className="border-r border-black p-0.5 w-[6%]">Rang</th>
                <th className="p-1 text-left w-[18%]">Appréciations</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black">
              {BENIN_STANDARD_SUBJECTS.map((sub, idx) => {
                const isConduite = sub.code === "CONDUITE";
                return (
                  <tr key={sub.code} className={idx % 2 === 1 ? "bg-gray-50/50" : "bg-white"}>
                    <td className="border-r border-black p-1 text-left font-semibold text-black">
                      {sub.name}
                    </td>
                    <td className="border-r border-black p-0.5 font-bold">
                      {sub.defaultCoef}
                    </td>

                    {isConduite ? (
                      /* Conduite : note directe globale */
                      <td
                        colSpan={variant === "13_COLONNES" ? 7 : 4}
                        className="border-r border-black p-0.5 text-center italic text-gray-500 font-serif"
                      >
                        [ Note d&apos;assiduité &amp; de tenue morale ]
                      </td>
                    ) : variant === "13_COLONNES" ? (
                      <>
                        <td className="border-r border-black p-0.5 text-gray-400">—</td>
                        <td className="border-r border-black p-0.5 text-gray-400">—</td>
                        <td className="border-r border-black p-0.5 text-gray-400">—</td>
                        <td className="border-r border-black p-0.5 bg-gray-100/60 text-gray-400 font-semibold">—</td>
                        <td className="border-r border-black p-0.5 text-gray-400">—</td>
                        <td className="border-r border-black p-0.5 text-gray-400">—</td>
                        <td className="border-r border-black p-0.5 text-gray-400">—</td>
                      </>
                    ) : (
                      <>
                        <td className="border-r border-black p-0.5 bg-gray-100/60 text-gray-400 font-semibold">—</td>
                        <td className="border-r border-black p-0.5 text-gray-400">—</td>
                        <td className="border-r border-black p-0.5 text-gray-400">—</td>
                        <td className="border-r border-black p-0.5 text-gray-400">—</td>
                      </>
                    )}

                    <td className="border-r border-black p-0.5 bg-gray-100/80 font-bold text-gray-400">—</td>
                    <td className="border-r border-black p-0.5 text-gray-400">—</td>
                    <td className="border-r border-black p-0.5 text-gray-400">—</td>
                    <td className="p-1 text-left text-gray-400 italic font-serif">—</td>
                  </tr>
                );
              })}

              {/* LIGNE DES TOTAUX (Somme Coef & Points pondérés) */}
              <tr className="border-t-2 border-black bg-gray-200 font-bold text-[9px] print:text-[8px] text-black">
                <td className="border-r border-black p-1 text-right uppercase tracking-wider font-black">
                  TOTAUX :
                </td>
                <td className="border-r border-black p-0.5 font-black">
                  {totalCoefSum}
                </td>
                <td
                  colSpan={variant === "13_COLONNES" ? 8 : 5}
                  className="border-r border-black p-0.5 text-right font-black uppercase text-[8px] tracking-wide pr-2"
                >
                  Total des points pondérés :
                </td>
                <td className="border-r border-black p-0.5 font-black text-gray-400">
                  —
                </td>
                <td colSpan={2} className="p-0.5 text-center text-gray-400 italic">
                  —
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ================================================================= */}
        {/* 5) BANDEAU DES 3 MOYENNES (Littéraires, Scientifiques, Autres)     */}
        {/* ================================================================= */}
        <div className="border border-black p-1.5 mb-1.5 bg-gray-50 grid grid-cols-3 divide-x divide-black text-center text-[9px] print:text-[8px]">
          <div className="px-1.5">
            <span className="text-gray-600 block text-[8px] uppercase tracking-wider font-semibold">
              Moyenne Matières Littéraires
            </span>
            <span className="text-sm font-black text-gray-400 tabular-nums">— / 20</span>
          </div>
          <div className="px-1.5">
            <span className="text-gray-600 block text-[8px] uppercase tracking-wider font-semibold">
              Moyenne Matières Scientifiques
            </span>
            <span className="text-sm font-black text-gray-400 tabular-nums">— / 20</span>
          </div>
          <div className="px-1.5">
            <span className="text-gray-600 block text-[8px] uppercase tracking-wider font-semibold">
              Moyenne Autres Matières
            </span>
            <span className="text-sm font-black text-gray-400 tabular-nums">— / 20</span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 6) LES 3 BLOCS EN BAS DE PAGE                                     */}
        {/* ================================================================= */}
        <div className="border border-black grid grid-cols-12 divide-x divide-black mb-1.5 text-[8.5px] print:text-[7.5px]">
          {/* Bloc 1 : Résultat de l'apprenant */}
          <div className="col-span-4 p-1.5 space-y-1">
            <div className="bg-gray-100 font-bold uppercase text-center py-0.5 border-b border-black">
              Résultat de l&apos;Apprenant
            </div>
            <p>
              Moyenne générale : <strong className="text-xs font-black">— / 20</strong>
            </p>
            <p className="text-[8px] text-gray-600 italic">
              (En lettres : [ Moyenne en toutes lettres ])
            </p>
            <p>
              Rang : <strong className="font-bold">— sur {effectiveCount}</strong>
            </p>
            <p>
              Mention : <strong className="font-bold uppercase">—</strong>
            </p>
            <p className="text-[8px] text-gray-700">
              Assiduité : Retards : <strong>0</strong> &bull; Absences : <strong>0 h</strong> (0 NJ)
            </p>
          </div>

          {/* Bloc 2 : Résultat de la classe */}
          <div className="col-span-4 p-1.5 space-y-1">
            <div className="bg-gray-100 font-bold uppercase text-center py-0.5 border-b border-black">
              Statistiques de la Classe
            </div>
            <p>
              Plus forte moyenne : <strong className="font-bold">— / 20</strong>
            </p>
            <p>
              Plus faible moyenne : <strong className="font-bold">— / 20</strong>
            </p>
            <p>
              Moyenne de la classe : <strong className="font-bold">— / 20</strong>
            </p>
            <p className="text-[8px] text-gray-600">
              Taux de réussite : <strong className="font-bold">— %</strong>
            </p>
            <p className="text-[8px] text-gray-500 italic">
              Données certifiées conformes au registre de délibération.
            </p>
          </div>

          {/* Bloc 3 : Décision du conseil de classe */}
          <div className="col-span-4 p-1.5 space-y-1">
            <div className="bg-gray-100 font-bold uppercase text-center py-0.5 border-b border-black">
              Décision du Conseil
            </div>
            <div className="space-y-0.5 text-[8px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 border border-black inline-block" />
                <span>Félicitations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 border border-black inline-block" />
                <span>Tableau d&apos;Honneur</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 border border-black inline-block" />
                <span>Encouragements</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 border border-black inline-block" />
                <span>Avertissement travail / conduite</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 border border-black inline-block" />
                <span>Blâme</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 7) SIGNATURES OFFICIELLES                                         */}
        {/* ================================================================= */}
        <div className="border border-black grid grid-cols-2 divide-x divide-black mb-1.5 text-center text-[9px] print:text-[8px]">
          <div className="p-2 min-h-[60px] flex flex-col justify-between">
            <p className="font-bold uppercase tracking-tight">Le Professeur Titulaire / Maître</p>
            <p className="text-[7.5px] text-gray-500 italic mt-6">(Signature)</p>
          </div>
          <div className="p-2 min-h-[60px] flex flex-col justify-between">
            <p className="font-bold uppercase tracking-tight">Le Directeur de l&apos;Établissement</p>
            <p className="text-[7.5px] text-gray-500 italic mt-6">(Cachet et Signature)</p>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 8) PIED DE PAGE : CODE-BARRES & SÉCURITÉ                           */}
        {/* ================================================================= */}
        <div className="border-t border-black pt-1 flex items-center justify-between text-[7.5px] print:text-[6.8px] text-gray-600">
          <div>
            <BarcodeSVG value="BEN-2026-BLANK-TEMPLATE-001" height={18} width={1} />
          </div>
          <div className="text-right space-y-0.5">
            <p className="font-mono font-bold text-black">DOCUMENT OFFICIEL &bull; RÉPUBLIQUE DU BÉNIN</p>
            <p>Généré via ECOGEST &bull; Plateforme Nationale Sécurisée</p>
          </div>
        </div>
      </div>
    </div>
  );
};
