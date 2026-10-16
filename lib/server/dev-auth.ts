import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ygygqilnecwuotbvmbvs.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_0VKUsvbPLWJnALi_C1OUpA_UwHrhfHC";

export const DEV_ADMIN_EMAIL = process.env.DEV_ADMIN_EMAIL || "admin.technique@ecogest.bj";
const DEV_ADMIN_PASSKEY = process.env.DEV_ADMIN_PASSKEY || "EcoGest@2026#DevAdminPro";
const DEV_ADMIN_SECRET = process.env.DEV_ADMIN_SECRET || "f98a2e1d74c0b65e94b210f92415d863e41b2c589a647038164b5cd1a87e";

export function getSupabaseAdminClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Compare deux chaînes de manière sécurisée contre les attaques temporelles (timing attacks).
 */
export function timingSafeCheck(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Valide les identifiants développeur côté serveur uniquement.
 */
export function verifyDeveloperCredentials(email: string, passkey: string): boolean {
  const isEmailValid = timingSafeCheck(email.trim().toLowerCase(), DEV_ADMIN_EMAIL.toLowerCase());
  const isPassValid = timingSafeCheck(passkey, DEV_ADMIN_PASSKEY);
  return isEmailValid && isPassValid;
}

/**
 * Génère un jeton de session chiffré et signé.
 */
export function createDeveloperSessionToken(email: string): string {
  const nonce = crypto.randomBytes(24).toString("hex");
  const timestamp = Date.now();
  const payload = `${email}:${timestamp}:${nonce}`;
  const hmac = crypto.createHmac("sha256", DEV_ADMIN_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${hmac}`).toString("base64url");
}

/**
 * Valide un jeton de session développeur.
 */
export function verifyDeveloperSessionToken(token: string): { valid: boolean; email?: string } {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const parts = raw.split(":");
    if (parts.length !== 4) return { valid: false };

    const [email, timestampStr, nonce, receivedHmac] = parts;
    const payload = `${email}:${timestampStr}:${nonce}`;
    const expectedHmac = crypto.createHmac("sha256", DEV_ADMIN_SECRET).update(payload).digest("hex");

    if (!timingSafeCheck(receivedHmac, expectedHmac)) {
      return { valid: false };
    }

    const timestamp = parseInt(timestampStr, 10);
    const maxAgeMs = 24 * 60 * 60 * 1000; // 24 heures de session
    if (Date.now() - timestamp > maxAgeMs) {
      return { valid: false };
    }

    return { valid: true, email };
  } catch {
    return { valid: false };
  }
}

/**
 * Vérifie l'authentification développeur depuis les cookies de la requête.
 */
export async function requireDeveloperAuth() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("ecogest_dev_session")?.value;

  if (!sessionToken) {
    return { authenticated: false };
  }

  const check = verifyDeveloperSessionToken(sessionToken);
  if (!check.valid) {
    return { authenticated: false };
  }

  return { authenticated: true, email: check.email };
}

/**
 * Enregistre un événement dans le journal d'audit technique (system_audit_logs).
 */
export async function recordSystemAuditLog(data: {
  eventType: string;
  severity?: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  actionTitle: string;
  details?: Record<string, any>;
  userEmail?: string;
  userRole?: string;
  schoolId?: string;
  schoolName?: string;
  ipAddress?: string;
}) {
  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from("system_audit_logs").insert({
      event_type: data.eventType,
      severity: data.severity || "INFO",
      action_title: data.actionTitle,
      details: data.details || {},
      user_email: data.userEmail || null,
      user_role: data.userRole || null,
      school_id: data.schoolId || null,
      school_name: data.schoolName || null,
      ip_address: data.ipAddress || null,
    });
  } catch (err) {
    console.error("Échec d'enregistrement du log d'audit système :", err);
  }
}
