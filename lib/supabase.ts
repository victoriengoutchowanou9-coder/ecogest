import { createClient } from "@supabase/supabase-js";

// Compatibilité universelle Vercel & Vite pour l'URL Supabase
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";

// Compatibilité universelle Vercel & Vite pour la clé publique Supabase
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "";

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== "undefined") {
    console.warn(
      "Identifiants Supabase manquants. Veuillez définir NEXT_PUBLIC_SUPABASE_URL (ou VITE_SUPABASE_URL / SUPABASE_URL) et NEXT_PUBLIC_SUPABASE_ANON_KEY (ou VITE_SUPABASE_ANON_KEY / SUPABASE_ANON_KEY) dans vos variables d'environnement Vercel."
    );
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Détermine dynamiquement l'URL d'origine de l'application en cours d'exécution.
 * En production sur Vercel, garantit l'utilisation du domaine réel et jamais de localhost:3000.
 */
export function getAppOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/**
 * Inscription Supabase GoTrue avec redirection dynamique vers window.location.origin
 */
export async function signUpWithDynamicRedirect(params: {
  email: string;
  password?: string;
  options?: any;
}) {
  const origin = getAppOrigin();
  return supabase.auth.signUp({
    email: params.email,
    password: params.password || "",
    options: {
      ...params.options,
      emailRedirectTo: origin,
    },
  });
}

/**
 * Renvoi du lien d'email de confirmation Supabase avec redirection dynamique vers window.location.origin
 */
export async function resendVerificationEmail(email: string) {
  const origin = getAppOrigin();
  return supabase.auth.resend({
    type: "signup",
    email: email.trim(),
    options: {
      emailRedirectTo: origin,
    },
  });
}
