import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  verifySchoolUserSessionToken,
  SESSION_COOKIE_NAME,
  getSessionTokenFromCookies,
} from "@/lib/server/session";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ygygqilnecwuotbvmbvs.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_0VKUsvbPLWJnALi_C1OUpA_UwHrhfHC";
// La clé service_role reste STRICTEMENT côté serveur dans les variables d'environnement
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Client Supabase administratif pour le serveur uniquement (bypasses RLS de manière contrôlée).
 * ATTENTION : Ne JAMAIS exporter ce client côté client (navigateur) !
 */
export function getServerSupabaseAdmin() {
  const keyToUse = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  return createClient(SUPABASE_URL, keyToUse, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Contexte utilisateur authentifié côté serveur.
 * Extrait school_id directement de la session vérifiée, JAMAIS du payload client.
 */
export interface AuthenticatedUserContext {
  userId: string;
  email: string;
  schoolId: string;
  role: string;
  fullName: string;
  status: "active" | "suspended" | "banned";
  permissions: string[];
}

/**
 * Valide et extrait le contexte de sécurité de l'utilisateur à partir du cookie de session.
 * Rejette toute session absente, expirée, suspendue ou bannie.
 */
export async function requireServerUserContext(
  req?: Request
): Promise<
  | { success: true; user: AuthenticatedUserContext }
  | { success: false; status: number; error: string }
> {
  let token: string | null = null;

  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    }
  }

  if (!token) {
    token = await getSessionTokenFromCookies();
  }

  if (!token) {
    return { success: false, status: 401, error: "Session non authentifiée." };
  }

  const verified = verifySchoolUserSessionToken(token);
  if (!verified.valid || !verified.userId) {
    return { success: false, status: 401, error: "Jeton de session invalide ou expiré." };
  }

  const supabaseAdmin = getServerSupabaseAdmin();
  const { data: dbUser, error } = await supabaseAdmin
    .from("school_users")
    .select("id, school_id, email, full_name, role, status, permissions")
    .eq("id", verified.userId)
    .maybeSingle();

  if (error || !dbUser) {
    return { success: false, status: 401, error: "Utilisateur introuvable." };
  }

  // Normalisation du statut
  const rawStatus = (dbUser.status || "ACTIF").toLowerCase();
  let normalizedStatus: "active" | "suspended" | "banned" = "active";
  if (rawStatus === "suspendu" || rawStatus === "suspended") {
    normalizedStatus = "suspended";
  } else if (rawStatus === "banni" || rawStatus === "banned") {
    normalizedStatus = "banned";
  }

  if (normalizedStatus !== "active") {
    return {
      success: false,
      status: 403,
      error:
        normalizedStatus === "banned"
          ? "Ce compte a été définitivement banni de la plateforme."
          : "Ce compte utilisateur est suspendu. Veuillez contacter la Direction de votre établissement.",
    };
  }

  if (!dbUser.school_id) {
    return { success: false, status: 403, error: "Aucun établissement associé à cet utilisateur." };
  }

  return {
    success: true,
    user: {
      userId: dbUser.id,
      email: dbUser.email,
      schoolId: dbUser.school_id,
      role: (dbUser.role || "enseignant").toLowerCase(),
      fullName: dbUser.full_name,
      status: normalizedStatus,
      permissions: Array.isArray(dbUser.permissions) ? dbUser.permissions : [],
    },
  };
}
