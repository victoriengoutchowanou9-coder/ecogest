import { NextResponse } from "next/server";
import {
  verifyDeveloperCredentials,
  createDeveloperSessionToken,
  recordSystemAuditLog,
  DEV_ADMIN_EMAIL,
} from "@/lib/server/dev-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, passkey } = body;

    if (!email || !passkey) {
      return NextResponse.json(
        { error: "Identifiant et code de sécurité développeur requis." },
        { status: 400 }
      );
    }

    const isValid = verifyDeveloperCredentials(email, passkey);

    if (!isValid) {
      await recordSystemAuditLog({
        eventType: "ERREUR_AUTH",
        severity: "WARNING",
        actionTitle: "Tentative d'accès non autorisée à l'Espace Développeur",
        details: { attempted_email: String(email).slice(0, 50) },
        userEmail: String(email).slice(0, 50),
        userRole: "INCONNU",
      });

      return NextResponse.json(
        { error: "Accès refusé. Informations d'authentification invalides." },
        { status: 401 }
      );
    }

    // Authentification réussie
    const sessionToken = createDeveloperSessionToken(email.trim());

    await recordSystemAuditLog({
      eventType: "CONNEXION",
      severity: "INFO",
      actionTitle: "Connexion autorisée du Développeur / Administrateur Technique",
      details: { client: "Console Développeur ECOGEST" },
      userEmail: DEV_ADMIN_EMAIL,
      userRole: "DEVELOPPEUR",
      schoolName: "Administration Centrale ECOGEST",
    });

    const response = NextResponse.json({
      success: true,
      message: "Authentification développeur réussie.",
      developer: {
        email: DEV_ADMIN_EMAIL,
        role: "DEVELOPPEUR_ADMIN",
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
    return NextResponse.json(
      { error: "Erreur interne lors de l'authentification développeur." },
      { status: 500 }
    );
  }
}
