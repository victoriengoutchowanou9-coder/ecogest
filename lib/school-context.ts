"use client";

/**
 * school-context.ts
 * Fournit l'isolation stricte des données entre les établissements scolaires dans ECOGEST.
 * Chaque clé de stockage localStorage est préfixée ou suffixée par l'identifiant de l'établissement.
 */

export function getActiveSchoolId(): string {
  if (typeof window === "undefined") return "default";
  try {
    // 1. Priorité absolue : Session active de l'utilisateur connecté
    const authRaw =
      localStorage.getItem("educogest_auth_session_v3") ||
      localStorage.getItem("ecogest_auth_session_v2");
    if (authRaw) {
      const auth = JSON.parse(authRaw);
      if (auth?.user?.schoolId) return String(auth.user.schoolId).trim();
    }

    // 2. Depuis le store d'établissement actif
    const schoolRaw = localStorage.getItem("educogest_school_subscription_v2");
    if (schoolRaw) {
      const sch = JSON.parse(schoolRaw);
      if (sch?.activeSchoolId) return String(sch.activeSchoolId).trim();
      if (Array.isArray(sch?.schools) && sch.schools.length > 0 && sch.schools[0]?.id) {
        return String(sch.schools[0].id).trim();
      }
    }
  } catch (e) {
    console.warn("Erreur lecture activeSchoolId:", e);
  }
  return "default";
}

/**
 * Retourne les détails de l'établissement actif pour affichage et liaison automatique.
 */
export function getActiveSchoolDetails(): { id: string; name: string; code: string } {
  if (typeof window === "undefined") {
    return { id: "default", name: "Établissement Scolaire", code: "0000" };
  }
  try {
    const authRaw =
      localStorage.getItem("educogest_auth_session_v3") ||
      localStorage.getItem("ecogest_auth_session_v2");
    if (authRaw) {
      const auth = JSON.parse(authRaw);
      if (auth?.user?.schoolId) {
        return {
          id: String(auth.user.schoolId),
          name: auth.user.schoolName || "Établissement Scolaire",
          code: auth.user.schoolCode || "0000",
        };
      }
    }

    const schoolRaw = localStorage.getItem("educogest_school_subscription_v2");
    if (schoolRaw) {
      const sch = JSON.parse(schoolRaw);
      const activeId = sch?.activeSchoolId;
      const matched = Array.isArray(sch?.schools) ? sch.schools.find((s: any) => s && s.id === activeId) || sch.schools[0] : null;
      if (matched && matched.id) {
        return {
          id: String(matched.id),
          name: matched.name || "Établissement Scolaire",
          code: matched.code || "0000",
        };
      }
    }
  } catch {}
  return { id: "default", name: "Établissement Scolaire", code: "0000" };
}

/**
 * Retourne une clé de stockage strictement isolée pour l'établissement donné ou actif.
 * Ex: getScopedStorageKey("educogest_classes", "school-4827") -> "educogest_classes_school-4827"
 */
export function getScopedStorageKey(baseKey: string, explicitSchoolId?: string): string {
  const schoolId = explicitSchoolId || getActiveSchoolId();
  return `${baseKey}_${schoolId}`;
}

