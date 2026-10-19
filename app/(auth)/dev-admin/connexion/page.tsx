"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DevAdminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirection immédiate vers la page de connexion standard unifiée
    router.replace("/connexion");
  }, [router]);

  return null;
}
