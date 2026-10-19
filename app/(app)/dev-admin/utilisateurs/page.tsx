"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Shield,
  Building2,
  Calendar,
  CheckCircle2,
  UserX,
  UserCheck,
  Eye,
  Mail,
  Phone,
  RefreshCw,
  Clock,
  X,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";

interface UserItem {
  id: string;
  identifier?: string;
  fullName: string;
  email: string;
  role: string;
  fonction?: string;
  phone: string;
  status: "ACTIF" | "SUSPENDU";
  schoolId?: string;
  schoolName: string;
  schoolCode: string;
  createdAt: string;
  lastLogin: string;
}

export default function DevUtilisateursPage() {
  const { toast } = useToast();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [search, setSearch] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modal Fiche Utilisateur
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Modal Activer / Suspendre
  const [statusModalUser, setStatusModalUser] = useState<UserItem | null>(null);
  const [statusReason, setStatusReason] = useState("");
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  // Modal Supprimer Utilisateur
  const [deleteModalUser, setDeleteModalUser] = useState<UserItem | null>(null);
  const [confirmEmailInput, setConfirmEmailInput] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Charger utilisateurs avec filtres
      const params = new URLSearchParams();
      if (schoolFilter !== "ALL") params.append("school", schoolFilter);
      if (roleFilter !== "ALL") params.append("role", roleFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/dev-admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        toast("Impossible de charger les utilisateurs.", "error");
      }

      // 2. Charger liste des écoles pour le menu déroulant
      const schoolsRes = await fetch("/api/schools");
      if (schoolsRes.ok) {
        const sData = await schoolsRes.json();
        setSchools(sData.schools || []);
      }
    } catch {
      toast("Erreur réseau.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [schoolFilter, roleFilter, statusFilter, dateFrom, dateTo]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleResetFilters = () => {
    setSearch("");
    setSchoolFilter("ALL");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setDateFrom("");
    setDateTo("");
  };

  // Toggle status
  const handleToggleUserStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalUser) return;

    const nextStatus = statusModalUser.status === "ACTIF" ? "SUSPENDU" : "ACTIF";
    setIsSubmittingStatus(true);

    try {
      const res = await fetch("/api/dev-admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: statusModalUser.id,
          status: nextStatus,
          reason: statusReason.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast(
          `Compte utilisateur ${nextStatus === "ACTIF" ? "réactivé" : "suspendu"} avec succès.`,
          nextStatus === "ACTIF" ? "success" : "info"
        );
        setStatusModalUser(null);
        setStatusReason("");
        loadData();
      } else {
        toast(data.error || "Erreur lors de la modification du statut.", "error");
      }
    } catch {
      toast("Erreur réseau.", "error");
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  // Suppression d'un utilisateur
  const handleDeleteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteModalUser) return;

    if (confirmEmailInput.trim().toLowerCase() !== deleteModalUser.email.trim().toLowerCase()) {
      toast("L'adresse e-mail saisie ne correspond pas.", "error");
      return;
    }

    setIsSubmittingDelete(true);
    try {
      const res = await fetch(`/api/dev-admin/users?id=${deleteModalUser.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: deleteModalUser.id,
          reason: deleteReason.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        toast(data.message || "Compte utilisateur supprimé avec succès.", "success");
        setDeleteModalUser(null);
        setConfirmEmailInput("");
        setDeleteReason("");
        if (selectedUser?.id === deleteModalUser.id) {
          setSelectedUser(null);
        }
        loadData();
      } else {
        toast(data.error || "Erreur lors de la suppression du compte.", "error");
      }
    } catch {
      toast("Erreur réseau.", "error");
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  const getRoleBadge = (role: string, fonction?: string) => {
    const r = (role || "").toLowerCase();
    if (r.includes("directeur")) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase">
          {fonction || "Direction Générale"}
        </span>
      );
    }
    if (r.includes("censeur")) {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase">Censeur</span>;
    }
    if (r.includes("comptab")) {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">Comptabilité</span>;
    }
    if (r.includes("prof") || r.includes("enseignant")) {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">Enseignant</span>;
    }
    if (r.includes("parent")) {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase">Parent</span>;
    }
    if (r.includes("dev")) {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">Développeur</span>;
    }
    return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">{role}</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="Supervision des Utilisateurs"
        subtitle="Recherche, filtrage multi-critères et supervision des comptes utilisateurs tous établissements confondus"
        breadcrumbs={[{ label: "Développeur", href: "/dev-admin" }, { label: "Utilisateurs" }]}
        actions={
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs touch-target"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>
        }
      />

      {/* Barre de Filtres Complète */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, email, téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-school-primary focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white text-xs font-bold transition shadow-xs w-full md:w-auto"
          >
            Rechercher
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          {/* Filtre Établissement */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Établissement
            </label>
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 outline-none focus:border-school-primary cursor-pointer"
            >
              <option value="ALL">Tous les établissements</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Rôle */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Rôle
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 outline-none focus:border-school-primary cursor-pointer"
            >
              <option value="ALL">Tous les rôles</option>
              <option value="directeur">Directeur</option>
              <option value="censeur">Censeur</option>
              <option value="comptabilite">Comptable</option>
              <option value="enseignant">Enseignant</option>
              <option value="surveillant">Surveillant</option>
              <option value="secretariat">Secrétariat</option>
              <option value="parent">Parent</option>
            </select>
          </div>

          {/* Filtre Statut */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Statut du compte
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 outline-none focus:border-school-primary cursor-pointer"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="ACTIF">Actifs</option>
              <option value="SUSPENDU">Suspendus</option>
            </select>
          </div>

          {/* Période */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Période de création
            </label>
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-1/2 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700"
                title="Date de début"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-1/2 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700"
                title="Date de fin"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des Utilisateurs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-school-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Chargement des utilisateurs réels...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">Aucun compte utilisateur ne correspond aux critères.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Nom et Prénom</th>
                  <th className="py-3.5 px-3">Identifiant</th>
                  <th className="py-3.5 px-3">Rôle / Fonction</th>
                  <th className="py-3.5 px-3">Établissement Associé</th>
                  <th className="py-3.5 px-3">Contact</th>
                  <th className="py-3.5 px-3 text-center">Statut Compte</th>
                  <th className="py-3.5 px-3">Création</th>
                  <th className="py-3.5 px-3">Dernière Connexion</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Nom et Prénom */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{u.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">{u.email}</div>
                    </td>

                    {/* Identifiant */}
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] inline-block">
                        {u.identifier || "—"}
                      </span>
                    </td>

                    {/* Rôle / Fonction */}
                    <td className="py-3.5 px-3">
                      {getRoleBadge(u.role, u.fonction)}
                    </td>

                    {/* Établissement associé */}
                    <td className="py-3.5 px-3 text-slate-700">
                      <div className="font-semibold truncate max-w-[200px]">{u.schoolName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Code: {u.schoolCode}</div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-3 text-slate-600 text-[11px]">
                      <div>{u.phone}</div>
                    </td>

                    {/* Statut Compte */}
                    <td className="py-3.5 px-3 text-center">
                      {u.status === "ACTIF" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Actif
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                          <UserX className="w-3 h-3 text-rose-600" />
                          Suspendu
                        </span>
                      )}
                    </td>

                    {/* Date de création */}
                    <td className="py-3.5 px-3 text-[11px] text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </td>

                    {/* Dernière connexion */}
                    <td className="py-3.5 px-3 text-[11px] text-slate-600">
                      {new Date(u.lastLogin).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}{" "}
                      <span className="text-slate-400 text-[10px]">
                        {new Date(u.lastLogin).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shadow-2xs"
                          title="Voir la fiche détaillée"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setStatusModalUser(u)}
                          className={`p-1.5 rounded-lg border shadow-2xs ${
                            u.status === "ACTIF"
                              ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                          title={u.status === "ACTIF" ? "Suspendre l'utilisateur" : "Réactiver l'utilisateur"}
                        >
                          {u.status === "ACTIF" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>

                        {u.role?.toLowerCase() !== "developpeur" && (
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteModalUser(u);
                              setConfirmEmailInput("");
                              setDeleteReason("");
                            }}
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-2xs transition"
                            title="Supprimer définitivement l'utilisateur"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Fiche Utilisateur */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-school-primary text-white flex items-center justify-center font-bold text-sm">
                  {selectedUser.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{selectedUser.fullName}</h3>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Identifiant Officiel</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{selectedUser.identifier || "—"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Fonction / Rôle</span>
                <span className="font-bold text-purple-800">{selectedUser.fonction || "Direction Générale"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Statut</span>
                <span className={`font-bold ${selectedUser.status === "ACTIF" ? "text-emerald-700" : "text-rose-700"}`}>
                  {selectedUser.status === "ACTIF" ? "Compte Actif" : "Compte Suspendu"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Code Établissement</span>
                <span className="font-mono font-bold text-slate-900">{selectedUser.schoolCode}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Établissement</span>
                <span className="font-bold text-slate-900 text-sm">{selectedUser.schoolName}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Téléphone</span>
                <span className="font-semibold text-slate-800">{selectedUser.phone}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Date d'inscription</span>
                <span className="font-semibold text-slate-800">
                  {new Date(selectedUser.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-school-primary" />
                Sécurité des identifiants
              </span>
              <p className="text-[11px] leading-relaxed">
                Les mots de passe des utilisateurs sont chiffrés et hachés de manière irréversible. Le développeur ne peut ni visualiser ni modifier arbitrairement les mots de passe des utilisateurs.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              {selectedUser.role?.toLowerCase() !== "developpeur" ? (
                <button
                  type="button"
                  onClick={() => {
                    const u = selectedUser;
                    setSelectedUser(null);
                    setDeleteModalUser(u);
                    setConfirmEmailInput("");
                    setDeleteReason("");
                  }}
                  className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer ce compte</span>
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Activer / Suspendre Utilisateur */}
      {statusModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                  statusModalUser.status === "ACTIF"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {statusModalUser.status === "ACTIF" ? <UserX className="w-5 h-5 text-amber-700" /> : <UserCheck className="w-5 h-5 text-emerald-700" />}
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  {statusModalUser.status === "ACTIF" ? "Suspendre l'utilisateur" : "Réactiver l'utilisateur"}
                </h3>
                <p className="text-xs text-slate-500">{statusModalUser.fullName} ({statusModalUser.email})</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {statusModalUser.status === "ACTIF"
                ? "La suspension empêchera cet utilisateur de se connecter à la plateforme jusqu'à sa réactivation."
                : "La réactivation rétablira immédiatement l'accès de cet utilisateur à son espace."}
            </p>

            <form onSubmit={handleToggleUserStatus} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Raison de la modification (optionnel) :</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Demande de la direction, anomalie d'usage..."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-school-primary focus:bg-white transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStatus}
                  className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-sm ${
                    statusModalUser.status === "ACTIF"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {isSubmittingStatus ? "Modification..." : statusModalUser.status === "ACTIF" ? "Confirmer la suspension" : "Confirmer la réactivation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Supprimer Définitivement Utilisateur */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-base text-rose-950">Suppression Définitive</h3>
                <p className="text-xs text-slate-500">Action irréversible</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 leading-relaxed space-y-1">
              <p>
                ⚠️ Attention : La suppression supprimera définitivement le compte de{" "}
                <strong>{deleteModalUser.fullName}</strong> ({deleteModalUser.role}) rattaché à{" "}
                <strong>{deleteModalUser.schoolName}</strong>.
              </p>
              <p className="text-[11px] text-rose-700">
                Toutes les autorisations et sessions associées seront révoquées immédiatement.
              </p>
            </div>

            <form onSubmit={handleDeleteUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Pour confirmer, veuillez saisir l'adresse e-mail exacte de l'utilisateur :
                </label>
                <input
                  type="text"
                  required
                  placeholder={deleteModalUser.email}
                  value={confirmEmailInput}
                  onChange={(e) => setConfirmEmailInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Motif de la suppression (optionnel) :
                </label>
                <input
                  type="text"
                  placeholder="Ex: Demande de résiliation, doublon de compte..."
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalUser(null);
                    setConfirmEmailInput("");
                    setDeleteReason("");
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmittingDelete ||
                    confirmEmailInput.trim().toLowerCase() !== deleteModalUser.email.trim().toLowerCase()
                  }
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm"
                >
                  {isSubmittingDelete ? "Suppression en cours..." : "Supprimer définitivement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
