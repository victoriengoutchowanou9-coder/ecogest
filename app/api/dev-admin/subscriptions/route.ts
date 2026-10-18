import { NextResponse } from "next/server";
import { requireDeveloperAuth, getSupabaseAdminClient, recordSystemAuditLog } from "@/lib/server/dev-auth";
import { SCHOOL_PLANS, PARENT_PLANS } from "@/lib/subscription-plans";

/**
 * GET /api/dev-admin/subscriptions
 * Récupère tous les abonnements pour les établissements et les parents :
 * Formule, montant, dates, statut, quotas, alertes d'expiration.
 */
export async function GET(request: Request) {
  const auth = await requireDeveloperAuth();
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Session développeur requise." }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();

  try {
    // 1. Établissements et effectifs d'utilisateurs actuels
    const { data: schoolsData } = await supabase
      .from("schools")
      .select("id, name, code, city, country, created_at");

    const { data: usersData } = await supabase
      .from("school_users")
      .select("id, school_id, role, status");

    const schoolUsersCountMap = new Map<string, number>();
    (usersData || []).forEach((u) => {
      if (u.school_id) {
        schoolUsersCountMap.set(u.school_id, (schoolUsersCountMap.get(u.school_id) || 0) + 1);
      }
    });

    // 2. Abonnements enregistrés en base dans school_subscriptions
    let dbSchoolSubs: any[] = [];
    try {
      const { data } = await supabase.from("school_subscriptions").select("*");
      if (data && Array.isArray(data)) dbSchoolSubs = data;
    } catch {}

    // 3. Abonnements attribués par le développeur dans system_audit_logs
    let devGrants: any[] = [];
    try {
      const { data: grantLogs } = await supabase
        .from("system_audit_logs")
        .select("*")
        .eq("event_type", "SOUSCRIPTION_ABONNEMENT")
        .order("created_at", { ascending: false });

      if (grantLogs && Array.isArray(grantLogs)) {
        devGrants = grantLogs;
      }
    } catch {}

    // Établir la liste unifiée des abonnements établissements
    const schoolSubscriptions = (schoolsData || []).map((sch) => {
      // Chercher d'abord un abonnement accordé par le développeur récemment
      const devGrant = devGrants.find((g) => g.details?.school_id === sch.id && g.details?.entity_type === "SCHOOL");
      const dbSub = dbSchoolSubs.find((s) => s.school_id === sch.id);

      const usersUsed = schoolUsersCountMap.get(sch.id) || 0;

      if (devGrant) {
        const details = devGrant.details || {};
        const startDate = details.start_date || sch.created_at;
        const expiresAt = details.expires_at;
        const isExp = new Date(expiresAt).getTime() < Date.now();
        const daysLeft = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        return {
          id: devGrant.id,
          entityType: "SCHOOL",
          schoolId: sch.id,
          schoolName: sch.name,
          schoolCode: sch.code,
          planCode: details.plan_code || "BASIC",
          planName: details.plan_name || "Formule Starter",
          amountFcfa: details.amount_fcfa || 6000,
          startDate,
          expiresAt,
          daysLeft,
          status: isExp ? "EXPIRED" : details.status || "ACTIVE",
          maxUsers: details.max_users || 10,
          usersUsed,
          autoRenew: Boolean(details.auto_renew),
          grantedBy: devGrant.user_email || "Développeur",
        };
      }

      if (dbSub) {
        const expiresAt = dbSub.expires_at;
        const isExp = new Date(expiresAt).getTime() < Date.now();
        const daysLeft = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return {
          id: dbSub.id,
          entityType: "SCHOOL",
          schoolId: sch.id,
          schoolName: sch.name,
          schoolCode: sch.code,
          planCode: dbSub.plan_type,
          planName: `Formule ${dbSub.plan_type}`,
          amountFcfa: dbSub.price_fcfa,
          startDate: dbSub.start_date,
          expiresAt,
          daysLeft,
          status: isExp ? "EXPIRED" : dbSub.status,
          maxUsers: dbSub.max_users || 10,
          usersUsed,
          autoRenew: dbSub.auto_renew,
          grantedBy: "Système",
        };
      }

      // Par défaut : Essai gratuit Starter 1 mois à partir de la date de création de l'école
      const createdDate = new Date(sch.created_at || Date.now());
      const defaultExp = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const daysLeft = Math.ceil((new Date(defaultExp).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const isExp = daysLeft <= 0;

      return {
        id: `trial-${sch.id}`,
        entityType: "SCHOOL",
        schoolId: sch.id,
        schoolName: sch.name,
        schoolCode: sch.code,
        planCode: "STARTER",
        planName: "Starter (1 Mois d'Essai Gratuit)",
        amountFcfa: 0,
        startDate: sch.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
        expiresAt: defaultExp,
        daysLeft,
        status: isExp ? "EXPIRED" : "TRIAL",
        maxUsers: 10,
        usersUsed,
        autoRenew: false,
        grantedBy: "Enregistrement",
      };
    });

    // 4. Abonnements Parents
    const parentGrants = devGrants
      .filter((g) => g.details?.entity_type === "PARENT")
      .map((g) => {
        const d = g.details || {};
        const daysLeft = Math.ceil((new Date(d.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return {
          id: g.id,
          entityType: "PARENT",
          parentName: d.parent_name || g.user_email || "Parent d'élève",
          parentPhone: d.parent_phone || "—",
          schoolName: d.school_name || "Établissement rattaché",
          planCode: d.plan_code || "PARENT_1",
          planName: d.plan_code === "PARENT_2" ? "Parent Formule 2 (300 F/m)" : "Parent Formule 1 (200 F/m)",
          amountFcfa: d.amount_fcfa || 200,
          startDate: d.start_date,
          expiresAt: d.expires_at,
          daysLeft,
          status: daysLeft <= 0 ? "EXPIRED" : "ACTIVE",
          maxChildren: d.max_children || 1,
          grantedBy: g.user_email || "Développeur",
        };
      });

    // Calcul des statistiques globales d'abonnements
    let activeCount = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;

    schoolSubscriptions.forEach((s) => {
      if (s.status === "ACTIVE" || s.status === "TRIAL") {
        activeCount++;
        if (s.daysLeft <= 15 && s.daysLeft >= 0) {
          expiringSoonCount++;
        }
      } else if (s.status === "EXPIRED") {
        expiredCount++;
      }
    });

    return NextResponse.json({
      success: true,
      schools: schoolSubscriptions,
      parents: parentGrants,
      stats: {
        activeCount,
        expiringSoonCount,
        expiredCount,
        totalSchoolsTracked: schoolSubscriptions.length,
        totalParentsTracked: parentGrants.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur." }, { status: 500 });
  }
}

/**
 * POST /api/dev-admin/subscriptions
 * Permet au développeur d'attribuer ou renouveler un abonnement pour un établissement ou un parent.
 */
export async function POST(request: Request) {
  const auth = await requireDeveloperAuth();
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Session développeur requise." }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();

  try {
    const body = await request.json();
    const {
      entityType = "SCHOOL", // 'SCHOOL' | 'PARENT'
      targetId,             // school_id ou parent identifier
      targetName,           // nom de l'établissement ou nom du parent
      targetPhone,
      schoolName,
      planCode,             // 'STARTER' | 'BASIC' | 'STANDARD' | 'PREMIUM' ou 'PARENT_1' | 'PARENT_2'
      durationMonths = 1,
      paymentMethod = "VIREMENT_DIRECT",
      notes,
    } = body;

    if (!targetId && entityType === "SCHOOL") {
      return NextResponse.json({ error: "L'établissement cible est requis." }, { status: 400 });
    }

    if (!planCode) {
      return NextResponse.json({ error: "La formule d'abonnement est requise." }, { status: 400 });
    }

    const startDate = new Date();
    const expiresDate = new Date();
    expiresDate.setMonth(expiresDate.getMonth() + Number(durationMonths || 1));

    let planName = planCode;
    let amountFcfa = 0;
    let maxUsers = 10;
    let maxChildren = 1;

    if (entityType === "SCHOOL") {
      const planDef = (SCHOOL_PLANS as any)[planCode] || { name: planCode, priceFcfa: 6000, maxUsers: 10 };
      planName = planDef.name;
      amountFcfa = (planDef.priceFcfa || 6000) * Number(durationMonths || 1);
      maxUsers = planDef.maxUsers || 10;
    } else {
      const planDef = (PARENT_PLANS as any)[planCode] || { name: planCode, priceFcfa: 200, maxChildren: 1 };
      planName = planDef.name;
      amountFcfa = (planDef.priceFcfa || 200) * Number(durationMonths || 1);
      maxChildren = planDef.maxChildren || 1;
    }

    const grantDetails = {
      entity_type: entityType,
      school_id: entityType === "SCHOOL" ? targetId : undefined,
      school_name: entityType === "SCHOOL" ? targetName : schoolName,
      parent_name: entityType === "PARENT" ? targetName : undefined,
      parent_phone: targetPhone,
      plan_code: planCode,
      plan_name: planName,
      duration_months: Number(durationMonths),
      amount_fcfa: amountFcfa,
      start_date: startDate.toISOString().split("T")[0],
      expires_at: expiresDate.toISOString().split("T")[0],
      status: "ACTIVE",
      max_users: maxUsers,
      max_children: maxChildren,
      payment_method: paymentMethod,
      notes: notes || "Abonnement accordé par le Développeur Technique",
      granted_by: auth.email,
      granted_at: new Date().toISOString(),
    };

    // 1. Enregistrement persistant dans system_audit_logs
    await recordSystemAuditLog({
      eventType: "SOUSCRIPTION_ABONNEMENT",
      severity: "INFO",
      actionTitle: `Attribution abonnement ${planName} pour ${targetName} (${amountFcfa.toLocaleString()} FCFA)`,
      details: grantDetails,
      userEmail: auth.email,
      userRole: "DEVELOPPEUR",
      schoolId: entityType === "SCHOOL" ? targetId : undefined,
      schoolName: entityType === "SCHOOL" ? targetName : schoolName,
    });

    // 2. Si table school_subscriptions accessible, tentative de synchronisation
    if (entityType === "SCHOOL") {
      try {
        await supabase
          .from("school_subscriptions")
          .upsert({
            school_id: targetId,
            plan_type: planCode === "STARTER" ? "BASIC" : planCode,
            price_fcfa: amountFcfa,
            status: "ACTIVE",
            start_date: grantDetails.start_date,
            expires_at: grantDetails.expires_at,
            max_users: maxUsers,
          });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: `Abonnement ${planName} activé avec succès jusqu'au ${grantDetails.expires_at}.`,
      subscription: grantDetails,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur." }, { status: 500 });
  }
}
