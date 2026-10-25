"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Shield, BookOpen, Award } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { BeninBlankBulletinTemplate } from "@/components/school/BeninBlankBulletinTemplate";
import { useSubscriptionStore } from "@/lib/subscription-store";

export default function ModeleOfficielBulletinPage() {
  const { activeSchool } = useSubscriptionStore();

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader
          title="Modèle Officiel du Bulletin Béninois"
          subtitle="Gabarit réglementaire vierge A4 portrait &bull; République du Bénin (13 matières, 9 ou 13 colonnes, 3 moyennes et signatures)"
          breadcrumbs={[
            { label: "Censeur", href: "/censeur" },
            { label: "Notes & Délibérations", href: "/censeur/notes" },
            { label: "Modèle Officiel Bénin" },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/censeur/notes"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition touch-target"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retour aux délibérations</span>
              </Link>
            </div>
          }
        />
      </div>

      <BeninBlankBulletinTemplate
        schoolName={activeSchool.name || "ÉTABLISSEMENT SCOLAIRE BÉNINOIS"}
        postalBox={activeSchool.city ? `BP 01 ${activeSchool.city}` : "BP 000 Cotonou"}
        phone={activeSchool.phone || "+229 00 00 00 00"}
        academicYear={activeSchool.activeYear || "2026-2027"}
        periodName="1er Semestre"
        className="Classe Vierge Référence"
        effectiveCount="Effectif réel"
      />
    </div>
  );
}
