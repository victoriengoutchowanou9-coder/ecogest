import { NextResponse } from "next/server";
import { PARENT_PLANS, ParentPlanCode } from "@/lib/subscription-plans";

// Validation serveur de l'association d'élève à un compte parent selon le forfait
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { parentPlan, currentChildrenCount, studentMatricule } = body;

    const planCode: ParentPlanCode = parentPlan || "PARENT_1";
    const plan = PARENT_PLANS[planCode] || PARENT_PLANS.PARENT_1;
    const current = Number(currentChildrenCount) || 0;

    if (current >= plan.maxChildren) {
      return NextResponse.json(
        {
          allowed: false,
          error:
            planCode === "PARENT_1"
              ? "Le forfait PARENT 1 (200 FCFA/mois) est strictement limité à 1 élève. Pour suivre un deuxième enfant, veuillez passer à la formule PARENT 2 (300 FCFA/mois)."
              : "Le forfait PARENT 2 (300 FCFA/mois) autorise un maximum de 2 élèves. L'association d'un troisième élève n'est pas autorisée par le système.",
          maxAllowed: plan.maxChildren,
          currentCount: current,
        },
        { status: 403 }
      );
    }

    if (!studentMatricule) {
      return NextResponse.json(
        { allowed: false, error: "Le matricule ou identifiant de l'élève est requis." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      allowed: true,
      message: "Association d'élève autorisée par le forfait parent.",
      maxAllowed: plan.maxChildren,
      currentCount: current + 1,
    });
  } catch (error: any) {
    return NextResponse.json(
      { allowed: false, error: "Erreur serveur de validation parent." },
      { status: 500 }
    );
  }
}
