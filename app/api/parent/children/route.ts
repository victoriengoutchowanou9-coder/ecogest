import { NextResponse } from "next/server";
import { requireServerUserContext, getServerSupabaseAdmin } from "@/lib/server/supabase-admin";
import { recordAuditEvent } from "@/lib/server/audit-logger";

/**
 * GET /api/parent/children
 * Récupère la liste STRICTEMENT vérifiée des enfants rattachés au compte parent connecté.
 * Règle de sécurité : Un parent ne peut voir que les élèves légalement rattachés dans parent_student_links.
 */
export async function GET(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;
    const supabaseAdmin = getServerSupabaseAdmin();

    // 1. Récupérer les liaisons validées dans parent_student_links
    const { data: links, error: linksErr } = await supabaseAdmin
      .from("parent_student_links")
      .select("id, parent_user_id, school_id, student_matricule, student_name, student_class, relationship, status, validated_at")
      .eq("parent_user_id", user.userId)
      .eq("school_id", user.schoolId)
      .eq("status", "VALIDATED");

    if (linksErr) {
      console.error("[api/parent/children:GET] Erreur:", linksErr);
      return NextResponse.json({ success: false, error: linksErr.message }, { status: 500 });
    }

    if (!links || links.length === 0) {
      return NextResponse.json({ success: true, children: [] });
    }

    const matricules = links.map((l: any) => l.student_matricule);

    // 2. Récupérer les informations scolaires des élèves (classe, cycle, enseignant)
    const { data: studentsData } = await supabaseAdmin
      .from("students")
      .select("id, school_id, matricule, first_name, last_name, class_id, gender, birth_date")
      .eq("school_id", user.schoolId)
      .in("matricule", matricules);

    // 3. Récupérer les classes concernées pour identifier l'enseignant responsable
    const classIds = Array.from(new Set((studentsData || []).map((s: any) => s.class_id).filter(Boolean)));
    let classroomsMap: Record<string, any> = {};

    if (classIds.length > 0) {
      const { data: classes } = await supabaseAdmin
        .from("classrooms")
        .select("id, name, cycle, level, primary_teacher_id, main_teacher_id, opening_time, closing_time")
        .eq("school_id", user.schoolId)
        .in("id", classIds);

      (classes || []).forEach((c: any) => {
        classroomsMap[c.id] = c;
      });
    }

    const children = links.map((link: any) => {
      const student = (studentsData || []).find((s: any) => s.matricule === link.student_matricule);
      const classInfo = student?.class_id ? classroomsMap[student.class_id] : null;

      return {
        linkId: link.id,
        studentId: student?.id || link.student_matricule,
        matricule: link.student_matricule,
        fullName: link.student_name,
        firstName: student?.first_name || link.student_name.split(" ")[0],
        lastName: student?.last_name || link.student_name.split(" ").slice(1).join(" "),
        classId: student?.class_id || "class-default",
        className: classInfo?.name || link.student_class || "Classe",
        cycle: classInfo?.cycle || (link.student_class?.toLowerCase().includes("c") ? "PRIMAIRE" : "SECONDAIRE"),
        mainTeacherId: classInfo?.primary_teacher_id || classInfo?.main_teacher_id || null,
        relationship: link.relationship,
        status: link.status,
        openingTime: classInfo?.opening_time,
        closingTime: classInfo?.closing_time,
      };
    });

    return NextResponse.json({ success: true, children });
  } catch (err: any) {
    console.error("[api/parent/children:GET] Exception:", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * POST /api/parent/children
 * Soumet une demande de rattachement d'un élève par son numéro matricule officiel
 */
export async function POST(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;
    const body = await request.json();
    const { studentMatricule, relationship = "Père / Mère / Tuteur" } = body;

    if (!studentMatricule || !studentMatricule.trim()) {
      return NextResponse.json({ success: false, error: "Numéro matricule ou Educ Master obligatoire." }, { status: 400 });
    }

    const cleanMatricule = studentMatricule.trim().toUpperCase();
    const supabaseAdmin = getServerSupabaseAdmin();

    // 1. Rechercher l'élève dans l'établissement
    const { data: student, error: studentErr } = await supabaseAdmin
      .from("students")
      .select("id, matricule, first_name, last_name, class_id")
      .eq("school_id", user.schoolId)
      .eq("matricule", cleanMatricule)
      .maybeSingle();

    if (studentErr || !student) {
      return NextResponse.json(
        { success: false, error: `Aucun élève trouvé avec le matricule « ${cleanMatricule} » dans cet établissement.` },
        { status: 404 }
      );
    }

    // Récupérer le nom de la classe
    let className = "Classe";
    if (student.class_id) {
      const { data: cls } = await supabaseAdmin
        .from("classrooms")
        .select("name")
        .eq("id", student.class_id)
        .maybeSingle();
      if (cls) className = cls.name;
    }

    const studentFullName = `${student.first_name} ${student.last_name}`;

    // 2. Insérer dans parent_student_links
    const { data: link, error: insertErr } = await supabaseAdmin
      .from("parent_student_links")
      .insert({
        parent_user_id: user.userId,
        school_id: user.schoolId,
        student_matricule: cleanMatricule,
        student_name: studentFullName,
        student_class: className,
        relationship,
        status: "PENDING",
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
    }

    // Audit log
    await recordAuditEvent({
      schoolId: user.schoolId,
      userId: user.userId,
      action: "parent_child_link:request",
      resourceType: "parent_student_links",
      resourceId: link.id,
      newData: { studentMatricule: cleanMatricule, studentName: studentFullName },
    });

    // Notifier la direction de la nouvelle demande de rattachement
    await supabaseAdmin.from("user_notifications").insert({
      school_id: user.schoolId,
      user_id: user.userId,
      recipient_role: "directeur",
      title: "Nouvelle demande de rattachement parent",
      message: `${user.fullName || "Un parent"} a demandé le rattachement de l'élève ${studentFullName} (${cleanMatricule}).`,
      type: "DOSSIER_SCOLAIRE",
      link: "/censeur/demandes-parents",
      source_event_id: `link-req-${link.id}`,
      is_read: false,
    });

    return NextResponse.json({
      success: true,
      message: "Demande de rattachement transmise à l'administration avec succès.",
      link,
    });
  } catch (err: any) {
    console.error("[api/parent/children:POST] Exception:", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
