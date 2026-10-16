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
  BulletinStatus,
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
const STORAGE_KEY_CLASSES = "educogest_school_classes_v2";
const STORAGE_KEY_STATUSES = "educogest_bulletin_statuses_v2";

const STORAGE_EVENT = "educogest_bulletin_storage_update";

// Par défaut, la classe 3ème A et CE2 B sont publiées pour la démo initiale
const INITIAL_BULLETIN_STATUSES: Record<string, BulletinStatus> = {
  "3e-a-T1": "PUBLIE",
  "ce2-b-T1": "PUBLIE",
};

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
 * Connects Enseignant, Censeur, Directeur and Parent spaces to the exact same source of truth.
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

  const [classrooms, setClassrooms] = useState<ClassRoom[]>(() =>
    safeGetStorage(STORAGE_KEY_CLASSES, MOCK_CLASSROOMS)
  );

  const [bulletinStatuses, setBulletinStatuses] = useState<Record<string, BulletinStatus>>(() =>
    safeGetStorage(STORAGE_KEY_STATUSES, INITIAL_BULLETIN_STATUSES)
  );

  const school = MOCK_SCHOOL_SETTINGS;
  const years = MOCK_ACADEMIC_YEARS;
  const periods = MOCK_ACADEMIC_PERIODS;
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
      setClassrooms(safeGetStorage(STORAGE_KEY_CLASSES, MOCK_CLASSROOMS));
      setBulletinStatuses(safeGetStorage(STORAGE_KEY_STATUSES, INITIAL_BULLETIN_STATUSES));
    };

    window.addEventListener(STORAGE_EVENT, handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener(STORAGE_EVENT, handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  /**
   * 1. Add / Update Classroom configuration dynamically
   */
  const saveClassroom = useCallback((cls: ClassRoom) => {
    setClassrooms((prev) => {
      const idx = prev.findIndex((c) => c.id === cls.id);
      let next: ClassRoom[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = cls;
      } else {
        next = [...prev, cls];
      }
      safeSetStorage(STORAGE_KEY_CLASSES, next);
      return next;
    });
  }, []);

  const deleteClassroom = useCallback((classId: string) => {
    setClassrooms((prev) => {
      const next = prev.filter((c) => c.id !== classId);
      safeSetStorage(STORAGE_KEY_CLASSES, next);
      return next;
    });
  }, []);

  /**
   * 2. Define / update subject coefficient
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
        reason: "Actualisation du coefficient matière",
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
   * 3. Update a student's grade or teacher appreciation in a specific subject
   */
  const updateStudentGrade = useCallback(
    (
      studentId: string,
      subjectId: string,
      periodId: string,
      updates: Partial<GradeRecord>,
      authorName: string = "Enseignant",
      authorRole: "enseignant" | "censeur" = "enseignant",
      reason?: string
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

      if (reason || authorRole === "censeur") {
        const logEntry: BulletinAuditLog = {
          id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          bulletinId: studentId,
          date: new Date().toISOString(),
          authorName,
          authorRole,
          action: "RECTIFICATION_NOTE",
          subjectName: subjects.find((s) => s.id === subjectId)?.name || subjectId,
          fieldName: "notes",
          newValue: JSON.stringify(updates),
          reason: reason || "Mise à jour des notes par le Censeur",
        };
        setAuditLogs((prev) => {
          const next = [logEntry, ...prev];
          safeSetStorage(STORAGE_KEY_AUDIT, next);
          return next;
        });
      }
    },
    [subjects]
  );

  /**
   * 4. Supprimer une note selon permissions avec historique obligatoire
   */
  const deleteStudentGrade = useCallback(
    (
      studentId: string,
      subjectId: string,
      periodId: string,
      reason: string = "Suppression de note injustifiée ou erronée",
      authorName: string = "Censeur des Études"
    ) => {
      let previousValues = "";
      setGrades((prev) => {
        const target = prev.find(
          (g) => g.studentId === studentId && g.subjectId === subjectId && g.periodId === periodId
        );
        if (target) {
          previousValues = `Int1:${target.interro1}, Int2:${target.interro2}, Dev1:${target.devoir1}, Dev2:${target.devoir2}`;
        }
        const next = prev.filter(
          (g) => !(g.studentId === studentId && g.subjectId === subjectId && g.periodId === periodId)
        );
        safeSetStorage(STORAGE_KEY_GRADES, next);
        return next;
      });

      const logEntry: BulletinAuditLog = {
        id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        bulletinId: studentId,
        date: new Date().toISOString(),
        authorName,
        authorRole: "censeur",
        action: "SUPPRESSION_NOTE",
        subjectName: subjects.find((s) => s.id === subjectId)?.name || subjectId,
        previousValue: previousValues,
        newValue: "[Supprimé]",
        reason,
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
   * 5. WORKFLOW CENSEUR : Validation des notes, du bulletin et publication
   */
  const setBulletinStatusForTarget = useCallback(
    (
      targetKey: string, // e.g. "3e-a-T1" (classe) ou "std-01-T1" (élève)
      status: BulletinStatus,
      actionName: string,
      reason?: string,
      authorName: string = "Censeur des Études"
    ) => {
      setBulletinStatuses((prev) => {
        const next = { ...prev, [targetKey]: status };
        safeSetStorage(STORAGE_KEY_STATUSES, next);
        return next;
      });

      const logEntry: BulletinAuditLog = {
        id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        bulletinId: targetKey,
        date: new Date().toISOString(),
        authorName,
        authorRole: "censeur",
        action: actionName,
        previousValue: bulletinStatuses[targetKey] || "BROUILLON",
        newValue: status,
        reason: reason || `Changement de statut vers ${status}`,
      };

      setAuditLogs((prev) => {
        const next = [logEntry, ...prev];
        safeSetStorage(STORAGE_KEY_AUDIT, next);
        return next;
      });
    },
    [bulletinStatuses]
  );

  const validateSubjectGrades = useCallback(
    (classId: string, subjectId: string, periodId: string, authorName: string = "Censeur des Études") => {
      setGrades((prev) => {
        const next = prev.map((g) => {
          if (g.subjectId === subjectId && g.periodId === periodId) {
            return { ...g, isValidated: true };
          }
          return g;
        });
        safeSetStorage(STORAGE_KEY_GRADES, next);
        return next;
      });

      const logEntry: BulletinAuditLog = {
        id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        bulletinId: `${classId}-${periodId}`,
        date: new Date().toISOString(),
        authorName,
        authorRole: "censeur",
        action: "VALIDATION_NOTES_MATIERE",
        subjectName: subjects.find((s) => s.id === subjectId)?.name || subjectId,
        reason: "Validation certifiée des notes par le Censeur des études",
      };
      setAuditLogs((prev) => {
        const next = [logEntry, ...prev];
        safeSetStorage(STORAGE_KEY_AUDIT, next);
        return next;
      });
    },
    [subjects]
  );

  const validateWholeBulletin = useCallback(
    (targetKey: string, authorName: string = "Censeur des Études") => {
      setBulletinStatusForTarget(targetKey, "VALIDE", "VALIDATION_BULLETIN", "Validation officielle du bulletin", authorName);
    },
    [setBulletinStatusForTarget]
  );

  const requestCorrection = useCallback(
    (targetKey: string, reason: string, authorName: string = "Censeur des Études") => {
      setBulletinStatusForTarget(
        targetKey,
        "CORRECTION_DEMANDEE",
        "DEMANDE_CORRECTION",
        reason || "Demande formelle de correction de note adressée à l'enseignant",
        authorName
      );
    },
    [setBulletinStatusForTarget]
  );

  const publishBulletin = useCallback(
    (targetKey: string, authorName: string = "Censeur des Études") => {
      setBulletinStatusForTarget(
        targetKey,
        "PUBLIE",
        "PUBLICATION_OFFICIELLE",
        "Publication officielle des bulletins aux parents et élèves",
        authorName
      );
    },
    [setBulletinStatusForTarget]
  );

  const republishBulletin = useCallback(
    (targetKey: string, reason: string = "Republication après révision", authorName: string = "Censeur des Études") => {
      setBulletinStatusForTarget(
        targetKey,
        "MODIFIE_APRES_PUBLICATION",
        "REPUBLICATION",
        reason,
        authorName
      );
    },
    [setBulletinStatusForTarget]
  );

  const unpublishBulletin = useCallback(
    (targetKey: string, authorName: string = "Censeur des Études") => {
      setBulletinStatusForTarget(
        targetKey,
        "EN_VERIFICATION",
        "RETRAIT_PUBLICATION",
        "Suspension de la consultation parentale pour vérification administrative",
        authorName
      );
    },
    [setBulletinStatusForTarget]
  );

  const isBulletinPublished = useCallback(
    (studentId: string, classId: string, periodId: string): boolean => {
      // Vérifie si le bulletin individuel ou le bulletin de la classe entière est PUBLIE ou MODIFIE_APRES_PUBLICATION
      const studentStatus = bulletinStatuses[`${studentId}-${periodId}`];
      const classStatus = bulletinStatuses[`${classId}-${periodId}`];
      const effectiveStatus = studentStatus || classStatus || "BROUILLON";
      return effectiveStatus === "PUBLIE" || effectiveStatus === "MODIFIE_APRES_PUBLICATION";
    },
    [bulletinStatuses]
  );

  /**
   * 6. Compute all bulletins for a classroom and period dynamically
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

      // Status map
      const classStatus = bulletinStatuses[`${classId}-${periodId}`];
      const statusMap = new Map<string, BulletinStatus>();
      classStudents.forEach((std) => {
        const individualStatus = bulletinStatuses[`${std.id}-${periodId}`];
        if (individualStatus) {
          statusMap.set(std.id, individualStatus);
        } else if (classStatus) {
          statusMap.set(std.id, classStatus);
        }
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
        auditMap,
        statusMap
      );
    },
    [classrooms, periods, years, students, school, subjects, grades, teachers, auditLogs, bulletinStatuses]
  );

  /**
   * 7. Retrieve a single student's official bulletin (Secondaire)
   */
  const getStudentBulletin = useCallback(
    (studentId: string, classId: string = "3e-a", periodId: string = "T1"): ComputedBulletin | null => {
      const map = getClassBulletins(classId, periodId);
      return map.get(studentId) || null;
    },
    [getClassBulletins]
  );

  /**
   * 8. Saisie d'une compétence pour le Cycle Primaire
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
   * 9. Calcul des bulletins du Cycle Primaire
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

      const classStatus = bulletinStatuses[`${classId}-${periodId}`];
      const statusMap = new Map<string, BulletinStatus>();
      classStudents.forEach((std) => {
        const individualStatus = bulletinStatuses[`${std.id}-${periodId}`];
        if (individualStatus) {
          statusMap.set(std.id, individualStatus);
        } else if (classStatus) {
          statusMap.set(std.id, classStatus);
        }
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
        auditMap,
        statusMap
      );
    },
    [classrooms, periods, years, students, school, primaryDomains, primaryCompetencies, primaryGrades, primaryCompetencyLevels, auditLogs, bulletinStatuses]
  );

  /**
   * 10. Récupération du bulletin primaire individuel
   */
  const getPrimaryStudentBulletin = useCallback(
    (studentId: string, classId: string = "ce2-b", periodId: string = "T1"): ComputedPrimaryBulletin | null => {
      const map = getPrimaryClassBulletins(classId, periodId);
      return map.get(studentId) || null;
    },
    [getPrimaryClassBulletins]
  );

  /**
   * 11. Reset to defaults
   */
  const resetToDefaults = useCallback(() => {
    safeSetStorage(STORAGE_KEY_SUBJECTS, MOCK_SUBJECTS);
    safeSetStorage(STORAGE_KEY_GRADES, MOCK_GRADE_RECORDS);
    safeSetStorage(STORAGE_KEY_PRIMARY_GRADES, MOCK_PRIMARY_GRADE_RECORDS);
    safeSetStorage(STORAGE_KEY_AUDIT, []);
    safeSetStorage(STORAGE_KEY_CLASSES, MOCK_CLASSROOMS);
    safeSetStorage(STORAGE_KEY_STATUSES, INITIAL_BULLETIN_STATUSES);
    setSubjects(MOCK_SUBJECTS);
    setGrades(MOCK_GRADE_RECORDS);
    setPrimaryGrades(MOCK_PRIMARY_GRADE_RECORDS);
    setAuditLogs([]);
    setClassrooms(MOCK_CLASSROOMS);
    setBulletinStatuses(INITIAL_BULLETIN_STATUSES);
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
    bulletinStatuses,
    saveClassroom,
    deleteClassroom,
    updateSubjectCoef,
    updateStudentGrade,
    deleteStudentGrade,
    updatePrimaryStudentCompetency,
    validateSubjectGrades,
    validateWholeBulletin,
    requestCorrection,
    publishBulletin,
    republishBulletin,
    unpublishBulletin,
    isBulletinPublished,
    getClassBulletins,
    getStudentBulletin,
    getPrimaryClassBulletins,
    getPrimaryStudentBulletin,
    resetToDefaults,
  };
}
