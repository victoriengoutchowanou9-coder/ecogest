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
  FileText,
  Clock,
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
import {
  authenticateSystemUser,
  validateSchoolCode,
} from "@/lib/user-registry";
import { ForgotPasswordModal } from "@/components/account/ForgotPasswordModal";
import { AccountVerificationModal } from "@/components/auth/AccountVerificationModal";

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const authStore = useAuthStore();
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Modale de vérification par E-mail ou SMS (OTP)
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<{
    pathway: "SCHOOL" | "PARENT";
    email: string;
    phone: string;
    fullName: string;
    payload: any;
  } | null>(null);

  const subscriptionStore = useSubscriptionStore();
  const {
    changeSchoolPlan,
    createSchool,
    changeParentPlan,
    activeSchool,
    schools,
  } = subscriptionStore;

  // Mode principal : Connexion ou Inscription
  const [authMode, setAuthMode] = useState<"LOGIN" | "REGISTER">("LOGIN");

  // Type d'inscription : Établissement ou Parent
  const [registerType, setRegisterType] = useState<"SCHOOL" | "PARENT">("SCHOOL");

  // Affichage du mot de passe
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // =========================================================================
  // ÉTATS DE CONNEXION (Règle 1 : Identifiant + Mot de passe OBLIGATOIRE)
  // =========================================================================
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const cleanIdentifier = loginIdentifier.trim();
    const cleanPassword = loginPassword.trim();

    if (!cleanIdentifier) {
      setLoginError("Veuillez saisir votre Identifiant (ex: 4827DIR01) ou votre adresse e-mail.");
      toast("L'identifiant ou l'adresse e-mail est obligatoire.", "error");
      return;
    }

    if (!cleanPassword) {
      setLoginError("Veuillez saisir votre mot de passe secret.");
      toast("Le mot de passe est obligatoire.", "error");
      return;
    }

    setLoginLoading(true);

    try {
      // 1. Détection et validation automatique côté serveur du rôle Développeur / Superviseur
      try {
        const devRes = await fetch("/api/dev-admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: cleanIdentifier,
            passkey: cleanPassword,
          }),
        });
        const devData = await devRes.json().catch(() => ({}));

        if (devRes.ok && devData.success) {
          toast("Connexion réussie ! Accès à la console technique...", "success");
          router.push("/dev-admin");
          return;
        }

        // Si le compte développeur est identifié mais le mot de passe est faux
        if (devData.notDeveloper === false) {
          setLoginError("Identifiant ou mot de passe incorrect.");
          toast("Identifiant ou mot de passe incorrect.", "error");
          return;
        }
      } catch {
        // En cas d'erreur de communication réseau, poursuivre vers l'authentification standard
      }

      const targetPath: Record<Role, string> = {
        directeur: "/directeur",
        censeur: "/censeur",
        secretariat: "/secretariat",
        surveillant: "/surveillant",
        enseignant: "/enseignant",
        comptabilite: "/comptabilite",
        parent: "/parent",
      };

      // 2. Authentification via l'API serveur et base de données Supabase
      let loggedInUser: any = null;
      let loggedInSchool: any = null;

      try {
        const apiRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: cleanIdentifier,
            password: cleanPassword,
          }),
        });

        const apiData = await apiRes.json().catch(() => ({}));

        if (apiRes.ok && apiData.success && apiData.user) {
          loggedInUser = apiData.user;
          loggedInSchool = apiData.school;
        } else if (apiRes.status === 401) {
          setLoginError(apiData.error || "Mot de passe incorrect.");
          toast(apiData.error || "Mot de passe incorrect.", "error");
          return;
        } else if (apiRes.status === 403) {
          setLoginError(apiData.error || "Compte suspendu.");
          toast(apiData.error || "Ce compte est actuellement suspendu.", "error");
          return;
        }
      } catch (err) {
        console.warn("[connexion] API login non disponible, fallback local :", err);
      }

      // 3. Authentification locale de secours (pour utilisateurs hors-ligne ou maquettes)
      if (!loggedInUser) {
        const authResult = authenticateSystemUser(cleanIdentifier, cleanPassword);

        if (!authResult.success || !authResult.user) {
          setLoginError(authResult.error || "Identifiant ou mot de passe incorrect.");
          toast(authResult.error || "Échec d'authentification.", "error");
          return;
        }

        loggedInUser = authResult.user;
      }

      const userRole = (loggedInUser.role || "directeur").toLowerCase() as Role;
      const schoolName = loggedInSchool?.name || loggedInUser.schoolName || "Établissement";
      const rawSchoolCode = loggedInSchool?.code || loggedInUser.schoolCode || "";
      const schoolCode = rawSchoolCode === "ECO-001" ? "" : rawSchoolCode;
      const schoolId = loggedInSchool?.id || loggedInUser.schoolId;

      // Synchroniser explicitement subscriptionStore pour que toute l'UI affiche le vrai établissement
      subscriptionStore.syncSchoolWithUser({
        id: schoolId,
        name: schoolName,
        code: schoolCode,
        shortName: loggedInSchool?.short_name,
        city: loggedInSchool?.city,
        country: loggedInSchool?.country,
        phone: loggedInSchool?.phone,
        email: loggedInSchool?.email,
      });

      authStore.login({
        id: loggedInUser.id,
        identifier: loggedInUser.identifier,
        email: loggedInUser.email,
        fullName: loggedInUser.fullName || loggedInUser.full_name,
        role: userRole,
        schoolId,
        schoolName,
        schoolCode,
        phone: loggedInUser.phone,
      });

      toast(`Connexion réussie ! Bienvenue ${loggedInUser.fullName || loggedInUser.full_name}.`, "success");
      router.push(targetPath[userRole] || "/directeur");
    } finally {
      setLoginLoading(false);
    }
  };

  // =========================================================================
  // ÉTATS D'INSCRIPTION : ÉTABLISSEMENT (Règle 3 : Code à 4 chiffres obligatoire)
  // =========================================================================
  const [schoolName, setSchoolName] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [schoolCodeError, setSchoolCodeError] = useState("");
  const [schoolShortName, setSchoolShortName] = useState("");
  const [schoolCountry, setSchoolCountry] = useState("Bénin");
  const [schoolCity, setSchoolCity] = useState("Cotonou");
  const [schoolDirectorName, setSchoolDirectorName] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [schoolPhone, setSchoolPhone] = useState("+229 ");
  const [schoolPassword, setSchoolPassword] = useState("");
  const [schoolChosenPlan, setSchoolChosenPlan] = useState<SchoolPlanCode>("STARTER");

  // Finalisation et enregistrement du compte après vérification OTP (E-mail ou SMS)
  const handleFinalizeVerifiedRegistration = async (verificationToken: string) => {
    if (!pendingRegistration) return;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...pendingRegistration.payload,
          verificationToken,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setIsVerificationModalOpen(false);
        toast(data.error || "Une erreur est survenue lors de l'inscription.", "error");
        return;
      }

      setIsVerificationModalOpen(false);

      if (pendingRegistration.pathway === "SCHOOL") {
        const createdSchoolData = data.school;
        const effectiveSchoolId = createdSchoolData?.id || `school-${Date.now()}`;
        const effectiveSchoolName = createdSchoolData?.name || pendingRegistration.payload.schoolName;
        const effectiveSchoolCode = createdSchoolData?.code || pendingRegistration.payload.schoolCode;

        const regResult = authStore.registerSchool({
          schoolId: effectiveSchoolId,
          schoolName: effectiveSchoolName,
          directorName: pendingRegistration.fullName,
          schoolEmail: pendingRegistration.email,
          schoolPhone: pendingRegistration.phone,
          schoolCountry: pendingRegistration.payload.country,
          schoolCity: pendingRegistration.payload.city,
          chosenPlan: pendingRegistration.payload.plan,
          schoolCode: effectiveSchoolCode,
          password: pendingRegistration.payload.password,
        });

        subscriptionStore.syncSchoolWithUser({
          id: effectiveSchoolId,
          name: effectiveSchoolName,
          code: effectiveSchoolCode,
          shortName: effectiveSchoolName.slice(0, 15),
          city: pendingRegistration.payload.city,
          country: pendingRegistration.payload.country,
          phone: pendingRegistration.phone,
          email: pendingRegistration.email,
        });

        changeSchoolPlan(pendingRegistration.payload.plan);

        toast(
          `Compte vérifié ! Établissement « ${effectiveSchoolName} » créé avec succès ! Votre identifiant Directeur est : ${regResult.identifier}.`,
          "success"
        );
        router.push("/directeur");
      } else {
        const regResult = authStore.registerParent({
          fullName: pendingRegistration.fullName,
          email: pendingRegistration.email,
          phone: pendingRegistration.phone,
          schoolId: pendingRegistration.payload.schoolId,
          schoolName: pendingRegistration.payload.schoolName,
          schoolCode: pendingRegistration.payload.schoolCode,
          chosenPlan: pendingRegistration.payload.chosenPlan,
          password: pendingRegistration.payload.password,
        });

        changeParentPlan(pendingRegistration.payload.chosenPlan);

        toast(
          `Compte parent vérifié avec succès ! Votre identifiant de connexion est : ${regResult.identifier}.`,
          "success"
        );
        router.push("/parent/abonnement?activation=required");
      }
    } catch (err) {
      console.error("[connexion-register] Erreur requête :", err);
      toast("Une erreur est survenue lors de l'enregistrement.", "error");
    }
  };

  const handleRegisterSchool = (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolCodeError("");

    if (!schoolName.trim() || !schoolEmail.trim()) {
      toast("Veuillez remplir tous les champs obligatoires.", "error");
      return;
    }

    // Validation du code établissement à 4 chiffres (Règle 3)
    const codeCheck = validateSchoolCode(schoolCode);
    if (!codeCheck.valid) {
      setSchoolCodeError(codeCheck.error || "Le code établissement doit comporter exactement 4 chiffres.");
      toast(codeCheck.error || "Le code établissement doit comporter exactement 4 chiffres.", "error");
      return;
    }

    if (!emailRegex.test(schoolEmail.trim())) {
      toast("Format d'adresse e-mail invalide pour l'établissement.", "error");
      return;
    }

    if (schoolPassword.length < 8) {
      toast("Le mot de passe doit comporter au moins 8 caractères.", "error");
      return;
    }

    const cleanCode = schoolCode.trim();
    const cleanSchoolName = schoolName.trim();
    const cleanDirector = schoolDirectorName.trim() || "Direction de l'Établissement";

    // Ouvrir la modale de choix de vérification (E-mail ou SMS)
    setPendingRegistration({
      pathway: "SCHOOL",
      email: schoolEmail.trim(),
      phone: schoolPhone.trim(),
      fullName: cleanDirector,
      payload: {
        pathway: "SCHOOL",
        schoolName: cleanSchoolName,
        schoolCode: cleanCode,
        directorName: cleanDirector,
        email: schoolEmail.trim(),
        phone: schoolPhone.trim(),
        password: schoolPassword,
        plan: schoolChosenPlan,
        country: schoolCountry,
        city: schoolCity,
      },
    });
    setIsVerificationModalOpen(true);
  };

  // =========================================================================
  // ÉTATS D'INSCRIPTION : PARENT (Règle 4 : Identifiant généré rattaché à l'école)
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

    if (parentEmail.trim() && !emailRegex.test(parentEmail.trim())) {
      toast("Format d'adresse e-mail parent invalide.", "error");
      return;
    }

    if (parentPassword.length < 8) {
      toast("Le mot de passe doit comporter au moins 8 caractères.", "error");
      return;
    }

    if (!selectedSchoolId && !customSchoolName.trim()) {
      toast("Veuillez sélectionner ou renseigner l'établissement scolaire de votre enfant.", "error");
      return;
    }

    const matchedSchool = schools.find((s) => s.id === selectedSchoolId);
    const chosenSchoolName = matchedSchool ? matchedSchool.name : customSchoolName.trim();
    const schoolCodeToUse = matchedSchool?.code || "4827";

    // Ouvrir la modale de choix de vérification (E-mail ou SMS)
    setPendingRegistration({
      pathway: "PARENT",
      email: parentEmail.trim(),
      phone: parentPhone.trim(),
      fullName: parentName.trim(),
      payload: {
        pathway: "PARENT",
        fullName: parentName.trim(),
        email: parentEmail.trim(),
        phone: parentPhone.trim(),
        schoolId: selectedSchoolId || "custom-school",
        schoolName: chosenSchoolName,
        schoolCode: schoolCodeToUse,
        chosenPlan: parentChosenPlan,
        password: parentPassword,
        childMatricule: childMatricule.trim(),
        childClass: childClass.trim(),
      },
    });
    setIsVerificationModalOpen(true);
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

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Identifiant ou Adresse e-mail *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(e) => {
                          setLoginIdentifier(e.target.value);
                          if (loginError) setLoginError("");
                        }}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:ring-2 ${
                          loginError
                            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
                            : "border-slate-300 focus:border-school-primary focus:ring-school-primary/20"
                        }`}
                        placeholder="Ex: 4827DIR01 ou direction@ecole.bj"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Saisissez l&apos;identifiant à préfixe de votre école (ex: 4827DIR01, 4827CEN01, 4827PAR01) ou votre e-mail.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 text-xs">Mot de passe secret *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          if (loginError) setLoginError("");
                        }}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-school-primary focus:ring-2 focus:ring-school-primary/20"
                        placeholder="Votre mot de passe personnel"
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

                  {loginError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                      {loginError}
                    </div>
                  )}

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
                      onClick={() => setIsForgotPasswordOpen(true)}
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
                      <span>Vérification des identifiants...</span>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Se connecter à mon espace</span>
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

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">
                          Code établissement (exactement 4 chiffres) *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={4}
                          placeholder="Ex: 4827"
                          value={schoolCode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                            setSchoolCode(val);
                            if (schoolCodeError) setSchoolCodeError("");
                          }}
                          className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold tracking-widest text-center text-slate-900 ${
                            schoolCodeError ? "border-rose-500 bg-rose-50" : "border-slate-300"
                          }`}
                        />
                        {schoolCodeError && (
                          <p className="text-[11px] text-rose-600 font-semibold">{schoolCodeError}</p>
                        )}
                        <p className="text-[10px] text-slate-500">
                          Règle 3 ECOGEST : Ce code à 4 chiffres devient le préfixe de tous les identifiants de l&apos;établissement (ex: 4827DIR01, 4827CEN01...).
                        </p>
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
                        Choisissez votre Formule :
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(["STARTER", "BASIC", "STANDARD", "PREMIUM"] as SchoolPlanCode[]).map((pCode) => {
                          const p = SCHOOL_PLANS[pCode];
                          const isSel = schoolChosenPlan === pCode;
                          return (
                            <div
                              key={pCode}
                              onClick={() => setSchoolChosenPlan(pCode)}
                              className={`p-2.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                                isSel
                                  ? "border-school-primary bg-school-50/70 ring-1 ring-school-primary shadow-xs"
                                  : "border-slate-200 hover:border-slate-300 bg-white"
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-xs text-slate-900 leading-tight">{p.name}</span>
                                  {isSel && <Check className="w-3.5 h-3.5 text-school-primary shrink-0" />}
                                </div>
                                <p className="text-xs font-black text-school-primary mt-1">
                                  {p.priceFcfa === 0 ? "0 FCFA" : `${p.priceFcfa.toLocaleString()} F`}
                                  <span className="text-[10px] font-normal text-slate-500">
                                    {p.priceFcfa === 0 ? " (Offert)" : " /m"}
                                  </span>
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

                    {schoolChosenPlan === "STARTER" ? (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                        <strong>1 mois gratuit offert :</strong> Accès immédiat et complet à toutes les fonctionnalités avec jusqu&apos;à 20 utilisateurs établissement. Aucun paiement requis.
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                        <strong>Activation requise :</strong> Après création, le règlement de l&apos;abonnement ({SCHOOL_PLANS[schoolChosenPlan].priceFcfa.toLocaleString()} FCFA/mois) sera demandé pour activer votre espace opérationnel.
                      </div>
                    )}

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

      {/* Modal de récupération autonome du mot de passe */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />

      {/* Modale de vérification par E-mail ou SMS (OTP) */}
      {isVerificationModalOpen && pendingRegistration && (
        <AccountVerificationModal
          isOpen={isVerificationModalOpen}
          onClose={() => setIsVerificationModalOpen(false)}
          email={pendingRegistration.email}
          phone={pendingRegistration.phone}
          fullName={pendingRegistration.fullName}
          purpose="REGISTRATION"
          onVerified={handleFinalizeVerifiedRegistration}
        />
      )}
    </div>
  );
}
