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

const STORAGE_KEY_DOCUMENTS = "educogest_secretariat_documents_v1";
const STORAGE_KEY_EVENTS = "educogest_secretariat_events_v1";
const STORAGE_KEY_MESSAGES = "educogest_secretariat_messages_v1";
const STORAGE_KEY_STUDENTS = "educogest_censeur_students_v1";
const STORAGE_KEY_CLASSES = "educogest_school_classes_v2";
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

const INITIAL_DOCUMENTS: SchoolDocumentRecord[] = [
  {
    id: "doc-init-01",
    docType: "CERTIFICAT_SCOLARITE",
    title: "Certificat de Scolarité",
    referenceNumber: "CS-2026/0014",
    studentId: "std-01",
    studentName: "Jean-Eudes DOSSOU",
    matricule: "ECO-2026-0012",
    classId: "6e-a",
    className: "6ème A",
    academicYear: "2026 - 2027",
    issueDate: "2026-10-15",
    issuedBy: "Solange HOUENOU (Secrétariat)",
    recipient: "Caisse Nationale de Sécurité Sociale (CNSS)",
    notes: "Délivré pour dossier d'allocations familiales",
    status: "VALIDE",
    createdAt: "2026-10-15T09:30:00Z",
  },
  {
    id: "doc-init-02",
    docType: "ATTESTATION_FREQUENTATION",
    title: "Attestation de Fréquentation",
    referenceNumber: "AF-2026/0008",
    studentId: "std-02",
    studentName: "Marie-Josée AGBO",
    matricule: "ECO-2026-0015",
    classId: "6e-a",
    className: "6ème A",
    academicYear: "2026 - 2027",
    issueDate: "2026-10-14",
    issuedBy: "Solange HOUENOU (Secrétariat)",
    recipient: "Ambassade / Visa d'études",
    notes: "Demande formulée par le tuteur légal",
    status: "VALIDE",
    createdAt: "2026-10-14T11:00:00Z",
  },
  {
    id: "doc-init-03",
    docType: "CERTIFICAT_RADIATION",
    title: "Certificat de Radiation",
    referenceNumber: "CR-2026/0002",
    studentId: "std-09",
    studentName: "Gilles KPATINVO",
    matricule: "ECO-2026-0055",
    classId: "5e-a",
    className: "5ème A",
    academicYear: "2026 - 2027",
    issueDate: "2026-10-10",
    issuedBy: "Solange HOUENOU (Secrétariat)",
    recipient: "CEG 1 Parakou (Établissement d'accueil)",
    notes: "Mutation professionnelle des parents à Parakou",
    status: "VALIDE",
    createdAt: "2026-10-10T14:20:00Z",
  },
];

const INITIAL_EVENTS: AdminCalendarEvent[] = [
  {
    id: "evt-01",
    title: "Assemblée Générale de Rentrée avec l'APE",
    type: "REUNION",
    date: "2026-10-24",
    time: "09:00",
    location: "Salle polyvalente",
    targetAudience: "PARENTS",
    description: "Présentation des orientations pédagogiques, du règlement intérieur et validation des cotisations APE.",
    createdBy: "Direction & Secrétariat",
    status: "PROGRAMME",
  },
  {
    id: "evt-02",
    title: "Conseil Pédagogique de Mi-Trimestre",
    type: "REUNION",
    date: "2026-11-06",
    time: "15:00",
    location: "Salle des professeurs",
    targetAudience: "ENSEIGNANTS",
    description: "Évaluation de la progression des programmes et préparation des devoirs surveillés.",
    createdBy: "Censeur & Secrétariat",
    status: "PROGRAMME",
  },
  {
    id: "evt-03",
    title: "Congés de Toussaint / Détente 1er Trimestre",
    type: "CONGE",
    date: "2026-10-30",
    location: "Établissement",
    targetAudience: "TOUS",
    description: "Suspension des cours selon le calendrier officiel du Ministère.",
    createdBy: "Secrétariat Pédagogique",
    status: "PROGRAMME",
  },
];

const INITIAL_MESSAGES: SecretariatMessage[] = [
  {
    id: "msg-01",
    recipientType: "PARENTS",
    targetName: "Parents de 6ème A & 5ème A",
    subject: "Rappel : Port de la tenue scolaire réglementaire et ponctualité",
    content: "Chers parents, nous vous rappelons que les cours débutent précisément à 07h45. Le port de l'uniforme officiel complet est strictement obligatoire.",
    channel: "SMS",
    sentAt: "2026-10-16 08:30",
    sentBy: "Solange HOUENOU (Secrétariat)",
    status: "ENVOYE",
  },
  {
    id: "msg-02",
    recipientType: "ENSEIGNANTS",
    targetName: "Corps Enseignant Secondaire",
    subject: "Transmission des fiches de progression et des dates d'évaluations",
    content: "Prière déposer au Secrétariat pédagogique vos fiches de progression mensuelle avant le vendredi 23 octobre.",
    channel: "NOTIFICATION_APP",
    sentAt: "2026-10-15 14:00",
    sentBy: "Secrétariat Pédagogique",
    status: "ENVOYE",
  },
];

export function useSecretariatStore() {
  const [documents, setDocuments] = useState<SchoolDocumentRecord[]>(() =>
    safeGetStorage(STORAGE_KEY_DOCUMENTS, INITIAL_DOCUMENTS)
  );

  const [events, setEvents] = useState<AdminCalendarEvent[]>(() =>
    safeGetStorage(STORAGE_KEY_EVENTS, INITIAL_EVENTS)
  );

  const [messages, setMessages] = useState<SecretariatMessage[]>(() =>
    safeGetStorage(STORAGE_KEY_MESSAGES, INITIAL_MESSAGES)
  );

  const [students, setStudents] = useState<StudentProfile[]>(() =>
    safeGetStorage(STORAGE_KEY_STUDENTS, MOCK_BULLETIN_STUDENTS)
  );

  const [classrooms, setClassrooms] = useState<ClassRoom[]>(() =>
    safeGetStorage(STORAGE_KEY_CLASSES, MOCK_CLASSROOMS)
  );

  useEffect(() => {
    const handleSync = () => {
      setDocuments(safeGetStorage(STORAGE_KEY_DOCUMENTS, INITIAL_DOCUMENTS));
      setEvents(safeGetStorage(STORAGE_KEY_EVENTS, INITIAL_EVENTS));
      setMessages(safeGetStorage(STORAGE_KEY_MESSAGES, INITIAL_MESSAGES));
      setStudents(safeGetStorage(STORAGE_KEY_STUDENTS, MOCK_BULLETIN_STUDENTS));
      setClassrooms(safeGetStorage(STORAGE_KEY_CLASSES, MOCK_CLASSROOMS));
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
        safeSetStorage(STORAGE_KEY_STUDENTS, next);
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
        safeSetStorage(STORAGE_KEY_STUDENTS, next);
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
        safeSetStorage(STORAGE_KEY_STUDENTS, next);
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
        safeSetStorage(STORAGE_KEY_STUDENTS, next);
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
        safeSetStorage(STORAGE_KEY_DOCUMENTS, next);
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
        safeSetStorage(STORAGE_KEY_EVENTS, next);
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
        safeSetStorage(STORAGE_KEY_MESSAGES, next);
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
