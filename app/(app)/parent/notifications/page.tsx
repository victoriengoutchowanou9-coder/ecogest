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
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

interface SchoolNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: "BULLETIN" | "TUITION" | "ATTENDANCE" | "EVENT";
  isRead: boolean;
  link?: string;
  linkText?: string;
}

const MOCK_NOTIFICATIONS: SchoolNotification[] = [
  {
    id: "notif-1",
    title: "Bulletin du 1er Trimestre disponible",
    message: "Le bulletin officiel de notes de Koffi ADANHOUN (3ème A) a été validé et signé par la direction. Vous pouvez le consulter et l'imprimer.",
    date: "Il y a 2 heures",
    type: "BULLETIN",
    isRead: false,
    link: "/parent/notes",
    linkText: "Voir le bulletin",
  },
  {
    id: "notif-2",
    title: "Échéance Tranche 2 de scolarité",
    message: "Rappel : la 2ème tranche de scolarité de 70 000 FCFA pour Amina ADANHOUN arrive à échéance le 15 octobre 2026. Paiement disponible en ligne via Moov Money / MTN MoMo.",
    date: "Hier à 14h30",
    type: "TUITION",
    isRead: false,
    link: "/parent/scolarite",
    linkText: "Payer la scolarité",
  },
  {
    id: "notif-3",
    title: "Retard signalé en classe de Français",
    message: "Koffi a été enregistré avec un retard de 15 minutes le Mardi 12/10 à 07h15.",
    date: "Le 12/10/2026",
    type: "ATTENDANCE",
    isRead: true,
    link: "/parent/presences",
    linkText: "Voir les présences",
  },
  {
    id: "notif-4",
    title: "Assemblée Générale de l'Association des Parents d'Élèves (APE)",
    message: "L'administration et le bureau de l'APE convient tous les parents d'élèves à la grande assemblée de rentrée ce Samedi 18 Octobre à 09h00 dans le Grand Hall.",
    date: "Le 10/10/2026",
    type: "EVENT",
    isRead: true,
  },
];

export default function ParentNotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filterType, setFilterType] = useState<string>("ALL");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: SchoolNotification["type"]) => {
    switch (type) {
      case "BULLETIN":
        return <Award className="w-5 h-5 text-indigo-600" />;
      case "TUITION":
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case "ATTENDANCE":
        return <Clock className="w-5 h-5 text-amber-600" />;
      case "EVENT":
        return <Calendar className="w-5 h-5 text-purple-600" />;
    }
  };

  const filtered = notifications.filter((n) => {
    if (filterType === "ALL") return true;
    return n.type === filterType;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centre de Notifications"
        subtitle={`Restez informé des notes, alertes de scolarité et événements scolaires &middot; ${unreadCount} non lue(s)`}
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Notifications" }]}
        actions={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold touch-target transition-colors"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Tout marquer comme lu</span>
            </button>
          ) : undefined
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: "ALL", label: "Toutes" },
          { key: "BULLETIN", label: "Bulletins & Notes" },
          { key: "TUITION", label: "Scolarité" },
          { key: "ATTENDANCE", label: "Présences" },
          { key: "EVENT", label: "Événements" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterType(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
              filterType === tab.key
                ? "bg-school-primary text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-4 md:p-5 rounded-2xl border transition-all ${
              item.isRead
                ? "bg-white border-slate-200 shadow-2xs"
                : "bg-school-50/40 border-school-200 shadow-xs ring-1 ring-school-200"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shrink-0 shadow-2xs">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <span className="text-[11px] font-medium text-slate-400">{item.date}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                {item.link && (
                  <div className="pt-2">
                    <Link
                      href={item.link}
                      className="inline-flex items-center gap-1 text-xs font-bold text-school-primary hover:underline"
                    >
                      <span>{item.linkText || "Voir les détails"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
