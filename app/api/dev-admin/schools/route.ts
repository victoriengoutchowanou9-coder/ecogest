import { NextResponse } from "next/server";
import { requireDeveloperAuth, getSupabaseAdminClient, recordSystemAuditLog } from "@/lib/server/dev-auth";

/**
 * GET /api/dev-admin/schools
 * Récupère tous les établissements réels de la base avec informations de supervision :
 * Directeur, effectif utilisateurs, effectif élèves, abonnement et statut.
 */
export async function GET() {
  const auth = await requireDeveloperAuth();
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Session développeur requise." }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();

  try {
    // 1. Récupérer les établissements
    const { data: schools, error: schoolErr } = await supabase
      .from("schools")
      .select("*")
      .order("created_at", { ascending: false });

    if (schoolErr) {
      return NextResponse.json({ error: schoolErr.message }, { status: 500 });
    }

    const schoolList = schools || [];

    // 2. Récupérer les utilisateurs pour agréger par établissement et trouver le directeur
    const { data: users } = await supabase
      .from("school_users")
      .select("id, school_id, full_name, email, role, phone, status");

    const usersList = users || [];

    // 3. Récupérer les effectifs élèves par établissement
    const { data: students } = await supabase
      .from("students")
      .select("id, school_id");

    const studentsList = students || [];

    // 4. Récupérer les abonnements enregistrés (s'il y en a)
    let subsMap: Record<string, any> = {};
    try {
      const { data: subs } = await supabase
        .from("school_subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (subs && Array.isArray(subs)) {
        subs.forEach((s) => {
          if (s.school_id && !subsMap[s.school_id]) {
            subsMap[s.school_id] = s;
          }
        });
      }
    } catch {}

    // 5. Récupérer les statuts de blocage éventuels consignés dans system_audit_logs
    let blockedSchools = new Set<string>();
    try {
      const { data: statusLogs } = await supabase
        .from("system_audit_logs")
        .select("school_id, details, created_at")
        .eq("event_type", "SCHOOL_STATUS")
        .order("created_at", { ascending: true });

      if (statusLogs && Array.isArray(statusLogs)) {
        statusLogs.forEach((log) => {
          const sId = log.school_id || log.details?.school_id;
          const status = log.details?.status;
          if (sId) {
            if (status === "BLOQUE" || status === "SUSPENDU") {
              blockedSchools.add(sId);
            } else if (status === "ACTIF") {
              blockedSchools.delete(sId);
            }
          }
        });
      }
    } catch {}

    // 6. Enrichir chaque établissement
    const enrichedSchools = schoolList.map((sch) => {
      const schoolUsers = usersList.filter((u) => u.school_id === sch.id);
      const director =
        schoolUsers.find((u) => (u.role || "").toLowerCase().includes("directeur")) ||
        schoolUsers[0];
      const studentsCount = studentsList.filter((st) => st.school_id === sch.id).length;
      const sub = subsMap[sch.id];

      const isBlocked = blockedSchools.has(sch.id);

      // Calcul statut d'abonnement
      let planName = sub?.plan_type || "Starter (Essai 1 mois)";
      let subStatus = sub?.status || "TRIAL";
      let expiresAt = sub?.expires_at;

      if (!expiresAt) {
        // Calcul date d'expiration par défaut : 30 jours après création
        const createdDate = new Date(sch.created_at || Date.now());
        const expDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        expiresAt = expDate.toISOString().split("T")[0];
      }

      const isExpired = new Date(expiresAt).getTime() < Date.now();
      if (isExpired && subStatus !== "ACTIVE") {
        subStatus = "EXPIRED";
      }

      return {
        id: sch.id,
        code: sch.code || "—",
        name: sch.name,
        shortName: sch.short_name || sch.name,
        country: sch.country || "Bénin",
        region: sch.region || "Littoral",
        city: sch.city || "Cotonou",
        address: sch.address || "",
        phone: sch.phone || director?.phone || "—",
        email: sch.email || director?.email || "—",
        activeYear: sch.active_year || "2026-2027",
        createdAt: sch.created_at,
        directorName: director?.full_name || "Non assigné",
        directorEmail: director?.email || "—",
        usersCount: schoolUsers.length,
        studentsCount,
        planName,
        subscriptionStatus: subStatus,
        subscriptionExpiresAt: expiresAt,
        status: isBlocked ? "BLOQUE" : "ACTIF",
      };
    });

    return NextResponse.json({
      success: true,
      schools: enrichedSchools,
      count: enrichedSchools.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur." }, { status: 500 });
  }
}

/**
 * PATCH /api/dev-admin/schools
 * Permet au développeur de bloquer ou débloquer un établissement.
 */
export async function PATCH(request: Request) {
  const auth = await requireDeveloperAuth();
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Session développeur requise." }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();

  try {
    const body = await request.json();
    const { schoolId, status, reason } = body;

    if (!schoolId || !status) {
      return NextResponse.json({ error: "schoolId et status (ACTIF | BLOQUE) requis." }, { status: 400 });
    }

    // Récupérer le nom de l'établissement
    const { data: sch } = await supabase
      .from("schools")
      .select("id, name")
      .eq("id", schoolId)
      .maybeSingle();

    const schoolName = sch?.name || "Établissement inconnu";

    // Enregistrer le statut dans system_audit_logs de façon permanente
    await recordSystemAuditLog({
      eventType: "SCHOOL_STATUS",
      severity: status === "BLOQUE" ? "WARNING" : "INFO",
      actionTitle: `${status === "BLOQUE" ? "Blocage" : "Réactivation"} de l'établissement « ${schoolName} »`,
      details: {
        school_id: schoolId,
        status,
        reason: reason || "Action administrative du Développeur",
        updated_at: new Date().toISOString(),
      },
      schoolId,
      schoolName,
      userEmail: auth.email,
      userRole: "DEVELOPPEUR",
    });

    // Mettre à jour l'horodatage de l'école
    try {
      await supabase
        .from("schools")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", schoolId);
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Établissement passé au statut ${status} avec succès.`,
      status,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur." }, { status: 500 });
  }
}

/**
 * DELETE /api/dev-admin/schools
 * Permet au développeur de supprimer un établissement.
 */
export async function DELETE(request: Request) {
  const auth = await requireDeveloperAuth();
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Session développeur requise." }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();

  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("id");

    if (!schoolId) {
      return NextResponse.json({ error: "ID de l'établissement requis." }, { status: 400 });
    }

    // Obtenir le nom de l'école avant suppression
    const { data: sch } = await supabase
      .from("schools")
      .select("id, name, code")
      .eq("id", schoolId)
      .maybeSingle();

    const schoolName = sch?.name || schoolId;

    // Suppression en cascade des utilisateurs rattachés
    try {
      await supabase.from("school_users").delete().eq("school_id", schoolId);
    } catch {}

    // Suppression de l'école
    const { error } = await supabase.from("schools").delete().eq("id", schoolId);

    if (error) {
      return NextResponse.json({ error: `Impossible de supprimer l'établissement : ${error.message}` }, { status: 500 });
    }

    // Journal d'audit de sécurité
    await recordSystemAuditLog({
      eventType: "SUPPRESSION_ETABLISSEMENT",
      severity: "CRITICAL",
      actionTitle: `Suppression définitive de l'établissement « ${schoolName} »`,
      details: {
        school_id: schoolId,
        code: sch?.code,
        deleted_by: auth.email,
        timestamp: new Date().toISOString(),
      },
      schoolId,
      schoolName,
      userEmail: auth.email,
      userRole: "DEVELOPPEUR",
    });

    return NextResponse.json({
      success: true,
      message: `L'établissement « ${schoolName} » a été supprimé avec succès.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur." }, { status: 500 });
  }
}
