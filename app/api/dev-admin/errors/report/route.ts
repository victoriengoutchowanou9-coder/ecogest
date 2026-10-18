import { NextResponse } from "next/server";
import { recordSystemAuditLog } from "@/lib/server/dev-auth";

/**
 * POST /api/dev-admin/errors/report
 * Endpoint public / client-side pour enregistrer automatiquement toute erreur applicative
 * ou exception côté client ("Application error: a client-side exception has occurred...").
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      message = "Application error: a client-side exception has occurred",
      stack = "",
      page = "",
      module = "Client Interface",
      userEmail = "",
      userRole = "",
      schoolName = "",
      schoolId = "",
      userAgent = "",
    } = body;

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Client";

    await recordSystemAuditLog({
      eventType: "APPLICATION_ERROR",
      severity: "ERROR",
      actionTitle: `Erreur Client: ${String(message).slice(0, 120)}`,
      details: {
        error_message: message,
        stack,
        page,
        module,
        status: "NOUVELLE",
        user_agent: userAgent || request.headers.get("user-agent") || "",
        reported_at: new Date().toISOString(),
      },
      userEmail: userEmail || undefined,
      userRole: userRole || undefined,
      schoolId: schoolId || undefined,
      schoolName: schoolName || "Application Client",
      ipAddress: ip.split(",")[0].trim(),
    });

    return NextResponse.json({ success: true, message: "Erreur enregistrée." });
  } catch (err: any) {
    return NextResponse.json({ error: "Impossible d'enregistrer l'erreur." }, { status: 500 });
  }
}
