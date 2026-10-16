"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  HelpCircle,
  MessageSquare,
  AlertTriangle,
  Bug,
  Send,
  Paperclip,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Building2,
  User,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/Toast";
import { useRoleContext } from "@/lib/context/RoleContext";
import { useSubscriptionStore } from "@/lib/subscription-store";
import {
  useSupportStore,
  SupportTicket,
  TicketCategory,
  TicketPriority,
} from "@/lib/support-store";

// FAQ riche pour l'application scolaire
const FAQS = [
  {
    category: "Pédagogie & Bulletins",
    q: "Comment est calculée la moyenne officielle par matière sur le bulletin ?",
    a: "Conformément aux normes officielles, le calcul s'effectue en 3 étapes : (1) Moyenne des 3 interrogations écrites = (Int 1 + Int 2 + Int 3) ÷ 3. (2) Moyenne semestrielle sur 20 = (Moyenne Interros + Devoir 1 + Devoir 2) ÷ 3. (3) Points coefficientés = Moyenne /20 × Coefficient attribué par l'enseignant pour sa matière.",
  },
  {
    category: "Abonnements & Forfaits",
    q: "Quelles sont les formules d'abonnements disponibles pour notre établissement ?",
    a: "Nous proposons 3 formules mensuelles : Formule BASIC à 6 000 FCFA/mois (1 établissement, jusqu'à 5 utilisateurs), Formule STANDARD à 10 000 FCFA/mois (1 établissement, 25 utilisateurs), et Formule PREMIUM à 25 000 FCFA/mois (jusqu'à 2 établissements distincts avec utilisateurs illimités et données 100% étanches).",
  },
  {
    category: "Espace Parents",
    q: "Comment un parent peut-il associer un deuxième enfant à son compte ?",
    a: "Si vous disposez du forfait PARENT 1 (200 FCFA/mois), vous pouvez suivre 1 seul élève. Pour associer un second enfant, rendez-vous dans « Mon Abonnement » et passez à la formule PARENT 2 (300 FCFA/mois), puis cliquez sur « Demander l'accès à un enfant ».",
  },
  {
    category: "Comptabilité & Finances",
    q: "Les paiements de scolarité sont-ils gérés en espèces avec reçu ?",
    a: "Oui. L'application enregistre les encaissements de scolarité en espèces au comptant et génère immédiatement un reçu de caisse infalsifiable avec référence unique et QR Code vérifiable.",
  },
  {
    category: "Technique & Sauvegarde",
    q: "L'application fonctionne-t-elle sans connexion Internet permanente ?",
    a: "Oui, ECOGEST PRO intègre un stockage local haute disponibilité permettant d'enregistrer les notes, appels et pointages même en cas de coupure de réseau.",
  },
];

