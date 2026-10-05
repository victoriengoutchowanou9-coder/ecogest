"use client";

import React, { useState } from "react";
import { Globe, Eye, EyeOff, Award, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";

export default function PublicationsPage() {
  const { toast } = useToast();
  const [items, setItems] = useState([
    { id: "p-01", title: "Résultats Session BEPC 2026", rate: "95.4 % de réussite", isPublished: true, date: "15/07/2026" },
    { id: "p-02", title: "Résultats Session BAC 2026 (Séries A/B/C/D)", rate: "91.8 % de réussite", isPublished: true, date: "22/07/2026" },
    { id: "p-03", title: "Grille tarifaire et frais de scolarité 2026-2027", rate: "Grille officielle", isPublished: true, date: "01/08/2026" },
    { id: "p-04", title: "Statistiques d'orientation 2026-2027", rate: "En préparation", isPublished: false, date: "Brouillon" },
  ]);

  const togglePublish = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = !item.isPublished;
          toast(
            next ? `Publication en ligne activée pour ${item.title}` : `Retrait de la publication : ${item.title}`,
            "info"
          );
          return { ...item, isPublished: next };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Publication des Résultats Publics"
        subtitle="Contrôlez les indicateurs de performance visibles sur la vitrine officielle de l'école"
        breadcrumbs={[{ label: "Directeur", href: "/directeur" }, { label: "Résultats publics" }]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm md:text-base font-bold text-slate-900">{item.title}</h3>
                <StatusBadge
                  status={item.isPublished ? "VALIDATED" : "DRAFT"}
                  label={item.isPublished ? "En ligne" : "Masqué"}
                  size="sm"
                />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {item.rate} &middot; Dernière modification : {item.date}
              </p>
            </div>

            <button
              type="button"
              onClick={() => togglePublish(item.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-colors touch-target min-h-[40px] ${
                item.isPublished
                  ? "border-rose-300 text-rose-700 hover:bg-rose-50"
                  : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              {item.isPublished ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Retirer de la vitrine</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Publier sur la vitrine</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
