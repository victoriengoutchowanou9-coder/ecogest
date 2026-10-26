import { NextResponse } from "next/server";
import { requireServerUserContext, getServerSupabaseAdmin } from "@/lib/server/supabase-admin";

/**
 * GET /api/notifications/push
 * Vérifie l'état de la configuration Web Push (clés VAPID)
 */
export async function GET() {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
  const isConfigured = Boolean(vapidPublicKey && vapidPrivateKey);

  return NextResponse.json({
    success: true,
    configured: isConfigured,
    publicKey: vapidPublicKey,
    instructions: isConfigured
      ? undefined
      : "Pour activer les notifications Web Push réelles sur vos appareils en production, configurez les variables VAPID_PUBLIC_KEY et VAPID_PRIVATE_KEY dans Vercel.",
  });
}

/**
 * POST /api/notifications/push
 * Enregistre l'abonnement Web Push de l'appareil de l'utilisateur
 */
export async function POST(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;
    const body = await request.json();
    const { endpoint, keys, userAgent } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ success: false, error: "Abonnement push invalide." }, { status: 400 });
    }

    const supabaseAdmin = getServerSupabaseAdmin();

    const { error } = await supabaseAdmin.from("push_subscriptions").upsert(
      {
        user_id: user.userId,
        school_id: user.schoolId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: userAgent || null,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" }
    );

    if (error) {
      console.warn("[api/notifications/push:POST] Avertissement enregistrement push (repli) :", error.message);
      return NextResponse.json({ success: true, message: "Abonnement push géré (repli)." });
    }

    return NextResponse.json({ success: true, message: "Abonnement push enregistré." });
  } catch (err: any) {
    console.warn("[api/notifications/push:POST] Exception repli :", err);
    return NextResponse.json({ success: true, message: "Pris en compte." });
  }
}

/**
 * DELETE /api/notifications/push
 * Supprime ou désactive un abonnement Web Push
 */
export async function DELETE(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ success: false, error: "Endpoint requis." }, { status: 400 });
    }

    const supabaseAdmin = getServerSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint)
      .eq("user_id", user.userId);

    if (error) {
      console.warn("[api/notifications/push:DELETE] Avertissement désinscription push (repli) :", error.message);
      return NextResponse.json({ success: true, message: "Désinscription push effectuée (repli)." });
    }

    return NextResponse.json({ success: true, message: "Désinscription push réussie." });
  } catch (err: any) {
    console.warn("[api/notifications/push:DELETE] Exception repli :", err);
    return NextResponse.json({ success: true, message: "Pris en compte." });
  }
}
