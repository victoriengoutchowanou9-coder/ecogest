import { NextResponse } from "next/server";
import { requireServerUserContext, getServerSupabaseAdmin } from "@/lib/server/supabase-admin";
import { assertRolePermission } from "@/lib/server/permissions-matrix";
import { recordAuditEvent } from "@/lib/server/audit-logger";

/**
 * GET /api/sessions
 * Liste les sessions actives et appareils connectés.
 * Les directeurs/administrateurs voient tous les appareils de leur école.
 * Les autres utilisateurs voient leurs propres appareils connectés.
 */
export async function GET(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    const supabaseAdmin = getServerSupabaseAdmin();
    let query = supabaseAdmin
      .from("user_sessions")
      .select("id, school_id, user_id, device_name, device_type, ip_address, last_active_at, is_revoked, expires_at, created_at, school_users(full_name, email, role)")
      .eq("school_id", user.schoolId)
      .eq("is_revoked", false)
      .gt("expires_at", new Date().toISOString())
      .order("last_active_at", { ascending: false });

    // Si pas directeur/admin, restreindre à ses propres sessions
    if (user.role !== "directeur" && user.role !== "admin") {
      query = query.eq("user_id", user.userId);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error("[api/sessions:GET] Erreur lecture :", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sessions: sessions || [],
      count: sessions?.length || 0,
    });
  } catch (err: any) {
    console.error("[api/sessions:GET] Exception :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * DELETE /api/sessions
 * Déconnexion à distance d'un appareil / révocation de session
 * Paramètres : ?sessionId=... ou ?userId=...&all=true
 */
export async function DELETE(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const targetUserId = searchParams.get("userId");
    const revokeAll = searchParams.get("all") === "true";

    const supabaseAdmin = getServerSupabaseAdmin();

    // 1. Révocation d'une session spécifique
    if (sessionId) {
      const { data: session, error: fetchError } = await supabaseAdmin
        .from("user_sessions")
        .select("id, school_id, user_id, device_name, ip_address")
        .eq("id", sessionId)
        .eq("school_id", user.schoolId)
        .maybeSingle();

      if (fetchError || !session) {
        return NextResponse.json({ success: false, error: "Session introuvable dans votre établissement." }, { status: 404 });
      }

      // Seul le directeur/admin peut révoquer la session d'un tiers
      if (session.user_id !== user.userId && user.role !== "directeur" && user.role !== "admin") {
        return NextResponse.json({ success: false, error: "Vous n'avez pas le droit de déconnecter un autre utilisateur." }, { status: 403 });
      }

      const { error: updateError } = await supabaseAdmin
        .from("user_sessions")
        .update({
          is_revoked: true,
          revoked_at: new Date().toISOString(),
          revoked_by_user_id: user.userId,
        })
        .eq("id", sessionId);

      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }

      await recordAuditEvent({
        schoolId: user.schoolId,
        userId: user.userId,
        role: user.role,
        action: "DECONNEXION_SESSION_DISTANCE",
        resourceType: "user_sessions",
        resourceId: sessionId,
        newData: {
          targetUserId: session.user_id,
          deviceName: session.device_name,
          ip: session.ip_address,
        },
        req: request,
      });

      return NextResponse.json({
        success: true,
        message: "L'appareil a été déconnecté à distance avec succès.",
      });
    }

    // 2. Déconnexion de toutes les sessions d'un utilisateur cible (par le directeur)
    if (targetUserId && revokeAll) {
      if (user.role !== "directeur" && user.role !== "admin" && targetUserId !== user.userId) {
        return NextResponse.json({ success: false, error: "Droit d'administration requis." }, { status: 403 });
      }

      const { data: targetUser } = await supabaseAdmin
        .from("school_users")
        .select("id, email, full_name")
        .eq("id", targetUserId)
        .eq("school_id", user.schoolId)
        .maybeSingle();

      if (!targetUser) {
        return NextResponse.json({ success: false, error: "Utilisateur cible introuvable." }, { status: 404 });
      }

      const { error: revokeAllError } = await supabaseAdmin
        .from("user_sessions")
        .update({
          is_revoked: true,
          revoked_at: new Date().toISOString(),
          revoked_by_user_id: user.userId,
        })
        .eq("school_id", user.schoolId)
        .eq("user_id", targetUserId)
        .eq("is_revoked", false);

      if (revokeAllError) {
        return NextResponse.json({ success: false, error: revokeAllError.message }, { status: 500 });
      }

      await recordAuditEvent({
        schoolId: user.schoolId,
        userId: user.userId,
        role: user.role,
        action: "DECONNEXION_MASSIVE_SESSIONS",
        resourceType: "user_sessions",
        resourceId: targetUserId,
        newData: {
          targetUserEmail: targetUser.email,
          targetUserName: targetUser.full_name,
        },
        req: request,
      });

      return NextResponse.json({
        success: true,
        message: `Tous les appareils associés à ${targetUser.full_name} ont été déconnectés.`,
      });
    }

    return NextResponse.json({ success: false, error: "Paramètres sessionId ou userId manquants." }, { status: 400 });
  } catch (err: any) {
    console.error("[api/sessions:DELETE] Exception :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
