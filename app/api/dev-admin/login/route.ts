import { NextResponse } from "next/server";
import {
  verifyDeveloperCredentialsAsync,
  createDeveloperSessionToken,
  recordSystemAuditLog,
  DEV_ADMIN_EMAIL,
  DEV_ADMIN_IDENTIFIER,
} from "@/lib/server/dev-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier = body.identifier || body.email;
    const passkey = body.passkey || body.password;

    if (!identifier || !passkey) {
      return NextResponse.json(
        { error: "Identifiant unique (ex: DEV-ROOT-001) et mot de passe développeur requis." },
        { status: 400 }
      );
    }

    const authCheck = await verifyDeveloperCredentialsAsync(identifier, passkey);

    if (!authCheck.valid) {
      await recordSystemAuditLog({
        eventType: "ERREUR_AUTH",
        severity: "WARNING",
        actionTitle: "Tentative d'accès non autorisée à l'Espace Développeur",
        details: { attempted_identifier: String(identifier).slice(0, 50) },
        userEmail: String(identifier).slice(0, 50),
        userRole: "INCONNU",
        schoolName: "Administration Centrale ECOGEST",
      });

      return NextResponse.json(
        { error: "Accès refusé. Identifiant technique ou mot de passe invalide." },
        { status: 401 }
      );
    }

    // Authentification réussie
    const targetEmail = authCheck.email || DEV_ADMIN_EMAIL;
    const sessionToken = createDeveloperSessionToken(targetEmail);

    await recordSystemAuditLog({
      eventType: "CONNEXION",
      severity: "INFO",
      actionTitle: "Connexion autorisée du Développeur / Administrateur Technique",
      details: {
        identifier: DEV_ADMIN_IDENTIFIER,
        client: "Console Développeur ECOGEST",
        mechanism: "POSTGRES_PBKDF2_SECURE",
      },
      userEmail: targetEmail,
      userRole: "DEVELOPPEUR",
      schoolName: "Administration Centrale ECOGEST",
    });

    const response = NextResponse.json({
      success: true,
      message: "Authentification développeur réussie.",
      developer: {
        identifier: DEV_ADMIN_IDENTIFIER,
        email: targetEmail,
        role: "DEVELOPPEUR",
      },
    });

    // Cookie de session sécurisé HttpOnly
    response.cookies.set("ecogest_dev_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 heures
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[dev-login] Error:", error);
    return NextResponse.json(
      { error: "Erreur interne lors de l'authentification développeur." },
      { status: 500 }
    );
  }
}
