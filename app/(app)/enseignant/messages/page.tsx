"use client";

import React, { useState } from "react";
import {
  Bell,
  MessageSquare,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Send,
  Mail,
  User,
  ShieldCheck,
  ChevronRight,
  Filter,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth-store";
import { useCommunicationStore } from "@/lib/communication-store";
import {
  MOCK_DIRECTION_ANNOUNCEMENTS,
  DirectionAnnouncement,
} from "@/lib/mock-teacher-db";
import { cn } from "@/lib/utils";

interface AuthorizedMessage {
  id: string;
  sender: string;
  role: string;
  recipient: string;
  subject: string;
  date: string;
  content: string;
  isRead: boolean;
}

export default function EnseignantMessagesPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"ANNONCES" | "ECHEANCES" | "MESSAGES" | "NOTIFICATIONS">("ANNONCES");
  const {
    announcements: liveAnnouncements,
    markAnnouncementRead,
    notifications: liveNotifications,
  } = useCommunicationStore();

  const teacherAnnouncements = React.useMemo(() => {
    return liveAnnouncements.filter(
      (a) => a.targetAudience === "ALL" || a.targetAudience === "ENSEIGNANTS" || a.targetAudience === "CLASS"
    );
  }, [liveAnnouncements]);

  const [messages, setMessages] = useState<AuthorizedMessage[]>([]);

  const [newMsgSubject, setNewMsgSubject] = useState("");
  const [newMsgContent, setNewMsgContent] = useState("");
  const [newMsgRecipient, setNewMsgRecipient] = useState("Censeur des Études");
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const deadlines: Array<{
    id: string;
    title: string;
    dueDate: string;
    target: string;
    status: string;
    daysLeft: number;
  }> = [];

  const notifications: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
    type: "ALERT" | "SUCCESS" | "INFO";
  }> = [];

  const handleMarkAnnouncementRead = (id: string) => {
    markAnnouncementRead(id);
    toast("Annonce marquée comme lue.", "info");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgSubject.trim() || !newMsgContent.trim()) {
      toast("Veuillez renseigner l'objet et le texte du message.", "info");
      return;
    }
    const newMsg: AuthorizedMessage = {
      id: `msg-${Date.now()}`,
      sender: user?.fullName || "Enseignant",
      role: (user as any)?.specialty ? `Enseignant (${(user as any).specialty})` : "Enseignant",
      recipient: newMsgRecipient,
      subject: newMsgSubject,
      date: "À l'instant",
      content: newMsgContent,
      isRead: true,
    };
    setMessages([newMsg, ...messages]);
    setIsComposeOpen(false);
    setNewMsgSubject("");
    setNewMsgContent("");
    toast("Votre message a été transmis à l'administration.", "success");
  };

  const unreadAnnouncementsCount = teacherAnnouncements.filter((a) => !a.isRead).length;
  const unreadMessagesCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Messages, Annonces & Notifications"
        subtitle="Communications officielles de la direction, échéances impératives de saisie et correspondances autorisées"
        breadcrumbs={[{ label: "Enseignant", href: "/enseignant" }, { label: "Messages & Notifications" }]}
        actions={
          <button
            type="button"
            onClick={() => setIsComposeOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target"
          >
            <Send className="w-4 h-4" />
            <span>Nouveau message autorisé</span>
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto text-xs sm:text-sm">
        <button
          type="button"
          onClick={() => setActiveTab("ANNONCES")}
          className={cn(
            "pb-3 font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors",
            activeTab === "ANNONCES"
              ? "border-school-primary text-school-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <Bell className="w-4 h-4" />
          <span>Annonces Direction</span>
          {unreadAnnouncementsCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
              {unreadAnnouncementsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ECHEANCES")}
          className={cn(
            "pb-3 font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors",
            activeTab === "ECHEANCES"
              ? "border-school-primary text-school-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <Calendar className="w-4 h-4" />
          <span>Échéances de Saisie</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("MESSAGES")}
          className={cn(
            "pb-3 font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors",
            activeTab === "MESSAGES"
              ? "border-school-primary text-school-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Messagerie Interne</span>
          {unreadMessagesCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("NOTIFICATIONS")}
          className={cn(
            "pb-3 font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors",
            activeTab === "NOTIFICATIONS"
              ? "border-school-primary text-school-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Notifications Système</span>
        </button>
      </div>

      {/* Tab 1: Annonces Direction */}
      {activeTab === "ANNONCES" && (
        <div className="space-y-4">
          {teacherAnnouncements.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2 shadow-sm">
              <Bell className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Aucune annonce officielle</p>
              <p className="text-xs text-slate-400">Les communications de la direction générale et pédagogique s&apos;afficheront ici.</p>
            </div>
          ) : (
            teacherAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className={cn(
                  "p-5 rounded-2xl border transition-all shadow-sm bg-white space-y-3",
                  !ann.isRead ? "border-school-accent ring-1 ring-school-accent" : "border-slate-200"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                        ann.priority === "URGENT"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-blue-100 text-blue-800"
                      )}
                    >
                      {ann.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{ann.authorName}</span>
                    <span className="text-xs text-slate-400">&bull; {new Date(ann.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>

                  {!ann.isRead && (
                    <button
                      type="button"
                      onClick={() => markAnnouncementRead(ann.id)}
                      className="text-xs text-school-primary font-semibold hover:underline self-end sm:self-auto"
                    >
                      Marquer comme lu
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{ann.title}</h3>
                  <p className="text-xs text-slate-700 leading-relaxed mt-2">{ann.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Échéances de Saisie */}
      {activeTab === "ECHEANCES" && (
        <div className="space-y-4">
          {deadlines.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2 shadow-sm">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Aucune échéance urgente</p>
              <p className="text-xs text-slate-400">Le calendrier officiel des dates limites de saisie sera communiqué par la direction des études.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {deadlines.map((dl) => (
                <div
                  key={dl.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                        dl.status === "URGENT"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-blue-100 text-blue-800"
                      )}
                    >
                      {dl.status}
                    </span>
                    <span className="text-xs font-bold text-school-primary font-mono">
                      J - {dl.daysLeft}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{dl.title}</h3>

                  <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-school-primary" />
                      <span>{dl.dueDate}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Cible : {dl.target}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Messagerie Interne */}
      {activeTab === "MESSAGES" && (
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2 shadow-sm">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Aucun message</p>
              <p className="text-xs text-slate-400">Vous n&apos;avez encore reçu aucun message de l&apos;administration. Cliquez sur &quot;Nouveau message&quot; pour écrire à la direction.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "p-5 rounded-2xl border transition-all shadow-sm bg-white space-y-3",
                  !msg.isRead ? "border-blue-300 ring-1 ring-blue-300" : "border-slate-200"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{msg.sender}</h4>
                      <span className="text-[11px] text-slate-500">{msg.role}</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{msg.date}</span>
                </div>

                <div>
                  <h5 className="font-bold text-xs text-slate-800">{msg.subject}</h5>
                  <p className="text-xs text-slate-700 leading-relaxed mt-1">{msg.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Notifications Système */}
      {activeTab === "NOTIFICATIONS" && (
        <div>
          {liveNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2 shadow-sm">
              <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Aucune notification système</p>
              <p className="text-xs text-slate-400">Toutes vos actions pédagogiques et de présence sont à jour.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
              {liveNotifications.map((n) => (
                <div key={n.id} className="p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                      n.type === "URGENCE"
                        ? "bg-rose-100 text-rose-700"
                        : n.type === "BULLETIN_PUBLIE"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    )}
                  >
                    {n.type === "URGENCE" ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Compose Authorized Message Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Rédiger un message autorisé</h3>
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Destinataire *</label>
                <select
                  value={newMsgRecipient}
                  onChange={(e) => setNewMsgRecipient(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 font-semibold"
                >
                  <option value="Censeur des Études">M. le Censeur des Études</option>
                  <option value="Chef d'Établissement">Direction / Chef d&apos;Établissement</option>
                  <option value="Surveillant Général">Surveillant Général (Vie Scolaire)</option>
                  <option value="Secrétariat Pédagogique">Secrétariat Pédagogique</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Objet du message *</label>
                <input
                  type="text"
                  value={newMsgSubject}
                  onChange={(e) => setNewMsgSubject(e.target.value)}
                  placeholder="Ex : Question relative aux épreuves du Devoir 2..."
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Corps du message *</label>
                <textarea
                  rows={4}
                  value={newMsgContent}
                  onChange={(e) => setNewMsgContent(e.target.value)}
                  placeholder="Rédigez votre message ici..."
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-school-primary text-white font-semibold hover:bg-school-700 shadow-sm"
                >
                  Transmettre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
