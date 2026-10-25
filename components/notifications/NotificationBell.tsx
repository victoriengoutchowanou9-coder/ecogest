"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Award,
  FileSpreadsheet,
  AlertTriangle,
  CreditCard,
  Clock,
  Sparkles,
  ExternalLink,
  Smartphone,
  X,
} from "lucide-react";
import { useCommunicationStore } from "@/lib/communication-store";
import { NotificationType } from "@/lib/types/communication";
import { cn } from "@/lib/utils";

export const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    pushStatus,
    togglePushSubscription,
  } = useCommunicationStore();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermeture automatique au clic en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "NOTE_PUBLIEE":
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case "BULLETIN_PUBLIE":
        return <Award className="w-4 h-4 text-purple-600" />;
      case "URGENCE":
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case "SCOLARITE":
        return <CreditCard className="w-4 h-4 text-amber-600" />;
      case "PRESENCE":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "ANNONCE":
      default:
        return <Bell className="w-4 h-4 text-school-primary" />;
    }
  };

  const recentNotifications = notifications.slice(0, 6);

  return (
    <div className="relative" ref={containerRef}>
      {/* Bouton Cloche avec badge unread */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors touch-target focus:outline-none"
        aria-label="Centre de notifications"
        title="Centre de notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white shadow-xs animate-pulse">
            {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
          </span>
        )}
      </button>

      {/* Popover Menu Déroulant */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Notifications</span>
              {unreadNotificationsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-school-50 text-school-primary border border-school-200">
                  {unreadNotificationsCount} nouvelle(s)
                </span>
              )}
            </div>

            {unreadNotificationsCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="text-[11px] font-semibold text-school-primary hover:underline"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          {/* Web Push Banner Quick Toggle (Requirement 5.B) */}
          {pushStatus.supported && (
            <div className="px-3.5 py-2 bg-slate-100/60 border-b border-slate-100 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Smartphone className="w-3.5 h-3.5 text-school-primary" />
                <span>Notifications Web Push :</span>
              </div>
              <button
                type="button"
                onClick={togglePushSubscription}
                className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors",
                  pushStatus.subscribed
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-school-primary text-white hover:bg-school-primary/90"
                )}
              >
                {pushStatus.subscribed ? "Activées ✓" : "Activer"}
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
            {recentNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                Vous n&apos;avez aucune notification pour le moment.
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.isRead) markNotificationRead(notif.id);
                  }}
                  className={cn(
                    "p-3 text-left transition-colors flex items-start gap-3 cursor-pointer",
                    notif.isRead ? "bg-white hover:bg-slate-50/80" : "bg-sky-50/40 hover:bg-sky-50/70"
                  )}
                >
                  <div className="p-2 rounded-xl bg-white border border-slate-200 shrink-0 shadow-2xs mt-0.5">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-school-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
                      <span>{new Date(notif.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      {notif.link && (
                        <Link
                          href={notif.link}
                          onClick={() => setIsOpen(false)}
                          className="font-bold text-school-primary hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>Voir</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              href="/parent/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-school-primary hover:underline"
            >
              Historique complet des alertes &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
