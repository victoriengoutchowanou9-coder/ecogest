"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertTriangle,
  Building2,
  Send,
  Paperclip,
  User,
  Shield,
  Check,
  X,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/Toast";
import {
  useSupportStore,
  SupportTicket,
  TicketStatus,
} from "@/lib/support-store";

export default function DirecteurSupportConsolePage() {
  const { toast } = useToast();
  const { tickets, addReply, updateTicketStatus, markAdminTicketAsRead } = useSupportStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [schoolFilter, setSchoolFilter] = useState<string>("ALL");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");

  // Établissements uniques présents dans les tickets
  const schoolsList = Array.from(new Set(tickets.map((t) => t.schoolName)));

  // Filtrage des tickets
  const filteredTickets = tickets.filter((t) => {
    const matchSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.userName.toLowerCase().includes(search.toLowerCase()) ||
      t.schoolName.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchSchool = schoolFilter === "ALL" || t.schoolName === schoolFilter;

    return matchSearch && matchStatus && matchSchool;
  });

  const handleSelectTicket = (t: SupportTicket) => {
    setSelectedTicket(t);
    markAdminTicketAsRead(t.id);
  };

  const handleAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    addReply(
      selectedTicket.id,
      "Direction / Support Administrateur",
      "Administrateur EDUCOGEST",
      replyText.trim(),
      true // isStaff
    );

    setReplyText("");
    toast(`Réponse transmise à l'utilisateur (${selectedTicket.userName})`, "success");

    // Mettre à jour la sélection locale
    const updated = tickets.find((t) => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  const handleStatusChange = (newStatus: TicketStatus) => {
    if (!selectedTicket) return;
    updateTicketStatus(selectedTicket.id, newStatus);
    setSelectedTicket({ ...selectedTicket, status: newStatus });
    toast(`Statut du ticket ${selectedTicket.id} passé à « ${newStatus} »`, "success");
  };

  const statusBadge = (status: TicketStatus) => {
    const config = {
      OUVERT: { label: "Ouvert", bg: "bg-blue-50 text-blue-700 border-blue-200" },
      EN_COURS: { label: "En cours", bg: "bg-amber-50 text-amber-800 border-amber-200 animate-pulse" },
      RESOLU: { label: "Résolu", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
      FERME: { label: "Fermé", bg: "bg-slate-100 text-slate-600 border-slate-200" },
    }[status];

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${config.bg}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader
        title="Console de Gestion du Support Technique"
        subtitle="Supervision de l'ensemble des tickets d'assistance, requêtes utilisateurs et résolutions d'incidents"
        breadcrumbs={[{ label: "Directeur", href: "/directeur" }, { label: "Console Support" }]}
        actions={
          <Link
            href="/support"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs"
          >
            <LifeBuoy className="w-4 h-4 text-school-primary" />
            <span>Vue Utilisateur / FAQ</span>
          </Link>
        }
      />

      {/* Barre de Filtres & Recherche (Requirement 10) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par ID, sujet, utilisateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-school-primary/20"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700"
          >
            <option value="ALL">Tous les statuts ({tickets.length})</option>
            <option value="OUVERT">Ouverts uniquement</option>
            <option value="EN_COURS">En cours de traitement</option>
            <option value="RESOLU">Résolus</option>
            <option value="FERME">Fermés</option>
          </select>
        </div>

        <div>
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700"
          >
            <option value="ALL">Tous les établissements</option>
            {schoolsList.map((sch) => (
              <option key={sch} value={sch}>
                {sch}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vue Double Colonne : Liste des tickets & Détail du ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne Gauche : Liste des tickets */}
        <div className="lg:col-span-5 space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tickets trouvés ({filteredTickets.length}) :
          </p>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredTickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTicket(t)}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? "border-school-primary bg-school-50/70 shadow-sm ring-1 ring-school-primary/30"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-slate-500">
                        {t.id}
                      </span>
                      {statusBadge(t.status)}
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                      {t.subject}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {t.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700 truncate max-w-[140px]">
                      {t.userName} ({t.userRole})
                    </span>
                    <span>{t.createdAt.split(" ")[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonne Droite : Fiche de Traitement & Réponses de l'Administrateur */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              {/* En-tête du ticket */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {selectedTicket.id}
                    </span>
                    {statusBadge(selectedTicket.status)}
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {selectedTicket.category.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 text-lg">
                    {selectedTicket.subject}
                  </h3>
                </div>

                {/* Sélecteur de statut d'intervention */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs text-slate-500 font-semibold">Statut :</span>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                    className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="OUVERT">Demande ouverte</option>
                    <option value="EN_COURS">En cours de traitement</option>
                    <option value="RESOLU">Résolue</option>
                    <option value="FERME">Fermée</option>
                  </select>
                </div>
              </div>

              {/* Fiche contexte : Utilisateur & Établissement (Requirement 10) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Utilisateur émetteur</span>
                  <strong className="text-slate-800">{selectedTicket.userName}</strong>
                  <span className="block text-[11px] text-slate-500">{selectedTicket.userRole}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Établissement</span>
                  <strong className="text-slate-800">{selectedTicket.schoolName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Contact</span>
                  <span className="block text-slate-700">{selectedTicket.userPhone}</span>
                  <span className="block text-[11px] text-slate-500 truncate">{selectedTicket.userEmail}</span>
                </div>
              </div>

              {/* Pièce jointe */}
              {selectedTicket.attachmentName && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-center justify-between text-amber-900">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-amber-600" />
                    <span>Pièce jointe fournie :</span>
                    <strong className="font-mono">{selectedTicket.attachmentName}</strong>
                  </div>
                  <span className="text-[10px] text-amber-700 font-semibold">Vérifiée</span>
                </div>
              )}

              {/* Fil de discussion */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Échanges &amp; Historique du ticket :
                </h4>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {selectedTicket.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                        m.isStaff
                          ? "bg-purple-50/70 border-purple-200 ml-4 sm:ml-8"
                          : "bg-slate-50 border-slate-200 mr-4 sm:mr-8"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold ${
                            m.isStaff ? "text-purple-700" : "text-slate-900"
                          }`}
                        >
                          {m.senderName} ({m.senderRole})
                        </span>
                        <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {m.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulaire de réponse Administrateur */}
              <form onSubmit={handleAdminReply} className="pt-4 border-t border-slate-100 space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Répondre officiellement à l&apos;utilisateur :
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Rédigez la réponse d'assistance, la confirmation de résolution ou les instructions à suivre..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-school-primary/20"
                />
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange("RESOLU")}
                      className="px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-800 bg-emerald-50 text-[11px] font-bold hover:bg-emerald-100 transition"
                    >
                      Marquer comme Résolu
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange("FERME")}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-slate-50 text-[11px] font-bold hover:bg-slate-100 transition"
                    >
                      Clôturer
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer la réponse</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-700">Sélectionnez un ticket dans la liste</p>
              <p className="text-xs">
                Cliquez sur une demande à gauche pour consulter les détails, le contexte établissement et répondre.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
