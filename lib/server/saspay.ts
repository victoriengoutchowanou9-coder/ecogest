import crypto from "crypto";

/**
 * =============================================================================
 * MODULE SERVEUR SASPAY — INTÉGRATION API OFFICIELLE (ABONNEMENTS)
 * Documentation officielle : https://saspay.mintlify.app
 * =============================================================================
 */

const SASPAY_API_BASE_URL = process.env.SASPAY_API_URL || "https://api.saspay.me";

/**
 * Récupère la clé secrète SasPay depuis les variables d'environnement.
 * La clé secrète ne doit JAMAIS être exposée au client ou dans le bundle React.
 */
export function getSasPaySecretKey(): string {
  const key = process.env.SASPAY_SECRET_KEY || "";
  if (!key) {
    console.warn(
      "[SasPay] Attention: SASPAY_SECRET_KEY n'est pas configurée dans .env.local ou Vercel."
    );
  }
  return key.trim();
}

/**
 * Récupère le secret de signature Webhook SasPay.
 */
export function getSasPayWebhookSecret(): string {
  const secret = process.env.SASPAY_WEBHOOK_SECRET || "";
  return secret.trim();
}

export interface SasPayCheckoutParams {
  amount: number;
  currency?: string; // Par défaut: "XOF" (FCFA)
  description: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  returnUrl?: string;
  reference?: string;
  metadata?: Record<string, any>;
}

export interface SasPayCheckoutResult {
  success: boolean;
  sessionId?: string;
  checkoutUrl?: string;
  status?: string;
  error?: string;
  raw?: any;
}

/**
 * 1. Création d'une session de paiement hébergée (Hosted Checkout Session)
 * POST https://api.saspay.me/api/v1/checkout-sessions/
 */
export async function createSasPayCheckoutSession(
  params: SasPayCheckoutParams
): Promise<SasPayCheckoutResult> {
  const apiKey = getSasPaySecretKey();
  if (!apiKey) {
    return {
      success: false,
      error: "La clé secrète SasPay (SASPAY_SECRET_KEY) n'est pas configurée côté serveur.",
    };
  }

  // Formatage du montant au format décimal strict exigé par SasPay (ex: "6000.00")
  const formattedAmount = Number(params.amount).toFixed(2);

  // SasPay exige obligatoirement customer_email et customer_name valides
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let customerEmail = (params.customerEmail || "").trim();
  if (!emailRegex.test(customerEmail)) {
    customerEmail = "contact@ecole.educogest.com";
  }

  let customerName = (params.customerName || "").trim();
  if (!customerName || customerName.length < 2) {
    customerName = "Client EDUCOGEST";
  }

  const payload: Record<string, any> = {
    amount: formattedAmount,
    currency: params.currency || "XOF",
    description: params.description || "Abonnement EDUCOGEST",
    customer_email: customerEmail,
    customer_name: customerName,
  };

  if (params.customerPhone && params.customerPhone.trim()) {
    payload.customer_phone = params.customerPhone.trim();
  }
  if (params.returnUrl) payload.return_url = params.returnUrl;
  if (params.reference) payload.reference = params.reference;
  if (params.metadata) payload.metadata = params.metadata;

  try {
    const response = await fetch(`${SASPAY_API_BASE_URL}/api/v1/checkout-sessions/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
      let errMsg = `Erreur SasPay HTTP ${response.status}`;
      if (data) {
        if (typeof data.error === "string") {
          errMsg = data.error;
        } else if (typeof data.error === "object" && data.error !== null) {
          errMsg = Object.entries(data.error)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
            .join(" | ");
        } else if (data.message) {
          errMsg = typeof data.message === "string" ? data.message : JSON.stringify(data.message);
        } else if (data.detail) {
          errMsg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
        }
      }
      console.error("[SasPay:createCheckoutSession] Erreur API :", response.status, data);
      return { success: false, error: errMsg, raw: data };
    }

    // Extraction de la session selon le format SasPay
    const sessionData = data.data || data;
    const checkoutUrl =
      sessionData.checkout_url ||
      sessionData.url ||
      sessionData.payment_url ||
      sessionData.link ||
      "";
    const sessionId = sessionData.id || sessionData.session_id || sessionData.reference || "";

    if (!checkoutUrl) {
      console.warn("[SasPay:createCheckoutSession] checkout_url manquant dans la réponse :", data);
    }

    return {
      success: true,
      sessionId,
      checkoutUrl,
      status: sessionData.status || "PENDING",
      raw: data,
    };
  } catch (err: any) {
    console.error("[SasPay:createCheckoutSession] Exception réseau :", err);
    return {
      success: false,
      error: err.message || "Impossible de contacter les serveurs de paiement SasPay.",
    };
  }
}

/**
 * 2. Vérification directe du statut d'une session de checkout
 * GET https://api.saspay.me/api/v1/checkout-sessions/{id}/status/ ou /{id}/
 */
export async function getSasPaySessionStatus(sessionId: string): Promise<{
  success: boolean;
  status: "PAID" | "PENDING" | "FAILED" | "CANCELLED" | "UNKNOWN";
  rawStatus?: string;
  amount?: number;
  currency?: string;
  error?: string;
}> {
  const apiKey = getSasPaySecretKey();
  if (!apiKey || !sessionId) {
    return { success: false, status: "UNKNOWN", error: "Identifiant de session ou clé manquante." };
  }

  try {
    const response = await fetch(
      `${SASPAY_API_BASE_URL}/api/v1/checkout-sessions/${encodeURIComponent(sessionId)}/status/`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    // Si l'endpoint status renvoie 404, fallback sur l'endpoint direct de session
    let data: any = null;
    if (response.status === 404) {
      const fallbackRes = await fetch(
        `${SASPAY_API_BASE_URL}/api/v1/checkout-sessions/${encodeURIComponent(sessionId)}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );
      data = await fallbackRes.json().catch(() => null);
    } else {
      data = await response.json().catch(() => null);
    }

    if (!data) {
      return { success: false, status: "UNKNOWN", error: "Réponse vide de SasPay." };
    }

    const sessionData = data.data || data;
    const rawStatus = (sessionData.status || "").toUpperCase();

    let normalizedStatus: "PAID" | "PENDING" | "FAILED" | "CANCELLED" | "UNKNOWN" = "UNKNOWN";
    if (["PAID", "SUCCESS", "SUCCESSFUL", "CONFIRMED", "COMPLETED"].includes(rawStatus)) {
      normalizedStatus = "PAID";
    } else if (["PENDING", "PROCESSING", "INITIATED"].includes(rawStatus)) {
      normalizedStatus = "PENDING";
    } else if (["FAILED", "DECLINED", "ERROR", "REJECTED"].includes(rawStatus)) {
      normalizedStatus = "FAILED";
    } else if (["CANCELLED", "CANCELED", "EXPIRED"].includes(rawStatus)) {
      normalizedStatus = "CANCELLED";
    }

    return {
      success: true,
      status: normalizedStatus,
      rawStatus,
      amount: Number(sessionData.amount || sessionData.net_amount) || undefined,
      currency: sessionData.currency,
    };
  } catch (err: any) {
    console.error("[SasPay:getSessionStatus] Exception :", err);
    return { success: false, status: "UNKNOWN", error: err.message };
  }
}

