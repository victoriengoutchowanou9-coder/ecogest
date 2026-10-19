import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user, school } = body;

    if (!user || (!user.email && !user.identifier)) {
      return NextResponse.json({ success: false, error: "Données utilisateur manquantes" }, { status: 400 });
    }

    const schoolName = (school?.name || user.schoolName || "Établissement").trim();
    const rawSchoolCode = (school?.code || user.schoolCode || "").toString().trim();
    const schoolCode = /^\d{4}$/.test(rawSchoolCode) ? rawSchoolCode : "0000";
    const userRole = (user.role || "directeur").toLowerCase();
    const userEmail = (user.email || "").trim().toLowerCase();
    const userName = (user.fullName || user.full_name || user.name || "Responsable").trim();
    const userPhone = user.phone || school?.phone || "";
    const userIdentifier = user.identifier || `${schoolCode}DIR01`;

    // 1. Vérifier ou insérer l'école dans Supabase
    let targetSchoolId = school?.id || user.schoolId;

    if (schoolCode && schoolCode !== "0000") {
      const { data: existingSchoolByCode } = await supabase
        .from("schools")
        .select("id, code, name")
        .eq("code", schoolCode)
        .maybeSingle();

      if (existingSchoolByCode) {
        targetSchoolId = existingSchoolByCode.id;
      }
    }

    if (!targetSchoolId) {
      const slug = `${schoolName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Math.floor(10 + Math.random() * 90)}`;
      const { data: createdSchool, error: schoolErr } = await supabase
        .from("schools")
        .insert({
          code: schoolCode,
          name: schoolName,
          short_name: schoolName.slice(0, 20),
          slug,
          country: school?.country || "Bénin",
          region: school?.region || school?.department || "Littoral",
          city: school?.city || "Cotonou",
          address: `${school?.city || "Cotonou"}, ${school?.country || "Bénin"}`,
          phone: userPhone,
          email: userEmail,
          currency: "FCFA",
          active_year: "2026-2027",
        })
        .select()
        .single();

      if (!schoolErr && createdSchool) {
        targetSchoolId = createdSchool.id;
      }
    }

    // 2. Vérifier ou insérer l'utilisateur dans Supabase
    let existingUser = null;
    if (userEmail) {
      const { data } = await supabase
        .from("school_users")
        .select("*")
        .eq("email", userEmail)
        .maybeSingle();
      existingUser = data;
    }

    const permissions = [
      "ALL",
      `CODE:${schoolCode}`,
      `IDENTIFIER:${userIdentifier}`,
      userRole === "directeur" ? "FONCTION:Direction Générale" : `FONCTION:${userRole.toUpperCase()}`,
    ];

    if (!existingUser) {
      let passwordHash = `hash_${Date.now()}`;
      try {
        const { hashPasswordPbkdf2 } = await import("@/lib/server/dev-auth");
        passwordHash = hashPasswordPbkdf2(user.password || "Password123!");
      } catch {}

      await supabase.from("school_users").insert({
        school_id: targetSchoolId || null,
        email: userEmail || `${userIdentifier.toLowerCase()}@ecogest.bj`,
        password_hash: passwordHash,
        full_name: userName,
        role: userRole,
        phone: userPhone,
        status: user.status || "ACTIF",
        permissions,
      });
    } else {
      // Mettre à jour si des permissions manquent
      const currentPerms = Array.isArray(existingUser.permissions) ? existingUser.permissions : [];
      const hasId = currentPerms.some((p: string) => p.startsWith("IDENTIFIER:"));
      const hasCode = currentPerms.some((p: string) => p.startsWith("CODE:"));

      if (!hasId || !hasCode || !existingUser.school_id) {
        const mergedPerms = Array.from(new Set([...currentPerms, ...permissions]));
        await supabase
          .from("school_users")
          .update({
            school_id: existingUser.school_id || targetSchoolId,
            permissions: mergedPerms,
            status: "ACTIF",
          })
          .eq("id", existingUser.id);
      }
    }

    return NextResponse.json({
      success: true,
      schoolId: targetSchoolId,
      message: "Synchronisation réussie avec Supabase",
    });
  } catch (err: any) {
    console.error("[api/auth/sync] Erreur synchronisation :", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
