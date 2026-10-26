import { NextResponse } from "next/server";
import { requireServerUserContext, getServerSupabaseAdmin } from "@/lib/server/supabase-admin";
import { sendSchoolNotificationEmail } from "@/lib/server/email";

/**
 * GET /api/notifications
 * Récupère les notifications in-app de l'utilisateur connecté (persistantes pour les déconnectés)
 */
export async function GET(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get("type");

    const supabaseAdmin = getServerSupabaseAdmin();

    let query = supabaseAdmin
      .from("user_notifications")
      .select("id, school_id, user_id, title, message, type, link, student_id, student_name, class_id, is_read, read_at, created_at")
      .eq("user_id", user.userId)
      .eq("school_id", user.schoolId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (filterType && filterType !== "ALL") {
      query = query.eq("type", filterType);
    }

    const { data: notifications, error } = await query;
    if (error) {
      console.error("[api/notifications:GET] Erreur:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const unreadCount = (notifications || []).filter((n) => !n.is_read).length;

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      unreadCount,
    });
  } catch (err: any) {
    console.error("[api/notifications:GET] Exception:", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * PATCH /api/notifications
 * Marque une ou toutes les notifications comme lues pour l'utilisateur connecté
 */
export async function PATCH(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;
    const body = await request.json();
    const { id, all } = body;

    const supabaseAdmin = getServerSupabaseAdmin();
    const now = new Date().toISOString();

    if (all) {
      const { error } = await supabaseAdmin
        .from("user_notifications")
        .update({ is_read: true, read_at: now })
        .eq("user_id", user.userId)
        .eq("school_id", user.schoolId)
        .eq("is_read", false);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "Toutes les notifications sont marquées comme lues." });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Identifiant de la notification requis." }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("user_notifications")
      .update({ is_read: true, read_at: now })
      .eq("id", id)
      .eq("user_id", user.userId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Notification marquée comme lue." });
  } catch (err: any) {
    console.error("[api/notifications:PATCH] Exception:", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * POST /api/notifications
 * Déclenchement d'une notification événementielle (ex: note officiellement publiée, bulletin publié)
 * Ne s'exécute que pour les utilisateurs autorisés (direction, censeur, enseignants).
 * Déduplication automatique via source_event_id.
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
      type,
      title,
      message,
      link,
      studentId,
      studentName,
      classId,
      periodId,
      sourceEventId,
    } = body;

    if (!title || !message || !type) {
      return NextResponse.json({ success: false, error: "Paramètres obligatoires manquants." }, { status: 400 });
    }

    const supabaseAdmin = getServerSupabaseAdmin();

    // Trouver le(s) parent(s) légalement et explicitement rattachés à cet élève
    let targetParentUserIds: string[] = [];

    if (studentId) {
      const { data: links } = await supabaseAdmin
        .from("parent_student_links")
        .select("parent_user_id, status")
        .eq("school_id", user.schoolId)
        .eq("student_id", studentId)
        .eq("status", "VALIDATED");

      if (links && links.length > 0) {
        targetParentUserIds = links.map((l: any) => l.parent_user_id);
      }
    } else if (classId) {
      const { data: classStudents } = await supabaseAdmin
        .from("students")
        .select("id")
        .eq("school_id", user.schoolId)
        .eq("class_id", classId);

      const studentIds = (classStudents || []).map((s: any) => s.id);
      if (studentIds.length > 0) {
        const { data: links } = await supabaseAdmin
          .from("parent_student_links")
          .select("parent_user_id")
          .eq("school_id", user.schoolId)
          .in("student_id", studentIds)
          .eq("status", "VALIDATED");

        if (links && links.length > 0) {
          targetParentUserIds = Array.from(new Set(links.map((l: any) => l.parent_user_id)));
        }
      }
    }

    const eventKey = sourceEventId || `${type}-${studentId || classId || "event"}-${periodId || Date.now()}`;

    // Si des parents sont trouvés, créer les notifications
    if (targetParentUserIds.length > 0) {
      const notifications = targetParentUserIds.map((parentId) => ({
        school_id: user.schoolId,
        user_id: parentId,
        recipient_role: "parent",
        title,
        message,
        type,
        link: link || "/parent/notes",
        source_event_id: `${parentId}-${eventKey}`,
        student_id: studentId || null,
        student_name: studentName || null,
        class_id: classId || null,
        is_read: false,
      }));

      await supabaseAdmin
        .from("user_notifications")
        .upsert(notifications, { onConflict: "user_id,source_event_id", ignoreDuplicates: true });

      // Envoi d'email discret invitant à se connecter
      for (const parentId of targetParentUserIds) {
        const { data: parentUser } = await supabaseAdmin
          .from("school_users")
          .select("email, full_name")
          .eq("id", parentId)
          .single();

        if (parentUser && parentUser.email) {
          sendSchoolNotificationEmail({
            toEmail: parentUser.email,
            recipientName: parentUser.full_name,
            schoolName: "Établissement Scolaire",
            title,
            summary: message,
            category: type === "BULLETIN_PUBLIE" ? "BULLETIN" : type === "NOTE_PUBLIEE" ? "NOTE" : "SCOLARITE",
            ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://ecogest.vercel.app"}/parent/notes`,
            ctaText: "Consulter sur mon espace sécurisé",
          }).catch((e) => console.warn("[Email Notification]:", e));
        }
      }
    }

    return NextResponse.json({ success: true, message: "Notifications traitées avec succès." });
  } catch (err: any) {
    console.error("[api/notifications:POST] Exception:", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
