"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Home,
  UserPlus,
  Shield,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  User,
  MapPin,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { useToast } from "@/components/ui/Toast";
import { useSubscriptionStore, SchoolPlanCode, ParentPlanCode } from "@/lib/subscription-store";
import { useAuthStore } from "@/lib/auth-store";

export default function InscriptionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { schools } = useSubscriptionStore();
  const { registerSchool, registerParent } = useAuthStore();

  const [pathway, setPathway] = useState<"SCHOOL" | "PARENT">("SCHOOL");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // School registration form
  const [managerName, setManagerName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [schoolPhone, setSchoolPhone] = useState("");
  const [country, setCountry] = useState("Bénin");
  const [region, setRegion] = useState("Littoral");
  const [city, setCity] = useState("Cotonou");
  const [password, setPassword] = useState("");
  const [chosenPlan, setChosenPlan] = useState<SchoolPlanCode>("STANDARD");

  // Parent registration form
  const [parentName, setParentName] = useState("");
  const [parentFirstName, setParentFirstName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [parentPlan, setParentPlan] = useState<ParentPlanCode>("PARENT_1");
  const [parentSchoolId, setParentSchoolId] = useState(schools[0]?.id || "");
  const [parentSchoolName, setParentSchoolName] = useState(schools[0]?.name || "");
  const [customSchoolName, setCustomSchoolName] = useState("");
  const [childMatricule, setChildMatricule] = useState("");
  const [childClass, setChildClass] = useState("3ème A");

  const handleSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      registerSchool({
        directorName: managerName.trim(),
        schoolName: schoolName.trim(),
        schoolEmail: schoolEmail.trim(),
        schoolPhone: schoolPhone.trim(),
        schoolCity: city.trim(),
        schoolCountry: country,
        chosenPlan,
      });

      toast(
        `Établissement ${schoolName} enregistré ! Veuillez finaliser le paiement de votre abonnement pour activer votre accès.`,
        "info"
      );
      router.push("/directeur/abonnement?activation=required");
    }, 700);
  };

  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSchoolName = parentSchoolId === "CUSTOM" ? customSchoolName.trim() : parentSchoolName;
    if (!finalSchoolName) {
      toast("Veuillez sélectionner ou renseigner l'établissement fréquenté par votre enfant.", "error");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      registerParent({
        fullName: `${parentName.trim().toUpperCase()} ${parentFirstName.trim()}`,
        email: parentEmail.trim(),
        phone: parentPhone.trim(),
        schoolId: parentSchoolId === "CUSTOM" ? `school-${Date.now()}` : parentSchoolId,
        schoolName: finalSchoolName,
        chosenPlan: parentPlan,
      });

      toast(
        `Compte Parent créé pour l'établissement « ${finalSchoolName} » ! Veuillez activer votre forfait mensuel.`,
        "info"
      );
      router.push("/parent/abonnement?activation=required");
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <PublicNavbar currentPath="/inscription" />

      {/* Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-school-primary text-white py-10 md:py-14 px-4 sm:px-6 lg:px-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-school-200">
          <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
          <span>OUVERTURE DE COMPTE EDUCOGEST</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
          Rejoignez la communauté EducoGest
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Choisissez votre profil pour démarrer l&apos;enregistrement en quelques instants.
        </p>

        {/* Pathway Selector (School vs Parent) */}
        <div className="pt-3 flex justify-center">
          <div className="inline-flex p-1 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setPathway("SCHOOL")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                pathway === "SCHOOL"
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-white hover:text-school-200"
              }`}
            >
              <Building2 className="w-4 h-4 text-school-primary" />
              <span>Créer un compte Établissement</span>
            </button>
            <button
              type="button"
              onClick={() => setPathway("PARENT")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                pathway === "PARENT"
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-white hover:text-school-200"
              }`}
            >
              <Home className="w-4 h-4 text-indigo-600" />
              <span>Créer un compte Parent</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Form */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {pathway === "SCHOOL" ? (
          /* SCHOOL REGISTRATION FORM */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-6">
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-school-primary uppercase tracking-wider">
                Espace Direction
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Enregistrement de votre Établissement
              </h2>
              <p className="text-xs text-slate-500">
                Après inscription, le directeur pourra immédiatement poursuivre la configuration de son école (niveaux, classes, matières).
              </p>
            </div>

            <form onSubmit={handleSchoolSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Nom du responsable (Fondateur / Directeur) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : M. Marcellin DOKPO"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Nom officiel de l&apos;établissement *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Complexe Scolaire Ste Marie"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Email de contact officiel *</label>
                  <input
                    type="email"
                    required
                    placeholder="direction@stemarie-cotonou.bj"
                    value={schoolEmail}
                    onChange={(e) => setSchoolEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Téléphone officiel de l&apos;école *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+229 97 00 11 22"
                    value={schoolPhone}
                    onChange={(e) => setSchoolPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              {/* Geographic Fields (Requirements: Pays, Région, Ville) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Pays *</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                  >
                    <option value="Bénin">Bénin</option>
                    <option value="Togo">Togo</option>
                    <option value="Côte d'Ivoire">Côte d&apos;Ivoire</option>
                    <option value="Sénégal">Sénégal</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Niger">Niger</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Région / Département *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Littoral, Ouémé, Atlantique..."
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Ville / Commune *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Cotonou, Calavi, Porto-Novo..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Mot de passe secret d&apos;administration *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Au moins 8 caractères avec chiffres et lettres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forfait sélectionné */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-800 block text-xs">
                  Formule d&apos;abonnement souhaitée :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setChosenPlan("BASIC")}
                    className={`p-3 rounded-2xl border cursor-pointer transition ${
                      chosenPlan === "BASIC"
                        ? "border-school-primary bg-school-50/70 ring-1 ring-school-primary"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <span className="font-bold text-slate-900 block">Starter (Basic)</span>
                    <strong className="text-school-primary text-sm">6 000 FCFA/m</strong>
                    <span className="text-[10px] text-slate-500 block">1 école &bull; 300 élèves max</span>
                  </div>

                  <div
                    onClick={() => setChosenPlan("STANDARD")}
                    className={`p-3 rounded-2xl border cursor-pointer transition ${
                      chosenPlan === "STANDARD"
                        ? "border-school-primary bg-school-50/70 ring-1 ring-school-primary"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <span className="font-bold text-slate-900 block">Pro (Standard)</span>
                    <strong className="text-school-primary text-sm">10 000 FCFA/m</strong>
                    <span className="text-[10px] text-slate-500 block">1 école &bull; 1 000 élèves</span>
                  </div>

                  <div
                    onClick={() => setChosenPlan("PREMIUM")}
                    className={`p-3 rounded-2xl border cursor-pointer transition ${
                      chosenPlan === "PREMIUM"
                        ? "border-school-primary bg-school-50/70 ring-1 ring-school-primary"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <span className="font-bold text-purple-900 block">Institution (Premium)</span>
                    <strong className="text-purple-700 text-sm">25 000 FCFA/m</strong>
                    <span className="text-[10px] text-purple-600 block">2 écoles &bull; Illimité</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-school-primary hover:bg-school-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 touch-target"
                >
                  <Building2 className="w-4 h-4" />
                  <span>{loading ? "Création en cours..." : "Créer l'établissement & Poursuivre la configuration"}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* PARENT REGISTRATION FORM */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-6">
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Espace Famille
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Créer mon Compte Parent
              </h2>
              <p className="text-xs text-slate-500">
                Suivez les notes validées, absences, devoirs et calendrier d&apos;examens de vos enfants.
              </p>
            </div>

            <form onSubmit={handleParentSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Nom de famille *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : ADANHOUN"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Marc"
                    value={parentFirstName}
                    onChange={(e) => setParentFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Téléphone Mobile (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+229 97 12 34 56"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Adresse Email</label>
                  <input
                    type="email"
                    placeholder="parent@gmail.com"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Mot de passe secret *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={parentPassword}
                  onChange={(e) => setParentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>

              {/* Établissement fréquenté par l'enfant */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-800 block text-xs">
                  Établissement scolaire fréquenté par votre enfant *
                </label>
                <select
                  required
                  value={parentSchoolId}
                  onChange={(e) => {
                    setParentSchoolId(e.target.value);
                    const found = schools.find((s) => s.id === e.target.value);
                    if (found) setParentSchoolName(found.name);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                >
                  <option value="">-- Sélectionnez l&apos;établissement --</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.city ? `(${s.city})` : ""}
                    </option>
                  ))}
                  <option value="CUSTOM">Autre établissement (saisie manuelle)...</option>
                </select>

                {parentSchoolId === "CUSTOM" && (
                  <input
                    type="text"
                    required
                    placeholder="Nom complet du collège ou lycée..."
                    value={customSchoolName}
                    onChange={(e) => setCustomSchoolName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 mt-2"
                  />
                )}
              </div>

              {/* Choix Formule Parent (200F ou 300F) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-800 block text-xs">
                  Choisissez votre Formule Parent :
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setParentPlan("PARENT_1")}
                    className={`p-3 rounded-2xl border cursor-pointer transition ${
                      parentPlan === "PARENT_1"
                        ? "border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 shadow-xs"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <span className="font-bold text-slate-900 block">1 Enfant</span>
                    <strong className="text-indigo-600 text-sm">200 FCFA / mois</strong>
                    <span className="text-[10px] text-slate-500 block">Accès complet suivi de l&apos;élève</span>
                  </div>

                  <div
                    onClick={() => setParentPlan("PARENT_2")}
                    className={`p-3 rounded-2xl border cursor-pointer transition ${
                      parentPlan === "PARENT_2"
                        ? "border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 shadow-xs"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <span className="font-bold text-slate-900 block">2 Enfants (Fratrie)</span>
                    <strong className="text-indigo-600 text-sm">300 FCFA / mois</strong>
                    <span className="text-[10px] text-slate-500 block">Bascule instantanée entre enfants</span>
                  </div>
                </div>
              </div>

              {/* Premier élève à rattacher */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-800 block text-xs">
                  Élève à rattacher à votre compte :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Matricule ou N° EducMaster</label>
                    <input
                      type="text"
                      placeholder="Ex : ECO-2026-0042"
                      value={childMatricule}
                      onChange={(e) => setChildMatricule(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Classe actuelle</label>
                    <input
                      type="text"
                      placeholder="Ex : 3ème A"
                      value={childClass}
                      onChange={(e) => setChildClass(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 touch-target"
                >
                  <Home className="w-4 h-4" />
                  <span>{loading ? "Création en cours..." : "Créer mon Compte Parent"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="text-center text-xs text-slate-500">
          Vous avez déjà un compte ?{" "}
          <Link href="/connexion" className="font-bold text-school-primary hover:underline">
            Se connecter à son espace
          </Link>
        </div>

      </main>

      <PublicFooter />
    </div>
  );
}
