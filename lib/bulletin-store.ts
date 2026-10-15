"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  MOCK_BULLETIN_STUDENTS,
  MOCK_SCHOOL_SETTINGS,
  MOCK_ACADEMIC_YEARS,
  MOCK_ACADEMIC_PERIODS,
  MOCK_CLASSROOMS,
  MOCK_SUBJECTS,
  MOCK_GRADE_RECORDS,
  MOCK_TEACHERS,
  MOCK_PRIMARY_DOMAINS,
  MOCK_PRIMARY_COMPETENCIES,
  MOCK_PRIMARY_GRADE_RECORDS,
  DEFAULT_COMPETENCY_LEVELS,
} from "./mock-bulletin-db";
import {
  SubjectConfig,
  GradeRecord,
  StudentProfile,
  AcademicPeriod,
  AcademicYear,
  ClassRoom,
  SchoolSettings,
  TeacherInfo,
  ComputedBulletin,
  ComputedPrimaryBulletin,
  BulletinAuditLog,
  CompetencyDomain,
  CompetencyItem,
  CompetencyLevelDefinition,
  CompetencyGradeRecord,
  EducationCycle,
} from "./types/bulletin";
import {
  computeClassBulletins,
  computePrimaryClassBulletins,
  roundToTwoDecimals,
} from "./bulletin-utils";

const STORAGE_KEY_SUBJECTS = "educogest_bulletin_subjects_v2";
const STORAGE_KEY_GRADES = "educogest_bulletin_grades_v2";
const STORAGE_KEY_AUDIT = "educogest_bulletin_audit_v2";
const STORAGE_KEY_PRIMARY_GRADES = "educogest_bulletin_primary_grades_v1";

const STORAGE_EVENT = "educogest_bulletin_storage_update";

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
  } catch (e) {
    console.error("Failed to save bulletin data to localStorage:", e);
  }
}

/**
 * Unified React Hook for shared Bulletin & Evaluation state
 * Connects Enseignant and Parent spaces to the exact same source of truth.
 */
