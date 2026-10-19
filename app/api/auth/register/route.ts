import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateGeoCoherence } from "@/lib/geo-data";

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
      lastName,
      firstName,
      directorLastName,
      directorFirstName,
      directorName,
      relationship,
      schoolName,
      schoolId,
      phone,
      department,
      region,
      city,
      country = "Bénin",
      chosenPlan = "STANDARD",
      pathway = "SCHOOL",
      childMatricule,
      childClass,
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
    const { data: existingUser } = await supabase
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

    // =========================================================================
    // 5. PARCOURS ÉTABLISSEMENT
    // =========================================================================
    if (pathway === "SCHOOL") {
      const cleanSchoolName = (schoolName || "").trim();
      if (!cleanSchoolName) {
        return NextResponse.json(
          {
            success: false,
            error: "Le nom officiel de l'établissement est obligatoire.",
          },
          { status: 400 }
        );
      }

      // Validation Nom et Prénom séparés du directeur
      const finalDirectorLastName = (directorLastName || lastName || "").trim();
      const finalDirectorFirstName = (directorFirstName || firstName || "").trim();
      const finalDirectorName = (
        finalDirectorLastName && finalDirectorFirstName
          ? `${finalDirectorLastName.toUpperCase()} ${finalDirectorFirstName}`
          : directorName || fullName || "Directeur / Fondateur"
      ).trim();

      if (!finalDirectorLastName && !directorName) {
        return NextResponse.json(
          {
            success: false,
            error: "Le nom de famille du responsable de l'établissement est obligatoire.",
          },
          { status: 400 }
        );
      }

      if (!finalDirectorFirstName && !directorName) {
        return NextResponse.json(
          {
            success: false,
            error: "Le prénom du responsable de l'établissement est obligatoire.",
          },
          { status: 400 }
        );
      }

      // Vérification géographique stricte (Pays, Département, Ville, Téléphone avec indicatif)
      const selectedDept = (department || region || "").trim();
      const selectedCity = (city || "").trim();
      const selectedCountry = (country || "Bénin").trim();

      const geoValidation = validateGeoCoherence(
        selectedCountry,
        selectedDept,
        selectedCity,
        phone || ""
      );

      if (!geoValidation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: geoValidation.error || "Informations géographiques ou téléphoniques incohérentes.",
          },
          { status: 400 }
        );
      }

      const formattedPhone = geoValidation.formattedPhone || phone.trim();
      const resolvedDept = geoValidation.department || selectedDept || "Littoral";
      const rawSchoolCode = (body.schoolCode || "").toString().trim();
      const finalSchoolCode = /^\d{4}$/.test(rawSchoolCode)
        ? rawSchoolCode
        : `${Math.floor(1000 + Math.random() * 9000)}`;
      const slug = `${cleanSchoolName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Math.floor(10 + Math.random() * 90)}`;

      // Insertion dans la table schools de Supabase
      const { data: schoolRow, error: schoolInsertError } = await supabase
        .from("schools")
        .insert({
          code: finalSchoolCode,
          name: cleanSchoolName,
          short_name: cleanSchoolName.slice(0, 20),
          slug,
          country: selectedCountry,
          region: resolvedDept,
          city: selectedCity,
          address: `${selectedCity}, ${resolvedDept}, ${selectedCountry}`,
          phone: formattedPhone,
          email: normalizedEmail,
          currency: "FCFA",
          active_year: "2026-2027",
        })
        .select()
        .single();

      if (schoolInsertError) {
        console.error("[register] Erreur insertion schools :", schoolInsertError);
        return NextResponse.json(
          {
            success: false,
            error: "Erreur lors de l'enregistrement de l'établissement dans la base de données.",
          },
          { status: 500 }
        );
      }

      const createdSchoolId = schoolRow.id;

      // Insertion du directeur dans school_users avec hash sécurisé
      let passwordHash = `hash_${Date.now()}`;
      try {
        const { hashPasswordPbkdf2 } = await import("@/lib/server/dev-auth");
        passwordHash = hashPasswordPbkdf2(password);
      } catch (hashErr) {
        console.warn("[register] Note hash fallback :", hashErr);
      }

      const { data: userRow, error: userInsertError } = await supabase
        .from("school_users")
        .insert({
          school_id: createdSchoolId,
          email: normalizedEmail,
          password_hash: passwordHash,
          full_name: finalDirectorName,
          role: "directeur",
          phone: formattedPhone,
          status: "ACTIF",
          permissions: [
            "ALL",
            "MANAGE_USERS",
            "MANAGE_SETTINGS",
            "MANAGE_CLASSES",
            "MANAGE_FINANCE",
            `CODE:${finalSchoolCode}`,
            `IDENTIFIER:${finalSchoolCode}DIR01`,
            `FONCTION:Direction Générale`,
          ],
        })
        .select()
        .single();

      if (userInsertError) {
        console.error("[register] Erreur insertion school_users directeur :", userInsertError);
      }

      // Initialisation abonnement établissement dans Supabase
      try {
        await supabase.from("school_subscriptions").insert({
          school_id: createdSchoolId,
          plan_type: chosenPlan === "PREMIUM" ? "PREMIUM" : chosenPlan === "BASIC" ? "BASIC" : "STANDARD",
          price_fcfa: chosenPlan === "PREMIUM" ? 25000 : chosenPlan === "BASIC" ? 5000 : 15000,
          status: "ACTIVE",
          max_schools: chosenPlan === "PREMIUM" ? 2 : 1,
          max_users: chosenPlan === "PREMIUM" ? 50 : chosenPlan === "BASIC" ? 10 : 25,
          features: {},
          auto_renew: false,
        });
      } catch {}

      // Enregistrement dans le journal d'audit développeur
      try {
        const { recordSystemAuditLog } = await import("@/lib/server/dev-auth");
        await recordSystemAuditLog({
          eventType: "CREATION_ETABLISSEMENT",
          severity: "INFO",
          actionTitle: `Création de l'établissement « ${cleanSchoolName} » (${selectedCountry}) par ${finalDirectorName}`,
          details: {
            email: normalizedEmail,
            role: "directeur",
            plan: chosenPlan,
            country: selectedCountry,
            department: selectedDept,
            city: selectedCity,
            phone: formattedPhone,
          },
          userEmail: normalizedEmail,
          userRole: "directeur",
          schoolName: cleanSchoolName,
          schoolId: createdSchoolId,
        });
      } catch {}

      return NextResponse.json({
        success: true,
        message: "Établissement et compte directeur créés avec succès !",
        user: {
          id: userRow?.id || `usr-${Date.now()}`,
          email: normalizedEmail,
          fullName: finalDirectorName,
          role: "directeur",
          phone: formattedPhone,
          schoolId: createdSchoolId,
          schoolName: cleanSchoolName,
        },
        school: schoolRow,
      });
    }

    // =========================================================================
    // 6. PARCOURS PARENT (RÈGLE OBLIGATOIRE : ÉTABLISSEMENT EXISTANT REQUIS)
    // =========================================================================
    if (pathway === "PARENT") {
      // RÈGLE 5 : Vérification absolue qu'au moins un établissement existe dans la base
      const { data: existingSchools, error: schoolsCheckErr } = await supabase
        .from("schools")
        .select("id, name")
        .limit(1);

      if (schoolsCheckErr || !existingSchools || existingSchools.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              "L'inscription parent n'est pas encore disponible. Un établissement doit d'abord être inscrit sur ECOGEST. Veuillez attendre que l'établissement de votre enfant soit enregistré sur la plateforme.",
          },
          { status: 400 }
        );
      }

      // Validation Nom et Prénom séparés
      const finalParentLastName = (lastName || "").trim();
      const finalParentFirstName = (firstName || "").trim();

      if (!finalParentLastName) {
        return NextResponse.json(
          { success: false, error: "Le nom de famille est obligatoire." },
          { status: 400 }
        );
      }

      if (!finalParentFirstName) {
        return NextResponse.json(
          { success: false, error: "Le prénom est obligatoire." },
          { status: 400 }
        );
      }

      // Validation Lien parental obligatoire
      const cleanRelationship = (relationship || "").trim();
      if (!cleanRelationship) {
        return NextResponse.json(
          {
            success: false,
            error: "Le choix du lien de parenté (Père, Mère, Tuteur légal, etc.) est obligatoire.",
          },
          { status: 400 }
        );
      }

      // Validation de l'établissement sélectionné dans la base de données
      const cleanSchoolId = (schoolId || "").trim();
      if (!cleanSchoolId) {
        return NextResponse.json(
          {
            success: false,
            error: "Veuillez sélectionner un établissement scolaire existant.",
          },
          { status: 400 }
        );
      }

      const { data: matchedSchool, error: schoolMatchErr } = await supabase
        .from("schools")
        .select("id, name")
        .eq("id", cleanSchoolId)
        .maybeSingle();

      if (schoolMatchErr || !matchedSchool) {
        return NextResponse.json(
          {
            success: false,
            error:
              "L'établissement sélectionné n'existe pas dans le système. Aucun compte orphelin ne peut être créé.",
          },
          { status: 400 }
        );
      }

      const finalParentName = `${finalParentLastName.toUpperCase()} ${finalParentFirstName}`;

      let parentPasswordHash = `hash_${Date.now()}`;
      try {
        const { hashPasswordPbkdf2 } = await import("@/lib/server/dev-auth");
        parentPasswordHash = hashPasswordPbkdf2(password);
      } catch (hashErr) {
        console.warn("[register] Note hash parent fallback :", hashErr);
      }

      // Normalisation du téléphone parent avec indicatif international (+229...)
      const { normalizePhoneE164 } = await import("@/lib/server/sms");
      const formattedParentPhone = normalizePhoneE164(phone || "", "+229");

      // Insertion du parent dans school_users
      const { data: userRow, error: userInsertError } = await supabase
        .from("school_users")
        .insert({
          school_id: matchedSchool.id,
          email: normalizedEmail,
          password_hash: parentPasswordHash,
          full_name: finalParentName,
          role: "parent",
          phone: formattedParentPhone || (phone || "").trim(),
          status: "ACTIF",
          permissions: {
            roles: ["VIEW_CHILD_RECORDS"],
            relationship: cleanRelationship,
            childMatricule: (childMatricule || "").trim(),
            childClass: (childClass || "").trim(),
            plan: chosenPlan,
            lastName: finalParentLastName.toUpperCase(),
            firstName: finalParentFirstName,
          },
        })
        .select()
        .single();

      if (userInsertError) {
        console.error("[register] Erreur insertion school_users parent :", userInsertError);
        return NextResponse.json(
          {
            success: false,
            error: "Erreur lors de la création du compte parent dans la base de données.",
          },
          { status: 500 }
        );
      }

      // Enregistrement dans le journal d'audit développeur
      try {
        const { recordSystemAuditLog } = await import("@/lib/server/dev-auth");
        await recordSystemAuditLog({
          eventType: "CREATION_COMPTE",
          severity: "INFO",
          actionTitle: `Création du compte Parent ${finalParentName} (${cleanRelationship}) pour l'établissement « ${matchedSchool.name} »`,
          details: {
            email: normalizedEmail,
            role: "parent",
            plan: chosenPlan,
            relationship: cleanRelationship,
            schoolId: matchedSchool.id,
            schoolName: matchedSchool.name,
            childMatricule: childMatricule || "",
            childClass: childClass || "",
          },
          userEmail: normalizedEmail,
          userRole: "parent",
          schoolName: matchedSchool.name,
          schoolId: matchedSchool.id,
        });
      } catch {}

      return NextResponse.json({
        success: true,
        message: "Compte parent créé avec succès !",
        user: {
          id: userRow?.id || `usr-${Date.now()}`,
          email: normalizedEmail,
          fullName: finalParentName,
          role: "parent",
          phone: (phone || "").trim(),
          schoolId: matchedSchool.id,
          schoolName: matchedSchool.name,
          relationship: cleanRelationship,
        },
        school: matchedSchool,
      });
    }

    return NextResponse.json(
      { success: false, error: "Type d'inscription (pathway) non reconnu." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[register] Erreur inattendue :", error);
    try {
      const { recordSystemAuditLog } = await import("@/lib/server/dev-auth");
      await recordSystemAuditLog({
        eventType: "ERREUR_SERVEUR",
        severity: "ERROR",
        actionTitle: "Erreur inattendue lors de l'inscription utilisateur",
        details: { message: error?.message },
      });
    } catch {}
    return NextResponse.json(
      {
        success: false,
        error: "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.",
      },
      { status: 500 }
    );
  }
}
