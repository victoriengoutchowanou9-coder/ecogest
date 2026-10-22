import { getServerSupabaseAdmin } from "./supabase-admin";
import { recordSystemAuditLog } from "./dev-auth";

export type AuditAction =
  | "INSERT"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "PASSWORD_CHANGE"
  | "EXPORT_DATA"
  | "PRINT_BULLETIN"
  | "UNLOCK_NOTES"
  | "ACCOUNT_SUSPENDED"
  | "ACCOUNT_BANNED";

export interface AuditEventPayload {
  schoolId?: string;
  schoolName?: string;
  userId?: string;
  userEmail?: string;
  role?: string;
  action: AuditAction | string;
  resourceType: string;
  resourceId?: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  req?: Request;
  title?: string;
  severity?: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
}

/**
 * Journalise une action dans la table system_audit_logs (consultable par le développeur)
 * et dans audit_logs (isolation école).
 */
export async function recordAuditEvent(payload: AuditEventPayload): Promise<void> {
  try {
    let ip = payload.ip;
    let userAgent = payload.userAgent;

    if (payload.req) {
      if (!ip) {
        ip =
          payload.req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
          payload.req.headers.get("x-real-ip") ||
          payload.req.headers.get("cf-connecting-ip") ||
          undefined;
      }
      if (!userAgent) {
        userAgent = payload.req.headers.get("user-agent") || undefined;
      }
    }

    const supabase = getServerSupabaseAdmin();

    // Résolution du nom d'école si manquant
    let resolvedSchoolName = payload.schoolName;
    if (!resolvedSchoolName && payload.schoolId) {
      try {
        const { data: sRow } = await supabase
          .from("schools")
          .select("name")
          .eq("id", payload.schoolId)
          .maybeSingle();
        if (sRow?.name) {
          resolvedSchoolName = sRow.name;
        }
      } catch {}
    }

    // Résolution de l'email si manquant
    let resolvedUserEmail = payload.userEmail;
    if (!resolvedUserEmail && payload.userId) {
      try {
        const { data: uRow } = await supabase
          .from("school_users")
          .select("email, full_name, role")
          .eq("id", payload.userId)
          .maybeSingle();
        if (uRow?.email) {
          resolvedUserEmail = uRow.email;
          if (!payload.role && uRow.role) {
            payload.role = uRow.role;
          }
        }
      } catch {}
    }

    // Détermination du type d'événement pour le journal système
    let eventType = "ACTIVITE_MODULE";
    const act = (payload.action || "").toUpperCase();
    if (act === "LOGIN") eventType = "CONNEXION";
    else if (act === "LOGOUT") eventType = "DECONNEXION";
    else if (act === "LOGIN_FAILED") eventType = "ERREUR_AUTH";
    else if (act === "PASSWORD_CHANGE") eventType = "MODIF_PROFIL";
    else if (act === "INSERT" || act === "CREATE") eventType = "CREATION_DONNEES";
    else if (act === "UPDATE") eventType = "MODIFICATION_DONNEES";
    else if (act === "DELETE") eventType = "SUPPRESSION_DONNEES";
    else if (act.includes("EXPORT")) eventType = "EXPORT_DONNEES";
    else if (act.includes("PRINT")) eventType = "IMPRESSION_BULLETIN";
    else if (act.includes("UNLOCK")) eventType = "DEVERROUILLAGE_NOTES";

    // Titre lisible
    const defaultTitle =
      payload.title ||
      `${payload.action} sur ${payload.resourceType}${payload.resourceId ? ` (${payload.resourceId})` : ""}${
        resolvedSchoolName ? ` - ${resolvedSchoolName}` : ""
      }`;

    // 1. Enregistrement direct dans system_audit_logs (source de vérité développeur)
    await recordSystemAuditLog({
      eventType,
      severity: payload.severity || (act === "LOGIN_FAILED" ? "WARNING" : "INFO"),
      actionTitle: defaultTitle,
      details: {
        action: payload.action,
        resourceType: payload.resourceType,
        resourceId: payload.resourceId,
        oldData: payload.oldData,
        newData: payload.newData,
        requestId: payload.requestId,
        userAgent,
      },
      userEmail: resolvedUserEmail,
      userRole: payload.role,
      schoolId: payload.schoolId,
      schoolName: resolvedSchoolName,
      ipAddress: ip,
    });

    // 2. Enregistrement dans audit_logs si schoolId est présent
    if (payload.schoolId) {
      try {
        await supabase.from("audit_logs").insert({
          school_id: payload.schoolId,
          user_id: payload.userId || null,
          role: payload.role || null,
          action: payload.action,
          resource_type: payload.resourceType,
          resource_id: payload.resourceId || null,
          old_data: payload.oldData || null,
          new_data: payload.newData || null,
          ip: ip || null,
          user_agent: userAgent || null,
          request_id: payload.requestId || null,
          created_at: new Date().toISOString(),
        });
      } catch {
        // Table audit_logs peut ne pas encore être déployée, absorption non bloquante
      }
    }
  } catch (err) {
    console.error("[AuditLogger] Exception inattendue lors de l'enregistrement de l'audit :", err);
  }
}

