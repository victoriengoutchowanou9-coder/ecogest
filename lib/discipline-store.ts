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

export const INITIAL_DISCIPLINE_INCIDENTS: DisciplineIncident[] = [
  {
    id: "disc-init-01",
    studentId: "std-03",
    studentName: "Rodrigue KANHONOU",
    matricule: "ECO-2026-0018",
    className: "6ème A",
    date: new Date().toISOString().split("T")[0],
    incidentType: "Retard répété (15 min)",
    description: "Arrivée tardive à la première heure de cours sans justificatif parental.",
    location: "Portail principal",
    involvedParties: "Surveillant de service",
    recordedBy: "Augustin SOSSOU (Surveillant Général)",
    sanction: "Avertissement & convocation parentale",
    comment: "Dossier en attente de justification écrite du parent.",
    status: "OUVERT",
    createdAt: new Date().toISOString(),
  },
  {
    id: "disc-init-02",
    studentId: "std-05",
    studentName: "Arnaud HOUNGBEDJI",
    matricule: "ECO-2026-0028",
    className: "5ème A",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    incidentType: "Indiscipline en classe",
    description: "Refus d'obtempérer et perturbation du cours d'Histoire-Géographie.",
    location: "Salle 12",
    involvedParties: "Professeur d'Histoire-Géo et élèves témoins",
    recordedBy: "Augustin SOSSOU (Surveillant Général)",
    sanction: "Travail d'intérêt pédagogique supplémentaire",
    comment: "Devoir supplémentaire remis et validé par le professeur.",
    status: "RESOLU",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

import { getScopedStorageKey } from "./school-context";

// Statuts initiaux des élèves (propre, zéro fuite inter-établissements)
export const INITIAL_STUDENTS_WITH_STATUS: StudentProfile[] = [];

const getMedicalKey = () => getScopedStorageKey("educogest_medical_records_v3");
const getDisciplineKey = () => getScopedStorageKey("educogest_discipline_incidents_v3");
const getStudentsKey = () => getScopedStorageKey("educogest_censeur_students_v2");
const getReadmissionsKey = () => getScopedStorageKey("educogest_readmission_logs_v3");

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
    safeGetStorage(getStudentsKey(), [])
  );

  const [disciplineIncidents, setDisciplineIncidents] = useState<DisciplineIncident[]>(() =>
    safeGetStorage(getDisciplineKey(), [])
  );

  const [medicalRecords, setMedicalRecords] = useState<Record<string, MedicalRecord>>(() =>
    safeGetStorage<Record<string, MedicalRecord>>(getMedicalKey(), {})
  );

  const [readmissionLogs, setReadmissionLogs] = useState<StudentReadmissionLog[]>(() =>
    safeGetStorage(getReadmissionsKey(), [])
  );

  useEffect(() => {
    const handleUpdate = () => {
      setStudents(safeGetStorage(getStudentsKey(), []));
      setDisciplineIncidents(safeGetStorage(getDisciplineKey(), []));
      setMedicalRecords(safeGetStorage(getMedicalKey(), {}));
      setReadmissionLogs(safeGetStorage(getReadmissionsKey(), []));
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
        safeSetStorage(getMedicalKey(), next);
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
        safeSetStorage(getDisciplineKey(), next);
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
        safeSetStorage(getDisciplineKey(), next);
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
        safeSetStorage(getStudentsKey(), next);
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
        safeSetStorage(getStudentsKey(), next);
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
        safeSetStorage(getReadmissionsKey(), next);
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
