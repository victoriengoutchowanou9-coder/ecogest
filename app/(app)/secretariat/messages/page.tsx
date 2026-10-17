"use client";

import React, { useState } from "react";
import {
  Mail,
  Send,
  Users,
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Plus,
  X,
  Smartphone,
  Bell,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useSecretariatStore, SecretariatMessage } from "@/lib/secretariat-store";
import { useToast } from "@/components/ui/Toast";

export default function SecretariatMessagesPage() {
  const { toast } = useToast();
  const { messages, classrooms, sendMessage } = useSecretariatStore();

  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Form State
  const [recipientType, setRecipientType] = useState<SecretariatMessage["recipientType"]>("PARENTS");
  const [targetName, setTargetName] = useState("Tous les parents d'élèves");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState<SecretariatMessage["channel"]>("SMS");

  const filteredMessages = messages.filter((m) => {
    const q = search.toLowerCase();
    return (
      !search ||
      m.subject.toLowerCase().includes(q) ||
      m.targetName.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q)
    );
  });

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      toast("Veuillez renseigner un objet et le corps du message.", "error");
      return;
    }

    sendMessage({
      recipientType,
      targetName,
      subject: subject.trim(),
      content: content.trim(),
      channel,
      sentBy: "Secrétariat Pédagogique",
    });

    toast("Message ou communication administrative diffusé(e) avec succès.", "success");
    setIsSendModalOpen(false);
    setSubject("");
    setContent("");
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Communications Administratives &amp; Notifications"
        subtitle="Diffusion de messages officiels aux parents, professeurs et classes par SMS et notifications"
        breadcrumbs={[{ label: "Secrétariat", href: "/secretariat" }, { label: "Communications" }]}
        actions={
          <button
            type="button"
            onClick={() => setIsSendModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-school-primary text-white font-semibold text-xs md:text-sm shadow-sm hover:bg-school-primary/90 transition touch-target"
          >
            <Send className="w-4 h-4" />
            <span>Diffuser une communication</span>
          </button>
        }
      />

      {/* Barre de recherche */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          placeholder="Rechercher dans l'historique des communications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs text-slate-800 focus:outline-none bg-transparent"
        />
      </div>

      {/* Liste des communications envoyées */}
      <div className="space-y-3">
        {filteredMessages.map((msg) => (
          <div
            key={msg.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="font-extrabold text-sm text-slate-900 block">{msg.subject}</span>
                <p className="text-xs text-slate-500">
                  Destinataires : <strong className="text-slate-800">{msg.targetName}</strong> &bull; Émis par {msg.sentBy}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                  {msg.channel === "SMS" ? <Smartphone className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
                  <span>{msg.channel}</span>
                </span>
                <span className="font-mono text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                  {msg.sentAt}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
              {msg.content}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Diffusé avec succès &bull; Archivé au registre administratif</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL : NOUVELLE DIFFUSION */}
      {isSendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-school-primary" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Nouvelle communication administrative
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSendModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Cible *</label>
                  <select
                    value={recipientType}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setRecipientType(t);
                      if (t === "PARENTS") setTargetName("Tous les parents d'élèves");
                      else if (t === "ENSEIGNANTS") setTargetName("Corps Enseignant");
                      else if (t === "CLASSE") setTargetName(classrooms[0]?.name || "6ème A");
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold"
                  >
                    <option value="PARENTS">Tous les parents</option>
                    <option value="CLASSE">Une classe spécifique</option>
                    <option value="ENSEIGNANTS">Les enseignants</option>
                    <option value="INDIVIDUEL">Individuel</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Canal d&apos;envoi *</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold"
                  >
                    <option value="SMS">SMS Direct Bénin</option>
                    <option value="NOTIFICATION_APP">Notification application</option>
                    <option value="EMAIL">Courrier Électronique</option>
                    <option value="AFFICHAGE">Affichage tableau administratif</option>
                  </select>
                </div>
              </div>

              {recipientType === "CLASSE" && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Sélectionner la classe</label>
                  <select
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-800"
                  >
                    {classrooms.map((c) => (
                      <option key={c.id} value={`Parents de ${c.name}`}>
                        Parents de {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Objet de la communication *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Réunion d'information sur les examens"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Texte du message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Rédigez ici le message officiel..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs leading-relaxed"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSendModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-school-primary text-white font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Diffuser immédiatement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