/**
 * Raccourci pour journaliser les événements de connexion et d'authentification.
 */
export async function logAuthEvent(params: {
  schoolId?: string;
  schoolName?: string;
  userId?: string;
  role?: string;
  email: string;
  action: "LOGIN" | "LOGIN_FAILED" | "LOGOUT" | "PASSWORD_CHANGE";
  ip?: string;
  userAgent?: string;
  failureReason?: string;
  userName?: string;
}): Promise<void> {
  const isFailed = params.action === "LOGIN_FAILED";
  const userDesc = params.userName
    ? `${params.userName} (${params.role || "utilisateur"})`
    : params.email;

  const actionTitle =
    params.action === "LOGIN"
      ? `Connexion réussie de ${userDesc}${params.schoolName ? ` - ${params.schoolName}` : ""}`
      : params.action === "LOGOUT"
      ? `Déconnexion de ${userDesc}${params.schoolName ? ` - ${params.schoolName}` : ""}`
      : params.action === "LOGIN_FAILED"
      ? `Tentative de connexion échouée (${params.email})${params.failureReason ? ` : ${params.failureReason}` : ""}`
      : `Modification du mot de passe pour ${params.email}`;

  await recordAuditEvent({
    schoolId: params.schoolId,
    schoolName: params.schoolName,
    userId: params.userId,
    userEmail: params.email,
    role: params.role,
    action: params.action,
    title: actionTitle,
    severity: isFailed ? "WARNING" : "INFO",
    resourceType: "auth_session",
    resourceId: params.userId || params.email,
    newData: {
      email: params.email,
      status: isFailed ? "FAILED" : "SUCCESS",
      failureReason: params.failureReason,
    },
    ip: params.ip,
    userAgent: params.userAgent,
  });
}

/**
 * Raccourci pour journaliser les exports de données d'un établissement.
 */
export async function logExportEvent(params: {
  schoolId: string;
  schoolName?: string;
  userId: string;
  userEmail?: string;
  role: string;
  exportType: "ELEVES" | "NOTES" | "BULLETINS" | "FINANCES";
  recordsCount: number;
  ip?: string;
}): Promise<void> {
  await recordAuditEvent({
    schoolId: params.schoolId,
    schoolName: params.schoolName,
    userId: params.userId,
    userEmail: params.userEmail,
    role: params.role,
    action: "EXPORT_DATA",
    title: `Export de données ${params.exportType} (${params.recordsCount} entrées)`,
    resourceType: params.exportType,
    newData: {
      exportType: params.exportType,
      recordsCount: params.recordsCount,
      timestamp: new Date().toISOString(),
    },
    ip: params.ip,
  });
}

/**
 * Raccourci pour journaliser l'impression d'un bulletin officiel.
 */
export async function logBulletinPrintEvent(params: {
  schoolId: string;
  schoolName?: string;
  userId: string;
  userEmail?: string;
  role: string;
  bulletinId: string;
  studentMatricule: string;
  ip?: string;
}): Promise<void> {
  await recordAuditEvent({
    schoolId: params.schoolId,
    schoolName: params.schoolName,
    userId: params.userId,
    userEmail: params.userEmail,
    role: params.role,
    action: "PRINT_BULLETIN",
    title: `Impression du bulletin officiel pour l'élève ${params.studentMatricule}`,
    resourceType: "official_bulletins",
    resourceId: params.bulletinId,
    newData: {
      bulletinId: params.bulletinId,
      studentMatricule: params.studentMatricule,
    },
    ip: params.ip,
  });
}
