"use client";

import React, { useState } from "react";
import { ComputedBulletin, EvaluationGrade } from "@/lib/types/bulletin";
import { QRCodeSVG } from "./QRCodeSVG";
import { BarcodeSVG } from "./BarcodeSVG";
import { History, ShieldAlert, CheckCircle2 } from "lucide-react";

interface BeninOfficialBulletinProps {
  bulletin: ComputedBulletin;
  customLogoUrl?: string;
  className?: string;
  showAuditDetails?: boolean;
  editableSubjectId?: string;
  onGradeChange?: (
    studentId: string,
    subjectId: string,
    field: "interro1" | "interro2" | "interro3" | "devoir1" | "devoir2" | "noteConduite",
    val: number | null
  ) => void;
  onAppreciationChange?: (
    studentId: string,
    subjectId: string,
    appreciation: string
  ) => void;
  onCoefChange?: (
    subjectId: string,
    newCoef: number
  ) => void;
}

function renderGradeCell(val: EvaluationGrade | undefined) {
  if (val === undefined || val === null) return "-";
  if (val === "ABS") return <span className="text-[7.5px] font-bold text-amber-700">ABS</span>;
  if (val === "ABS_NJ") return <span className="text-[7.5px] font-bold text-red-700">0 (NJ)</span>;
  return typeof val === "number" ? val.toFixed(1) : val;
}

