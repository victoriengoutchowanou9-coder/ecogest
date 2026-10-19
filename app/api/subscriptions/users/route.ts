import { NextResponse } from "next/server";
import { SCHOOL_PLANS, SchoolPlanCode } from "@/lib/subscription-plans";

// Validation serveur de l'ajout d'utilisateurs selon le forfait actif de l'établissement
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentPlan, currentUsersCount, userData } = body;

    const planCode: SchoolPlanCode = currentPlan || "BASIC";
    const plan = SCHOOL_PLANS[planCode] || SCHOOL_PLANS.BASIC;
    const current = Number(currentUsersCount) || 0;

    // Si maxUsers est null, la formule est illimitée (PREMIUM)
    if (plan.maxUsers !== null && current >= plan.maxUsers) {
      const priceText = plan.priceFcfa === 0 ? "Gratuit 1 mois" : `${plan.priceFcfa.toLocaleString()} FCFA/mois`;
      return NextResponse.json(
        {
          allowed: false,
          error: `Limite de ${plan.maxUsers} utilisateurs établissement atteinte pour la formule ${plan.name} (${priceText}). Les comptes Parents ne sont pas décomptés de cette limite. Veuillez surclasser votre forfait vers STANDARD ou PREMIUM pour ajouter plus d'utilisateurs.`,
          maxAllowed: plan.maxUsers,
          currentCount: current,
        },
        { status: 403 }
      );
    }

    if (!userData || !userData.name || !userData.email) {
      return NextResponse.json(
        { allowed: false, error: "Nom et adresse email requis." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      allowed: true,
      message: "Création d'utilisateur autorisée par le forfait d'abonnement.",
      maxAllowed: plan.maxUsers,
      currentCount: current + 1,
    });
  } catch (error: any) {
    return NextResponse.json(
      { allowed: false, error: "Erreur serveur de validation de l'utilisateur." },
      { status: 500 }
    );
  }
}
