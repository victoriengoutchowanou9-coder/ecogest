import { NextResponse } from "next/server";
import { getServerSupabaseAdmin, requireServerUserContext } from "@/lib/server/supabase-admin";
import { requireDeveloperAuth } from "@/lib/server/dev-auth";

const supabase = getServerSupabaseAdmin();

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
    const requestedSchoolId = searchParams.get("schoolId");

    // Vérification de la session utilisateur dans Supabase
    const userRes = await requireServerUserContext(request);
    const devSession = await requireDeveloperAuth();

    let authenticatedUser: any = null;
    let isDirector = false;
    let isDevAdmin = Boolean(devSession?.authenticated);

    if (userRes.success) {
      authenticatedUser = userRes.user;
      isDirector = authenticatedUser.role?.toLowerCase() === "directeur";
    }

    const schoolId = isDirector || isDevAdmin ? requestedSchoolId || authenticatedUser?.schoolId : authenticatedUser?.schoolId;

    // Tentative de lecture Supabase si table existe
    try {
      let query = supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (schoolId) {
        query = query.eq("school_id", schoolId);
      }

      // Si l'utilisateur n'est NI Directeur NI Dev Admin, il ne peut voir que ses propres tickets
      if (!isDirector && !isDevAdmin && authenticatedUser) {
        query = query.or(`user_id.eq.${authenticatedUser.userId},user_email.eq.${authenticatedUser.email}`);
      }

      const { data, error } = await query;

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
      tickets = tickets.filter((t) => !t.schoolId || t.schoolId === schoolId);
    }
    if (!isDirector && !isDevAdmin && authenticatedUser) {
      tickets = tickets.filter(
        (t) =>
          t.userId === authenticatedUser.userId ||
          t.userEmail?.toLowerCase() === authenticatedUser.email?.toLowerCase()
      );
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

    // Enregistrement dans le journal d'audit
    try {
      const { recordSystemAuditLog } = await import("@/lib/server/dev-auth");
      await recordSystemAuditLog({
        eventType: "CREATION_TICKET_SUPPORT",
        severity: priority === "URGENTE" ? "WARNING" : "INFO",
        actionTitle: `Création ticket de support : « ${subject.trim()} » par ${userName || userEmail || "un utilisateur"}`,
        details: {
          ticketId: newTicket.id,
          category,
          priority,
          userPhone: userPhone || undefined,
        },
        userEmail: userEmail || undefined,
        userRole: userRole || "Utilisateur",
        schoolId: schoolId || undefined,
        schoolName: schoolName || undefined,
      });
    } catch {}

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
    const userRes = await requireServerUserContext(request);
    const devSession = await requireDeveloperAuth();

    const isDirector = userRes.success && userRes.user.role?.toLowerCase() === "directeur";
    const isDevAdmin = Boolean(devSession?.authenticated);

    const body = await request.json();
    const { ticketId, status, replyMessage, senderName, senderRole, isStaff } = body;

    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: "ticketId requis." },
        { status: 400 }
      );
    }

    // Contrôle strict des permissions : Seul le Directeur ou le Dev Admin peut changer le statut ou répondre en tant que support
    if ((status || isStaff) && !isDirector && !isDevAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Action non autorisée. Seule la Direction ou l'administrateur système est habilité à modifier le statut d'un ticket ou à répondre en qualité de support.",
        },
        { status: 403 }
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
