import { NextResponse } from "next/server";
import { getServerSupabaseAdmin } from "@/lib/server/supabase-admin";
import { recordAuditEvent } from "@/lib/server/audit-logger";
import { verifySasPayWebhookSignature, getSasPayWebhookSecret } from "@/lib/server/saspay";

/**
 * POST /api/subscriptions/saspay/webhook
 * Traitement sécurisé des notifications de paiement d'abonnements envoyées par SasPay.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    const signature =
      request.headers.get("x-signature") ||
      request.headers.get("x-signature-256") ||
      request.headers.get("x-saspay-signature") ||
      request.headers.get("x-webhook-signature");

    const timestamp =
      request.headers.get("x-timestamp") ||
      request.headers.get("x-saspay-timestamp");

    // 1. Vérification de la signature cryptographique si le secret est configuré
    const webhookSecret = getSasPayWebhookSecret();
    if (webhookSecret) {
      const isValid = verifySasPayWebhookSignature({
        rawBody,
        receivedSignature: signature,
        timestamp,
      });

      if (!isValid) {
        console.warn("[SasPay:Webhook] Signature cryptographique invalide ou non reconnue.");
        return NextResponse.json(
          { success: false, error: "Signature de webhook SasPay invalide." },
          { status: 401 }
        );
      }
    } else {
      console.warn(
        "[SasPay:Webhook] Avertissement: SASPAY_WEBHOOK_SECRET non configuré. Pensez à le définir dans .env.local."
      );
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: "Corps JSON invalide." }, { status: 400 });
    }

    // Extraction des données de l'événement SasPay
    // Structure SasPay : { event: "transaction.success", data: { id, reference, status, metadata, ... } }
    const eventType = (payload.event || payload.type || "").toLowerCase();
    const eventData = payload.data || payload;

    const paymentReference =
      eventData.reference ||
      eventData.payment_reference ||
      eventData.metadata?.paymentReference ||
      payload.reference;

    const externalStatus = (eventData.status || payload.status || "").toUpperCase();
    const sessionId = eventData.checkout_session_id || eventData.session_id || eventData.id;

    if (!paymentReference && !sessionId) {
      return NextResponse.json(
        { success: false, error: "Référence ou identifiant de session manquant." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getServerSupabaseAdmin();

    // 2. Recherche de la transaction en base
    let query = supabaseAdmin.from("school_payments").select("*");
    if (paymentReference) {
      query = query.eq("payment_reference", paymentReference);
    } else {
      query = query.filter("metadata->>saspay_session_id", "eq", sessionId);
    }

    const { data: paymentRecord, error: searchErr } = await query.maybeSingle();

    if (searchErr || !paymentRecord) {
      console.warn(
        `[SasPay:Webhook] Transaction introuvable pour réf: ${paymentReference || sessionId}`
      );
      // Réponse 200 pour éviter que SasPay ne réessaye indéfiniment si la transaction est inconnue
      return NextResponse.json({ success: true, message: "Transaction non répertoriée." });
    }

    // 3. Idempotence : si le paiement est déjà confirmé, ne pas ré-exécuter
    if (paymentRecord.status === "PAID") {
      return NextResponse.json({
        success: true,
        message: "Paiement déjà validé et confirmé précédemment.",
      });
    }

    const isSuccess =
      eventType.includes("success") ||
      ["SUCCESS", "PAID", "CONFIRMED", "COMPLETED"].includes(externalStatus);

    const isFailure =
      eventType.includes("failed") ||
      eventType.includes("cancelled") ||
      ["FAILED", "DECLINED", "CANCELLED", "CANCELED"].includes(externalStatus);

    const targetStatus = isSuccess ? "PAID" : isFailure ? "CANCELLED" : "PENDING";

    // 4. Mise à jour de la table school_payments
    const nowIso = new Date().toISOString();
    const updatePayload: Record<string, any> = {
      status: targetStatus,
      verified_via_webhook: true,
      webhook_signature: signature ? `${signature.slice(0, 30)}...` : "VERIFIED_SASPAY",
      updated_at: nowIso,
    };

    if (isSuccess) {
      updatePayload.confirmed_at = nowIso;
    }

    await supabaseAdmin
      .from("school_payments")
      .update(updatePayload)
      .eq("id", paymentRecord.id);

    // 5. Activation de l'abonnement en base si le paiement a réussi
    if (isSuccess) {
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

      // Enregistrement d'audit
      await recordAuditEvent({
        schoolId: paymentRecord.school_id,
        userId: paymentRecord.parent_user_id || undefined,
        role: "saspay_webhook",
        action: "ABONNEMENT_CONFIRME_SASPAY",
        resourceType: "school_payments",
        resourceId: paymentRecord.id,
        oldData: { status: "PENDING" },
        newData: {
          status: "PAID",
          amount: paymentRecord.amount_fcfa,
          plan: planCode,
          reference: paymentRecord.payment_reference,
        },
        req: request,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Abonnement traité avec succès (Statut : ${targetStatus}).`,
      paymentId: paymentRecord.id,
    });
  } catch (err: any) {
    console.error("[SasPay:Webhook] Exception :", err);
    return NextResponse.json(
      { success: false, error: "Erreur interne lors du traitement du webhook SasPay." },
      { status: 500 }
    );
  }
}
