"use client";

import React, { useState } from "react";
import {
  Printer,
  X,
  FileText,
  Building,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  Maximize2,
  QrCode,
  Sparkles,
} from "lucide-react";
import { StudentProfile, ClassRoom } from "@/lib/types/bulletin";
import { SchoolDocumentRecord } from "@/lib/secretariat-store";
import { useSubscriptionStore } from "@/lib/subscription-store";

interface OfficialDocumentModalProps {
  document: SchoolDocumentRecord | null;
  student?: StudentProfile | null;
  classroom?: ClassRoom | null;
  onClose: () => void;
}

export const OfficialDocumentModal: React.FC<OfficialDocumentModalProps> = ({
  document,
  student,
  classroom,
  onClose,
}) => {
  const { activeSchool } = useSubscriptionStore();
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  if (!document) return null;

  const handlePrint = () => {
    window.print();
  };

  const studentFullName = student
    ? `${student.lastName} ${student.firstName}`
    : document.studentName || "Élève";

  const studentLastName = student?.lastName || studentFullName.split(" ")[0] || "";
  const studentFirstName = student?.firstName || studentFullName.split(" ").slice(1).join(" ") || "";
  const studentMatricule = student?.matricule || document.matricule || "ECO-2026-0000";
  const studentEducMaster = student?.educMasterNumber || "EM-BN-000000";
  const studentGender = student?.gender ? (student.gender === "M" ? "Masculin (M)" : "Féminin (F)") : "Non précisé";
  const className = classroom?.name || student?.className || document.className || "6ème A";
  const academicYear = document.academicYear || "2026 - 2027";
  const birthInfo = student
    ? `${student.birthDate ? new Date(student.birthDate).toLocaleDateString("fr-FR") : "Date non précisée"}${
        student.birthPlace ? ` à ${student.birthPlace}` : ""
      }`
    : "Non précisé";
  const parentName = student?.parentName || "Parent / Tuteur légal";
  const parentPhone = student?.parentPhone || "+229 ";
  const directorName = (activeSchool as any)?.directorName || "Direction de l'Établissement";
  const directorSignatureUrl = (activeSchool as any)?.directorSignatureUrl || "";

  const docTitle = document.title || "DOCUMENT ADMINISTRATIF OFFICIEL";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Styles d'impression dédiés A4 - Indépendants de l'écran */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm 12mm 15mm;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            height: auto !important;
            overflow: visible !important;
          }
          /* Masquer tout sauf le document à imprimer */
          body * {
            visibility: hidden !important;
          }
          #printable-official-doc,
          #printable-official-doc * {
            visibility: visible !important;
          }
          #printable-official-doc {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            transform: none !important;
          }
          .no-print,
          .no-print * {
            display: none !important;
          }
        }
      `}</style>

      {/* Cadre modal principal - 100% responsive et bien cadré sur PC & Mobile */}
      <div className="bg-slate-900 text-slate-100 rounded-3xl shadow-2xl w-full max-w-5xl xl:max-w-6xl border border-slate-700/60 overflow-hidden flex flex-col max-h-[95vh] my-auto">
        {/* Barre d'outils supérieure (Masquée à l'impression) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-school-primary/20 text-school-300 border border-school-primary/40 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-teal-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-xs sm:text-sm truncate">
                {docTitle} &mdash; <span className="font-mono text-teal-400">Réf. {document.referenceNumber}</span>
              </h3>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Aperçu fidèle &bull; Format officiel A4 République du Bénin &bull; Prêt pour impression / PDF
              </p>
            </div>
          </div>

          {/* Outils de zoom & Actions d'impression */}
          <div className="flex items-center gap-2">
            {/* Contrôles de zoom pour ordinateur */}
            <div className="hidden md:flex items-center bg-slate-800 border border-slate-700 rounded-xl px-1.5 py-1 text-xs">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(75, prev - 10))}
                className="p-1 hover:text-white text-slate-400 transition"
                title="Réduire l'aperçu"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-[11px] font-bold text-slate-200">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(130, prev + 10))}
                className="p-1 hover:text-white text-slate-400 transition"
                title="Agrandir l'aperçu"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="ml-1 px-1.5 py-0.5 rounded text-[10px] text-slate-400 hover:text-white hover:bg-slate-700 transition"
                title="Zoom normal (100%)"
              >
                100%
              </button>
            </div>

            {/* Bouton Impression Principale */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all touch-target"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / Exporter PDF</span>
            </button>

            {/* Bouton Fermer */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Zone de prévisualisation avec arrière-plan bureau officiel */}
        <div className="p-3 sm:p-6 md:p-8 overflow-y-auto flex-1 bg-slate-950 flex justify-center items-start">
          {/* FEUILLE OFFICIELLE FORMAT A4 */}
          <div
            id="printable-official-doc"
            style={{
              zoom: `${zoomLevel}%`,
            }}
            className="bg-white w-full max-w-[850px] p-6 sm:p-10 md:p-14 rounded-2xl shadow-2xl text-slate-900 border border-slate-300 font-sans transition-all duration-150"
          >
            {/* 1. EN-TÊTE RÉGLEMENTAIRE RÉPUBLIQUE DU BÉNIN & ÉTABLISSEMENT */}
            <div className="border-b-2 border-slate-900 pb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                {/* Colonne Gauche : Ministère & République */}
                <div className="space-y-1 text-center sm:text-left">
                  <p className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800">
                    RÉPUBLIQUE DU BÉNIN
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-600 font-semibold leading-tight uppercase">
                    MINISTÈRE DES ENSEIGNEMENTS SECONDAIRE, TECHNIQUE ET DE LA FORMATION PROFESSIONNELLE
                  </p>
                  <p className="text-[9px] text-slate-500 font-serif italic">
                    Devise : Fraternité &bull; Justice &bull; Travail
                  </p>
                  {/* Filet tricolore béninois subtil */}
                  <div className="flex h-1 w-28 mx-auto sm:mx-0 rounded-full overflow-hidden mt-1">
                    <span className="w-1/3 bg-emerald-600"></span>
                    <span className="w-1/3 bg-amber-400"></span>
                    <span className="w-1/3 bg-rose-600"></span>
                  </div>
                </div>

                {/* Colonne Droite : Établissement Scolaire */}
                <div className="text-center sm:text-right space-y-1">
                  <h4 className="text-sm sm:text-base md:text-lg font-black uppercase text-slate-900 leading-tight">
                    {activeSchool.name}
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {activeSchool.address || `${activeSchool.city}, ${activeSchool.country}`}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Code Établissement : <strong className="text-slate-800">{activeSchool.code}</strong> &bull; Tél : {activeSchool.phone || "+229"}
                  </p>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-school-primary mt-1">
                    Année Scolaire : {academicYear}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. RÉFÉRENCE, DATE ET LIEU D'ÉMISSION */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 mt-4 gap-2">
              <span className="font-mono font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-lg border border-slate-200">
                RÉF. N° : {document.referenceNumber} / {activeSchool.code} / SECR
              </span>
              <span className="font-medium">
                Fait à <strong className="text-slate-900">{activeSchool.city || "Cotonou"}</strong>, le{" "}
                <strong className="text-slate-900">
                  {new Date(document.issueDate || Date.now()).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
              </span>
            </div>

            {/* 3. BANNIÈRE OFFICIELLE DU TITRE DU DOCUMENT */}
            <div className="text-center my-6 py-3.5 px-4 bg-slate-50/80 rounded-2xl border-2 border-slate-800 shadow-2xs">
              <h1 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-wider text-slate-900">
                {docTitle}
              </h1>
              {document.recipient && (
                <p className="text-xs text-slate-600 mt-1">
                  Délivré pour servir à : <strong className="text-slate-900">{document.recipient}</strong>
                </p>
              )}
            </div>

            {/* 4. CONTENU DU DOCUMENT SELON LE TYPE */}

            {/* A. CERTIFICAT DE SCOLARITÉ */}
            {document.docType === "CERTIFICAT_SCOLARITE" && (
              <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-800">
                <p className="text-justify leading-relaxed">
                  Le Chef d&apos;Établissement soussigné, certifie sur l&apos;honneur que l&apos;apprenant(e) dont les informations administratives suivent :
                </p>

                {/* Tableau de signalement administratif réactif */}
                <div className="bg-slate-50/70 rounded-2xl border border-slate-300 p-4 sm:p-5 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-200/80 gap-1">
                    <span className="text-slate-500 font-semibold sm:w-1/3">Nom &amp; Prénoms :</span>
                    <span className="font-black text-slate-900 uppercase sm:w-2/3 text-sm">
                      {studentFullName}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-200/80 gap-1">
                    <span className="text-slate-500 font-semibold sm:w-1/3">N° Matricule Établissement :</span>
                    <span className="font-mono font-bold text-slate-800 sm:w-2/3">{studentMatricule}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-200/80 gap-1">
                    <span className="text-slate-500 font-semibold sm:w-1/3">N° National EducMaster :</span>
                    <span className="font-mono text-slate-700 sm:w-2/3">{studentEducMaster}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-200/80 gap-1">
                    <span className="text-slate-500 font-semibold sm:w-1/3">Sexe &amp; Filiation :</span>
                    <span className="text-slate-800 sm:w-2/3">{studentGender} &mdash; Enfant de : {parentName}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-200/80 gap-1">
                    <span className="text-slate-500 font-semibold sm:w-1/3">Date &amp; Lieu de Naissance :</span>
                    <span className="text-slate-800 sm:w-2/3">{birthInfo}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 gap-1">
                    <span className="text-slate-500 font-semibold sm:w-1/3">Classe Actuelle :</span>
                    <span className="font-bold text-teal-800 text-sm sm:w-2/3">{className}</span>
                  </div>
                </div>

                <p className="text-justify leading-relaxed">
                  Est régulièrement inscrit(e) sur les registres matricules de notre établissement scolaire et suit avec ponctualité et assiduité les enseignements au titre de l&apos;année scolaire <strong>{academicYear}</strong>.
                </p>

                <p className="text-slate-600 text-xs italic">
                  En foi de quoi, le présent certificat de scolarité lui est délivré pour servir et valoir ce que de droit.
                </p>
              </div>
            )}

            {/* B. ATTESTATION DE FRÉQUENTATION */}
            {document.docType === "ATTESTATION_FREQUENTATION" && (
              <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-800">
                <p className="text-justify leading-relaxed">
                  Le Secrétariat Pédagogique et la Direction de <strong>{activeSchool.name}</strong> attestent par la présente que :
                </p>

                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-300 space-y-3">
                  <p className="leading-relaxed">
                    L&apos;apprenant(e) <strong className="text-slate-900 uppercase">{studentFullName}</strong>,
                    porteur(se) du matricule scolaire <strong className="font-mono text-slate-900">{studentMatricule}</strong>,
                    né(e) le <strong>{birthInfo}</strong>, fréquente régulièrement la classe de{" "}
                    <strong className="text-teal-800">{className}</strong> au cours de l&apos;année scolaire <strong>{academicYear}</strong>.
                  </p>
                  <p className="text-slate-600 text-xs border-t border-slate-200 pt-2">
                    Son assiduité aux cours magistraux, travaux dirigés et évaluations périodiques est attestée par le cahier d&apos;émargement et les registres d&apos;appel officiels de la vie scolaire.
                  </p>
                </div>

                <p className="text-justify leading-relaxed">
                  Cette attestation est établie et délivrée à la demande de l&apos;intéressé(e) ou de son représentant légal pour servir auprès de toute administration compétente.
                </p>
              </div>
            )}

            {/* C. CERTIFICAT DE RADIATION */}
            {document.docType === "CERTIFICAT_RADIATION" && (
              <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-800">
                <p className="text-justify leading-relaxed">
                  Le Secrétariat administratif et pédagogique atteste que l&apos;élève mentionné(e) ci-dessous a été officiellement radié(e) des effectifs de l&apos;établissement :
                </p>

                <div className="bg-rose-50/40 p-5 rounded-2xl border border-rose-200 space-y-2.5">
                  <div className="flex flex-col sm:flex-row justify-between py-1 border-b border-rose-100">
                    <span className="font-semibold text-slate-600">Nom &amp; Prénoms de l&apos;élève :</span>
                    <span className="font-black text-slate-900 uppercase">{studentFullName}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between py-1 border-b border-rose-100">
                    <span className="font-semibold text-slate-600">Matricule :</span>
                    <span className="font-mono font-bold text-slate-800">{studentMatricule}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between py-1 border-b border-rose-100">
                    <span className="font-semibold text-slate-600">Dernière classe fréquentée :</span>
                    <span className="font-bold text-slate-800">{className}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between py-1">
                    <span className="font-semibold text-slate-600">Motif de la radiation :</span>
                    <span className="font-bold text-rose-800">{document.notes || "Changement d'établissement / Transfert familial"}</span>
                  </div>
                </div>

                <p className="text-justify leading-relaxed">
                  L&apos;élève susmentionné(e) est en règle avec l&apos;établissement, quitte de toute obligation financière de scolarité et a restitué les manuels et matériels scolaires mis à sa disposition.
                </p>
              </div>
            )}

            {/* D. FICHE D'INSCRIPTION */}
            {document.docType === "FICHE_INSCRIPTION" && (
              <div className="space-y-5 text-xs sm:text-sm text-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cadre Identité de l'élève */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-slate-300 bg-slate-50/70 space-y-2">
                    <h5 className="font-black text-xs uppercase tracking-wider text-teal-800 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      1. Identité de l&apos;Apprenant
                    </h5>
                    <p><strong className="text-slate-500">Nom :</strong> <span className="font-bold uppercase text-slate-900">{studentLastName}</span></p>
                    <p><strong className="text-slate-500">Prénoms :</strong> <span className="font-bold text-slate-900">{studentFirstName}</span></p>
                    <p><strong className="text-slate-500">Matricule :</strong> <span className="font-mono font-bold text-slate-800">{studentMatricule}</span></p>
                    <p><strong className="text-slate-500">Sexe :</strong> {studentGender}</p>
                    <p><strong className="text-slate-500">Naissance :</strong> {birthInfo}</p>
                    <p><strong className="text-slate-500">Classe assignée :</strong> <span className="font-bold text-teal-800">{className}</span></p>
                  </div>

                  {/* Cadre Parents / Tuteurs */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-slate-300 bg-slate-50/70 space-y-2">
                    <h5 className="font-black text-xs uppercase tracking-wider text-teal-800 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" />
                      2. Filiation &amp; Coordonnées
                    </h5>
                    <p><strong className="text-slate-500">Parent / Tuteur :</strong> <span className="font-bold text-slate-900">{parentName}</span></p>
                    <p><strong className="text-slate-500">Téléphone de contact :</strong> <span className="font-mono text-slate-900">{parentPhone}</span></p>
                    <p><strong className="text-slate-500">Email :</strong> {student?.parentEmail || "Non renseigné"}</p>
                    <p><strong className="text-slate-500">Adresse de résidence :</strong> {activeSchool.city || "Cotonou"}, Bénin</p>
                    <p><strong className="text-slate-500">Statut du dossier :</strong> <span className="font-bold text-emerald-700">Dossier régularisé et complet</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* E. FICHE INDIVIDUELLE DE L'ÉLÈVE */}
            {document.docType === "FICHE_INDIVIDUELLE" && (
              <div className="space-y-4 text-xs sm:text-sm text-slate-800">
                <div className="p-5 rounded-2xl border border-slate-300 bg-slate-50/70 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="font-black text-base uppercase text-slate-900">{studentFullName}</h4>
                      <p className="text-xs text-slate-500 font-mono">Matricule : {studentMatricule} &bull; EducMaster : {studentEducMaster}</p>
                    </div>
                    <span className="mt-2 sm:mt-0 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Scolarité Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div><strong>Classe fréquentée :</strong> {className}</div>
                    <div><strong>Cycle pédagogique :</strong> {classroom?.cycle || "Enseignement Secondaire Général"}</div>
                    <div><strong>Date &amp; Lieu de naissance :</strong> {birthInfo}</div>
                    <div><strong>Genre :</strong> {studentGender}</div>
                    <div><strong>Représentant légal :</strong> {parentName} ({parentPhone})</div>
                    <div><strong>Date d&apos;enregistrement :</strong> {document.issueDate}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. CADRE OFFICIEL DES SIGNATURES & VISAS ÉTABLISSEMENT */}
            <div className="pt-8 mt-8 border-t-2 border-slate-900">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
                {/* Signature Secrétaire Pédagogique */}
                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200 space-y-12">
                  <div>
                    <p className="font-black text-slate-900 uppercase tracking-wide">
                      Le Secrétaire Pédagogique
                    </p>
                    <p className="text-[10px] text-slate-500">Service de la Scolarité &amp; des Archives</p>
                  </div>

                  <div className="text-[11px] text-slate-600">
                    <p className="font-bold text-slate-900">{document.issuedBy}</p>
                    <p className="text-[10px] text-slate-400 italic mt-0.5">[Visa &amp; Signature certifiée]</p>
                  </div>
                </div>

                {/* Signature Chef d'Établissement */}
                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200 flex flex-col justify-between min-h-[140px]">
                  <div>
                    <p className="font-black text-slate-900 uppercase tracking-wide">
                      Le Chef d&apos;Établissement / Directeur
                    </p>
                    <p className="text-[10px] text-slate-500">Direction Générale de l&apos;Établissement</p>
                  </div>

                  <div className="my-2 flex items-center justify-center min-h-[44px]">
                    {directorSignatureUrl ? (
                      <img
                        src={directorSignatureUrl}
                        alt={`Signature ${directorName}`}
                        className="h-12 max-w-[170px] object-contain"
                      />
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">[Sceau officiel de l&apos;École &amp; Signature]</p>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-600">
                    <p className="font-black text-slate-900 uppercase tracking-wider">{directorName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. PIED DE PAGE ANTI-FRAUDE & SÉCURITÉ */}
            <div className="mt-8 pt-3 border-t border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>
                  Document officiel généré par le Système Intégré de Gestion Scolaire <strong>ECOGEST Pro</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[9px] text-slate-400">
                <span>RÉF-VÉRIF: {document.id.toUpperCase().slice(0, 16)}</span>
                <span>&bull;</span>
                <span>BÉNIN ÉDUCATION</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pied de dialogue (Masqué à l'impression) */}
        <div className="no-print p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 px-6">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Mise en page optimisée pour feuille A4 standard (imprimante de bureau ou PDF).
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Fermer l&apos;aperçu
          </button>
        </div>
      </div>
    </div>
  );
};
