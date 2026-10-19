import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyPasswordPbkdf2 } from "@/lib/server/dev-auth";
import {
  createSchoolUserSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/server/session";

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

    // 3. Recherche par identifiant précis stocké dans les permissions (ex: 4345DIR01)
    if (!user) {
      try {
        const { data: usersByIdentifier } = await supabase
          .from("school_users")
          .select("*")
          .contains("permissions", JSON.stringify([`IDENTIFIER:${cleanQuery.toUpperCase()}`]));

        if (usersByIdentifier && usersByIdentifier.length > 0) {
          user = usersByIdentifier[0];
        }
      } catch {}
    }

    // 4. Recherche par identifiant de type 4 chiffres + Rôle (ex: 4345DIR01)
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

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Inconnu";

    if (!user) {
      return NextResponse.json(
        { success: false, notFound: true, error: "Identifiant ou adresse e-mail introuvable." },
        { status: 404 }
      );
    }

    const rawStatus = (user.status || "ACTIF").toUpperCase();
    if (rawStatus === "SUSPENDU" || rawStatus === "BANNI" || rawStatus === "BANNED") {
      try {
        const { logAuthEvent } = await import("@/lib/server/audit-logger");
        await logAuthEvent({
          schoolId: user.school_id,
          userId: user.id,
          role: user.role,
          email: user.email,
          action: "LOGIN_FAILED",
          failureReason: `Compte ${rawStatus.toLowerCase()}`,
          ip,
          userAgent,
        });
      } catch {}

      return NextResponse.json(
        {
          success: false,
          error:
            rawStatus === "BANNI" || rawStatus === "BANNED"
              ? "Ce compte a été définitivement banni de la plateforme."
              : "Ce compte utilisateur est actuellement suspendu. Veuillez contacter la Direction de votre établissement.",
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
      try {
        const { logAuthEvent } = await import("@/lib/server/audit-logger");
        await logAuthEvent({
          schoolId: user.school_id,
          userId: user.id,
          role: user.role,
          email: user.email,
          action: "LOGIN_FAILED",
          failureReason: "Mot de passe incorrect",
          ip,
          userAgent,
        });
      } catch {}

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

    // Journal d'audit de connexion dans audit_logs
    try {
      const { logAuthEvent } = await import("@/lib/server/audit-logger");
      await logAuthEvent({
        schoolId: user.school_id,
        userId: user.id,
        role: user.role,
        email: user.email,
        action: "LOGIN",
        ip,
        userAgent,
      });
    } catch {}

    const permissions = Array.isArray(user.permissions) ? user.permissions : [];
    const storedIdentifier = permissions
      .find((p: string) => p.startsWith("IDENTIFIER:"))
      ?.replace("IDENTIFIER:", "");
    const cleanRole = (user.role || "directeur").toLowerCase();
    const cleanCode = (school?.code || "").replace(/\D/g, "").slice(0, 4);
    const rolePrefixMap: Record<string, string> = {
      directeur: "DIR",
      censeur: "CEN",
      secretariat: "SEC",
      surveillant: "SUR",
      enseignant: "ENS",
      comptabilite: "CPT",
      parent: "PAR",
    };
    const fallbackPrefix = rolePrefixMap[cleanRole] || "USR";
    const userIdentifier = storedIdentifier || (cleanCode ? `${cleanCode}${fallbackPrefix}01` : "USR01");
    const fonction = cleanRole === "directeur" ? "Direction Générale" : user.role;

    const sessionToken = createSchoolUserSessionToken(user.id, user.email);
    const response = NextResponse.json({
      success: true,
      message: "Connexion réussie.",
      user: {
        id: user.id,
        identifier: userIdentifier,
        email: user.email,
        fullName: user.full_name,
        role: cleanRole,
        fonction,
        phone: user.phone || school?.phone || "",
        schoolId: user.school_id,
        schoolName: school?.name || "Établissement Scolaire",
        schoolCode: school?.code || "",
        status: user.status || "ACTIF",
        permissions,
      },
      school: school || null,
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    if (user.school_id) {
      try {
        const { registerSessionInDatabase } = await import("@/lib/server/session");
        await registerSessionInDatabase({
          schoolId: user.school_id,
          userId: user.id,
          sessionToken,
          req: request,
        });
      } catch {}
    }

    return response;
  } catch (err: any) {
    console.error("[api/auth/login] Erreur inattendue Supabase :", err);
    return NextResponse.json(
      {
        success: false,
        error: "Le service d'authentification Supabase est temporairement indisponible. Veuillez réessayer ultérieurement.",
      },
      { status: 503 }
    );
  }
}
