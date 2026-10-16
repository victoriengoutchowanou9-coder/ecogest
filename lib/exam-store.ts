"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ExamScheduleItem } from "./types/bulletin";

export const INITIAL_EXAMS: ExamScheduleItem[] = [
  {
    id: "exam-001",
    classId: "3e-a",
    className: "3ème A",
    periodId: "T1",
    periodName: "1er Trimestre",
    subjectId: "mat-fra",
    subjectName: "Français (Composition)",
    date: "2026-11-24",
    startTime: "08:00",
    endTime: "10:30",
    room: "Salle 12 (Bâtiment A)",
    supervisorName: "M. Koffi TOSSOU",
    status: "PROGRAMME",
    notes: "Épreuve écrite officielle de 2h30. Matériel de rédaction standard.",
  },
  {
    id: "exam-002",
    classId: "3e-a",
    className: "3ème A",
    periodId: "T1",
    periodName: "1er Trimestre",
    subjectId: "mat-math",
    subjectName: "Mathématiques",
    date: "2026-11-25",
    startTime: "08:00",
    endTime: "11:00",
    room: "Salle 12 (Bâtiment A)",
    supervisorName: "Prof. Justin HOUNKPONOU",
    status: "PROGRAMME",
    notes: "Calculatrice scientifique non programmable autorisée. Compas et règle requis.",
  },
  {
    id: "exam-003",
    classId: "3e-a",
    className: "3ème A",
    periodId: "T1",
    periodName: "1er Trimestre",
    subjectId: "mat-pct",
    subjectName: "Physique, Chimie & Technologie",
    date: "2026-11-26",
    startTime: "10:00",
    endTime: "12:00",
    room: "Labo Sciences",
    supervisorName: "M. Pamphile BIO",
    status: "PROGRAMME",
    notes: "Apporter la blouse blanche.",
  },
  {
    id: "exam-004",
    classId: "3e-a",
    className: "3ème A",
    periodId: "T1",
    periodName: "1er Trimestre",
    subjectId: "mat-ang",
    subjectName: "Anglais",
    date: "2026-11-27",
    startTime: "08:00",
    endTime: "10:00",
    room: "Salle 12 (Bâtiment A)",
    supervisorName: "Mme Sylvie DOSSOU",
    status: "PROGRAMME",
    notes: "Épreuve de compréhension écrite et essai.",
  },
  {
    id: "exam-005",
    classId: "ce2-b",
    className: "CE2 B",
    periodId: "T1",
    periodName: "1er Trimestre",
    subjectId: "prim-fra",
    subjectName: "Français & Communication (Dictée & Texte)",
    date: "2026-11-24",
    startTime: "08:30",
    endTime: "10:00",
    room: "Bâtiment Primaire - Salle 4",
    supervisorName: "M. Marcellin KPADONOU",
    status: "PROGRAMME",
    notes: "Évaluation sommative des compétences fondamentales.",
  },
  {
    id: "exam-006",
    classId: "ce2-b",
    className: "CE2 B",
    periodId: "T1",
    periodName: "1er Trimestre",
    subjectId: "prim-math",
    subjectName: "Mathématiques & Résolution de Problèmes",
    date: "2026-11-25",
    startTime: "08:30",
    endTime: "10:00",
    room: "Bâtiment Primaire - Salle 4",
    supervisorName: "M. Marcellin KPADONOU",
    status: "PROGRAMME",
    notes: "Arithmétique, géométrie et mesures.",
  },
  {
    id: "exam-007",
    classId: "tle-c",
    className: "Terminale C",
    periodId: "T1",
    periodName: "1er Trimestre",
    subjectId: "mat-math",
    subjectName: "Mathématiques Générales (Type Bac)",
    date: "2026-11-23",
    startTime: "08:00",
    endTime: "12:00",
    room: "Amphithéâtre Central",
    supervisorName: "Prof. Justin HOUNKPONOU",
    status: "PROGRAMME",
    notes: "Épreuve de 4 heures. Aucune sortie autorisée avant 2h d'épreuve.",
  },
];

const STORAGE_KEY_EXAMS = "educogest_exams_schedule_v1";
const STORAGE_EVENT_EXAMS = "educogest_exams_storage_update";

function safeGetStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSetStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(STORAGE_EVENT_EXAMS));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

export function useExamStore() {
  const [exams, setExams] = useState<ExamScheduleItem[]>(() =>
    safeGetStorage(STORAGE_KEY_EXAMS, INITIAL_EXAMS)
  );

  useEffect(() => {
    const handleUpdate = () => {
      setExams(safeGetStorage(STORAGE_KEY_EXAMS, INITIAL_EXAMS));
    };

    window.addEventListener(STORAGE_EVENT_EXAMS, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(STORAGE_EVENT_EXAMS, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const addExam = useCallback((item: Omit<ExamScheduleItem, "id">) => {
    const newExam: ExamScheduleItem = {
      ...item,
      id: `exam-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setExams((prev) => {
      const next = [newExam, ...prev];
      safeSetStorage(STORAGE_KEY_EXAMS, next);
      return next;
    });
    return newExam;
  }, []);

  const updateExam = useCallback((id: string, updates: Partial<ExamScheduleItem>) => {
    setExams((prev) => {
      const next = prev.map((ex) => (ex.id === id ? { ...ex, ...updates } : ex));
      safeSetStorage(STORAGE_KEY_EXAMS, next);
      return next;
    });
  }, []);

  const deleteExam = useCallback((id: string) => {
    setExams((prev) => {
      const next = prev.filter((ex) => ex.id !== id);
      safeSetStorage(STORAGE_KEY_EXAMS, next);
      return next;
    });
  }, []);

  const getExamsForClass = useCallback(
    (classId: string, periodId?: string) => {
      return exams.filter((ex) => {
        const matchClass = ex.classId === classId;
        const matchPeriod = periodId ? ex.periodId === periodId : true;
        return matchClass && matchPeriod;
      });
    },
    [exams]
  );

  return {
    exams,
    addExam,
    updateExam,
    deleteExam,
    getExamsForClass,
  };
}
