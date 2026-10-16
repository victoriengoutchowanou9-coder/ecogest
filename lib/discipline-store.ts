"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MedicalRecord,
  DisciplineIncident,
  StudentStatus,
  StudentReadmissionLog,
  StudentProfile,
} from "./types/bulletin";
import {
  encryptSensitiveField,
  decryptSensitiveField,
  logSensitiveAccess,
} from "./security/encryption";
import { MOCK_BULLETIN_STUDENTS } from "./mock-bulletin-db";

export const INITIAL_MEDICAL_RECORDS: Record<string, MedicalRecord> = {};

export const INITIAL_DISCIPLINE_INCIDENTS: DisciplineIncident[] = [];

// Statuts initiaux des élèves
export const INITIAL_STUDENTS_WITH_STATUS: StudentProfile[] = [];

const STORAGE_KEY_MEDICAL = "educogest_medical_records_enc_v2";
const STORAGE_KEY_DISCIPLINE = "educogest_discipline_incidents_v2";
const STORAGE_KEY_STUDENTS_EXT = "educogest_censeur_students_v1";
const STORAGE_KEY_READMISSIONS = "educogest_readmission_logs_v2";

const STORAGE_EVENT = "educogest_discipline_storage_update";
const SHARED_STORAGE_EVENT = "ecogest_shared_data_update";

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
    window.dispatchEvent(new Event(STORAGE_EVENT));
    window.dispatchEvent(new Event(SHARED_STORAGE_EVENT));
    window.dispatchEvent(new Event("educogest_censeur_storage_update"));
  } catch (e) {
    console.error("Discipline store storage error:", e);
  }
}

