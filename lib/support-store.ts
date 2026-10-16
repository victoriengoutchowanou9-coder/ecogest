"use client";

import { useSyncExternalStore } from "react";

export type TicketStatus = "OUVERT" | "EN_COURS" | "RESOLU" | "FERME";

export type TicketCategory =
  | "BUG_TECHNIQUE"
  | "ABONNEMENT_FINANCE"
  | "PEDAGOGIE_BULLETINS"
  | "ACCES_COMPTE"
  | "AUTRE";

export type TicketPriority = "NORMALE" | "HAUTE" | "URGENTE";

export interface TicketMessage {
  id: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
  isStaff: boolean;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  attachmentName?: string;
  userId: string;
  userName: string;
  userRole: string;
  userEmail: string;
  userPhone: string;
  schoolId: string;
  schoolName: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
  hasUnreadReplyForUser: boolean;
  hasUnreadReplyForAdmin: boolean;
}

const INITIAL_TICKETS: SupportTicket[] = [];

const STORAGE_KEY = "educogest_support_tickets_v1";

let memoryTickets: SupportTicket[] = INITIAL_TICKETS;
let listeners: Array<() => void> = [];

function notify() {
  listeners.forEach((l) => l());
}

function loadTickets() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      memoryTickets = JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Erreur chargement tickets support:", e);
  }
}

function saveTickets() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryTickets));
    notify();
  } catch (e) {
    console.error("Erreur sauvegarde tickets support:", e);
  }
}

if (typeof window !== "undefined") {
  loadTickets();
}

export const supportStore = {
  getTickets(): SupportTicket[] {
    return memoryTickets;
  },

  createTicket(data: {
    subject: string;
    category: TicketCategory;
    priority?: TicketPriority;
    description: string;
    attachmentName?: string;
    userId: string;
    userName: string;
    userRole: string;
    userEmail: string;
    userPhone: string;
    schoolId: string;
    schoolName: string;
  }): SupportTicket {
    const now = new Date();
    const dateStr = `${now.toLocaleDateString("fr-FR")} ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;

    const newTicket: SupportTicket = {
      id: `TCK-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      subject: data.subject.trim(),
      category: data.category,
      priority: data.priority || "NORMALE",
      status: "OUVERT",
      description: data.description.trim(),
      attachmentName: data.attachmentName,
      userId: data.userId,
      userName: data.userName,
      userRole: data.userRole,
      userEmail: data.userEmail,
      userPhone: data.userPhone,
      schoolId: data.schoolId,
      schoolName: data.schoolName,
      createdAt: dateStr,
      updatedAt: dateStr,
      hasUnreadReplyForUser: false,
      hasUnreadReplyForAdmin: true,
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderName: data.userName,
          senderRole: data.userRole,
          message: data.description.trim(),
          timestamp: dateStr,
          isStaff: false,
        },
      ],
    };

    memoryTickets = [newTicket, ...memoryTickets];
    saveTickets();
    return newTicket;
  },

  addReply(
    ticketId: string,
    senderName: string,
    senderRole: string,
    message: string,
    isStaff: boolean
  ) {
    const now = new Date();
    const dateStr = `${now.toLocaleDateString("fr-FR")} ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;

    memoryTickets = memoryTickets.map((t) => {
      if (t.id === ticketId) {
        const newMsg: TicketMessage = {
          id: `msg-${Date.now()}`,
          senderName,
          senderRole,
          message: message.trim(),
          timestamp: dateStr,
          isStaff,
        };

        const nextStatus: TicketStatus =
          isStaff && t.status === "OUVERT" ? "EN_COURS" : t.status;

        return {
          ...t,
          status: nextStatus,
          updatedAt: dateStr,
          messages: [...t.messages, newMsg],
          hasUnreadReplyForUser: isStaff ? true : t.hasUnreadReplyForUser,
          hasUnreadReplyForAdmin: !isStaff ? true : t.hasUnreadReplyForAdmin,
        };
      }
      return t;
    });

    saveTickets();
  },

  updateTicketStatus(ticketId: string, newStatus: TicketStatus) {
    const now = new Date();
    const dateStr = `${now.toLocaleDateString("fr-FR")} ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;

    memoryTickets = memoryTickets.map((t) =>
      t.id === ticketId ? { ...t, status: newStatus, updatedAt: dateStr } : t
    );
    saveTickets();
  },

  markUserTicketAsRead(ticketId: string) {
    memoryTickets = memoryTickets.map((t) =>
      t.id === ticketId ? { ...t, hasUnreadReplyForUser: false } : t
    );
    saveTickets();
  },

  markAdminTicketAsRead(ticketId: string) {
    memoryTickets = memoryTickets.map((t) =>
      t.id === ticketId ? { ...t, hasUnreadReplyForAdmin: false } : t
    );
    saveTickets();
  },

  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};

export function useSupportStore() {
  const tickets = useSyncExternalStore(
    supportStore.subscribe,
    supportStore.getTickets,
    () => INITIAL_TICKETS
  );

  return {
    tickets,
    createTicket: supportStore.createTicket.bind(supportStore),
    addReply: supportStore.addReply.bind(supportStore),
    updateTicketStatus: supportStore.updateTicketStatus.bind(supportStore),
    markUserTicketAsRead: supportStore.markUserTicketAsRead.bind(supportStore),
    markAdminTicketAsRead: supportStore.markAdminTicketAsRead.bind(supportStore),
  };
}
