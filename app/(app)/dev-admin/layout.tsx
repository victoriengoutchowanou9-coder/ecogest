import React from "react";
import { DevShell } from "@/components/layout/DevShell";

export const metadata = {
  title: "Console Développeur ECOGEST | Supervision Technique",
  description: "Espace de supervision technique, monitoring et gestion globale des établissements ECOGEST.",
};

export default function DevAdminLayout({ children }: { children: React.ReactNode }) {
  return <DevShell>{children}</DevShell>;
}
