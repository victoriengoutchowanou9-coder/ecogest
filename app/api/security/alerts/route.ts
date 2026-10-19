import { NextResponse } from "next/server";
import { requireServerUserContext, getServerSupabaseAdmin } from "@/lib/server/supabase-admin";
import { recordAuditEvent } from "@/lib/server/audit-logger";

/**
 * GET /api/security/alerts
 * Liste les alertes de sécurité de l'établissement (Directeur) ou globales (Super-admin)
 */
export async function GET(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    if (user.role !== "directeur" && user.role !== "admin" && user.role !== "dev_admin") {
      return NextResponse.json({ success: false, error: "Accès réservé à la Direction et aux Administrateurs." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const resolved = searchParams.get("resolved");
    const severity = searchParams.get("severity");

    const supabaseAdmin = getServerSupabaseAdmin();
    let query = supabaseAdmin
      .from("security_alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (user.role !== "dev_admin") {
      query = query.eq("school_id", user.schoolId);
    }

    if (resolved !== null && resolved !== undefined) {
      query = query.eq("is_resolved", resolved === "true");
    }

    if (severity) {
      query = query.eq("severity", severity.toUpperCase());
    }

    const { data: alerts, error } = await query;

    if (error) {
      console.error("[api/security/alerts:GET] Erreur lecture :", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      alerts: alerts || [],
      count: alerts?.length || 0,
    });
  } catch (err: any) {
    console.error("[api/security/alerts:GET] Exception :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * PATCH /api/security/alerts
 * Résolution ou clôture d'une alerte de sécurité avec notes obligatoires
 */
export async function PATCH(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    if (user.role !== "directeur" && user.role !== "admin" && user.role !== "dev_admin") {
      return NextResponse.json({ success: false, error: "Droit d'administration requis." }, { status: 403 });
    }

    const body = await request.json();
    const { alertId, resolutionNotes } = body;

    if (!alertId) {
      return NextResponse.json({ success: false, error: "ID de l'alerte requis." }, { status: 400 });
    }

    const supabaseAdmin = getServerSupabaseAdmin();

    const { data: targetAlert, error: fetchError } = await supabaseAdmin
      .from("security_alerts")
      .select("*")
      .eq("id", alertId)
      .maybeSingle();

    if (fetchError || !targetAlert) {
      return NextResponse.json({ success: false, error: "Alerte introuvable." }, { status: 404 });
    }

    // Si pas dev_admin, vérifier que l'alerte est bien de son école
    if (user.role !== "dev_admin" && targetAlert.school_id !== user.schoolId) {
      return NextResponse.json({ success: false, error: "Accès refusé pour cette alerte." }, { status: 403 });
    }

    const { data: updatedAlert, error: updateError } = await supabaseAdmin
      .from("security_alerts")
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by_user_id: user.userId,
        resolution_notes: resolutionNotes || "Alerte traitée et vérifiée par l'administration.",
      })
      .eq("id", alertId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    if (targetAlert.school_id) {
      await recordAuditEvent({
        schoolId: targetAlert.school_id,
        userId: user.userId,
        role: user.role,
        action: "RESOLUTION_ALERTE_SECURITE",
        resourceType: "security_alerts",
        resourceId: alertId,
        newData: {
          alertType: targetAlert.alert_type,
          severity: targetAlert.severity,
          resolutionNotes,
        },
        req: request,
      });
    }

    return NextResponse.json({
      success: true,
      message: "L'alerte a été marquée comme résolue.",
      alert: updatedAlert,
    });
  } catch (err: any) {
    console.error("[api/security/alerts:PATCH] Exception :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
