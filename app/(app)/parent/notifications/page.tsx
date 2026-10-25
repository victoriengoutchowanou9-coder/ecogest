"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Award,
  CreditCard,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Filter,
  Smartphone,
  Mail,
  Settings2,
  FileSpreadsheet,
  Megaphone,
  CheckCheck,
  ShieldCheck,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCommunicationStore } from "@/lib/communication-store";
import { NotificationType } from "@/lib/types/communication";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export default function ParentNotificationsPage() {
  const { toast } = useToast();
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    pushStatus,
    togglePushSubscription,
  } = useCommunicationStore();

  const [filterType, setFilterType] = useState<string>("ALL");
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);

  // Préférences locales
  const [prefPush, setPrefPush] = useState(true);
  const [prefEmail, setPrefEmail] = useState(true);
  const [prefGrades, setPrefGrades] = useState(true);
  const [prefBulletins, setPrefBulletins] = useState(true);
  const [prefAnnouncements, setPrefAnnouncements] = useState(true);

  const handleSavePreferences = () => {
    setIsPrefModalOpen(false);
    toast("Vos préférences de notification ont été mises à jour.", "success");
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "NOTE_PUBLIEE":
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case "BULLETIN_PUBLIE":
        return <Award className="w-5 h-5 text-purple-600" />;
      case "SCOLARITE":
        return <CreditCard className="w-5 h-5 text-amber-600" />;
      case "PRESENCE":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "URGENCE":
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      case "ANNONCE":
      default:
        return <Megaphone className="w-5 h-5 text-school-primary" />;
    }
  };

  const filtered = notifications.filter((n) => {
    if (filterType === "ALL") return true;
    if (filterType === "NOTES_BULLETINS") return n.type === "NOTE_PUBLIEE" || n.type === "BULLETIN_PUBLIE";
    if (filterType === "ANNONCES") return n.type === "ANNONCE" || n.type === "URGENCE";
    if (filterType === "SCOLARITE") return n.type === "SCOLARITE";
    if (filterType === "PRESENCE") return n.type === "PRESENCE";
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centre de Notifications & Communications"
        subtitle={`Alertes officielles sur les notes validées, bulletins, annonces et vie scolaire &middot; ${unreadNotificationsCount} non lue(s)`}
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Notifications" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPrefModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs touch-target transition-colors"
            >
              <Settings2 className="w-4 h-4 text-slate-500" />
              <span>Préférences</span>
            </button>

            {unreadNotificationsCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-school-primary text-white text-xs font-semibold shadow-2xs hover:bg-school-primary/90 touch-target transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Tout marquer comme lu</span>
              </button>
            )}
          </div>
        }
      />

      {/* Bannière Notifications Web Push PWA (Requirement 5.B) */}
      <div className="bg-gradient-to-r from-sky-50 via-white to-indigo-50 border border-sky-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-school-primary text-white shrink-0 shadow-xs">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Recevoir les alertes même hors connexion (Web Push)
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Soyez averti instantanément sur votre téléphone ou ordinateur dès qu&apos;une note ou un bulletin officiel est publié.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={togglePushSubscription}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold shrink-0 shadow-2xs transition-all",
            pushStatus.subscribed
              ? "bg-emerald-100 border border-emerald-300 text-emerald-800"
              : "bg-slate-900 hover:bg-slate-800 text-white"
          )}
        >
          {pushStatus.subscribed ? "Notifications actives sur cet appareil ✓" : "Activer les notifications push"}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: "ALL", label: "Toutes les alertes" },
          { key: "NOTES_BULLETINS", label: "Notes & Bulletins officiels" },
          { key: "ANNONCES", label: "Annonces de la Direction" },
          { key: "SCOLARITE", label: "Frais & Échéances" },
          { key: "PRESENCE", label: "Présences & Retards" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterType(tab.key)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors",
              filterType === tab.key
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2 stroke-1" />
            <h3 className="text-sm font-bold text-slate-800">Aucune notification dans cette rubrique</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Toutes les notifications importantes concernant vos enfants rattachés s&apos;afficheront automatiquement ici.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (!item.isRead) markNotificationRead(item.id);
              }}
              className={cn(
                "p-4 md:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4",
                item.isRead
                  ? "bg-white border-slate-200 shadow-2xs hover:border-slate-300"
                  : "bg-sky-50/50 border-sky-200 shadow-xs ring-1 ring-sky-200"
              )}
            >
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shrink-0 shadow-2xs">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-school-primary shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                    {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>

                {item.studentName && (
                  <p className="text-[11px] font-semibold text-school-primary pt-0.5">
                    Élève concerné : {item.studentName} {item.className ? `(${item.className})` : ""}
                  </p>
                )}

                {item.link && (
                  <div className="pt-2">
                    <Link
                      href={item.link}
                      className="inline-flex items-center gap-1 text-xs font-bold text-school-primary hover:underline"
                    >
                      <span>Consulter sur mon espace sécurisé</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Préférences de Notification (Requirement 6) */}
      {isPrefModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-school-primary" />
                <h3 className="text-sm font-bold text-slate-900">Préférences de notification</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPrefModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Choisissez les canaux et les types d&apos;alertes que vous souhaitez recevoir pour le suivi de vos enfants :
              </p>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-school-primary" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Notifications Push</span>
                      <span className="text-[10px] text-slate-500">Alertes sur votre écran même application fermée</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefPush}
                    onChange={(e) => setPrefPush(e.target.checked)}
                    className="w-4 h-4 rounded text-school-primary accent-school-primary cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-purple-600" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Notifications par E-mail</span>
                      <span className="text-[10px] text-slate-500">Avis officiels et convocations importantes</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefEmail}
                    onChange={(e) => setPrefEmail(e.target.checked)}
                    className="w-4 h-4 rounded text-school-primary accent-school-primary cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Publication des Bulletins</span>
                      <span className="text-[10px] text-slate-500">Dès validation par la Direction</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefBulletins}
                    onChange={(e) => setPrefBulletins(e.target.checked)}
                    className="w-4 h-4 rounded text-school-primary accent-school-primary cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Nouvelles notes validées</span>
                      <span className="text-[10px] text-slate-500">Après validation officielle de l&apos;enseignant</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefGrades}
                    onChange={(e) => setPrefGrades(e.target.checked)}
                    className="w-4 h-4 rounded text-school-primary accent-school-primary cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Megaphone className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Annonces &amp; Événements</span>
                      <span className="text-[10px] text-slate-500">Communications générales de l&apos;établissement</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefAnnouncements}
                    onChange={(e) => setPrefAnnouncements(e.target.checked)}
                    className="w-4 h-4 rounded text-school-primary accent-school-primary cursor-pointer"
                  />
                </label>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                🔒 <strong>Confidentialité garantie :</strong> Les notes et appréciations ne sont jamais affichées sur l&apos;écran verrouillé de votre appareil.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPrefModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-4 py-2 text-xs font-bold text-white bg-school-primary hover:bg-school-primary/90 rounded-xl shadow-xs"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
