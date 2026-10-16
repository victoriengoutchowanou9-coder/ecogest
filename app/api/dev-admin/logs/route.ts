import { NextResponse } from "next/server";
import { requireDeveloperAuth, getSupabaseAdminClient, recordSystemAuditLog } from "@/lib/server/dev-auth";

export async function GET(request: Request) {
  const auth = await requireDeveloperAuth();

  if (!auth.authenticated) {
    return NextResponse.json({ error: "Accès refusé. Session développeur requise." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const eventType = searchParams.get("eventType") || "";
  const severity = searchParams.get("severity") || "";
  const role = searchParams.get("role") || "";
  const search = searchParams.get("search") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);

  const supabase = getSupabaseAdminClient();

  try {
    let query = supabase
      .from("system_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (eventType && eventType !== "ALL") {
      query = query.eq("event_type", eventType);
    }

    if (severity && severity !== "ALL") {
      query = query.eq("severity", severity);
    }

    if (role && role !== "ALL") {
      query = query.ilike("user_role", `%${role}%`);
    }

    if (dateFrom) {
      query = query.gte("created_at", `${dateFrom}T00:00:00Z`);
    }

    if (dateTo) {
      query = query.lte("created_at", `${dateTo}T23:59:59Z`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let logs = data || [];

    // Filtre textuel optionnel sur utilisateur, école ou titre
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      logs = logs.filter(
        (l) =>
          l.action_title?.toLowerCase().includes(q) ||
          l.user_email?.toLowerCase().includes(q) ||
          l.school_name?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      logs,
      totalReturned: logs.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireDeveloperAuth();

  if (!auth.authenticated) {
    return NextResponse.json({ error: "Accès refusé. Session développeur requise." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { actionTitle, eventType, severity, details, schoolName } = body;

    if (!actionTitle) {
      return NextResponse.json({ error: "Titre de l'action requis." }, { status: 400 });
    }

    await recordSystemAuditLog({
      eventType: eventType || "INTERVENTION_TECHNIQUE",
      severity: severity || "INFO",
      actionTitle,
      details: details || {},
      userEmail: auth.email,
      userRole: "DEVELOPPEUR",
      schoolName: schoolName || "Administration Centrale",
    });

    return NextResponse.json({ success: true, message: "Action enregistrée dans le journal technique." });
  } catch (err: any) {
    return NextResponse.json({ error: "Impossible d'enregistrer l'action." }, { status: 500 });
  }
}