export function useBulletinStore() {
  const [subjects, setSubjects] = useState<SubjectConfig[]>(() =>
    safeGetStorage(STORAGE_KEY_SUBJECTS, MOCK_SUBJECTS)
  );

  const [grades, setGrades] = useState<GradeRecord[]>(() =>
    safeGetStorage(STORAGE_KEY_GRADES, MOCK_GRADE_RECORDS)
  );

  const [primaryGrades, setPrimaryGrades] = useState<CompetencyGradeRecord[]>(() =>
    safeGetStorage(STORAGE_KEY_PRIMARY_GRADES, MOCK_PRIMARY_GRADE_RECORDS)
  );

  const [auditLogs, setAuditLogs] = useState<BulletinAuditLog[]>(() =>
    safeGetStorage(STORAGE_KEY_AUDIT, [])
  );

  const school = MOCK_SCHOOL_SETTINGS;
  const years = MOCK_ACADEMIC_YEARS;
  const periods = MOCK_ACADEMIC_PERIODS;
  const classrooms = MOCK_CLASSROOMS;
  const teachers = MOCK_TEACHERS;
  const students = MOCK_BULLETIN_STUDENTS;
  const primaryDomains = MOCK_PRIMARY_DOMAINS;
  const primaryCompetencies = MOCK_PRIMARY_COMPETENCIES;
  const primaryCompetencyLevels = DEFAULT_COMPETENCY_LEVELS;

  // Sync across tabs and components
  useEffect(() => {
    const handleStorageUpdate = () => {
      setSubjects(safeGetStorage(STORAGE_KEY_SUBJECTS, MOCK_SUBJECTS));
      setGrades(safeGetStorage(STORAGE_KEY_GRADES, MOCK_GRADE_RECORDS));
      setPrimaryGrades(safeGetStorage(STORAGE_KEY_PRIMARY_GRADES, MOCK_PRIMARY_GRADE_RECORDS));
      setAuditLogs(safeGetStorage(STORAGE_KEY_AUDIT, []));
    };

    window.addEventListener(STORAGE_EVENT, handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener(STORAGE_EVENT, handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  /**
   * 1. Define / update subject coefficient (by teacher for their subject)
   */
  const updateSubjectCoef = useCallback(
    (subjectId: string, newCoef: number, authorName: string = "Enseignant") => {
      const validCoef = Math.max(1, Math.min(10, Math.round(newCoef)));
      let prevCoef = 1;

      setSubjects((prev) => {
        const next = prev.map((s) => {
          if (s.id === subjectId) {
            prevCoef = s.coef;
            return { ...s, coef: validCoef };
          }
          return s;
        });
        safeSetStorage(STORAGE_KEY_SUBJECTS, next);
        return next;
      });

      // Audit entry
      const logEntry: BulletinAuditLog = {
        id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        bulletinId: `all-${subjectId}`,
        date: new Date().toISOString(),
        authorName,
        authorRole: "enseignant",
        action: "MODIFICATION_COEF",
        subjectName: subjects.find((s) => s.id === subjectId)?.name || subjectId,
        fieldName: "coef",
        previousValue: String(prevCoef),
        newValue: String(validCoef),
        reason: "Actualisation du coefficient matière par l'enseignant",
      };

      setAuditLogs((prev) => {
        const next = [logEntry, ...prev];
        safeSetStorage(STORAGE_KEY_AUDIT, next);
        return next;
      });
    },
    [subjects]
  );

  /**
   * 2. Update a student's grade or teacher appreciation in a specific subject
   */
  const updateStudentGrade = useCallback(
    (
      studentId: string,
      subjectId: string,
      periodId: string,
      updates: Partial<GradeRecord>,
      authorName: string = "Enseignant"
    ) => {
      setGrades((prev) => {
        const existingIdx = prev.findIndex(
          (g) => g.studentId === studentId && g.subjectId === subjectId && g.periodId === periodId
        );

        let next: GradeRecord[];
        if (existingIdx >= 0) {
          next = [...prev];
          next[existingIdx] = {
            ...next[existingIdx],
            ...updates,
          };
        } else {
          const newRecord: GradeRecord = {
            id: `g-${studentId}-${subjectId}-${periodId}`,
            studentId,
            subjectId,
            periodId,
            ...updates,
          };
          next = [...prev, newRecord];
        }

        safeSetStorage(STORAGE_KEY_GRADES, next);
        return next;
      });
    },
    []
  );

  /**
   * 3. Compute all bulletins for a classroom and period dynamically
   */
  const getClassBulletins = useCallback(
    (classId: string = "3e-a", periodId: string = "T1") => {
      const activeClass = classrooms.find((c) => c.id === classId) || classrooms[0];
      const activePeriod = periods.find((p) => p.id === periodId) || periods[0];
      const activeYear = years[0];
      const classStudents = students.filter((s) => s.classId === classId);

      const auditMap = new Map<string, BulletinAuditLog[]>();
      auditLogs.forEach((log) => {
        const current = auditMap.get(log.bulletinId) || [];
        current.push(log);
        auditMap.set(log.bulletinId, current);
      });

      return computeClassBulletins(
        school,
        activeYear,
        activePeriod,
        activeClass,
        classStudents.length > 0 ? classStudents : students,
        subjects,
        grades,
        teachers,
        auditMap
      );
    },
    [classrooms, periods, years, students, school, subjects, grades, teachers, auditLogs]
  );

  /**
   * 4. Retrieve a single student's official bulletin (Secondaire)
   */
  const getStudentBulletin = useCallback(
    (studentId: string, classId: string = "3e-a", periodId: string = "T1"): ComputedBulletin | null => {
      const map = getClassBulletins(classId, periodId);
      return map.get(studentId) || null;
    },
    [getClassBulletins]
  );

  /**
   * 5. Saisie / actualisation d'une compétence pour un élève du Cycle Primaire
   */
  const updatePrimaryStudentCompetency = useCallback(
    (
      studentId: string,
      competencyId: string,
      periodId: string,
      levelCode: string,
      teacherObservation?: string,
      noteSur10?: number | null
    ) => {
      setPrimaryGrades((prev) => {
        const existingIdx = prev.findIndex(
          (g) => g.studentId === studentId && g.competencyId === competencyId && g.periodId === periodId
        );

        let next: CompetencyGradeRecord[];
        if (existingIdx >= 0) {
          next = [...prev];
          next[existingIdx] = {
            ...next[existingIdx],
            levelCode,
            teacherObservation: teacherObservation !== undefined ? teacherObservation : next[existingIdx].teacherObservation,
            noteSur10: noteSur10 !== undefined ? noteSur10 : next[existingIdx].noteSur10,
            assessedAt: new Date().toISOString(),
          };
        } else {
          const newRecord: CompetencyGradeRecord = {
            id: `cgr-${studentId}-${competencyId}-${periodId}`,
            studentId,
            competencyId,
            periodId,
            levelCode,
            teacherObservation: teacherObservation || null,
            noteSur10: noteSur10 ?? null,
            assessedAt: new Date().toISOString(),
          };
          next = [...prev, newRecord];
        }

        safeSetStorage(STORAGE_KEY_PRIMARY_GRADES, next);
        return next;
      });
    },
    []
  );

  /**
   * 6. Calcul des bulletins officiels d'une classe du Cycle Primaire
   */
  const getPrimaryClassBulletins = useCallback(
    (classId: string = "ce2-b", periodId: string = "T1") => {
      const activeClass = classrooms.find((c) => c.id === classId) || classrooms[1];
      const activePeriod = periods.find((p) => p.id === periodId) || periods[0];
      const activeYear = years[0];
      const classStudents = students.filter((s) => s.classId === classId);

      const auditMap = new Map<string, BulletinAuditLog[]>();
      auditLogs.forEach((log) => {
        const current = auditMap.get(log.bulletinId) || [];
        current.push(log);
        auditMap.set(log.bulletinId, current);
      });

      return computePrimaryClassBulletins(
        school,
        activeYear,
        activePeriod,
        activeClass,
        classStudents.length > 0 ? classStudents : students.filter((s) => s.cycle === "PRIMAIRE"),
        primaryDomains,
        primaryCompetencies,
        primaryGrades,
        primaryCompetencyLevels,
        auditMap
      );
    },
    [classrooms, periods, years, students, school, primaryDomains, primaryCompetencies, primaryGrades, primaryCompetencyLevels, auditLogs]
  );

  /**
   * 7. Récupération du bulletin d'un élève spécifique du Primaire
   */
  const getPrimaryStudentBulletin = useCallback(
    (studentId: string, classId: string = "ce2-b", periodId: string = "T1"): ComputedPrimaryBulletin | null => {
      const map = getPrimaryClassBulletins(classId, periodId);
      return map.get(studentId) || null;
    },
    [getPrimaryClassBulletins]
  );

  /**
   * 8. Reset all grades and coefficients to system defaults
   */
  const resetToDefaults = useCallback(() => {
    safeSetStorage(STORAGE_KEY_SUBJECTS, MOCK_SUBJECTS);
    safeSetStorage(STORAGE_KEY_GRADES, MOCK_GRADE_RECORDS);
    safeSetStorage(STORAGE_KEY_PRIMARY_GRADES, MOCK_PRIMARY_GRADE_RECORDS);
    safeSetStorage(STORAGE_KEY_AUDIT, []);
    setSubjects(MOCK_SUBJECTS);
    setGrades(MOCK_GRADE_RECORDS);
    setPrimaryGrades(MOCK_PRIMARY_GRADE_RECORDS);
    setAuditLogs([]);
  }, []);

  return {
    subjects,
    grades,
    primaryGrades,
    primaryDomains,
    primaryCompetencies,
    primaryCompetencyLevels,
    students,
    classrooms,
    teachers,
    periods,
    years,
    school,
    auditLogs,
    updateSubjectCoef,
    updateStudentGrade,
    updatePrimaryStudentCompetency,
    getClassBulletins,
    getStudentBulletin,
    getPrimaryClassBulletins,
    getPrimaryStudentBulletin,
    resetToDefaults,
  };
}
