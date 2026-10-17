"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Users,
  Shield,
  Mail,
  Phone,
  CheckCircle2,
  UserX,
  X,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordCard } from "@/components/ui/RecordCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { useSubscriptionStore } from "@/lib/subscription-store";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Directeur" | "Censeur" | "Secrétariat" | "Surveillant" | "Enseignant" | "Comptable" | "Administration" | "Parent";
  status: "ACTIF" | "SUSPENDU";
  lastLogin: string;
  permissions?: string[];
}

const DEFAULT_USERS: UserAccount[] = [
  {
    id: "usr-dir-01",
    name: "Direction Générale (Fondateur)",
    email: "directeur@ecole.bj",
    phone: "+229 0155445122",
    role: "Directeur",
    status: "ACTIF",
    lastLogin: "Aujourd'hui à 08:30",
    permissions: ["TOUS_ACCÈS"],
  },
  {
    id: "usr-cen-02",
    name: "M. Marcellin DOKPO",
    email: "censeur@ecole.bj",
    phone: "+229 97 12 34 56",
    role: "Censeur",
    status: "ACTIF",
    lastLogin: "Aujourd'hui à 07:45",
    permissions: ["GESTION_PEDAGOGIE", "VALIDATION_NOTES", "EMARGEMENT", "BULLETINS"],
  },
  {
    id: "usr-sec-03",
    name: "Mme Solange HOUENOU",
    email: "secretariat@ecole.bj",
    phone: "+229 97 45 88 12",
    role: "Secrétariat",
    status: "ACTIF",
    lastLogin: "Aujourd'hui à 08:15",
    permissions: ["GESTION_ELEVES", "DOSSIERS_SCOLAIRES", "DOCUMENTS_PDF", "PARENTS_ADMIN"],
  },
  {
    id: "usr-surv-04",
    name: "M. Augustin SOSSOU",
    email: "surveillant@ecole.bj",
    phone: "+229 94 11 00 99",
    role: "Surveillant",
    status: "ACTIF",
    lastLogin: "Aujourd'hui à 07:15",
    permissions: ["DISCIPLINE", "APPEL_PRESENCE", "RETARDS", "SANCTIONS_PROPOSITION", "SURVEILLANCE_PLANNING"],
  },
  {
    id: "usr-cpt-05",
    name: "Mme Clarisse AGBO",
    email: "comptable@ecole.bj",
    phone: "+229 95 44 22 11",
    role: "Comptable",
    status: "ACTIF",
    lastLogin: "Hier à 16:15",
    permissions: ["TRESORERIE", "SCOLARITES", "REÇUS", "DEPENSES"],
  },
  {
    id: "usr-ens-06",
    name: "M. Paul KOUASSI (Prof. Mathématiques)",
    email: "professeur@ecole.bj",
    phone: "+229 96 33 88 77",
    role: "Enseignant",
    status: "ACTIF",
    lastLogin: "Hier à 14:20",
    permissions: ["SAISIE_NOTES", "APPEL_CLASSE", "CAHIER_TEXTES"],
  },
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function UtilisateursPage() {
  const { toast } = useToast();
  const { canAddUser, setUsersCount, schoolPlanDef } = useSubscriptionStore();
  const [users, setUsers] = useState<UserAccount[]>(DEFAULT_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Charger depuis le registre local au démarrage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("ecogest_school_users_registry");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUsers(parsed);
          setUsersCount(parsed.length);
        }
      }
    } catch (e) {
      console.warn("Erreur lecture utilisateurs enregistrés :", e);
    }
  }, [setUsersCount]);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formEmailError, setFormEmailError] = useState("");
  const [formPhone, setFormPhone] = useState("+229 ");
  const [formPassword, setFormPassword] = useState("Pass2026!");
  const [formRole, setFormRole] = useState<UserAccount["role"]>("Enseignant");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    "SAISIE_NOTES",
    "APPEL_CLASSE",
  ]);

  const handleOpenCreateModal = () => {
    const check = canAddUser(users.length);
    if (!check.allowed) {
      setLimitMessage(check.reason || "Limite d'utilisateurs atteinte.");
      setIsLimitModalOpen(true);
      return;
    }
    setFormEmailError("");
    setIsModalOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    setUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id === id) {
          const nextStatus: "ACTIF" | "SUSPENDU" = u.status === "ACTIF" ? "SUSPENDU" : "ACTIF";
          toast(`Compte de ${u.name} passé à ${nextStatus}`, nextStatus === "ACTIF" ? "success" : "info");
          return { ...u, status: nextStatus };
        }
        return u;
      });
      try {
        localStorage.setItem("ecogest_school_users_registry", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormEmailError("");

    const cleanEmail = formEmail.trim().toLowerCase();
    if (!formName.trim()) {
      toast("Le nom complet est obligatoire.", "error");
      return;
    }

    if (!cleanEmail) {
      setFormEmailError("L'adresse e-mail est obligatoire.");
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setFormEmailError("Format d'adresse e-mail invalide (ex : agent@ecole.bj).");
      return;
    }

    // Vérifier si l'e-mail est déjà utilisé localement
    const alreadyExists = users.some((u) => u.email.toLowerCase() === cleanEmail);
    if (alreadyExists) {
      setFormEmailError("Cette adresse e-mail est déjà attribuée à un compte de l'établissement.");
      toast("Cette adresse e-mail est déjà utilisée.", "error");
      return;
    }

    const check = canAddUser(users.length);
    if (!check.allowed) {
      setLimitMessage(check.reason || "Limite d'utilisateurs atteinte.");
      setIsModalOpen(false);
      setIsLimitModalOpen(true);
      return;
    }

    const newUser: UserAccount = {
      id: `u-${Date.now()}`,
      name: formName.trim(),
      email: cleanEmail,
      phone: formPhone.trim(),
      role: formRole,
      status: "ACTIF",
      lastLogin: "Jamais connecté",
      permissions: selectedPermissions,
    };

    // Tentative d'enregistrement API / Supabase
    try {
      await fetch("/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          email: cleanEmail,
          phone: formPhone.trim(),
          role: formRole,
          password: formPassword,
          permissions: selectedPermissions,
        }),
      });
    } catch (err) {
      console.warn("[utilisateurs] Synchro serveur différée :", err);
    }

    const nextUsers = [newUser, ...users];
    setUsers(nextUsers);
    setUsersCount(nextUsers.length);
    try {
      localStorage.setItem("ecogest_school_users_registry", JSON.stringify(nextUsers));
      // Si c'est un enseignant, synchroniser également dans le registre enseignants du Censeur
      if (formRole === "Enseignant") {
        const rawTeachers = localStorage.getItem("educogest_censeur_teachers_v1");
        const currentTeachers = rawTeachers ? JSON.parse(rawTeachers) : [];
        const existsInCenseur = currentTeachers.some(
          (t: any) => t.email.toLowerCase() === cleanEmail.toLowerCase()
        );
        if (!existsInCenseur) {
          const newTeacherEntry = {
            id: newUser.id,
            name: newUser.name,
            identifier: cleanEmail.split("@")[0],
            email: cleanEmail,
            phone: newUser.phone,
            specialty: "Enseignement Général",
            roleTitle: "Professeur Titulaire",
            status: "ACTIF" as const,
            assignedClasses: [],
            assignedSubjects: [],
            allowedPermissions: ["saisie_notes", "appel_presence", "cahier_textes"],
            weeklyHours: 12,
            createdAt: new Date().toISOString().split("T")[0],
          };
          localStorage.setItem(
            "educogest_censeur_teachers_v1",
            JSON.stringify([newTeacherEntry, ...currentTeachers])
          );
        }
      }
      window.dispatchEvent(new Event("ecogest_shared_data_update"));
      window.dispatchEvent(new Event("educogest_censeur_storage_update"));
    } catch (e) {}

    setIsModalOpen(false);
    toast(`Compte de ${formRole} créé avec succès pour ${formName}`, "success");
    setFormName("");
    setFormEmail("");
    setFormEmailError("");
    setFormPhone("+229 ");
    setFormPassword("Pass2026!");
  };

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns: Column<UserAccount>[] = [
    {
      key: "name",
      header: "Nom & Prénom",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900">{item.name}</span>
          <span className="block text-xs text-slate-500">{item.email}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rôle",
      render: (item) => (
        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold">
          {item.role}
        </span>
      ),
    },
    {
      key: "phone",
      header: "Téléphone",
      render: (item) => <span className="text-slate-700 text-xs font-mono">{item.phone}</span>,
    },
    {
      key: "status",
      header: "Statut",
      render: (item) => (
        <StatusBadge
          status={item.status === "ACTIF" ? "VALIDATED" : "LOCKED"}
          label={item.status === "ACTIF" ? "Actif" : "Suspendu"}
          size="sm"
        />
      ),
    },
    {
      key: "lastLogin",
      header: "Dernière connexion",
      render: (item) => <span className="text-slate-500 text-xs">{item.lastLogin}</span>,
    },
    {
      key: "id",
      header: "Action",
      className: "text-right",
      render: (item) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(item.id)}
          className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
            item.status === "ACTIF"
              ? "text-rose-600 hover:bg-rose-50 border border-rose-200"
              : "text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
          }`}
        >
          {item.status === "ACTIF" ? "Suspendre" : "Réactiver"}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Comptes &amp; Rôles"
        subtitle="Contrôle des accès, attributions des privilèges et journal des connexions"
        breadcrumbs={[{ label: "Directeur", href: "/directeur" }, { label: "Utilisateurs" }]}
        actions={
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un compte</span>
          </button>
        }
      />

      {/* Rôle du Directeur / Fondateur et gestion des accès */}
      <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-3.5 shadow-xs">
        <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold text-sm text-indigo-950 block">
            Rôle du Directeur / Fondateur &amp; Délégation des Accès d&apos;Établissement
          </strong>
          <p className="text-slate-600 leading-relaxed">
            L&apos;établissement est créé et administré par le <strong>Directeur ou Fondateur</strong>, responsable légal et décisionnaire principal.
            À partir de cet espace, le directeur peut créer ou attribuer les accès nécessaires à plusieurs membres de son établissement :
            <strong> Censeur</strong>, <strong>Comptable</strong>, <strong>Professeurs / Enseignants</strong> et autres membres de l&apos;administration.
            Chaque utilisateur se connecte avec son propre compte individuel et accède uniquement aux fonctionnalités correspondant à son rôle et à ses permissions.
          </p>
        </div>
      </div>

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par nom, email..."
        filters={[
          {
            key: "role",
            label: "Rôle",
            value: roleFilter,
            onChange: setRoleFilter,
            options: [
              { value: "ALL", label: "Tous les rôles" },
              { value: "Directeur", label: "Directeur" },
              { value: "Censeur", label: "Censeur" },
              { value: "Secrétariat", label: "Secrétariat" },
              { value: "Surveillant", label: "Surveillant" },
              { value: "Enseignant", label: "Enseignant" },
              { value: "Comptable", label: "Comptable" },
              { value: "Administration", label: "Administration" },
              { value: "Parent", label: "Parent" },
            ],
          },
        ]}
        onReset={() => {
          setSearch("");
          setRoleFilter("ALL");
        }}
      />

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item.id}
        renderMobileCard={(item) => (
          <RecordCard
            title={item.name}
            subtitle={item.email}
            badge={<span className="text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded">{item.role}</span>}
            details={[
              { label: "Téléphone", value: item.phone },
              { label: "Statut", value: item.status },
              { label: "Connexion", value: item.lastLogin },
            ]}
            actions={
              <button
                type="button"
                onClick={() => handleToggleStatus(item.id)}
                className="text-xs font-semibold text-school-primary hover:underline touch-target"
              >
                {item.status === "ACTIF" ? "Suspendre l'accès" : "Réactiver l'accès"}
              </button>
            }
          />
        )}
      />

      {/* Modal Créer un compte */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-school-primary" />
                <div>
                  <h3 className="font-bold text-slate-900">Créer un compte d&apos;accès</h3>
                  <span className="text-[11px] text-slate-500 block">Délégation de rôle par le Directeur</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Rôle et fonction attribués *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-800"
                >
                  <option value="Censeur">Censeur des études (Supervision pédagogique)</option>
                  <option value="Secrétariat">Secrétariat Pédagogique (Élèves, dossiers, certificats)</option>
                  <option value="Surveillant">Surveillant Général (Discipline, présences, retards, surveillance)</option>
                  <option value="Comptable">Comptable (Trésorerie &amp; Recouvrement)</option>
                  <option value="Enseignant">Professeur / Enseignant (Notes &amp; Présences)</option>
                  <option value="Administration">Autre membre d&apos;administration</option>
                  <option value="Directeur">Directeur Adjoint / Co-directeur</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Nom et prénom complet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : M. Jean-Baptiste DOSSOU"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Adresse e-mail de connexion *</label>
                <input
                  type="email"
                  required
                  placeholder="collaborateur@ecole.bj"
                  value={formEmail}
                  onChange={(e) => {
                    setFormEmail(e.target.value);
                    if (formEmailError) setFormEmailError("");
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 ${
                    formEmailError ? "border-rose-500 focus:ring-rose-500 bg-rose-50/40" : "border-slate-300"
                  }`}
                />
                {formEmailError && (
                  <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formEmailError}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Téléphone de contact</label>
                  <input
                    type="tel"
                    placeholder="+229 97 12 34 56"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Mot de passe temporaire *</label>
                  <input
                    type="text"
                    required
                    placeholder="Au moins 8 caractères"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              {/* Permissions spécifiques */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-800 block text-xs">
                  Permissions accordées par le Directeur :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes("SAISIE_NOTES")}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedPermissions([...selectedPermissions, "SAISIE_NOTES"]);
                        else setSelectedPermissions(selectedPermissions.filter((p) => p !== "SAISIE_NOTES"));
                      }}
                      className="rounded text-school-primary"
                    />
                    <span>Saisie des notes &amp; calculs</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes("APPEL_CLASSE")}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedPermissions([...selectedPermissions, "APPEL_CLASSE"]);
                        else setSelectedPermissions(selectedPermissions.filter((p) => p !== "APPEL_CLASSE"));
                      }}
                      className="rounded text-school-primary"
                    />
                    <span>Appel de classe &amp; assiduité</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes("VALIDATION_NOTES")}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedPermissions([...selectedPermissions, "VALIDATION_NOTES"]);
                        else setSelectedPermissions(selectedPermissions.filter((p) => p !== "VALIDATION_NOTES"));
                      }}
                      className="rounded text-school-primary"
                    />
                    <span>Validation &amp; Bulletins</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes("TRESORERIE")}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedPermissions([...selectedPermissions, "TRESORERIE"]);
                        else setSelectedPermissions(selectedPermissions.filter((p) => p !== "TRESORERIE"));
                      }}
                      className="rounded text-school-primary"
                    />
                    <span>Encaissement des scolarités</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-sm"
                >
                  Attribuer l&apos;accès
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Avertissement Limite du Forfait Atteinte (Requirement 3) */}
      {isLimitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Limite d&apos;utilisateurs du forfait atteinte
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {limitMessage}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900">
                  Formule actuelle : {schoolPlanDef.name} ({schoolPlanDef.priceFcfa.toLocaleString()} FCFA/mois)
                </p>
                <p className="text-slate-500">
                  Comptes actifs : <strong>{users.length}</strong> /{" "}
                  <strong>{schoolPlanDef.maxUsers} max</strong>
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLimitModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Fermer
                </button>
                <Link
                  href="/directeur/abonnement"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Passer au forfait supérieur</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
