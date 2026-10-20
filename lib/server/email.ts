/**
 * Service serveur d'expédition d'e-mails transactionnels (SMTP & Resend)
 * Conçu pour ECOGEST — Envoi de codes de sécurité OTP et notifications
 */

import nodemailer from "nodemailer";

export interface SendEmailOtpParams {
  toEmail: string;
  fullName?: string;
  otpCode: string;
  purpose: "REGISTRATION" | "PASSWORD_RESET";
  expiresMinutes?: number;
}

export interface EmailSendResult {
  success: boolean;
  provider: string;
  messageId?: string;
  error?: string;
  devCode?: string;
  warning?: string;
}

/**
 * Vérifie si un service d'envoi d'e-mails est configuré
 */
export function isEmailServiceConfigured(): { configured: boolean; provider: string } {
  if (process.env.RESEND_API_KEY) {
    return { configured: true, provider: "resend" };
  }
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (host && user && pass) {
    return { configured: true, provider: "smtp" };
  }
  return { configured: false, provider: "none" };
}

/**
 * Masque une adresse e-mail pour l'affichage public
 * Ex: "contact@ecole.bj" -> "c***t@ecole.bj"
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email || "";
  const [local, domain] = email.trim().toLowerCase().split("@");
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/**
 * Crée le transporteur SMTP à partir des variables d'environnement
 */
function createSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
    connectionTimeout: 10000,
  });
}

/**
 * Envoi d'e-mail via Resend API (HTTP direct)
 */
async function sendViaResend(params: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, provider: "resend", error: "RESEND_API_KEY manquante" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: params.from,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[Resend API] Erreur:", data);
      return {
        success: false,
        provider: "resend",
        error: data.message || "Erreur de l'API Resend",
      };
    }

    return {
      success: true,
      provider: "resend",
      messageId: data.id,
    };
  } catch (err: any) {
    console.error("[Resend API] Exception:", err.message);
    return {
      success: false,
      provider: "resend",
      error: err.message,
    };
  }
}

/**
 * Génère le modèle HTML officiel d'e-mail OTP pour ECOGEST
 */
