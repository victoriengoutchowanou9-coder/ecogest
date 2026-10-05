"use client";

import React, { useState } from "react";
import { School, Save, MapPin, Phone, Mail, Globe, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CURRENT_SCHOOL } from "@/lib/permissions";
import { useToast } from "@/components/ui/Toast";

export default function ParametresEtablissementPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: CURRENT_SCHOOL.name,
    shortName: CURRENT_SCHOOL.shortName,
    devise: CURRENT_SCHOOL.devise,
    phone: CURRENT_SCHOOL.phone,
    email: CURRENT_SCHOOL.email,
    address: CURRENT_SCHOOL.address,
    lat: CURRENT_SCHOOL.coordinates.lat.toString(),
    lng: CURRENT_SCHOOL.coordinates.lng.toString(),
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Paramètres de l'établissement enregistrés avec succès !", "success");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Paramètres de l'Établissement"
        subtitle="Identité visuelle, devise, coordonnées GPS et coordonnées de contact"
        breadcrumbs={[{ label: "Directeur", href: "/directeur" }, { label: "Paramètres" }]}
      />

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Identité générale
          </h3>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nom officiel complet</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:border-school-accent focus:ring-1 focus:ring-school-accent touch-target min-h-[44px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nom court / Sigle</label>
              <input
                type="text"
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:border-school-accent focus:ring-1 focus:ring-school-accent touch-target min-h-[44px]"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Devise de l'école</label>
              <input
                type="text"
                value={formData.devise}
                onChange={(e) => setFormData({ ...formData, devise: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:border-school-accent focus:ring-1 focus:ring-school-accent touch-target min-h-[44px]"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Coordonnées &amp; Carte GPS OpenStreetMap
          </h3>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Adresse postale / Quartier</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:border-school-accent focus:ring-1 focus:ring-school-accent touch-target min-h-[44px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Latitude GPS</label>
              <input
                type="text"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm font-mono focus:border-school-accent focus:ring-1 focus:ring-school-accent touch-target min-h-[44px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Longitude GPS</label>
              <input
                type="text"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm font-mono focus:border-school-accent focus:ring-1 focus:ring-school-accent touch-target min-h-[44px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Téléphone standard</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:border-school-accent focus:ring-1 focus:ring-school-accent touch-target min-h-[44px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">E-mail institutionnel</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:border-school-accent focus:ring-1 focus:ring-school-accent touch-target min-h-[44px]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-school-primary hover:bg-school-700 text-white font-semibold text-sm shadow-sm transition-colors touch-target min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les modifications</span>
          </button>
        </div>
      </form>
    </div>
  );
}
