"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  MOCK_BULLETIN_STUDENTS,
  MOCK_CLASSROOMS,
  MOCK_SUBJECTS,
  MOCK_TEACHERS,
} from "./mock-bulletin-db";
import { StudentProfile, SubjectConfig, ClassRoom, TeacherInfo } from "./types/bulletin";
import { getScopedStorageKey, getActiveSchoolId } from "./school-context";
import { getSchoolUsers } from "./user-registry";

export interface TeacherCourseSchedule {
  id: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  dayOfWeek: "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi";
  timeSlot: string;
  room: string;
  status: "PROGRAMME" | "EN_COURS" | "TERMINE";
}

export interface StudentAssignmentHistory {
  id: string;
  studentId: string;
  studentName: string;
  matricule: string;
  previousClassId: string;
  previousClassName: string;
  newClassId: string;
  newClassName: string;
  date: string;
  author: string;
  reason: string;
}

export interface CenseurAttendanceItem {
  id: string;
  studentId: string;
  studentName: string;
  matricule: string;
  classId: string;
  className: string;
  date: string;
  sessionTime: string;
  subject: string;
  recordedByTeacher: string;
  status: "PRESENT" | "ABSENT" | "RETARD" | "ABS_JUSTIFIEE" | "ABS_NON_JUSTIFIEE";
  justificationNotes?: string;
  isConfirmedByCenseur: boolean;
}

export interface AttendanceAuditLog {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  time: string;
  previousStatus: string;
  newStatus: string;
  author: string;
  reason: string;
}

export interface HomeworkProgram {
  id: string;
  type: "DEVOIR" | "TD";
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherName: string;
  date: string;
  timeSlot: string;
  room: string;
  title: string;
  instructions: string;
  status: "PROGRAMME" | "EN_COURS" | "TERMINE" | "ANNULE";
}

export interface ParentMessageItem {
  id: string;
  parentName: string;
  parentPhone: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  time: string;
  subject: string;
  message: string;
  status: "NON_LU" | "LU" | "REPONDU";
  replyText?: string;
  repliedAt?: string;
  repliedBy?: string;
}

// 1. Matière enrichie pour la gestion pédagogique du Censeur
export interface CenseurSubjectItem {
  id: string;
  code: string;
  name: string;
  coef: number;
  category: "LITTÉRAIRE" | "SCIENTIFIQUE" | "AUTRE";
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  teacherEmail?: string;
  weeklyHours: number;
  isConduite?: boolean;
}

// 2. Fiche de compte enseignant
export interface CenseurTeacherAccount {
  id: string;
  name: string;
  identifier: string; // login / matricule
  email: string;
  phone: string;
  specialty: string;
  roleTitle: string;
  status: "ACTIF" | "INACTIF";
  assignedClasses: { classId: string; className: string }[];
  assignedSubjects: { subjectId: string; subjectName: string }[];
  allowedPermissions: string[];
  weeklyHours: number;
  createdAt: string;
}

// 3. Demande d'accès d'un parent à un enfant
export interface ParentChildAccessRequest {
  id: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  studentId: string;
  studentName: string;
  matricule: string;
  className: string;
  academicYear: string;
  requestDate: string;
  requestTime: string;
  status: "EN_ATTENTE" | "ACCEPTEE" | "REFUSEE";
  isAccessActivated: boolean;
  validatedBy?: string;
  validatedAt?: string;
  refusalReason?: string;
}

// Clean production datasets: AUCUNE donnée fictive
export const INITIAL_TEACHER_SCHEDULES: TeacherCourseSchedule[] = [];
export const INITIAL_HOMEWORK_PROGRAMS: HomeworkProgram[] = [];
export const INITIAL_ATTENDANCE_ITEMS: CenseurAttendanceItem[] = [];
export const INITIAL_PARENT_MESSAGES: ParentMessageItem[] = [];
export const INITIAL_CENSEUR_SUBJECTS: CenseurSubjectItem[] = [];
export const INITIAL_TEACHER_ACCOUNTS: CenseurTeacherAccount[] = [];
export const INITIAL_PARENT_ACCESS_REQUESTS: ParentChildAccessRequest[] = [];