function generateOtpHtmlTemplate(params: {
  fullName: string;
  otpCode: string;
  purpose: "REGISTRATION" | "PASSWORD_RESET";
  expiresMinutes: number;
}): string {
  const isRegistration = params.purpose === "REGISTRATION";
  const title = isRegistration
    ? "Confirmation et activation de votre compte"
    : "Réinitialisation de votre mot de passe";

  const actionDescription = isRegistration
    ? "Merci de confirmer votre inscription sur ECOGEST. Utilisez le code de vérification à 6 chiffres ci-dessous pour finaliser l'activation de votre compte :"
    : "Une demande de réinitialisation de mot de passe a été initiée pour votre compte ECOGEST. Saisissez ce code de vérification pour continuer :";

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9, #0284c7, #0369a1); padding: 28px 24px; text-align: center; color: #ffffff;">
              <div style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">ECOGEST</div>
              <div style="font-size: 11px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px; font-weight: 600;">Plateforme Scolaire Intégrée</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">
                Bonjour ${params.fullName || ""},
              </h2>

              <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">
                ${actionDescription}
              </p>

              <!-- OTP Box -->
              <div style="text-align: center; margin: 28px 0; background-color: #f8fafc; border: 2px dashed #0284c7; border-radius: 12px; padding: 20px 16px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Votre Code de Sécurité Temporaire</div>
                <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0369a1; font-family: monospace;">
                  ${params.otpCode}
                </div>
                <div style="font-size: 11px; color: #dc2626; font-weight: 600; margin-top: 8px;">
                  ⏱ Valable pendant ${params.expiresMinutes} minutes seulement
                </div>
              </div>

              <!-- Security notice -->
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 12px 14px; margin-bottom: 24px;">
                <div style="font-size: 12px; font-weight: 700; color: #991b1b; margin-bottom: 2px;">Règle de sécurité stricte</div>
                <div style="font-size: 11px; line-height: 1.4; color: #7f1d1d;">
                  Ne communiquez JAMAIS ce code à qui que ce soit, y compris aux agents de support. Aucun membre d'ECOGEST ne vous demandera votre code de validation.
                </div>
              </div>

              <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin: 0;">
                Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité. Votre compte restera inchangé.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center;">
              <div style="font-size: 11px; color: #94a3b8;">
                © 2026 ECOGEST — Système d'Information & Gestion Éducative Intégrée
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Envoie un code OTP par e-mail via le serveur SMTP ou Resend
 */
export async function sendOtpEmail(params: SendEmailOtpParams): Promise<EmailSendResult> {
  const { toEmail, fullName = "Utilisateur", otpCode, purpose, expiresMinutes = 10 } = params;

  if (!toEmail || !toEmail.includes("@")) {
    return {
      success: false,
      provider: "none",
      error: "Adresse e-mail invalide.",
    };
  }

  const isRegistration = purpose === "REGISTRATION";
  const subject = isRegistration
    ? `[ECOGEST] Votre code de confirmation : ${otpCode}`
    : `[ECOGEST] Réinitialisation de votre mot de passe (Code : ${otpCode})`;

  const fromAddress = process.env.SMTP_FROM || process.env.EMAIL_FROM || "ECOGEST <onboarding@resend.dev>";
  const htmlContent = generateOtpHtmlTemplate({
    fullName,
    otpCode,
    purpose,
    expiresMinutes,
  });
  const textContent = `Votre code de validation ECOGEST est : ${otpCode}. Valable ${expiresMinutes} minutes. Ne le partagez jamais.`;

  // 1. Priorité à Resend API si configuré
  if (process.env.RESEND_API_KEY) {
    const resendRes = await sendViaResend({
      from: fromAddress,
      to: toEmail,
      subject,
      html: htmlContent,
      text: textContent,
    });

    if (resendRes.success) {
      console.log(`[EMAIL RESEND DISPATCH] Code OTP expédié avec succès à ${maskEmail(toEmail)}`);
      return resendRes;
    }

    console.warn("[EMAIL RESEND] Échec d'envoi direct via Resend:", resendRes.error);

    // Si Resend est en mode test/onboarding, il n'autorise que l'adresse du propriétaire du compte
    const verifiedOwnerMatch = resendRes.error?.match(/to your own email address \(([^)]+)\)/i);
    if (verifiedOwnerMatch && verifiedOwnerMatch[1]) {
      const ownerEmail = verifiedOwnerMatch[1].trim();
      const sandboxRes = await sendViaResend({
        from: fromAddress,
        to: ownerEmail,
        subject: `[ECOGEST Test] Code de confirmation pour ${toEmail} : ${otpCode}`,
        html: generateOtpHtmlTemplate({
          fullName: `${fullName} (Destination initiale : ${toEmail})`,
          otpCode,
          purpose,
          expiresMinutes,
        }),
        text: `[ECOGEST Sandbox] Code de validation émis pour ${toEmail} : ${otpCode}.`,
      });

      if (sandboxRes.success) {
        console.log(`[EMAIL RESEND SANDBOX] Code OTP relayé avec succès à l'adresse propriétaire ${maskEmail(ownerEmail)} pour le compte ${toEmail}`);
        return {
          success: true,
          provider: "resend_sandbox",
          messageId: sandboxRes.messageId,
          devCode: otpCode,
          warning: `Envoyé à votre boîte principale (${ownerEmail}). Pour envoyer directement à ${toEmail}, vérifiez un domaine sur resend.com/domains.`,
        };
      }
    }
  }

  // 2. Transporteur SMTP classique
  const transporter = createSmtpTransporter();

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        html: htmlContent,
        text: textContent,
      });

      console.log(`[EMAIL SMTP DISPATCH] Code OTP expédié avec succès à ${maskEmail(toEmail)} (id: ${info.messageId})`);
      return {
        success: true,
        provider: "smtp",
        messageId: info.messageId,
      };
    } catch (err: any) {
      console.error("[Email SMTP] Erreur d'expédition réelle:", err.message);
      if (process.env.NODE_ENV === "production" && process.env.DEV_ALLOW_OTP_PREVIEW !== "true") {
        return {
          success: false,
          provider: "smtp",
          error: `Échec de distribution SMTP : ${err.message}`,
        };
      }
    }
  }

  // 3. Mode Fallback local / dev lorsque le serveur SMTP n'est pas encore configuré
  console.warn(
    `==================================================================\n` +
    `⚠️ [NOTIFICATION SERVEUR - CODE OTP NON ENVOYÉ PAR MAIL]\n` +
    `   Raison : Aucun serveur SMTP (SMTP_HOST/USER/PASS) ou Resend configuré dans .env.local\n` +
    `   Destinataire : ${toEmail}\n` +
    `   Code OTP     : ${otpCode}\n` +
    `   Objet        : ${purpose}\n` +
    `==================================================================`
  );

  return {
    success: true,
    provider: "dev_fallback",
    devCode: otpCode,
    warning: "SMTP_NON_CONFIGURE",
    messageId: `dev-${Date.now()}`,
  };
}
