"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  MOCK_BULLETIN_STUDENTS,
  MOCK_CLASSROOMS,
  MOCK_SUBJECTS,
  MOCK_TEACHERS,
} from "./mock-bulletin-db";
import { StudentProfile, SubjectConfig, ClassRoom, TeacherInfo } from "./types/bulletin";

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
  allowedPermissions: string[]; // ex: "saisie_notes", "appel_presence", "cahier_textes", "bulletins"
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

// Initial mock datasets
export const INITIAL_TEACHER_SCHEDULES: TeacherCourseSchedule[] = [];

export const INITIAL_HOMEWORK_PROGRAMS: HomeworkProgram[] = [];

export const INITIAL_ATTENDANCE_ITEMS: CenseurAttendanceItem[] = [];

export const INITIAL_PARENT_MESSAGES: ParentMessageItem[] = [];

// Initial Censeur Subjects List
export const INITIAL_CENSEUR_SUBJECTS: CenseurSubjectItem[] = [];

// Initial Teacher Accounts List
export const INITIAL_TEACHER_ACCOUNTS: CenseurTeacherAccount[] = [];

// Initial Parent Child Access Requests
export const INITIAL_PARENT_ACCESS_REQUESTS: ParentChildAccessRequest[] = [];

const STORAGE_KEY_SCHEDULES = "educogest_censeur_schedules_v1";
const STORAGE_KEY_ASSIGNMENTS_HISTORY = "educogest_censeur_assign_hist_v1";
const STORAGE_KEY_ATTENDANCE = "educogest_censeur_attendance_v1";
const STORAGE_KEY_ATTENDANCE_AUDIT = "educogest_censeur_att_audit_v1";
const STORAGE_KEY_HOMEWORK = "educogest_censeur_homework_v1";
const STORAGE_KEY_MESSAGES = "educogest_censeur_messages_v1";
const STORAGE_KEY_STUDENTS = "educogest_censeur_students_v1";
const STORAGE_KEY_CENSEUR_SUBJECTS = "educogest_censeur_subjects_v1";
const STORAGE_KEY_TEACHER_ACCOUNTS = "educogest_censeur_teachers_v1";
const STORAGE_KEY_PARENT_REQUESTS = "educogest_censeur_parent_requests_v1";
const STORAGE_KEY_CLASSES = "educogest_school_classes_v2";

const STORAGE_EVENT = "educogest_censeur_storage_update";
const BULLETIN_SUBJECTS_STORAGE_KEY = "educogest_bulletin_subjects_v2";
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
    STORAGE_KEY_TEACHER_ACCOUNTS,
    INITIAL_TEACHER_ACCOUNTS
  );
  try {
    const rawUsers =
      typeof window !== "undefined"
        ? localStorage.getItem("ecogest_school_users_registry")
        : null;
    if (rawUsers) {
      const users = JSON.parse(rawUsers);
      if (Array.isArray(users)) {
        const existingEmails = new Set(directTeachers.map((t) => (t.email || "").toLowerCase()));
        const extraTeachers: CenseurTeacherAccount[] = [];
        users.forEach((u: any) => {
          const role = (u.role || "").toLowerCase();
          const email = (u.email || "").toLowerCase();
          if (
            (role.includes("enseignant") || role.includes("prof")) &&
            email &&
            !existingEmails.has(email)
          ) {
            existingEmails.add(email);
            extraTeachers.push({
              id: u.id,
              name: u.name,
              identifier: (u.email || "prof").split("@")[0],
              email: u.email,
              phone: u.phone || "+229 ",
              specialty: "Enseignement Général",
              roleTitle: "Professeur Titulaire",
              status: u.status === "ACTIF" ? "ACTIF" : "INACTIF",
              assignedClasses: [],
              assignedSubjects: [],
              allowedPermissions: u.permissions || [
                "saisie_notes",
                "appel_presence",
                "cahier_textes",
              ],
              weeklyHours: 12,
              createdAt: new Date().toISOString().split("T")[0],
            });
          }
        });
        return [...directTeachers, ...extraTeachers];
      }
    }
  } catch (e) {
    console.warn("Erreur chargement comptes enseignants fusionnés:", e);
  }
  return directTeachers;
}

