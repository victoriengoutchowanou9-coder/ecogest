import { NextResponse } from "next/server";
import { requireDeveloperAuth, getSupabaseAdminClient, recordSystemAuditLog } from "@/lib/server/dev-auth";

/**
 * GET /api/dev-admin/users
 * Récupère tous les utilisateurs réels de la base avec filtres :
 * Établissement, rôle, statut, recherche, période.
 */
export async function GET(request: Request) {
  const auth = await requireDeveloperAuth();
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Session développeur requise." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const schoolFilter = searchParams.get("school") || "ALL";
  const roleFilter = searchParams.get("role") || "ALL";
  const statusFilter = searchParams.get("status") || "ALL";
  const search = searchParams.get("search") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const supabase = getSupabaseAdminClient();

  try {
    // 1. Récupérer les écoles pour joindre le nom
    const { data: schoolsData } = await supabase
      .from("schools")
      .select("id, name, code");

    const schoolMap = new Map<string, { name: string; code: string }>();
    (schoolsData || []).forEach((s) => {
      schoolMap.set(s.id, { name: s.name, code: s.code });
    });

    // 2. Requête sur school_users
    let query = supabase
      .from("school_users")
      .select("id, school_id, full_name, email, role, phone, status, permissions, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (schoolFilter !== "ALL") {
      query = query.eq("school_id", schoolFilter);
    }

    if (statusFilter !== "ALL") {
      query = query.eq("status", statusFilter);
    }

    if (dateFrom) {
      query = query.gte("created_at", `${dateFrom}T00:00:00Z`);
    }

    if (dateTo) {
      query = query.lte("created_at", `${dateTo}T23:59:59Z`);
    }

    const { data: users, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let userList = users || [];

    // Filtrage par rôle si spécifié
    if (roleFilter !== "ALL") {
      userList = userList.filter((u) => {
        const r = (u.role || "").toLowerCase();
        const f = roleFilter.toLowerCase();
        return r.includes(f) || f.includes(r);
      });
    }

    // Filtrage textuel (recherche par nom, prénom, email, téléphone)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      userList = userList.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q) ||
          (u.school_id && schoolMap.get(u.school_id)?.name?.toLowerCase().includes(q))
      );
    }

    // Enrichir avec le nom de l'établissement et l'identifiant applicatif
    const rolePrefixMap: Record<string, string> = {
      directeur: "DIR",
      censeur: "CEN",
      secretariat: "SEC",
      surveillant: "SUR",
      enseignant: "ENS",
      comptabilite: "CPT",
      parent: "PAR",
      developpeur: "DEV",
    };

    const enriched = userList.map((u) => {
      const sch = u.school_id ? schoolMap.get(u.school_id) : null;
      const schoolCode = sch ? sch.code : "";
      const permissionsList = Array.isArray(u.permissions) ? u.permissions : [];
      const storedIdentifier = permissionsList
        .find((p: string) => p.startsWith("IDENTIFIER:"))
        ?.replace("IDENTIFIER:", "");

      const cleanRole = (u.role || "directeur").toLowerCase();
      const fallbackPrefix = rolePrefixMap[cleanRole] || "USR";
      const cleanCode = (schoolCode || "0000").replace(/\D/g, "").slice(0, 4).padStart(4, "0");
      const generatedIdentifier = u.role === "DEVELOPPEUR" ? "DEV-ROOT-001" : `${cleanCode}${fallbackPrefix}01`;
      const identifier = storedIdentifier || generatedIdentifier;

      const fonction = cleanRole === "directeur" ? "Direction Générale" : u.role;

      return {
        id: u.id,
        identifier,
        fullName: u.full_name,
        email: u.email,
        role: u.role,
        fonction,
        phone: u.phone || "—",
        status: u.status || "ACTIF",
        schoolId: u.school_id,
        schoolName: sch ? sch.name : u.role === "DEVELOPPEUR" ? "Administration Centrale ECOGEST" : "Non rattaché",
        schoolCode: sch ? sch.code : "—",
        createdAt: u.created_at,
        lastLogin: u.updated_at || u.created_at, // Horodatage récent de session
      };
    });

    return NextResponse.json({
      success: true,
      users: enriched,
      count: enriched.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur." }, { status: 500 });
  }
}

/**
 * PATCH /api/dev-admin/users
 * Permet au développeur d'activer ou suspendre un compte utilisateur.
 */
export async function PATCH(request: Request) {
  const auth = await requireDeveloperAuth();
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Session développeur requise." }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();

  try {
    const body = await request.json();
    const { userId, status, reason } = body;

    if (!userId || !status) {
      return NextResponse.json({ error: "userId et status (ACTIF | SUSPENDU) requis." }, { status: 400 });
    }

    // Récupérer l'utilisateur
    const { data: targetUser } = await supabase
      .from("school_users")
      .select("id, full_name, email, role, school_id")
      .eq("id", userId)
      .maybeSingle();

    if (!targetUser) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    // Empêcher la désactivation de son propre compte développeur
    if (targetUser.email === auth.email && status === "SUSPENDU") {
      return NextResponse.json(
        { error: "Vous ne pouvez pas suspendre votre propre compte développeur actif." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("school_users")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Audit log
    await recordSystemAuditLog({
      eventType: "MODIF_PROFIL",
      severity: status === "SUSPENDU" ? "WARNING" : "INFO",
      actionTitle: `${status === "SUSPENDU" ? "Suspension" : "Réactivation"} du compte de ${targetUser.full_name} (${targetUser.role})`,
      details: {
        targetUserId: userId,
        targetEmail: targetUser.email,
        newStatus: status,
        reason: reason || "Action administrative Développeur",
      },
      userEmail: auth.email,
      userRole: "DEVELOPPEUR",
      schoolId: targetUser.school_id || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Compte passé au statut ${status}.`,
      status,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur." }, { status: 500 });
  }
}
