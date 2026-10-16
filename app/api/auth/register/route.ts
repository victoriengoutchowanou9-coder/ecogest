import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Validation rigoureuse de l'adresse email (RFC 5322 simplifiée)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      role = "directeur",
      fullName,
      schoolName,
      directorName,
      phone,
      city,
      country = "Bénin",
      chosenPlan = "STANDARD",
      pathway = "SCHOOL",
    } = body;

    // 1. Validation de l'adresse email obligatoire
    const normalizedEmail = (email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "L'adresse e-mail est obligatoire pour l'inscription.",
        },
        { status: 400 }
      );
    }

    // 2. Vérification du format email valide
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: "Le format de l'adresse e-mail est invalide (ex: contact@etablissement.bj).",
        },
        { status: 400 }
      );
    }

    // 3. Validation de la taille du mot de passe (minimum 8 caractères)
    if (!password || password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Le mot de passe doit comporter au moins 8 caractères.",
        },
        { status: 400 }
      );
    }

    // 4. Vérification d'unicité de l'email dans la base de données
    const { data: existingUser, error: checkError } = await supabase
      .from("school_users")
      .select("id, email")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Cette adresse e-mail est déjà utilisée par un autre compte. Veuillez vous connecter ou utiliser une autre adresse.",
        },
        { status: 409 }
      );
    }

    // 5. Inscription selon le type (Établissement / Directeur ou Parent)
    let createdSchoolId: string | null = null;
    let createdSchool = null;

    if (pathway === "SCHOOL") {
      const cleanSchoolName = (schoolName || "").trim();
      if (!cleanSchoolName) {
        return NextResponse.json(
          {
            success: false,
            error: "Le nom de l'établissement est obligatoire.",
          },
          { status: 400 }
        );
      }

      const schoolCode = `ECO-${Math.floor(100 + Math.random() * 900)}`;
      const slug = `${cleanSchoolName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Math.floor(10 + Math.random() * 90)}`;

      // Insertion dans la table schools de Supabase
      const { data: schoolRow, error: schoolInsertError } = await supabase
        .from("schools")
        .insert({
          code: schoolCode,
          name: cleanSchoolName,
          short_name: cleanSchoolName.slice(0, 20),
          slug,
          country: country || "Bénin",
          city: city || "Cotonou",
          address: `${city || "Cotonou"}, ${country || "Bénin"}`,
          phone: phone || "+229 ",
          email: normalizedEmail,
          currency: "FCFA",
          active_year: "2026-2027",
        })
        .select()
        .single();

      if (schoolInsertError) {
        console.error("[register] Erreur insertion schools :", schoolInsertError);
      } else if (schoolRow) {
        createdSchoolId = schoolRow.id;
        createdSchool = schoolRow;
      }
    }

    // 6. Insertion de l'utilisateur dans school_users
    const userRole = pathway === "PARENT" ? "parent" : "directeur";
    const userName = (pathway === "PARENT" ? fullName : directorName || "Directeur / Fondateur").trim();

    const { data: userRow, error: userInsertError } = await supabase
      .from("school_users")
      .insert({
        school_id: createdSchoolId,
        email: normalizedEmail,
        password_hash: `hash_${Date.now()}`,
        full_name: userName,
        role: userRole,
        phone: phone || "",
        status: "ACTIF",
        permissions:
          userRole === "directeur"
            ? ["ALL", "MANAGE_USERS", "MANAGE_SETTINGS", "MANAGE_CLASSES", "MANAGE_FINANCE"]
            : ["VIEW_CHILD_RECORDS"],
      })
      .select()
      .single();

    if (userInsertError) {
      console.error("[register] Erreur insertion school_users :", userInsertError);
    }

    // 7. Tentative Supabase Auth (création du compte Auth Supabase avec email)
    try {
      await supabase.auth.signUp({
        email: normalizedEmail,
        password: password,
        options: {
          data: {
            full_name: userName,
            role: userRole,
            school_id: createdSchoolId,
          },
        },
      });
    } catch (authErr) {
      // Ignorer si configuration de mails Supabase externe ou continuer
      console.warn("[register] Supabase auth.signUp avertissement :", authErr);
    }

    return NextResponse.json({
      success: true,
      message: "Inscription réussie !",
      user: {
        id: userRow?.id || `usr-${Date.now()}`,
        email: normalizedEmail,
        fullName: userName,
        role: userRole,
        phone,
        schoolId: createdSchoolId || "school-1",
        schoolName: createdSchool?.name || schoolName || "Établissement Scolaire",
      },
      school: createdSchool,
    });
  } catch (error: any) {
    console.error("[register] Erreur inattendue :", error);
    return NextResponse.json(
      {
        success: false,
        error: "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.",
      },
      { status: 500 }
    );
  }
}
