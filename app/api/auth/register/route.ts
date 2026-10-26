import { NextResponse } from "next/server";
import { getServerSupabaseAdmin } from "@/lib/server/supabase-admin";

const supabase = getServerSupabaseAdmin();
import { validateGeoCoherence } from "@/lib/geo-data";
import {
  createSchoolUserSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/server/session";

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

      if (schoolInsertError || !schoolRow) {
        console.error("[register] Erreur insertion schools :", schoolInsertError);
        return NextResponse.json(
          {
            success: false,
            error: "Erreur lors de l'enregistrement de l'établissement dans la base de données : " + (schoolInsertError?.message || "Échec d'insertion"),
          },
          { status: 500 }
        );
      }

      const createdSchoolId = schoolRow.id;

      // Calcul dynamique de l'URL de redirection (jamais localhost:3000 en production)
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

      // Inscription automatique dans Supabase Auth (GoTrue) avec auto-confirmation
      try {
        if (supabase?.auth?.admin) {
          const { error: adminErr } = await supabase.auth.admin.createUser({
            email: normalizedEmail,
            password: password,
            email_confirm: true,
            user_metadata: {
              full_name: finalDirectorName,
              role: "directeur",
              school_id: createdSchoolId,
              school_name: cleanSchoolName,
            },
          });
          if (adminErr) {
            console.warn("[register] Note admin createUser directeur :", adminErr.message);
            await supabase.auth.signUp({
              email: normalizedEmail,
              password: password,
              options: {
                emailRedirectTo: dynamicRedirectTo,
                data: {
                  full_name: finalDirectorName,
                  role: "directeur",
                  school_id: createdSchoolId,
                  school_name: cleanSchoolName,
                },
              },
            });
          }
        } else {
          await supabase.auth.signUp({
            email: normalizedEmail,
            password: password,
            options: {
              emailRedirectTo: dynamicRedirectTo,
              data: {
                full_name: finalDirectorName,
                role: "directeur",
                school_id: createdSchoolId,
                school_name: cleanSchoolName,
              },
            },
          });
        }
      } catch (authErr) {
        console.warn("[register] Note Supabase GoTrue Auth signUp :", authErr);
      }

      // Insertion du directeur dans school_users avec hash sécurisé
      let passwordHash = `hash_${Date.now()}`;
      try {
        const { hashPasswordPbkdf2 } = await import("@/lib/server/dev-auth");
        passwordHash = hashPasswordPbkdf2(password);
      } catch (hashErr) {
        console.warn("[register] Note hash fallback :", hashErr);
      }

      const userIdentifier = `${finalSchoolCode}DIR01`;
      const userPermissions = [
        "ALL",
        "MANAGE_USERS",
        "MANAGE_SETTINGS",
        "MANAGE_CLASSES",
        "MANAGE_FINANCE",
        `CODE:${finalSchoolCode}`,
        `IDENTIFIER:${userIdentifier}`,
        `FONCTION:Direction Générale`,
      ];

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
          permissions: userPermissions,
        })
        .select()
        .single();

      if (userInsertError || !userRow) {
        console.error("[register] Erreur insertion school_users directeur :", userInsertError);
        // Rollback de l'établissement créé si l'utilisateur n'a pas pu être inséré
        await supabase.from("schools").delete().eq("id", createdSchoolId);
        return NextResponse.json(
          {
            success: false,
            error: "Erreur lors de la création du compte administrateur dans la base de données : " + (userInsertError?.message || "Échec insertion"),
          },
          { status: 500 }
        );
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

      // Enregistrement dans le journal d'audit développeur (system_audit_logs)
      try {
        const { recordSystemAuditLog } = await import("@/lib/server/dev-auth");
        await recordSystemAuditLog({
          eventType: "CREATION_ETABLISSEMENT",
          severity: "INFO",
          actionTitle: `Création de l'établissement « ${cleanSchoolName} » (${selectedCountry}) par ${finalDirectorName}`,
          details: {
            email: normalizedEmail,
            role: "directeur",
            identifier: userIdentifier,
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
          ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "127.0.0.1",
        });
      } catch {}

      const sessionToken = createSchoolUserSessionToken(userRow.id, normalizedEmail);

      const response = NextResponse.json({
        success: true,
        message: "Établissement et compte directeur créés avec succès !",
        user: {
          id: userRow.id,
          identifier: userIdentifier,
          email: normalizedEmail,
          fullName: finalDirectorName,
          role: "directeur",
          fonction: "Direction Générale",
          phone: formattedPhone,
          schoolId: createdSchoolId,
          schoolName: cleanSchoolName,
          schoolCode: finalSchoolCode,
          status: "ACTIF",
          permissions: userPermissions,
        },
        school: schoolRow,
      });

      response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
      });

      if (createdSchoolId) {
        try {
          const { registerSessionInDatabase } = await import("@/lib/server/session");
          await registerSessionInDatabase({
            schoolId: createdSchoolId,
            userId: userRow.id,
            sessionToken,
            req: request,
          });
        } catch {}
      }

      return response;
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
        .select("id, name, code")
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

      // Calcul dynamique de l'URL de redirection pour le parent (jamais localhost:3000 en production)
      const parentDynamicRedirectTo =
        body.redirectTo ||
        body.emailRedirectTo ||
        request.headers.get("origin") ||
        (request.headers.get("x-forwarded-host")
          ? `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("x-forwarded-host")}`
          : null) ||
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
        "http://localhost:3000";

      // Inscription automatique dans Supabase Auth (GoTrue) avec auto-confirmation parent
      try {
        if (supabase?.auth?.admin) {
          const { error: adminErr } = await supabase.auth.admin.createUser({
            email: normalizedEmail,
            password: password,
            email_confirm: true,
            user_metadata: {
              full_name: finalParentName,
              role: "parent",
              school_id: matchedSchool.id,
              school_name: matchedSchool.name,
              phone: (phone || "").trim(),
              relationship: cleanRelationship,
              child_matricule: (childMatricule || "").trim(),
              child_class: (childClass || "").trim(),
              chosen_plan: chosenPlan || "PARENT_1",
            },
          });
          if (adminErr) {
            console.warn("[register] Note admin createUser parent :", adminErr.message);
            await supabase.auth.signUp({
              email: normalizedEmail,
              password: password,
              options: {
                emailRedirectTo: parentDynamicRedirectTo,
                data: {
                  full_name: finalParentName,
                  role: "parent",
                  school_id: matchedSchool.id,
                  school_name: matchedSchool.name,
                  phone: (phone || "").trim(),
                  relationship: cleanRelationship,
                  child_matricule: (childMatricule || "").trim(),
                  child_class: (childClass || "").trim(),
                  chosen_plan: chosenPlan || "PARENT_1",
                },
              },
            });
          }
        } else {
          await supabase.auth.signUp({
            email: normalizedEmail,
            password: password,
            options: {
              emailRedirectTo: parentDynamicRedirectTo,
              data: {
                full_name: finalParentName,
                role: "parent",
                school_id: matchedSchool.id,
                school_name: matchedSchool.name,
                phone: (phone || "").trim(),
                relationship: cleanRelationship,
                child_matricule: (childMatricule || "").trim(),
                child_class: (childClass || "").trim(),
                chosen_plan: chosenPlan || "PARENT_1",
              },
            },
          });
        }
      } catch (authErr) {
        console.warn("[register] Note Supabase GoTrue Auth signUp parent :", authErr);
      }

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

      const parentSchoolCode = (matchedSchool.code || "0000").replace(/\D/g, "").slice(0, 4) || "0000";
      const parentIdentifier = `${parentSchoolCode}PAR01`;
      const parentPermissions = [
        "VIEW_CHILD_RECORDS",
        `CODE:${parentSchoolCode}`,
        `IDENTIFIER:${parentIdentifier}`,
        `RELATION:${cleanRelationship}`,
        `PLAN:${chosenPlan}`,
      ];

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
          permissions: parentPermissions,
        })
        .select()
        .single();

      if (userInsertError || !userRow) {
        console.error("[register] Erreur insertion school_users parent :", userInsertError);
        return NextResponse.json(
          {
            success: false,
            error: "Erreur lors de la création du compte parent dans la base de données : " + (userInsertError?.message || "Échec d'insertion"),
          },
          { status: 500 }
        );
      }

      // Initialisation abonnement parent dans la table parent_subscriptions
      try {
        const planCode = chosenPlan === "PARENT_3" ? "PARENT_3" : chosenPlan === "PARENT_2" ? "PARENT_2" : "PARENT_1";
        const price = planCode === "PARENT_3" ? 500 : planCode === "PARENT_2" ? 350 : 200;
        const maxKids = planCode === "PARENT_3" ? 5 : planCode === "PARENT_2" ? 3 : 1;

        await supabase.from("parent_subscriptions").insert({
          parent_user_id: userRow.id,
          school_id: matchedSchool.id,
          plan_type: planCode,
          price_fcfa: price,
          status: "ACTIVE",
          max_children: maxKids,
          auto_renew: true,
        });
      } catch (subErr) {
        console.warn("[register] Note insertion parent_subscriptions :", subErr);
      }

      // Association de l'enfant dans parent_student_links si matricule renseigné
      if (childMatricule && childMatricule.trim()) {
        try {
          let studentFullName = `Élève (${childMatricule.trim()})`;
          const { data: matchedStudent } = await supabase
            .from("students")
            .select("first_name, last_name, class_name")
            .eq("matricule", childMatricule.trim())
            .eq("school_id", matchedSchool.id)
            .maybeSingle();

          if (matchedStudent) {
            studentFullName = `${matchedStudent.last_name || ""} ${matchedStudent.first_name || ""}`.trim();
          }

          await supabase.from("parent_student_links").insert({
            parent_user_id: userRow.id,
            school_id: matchedSchool.id,
            student_matricule: childMatricule.trim(),
            student_name: studentFullName,
            student_class: (childClass || "").trim() || matchedStudent?.class_name || "",
            relationship: cleanRelationship,
            status: "PENDING",
          });
        } catch (linkErr) {
          console.warn("[register] Note insertion parent_student_links :", linkErr);
        }
      }

      // Enregistrement dans le journal d'audit développeur (system_audit_logs)
      try {
        const { recordSystemAuditLog } = await import("@/lib/server/dev-auth");
        await recordSystemAuditLog({
          eventType: "CREATION_COMPTE",
          severity: "INFO",
          actionTitle: `Création du compte Parent ${finalParentName} (${cleanRelationship}) pour l'établissement « ${matchedSchool.name} »`,
          details: {
            email: normalizedEmail,
            role: "parent",
            identifier: parentIdentifier,
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
          ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "127.0.0.1",
        });
      } catch {}

      const sessionToken = createSchoolUserSessionToken(userRow.id, normalizedEmail);

      const response = NextResponse.json({
        success: true,
        message: "Compte parent créé avec succès !",
        user: {
          id: userRow.id,
          identifier: parentIdentifier,
          email: normalizedEmail,
          fullName: finalParentName,
          role: "parent",
          phone: (phone || "").trim(),
          schoolId: matchedSchool.id,
          schoolName: matchedSchool.name,
          schoolCode: parentSchoolCode,
          status: "ACTIF",
          permissions: parentPermissions,
          relationship: cleanRelationship,
        },
        school: matchedSchool,
      });

      response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
      });

      if (matchedSchool.id) {
        try {
          const { registerSessionInDatabase } = await import("@/lib/server/session");
          await registerSessionInDatabase({
            schoolId: matchedSchool.id,
            userId: userRow.id,
            sessionToken,
            req: request,
          });
        } catch {}
      }

      return response;

      return response;
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
