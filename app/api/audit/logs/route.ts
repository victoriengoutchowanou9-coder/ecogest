import { NextResponse } from "next/server";
import { requireServerUserContext, getServerSupabaseAdmin } from "@/lib/server/supabase-admin";
import { assertRolePermission } from "@/lib/server/permissions-matrix";

/**
 * GET /api/audit/logs
 * Récupère le journal d'audit immuable de l'établissement.
 * STRICTEMENT ISOLÉ : Un utilisateur de l'école A ne peut JAMAIS consulter les logs de l'école B.
 */
export async function GET(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    try {
      assertRolePermission(user, "audit_logs", "read");
    } catch (permErr: any) {
      return NextResponse.json({ success: false, error: permErr.message }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const resourceType = searchParams.get("resourceType");
    const userId = searchParams.get("userId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 500);

    const supabaseAdmin = getServerSupabaseAdmin();

    // Requete scellée à l'établissement de la session serveur
    let query = supabaseAdmin
      .from("audit_logs")
      .select("id, school_id, user_id, role, action, resource_type, resource_id, old_data, new_data, ip, user_agent, request_id, created_at, school_users(full_name, email)")
      .eq("school_id", user.schoolId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (action) {
      query = query.eq("action", action);
    }
    if (resourceType) {
      query = query.eq("resource_type", resourceType);
    }
    if (userId) {
      query = query.eq("user_id", userId);
    }
    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }
    if (dateTo) {
      query = query.lte("created_at", dateTo);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error("[api/audit/logs:GET] Erreur lecture :", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      logs: logs || [],
      count: logs?.length || 0,
      schoolId: user.schoolId,
    });
  } catch (err: any) {
    console.error("[api/audit/logs:GET] Exception :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
