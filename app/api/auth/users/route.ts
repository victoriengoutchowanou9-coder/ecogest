import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 1. Lister les membres d'administration de l'établissement
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");

    let query = supabase.from("school_users").select("*").order("created_at", { ascending: false });

    if (schoolId) {
      query = query.eq("school_id", schoolId);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error("[api/auth/users] Erreur lecture :", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

// 2. Créer un nouveau membre (Censeur, Comptable, Enseignant, etc.) par le Directeur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      schoolId,
      name,
      email,
      phone,
      role = "Enseignant",
      password = "Password123!",
      permissions = [],
    } = body;

    const normalizedEmail = (email || "").trim().toLowerCase();

    // Validation e-mail obligatoire
    if (!normalizedEmail) {
      return NextResponse.json(
        { success: false, error: "L'adresse e-mail est obligatoire." },
        { status: 400 }
      );
    }

    // Validation format e-mail
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "Format d'adresse e-mail invalide (ex: agent@ecole.bj)." },
        { status: 400 }
      );
    }

    // Nom obligatoire
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Le nom complet est obligatoire." },
        { status: 400 }
      );
    }

    // Vérification unicité de l'e-mail
    const { data: existingUser } = await supabase
      .from("school_users")
      .select("id, email")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Cette adresse e-mail est déjà utilisée pour un autre compte.",
        },
        { status: 409 }
      );
    }

    // Insertion
    const { data: newUser, error: insertError } = await supabase
      .from("school_users")
      .insert({
        school_id: schoolId || null,
        email: normalizedEmail,
        full_name: name.trim(),
        role: role.toLowerCase(),
        phone: phone || "",
        status: "ACTIF",
        permissions,
        password_hash: `hash_${Date.now()}`,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[api/auth/users] Erreur insertion :", insertError);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    // Journal d'audit développeur
    try {
      const { recordSystemAuditLog } = await import("@/lib/server/dev-auth");
      await recordSystemAuditLog({
        eventType: "CREATION_COMPTE",
        severity: "INFO",
        actionTitle: `Création du compte membre ${name.trim()} (${role})`,
        details: { email: normalizedEmail, role: role.toLowerCase(), permissionsCount: permissions.length },
        userEmail: normalizedEmail,
        userRole: role.toLowerCase(),
        schoolId: schoolId || undefined,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Compte ${role} créé avec succès.`,
      user: newUser,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création de l'utilisateur." },
      { status: 500 }
    );
  }
}

// 3. Modifier le statut d'un utilisateur (ACTIF / SUSPENDU)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, permissions } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID utilisateur requis." }, { status: 400 });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (permissions) updates.permissions = permissions;
    updates.updated_at = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from("school_users")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Audit log
    try {
      const { recordSystemAuditLog } = await import("@/lib/server/dev-auth");
      await recordSystemAuditLog({
        eventType: permissions ? "ATTRIBUTION_PERMISSION" : "MODIF_PROFIL",
        severity: "INFO",
        actionTitle: `Modification du compte utilisateur ${id} (Statut: ${status || "inchangé"})`,
        details: { userId: id, status, permissions },
      });
    } catch {}

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
