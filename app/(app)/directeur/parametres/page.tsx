"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  School,
  Building2,
  Save,
  MapPin,
  Phone,
  Mail,
  Globe,
  Check,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  ExternalLink,
  Edit,
  UserCheck,
  PenTool,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/Toast";
import {
  useSubscriptionStore,
  SchoolProfile,
} from "@/lib/subscription-store";
import { useBulletinStore } from "@/lib/bulletin-store";

export default function ParametresEtablissementPage() {
  const { toast } = useToast();
  const {
    activeSchool,
    updateSchoolProfile,
  } = useSubscriptionStore();
  const { updateSchoolSettings } = useBulletinStore();

  const [formData, setFormData] = useState<SchoolProfile>({
    ...activeSchool,
    directorName: activeSchool.directorName || "Direction de l'Établissement",
    directorSignatureUrl: activeSchool.directorSignatureUrl || "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Synchroniser quand l'école active change
  useEffect(() => {
    setFormData({
      ...activeSchool,
      directorName: activeSchool.directorName || "Direction de l'Établissement",
      directorSignatureUrl: activeSchool.directorSignatureUrl || "",
    });
  }, [activeSchool.id, activeSchool.name, activeSchool.code, activeSchool.directorName, activeSchool.directorSignatureUrl]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(activeSchool.id, formData);
    updateSchoolSettings({
      name: formData.name,
      motto: formData.devise,
      directorName: formData.directorName || "Direction de l'Établissement",
      directorSignatureUrl: formData.directorSignatureUrl || "",
      district: formData.city || formData.region || "",
      phoneNumbers: formData.phone || "",
      teachingType: formData.teachingType,
    });

    try {
      await fetch("/api/schools", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeSchool.id,
          name: formData.name,
          shortName: formData.shortName,
          directorName: formData.directorName,
          directorSignatureUrl: formData.directorSignatureUrl,
          devise: formData.devise,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          country: formData.country,
          region: formData.region,
          city: formData.city,
        }),
      });
    } catch (err) {
      console.warn("Échec synchronisation distante de l'établissement :", err);
    }

    setIsEditing(false);
    toast(`Paramètres de « ${formData.name} » enregistrés avec succès !`, "success");
  };
  return (
    <div className="space-y-8 max-w-5xl">
      <PageHeader
        title="Paramètres de l'Établissement"
        subtitle="Identité visuelle, logo, couverture, coordonnées et localisation géographique"
        breadcrumbs={[{ label: "Directeur", href: "/directeur" }, { label: "Paramètres" }]}
      />

      {/* Affichage Fiche Résumé OU Formulaire d'édition */}
      {!isEditing ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
          {/* En-tête de la fiche résumé avec bouton Modifier */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-school-primary text-white flex items-center justify-center font-black text-2xl uppercase shadow-sm shrink-0">
                {activeSchool.shortName ? activeSchool.shortName.charAt(0) : "E"}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-slate-900">{activeSchool.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Enregistré &amp; Actif
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sigle : <strong className="text-slate-700">{activeSchool.shortName || "Non défini"}</strong> &bull; Code établissement : <span className="font-mono font-bold text-slate-700">{activeSchool.code && activeSchool.code !== "ECO-001" ? activeSchool.code : "Non défini"}</span>
                </p>
                {activeSchool.devise && (
                  <p className="text-xs italic text-slate-600 mt-1">« {activeSchool.devise} »</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-school-primary hover:bg-school-700 text-white font-bold text-xs md:text-sm shadow-sm transition-colors touch-target self-start sm:self-center"
            >
              <Edit className="w-4 h-4" />
              <span>Modifier les informations</span>
            </button>
          </div>

          {/* Grille détaillée des informations enregistrées sous forme de fiche */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Colonne 1 : Structure & Enseignement */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-school-primary" />
                <span>Structure Pédagogique</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Type d&apos;enseignement :</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {activeSchool.teachingType === "PRIMAIRE"
                      ? "Cycle Primaire (CI à CM2)"
                      : activeSchool.teachingType === "SECONDAIRE"
                      ? "Cycle Secondaire (6e à Terminale)"
                      : "Primaire + Secondaire (Bivalent intégral)"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Cycles pris en charge :</span>
                  <span className="font-semibold text-slate-700">
                    {activeSchool.teachingType === "PRIMAIRE"
                      ? "CI, CP, CE1, CE2, CM1, CM2"
                      : activeSchool.teachingType === "SECONDAIRE"
                      ? "6ème, 5ème, 4ème, 3ème, 2nde, 1ère, Terminale"
                      : "CI au CM2 & 6ème à la Terminale"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Année académique en cours :</span>
                  <span className="font-mono font-bold text-school-primary">{activeSchool.activeYear}</span>
                </div>
              </div>
            </div>

            {/* Colonne 2 : Localisation géographique */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-school-primary" />
                <span>Localisation Géographique</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Pays :</span>
                  <span className="font-bold text-slate-800">{activeSchool.country || "Bénin"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Région / Département :</span>
                  <span className="font-semibold text-slate-700">{activeSchool.region || "Non renseigné"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Ville / Commune :</span>
                  <span className="font-semibold text-slate-700">{activeSchool.city || "Non renseigné"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Adresse postale / Quartier :</span>
                  <span className="font-medium text-slate-700">{activeSchool.address || "Non renseignée"}</span>
                </div>
              </div>
            </div>

            {/* Colonne 3 : Contacts & Modalités */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-school-primary" />
                <span>Contacts &amp; Devises</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Téléphone officiel :</span>
                  <span className="font-mono font-bold text-slate-800">{activeSchool.phone || "Non renseigné"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Email officiel :</span>
                  <span className="font-mono text-slate-700">{activeSchool.email || "Non renseigné"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Devise de facturation :</span>
                  <span className="font-bold text-slate-800">{activeSchool.currency || "FCFA"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Direction de l'Établissement & Signature Administrative */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-school-primary" />
              <span>Direction de l&apos;Établissement &amp; Signature Administrative</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <span className="text-slate-400 block text-[11px]">Directeur / Chef d&apos;Établissement :</span>
                <span className="font-black text-slate-900 text-sm">{activeSchool.directorName || "Direction de l'Établissement"}</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Ce nom officiel est apposé sur les bulletins, attestations et certificats de scolarité délivrés.
                </p>
              </div>
              <div className="flex flex-col sm:items-end">
                <span className="text-slate-400 block text-[11px] mb-1">Signature administrative numérisée :</span>
                {activeSchool.directorSignatureUrl ? (
                  <div className="p-2 bg-white rounded-xl border border-slate-200 inline-block shadow-xs text-center">
                    <img
                      src={activeSchool.directorSignatureUrl}
                      alt="Signature officielle"
                      className="h-12 max-w-[170px] object-contain mx-auto"
                    />
                    <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                      ✓ Signature active sur les documents
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-dashed border-slate-300 text-center">
                    <span className="text-xs text-slate-500 italic block">Aucune signature numérisée</span>
                    <span className="text-[10px] text-slate-400 block">Les documents prévoient l&apos;espace pour signature manuelle</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Photo de couverture si disponible */}
          {activeSchool.coverImage && (
            <div className="rounded-2xl overflow-hidden border border-slate-200">
              <div
                className="h-44 w-full bg-cover bg-center relative"
                style={{ backgroundImage: `url('${activeSchool.coverImage}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-4">
                  <span className="text-xs text-white/90 font-medium">Photo officielle de l&apos;établissement</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Formulaire de l'établissement actif */
        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-8 animate-in fade-in duration-150">
          {/* Section 1 : Identité & Médias (Logo & Couverture) */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <School className="w-5 h-5 text-school-primary" />
                  <span>Identité Visuelle &amp; Nom de l&apos;Établissement</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Ces informations apparaîtront dans la barre supérieure, les bulletins officiels et les reçus.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData(activeSchool);
                  setIsEditing(false);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Fermer
              </button>
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

          {/* Section Direction de l'Établissement & Signature Officielle */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-school-primary" />
                <span>Direction de l&apos;Établissement &amp; Signature Administrative</span>
              </h3>
              <p className="text-xs text-slate-500">
                Informations officielles imprimées sur les relevés de notes, bulletins scolaires, attestations et certificats.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Nom et prénom du Directeur / Chef d&apos;Établissement
                </label>
                <input
                  type="text"
                  required
                  value={formData.directorName || ""}
                  onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                  placeholder="Ex: Dr. Marcellin HOUNGBO ou Direction de l'Établissement"
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm focus:border-school-primary focus:ring-2 focus:ring-school-primary/20 touch-target font-bold text-slate-900"
                />
                <p className="text-[11px] text-slate-500">
                  Responsable administratif officiel chargé de signer et certifier les documents scolaires.
                </p>
              </div>

              {/* Signature numérisée */}
              <div className="space-y-2 sm:col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Signature officielle du Directeur (Image)
                  </span>
                  <span className="text-[11px] text-slate-500">PNG / JPG (fond blanc ou transparent)</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  {formData.directorSignatureUrl ? (
                    <div className="relative p-2.5 bg-white rounded-xl border border-slate-300 shadow-xs shrink-0 text-center">
                      <img
                        src={formData.directorSignatureUrl}
                        alt="Signature Directeur"
                        className="h-16 w-36 object-contain mx-auto"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, directorSignatureUrl: "" })}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-sm"
                        title="Supprimer la signature"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 w-36 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400 bg-white shrink-0">
                      Aucune signature
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="director-signature-file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            toast("L'image de signature ne doit pas dépasser 2 Mo.", "error");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            setFormData({ ...formData, directorSignatureUrl: result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2 items-center">
                      <label
                        htmlFor="director-signature-file"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs transition"
                      >
                        <Upload className="w-3.5 h-3.5 text-school-primary" />
                        <span>{formData.directorSignatureUrl ? "Remplacer l'image de signature" : "Importer l'image de la signature"}</span>
                      </label>
                      {formData.directorSignatureUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, directorSignatureUrl: "" })}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Uniquement la signature fournie par l&apos;établissement sera affichée. En l&apos;absence d&apos;image, un espace vierge dédié à la signature manuelle sera imprimé.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Structure de l'établissement : Type d'enseignement proposé */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-school-primary" />
                <span>Structure de l&apos;Établissement &mdash; Type d&apos;Enseignement Proposé</span>
              </h3>
              <p className="text-xs text-slate-500">
                Détermine les cycles, niveaux (CI à CM2 et/ou 6e à Terminale) et maquettes de bulletins disponibles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option 1: Primaire */}
              <div
                onClick={() => setFormData({ ...formData, teachingType: "PRIMAIRE" })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.teachingType === "PRIMAIRE"
                    ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">Primaire</span>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    formData.teachingType === "PRIMAIRE" ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"
                  }`}>
                    {formData.teachingType === "PRIMAIRE" && <Check className="w-3 h-3" />}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  Évaluation par compétences fondamentales, bulletins trimestriels avec cotes (EXP, A, ECA, NA).
                </p>
                <div className="flex flex-wrap gap-1">
                  {["CI", "CP", "CE1", "CE2", "CM1", "CM2"].map((lvl) => (
                    <span key={lvl} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-700">
                      {lvl}
                    </span>
                  ))}
                </div>
              </div>

              {/* Option 2: Secondaire */}
              <div
                onClick={() => setFormData({ ...formData, teachingType: "SECONDAIRE" })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.teachingType === "SECONDAIRE"
                    ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">Secondaire</span>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    formData.teachingType === "SECONDAIRE" ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"
                  }`}>
                    {formData.teachingType === "SECONDAIRE" && <Check className="w-3 h-3" />}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  Collège & Lycée : notes chiffrées, coefficients officiels Bénin, moyennes pondérées et délibérations.
                </p>
                <div className="flex flex-wrap gap-1">
                  {["6e", "5e", "4e", "3e", "2nde", "1ère", "Tle"].map((lvl) => (
                    <span key={lvl} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-700">
                      {lvl}
                    </span>
                  ))}
                </div>
              </div>

              {/* Option 3: Primaire + Secondaire */}
              <div
                onClick={() => setFormData({ ...formData, teachingType: "PRIMAIRE_SECONDAIRE" })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.teachingType === "PRIMAIRE_SECONDAIRE" || !formData.teachingType
                    ? "border-school-primary bg-school-50/70 ring-2 ring-school-primary/20 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">Primaire + Secondaire</span>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    formData.teachingType === "PRIMAIRE_SECONDAIRE" || !formData.teachingType ? "border-school-primary bg-school-primary text-white" : "border-slate-300"
                  }`}>
                    {(formData.teachingType === "PRIMAIRE_SECONDAIRE" || !formData.teachingType) && <Check className="w-3 h-3" />}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  Complexe scolaire bivalent intégral : gestion synchronisée de la maternelle/CI jusqu&apos;à la Terminale.
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    CI &rarr; CM2
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    6e &rarr; Terminale
                  </span>
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

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setFormData(activeSchool);
                setIsEditing(false);
              }}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-school-primary hover:bg-school-700 text-white font-bold text-xs md:text-sm shadow-md transition-colors touch-target"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les paramètres de l&apos;établissement</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
