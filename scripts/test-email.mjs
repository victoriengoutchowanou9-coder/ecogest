/**
 * Script de diagnostic et test d'expédition d'e-mail OTP
 * Usage : node scripts/test-email.mjs [votre-email@domaine.com]
 */

import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

// Lecture de .env.local si existant
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const targetEmail = process.argv[2] || process.env.SMTP_USER || "test@example.com";

console.log("==================================================================");
console.log("🔍 DIAGNOSTIC DU SERVICE DE MESSAGERIE ECOGEST");
console.log("==================================================================");
console.log(`• Destinataire de test : ${targetEmail}`);
console.log(`• SMTP_HOST            : ${process.env.SMTP_HOST || "NON DÉFINI ❌"}`);
console.log(`• SMTP_PORT            : ${process.env.SMTP_PORT || "587 (défaut)"}`);
console.log(`• SMTP_USER            : ${process.env.SMTP_USER || "NON DÉFINI ❌"}`);
console.log(`• SMTP_PASS            : ${process.env.SMTP_PASS ? "CONFIGURÉ ✅" : "NON DÉFINI ❌"}`);
console.log(`• SMTP_SECURE          : ${process.env.SMTP_SECURE || "défaut"}`);
console.log(`• SMTP_FROM            : ${process.env.SMTP_FROM || "ECOGEST <contact@ecogest.bj>"}`);
console.log(`• RESEND_API_KEY       : ${process.env.RESEND_API_KEY ? "CONFIGURÉ ✅" : "NON DÉFINI"}`);
console.log("==================================================================");

if (process.env.RESEND_API_KEY) {
  console.log("🚀 Test via Resend API...");
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.SMTP_FROM || process.env.EMAIL_FROM || "ECOGEST <onboarding@resend.dev>",
        to: [targetEmail],
        subject: "[ECOGEST] Test de réception de code de confirmation",
        html: `<h3>Test ECOGEST réussi !</h3><p>Votre code de confirmation test est : <strong>123456</strong>.</p>`,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      console.log("✅ E-mail envoyé avec succès via Resend ! ID:", data.id);
      process.exit(0);
    } else {
      console.error("❌ Erreur Resend :", data);
    }
  } catch (err) {
    console.error("❌ Exception Resend :", err.message);
  }
}

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.log("⚠️  ATTENTION : Vos identifiants SMTP ne sont pas encore configurés dans .env.local !");
  console.log("   Pour recevoir de vrais e-mails dans votre boîte de messagerie, ajoutez");
  console.log("   les lignes suivantes à votre fichier .env.local :");
  console.log("");
  console.log("   SMTP_HOST=smtp.gmail.com");
  console.log("   SMTP_PORT=465");
  console.log("   SMTP_SECURE=true");
  console.log("   SMTP_USER=votre-email@gmail.com");
  console.log("   SMTP_PASS=votre_mot_de_passe_d_application");
  console.log('   SMTP_FROM="ECOGEST <votre-email@gmail.com>"');
  console.log("");
  console.log("   (Ou utilisez Brevo : smtp-relay.brevo.com / port 587)");
  console.log("==================================================================");
  process.exit(0);
}

const port = parseInt(process.env.SMTP_PORT || "587", 10);
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure: process.env.SMTP_SECURE === "true" || port === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
});

console.log("🔄 Tentative de connexion au serveur SMTP...");
try {
  await transporter.verify();
  console.log("✅ Connexion SMTP validée avec succès !");

  console.log(`📤 Envoi d'un e-mail de test à ${targetEmail}...`);
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || `"ECOGEST Test" <${process.env.SMTP_USER}>`,
    to: targetEmail,
    subject: "[ECOGEST] Test de réception de code de confirmation",
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #0284c7;">Test de confirmation ECOGEST</h2>
        <p>Ceci est un e-mail de test envoyé pour valider votre configuration SMTP.</p>
        <p>Votre code de confirmation test est : <strong style="font-size: 24px; color: #0f172a; letter-spacing: 4px;">849201</strong></p>
      </div>
    `,
    text: "Test ECOGEST. Code de validation : 849201",
  });

  console.log("🎉 E-mail envoyé avec succès ! Message ID :", info.messageId);
  console.log("👉 Vérifiez votre boîte de réception (et vos spams/courriers indésirables).");
} catch (err) {
  console.error("❌ Échec de la connexion ou de l'envoi SMTP :", err.message);
  if (err.message.includes("Username and Password not accepted") || err.message.includes("535")) {
    console.error("👉 Solution Gmail : Créez un 'Mot de passe d'application' à 16 lettres (ne pas utiliser le mot de passe habituel du compte).");
  }
}
