import { NextResponse } from "next/server";
import { getServerSupabaseAdmin } from "@/lib/server/supabase-admin";
import { SCHOOL_PLANS, PARENT_PLANS, SchoolPlanCode, ParentPlanCode } from "@/lib/subscription-plans";
import { createSasPayCheckoutSession } from "@/lib/server/saspay";

/**
 * POST /api/subscriptions/saspay/checkout
 * Initialise une session de paiement d'abonnement avec l'API officielle SasPay
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      entityType, // 'SCHOOL' | 'PARENT'
      planCode,
      schoolId,
      userId,
      customerEmail,
      customerName,
      customerPhone,
      previousPlan,
    } = body;

    if (!entityType || !["SCHOOL", "PARENT"].includes(entityType)) {
      return NextResponse.json(
        { success: false, error: "Le type d'abonnement (SCHOOL ou PARENT) est requis." },
        { status: 400 }
      );
    }

    if (!planCode) {
      return NextResponse.json(
        { success: false, error: "Le code du forfait sélectionné est requis." },
        { status: 400 }
      );
    }

    let planName = "";
    let priceFcfa = 0;

    if (entityType === "SCHOOL") {
      const plan = SCHOOL_PLANS[planCode as SchoolPlanCode];
      if (!plan) {
        return NextResponse.json(
          { success: false, error: `Forfait établissement inconnu : ${planCode}` },
          { status: 400 }
        );
      }
      planName = plan.name;
      priceFcfa = plan.priceFcfa;
    } else {
      const plan = PARENT_PLANS[planCode as ParentPlanCode];
      if (!plan) {
        return NextResponse.json(
          { success: false, error: `Forfait parent inconnu : ${planCode}` },
          { status: 400 }
        );
      }
      planName = plan.name;
      priceFcfa = plan.priceFcfa;
    }

    if (priceFcfa <= 0) {
      return NextResponse.json(
        { success: false, error: "Ce forfait est gratuit et ne nécessite aucun paiement en ligne." },
        { status: 400 }
      );
    }

    // Génération d'une référence unique de transaction
    const now = new Date();
    const randPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const paymentReference = `SAS-${entityType === "SCHOOL" ? "SCH" : "PAR"}-${datePart}-${randPart}`;

    // Construction de l'URL de retour client
    const appBaseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get("origin") ||
      "http://localhost:3000";

    const returnUrl =
      entityType === "SCHOOL"
        ? `${appBaseUrl}/directeur/abonnement?reference=${paymentReference}&status=success`
        : `${appBaseUrl}/parent/abonnement?reference=${paymentReference}&status=success`;

    const description = `Abonnement ${entityType === "SCHOOL" ? "Établissement" : "Parent"} : ${planName} (${priceFcfa} FCFA)`;

    // 1. Initialiser la session hébergée chez SasPay
    const saspayResult = await createSasPayCheckoutSession({
      amount: priceFcfa,
      currency: "XOF",
      description,
      customerEmail: customerEmail || undefined,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      returnUrl,
      reference: paymentReference,
      metadata: {
        entityType,
        planCode,
        schoolId,
        userId,
        paymentReference,
      },
    });

    if (!saspayResult.success || !saspayResult.checkoutUrl) {
      return NextResponse.json(
        {
          success: false,
          error: saspayResult.error || "Impossible d'initialiser la session de paiement SasPay.",
        },
        { status: 502 }
      );
    }

    // 2. Enregistrement de la transaction en base Supabase (statut PENDING)
    const supabaseAdmin = getServerSupabaseAdmin();

    const validFrom = now.toISOString().split("T")[0];
    const validUntilDate = new Date(now);
    validUntilDate.setMonth(validUntilDate.getMonth() + 1);
    const validUntil = validUntilDate.toISOString().split("T")[0];

    try {
      // Table subscription_transactions
      await supabaseAdmin.from("subscription_transactions").insert({
        entity_type: entityType,
        entity_id: schoolId || userId || "00000000-0000-0000-0000-000000000000",
        plan_code: planCode,
        amount_fcfa: priceFcfa,
        payment_method: "SASPAY",
        receipt_reference: paymentReference,
        previous_plan: previousPlan || null,
        new_plan: planCode,
        valid_from: validFrom,
        valid_until: validUntil,
        created_by: userId || null,
      });

      // Table school_payments unifiée
      if (schoolId) {
        await supabaseAdmin.from("school_payments").insert({
          school_id: schoolId,
          parent_user_id: entityType === "PARENT" ? userId : null,
          payment_reference: paymentReference,
          amount_fcfa: priceFcfa,
          payment_type: "SUBSCRIPTION",
          payment_method: "MOBILE_MONEY",
          status: "PENDING",
          purpose: description,
          notes: `Session SasPay ID : ${saspayResult.sessionId || "N/A"}`,
          metadata: {
            saspay_session_id: saspayResult.sessionId,
            entity_type: entityType,
            plan_code: planCode,
          },
        });
      }
    } catch (dbErr) {
      console.warn("[api/subscriptions/saspay/checkout] Avertissement écriture DB :", dbErr);
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: saspayResult.checkoutUrl,
      sessionId: saspayResult.sessionId,
      paymentReference,
      amount: priceFcfa,
      planName,
    });
  } catch (err: any) {
    console.error("[api/subscriptions/saspay/checkout] Exception :", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de la préparation du paiement." },
      { status: 500 }
    );
  }
}
