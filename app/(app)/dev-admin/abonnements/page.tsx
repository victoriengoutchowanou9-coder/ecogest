"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  PlusCircle,
  Building2,
  Users,
  RefreshCw,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useToast } from "@/components/ui/Toast";
import { SCHOOL_PLANS, PARENT_PLANS } from "@/lib/subscription-plans";
import { formatFCFA } from "@/lib/utils";

interface SchoolSubItem {
  id: string;
  entityType: "SCHOOL";
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  planCode: string;
  planName: string;
  amountFcfa: number;
  startDate: string;
  expiresAt: string;
  daysLeft: number;
  status: "ACTIVE" | "TRIAL" | "EXPIRED" | "SUSPENDED";
  maxUsers: number;
  usersUsed: number;
  autoRenew: boolean;
  grantedBy: string;
}

interface ParentSubItem {
  id: string;
  entityType: "PARENT";
  parentName: string;
  parentPhone: string;
  schoolName: string;
  planCode: string;
  planName: string;
  amountFcfa: number;
  startDate: string;
  expiresAt: string;
  daysLeft: number;
  status: "ACTIVE" | "EXPIRED";
  maxChildren: number;
  grantedBy: string;
}

export default function DevAbonnementsPage() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"SCHOOLS" | "PARENTS">("SCHOOLS");
  const [schoolsSubs, setSchoolsSubs] = useState<SchoolSubItem[]>([]);
  const [parentsSubs, setParentsSubs] = useState<ParentSubItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeCount: 0,
    expiringSoonCount: 0,
    expiredCount: 0,
    totalSchoolsTracked: 0,
    totalParentsTracked: 0,
  });

  // Modal « Faire un Abonnement » (Requirement 12)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEntityType, setModalEntityType] = useState<"SCHOOL" | "PARENT">("SCHOOL");
  const [modalTargetSchoolId, setModalTargetSchoolId] = useState("");
  const [modalTargetParentName, setModalTargetParentName] = useState("");
  const [modalTargetParentPhone, setModalTargetParentPhone] = useState("+229 ");
  const [modalParentSchoolName, setModalParentSchoolName] = useState("");
  const [modalPlanCode, setModalPlanCode] = useState("BASIC");
  const [modalDuration, setModalDuration] = useState(1);
  const [modalNotes, setModalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Écoles disponibles
  const [availableSchools, setAvailableSchools] = useState<Array<{ id: string; name: string }>>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dev-admin/subscriptions");
      if (res.ok) {
        const data = await res.json();
        setSchoolsSubs(data.schools || []);
        setParentsSubs(data.parents || []);
        if (data.stats) setStats(data.stats);
      } else {
        toast("Impossible de charger les abonnements.", "error");
      }

      // Charger liste des écoles pour le menu déroulant du modal
      const sRes = await fetch("/api/schools");
      if (sRes.ok) {
        const sJson = await sRes.json();
        setAvailableSchools(sJson.schools || []);
        if (sJson.schools && sJson.schools.length > 0 && !modalTargetSchoolId) {
          setModalTargetSchoolId(sJson.schools[0].id);
        }
      }
    } catch {
      toast("Erreur réseau.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();

    if (modalEntityType === "SCHOOL" && !modalTargetSchoolId) {
      toast("Veuillez sélectionner un établissement.", "error");
      return;
    }

    if (modalEntityType === "PARENT" && !modalTargetParentName.trim()) {
      toast("Veuillez renseigner le nom du parent.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedSchoolObj = availableSchools.find((s) => s.id === modalTargetSchoolId);
      const targetName =
        modalEntityType === "SCHOOL"
          ? selectedSchoolObj?.name || "Établissement"
          : modalTargetParentName.trim();

      const res = await fetch("/api/dev-admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: modalEntityType,
          targetId: modalEntityType === "SCHOOL" ? modalTargetSchoolId : undefined,
          targetName,
          targetPhone: modalTargetParentPhone,
          schoolName: modalEntityType === "PARENT" ? modalParentSchoolName : undefined,
          planCode: modalPlanCode,
          durationMonths: modalDuration,
          notes: modalNotes.trim(),
        }),
      });

      if (res.ok) {
        toast(`Abonnement validé avec succès pour ${targetName}.`, "success");
        setIsModalOpen(false);
        setModalTargetParentName("");
        setModalNotes("");
        loadData();
      } else {
        toast("Erreur lors de la validation de l'abonnement.", "error");
      }
    } catch {
      toast("Erreur réseau.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="Surveillance des Abonnements"
        subtitle="Supervision des forfaits écoles et parents, suivi des échéances et attribution de nouveaux abonnements"
        breadcrumbs={[{ label: "Développeur", href: "/dev-admin" }, { label: "Abonnements" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs touch-target"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualiser</span>
            </button>
            <button
              onClick={() => {
                setModalEntityType("SCHOOL");
                setModalPlanCode("BASIC");
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 transition shadow-sm touch-target"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Faire un Abonnement</span>
            </button>
          </div>
        }
      />

      {/* Cartes Statistiques Abonnements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Abonnements Actifs"
          value={loading ? "..." : String(stats.activeCount)}
          subtitle="Établissements en règle ou essai"
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="success"
        />
        <StatCard
          title="Échéance Proche (< 15j)"
          value={loading ? "..." : String(stats.expiringSoonCount)}
          subtitle="Arrivant bientôt à expiration"
          icon={<Clock className="w-6 h-6" />}
          variant={stats.expiringSoonCount > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Abonnements Expirés"
          value={loading ? "..." : String(stats.expiredCount)}
          subtitle="Période d'essai ou forfait échu"
          icon={<AlertTriangle className="w-6 h-6" />}
          variant={stats.expiredCount > 0 ? "danger" : "default"}
        />
        <StatCard
          title="Total Établissements Suivis"
          value={loading ? "..." : String(stats.totalSchoolsTracked)}
          subtitle={`${stats.totalParentsTracked} compte(s) parents suivis`}
          icon={<Building2 className="w-6 h-6" />}
          variant="default"
        />
      </div>

      {/* Bannière Alerte Expiration Imminente */}
      {stats.expiringSoonCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-amber-950">
              Alerte : {stats.expiringSoonCount} établissement(s) arrive(nt) bientôt à expiration
            </h4>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              Leur période de validité prend fin dans moins de 15 jours. Pensez à renouveler leur forfait pour éviter toute interruption de service pour l'équipe pédagogique.
            </p>
          </div>
        </div>
      )}

      {/* Onglets de sélection (Établissements / Parents) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("SCHOOLS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "SCHOOLS"
              ? "bg-school-primary text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Abonnements Établissements ({schoolsSubs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("PARENTS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "PARENTS"
              ? "bg-school-primary text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Abonnements Parents ({parentsSubs.length})</span>
        </button>
      </div>

      {/* Contenu de l'onglet ÉTABLISSEMENTS */}
      {activeTab === "SCHOOLS" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-school-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs">Chargement des abonnements réels...</p>
            </div>
          ) : schoolsSubs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs space-y-2">
              <CreditCard className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-700">Aucun abonnement enregistré.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Établissement</th>
                    <th className="py-3.5 px-3">Formule Active</th>
                    <th className="py-3.5 px-3">Montant Mensuel</th>
                    <th className="py-3.5 px-3">Date Début</th>
                    <th className="py-3.5 px-3">Date Expiration</th>
                    <th className="py-3.5 px-3 text-center">Statut</th>
                    <th className="py-3.5 px-3">Utilisateurs (Utilisés / Max)</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schoolsSubs.map((sub) => {
                    const pct = Math.min(100, Math.round((sub.usersUsed / (sub.maxUsers || 10)) * 100));

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Établissement */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{sub.schoolName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Code: {sub.schoolCode}</div>
                        </td>

                        {/* Formule */}
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-slate-900">{sub.planName}</span>
                          <div className="text-[10px] text-slate-400">Accordé par : {sub.grantedBy}</div>
                        </td>

                        {/* Montant */}
                        <td className="py-3.5 px-3 font-semibold text-slate-800">
                          {sub.amountFcfa > 0 ? `${sub.amountFcfa.toLocaleString()} FCFA` : "Gratuit (Essai)"}
                        </td>

                        {/* Date Début */}
                        <td className="py-3.5 px-3 text-slate-600">
                          {sub.startDate}
                        </td>

                        {/* Date Expiration */}
                        <td className="py-3.5 px-3 text-slate-800 font-medium">
                          <div>{sub.expiresAt}</div>
                          <span className={`text-[10px] font-bold ${sub.daysLeft <= 0 ? "text-rose-600" : sub.daysLeft <= 15 ? "text-amber-600" : "text-emerald-600"}`}>
                            {sub.daysLeft <= 0 ? "Expiré" : `${sub.daysLeft} jour(s) restant(s)`}
                          </span>
                        </td>

                        {/* Statut */}
                        <td className="py-3.5 px-3 text-center">
                          {sub.status === "ACTIVE" ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Actif
                            </span>
                          ) : sub.status === "TRIAL" ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              Essai 1 mois
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              Expiré
                            </span>
                          )}
                        </td>

                        {/* Utilisateurs autorisés vs utilisés */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-slate-800">{sub.usersUsed} comptes</span>
                            <span className="text-slate-400">max {sub.maxUsers}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-rose-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setModalEntityType("SCHOOL");
                              setModalTargetSchoolId(sub.schoolId);
                              setModalPlanCode(sub.planCode === "STARTER" ? "BASIC" : sub.planCode);
                              setIsModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-school-200 bg-school-50 text-school-primary text-xs font-bold hover:bg-school-100 transition shadow-2xs"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Renouveler</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Contenu de l'onglet PARENTS */}
      {activeTab === "PARENTS" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {parentsSubs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs space-y-3">
              <Users className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-700">Aucun abonnement parent attribué pour l'instant.</p>
              <button
                type="button"
                onClick={() => {
                  setModalEntityType("PARENT");
                  setModalPlanCode("PARENT_1");
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-xs transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Attribuer un abonnement Parent</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Parent d'Élève</th>
                    <th className="py-3.5 px-3">Contact</th>
                    <th className="py-3.5 px-3">Établissement</th>
                    <th className="py-3.5 px-3">Formule Parent</th>
                    <th className="py-3.5 px-3">Montant</th>
                    <th className="py-3.5 px-3">Expiration</th>
                    <th className="py-3.5 px-3 text-center">Statut</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parentsSubs.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{p.parentName}</td>
                      <td className="py-3.5 px-3 text-slate-600">{p.parentPhone}</td>
                      <td className="py-3.5 px-3 text-slate-700">{p.schoolName}</td>
                      <td className="py-3.5 px-3 font-semibold text-slate-900">{p.planName}</td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">{p.amountFcfa.toLocaleString()} FCFA</td>
                      <td className="py-3.5 px-3 text-slate-700">{p.expiresAt}</td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setModalEntityType("PARENT");
                            setModalTargetParentName(p.parentName);
                            setModalTargetParentPhone(p.parentPhone);
                            setModalPlanCode(p.planCode);
                            setIsModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold"
                        >
                          Renouveler
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL : FAIRE UN ABONNEMENT (ÉTABLISSEMENT OU PARENT)               */}
      {/* =================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-school-primary text-white flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Attribuer un Abonnement
                  </h3>
                  <p className="text-xs text-slate-500">Souscription &amp; validation directe par le Développeur</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="space-y-4">
              {/* Type d'entité : Établissement vs Parent */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Type de bénéficiaire :</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalEntityType("SCHOOL");
                      setModalPlanCode("BASIC");
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      modalEntityType === "SCHOOL"
                        ? "bg-school-50 text-school-primary border-school-300"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Établissement Scolaire
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalEntityType("PARENT");
                      setModalPlanCode("PARENT_1");
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      modalEntityType === "PARENT"
                        ? "bg-school-50 text-school-primary border-school-300"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Parent d'Élève
                  </button>
                </div>
              </div>

              {/* Sélection Établissement */}
              {modalEntityType === "SCHOOL" ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Sélectionner l'établissement :</label>
                  <select
                    value={modalTargetSchoolId}
                    onChange={(e) => setModalTargetSchoolId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-school-primary cursor-pointer"
                  >
                    {availableSchools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* Champs Parent */
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nom &amp; Prénom du parent :</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: M. Jean KOFFI"
                      value={modalTargetParentName}
                      onChange={(e) => setModalTargetParentName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-school-primary focus:bg-white transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Téléphone :</label>
                      <input
                        type="text"
                        value={modalTargetParentPhone}
                        onChange={(e) => setModalTargetParentPhone(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-school-primary focus:bg-white transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Établissement lié :</label>
                      <input
                        type="text"
                        placeholder="Ex: CS Saint-Augustin"
                        value={modalParentSchoolName}
                        onChange={(e) => setModalParentSchoolName(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-school-primary focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Formule */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Formule d'abonnement :</label>
                {modalEntityType === "SCHOOL" ? (
                  <select
                    value={modalPlanCode}
                    onChange={(e) => setModalPlanCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-school-primary cursor-pointer"
                  >
                    <option value="STARTER">Starter (Essai 1 mois gratuit - 0 FCFA)</option>
                    <option value="BASIC">Basic (6 000 FCFA/mois - 5 utilisateurs)</option>
                    <option value="STANDARD">Standard (10 000 FCFA/mois - 25 utilisateurs)</option>
                    <option value="PREMIUM">Premium (25 000 FCFA/mois - Utilisateurs illimités, 2 écoles)</option>
                  </select>
                ) : (
                  <select
                    value={modalPlanCode}
                    onChange={(e) => setModalPlanCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-school-primary cursor-pointer"
                  >
                    <option value="PARENT_1">Forfait Parent 1 (200 FCFA/mois - 1 enfant)</option>
                    <option value="PARENT_2">Forfait Parent 2 (300 FCFA/mois - 2 enfants)</option>
                  </select>
                )}
              </div>

              {/* Durée */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Durée :</label>
                <select
                  value={modalDuration}
                  onChange={(e) => setModalDuration(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-school-primary cursor-pointer"
                >
                  <option value={1}>1 Mois</option>
                  <option value={3}>3 Mois (Trimestre)</option>
                  <option value={6}>6 Mois (Semestre)</option>
                  <option value={12}>12 Mois (Année scolaire)</option>
                </select>
              </div>

              {/* Note technique */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Note ou référence de règlement (optionnel) :</label>
                <input
                  type="text"
                  placeholder="Ex: Paiement direct Mobile Money / Validation contractuelle"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-school-primary focus:bg-white transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white text-xs font-bold transition shadow-sm"
                >
                  {isSubmitting ? "Validation..." : "Confirmer l'abonnement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
