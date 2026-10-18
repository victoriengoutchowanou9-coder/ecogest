import { NextResponse } from "next/server";
import { requireDeveloperAuth, getSupabaseAdminClient, recordSystemAuditLog } from "@/lib/server/dev-auth";

export async function GET(request: Request) {
  const auth = await requireDeveloperAuth();

  if (!auth.authenticated) {
    return NextResponse.json({ error: "Accès refusé. Session développeur requise." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "ALL";
  const school = searchParams.get("school") || "ALL";
  const search = searchParams.get("search") || "";

  const supabase = getSupabaseAdminClient();

  try {
    let tickets: any[] = [];

    // 1. Tentative de lecture dans la base Supabase
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        tickets = data;
      }
    } catch {
      // Table non existante
    }

    // 2. Si aucun ticket en base, récupération via l'API interne support
    if (tickets.length === 0) {
      try {
        const host = request.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";
        const res = await fetch(`${protocol}://${host}/api/support/tickets`);
        if (res.ok) {
          const json = await res.json();
          if (json.tickets && Array.isArray(json.tickets)) {
            tickets = json.tickets;
          }
        }
      } catch {}
    }

    // Filtrage
    let filtered = tickets;
    if (status !== "ALL") {
      filtered = filtered.filter((t) => t.status === status);
    }
    if (school !== "ALL") {
      filtered = filtered.filter((t) => (t.schoolName || "").toLowerCase().includes(school.toLowerCase()));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.subject || "").toLowerCase().includes(q) ||
          (t.id || "").toLowerCase().includes(q) ||
          (t.userName || "").toLowerCase().includes(q) ||
          (t.userEmail || "").toLowerCase().includes(q) ||
          (t.schoolName || "").toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      tickets: filtered,
      count: filtered.length,
      totalAll: tickets.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireDeveloperAuth();

  if (!auth.authenticated) {
    return NextResponse.json({ error: "Accès refusé. Session développeur requise." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ticketId, status, replyMessage } = body;

    if (!ticketId) {
      return NextResponse.json({ error: "ticketId requis." }, { status: 400 });
    }

    // Transmettre la mise à jour à l'API de support interne
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";

    const updateRes = await fetch(`${protocol}://${host}/api/support/tickets`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticketId,
        status,
        replyMessage,
        senderName: "Support Technique ECOGEST (Développeur)",
        senderRole: "DEVELOPPEUR",
        isStaff: true,
      }),
    });

    const updateData = await updateRes.json().catch(() => ({}));

    // Enregistrement d'audit
    await recordSystemAuditLog({
      eventType: "REPONSE_TICKET_SUPPORT",
      severity: "INFO",
      actionTitle: `Traitement du ticket de support ${ticketId} par le Développeur`,
      details: {
        ticketId,
        nouveauStatut: status,
        reponseFournie: Boolean(replyMessage),
      },
      userEmail: auth.email,
      userRole: "DEVELOPPEUR",
      schoolName: updateData.ticket?.schoolName || "Système Global",
    });

    return NextResponse.json({
      success: true,
      ticket: updateData.ticket,
      message: "Ticket mis à jour avec succès.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Impossible de mettre à jour le ticket." }, { status: 500 });
  }
}
