import crypto from "crypto";
import { cookies } from "next/headers";

const AUTH_SECRET =
  process.env.DEV_ADMIN_SECRET ||
  "ecogest_session_secret_f98a2e1d74c0b65e94b210f92415d863e41b2c589a647038164b5cd1a87e";

export const SESSION_COOKIE_NAME = "ecogest_auth_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 jours

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