// Scoped Storage Keys
const getSchedulesKey = () => getScopedStorageKey("educogest_censeur_schedules_v2");
const getAssignHistKey = () => getScopedStorageKey("educogest_censeur_assign_hist_v2");
const getAttendanceKey = () => getScopedStorageKey("educogest_censeur_attendance_v2");
const getAttAuditKey = () => getScopedStorageKey("educogest_censeur_att_audit_v2");
const getHomeworkKey = () => getScopedStorageKey("educogest_censeur_homework_v2");
const getMessagesKey = () => getScopedStorageKey("educogest_censeur_messages_v2");
const getStudentsKey = () => getScopedStorageKey("educogest_censeur_students_v2");
const getCenseurSubjectsKey = () => getScopedStorageKey("educogest_censeur_subjects_v2");
const getTeacherAccountsKey = () => getScopedStorageKey("educogest_censeur_teachers_v2");
const getParentRequestsKey = () => getScopedStorageKey("educogest_censeur_parent_requests_v2");
const getClassesKey = () => getScopedStorageKey("educogest_school_classes_v3");

const STORAGE_EVENT = "educogest_censeur_storage_update";
const BULLETIN_SUBJECTS_STORAGE_KEY = "educogest_bulletin_subjects_v3";
const BULLETIN_STORAGE_EVENT = "educogest_bulletin_storage_update";
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
  } catch (e) {
    console.error("Storage error:", e);
  }
}

