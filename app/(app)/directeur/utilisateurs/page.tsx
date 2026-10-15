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

interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Directeur" | "Censeur" | "Enseignant" | "Comptable" | "Parent";
  status: "ACTIF" | "SUSPENDU";
  lastLogin: string;
}

const INITIAL_USERS: UserAccount[] = [
  { id: "u-01", name: "Père Gilbert KPATINVOH", email: "directeur@ccpa-cotonou.bj", phone: "+229 97 00 00 01", role: "Directeur", status: "ACTIF", lastLogin: "Aujourd'hui 07:45" },
  { id: "u-02", name: "M. Marcellin DOKPO", email: "censeur@ccpa-cotonou.bj", phone: "+229 97 00 00 02", role: "Censeur", status: "ACTIF", lastLogin: "Aujourd'hui 08:10" },
  { id: "u-03", name: "Prof. Justin HOUNKPONOU", email: "prof.hounkponou@ccpa-cotonou.bj", phone: "+229 96 11 22 33", role: "Enseignant", status: "ACTIF", lastLogin: "Hier 16:30" },
  { id: "u-04", name: "M. Clément KPONOU", email: "comptable@ccpa-cotonou.bj", phone: "+229 97 55 44 33", role: "Comptable", status: "ACTIF", lastLogin: "Aujourd'hui 09:00" },
  { id: "u-05", name: "M. Marc ADANHOUN", email: "parent.adanhouan@gmail.com", phone: "+229 97 12 34 56", role: "Parent", status: "ACTIF", lastLogin: "24/09/2026" },
];

export default function UtilisateursPage() {
  const { toast } = useToast();
  const { canAddUser, setUsersCount, schoolPlanDef } = useSubscriptionStore();
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("+229 ");
  const [formRole, setFormRole] = useState<UserAccount["role"]>("Enseignant");

  const handleOpenCreateModal = () => {
    const check = canAddUser(users.length);
    if (!check.allowed) {
      setLimitMessage(check.reason || "Limite d'utilisateurs atteinte.");
      setIsLimitModalOpen(true);
      return;
    }
    setIsModalOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === "ACTIF" ? "SUSPENDU" : "ACTIF";
          toast(`Compte de ${u.name} passé à ${nextStatus}`, nextStatus === "ACTIF" ? "success" : "info");
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

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
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim(),
      role: formRole,
      status: "ACTIF",
      lastLogin: "Jamais connecté",
    };

    const nextUsers = [newUser, ...users];
    setUsers(nextUsers);
    setUsersCount(nextUsers.length);
    setIsModalOpen(false);
    toast(`Compte de ${formRole} créé avec succès pour ${formName}`, "success");
    setFormName("");
    setFormEmail("");
    setFormPhone("+229 ");
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
              { value: "Enseignant", label: "Enseignant" },
              { value: "Comptable", label: "Comptable" },
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-school-primary" />
                <h3 className="font-bold text-slate-900">Créer un nouveau compte</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Rôle de l'utilisateur</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white font-medium"
                >
                  <option value="Censeur">Censeur des études</option>
                  <option value="Comptable">Comptable</option>
                  <option value="Enseignant">Enseignant</option>
                  <option value="Parent">Parent d'élève</option>
                  <option value="Directeur">Directeur Adjoint</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Nom complet</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: M. Jean DOSSA"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-school-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Adresse email</label>
                <input
                  type="email"
                  required
                  placeholder="jean.dossa@ccpa-cotonou.bj"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Numéro de téléphone</label>
                <input
                  type="tel"
                  placeholder="+229 97 12 34 56"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-semibold hover:bg-school-700 shadow-sm"
                >
                  Créer le compte
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
