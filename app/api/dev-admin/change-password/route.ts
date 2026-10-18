import { NextResponse } from "next/server";
import {
  requireDeveloperAuth,
  changeDeveloperPasswordAsync,
  DEV_ADMIN_EMAIL,
} from "@/lib/server/dev-auth";

export async function POST(request: Request) {
  const auth = await requireDeveloperAuth();

  if (!auth.authenticated) {
    return NextResponse.json(
      { error: "Accès non autorisé. Session développeur requise." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Le mot de passe actuel et le nouveau mot de passe sont requis." },
        { status: 400 }
      );
    }

    if (newPassword.trim().length < 8) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit comporter au moins 8 caractères." },
        { status: 400 }
      );
    }

    const email = auth.email || DEV_ADMIN_EMAIL;
    const result = await changeDeveloperPasswordAsync(email, currentPassword, newPassword);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Impossible de modifier le mot de passe." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mot de passe Développeur modifié avec succès et enregistré dans la base de données.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur serveur lors de la modification du mot de passe." },
      { status: 500 }
    );
  }
}
