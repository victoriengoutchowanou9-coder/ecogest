"use client";

/**
 * school-context.ts
 * Fournit l'isolation stricte des données entre les établissements scolaires dans ECOGEST.
 * Chaque clé de stockage localStorage est préfixée ou suffixée par l'identifiant de l'établissement.
 */

export function getActiveSchoolId(): string {
  if (typeof window === "undefined") return "default";
  try {
    // 1. Depuis la session active de l'utilisateur connecté
    const authRaw = localStorage.getItem("ecogest_auth_session_v2");
    if (authRaw) {
      const auth = JSON.parse(authRaw);
      if (auth?.user?.schoolId) return auth.user.schoolId;
    }

    // 2. Depuis le store d'établissement actif
    const schoolRaw = localStorage.getItem("educogest_school_subscription_v2");
    if (schoolRaw) {
      const sch = JSON.parse(schoolRaw);
      if (sch?.activeSchoolId) return sch.activeSchoolId;
      if (Array.isArray(sch?.schools) && sch.schools.length > 0) return sch.schools[0].id;
    }
  } catch (e) {
    console.warn("Erreur lecture activeSchoolId:", e);
  }
  return "default";
}

/**
 * Retourne une clé de stockage strictement isolée pour l'établissement donné ou actif.
 * Ex: getScopedStorageKey("educogest_classes", "school-4827") -> "educogest_classes_school-4827"
 */
export function getScopedStorageKey(baseKey: string, explicitSchoolId?: string): string {
  const schoolId = explicitSchoolId || getActiveSchoolId();
  return `${baseKey}_${schoolId}`;
}
