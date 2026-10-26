import { NextResponse } from "next/server";
import { requireServerUserContext, getServerSupabaseAdmin } from "@/lib/server/supabase-admin";
import { recordAuditEvent } from "@/lib/server/audit-logger";
import { sendSchoolNotificationEmail } from "@/lib/server/email";

/**
 * GET /api/announcements
 * Récupère les annonces de l'établissement filtrées strictement selon le rôle du compte :
 * - Directeur / Administration : toutes les annonces de l'école + métriques de lecture
 * - Enseignants : annonces ciblées 'ALL', 'ENSEIGNANTS', ou leurs classes
 * - Parents : annonces ciblées 'ALL', 'PARENTS', ou les classes de leurs enfants rattachés
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
      .from("announcements")
      .select("id, school_id, title, content, author_name, author_role, target_audience, target_class_id, target_class_name, priority, category, is_published, published_at, created_at")
      .eq("school_id", user.schoolId)
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    // Filtrage par audience si ce n'est pas le directeur / admin
    if (user.role === "enseignant") {
      // Classes assignées à cet enseignant
      const { data: myClasses } = await supabaseAdmin
        .from("classrooms")
        .select("id")
        .eq("school_id", user.schoolId)
        .or(`primary_teacher_id.eq.${user.userId},main_teacher_id.eq.${user.userId}`);

      const classIds = (myClasses || []).map((c: any) => c.id);
      if (classIds.length > 0) {
        query = query.or(`target_audience.in.(ALL,ENSEIGNANTS),target_class_id.in.(${classIds.join(",")})`);
      } else {
        query = query.in("target_audience", ["ALL", "ENSEIGNANTS"]);
      }
    } else if (user.role === "parent") {
      // Classes des enfants validés rattachés à ce parent
      const { data: links } = await supabaseAdmin
        .from("parent_student_links")
        .select("student_class")
        .eq("parent_user_id", user.userId)
        .eq("school_id", user.schoolId)
        .eq("status", "VALIDATED");

      const studentClasses = (links || []).map((l: any) => l.student_class).filter(Boolean);
      if (studentClasses.length > 0) {
        query = query.or(`target_audience.in.(ALL,PARENTS),target_class_name.in.(${studentClasses.join(",")})`);
      } else {
        query = query.in("target_audience", ["ALL", "PARENTS"]);
      }
    } else if (user.role === "eleve") {
      query = query.in("target_audience", ["ALL", "ELEVES"]);
    }

    const { data: announcements, error } = await query;
    if (error) {
      console.warn("[api/announcements:GET] Tables non disponibles ou non configurées dans Supabase (repli fluide) :", error.message);
      return NextResponse.json({ success: true, announcements: [] });
    }

    // Récupérer les accusés de lecture de l'utilisateur actuel en toute sécurité
    const announcementIds = (announcements || []).map((a) => a.id);
    let myReads: string[] = [];
    let readCountsMap: Record<string, number> = {};

    if (announcementIds.length > 0) {
      try {
        const { data: reads } = await supabaseAdmin
          .from("announcement_reads")
          .select("announcement_id")
          .eq("user_id", user.userId)
          .in("announcement_id", announcementIds);
        myReads = (reads || []).map((r) => r.announcement_id);
      } catch (e) {
        // Ignorer en mode repli
      }

      // Si directeur/admin, récupérer aussi le décompte total des lectures
      if (user.role === "directeur" || user.role === "admin" || user.role === "censeur") {
        try {
          const { data: allReads } = await supabaseAdmin
            .from("announcement_reads")
            .select("announcement_id")
            .in("announcement_id", announcementIds);
          (allReads || []).forEach((r) => {
            readCountsMap[r.announcement_id] = (readCountsMap[r.announcement_id] || 0) + 1;
          });
        } catch (e) {
          // Ignorer en mode repli
        }
      }
    }

    const formatted = (announcements || []).map((a) => ({
      ...a,
      isRead: myReads.includes(a.id),
      readCount: readCountsMap[a.id] || 0,
    }));

    return NextResponse.json({ success: true, announcements: formatted });
  } catch (err: any) {
    console.warn("[api/announcements:GET] Exception rattrapée (repli fluide) :", err?.message || err);
    return NextResponse.json({ success: true, announcements: [] });
  }
}

/**
 * POST /api/announcements
 * Publication d'une annonce par la direction ou administration
 * Déclenche automatiquement les notifications in-app pour tous les destinataires ciblés
 */
