"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { StudentProfile, ClassRoom } from "./types/bulletin";
import { MOCK_BULLETIN_STUDENTS, MOCK_CLASSROOMS } from "./mock-bulletin-db";

export type DocumentType =
  | "CERTIFICAT_SCOLARITE"
  | "ATTESTATION_FREQUENTATION"
  | "CERTIFICAT_RADIATION"
  | "FICHE_INSCRIPTION"
  | "FICHE_INDIVIDUELLE"
  | "LISTE_ELEVES";

export interface SchoolDocumentRecord {
  id: string;
  docType: DocumentType;
  title: string;
  referenceNumber: string;
  studentId?: string;
  studentName?: string;
  matricule?: string;
  classId?: string;
  className?: string;
  academicYear: string;
  issueDate: string;
  issuedBy: string;
  recipient?: string;
  notes?: string;
  status: "VALIDE" | "ARCHIVE";
  createdAt: string;
}

export interface AdminCalendarEvent {
  id: string;
  title: string;
  type: "REUNION" | "EVENEMENT" | "CONVOCATION" | "EXAMEN" | "CONGE";
  date: string;
  time?: string;
  location: string;
  targetAudience: "TOUS" | "PARENTS" | "ENSEIGNANTS" | "ADMINISTRATION" | "CLASSES";
  targetClasses?: string[];
  description: string;
  createdBy: string;
  status: "PROGRAMME" | "TERMINE" | "ANNULE";
}

export interface SecretariatMessage {
  id: string;
  recipientType: "PARENTS" | "ENSEIGNANTS" | "CLASSE" | "INDIVIDUEL";
  targetName: string;
  subject: string;
  content: string;
  channel: "SMS" | "EMAIL" | "NOTIFICATION_APP" | "AFFICHAGE";
  sentAt: string;
  sentBy: string;
  status: "ENVOYE" | "EN_ATTENTE" | "ARCHIVE";
}

export interface ParentRecord {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  profession?: string;
  address?: string;
  studentIds: string[];
  childrenNames: string[];
  accessStatus: "ACTIF" | "EN_ATTENTE" | "SUSPENDU";
}

import { getScopedStorageKey } from "./school-context";

const getDocumentsKey = () => getScopedStorageKey("educogest_secretariat_documents_v2");
const getEventsKey = () => getScopedStorageKey("educogest_secretariat_events_v2");
const getMessagesKey = () => getScopedStorageKey("educogest_secretariat_messages_v2");
const getStudentsKey = () => getScopedStorageKey("educogest_censeur_students_v2");
const getClassesKey = () => getScopedStorageKey("educogest_school_classes_v3");

const STORAGE_EVENT = "educogest_secretariat_storage_update";
const SHARED_STORAGE_EVENT = "ecogest_shared_data_update";

function safeGetStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function safeSetStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(STORAGE_EVENT));
    window.dispatchEvent(new Event(SHARED_STORAGE_EVENT));
    window.dispatchEvent(new Event("educogest_censeur_storage_update"));
  } catch (e) {
    console.error("Storage error in secretariat store:", e);
  }
}

const INITIAL_DOCUMENTS: SchoolDocumentRecord[] = [];
const INITIAL_EVENTS: AdminCalendarEvent[] = [];
const INITIAL_MESSAGES: SecretariatMessage[] = [];

