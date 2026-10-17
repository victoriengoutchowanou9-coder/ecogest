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

const STORAGE_KEY_ATTENDANCE = "educogest_censeur_attendance_v1";
const STORAGE_KEY_DISCIPLINE = "educogest_discipline_incidents_v2";
const STORAGE_KEY_SANCTIONS = "educogest_surveillant_sanctions_v1";
const STORAGE_KEY_SLOTS = "educogest_surveillant_slots_v1";
const STORAGE_KEY_ACTIVITIES = "educogest_surveillant_activities_v1";
const STORAGE_KEY_MESSAGES = "educogest_surveillant_parent_comms_v1";
const STORAGE_KEY_EXITS = "educogest_surveillant_exits_v1";
const STORAGE_KEY_STUDENTS = "educogest_censeur_students_v1";
const STORAGE_KEY_CLASSES = "educogest_school_classes_v2";

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

const INITIAL_SANCTIONS: SanctionRecord[] = [
  {
    id: "sanc-01",
    studentId: "std-03",
    studentName: "Rodrigue KANHONOU",
    matricule: "ECO-2026-0018",
    className: "6ème A",
    incidentId: "disc-init-01",
    type: "AVERTISSEMENT",
    description: "Avertissement pour retards répétitifs sans motif valable.",
    startDate: "2026-10-17",
    requiresDirectorApproval: false,
    directorApprovalStatus: "NON_REQUISE",
    issuedBy: "Augustin SOSSOU (Surveillant Général)",
    issuedAt: "2026-10-17 08:30",
    status: "EN_COURS",
  },
  {
    id: "sanc-02",
    studentId: "std-07",
    studentName: "Kévine TCHIBOZO",
    matricule: "ECO-2026-0042",
    className: "3ème A",
    type: "EXCLUSION_TEMPORAIRE",
    description: "Proposition d'exclusion temporaire de 2 jours pour dégradation d'une table-banc en salle 3A.",
    startDate: "2026-10-20",
    endDate: "2026-10-22",
    duration: "2 jours",
    requiresDirectorApproval: true,
    directorApprovalStatus: "EN_ATTENTE",
    directorNote: "Dossier soumis à validation par M. le Directeur conformément au règlement intérieur.",
    issuedBy: "Augustin SOSSOU (Surveillant Général)",
    issuedAt: "2026-10-16 16:00",
    status: "EN_COURS",
  },
];

const INITIAL_SLOTS: SurveillanceSlot[] = [
  {
    id: "slot-01",
    zone: "ENTREE",
    dayOfWeek: "Lundi",
    timeSlot: "07:15 - 08:00",
    surveillantName: "Augustin SOSSOU",
    notes: "Contrôle des uniformes et de la ponctualité au grand portail",
    status: "ACTIF",
  },
  {
    id: "slot-02",
    zone: "RECREATION",
    dayOfWeek: "Lundi",
    timeSlot: "10:00 - 10:30",
    surveillantName: "Patrice KOUDJO (Surveillant adjoint)",
    notes: "Surveillance de la cour et des abords du réfectoire",
    status: "ACTIF",
  },
  {
    id: "slot-03",
    zone: "COULOIRS",
    dayOfWeek: "Mardi",
    timeSlot: "14:00 - 17:00",
    surveillantName: "Augustin SOSSOU",
    notes: "Maintien de l'ordre pendant les cours des 4e et 3e",
    status: "ACTIF",
  },
  {
    id: "slot-04",
    zone: "SORTIE",
    dayOfWeek: "Vendredi",
    timeSlot: "17:00 - 17:45",
    surveillantName: "Augustin SOSSOU",
    notes: "Évacuation ordonnée des élèves et fermeture des issues",
    status: "ACTIF",
  },
];

const INITIAL_ACTIVITIES: SchoolActivityRecord[] = [
  {
    id: "act-01",
    type: "SORTIE_SCOLAIRE",
    title: "Visite pédagogique au Musée Historique d'Ouidah",
    classNames: ["6ème A", "5ème A"],
    date: "2026-11-14",
    timeSlot: "08:00 - 16:00",
    destination: "Ouidah (Fort Portugais)",
    responsiblePerson: "M. Marcellin DOKPO (Censeur) & Augustin SOSSOU",
    authorizedStudentCount: 65,
    parentalAuthorizationRequired: true,
    status: "PLANIFIEE",
    notes: "Départ par car scolaire sécurisé depuis la cour.",
  },
  {
    id: "act-02",
    type: "MANIFESTATION",
    title: "Journée Nationale du Sport Scolaire",
    classNames: ["Toutes classes"],
    date: "2026-10-31",
    timeSlot: "08:00 - 12:00",
    destination: "Terrain des sports de l'établissement",
    responsiblePerson: "Professeurs d'EPS & Surveillant Général",
    authorizedStudentCount: 150,
    parentalAuthorizationRequired: false,
    status: "PLANIFIEE",
  },
];