export function useDisciplineStore() {
  const [students, setStudents] = useState<StudentProfile[]>(() =>
    safeGetStorage(STORAGE_KEY_STUDENTS_EXT, INITIAL_STUDENTS_WITH_STATUS)
  );

  const [disciplineIncidents, setDisciplineIncidents] = useState<DisciplineIncident[]>(() =>
    safeGetStorage(STORAGE_KEY_DISCIPLINE, INITIAL_DISCIPLINE_INCIDENTS)
  );

  const [medicalRecords, setMedicalRecords] = useState<Record<string, MedicalRecord>>(() => {
    const stored = safeGetStorage<Record<string, MedicalRecord>>(
      STORAGE_KEY_MEDICAL,
      INITIAL_MEDICAL_RECORDS
    );
    return stored;
  });

  const [readmissionLogs, setReadmissionLogs] = useState<StudentReadmissionLog[]>(() =>
    safeGetStorage(STORAGE_KEY_READMISSIONS, [
      {
        id: "readm-init-01",
        studentId: "std-07",
        studentName: "Rodrigue KANHONOU",
        matricule: "ECO-2026-0245",
        previousClass: "4ème A (2025)",
        newClassId: "3e-a",
        newClassName: "3ème A",
        academicYear: "2026 - 2027",
        readmittedAt: "2026-09-10 09:30",
        readmittedBy: "Censeur des Études",
        observation: "Réadmission après régularisation du dossier de transfert et apurement du solde.",
      },
    ])
  );

  useEffect(() => {
    const handleUpdate = () => {
      setStudents(safeGetStorage(STORAGE_KEY_STUDENTS_EXT, INITIAL_STUDENTS_WITH_STATUS));
      setDisciplineIncidents(safeGetStorage(STORAGE_KEY_DISCIPLINE, INITIAL_DISCIPLINE_INCIDENTS));
      setMedicalRecords(safeGetStorage(STORAGE_KEY_MEDICAL, INITIAL_MEDICAL_RECORDS));
      setReadmissionLogs(safeGetStorage(STORAGE_KEY_READMISSIONS, []));
    };

    window.addEventListener(STORAGE_EVENT, handleUpdate);
    window.addEventListener(SHARED_STORAGE_EVENT, handleUpdate);
    window.addEventListener("educogest_censeur_storage_update", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(STORAGE_EVENT, handleUpdate);
      window.removeEventListener(SHARED_STORAGE_EVENT, handleUpdate);
      window.removeEventListener("educogest_censeur_storage_update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // 1. Récupération & Enregistrement sécurisé du dossier médical (Chiffrement au repos)
  const getStudentMedicalRecord = useCallback(
    (studentId: string, authorRole: string = "censeur", authorName: string = "Utilisateur"): MedicalRecord | null => {
      const rec = medicalRecords[studentId];
      if (!rec) return null;

      // Journalisation de sécurité pour traçabilité de consultation médicale
      logSensitiveAccess({
        authorName,
        authorRole,
        studentId,
        studentName: students.find((s) => s.id === studentId)?.lastName || studentId,
        dataType: "MEDICAL",
        action: "VIEW",
        details: "Consultation du dossier médical confidentiel",
      });

      return {
        ...rec,
        allergies: decryptSensitiveField(rec.allergies),
        medicalHistory: decryptSensitiveField(rec.medicalHistory),
        importantNotes: decryptSensitiveField(rec.importantNotes),
      };
    },
    [medicalRecords, students]
  );

  const saveStudentMedicalRecord = useCallback(
    (
      studentId: string,
      record: MedicalRecord,
      authorRole: string = "censeur",
      authorName: string = "Censeur des Études"
    ) => {
      // Chiffrement au repos des champs de santé sensibles
      const encryptedRecord: MedicalRecord = {
        ...record,
        allergies: encryptSensitiveField(record.allergies),
        medicalHistory: encryptSensitiveField(record.medicalHistory),
        importantNotes: encryptSensitiveField(record.importantNotes),
        updatedAt: new Date().toISOString().split("T")[0],
        updatedBy: `${authorName} (${authorRole})`,
      };

      setMedicalRecords((prev) => {
        const next = { ...prev, [studentId]: encryptedRecord };
        safeSetStorage(STORAGE_KEY_MEDICAL, next);
        return next;
      });

      // Journalisation d'audit de modification médicale
      logSensitiveAccess({
        authorName,
        authorRole,
        studentId,
        studentName: students.find((s) => s.id === studentId)?.lastName || studentId,
        dataType: "MEDICAL",
        action: "EDIT",
        details: "Mise à jour du dossier médical et antécédents",
      });
    },
    [students]
  );

  // 2. Gestion des incidents disciplinaires
  const addDisciplineIncident = useCallback(
    (
      incident: Omit<DisciplineIncident, "id" | "createdAt">,
      authorRole: string = "censeur",
      authorName: string = "Censeur des Études"
    ) => {
      const newIncident: DisciplineIncident = {
        ...incident,
        id: `disc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };

      setDisciplineIncidents((prev) => {
        const next = [newIncident, ...prev];
        safeSetStorage(STORAGE_KEY_DISCIPLINE, next);
        return next;
      });

      // Journalisation sensible
      logSensitiveAccess({
        authorName,
        authorRole,
        studentId: incident.studentId,
        studentName: incident.studentName,
        dataType: "DISCIPLINE",
        action: "EDIT",
        details: `Enregistrement d'incident disciplinaire : ${incident.incidentType} (Sanction: ${incident.sanction})`,
      });

      return newIncident;
    },
    []
  );

  const updateIncidentStatus = useCallback(
    (
      incidentId: string,
      newStatus: "OUVERT" | "EN_COURS" | "RESOLU",
      comment?: string,
      authorName: string = "Censeur des Études"
    ) => {
      setDisciplineIncidents((prev) => {
        const next = prev.map((inc) => {
          if (inc.id === incidentId) {
            return {
              ...inc,
              status: newStatus,
              comment: comment !== undefined ? comment : inc.comment,
            };
          }
          return inc;
        });
        safeSetStorage(STORAGE_KEY_DISCIPLINE, next);
        return next;
      });
    },
    []
  );

  const getIncidentsForStudent = useCallback(
    (studentId: string) => {
      return disciplineIncidents.filter((inc) => inc.studentId === studentId);
    },
    [disciplineIncidents]
  );

  // 3. Statut étudiant & Réadmission
  const updateStudentStatus = useCallback(
    (
      studentId: string,
      newStatus: StudentStatus,
      reason: string = "Modification administrative",
      author: string = "Censeur des Études"
    ) => {
      setStudents((prev) => {
        const next = prev.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s));
        safeSetStorage(STORAGE_KEY_STUDENTS_EXT, next);
        return next;
      });
    },
    []
  );

  const readmitStudent = useCallback(
    (
      studentId: string,
      newClassId: string,
      newClassName: string,
      academicYear: string = "2026 - 2027",
      observation: string = "Réadmission officielle par le Censorat",
      author: string = "Censeur des Études"
    ) => {
      let studentName = "";
      let matricule = "";
      let previousClass = "";

      setStudents((prev) => {
        const next = prev.map((s) => {
          if (s.id === studentId) {
            studentName = `${s.lastName} ${s.firstName}`;
            matricule = s.matricule;
            previousClass = s.className;
            return {
              ...s,
              status: "READMIS" as StudentStatus,
              classId: newClassId,
              className: newClassName,
            };
          }
          return s;
        });
        safeSetStorage(STORAGE_KEY_STUDENTS_EXT, next);
        return next;
      });

      const log: StudentReadmissionLog = {
        id: `readm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        studentId,
        studentName,
        matricule,
        previousClass,
        newClassId,
        newClassName,
        academicYear,
        readmittedAt: `${new Date().toLocaleDateString("fr-FR")} ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
        readmittedBy: author,
        observation,
      };

      setReadmissionLogs((prev) => {
        const next = [log, ...prev];
        safeSetStorage(STORAGE_KEY_READMISSIONS, next);
        return next;
      });

      logSensitiveAccess({
        authorName: author,
        authorRole: "censeur",
        studentId,
        studentName,
        dataType: "CONTACT_ELEVE",
        action: "READMISSION",
        details: `Réadmission dans la classe ${newClassName} (${academicYear})`,
      });

      return log;
    },
    []
  );

  return {
    students,
    disciplineIncidents,
    medicalRecords,
    readmissionLogs,
    getStudentMedicalRecord,
    saveStudentMedicalRecord,
    addDisciplineIncident,
    updateIncidentStatus,
    getIncidentsForStudent,
    updateStudentStatus,
    readmitStudent,
  };
}