export async function POST(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    if (user.role !== "directeur" && user.role !== "censeur" && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Action non autorisée. Seule l'administration peut publier des annonces." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      content,
      targetAudience = "ALL",
      targetClassId,
      targetClassName,
      priority = "NORMAL",
      category = "GENERAL",
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: "Le titre de l'annonce est obligatoire." }, { status: 400 });
    }
    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: "Le contenu du message est obligatoire." }, { status: 400 });
    }

    const supabaseAdmin = getServerSupabaseAdmin();

    const { data: newAnnouncement, error: insertError } = await supabaseAdmin
      .from("announcements")
      .insert({
        school_id: user.schoolId,
        title: title.trim(),
        content: content.trim(),
        author_id: user.userId,
        author_name: user.fullName || "La Direction",
        author_role: user.role,
        target_audience: targetAudience,
        target_class_id: targetClassId || null,
        target_class_name: targetClassName || null,
        priority,
        category,
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.warn("[api/announcements:POST] Erreur insertion annonce :", insertError.message);
      return NextResponse.json({ success: false, error: "Impossible d'enregistrer l'annonce dans la base de données. Veuillez vous assurer que la migration SQL Supabase a été appliquée." }, { status: 400 });
    }

    // Audit log (non bloquant)
    try {
      await recordAuditEvent({
        schoolId: user.schoolId,
        userId: user.userId,
        action: "announcements:create",
        resourceType: "announcements",
        resourceId: newAnnouncement.id,
        newData: { title, targetAudience, targetClassId, priority },
      });
    } catch (e) {
      // Ignorer si la table audit_logs n'est pas configurée
    }

    // Déterminer les utilisateurs destinataires pour les notifications in-app
    try {
      let targetUsersQuery = supabaseAdmin
        .from("school_users")
        .select("id, email, full_name, role")
        .eq("school_id", user.schoolId)
        .eq("status", "ACTIF");

      if (targetAudience === "ENSEIGNANTS") {
        targetUsersQuery = targetUsersQuery.eq("role", "enseignant");
      } else if (targetAudience === "PARENTS") {
        targetUsersQuery = targetUsersQuery.eq("role", "parent");
      } else if (targetAudience === "ELEVES") {
        targetUsersQuery = targetUsersQuery.eq("role", "eleve");
      }

      const { data: targetUsers } = await targetUsersQuery;

      if (targetUsers && targetUsers.length > 0) {
        const notificationsToInsert = targetUsers.map((u) => ({
          school_id: user.schoolId,
          user_id: u.id,
          recipient_role: u.role,
          title: priority === "URGENT" ? `[URGENT] ${title.trim()}` : title.trim(),
          message: content.trim().slice(0, 150) + (content.length > 150 ? "..." : ""),
          type: priority === "URGENT" ? "URGENCE" : "ANNONCE",
          link: u.role === "parent" ? "/parent/notifications" : u.role === "enseignant" ? "/enseignant/messages" : "/directeur/annonces",
          source_event_id: `announcement-${newAnnouncement.id}`,
          is_read: false,
        }));

        // Insertion par lot sécurisée
        await supabaseAdmin
          .from("user_notifications")
          .upsert(notificationsToInsert, { onConflict: "user_id,source_event_id", ignoreDuplicates: true });

        // Si annonce urgente, tenter l'envoi d'e-mail
        if (priority === "URGENT") {
          for (const targetUser of targetUsers.slice(0, 50)) {
            if (targetUser.email) {
              sendSchoolNotificationEmail({
                toEmail: targetUser.email,
                recipientName: targetUser.full_name,
                schoolName: "Établissement Scolaire",
                title: `[Avis Urgent] ${title.trim()}`,
                summary: content.trim(),
                category: "URGENCE",
                ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://ecogest.vercel.app"}/connexion`,
                ctaText: "Lire l'avis officiel",
              }).catch((e) => console.warn("[Email Urgent Error]:", e));
            }
          }
        }
      }
    } catch (notifErr) {
      console.warn("[api/announcements:POST] Avertissement diffusion notifications :", notifErr);
    }

    return NextResponse.json({ success: true, announcement: newAnnouncement }, { status: 201 });
  } catch (err: any) {
    console.error("[api/announcements:POST] Exception:", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
