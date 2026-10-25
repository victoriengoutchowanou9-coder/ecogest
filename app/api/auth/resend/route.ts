import { NextResponse } from "next/server";
import { getServerSupabaseAdmin } from "@/lib/server/supabase-admin";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    const normalizedEmail = (email || "").trim().toLowerCase();
    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "Adresse email invalide." },
        { status: 400 }
      );
    }

    // Détermination dynamique de l'origine pour la redirection (jamais localhost:3000 en production)
    const dynamicRedirectTo =
      body.redirectTo ||
      body.emailRedirectTo ||
      request.headers.get("origin") ||
      (request.headers.get("x-forwarded-host")
        ? `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("x-forwarded-host")}`
        : null) ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      "http://localhost:3000";

    const supabaseAdmin = getServerSupabaseAdmin();
    const { error } = await supabaseAdmin.auth.resend({
      type: "signup",
      email: normalizedEmail,
      options: {
        emailRedirectTo: dynamicRedirectTo,
      },
    });

    if (error) {
      console.warn("[api/auth/resend] Erreur Supabase resend :", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email de confirmation renvoyé avec succès.",
      redirectTo: dynamicRedirectTo,
    });
  } catch (err: any) {
    console.error("[api/auth/resend] Exception :", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors du renvoi de l'email." },
      { status: 500 }
    );
  }
}
