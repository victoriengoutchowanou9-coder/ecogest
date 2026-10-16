import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Récupère la liste de tous les établissements scolaires enregistrés dans la base de données.
 */
export async function GET() {
  try {
    const { data: schools, error } = await supabase
      .from("schools")
      .select("id, code, name, short_name, slug, country, region, city, address, phone, email, active_year, created_at")
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
