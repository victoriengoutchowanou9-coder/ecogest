"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { StudentProfile, ClassRoom, DisciplineIncident } from "./types/bulletin";
import { MOCK_BULLETIN_STUDENTS, MOCK_CLASSROOMS } from "./mock-bulletin-db";
import { CenseurAttendanceItem, INITIAL_ATTENDANCE_ITEMS } from "./censeur-store";
import { INITIAL_DISCIPLINE_INCIDENTS } from "./discipline-store";

export interface SanctionRecord {
  id: string;
  studentId: string;
  studentName: string;
  matricule: string;
  className: string;
  incidentId?: string;
  type:
    | "AVERTISSEMENT"
    | "OBSERVATION"
    | "CONVOCATION_PARENT"
    | "RETENUE"
    | "EXCLUSION_TEMPORAIRE"
    | "TRAVAIL_DISCIPLINAIRE";
  description: string;
  startDate: string;
  endDate?: string;
  duration?: string; // ex: "2 heures", "3 jours"
  requiresDirectorApproval: boolean;
  directorApprovalStatus: "NON_REQUISE" | "EN_ATTENTE" | "APPROUVEE" | "REJETEE";
  directorNote?: string;
  approvedBy?: string;
  approvedAt?: string;
  issuedBy: string;
  issuedAt: string;
  status: "EN_COURS" | "PURGEE" | "ANNULEE";
}

export interface SurveillanceSlot {
  id: string;
  zone: "ENTREE" | "SORTIE" | "RECREATION" | "COULOIRS" | "COUR" | "EXAMEN";
  dayOfWeek: "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi";
  timeSlot: string; // ex: "07:30 - 08:00"
  surveillantName: string;
  surveillantPhone?: string;
  notes?: string;
  status: "ACTIF" | "REMPLACE";
}

export interface SchoolActivityRecord {
  id: string;
  type: "SORTIE_SCOLAIRE" | "ACTIVITE_EXTRASCOLAIRE" | "MANIFESTATION" | "DEPLACEMENT_ELEVES";
  title: string;
  classNames: string[];
  date: string;
  timeSlot: string;
  destination: string;
  responsiblePerson: string;
  authorizedStudentCount: number;
  parentalAuthorizationRequired: boolean;
  status: "PLANIFIEE" | "EN_COURS" | "TERMINEE" | "ANNULEE";
  notes?: string;
}

export interface ParentDisciplineMessage {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  parentName: string;
  parentPhone: string;
  type: "DEMANDE_JUSTIFICATIF" | "CONVOCATION" | "SIGNALEMENT_INCIDENT" | "AVIS_RETARD";
  subject: string;
  message: string;
  sentAt: string;
  sentBy: string;
  parentResponse?: string;
  responseReceivedAt?: string;
  status: "ENVOYE" | "REPONDU" | "EN_ATTENTE_REPONSE";
}

export interface ExceptionalExitRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  matricule: string;
  exitTime: string;
  expectedReturnTime?: string;
  reason: string;
  authorizedBy: string;
  parentNotified: boolean;
  accompanyingPerson?: string;
  date: string;
}

import { getScopedStorageKey } from "./school-context";

const getAttendanceKey = () => getScopedStorageKey("educogest_censeur_attendance_v2");
const getDisciplineKey = () => getScopedStorageKey("educogest_discipline_incidents_v3");
const getSanctionsKey = () => getScopedStorageKey("educogest_surveillant_sanctions_v2");
const getSlotsKey = () => getScopedStorageKey("educogest_surveillant_slots_v2");
const getActivitiesKey = () => getScopedStorageKey("educogest_surveillant_activities_v2");
const getMessagesKey = () => getScopedStorageKey("educogest_surveillant_parent_comms_v2");
const getExitsKey = () => getScopedStorageKey("educogest_surveillant_exits_v2");
const getStudentsKey = () => getScopedStorageKey("educogest_censeur_students_v2");
const getClassesKey = () => getScopedStorageKey("educogest_school_classes_v3");

const STORAGE_EVENT = "educogest_surveillant_storage_update";
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
    window.dispatchEvent(new Event("educogest_discipline_storage_update"));
    window.dispatchEvent(new Event("educogest_censeur_storage_update"));
  } catch (e) {
    console.error("Storage error in surveillant store:", e);
  }
}

const INITIAL_SANCTIONS: SanctionRecord[] = [];
const INITIAL_SLOTS: SurveillanceSlot[] = [];
const INITIAL_ACTIVITIES: SchoolActivityRecord[] = [];
const INITIAL_PARENT_COMMS: ParentDisciplineMessage[] = [];
const INITIAL_EXITS: ExceptionalExitRecord[] = [];