/**
 * 3. Validation de signature cryptographique HMAC-SHA256 pour les Webhooks
 * Supporte :
 *  - X-Signature / X-Signature-256 avec X-Timestamp
 *  - Signature simple HMAC sur rawBody
 */
export function verifySasPayWebhookSignature(params: {
  rawBody: string;
  receivedSignature: string | null;
  timestamp?: string | null;
}): boolean {
  const secret = getSasPayWebhookSecret();
  if (!secret) {
    console.warn(
      "[SasPay:Webhook] SASPAY_WEBHOOK_SECRET non configuré. Validation impossible en mode sécurisé."
    );
    return false;
  }

  if (!params.receivedSignature) {
    return false;
  }

  try {
    const cleanSig = params.receivedSignature.trim();

    // Cas 1 : Avec timestamp combiné (timestamp.body)
    if (params.timestamp) {
      const messageWithTs = `${params.timestamp}.${params.rawBody}`;
      const hashWithTs = crypto
        .createHmac("sha256", secret)
        .update(messageWithTs)
        .digest("hex");

      if (
        hashWithTs.length === cleanSig.length &&
        crypto.timingSafeEqual(Buffer.from(hashWithTs), Buffer.from(cleanSig))
      ) {
        return true;
      }
    }

    // Cas 2 : Signature directe sur rawBody
    const directHash = crypto
      .createHmac("sha256", secret)
      .update(params.rawBody)
      .digest("hex");

    if (
      directHash.length === cleanSig.length &&
      crypto.timingSafeEqual(Buffer.from(directHash), Buffer.from(cleanSig))
    ) {
      return true;
    }

    return false;
  } catch (err) {
    console.error("[SasPay:verifySignature] Exception :", err);
    return false;
  }
}
