import { NextResponse } from "next/server";
import { OtpChannel, OtpPurpose, verifyOtpCode } from "@/lib/server/otp";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      purpose = "REGISTRATION",
      channel = "EMAIL",
      target = "",
      code = "",
    } = body;

    const validatedPurpose: OtpPurpose =
      purpose === "PASSWORD_RESET" ? "PASSWORD_RESET" : "REGISTRATION";
    const validatedChannel: OtpChannel = channel === "SMS" ? "SMS" : "EMAIL";

    const cleanTarget = (target || "").trim();
    const cleanCode = (code || "").trim();

    if (!cleanTarget) {
      return NextResponse.json(
        { success: false, error: "Identifiant ou numéro de téléphone requis." },
        { status: 400 }
      );
    }

    if (!cleanCode || cleanCode.length !== 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Veuillez saisir le code complet à 6 chiffres.",
        },
        { status: 400 }
      );
    }

    const verifyResult = await verifyOtpCode({
      target: cleanTarget,
      channel: validatedChannel,
      purpose: validatedPurpose,
      code: cleanCode,
    });

    if (!verifyResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: verifyResult.error || "Code de validation incorrect.",
          remainingAttempts: verifyResult.remainingAttempts,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Code validé avec succès !",
      verificationToken: verifyResult.verificationToken,
    });
  } catch (err: any) {
    console.error("[api/auth/otp/verify] Erreur :", err);
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue lors de la vérification du code." },
      { status: 500 }
    );
  }
}
