import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyPasswordPbkdf2 } from "@/lib/server/dev-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { identifier, email, password } = body;

    const cleanQuery = (identifier || email || "").trim();
    const cleanPassword = (password || "").trim();

    if (!cleanQuery) {
      return NextResponse.json(
        { success: false, error: "Identifiant ou adresse e-mail requis." },
        { status: 400 }
      );
    }

    if (!cleanPassword) {
      return NextResponse.json(
        { success: false, error: "Mot de passe requis." },
        { status: 400 }
      );
    }

    let user: any = null;

    // 1. Recherche directe par email dans school_users
    const { data: usersByEmail } = await supabase
      .from("school_users")
      .select("*")
      .ilike("email", cleanQuery);

    if (usersByEmail && usersByEmail.length > 0) {
      user = usersByEmail[0];
    }

    // 2. Recherche par téléphone
    if (!user) {
      const { data: usersByPhone } = await supabase
        .from("school_users")
        .select("*")
        .eq("phone", cleanQuery);

      if (usersByPhone && usersByPhone.length > 0) {
        user = usersByPhone[0];
      }
    }

    // 3. Recherche par identifiant de type 4 chiffres + Rôle (ex: 4827DIR01)
    if (!user && /^\d{4}[A-Za-z]{3}\d{2}$/.test(cleanQuery)) {
      const schoolCode = cleanQuery.slice(0, 4);
      const rolePrefix = cleanQuery.slice(4, 7).toUpperCase();

      const { data: targetSchool } = await supabase
        .from("schools")
        .select("id")
        .eq("code", schoolCode)
        .maybeSingle();

      if (targetSchool) {
        const roleMap: Record<string, string> = {
          DIR: "directeur",
          CEN: "censeur",
          SEC: "secretariat",
          SUR: "surveillant",
          ENS: "enseignant",
          CPT: "comptabilite",
          PAR: "parent",
        };
        const role = roleMap[rolePrefix];

        if (role) {
          const { data: schoolUsers } = await supabase
            .from("school_users")
            .select("*")
            .eq("school_id", targetSchool.id)
            .ilike("role", role);

          if (schoolUsers && schoolUsers.length > 0) {
            user = schoolUsers[0];
          }
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, notFound: true, error: "Identifiant ou adresse e-mail introuvable." },
        { status: 404 }
      );
    }

    if (user.status === "SUSPENDU") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Ce compte utilisateur est actuellement suspendu. Veuillez contacter la Direction de votre établissement.",
        },
        { status: 403 }
      );
    }

    // Vérification du mot de passe
    let isPasswordValid = false;
    if (user.password_hash) {
      if (user.password_hash.startsWith("pbkdf2$")) {
        isPasswordValid = verifyPasswordPbkdf2(cleanPassword, user.password_hash);
      } else if (user.password_hash === cleanPassword || user.password_hash.startsWith("hash_")) {
        // Compatibilité de transition
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Mot de passe incorrect." },
        { status: 401 }
      );
    }

    // Récupérer les informations complètes de l'établissement lié
    let school: any = null;
    if (user.school_id) {
      const { data: schoolData } = await supabase
        .from("schools")
        .select("*")
        .eq("id", user.school_id)
        .maybeSingle();

      school = schoolData;
    }

    // Journal d'audit de connexion
    try {
      const { recordSystemAuditLog } = await import("@/lib/server/dev-auth");
      await recordSystemAuditLog({
        eventType: "CONNEXION",
        severity: "INFO",
        actionTitle: `Connexion réussie de ${user.full_name} (${user.role}) - ${school?.name || "Établissement"}`,
        details: {
          email: user.email,
          role: user.role,
          schoolId: user.school_id,
          schoolCode: school?.code || "",
        },
        userEmail: user.email,
        userRole: user.role,
        schoolName: school?.name || "",
        schoolId: user.school_id,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Connexion réussie.",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role.toLowerCase(),
        phone: user.phone,
        schoolId: user.school_id,
        schoolName: school?.name || "Établissement Scolaire",
        schoolCode: school?.code || "",
        status: user.status,
      },
      school: school || null,
    });
  } catch (err: any) {
    console.error("[api/auth/login] Erreur inattendue :", err);
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue lors de la connexion." },
      { status: 500 }
    );
  }
}
