"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  SchoolAnnouncement,
  AppNotification,
  NotificationPreferences,
  AnnouncementTargetAudience,
  AnnouncementPriority,
  AnnouncementCategory,
} from "./types/communication";
import { useAuthStore } from "./auth-store";
import { isPushNotificationSupported, registerPushSubscription, unregisterPushSubscription, getExistingPushSubscription } from "./push-client";

const ANNOUNCEMENTS_STORAGE_KEY = "ecogest_announcements_cache_v1";
const NOTIFICATIONS_STORAGE_KEY = "ecogest_notifications_cache_v1";

const DEFAULT_ANNOUNCEMENTS: SchoolAnnouncement[] = [
  {
    id: "ann-init-1",
    schoolId: "default-school",
    title: "Bienvenue sur l'Espace Numérique ECOGEST",
    content: "L'année académique 2026-2027 est officiellement ouverte. Retrouvez ici toutes les informations, convocations et actualités de l'établissement.",
    authorName: "Direction Générale",
    authorRole: "directeur",
    targetAudience: "ALL",
    priority: "NORMAL",
    category: "GENERAL",
    isPublished: true,
    publishedAt: new Date().toISOString(),
    readCount: 12,
    isRead: false,
  },
];

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-init-1",
    schoolId: "default-school",
    userId: "user-default",
    title: "Rentrée des classes & Calendrier officiel",
    message: "Le calendrier académique du 1er trimestre 2026-2027 est disponible pour consultation.",
    type: "ANNONCE",
    link: "/directeur/annonces",
    isRead: false,
    createdAt: new Date().toISOString(),
  },
];

