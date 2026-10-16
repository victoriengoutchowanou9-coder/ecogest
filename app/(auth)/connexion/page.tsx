"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  School,
  Lock,
  Mail,
  Shield,
  BookOpenCheck,
  GraduationCap,
  CreditCard,
  Home,
  CheckCircle2,
  Building2,
  Sparkles,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Check,
} from "lucide-react";
import { Role } from "@/lib/permissions";
import {
  useSubscriptionStore,
  SCHOOL_PLANS,
  PARENT_PLANS,
  SchoolPlanCode,
  ParentPlanCode,
} from "@/lib/subscription-store";
import { useAuthStore } from "@/lib/auth-store";
import { useToast } from "@/components/ui/Toast";

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const authStore = useAuthStore();
  const {
    changeSchoolPlan,
    createSchool,
    changeParentPlan,
    activeSchool,
    schools,
  } = useSubscriptionStore();

  // Mode principal : Connexion ou Inscription
  const [authMode, setAuthMode] = useState<"LOGIN" | "REGISTER">("LOGIN");

  // Type d'inscription : Établissement ou Parent
  const [registerType, setRegisterType] = useState<"SCHOOL" | "PARENT">("SCHOOL");

  // Affichage du mot de passe
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // =========================================================================
  // ÉTATS DE CONNEXION
  // =========================================================================
  const [loginRole, setLoginRole] = useState<Role>("directeur");
  const [loginEmail, setLoginEmail] = useState("directeur@ecole.bj");
  const [loginPassword, setLoginPassword] = useState("********");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleSelectRole = (r: Role) => {
    setLoginRole(r);
    const emails: Record<Role, string> = {
      directeur: "directeur@ecole.bj",
      censeur: "censeur@ecole.bj",
      enseignant: "professeur@ecole.bj",
      comptabilite: "comptable@ecole.bj",
      parent: "parent@famille.bj",
    };
    setLoginEmail(emails[r]);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    setTimeout(() => {
      setLoginLoading(false);

      const targetPath: Record<Role, string> = {
        directeur: "/directeur",
        censeur: "/censeur",
        enseignant: "/enseignant",
        comptabilite: "/comptabilite",
        parent: "/parent",
      };

      const roleNames: Record<Role, string> = {
        directeur: "M. le Directeur",
        censeur: "M. le Censeur",
        enseignant: "Professeur Titulaire",
        comptabilite: "Agent Comptable",
        parent: "Parent d'Élève",
      };

      authStore.login({
        email: loginEmail,
        role: loginRole,
        fullName: roleNames[loginRole],
        schoolId: activeSchool?.id || "school-1",
        schoolName: activeSchool?.name || "Établissement Scolaire",
      });

      toast(`Connexion réussie ! Bienvenue sur ECOGEST.`, "success");
      router.push(targetPath[loginRole]);
    }, 500);
  };

  // =========================================================================
  // ÉTATS D'INSCRIPTION : ÉTABLISSEMENT
  // =========================================================================
  const [schoolName, setSchoolName] = useState("");
  const [schoolShortName, setSchoolShortName] = useState("");
  const [schoolCountry, setSchoolCountry] = useState("Bénin");
  const [schoolCity, setSchoolCity] = useState("Cotonou");
  const [schoolDirectorName, setSchoolDirectorName] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [schoolPhone, setSchoolPhone] = useState("+229 ");
  const [schoolPassword, setSchoolPassword] = useState("");
  const [schoolChosenPlan, setSchoolChosenPlan] = useState<SchoolPlanCode>("STANDARD");

  const handleRegisterSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim() || !schoolEmail.trim()) {
      toast("Veuillez remplir tous les champs obligatoires.", "error");
      return;
    }

    // Créer dans le store d'authentification (statut en attente de paiement)
    authStore.registerSchool({
      schoolName: schoolName.trim(),
      directorName: schoolDirectorName.trim() || "Direction de l'Établissement",
      schoolEmail: schoolEmail.trim(),
      schoolPhone: schoolPhone.trim(),
      schoolCountry: schoolCountry,
      schoolCity: schoolCity,
      chosenPlan: schoolChosenPlan,
    });

    // Appliquer le forfait d'abonnement choisi
    changeSchoolPlan(schoolChosenPlan);

    // Mettre à jour les informations de l'école
    createSchool({
      code: `ECO-${Math.floor(1000 + Math.random() * 9000)}`,
      name: schoolName.trim(),
      shortName: schoolShortName.trim() || schoolName.trim().slice(0, 15),
      slug: schoolName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-"),
      logo: "",
      coverImage: "",
      country: schoolCountry,
      region: "Littoral",
      city: schoolCity,
      address: `${schoolCity}, ${schoolCountry}`,
      phone: schoolPhone,
      email: schoolEmail,
      devise: "Travail - Rigueur - Réussite",
      currency: "FCFA",
      activeYear: "2026-2027",
    });

    toast(
      `Établissement « ${schoolName} » enregistré. Veuillez valider le paiement de l'abonnement pour finaliser l'activation.`,
      "success"
    );
    router.push("/directeur/abonnement?activation=required");
  };

  // =========================================================================
  // ÉTATS D'INSCRIPTION : PARENT
  // =========================================================================
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("+229 ");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [parentChosenPlan, setParentChosenPlan] = useState<ParentPlanCode>("PARENT_1");
  const [childMatricule, setChildMatricule] = useState("");
  const [childName, setChildName] = useState("");
  const [childClass, setChildClass] = useState("3ème");
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [customSchoolName, setCustomSchoolName] = useState("");

  const handleRegisterParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim() || !parentPhone.trim()) {
      toast("Veuillez renseigner votre nom et votre numéro de téléphone.", "error");
      return;
    }

    if (!selectedSchoolId && !customSchoolName.trim()) {
      toast("Veuillez sélectionner ou renseigner l'établissement scolaire de votre enfant.", "error");
      return;
    }

    const matchedSchool = schools.find((s) => s.id === selectedSchoolId);
    const chosenSchoolName = matchedSchool ? matchedSchool.name : customSchoolName.trim();

    authStore.registerParent({
      fullName: parentName.trim(),
      email: parentEmail.trim(),
      phone: parentPhone.trim(),
      schoolId: selectedSchoolId || "custom-school",
      schoolName: chosenSchoolName,
      chosenPlan: parentChosenPlan,
    });

    changeParentPlan(parentChosenPlan);

    toast(
      `Compte parent créé ! Veuillez valider le paiement de l'abonnement pour activer votre accès.`,
      "success"
    );
    router.push("/parent/abonnement?activation=required");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center p-3 sm:p-6 md:p-10">
      <div className="max-w-6xl w-full mx-auto rounded-3xl overflow-hidden shadow-2xl bg-white border border-slate-200 grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        
        {/* =================================================================== */}
        {/* COLONNE GAUCHE : VISUEL PRINCIPAL                                    */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-10 text-white overflow-hidden bg-slate-950">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{
              backgroundImage: "url('/images/pexels-tosin-olowoleni-2148141635-34162713.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-school-950/60" />

          {/* Header marque */}
          <div className="relative z-10 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-11 h-11 rounded-2xl bg-school-primary text-white flex items-center justify-center font-black text-xl shadow-lg shadow-school-primary/30 group-hover:scale-105 transition-transform">
                E
              </div>
              <div>
                <span className="font-black text-2xl tracking-tight text-white flex items-center gap-1.5">
                  ECOGEST
                </span>
                <span className="block text-[11px] text-slate-300">
                  Gestion scolaire tout en un
                </span>
              </div>
            </Link>

            <div className="pt-6">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                AFRIQUE DE L&apos;OUEST &bull; CONFORME NORMES OFFICIELLES
              </span>
              <h2 className="text-2xl font-black mt-3 leading-tight text-white">
                La référence numérique pour collèges, lycées et parents d&apos;élèves
              </h2>
            </div>
          </div>

          {/* Points forts certifiés */}
          <div className="relative z-10 space-y-3 text-xs text-slate-200 bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Calcul des bulletins conforme (3 interros ÷ 3, devoirs ÷ 3)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-établissements avec données et finances étanches</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Suivi parental sécurisé et vérification d&apos;accès Censeur</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Reçus de scolarité infalsifiables avec QR Code</span>
            </div>
          </div>

          {/* Footer gauche */}
          <div className="relative z-10 text-[11px] text-slate-400">
            &copy; {new Date().getFullYear()} ECOGEST &bull; Tous droits réservés
          </div>
        </div>

        {/* =================================================================== */}
        {/* COLONNE DROITE : FORMULAIRE CONNEXION / INSCRIPTION                */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors"
              >
                <span>&larr; Revenir au site principal</span>
              </Link>
            </div>

            {/* Bascule principale : Se connecter / S'inscrire */}
            <div className="flex items-center p-1.5 rounded-2xl bg-slate-100 max-w-md mx-auto mb-8 border border-slate-200">
              <button
                type="button"
                onClick={() => setAuthMode("LOGIN")}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                  authMode === "LOGIN"
                    ? "bg-white text-school-primary shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Se connecter</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("REGISTER")}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                  authMode === "REGISTER"
                    ? "bg-white text-school-primary shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>S&apos;inscrire</span>
              </button>
            </div>

            {/* =============================================================== */}
            {/* VUE 1 : SE CONNECTER                                            */}
            {/* =============================================================== */}
            {authMode === "LOGIN" && (
              <div className="space-y-6 max-w-md mx-auto animate-in fade-in duration-200">
                <div className="text-center space-y-1">
                  <h1 className="text-2xl font-black text-slate-900">Connexion à votre espace</h1>
                  <p className="text-xs text-slate-500">
                    Connectez-vous pour accéder au portail de votre profil
                  </p>
                </div>

                {/* Sélecteur de rôle d'accès */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Votre Espace d&apos;accès :
                  </label>
                  <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl">
                    {(
                      [
                        { r: "directeur", label: "Directeur", icon: <Shield className="w-4 h-4" /> },
                        { r: "censeur", label: "Censeur", icon: <BookOpenCheck className="w-4 h-4" /> },
                        { r: "enseignant", label: "Professeur", icon: <GraduationCap className="w-4 h-4" /> },
                        { r: "comptabilite", label: "Comptable", icon: <CreditCard className="w-4 h-4" /> },
                        { r: "parent", label: "Parent", icon: <Home className="w-4 h-4" /> },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.r}
                        type="button"
                        onClick={() => handleSelectRole(item.r)}
                        className={`p-2 rounded-lg text-center flex flex-col items-center gap-1 transition ${
                          loginRole === item.r
                            ? "bg-white text-school-primary shadow-xs font-bold"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {item.icon}
                        <span className="text-[10px] leading-none">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Email / Identifiant
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-school-primary focus:ring-2 focus:ring-school-primary/20"
                        placeholder="nom@ecole.bj"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 text-xs">Mot de passe</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-school-primary focus:ring-2 focus:ring-school-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Se souvenir de moi & Mot de passe oublié */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-school-primary focus:ring-school-primary"
                      />
                      <span>Se souvenir de moi</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => toast("Contactez l'administration pour réinitialiser votre mot de passe.", "info")}
                      className="text-school-primary hover:underline text-[11px] font-semibold"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3.5 rounded-xl bg-school-primary hover:bg-school-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 touch-target min-h-[48px]"
                  >
                    {loginLoading ? (
                      <span>Connexion en cours...</span>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Se connecter ({loginRole.toUpperCase()})</span>
                      </>
                    )}
                  </button>

                  <div className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
                    Pas encore de compte ?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("REGISTER")}
                      className="font-bold text-school-primary hover:underline"
                    >
                      S&apos;inscrire
                    </button>
                  </div>
                </form>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-school-primary" />
                    <span>Espaces d&apos;accès personnalisés et étanches :</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Chaque utilisateur accède exclusivement à l&apos;espace correspondant à ses prérogatives.
                  </p>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* VUE 2 : S'INSCRIRE (ÉTABLISSEMENT OU PARENT)                     */}
            {/* =============================================================== */}
            {authMode === "REGISTER" && (
              <div className="space-y-6 max-w-lg mx-auto animate-in fade-in duration-200">
                <div className="text-center space-y-1">
                  <h1 className="text-2xl font-black text-slate-900">Créer un nouveau compte</h1>
                  <p className="text-xs text-slate-500">
                    Sélectionnez le profil de compte à enregistrer sur ECOGEST
                  </p>
                </div>

                {/* Choix Établissement vs Parent */}
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setRegisterType("SCHOOL")}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
                      registerType === "SCHOOL"
                        ? "bg-white text-school-primary shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Établissement (Directeur)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterType("PARENT")}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
                      registerType === "PARENT"
                        ? "bg-white text-indigo-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>Parent d&apos;élève</span>
                  </button>
                </div>

                {/* Formulaire Établissement (Directeur) */}
                {registerType === "SCHOOL" && (
                  <form onSubmit={handleRegisterSchool} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">
                          Nom de l&apos;établissement scolaire *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Complexe Scolaire d'Excellence"
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-school-primary/20"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Sigle / Nom court</label>
                        <input
                          type="text"
                          placeholder="Ex: CSE"
                          value={schoolShortName}
                          onChange={(e) => setSchoolShortName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Ville &amp; Pays</label>
                        <input
                          type="text"
                          required
                          placeholder="Cotonou, Bénin"
                          value={schoolCity}
                          onChange={(e) => setSchoolCity(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Nom du Directeur / Fondateur</label>
                        <input
                          type="text"
                          required
                          placeholder="M. le Directeur"
                          value={schoolDirectorName}
                          onChange={(e) => setSchoolDirectorName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Téléphone standard</label>
                        <input
                          type="tel"
                          required
                          placeholder="+229 97 00 00 00"
                          value={schoolPhone}
                          onChange={(e) => setSchoolPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Email de connexion</label>
                        <input
                          type="email"
                          required
                          placeholder="direction@ecole.bj"
                          value={schoolEmail}
                          onChange={(e) => setSchoolEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Mot de passe</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={schoolPassword}
                          onChange={(e) => setSchoolPassword(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>
                    </div>

                    {/* Choix de la formule d'abonnement établissement */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        Choisissez votre Formule Mensuelle :
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {(["BASIC", "STANDARD", "PREMIUM"] as SchoolPlanCode[]).map((pCode) => {
                          const p = SCHOOL_PLANS[pCode];
                          const isSel = schoolChosenPlan === pCode;
                          return (
                            <div
                              key={pCode}
                              onClick={() => setSchoolChosenPlan(pCode)}
                              className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                                isSel
                                  ? "border-school-primary bg-school-50/70 ring-1 ring-school-primary shadow-xs"
                                  : "border-slate-200 hover:border-slate-300 bg-white"
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xs text-slate-900">{p.name}</span>
                                  {isSel && <Check className="w-3.5 h-3.5 text-school-primary" />}
                                </div>
                                <p className="text-xs font-black text-school-primary mt-1">
                                  {p.priceFcfa.toLocaleString()} F
                                  <span className="text-[10px] font-normal text-slate-500"> /m</span>
                                </p>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-2">
                                {p.maxSchools} école{p.maxSchools > 1 ? "s" : ""} &bull;{" "}
                                {p.maxUsers === null ? "Illimité" : `${p.maxUsers} users`}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                      <strong>Activation requise :</strong> Après création, le règlement de l&apos;abonnement sera demandé pour activer votre espace opérationnel.
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-school-primary hover:bg-school-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 touch-target"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Créer l&apos;Établissement &amp; Valider l&apos;Abonnement</span>
                    </button>
                  </form>
                )}

                {/* Formulaire Parent */}
                {registerType === "PARENT" && (
                  <form onSubmit={handleRegisterParent} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">Nom complet du Parent *</label>
                        <input
                          type="text"
                          required
                          placeholder="Mme / M. Nom Prénom"
                          value={parentName}
                          onChange={(e) => setParentName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Téléphone (WhatsApp / SMS) *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+229 97 00 00 00"
                          value={parentPhone}
                          onChange={(e) => setParentPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Adresse email</label>
                        <input
                          type="email"
                          placeholder="parent@email.com"
                          value={parentEmail}
                          onChange={(e) => setParentEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">Mot de passe secret *</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={parentPassword}
                          onChange={(e) => setParentPassword(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>
                    </div>

                    {/* Établissement scolaire de l'enfant (OBLIGATOIRE) */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        Établissement fréquenté par votre enfant * :
                      </label>
                      <select
                        value={selectedSchoolId}
                        onChange={(e) => setSelectedSchoolId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                      >
                        <option value="">-- Sélectionnez l&apos;établissement dans la liste --</option>
                        {schools.map((sch) => (
                          <option key={sch.id} value={sch.id}>
                            {sch.name} ({sch.city})
                          </option>
                        ))}
                        <option value="other">Autre établissement (saisie manuelle)</option>
                      </select>

                      {(!selectedSchoolId || selectedSchoolId === "other") && (
                        <input
                          type="text"
                          required={selectedSchoolId === "other"}
                          placeholder="Précisez le nom complet de l'établissement scolaire"
                          value={customSchoolName}
                          onChange={(e) => setCustomSchoolName(e.target.value)}
                          className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-300 text-xs"
                        />
                      )}
                    </div>

                    {/* Choix Formule Parent */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        Choisissez votre Forfait Parent :
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {(["PARENT_1", "PARENT_2"] as ParentPlanCode[]).map((pCode) => {
                          const p = PARENT_PLANS[pCode];
                          const isSel = parentChosenPlan === pCode;
                          return (
                            <div
                              key={pCode}
                              onClick={() => setParentChosenPlan(pCode)}
                              className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                                isSel
                                  ? "border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 shadow-xs"
                                  : "border-slate-200 hover:border-slate-300 bg-white"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-900">{p.name}</span>
                                {isSel && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                              </div>
                              <p className="text-sm font-black text-indigo-600 mt-1">
                                {p.priceFcfa} FCFA
                                <span className="text-[10px] font-normal text-slate-500"> /mois</span>
                              </p>
                              <p className="text-[10px] text-slate-500 mt-1">
                                {p.maxChildren} élève{p.maxChildren > 1 ? "s max" : ""}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Premier élève à associer */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        Élève à associer :
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-600">Nom &amp; Prénoms de l&apos;élève</label>
                          <input
                            type="text"
                            placeholder="Nom de l'enfant"
                            value={childName}
                            onChange={(e) => setChildName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-600">Matricule / EducMaster</label>
                          <input
                            type="text"
                            placeholder="Ex: EM-2026-0042"
                            value={childMatricule}
                            onChange={(e) => setChildMatricule(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-600">Classe</label>
                          <input
                            type="text"
                            placeholder="Ex: 3ème A"
                            value={childClass}
                            onChange={(e) => setChildClass(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-xs text-indigo-900">
                      <strong>Activation requise :</strong> Le règlement de l&apos;abonnement sera requis pour activer la consultation des notes, absences et bulletins.
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 touch-target"
                    >
                      <Home className="w-4 h-4" />
                      <span>Créer mon Compte Parent &amp; Valider l&apos;Abonnement</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            En continuant, vous acceptez les conditions d&apos;utilisation d&apos;ECOGEST.
          </div>
        </div>

      </div>
    </div>
  );
}
