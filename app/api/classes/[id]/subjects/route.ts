import { NextResponse } from "next/server";
import { requireServerUserContext, getServerSupabaseAdmin } from "@/lib/server/supabase-admin";
import { recordAuditEvent } from "@/lib/server/audit-logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/classes/[id]/subjects
 * Récupère les matières enseignées dans cette classe.
 */
export async function GET(request: Request, context: RouteParams) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;
    const { id: classId } = await context.params;

    const supabaseAdmin = getServerSupabaseAdmin();

    // Vérifier l'accès à la classe
    const { data: classroom, error: classErr } = await supabaseAdmin
      .from("classrooms")
      .select("id, name, cycle, school_id, primary_teacher_id")
      .eq("id", classId)
      .eq("school_id", user.schoolId)
      .single();

    if (classErr || !classroom) {
      return NextResponse.json({ success: false, error: "Classe introuvable dans votre établissement." }, { status: 404 });
    }

    // Si l'utilisateur est un enseignant et que c'est une classe primaire, vérifier qu'il en est bien le responsable
    if (user.role === "enseignant" && classroom.cycle === "PRIMAIRE") {
      if (classroom.primary_teacher_id && classroom.primary_teacher_id !== user.userId) {
        return NextResponse.json(
          { success: false, error: "Accès refusé : vous n'êtes pas le maître responsable de cette classe primaire." },
          { status: 403 }
        );
      }
    }

    const { data: subjects, error: subjErr } = await supabaseAdmin
      .from("subjects")
      .select("id, code, name, coef, category, order_num, is_conduite, is_active, created_at")
      .eq("school_id", user.schoolId)
      .eq("class_id", classId)
      .eq("is_active", true)
      .order("order_num", { ascending: true });

    if (subjErr) {
      return NextResponse.json({ success: false, error: subjErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, subjects: subjects || [] });
  } catch (err: any) {
    console.error("[api/classes/[id]/subjects:GET] Exception :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * POST /api/classes/[id]/subjects
 * Ajout d'une matière par le maître responsable de la classe primaire (ou le directeur).
 */
export async function POST(request: Request, context: RouteParams) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;
    const { id: classId } = await context.params;

    const supabaseAdmin = getServerSupabaseAdmin();

    const { data: classroom, error: classErr } = await supabaseAdmin
      .from("classrooms")
      .select("id, name, cycle, school_id, primary_teacher_id")
      .eq("id", classId)
      .eq("school_id", user.schoolId)
      .single();

    if (classErr || !classroom) {
      return NextResponse.json({ success: false, error: "Classe introuvable." }, { status: 404 });
    }

    // Sécurité stricte : seul le directeur ou le maître responsable de cette classe peut ajouter une matière
    if (user.role === "enseignant") {
      if (classroom.cycle === "PRIMAIRE" && classroom.primary_teacher_id !== user.userId) {
        return NextResponse.json(
          { success: false, error: "Action interdite : vous n'êtes pas le maître responsable de cette classe." },
          { status: 403 }
        );
      }
    } else if (user.role !== "directeur" && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Action non autorisée pour votre profil." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, code, coef = 1, category = "AUTRE", order = 50 } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Le nom de la matière est obligatoire." }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanCode = (code || cleanName.substring(0, 4).toUpperCase()).trim();
    const cleanCoef = Math.max(1, Math.min(10, Math.round(Number(coef) || 1)));

    // Vérifier les doublons de matière dans la même classe
    const { data: existingSubj } = await supabaseAdmin
      .from("subjects")
      .select("id, name")
      .eq("school_id", user.schoolId)
      .eq("class_id", classId)
      .ilike("name", cleanName)
      .eq("is_active", true)
      .maybeSingle();

    if (existingSubj) {
      return NextResponse.json(
        { success: false, error: `Une matière active portant le nom « ${cleanName} » existe déjà dans votre classe.` },
        { status: 400 }
      );
    }

    const { data: newSubject, error: insertErr } = await supabaseAdmin
      .from("subjects")
      .insert({
        school_id: user.schoolId,
        class_id: classId,
        teacher_id: user.userId,
        name: cleanName,
        code: cleanCode,
        cycle: classroom.cycle,
        coef: cleanCoef,
        category: category || "AUTRE",
        order_num: order,
        is_active: true,
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
    }

    await recordAuditEvent({
      schoolId: user.schoolId,
      userId: user.userId,
      action: "subjects:create",
      resourceType: "subjects",
      resourceId: newSubject?.id,
      newData: { classId, className: classroom.name, subjectName: cleanName, coef: cleanCoef },
    });

    return NextResponse.json({ success: true, subject: newSubject }, { status: 201 });
  } catch (err: any) {
    console.error("[api/classes/[id]/subjects:POST] Exception :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * DELETE /api/classes/[id]/subjects
 * Désactivation d'une matière par le maître responsable (PRÉSERVE L'HISTORIQUE DES NOTES).
 */
export async function DELETE(request: Request, context: RouteParams) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;
    const { id: classId } = await context.params;

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");

    if (!subjectId) {
      return NextResponse.json({ success: false, error: "Identifiant de la matière requis." }, { status: 400 });
    }

    const supabaseAdmin = getServerSupabaseAdmin();

    // Désactivation logique sans suppression pour préserver l'historique des notes
    const { error: updateErr } = await supabaseAdmin
      .from("subjects")
      .update({ is_active: false })
      .eq("id", subjectId)
      .eq("class_id", classId)
      .eq("school_id", user.schoolId);

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Matière retirée avec succès. Toutes les notes antérieures restent préservées dans les bulletins.",
    });
  } catch (err: any) {
    console.error("[api/classes/[id]/subjects:DELETE] Exception :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
