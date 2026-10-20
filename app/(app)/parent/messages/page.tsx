"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  User,
  Shield,
  CreditCard,
  CheckCheck,
  Paperclip,
  Search,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

interface Message {
  id: string;
  sender: "parent" | "contact";
  text: string;
  timestamp: string;
}

interface Thread {
  id: string;
  contactName: string;
  contactRole: string;
  avatarText: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  messages: Message[];
}

const INITIAL_THREADS: Thread[] = [];

export default function ParentMessagesPage() {
  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>(threads[0]?.id || "");
  const [inputText, setInputText] = useState("");

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0] || null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThread) return;

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      sender: "parent",
      text: inputText.trim(),
      timestamp: "À l'instant",
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            lastMessage: newMessage.text,
            lastMessageTime: "À l'instant",
            messages: [...t.messages, newMessage],
          };
        }
        return t;
      })
    );

    setInputText("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messagerie Établissement"
        subtitle="Échangez directement avec les professeurs principaux, le censeur et la comptabilité"
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Messages" }]}
      />

      {threads.length === 0 || !activeThread ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Aucune conversation en cours</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Vous n&apos;avez actuellement aucun fil de discussion ouvert. Dès qu&apos;un enseignant ou l&apos;administration vous contacte, vous pourrez lui répondre ici en direct.
          </p>
        </div>
      ) : (
        /* Messaging Layout Container */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
          {/* Left Sidebar: Threads list */}
          <div className="md:col-span-5 lg:col-span-4 border-r border-slate-200 flex flex-col">
            <div className="p-3 border-b border-slate-200 bg-slate-50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher une conversation..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-school-primary/20"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {threads.map((thread) => {
                const isActive = thread.id === activeThreadId;
                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setActiveThreadId(thread.id)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors touch-target ${
                      isActive ? "bg-school-50/70" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-school-primary text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {thread.avatarText}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {thread.contactName}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {thread.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate">
                        {thread.contactRole}
                      </p>
                      <p className="text-xs text-slate-600 truncate mt-1">
                        {thread.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Chat Panel */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between bg-slate-50/40">
            {/* Thread Header */}
            <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-school-primary text-white flex items-center justify-center font-bold text-xs">
                  {activeThread.avatarText}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {activeThread.contactName}
                  </h3>
                  <p className="text-[11px] text-slate-500">{activeThread.contactRole}</p>
                </div>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
              {activeThread.messages.map((msg) => {
                const isMe = msg.sender === "parent";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-3.5 text-xs shadow-2xs leading-relaxed ${
                        isMe
                          ? "bg-school-primary text-white rounded-br-xs"
                          : "bg-white text-slate-900 border border-slate-200 rounded-bl-xs"
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                      {msg.timestamp}
                      {isMe && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Message Input Footer */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 py-2 px-3.5 text-xs md:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-school-primary/20"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-school-primary text-white hover:bg-school-700 disabled:opacity-50 transition-colors touch-target shadow-2xs"
                aria-label="Envoyer le message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