export default function SupportCenterPage() {
  const { toast } = useToast();
  const { role } = useRoleContext();
  const { activeSchool } = useSubscriptionStore();
  const { tickets, createTicket, addReply, markUserTicketAsRead } = useSupportStore();

  const [activeTab, setActiveTab] = useState<"TICKETS" | "NEW" | "FAQ">("TICKETS");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  // Formulaire nouveau ticket
  const [formSubject, setFormSubject] = useState("");
  const [formCategory, setFormCategory] = useState<TicketCategory>("BUG_TECHNIQUE");
  const [formPriority, setFormPriority] = useState<TicketPriority>("NORMALE");
  const [formDescription, setFormDescription] = useState("");
  const [formAttachment, setFormAttachment] = useState("");

  // FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [faqSearch, setFaqSearch] = useState("");

  const userRolesMap: Record<string, string> = {
    directeur: "Directeur",
    censeur: "Censeur des études",
    enseignant: "Professeur",
    comptabilite: "Comptable",
    parent: "Parent d'élève",
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim() || !formDescription.trim()) {
      toast("Veuillez renseigner le sujet et la description du problème.", "error");
      return;
    }

    const created = createTicket({
      subject: formSubject,
      category: formCategory,
      priority: formPriority,
      description: formDescription,
      attachmentName: formAttachment || undefined,
      userId: `user-${role}`,
      userName: `Utilisateur (${userRolesMap[role]})`,
      userRole: userRolesMap[role],
      userEmail: `${role}@${activeSchool.slug}.bj`,
      userPhone: activeSchool.phone,
      schoolId: activeSchool.id,
      schoolName: activeSchool.name,
    });

    toast(`Ticket « ${created.id} » transmis à l'équipe technique avec succès !`, "success");
    setFormSubject("");
    setFormDescription("");
    setFormAttachment("");
    setSelectedTicket(created);
    setActiveTab("TICKETS");
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    addReply(
      selectedTicket.id,
      `Vous (${userRolesMap[role]})`,
      userRolesMap[role],
      replyMessage,
      false
    );

    setReplyMessage("");
    toast("Votre réponse a été transmise au support.", "success");
    // Mettre à jour la sélection locale
    const updated = tickets.find((t) => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  const statusBadge = (status: SupportTicket["status"]) => {
    const config = {
      OUVERT: { label: "Demande ouverte", bg: "bg-blue-50 text-blue-700 border-blue-200" },
      EN_COURS: { label: "En cours de traitement", bg: "bg-amber-50 text-amber-800 border-amber-200 animate-pulse" },
      RESOLU: { label: "Résolue", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
      FERME: { label: "Fermée", bg: "bg-slate-100 text-slate-600 border-slate-200" },
    }[status];

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${config.bg}`}>
        {config.label}
      </span>
    );
  };

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.a.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.category.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Centre d'Aide &amp; Support Technique"
        subtitle="Assistance dédiée, foire aux questions et suivi en temps réel de vos demandes"
        breadcrumbs={[{ label: "Support" }]}
        actions={
          <button
            type="button"
            onClick={() => {
              setActiveTab("NEW");
              setSelectedTicket(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-school-primary text-white font-bold text-xs md:text-sm hover:bg-school-700 shadow-sm touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Ticket de Support</span>
          </button>
        }
      />

      {/* Bannière de Contexte Utilisateur & Établissement (Requirement 10) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-school-50 text-school-primary flex items-center justify-center font-bold shrink-0">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">
              Espace Support connecté &bull; {userRolesMap[role]}
            </p>
            <p className="text-slate-500">
              Établissement rattaché : <strong className="text-slate-700">{activeSchool.name}</strong> ({activeSchool.city}, {activeSchool.country})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {role === "directeur" && (
            <Link
              href="/directeur/support"
              className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold border border-purple-200 transition"
            >
              Console Administrateur Support &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* Onglets Navigation Support */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab("TICKETS");
            setSelectedTicket(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition ${
            activeTab === "TICKETS"
              ? "bg-school-primary text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Mes Demandes ({tickets.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("NEW")}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition ${
            activeTab === "NEW"
              ? "bg-school-primary text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Ouvrir un ticket
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("FAQ")}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition ${
            activeTab === "FAQ"
              ? "bg-school-primary text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Questions Fréquentes (FAQ)
        </button>
      </div>

      {/* ===================================================================== */}
      {/* ONGLET 1 : HISTORIQUE DES TICKETS & FIL DE DISCUSSION                 */}
      {/* ===================================================================== */}
      {activeTab === "TICKETS" && (
        <div className="space-y-4">
          {!selectedTicket ? (
            <div className="space-y-3">
              {tickets.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                  <LifeBuoy className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-800">Aucun ticket en cours</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Vous n&apos;avez aucune demande d&apos;assistance ouverte pour le moment.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("NEW")}
                    className="px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-bold shadow-sm"
                  >
                    Poser une question au support
                  </button>
                </div>
              ) : (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTicket(t);
                      markUserTicketAsRead(t.id);
                    }}
                    className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200 hover:border-school-primary/40 hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-500">{t.id}</span>
                        {statusBadge(t.status)}
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {t.category.replace("_", " ")}
                        </span>
                        {t.hasUnreadReplyForUser && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                            Nouvelle réponse du support !
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm md:text-base group-hover:text-school-primary transition truncate">
                        {t.subject}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{t.description}</p>
                    </div>

                    <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-1 text-xs text-slate-400">
                      <span>{t.createdAt}</span>
                      <span className="text-school-primary font-bold group-hover:underline">
                        Consulter les échanges &rarr;
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Affichage du Fil de Discussion du Ticket sélectionné */
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="text-xs font-semibold text-slate-500 hover:text-school-primary mb-2 inline-flex items-center gap-1"
                  >
                    &larr; Retour à la liste des tickets
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {selectedTicket.id}
                    </span>
                    {statusBadge(selectedTicket.status)}
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-1">
                    {selectedTicket.subject}
                  </h2>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <p>Ouvert le : <strong>{selectedTicket.createdAt}</strong></p>
                  <p>Catégorie : <strong>{selectedTicket.category.replace("_", " ")}</strong></p>
                </div>
              </div>

              {/* Pièce jointe si présente */}
              {selectedTicket.attachmentName && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center gap-2 text-slate-700">
                  <Paperclip className="w-4 h-4 text-slate-400" />
                  <span>Pièce jointe associée :</span>
                  <strong className="font-mono">{selectedTicket.attachmentName}</strong>
                </div>
              )}

              {/* Messages échangés */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Historique des messages &amp; réponses :
                </h4>

                <div className="space-y-3">
                  {selectedTicket.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                        m.isStaff
                          ? "bg-school-50/70 border-school-200 ml-4 sm:ml-8"
                          : "bg-slate-50 border-slate-200 mr-4 sm:mr-8"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold ${
                            m.isStaff ? "text-school-primary" : "text-slate-900"
                          }`}
                        >
                          {m.senderName} ({m.senderRole})
                        </span>
                        <span className="text-slate-400 text-[11px]">{m.timestamp}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {m.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulaire de réponse pour l'utilisateur */}
              {selectedTicket.status !== "FERME" ? (
                <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 space-y-3">
                  <label className="text-xs font-bold text-slate-700 block">
                    Ajouter une réponse ou un complément :
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Écrivez votre message à destination de l'équipe support..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-school-primary/20"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Envoyer ma réponse</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 bg-slate-100 text-slate-600 rounded-xl text-xs text-center font-medium">
                  Ce ticket est clôturé. Pour une nouvelle demande, veuillez ouvrir un nouveau ticket.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* ONGLET 2 : NOUVEAU TICKET DE SUPPORT                                  */}
      {/* ===================================================================== */}
      {activeTab === "NEW" && (
        <form onSubmit={handleCreateTicket} className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-900">
              Formulaire de demande d&apos;assistance &amp; signalement
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Votre demande sera prise en charge par notre équipe technique. Tous les détails de votre établissement ({activeSchool.name}) sont automatiquement associés.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Objet de la demande *</label>
              <input
                type="text"
                required
                placeholder="Ex: Erreur lors de l'attribution d'un coefficient ou question sur ma facture"
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-school-primary/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Catégorie du problème *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="BUG_TECHNIQUE">Signaler un bug / Problème technique</option>
                  <option value="ABONNEMENT_FINANCE">Facturation &amp; Abonnements mensuels</option>
                  <option value="PEDAGOGIE_BULLETINS">Notes, Coefficients &amp; Bulletins</option>
                  <option value="ACCES_COMPTE">Gestion des Comptes &amp; Accès parents</option>
                  <option value="AUTRE">Autre demande d&apos;assistance</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Degré d&apos;urgence</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="NORMALE">Normale (Réponse sous 24h)</option>
                  <option value="HAUTE">Haute (Bloquant pour les cours ou la saisie)</option>
                  <option value="URGENTE">Urgente (Période d&apos;examen ou fin de trimestre)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Description détaillée du problème *</label>
              <textarea
                rows={5}
                required
                placeholder="Décrivez précisément votre problème, les actions effectuées et le message d'erreur éventuel..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-school-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Capture d&apos;écran ou fichier joint (optionnel)</span>
                <span className="text-slate-400 font-normal">Nom du fichier</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: capture_erreur_notes.png"
                  value={formAttachment}
                  onChange={(e) => setFormAttachment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("TICKETS")}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Transmettre le ticket au support</span>
            </button>
          </div>
        </form>
      )}

      {/* ===================================================================== */}
      {/* ONGLET 3 : CENTRE D'AIDE & FOIRE AUX QUESTIONS (FAQ)                  */}
      {/* ===================================================================== */}
      {activeTab === "FAQ" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Questions Fréquentes (FAQ)</h3>
              <p className="text-xs text-slate-500">
                Trouvez immédiatement les réponses aux interrogations courantes sur le progiciel.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher dans la FAQ..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 bg-slate-50/50 hover:bg-slate-50 transition"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-school-primary block mb-0.5">
                        {faq.category}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{faq.q}</h4>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
