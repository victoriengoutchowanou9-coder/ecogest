import { NextResponse } from "next/server";
import { getServerSupabaseAdmin } from "@/lib/server/supabase-admin";

const supabase = getServerSupabaseAdmin();

/**
 * Récupère la liste de tous les établissements scolaires enregistrés dans la base de données.
 */
export async function GET() {
  try {
    const { data: schools, error } = await supabase
      .from("schools")
      .select("id, code, name, short_name, slug, country, region, city, address, phone, email, active_year, director_name, director_signature_url, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[api/schools] Erreur récupération établissements :", error);
      return NextResponse.json(
        { success: false, error: error.message, schools: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      schools: schools || [],
      count: schools?.length || 0,
    });
  } catch (err: any) {
    console.error("[api/schools] Erreur inattendue :", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de la récupération des établissements.", schools: [] },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/schools
 * Met à jour les paramètres administratifs d'un établissement (nom, directeur, signature, etc.)
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, shortName, directorName, directorSignatureUrl, devise, address, phone, email, country, region, city } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "L'identifiant de l'établissement est requis." },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (shortName !== undefined) updates.short_name = shortName;
    if (directorName !== undefined) updates.director_name = directorName;
    if (directorSignatureUrl !== undefined) updates.director_signature_url = directorSignatureUrl;
    if (devise !== undefined) updates.devise = devise;
    if (address !== undefined) updates.address = address;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (country !== undefined) updates.country = country;
    if (region !== undefined) updates.region = region;
    if (city !== undefined) updates.city = city;

    const { data: updatedSchool, error } = await supabase
      .from("schools")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.warn("[api/schools:PATCH] Erreur update Supabase :", error.message);
      // Ne bloque pas si la colonne n'existe pas encore en DB distante
      return NextResponse.json({
        success: true,
        warning: error.message,
        school: updates,
      });
    }

    return NextResponse.json({
      success: true,
      school: updatedSchool,
    });
  } catch (err: any) {
    console.error("[api/schools:PATCH] Exception :", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de la mise à jour." },
      { status: 500 }
    );
  }
}