export function useCommunicationStore() {
  const { user: currentUser } = useAuthStore();

  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>(() => {
    if (typeof window === "undefined") return DEFAULT_ANNOUNCEMENTS;
    try {
      const stored = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_ANNOUNCEMENTS;
    } catch {
      return DEFAULT_ANNOUNCEMENTS;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS;
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  const [pushStatus, setPushStatus] = useState<{
    supported: boolean;
    subscribed: boolean;
    configured: boolean;
    publicKey?: string;
  }>({
    supported: false,
    subscribed: false,
    configured: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Synchronisation avec l'API serveur
  const refreshData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);

    try {
      // 1. Annonces
      const annRes = await fetch("/api/announcements").catch(() => null);
      if (annRes && annRes.ok) {
        const annJson = await annRes.json();
        if (annJson.success && Array.isArray(annJson.announcements)) {
          setAnnouncements(annJson.announcements);
          try {
            localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(annJson.announcements));
          } catch {}
        }
      }

      // 2. Notifications
      const notifRes = await fetch("/api/notifications").catch(() => null);
      if (notifRes && notifRes.ok) {
        const notifJson = await notifRes.json();
        if (notifJson.success && Array.isArray(notifJson.notifications)) {
          setNotifications(notifJson.notifications);
          try {
            localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifJson.notifications));
          } catch {}
        }
      }

      // 3. Statut Push
      const supported = isPushNotificationSupported();
      let configured = false;
      let publicKey = "";
      let subscribed = false;

      if (supported) {
        const pushRes = await fetch("/api/notifications/push").catch(() => null);
        if (pushRes && pushRes.ok) {
          const pushJson = await pushRes.json();
          configured = Boolean(pushJson.configured);
          publicKey = pushJson.publicKey || "";
        }
        const sub = await getExistingPushSubscription();
        subscribed = Boolean(sub);
      }

      setPushStatus({ supported, subscribed, configured, publicKey });
    } catch (e) {
      console.warn("[CommunicationStore] Erreur refresh:", e);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Décompte des notifications non lues
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Publication d'une annonce (Direction / Administration)
  const publishAnnouncement = useCallback(
    async (params: {
      title: string;
      content: string;
      targetAudience: AnnouncementTargetAudience;
      targetClassId?: string;
      targetClassName?: string;
      priority?: AnnouncementPriority;
      category?: AnnouncementCategory;
    }) => {
      try {
        const res = await fetch("/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Échec de publication de l'annonce");
        }

        const newAnn: SchoolAnnouncement = data.announcement;
        setAnnouncements((prev) => [newAnn, ...prev]);

        // Créer aussi une notification locale immédiate pour l'auteur
        const localNotif: AppNotification = {
          id: `notif-${Date.now()}`,
          schoolId: newAnn.schoolId,
          userId: currentUser?.id || "me",
          title: `Annonce publiée : ${newAnn.title}`,
          message: `Diffusée avec succès aux destinataires (${newAnn.targetAudience}).`,
          type: "ANNONCE",
          link: "/directeur/annonces",
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [localNotif, ...prev]);

        return { success: true, announcement: newAnn };
      } catch (err: any) {
        // Mode déconnecté / fallback
        const offlineAnn: SchoolAnnouncement = {
          id: `ann-local-${Date.now()}`,
          schoolId: currentUser?.schoolId || "default-school",
          title: params.title,
          content: params.content,
          authorName: currentUser?.fullName || "La Direction",
          authorRole: currentUser?.role || "directeur",
          targetAudience: params.targetAudience,
          targetClassId: params.targetClassId,
          targetClassName: params.targetClassName,
          priority: params.priority || "NORMAL",
          category: params.category || "GENERAL",
          isPublished: true,
          publishedAt: new Date().toISOString(),
          readCount: 0,
          isRead: true,
        };
        setAnnouncements((prev) => {
          const next = [offlineAnn, ...prev];
          try {
            localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
        return { success: true, announcement: offlineAnn, offline: true };
      }
    },
    [currentUser]
  );

  // Marquer une annonce comme lue
  const markAnnouncementRead = useCallback(async (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true, readCount: (a.readCount || 0) + 1 } : a))
    );
    try {
      await fetch(`/api/announcements/${id}/read`, { method: "POST" });
    } catch {}
  }, []);

  // Marquer une notification comme lue
  const markNotificationRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
    );
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {}
  }, []);

  // Marquer toutes les notifications comme lues
  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
    );
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
    } catch {}
  }, []);

  // Déclencher une notification de publication officielle d'une note
  const notifyGradePublished = useCallback(
    async (params: {
      studentId: string;
      studentName: string;
      subjectName: string;
      classId: string;
      periodId: string;
    }) => {
      const sourceEventId = `grade-pub-${params.studentId}-${params.periodId}-${params.subjectName.toLowerCase().replace(/\s+/g, "_")}`;
      const title = `Nouveau résultat scolaire disponible`;
      const message = `Une note de ${params.subjectName} a été validée pour ${params.studentName}. Consultez le détail sécurisé sur votre espace.`;

      // Ajout optimiste in-app
      const localNotif: AppNotification = {
        id: `notif-grade-${Date.now()}`,
        schoolId: currentUser?.schoolId || "default-school",
        userId: "parent",
        recipientRole: "parent",
        title,
        message,
        type: "NOTE_PUBLIEE",
        link: "/parent/notes",
        sourceEventId,
        studentId: params.studentId,
        studentName: params.studentName,
        classId: params.classId,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      setNotifications((prev) => {
        if (prev.some((n) => n.sourceEventId === sourceEventId)) return prev;
        const next = [localNotif, ...prev];
        try {
          localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });

      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "NOTE_PUBLIEE",
            title,
            message,
            link: "/parent/notes",
            studentId: params.studentId,
            studentName: params.studentName,
            classId: params.classId,
            periodId: params.periodId,
            sourceEventId,
          }),
        });
      } catch {}
    },
    [currentUser]
  );

  // Déclencher une notification de publication de bulletin
  const notifyBulletinPublished = useCallback(
    async (params: {
      studentId?: string;
      studentName?: string;
      className: string;
      classId: string;
      periodId: string;
      periodName?: string;
    }) => {
      const pName = params.periodName || params.periodId;
      const sourceEventId = `bulletin-pub-${params.classId}-${params.studentId || "class"}-${params.periodId}`;
      const title = `Bulletin officiel ${pName} publié`;
      const message = params.studentName
        ? `Le bulletin officiel du ${pName} de ${params.studentName} (${params.className}) est disponible.`
        : `Les bulletins officiels du ${pName} de la classe ${params.className} sont officiellement publiés.`;

      const localNotif: AppNotification = {
        id: `notif-blt-${Date.now()}`,
        schoolId: currentUser?.schoolId || "default-school",
        userId: "parent",
        recipientRole: "parent",
        title,
        message,
        type: "BULLETIN_PUBLIE",
        link: "/parent/notes",
        sourceEventId,
        studentId: params.studentId,
        studentName: params.studentName,
        classId: params.classId,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      setNotifications((prev) => {
        if (prev.some((n) => n.sourceEventId === sourceEventId)) return prev;
        const next = [localNotif, ...prev];
        try {
          localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });

      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "BULLETIN_PUBLIE",
            title,
            message,
            link: "/parent/notes",
            studentId: params.studentId,
            studentName: params.studentName,
            classId: params.classId,
            periodId: params.periodId,
            sourceEventId,
          }),
        });
      } catch {}
    },
    [currentUser]
  );

  // Basculer l'abonnement push
  const togglePushSubscription = useCallback(async () => {
    if (pushStatus.subscribed) {
      const ok = await unregisterPushSubscription();
      if (ok) {
        setPushStatus((prev) => ({ ...prev, subscribed: false }));
        return { success: true, subscribed: false };
      }
      return { success: false, error: "Échec de désactivation" };
    } else {
      const res = await registerPushSubscription(pushStatus.publicKey);
      if (res.success) {
        setPushStatus((prev) => ({ ...prev, subscribed: true }));
        return { success: true, subscribed: true };
      }
      return { success: false, error: res.error };
    }
  }, [pushStatus]);

  return {
    announcements,
    notifications,
    unreadNotificationsCount,
    pushStatus,
    isLoading,
    refreshData,
    publishAnnouncement,
    markAnnouncementRead,
    markNotificationRead,
    markAllNotificationsRead,
    notifyGradePublished,
    notifyBulletinPublished,
    togglePushSubscription,
  };
}
