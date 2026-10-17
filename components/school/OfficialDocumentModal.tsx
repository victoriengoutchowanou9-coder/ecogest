"use client";

import React from "react";
import {
  Printer,
  X,
  FileText,
  Building,
  Calendar,
  CheckCircle2,
  Download,
  ShieldCheck,
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

  if (!document) return null;

  const handlePrint = () => {
    window.print();
  };

  const studentFullName = student
    ? `${student.lastName} ${student.firstName}`
    : document.studentName || "Élève";

  const studentMatricule = student?.matricule || document.matricule || "ECO-2026-0000";
  const studentEducMaster = student?.educMasterNumber || "EM-BN-000000";
  const className = classroom?.name || student?.className || document.className || "6ème A";
  const academicYear = document.academicYear || "2026 - 2027";
  const birthInfo = student
    ? `${student.birthDate ? new Date(student.birthDate).toLocaleDateString("fr-FR") : "Date non précisée"}${student.birthPlace ? ` à ${student.birthPlace}` : ""}`
    : "Non précisé";
  const parentName = student?.parentName || "Parent / Tuteur légal";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header toolbar (Hidden on print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                {document.title} &mdash; Réf. {document.referenceNumber}
              </h3>
              <p className="text-xs text-slate-500">
                Document officiel &bull; Format d&apos;impression A4 Bénin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-bold shadow-sm hover:bg-school-primary/90 transition touch-target"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / Exporter PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (A4 style) */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div
            id="printable-document"
            className="bg-white w-full max-w-[760px] p-8 sm:p-12 rounded-2xl shadow-md border border-slate-300 text-slate-900 space-y-8 print:border-none print:shadow-none print:p-0 print:m-0"
          >
            {/* Republic & School Official Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
              <div className="space-y-1 max-w-[280px]">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                  RÉPUBLIQUE DU BÉNIN
                </p>
                <p className="text-[10px] text-slate-500 font-semibold leading-tight">
                  MINISTÈRE DES ENSEIGNEMENTS SECONDAIRE, TECHNIQUE ET DE LA FORMATION PROFESSIONNELLE
                </p>
                <p className="text-[9px] text-slate-400 italic">
                  Devise : Fraternité - Justice - Travail
                </p>
              </div>

              <div className="text-right space-y-1 max-w-[300px]">
                <h4 className="text-base sm:text-lg font-black uppercase text-slate-900 leading-tight">
                  {activeSchool.name}
                </h4>
                <p className="text-[11px] text-slate-600 font-medium">
                  {activeSchool.address || `${activeSchool.city}, ${activeSchool.country}`}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Code École : {activeSchool.code} &bull; Tél : {activeSchool.phone || "+229"}
                </p>
                <p className="text-[11px] font-bold text-school-primary">
                  Année Scolaire : {academicYear}
                </p>
              </div>
            </div>

            {/* Document Reference & Date */}
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-mono font-bold bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                Réf : N° {document.referenceNumber} / {activeSchool.code}
              </span>
              <span>
                Fait à {activeSchool.city || "Cotonou"}, le{" "}
                <strong className="text-slate-900">
                  {new Date(document.issueDate || Date.now()).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
              </span>
            </div>

            {/* Document Title Banner */}
            <div className="text-center py-4 px-6 bg-slate-50 rounded-2xl border border-slate-200">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-slate-900">
                {document.title}
              </h1>
              {document.recipient && (
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  À l&apos;attention de : <strong className="text-slate-800">{document.recipient}</strong>
                </p>
              )}
            </div>

            {/* Document Specific Body */}
            {document.docType === "CERTIFICAT_SCOLARITE" && (
              <div className="space-y-6 text-sm leading-relaxed text-slate-800">
                <p>
                  Le Directeur / La Direction de l&apos;établissement <strong>{activeSchool.name}</strong>,
                  soussigné(e), certifie par la présente que l&apos;élève :
                </p>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2.5 text-xs sm:text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-500">Nom &amp; Prénoms :</span>
                    <span className="col-span-2 font-black text-slate-900 uppercase">
                      {studentFullName}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-500">Matricule Établissement :</span>
                    <span className="col-span-2 font-mono font-bold text-slate-800">
                      {studentMatricule}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-500">N° National EducMaster :</span>
                    <span className="col-span-2 font-mono text-slate-700">
                      {studentEducMaster}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-500">Date et lieu de naissance :</span>
                    <span className="col-span-2 text-slate-800">{birthInfo}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-500">Classe fréquentée :</span>
                    <span className="col-span-2 font-bold text-school-primary">{className}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-500">Parent / Tuteur :</span>
                    <span className="col-span-2 text-slate-800">{parentName}</span>
                  </div>
                </div>

                <p>
                  Est régulièrement inscrit(e) et poursuit ses études avec assiduité au titre de l&apos;année scolaire{" "}
                  <strong>{academicYear}</strong>.
                </p>

                <p className="text-xs text-slate-600 italic">
                  En foi de quoi, ce certificat lui est délivré pour servir et valoir ce que de droit.
                </p>
              </div>
            )}

            {document.docType === "ATTESTATION_FREQUENTATION" && (
              <div className="space-y-6 text-sm leading-relaxed text-slate-800">
                <p>
                  La Direction de l&apos;établissement scolaire <strong>{activeSchool.name}</strong> atteste que :
                </p>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs sm:text-sm">
                  <p>
                    L&apos;élève <strong>{studentFullName}</strong>, matricule <strong>{studentMatricule}</strong>,
                    né(e) le {birthInfo}, est assidu(e) aux cours de la classe de <strong>{className}</strong> au sein de notre établissement.
                  </p>
                  <p className="text-slate-600">
                    Son comportement et son assiduité globale sont conformes aux exigences du règlement intérieur de l&apos;établissement pour l&apos;année scolaire en cours ({academicYear}).
                  </p>
                </div>

                <p>
                  La présente attestation est délivrée à la demande de l&apos;intéressé(e) pour toutes fins utiles.
                </p>
              </div>
            )}

            {document.docType === "CERTIFICAT_RADIATION" && (
              <div className="space-y-6 text-sm leading-relaxed text-slate-800">
                <p>
                  Le Secrétariat pédagogique certifie que l&apos;élève désigné(e) ci-après a été officiellement rayé(e) des registres de l&apos;établissement :
                </p>

                <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-200 space-y-2.5 text-xs sm:text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-500">Nom &amp; Prénoms :</span>
                    <span className="col-span-2 font-black text-slate-900 uppercase">
                      {studentFullName}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-500">Classe quittée :</span>
                    <span className="col-span-2 font-bold text-slate-800">{className}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-500">Matricule :</span>
                    <span className="col-span-2 font-mono font-bold text-slate-800">{studentMatricule}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-slate-500">Motif de la radiation :</span>
                    <span className="col-span-2 text-rose-900 font-medium">{document.notes || "Transfert / Changement d'établissement"}</span>
                  </div>
                </div>

                <p>
                  L&apos;élève est quitte de toute obligation financière et matérielle envers l&apos;établissement à la date de signature.
                </p>
              </div>
            )}

            {document.docType === "FICHE_INSCRIPTION" && (
              <div className="space-y-5 text-xs sm:text-sm text-slate-800">
                <p className="font-bold text-slate-900 text-center uppercase tracking-wide">
                  Dossier Administratif d&apos;Inscription &mdash; {academicYear}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-school-primary">
                      1. Identité de l&apos;Élève
                    </h5>
                    <p><strong>Nom :</strong> {student?.lastName || studentFullName.split(" ")[0]}</p>
                    <p><strong>Prénoms :</strong> {student?.firstName || studentFullName.split(" ").slice(1).join(" ")}</p>
                    <p><strong>Sexe :</strong> {student?.gender === "M" ? "Masculin (M)" : "Féminin (F)"}</p>
                    <p><strong>Date &amp; Lieu :</strong> {birthInfo}</p>
                    <p><strong>Classe assignée :</strong> {className}</p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-school-primary">
                      2. Coordonnées Parents / Tuteur
                    </h5>
                    <p><strong>Nom du répondant :</strong> {parentName}</p>
                    <p><strong>Téléphone :</strong> {student?.parentPhone || "+229 "}</p>
                    <p><strong>E-mail :</strong> {student?.parentEmail || "Non renseigné"}</p>
                    <p><strong>Statut dossier :</strong> Validé et enregistré au registre</p>
                  </div>
                </div>
              </div>
            )}

            {document.docType === "FICHE_INDIVIDUELLE" && (
              <div className="space-y-5 text-xs sm:text-sm text-slate-800">
                <p className="font-bold text-slate-900 uppercase">
                  Fiche Individuelle de Suivi Scolaire &amp; Historique
                </p>
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <p><strong>Élève :</strong> {studentFullName} ({studentMatricule})</p>
                  <p><strong>Classe active :</strong> {className} &bull; Cycle : {classroom?.cycle || "Secondaire"}</p>
                  <p><strong>Statut administratif :</strong> <span className="font-bold text-emerald-700">Inscrit &amp; Régularisé</span></p>
                  <p><strong>Dernière mise à jour :</strong> {document.issuedBy} le {document.issueDate}</p>
                </div>
              </div>
            )}

            {/* Official Signatures & Stamp Footer */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 items-end">
              <div className="space-y-12">
                <p className="text-xs font-bold text-slate-700 uppercase">
                  Le Secrétaire Pédagogique
                </p>
                <div className="text-[11px] text-slate-500">
                  <p className="font-bold text-slate-800">{document.issuedBy}</p>
                  <p>Cachet &amp; Visa du Secrétariat</p>
                </div>
              </div>

              <div className="text-right space-y-12">
                <p className="text-xs font-bold text-slate-700 uppercase">
                  Le Chef d&apos;Établissement / Directeur
                </p>
                <div className="text-[11px] text-slate-500">
                  <p className="font-bold text-slate-800">{(activeSchool as any)?.directorName || "Direction de l'Établissement"}</p>
                  <p>Sceau officiel de l&apos;établissement</p>
                </div>
              </div>
            </div>

            {/* Verification Watermark & Anti-fraud footer */}
            <div className="pt-4 border-t border-dashed border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Document authentifié généré par la plateforme ECOGEST &bull; Validité légale vérifiée</span>
              </div>
              <span className="font-mono">RÉF-VÉRIF: {document.id.toUpperCase().slice(0, 16)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
