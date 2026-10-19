import { NextResponse } from "next/server";
import { requireServerUserContext, getServerSupabaseAdmin } from "@/lib/server/supabase-admin";
import { assertRolePermission } from "@/lib/server/permissions-matrix";
import { recordAuditEvent } from "@/lib/server/audit-logger";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Normalisation des statuts utilisateur
function normalizeUserStatus(rawStatus?: string): "active" | "suspended" | "banned" {
  const s = (rawStatus || "active").toLowerCase().trim();
  if (s === "suspendu" || s === "suspended") return "suspended";
  if (s === "banni" || s === "banned") return "banned";
  return "active";
}

// 1. Lister les membres d'administration de l'établissement (isolé à l'établissement du serveur)
export async function GET(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }
    const { user } = authResult;

    try {
      assertRolePermission(user, "users", "read");
    } catch (permErr: any) {
      return NextResponse.json({ success: false, error: permErr.message }, { status: 403 });
    }

    const supabaseAdmin = getServerSupabaseAdmin();
    const { data: users, error } = await supabaseAdmin
      .from("school_users")
      .select("id, school_id, email, full_name, role, phone, status, permissions, created_at, updated_at")
      .eq("school_id", user.schoolId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[api/auth/users:GET] Erreur lecture :", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, users: users || [] });
  } catch (err: any) {
    console.error("[api/auth/users:GET] Exception :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

// 2. Créer un nouveau membre par le Directeur / Admin
export async function POST(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }
    const { user } = authResult;

    try {
      assertRolePermission(user, "users", "create");
    } catch (permErr: any) {
      return NextResponse.json({ success: false, error: permErr.message }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      role = "enseignant",
      password = "Password123!",
      permissions = [],
      status = "active",
    } = body;

    const normalizedEmail = (email || "").trim().toLowerCase();

    // Validation e-mail
    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "Adresse e-mail valide obligatoire (ex: agent@ecole.bj)." },
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

    const supabaseAdmin = getServerSupabaseAdmin();

    // Vérification unicité e-mail
    const { data: existingUser } = await supabaseAdmin
      .from("school_users")
      .select("id, email")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Cette adresse e-mail est déjà utilisée pour un autre compte." },
        { status: 409 }
      );
    }

    // Hachage sécurisé PBKDF2
    let passwordHash = `hash_${Date.now()}`;
    try {
      const { hashPasswordPbkdf2 } = await import("@/lib/server/dev-auth");
      passwordHash = hashPasswordPbkdf2(password || "Password123!");
    } catch {}

    const normalizedStatus = normalizeUserStatus(status);

    // Insertion avec school_id provenant IMPÉRATIVEMENT de la session serveur
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from("school_users")
      .insert({
        school_id: user.schoolId,
        email: normalizedEmail,
        full_name: name.trim(),
        role: role.toLowerCase(),
        phone: phone || "",
        status: normalizedStatus,
        permissions,
        password_hash: passwordHash,
      })
      .select("id, school_id, email, full_name, role, phone, status, permissions, created_at")
      .single();

    if (insertError) {
      console.error("[api/auth/users:POST] Erreur insertion :", insertError);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    // Journalisation d'audit unifiée
    await recordAuditEvent({
      schoolId: user.schoolId,
      userId: user.userId,
      role: user.role,
      action: "CREATION_UTILISATEUR",
      resourceType: "users",
      resourceId: newUser.id,
      newData: {
        email: normalizedEmail,
        fullName: name.trim(),
        role: role.toLowerCase(),
        status: normalizedStatus,
      },
      req: request,
    });

    return NextResponse.json({
      success: true,
      message: `Compte ${role} créé avec succès.`,
      user: newUser,
    });
  } catch (err: any) {
    console.error("[api/auth/users:POST] Exception :", err);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création de l'utilisateur." },
      { status: 500 }
    );
  }
}

// 3. Modifier le statut ou les permissions d'un utilisateur (effet immédiat)
export async function PATCH(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }
    const { user } = authResult;

    try {
      assertRolePermission(user, "users", "update");
    } catch (permErr: any) {
      return NextResponse.json({ success: false, error: permErr.message }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, permissions } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID utilisateur requis." }, { status: 400 });
    }

    const supabaseAdmin = getServerSupabaseAdmin();

    // Vérifier que la cible appartient au même établissement
    const { data: targetUser, error: targetError } = await supabaseAdmin
      .from("school_users")
      .select("id, school_id, email, full_name, role, status")
      .eq("id", id)
      .eq("school_id", user.schoolId)
      .maybeSingle();

    if (targetError || !targetUser) {
      return NextResponse.json(
        { success: false, error: "Utilisateur introuvable dans votre établissement." },
        { status: 404 }
      );
    }

    const updates: any = {};
    let newStatus: string | undefined = undefined;
    if (status) {
      newStatus = normalizeUserStatus(status);
      updates.status = newStatus;
    }
    if (permissions) updates.permissions = permissions;
    updates.updated_at = new Date().toISOString();

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("school_users")
      .update(updates)
      .eq("id", id)
      .select("id, school_id, email, full_name, role, status, permissions, updated_at")
      .maybeSingle();

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // Journalisation d'audit
    await recordAuditEvent({
      schoolId: user.schoolId,
      userId: user.userId,
      role: user.role,
      action: newStatus && newStatus !== targetUser.status ? "MODIFICATION_STATUT_COMPTE" : "MODIFICATION_UTILISATEUR",
      resourceType: "users",
      resourceId: id,
      oldData: { status: targetUser.status },
      newData: updates,
      req: request,
    });

    return NextResponse.json({
      success: true,
      message: `Compte mis à jour avec effet immédiat.`,
      user: updated,
    });
  } catch (err: any) {
    console.error("[api/auth/users:PATCH] Exception :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

// 4. Supprimer un compte utilisateur de l'établissement
export async function DELETE(request: Request) {
  try {
    const authResult = await requireServerUserContext(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }
    const { user } = authResult;

    try {
      assertRolePermission(user, "users", "delete");
    } catch (permErr: any) {
      return NextResponse.json({ success: false, error: permErr.message }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ success: false, error: "ID utilisateur requis." }, { status: 400 });
    }

    if (userId === user.userId) {
      return NextResponse.json(
        { success: false, error: "Vous ne pouvez pas supprimer votre propre compte administrateur." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getServerSupabaseAdmin();

    // Vérifier l'appartenance à l'établissement
    const { data: targetUser, error: targetError } = await supabaseAdmin
      .from("school_users")
      .select("id, school_id, email, full_name, role")
      .eq("id", userId)
      .eq("school_id", user.schoolId)
      .maybeSingle();

    if (targetError || !targetUser) {
      return NextResponse.json(
        { success: false, error: "Utilisateur introuvable dans votre établissement." },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from("school_users")
      .delete()
      .eq("id", userId);

    if (deleteError) {
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
    }

    // Journal d'audit
    await recordAuditEvent({
      schoolId: user.schoolId,
      userId: user.userId,
      role: user.role,
      action: "SUPPRESSION_UTILISATEUR",
      resourceType: "users",
      resourceId: userId,
      oldData: { email: targetUser.email, fullName: targetUser.full_name, role: targetUser.role },
      req: request,
    });

    return NextResponse.json({
      success: true,
      message: "Utilisateur supprimé avec succès.",
    });
  } catch (err: any) {
    console.error("[api/auth/users:DELETE] Exception :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
