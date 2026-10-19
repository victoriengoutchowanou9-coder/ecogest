import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Interception de l'ancienne URL /dev-admin/connexion -> redirection directe vers /connexion
  if (pathname === "/dev-admin/connexion" || pathname === "/dev-admin/connexion/") {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    return NextResponse.redirect(url);
  }

  // Protection stricte de tout l'espace d'administration développeur (/dev-admin/*)
  if (pathname.startsWith("/dev-admin")) {
    const devSession = request.cookies.get("ecogest_dev_session")?.value;

    if (!devSession) {
      // Aucune session développeur : redirection silencieuse vers la page de connexion standard
      const url = request.nextUrl.clone();
      url.pathname = "/connexion";
      return NextResponse.redirect(url);
    }

    try {
      // Validation rapide de la structure du jeton de session (base64url avec 4 composants)
      const raw = Buffer.from(devSession, "base64url").toString("utf8");
      const parts = raw.split(":");
      if (parts.length !== 4) {
        const url = request.nextUrl.clone();
        url.pathname = "/connexion";
        return NextResponse.redirect(url);
      }

      const timestamp = parseInt(parts[1], 10);
      const maxAgeMs = 24 * 60 * 60 * 1000; // 24h
      if (isNaN(timestamp) || Date.now() - timestamp > maxAgeMs) {
        const url = request.nextUrl.clone();
        url.pathname = "/connexion";
        return NextResponse.redirect(url);
      }
    } catch {
      const url = request.nextUrl.clone();
      url.pathname = "/connexion";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dev-admin",
    "/dev-admin/:path*",
  ],
};
