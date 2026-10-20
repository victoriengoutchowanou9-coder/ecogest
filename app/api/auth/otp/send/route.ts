import { NextResponse } from "next/server";
import { createAndStoreOtp, maskTarget, normalizeTarget, OtpChannel, OtpPurpose } from "@/lib/server/otp";
import { sendOtpEmail } from "@/lib/server/email";
import { sendOtpSms } from "@/lib/server/sms";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      purpose = "REGISTRATION",
      channel = "EMAIL",
      email = "",
      phone = "",
      fullName = "Utilisateur",
    } = body;

    const validatedPurpose: OtpPurpose =
      purpose === "PASSWORD_RESET" ? "PASSWORD_RESET" : "REGISTRATION";
    const validatedChannel: OtpChannel = channel === "SMS" ? "SMS" : "EMAIL";

    let target = "";

    if (validatedChannel === "EMAIL") {
      target = (email || "").trim().toLowerCase();
      if (!target || !EMAIL_REGEX.test(target)) {
        return NextResponse.json(
          {
            success: false,
            error: "Veuillez fournir une adresse e-mail valide pour recevoir le code.",
          },
          { status: 400 }
        );
      }
    } else {
      target = (phone || "").trim();
      if (!target || target.replace(/\D/g, "").length < 8) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Veuillez fournir un numéro de téléphone valide avec son indicatif international (ex : +229 XX XX XX XX).",
          },
          { status: 400 }
        );
      }
    }

    // Génération et enregistrement sécurisé du code OTP
    const otpResult = await createAndStoreOtp({
      target,
      channel: validatedChannel,
      purpose: validatedPurpose,
    });

    if (!otpResult.success || !otpResult.code) {
      return NextResponse.json(
        {
          success: false,
          error: otpResult.error || "Impossible d'envoyer le code pour le moment.",
          cooldownRemaining: otpResult.cooldownRemaining,
        },
        { status: otpResult.cooldownRemaining ? 429 : 400 }
      );
    }

    const masked = maskTarget(target, validatedChannel);
    let devCode: string | undefined = undefined;
    let providerUsed = "unknown";

    // Expédition selon le canal choisi
    if (validatedChannel === "EMAIL") {
      const emailRes = await sendOtpEmail({
        toEmail: target,
        fullName,
        otpCode: otpResult.code,
        purpose: validatedPurpose,
        expiresMinutes: 10,
      });

      if (!emailRes.success) {
        return NextResponse.json(
          {
            success: false,
            error: emailRes.error || "Échec de l'envoi de l'e-mail de confirmation. Veuillez vérifier la configuration SMTP ou choisir le SMS.",
          },
          { status: 500 }
        );
      }

      providerUsed = emailRes.provider;
      if (emailRes.devCode) {
        devCode = emailRes.devCode;
      }
    } else {
      const smsMessage =
        validatedPurpose === "REGISTRATION"
          ? `ECOGEST: Votre code de confirmation de compte est ${otpResult.code}. Valable 10 minutes. Ne le partagez pas.`
          : `ECOGEST: Votre code de réinitialisation de mot de passe est ${otpResult.code}. Valable 10 minutes.`;

      const smsRes = await sendOtpSms({
        toPhone: target,
        message: smsMessage,
      });

      if (!smsRes.success) {
        return NextResponse.json(
          {
            success: false,
            error: "Échec de l'envoi du SMS. Veuillez vérifier le numéro de téléphone ou choisir l'e-mail.",
          },
          { status: 500 }
        );
      }

      providerUsed = smsRes.provider;
      if (smsRes.provider === "ecogest_secure_sms") {
        devCode = otpResult.code;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Code de confirmation envoyé avec succès par ${
        validatedChannel === "EMAIL" ? "e-mail" : "SMS"
      } à ${masked}.`,
      channel: validatedChannel,
      maskedTarget: masked,
      cooldownSeconds: 60,
      devCode: devCode || (process.env.NODE_ENV !== "production" ? otpResult.code : undefined),
      provider: providerUsed,
    });
  } catch (err: any) {
    console.error("[api/auth/otp/send] Erreur :", err);
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue lors de l'envoi du code." },
      { status: 500 }
    );
  }
}