function getMergedTeacherAccounts(): CenseurTeacherAccount[] {
  const directTeachers = safeGetStorage<CenseurTeacherAccount[]>(
    getTeacherAccountsKey(),
    INITIAL_TEACHER_ACCOUNTS
  );

  try {
    const currentSchoolId = getActiveSchoolId();
    const schoolUsers = getSchoolUsers(currentSchoolId);

    const existingEmails = new Set(directTeachers.map((t) => (t.email || "").toLowerCase()));
    const existingIds = new Set(directTeachers.map((t) => t.id));
    const extraTeachers: CenseurTeacherAccount[] = [];

    schoolUsers.forEach((u) => {
      const role = (u.role || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      if (
        (role === "enseignant" || role.includes("prof")) &&
        email &&
        !existingEmails.has(email) &&
        !existingIds.has(u.id)
      ) {
        existingEmails.add(email);
        existingIds.add(u.id);
        extraTeachers.push({
          id: u.id,
          name: u.fullName,
          identifier: u.identifier || (u.email || "prof").split("@")[0],
          email: u.email,
          phone: u.phone || "+229 ",
          specialty: u.specialty || "Enseignement Général",
          roleTitle: "Professeur Titulaire",
          status: u.status === "ACTIF" ? "ACTIF" : "INACTIF",
          assignedClasses: u.assignedClasses || [],
          assignedSubjects: u.assignedSubjects || [],
          allowedPermissions: u.permissions || [
            "saisie_notes",
            "appel_presence",
            "cahier_textes",
          ],
          weeklyHours: 12,
          createdAt: u.createdAt ? u.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
        });
      }
    });

    return [...directTeachers, ...extraTeachers];
  } catch (e) {
    console.warn("Erreur chargement comptes enseignants fusionnés:", e);
  }
  return directTeachers;
}

export function useCenseurStore() {
  const [schedules, setSchedules] = useState<TeacherCourseSchedule[]>(() =>
    safeGetStorage(getSchedulesKey(), INITIAL_TEACHER_SCHEDULES)
  );

  const [assignmentHistory, setAssignmentHistory] = useState<StudentAssignmentHistory[]>(() =>
    safeGetStorage(getAssignHistKey(), [])
  );

  const [attendanceItems, setAttendanceItems] = useState<CenseurAttendanceItem[]>(() =>
    safeGetStorage(getAttendanceKey(), INITIAL_ATTENDANCE_ITEMS)
  );

  const [attendanceAuditLogs, setAttendanceAuditLogs] = useState<AttendanceAuditLog[]>(() =>
    safeGetStorage(getAttAuditKey(), [])
  );

  const [homeworkPrograms, setHomeworkPrograms] = useState<HomeworkProgram[]>(() =>
    safeGetStorage(getHomeworkKey(), INITIAL_HOMEWORK_PROGRAMS)
  );

  const [parentMessages, setParentMessages] = useState<ParentMessageItem[]>(() =>
    safeGetStorage(getMessagesKey(), INITIAL_PARENT_MESSAGES)
  );

  const [studentsList, setStudentsList] = useState<StudentProfile[]>(() =>
    safeGetStorage(getStudentsKey(), [])
  );

  const [subjectsList, setSubjectsList] = useState<CenseurSubjectItem[]>(() =>
    safeGetStorage(getCenseurSubjectsKey(), INITIAL_CENSEUR_SUBJECTS)
  );

  const [teacherAccounts, setTeacherAccounts] = useState<CenseurTeacherAccount[]>(() =>
    getMergedTeacherAccounts()
  );

  const [parentAccessRequests, setParentAccessRequests] = useState<ParentChildAccessRequest[]>(() =>
    safeGetStorage(getParentRequestsKey(), INITIAL_PARENT_ACCESS_REQUESTS)
  );

  const [classrooms, setClassrooms] = useState<ClassRoom[]>(() =>
    safeGetStorage(getClassesKey(), [])
  );

  useEffect(() => {
    const handleUpdate = () => {
      setSchedules(safeGetStorage(getSchedulesKey(), INITIAL_TEACHER_SCHEDULES));
      setAssignmentHistory(safeGetStorage(getAssignHistKey(), []));
      setAttendanceItems(safeGetStorage(getAttendanceKey(), INITIAL_ATTENDANCE_ITEMS));
      setAttendanceAuditLogs(safeGetStorage(getAttAuditKey(), []));
      setHomeworkPrograms(safeGetStorage(getHomeworkKey(), INITIAL_HOMEWORK_PROGRAMS));
      setParentMessages(safeGetStorage(getMessagesKey(), INITIAL_PARENT_MESSAGES));
      setStudentsList(safeGetStorage(getStudentsKey(), []));
      setSubjectsList(safeGetStorage(getCenseurSubjectsKey(), INITIAL_CENSEUR_SUBJECTS));
      setTeacherAccounts(getMergedTeacherAccounts());
      setParentAccessRequests(safeGetStorage(getParentRequestsKey(), INITIAL_PARENT_ACCESS_REQUESTS));
      setClassrooms(safeGetStorage(getClassesKey(), []));
    };

    window.addEventListener(STORAGE_EVENT, handleUpdate);
    window.addEventListener(BULLETIN_STORAGE_EVENT, handleUpdate);
    window.addEventListener(SHARED_STORAGE_EVENT, handleUpdate);
    window.addEventListener("ecogest_users_registry_update", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(STORAGE_EVENT, handleUpdate);
      window.removeEventListener(BULLETIN_STORAGE_EVENT, handleUpdate);
      window.removeEventListener(SHARED_STORAGE_EVENT, handleUpdate);
      window.removeEventListener("ecogest_users_registry_update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // 1. Move/Assign Student to a class with audit trail
  const moveStudentClass = useCallback(
    (
      studentId: string,
      newClassId: string,
      newClassName: string,
      reason: string = "Redéploiement pédagogique",
      author: string = "Censeur des Études"
    ) => {
      let prevClassId = "";
      let prevClassName = "";
      let studentName = "";
      let matricule = "";

      setStudentsList((prev) => {
        const next = prev.map((s) => {
          if (s.id === studentId) {
            prevClassId = s.classId;
            prevClassName = s.className;
            studentName = `${s.lastName} ${s.firstName}`;
            matricule = s.matricule;
            return {
              ...s,
              classId: newClassId,
              className: newClassName,
            };
          }
          return s;
        });
        safeSetStorage(getStudentsKey(), next);
        return next;
      });

      if (prevClassId && prevClassId !== newClassId) {
        const logEntry: StudentAssignmentHistory = {
          id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          studentId,
          studentName,
          matricule,
          previousClassId: prevClassId,
          previousClassName: prevClassName,
          newClassId,
          newClassName,
          date: new Date().toISOString().split("T")[0],
          author,
          reason,
        };
        setAssignmentHistory((prev) => {
          const next = [logEntry, ...prev];
          safeSetStorage(getAssignHistKey(), next);
          return next;
        });
      }
    },
    []
  );

  const addStudent = useCallback((student: StudentProfile) => {
    setStudentsList((prev) => {
      const next = [...prev, student];
      safeSetStorage(getStudentsKey(), next);
      return next;
    });
  }, []);

  const updateStudent = useCallback((studentId: string, updates: Partial<StudentProfile>) => {
    setStudentsList((prev) => {
      const next = prev.map((s) => (s.id === studentId ? { ...s, ...updates } : s));
      safeSetStorage(getStudentsKey(), next);
      return next;
    });
  }, []);

  const deleteStudent = useCallback((studentId: string) => {
    setStudentsList((prev) => {
      const next = prev.filter((s) => s.id !== studentId);
      safeSetStorage(getStudentsKey(), next);
      return next;
    });
  }, []);

  // 2. Attendance confirmation & status update
  const updateAttendanceStatus = useCallback(
    (
      attendanceId: string,
      status: CenseurAttendanceItem["status"],
      justification?: string,
      author: string = "Censeur des Études",
      reason: string = "Vérification administrative du Censeur"
    ) => {
      let targetStudentName = "";
      let targetClassName = "";
      let prevStatus = "";
      let date = "";

      setAttendanceItems((prev) => {
        const next = prev.map((item) => {
          if (item.id === attendanceId) {
            targetStudentName = item.studentName;
            targetClassName = item.className;
            prevStatus = item.status;
            date = item.date;
            return {
              ...item,
              status,
              justificationNotes: justification !== undefined ? justification : item.justificationNotes,
              isConfirmedByCenseur: true,
            };
          }
          return item;
        });
        safeSetStorage(getAttendanceKey(), next);
        return next;
      });

      if (prevStatus && prevStatus !== status) {
        const auditLog: AttendanceAuditLog = {
          id: `att-aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          studentId: attendanceId,
          studentName: targetStudentName,
          className: targetClassName,
          date,
          time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          previousStatus: prevStatus,
          newStatus: status,
          author,
          reason: justification ? `${reason} : ${justification}` : reason,
        };
        setAttendanceAuditLogs((prev) => {
          const next = [auditLog, ...prev];
          safeSetStorage(getAttAuditKey(), next);
          return next;
        });
      }
    },
    []
  );

  const confirmAttendance = useCallback((attendanceId: string) => {
    setAttendanceItems((prev) => {
      const next = prev.map((item) =>
        item.id === attendanceId ? { ...item, isConfirmedByCenseur: true } : item
      );
      safeSetStorage(getAttendanceKey(), next);
      return next;
    });
  }, []);

  // 3. Homework & Devoir program
  const addHomeworkProgram = useCallback((program: Omit<HomeworkProgram, "id">) => {
    const newItem: HomeworkProgram = {
      ...program,
      id: `hw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setHomeworkPrograms((prev) => {
      const next = [newItem, ...prev];
      safeSetStorage(getHomeworkKey(), next);
      return next;
    });
  }, []);

  const updateHomeworkStatus = useCallback((id: string, status: HomeworkProgram["status"]) => {
    setHomeworkPrograms((prev) => {
      const next = prev.map((h) => (h.id === id ? { ...h, status } : h));
      safeSetStorage(getHomeworkKey(), next);
      return next;
    });
  }, []);

  // 4. Parent messages
  const replyToParentMessage = useCallback(
    (messageId: string, replyText: string, repliedBy: string = "Censeur des Études") => {
      setParentMessages((prev) => {
        const next = prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                status: "REPONDU" as const,
                replyText,
                repliedAt: new Date().toISOString(),
                repliedBy,
              }
            : m
        );
        safeSetStorage(getMessagesKey(), next);
        return next;
      });
    },
    []
  );

  const markMessageAsRead = useCallback((messageId: string) => {
    setParentMessages((prev) => {
      const next = prev.map((m) =>
        m.id === messageId && m.status === "NON_LU" ? { ...m, status: "LU" as const } : m
      );
      safeSetStorage(getMessagesKey(), next);
      return next;
    });
  }, []);

  // 5. Subject management & Teacher assignment by Censeur
  const addSubject = useCallback((subject: Omit<CenseurSubjectItem, "id">) => {
    const newSub: CenseurSubjectItem = {
      ...subject,
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    setSubjectsList((prev) => {
      const next = [...prev, newSub];
      safeSetStorage(getCenseurSubjectsKey(), next);
      return next;
    });

    // Also sync to bulletin subjects
    try {
      const currentBulletinSubs = safeGetStorage<SubjectConfig[]>(getScopedStorageKey(BULLETIN_SUBJECTS_STORAGE_KEY), MOCK_SUBJECTS);
      const exists = currentBulletinSubs.some((s) => s.code.toLowerCase() === newSub.code.toLowerCase());
      if (!exists) {
        const newBulletinSub: SubjectConfig = {
          id: `mat-${newSub.code.toLowerCase()}`,
          code: newSub.code,
          name: newSub.name,
          coef: newSub.coef,
          category: newSub.category,
          order: currentBulletinSubs.length + 1,
          isConduite: newSub.isConduite,
        };
        const updated = [...currentBulletinSubs, newBulletinSub];
        safeSetStorage(getScopedStorageKey(BULLETIN_SUBJECTS_STORAGE_KEY), updated);
        window.dispatchEvent(new Event(BULLETIN_STORAGE_EVENT));
      }
    } catch (e) {
      console.error("Error syncing bulletin subjects:", e);
    }
  }, []);

  const updateSubject = useCallback((id: string, updates: Partial<CenseurSubjectItem>) => {
    let updatedCode = "";

    setSubjectsList((prev) => {
      const next = prev.map((s) => {
        if (s.id === id) {
          const res = { ...s, ...updates };
          updatedCode = res.code;
          return res;
        }
        return s;
      });
      safeSetStorage(getCenseurSubjectsKey(), next);
      return next;
    });

    if (updates.coef && updatedCode) {
      try {
        const currentBulletinSubs = safeGetStorage<SubjectConfig[]>(getScopedStorageKey(BULLETIN_SUBJECTS_STORAGE_KEY), MOCK_SUBJECTS);
        const updated = currentBulletinSubs.map((s) => {
          if (s.code.toLowerCase() === updatedCode.toLowerCase()) {
            return { ...s, coef: updates.coef! };
          }
          return s;
        });
        safeSetStorage(getScopedStorageKey(BULLETIN_SUBJECTS_STORAGE_KEY), updated);
        window.dispatchEvent(new Event(BULLETIN_STORAGE_EVENT));
      } catch (e) {
        console.error("Error syncing coef with bulletin store:", e);
      }
    }
  }, []);

  // 6. Teacher account management
  const createTeacherAccount = useCallback(
    (teacher: Omit<CenseurTeacherAccount, "id" | "createdAt">) => {
      const newTeacher: CenseurTeacherAccount = {
        ...teacher,
        id: `tea-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setTeacherAccounts((prev) => {
        const next = [...prev, newTeacher];
        safeSetStorage(getTeacherAccountsKey(), next);
        return next;
      });
      return newTeacher;
    },
    []
  );

  const updateTeacherAccount = useCallback(
    (id: string, updates: Partial<CenseurTeacherAccount>) => {
      setTeacherAccounts((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
        safeSetStorage(getTeacherAccountsKey(), next);
        return next;
      });
    },
    []
  );

  // 7. Parent access requests & student validation
  const submitParentAccessRequest = useCallback(
    (req: Omit<ParentChildAccessRequest, "id" | "requestDate" | "requestTime" | "status" | "isAccessActivated">) => {
      const newReq: ParentChildAccessRequest = {
        ...req,
        id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        requestDate: new Date().toISOString().split("T")[0],
        requestTime: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        status: "EN_ATTENTE",
        isAccessActivated: false,
      };
      setParentAccessRequests((prev) => {
        const next = [newReq, ...prev];
        safeSetStorage(getParentRequestsKey(), next);
        return next;
      });
      return newReq;
    },
    []
  );

  const validateParentAccessRequest = useCallback(
    (
      requestId: string,
      status: "ACCEPTEE" | "REFUSEE",
      validatedBy: string = "Censeur des Études",
      refusalReason?: string
    ) => {
      setParentAccessRequests((prev) => {
        const next = prev.map((req) => {
          if (req.id === requestId) {
            return {
              ...req,
              status,
              isAccessActivated: status === "ACCEPTEE",
              validatedBy,
              validatedAt: new Date().toISOString(),
              refusalReason: status === "REFUSEE" ? refusalReason : undefined,
            };
          }
          return req;
        });
        safeSetStorage(getParentRequestsKey(), next);
        return next;
      });
    },
    []
  );

  const toggleChildAccessActivation = useCallback((requestId: string, activate: boolean) => {
    setParentAccessRequests((prev) => {
      const next = prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            isAccessActivated: activate,
            status: (activate ? "ACCEPTEE" : req.status) as ParentChildAccessRequest["status"],
          };
        }
        return req;
      });
      safeSetStorage(getParentRequestsKey(), next);
      return next;
    });
  }, []);

  // Helper: get authorized children for a parent
  const getAuthorizedChildrenForParent = useCallback(
    (parentQuery: string) => {
      const clean = (parentQuery || "").trim().toLowerCase();
      if (!clean) return [];

      const activeRequests = parentAccessRequests.filter(
        (r) =>
          (r.parentId?.toLowerCase() === clean ||
            r.parentPhone?.toLowerCase() === clean ||
            r.parentEmail?.toLowerCase() === clean) &&
          r.status === "ACCEPTEE" &&
          r.isAccessActivated
      );

      const activeStudentIds = new Set(activeRequests.map((r) => r.studentId));
      return studentsList.filter((s) => activeStudentIds.has(s.id));
    },
    [parentAccessRequests, studentsList]
  );

  return {
    schedules,
    assignmentHistory,
    attendanceItems,
    attendanceAuditLogs,
    homeworkPrograms,
    parentMessages,
    studentsList,
    subjectsList,
    teacherAccounts,
    parentAccessRequests,
    classrooms,
    subjects: MOCK_SUBJECTS,
    teachers: MOCK_TEACHERS,
    moveStudentClass,
    addStudent,
    updateStudent,
    deleteStudent,
    updateAttendanceStatus,
    confirmAttendance,
    addHomeworkProgram,
    updateHomeworkStatus,
    replyToParentMessage,
    markMessageAsRead,
    addSubject,
    updateSubject,
    createTeacherAccount,
    updateTeacherAccount,
    submitParentAccessRequest,
    validateParentAccessRequest,
    toggleChildAccessActivation,
    getAuthorizedChildrenForParent,
  };
}
