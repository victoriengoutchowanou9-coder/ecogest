import { NextResponse } from "next/server";
import { getServerSupabaseAdmin } from "@/lib/server/supabase-admin";
import { getSasPaySessionStatus } from "@/lib/server/saspay";

/**
 * GET /api/subscriptions/saspay/verify?reference=...&sessionId=...
 * Vérification instantanée côté serveur lors du retour du client sur la page d'abonnement
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");
    const sessionId = searchParams.get("sessionId");

    if (!reference && !sessionId) {
      return NextResponse.json(
        { success: false, error: "La référence ou l'ID de session est requis." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getServerSupabaseAdmin();

    // 1. Recherche dans la base de données
    let query = supabaseAdmin.from("school_payments").select("*");
    if (reference) {
      query = query.eq("payment_reference", reference);
    } else if (sessionId) {
      query = query.filter("metadata->>saspay_session_id", "eq", sessionId);
    }

    const { data: paymentRecord } = await query.maybeSingle();

    // Si le paiement est déjà validé par le webhook en base
    if (paymentRecord && paymentRecord.status === "PAID") {
      return NextResponse.json({
        success: true,
        status: "PAID",
        paymentReference: paymentRecord.payment_reference,
        amount: paymentRecord.amount_fcfa,
        entityType: paymentRecord.metadata?.entity_type,
        planCode: paymentRecord.metadata?.plan_code,
      });
    }

    // 2. Si encore PENDING ou introuvable, interroger directement l'API SasPay
    const targetSessionId = sessionId || paymentRecord?.metadata?.saspay_session_id;

    if (targetSessionId) {
      const saspayStatus = await getSasPaySessionStatus(targetSessionId);

      if (saspayStatus.success && saspayStatus.status === "PAID") {
        const nowIso = new Date().toISOString();

        // Mettre à jour la table school_payments
        if (paymentRecord) {
          await supabaseAdmin
            .from("school_payments")
            .update({
              status: "PAID",
              confirmed_at: nowIso,
              updated_at: nowIso,
            })
            .eq("id", paymentRecord.id);

          // Activer l'abonnement en base
          const entityType = paymentRecord.metadata?.entity_type;
          const planCode = paymentRecord.metadata?.plan_code;
          const schoolId = paymentRecord.school_id;
          const parentUserId = paymentRecord.parent_user_id;

          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          const expiresAt = nextMonth.toISOString().split("T")[0];

          if (entityType === "SCHOOL" && schoolId) {
            await supabaseAdmin
              .from("school_subscriptions")
              .update({
                plan_type: planCode,
                status: "ACTIVE",
                price_fcfa: paymentRecord.amount_fcfa,
                expires_at: expiresAt,
                updated_at: nowIso,
              })
              .eq("school_id", schoolId);
          } else if (entityType === "PARENT" && parentUserId && schoolId) {
            await supabaseAdmin
              .from("parent_subscriptions")
              .update({
                plan_type: planCode,
                status: "ACTIVE",
                price_fcfa: paymentRecord.amount_fcfa,
                expires_at: expiresAt,
                updated_at: nowIso,
              })
              .eq("parent_user_id", parentUserId)
              .eq("school_id", schoolId);
          }
        }

        return NextResponse.json({
          success: true,
          status: "PAID",
          verifiedViaSasPayApi: true,
          paymentReference: reference || paymentRecord?.payment_reference,
          amount: paymentRecord?.amount_fcfa || saspayStatus.amount,
          entityType: paymentRecord?.metadata?.entity_type,
          planCode: paymentRecord?.metadata?.plan_code,
        });
      }

      return NextResponse.json({
        success: true,
        status: saspayStatus.status,
        rawStatus: saspayStatus.rawStatus,
        paymentReference: reference,
      });
    }

    return NextResponse.json({
      success: true,
      status: paymentRecord?.status || "PENDING",
      paymentReference: reference,
    });
  } catch (err: any) {
    console.error("[api/subscriptions/saspay/verify] Exception :", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de la vérification de transaction." },
      { status: 500 }
    );
  }
}
