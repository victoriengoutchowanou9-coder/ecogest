import { NextResponse } from "next/server";
import { recordSystemAuditLog, requireDeveloperAuth } from "@/lib/server/dev-auth";

export async function POST() {
  const auth = await requireDeveloperAuth();

  if (auth.authenticated && auth.email) {
    await recordSystemAuditLog({
      eventType: "DECONNEXION",
      severity: "INFO",
      actionTitle: "Déconnexion de l'administrateur technique",
      userEmail: auth.email,
      userRole: "DEVELOPPEUR",
      schoolName: "Administration Centrale ECOGEST",
    });
  }

  const response = NextResponse.json({
    success: true,
    message: "Session développeur terminée.",
  });

  // Suppression du cookie de session
  response.cookies.set("ecogest_dev_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
