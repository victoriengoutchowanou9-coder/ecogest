import { NextResponse } from "next/server";
import {
  requireDeveloperAuth,
  getSupabaseAdminClient,
  recordSystemAuditLog,
  DEV_ADMIN_IDENTIFIER,
  DEV_ADMIN_EMAIL,
} from "@/lib/server/dev-auth";

/**
 * GET /api/dev-admin/profile
 * Récupère les données du profil développeur actuel.
 */
export async function GET() {
  const auth = await requireDeveloperAuth();
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Session développeur requise." }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();

  try {
    const { data: devUser } = await supabase
      .from("school_users")
      .select("id, full_name, email, phone, role, status, permissions, created_at, updated_at")
      .eq("role", "DEVELOPPEUR")
      .maybeSingle();

    return NextResponse.json({
      success: true,
      profile: {
        identifier: DEV_ADMIN_IDENTIFIER,
        fullName: devUser?.full_name || "Administrateur Technique ECOGEST",
        email: devUser?.email || auth.email || DEV_ADMIN_EMAIL,
        phone: devUser?.phone || "+2290155445122",
        role: "DEVELOPPEUR",
        roleLabel: "Développeur / Administrateur Technique",
        status: devUser?.status || "ACTIF",
        permissions: devUser?.permissions || [
          "SUPER_ADMIN",
          "SYSTEM_AUDIT",
          "VIEW_ALL_SCHOOLS",
          "SUPERVISION_TECHNIQUE",
        ],
        createdAt: devUser?.created_at || "2026-10-16T00:00:00Z",
        updatedAt: devUser?.updated_at || new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur." }, { status: 500 });
  }
}

/**
 * PATCH /api/dev-admin/profile
 * Permet au développeur de modifier ses informations autorisées (nom, téléphone).
 */
export async function PATCH(request: Request) {
  const auth = await requireDeveloperAuth();
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Session développeur requise." }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();

  try {
    const body = await request.json();
    const { fullName, phone } = body;

    const updates: any = { updated_at: new Date().toISOString() };
    if (fullName && fullName.trim()) updates.full_name = fullName.trim();
    if (phone && phone.trim()) updates.phone = phone.trim();

    const { data, error } = await supabase
      .from("school_users")
      .update(updates)
      .eq("role", "DEVELOPPEUR")
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await recordSystemAuditLog({
      eventType: "MODIF_PROFIL",
      severity: "INFO",
      actionTitle: "Mise à jour des informations du profil Développeur",
      details: { updates },
      userEmail: auth.email,
      userRole: "DEVELOPPEUR",
      schoolName: "Administration Centrale ECOGEST",
    });

    return NextResponse.json({
      success: true,
      message: "Profil mis à jour avec succès.",
      profile: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur." }, { status: 500 });
  }
}
