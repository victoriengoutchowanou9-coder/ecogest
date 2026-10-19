import crypto from "crypto";
import { cookies } from "next/headers";
import { getServerSupabaseAdmin } from "./supabase-admin";

const AUTH_SECRET =
  process.env.DEV_ADMIN_SECRET ||
  "ecogest_session_secret_f98a2e1d74c0b65e94b210f92415d863e41b2c589a647038164b5cd1a87e";

export const SESSION_COOKIE_NAME = "ecogest_auth_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 jours

/**
 * Calcule une empreinte SHA-256 du jeton de session pour le stockage sécurisé
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Déduit le type d'appareil et un libellé lisible à partir du User-Agent
 */
export function parseDeviceFromUserAgent(ua?: string): {
  deviceName: string;
  deviceType: "DESKTOP" | "MOBILE" | "TABLET" | "UNKNOWN";
} {
  if (!ua) return { deviceName: "Appareil Inconnu", deviceType: "UNKNOWN" };

  const isMobile = /mobile|iphone|ipod|android.*mobile|blackberry|opera mini/i.test(ua);
  const isTablet = /tablet|ipad|android(?!.*mobile)/i.test(ua);

  let os = "Système inconnu";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "Navigateur Web";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/chrome/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua)) browser = "Safari";
  else if (/firefox/i.test(ua)) browser = "Firefox";

  const deviceType = isTablet ? "TABLET" : isMobile ? "MOBILE" : "DESKTOP";
  const deviceName = `${browser} sur ${os}`;

  return { deviceName, deviceType };
}

/**
 * Crée un jeton de session cryptographiquement signé pour un utilisateur d'établissement.
 */
export function createSchoolUserSessionToken(userId: string, email: string): string {
  const ts = Date.now();
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = [userId, email.toLowerCase().trim(), ts.toString(), nonce].join(":");
  const hmac = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${hmac}`).toString("base64url");
}

/**
 * Vérifie l'intégrité et l'expiration d'un jeton de session utilisateur.
 */
export function verifySchoolUserSessionToken(token: string): {
  valid: boolean;
  userId?: string;
  email?: string;
} {
  try {
    if (!token || typeof token !== "string") return { valid: false };
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const parts = raw.split(":");
    if (parts.length !== 5) return { valid: false };

    const [userId, email, tsStr, nonce, receivedHmac] = parts;
    const payload = [userId, email, tsStr, nonce].join(":");
    const expectedHmac = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");

    const bufA = Buffer.from(receivedHmac);
    const bufB = Buffer.from(expectedHmac);
    if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
      return { valid: false };
    }

    const timestamp = parseInt(tsStr, 10);
    const maxAgeMs = SESSION_MAX_AGE_SECONDS * 1000;
    if (isNaN(timestamp) || Date.now() - timestamp > maxAgeMs) {
      return { valid: false };
    }

    return { valid: true, userId, email };
  } catch {
    return { valid: false };
  }
}

/**
 * Enregistre ou met en rotation la session dans PostgreSQL avec limite d'appareils
 */
export async function registerSessionInDatabase(params: {
  schoolId: string;
  userId: string;
  sessionToken: string;
  req?: Request;
}): Promise<void> {
  try {
    const tokenHash = hashSessionToken(params.sessionToken);
    const ua = params.req?.headers.get("user-agent") || undefined;
    const ip =
      params.req?.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      params.req?.headers.get("x-real-ip") ||
      undefined;

    const { deviceName, deviceType } = parseDeviceFromUserAgent(ua);

    const supabase = getServerSupabaseAdmin();
    await supabase.rpc("register_or_rotate_session", {
      p_school_id: params.schoolId,
      p_user_id: params.userId,
      p_token_hash: tokenHash,
      p_device_name: deviceName,
      p_device_type: deviceType,
      p_ip: ip || null,
      p_user_agent: ua || null,
    });
  } catch (err) {
    console.warn("[SessionManager] Avertissement enregistrement session DB (non bloquant) :", err);
  }
}

/**
 * Vérifie si la session a été révoquée à distance par l'administrateur
 */
export async function isSessionRevokedInDatabase(token: string): Promise<boolean> {
  try {
    const tokenHash = hashSessionToken(token);
    const supabase = getServerSupabaseAdmin();
    const { data: session } = await supabase
      .from("user_sessions")
      .select("is_revoked, expires_at")
      .eq("session_token_hash", tokenHash)
      .maybeSingle();

    if (!session) return false; // Si pas encore en table (legacy), laisser la signature faire foi
    if (session.is_revoked) return true;
    if (session.expires_at && new Date(session.expires_at) < new Date()) return true;

    // Actualiser discrètement l'activité
    supabase
      .from("user_sessions")
      .update({ last_active_at: new Date().toISOString() })
      .eq("session_token_hash", tokenHash)
      .then();

    return false;
  } catch {
    return false;
  }
}

/**
 * Récupère le jeton de session depuis les cookies de la requête.
 */
export async function getSessionTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
  } catch {
    return null;
  }
}