export function useSurveillantStore() {
  const [attendance, setAttendance] = useState<CenseurAttendanceItem[]>(() =>
    safeGetStorage(getAttendanceKey(), [])
  );

  const [incidents, setIncidents] = useState<DisciplineIncident[]>(() =>
    safeGetStorage(getDisciplineKey(), [])
  );

  const [sanctions, setSanctions] = useState<SanctionRecord[]>(() =>
    safeGetStorage(getSanctionsKey(), INITIAL_SANCTIONS)
  );

  const [slots, setSlots] = useState<SurveillanceSlot[]>(() =>
    safeGetStorage(getSlotsKey(), INITIAL_SLOTS)
  );

  const [activities, setActivities] = useState<SchoolActivityRecord[]>(() =>
    safeGetStorage(getActivitiesKey(), INITIAL_ACTIVITIES)
  );

  const [parentComms, setParentComms] = useState<ParentDisciplineMessage[]>(() =>
    safeGetStorage(getMessagesKey(), INITIAL_PARENT_COMMS)
  );

  const [exits, setExits] = useState<ExceptionalExitRecord[]>(() =>
    safeGetStorage(getExitsKey(), INITIAL_EXITS)
  );

  const [students, setStudents] = useState<StudentProfile[]>(() =>
    safeGetStorage(getStudentsKey(), [])
  );

  const [classrooms, setClassrooms] = useState<ClassRoom[]>(() =>
    safeGetStorage(getClassesKey(), [])
  );

  useEffect(() => {
    const handleSync = () => {
      setAttendance(safeGetStorage(getAttendanceKey(), []));
      setIncidents(safeGetStorage(getDisciplineKey(), []));
      setSanctions(safeGetStorage(getSanctionsKey(), INITIAL_SANCTIONS));
      setSlots(safeGetStorage(getSlotsKey(), INITIAL_SLOTS));
      setActivities(safeGetStorage(getActivitiesKey(), INITIAL_ACTIVITIES));
      setParentComms(safeGetStorage(getMessagesKey(), INITIAL_PARENT_COMMS));
      setExits(safeGetStorage(getExitsKey(), INITIAL_EXITS));
      setStudents(safeGetStorage(getStudentsKey(), []));
      setClassrooms(safeGetStorage(getClassesKey(), []));
    };

    window.addEventListener(STORAGE_EVENT, handleSync);
    window.addEventListener(SHARED_STORAGE_EVENT, handleSync);
    window.addEventListener("educogest_discipline_storage_update", handleSync);
    window.addEventListener("educogest_censeur_storage_update", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener(STORAGE_EVENT, handleSync);
      window.removeEventListener(SHARED_STORAGE_EVENT, handleSync);
      window.removeEventListener("educogest_discipline_storage_update", handleSync);
      window.removeEventListener("educogest_censeur_storage_update", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // 1. Record or update attendance entry for student in class
  const recordAttendance = useCallback(
    (params: {
      studentId: string;
      studentName: string;
      matricule: string;
      classId: string;
      className: string;
      status: CenseurAttendanceItem["status"];
      date?: string;
      sessionTime?: string;
      subject?: string;
      justificationNotes?: string;
      recordedBy?: string;
    }) => {
      const today = params.date || new Date().toISOString().split("T")[0];
      const session = params.sessionTime || "Matinée";
      const author = params.recordedBy || "Augustin SOSSOU (Surveillant Général)";

      setAttendance((prev) => {
        // Search if already recorded for today in this session
        const existingIdx = prev.findIndex(
          (a) => a.studentId === params.studentId && a.date === today && a.sessionTime === session
        );

        let next: CenseurAttendanceItem[];
        if (existingIdx >= 0) {
          next = [...prev];
          next[existingIdx] = {
            ...next[existingIdx],
            status: params.status,
            justificationNotes: params.justificationNotes || next[existingIdx].justificationNotes,
            isConfirmedByCenseur: true,
          };
        } else {
          const newItem: CenseurAttendanceItem = {
            id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            studentId: params.studentId,
            studentName: params.studentName,
            matricule: params.matricule,
            classId: params.classId,
            className: params.className,
            date: today,
            sessionTime: session,
            subject: params.subject || "Général",
            recordedByTeacher: author,
            status: params.status,
            justificationNotes: params.justificationNotes,
            isConfirmedByCenseur: true,
          };
          next = [newItem, ...prev];
        }
        safeSetStorage(getAttendanceKey(), next);
        return next;
      });
    },
    []
  );

  // Batch pointage for entire class
  const saveBatchClassAttendance = useCallback(
    (
      classId: string,
      className: string,
      entries: Array<{
        studentId: string;
        studentName: string;
        matricule: string;
        status: CenseurAttendanceItem["status"];
        latenessMinutes?: number;
        reason?: string;
      }>,
      sessionTime: string = "08:00 - 12:00",
      subject: string = "Appel de classe",
      author: string = "Augustin SOSSOU (Surveillant Général)"
    ) => {
      const today = new Date().toISOString().split("T")[0];

      setAttendance((prev) => {
        const studentIdsInBatch = new Set(entries.map((e) => e.studentId));
        // Remove existing items for these students today in this session to overwrite cleanly
        const filtered = prev.filter(
          (a) => !(studentIdsInBatch.has(a.studentId) && a.date === today && a.sessionTime === sessionTime)
        );

        const newItems: CenseurAttendanceItem[] = entries.map((entry) => ({
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          studentId: entry.studentId,
          studentName: entry.studentName,
          matricule: entry.matricule,
          classId,
          className,
          date: today,
          sessionTime,
          subject,
          recordedByTeacher: author,
          status: entry.status,
          justificationNotes:
            entry.status === "RETARD" && entry.latenessMinutes
              ? `Retard de ${entry.latenessMinutes} min${entry.reason ? ` - ${entry.reason}` : ""}`
              : entry.reason,
          isConfirmedByCenseur: true,
        }));

        const next = [...newItems, ...filtered];
        safeSetStorage(getAttendanceKey(), next);
        return next;
      });
    },
    []
  );

  // 2. Discipline Incident Registration
  const addIncident = useCallback(
    (incidentData: Omit<DisciplineIncident, "id" | "createdAt">) => {
      const newInc: DisciplineIncident = {
        ...incidentData,
        id: `disc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };

      setIncidents((prev) => {
        const next = [newInc, ...prev];
        safeSetStorage(getDisciplineKey(), next);
        return next;
      });
      return newInc;
    },
    []
  );

  const updateIncidentStatus = useCallback(
    (incidentId: string, status: DisciplineIncident["status"], comment?: string) => {
      setIncidents((prev) => {
        const next = prev.map((inc) =>
          inc.id === incidentId
            ? { ...inc, status, comment: comment !== undefined ? comment : inc.comment }
            : inc
        );
        safeSetStorage(getDisciplineKey(), next);
        return next;
      });
    },
    []
  );

  // 3. Sanction management & Director approval workflow
  const proposeSanction = useCallback(
    (sanctionData: Omit<SanctionRecord, "id" | "issuedAt" | "directorApprovalStatus" | "status">) => {
      const requiresDirector =
        sanctionData.type === "EXCLUSION_TEMPORAIRE" ||
        sanctionData.type === "RETENUE" ||
        sanctionData.requiresDirectorApproval;

      const newSanction: SanctionRecord = {
        ...sanctionData,
        id: `sanc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        requiresDirectorApproval: requiresDirector,
        directorApprovalStatus: requiresDirector ? "EN_ATTENTE" : "NON_REQUISE",
        issuedAt: `${new Date().toLocaleDateString("fr-FR")} ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
        status: "EN_COURS",
      };

      setSanctions((prev) => {
        const next = [newSanction, ...prev];
        safeSetStorage(getSanctionsKey(), next);
        return next;
      });
      return newSanction;
    },
    []
  );

  // Validation by Director
  const validateSanctionByDirector = useCallback(
    (sanctionId: string, approved: boolean, note?: string, directorName: string = "Direction Générale") => {
      setSanctions((prev) => {
        const next = prev.map((s) => {
          if (s.id === sanctionId) {
            return {
              ...s,
              directorApprovalStatus: (approved ? "APPROUVEE" : "REJETEE") as SanctionRecord["directorApprovalStatus"],
              approvedBy: directorName,
              approvedAt: `${new Date().toLocaleDateString("fr-FR")} ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
              directorNote: note || (approved ? "Sanction approuvée par la Direction" : "Sanction rejetée ou allégée"),
              status: approved ? "EN_COURS" : ("ANNULEE" as SanctionRecord["status"]),
            };
          }
          return s;
        });
        safeSetStorage(getSanctionsKey(), next);
        return next;
      });
    },
    []
  );

  // 4. Exceptional Exit
  const recordExceptionalExit = useCallback(
    (data: Omit<ExceptionalExitRecord, "id" | "date">) => {
      const newExit: ExceptionalExitRecord = {
        ...data,
        id: `exit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date: new Date().toISOString().split("T")[0],
      };

      setExits((prev) => {
        const next = [newExit, ...prev];
        safeSetStorage(getExitsKey(), next);
        return next;
      });
      return newExit;
    },
    []
  );

  // 5. Surveillance Slots
  const addSurveillanceSlot = useCallback((slot: Omit<SurveillanceSlot, "id">) => {
    const newSlot: SurveillanceSlot = {
      ...slot,
      id: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    setSlots((prev) => {
      const next = [newSlot, ...prev];
      safeSetStorage(getSlotsKey(), next);
      return next;
    });
    return newSlot;
  }, []);

  // 6. Activities
  const addActivity = useCallback((activity: Omit<SchoolActivityRecord, "id">) => {
    const newAct: SchoolActivityRecord = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    setActivities((prev) => {
      const next = [newAct, ...prev];
      safeSetStorage(getActivitiesKey(), next);
      return next;
    });
    return newAct;
  }, []);

  // 7. Parent Communications
  const sendParentDisciplineMessage = useCallback(
    (msg: Omit<ParentDisciplineMessage, "id" | "sentAt" | "status">) => {
      const newMsg: ParentDisciplineMessage = {
        ...msg,
        id: `pcomm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sentAt: `${new Date().toLocaleDateString("fr-FR")} ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
        status: "EN_ATTENTE_REPONSE",
      };

      setParentComms((prev) => {
        const next = [newMsg, ...prev];
        safeSetStorage(getMessagesKey(), next);
        return next;
      });
      return newMsg;
    },
    []
  );

  // Derived KPIs and dashboard metrics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayRecords = attendance.filter((a) => a.date === today);

    const presentsCount = todayRecords.filter((a) => a.status === "PRESENT").length;
    const absentsCount = todayRecords.filter(
      (a) => a.status === "ABSENT" || a.status === "ABS_NON_JUSTIFIEE" || a.status === "ABS_JUSTIFIEE"
    ).length;
    const latenessCount = todayRecords.filter((a) => a.status === "RETARD").length;
    const pendingJustifications = todayRecords.filter((a) => a.status === "ABSENT" || a.status === "ABS_NON_JUSTIFIEE").length;

    const openIncidents = incidents.filter((i) => i.status === "OUVERT" || i.status === "EN_COURS").length;
    const activeSanctions = sanctions.filter((s) => s.status === "EN_COURS").length;
    const pendingDirectorApprovals = sanctions.filter((s) => s.directorApprovalStatus === "EN_ATTENTE").length;

    // Frequent absentees (students with >= 2 recorded absences)
    const absenceCountsByStudent: Record<string, { student: StudentProfile; count: number }> = {};
    attendance.forEach((a) => {
      if (a.status === "ABSENT" || a.status === "ABS_NON_JUSTIFIEE") {
        const student = students.find((s) => s.id === a.studentId);
        if (student) {
          if (!absenceCountsByStudent[a.studentId]) {
            absenceCountsByStudent[a.studentId] = { student, count: 0 };
          }
          absenceCountsByStudent[a.studentId].count += 1;
        }
      }
    });

    const frequentAbsentees = Object.values(absenceCountsByStudent)
      .filter((item) => item.count >= 2)
      .sort((a, b) => b.count - a.count);

    // Repeat incident students
    const incidentCountsByStudent: Record<string, { student: StudentProfile; count: number }> = {};
    incidents.forEach((i) => {
      const student = students.find((s) => s.id === i.studentId);
      if (student) {
        if (!incidentCountsByStudent[i.studentId]) {
          incidentCountsByStudent[i.studentId] = { student, count: 0 };
        }
        incidentCountsByStudent[i.studentId].count += 1;
      }
    });

    const repeatOffenders = Object.values(incidentCountsByStudent)
      .filter((item) => item.count >= 1)
      .sort((a, b) => b.count - a.count);

    return {
      presentsCount,
      absentsCount,
      latenessCount,
      pendingJustifications,
      openIncidents,
      activeSanctions,
      pendingDirectorApprovals,
      frequentAbsentees,
      repeatOffenders,
    };
  }, [attendance, incidents, sanctions, students]);

  return {
    attendance,
    incidents,
    sanctions,
    slots,
    activities,
    parentComms,
    exits,
    students,
    classrooms,
    stats,
    recordAttendance,
    saveBatchClassAttendance,
    addIncident,
    updateIncidentStatus,
    proposeSanction,
    validateSanctionByDirector,
    recordExceptionalExit,
    addSurveillanceSlot,
    addActivity,
    sendParentDisciplineMessage,
  };
}
