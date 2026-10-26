import { NextResponse } from "next/server";
import { getServerSupabaseAdmin } from "@/lib/server/supabase-admin";
import { createSchoolUserSessionToken, SESSION_COOKIE_NAME } from "@/lib/server/session";

/**
 * Route Callback Supabase Auth : /auth/callback
 * Traite le lien de confirmation d'e-mail (1-clic) ou le code d'échange PKCE
 * et redirige DIRECTEMENT l'utilisateur vers son espace dédié (Direction, Parent, Enseignant, Censeur, etc.)
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");

  const origin = requestUrl.origin;

  if (error) {
    console.error("[auth/callback] Erreur Supabase Auth :", error, error_description);
    return NextResponse.redirect(`${origin}/connexion?error=${encodeURIComponent(error_description || error)}`);
  }

  const rolePaths: Record<string, string> = {
    directeur: "/directeur",
    censeur: "/censeur",
    secretariat: "/secretariat",
    surveillant: "/surveillant",
    enseignant: "/enseignant",
    comptabilite: "/comptabilite",
    comptable: "/comptabilite",
    parent: "/parent",
  };

  if (code) {
    const supabase = getServerSupabaseAdmin();
    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        console.warn("[auth/callback] Erreur échange de code :", exchangeError.message);
        // Si l'échange échoue côté serveur, rediriger vers /connexion où le client JS gère le hash
        return NextResponse.redirect(`${origin}/connexion?confirmed=true`);
      }

      if (data?.user) {
        const user = data.user;
        const role = (user.user_metadata?.role || "directeur").toLowerCase();
        const schoolId = user.user_metadata?.school_id || "";
        const fullName = user.user_metadata?.full_name || user.email || "";

        // Créer un token de session ECOGEST sécurisé
        const sessionToken = createSchoolUserSessionToken(user.id, user.email || "");

        const targetUrl = next || rolePaths[role] || "/directeur";
        const response = NextResponse.redirect(`${origin}${targetUrl}`);

        response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 24 * 60 * 60, // 30 jours
        });

        return response;
      }
    } catch (err) {
      console.error("[auth/callback] Exception :", err);
    }
  }

  // Si pas de code (ex: flux implicite avec hash #access_token) ou après confirmation directe
  // Rediriger vers la page de connexion qui intercepte l'événement onAuthStateChange 1-clic et route vers l'espace
  return NextResponse.redirect(`${origin}/connexion?confirmed=true`);
}