export function useSecretariatStore() {
  const [documents, setDocuments] = useState<SchoolDocumentRecord[]>(() =>
    safeGetStorage(getDocumentsKey(), INITIAL_DOCUMENTS)
  );

  const [events, setEvents] = useState<AdminCalendarEvent[]>(() =>
    safeGetStorage(getEventsKey(), INITIAL_EVENTS)
  );

  const [messages, setMessages] = useState<SecretariatMessage[]>(() =>
    safeGetStorage(getMessagesKey(), INITIAL_MESSAGES)
  );

  const [students, setStudents] = useState<StudentProfile[]>(() =>
    safeGetStorage(getStudentsKey(), [])
  );

  const [classrooms, setClassrooms] = useState<ClassRoom[]>(() => {
    const stored = safeGetStorage<ClassRoom[]>(getClassesKey(), []);
    return stored.length > 0 ? stored : MOCK_CLASSROOMS;
  });

  useEffect(() => {
    const handleSync = () => {
      setDocuments(safeGetStorage(getDocumentsKey(), INITIAL_DOCUMENTS));
      setEvents(safeGetStorage(getEventsKey(), INITIAL_EVENTS));
      setMessages(safeGetStorage(getMessagesKey(), INITIAL_MESSAGES));
      setStudents(safeGetStorage(getStudentsKey(), []));
      const storedCls = safeGetStorage<ClassRoom[]>(getClassesKey(), []);
      setClassrooms(storedCls.length > 0 ? storedCls : MOCK_CLASSROOMS);
    };

    window.addEventListener(STORAGE_EVENT, handleSync);
    window.addEventListener(SHARED_STORAGE_EVENT, handleSync);
    window.addEventListener("educogest_censeur_storage_update", handleSync);
    window.addEventListener("educogest_bulletin_storage_update", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener(STORAGE_EVENT, handleSync);
      window.removeEventListener(SHARED_STORAGE_EVENT, handleSync);
      window.removeEventListener("educogest_censeur_storage_update", handleSync);
      window.removeEventListener("educogest_bulletin_storage_update", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // 1. Student administrative registration
  const registerStudent = useCallback(
    (
      studentData: Omit<StudentProfile, "id" | "matricule" | "educMasterNumber"> & {
        id?: string;
        matricule?: string;
        educMasterNumber?: string;
      },
      author: string = "Secrétariat Pédagogique"
    ) => {
      const year = new Date().getFullYear();
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const newStudent: StudentProfile = {
        ...studentData,
        id: studentData.id || `std-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        matricule: studentData.matricule || `ECO-${year}-${randomCode}`,
        educMasterNumber: studentData.educMasterNumber || `EM-BN-${Math.floor(100000 + Math.random() * 900000)}`,
        status: studentData.status || "ACTIF",
      };

      setStudents((prev) => {
        const next = [newStudent, ...prev];
        safeSetStorage(getStudentsKey(), next);
        return next;
      });
      return newStudent;
    },
    []
  );

  // 2. Update authorized student info (civil status, contacts, address)
  const updateStudentInfo = useCallback(
    (studentId: string, updates: Partial<StudentProfile>, author: string = "Secrétariat Pédagogique") => {
      setStudents((prev) => {
        const next = prev.map((s) => (s.id === studentId ? { ...s, ...updates } : s));
        safeSetStorage(getStudentsKey(), next);
        return next;
      });
    },
    []
  );

  // 3. Reassign student class
  const changeStudentClass = useCallback(
    (studentId: string, newClassId: string, newClassName: string, author: string = "Secrétariat Pédagogique") => {
      setStudents((prev) => {
        const next = prev.map((s) =>
          s.id === studentId ? { ...s, classId: newClassId, className: newClassName } : s
        );
        safeSetStorage(getStudentsKey(), next);
        return next;
      });
    },
    []
  );

  // 4. Update student administrative status (ACTIF, TRANSFERE, DESISTE, EXCLU)
  const updateStudentStatus = useCallback(
    (studentId: string, newStatus: StudentProfile["status"], reason?: string, author: string = "Secrétariat Pédagogique") => {
      setStudents((prev) => {
        const next = prev.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s));
        safeSetStorage(getStudentsKey(), next);
        return next;
      });
    },
    []
  );

  // 5. Generate and register an official school document
  const generateDocument = useCallback(
    (
      data: Omit<SchoolDocumentRecord, "id" | "createdAt" | "status" | "referenceNumber"> & {
        referenceNumber?: string;
      }
    ) => {
      const year = new Date().getFullYear();
      const prefixMap: Record<DocumentType, string> = {
        CERTIFICAT_SCOLARITE: "CS",
        ATTESTATION_FREQUENTATION: "AF",
        CERTIFICAT_RADIATION: "CR",
        FICHE_INSCRIPTION: "FI",
        FICHE_INDIVIDUELLE: "FIE",
        LISTE_ELEVES: "LE",
      };
      const prefix = prefixMap[data.docType] || "DOC";
      const randomNum = Math.floor(100 + Math.random() * 900);
      const refNum = data.referenceNumber || `${prefix}-${year}/${randomNum}`;

      const newDoc: SchoolDocumentRecord = {
        ...data,
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        referenceNumber: refNum,
        status: "VALIDE",
        createdAt: new Date().toISOString(),
      };

      setDocuments((prev) => {
        const next = [newDoc, ...prev];
        safeSetStorage(getDocumentsKey(), next);
        return next;
      });
      return newDoc;
    },
    []
  );

  // 6. Agenda & Events
  const addEvent = useCallback(
    (eventData: Omit<AdminCalendarEvent, "id" | "status">) => {
      const newEvent: AdminCalendarEvent = {
        ...eventData,
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        status: "PROGRAMME",
      };

      setEvents((prev) => {
        const next = [newEvent, ...prev];
        safeSetStorage(getEventsKey(), next);
        return next;
      });
      return newEvent;
    },
    []
  );

  // 7. Messages & Communications
  const sendMessage = useCallback(
    (messageData: Omit<SecretariatMessage, "id" | "sentAt" | "status">) => {
      const newMsg: SecretariatMessage = {
        ...messageData,
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sentAt: `${new Date().toLocaleDateString("fr-FR")} ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
        status: "ENVOYE",
      };

      setMessages((prev) => {
        const next = [newMsg, ...prev];
        safeSetStorage(getMessagesKey(), next);
        return next;
      });
      return newMsg;
    },
    []
  );

  // Derived: Unique parents compiled from students list
  const parentsList = useMemo(() => {
    const parentMap = new Map<string, ParentRecord>();
    students.forEach((st) => {
      const pName = (st.parentName || "").trim();
      if (!pName) return;
      const pPhone = (st.parentPhone || "").trim();
      const pEmail = (st.parentEmail || "").trim();
      const key = `${pName.toLowerCase()}_${pPhone}`;

      if (!parentMap.has(key)) {
        parentMap.set(key, {
          id: `par-${key.replace(/[^a-z0-9]/g, "-")}`,
          fullName: pName,
          phone: pPhone || "+229 ",
          email: pEmail,
          studentIds: [st.id],
          childrenNames: [`${st.lastName} ${st.firstName} (${st.className})`],
          accessStatus: "ACTIF",
        });
      } else {
        const existing = parentMap.get(key)!;
        if (!existing.studentIds.includes(st.id)) {
          existing.studentIds.push(st.id);
          existing.childrenNames.push(`${st.lastName} ${st.firstName} (${st.className})`);
        }
      }
    });
    return Array.from(parentMap.values());
  }, [students]);

  // Derived statistics for Secretariat Dashboard
  const stats = useMemo(() => {
    const totalEnrolled = students.length;
    const activeStudents = students.filter((s) => !s.status || s.status === "ACTIF" || s.status === "READMIS").length;
    const newStudents = students.filter((s) => s.matricule?.includes("2026")).length;
    const transferredStudents = students.filter((s) => s.status === "TRANSFERE").length;
    const droppedOutStudents = students.filter((s) => s.status === "DESISTE" || s.status === "EXCLU" || s.status === "ANCIEN").length;
    const boysCount = students.filter((s) => s.gender === "M").length;
    const girlsCount = students.filter((s) => s.gender === "F").length;
    const pendingDocuments = documents.filter((d) => d.status === "VALIDE").length;

    // Count by class
    const byClass: Record<string, { total: number; boys: number; girls: number; name: string }> = {};
    classrooms.forEach((c) => {
      byClass[c.id] = { total: 0, boys: 0, girls: 0, name: c.name };
    });
    students.forEach((st) => {
      if (byClass[st.classId]) {
        byClass[st.classId].total += 1;
        if (st.gender === "M") byClass[st.classId].boys += 1;
        else byClass[st.classId].girls += 1;
      }
    });

    return {
      totalEnrolled,
      activeStudents,
      newStudents,
      transferredStudents,
      droppedOutStudents,
      boysCount,
      girlsCount,
      pendingDocuments,
      byClass,
    };
  }, [students, documents, classrooms]);

  return {
    documents,
    events,
    messages,
    students,
    classrooms,
    parentsList,
    stats,
    registerStudent,
    updateStudentInfo,
    changeStudentClass,
    updateStudentStatus,
    generateDocument,
    addEvent,
    sendMessage,
  };
}
