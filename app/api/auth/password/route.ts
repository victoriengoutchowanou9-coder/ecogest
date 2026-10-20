import { NextResponse } from "next/server";
import { getServerSupabaseAdmin } from "@/lib/server/supabase-admin";

const supabase = getServerSupabaseAdmin();
import { hashPasswordPbkdf2 } from "@/lib/server/dev-auth";
import { verifyOtpCode, consumeVerificationToken, OtpChannel } from "@/lib/server/otp";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      action,
      identifierOrEmail,
      oldPassword,
      newPassword,
      otp,
      channel = "EMAIL",
      verificationToken,
    } = body;

    const query = (identifierOrEmail || "").trim().toLowerCase();

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const { checkAndIncrementRateLimit, createSecurityAlert } = await import("@/lib/server/rate-limiter");
    const rateCheck = await checkAndIncrementRateLimit({
      key: `pwd:${clientIp}`,
      maxAttempts: 5,
      windowSeconds: 15 * 60,
      blockDurationSeconds: 15 * 60,
    });

    if (!rateCheck.allowed) {
      await createSecurityAlert({
        severity: "HIGH",
        alertType: "SUSPICION_BRUTE_FORCE_PASSWORD",
        title: "Tentatives excessives de modification ou réinitialisation de mot de passe",
        description: `Blocage temporaire appliqué sur l'IP ${clientIp} après dépassement du quota autorisable.`,
        ipAddress: clientIp,
        metadata: { target: query, retryAfterSeconds: rateCheck.retryAfterSeconds },
        req: request,
      });

      return NextResponse.json(
        {
          success: false,
          error: `Trop de requêtes de mot de passe. Veuillez patienter ${Math.ceil(
            (rateCheck.retryAfterSeconds || 900) / 60
          )} minutes.`,
        },
        { status: 429 }
      );
    }

    // 1. Changement direct de mot de passe par l'utilisateur connecté
    if (action === "change") {
      if (!query || !oldPassword || !newPassword) {
        return NextResponse.json(
          { success: false, error: "Identifiant, ancien mot de passe et nouveau mot de passe requis." },
          { status: 400 }
        );
      }

      if (newPassword.trim().length < 8) {
        return NextResponse.json(
          { success: false, error: "Le nouveau mot de passe doit comporter au moins 8 caractères." },
          { status: 400 }
        );
      }

      try {
        const { data: user } = await supabase
          .from("school_users")
          .select("id, email, password_hash, school_id, role")
          .or(`email.eq.${query},phone.eq.${query}`)
          .maybeSingle();

        if (user) {
          const newHash = hashPasswordPbkdf2(newPassword.trim());
          await supabase
            .from("school_users")
            .update({
              password_hash: newHash,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

          try {
            const { logAuthEvent } = await import("@/lib/server/audit-logger");
            if (user.school_id) {
              await logAuthEvent({
                schoolId: user.school_id,
                userId: user.id,
                role: user.role,
                email: user.email,
                action: "PASSWORD_CHANGE",
              });
            }
          } catch {}
        }
      } catch (dbErr) {
        console.warn("[api/auth/password] Note DB non bloquante :", dbErr);
      }

      return NextResponse.json({
        success: true,
        message: "Mot de passe mis à jour avec succès.",
      });
    }

    // 2. Réinitialisation sécurisée avec OTP
    if (action === "reset") {
      if (!query || (!otp && !verificationToken) || !newPassword) {
        return NextResponse.json(
          { success: false, error: "Identifiant, code de validation et nouveau mot de passe requis." },
          { status: 400 }
        );
      }

      if (newPassword.trim().length < 8) {
        return NextResponse.json(
          { success: false, error: "Le mot de passe doit comporter au moins 8 caractères." },
          { status: 400 }
        );
      }

      // Si un code OTP direct est fourni, le valider via le service serveur
      if (otp) {
        const vResult = await verifyOtpCode({
          target: query,
          channel: (channel as OtpChannel) || "EMAIL",
          purpose: "PASSWORD_RESET",
          code: otp.trim(),
        });

        if (!vResult.success) {
          return NextResponse.json(
            {
              success: false,
              error: vResult.error || "Code de validation incorrect.",
              remainingAttempts: vResult.remainingAttempts,
            },
            { status: 400 }
          );
        }
      } else if (verificationToken) {
        const isValid = consumeVerificationToken({
          target: query,
          purpose: "PASSWORD_RESET",
          token: verificationToken,
        });

        if (!isValid) {
          return NextResponse.json(
            { success: false, error: "Session de réinitialisation expirée ou invalide. Veuillez recommencer." },
            { status: 400 }
          );
        }
      }

      // Mise à jour sécurisée du mot de passe dans Supabase avec PBKDF2
      const newHash = hashPasswordPbkdf2(newPassword.trim());

      try {
        const { data: user } = await supabase
          .from("school_users")
          .select("id, email, phone")
          .or(`email.eq.${query},phone.eq.${query}`)
          .maybeSingle();

        if (user) {
          await supabase
            .from("school_users")
            .update({
              password_hash: newHash,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);
        }
      } catch (dbErr) {
        console.warn("[api/auth/password] Erreur mise à jour mot de passe DB :", dbErr);
      }

      return NextResponse.json({
        success: true,
        message: "Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter.",
      });
    }

    return NextResponse.json({ success: false, error: "Action non reconnue." }, { status: 400 });
  } catch (err: any) {
    console.error("[api/auth/password] Erreur serveur :", err);
    return NextResponse.json({ success: false, error: "Erreur serveur interne." }, { status: 500 });
  }
}
