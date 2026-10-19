import { getServerSupabaseAdmin } from "./supabase-admin";

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
  schoolId: string;
  userId?: string;
  role?: string;
  action: AuditAction | string;
  resourceType: string;
  resourceId?: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  requestId?: string;
}

/**
 * Journalise une action dans la table audit_logs (immutable, append-only).
 * Utilise le client administratif serveur pour garantir l'enregistrement.
 */
export async function recordAuditEvent(payload: AuditEventPayload): Promise<void> {
  try {
    if (!payload.schoolId) {
      console.warn("[AuditLogger] Tentative d'enregistrement sans schoolId. Événement ignoré.");
      return;
    }

    const supabase = getServerSupabaseAdmin();
    const { error } = await supabase.from("audit_logs").insert({
      school_id: payload.schoolId,
      user_id: payload.userId || null,
      role: payload.role || null,
      action: payload.action,
      resource_type: payload.resourceType,
      resource_id: payload.resourceId || null,
      old_data: payload.oldData || null,
      new_data: payload.newData || null,
      ip: payload.ip || null,
      user_agent: payload.userAgent || null,
      request_id: payload.requestId || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[AuditLogger] Erreur d'insertion dans audit_logs :", error.message);
    }
  } catch (err) {
    console.error("[AuditLogger] Exception inattendue lors de l'enregistrement de l'audit :", err);
  }
}

/**
 * Raccourci pour journaliser les événements de connexion et d'authentification.
 */
export async function logAuthEvent(params: {
  schoolId: string;
  userId?: string;
  role?: string;
  email: string;
  action: "LOGIN" | "LOGIN_FAILED" | "LOGOUT" | "PASSWORD_CHANGE";
  ip?: string;
  userAgent?: string;
  failureReason?: string;
}): Promise<void> {
  await recordAuditEvent({
    schoolId: params.schoolId,
    userId: params.userId,
    role: params.role,
    action: params.action,
    resourceType: "auth_session",
    resourceId: params.userId || params.email,
    newData: {
      email: params.email,
      status: params.action === "LOGIN_FAILED" ? "FAILED" : "SUCCESS",
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
  userId: string;
  role: string;
  exportType: "ELEVES" | "NOTES" | "BULLETINS" | "FINANCES";
  recordsCount: number;
  ip?: string;
}): Promise<void> {
  await recordAuditEvent({
    schoolId: params.schoolId,
    userId: params.userId,
    role: params.role,
    action: "EXPORT_DATA",
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
  userId: string;
  role: string;
  bulletinId: string;
  studentMatricule: string;
  ip?: string;
}): Promise<void> {
  await recordAuditEvent({
    schoolId: params.schoolId,
    userId: params.userId,
    role: params.role,
    action: "PRINT_BULLETIN",
    resourceType: "official_bulletins",
    resourceId: params.bulletinId,
    newData: {
      bulletinId: params.bulletinId,
      studentMatricule: params.studentMatricule,
    },
    ip: params.ip,
  });
}
