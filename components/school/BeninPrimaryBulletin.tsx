"use client";

import React, { useState } from "react";
import { ComputedPrimaryBulletin } from "@/lib/types/bulletin";
import { QRCodeSVG } from "./QRCodeSVG";
import { BarcodeSVG } from "./BarcodeSVG";
import { History, ShieldAlert, CheckCircle2, Sparkles, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeninPrimaryBulletinProps {
  bulletin: ComputedPrimaryBulletin;
  customLogoUrl?: string;
  className?: string;
  showAuditDetails?: boolean;
}

export const BeninPrimaryBulletin: React.FC<BeninPrimaryBulletinProps> = ({
  bulletin,
  customLogoUrl,
  className = "",
  showAuditDetails = false,
}) => {
  const [showLogsModal, setShowLogsModal] = useState(false);

  const {
    student,
    classRoom,
    school,
    period,
    academicYear,
    domainGroups,
    totalCompetencies,
    acquiredCount,
    inProgressCount,
    notAcquiredCount,
    overallAcquisitionRate,
    hasGrades,
    averageNoteSur10,
    absencesCount,
    justifiedAbsencesCount,
    latenessCount,
    titulaireAppreciation,
    directorAppreciation,
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
    >
      {/* Modification post-publication badge (Audit alert) */}
      {isPostPublicationModified && (
        <div className="mb-2 p-1.5 bg-rose-50 border border-rose-300 rounded text-rose-900 flex items-center justify-between text-[10px] print:hidden">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>ATTENTION : Bulletin officiel rectifié après publication initiale (Version {version})</span>
          </div>
          <button
            type="button"
            onClick={() => setShowLogsModal(true)}
            className="underline hover:text-rose-950 font-bold"
          >
            Voir le journal d&apos;audit
          </button>
        </div>
      )}

      {/* ─── EN-TÊTE OFFICIEL BÉNINOIS (CYCLE PRIMAIRE - MEMP) ───────────── */}
      <div className="flex justify-between items-start border-b border-black pb-2 mb-2 gap-2 text-center">
        {/* Colonne Gauche : Ministère des Enseignements Maternel et Primaire */}
        <div className="w-5/12 text-left leading-snug">
          <p className="font-bold uppercase tracking-tight text-[10px] print:text-[8px]">
            RÉPUBLIQUE DU BÉNIN
          </p>
          <p className="font-semibold text-[8.5px] print:text-[7px] text-slate-800">
            MINISTÈRE DES ENSEIGNEMENTS MATERNEL ET PRIMAIRE (MEMP)
          </p>
          <p className="text-[8px] print:text-[6.5px] text-slate-700">
            Direction Départementale des Enseignements Maternel et Primaire
          </p>
          <p className="text-[8px] print:text-[6.5px] text-slate-700">
            Circonscription Scolaire : Littoral / Atlantique
          </p>
          <div className="mt-1 pt-0.5 border-t border-slate-300">
            <p className="font-bold uppercase text-[9.5px] print:text-[7.5px] text-slate-900">
              {school.name}
            </p>
            <p className="text-[7.5px] print:text-[6px] text-slate-600">
              {school.district} &bull; Tél : {school.phoneNumbers}
            </p>
          </div>
        </div>

        {/* Colonne Centre : Logo & Armoiries */}
        <div className="w-2/12 flex flex-col items-center justify-center">
          {logoToUse ? (
            <img
              src={logoToUse}
              alt="Logo Établissement"
              className="w-12 h-12 print:w-10 print:h-10 object-contain rounded"
            />
          ) : (
            <div className="w-12 h-12 print:w-10 print:h-10 border border-dashed border-slate-400 rounded flex items-center justify-center text-[7px] text-slate-400">
              ÉCOLE
            </div>
          )}
          <span className="text-[7px] print:text-[5.5px] text-slate-500 font-semibold tracking-tighter mt-0.5 uppercase">
            Fraternité - Justice - Travail
          </span>
        </div>

        {/* Colonne Droite : Titre du Bulletin et Année */}
        <div className="w-5/12 text-right leading-snug">
          <div className="inline-block border border-black bg-slate-50 px-2 py-0.5 rounded text-center">
            <p className="font-extrabold uppercase text-[10px] print:text-[8px] text-slate-900 tracking-wide">
              BULLETIN DU CYCLE PRIMAIRE
            </p>
            <p className="font-bold text-[8.5px] print:text-[7px] text-emerald-800">
              LIVRET D&apos;ÉVALUATION PAR COMPÉTENCES
            </p>
          </div>
          <p className="mt-1 font-bold text-[9px] print:text-[7.5px]">
            Année Scolaire : <span className="font-mono">{academicYear.label}</span>
          </p>
          <p className="font-bold text-[9px] print:text-[7.5px] text-slate-800">
            Période : {period.name}
          </p>
          <p className="text-[7.5px] print:text-[6px] text-slate-500 font-mono">
            Réf : {bulletin.id}
          </p>
        </div>
      </div>

      {/* ─── IDENTITÉ DE L'ÉLÈVE ET DE LA CLASSE ─────────────────────────── */}
      <div className="border border-black p-2 mb-2 bg-slate-50/50 rounded-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9.5px] print:text-[8px]">
          <div>
            <span className="text-slate-500 text-[8px] uppercase font-bold block">Nom &amp; Prénoms :</span>
            <span className="font-bold text-slate-900 uppercase">
              {student.lastName} {student.firstName}
            </span>
          </div>

          <div>
            <span className="text-slate-500 text-[8px] uppercase font-bold block">Classe &amp; Cycle :</span>
            <span className="font-bold text-emerald-800">
              {classRoom.name} &bull; Cycle Primaire
            </span>
          </div>

          <div>
            <span className="text-slate-500 text-[8px] uppercase font-bold block">Matricule Scolaire :</span>
            <span className="font-mono font-bold">{student.matricule}</span>
          </div>

          <div>
            <span className="text-slate-500 text-[8px] uppercase font-bold block">N° Educ Master :</span>
            <span className="font-mono font-bold text-slate-800">{student.educMasterNumber}</span>
          </div>

          <div>
            <span className="text-slate-500 text-[8px] uppercase font-bold block">Date &amp; Lieu de Naissance :</span>
            <span>{student.birthDate} à {student.birthPlace}</span>
          </div>

          <div>
            <span className="text-slate-500 text-[8px] uppercase font-bold block">Sexe :</span>
            <span>{student.gender === "M" ? "Masculin (Garçon)" : "Féminin (Fille)"}</span>
          </div>

          <div>
            <span className="text-slate-500 text-[8px] uppercase font-bold block">Maître(sse) Titulaire :</span>
            <span className="font-semibold">{classRoom.mainTeacher || "Non assigné"}</span>
          </div>

          <div>
            <span className="text-slate-500 text-[8px] uppercase font-bold block">Effectif de la classe :</span>
            <span className="font-bold">{classRoom.size} élèves</span>
          </div>
        </div>
      </div>

      {/* ─── GRILLE DES COMPÉTENCES PAR DOMAINE D'APPRENTISSAGE ─────────── */}
      <div className="border border-black overflow-hidden mb-2">
        <table className="w-full border-collapse text-[9.5px] print:text-[8px]">
          <thead>
            <tr className="bg-slate-200 text-slate-900 border-b border-black font-bold uppercase text-[9px] print:text-[7.5px]">
              <th className="border-r border-black p-1 text-left w-6/12">
                Domaines d&apos;apprentissage &amp; Compétences évaluées
              </th>
              <th className="border-r border-black p-1 text-center w-2/12">
                Niveau d&apos;acquisition
              </th>
              <th className="border-r border-black p-1 text-center w-1/12">
                Note / 10 <span className="font-normal text-[7px] block">(Indicative)</span>
              </th>
              <th className="p-1 text-left w-3/12">
                Observations de l&apos;enseignant
              </th>
            </tr>
          </thead>
          <tbody>
            {domainGroups.map((group) => (
              <React.Fragment key={group.domainId}>
                {/* En-tête de Domaine */}
                <tr className="bg-slate-100 border-t border-b border-black font-bold">
                  <td colSpan={4} className="p-1.5 text-slate-900">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 uppercase tracking-wide text-[9.5px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                        {group.domainName}
                      </span>
                      <span className="text-[8px] font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded border border-slate-300">
                        Maîtrise du domaine : <strong>{group.acquisitionRate}%</strong>
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Lignes de Compétences */}
                {group.competencies.map((comp) => (
                  <tr
                    key={comp.competencyId}
                    className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <td className="border-r border-slate-300 p-1 pl-4 text-slate-800">
                      &bull; {comp.competencyName}
                    </td>

                    {/* Niveau d'acquisition */}
                    <td className="border-r border-slate-300 p-1 text-center">
                      {comp.levelCode ? (
                        <span
                          className={cn(
                            "inline-block px-2 py-0.5 rounded text-[8.5px] font-bold border",
                            comp.badgeClass
                          )}
                        >
                          {comp.levelShortLabel} &bull; {comp.levelLabel}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[8px]">Non évalué</span>
                      )}
                    </td>

                    {/* Note sur 10 optionnelle */}
                    <td className="border-r border-slate-300 p-1 text-center font-bold font-mono">
                      {comp.noteSur10 !== null ? `${comp.noteSur10.toFixed(1)}` : "-"}
                    </td>

                    {/* Observation */}
                    <td className="p-1 text-slate-700 italic text-[8.5px]">
                      {comp.teacherObservation || "Bon travail, poursuivre les efforts."}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── LÉGENDE DE L'ÉCHELLE D'ACQUISITION ──────────────────────────── */}
      <div className="border border-slate-300 bg-slate-50/70 p-1.5 rounded-sm mb-2 text-[8px] print:text-[6.5px] flex flex-wrap items-center justify-between gap-1">
        <span className="font-bold text-slate-800 uppercase">Légende :</span>
        <span className="inline-flex items-center gap-1 font-semibold text-blue-800">
          <strong className="bg-blue-100 px-1 py-0.5 rounded border border-blue-200">EXP</strong>: Expert / Dépassé
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
          <strong className="bg-emerald-100 px-1 py-0.5 rounded border border-emerald-200">A</strong>: Acquis (Objectif atteint)
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-amber-800">
          <strong className="bg-amber-100 px-1 py-0.5 rounded border border-amber-200">ECA</strong>: En cours d&apos;acquisition
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-rose-800">
          <strong className="bg-rose-100 px-1 py-0.5 rounded border border-rose-200">NA</strong>: Non acquis
        </span>
      </div>

      {/* ─── BILAN DES ACQUISITIONS & ASSIDUITÉ ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
        {/* Synthèse des compétences */}
        <div className="border border-black p-2 rounded-sm bg-emerald-50/40">
          <p className="font-bold uppercase text-[9px] print:text-[7.5px] text-emerald-950 border-b border-emerald-300 pb-1 mb-1.5 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-700" />
            Synthèse des Compétences
          </p>
          <div className="space-y-1 text-[8.5px] print:text-[7px]">
            <div className="flex justify-between">
              <span>Compétences évaluées :</span>
              <strong className="font-mono">{totalCompetencies}</strong>
            </div>
            <div className="flex justify-between text-emerald-800 font-semibold">
              <span>Compétences acquises (EXP + A) :</span>
              <strong className="font-mono">{acquiredCount}</strong>
            </div>
            <div className="flex justify-between text-amber-800">
              <span>En cours d&apos;acquisition (ECA) :</span>
              <strong className="font-mono">{inProgressCount}</strong>
            </div>
            <div className="flex justify-between text-rose-800">
              <span>Non acquises (NA) :</span>
              <strong className="font-mono">{notAcquiredCount}</strong>
            </div>
            <div className="pt-1 border-t border-emerald-200 flex justify-between font-bold text-emerald-950">
              <span>Taux Global de Maîtrise :</span>
              <span className="font-mono text-[10px] text-emerald-700">{overallAcquisitionRate}%</span>
            </div>
          </div>
        </div>

        {/* Moyenne indicative (si renseignée) & Assiduité */}
        <div className="border border-black p-2 rounded-sm">
          <p className="font-bold uppercase text-[9px] print:text-[7.5px] text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
            Assiduité &amp; Résultats Chiffrés
          </p>
          <div className="space-y-1 text-[8.5px] print:text-[7px]">
            <div className="flex justify-between">
              <span>Moyenne indicative (/10) :</span>
              <strong className="font-mono text-slate-900">
                {averageNoteSur10 !== null ? `${averageNoteSur10.toFixed(1)} / 10` : "Non noté"}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Absences justifiées :</span>
              <span className="font-mono">{justifiedAbsencesCount} demi-journée(s)</span>
            </div>
            <div className="flex justify-between">
              <span>Absences non justifiées :</span>
              <span className="font-mono text-rose-700 font-bold">
                {absencesCount - justifiedAbsencesCount} demi-journée(s)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Retards enregistrés :</span>
              <span className="font-mono">{latenessCount}</span>
            </div>
          </div>
        </div>

        {/* Sécurisation officielle : QR Code & Barcode */}
        <div className="border border-black p-2 rounded-sm flex flex-col justify-between items-center text-center">
          <p className="font-bold uppercase text-[8px] print:text-[7px] text-slate-800 mb-1">
            Certificat d&apos;Authenticité
          </p>
          <div className="flex items-center gap-2">
            <QRCodeSVG value={verificationUrl} size={48} />
            <div className="text-left leading-none">
              <span className="text-[7.5px] text-slate-600 block">Vérification :</span>
              <span className="text-[7px] font-mono text-slate-800 block break-all">
                {verificationUrl.replace("https://", "")}
              </span>
            </div>
          </div>
          <div className="mt-1 w-full flex justify-center">
            <BarcodeSVG value={barcodeValue} height={20} />
          </div>
        </div>
      </div>

      {/* ─── APPRÉCIATIONS & SIGNATURES ──────────────────────────────────── */}
      <div className="border border-black p-2 mb-2 rounded-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[9px] print:text-[7.5px]">
          <div>
            <p className="font-bold uppercase text-slate-800 mb-1">
              Appréciation de l&apos;Enseignant(e) Titulaire :
            </p>
            <div className="p-2 border border-slate-300 rounded bg-slate-50 min-h-[42px] italic text-slate-800">
              {titulaireAppreciation ||
                "Élève sérieux et attentif. Poursuivre avec persévérance dans la lecture et la résolution de problèmes."}
            </div>
          </div>

          <div>
            <p className="font-bold uppercase text-slate-800 mb-1">
              Observations de la Direction de l&apos;École :
            </p>
            <div className="p-2 border border-slate-300 rounded bg-slate-50 min-h-[42px] italic text-slate-800">
              {directorAppreciation ||
                "Bilan satisfaisant. Félicitations pour les progrès accomplis durant ce trimestre."}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SIGNATURES OFFICIELLES ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 border border-black text-center text-[9px] print:text-[7.5px] p-2">
        <div className="border-r border-black pr-2">
          <p className="font-bold uppercase text-slate-800 mb-8">Le Maître / La Maîtresse</p>
          <p className="text-[8px] text-slate-500 italic">Signature &amp; Date</p>
        </div>

        <div className="border-r border-black px-2">
          <p className="font-bold uppercase text-slate-800 mb-8">Le Directeur de l&apos;École</p>
          <p className="text-[8px] font-bold text-slate-900">{school.directorName}</p>
          <p className="text-[7.5px] text-slate-500 uppercase">(Cachet Officiel)</p>
        </div>

        <div className="pl-2">
          <p className="font-bold uppercase text-slate-800 mb-8">Le Parent ou Tuteur Légal</p>
          <p className="text-[8px] text-slate-500 italic">Signature &amp; Date</p>
        </div>
      </div>

      {/* ─── MODAL DU JOURNAL D'AUDIT (SI MODIFIÉ) ────────────────────────── */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <History className="w-4 h-4" />
                <span>Journal d&apos;Audit — Rectifications Pédagogiques</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLogsModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
              {auditLogs && auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="flex justify-between text-[11px] font-bold text-slate-800">
                      <span>{log.authorName} ({log.authorRole})</span>
                      <span className="text-slate-400 font-normal">{new Date(log.date).toLocaleDateString("fr-BJ")}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Action : <strong>{log.action}</strong>
                      {log.subjectName && ` &bull; ${log.subjectName}`}
                    </div>
                    {log.reason && (
                      <div className="text-[10px] text-slate-500 italic mt-0.5">
                        Motif : {log.reason}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-xs italic">Aucune modification enregistrée.</p>
              )}
            </div>
            <div className="text-right pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowLogsModal(false)}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
