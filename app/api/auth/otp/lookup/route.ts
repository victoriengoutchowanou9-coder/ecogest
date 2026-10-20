import { NextResponse } from "next/server";
import { getServerSupabaseAdmin } from "@/lib/server/supabase-admin";

const supabase = getServerSupabaseAdmin();
import { maskEmail } from "@/lib/server/email";
import { maskPhoneNumber, normalizePhoneE164 } from "@/lib/server/sms";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { identifierOrEmail } = body;
    const query = (identifierOrEmail || "").trim();

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: "Veuillez renseigner votre identifiant, e-mail ou numéro de téléphone.",
        },
        { status: 400 }
      );
    }

    let user: any = null;

    // 1. Recherche par e-mail dans school_users
    const { data: usersByEmail } = await supabase
      .from("school_users")
      .select("id, email, phone, full_name, status")
      .ilike("email", query);

    if (usersByEmail && usersByEmail.length > 0) {
      user = usersByEmail[0];
    }

    // 2. Recherche par téléphone
    if (!user) {
      const normPhone = normalizePhoneE164(query);
      const { data: usersByPhone } = await supabase
        .from("school_users")
        .select("id, email, phone, full_name, status")
        .or(`phone.eq.${query},phone.eq.${normPhone}`);

      if (usersByPhone && usersByPhone.length > 0) {
        user = usersByPhone[0];
      }
    }

    // 3. Recherche par identifiant type 4 chiffres (ex: 4827DIR01)
    if (!user && /^\d{4}[A-Za-z]{3}\d{2}$/.test(query)) {
      const schoolCode = query.slice(0, 4);
      const rolePrefix = query.slice(4, 7).toUpperCase();

      const { data: school } = await supabase
        .from("schools")
        .select("id")
        .eq("code", schoolCode)
        .maybeSingle();

      if (school) {
        const roleMap: Record<string, string> = {
          DIR: "directeur",
          CEN: "censeur",
          SEC: "secretariat",
          SUR: "surveillant",
          ENS: "enseignant",
          CPT: "comptabilite",
          PAR: "parent",
        };
        const role = roleMap[rolePrefix];
        if (role) {
          const { data: users } = await supabase
            .from("school_users")
            .select("id, email, phone, full_name, status")
            .eq("school_id", school.id)
            .ilike("role", role);

          if (users && users.length > 0) {
            user = users[0];
          }
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Aucun compte correspondant à cet identifiant ou numéro n'a été trouvé.",
        },
        { status: 404 }
      );
    }

    if (user.status === "SUSPENDU") {
      return NextResponse.json(
        {
          success: false,
          error: "Ce compte est actuellement suspendu. Veuillez contacter la Direction de votre établissement.",
        },
        { status: 403 }
      );
    }

    const hasEmail = Boolean(user.email && user.email.includes("@"));
    const hasPhone = Boolean(user.phone && user.phone.replace(/\D/g, "").length >= 8);

    return NextResponse.json({
      success: true,
      fullName: user.full_name,
      email: user.email || "",
      maskedEmail: hasEmail ? maskEmail(user.email) : null,
      hasEmail,
      phone: user.phone || "",
      maskedPhone: hasPhone ? maskPhoneNumber(user.phone) : null,
      hasPhone,
    });
  } catch (err: any) {
    console.error("[api/auth/otp/lookup] Erreur :", err);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la recherche du compte." },
      { status: 500 }
    );
  }
}
