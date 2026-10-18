"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Send,
  User,
  Bot,
  Sparkles,
  Clock,
  CheckCircle2,
  HelpCircle,
  Settings,
  CreditCard,
  Building2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

interface ChatMessage {
  id: string;
  sender: "user" | "support";
  text: string;
  time: string;
}

export default function ChatSupportPage() {
  const [topic, setTopic] = useState<string>("FONCTIONNEMENT");
  const [isChatStarted, setIsChatStarted] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "support",
      text: "Bonjour et bienvenue sur l'assistance en direct ECOGEST ! Je suis votre conseiller technique. En quoi puis-je vous aider aujourd'hui ?",
      time: "À l'instant",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const topicsList = [
    { id: "FONCTIONNEMENT", label: "Fonctionnement du logiciel", icon: <HelpCircle className="w-4 h-4 text-school-primary" /> },
    { id: "TECHNIQUE", label: "Problèmes techniques", icon: <AlertCircle className="w-4 h-4 text-rose-500" /> },
    { id: "COMPTE", label: "Gestion du compte & accès", icon: <User className="w-4 h-4 text-purple-500" /> },
    { id: "ABONNEMENT", label: "Abonnement & Forfaits", icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
    { id: "PAIEMENT", label: "Paiements & Caisse", icon: <CreditCard className="w-4 h-4 text-emerald-500" /> },
    { id: "CONFIGURATION", label: "Configuration de l'établissement", icon: <Building2 className="w-4 h-4 text-blue-500" /> },
  ];

  const handleStartChat = () => {
    setIsChatStarted(true);
    const selectedTopicLabel = topicsList.find((t) => t.id === topic)?.label || "Général";
    setMessages((prev) => [
      ...prev,
      {
        id: `topic-${Date.now()}`,
        sender: "support",
        text: `Parfait, j'ai bien noté que votre question concerne : « ${selectedTopicLabel} ». Veuillez décrire précisément votre besoin ou difficulté.`,
        time: "À l'instant",
      },
    ]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    const newMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: userText,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");
    setIsTyping(true);

    // Smart simulated reply
    setTimeout(() => {
      let reply = "Merci pour votre message. Nos équipes pédagogiques et techniques sont informées. Un technicien peut également vous assister à distance au +229 21 30 45 80 si besoin.";
      const lower = userText.toLowerCase();

      if (lower.includes("bulletin") || lower.includes("note")) {
        reply = "Concernant les notes et bulletins : assurez-vous que les coefficients sont configurés par le Censeur et que le bulletin a été officiellement publié. Tant que la délibération est en cours, les notes restent masquées aux parents.";
      } else if (lower.includes("tarif") || lower.includes("forfait") || lower.includes("prix")) {
        reply = "Les forfaits écoles sont de 6 000 FCFA/mois (Starter), 10 000 FCFA/mois (Pro - capacité étendue pour 1 école), et 25 000 FCFA/mois (Institution - 2 écoles avec utilisateurs illimités). Pour les parents : 200 FCFA/mois (1 élève) ou 300 FCFA/mois (fratrie 2 élèves).";
      } else if (lower.includes("examen") || lower.includes("calendrier")) {
        reply = "La programmation des examens s'effectue dans l'espace Censeur > Planification des Examens. Vous pouvez y définir la salle, le surveillant, l'heure et la date d'épreuve.";
      } else if (lower.includes("compte") || lower.includes("mot de passe")) {
        reply = "Pour modifier votre mot de passe, accédez directement à votre Profil ou aux paramètres de votre compte. En cas d'oubli, utilisez le lien 'Mot de passe oublié ?' sur la page de connexion pour réinitialiser votre accès en toute sécurité et sans intervention extérieure.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `rep-${Date.now()}`,
          sender: "support",
          text: reply,
          time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <PublicNavbar currentPath="/chat-support" />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-school-primary text-white py-10 md:py-14 px-4 sm:px-6 lg:px-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-school-200">
          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>MESSAGERIE D&apos;ASSISTANCE EN DIRECT</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
          Chat en Direct ECOGEST
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Dialoguez en temps réel avec un conseiller ECOGEST pour résoudre tout blocage ou configurer votre établissement.
        </p>

        {/* Live Support Indicator Bar (Requirement) */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3 text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Statut : Support disponible en ligne</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-slate-200 border border-white/10">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>Horaires : Lun - Sam &bull; 07h30 - 19h00 (UTC+1)</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-slate-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            <span>Temps de réponse moyen : &lt; 3 minutes</span>
          </div>
        </div>
      </section>

      {/* Main Chat Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {!isChatStarted ? (
          /* Step 1 : Choose topic & click "Démarrer une conversation" */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-8 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Quel est l&apos;objet de votre demande ?
              </h2>
              <p className="text-xs text-slate-500">
                Sélectionnez la catégorie pour être orienté vers le spécialiste adapté.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topicsList.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setTopic(t.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center gap-3 text-xs font-semibold ${
                    topic === t.id
                      ? "border-school-primary bg-school-50/70 text-school-primary shadow-xs ring-1 ring-school-primary"
                      : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 shrink-0">
                    {t.icon}
                  </div>
                  <span>{t.label}</span>
                </div>
              ))}
            </div>

            <div className="text-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleStartChat}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-school-primary text-white font-bold text-sm hover:bg-school-700 shadow-md shadow-school-primary/20 transition touch-target"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Démarrer une conversation</span>
              </button>
            </div>
          </div>
        ) : (
          /* Step 2 : Active Chat View */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[600px]">
            
            {/* Chat Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-school-primary text-white flex items-center justify-center font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                    Conseiller ECOGEST PRO
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/30 text-emerald-300">
                      En ligne
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Objet : {topicsList.find((t) => t.id === topic)?.label}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsChatStarted(false)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
                title="Changer de sujet"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Changer d&apos;objet</span>
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 max-w-[85%] ${
                    msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      msg.sender === "user"
                        ? "bg-school-primary text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-1 shadow-2xs ${
                      msg.sender === "user"
                        ? "bg-school-primary text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`block text-[10px] text-right font-mono ${
                        msg.sender === "user" ? "text-school-200" : "text-slate-400"
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-ping"></span>
                  <span>Le conseiller est en train d&apos;écrire...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Écrivez votre message à l'assistance..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-school-primary focus:ring-1 focus:ring-school-primary"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="px-4 py-2.5 rounded-xl bg-school-primary disabled:opacity-50 hover:bg-school-700 text-white font-bold text-xs flex items-center gap-1.5 transition touch-target"
              >
                <span>Envoyer</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        )}

      </main>

      <PublicFooter />
    </div>
  );
}
