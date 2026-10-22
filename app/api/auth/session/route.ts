import { NextResponse } from "next/server";
import { getServerSupabaseAdmin } from "@/lib/server/supabase-admin";

const supabase = getServerSupabaseAdmin();
import {
  verifySchoolUserSessionToken,
  createSchoolUserSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  getSessionTokenFromCookies,
} from "@/lib/server/session";

function formatUserData(user: any, school: any) {
  const permissions = Array.isArray(user.permissions) ? user.permissions : [];
  const storedIdentifier = permissions
    .find((p: string) => typeof p === "string" && p.startsWith("IDENTIFIER:"))
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
  const identifier = storedIdentifier || (cleanCode ? `${cleanCode}${fallbackPrefix}01` : "USR01");
  const fonction = cleanRole === "directeur" ? "Direction Générale" : user.role;

  return {
    id: user.id,
    identifier,
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
  };
}

/**
 * GET /api/auth/session — Vérifie la session active directement dans Supabase via le cookie sécurisé.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    let token = await getSessionTokenFromCookies();

    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    }

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Aucun jeton de session fourni." },
        { status: 401 }
      );
    }

    const verified = verifySchoolUserSessionToken(token);
    if (!verified.valid || !verified.userId) {
      const response = NextResponse.json(
        { valid: false, error: "Jeton de session invalide ou expiré." },
        { status: 401 }
      );
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    const { isSessionRevokedInDatabase } = await import("@/lib/server/session");
    const isRevoked = await isSessionRevokedInDatabase(token);
    if (isRevoked) {
      const response = NextResponse.json(
        { valid: false, error: "Cette session a été déconnectée à distance par l'administrateur ou a expiré." },
        { status: 401 }
      );
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    // Requête directe auprès de la base Supabase (source unique de vérité)
    const { data: user, error } = await supabase
      .from("school_users")
      .select("*")
      .eq("id", verified.userId)
      .maybeSingle();

    if (error || !user) {
      const response = NextResponse.json(
        { valid: false, error: "Compte introuvable dans Supabase." },
        { status: 401 }
      );
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    const rawStatus = (user.status || "active").toLowerCase();
    if (rawStatus === "suspendu" || rawStatus === "suspended" || rawStatus === "banni" || rawStatus === "banned") {
      const response = NextResponse.json(
        {
          valid: false,
          error:
            rawStatus.includes("bann")
              ? "Ce compte a été définitivement banni de la plateforme."
              : "Ce compte utilisateur est actuellement suspendu. Veuillez contacter votre administration.",
        },
        { status: 403 }
      );
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    // Récupérer l'établissement associé dans Supabase
    let school = null;
    if (user.school_id) {
      const { data: schoolData } = await supabase
        .from("schools")
        .select("*")
        .eq("id", user.school_id)
        .maybeSingle();
      school = schoolData;
    }

    const formattedUser = formatUserData(user, school);

    return NextResponse.json({
      valid: true,
      user: formattedUser,
      school,
    });
  } catch (err: any) {
    console.error("[api/auth/session:GET] Erreur vérification Supabase :", err);
    return NextResponse.json(
      { valid: false, error: "Service de vérification Supabase momentanément indisponible." },
      { status: 503 }
    );
  }
}

/**
 * POST /api/auth/session — Vérifie la session avec un identifiant ou email, ou régénère le jeton.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let { userId, email } = body;

    // Si aucun paramètre dans le corps, vérifier depuis le cookie
    if (!userId && !email) {
      const token = await getSessionTokenFromCookies();
      if (token) {
        const verified = verifySchoolUserSessionToken(token);
        if (verified.valid) {
          userId = verified.userId;
          email = verified.email;
        }
      }
    }

    if (!userId && !email) {
      return NextResponse.json(
        { valid: false, error: "Identifiant ou adresse e-mail requis." },
        { status: 400 }
      );
    }

    let query = supabase.from("school_users").select("*");
    if (userId) {
      query = query.eq("id", userId);
    } else {
      query = query.eq("email", email.toLowerCase().trim());
    }

    const { data: user, error } = await query.maybeSingle();

    if (error || !user) {
      const response = NextResponse.json(
        { valid: false, error: "Session invalide ou compte introuvable dans Supabase." },
        { status: 401 }
      );
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    const rawStatus = (user.status || "active").toLowerCase();
    if (rawStatus === "suspendu" || rawStatus === "suspended" || rawStatus === "banni" || rawStatus === "banned") {
      const response = NextResponse.json(
        {
          valid: false,
          error:
            rawStatus.includes("bann")
              ? "Ce compte a été définitivement banni de la plateforme."
              : "Ce compte utilisateur est actuellement suspendu. Veuillez contacter votre administration.",
        },
        { status: 403 }
      );
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    // Récupérer l'établissement associé dans Supabase
    let school = null;
    if (user.school_id) {
      const { data: schoolData } = await supabase
        .from("schools")
        .select("*")
        .eq("id", user.school_id)
        .maybeSingle();
      school = schoolData;
    }

    const formattedUser = formatUserData(user, school);
    const sessionToken = createSchoolUserSessionToken(user.id, user.email);

    const response = NextResponse.json({
      valid: true,
      user: formattedUser,
      school,
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (err: any) {
    console.error("[api/auth/session:POST] Erreur vérification Supabase :", err);
    return NextResponse.json(
      { valid: false, error: "Service de vérification Supabase momentanément indisponible." },
      { status: 503 }
    );
  }
}

/**
 * DELETE /api/auth/session — Déconnexion : traçabilité et suppression du cookie de session sécurisé.
 */
export async function DELETE(request: Request) {
  try {
    const token = await getSessionTokenFromCookies();
    if (token) {
      const verified = verifySchoolUserSessionToken(token);
      if (verified.valid && verified.userId) {
        const { data: user } = await supabase
          .from("school_users")
          .select("id, full_name, email, role, school_id")
          .eq("id", verified.userId)
          .maybeSingle();

        if (user) {
          const { data: school } = await supabase
            .from("schools")
            .select("name")
            .eq("id", user.school_id)
            .maybeSingle();

          const { logAuthEvent } = await import("@/lib/server/audit-logger");
          await logAuthEvent({
            schoolId: user.school_id,
            schoolName: school?.name,
            userId: user.id,
            userName: user.full_name,
            role: user.role,
            email: user.email,
            action: "LOGOUT",
          });
        }
      }
    }
  } catch {}

  const response = NextResponse.json({
    success: true,
    message: "Session fermée avec succès.",
  });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
