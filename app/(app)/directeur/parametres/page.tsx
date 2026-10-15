"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  School,
  Save,
  MapPin,
  Phone,
  Mail,
  Globe,
  Check,
  Building2,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Plus,
  X,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/Toast";
import {
  useSubscriptionStore,
  SchoolProfile,
  SCHOOL_PLANS,
} from "@/lib/subscription-store";

export default function ParametresEtablissementPage() {
  const { toast } = useToast();
  const {
    activeSchool,
    schools,
    schoolPlan,
    schoolPlanDef,
    canAddSchool,
    updateSchoolProfile,
    createSchool,
    switchActiveSchool,
  } = useSubscriptionStore();

  const [formData, setFormData] = useState<SchoolProfile>(activeSchool);
  const [isNewSchoolModalOpen, setIsNewSchoolModalOpen] = useState(false);

  // Synchroniser quand l'école active change
  useEffect(() => {
    setFormData(activeSchool);
  }, [activeSchool.id]);

  // Formulaire de nouvelle école (Forfait Premium)
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolShort, setNewSchoolShort] = useState("");
  const [newSchoolCountry, setNewSchoolCountry] = useState("Bénin");
  const [newSchoolRegion, setNewSchoolRegion] = useState("Ouémé");
  const [newSchoolCity, setNewSchoolCity] = useState("Porto-Novo");
  const [newSchoolAddress, setNewSchoolAddress] = useState("");
  const [newSchoolPhone, setNewSchoolPhone] = useState("+229 ");
  const [newSchoolEmail, setNewSchoolEmail] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(activeSchool.id, formData);
    toast(`Profil de « ${formData.name} » mis à jour avec succès !`, "success");
  };

  const handleCreateSecondSchool = (e: React.FormEvent) => {
    e.preventDefault();
    const result = createSchool({
      code: `SCH-${Date.now().toString().slice(-4)}`,
      name: newSchoolName.trim(),
      shortName: newSchoolShort.trim() || newSchoolName.trim().slice(0, 15),
      slug: newSchoolName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-"),
      logo: "/images/logo-ccpa.png",
      coverImage: "/images/pexels-tosin-olowoleni-2148141635-34162713.jpg",
      country: newSchoolCountry,
      region: newSchoolRegion,
      city: newSchoolCity,
      address: newSchoolAddress || `${newSchoolCity}, ${newSchoolCountry}`,
      phone: newSchoolPhone,
      email: newSchoolEmail || `contact@${newSchoolCity.toLowerCase()}.bj`,
      devise: "Travail - Rigueur - Réussite",
      currency: "FCFA",
      activeYear: "2026-2027",
    });

    if (result.success) {
      setIsNewSchoolModalOpen(false);
      toast(`Nouvel établissement « ${newSchoolName} » créé et activé !`, "success");
    } else {
      toast(result.error || "Impossible de créer cet établissement.", "error");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <PageHeader
        title="Paramètres de l'Établissement"
        subtitle="Identité visuelle, logo, couverture, localisation géographique et gestion multi-établissements"
        breadcrumbs={[{ label: "Directeur", href: "/directeur" }, { label: "Paramètres" }]}
      />

      {/* Onglets des Établissements (Multi-Établissements pour Premium - Requirement 4) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-school-primary" />
              <span>Vos Établissements scolaires ({schools.length} / {schoolPlanDef.maxSchools})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Formule actuelle : <strong className="text-slate-800">{schoolPlanDef.name}</strong>{" "}
              ({schoolPlanDef.priceFcfa.toLocaleString()} FCFA/mois)
            </p>
          </div>

          {/* Bouton d'ajout 2ème établissement */}
          {schoolPlan === "PREMIUM" && schools.length < 2 && (
            <button
              type="button"
              onClick={() => setIsNewSchoolModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Créer le 2ème Établissement</span>
            </button>
          )}

          {schoolPlan !== "PREMIUM" && (
            <Link
              href="/directeur/abonnement"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Gérer jusqu&apos;à 2 établissements (Formule Premium) &rarr;</span>
            </Link>
          )}
        </div>

        {/* Sélecteur visuel d'école */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {schools.map((sch) => {
            const isCurrent = sch.id === activeSchool.id;
            return (
              <div
                key={sch.id}
                onClick={() => switchActiveSchool(sch.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  isCurrent
                    ? "border-school-primary bg-school-50/60 shadow-sm ring-1 ring-school-primary/30"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-school-primary text-white flex items-center justify-center font-black text-sm uppercase shrink-0">
                    {sch.shortName ? sch.shortName.charAt(0) : "E"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {sch.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {sch.city}, {sch.country} &bull; Code: {sch.code}
                    </p>
                  </div>
                </div>
                {isCurrent && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-school-primary text-white shrink-0">
                    Actif
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Formulaire de l'établissement actif */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-8">
        {/* Section 1 : Identité & Médias (Logo & Couverture) */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <School className="w-5 h-5 text-school-primary" />
              <span>Identité Visuelle &amp; Nom de l&apos;Établissement</span>
            </h3>
            <p className="text-xs text-slate-500">
              Ces informations apparaîtront dans la barre supérieure, les bulletins officiels et les reçus.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Nom officiel de l&apos;établissement</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm focus:border-school-primary focus:ring-2 focus:ring-school-primary/20 touch-target"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Nom court / Sigle</label>
              <input
                type="text"
                required
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm focus:border-school-primary focus:ring-2 focus:ring-school-primary/20 touch-target"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Devise de l&apos;établissement</label>
              <input
                type="text"
                value={formData.devise}
                onChange={(e) => setFormData({ ...formData, devise: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm focus:border-school-primary focus:ring-2 focus:ring-school-primary/20 touch-target"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Image de couverture ou photo de l&apos;établissement</span>
                <span className="text-slate-400 font-normal">URL ou chemin d&apos;accès</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.coverImage || ""}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="/images/pexels-tosin-olowoleni-2148141635-34162713.jpg"
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs font-mono focus:border-school-primary focus:ring-2 focus:ring-school-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 : Localisation géographique (Pays, Région, Ville) */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-school-primary" />
              <span>Localisation Géographique (Pays, Région, Ville)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Précisez le pays et la ville de votre établissement scolaire.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Pays</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-sm bg-white focus:border-school-primary focus:ring-2 focus:ring-school-primary/20"
              >
                <option value="Bénin">Bénin</option>
                <option value="Togo">Togo</option>
                <option value="Côte d'Ivoire">Côte d&apos;Ivoire</option>
                <option value="Sénégal">Sénégal</option>
                <option value="Cameroun">Cameroun</option>
                <option value="Burkina Faso">Burkina Faso</option>
                <option value="Niger">Niger</option>
                <option value="Mali">Mali</option>
                <option value="Guinée">Guinée</option>
                <option value="Gabon">Gabon</option>
                <option value="Congo">Congo</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Région / Département</label>
              <input
                type="text"
                required
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="Ex: Littoral, Ouémé, Atlantique..."
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm focus:border-school-primary focus:ring-2 focus:ring-school-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Ville / Commune</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ex: Cotonou, Porto-Novo, Parakou..."
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm focus:border-school-primary focus:ring-2 focus:ring-school-primary/20"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-3">
              <label className="text-xs font-semibold text-slate-700">Adresse postale / Quartier</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ex: Quartier Cadjehoun, Carré 120"
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm focus:border-school-primary focus:ring-2 focus:ring-school-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Section 3 : Coordonnées de Contact */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-5 h-5 text-school-primary" />
              <span>Coordonnées Officielles &amp; Devises</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Téléphone standard</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm font-mono focus:border-school-primary focus:ring-2 focus:ring-school-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Email officiel</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm focus:border-school-primary focus:ring-2 focus:ring-school-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Devise de facturation</label>
              <input
                type="text"
                disabled
                value="FCFA"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm font-bold text-slate-600"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-school-primary hover:bg-school-700 text-white font-bold text-sm shadow-md transition-colors touch-target"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les paramètres de l&apos;établissement</span>
          </button>
        </div>
      </form>

      {/* Modal Création du 2ème Établissement (Forfait Premium) */}
      {isNewSchoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-school-primary" />
                <h3 className="font-bold text-slate-900">Créer votre 2ème Établissement scolaire</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewSchoolModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSecondSchool} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Nom complet de la 2ème école</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Complexe Scolaire Sainte-Rita"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-school-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Nom court</label>
                  <input
                    type="text"
                    required
                    placeholder="CS Sainte-Rita"
                    value={newSchoolShort}
                    onChange={(e) => setNewSchoolShort(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Pays</label>
                  <select
                    value={newSchoolCountry}
                    onChange={(e) => setNewSchoolCountry(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="Bénin">Bénin</option>
                    <option value="Togo">Togo</option>
                    <option value="Côte d'Ivoire">Côte d&apos;Ivoire</option>
                    <option value="Sénégal">Sénégal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Région</label>
                  <input
                    type="text"
                    required
                    placeholder="Ouémé"
                    value={newSchoolRegion}
                    onChange={(e) => setNewSchoolRegion(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Ville</label>
                  <input
                    type="text"
                    required
                    placeholder="Porto-Novo"
                    value={newSchoolCity}
                    onChange={(e) => setNewSchoolCity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Cet établissement aura ses propres classes, élèves, professeurs et comptabilité.
                  Vous pourrez basculer de l&apos;un à l&apos;autre en un clic dans la barre supérieure.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewSchoolModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-sm"
                >
                  Créer l&apos;établissement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
