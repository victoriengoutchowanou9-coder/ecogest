import { NextResponse } from "next/server";
import { requireServerUserContext, getServerSupabaseAdmin } from "@/lib/server/supabase-admin";
import { assertRolePermission } from "@/lib/server/permissions-matrix";
import { recordAuditEvent } from "@/lib/server/audit-logger";

const VALID_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

/**
 * GET /api/classes
 * Liste les classes de l'établissement avec filtrage automatique selon le rôle :
 * - Directeur / Administration : toutes les classes de l'école.
 * - Maître du primaire : UNIQUEMENT les classes dont il est le maître responsable.
 */
export async function GET(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    const supabaseAdmin = getServerSupabaseAdmin();
    let query = supabaseAdmin
      .from("classrooms")
      .select("id, school_id, name, cycle, level, stream, size, main_teacher_id, primary_teacher_id, tuition_fee, opening_time, closing_time, working_days, academic_year_id, created_at, updated_at")
      .eq("school_id", user.schoolId)
      .order("name", { ascending: true });

    // Filtrage strict : un maître du primaire ne voit QUE ses classes assignées
    if (user.role === "enseignant") {
      query = query.or(`cycle.eq.SECONDAIRE,primary_teacher_id.eq.${user.userId}`);
    }

    const { data: classrooms, error } = await query;

    if (error) {
      console.error("[api/classes:GET] Erreur Supabase :", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, classrooms: classrooms || [] });
  } catch (err: any) {
    console.error("[api/classes:GET] Exception :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * POST /api/classes
 * Création d'une classe (RÉSERVÉE AU DIRECTEUR).
 * Applique les règles strictes du primaire :
 * - Nom, cycle, niveau, année scolaire.
 * - Heure d'ouverture et heure de fermeture (fermeture strictement postérieure).
 * - Jours ouvrables (Lundi à Dimanche).
 * - Un seul maître responsable pour l'année scolaire.
 * - Maître appartenant obligatoirement à l'établissement.
 */
export async function POST(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    // Seul le directeur (ou admin) peut créer une classe
    if (user.role !== "directeur" && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Action interdite : Seul le Directeur peut créer une classe." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      cycle,
      level,
      stream,
      tuitionFee,
      openingTime = "08:00",
      closingTime = "15:30",
      workingDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
      primaryTeacherId,
      academicYearId = "2026-2027",
    } = body;

    if (!name || !cycle || !level) {
      return NextResponse.json(
        { success: false, error: "Le nom, le cycle et le niveau sont obligatoires." },
        { status: 400 }
      );
    }

    // 1. Validation des horaires
    if (openingTime && closingTime) {
      if (closingTime <= openingTime) {
        return NextResponse.json(
          {
            success: false,
            error: `Horaires invalides : L'heure de fermeture (${closingTime}) doit être strictement postérieure à l'heure d'ouverture (${openingTime}).`,
          },
          { status: 400 }
        );
      }
    }

    // 2. Validation des jours ouvrables
    if (!Array.isArray(workingDays) || workingDays.length === 0) {
      return NextResponse.json(
        { success: false, error: "Veuillez cocher au moins un jour ouvrable pour cette classe." },
        { status: 400 }
      );
    }
    const invalidDays = workingDays.filter((d: string) => !VALID_DAYS.includes(d));
    if (invalidDays.length > 0) {
      return NextResponse.json(
        { success: false, error: `Jours ouvrables invalides : ${invalidDays.join(", ")}` },
        { status: 400 }
      );
    }

    const supabaseAdmin = getServerSupabaseAdmin();

    // 3. Règle du maître unique pour le cycle primaire
    if (cycle === "PRIMAIRE" && primaryTeacherId) {
      // Vérifier que le maître appartient à cet établissement
      const { data: teacher, error: teacherErr } = await supabaseAdmin
        .from("school_users")
        .select("id, full_name, school_id, role")
        .eq("id", primaryTeacherId)
        .single();

      if (teacherErr || !teacher || teacher.school_id !== user.schoolId) {
        return NextResponse.json(
          { success: false, error: "Attribution refusée : Le maître sélectionné n'appartient pas à votre établissement." },
          { status: 400 }
        );
      }

      // Vérifier si le maître n'est pas déjà maître responsable d'une autre classe primaire pour cette même année
      const { data: existingAssignment } = await supabaseAdmin
        .from("classrooms")
        .select("id, name")
        .eq("school_id", user.schoolId)
        .eq("cycle", "PRIMAIRE")
        .eq("academic_year_id", academicYearId)
        .eq("primary_teacher_id", primaryTeacherId)
        .maybeSingle();

      if (existingAssignment) {
        return NextResponse.json(
          {
            success: false,
            error: `Règle d'attribution : Ce maître est déjà le maître responsable exclusif de la classe « ${existingAssignment.name} » pour l'année ${academicYearId}.`,
          },
          { status: 400 }
        );
      }
    }

    // Insertion
    const { data: newClass, error: insertError } = await supabaseAdmin
      .from("classrooms")
      .insert({
        school_id: user.schoolId,
        name: name.trim(),
        cycle,
        level,
        stream: stream || (cycle === "PRIMAIRE" ? "Apprentissages Fondamentaux" : "Général"),
        tuition_fee: Number(tuitionFee) || 0,
        opening_time: openingTime,
        closing_time: closingTime,
        working_days: workingDays,
        primary_teacher_id: cycle === "PRIMAIRE" ? primaryTeacherId || null : null,
        main_teacher_id: primaryTeacherId || null,
        academic_year_id: academicYearId,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[api/classes:POST] Erreur insertion :", insertError);
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    // Journalisation d'audit
    await recordAuditEvent({
      schoolId: user.schoolId,
      userId: user.userId,
      action: "classes:create",
      resourceType: "classes",
      resourceId: newClass?.id,
      newData: {
        name,
        cycle,
        level,
        openingTime,
        closingTime,
        workingDays,
        primaryTeacherId,
      },
    });

    return NextResponse.json({ success: true, classroom: newClass }, { status: 201 });
  } catch (err: any) {
    console.error("[api/classes:POST] Exception :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * PATCH /api/classes
 * Modification d'une classe et de ses paramètres (RÉSERVÉE AU DIRECTEUR).
 * Trace les changements de maître dans l'historique permanent.
 */
export async function PATCH(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    if (user.role !== "directeur" && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Action interdite : Seul le Directeur peut modifier les horaires ou l'attribution des classes." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      id,
      name,
      openingTime,
      closingTime,
      workingDays,
      primaryTeacherId,
      tuitionFee,
      stream,
      reassignmentReason,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "L'identifiant de la classe est requis." }, { status: 400 });
    }

    if (openingTime && closingTime && closingTime <= openingTime) {
      return NextResponse.json(
        { success: false, error: `Horaires invalides : Fermeture (${closingTime}) doit être après ouverture (${openingTime}).` },
        { status: 400 }
      );
    }

    const supabaseAdmin = getServerSupabaseAdmin();

    // Récupérer la classe actuelle
    const { data: currentClass, error: fetchErr } = await supabaseAdmin
      .from("classrooms")
      .select("*")
      .eq("id", id)
      .eq("school_id", user.schoolId)
      .single();

    if (fetchErr || !currentClass) {
      return NextResponse.json({ success: false, error: "Classe introuvable dans votre établissement." }, { status: 404 });
    }

    // Mise à jour
    const updatePayload: any = {};
    if (name) updatePayload.name = name.trim();
    if (openingTime) updatePayload.opening_time = openingTime;
    if (closingTime) updatePayload.closing_time = closingTime;
    if (Array.isArray(workingDays)) updatePayload.working_days = workingDays;
    if (typeof tuitionFee === "number") updatePayload.tuition_fee = tuitionFee;
    if (stream) updatePayload.stream = stream;

    if (currentClass.cycle === "PRIMAIRE" && primaryTeacherId !== undefined) {
      updatePayload.primary_teacher_id = primaryTeacherId || null;
      updatePayload.main_teacher_id = primaryTeacherId || null;

      // Enregistrer dans l'historique
      if (currentClass.primary_teacher_id !== primaryTeacherId) {
        await supabaseAdmin.from("primary_class_assignment_history").insert({
          school_id: user.schoolId,
          class_id: id,
          academic_year_id: currentClass.academic_year_id || "2026-2027",
          teacher_id: primaryTeacherId || null,
          teacher_name: primaryTeacherId ? "Maître assigné" : "Non assigné",
          previous_teacher_id: currentClass.primary_teacher_id,
          assigned_by: user.fullName || "Directeur",
          reason: reassignmentReason || "Modification de l'attribution par la Direction",
        });
      }
    }

    const { data: updatedClass, error: updateErr } = await supabaseAdmin
      .from("classrooms")
      .update(updatePayload)
      .eq("id", id)
      .eq("school_id", user.schoolId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, classroom: updatedClass });
  } catch (err: any) {
    console.error("[api/classes:PATCH] Exception :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
