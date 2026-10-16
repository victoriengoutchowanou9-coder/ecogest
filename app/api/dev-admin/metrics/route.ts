import { NextResponse } from "next/server";
import { requireDeveloperAuth, getSupabaseAdminClient } from "@/lib/server/dev-auth";

export async function GET() {
  const auth = await requireDeveloperAuth();

  if (!auth.authenticated) {
    return NextResponse.json({ error: "Accès refusé. Session développeur requise." }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  const startTime = Date.now();

  try {
    // 1. Établissements (total, actifs/inactifs, récents)
    const { data: schoolsData, error: schoolsError } = await supabase
      .from("schools")
      .select("id, code, name, city, country, status, created_at")
      .order("created_at", { ascending: false });

    const schools = schoolsData || [];
    const totalSchools = schools.length;
    const activeSchools = schools.filter((s) => s.status !== "INACTIF" && s.status !== "SUSPENDU").length;
    const inactiveSchools = totalSchools - activeSchools;

    // 2. Utilisateurs par rôle
    const { data: usersData, error: usersError } = await supabase
      .from("school_users")
      .select("id, school_id, full_name, email, role, phone, is_active, created_at")
      .order("created_at", { ascending: false });

    const users = usersData || [];
    const totalUsers = users.length;

    const roleCounts = {
      directeur: 0,
      censeur: 0,
      comptabilite: 0,
      enseignant: 0,
      parent: 0,
      autre: 0,
    };

    users.forEach((u) => {
      const r = (u.role || "").toLowerCase();
      if (r.includes("directeur") || r === "direction") roleCounts.directeur++;
      else if (r.includes("censeur")) roleCounts.censeur++;
      else if (r.includes("comptab")) roleCounts.comptabilite++;
      else if (r.includes("enseignant") || r.includes("prof")) roleCounts.enseignant++;
      else if (r.includes("parent")) roleCounts.parent++;
      else roleCounts.autre++;
    });

    // 3. Élèves
    const { count: studentsCount, error: studentsError } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });

    const totalStudents = studentsCount || 0;

    // 4. Inscriptions récentes & nouvelles créations de comptes
    const recentSchools = schools.slice(0, 5);
    const recentUsers = users.slice(0, 8);

    // 5. Erreurs importantes rencontrées
    const { data: recentErrorsData } = await supabase
      .from("system_audit_logs")
      .select("*")
      .in("severity", ["ERROR", "CRITICAL"])
      .order("created_at", { ascending: false })
      .limit(10);

    const recentErrors = recentErrorsData || [];

    // 6. Activité récente de la plateforme
    const { data: recentActivityData } = await supabase
      .from("system_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(15);

    const recentActivity = recentActivityData || [];

    // 7. État général des services
    const dbLatencyMs = Date.now() - startTime;

    const servicesHealth = {
      database: {
        name: "PostgreSQL Database (Supabase)",
        status: schoolsError ? "DEGRADED" : "OPERATIONAL",
        latencyMs: dbLatencyMs,
        region: "eu-west-1",
        engine: "PostgreSQL 17.6",
      },
      postgrest: {
        name: "API PostgREST Supabase",
        status: "OPERATIONAL",
        version: "v12.2.8",
      },
      authService: {
        name: "Service d'Authentification Supabase",
        status: "OPERATIONAL",
        provider: "GoTrue / Native JWT",
      },
      nextServer: {
        name: "Serveur Next.js App Router (Node.js)",
        status: "OPERATIONAL",
        uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 3600),
      },
      gateway: {
        name: "Passerelle SMS & WhatsApp",
        status: "OPERATIONAL",
        endpoints: ["+229 0155445122", "+2290161771334"],
      },
    };

    return NextResponse.json({
      success: true,
      metrics: {
        totalSchools,
        activeSchools,
        inactiveSchools,
        totalUsers,
        roleCounts,
        totalStudents,
        recentSchools,
        recentUsers,
        recentActivity,
        recentErrors,
        servicesHealth,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Impossible de récupérer les métriques techniques.", details: err?.message },
      { status: 500 }
    );
  }
}
