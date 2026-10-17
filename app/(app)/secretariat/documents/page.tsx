"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  Plus,
  Printer,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Calendar,
  Building,
  User,
  X,
  FileCheck,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  useSecretariatStore,
  DocumentType,
  SchoolDocumentRecord,
} from "@/lib/secretariat-store";
import { OfficialDocumentModal } from "@/components/school/OfficialDocumentModal";
import { useToast } from "@/components/ui/Toast";

export default function SecretariatDocumentsPage() {
  const { toast } = useToast();
  const { documents, students, classrooms, generateDocument } = useSecretariatStore();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<SchoolDocumentRecord | null>(null);

  // Form State
  const [formType, setFormType] = useState<DocumentType>("CERTIFICAT_SCOLARITE");
  const [formStudentId, setFormStudentId] = useState(students[0]?.id || "");
  const [formRecipient, setFormRecipient] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === formStudentId) || students[0];
  }, [students, formStudentId]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        d.title.toLowerCase().includes(q) ||
        d.referenceNumber.toLowerCase().includes(q) ||
        (d.studentName || "").toLowerCase().includes(q) ||
        (d.recipient || "").toLowerCase().includes(q);

      const matchType = filterType === "ALL" || d.docType === filterType;
      return matchSearch && matchType;
    });
  }, [documents, search, filterType]);

  const docTypeLabels: Record<DocumentType, string> = {
    CERTIFICAT_SCOLARITE: "Certificat de Scolarité",
    ATTESTATION_FREQUENTATION: "Attestation de Fréquentation",
    CERTIFICAT_RADIATION: "Certificat de Radiation",
    FICHE_INSCRIPTION: "Fiche d'Inscription",
    FICHE_INDIVIDUELLE: "Fiche Individuelle de l'Élève",
    LISTE_ELEVES: "Liste Officielle des Élèves",
  };

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast("Veuillez sélectionner un élève.", "error");
      return;
    }

    const newDoc = generateDocument({
      docType: formType,
      title: docTypeLabels[formType],
      studentId: selectedStudent.id,
      studentName: `${selectedStudent.lastName} ${selectedStudent.firstName}`,
      matricule: selectedStudent.matricule,
      classId: selectedStudent.classId,
      className: selectedStudent.className,
      academicYear: "2026 - 2027",
      issueDate: new Date().toISOString().split("T")[0],
      issuedBy: "Secrétariat Pédagogique",
      recipient: formRecipient.trim() || undefined,
      notes: formNotes.trim() || undefined,
    });

    toast(`Document officiel généré avec succès (Réf: ${newDoc.referenceNumber}).`, "success");
    setIsGenerateModalOpen(false);
    setPreviewDoc(newDoc);
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Dossiers &amp; Documents Scolaires Officiels"
        subtitle="Génération, certification, impression et archivage des certificats et attestations scolaires"
        breadcrumbs={[{ label: "Secrétariat", href: "/secretariat" }, { label: "Documents Scolaires" }]}
        actions={
          <button
            type="button"
            onClick={() => setIsGenerateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-school-primary text-white font-semibold text-xs md:text-sm shadow-sm hover:bg-school-primary/90 transition touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Établir un document officiel</span>
          </button>
        }
      />

      {/* Raccourcis des types de documents officiels */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {(
          [
            { type: "CERTIFICAT_SCOLARITE", label: "Certificat Scolarité", code: "CS", color: "bg-teal-50 text-teal-800 border-teal-200" },
            { type: "ATTESTATION_FREQUENTATION", label: "Attestation Fréq.", code: "AF", color: "bg-blue-50 text-blue-800 border-blue-200" },
            { type: "CERTIFICAT_RADIATION", label: "Certificat Radiation", code: "CR", color: "bg-rose-50 text-rose-800 border-rose-200" },
            { type: "FICHE_INSCRIPTION", label: "Fiche Inscription", code: "FI", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
            { type: "FICHE_INDIVIDUELLE", label: "Fiche Individuelle", code: "FIE", color: "bg-purple-50 text-purple-800 border-purple-200" },
            { type: "LISTE_ELEVES", label: "Liste d'appel", code: "LE", color: "bg-slate-50 text-slate-800 border-slate-200" },
          ] as const
        ).map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => {
              setFormType(item.type);
              setIsGenerateModalOpen(true);
            }}
            className={`p-3.5 rounded-2xl border text-left transition hover:shadow-xs flex flex-col justify-between ${item.color}`}
          >
            <span className="font-mono text-xs font-black">{item.code}</span>
            <span className="font-bold text-xs mt-2 leading-tight">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Barre de recherche et filtre */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par référence, élève, organisme destinataire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
        >
          <option value="ALL">Tous les types de documents</option>
          <option value="CERTIFICAT_SCOLARITE">Certificats de Scolarité</option>
          <option value="ATTESTATION_FREQUENTATION">Attestations de Fréquentation</option>
          <option value="CERTIFICAT_RADIATION">Certificats de Radiation</option>
          <option value="FICHE_INSCRIPTION">Fiches d&apos;Inscription</option>
          <option value="FICHE_INDIVIDUELLE">Fiches Individuelles</option>
        </select>
      </div>

      {/* Table des documents délivrés */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Référence</th>
                <th className="py-3 px-4">Nature du document</th>
                <th className="py-3 px-4">Élève &amp; Classe</th>
                <th className="py-3 px-4">Destinataire / Motif</th>
                <th className="py-3 px-3">Date délivrance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Aucun document officiel trouvé
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {doc.referenceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {doc.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{doc.studentName || "-"}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {doc.className} &bull; {doc.matricule}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <p className="truncate max-w-[200px] font-semibold text-slate-800">
                        {doc.recipient || "Pour servir et valoir ce que de droit"}
                      </p>
                      {doc.notes && <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{doc.notes}</p>}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {doc.issueDate}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-bold hover:bg-teal-100 transition shadow-2xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimer / PDF</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL : ÉTABLIR UN NOUVEAU DOCUMENT */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-600" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Délivrer un document scolaire officiel
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGenerateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Type de document à générer *</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as DocumentType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-800"
                >
                  <option value="CERTIFICAT_SCOLARITE">Certificat de Scolarité</option>
                  <option value="ATTESTATION_FREQUENTATION">Attestation de Fréquentation</option>
                  <option value="CERTIFICAT_RADIATION">Certificat de Radiation</option>
                  <option value="FICHE_INSCRIPTION">Fiche d&apos;Inscription</option>
                  <option value="FICHE_INDIVIDUELLE">Fiche Individuelle de l&apos;Élève</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Élève concerné *</label>
                <select
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-800"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.lastName} {st.firstName} &mdash; {st.className} ({st.matricule})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Organisme destinataire ou motif
                </label>
                <input
                  type="text"
                  placeholder="Ex: CNSS, Ambassade de France, CEG d'accueil, etc."
                  value={formRecipient}
                  onChange={(e) => setFormRecipient(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Observations administratives</label>
                <textarea
                  rows={2}
                  placeholder="Mentions particulières éventuelles..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-sm flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Générer &amp; Imprimer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APERÇU IMPRESSION DOCUMENT */}
      {previewDoc && (
        <OfficialDocumentModal
          document={previewDoc}
          student={students.find((s) => s.id === previewDoc.studentId)}
          classroom={classrooms.find((c) => c.id === previewDoc.classId)}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
