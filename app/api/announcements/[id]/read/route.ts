import { NextResponse } from "next/server";
import { requireServerUserContext, getServerSupabaseAdmin } from "@/lib/server/supabase-admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/announcements/[id]/read
 * Marque une annonce comme lue par l'utilisateur connecté
 */
export async function POST(request: Request, context: RouteParams) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;
    const { id: announcementId } = await context.params;

    const supabaseAdmin = getServerSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from("announcement_reads")
      .upsert(
        {
          announcement_id: announcementId,
          user_id: user.userId,
          school_id: user.schoolId,
          read_at: new Date().toISOString(),
        },
        { onConflict: "announcement_id,user_id", ignoreDuplicates: true }
      );

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Annonce marquée comme lue." });
  } catch (err: any) {
    console.error("[api/announcements/[id]/read] Exception:", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
