import { NextResponse } from "next/server";
import { requireServerUserContext, getServerSupabaseAdmin } from "@/lib/server/supabase-admin";
import { assertRolePermission } from "@/lib/server/permissions-matrix";
import { recordAuditEvent } from "@/lib/server/audit-logger";

/**
 * GET /api/payments
 * Liste sécurisée des paiements et avoirs de l'établissement
 */
export async function GET(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    try {
      assertRolePermission(user, "payments", "read");
    } catch (permErr: any) {
      return NextResponse.json({ success: false, error: permErr.message }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");

    const supabaseAdmin = getServerSupabaseAdmin();
    let query = supabaseAdmin
      .from("school_payments")
      .select("*, students(matricule, first_name, last_name)")
      .eq("school_id", user.schoolId)
      .order("created_at", { ascending: false });

    if (studentId) {
      query = query.eq("student_id", studentId);
    }
    if (status) {
      query = query.eq("status", status);
    }

    // Si parent, filtrer uniquement ses propres enfants
    if (user.role === "parent") {
      query = query.eq("parent_user_id", user.userId);
    }

    const { data: payments, error } = await query;

    if (error) {
      console.error("[api/payments:GET] Erreur lecture :", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, payments: payments || [] });
  } catch (err: any) {
    console.error("[api/payments:GET] Exception :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * POST /api/payments
 * Enregistrement d'un paiement guichet (espèces/chèque) ou émission d'un Avoir comptable.
 * RÈGLE : Un paiement confirmé ne peut être modifié, seul un avoir de correction peut être émis.
 */
export async function POST(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    try {
      assertRolePermission(user, "payments", "create");
    } catch (permErr: any) {
      return NextResponse.json({ success: false, error: permErr.message }, { status: 403 });
    }

    const body = await request.json();
    const {
      isCreditNote = false,
      originalPaymentId,
      studentId,
      amountFcfa,
      paymentMethod = "CASH",
      purpose = "Frais de scolarité",
      notes,
      parentUserId,
    } = body;

    const supabaseAdmin = getServerSupabaseAdmin();

    // 1. CAS AVOIR COMPTABLE (Correction d'un paiement confirmé erroné)
    if (isCreditNote) {
      if (!originalPaymentId) {
        return NextResponse.json(
          { success: false, error: "L'identifiant du paiement d'origine est requis pour émettre un avoir." },
          { status: 400 }
        );
      }

      const { data: origPayment, error: origError } = await supabaseAdmin
        .from("school_payments")
        .select("*")
        .eq("id", originalPaymentId)
        .eq("school_id", user.schoolId)
        .maybeSingle();

      if (origError || !origPayment) {
        return NextResponse.json(
          { success: false, error: "Paiement d'origine introuvable dans cet établissement." },
          { status: 404 }
        );
      }

      if (origPayment.status !== "PAID") {
        return NextResponse.json(
          { success: false, error: "Un avoir ne peut être émis que sur un paiement déjà confirmé ('PAID')." },
          { status: 400 }
        );
      }

      const creditAmount = -Math.abs(amountFcfa || origPayment.amount_fcfa);
      const creditRef = `AVOIR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      const { data: creditNote, error: creditError } = await supabaseAdmin
        .from("school_payments")
        .insert({
          school_id: user.schoolId,
          student_id: origPayment.student_id,
          parent_user_id: origPayment.parent_user_id,
          payment_reference: creditRef,
          amount_fcfa: creditAmount,
          payment_type: "AVOIR_CORRECTION",
          payment_method: origPayment.payment_method,
          status: "PAID",
          is_credit_note: true,
          original_payment_id: origPayment.id,
          purpose: `Avoir correctif : ${purpose}`,
          notes: notes || `Correction comptable du paiement ${origPayment.payment_reference}`,
          confirmed_at: new Date().toISOString(),
          created_by_user_id: user.userId,
        })
        .select()
        .single();

      if (creditError) {
        console.error("[api/payments:POST] Erreur émission avoir :", creditError);
        return NextResponse.json({ success: false, error: creditError.message }, { status: 500 });
      }

      await recordAuditEvent({
        schoolId: user.schoolId,
        userId: user.userId,
        role: user.role,
        action: "EMISSION_AVOIR_COMPTABLE",
        resourceType: "payments",
        resourceId: creditNote.id,
        newData: {
          creditRef,
          originalPaymentId: origPayment.id,
          originalPaymentRef: origPayment.payment_reference,
          creditAmount,
          reason: notes,
        },
        req: request,
      });

      return NextResponse.json({
        success: true,
        message: "Avoir comptable émis avec succès pour rectifier l'écriture financière.",
        payment: creditNote,
      });
    }

    // 2. CAS ENCAISSEMENT STANDARD (Guichet ou initialisation)
    const numericAmount = Number(amountFcfa);
    if (!numericAmount || numericAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Le montant du paiement doit être supérieur à zéro." },
        { status: 400 }
      );
    }

    const paymentRef = `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptNum = `RC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const isDirectCash = paymentMethod === "CASH" || paymentMethod === "CHEQUE";
    const initialStatus = isDirectCash ? "PAID" : "PENDING";

    const { data: newPayment, error: insertError } = await supabaseAdmin
      .from("school_payments")
      .insert({
        school_id: user.schoolId,
        student_id: studentId || null,
        parent_user_id: parentUserId || null,
        payment_reference: paymentRef,
        amount_fcfa: numericAmount,
        payment_type: "TUITION",
        payment_method: paymentMethod,
        status: initialStatus,
        is_credit_note: false,
        purpose,
        receipt_number: receiptNum,
        notes,
        confirmed_at: isDirectCash ? new Date().toISOString() : null,
        created_by_user_id: user.userId,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[api/payments:POST] Erreur enregistrement :", insertError);
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    await recordAuditEvent({
      schoolId: user.schoolId,
      userId: user.userId,
      role: user.role,
      action: isDirectCash ? "ENCAISSEMENT_GUICHET" : "INITIATION_PAIEMENT",
      resourceType: "payments",
      resourceId: newPayment.id,
      newData: {
        paymentReference: paymentRef,
        amountFcfa: numericAmount,
        paymentMethod,
        status: initialStatus,
        receiptNumber: receiptNum,
        studentId,
      },
      req: request,
    });

    return NextResponse.json({
      success: true,
      message: isDirectCash ? "Paiement en espèces encaissé et certifié." : "Paiement initié en attente de confirmation.",
      payment: newPayment,
    });
  } catch (err: any) {
    console.error("[api/payments:POST] Exception :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
