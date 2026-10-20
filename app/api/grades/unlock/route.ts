import { NextResponse } from "next/server";
import { requireServerUserContext, getServerSupabaseAdmin } from "@/lib/server/supabase-admin";
import { assertRolePermission } from "@/lib/server/permissions-matrix";
import { recordAuditEvent } from "@/lib/server/audit-logger";

/**
 * POST /api/grades/unlock
 * Déverrouille formellement la modification d'une note ou d'un bulletin validé
 * Réservé exclusivement au Directeur et au Censeur des études.
 * Motif obligatoire (minimum 10 caractères) tracé dans le journal d'audit.
 */
export async function POST(request: Request) {
  try {
    const contextResult = await requireServerUserContext(request);
    if (!contextResult.success) {
      return NextResponse.json(
        { success: false, error: contextResult.error },
        { status: contextResult.status }
      );
    }

    const { user } = contextResult;

    // Vérification stricte du rôle
    try {
      assertRolePermission(user, "grades", "unlock");
    } catch (permErr: any) {
      return NextResponse.json(
        { success: false, error: permErr.message },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { studentId, periodId, subjectId, reason, durationHours = 24 } = body;

    if (!studentId || !periodId) {
      return NextResponse.json(
        { success: false, error: "L'identifiant de l'élève et la période sont obligatoires." },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== "string" || reason.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Un motif formel et circonstancié est obligatoire (minimum 10 caractères) pour déverrouiller une note après validation.",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = getServerSupabaseAdmin();

    // Vérification que l'élève appartient bien à l'école de l'utilisateur
    const { data: student, error: studentError } = await supabaseAdmin
      .from("students")
      .select("id, matricule, first_name, last_name, school_id")
      .eq("id", studentId)
      .eq("school_id", user.schoolId)
      .maybeSingle();

    if (studentError || !student) {
      return NextResponse.json(
        { success: false, error: "Élève introuvable dans votre établissement." },
        { status: 404 }
      );
    }

    const expiresAt = new Date(Date.now() + durationHours * 3600 * 1000).toISOString();

    // Insertion de l'autorisation de déverrouillage
    const { data: unlockRecord, error: unlockError } = await supabaseAdmin
      .from("grade_unlock_authorizations")
      .insert({
        school_id: user.schoolId,
        student_id: studentId,
        period_id: periodId,
        subject_id: subjectId || null,
        unlocked_by_user_id: user.userId,
        unlocked_by_role: user.role,
        reason: reason.trim(),
        expires_at: expiresAt,
        is_revoked: false,
      })
      .select()
      .single();

    if (unlockError) {
      console.error("[api/grades/unlock] Erreur insertion autorisation :", unlockError);
      return NextResponse.json(
        { success: false, error: "Impossible d'enregistrer l'autorisation de déverrouillage." },
        { status: 500 }
      );
    }

    // Journalisation d'audit explicite
    await recordAuditEvent({
      schoolId: user.schoolId,
      userId: user.userId,
      role: user.role,
      action: "DEVERROUILLAGE_NOTES",
      resourceType: "grades",
      resourceId: studentId,
      newData: {
        unlockId: unlockRecord?.id,
        studentMatricule: student.matricule,
        studentName: `${student.first_name} ${student.last_name}`,
        periodId,
        subjectId: subjectId || "ALL",
        reason: reason.trim(),
        expiresAt,
      },
      req: request,
    });

    return NextResponse.json({
      success: true,
      message: "Déverrouillage autorisé pour une durée temporaire. La traçabilité a été enregistrée.",
      authorization: unlockRecord,
    });
  } catch (err: any) {
    console.error("[api/grades/unlock] Exception non gérée :", err);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur lors du déverrouillage." },
      { status: 500 }
    );
  }
}
