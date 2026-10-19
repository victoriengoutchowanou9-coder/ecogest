import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId, email } = body;

    if (!userId && !email) {
      return NextResponse.json({ valid: false, error: "Paramètres manquants." }, { status: 400 });
    }

    let query = supabase.from("school_users").select("*");
    if (userId) {
      query = query.eq("id", userId);
    } else {
      query = query.eq("email", email.toLowerCase().trim());
    }

    const { data: users, error } = await query.maybeSingle();

    if (error || !users) {
      return NextResponse.json(
        { valid: false, error: "Session invalide ou compte introuvable dans Supabase." },
        { status: 401 }
      );
    }

    if (users.status === "SUSPENDU") {
      return NextResponse.json(
        { valid: false, error: "Ce compte utilisateur est actuellement suspendu." },
        { status: 403 }
      );
    }

    // Récupérer l'établissement associé
    let school = null;
    if (users.school_id) {
      const { data: schoolData } = await supabase
        .from("schools")
        .select("*")
        .eq("id", users.school_id)
        .maybeSingle();
      school = schoolData;
    }

    const permissions = Array.isArray(users.permissions) ? users.permissions : [];
    const storedIdentifier = permissions
      .find((p: string) => p.startsWith("IDENTIFIER:"))
      ?.replace("IDENTIFIER:", "");
    const cleanRole = (users.role || "directeur").toLowerCase();
    const cleanCode = (school?.code || "").replace(/\D/g, "").slice(0, 4);
    const rolePrefixMap: Record<string, string> = {
      directeur: "DIR",
      censeur: "CEN",
      secretariat: "SEC",
      surveillant: "SUR",
      enseignant: "ENS",
      comptabilite: "CPT",
      parent: "PAR",
    };
    const fallbackPrefix = rolePrefixMap[cleanRole] || "USR";
    const identifier = storedIdentifier || (cleanCode ? `${cleanCode}${fallbackPrefix}01` : "USR01");
    const fonction = cleanRole === "directeur" ? "Direction Générale" : users.role;

    return NextResponse.json({
      valid: true,
      user: {
        id: users.id,
        identifier,
        email: users.email,
        fullName: users.full_name,
        role: cleanRole,
        fonction,
        phone: users.phone || school?.phone || "",
        schoolId: users.school_id,
        schoolName: school?.name || "Établissement Scolaire",
        schoolCode: school?.code || "",
        status: users.status || "ACTIF",
        permissions,
      },
      school,
    });
  } catch (err: any) {
    console.error("[api/auth/session] Erreur vérification session :", err);
    return NextResponse.json(
      { valid: false, error: "Service de vérification Supabase momentanément indisponible." },
      { status: 503 }
    );
  }
}
