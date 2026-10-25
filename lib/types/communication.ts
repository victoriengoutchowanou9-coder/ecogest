/**
 * Types TypeScript du système unifié d'annonces, communications et notifications
 * Plateforme ECOGEST
 */

export type AnnouncementTargetAudience =
  | "ALL"
  | "ENSEIGNANTS"
  | "PARENTS"
  | "ELEVES"
  | "CLASS"
  | "PARENTS_CLASS";

export type AnnouncementPriority = "NORMAL" | "URGENT";

export type AnnouncementCategory =
  | "GENERAL"
  | "PEDAGOGIQUE"
  | "ADMINISTRATIF"
  | "FINANCIER"
  | "DISCIPLINE";

export interface SchoolAnnouncement {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  authorId?: string;
  authorName: string;
  authorRole: string;
  targetAudience: AnnouncementTargetAudience;
  targetClassId?: string;
  targetClassName?: string;
  priority: AnnouncementPriority;
  category: AnnouncementCategory;
  isPublished: boolean;
  publishedAt: string;
  readCount?: number;
  totalTargetRecipients?: number;
  isRead?: boolean;
}

export type NotificationType =
  | "ANNONCE"
  | "NOTE_PUBLIEE"
  | "BULLETIN_PUBLIE"
  | "SCOLARITE"
  | "PRESENCE"
  | "DOSSIER_SCOLAIRE"
  | "URGENCE";

export interface AppNotification {
  id: string;
  schoolId: string;
  userId: string;
  recipientRole?: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  sourceEventId?: string;
  studentId?: string;
  studentName?: string;
  classId?: string;
  className?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: PushSubscriptionKeys;
  userAgent?: string;
}

export interface NotificationPreferences {
  userId: string;
  schoolId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  notifyGrades: boolean;
  notifyBulletins: boolean;
  notifyAnnouncements: boolean;
  notifyAttendance: boolean;
  updatedAt?: string;
}

export interface ParentChildVerifiedLink {
  id: string;
  parentId: string;
  parentEmail?: string;
  parentPhone?: string;
  studentId: string;
  studentMatricule: string;
  studentName: string;
  classId: string;
  className: string;
  schoolId: string;
  schoolName: string;
  isPrimary: boolean;
  relationship: string;
  status: "VALIDATED" | "PENDING" | "REJECTED";
}
