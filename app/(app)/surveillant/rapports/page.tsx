"use client";

import { useState, useMemo } from "react";
import {
  BarChart3,
  Printer,
  Calendar,
  AlertTriangle,
  Clock,
  UserX,
  ShieldAlert,
  Eye,
  CheckCircle,
  FileText,
  TrendingDown,
  Download,
  Filter,
} from "lucide-react";
import { useSurveillantStore } from "@/lib/surveillant-store";

export default function SurveillantRapportsPage() {
  const {
    attendance,
    incidents,
    sanctions,
    slots,
    exits,
    students,
    classrooms,
    stats,
  } = useSurveillantStore();

  const [reportType, setReportType] = useState<
    "daily" | "absences" | "lateness" | "discipline" | "frequent" | "surveillance"
  >("daily");

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // Computed data for Daily Report
  const dailyAttendance = useMemo(() => {
    return attendance.filter((a) => a.date === selectedDate);
  }, [attendance, selectedDate]);

  // Absences stats per class
  const classAbsenceStats = useMemo(() => {
    return classrooms.map((cls) => {
      const classStudents = students.filter((s) => s.className === cls.name);
      const totalStudents = classStudents.length;
      const classAbsences = attendance.filter(
        (a) =>
          a.className === cls.name &&
          (a.status === "ABSENT" || a.status === "ABS_NON_JUSTIFIEE" || a.status === "ABS_JUSTIFIEE")
      ).length;
      const classLates = attendance.filter(
        (a) => a.className === cls.name && a.status === "RETARD"
      ).length;
      const classIncidents = incidents.filter((i) => i.className === cls.name).length;

      return {
        className: cls.name,
        totalStudents,
        absences: classAbsences,
        lates: classLates,
        incidents: classIncidents,
      };
    });
  }, [classrooms, students, attendance, incidents]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 text-sm font-semibold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            Statistiques & Registres Officiels
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Rapports de Surveillance & Vie Scolaire
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Génération des bilans quotidiens de présence, registres de retards, suivi des récidives et synthèses disciplinaires.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-medium text-sm transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Imprimer ce Rapport
        </button>
      </div>

      {/* Report Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <button
          onClick={() => setReportType("daily")}
          className={`p-3 rounded-xl border text-left transition-all ${
            reportType === "daily"
              ? "bg-indigo-700 text-white border-indigo-700 shadow-sm"
              : "bg-white text-gray-700 border-gray-100 hover:border-gray-200"
          }`}
        >
          <Calendar className="w-4 h-4 mb-1" />
          <p className="text-xs font-bold">Rapport Quotidien</p>
          <span className={`text-[10px] ${reportType === "daily" ? "text-indigo-200" : "text-gray-400"}`}>
            Présence du jour
          </span>
        </button>

        <button
          onClick={() => setReportType("absences")}
          className={`p-3 rounded-xl border text-left transition-all ${
            reportType === "absences"
              ? "bg-indigo-700 text-white border-indigo-700 shadow-sm"
              : "bg-white text-gray-700 border-gray-100 hover:border-gray-200"
          }`}
        >
          <AlertTriangle className="w-4 h-4 mb-1" />
          <p className="text-xs font-bold">Bilan des Absences</p>
          <span className={`text-[10px] ${reportType === "absences" ? "text-indigo-200" : "text-gray-400"}`}>
            Par classe & motif
          </span>
        </button>

        <button
          onClick={() => setReportType("lateness")}
          className={`p-3 rounded-xl border text-left transition-all ${
            reportType === "lateness"
              ? "bg-indigo-700 text-white border-indigo-700 shadow-sm"
              : "bg-white text-gray-700 border-gray-100 hover:border-gray-200"
          }`}
        >
          <Clock className="w-4 h-4 mb-1" />
          <p className="text-xs font-bold">Registre des Retards</p>
          <span className={`text-[10px] ${reportType === "lateness" ? "text-indigo-200" : "text-gray-400"}`}>
            Minutes perdues
          </span>
        </button>

        <button
          onClick={() => setReportType("discipline")}
          className={`p-3 rounded-xl border text-left transition-all ${
            reportType === "discipline"
              ? "bg-indigo-700 text-white border-indigo-700 shadow-sm"
              : "bg-white text-gray-700 border-gray-100 hover:border-gray-200"
          }`}
        >
          <ShieldAlert className="w-4 h-4 mb-1" />
          <p className="text-xs font-bold">Bilan Disciplinaire</p>
          <span className={`text-[10px] ${reportType === "discipline" ? "text-indigo-200" : "text-gray-400"}`}>
            Incidents & sanctions
          </span>
        </button>

        <button
          onClick={() => setReportType("frequent")}
          className={`p-3 rounded-xl border text-left transition-all ${
            reportType === "frequent"
              ? "bg-indigo-700 text-white border-indigo-700 shadow-sm"
              : "bg-white text-gray-700 border-gray-100 hover:border-gray-200"
          }`}
        >
          <TrendingDown className="w-4 h-4 mb-1" />
          <p className="text-xs font-bold">Élèves Fréquents</p>
          <span className={`text-[10px] ${reportType === "frequent" ? "text-indigo-200" : "text-gray-400"}`}>
            Récidives & alertes
          </span>
        </button>

        <button
          onClick={() => setReportType("surveillance")}
          className={`p-3 rounded-xl border text-left transition-all ${
            reportType === "surveillance"
              ? "bg-indigo-700 text-white border-indigo-700 shadow-sm"
              : "bg-white text-gray-700 border-gray-100 hover:border-gray-200"
          }`}
        >
          <Eye className="w-4 h-4 mb-1" />
          <p className="text-xs font-bold">Postes de Surveillance</p>
          <span className={`text-[10px] ${reportType === "surveillance" ? "text-indigo-200" : "text-gray-400"}`}>
            Couverture des zones
          </span>
        </button>
      </div>

      {/* PRINTABLE REPORT CONTAINER */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        {/* Official Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-gray-200 gap-4 text-center sm:text-left">
          <div>
            <p className="text-xs font-bold text-gray-900 uppercase">
              RÉPUBLIQUE DU BÉNIN - MINISTÈRE DES ENSEIGNEMENTS
            </p>
            <p className="text-xs text-gray-500">
              Complexe Scolaire et Collège d'Excellence ECOGEST
            </p>
            <p className="text-xs font-semibold text-indigo-800 mt-1">
              SURVEILLANCE GÉNÉRALE - REGISTRE OFFICIEL
            </p>
          </div>
          <div className="text-xs text-gray-500 sm:text-right">
            <p>
              Date d'édition : <strong>{new Date().toLocaleDateString("fr-FR")}</strong>
            </p>
            <p>
              Réf : <strong>RAP-SG-{selectedDate}</strong>
            </p>
            <p>Responsable : Augustin SOSSOU (Surveillant Général)</p>
          </div>
        </div>

        {/* REPORT 1: DAILY ATTENDANCE */}
        {reportType === "daily" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">
                Rapport Quotidien de Présence - Journée du {selectedDate}
              </h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1 text-xs rounded-lg border border-gray-200"
              />
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500">Pointés au Registre</span>
                <p className="text-lg font-bold text-gray-900">{dailyAttendance.length}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <span className="text-xs text-emerald-700">Présents</span>
                <p className="text-lg font-bold text-emerald-800">
                  {dailyAttendance.filter((a) => a.status === "PRESENT").length}
                </p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl">
                <span className="text-xs text-rose-700">Absents</span>
                <p className="text-lg font-bold text-rose-800">
                  {dailyAttendance.filter((a) => a.status === "ABSENT" || a.status === "ABS_NON_JUSTIFIEE").length}
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <span className="text-xs text-amber-700">Retards</span>
                <p className="text-lg font-bold text-amber-800">
                  {dailyAttendance.filter((a) => a.status === "RETARD").length}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200 rounded-lg">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                  <tr>
                    <th className="p-3">Élève</th>
                    <th className="p-3">Classe</th>
                    <th className="p-3">Créneau</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3">Motif / Observation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dailyAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-400">
                        Aucun pointage enregistré pour cette date.
                      </td>
                    </tr>
                  ) : (
                    dailyAttendance.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50/50">
                        <td className="p-3 font-semibold text-gray-900">{a.studentName}</td>
                        <td className="p-3">{a.className}</td>
                        <td className="p-3 text-gray-500">{a.sessionTime}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                              a.status === "PRESENT"
                                ? "bg-emerald-100 text-emerald-800"
                                : a.status === "RETARD"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">{a.justificationNotes || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 2: ABSENCES STATS BY CLASS */}
        {reportType === "absences" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900">
              Statistiques des Absences par Classe
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200 rounded-lg">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                  <tr>
                    <th className="p-3">Classe</th>
                    <th className="p-3">Effectif</th>
                    <th className="p-3">Total Absences</th>
                    <th className="p-3">Taux d'absentéisme</th>
                    <th className="p-3">Niveau de vigilance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {classAbsenceStats.map((item) => {
                    const rate = item.totalStudents > 0 ? ((item.absences / item.totalStudents) * 100).toFixed(1) : "0.0";
                    return (
                      <tr key={item.className}>
                        <td className="p-3 font-bold text-gray-900">{item.className}</td>
                        <td className="p-3">{item.totalStudents} élèves</td>
                        <td className="p-3 text-rose-700 font-semibold">{item.absences}</td>
                        <td className="p-3 font-medium">{rate}%</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              Number(rate) > 20
                                ? "bg-rose-100 text-rose-800"
                                : Number(rate) > 10
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {Number(rate) > 20 ? "Élevé" : Number(rate) > 10 ? "Modéré" : "Normal"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 3: LATENESS REGISTER */}
        {reportType === "lateness" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900">
              Registre Exhaustif des Retards Constatés
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200 rounded-lg">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Élève</th>
                    <th className="p-3">Classe</th>
                    <th className="p-3">Durée / Détail</th>
                    <th className="p-3">Signalé par</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attendance.filter((a) => a.status === "RETARD").length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-400">
                        Aucun retard enregistré.
                      </td>
                    </tr>
                  ) : (
                    attendance
                      .filter((a) => a.status === "RETARD")
                      .map((a) => (
                        <tr key={a.id}>
                          <td className="p-3 font-mono text-gray-600">{a.date}</td>
                          <td className="p-3 font-semibold text-gray-900">{a.studentName}</td>
                          <td className="p-3">{a.className}</td>
                          <td className="p-3 text-amber-800 font-medium">
                            {a.justificationNotes || "Retard non motivé"}
                          </td>
                          <td className="p-3 text-gray-500">{a.recordedByTeacher}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 4: DISCIPLINE SUMMARY */}
        {reportType === "discipline" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900">
              Bilan Disciplinaire des Incidents et Sanctions
            </h2>
            <div className="grid grid-cols-3 gap-3 text-center mb-4">
              <div className="p-3 bg-rose-50 rounded-xl">
                <span className="text-xs text-rose-700">Incidents Consignés</span>
                <p className="text-lg font-bold text-rose-900">{incidents.length}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl">
                <span className="text-xs text-indigo-700">Sanctions Prononcées</span>
                <p className="text-lg font-bold text-indigo-900">{sanctions.length}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <span className="text-xs text-emerald-700">Incidents Résolus</span>
                <p className="text-lg font-bold text-emerald-900">
                  {incidents.filter((i) => i.status === "RESOLU").length}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200 rounded-lg">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                  <tr>
                    <th className="p-3">Élève</th>
                    <th className="p-3">Classe</th>
                    <th className="p-3">Nature du manquement</th>
                    <th className="p-3">Lieu</th>
                    <th className="p-3">Sanction / Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {incidents.map((inc) => (
                    <tr key={inc.id}>
                      <td className="p-3 font-semibold text-gray-900">{inc.studentName}</td>
                      <td className="p-3">{inc.className}</td>
                      <td className="p-3 text-rose-800 font-medium">{inc.incidentType}</td>
                      <td className="p-3 text-gray-500">{inc.location || "Enceinte scolaire"}</td>
                      <td className="p-3">
                        <span className="font-semibold text-gray-800">{inc.sanction || "Observation"}</span>
                        <span className="text-gray-400 block text-[10px]">Statut : {inc.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 5: FREQUENT ABSENTEES & REPEAT OFFENDERS */}
        {reportType === "frequent" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-2">
                Élèves Fréquemment Absents (Seuil d'alerte ≥ 2 absences)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-gray-200 rounded-lg">
                  <thead className="bg-rose-50 border-b border-rose-100 text-rose-900">
                    <tr>
                      <th className="p-3">Élève</th>
                      <th className="p-3">Classe</th>
                      <th className="p-3">Matricule</th>
                      <th className="p-3">Total Absences</th>
                      <th className="p-3">Contact Parent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.frequentAbsentees.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-gray-400">
                          Aucun élève au-dessus du seuil d'alerte.
                        </td>
                      </tr>
                    ) : (
                      stats.frequentAbsentees.map((item) => (
                        <tr key={item.student.id}>
                          <td className="p-3 font-bold text-gray-900">
                            {item.student.lastName} {item.student.firstName}
                          </td>
                          <td className="p-3">{item.student.className}</td>
                          <td className="p-3 font-mono text-gray-400">{item.student.matricule}</td>
                          <td className="p-3 font-bold text-rose-700">{item.count} absences</td>
                          <td className="p-3 text-gray-600">
                            {item.student.parentName} ({item.student.parentPhone})
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900 mb-2">
                Élèves avec Incidents Disciplinaires Répétés
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-gray-200 rounded-lg">
                  <thead className="bg-amber-50 border-b border-amber-100 text-amber-900">
                    <tr>
                      <th className="p-3">Élève</th>
                      <th className="p-3">Classe</th>
                      <th className="p-3">Nombre d'incidents</th>
                      <th className="p-3">Statut dossier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.repeatOffenders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-400">
                          Aucun dossier d'incidents répétés.
                        </td>
                      </tr>
                    ) : (
                      stats.repeatOffenders.map((item) => (
                        <tr key={item.student.id}>
                          <td className="p-3 font-bold text-gray-900">
                            {item.student.lastName} {item.student.firstName}
                          </td>
                          <td className="p-3">{item.student.className}</td>
                          <td className="p-3 font-bold text-amber-700">{item.count} incident{item.count > 1 ? "s" : ""}</td>
                          <td className="p-3 text-indigo-700 font-semibold">Suivi Vie Scolaire Actif</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 6: SURVEILLANCE POSTS COVERAGE */}
        {reportType === "surveillance" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900">
              Rapport de Couverture des Postes de Surveillance
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200 rounded-lg">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                  <tr>
                    <th className="p-3">Jour</th>
                    <th className="p-3">Zone de surveillance</th>
                    <th className="p-3">Créneau horaire</th>
                    <th className="p-3">Surveillant en charge</th>
                    <th className="p-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {slots.map((slot) => (
                    <tr key={slot.id}>
                      <td className="p-3 font-bold text-gray-900">{slot.dayOfWeek}</td>
                      <td className="p-3 font-semibold text-teal-800">{slot.zone}</td>
                      <td className="p-3 font-mono">{slot.timeSlot}</td>
                      <td className="p-3">{slot.surveillantName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-emerald-100 text-emerald-800">
                          {slot.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Signatures Footer */}
        <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-gray-200 text-xs text-center">
          <div>
            <p className="font-semibold text-gray-700">Le Surveillant Général</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Augustin SOSSOU</p>
            <div className="h-12 mt-2 flex items-center justify-center text-gray-300 italic">
              [Signature & Registre]
            </div>
          </div>
          <div>
            <p className="font-semibold text-gray-700">Vu et Approuvé par la Direction</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Chef d'Établissement</p>
            <div className="h-12 mt-2 flex items-center justify-center text-gray-300 italic">
              [Cachet officiel]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
