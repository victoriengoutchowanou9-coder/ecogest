import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSupabaseAdmin } from "@/lib/server/supabase-admin";
import { recordAuditEvent } from "@/lib/server/audit-logger";

// Clé secrète de webhook serveur (jamais exposée au front-end)
const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || "dev_payment_secret_sign_educo_2026";

/**
 * Vérification cryptographique HMAC-SHA256 de la signature du webhook
 */
function verifyWebhookSignature(payload: string, receivedSignature: string | null): boolean {
  if (!receivedSignature) return false;
  try {
    const computedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(computedSignature, "utf8"),
      Buffer.from(receivedSignature.trim(), "utf8")
    );
  } catch (e) {
    return false;
  }
}

/**
 * POST /api/payments/webhook
 * Traitement hautement sécurisé des notifications de paiement externes.
 * RÈGLE : Confirmation UNIQUEMENT via webhook vérifié avec signature serveur, jamais depuis le client.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get("x-webhook-signature") ||
      request.headers.get("x-fedapay-signature") ||
      request.headers.get("x-signature");

    // 1. Vérification stricte de la signature
    const isValidSignature = verifyWebhookSignature(rawBody, signature);
    if (!isValidSignature) {
      console.warn("[PaymentWebhook] Rejet : Signature HMAC invalide ou absente.");
      return NextResponse.json(
        { success: false, error: "Signature de webhook invalide ou non autorisée." },
        { status: 401 }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: "Corps JSON invalide." }, { status: 400 });
    }

    const {
      paymentReference,
      status: externalStatus,
      transactionId,
      amount,
      metadata,
    } = payload;

    if (!paymentReference) {
      return NextResponse.json(
        { success: false, error: "La référence de paiement est obligatoire." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getServerSupabaseAdmin();

    // 2. Recherche du paiement en base
    const { data: existingPayment, error: fetchError } = await supabaseAdmin
      .from("school_payments")
      .select("*")
      .eq("payment_reference", paymentReference)
      .maybeSingle();

    if (fetchError || !existingPayment) {
      return NextResponse.json(
        { success: false, error: "Paiement introuvable pour cette référence." },
        { status: 404 }
      );
    }

    // 3. Si le paiement est déjà confirmé, réponse idempotente sans modification
    if (existingPayment.status === "PAID") {
      return NextResponse.json({
        success: true,
        message: "Paiement déjà confirmé précédemment.",
      });
    }

    // 4. Déterminer le statut final selon l'opérateur
    const isPaymentApproved =
      externalStatus === "APPROVED" ||
      externalStatus === "SUCCESS" ||
      externalStatus === "PAID" ||
      externalStatus === "successful";

    const targetStatus = isPaymentApproved ? "PAID" : "CANCELLED";

    const updatePayload: Record<string, any> = {
      status: targetStatus,
      verified_via_webhook: true,
      webhook_signature: signature?.slice(0, 32) + "...",
      updated_at: new Date().toISOString(),
    };

    if (isPaymentApproved) {
      updatePayload.confirmed_at = new Date().toISOString();
    }

    const { data: updatedPayment, error: updateError } = await supabaseAdmin
      .from("school_payments")
      .update(updatePayload)
      .eq("id", existingPayment.id)
      .select()
      .single();

    if (updateError) {
      console.error("[PaymentWebhook] Erreur mise à jour :", updateError);
      return NextResponse.json(
        { success: false, error: "Erreur lors de la mise à jour du paiement." },
        { status: 500 }
      );
    }

    // 5. Journalisation d'audit formelle
    await recordAuditEvent({
      schoolId: existingPayment.school_id,
      userId: existingPayment.created_by_user_id || undefined,
      role: "webhook_service",
      action: isPaymentApproved ? "WEBHOOK_PAIEMENT_CONFIRME" : "WEBHOOK_PAIEMENT_ECHOUE",
      resourceType: "payments",
      resourceId: existingPayment.id,
      oldData: { status: existingPayment.status },
      newData: {
        paymentReference,
        status: targetStatus,
        transactionId,
        amount: amount || existingPayment.amount_fcfa,
        confirmedAt: updatePayload.confirmed_at,
      },
      req: request,
    });

    return NextResponse.json({
      success: true,
      message: `Paiement ${paymentReference} mis à jour avec le statut ${targetStatus}.`,
      paymentId: updatedPayment.id,
    });
  } catch (err: any) {
    console.error("[PaymentWebhook] Exception non gérée :", err);
    return NextResponse.json(
      { success: false, error: "Erreur interne lors du traitement du webhook." },
      { status: 500 }
    );
  }
}
