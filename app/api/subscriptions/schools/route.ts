import { NextResponse } from "next/server";
import { SCHOOL_PLANS, SchoolPlanCode } from "@/lib/subscription-plans";
import { getServerSupabaseAdmin } from "@/lib/server/supabase-admin";

const supabase = getServerSupabaseAdmin();

export async function GET() {
  try {
    const { data: schools, error } = await supabase
      .from("schools")
      .select("id, code, name, short_name, slug, country, region, city, address, phone, email, active_year, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message, schools: [] }, { status: 500 });
    }

    return NextResponse.json({ success: true, schools: schools || [], count: schools?.length || 0 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Erreur serveur.", schools: [] }, { status: 500 });
  }
}


// Validation serveur de la création d'établissement selon le forfait actif
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentPlan, existingSchoolsCount, schoolData } = body;

    const planCode: SchoolPlanCode = currentPlan || "BASIC";
    const plan = SCHOOL_PLANS[planCode] || SCHOOL_PLANS.BASIC;
    const currentCount = Number(existingSchoolsCount) || 1;

    if (currentCount >= plan.maxSchools) {
      const priceText = plan.priceFcfa === 0 ? "Gratuit 1 mois" : `${plan.priceFcfa.toLocaleString()} FCFA/mois`;
      return NextResponse.json(
        {
          allowed: false,
          error:
            planCode === "PREMIUM"
              ? "Limite maximale de 2 établissements atteinte pour la Formule Premium."
              : `Votre formule actuelle (${plan.name} - ${priceText}) ne permet qu'un seul établissement. Pour créer un 2ème établissement, passez à la Formule PREMIUM (25 000 FCFA/mois).`,
          maxAllowed: plan.maxSchools,
          currentCount,
        },
        { status: 403 }
      );
    }

    if (!schoolData || !schoolData.name) {
      return NextResponse.json(
        { allowed: false, error: "Le nom de l'établissement est obligatoire." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      allowed: true,
      message: "Création d'établissement autorisée par l'abonnement.",
      maxAllowed: plan.maxSchools,
      currentCount: currentCount + 1,
    });
  } catch (error: any) {
    return NextResponse.json(
      { allowed: false, error: "Erreur serveur de validation d'abonnement." },
      { status: 500 }
    );
  }
}
