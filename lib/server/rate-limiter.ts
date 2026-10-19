import { getServerSupabaseAdmin } from "./supabase-admin";
import { recordAuditEvent } from "./audit-logger";

interface MemoryLimitEntry {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

const memoryRateLimitCache = new Map<string, MemoryLimitEntry>();

// Nettoyage régulier du cache mémoire
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryRateLimitCache.entries()) {
    if (entry.blockedUntil && entry.blockedUntil < now && now - entry.firstAttempt > 3600 * 1000) {
      memoryRateLimitCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
  isBlocked: boolean;
}

/**
 * Vérifie et incrémente le compteur de requêtes pour une clé donnée.
 * Bloque automatiquement l'accès si maxAttempts est dépassé dans la fenêtre temporelle.
 */
export async function checkAndIncrementRateLimit(params: {
  key: string;
  maxAttempts: number;
  windowSeconds: number;
  blockDurationSeconds: number;
}): Promise<RateLimitResult> {
  const now = Date.now();
  const { key, maxAttempts, windowSeconds, blockDurationSeconds } = params;

  let entry = memoryRateLimitCache.get(key);

  // Vérifier si déjà bloqué en mémoire
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    const retryAfterSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
      isBlocked: true,
    };
  }

  // Si l'entrée n'existe pas ou est expirée
  if (!entry || now - entry.firstAttempt > windowSeconds * 1000) {
    entry = { count: 1, firstAttempt: now };
    memoryRateLimitCache.set(key, entry);
    return {
      allowed: true,
      remainingAttempts: Math.max(0, maxAttempts - 1),
      isBlocked: false,
    };
  }

  entry.count += 1;

  if (entry.count > maxAttempts) {
    entry.blockedUntil = now + blockDurationSeconds * 1000;
    const retryAfterSeconds = blockDurationSeconds;

    // Enregistrer également dans Supabase pour synchronisation multi-serveurs
    try {
      const supabaseAdmin = getServerSupabaseAdmin();
      await supabaseAdmin.from("rate_limit_tracking").upsert({
        key,
        attempt_count: entry.count,
        blocked_until: new Date(entry.blockedUntil).toISOString(),
        last_attempt_at: new Date().toISOString(),
      });
    } catch {}

    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
      isBlocked: true,
    };
  }

  return {
    allowed: true,
    remainingAttempts: maxAttempts - entry.count,
    isBlocked: false,
  };
}

/**
 * Réinitialise le compteur d'échecs (par exemple après une authentification réussie)
 */
export function resetRateLimit(key: string): void {
  memoryRateLimitCache.delete(key);
  try {
    const supabaseAdmin = getServerSupabaseAdmin();
    supabaseAdmin.from("rate_limit_tracking").delete().eq("key", key).then();
  } catch {}
}

export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface SecurityAlertPayload {
  schoolId?: string;
  severity: AlertSeverity;
  alertType:
    | "BRUTE_FORCE_LOGIN"
    | "CONNEXION_INHABITUELLE"
    | "MODIFICATION_MASSIVE_NOTES"
    | "EXPORT_MASSIF"
    | "ACCES_HORS_HORAIRES"
    | "SUSPICION_FRAUDE"
    | string;
  title: string;
  description: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  req?: Request;
}

/**
 * Enregistre une alerte de sécurité dans `security_alerts` et dans `audit_logs`
 */
export async function createSecurityAlert(payload: SecurityAlertPayload): Promise<void> {
  try {
    let ip = payload.ipAddress;
    let ua = payload.userAgent;

    if (payload.req) {
      if (!ip) {
        ip =
          payload.req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
          payload.req.headers.get("x-real-ip") ||
          undefined;
      }
      if (!ua) {
        ua = payload.req.headers.get("user-agent") || undefined;
      }
    }

    const supabaseAdmin = getServerSupabaseAdmin();

    const { error: insertError } = await supabaseAdmin.from("security_alerts").insert({
      school_id: payload.schoolId || null,
      severity: payload.severity,
      alert_type: payload.alertType,
      title: payload.title,
      description: payload.description,
      user_id: payload.userId || null,
      user_email: payload.userEmail || null,
      ip_address: ip || null,
      user_agent: ua || null,
      metadata: payload.metadata || {},
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("[RateLimiter] Erreur insertion alerte de sécurité :", insertError.message);
    }

    // Journaliser également dans audit_logs si rattaché à une école
    if (payload.schoolId) {
      await recordAuditEvent({
        schoolId: payload.schoolId,
        userId: payload.userId,
        role: "security_monitor",
        action: `ALERTE_${payload.alertType}`,
        resourceType: "security_alerts",
        newData: {
          severity: payload.severity,
          title: payload.title,
          description: payload.description,
          metadata: payload.metadata,
        },
        ip,
        userAgent: ua,
      });
    }
  } catch (err) {
    console.error("[RateLimiter] Exception lors de la création d'alerte :", err);
  }
}

/**
 * Détecte si une action est exécutée hors des heures scolaires habituelles
 * Fuseau Bénin : UTC+1. Heures nocturnes suspectes : entre 23h00 et 05h00.
 */
export function isOffHoursAccess(date: Date = new Date()): boolean {
  // Décalage Bénin (UTC+1)
  const utcHours = date.getUTCHours();
  const beninHours = (utcHours + 1) % 24;
  return beninHours >= 23 || beninHours < 5;
}
