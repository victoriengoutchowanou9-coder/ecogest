"use client";

import React, { useState, useEffect } from "react";
import {
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  X,
  MessageSquare,
  Building2,
  User,
  Send,
  AlertTriangle,
  Paperclip,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/Toast";

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: "NORMALE" | "HAUTE" | "URGENTE";
  status: "OUVERT" | "EN_COURS" | "RESOLU" | "FERME";
  description: string;
  attachmentName?: string;
  userName: string;
  userRole: string;
  userEmail: string;
  userPhone: string;
  schoolName: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    senderName: string;
    senderRole: string;
    message: string;
    timestamp: string;
    isStaff: boolean;
  }>;
}

export default function DevSupportPage() {
  const { toast } = useToast();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Ticket sélectionné & Réponse
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [newStatus, setNewStatus] = useState<string>("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/dev-admin/tickets?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        if (selectedTicket) {
          const updated = (data.tickets || []).find((t: any) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      } else {
        toast("Impossible de charger les tickets.", "error");
      }
    } catch {
      toast("Erreur réseau.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!replyMessage.trim() && !newStatus) {
      toast("Veuillez saisir une réponse ou modifier le statut.", "error");
      return;
    }

    setIsSubmittingReply(true);
    try {
      const res = await fetch("/api/dev-admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          status: newStatus || selectedTicket.status,
          replyMessage: replyMessage.trim(),
        }),
      });

      if (res.ok) {
        toast("Réponse envoyée avec succès au demandeur.", "success");
        setReplyMessage("");
        setNewStatus("");
        loadTickets();
      } else {
        toast("Échec de l'envoi de la réponse.", "error");
      }
    } catch {
      toast("Erreur de connexion.", "error");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="Support &amp; Requêtes d'Assistance"
        subtitle="Assistance technique aux directions d'écoles, diagnostic des demandes et suivi des résolutions"
        breadcrumbs={[{ label: "Développeur", href: "/dev-admin" }, { label: "Support" }]}
        actions={
          <button
            onClick={loadTickets}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs touch-target"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>
        }
      />

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par objet, auteur, école..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-school-primary focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-school-primary cursor-pointer w-full md:w-auto"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="OUVERT">Ouvert</option>
            <option value="EN_COURS">En cours</option>
            <option value="RESOLU">Résolu</option>
            <option value="FERME">Fermé</option>
          </select>
        </div>
      </div>

      {/* Tableau des Tickets */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-school-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Chargement des requêtes d'assistance...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
            <p className="font-semibold text-slate-700">Aucune demande de support en attente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Objet de la Demande</th>
                  <th className="py-3.5 px-3">Établissement</th>
                  <th className="py-3.5 px-3">Auteur &amp; Contact</th>
                  <th className="py-3.5 px-3">Catégorie</th>
                  <th className="py-3.5 px-3 text-center">Priorité</th>
                  <th className="py-3.5 px-3 text-center">Statut</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{t.subject}</div>
                      <div className="text-[10px] text-slate-400 font-mono">#{t.id.slice(0, 8)}</div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">{t.schoolName}</td>
                    <td className="py-3.5 px-3 text-slate-700">
                      <div>{t.userName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{t.userEmail}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.priority === "URGENTE"
                          ? "bg-rose-100 text-rose-800"
                          : t.priority === "HAUTE"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === "RESOLU"
                          ? "bg-emerald-100 text-emerald-800"
                          : t.status === "EN_COURS"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTicket(t);
                          setNewStatus(t.status);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-school-primary" />
                        <span>Répondre</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Répondre au Ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-500">
                  {selectedTicket.schoolName} &bull; Par {selectedTicket.userName} ({selectedTicket.userEmail})
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description initiale */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Description de la demande :</span>
              <p className="text-slate-900 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
            </div>

            {/* Historique des échanges */}
            {selectedTicket.messages && selectedTicket.messages.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Échanges &amp; Réponses :</span>
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-slate-50/50 rounded-xl">
                  {selectedTicket.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-xl text-xs space-y-1 ${
                        m.isStaff
                          ? "bg-school-50 border border-school-200 ml-6"
                          : "bg-white border border-slate-200 mr-6"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[11px]">
                        <span className={m.isStaff ? "text-school-primary" : "text-slate-800"}>
                          {m.senderName}
                        </span>
                        <span className="text-slate-400 text-[10px] font-normal">{m.timestamp}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{m.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Formulaire de réponse */}
            <form onSubmit={handleSendReply} className="space-y-3 pt-3 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mettre à jour le statut :</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-school-primary cursor-pointer"
                >
                  <option value="OUVERT">Ouvert</option>
                  <option value="EN_COURS">En cours d'assistance</option>
                  <option value="RESOLU">Résolu</option>
                  <option value="FERME">Fermé</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Votre message d'assistance technique :</label>
                <textarea
                  rows={3}
                  placeholder="Rédigez votre réponse ou directive technique au directeur..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-school-primary focus:bg-white transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReply}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white text-xs font-bold transition shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReply ? "Envoi..." : "Envoyer la réponse"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
