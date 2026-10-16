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

const MOCK_NOTIFICATIONS: SchoolNotification[] = [];

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
        {filtered.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-slate-200">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2 stroke-1" />
            <h3 className="text-sm font-bold text-slate-800">Aucune notification pour le moment</h3>
            <p className="text-xs text-slate-400 mt-1">Vous recevrez ici les alertes de bulletins, échéances et convocations.</p>
          </div>
        ) : (
          filtered.map((item) => (
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
          ))
        )}
      </div>
    </div>
  );
}
