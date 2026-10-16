import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export interface ServerTicket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
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
  messages: any[];
  hasUnreadReplyForUser: boolean;
  hasUnreadReplyForAdmin: boolean;
}

// Stockage serveur persistant en mémoire / synchro
let globalServerTickets: ServerTicket[] = [];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");

    // Tentative de lecture Supabase si table existe
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        return NextResponse.json({
          success: true,
          tickets: data,
          count: data.length,
          source: "database",
        });
      }
    } catch {
      // Table non existante, fallback sur tickets mémoire serveur
    }

    let tickets = globalServerTickets;
    if (schoolId) {
      tickets = tickets.filter((t) => t.schoolId === schoolId);
    }

    return NextResponse.json({
      success: true,
      tickets,
      count: tickets.length,
      source: "server_store",
    });
  } catch (err: any) {
    console.error("[api/support/tickets] GET error:", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de la récupération des tickets." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      subject,
      category = "BUG_TECHNIQUE",
      priority = "NORMALE",
      description,
      attachmentName,
      userId,
      userName,
      userRole,
      userEmail,
      userPhone,
      schoolId,
      schoolName,
    } = body;

    if (!subject?.trim() || !description?.trim()) {
      return NextResponse.json(
        { success: false, error: "Le sujet et la description sont requis." },
        { status: 400 }
      );
    }

    const now = new Date();
    const dateStr = `${now.toLocaleDateString("fr-FR")} ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;

    const newTicket: ServerTicket = {
      id: `TCK-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      subject: subject.trim(),
      category,
      priority,
      status: "OUVERT",
      description: description.trim(),
      attachmentName,
      userId: userId || "user-anon",
      userName: userName || "Utilisateur",
      userRole: userRole || "Utilisateur",
      userEmail: userEmail || "",
      userPhone: userPhone || "",
      schoolId: schoolId || "",
      schoolName: schoolName || "",
      createdAt: dateStr,
      updatedAt: dateStr,
      hasUnreadReplyForUser: false,
      hasUnreadReplyForAdmin: true,
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderName: userName || "Utilisateur",
          senderRole: userRole || "Utilisateur",
          message: description.trim(),
          timestamp: dateStr,
          isStaff: false,
        },
      ],
    };

    // Tentative insertion Supabase
    try {
      await supabase.from("support_tickets").insert([newTicket]);
    } catch {
      // Ignore si la table n'est pas encore créée
    }

    globalServerTickets = [newTicket, ...globalServerTickets];

    return NextResponse.json({
      success: true,
      ticket: newTicket,
    });
  } catch (err: any) {
    console.error("[api/support/tickets] POST error:", err);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création du ticket." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, status, replyMessage, senderName, senderRole, isStaff } = body;

    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: "ticketId requis." },
        { status: 400 }
      );
    }

    const now = new Date();
    const dateStr = `${now.toLocaleDateString("fr-FR")} ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;

    let target = globalServerTickets.find((t) => t.id === ticketId);

    if (target) {
      if (status) {
        target.status = status;
        target.updatedAt = dateStr;
      }

      if (replyMessage?.trim()) {
        const newMsg = {
          id: `msg-${Date.now()}`,
          senderName: senderName || "Support",
          senderRole: senderRole || "Staff",
          message: replyMessage.trim(),
          timestamp: dateStr,
          isStaff: Boolean(isStaff),
        };
        target.messages.push(newMsg);
        target.updatedAt = dateStr;
        if (isStaff) {
          target.hasUnreadReplyForUser = true;
          if (target.status === "OUVERT") target.status = "EN_COURS";
        } else {
          target.hasUnreadReplyForAdmin = true;
        }
      }

      // Sync Supabase
      try {
        await supabase
          .from("support_tickets")
          .update({
            status: target.status,
            messages: target.messages,
            updated_at: dateStr,
          })
          .eq("id", ticketId);
      } catch {}
    }

    return NextResponse.json({
      success: true,
      ticket: target,
    });
  } catch (err: any) {
    console.error("[api/support/tickets] PATCH error:", err);
    return NextResponse.json(
      { success: false, error: "Erreur mise à jour ticket." },
      { status: 500 }
    );
  }
}