export function useCenseurStore() {
  const [schedules, setSchedules] = useState<TeacherCourseSchedule[]>(() =>
    safeGetStorage(STORAGE_KEY_SCHEDULES, INITIAL_TEACHER_SCHEDULES)
  );

  const [assignmentHistory, setAssignmentHistory] = useState<StudentAssignmentHistory[]>(() =>
    safeGetStorage(STORAGE_KEY_ASSIGNMENTS_HISTORY, [])
  );

  const [attendanceItems, setAttendanceItems] = useState<CenseurAttendanceItem[]>(() =>
    safeGetStorage(STORAGE_KEY_ATTENDANCE, INITIAL_ATTENDANCE_ITEMS)
  );

  const [attendanceAuditLogs, setAttendanceAuditLogs] = useState<AttendanceAuditLog[]>(() =>
    safeGetStorage(STORAGE_KEY_ATTENDANCE_AUDIT, [])
  );

  const [homeworkPrograms, setHomeworkPrograms] = useState<HomeworkProgram[]>(() =>
    safeGetStorage(STORAGE_KEY_HOMEWORK, INITIAL_HOMEWORK_PROGRAMS)
  );

  const [parentMessages, setParentMessages] = useState<ParentMessageItem[]>(() =>
    safeGetStorage(STORAGE_KEY_MESSAGES, INITIAL_PARENT_MESSAGES)
  );

  const [studentsList, setStudentsList] = useState<StudentProfile[]>(() =>
    safeGetStorage(STORAGE_KEY_STUDENTS, MOCK_BULLETIN_STUDENTS)
  );

  const [subjectsList, setSubjectsList] = useState<CenseurSubjectItem[]>(() =>
    safeGetStorage(STORAGE_KEY_CENSEUR_SUBJECTS, INITIAL_CENSEUR_SUBJECTS)
  );

  const [teacherAccounts, setTeacherAccounts] = useState<CenseurTeacherAccount[]>(() =>
    getMergedTeacherAccounts()
  );

  const [parentAccessRequests, setParentAccessRequests] = useState<ParentChildAccessRequest[]>(() =>
    safeGetStorage(STORAGE_KEY_PARENT_REQUESTS, INITIAL_PARENT_ACCESS_REQUESTS)
  );

  const [classrooms, setClassrooms] = useState<ClassRoom[]>(() =>
    safeGetStorage(STORAGE_KEY_CLASSES, MOCK_CLASSROOMS)
  );

  useEffect(() => {
    const handleUpdate = () => {
      setSchedules(safeGetStorage(STORAGE_KEY_SCHEDULES, INITIAL_TEACHER_SCHEDULES));
      setAssignmentHistory(safeGetStorage(STORAGE_KEY_ASSIGNMENTS_HISTORY, []));
      setAttendanceItems(safeGetStorage(STORAGE_KEY_ATTENDANCE, INITIAL_ATTENDANCE_ITEMS));
      setAttendanceAuditLogs(safeGetStorage(STORAGE_KEY_ATTENDANCE_AUDIT, []));
      setHomeworkPrograms(safeGetStorage(STORAGE_KEY_HOMEWORK, INITIAL_HOMEWORK_PROGRAMS));
      setParentMessages(safeGetStorage(STORAGE_KEY_MESSAGES, INITIAL_PARENT_MESSAGES));
      setStudentsList(safeGetStorage(STORAGE_KEY_STUDENTS, MOCK_BULLETIN_STUDENTS));
      setSubjectsList(safeGetStorage(STORAGE_KEY_CENSEUR_SUBJECTS, INITIAL_CENSEUR_SUBJECTS));
      setTeacherAccounts(getMergedTeacherAccounts());
      setParentAccessRequests(safeGetStorage(STORAGE_KEY_PARENT_REQUESTS, INITIAL_PARENT_ACCESS_REQUESTS));
      setClassrooms(safeGetStorage(STORAGE_KEY_CLASSES, MOCK_CLASSROOMS));
    };

    window.addEventListener(STORAGE_EVENT, handleUpdate);
    window.addEventListener(BULLETIN_STORAGE_EVENT, handleUpdate);
    window.addEventListener(SHARED_STORAGE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(STORAGE_EVENT, handleUpdate);
      window.removeEventListener(BULLETIN_STORAGE_EVENT, handleUpdate);
      window.removeEventListener(SHARED_STORAGE_EVENT, handleUpdate);
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
            return { ...s, classId: newClassId, className: newClassName };
          }
          return s;
        });
        safeSetStorage(STORAGE_KEY_STUDENTS, next);
        return next;
      });

      if (prevClassId && prevClassId !== newClassId) {
        const log: StudentAssignmentHistory = {
          id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          studentId,
          studentName,
          matricule,
          previousClassId: prevClassId,
          previousClassName: prevClassName,
          newClassId,
          newClassName,
          date: new Date().toLocaleDateString("fr-FR"),
          author,
          reason,
        };

        setAssignmentHistory((prev) => {
          const next = [log, ...prev];
          safeSetStorage(STORAGE_KEY_ASSIGNMENTS_HISTORY, next);
          return next;
        });
      }
    },
    []
  );

  // 2. Modify & confirm student attendance status with mandatory audit log
  const updateAttendanceStatus = useCallback(
    (
      attendanceId: string,
      newStatus: CenseurAttendanceItem["status"],
      reason: string,
      author: string = "Censeur des Études"
    ) => {
      let studentId = "";
      let studentName = "";
      let className = "";
      let date = "";
      let previousStatus = "";

      setAttendanceItems((prev) => {
        const next = prev.map((item) => {
          if (item.id === attendanceId) {
            studentId = item.studentId;
            studentName = item.studentName;
            className = item.className;
            date = item.date;
            previousStatus = item.status;
            return {
              ...item,
              status: newStatus,
              isConfirmedByCenseur: true,
              justificationNotes: reason || item.justificationNotes,
            };
          }
          return item;
        });
        safeSetStorage(STORAGE_KEY_ATTENDANCE, next);
        return next;
      });

      if (previousStatus && previousStatus !== newStatus) {
        const auditLog: AttendanceAuditLog = {
          id: `att-aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          studentId,
          studentName,
          className,
          date,
          time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          previousStatus,
          newStatus,
          author,
          reason: reason || "Régularisation administrative du Censeur",
        };

        setAttendanceAuditLogs((prev) => {
          const next = [auditLog, ...prev];
          safeSetStorage(STORAGE_KEY_ATTENDANCE_AUDIT, next);
          return next;
        });
      }
    },
    []
  );

  // Confirm attendance without modifying
  const confirmAttendance = useCallback((attendanceId: string) => {
    setAttendanceItems((prev) => {
      const next = prev.map((item) =>
        item.id === attendanceId ? { ...item, isConfirmedByCenseur: true } : item
      );
      safeSetStorage(STORAGE_KEY_ATTENDANCE, next);
      return next;
    });
  }, []);

  // 3. Add or update Homework / TD Program
  const addHomeworkProgram = useCallback((program: Omit<HomeworkProgram, "id">) => {
    const newItem: HomeworkProgram = {
      ...program,
      id: `hw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setHomeworkPrograms((prev) => {
      const next = [newItem, ...prev];
      safeSetStorage(STORAGE_KEY_HOMEWORK, next);
      return next;
    });
  }, []);

  const updateHomeworkStatus = useCallback((id: string, status: HomeworkProgram["status"]) => {
    setHomeworkPrograms((prev) => {
      const next = prev.map((h) => (h.id === id ? { ...h, status } : h));
      safeSetStorage(STORAGE_KEY_HOMEWORK, next);
      return next;
    });
  }, []);

  // 4. Reply to parent message
  const replyToParentMessage = useCallback(
    (messageId: string, replyText: string, repliedBy: string = "Censeur des Études") => {
      setParentMessages((prev) => {
        const next = prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                status: "REPONDU" as const,
                replyText,
                repliedAt: `${new Date().toLocaleDateString("fr-FR")} ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
                repliedBy,
              }
            : m
        );
        safeSetStorage(STORAGE_KEY_MESSAGES, next);
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
      safeSetStorage(STORAGE_KEY_MESSAGES, next);
      return next;
    });
  }, []);

  // 5. SUBJECTS MANAGEMENT (GESTION DES MATIÈRES)
  const addSubject = useCallback((subject: Omit<CenseurSubjectItem, "id">) => {
    const newSub: CenseurSubjectItem = {
      ...subject,
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setSubjectsList((prev) => {
      const next = [newSub, ...prev];
      safeSetStorage(STORAGE_KEY_CENSEUR_SUBJECTS, next);
      return next;
    });

    // Also synchronize into bulletin subjects store if relevant
    try {
      const currentBulletinSubs = safeGetStorage<SubjectConfig[]>(BULLETIN_SUBJECTS_STORAGE_KEY, MOCK_SUBJECTS);
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
        if (typeof window !== "undefined") {
          localStorage.setItem(BULLETIN_SUBJECTS_STORAGE_KEY, JSON.stringify(updated));
          window.dispatchEvent(new Event(BULLETIN_STORAGE_EVENT));
        }
      }
    } catch (e) {
      console.error("Error syncing bulletin subjects:", e);
    }
  }, []);

  const updateSubject = useCallback((id: string, updates: Partial<CenseurSubjectItem>) => {
    let updatedCode = "";
    let updatedCoef = 0;

    setSubjectsList((prev) => {
      const next = prev.map((s) => {
        if (s.id === id) {
          const res = { ...s, ...updates };
          updatedCode = res.code;
          updatedCoef = res.coef;
          return res;
        }
        return s;
      });
      safeSetStorage(STORAGE_KEY_CENSEUR_SUBJECTS, next);
      return next;
    });

    // Sync coefficient with bulletin store
    if (updates.coef && updatedCode) {
      try {
        const currentBulletinSubs = safeGetStorage<SubjectConfig[]>(BULLETIN_SUBJECTS_STORAGE_KEY, MOCK_SUBJECTS);
        const updated = currentBulletinSubs.map((s) => {
          if (s.code.toLowerCase() === updatedCode.toLowerCase()) {
            return { ...s, coef: updates.coef! };
          }
          return s;
        });
        if (typeof window !== "undefined") {
          localStorage.setItem(BULLETIN_SUBJECTS_STORAGE_KEY, JSON.stringify(updated));
          window.dispatchEvent(new Event(BULLETIN_STORAGE_EVENT));
        }
      } catch (e) {
        console.error("Error syncing coef with bulletin store:", e);
      }
    }
  }, []);

  // 6. TEACHER ACCOUNTS MANAGEMENT
  const createTeacherAccount = useCallback(
    (teacher: Omit<CenseurTeacherAccount, "id" | "createdAt">) => {
      const newTeacher: CenseurTeacherAccount = {
        ...teacher,
        id: `tea-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setTeacherAccounts((prev) => {
        const next = [newTeacher, ...prev];
        safeSetStorage(STORAGE_KEY_TEACHER_ACCOUNTS, next);
        return next;
      });
      return newTeacher;
    },
    []
  );

  const updateTeacherAccount = useCallback((id: string, updates: Partial<CenseurTeacherAccount>) => {
    setTeacherAccounts((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      safeSetStorage(STORAGE_KEY_TEACHER_ACCOUNTS, next);
      return next;
    });
  }, []);

  // 7. PARENT CHILD ACCESS REQUESTS & VALIDATION
  const submitParentAccessRequest = useCallback(
    (
      data: Omit<
        ParentChildAccessRequest,
        "id" | "requestDate" | "requestTime" | "status" | "isAccessActivated"
      >
    ) => {
      const newRequest: ParentChildAccessRequest = {
        ...data,
        id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        requestDate: new Date().toLocaleDateString("fr-FR"),
        requestTime: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        status: "EN_ATTENTE",
        isAccessActivated: false,
      };

      setParentAccessRequests((prev) => {
        const next = [newRequest, ...prev];
        safeSetStorage(STORAGE_KEY_PARENT_REQUESTS, next);
        return next;
      });
      return newRequest;
    },
    []
  );

  const validateParentAccessRequest = useCallback(
    (
      requestId: string,
      approved: boolean,
      activateAccess: boolean = true,
      reason?: string,
      validator: string = "Censeur des Études"
    ) => {
      setParentAccessRequests((prev) => {
        const next = prev.map((req) => {
          if (req.id === requestId) {
            return {
              ...req,
              status: (approved ? "ACCEPTEE" : "REFUSEE") as "ACCEPTEE" | "REFUSEE",
              isAccessActivated: approved ? activateAccess : false,
              validatedBy: validator,
              validatedAt: `${new Date().toLocaleDateString("fr-FR")} ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
              refusalReason: approved ? undefined : reason || "Demande non conforme aux dossiers d'inscription",
            };
          }
          return req;
        });
        safeSetStorage(STORAGE_KEY_PARENT_REQUESTS, next);
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
      safeSetStorage(STORAGE_KEY_PARENT_REQUESTS, next);
      return next;
    });
  }, []);

  // Helper: get authorized children for a parent
  const getAuthorizedChildrenForParent = useCallback(
    (parentIdOrPhone: string) => {
      const activeRequests = parentAccessRequests.filter(
        (r) =>
          (r.parentId === parentIdOrPhone || r.parentPhone === parentIdOrPhone) &&
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
