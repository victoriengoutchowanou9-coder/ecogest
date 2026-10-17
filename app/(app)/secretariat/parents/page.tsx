"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Phone,
  Mail,
  UserCheck,
  GraduationCap,
  Plus,
  Edit,
  CheckCircle2,
  Clock,
  X,
  MessageSquare,
  Shield,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useSecretariatStore, ParentRecord } from "@/lib/secretariat-store";
import { useCenseurStore } from "@/lib/censeur-store";
import { useToast } from "@/components/ui/Toast";

export default function SecretariatParentsPage() {
  const { toast } = useToast();
  const { parentsList, students, updateStudentInfo } = useSecretariatStore();
  const { parentAccessRequests, validateParentAccessRequest } = useCenseurStore();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"LIST" | "REQUESTS">("LIST");

  // Associate Parent to Student Modal
  const [isAssociateModalOpen, setIsAssociateModalOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<ParentRecord | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");

  // Edit Parent Contact Modal
  const [editingParent, setEditingParent] = useState<ParentRecord | null>(null);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");

  const filteredParents = useMemo(() => {
    return parentsList.filter((p) => {
      const q = search.toLowerCase();
      return (
        !search ||
        p.fullName.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.childrenNames.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [parentsList, search]);

  const handleOpenAssociateModal = (parent: ParentRecord) => {
    setSelectedParent(parent);
    setIsAssociateModalOpen(true);
  };

  const handleConfirmAssociate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParent || !selectedStudentId) return;

    const studentToLink = students.find((s) => s.id === selectedStudentId);
    if (!studentToLink) return;

    updateStudentInfo(studentToLink.id, {
      parentName: selectedParent.fullName,
      parentPhone: selectedParent.phone,
      parentEmail: selectedParent.email || studentToLink.parentEmail,
    });

    toast(
      `L'élève ${studentToLink.lastName} ${studentToLink.firstName} a été associé avec succès à ${selectedParent.fullName}.`,
      "success"
    );
    setIsAssociateModalOpen(false);
  };

  const handleOpenEdit = (p: ParentRecord) => {
    setEditingParent(p);
    setFormName(p.fullName);
    setFormPhone(p.phone);
    setFormEmail(p.email);
  };

  const handleSaveParentEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParent) return;

    // Update all linked students' parent info
    editingParent.studentIds.forEach((sid) => {
      updateStudentInfo(sid, {
        parentName: formName.trim(),
        parentPhone: formPhone.trim(),
        parentEmail: formEmail.trim(),
      });
    });

    toast("Coordonnées du parent mises à jour avec succès.", "success");
    setEditingParent(null);
  };

  const handleQuickValidateRequest = (requestId: string, approve: boolean) => {
    validateParentAccessRequest(requestId, approve ? "ACCEPTEE" : "REFUSEE", "Secrétariat Pédagogique");
    toast(
      approve ? "Demande d'accès parent validée." : "Demande d'accès parent refusée.",
      approve ? "success" : "info"
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Gestion des Parents &amp; Tuteurs Légaux"
        subtitle="Répertoire des coordonnées, rattachements aux enfants et vérification administrative des accès"
        breadcrumbs={[{ label: "Secrétariat", href: "/secretariat" }, { label: "Parents & Tuteurs" }]}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("LIST")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === "LIST"
              ? "border-school-primary text-school-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Répertoire des Parents ({parentsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("REQUESTS")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === "REQUESTS"
              ? "border-school-primary text-school-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Demandes d&apos;accès Parent &rarr; Enfant ({parentAccessRequests.length})</span>
        </button>
      </div>

      {activeTab === "LIST" && (
        <div className="space-y-4">
          {/* Recherche */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            <input
              type="text"
              placeholder="Rechercher par nom du parent, téléphone, email ou nom d'élève..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs text-slate-800 focus:outline-none bg-transparent"
            />
          </div>

          {/* Liste des parents */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParents.map((p) => (
              <div
                key={p.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {p.fullName}
                      </h4>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block mt-1">
                        Parent / Tuteur reconnu
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      title="Modifier les coordonnées"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{p.phone || "Non renseigné"}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{p.email || "Non renseigné"}</span>
                    </p>
                  </div>

                  {/* Enfants rattachés */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Enfants rattachés ({p.childrenNames.length}) :
                    </span>
                    <div className="space-y-1">
                      {p.childrenNames.map((cName, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <GraduationCap className="w-3.5 h-3.5 text-school-primary shrink-0" />
                          <span className="truncate">{cName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleOpenAssociateModal(p)}
                    className="text-xs font-bold text-school-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Associer un autre élève</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "REQUESTS" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-sm">
              Demandes d&apos;accès portail Parent &rarr; Enfant
            </h3>
            <p className="text-xs text-slate-500">
              Vérification des correspondances administratives avant activation du compte parent
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Parent demandeur</th>
                  <th className="py-3 px-4">Élève concerné</th>
                  <th className="py-3 px-3">Date &amp; Heure</th>
                  <th className="py-3 px-3">Statut</th>
                  <th className="py-3 px-4 text-right">Action Secrétariat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parentAccessRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                      Aucune demande d&apos;accès en attente de vérification
                    </td>
                  </tr>
                ) : (
                  parentAccessRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{req.parentName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{req.parentPhone}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{req.studentName}</p>
                        <p className="text-[11px] text-slate-500">
                          {req.className} &bull; Mat: {req.matricule}
                        </p>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {req.requestDate} à {req.requestTime}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === "ACCEPTEE"
                              ? "bg-emerald-100 text-emerald-800"
                              : req.status === "REFUSEE"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {req.status === "EN_ATTENTE" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleQuickValidateRequest(req.id, true)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition"
                            >
                              Valider l&apos;accès
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickValidateRequest(req.id, false)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 text-rose-700 font-bold text-[11px] hover:bg-rose-50 transition"
                            >
                              Refuser
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Traité</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1 : ASSOCIER PARENT À UN ÉLÈVE */}
      {isAssociateModalOpen && selectedParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Associer un élève &agrave; {selectedParent.fullName}
              </h3>
              <button
                type="button"
                onClick={() => setIsAssociateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssociate} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Sélectionnez l&apos;élève à rattacher au compte de <strong>{selectedParent.fullName}</strong>.
                Ce parent aura alors accès aux notes, présences et bulletins de cet élève.
              </p>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Élève de l&apos;établissement *</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-800"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.lastName} {st.firstName} &mdash; {st.className} ({st.matricule})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssociateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-school-primary text-white font-bold shadow-sm"
                >
                  Confirmer le rattachement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2 : MODIFIER COORDONNÉES DU PARENT */}
      {editingParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Modifier les coordonnées du parent
              </h3>
              <button
                type="button"
                onClick={() => setEditingParent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveParentEdit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Téléphone *</label>
                <input
                  type="text"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Adresse e-mail</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingParent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-school-primary text-white font-bold shadow-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
