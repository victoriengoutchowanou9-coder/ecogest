"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Enregistrement automatique dans la base de données pour la supervision Développeur
    try {
      fetch("/api/dev-admin/errors/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message || "Application error: a client-side exception has occurred",
          stack: error.stack || "",
          page: typeof window !== "undefined" ? window.location.pathname : "Application",
          module: "Next.js Client Boundary",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        }),
      }).catch(() => {});
    } catch {}
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 text-center space-y-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
          <AlertOctagon className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-extrabold text-slate-900">
            Une erreur inattendue est survenue
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            L'incident a été automatiquement consigné dans le journal technique pour analyse par le développeur.
          </p>
        </div>

        {error.digest && (
          <p className="text-[11px] font-mono text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100">
            Code incident : {error.digest}
          </p>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-school-primary hover:bg-school-700 text-white text-xs font-bold transition shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Retour à l'accueil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
