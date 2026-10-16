"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  History,
  Lock,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordCard } from "@/components/ui/RecordCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { useDisciplineStore } from "@/lib/discipline-store";
import { useBulletinStore } from "@/lib/bulletin-store";
import { DisciplineModal } from "@/components/school/DisciplineModal";
import { DisciplineIncident, StudentProfile } from "@/lib/types/bulletin";

export default function CenseurDisciplinePage() {
  const { toast } = useToast();
  const { disciplineIncidents, students, updateIncidentStatus } = useDisciplineStore();
  const { classrooms } = useBulletinStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");

  const [selectedStudentForModal, setSelectedStudentForModal] = useState<StudentProfile | null>(null);

  const filteredIncidents = useMemo(() => {
    return disciplineIncidents.filter((inc) => {
      const matchSearch =
        inc.studentName.toLowerCase().includes(search.toLowerCase()) ||
        inc.matricule.toLowerCase().includes(search.toLowerCase()) ||
        inc.incidentType.toLowerCase().includes(search.toLowerCase()) ||
        inc.description.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || inc.status === statusFilter;
      const matchClass = classFilter === "ALL" || inc.className.includes(classFilter);
      return matchSearch && matchStatus && matchClass;
    });
  }, [disciplineIncidents, search, statusFilter, classFilter]);

  const handleStatusChange = (id: string, newStatus: "OUVERT" | "EN_COURS" | "RESOLU") => {
    updateIncidentStatus(id, newStatus);
    toast(`Statut de l'incident mis à jour : ${newStatus}`, "success");
  };

  const columns: Column<DisciplineIncident>[] = [
    {
      key: "date",
      header: "Date & Lieu",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 text-xs sm:text-sm">{item.date}</span>
          <span className="block text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400" />
            {item.location}
          </span>
        </div>
      ),
    },
    {
      key: "student",
      header: "Élève & Classe",
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 text-xs sm:text-sm">{item.studentName}</span>
          <span className="block text-[11px] text-slate-500 font-mono">
            {item.matricule} &bull; {item.className}
          </span>
        </div>
      ),
    },
    {
      key: "incidentType",
      header: "Nature de l'incident",
      render: (item) => (
        <div className="max-w-xs">
          <span className="font-bold text-slate-900 text-xs block">{item.incidentType}</span>
          <span className="text-[11px] text-slate-600 line-clamp-2">{item.description}</span>
        </div>
      ),
    },
    {
      key: "sanction",
      header: "Mesure ou Sanction prise",
      render: (item) => (
        <div>
          <span className="font-bold text-rose-700 text-xs">{item.sanction}</span>
          <span className="block text-[11px] text-slate-500">Par : {item.recordedBy}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (item) => (
        <select
          value={item.status}
          onChange={(e) =>
            handleStatusChange(item.id, e.target.value as "OUVERT" | "EN_COURS" | "RESOLU")
          }
          className={`text-xs font-bold py-1 px-2.5 rounded-lg border focus:outline-none ${
            item.status === "RESOLU"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : item.status === "EN_COURS"
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <option value="OUVERT">OUVERT</option>
          <option value="EN_COURS">EN COURS</option>
          <option value="RESOLU">RÉSOLU</option>
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion de la Discipline & Conduite"
        subtitle="Enregistrement officiel des incidents disciplinaires, sanctions, suivi et conservation intégrale de l'historique"
        breadcrumbs={[{ label: "Censeur", href: "/censeur" }, { label: "Discipline" }]}
        actions={
          <button
            type="button"
            onClick={() => setSelectedStudentForModal(students[0] || null)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Enregistrer un incident</span>
          </button>
        }
      />

      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Dossiers Résolus
            </span>
            <span className="text-xl font-black text-emerald-600">
              {disciplineIncidents.filter((i) => i.status === "RESOLU").length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Incidents En Cours
            </span>
            <span className="text-xl font-black text-amber-600">
              {disciplineIncidents.filter((i) => i.status === "EN_COURS").length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Incidents Enregistrés
            </span>
            <span className="text-xl font-black text-slate-900">
              {disciplineIncidents.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par élève, matricule, fait..."
        filters={[
          {
            key: "status",
            label: "Statut du dossier",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "ALL", label: "Tous les statuts" },
              { value: "OUVERT", label: "Ouvert" },
              { value: "EN_COURS", label: "En cours" },
              { value: "RESOLU", label: "Résolu" },
            ],
          },
        ]}
        onReset={() => {
          setSearch("");
          setStatusFilter("ALL");
          setClassFilter("ALL");
        }}
      />

      <DataTable
        data={filteredIncidents}
        columns={columns}
        keyExtractor={(item) => item.id}
        renderMobileCard={(item) => (
          <RecordCard
            title={item.studentName}
            subtitle={`${item.className} • ${item.incidentType}`}
            badge={<span className="text-xs font-bold">{item.status}</span>}
            details={[
              { label: "Date & Lieu", value: `${item.date} (${item.location})` },
              { label: "Sanction", value: item.sanction },
              { label: "Rapporteur", value: item.recordedBy },
            ]}
          />
        )}
      />

      {/* Modal Discipline */}
      {selectedStudentForModal && (
        <DisciplineModal
          student={selectedStudentForModal}
          isOpen={true}
          onClose={() => setSelectedStudentForModal(null)}
          userRole="censeur"
        />
      )}
    </div>
  );
}
