"use client";

import React, { useState } from "react";
import {
  Clock,
  AlertTriangle,
  FileCheck,
  Upload,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChildSwitcher } from "@/components/school/ChildSwitcher";
import { MOCK_STUDENTS, Student } from "@/lib/mock-data";
import { MOCK_ABSENCE_RECORDS } from "@/lib/mock-bulletin-db";
import { AbsenceRecord } from "@/lib/types/bulletin";
import { useCenseurStore } from "@/lib/censeur-store";
import { useAuthStore } from "@/lib/auth-store";

export default function ParentAbsencesRetardsPage() {
  const { user: currentUser } = useAuthStore();
  const { studentsList, parentAccessRequests } = useCenseurStore();

  const myChildren: Student[] = React.useMemo(() => {
    const parentPhone = currentUser?.phone || "";
    const parentEmail = currentUser?.email || "";
    const parentId = currentUser?.id || "";
    const parentIdent = currentUser?.identifier || "";

    const activatedRequests = parentAccessRequests.filter(
      (r) =>
        (r.parentPhone === parentPhone ||
          r.parentEmail === parentEmail ||
          r.parentId === parentId ||
          r.parentId === parentIdent) &&
        r.status === "ACCEPTEE" &&
        r.isAccessActivated
    );
    const activeStudentIds = new Set(activatedRequests.map((r) => r.studentId));
    return studentsList
      .filter((s) => activeStudentIds.has(s.id))
      .map((s) => ({
        id: s.id,
        matricule: s.matricule,
        firstName: s.firstName,
        lastName: s.lastName,
        classId: s.classId,
        className: s.className,
        gender: s.gender,
        birthDate: s.birthDate,
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        status: "INSCRIT",
        average: 0,
        rank: 0,
        absencesCount: 0,
        totalTuition: 0,
        paidTuition: 0,
        remainingTuition: 0,
        tuitionStatus: "PAID",
      }));
  }, [parentAccessRequests, studentsList]);

  const [selectedChild, setSelectedChild] = useState<Student | undefined>(myChildren[0]);
  const [records, setRecords] = useState<AbsenceRecord[]>(MOCK_ABSENCE_RECORDS);
  const [filterType, setFilterType] = useState<"ALL" | "ABSENCE" | "RETARD">("ALL");
  const [isJustifyModalOpen, setIsJustifyModalOpen] = useState(false);
  const [selectedRecordToJustify, setSelectedRecordToJustify] = useState<AbsenceRecord | null>(null);
  const [motifText, setMotifText] = useState("");

  React.useEffect(() => {
    if (myChildren.length > 0) {
      if (!selectedChild || !myChildren.some((c) => c.id === selectedChild.id)) {
        setSelectedChild(myChildren[0]);
      }
    } else {
      setSelectedChild(undefined);
    }
  }, [myChildren, selectedChild]);

  if (!selectedChild) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Suivi des Absences & Retards"
          subtitle="Journal des manquements et retards signalés"
          breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Absences & Retards" }]}
        />
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Aucun élève rattaché</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Veuillez rattacher votre enfant depuis l&apos;accueil de votre espace parent pour suivre ses absences et retards.
          </p>
        </div>
      </div>
    );
  }

  const childRecords = records.filter((r) => r.childId === selectedChild.id);
  const filtered = childRecords.filter((r) => {
    if (filterType === "ALL") return true;
    return r.type === filterType;
  });

  const totalAbsencesHeures = childRecords
    .filter((r) => r.type === "ABSENCE")
    .reduce((acc, curr) => acc + (parseInt(curr.duration) || 2), 0);

  const totalRetardsCount = childRecords.filter((r) => r.type === "RETARD").length;
  const unjustifiedCount = childRecords.filter((r) => !r.isJustified).length;

  const handleOpenJustify = (record: AbsenceRecord) => {
    setSelectedRecordToJustify(record);
    setMotifText("");
    setIsJustifyModalOpen(true);
  };

  const handleSubmitJustification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordToJustify || !motifText.trim()) return;

    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === selectedRecordToJustify.id) {
          return {
            ...r,
            isJustified: true,
            motif: motifText.trim(),
            justificationDocument: "Justificatif_Parent_EnAttenteValidation.pdf",
          };
        }
        return r;
      })
    );

    setIsJustifyModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suivi des Absences & Retards"
        subtitle={`Journal des manquements et retards signalés pour ${selectedChild.firstName} (${selectedChild.className})`}
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Absences & Retards" }]}
      />

      {/* Child Switcher */}
      <ChildSwitcher
        childrenList={myChildren}
        selectedChildId={selectedChild.id}
        onSelectChild={setSelectedChild}
      />

      {/* Summary KPI Cards (Strictly Absences & Retards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase block">Total Absences</span>
            <span className="text-2xl font-black text-rose-700 font-mono mt-1 block">
              {totalAbsencesHeures} h
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">sur le trimestre en cours</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase block">Total Retards</span>
            <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">
              {totalRetardsCount}
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">signalements en classe</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase block">À régulariser</span>
            <span className={`text-2xl font-black font-mono mt-1 block ${unjustifiedCount > 0 ? "text-rose-600" : "text-emerald-700"}`}>
              {unjustifiedCount}
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">sans justificatif officiel</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center">
            {unjustifiedCount > 0 ? (
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterType("ALL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filterType === "ALL"
              ? "bg-school-primary text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Tous les signalements ({childRecords.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType("ABSENCE")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filterType === "ABSENCE"
              ? "bg-school-primary text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Absences ({childRecords.filter((r) => r.type === "ABSENCE").length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType("RETARD")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filterType === "RETARD"
              ? "bg-school-primary text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Retards ({childRecords.filter((r) => r.type === "RETARD").length})
        </button>
      </div>

      {/* List of Absences and Retards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-900">Aucun signalement</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {selectedChild.firstName} a une assiduité exemplaire, aucune absence ni retard non régularisé enregistré.
            </p>
          </div>
        ) : (
          filtered.map((record) => (
            <div
              key={record.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                      record.type === "ABSENCE"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {record.type} &bull; {record.duration}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{record.subject}</h4>
                </div>

                <div className="flex items-center gap-2">
                  {record.isJustified ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Justifié</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenJustify(record)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-xl border border-rose-200 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Transmettre un motif</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{record.date} ({record.timeSlot})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Enseignant : {record.teacher}</span>
                </div>
                {record.justificationDocument && (
                  <div className="flex items-center gap-1.5 text-school-primary font-medium">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate">{record.justificationDocument}</span>
                  </div>
                )}
              </div>

              {record.motif && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Motif enregistré : </span>
                  <span>{record.motif}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Justification Modal */}
      {isJustifyModalOpen && selectedRecordToJustify && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">
              Justifier l&apos;absence ou le retard
            </h3>
            <p className="text-slate-600">
              Veuillez expliquer le motif de l&apos;absence pour le cours de{" "}
              <strong>{selectedRecordToJustify.subject}</strong> du{" "}
              <strong>{selectedRecordToJustify.date}</strong> ({selectedRecordToJustify.timeSlot}).
            </p>

            <form onSubmit={handleSubmitJustification} className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Motif d&apos;absence / retard
                </label>
                <textarea
                  rows={3}
                  value={motifText}
                  onChange={(e) => setMotifText(e.target.value)}
                  placeholder="Ex : Raison médicale, consultation chez le médecin..."
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-school-primary/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Document justificatif (certificat médical, etc.)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsJustifyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white font-bold"
                >
                  Soumettre au censeur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
