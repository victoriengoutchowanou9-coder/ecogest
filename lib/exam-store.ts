"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ExamScheduleItem } from "./types/bulletin";
import { getScopedStorageKey } from "./school-context";

export const INITIAL_EXAMS: ExamScheduleItem[] = [];

const BASE_STORAGE_KEY_EXAMS = "educogest_exams_schedule_v2";
const STORAGE_EVENT_EXAMS = "educogest_exams_storage_update";

function getExamsKey(): string {
  return getScopedStorageKey(BASE_STORAGE_KEY_EXAMS);
}

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
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

export function useExamStore() {
  const [exams, setExams] = useState<ExamScheduleItem[]>(() =>
    safeGetStorage(getExamsKey(), INITIAL_EXAMS)
  );

  useEffect(() => {
    const handleUpdate = () => {
      setExams(safeGetStorage(getExamsKey(), INITIAL_EXAMS));
    };

    window.addEventListener(STORAGE_EVENT_EXAMS, handleUpdate);
    window.addEventListener("educogest_school_switched", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(STORAGE_EVENT_EXAMS, handleUpdate);
      window.removeEventListener("educogest_school_switched", handleUpdate);
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
      safeSetStorage(getExamsKey(), next);
      return next;
    });
    return newExam;
  }, []);

  const updateExam = useCallback((id: string, updates: Partial<ExamScheduleItem>) => {
    setExams((prev) => {
      const next = prev.map((ex) => (ex.id === id ? { ...ex, ...updates } : ex));
      safeSetStorage(getExamsKey(), next);
      return next;
    });
  }, []);

  const deleteExam = useCallback((id: string) => {
    setExams((prev) => {
      const next = prev.filter((ex) => ex.id !== id);
      safeSetStorage(getExamsKey(), next);
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
