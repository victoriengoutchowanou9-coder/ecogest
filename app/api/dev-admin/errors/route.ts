import { NextResponse } from "next/server";
import { requireDeveloperAuth, getSupabaseAdminClient, recordSystemAuditLog } from "@/lib/server/dev-auth";

/**
 * GET /api/dev-admin/errors
 * Récupère toutes les erreurs techniques réelles consignées dans la base :
 * Type, message, module, page, fréquence, statut (NOUVELLE, EN_COURS, RESOLUE),
 * utilisateur, établissement.
 */
export async function GET(request: Request) {
  const auth = await requireDeveloperAuth();
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Session développeur requise." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status") || "ALL"; // 'ALL' | 'NOUVELLE' | 'EN_COURS' | 'RESOLUE'
  const severityFilter = searchParams.get("severity") || "ALL";
  const search = searchParams.get("search") || "";

  const supabase = getSupabaseAdminClient();

  try {
    // 1. Lire les erreurs depuis system_audit_logs
    let query = supabase
      .from("system_audit_logs")
      .select("*")
      .or("severity.eq.ERROR,severity.eq.CRITICAL,severity.eq.WARNING,event_type.ilike.%ERREUR%,event_type.ilike.%EXCEPTION%,event_type.eq.APPLICATION_ERROR")
      .order("created_at", { ascending: false })
      .limit(200);

    const { data: errorLogs, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let list = (errorLogs || []).map((err) => {
      const details = err.details || {};
      const status = details.status || (err.severity === "CRITICAL" ? "NOUVELLE" : "NOUVELLE");
      const frequency = details.frequency || 1;
      const page = details.page || details.url || details.path || "Application";
      const moduleName = details.module || err.event_type || "Système";
      const errorMessage = details.error_message || details.message || err.action_title;
      const stack = details.stack || details.stackTrace || "";

      return {
        id: err.id,
        eventType: err.event_type,
        severity: err.severity,
        actionTitle: err.action_title,
        errorMessage,
        page,
        module: moduleName,
        frequency,
        status, // 'NOUVELLE' | 'EN_COURS' | 'RESOLUE'
        userEmail: err.user_email || "Non renseigné",
        userRole: err.user_role || "—",
        schoolName: err.school_name || "Système Global",
        schoolId: err.school_id,
        ipAddress: err.ip_address || "—",
        stackTrace: stack,
        resolutionNotes: details.resolution_notes || "",
        resolvedAt: details.resolved_at || null,
        resolvedBy: details.resolved_by || null,
        createdAt: err.created_at,
      };
    });

    // Filtrage statut
    if (statusFilter !== "ALL") {
      list = list.filter((e) => e.status === statusFilter);
    }

    // Filtrage sévérité
    if (severityFilter !== "ALL") {
      list = list.filter((e) => e.severity === severityFilter);
    }

    // Recherche textuelle
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.actionTitle.toLowerCase().includes(q) ||
          e.errorMessage.toLowerCase().includes(q) ||
          e.page.toLowerCase().includes(q) ||
          e.module.toLowerCase().includes(q) ||
          e.schoolName.toLowerCase().includes(q) ||
          e.userEmail.toLowerCase().includes(q)
      );
    }

    // Statistiques d'erreurs
    let countNouvelles = 0;
    let countEnCours = 0;
    let countResolues = 0;

    (errorLogs || []).forEach((e) => {
      const s = e.details?.status || "NOUVELLE";
      if (s === "RESOLUE") countResolues++;
      else if (s === "EN_COURS") countEnCours++;
      else countNouvelles++;
    });

    return NextResponse.json({
      success: true,
      errors: list,
      count: list.length,
      stats: {
        total: errorLogs?.length || 0,
        nouvelles: countNouvelles,
        enCours: countEnCours,
        resolues: countResolues,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur." }, { status: 500 });
  }
}

/**
 * PATCH /api/dev-admin/errors
 * Permet au développeur de mettre à jour le statut d'une erreur (NOUVELLE, EN_COURS, RESOLUE)
 * et de consigner une note technique de résolution.
 */
export async function PATCH(request: Request) {
  const auth = await requireDeveloperAuth();
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Session développeur requise." }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();

  try {
    const body = await request.json();
    const { errorId, status, resolutionNotes } = body;

    if (!errorId || !status) {
      return NextResponse.json({ error: "errorId et status (NOUVELLE | EN_COURS | RESOLUE) requis." }, { status: 400 });
    }

    // Récupérer l'erreur actuelle
    const { data: existingError } = await supabase
      .from("system_audit_logs")
      .select("*")
      .eq("id", errorId)
      .maybeSingle();

    if (!existingError) {
      return NextResponse.json({ error: "Incident introuvable." }, { status: 404 });
    }

    const updatedDetails = {
      ...(existingError.details || {}),
      status,
      resolution_notes: resolutionNotes || existingError.details?.resolution_notes || "",
      resolved_at: status === "RESOLUE" ? new Date().toISOString() : null,
      resolved_by: status === "RESOLUE" ? auth.email : null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("system_audit_logs")
      .update({
        details: updatedDetails,
      })
      .eq("id", errorId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Journal d'audit de l'intervention
    await recordSystemAuditLog({
      eventType: "INTERVENTION_TECHNIQUE",
      severity: "INFO",
      actionTitle: `Incident technique marqué « ${status} » par le Développeur`,
      details: {
        incidentId: errorId,
        newStatus: status,
        notes: resolutionNotes,
      },
      userEmail: auth.email,
      userRole: "DEVELOPPEUR",
      schoolName: existingError.school_name || "Système Global",
    });

    return NextResponse.json({
      success: true,
      message: `Statut de l'erreur mis à jour : ${status}`,
      updatedDetails,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur." }, { status: 500 });
  }
}
