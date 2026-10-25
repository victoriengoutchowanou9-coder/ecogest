import { NextResponse } from "next/server";
import { requireServerUserContext, getServerSupabaseAdmin } from "@/lib/server/supabase-admin";

/**
 * GET /api/notifications/preferences
 * Récupère les préférences de notification de l'utilisateur connecté
 */
export async function GET(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    const supabaseAdmin = getServerSupabaseAdmin();

    const { data: prefs, error } = await supabaseAdmin
      .from("user_notification_preferences")
      .select("*")
      .eq("user_id", user.userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const defaultPreferences = {
      userId: user.userId,
      schoolId: user.schoolId,
      pushEnabled: true,
      emailEnabled: true,
      notifyGrades: true,
      notifyBulletins: true,
      notifyAnnouncements: true,
      notifyAttendance: true,
    };

    return NextResponse.json({
      success: true,
      preferences: prefs || defaultPreferences,
    });
  } catch (err: any) {
    console.error("[api/notifications/preferences:GET] Exception:", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * POST /api/notifications/preferences
 * Met à jour les préférences de notification de l'utilisateur
 */
export async function POST(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;
    const body = await request.json();

    const {
      pushEnabled = true,
      emailEnabled = true,
      notifyGrades = true,
      notifyBulletins = true,
      notifyAnnouncements = true,
      notifyAttendance = true,
    } = body;

    const supabaseAdmin = getServerSupabaseAdmin();

    const { data: updated, error } = await supabaseAdmin
      .from("user_notification_preferences")
      .upsert({
        user_id: user.userId,
        school_id: user.schoolId,
        push_enabled: pushEnabled,
        email_enabled: emailEnabled,
        notify_grades: notifyGrades,
        notify_bulletins: notifyBulletins,
        notify_announcements: notifyAnnouncements,
        notify_attendance: notifyAttendance,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, preferences: updated });
  } catch (err: any) {
    console.error("[api/notifications/preferences:POST] Exception:", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
