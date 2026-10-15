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

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "TCK-2026-001",
    subject: "Problème d'impression du bulletin en format A4 Portrait sur Chrome",
    category: "PEDAGOGIE_BULLETINS",
    priority: "HAUTE",
    status: "EN_COURS",
    description: "Lors de l'impression du bulletin officiel de 3ème A, les marges dépassent légèrement sur la 2ème page sur certains navigateurs.",
    attachmentName: "capture_apercu_bulletin.png",
    userId: "u-03",
    userName: "Prof. Justin HOUNKPONOU",
    userRole: "Enseignant",
    userEmail: "prof.hounkponou@ccpa-cotonou.bj",
    userPhone: "+229 96 11 22 33",
    schoolId: "school-1",
    schoolName: "Collège Catholique Père Aupiais",
    createdAt: "2026-10-12 10:30",
    updatedAt: "2026-10-13 14:15",
    hasUnreadReplyForUser: true,
    hasUnreadReplyForAdmin: false,
    messages: [
      {
        id: "msg-1",
        senderName: "Prof. Justin HOUNKPONOU",
        senderRole: "Enseignant",
        message: "Bonjour, j'ai remarqué un décalage lors de l'impression des bulletins de mes élèves en format A4.",
        timestamp: "12/10/2026 10:30",
        isStaff: false,
      },
      {
        id: "msg-2",
        senderName: "Support Technique EDUCOGEST",
        senderRole: "Équipe Support",
        message: "Bonjour M. HOUNKPONOU. Nous avons ajusté la règle CSS @page avec un margin de 8mm pour garantir que chaque bulletin tienne strictement sur une seule page A4.",
        timestamp: "13/10/2026 14:15",
        isStaff: true,
      },
    ],
  },
  {
    id: "TCK-2026-002",
    subject: "Demande d'activation du Forfait STANDARD pour 25 professeurs",
    category: "ABONNEMENT_FINANCE",
    priority: "HAUTE",
    status: "RESOLU",
    description: "Notre collège souhaite souscrire à la Formule Standard (10 000 FCFA/mois) avec règlement en espèces à notre intendant.",
    userId: "u-01",
    userName: "Père Gilbert KPATINVOH",
    userRole: "Directeur",
    userEmail: "directeur@ccpa-cotonou.bj",
    userPhone: "+229 97 00 00 01",
    schoolId: "school-1",
    schoolName: "Collège Catholique Père Aupiais",
    createdAt: "2026-10-10 08:45",
    updatedAt: "2026-10-11 09:00",
    hasUnreadReplyForUser: false,
    hasUnreadReplyForAdmin: false,
    messages: [
      {
        id: "msg-3",
        senderName: "Père Gilbert KPATINVOH",
        senderRole: "Directeur",
        message: "Bonjour, nous confirmons le paiement de notre formule Standard pour le mois en cours.",
        timestamp: "10/10/2026 08:45",
        isStaff: false,
      },
      {
        id: "msg-4",
        senderName: "Service Facturation EDUCOGEST",
        senderRole: "Équipe Facturation",
        message: "Bien reçu Père Directeur. Votre établissement est activé en Formule Standard avec 25 utilisateurs autorisés et reçu certifié.",
        timestamp: "11/10/2026 09:00",
        isStaff: true,
      },
    ],
  },
  {
    id: "TCK-2026-003",
    subject: "Question sur le rattachement d'un 2ème enfant (Forfait Parent 2)",
    category: "ACCES_COMPTE",
    priority: "NORMALE",
    status: "OUVERT",
    description: "J'ai un premier enfant en 3ème et ma fille vient d'entrer en 6ème. Comment passer à la formule 300 FCFA ?",
    userId: "u-05",
    userName: "M. Marc ADANHOUN",
    userRole: "Parent",
    userEmail: "parent.adanhouan@gmail.com",
    userPhone: "+229 97 12 34 56",
    schoolId: "school-1",
    schoolName: "Collège Catholique Père Aupiais",
    createdAt: "2026-10-14 11:20",
    updatedAt: "2026-10-14 11:20",
    hasUnreadReplyForUser: false,
    hasUnreadReplyForAdmin: true,
    messages: [
      {
        id: "msg-5",
        senderName: "M. Marc ADANHOUN",
        senderRole: "Parent",
        message: "Bonjour, je souhaite savoir comment associer ma deuxième fille sans perdre l'accès à mon fils.",
        timestamp: "14/10/2026 11:20",
        isStaff: false,
      },
    ],
  },
];

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
