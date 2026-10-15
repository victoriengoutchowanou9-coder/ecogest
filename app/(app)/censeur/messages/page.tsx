"use client";

import React, { useState, useMemo } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Phone,
  User,
  GraduationCap,
  Mail,
  AlertCircle,
  Inbox,
  CheckCheck,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useCenseurStore, ParentMessageItem } from "@/lib/censeur-store";

export default function CenseurMessagesPage() {
  const { parentMessages, replyToParentMessage, markMessageAsRead } = useCenseurStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "NON_LU" | "LU" | "REPONDU">("ALL");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    parentMessages[0]?.id || null
  );

  // Reply form state
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");

  // Filter messages
  const filteredMessages = useMemo(() => {
    return parentMessages.filter((msg) => {
      const matchSearch =
        msg.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.parentPhone.includes(searchQuery) ||
        msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = selectedStatus === "ALL" || msg.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [parentMessages, searchQuery, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = parentMessages.length;
    const nonLus = parentMessages.filter((m) => m.status === "NON_LU").length;
    const lus = parentMessages.filter((m) => m.status === "LU").length;
    const repondus = parentMessages.filter((m) => m.status === "REPONDU").length;

    return { total, nonLus, lus, repondus };
  }, [parentMessages]);

  const selectedMessage = useMemo(() => {
    return parentMessages.find((m) => m.id === selectedMessageId) || filteredMessages[0] || null;
  }, [parentMessages, selectedMessageId, filteredMessages]);

  const handleSelectMessage = (msg: ParentMessageItem) => {
    setSelectedMessageId(msg.id);
    if (msg.status === "NON_LU") {
      markMessageAsRead(msg.id);
    }
    setReplyError("");
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage) return;
    if (!replyText.trim()) {
      setReplyError("Veuillez saisir le texte de votre réponse officielle.");
      return;
    }

    replyToParentMessage(selectedMessage.id, replyText.trim(), "Censeur des Études");
    setReplyText("");
    setReplyError("");
  };

  const getStatusBadge = (status: ParentMessageItem["status"]) => {
    switch (status) {
      case "NON_LU":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Non lu
          </span>
        );
      case "LU":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            En attente de réponse
          </span>
        );
      case "REPONDU":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCheck className="w-3 h-3" />
            Répondu
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages des Parents"
        subtitle="Communication directe avec les familles, suivi des requêtes académiques et réponses officielles"
        breadcrumbs={[{ label: "Censeur", href: "/censeur" }, { label: "Messages des Parents" }]}
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total messages"
          value={stats.total}
          subtitle="Reçus des familles"
          icon={<Inbox className="w-6 h-6" />}
          variant="info"
        />
        <StatCard
          title="Nouveaux / Non lus"
          value={stats.nonLus}
          subtitle="Nécessite votre attention"
          icon={<AlertCircle className="w-6 h-6" />}
          variant={stats.nonLus > 0 ? "danger" : "default"}
        />
        <StatCard
          title="En attente de réponse"
          value={stats.lus}
          subtitle="Ouverts mais sans retour"
          icon={<Clock className="w-6 h-6" />}
          variant="warning"
        />
        <StatCard
          title="Traités & Répondus"
          value={stats.repondus}
          subtitle="Réponse officielle transmise"
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="success"
        />
      </div>

      {/* Main Mailbox Interface */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left: Message List (5 cols) */}
        <div className="lg:col-span-5 border-r border-slate-200 flex flex-col bg-slate-50/50">
          {/* Search & Tabs */}
          <div className="p-3.5 border-b border-slate-200 bg-white space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher parent, élève, téléphone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-school-primary text-slate-800"
              />
            </div>

            <div className="flex items-center gap-1 text-[11px] font-semibold overflow-x-auto pb-0.5">
              <button
                onClick={() => setSelectedStatus("ALL")}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition ${
                  selectedStatus === "ALL"
                    ? "bg-slate-800 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Tous ({stats.total})
              </button>
              <button
                onClick={() => setSelectedStatus("NON_LU")}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition ${
                  selectedStatus === "NON_LU"
                    ? "bg-rose-600 text-white"
                    : "text-rose-700 hover:bg-rose-50"
                }`}
              >
                Non lus ({stats.nonLus})
              </button>
              <button
                onClick={() => setSelectedStatus("LU")}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition ${
                  selectedStatus === "LU"
                    ? "bg-amber-600 text-white"
                    : "text-amber-700 hover:bg-amber-50"
                }`}
              >
                En attente ({stats.lus})
              </button>
              <button
                onClick={() => setSelectedStatus("REPONDU")}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition ${
                  selectedStatus === "REPONDU"
                    ? "bg-emerald-700 text-white"
                    : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                Répondus ({stats.repondus})
              </button>
            </div>
          </div>

          {/* Messages scroll list */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Aucun message trouvé selon les critères.
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`p-3.5 cursor-pointer transition-colors text-left ${
                      isSelected
                        ? "bg-school-50/80 border-l-4 border-l-school-primary"
                        : msg.status === "NON_LU"
                        ? "bg-white font-semibold hover:bg-slate-50"
                        : "bg-transparent opacity-85 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5 mb-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {msg.parentName}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">{msg.date}</span>
                    </div>

                    <div className="text-[11px] font-medium text-school-primary truncate mb-1">
                      {msg.subject}
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                      {msg.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                      <span>
                        Élève : <strong className="text-slate-700">{msg.studentName}</strong> (
                        {msg.className})
                      </span>
                      {getStatusBadge(msg.status)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Message Details & Reply Panel (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-white">
          {selectedMessage ? (
            <div className="flex flex-col h-full">
              {/* Header Info */}
              <div className="p-5 border-b border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {selectedMessage.subject}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {selectedMessage.parentName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {selectedMessage.parentPhone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Reçu le {selectedMessage.date} à {selectedMessage.time}
                      </span>
                    </div>
                  </div>
                  <div>{getStatusBadge(selectedMessage.status)}</div>
                </div>

                {/* Student Context Badge */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-school-primary" />
                    <span>
                      Dossier élève concerné :{" "}
                      <strong className="text-slate-900">{selectedMessage.studentName}</strong>
                    </span>
                  </div>
                  <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    Classe : {selectedMessage.className}
                  </span>
                </div>
              </div>

              {/* Message Body */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Message de la famille
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                {/* If replied, show existing reply */}
                {selectedMessage.replyText && (
                  <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCheck className="w-4 h-4" />
                        Réponse officielle envoyée ({selectedMessage.repliedBy})
                      </span>
                      <span className="text-emerald-700 font-mono text-[10px]">
                        {selectedMessage.repliedAt}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.replyText}
                    </p>
                  </div>
                )}
              </div>

              {/* Reply Box at the Bottom */}
              <div className="p-4 border-t border-slate-200 bg-slate-50">
                {replyError && (
                  <div className="mb-2 p-2.5 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{replyError}</span>
                  </div>
                )}

                <form onSubmit={handleSendReply} className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {selectedMessage.replyText
                      ? "Envoyer un complément de réponse :"
                      : "Rédiger la réponse de la Direction des Études :"}
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Votre réponse sera transmise dans l'espace Parent et archivée au dossier de l'élève..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-school-primary focus:ring-1 focus:ring-school-primary"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Signataire automatique : Censeur des Études &middot; EDUCOGEST
                    </span>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-school-primary hover:bg-school-primary/90 rounded-xl transition shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Envoyer la réponse
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-xs">Sélectionnez un message dans la liste pour le consulter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
