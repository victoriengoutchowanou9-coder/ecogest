"use client";

import React, { useState, useEffect } from "react";
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
  AlertTriangle,
  Info,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { useToast } from "@/components/ui/Toast";
import { useSubscriptionStore, SchoolPlanCode, ParentPlanCode } from "@/lib/subscription-store";
import { useAuthStore } from "@/lib/auth-store";
import { validateSchoolCode } from "@/lib/user-registry";
import { AccountVerificationModal } from "@/components/auth/AccountVerificationModal";
import {
  SUPPORTED_COUNTRIES,
  getCountryConfig,
  getDepartments,
  getCities,
  validateGeoCoherence,
} from "@/lib/geo-data";

interface DbSchool {
  id: string;
  name: string;
  city?: string;
  country?: string;
}

export default function InscriptionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const authStore = useAuthStore();
  const subscriptionStore = useSubscriptionStore();

  const [pathway, setPathway] = useState<"SCHOOL" | "PARENT">("SCHOOL");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modale de vérification par E-mail ou SMS (OTP)
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<{
    pathway: "SCHOOL" | "PARENT";
    email: string;
    phone: string;
    fullName: string;
    payload: any;
  } | null>(null);

  // Liste des établissements issus de la base de données Supabase
  const [dbSchools, setDbSchools] = useState<DbSchool[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);

  // School registration form
  const [managerLastName, setManagerLastName] = useState("");
  const [managerFirstName, setManagerFirstName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [country, setCountry] = useState("Bénin");
  const [department, setDepartment] = useState("Littoral");
  const [city, setCity] = useState("Cotonou");
  const [schoolPhone, setSchoolPhone] = useState("+229 ");
  const [password, setPassword] = useState("");
  const [chosenPlan, setChosenPlan] = useState<SchoolPlanCode>("STANDARD");

  // Parent registration form
  const [parentLastName, setParentLastName] = useState("");
  const [parentFirstName, setParentFirstName] = useState("");
  const [parentRelationship, setParentRelationship] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("+229 ");
  const [parentPassword, setParentPassword] = useState("");
  const [parentPlan, setParentPlan] = useState<ParentPlanCode>("PARENT_1");
  const [parentSchoolId, setParentSchoolId] = useState("");
  const [parentSchoolName, setParentSchoolName] = useState("");
  const [childMatricule, setChildMatricule] = useState("");
  const [childClass, setChildClass] = useState("3ème A");

  // Error states for validation
  const [schoolLastNameError, setSchoolLastNameError] = useState("");
  const [schoolFirstNameError, setSchoolFirstNameError] = useState("");
  const [schoolCodeError, setSchoolCodeError] = useState("");
  const [schoolEmailError, setSchoolEmailError] = useState("");
  const [schoolPasswordError, setSchoolPasswordError] = useState("");
  const [geoError, setGeoError] = useState("");

  const [parentLastNameError, setParentLastNameError] = useState("");
  const [parentFirstNameError, setParentFirstNameError] = useState("");
  const [parentRelationshipError, setParentRelationshipError] = useState("");
  const [parentEmailError, setParentEmailError] = useState("");
  const [parentPasswordError, setParentPasswordError] = useState("");
  const [parentSchoolError, setParentSchoolError] = useState("");

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Récupération des établissements directement depuis la base de données
  useEffect(() => {
    async function loadSchools() {
      try {
        setLoadingSchools(true);
        const res = await fetch("/api/schools?activeOnly=true");
        if (res.ok) {
          const data = await res.json();
          if (data.schools && Array.isArray(data.schools)) {
            setDbSchools(data.schools);
            if (data.schools.length > 0) {
              setParentSchoolId(data.schools[0].id);
              setParentSchoolName(data.schools[0].name);
            }
          }
        }
      } catch (err) {
        console.error("[inscription] Erreur lecture établissements DB :", err);
      } finally {
        setLoadingSchools(false);
      }
    }
    loadSchools();
  }, []);

  // Gestion du changement de pays pour l'établissement
  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const depts = getDepartments(newCountry);
    const defaultDept = depts[0] || "";
    setDepartment(defaultDept);
    const cities = getCities(newCountry, defaultDept);
    setCity(cities[0] || "");
    const cfg = getCountryConfig(newCountry);
    setSchoolPhone(cfg.dialCode + " ");
    setGeoError("");
  };

  // Gestion du changement de département pour l'établissement
  const handleDepartmentChange = (newDept: string) => {
    setDepartment(newDept);
    const cities = getCities(country, newDept);
    setCity(cities[0] || "");
    setGeoError("");
  };

  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolLastNameError("");
    setSchoolFirstNameError("");
    setSchoolEmailError("");
    setSchoolPasswordError("");
    setGeoError("");

    // Validation Nom et Prénom séparés
    if (!managerLastName.trim()) {
      setSchoolLastNameError("Le nom de famille du responsable est obligatoire.");
      return;
    }
    if (!managerFirstName.trim()) {
      setSchoolFirstNameError("Le prénom du responsable est obligatoire.");
      return;
    }

    // Validation Email
    const cleanEmail = schoolEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setSchoolEmailError("L'adresse e-mail est obligatoire.");
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setSchoolEmailError("Format d'adresse e-mail invalide (ex : direction@ecole.bj).");
      return;
    }

    // Validation Mot de passe
    if (!password || password.length < 8) {
      setSchoolPasswordError("Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }

    // Vérification de la cohérence géographique (Pays, Département, Ville, Téléphone)
    const geoValidation = validateGeoCoherence(country, department, city, schoolPhone);
    if (!geoValidation.valid) {
      setGeoError(geoValidation.error || "Incohérence géographique ou téléphonique détectée.");
      toast(geoValidation.error || "Veuillez vérifier les informations géographiques et le numéro.", "error");
      return;
    }

    // Validation Code établissement à 4 chiffres (Règle 3)
    const codeCheck = validateSchoolCode(schoolCode);
    if (!codeCheck.valid) {
      setSchoolCodeError(codeCheck.error || "Code établissement à 4 chiffres obligatoire.");
      toast(codeCheck.error || "Le code établissement doit comporter exactement 4 chiffres.", "error");
      return;
    }

    const finalPhone = geoValidation.formattedPhone || schoolPhone.trim();
    const fullDirectorName = `${managerLastName.trim().toUpperCase()} ${managerFirstName.trim()}`;

    // Ouvrir la modale de vérification sécurisée (choix E-mail ou SMS)
    setPendingRegistration({
      pathway: "SCHOOL",
      email: cleanEmail,
      phone: finalPhone,
      fullName: fullDirectorName,
      payload: {
        pathway: "SCHOOL",
        schoolName: schoolName.trim(),
        schoolCode: schoolCode.trim(),
        directorLastName: managerLastName.trim(),
        directorFirstName: managerFirstName.trim(),
        directorName: fullDirectorName,
        email: cleanEmail,
        phone: finalPhone,
        password,
        country,
        department,
        city,
        chosenPlan,
      },
    });
    setIsVerificationModalOpen(true);
  };

  // Finalisation et enregistrement du compte après validation du code OTP
  const handleFinalizeVerifiedRegistration = async (verificationToken: string) => {
    if (!pendingRegistration) return;
    setLoading(true);

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
        if (res.status === 409) {
          if (pendingRegistration.pathway === "SCHOOL") {
            setSchoolEmailError(data.error || "Cette adresse e-mail est déjà utilisée.");
          } else {
            setParentEmailError(data.error || "Cette adresse e-mail est déjà utilisée.");
          }
        }
        toast(data.error || "Une erreur est survenue lors de l'enregistrement.", "error");
        setLoading(false);
        return;
      }

      setIsVerificationModalOpen(false);

      if (pendingRegistration.pathway === "SCHOOL") {
        const createdSchoolData = data.school;
        const effectiveSchoolId = createdSchoolData?.id || data.user?.schoolId;
        const effectiveSchoolName = createdSchoolData?.name || data.user?.schoolName || pendingRegistration.payload.schoolName;
        const effectiveSchoolCode = createdSchoolData?.code || data.user?.schoolCode || pendingRegistration.payload.schoolCode;
        const effectiveIdentifier = data.user?.identifier || `${effectiveSchoolCode}DIR01`;
        const selectedPlan = pendingRegistration.payload.chosenPlan || "STANDARD";

        subscriptionStore.syncSchoolWithUser({
          id: effectiveSchoolId,
          name: effectiveSchoolName,
          code: effectiveSchoolCode,
          city: pendingRegistration.payload.city,
          country: pendingRegistration.payload.country,
          phone: pendingRegistration.phone,
          email: pendingRegistration.email,
        });

        subscriptionStore.changeSchoolPlan(selectedPlan);
        subscriptionStore.setSchoolStatus("ACTIVE");

        authStore.login({
          id: data.user?.id,
          identifier: effectiveIdentifier,
          email: pendingRegistration.email,
          fullName: pendingRegistration.fullName,
          role: "directeur",
          schoolId: effectiveSchoolId,
          schoolName: effectiveSchoolName,
          schoolCode: effectiveSchoolCode,
          phone: pendingRegistration.phone,
        });

        toast(
          `Compte créé avec succès ! Initialisation du paiement SasPay pour la formule ${selectedPlan}...`,
          "info"
        );

        // Option B : Redirection obligatoire et immédiate vers SasPay Checkout
        try {
          const checkoutRes = await fetch("/api/subscriptions/saspay/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              entityType: "SCHOOL",
              planCode: selectedPlan,
              schoolId: effectiveSchoolId,
              userId: data.user?.id,
              customerEmail: pendingRegistration.email,
              customerName: pendingRegistration.fullName,
              customerPhone: pendingRegistration.phone,
            }),
          });
          const checkoutData = await checkoutRes.json().catch(() => ({}));

          if (checkoutRes.ok && checkoutData.success && checkoutData.checkoutUrl) {
            toast("Redirection sécurisée vers SasPay en cours...", "success");
            window.location.href = checkoutData.checkoutUrl;
            return;
          } else {
            console.warn("[SasPay checkout warning] :", checkoutData);
            toast("Compte enregistré. Redirection vers la finalisation du paiement SasPay...", "info");
            router.push("/directeur/abonnement");
            return;
          }
        } catch (payErr) {
          console.error("[SasPay checkout exception] :", payErr);
          router.push("/directeur/abonnement");
          return;
        }
      } else {
        const effectiveSchoolCode = data.user?.schoolCode || pendingRegistration.payload.schoolCode || "0000";
        const effectiveIdentifier = data.user?.identifier || `${effectiveSchoolCode}PAR01`;
        const matchedSchool = data.school;
        const selectedParentPlan = pendingRegistration.payload.chosenPlan || "PARENT_1";

        subscriptionStore.changeParentPlan(selectedParentPlan);
        subscriptionStore.setParentStatus("ACTIVE");

        authStore.setAuthenticated(
          {
            id: data.user?.id,
            identifier: effectiveIdentifier,
            email: pendingRegistration.email,
            fullName: pendingRegistration.fullName,
            role: "parent",
            schoolId: pendingRegistration.payload.schoolId,
            schoolName: pendingRegistration.payload.schoolName,
            schoolCode: effectiveSchoolCode,
            phone: pendingRegistration.phone,
            permissions: data.user?.permissions,
          },
          matchedSchool
        );

        toast(
          `Compte Parent créé avec succès ! Initialisation du paiement SasPay...`,
          "info"
        );

        // Option B : Redirection obligatoire et immédiate vers SasPay Checkout pour le Parent
        try {
          const checkoutRes = await fetch("/api/subscriptions/saspay/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              entityType: "PARENT",
              planCode: selectedParentPlan,
              schoolId: pendingRegistration.payload.schoolId,
              userId: data.user?.id,
              customerEmail: pendingRegistration.email,
              customerName: pendingRegistration.fullName,
              customerPhone: pendingRegistration.phone,
            }),
          });
          const checkoutData = await checkoutRes.json().catch(() => ({}));

          if (checkoutRes.ok && checkoutData.success && checkoutData.checkoutUrl) {
            toast("Redirection sécurisée vers SasPay en cours...", "success");
            window.location.href = checkoutData.checkoutUrl;
            return;
          } else {
            console.warn("[SasPay checkout warning] :", checkoutData);
            toast("Compte enregistré. Redirection vers la finalisation du paiement SasPay...", "info");
            router.push("/parent/abonnement");
            return;
          }
        } catch (payErr) {
          console.error("[SasPay checkout exception] :", payErr);
          router.push("/parent/abonnement");
          return;
        }
      }
    } catch (err: any) {
      console.error("[finalize-registration] Erreur :", err);
      toast("Une erreur est survenue lors de la création du compte.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setParentLastNameError("");
    setParentFirstNameError("");
    setParentRelationshipError("");
    setParentEmailError("");
    setParentPasswordError("");
    setParentSchoolError("");

    // Règle 5 : Vérification qu'au moins un établissement existe
    if (dbSchools.length === 0) {
      toast(
        "L'inscription parent n'est pas encore disponible. Un établissement doit d'abord être inscrit sur ECOGEST.",
        "error"
      );
      return;
    }

    // Validation Nom et Prénom séparés
    if (!parentLastName.trim()) {
      setParentLastNameError("Le nom de famille est obligatoire.");
      return;
    }
    if (!parentFirstName.trim()) {
      setParentFirstNameError("Le prénom est obligatoire.");
      return;
    }

    // Validation Lien parental obligatoire
    if (!parentRelationship.trim()) {
      setParentRelationshipError("Veuillez sélectionner votre lien parental obligatoire.");
      return;
    }

    // Validation Email
    const cleanEmail = parentEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setParentEmailError("L'adresse e-mail est obligatoire.");
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setParentEmailError("Format d'adresse e-mail invalide (ex : parent@gmail.com).");
      return;
    }

    // Validation Mot de passe
    if (!parentPassword || parentPassword.length < 8) {
      setParentPasswordError("Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }

    // Validation Établissement sélectionné depuis la base
    const matchedSchool = dbSchools.find((s) => s.id === parentSchoolId);
    if (!matchedSchool) {
      setParentSchoolError("Veuillez sélectionner un établissement scolaire existant.");
      return;
    }

    const fullParentName = `${parentLastName.trim().toUpperCase()} ${parentFirstName.trim()}`;
    const cleanParentPhone = parentPhone.trim();

    // Déclencher la modale de vérification (E-mail ou SMS)
    setPendingRegistration({
      pathway: "PARENT",
      email: cleanEmail,
      phone: cleanParentPhone,
      fullName: fullParentName,
      payload: {
        pathway: "PARENT",
        lastName: parentLastName.trim(),
        firstName: parentFirstName.trim(),
        fullName: fullParentName,
        relationship: parentRelationship.trim(),
        email: cleanEmail,
        phone: cleanParentPhone,
        password: parentPassword,
        schoolId: matchedSchool.id,
        schoolName: matchedSchool.name,
        chosenPlan: parentPlan,
        childMatricule: childMatricule.trim(),
        childClass: childClass.trim(),
      },
    });
    setIsVerificationModalOpen(true);
  };

  const currentCountryConfig = getCountryConfig(country);
  const departmentsList = getDepartments(country);
  const citiesList = getCities(country, department);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <PublicNavbar currentPath="/inscription" />

      {/* Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-school-primary text-white py-10 md:py-14 px-4 sm:px-6 lg:px-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-school-200">
          <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
          <span>OUVERTURE DE COMPTE ECOGEST</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
          Rejoignez la communauté ECOGEST
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
          /* ========================================================================= */
          /* FORMULAIRE D'INSCRIPTION ÉTABLISSEMENT                                    */
          /* ========================================================================= */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-6">
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-school-primary uppercase tracking-wider">
                Espace Direction &bull; Directeur / Fondateur
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Création et Enregistrement de votre Établissement
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                L&apos;établissement est créé par le <strong>Directeur ou Fondateur</strong>, responsable principal de la structure.
                En tant qu&apos;administrateur en chef, il configure l&apos;école et pourra par la suite attribuer des accès sécurisés aux membres de son équipe (Censeur, Comptable, Enseignants).
              </p>
            </div>

            <form onSubmit={handleSchoolSubmit} className="space-y-4 text-xs">
              {/* Nom et Prénom séparés pour le Directeur / Responsable */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Nom de famille du responsable (Fondateur / Directeur) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : DOKPO"
                    value={managerLastName}
                    onChange={(e) => {
                      setManagerLastName(e.target.value);
                      if (schoolLastNameError) setSchoolLastNameError("");
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 ${
                      schoolLastNameError ? "border-rose-500 bg-rose-50/40" : "border-slate-300"
                    }`}
                  />
                  {schoolLastNameError && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{schoolLastNameError}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Prénom du responsable *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Marcellin"
                    value={managerFirstName}
                    onChange={(e) => {
                      setManagerFirstName(e.target.value);
                      if (schoolFirstNameError) setSchoolFirstNameError("");
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 ${
                      schoolFirstNameError ? "border-rose-500 bg-rose-50/40" : "border-slate-300"
                    }`}
                  />
                  {schoolFirstNameError && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{schoolFirstNameError}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Nom officiel et Code à 4 chiffres */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-2">
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
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Code établissement (4 chiffres) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    data-lpignore="true"
                    placeholder="4 chiffres"
                    value={schoolCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setSchoolCode(val);
                      if (schoolCodeError) setSchoolCodeError("");
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold tracking-widest text-center text-slate-900 ${
                      schoolCodeError ? "border-rose-500 bg-rose-50/40" : "border-slate-300"
                    }`}
                  />
                  {schoolCodeError && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{schoolCodeError}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Email officiel et Téléphone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Email de contact officiel *</label>
                  <input
                    type="email"
                    required
                    placeholder="direction@stemarie-cotonou.bj"
                    value={schoolEmail}
                    onChange={(e) => {
                      setSchoolEmail(e.target.value);
                      if (schoolEmailError) setSchoolEmailError("");
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 ${
                      schoolEmailError ? "border-rose-500 focus:ring-rose-500 bg-rose-50/40" : "border-slate-300"
                    }`}
                  />
                  {schoolEmailError && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{schoolEmailError}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Téléphone officiel ({currentCountryConfig.dialCode}) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={currentCountryConfig.phonePlaceholder}
                    value={schoolPhone}
                    onChange={(e) => {
                      setSchoolPhone(e.target.value);
                      if (geoError) setGeoError("");
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                  />
                  <p className="text-[10px] text-slate-500">
                    Format attendu pour {country} : {currentCountryConfig.phonePlaceholder}
                  </p>
                </div>
              </div>

              {/* Champs géographiques obligatoires : Pays, Département, Ville */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Pays *</label>
                  <select
                    value={country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  >
                    {SUPPORTED_COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Département / Région *</label>
                  <select
                    value={department}
                    required
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                  >
                    <option value="">-- Sélectionnez le département --</option>
                    {departmentsList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Ville / Commune *</label>
                  <select
                    value={city}
                    required
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (geoError) setGeoError("");
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                  >
                    <option value="">-- Sélectionnez la ville --</option>
                    {citiesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message d'erreur de cohérence géographique */}
              {geoError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{geoError}</span>
                </div>
              )}

              {/* Mot de passe secret */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Mot de passe secret d&apos;administration *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Au moins 8 caractères avec chiffres et lettres"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (schoolPasswordError) setSchoolPasswordError("");
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 pr-10 ${
                      schoolPasswordError ? "border-rose-500 focus:ring-rose-500 bg-rose-50/40" : "border-slate-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {schoolPasswordError && (
                  <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{schoolPasswordError}</span>
                  </p>
                )}
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

              {/* Bannière d'information SasPay Option B */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-emerald-950">
                <Shield className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block text-emerald-900">
                    💳 Paiement d&apos;abonnement immédiat par SasPay
                  </span>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    À la validation de votre inscription, vous serez redirigé vers l&apos;interface sécurisée <strong>SasPay</strong> pour régler votre forfait (Mobile Money MTN MoMo, Moov Money, Wave, Celtiis ou Carte bancaire) et activer votre établissement.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-school-primary hover:bg-school-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 touch-target"
                >
                  <Building2 className="w-4 h-4" />
                  <span>
                    {loading
                      ? "Initialisation du paiement SasPay..."
                      : `Créer l'établissement & Payer via SasPay (${(chosenPlan === "BASIC" ? 6000 : chosenPlan === "PREMIUM" ? 25000 : 10000).toLocaleString()} FCFA)`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ========================================================================= */
          /* FORMULAIRE D'INSCRIPTION PARENT (AVEC CONDITION ÉTABLISSEMENT EXISTANT)  */
          /* ========================================================================= */
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

            {/* RÈGLE 5 : Bloquer l'inscription parent si aucun établissement n'est inscrit */}
            {!loadingSchools && dbSchools.length === 0 ? (
              <div className="bg-amber-50 rounded-2xl border-2 border-amber-300 p-6 sm:p-8 text-center space-y-4 animate-in fade-in">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Inscription Parent indisponible
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    L&apos;inscription parent n&apos;est pas encore disponible. Un établissement doit d&apos;abord être inscrit sur ECOGEST. Veuillez attendre que l&apos;établissement de votre enfant soit enregistré sur la plateforme.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setPathway("SCHOOL")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-sm transition"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Créer un compte Établissement</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleParentSubmit} className="space-y-4 text-xs">
                {/* Nom et Prénom séparés pour le Parent */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Nom de famille *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex : ADANHOUN"
                      value={parentLastName}
                      onChange={(e) => {
                        setParentLastName(e.target.value);
                        if (parentLastNameError) setParentLastNameError("");
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 ${
                        parentLastNameError ? "border-rose-500 bg-rose-50/40" : "border-slate-300"
                      }`}
                    />
                    {parentLastNameError && (
                      <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{parentLastNameError}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Prénom *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex : Marc"
                      value={parentFirstName}
                      onChange={(e) => {
                        setParentFirstName(e.target.value);
                        if (parentFirstNameError) setParentFirstNameError("");
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 ${
                        parentFirstNameError ? "border-rose-500 bg-rose-50/40" : "border-slate-300"
                      }`}
                    />
                    {parentFirstNameError && (
                      <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{parentFirstNameError}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Lien parental obligatoire */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Lien parental avec l&apos;élève *</label>
                  <select
                    required
                    value={parentRelationship}
                    onChange={(e) => {
                      setParentRelationship(e.target.value);
                      if (parentRelationshipError) setParentRelationshipError("");
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 bg-white ${
                      parentRelationshipError ? "border-rose-500 bg-rose-50/40" : "border-slate-300"
                    }`}
                  >
                    <option value="">-- Sélectionnez votre lien de parenté * --</option>
                    <option value="Père">Père</option>
                    <option value="Mère">Mère</option>
                    <option value="Tuteur légal">Tuteur légal</option>
                    <option value="Tutrice légale">Tutrice légale</option>
                    <option value="Autre responsable légal">Autre responsable légal</option>
                  </select>
                  {parentRelationshipError && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{parentRelationshipError}</span>
                    </p>
                  )}
                </div>

                {/* Téléphone et Email */}
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
                    <label className="font-bold text-slate-700 block">Adresse Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="parent@gmail.com"
                      value={parentEmail}
                      onChange={(e) => {
                        setParentEmail(e.target.value);
                        if (parentEmailError) setParentEmailError("");
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 ${
                        parentEmailError ? "border-rose-500 focus:ring-rose-500 bg-rose-50/40" : "border-slate-300"
                      }`}
                    />
                    {parentEmailError && (
                      <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{parentEmailError}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Mot de passe secret */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Mot de passe secret *</label>
                  <input
                    type="password"
                    required
                    placeholder="Au moins 8 caractères"
                    value={parentPassword}
                    onChange={(e) => {
                      setParentPassword(e.target.value);
                      if (parentPasswordError) setParentPasswordError("");
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 ${
                      parentPasswordError ? "border-rose-500 focus:ring-rose-500 bg-rose-50/40" : "border-slate-300"
                    }`}
                  />
                  {parentPasswordError && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{parentPasswordError}</span>
                    </p>
                  )}
                </div>

                {/* Établissement fréquenté par l'enfant (Sélection obligatoire parmi les établissements en base) */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="font-bold text-slate-800 block text-xs">
                    Établissement scolaire fréquenté par votre enfant *
                  </label>
                  {loadingSchools ? (
                    <div className="p-3 text-slate-400 bg-slate-50 rounded-xl text-center text-xs">
                      Chargement des établissements actifs...
                    </div>
                  ) : dbSchools.length === 0 ? (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Aucun établissement actif disponible</span>
                      </p>
                      <p className="text-[11px] text-amber-800">
                        Aucun établissement partenaire n&apos;est actuellement ouvert aux inscriptions directes. Veuillez vous rapprocher de la direction de votre école.
                      </p>
                    </div>
                  ) : (
                    <select
                      required
                      value={parentSchoolId}
                      onChange={(e) => {
                        setParentSchoolId(e.target.value);
                        const found = dbSchools.find((s) => s.id === e.target.value);
                        if (found) setParentSchoolName(found.name);
                        if (parentSchoolError) setParentSchoolError("");
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 bg-white ${
                        parentSchoolError ? "border-rose-500 bg-rose-50/40" : "border-slate-300"
                      }`}
                    >
                      <option value="">-- Sélectionnez l&apos;établissement enregistré * --</option>
                      {dbSchools.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.city ? `(${s.city})` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                  {parentSchoolError && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{parentSchoolError}</span>
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500">
                    Seuls les établissements déjà enregistrés sur ECOGEST peuvent être sélectionnés.
                  </p>
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
                        autoComplete="off"
                        data-lpignore="true"
                        placeholder="Matricule de l'élève"
                        value={childMatricule}
                        onChange={(e) => setChildMatricule(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Classe actuelle</label>
                      <input
                        type="text"
                        autoComplete="off"
                        data-lpignore="true"
                        placeholder="Classe de l'élève"
                        value={childClass}
                        onChange={(e) => setChildClass(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Bannière d'information SasPay Parent Option B */}
                <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-indigo-950">
                  <Shield className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold block text-indigo-900">
                      💳 Paiement d&apos;abonnement immédiat par SasPay
                    </span>
                    <p className="text-[11px] text-indigo-800 leading-relaxed">
                      L&apos;activation du suivi scolaire de votre enfant s&apos;effectue par règlement sécurisé via <strong>SasPay</strong> (Mobile Money ou Carte bancaire).
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || dbSchools.length === 0}
                    className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 touch-target"
                  >
                    <Home className="w-4 h-4" />
                    <span>
                      {loading
                        ? "Initialisation du paiement SasPay..."
                        : `Créer mon compte Parent & Payer via SasPay (${(parentPlan === "PARENT_2" ? 300 : 200).toLocaleString()} FCFA)`}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="text-center text-xs text-slate-500">
          Vous avez déjà un compte ?{" "}
          <Link href="/connexion" className="font-bold text-school-primary hover:underline">
            Se connecter à son espace
          </Link>
        </div>
      </main>

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

      <PublicFooter />
    </div>
  );
}