export const BeninOfficialBulletin: React.FC<BeninOfficialBulletinProps> = ({
  bulletin,
  customLogoUrl,
  className = "",
  showAuditDetails = false,
  editableSubjectId,
  onGradeChange,
  onAppreciationChange,
  onCoefChange,
}) => {
  const [showLogsModal, setShowLogsModal] = useState(false);

  const {
    student,
    classRoom,
    school,
    period,
    academicYear,
    rows,
    totalCoef,
    totalNoteCoef,
    generalAverage,
    generalAverageInWords,
    rankFormatted,
    mention,
    groupAverages,
    classStats,
    decisionConseil,
    titulaireAppreciation,
    barcodeValue,
    verificationUrl,
    status,
    version,
    auditLogs,
  } = bulletin;

  const logoToUse = customLogoUrl || school.logoUrl;
  const isPostPublicationModified = status === "MODIFIE_APRES_PUBLICATION";

  return (
    <div
      className={`benin-bulletin-sheet bg-white text-black font-sans leading-tight mx-auto border border-black shadow-md print:shadow-none print:border-black p-3 sm:p-5 print:p-1.5 text-[10.5px] print:text-[8.5px] w-full max-w-[820px] select-text ${className}`}
      style={{
        boxSizing: "border-box",
      }}
    >
      {/* Post-Publication Traceability Banner (visible on screen and discreet in print) */}
      {isPostPublicationModified && (
        <div className="mb-2 p-1.5 border border-amber-600 bg-amber-50/70 text-amber-900 rounded text-[9px] print:text-[7.5px] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>
              <strong>Bulletin Rectifié Post-Publication (Version {version}) :</strong> Modification autorisée et tracée dans le registre d&apos;audit légal.
            </span>
          </div>
          {auditLogs && auditLogs.length > 0 && (
            <button
              type="button"
              onClick={() => setShowLogsModal(true)}
              className="no-print text-[8.5px] font-bold underline hover:text-amber-950 ml-2"
            >
              Historique d&apos;audit ({auditLogs.length})
            </button>
          )}
        </div>
      )}

      {/* 1) EN-TÊTE (cadre bordé, 3 zones) */}
      <div className="border border-black grid grid-cols-12 divide-x divide-black mb-1.5">
        {/* Zone Gauche : logo de l'établissement */}
        <div className="col-span-3 p-1.5 flex flex-col items-center justify-center text-center">
          {logoToUse ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoToUse}
              alt={school.name}
              className="max-h-14 max-w-full object-contain mb-1"
            />
          ) : (
            <div className="w-12 h-12 border border-black rounded-full flex flex-col items-center justify-center bg-gray-50 mb-1">
              <span className="text-[9.5px] font-black uppercase text-center leading-none">
                {school.name.split(" ").slice(0, 3).map((w) => w[0]).join("")}
              </span>
              <span className="text-[6.5px] text-gray-500 font-mono mt-0.5">BÉNIN</span>
            </div>
          )}
          <span className="text-[7.5px] font-semibold text-gray-700 uppercase tracking-tighter">
            Logo Établissement
          </span>
        </div>

        {/* Zone Centre : MINISTÈRE, Nom établissement, quartier, BP, téléphones */}
        <div className="col-span-5 p-1.5 text-center flex flex-col justify-center">
          <p className="text-[8.5px] print:text-[7.5px] font-bold uppercase tracking-tight text-gray-800">
            {school.ministry}
          </p>
          <h1 className="text-xs sm:text-sm print:text-xs font-black uppercase tracking-tight my-0.5 text-black">
            {school.name}
          </h1>
          <p className="text-[8px] text-gray-700">
            {school.district} &bull; {school.postalBox}
          </p>
          <p className="text-[8px] font-medium text-gray-700">
            Tél : {school.phoneNumbers}
          </p>
        </div>

        {/* Zone Droite : RÉPUBLIQUE DU BÉNIN, Devise, Année scolaire, Trimestre, Classe, Effectif */}
        <div className="col-span-4 p-1.5 text-right flex flex-col justify-between">
          <div>
            <p className="text-[9px] print:text-[8px] font-black uppercase tracking-wide">
              {school.republic}
            </p>
            <p className="text-[7.5px] italic font-serif text-gray-600">
              {school.motto}
            </p>
          </div>
          <div className="mt-0.5 space-y-0.5 text-[8.5px] print:text-[7.5px] text-black font-medium">
            <p>
              Année scolaire : <strong className="font-bold">{academicYear.label}</strong>
            </p>
            <p>
              Période : <strong className="font-bold">{period.name}</strong>
            </p>
            <p>
              Classe : <strong className="font-bold">{classRoom.name}</strong> ({classRoom.stream})
            </p>
            <p>
              Effectif : <strong className="font-bold">{classStats.effectiveCount}</strong> élèves
            </p>
          </div>
        </div>
      </div>

      {/* 2) TITRE : BULLETIN DE NOTES centré, grand, gras, dans un cadre */}
      <div className="border border-black bg-gray-100 py-0.5 px-4 text-center mb-1.5">
        <h2 className="text-xs sm:text-sm print:text-xs font-black tracking-widest uppercase text-black">
          BULLETIN DE NOTES
        </h2>
      </div>

      {/* 3) BLOC IDENTITÉ DE L'ÉLÈVE */}
      <div className="border border-black p-1.5 mb-1.5 flex items-center justify-between gap-2">
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9.5px] print:text-[8px] flex-1">
          <div>
            <span className="text-gray-600">Nom : </span>
            <strong className="font-black uppercase">{student.lastName}</strong>
          </div>
          <div>
            <span className="text-gray-600">Prénoms : </span>
            <strong className="font-bold">{student.firstName}</strong>
          </div>
          <div>
            <span className="text-gray-600">N° Educ Master : </span>
            <strong className="font-mono font-bold">{student.educMasterNumber || student.matricule}</strong>
          </div>
          <div>
            <span className="text-gray-600">Sexe : </span>
            <strong className="font-bold">{student.gender === "M" ? "Masculin (M)" : "Féminin (F)"}</strong>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">Né(e) le : </span>
            <strong className="font-medium">{student.birthDate}</strong>
            <span className="text-gray-600"> à </span>
            <strong className="font-medium">{student.birthPlace || "Cotonou"}</strong>
          </div>
        </div>

        {/* QR Code à droite */}
        <div className="shrink-0 flex items-center justify-center pl-2 border-l border-black">
          <QRCodeSVG value={verificationUrl || student.matricule} size={50} />
        </div>
      </div>

      {/* 4) TABLEAU DES NOTES (avec 3 cases Interro + Moyenne Interro + 2 cases Devoir) */}
      <div className="border border-black mb-1.5 overflow-hidden">
        <table className="w-full border-collapse text-center text-[9px] print:text-[7.8px]">
          <thead>
            {/* Double header for Interrogations and Devoirs */}
            <tr className="bg-gray-200 border-b border-black font-bold uppercase text-[7.5px] print:text-[6.8px] text-black">
              <th rowSpan={2} className="border-r border-black p-1 text-left w-[23%]">Matières</th>
              <th rowSpan={2} className="border-r border-black p-0.5 w-[4%]">Coef</th>
              <th colSpan={4} className="border-r border-black p-0.5 text-center bg-gray-300/80">
                (Int 1 + Int 2 + Int 3) &divide; 3 = Moy. Interro
              </th>
              <th colSpan={2} className="border-r border-black p-0.5 text-center bg-gray-200">
                Devoirs
              </th>
              <th rowSpan={2} className="border-r border-black p-0.5 w-[9%] bg-gray-100" title="(Moy. Interro + Devoir 1 + Devoir 2) ÷ 3">
                Moy. / 20
              </th>
              <th rowSpan={2} className="border-r border-black p-0.5 w-[8%]" title="Moyenne / 20 × Coef">
                Note Coef.
              </th>
              <th rowSpan={2} className="border-r border-black p-0.5 w-[6%]">
                Rang
              </th>
              <th rowSpan={2} className="p-1 text-left w-[18%]">
                Appréciations
              </th>
            </tr>
            <tr className="bg-gray-100 border-b border-black font-semibold text-[7.5px] print:text-[6.5px]">
              <th className="border-r border-black p-0.5 w-[5%]">Int 1</th>
              <th className="border-r border-black p-0.5 w-[5%]">Int 2</th>
              <th className="border-r border-black p-0.5 w-[5%]">Int 3</th>
              <th className="border-r border-black p-0.5 w-[6%] font-bold bg-gray-200">Moy.</th>
              <th className="border-r border-black p-0.5 w-[5%]">Dev 1</th>
              <th className="border-r border-black p-0.5 w-[5%]">Dev 2</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-black">
            {rows.map((row, idx) => {
              const isEditable = Boolean(editableSubjectId && row.subjectId === editableSubjectId);

              // Helper for rendering an evaluation input or read-only text
              const renderEvaluationInput = (
                field: "interro1" | "interro2" | "interro3" | "devoir1" | "devoir2",
                currentVal: EvaluationGrade | undefined
              ) => {
                if (!isEditable || !onGradeChange) {
                  return renderGradeCell(currentVal);
                }

                const numVal = typeof currentVal === "number" ? currentVal : "";
                return (
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="20"
                    value={numVal}
                    placeholder="-"
                    onChange={(e) => {
                      const raw = e.target.value.trim();
                      if (raw === "") {
                        onGradeChange(student.id, row.subjectId, field, null);
                      } else {
                        const parsed = parseFloat(raw.replace(",", "."));
                        if (!isNaN(parsed) && parsed >= 0 && parsed <= 20) {
                          onGradeChange(student.id, row.subjectId, field, parsed);
                        }
                      }
                    }}
                    className="w-10 text-center font-bold border border-blue-500 bg-white rounded text-[8.5px] py-0.5 focus:ring-1 focus:ring-blue-600 focus:outline-none print:border-none print:bg-transparent print:p-0"
                  />
                );
              };

              // Conduite rule: Direct grade, no interro nor devoir
              if (row.isConduite) {
                return (
                  <tr
                    key={row.subjectId || idx}
                    className={isEditable ? "bg-blue-50/70" : "hover:bg-gray-50"}
                  >
                    <td className="border-r border-black p-1 text-left font-bold truncate">
                      <span>{row.subjectName}</span>
                      {isEditable && (
                        <span className="no-print ml-1 px-1 py-0.5 rounded bg-blue-600 text-white text-[6.5px] font-bold inline-block">
                          Ma Matière
                        </span>
                      )}
                    </td>
                    <td className="border-r border-black p-0.5 font-semibold">
                      {isEditable && onCoefChange ? (
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={row.coef}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 1 && val <= 10) {
                              onCoefChange(row.subjectId, val);
                            }
                          }}
                          className="w-8 text-center font-black border border-blue-500 bg-white rounded text-[8.5px] py-0.5 focus:outline-none print:border-none print:p-0"
                        />
                      ) : (
                        row.coef
                      )}
                    </td>
                    <td colSpan={6} className="border-r border-black p-0.5 text-gray-500 font-mono text-[7.5px] italic bg-gray-50/50">
                      Note de conduite directe (sans interrogation ni devoir)
                    </td>
                    <td className="border-r border-black p-0.5 font-black bg-gray-100 font-mono">
                      {isEditable && onGradeChange ? (
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          max="20"
                          value={typeof row.moyenne20 === "number" ? row.moyenne20 : ""}
                          onChange={(e) => {
                            const raw = e.target.value.trim();
                            if (raw === "") {
                              onGradeChange(student.id, row.subjectId, "noteConduite", null);
                            } else {
                              const parsed = parseFloat(raw.replace(",", "."));
                              if (!isNaN(parsed) && parsed >= 0 && parsed <= 20) {
                                onGradeChange(student.id, row.subjectId, "noteConduite", parsed);
                              }
                            }
                          }}
                          className="w-10 text-center font-black border border-blue-500 bg-white rounded text-[8.5px] py-0.5 focus:ring-1 focus:ring-blue-600 focus:outline-none print:border-none print:bg-transparent print:p-0"
                        />
                      ) : (
                        row.moyenne20 !== null ? row.moyenne20.toFixed(2) : "…"
                      )}
                    </td>
                    <td className="border-r border-black p-0.5 font-bold font-mono">
                      {row.noteCoef !== null ? row.noteCoef.toFixed(2) : "…"}
                    </td>
                    <td className="border-r border-black p-0.5 font-bold">
                      {row.rankFormatted}
                    </td>
                    <td className="p-1 text-left text-[8px] text-gray-800">
                      {isEditable && onAppreciationChange ? (
                        <input
                          type="text"
                          value={row.appreciation === "…" ? "" : row.appreciation}
                          onChange={(e) => onAppreciationChange(student.id, row.subjectId, e.target.value)}
                          placeholder="Appréciation conduite..."
                          className="w-full text-[8px] border border-blue-500 bg-white rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-600 print:border-none print:p-0"
                        />
                      ) : (
                        <span className="italic truncate block">{row.appreciation}</span>
                      )}
                    </td>
                  </tr>
                );
              }

              // Missing grade / unnoted subject (and not current editable subject)
              if (!row.hasGrade && !isEditable) {
                return (
                  <tr key={row.subjectId || idx} className="hover:bg-gray-50 text-gray-400">
                    <td className="border-r border-black p-1 text-left font-medium text-gray-600 truncate">
                      {row.subjectName}
                    </td>
                    <td className="border-r border-black p-0.5">
                      {row.coef}
                    </td>
                    <td className="border-r border-black p-0.5 font-mono"></td>
                    <td className="border-r border-black p-0.5 font-mono"></td>
                    <td className="border-r border-black p-0.5 font-mono"></td>
                    <td className="border-r border-black p-0.5 font-mono bg-gray-50"></td>
                    <td className="border-r border-black p-0.5 font-mono"></td>
                    <td className="border-r border-black p-0.5 font-mono"></td>
                    <td className="border-r border-black p-0.5 font-mono bg-gray-50"></td>
                    <td className="border-r border-black p-0.5 font-mono"></td>
                    <td className="border-r border-black p-0.5 text-center font-bold">
                      …
                    </td>
                    <td className="p-1 text-left italic">
                      …
                    </td>
                  </tr>
                );
              }

              return (
                <tr
                  key={row.subjectId || idx}
                  className={isEditable ? "bg-blue-50/70 border-y-2 border-blue-400" : "hover:bg-gray-50"}
                >
                  <td className="border-r border-black p-1 text-left font-bold truncate">
                    <span>{row.subjectName}</span>
                    {isEditable && (
                      <span className="no-print ml-1.5 px-1 py-0.5 rounded bg-blue-600 text-white text-[6.5px] font-bold inline-block">
                        Ma Matière
                      </span>
                    )}
                  </td>
                  <td className="border-r border-black p-0.5 font-semibold">
                    {isEditable && onCoefChange ? (
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={row.coef}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 1 && val <= 10) {
                            onCoefChange(row.subjectId, val);
                          }
                        }}
                        className="w-8 text-center font-black border border-blue-500 bg-white rounded text-[8.5px] py-0.5 focus:outline-none print:border-none print:p-0"
                      />
                    ) : (
                      row.coef
                    )}
                  </td>
                  <td className="border-r border-black p-0.5 font-mono">
                    {renderEvaluationInput("interro1", row.interro1)}
                  </td>
                  <td className="border-r border-black p-0.5 font-mono">
                    {renderEvaluationInput("interro2", row.interro2)}
                  </td>
                  <td className="border-r border-black p-0.5 font-mono">
                    {renderEvaluationInput("interro3", row.interro3)}
                  </td>
                  <td className="border-r border-black p-0.5 font-mono font-bold bg-gray-100">
                    {row.moyInterro !== null ? row.moyInterro.toFixed(2) : "-"}
                  </td>
                  <td className="border-r border-black p-0.5 font-mono">
                    {renderEvaluationInput("devoir1", row.devoir1)}
                  </td>
                  <td className="border-r border-black p-0.5 font-mono">
                    {renderEvaluationInput("devoir2", row.devoir2)}
                  </td>
                  <td className="border-r border-black p-0.5 font-black bg-gray-100 font-mono">
                    {row.moyenne20 !== null ? row.moyenne20.toFixed(2) : "-"}
                  </td>
                  <td className="border-r border-black p-0.5 font-bold font-mono">
                    {row.noteCoef !== null ? row.noteCoef.toFixed(2) : "-"}
                  </td>
                  <td className="border-r border-black p-0.5 font-bold">
                    {row.rankFormatted}
                  </td>
                  <td className="p-1 text-left text-[8px] text-gray-800">
                    {isEditable && onAppreciationChange ? (
                      <input
                        type="text"
                        value={row.appreciation === "…" ? "" : row.appreciation}
                        onChange={(e) => onAppreciationChange(student.id, row.subjectId, e.target.value)}
                        placeholder="Rédiger appréciation..."
                        className="w-full text-[8px] border border-blue-500 bg-white rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-600 print:border-none print:p-0"
                      />
                    ) : (
                      <span className="italic truncate block">{row.appreciation}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* 5) LIGNE DES TOTAUX */}
          <tfoot>
            <tr className="bg-gray-100 border-t-2 border-black font-black uppercase text-[8.5px] print:text-[7.5px]">
              <td className="border-r border-black p-1 text-left">
                TOTAUX
              </td>
              <td className="border-r border-black p-0.5 font-black text-center">
                {totalCoef}
              </td>
              <td colSpan={7} className="border-r border-black p-0.5 text-right pr-2">
                TOTAL DES NOTES COEFFICIENTÉES :
              </td>
              <td className="border-r border-black p-0.5 font-black text-center bg-gray-200 font-mono">
                {totalNoteCoef.toFixed(2)}
              </td>
              <td colSpan={2} className="p-1 text-left pl-2 text-[7.5px] font-normal lowercase text-gray-600">
                (sur {totalCoef * 20} pts max)
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 6) MOYENNES PAR GROUPE (3 cellules côte à côte) */}
      <div className="border border-black grid grid-cols-3 divide-x divide-black text-center mb-1.5 bg-gray-50">
        <div className="p-1">
          <span className="text-[8px] uppercase font-bold text-gray-700 block">
            Moy. Matières Littéraires
          </span>
          <span className="text-[10.5px] font-black font-mono">
            {groupAverages.litteraire !== null ? `${groupAverages.litteraire.toFixed(2)} / 20` : "—"}
          </span>
        </div>
        <div className="p-1">
          <span className="text-[8px] uppercase font-bold text-gray-700 block">
            Moy. Matières Scientifiques
          </span>
          <span className="text-[10.5px] font-black font-mono">
            {groupAverages.scientifique !== null ? `${groupAverages.scientifique.toFixed(2)} / 20` : "—"}
          </span>
        </div>
        <div className="p-1">
          <span className="text-[8px] uppercase font-bold text-gray-700 block">
            Moy. Autres Matières
          </span>
          <span className="text-[10.5px] font-black font-mono">
            {groupAverages.autre !== null ? `${groupAverages.autre.toFixed(2)} / 20` : "—"}
          </span>
        </div>
      </div>

      {/* 7) TROIS BLOCS EN BAS */}
      <div className="border border-black grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-black mb-1.5 text-[9.5px] print:text-[8px]">
        {/* Bloc 1 : Résultat de l'apprenant */}
        <div className="p-1.5 flex flex-col justify-between">
          <div className="border-b border-black pb-0.5 mb-1 font-bold uppercase text-[8.5px] text-center bg-gray-100">
            Résultat de l&apos;apprenant
          </div>
          <div className="text-center my-0.5">
            <span className="text-[8px] text-gray-600 uppercase block font-semibold">Moyenne Générale</span>
            <div className="text-lg sm:text-xl print:text-lg font-black font-mono my-0.5">
              {generalAverage.toFixed(2)} <span className="text-[10px] font-normal">/ 20</span>
            </div>
            <p className="text-[8px] italic font-serif text-gray-800 capitalize leading-tight px-1">
              &laquo; {generalAverageInWords} &raquo;
            </p>
          </div>
          <div className="mt-1 pt-0.5 border-t border-dotted border-gray-400 space-y-0.5 text-[8.5px]">
            <div className="flex justify-between">
              <span className="text-gray-600">Rang général :</span>
              <strong className="font-bold">{rankFormatted} sur {classStats.effectiveCount}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mention :</span>
              <strong className="font-black uppercase">{mention}</strong>
            </div>
          </div>
        </div>

        {/* Bloc 2 : Résultat de la classe */}
        <div className="p-1.5 flex flex-col justify-between">
          <div className="border-b border-black pb-0.5 mb-1 font-bold uppercase text-[8.5px] text-center bg-gray-100">
            Résultat de la classe
          </div>
          <div className="space-y-1 py-0.5 text-[8.5px]">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Plus forte moyenne :</span>
              <strong className="font-mono font-bold text-[10px]">{classStats.highestAvg.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Plus faible moyenne :</span>
              <strong className="font-mono font-bold text-[10px]">{classStats.lowestAvg.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Moyenne de la classe :</span>
              <strong className="font-mono font-black text-[10px]">{classStats.classAvg.toFixed(2)} / 20</strong>
            </div>
          </div>
          <div className="text-[7.5px] text-gray-500 italic text-center pt-0.5 border-t border-dotted border-gray-400">
            Matières validées &bull; Division par zéro sécurisée
          </div>
        </div>

        {/* Bloc 3 : Décision du Conseil des Enseignants */}
        <div className="p-1.5 flex flex-col justify-between">
          <div className="border-b border-black pb-0.5 mb-1 font-bold uppercase text-[8.5px] text-center bg-gray-100">
            Décision du Conseil
          </div>
          <div className="space-y-0.5 py-0.5">
            <label className="flex items-center gap-1.5 cursor-default">
              <input
                type="checkbox"
                readOnly
                checked={decisionConseil.felicitation}
                className="w-3 h-3 accent-black pointer-events-none"
              />
              <span className={`text-[8.5px] ${decisionConseil.felicitation ? "font-bold text-black" : "text-gray-600"}`}>
                Félicitation (Moy &ge; 16)
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-default">
              <input
                type="checkbox"
                readOnly
                checked={decisionConseil.encouragement}
                className="w-3 h-3 accent-black pointer-events-none"
              />
              <span className={`text-[8.5px] ${decisionConseil.encouragement ? "font-bold text-black" : "text-gray-600"}`}>
                Encouragement (14 &le; Moy &lt; 16)
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-default">
              <input
                type="checkbox"
                readOnly
                checked={decisionConseil.tableauHonneur}
                className="w-3 h-3 accent-black pointer-events-none"
              />
              <span className={`text-[8.5px] ${decisionConseil.tableauHonneur ? "font-bold text-black" : "text-gray-600"}`}>
                Tableau d&apos;Honneur (Moy &ge; 12)
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-default">
              <input
                type="checkbox"
                readOnly
                checked={decisionConseil.avertissement}
                className="w-3 h-3 accent-black pointer-events-none"
              />
              <span className={`text-[8.5px] ${decisionConseil.avertissement ? "font-bold text-black" : "text-gray-600"}`}>
                Avertissement (Moy &lt; 10)
              </span>
            </label>
          </div>
          <p className="text-[7.5px] text-gray-500 italic text-center pt-0.5 border-t border-dotted border-gray-400">
            Avis souverain du conseil des professeurs
          </p>
        </div>
      </div>

      {/* 8) SIGNATURES */}
      <div className="border border-black grid grid-cols-2 divide-x divide-black mb-1.5 text-center text-[9px] print:text-[8px]">
        {/* Le Titulaire */}
        <div className="p-1.5 flex flex-col justify-between min-h-[75px] print:min-h-[65px]">
          <div>
            <p className="font-bold uppercase text-[8.5px]">Le Titulaire</p>
            <p className="text-[8px] italic text-gray-700 mt-0.5">
              Appréciation générale : <strong className="font-semibold text-black">&laquo; {titulaireAppreciation} &raquo;</strong>
            </p>
          </div>
          <div className="text-[8px] text-gray-500 italic mt-3">
            Signature :
          </div>
        </div>

        {/* Le Directeur */}
        <div className="p-1.5 flex flex-col justify-between min-h-[75px] print:min-h-[65px]">
          <div>
            <p className="font-bold uppercase text-[8.5px]">Le Chef d&apos;Établissement</p>
            <p className="text-[7.5px] text-gray-500 italic">
              (Emplacement du cachet et de la signature)
            </p>
          </div>
          <div className="mt-2">
            <span className="text-[9px] font-black uppercase text-black block">
              {school.directorName}
            </span>
          </div>
        </div>
      </div>

      {/* 9) PIED DE PAGE : Code-barres à gauche, Édité avec [plateforme] à droite */}
      <div className="pt-0.5 flex items-center justify-between text-[7.5px] text-gray-600">
        <div className="flex items-center gap-1.5">
          <BarcodeSVG value={barcodeValue} width={120} height={22} showText={true} />
        </div>
        <div className="text-right">
          <p className="font-semibold">
            Édité avec <strong className="font-bold text-black uppercase">{school.platformName || "EDUCOGEST"}</strong>
          </p>
          <p className="text-[7px] text-gray-400 font-mono">
            Réf : {barcodeValue} &bull; Statut : {status} (v{version})
          </p>
        </div>
      </div>

      {/* Audit Logs Modal for Post-Publication traceability */}
      {showLogsModal && auditLogs && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Journal de traçabilité officiel</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLogsModal(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold"
              >
                Fermer
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{log.subjectName} ({log.fieldName})</span>
                    <span className="text-[10px] text-slate-500">{log.date}</span>
                  </div>
                  <p className="text-slate-600">
                    Valeur modifiée : <span className="line-through text-rose-600">{log.previousValue}</span> &rarr;{" "}
                    <span className="font-bold text-emerald-700">{log.newValue}</span>
                  </p>
                  <p className="text-slate-700 font-medium">Motif légal : {log.reason}</p>
                  <p className="text-[10px] text-slate-400">Auteur : {log.authorName} ({log.authorRole})</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