const INITIAL_PARENT_COMMS: ParentDisciplineMessage[] = [
  {
    id: "pcomm-01",
    studentId: "std-03",
    studentName: "Rodrigue KANHONOU",
    className: "6ème A",
    parentName: "M. Bernard KANHONOU",
    parentPhone: "+229 96 22 33 44",
    type: "AVIS_RETARD",
    subject: "Signalement de retard : Rodrigue KANHONOU (6ème A)",
    message: "Bonjour M. KANHONOU. Votre enfant est arrivé avec 15 minutes de retard au premier cours de ce matin. Merci de veiller à sa ponctualité.",
    sentAt: "2026-10-17 08:35",
    sentBy: "Augustin SOSSOU (Surveillant Général)",
    parentResponse: "Bien reçu M. le surveillant, nous avons eu une panne de moto, désolé.",
    responseReceivedAt: "2026-10-17 09:10",
    status: "REPONDU",
  },
];

const INITIAL_EXITS: ExceptionalExitRecord[] = [
  {
    id: "exit-01",
    studentId: "std-02",
    studentName: "Marie-Josée AGBO",
    className: "6ème A",
    matricule: "ECO-2026-0015",
    exitTime: "10:15",
    expectedReturnTime: "Demain matin",
    reason: "Malaise fébrile constaté par l'infirmerie",
    authorizedBy: "Augustin SOSSOU (Surveillant Général)",
    parentNotified: true,
    accompanyingPerson: "Mme Clarisse AGBO (Mère)",
    date: new Date().toISOString().split("T")[0],
  },
];

export function useSurveillantStore() {
  const [attendance, setAttendance] = useState<CenseurAttendanceItem[]>(() =>
    safeGetStorage(STORAGE_KEY_ATTENDANCE, INITIAL_ATTENDANCE_ITEMS)
  );

  const [incidents, setIncidents] = useState<DisciplineIncident[]>(() =>
    safeGetStorage(STORAGE_KEY_DISCIPLINE, INITIAL_DISCIPLINE_INCIDENTS)
  );

  const [sanctions, setSanctions] = useState<SanctionRecord[]>(() =>
    safeGetStorage(STORAGE_KEY_SANCTIONS, INITIAL_SANCTIONS)
  );

  const [slots, setSlots] = useState<SurveillanceSlot[]>(() =>
    safeGetStorage(STORAGE_KEY_SLOTS, INITIAL_SLOTS)
  );

  const [activities, setActivities] = useState<SchoolActivityRecord[]>(() =>
    safeGetStorage(STORAGE_KEY_ACTIVITIES, INITIAL_ACTIVITIES)
  );

  const [parentComms, setParentComms] = useState<ParentDisciplineMessage[]>(() =>
    safeGetStorage(STORAGE_KEY_MESSAGES, INITIAL_PARENT_COMMS)
  );

  const [exits, setExits] = useState<ExceptionalExitRecord[]>(() =>
    safeGetStorage(STORAGE_KEY_EXITS, INITIAL_EXITS)
  );

  const [students, setStudents] = useState<StudentProfile[]>(() =>
    safeGetStorage(STORAGE_KEY_STUDENTS, MOCK_BULLETIN_STUDENTS)
  );

  const [classrooms, setClassrooms] = useState<ClassRoom[]>(() =>
    safeGetStorage(STORAGE_KEY_CLASSES, MOCK_CLASSROOMS)
  );

  useEffect(() => {
    const handleSync = () => {
      setAttendance(safeGetStorage(STORAGE_KEY_ATTENDANCE, INITIAL_ATTENDANCE_ITEMS));
      setIncidents(safeGetStorage(STORAGE_KEY_DISCIPLINE, INITIAL_DISCIPLINE_INCIDENTS));
      setSanctions(safeGetStorage(STORAGE_KEY_SANCTIONS, INITIAL_SANCTIONS));
      setSlots(safeGetStorage(STORAGE_KEY_SLOTS, INITIAL_SLOTS));
      setActivities(safeGetStorage(STORAGE_KEY_ACTIVITIES, INITIAL_ACTIVITIES));
      setParentComms(safeGetStorage(STORAGE_KEY_MESSAGES, INITIAL_PARENT_COMMS));
      setExits(safeGetStorage(STORAGE_KEY_EXITS, INITIAL_EXITS));
      setStudents(safeGetStorage(STORAGE_KEY_STUDENTS, MOCK_BULLETIN_STUDENTS));
      setClassrooms(safeGetStorage(STORAGE_KEY_CLASSES, MOCK_CLASSROOMS));
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
        safeSetStorage(STORAGE_KEY_ATTENDANCE, next);
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
        safeSetStorage(STORAGE_KEY_ATTENDANCE, next);
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
        safeSetStorage(STORAGE_KEY_DISCIPLINE, next);
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
        safeSetStorage(STORAGE_KEY_DISCIPLINE, next);
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
        safeSetStorage(STORAGE_KEY_SANCTIONS, next);
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
        safeSetStorage(STORAGE_KEY_SANCTIONS, next);
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
        safeSetStorage(STORAGE_KEY_EXITS, next);
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
      safeSetStorage(STORAGE_KEY_SLOTS, next);
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
      safeSetStorage(STORAGE_KEY_ACTIVITIES, next);
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
        safeSetStorage(STORAGE_KEY_MESSAGES, next);
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
