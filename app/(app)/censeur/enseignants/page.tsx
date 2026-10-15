"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  CalendarDays,
  Clock,
  BookOpen,
  MapPin,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Plus,
  ShieldCheck,
  UserCheck,
  Edit2,
  X,
  Phone,
  Mail,
  KeyRound,
  FileCheck,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useCenseurStore, CenseurTeacherAccount } from "@/lib/censeur-store";
import { cn } from "@/lib/utils";

export default function CenseurEnseignantsPage() {
  const {
    schedules,
    teacherAccounts,
    subjects,
    classrooms,
    createTeacherAccount,
    updateTeacherAccount,
  } = useCenseurStore();

  const [activeTab, setActiveTab] = useState<"comptes" | "horaires">("comptes");
  const [selectedDay, setSelectedDay] = useState<string>("ALL");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [searchTeacher, setSearchTeacher] = useState<string>("");

  // Modal State for Teacher Account
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<CenseurTeacherAccount | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formIdentifier, setFormIdentifier] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("+229 ");
  const [formSpecialty, setFormSpecialty] = useState("Mathématiques");
  const [formRoleTitle, setFormRoleTitle] = useState("Professeur Titulaire");
  const [formStatus, setFormStatus] = useState<"ACTIF" | "INACTIF">("ACTIF");
  const [formWeeklyHours, setFormWeeklyHours] = useState(14);
  const [formSelectedClasses, setFormSelectedClasses] = useState<string[]>(["3e-a"]);
  const [formSelectedSubjects, setFormSelectedSubjects] = useState<string[]>(["Mathématiques"]);
  const [formPermissions, setFormPermissions] = useState<string[]>([
    "saisie_notes",
    "appel_presence",
    "cahier_textes",
    "bulletins",
  ]);
  const [formError, setFormError] = useState("");

  const daysList = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  // Filter schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((sch) => {
      const matchDay = selectedDay === "ALL" || sch.dayOfWeek === selectedDay;
      const matchClass = selectedClass === "ALL" || sch.classId === selectedClass;
      const matchSubj = selectedSubject === "ALL" || sch.subjectId === selectedSubject;
      const matchTeacher =
        !searchTeacher ||
        sch.teacherName.toLowerCase().includes(searchTeacher.toLowerCase()) ||
        sch.subjectName.toLowerCase().includes(searchTeacher.toLowerCase());
      return matchDay && matchClass && matchSubj && matchTeacher;
    });
  }, [schedules, selectedDay, selectedClass, selectedSubject, searchTeacher]);

  // Filter Teacher Accounts
  const filteredTeachers = useMemo(() => {
    return teacherAccounts.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchTeacher.toLowerCase()) ||
        t.specialty.toLowerCase().includes(searchTeacher.toLowerCase()) ||
        t.identifier.toLowerCase().includes(searchTeacher.toLowerCase()) ||
        t.phone.includes(searchTeacher);

      const matchClass =
        selectedClass === "ALL" ||
        t.assignedClasses.some((c) => c.classId === selectedClass);

      return matchSearch && matchClass;
    });
  }, [teacherAccounts, searchTeacher, selectedClass]);

  const handleOpenAddModal = () => {
    setFormName("");
    setFormIdentifier("");
    setFormEmail("");
    setFormPhone("+229 ");
    setFormSpecialty("Mathématiques");
    setFormRoleTitle("Professeur Titulaire");
    setFormStatus("ACTIF");
    setFormWeeklyHours(14);
    setFormSelectedClasses(["3e-a"]);
    setFormSelectedSubjects(["Mathématiques"]);
    setFormPermissions(["saisie_notes", "appel_presence", "cahier_textes", "bulletins"]);
    setFormError("");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (t: CenseurTeacherAccount) => {
    setEditingTeacher(t);
    setFormName(t.name);
    setFormIdentifier(t.identifier);
    setFormEmail(t.email);
    setFormPhone(t.phone);
    setFormSpecialty(t.specialty);
    setFormRoleTitle(t.roleTitle);
    setFormStatus(t.status);
    setFormWeeklyHours(t.weeklyHours);
    setFormSelectedClasses(t.assignedClasses.map((c) => c.classId));
    setFormSelectedSubjects(t.assignedSubjects.map((s) => s.subjectName));
    setFormPermissions(t.allowedPermissions || []);
    setFormError("");
  };

  const toggleClassSelection = (classId: string) => {
    setFormSelectedClasses((prev) =>
      prev.includes(classId) ? prev.filter((c) => c !== classId) : [...prev, classId]
    );
  };

  const togglePermission = (perm: string) => {
    setFormPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formIdentifier.trim()) {
      setFormError("Veuillez renseigner le nom et l'identifiant du compte enseignant.");
      return;
    }

    const assignedClassesObjects = formSelectedClasses.map((cId) => {
      const cls = classrooms.find((c) => c.id === cId);
      return { classId: cId, className: cls ? cls.name : cId };
    });

    const assignedSubjectsObjects = formSelectedSubjects.map((subName) => ({
      subjectId: `sub-${subName.toLowerCase().replace(/\s+/g, "-")}`,
      subjectName: subName,
    }));

    if (editingTeacher) {
      updateTeacherAccount(editingTeacher.id, {
        name: formName.trim(),
        identifier: formIdentifier.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        specialty: formSpecialty,
        roleTitle: formRoleTitle,
        status: formStatus,
        weeklyHours: Number(formWeeklyHours),
        assignedClasses: assignedClassesObjects,
        assignedSubjects: assignedSubjectsObjects,
        allowedPermissions: formPermissions,
      });
      setEditingTeacher(null);
    } else {
      createTeacherAccount({
        name: formName.trim(),
        identifier: formIdentifier.trim(),
        email: formEmail.trim() || `${formIdentifier.trim()}@educogest.bj`,
        phone: formPhone.trim(),
        specialty: formSpecialty,
        roleTitle: formRoleTitle,
        status: formStatus,
        weeklyHours: Number(formWeeklyHours),
        assignedClasses: assignedClassesObjects,
        assignedSubjects: assignedSubjectsObjects,
        allowedPermissions: formPermissions,
      });
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Gestion des Enseignants, Cours & Horaires"
        subtitle="Création des comptes enseignants, affectations pédagogiques, attribution des classes et emploi du temps"
        breadcrumbs={[{ label: "Censeur", href: "/censeur" }, { label: "Enseignants & Horaires" }]}
        actions={
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-school-primary hover:bg-school-primary/90 rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Créer un compte enseignant
          </button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enseignants enregistrés"
          value={teacherAccounts.length}
          subtitle="Comptes pédagogiques"
          icon={<Users className="w-6 h-6" />}
          variant="info"
        />
        <StatCard
          title="Comptes Actifs"
          value={teacherAccounts.filter((t) => t.status === "ACTIF").length}
          subtitle="Accès autorisé aux cours"
          icon={<UserCheck className="w-6 h-6" />}
          variant="success"
        />
        <StatCard
          title="Séances programmées"
          value={schedules.length}
          subtitle="Créneaux hebdomadaires"
          icon={<CalendarDays className="w-6 h-6" />}
          variant="default"
        />
        <StatCard
          title="Charge horaire moyenne"
          value="14 h/sem"
          subtitle="Par professeur actif"
          icon={<Clock className="w-6 h-6" />}
          variant="default"
        />
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("comptes")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition",
            activeTab === "comptes"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          )}
        >
          <Users className="w-4 h-4" />
          <span>Fiches des Enseignants & Affectations ({teacherAccounts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("horaires")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition",
            activeTab === "horaires"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          )}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Emploi du temps & Cours programmés ({schedules.length})</span>
        </button>
      </div>

      {/* TAB 1: TEACHER ACCOUNTS & ASSIGNMENTS */}
      {activeTab === "comptes" && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher nom, identifiant, matière..."
                value={searchTeacher}
                onChange={(e) => setSearchTeacher(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-school-primary"
              >
                <option value="ALL">Toutes les classes</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Teacher Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeachers.map((tea) => (
              <div
                key={tea.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">{tea.name}</h4>
                      <p className="text-xs font-semibold text-school-primary mt-0.5">
                        {tea.specialty}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-1">
                        <span>@{tea.identifier}</span>
                        <span>&bull;</span>
                        <span>{tea.phone}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tea.status === "ACTIF"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {tea.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Classes attribuées :
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {tea.assignedClasses.map((c) => (
                          <span
                            key={c.classId}
                            className="bg-white text-slate-800 font-semibold px-2 py-0.5 rounded text-[11px] border border-slate-200"
                          >
                            {c.className}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Matières & Charge :
                      </span>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-700 font-medium">
                          {tea.assignedSubjects.map((s) => s.subjectName).join(", ")}
                        </span>
                        <span className="font-bold text-school-primary">{tea.weeklyHours} h/sem</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Permissions d&apos;accès :
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {tea.allowedPermissions?.map((p) => (
                          <span
                            key={p}
                            className="bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded text-[10px] font-medium border border-sky-100"
                          >
                            {p.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{tea.roleTitle}</span>
                  <button
                    onClick={() => handleOpenEditModal(tea)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Modifier l&apos;affectation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULES & TIMETABLE */}
      {activeTab === "horaires" && (
        <div className="space-y-4">
          {/* Top Filter Strip */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher enseignant, matière..."
                    value={searchTeacher}
                    onChange={(e) => setSearchTeacher(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-school-accent"
                  />
                </div>

                {/* Jour */}
                <div>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-semibold text-slate-800 touch-target focus:border-school-accent"
                  >
                    <option value="ALL">Tous les jours</option>
                    {daysList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Classe */}
                <div>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-semibold text-slate-800 touch-target focus:border-school-accent"
                  >
                    <option value="ALL">Toutes les classes</option>
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* List of Scheduled Courses */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Cours programmés ({filteredSchedules.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Emploi du temps consolidé sous la supervision du Censeur
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Jour & Horaire</th>
                    <th className="py-3 px-4">Classe</th>
                    <th className="py-3 px-4">Matière</th>
                    <th className="py-3 px-4">Enseignant responsable</th>
                    <th className="py-3 px-4">Salle</th>
                    <th className="py-3 px-4 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredSchedules.map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{sch.dayOfWeek}</span>
                        <span className="text-[11px] font-mono text-slate-500">{sch.timeSlot}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {sch.className}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-school-primary">{sch.subjectName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-900">{sch.teacherName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sch.room}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Programmé
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Account Add/Edit Modal */}
      {(isAddModalOpen || editingTeacher) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingTeacher
                    ? "Fiche Enseignant & Affectations"
                    : "Créer un nouveau compte Enseignant"}
                </h3>
                <p className="text-xs text-slate-500">
                  Création et attribution des matières, classes et permissions
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingTeacher(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-4">
              {formError && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nom & Identifiant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom et Prénom *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : M. Koffi TOSSOU"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-school-primary focus:ring-1 focus:ring-school-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Identifiant de connexion *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : ktossou"
                    value={formIdentifier}
                    onChange={(e) => setFormIdentifier(e.target.value)}
                    className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-school-primary focus:ring-1 focus:ring-school-primary"
                    required
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="koffi.tossou@educogest.bj"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-school-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Numéro de Téléphone
                  </label>
                  <input
                    type="text"
                    placeholder="+229 97 00 00 00"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-school-primary"
                  />
                </div>
              </div>

              {/* Spécialité & Fonction */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discipline / Spécialité *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : Mathématiques, Français, PCT..."
                    value={formSpecialty}
                    onChange={(e) => setFormSpecialty(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-school-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Statut *</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "ACTIF" | "INACTIF")}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-school-primary font-bold"
                  >
                    <option value="ACTIF">ACTIF</option>
                    <option value="INACTIF">INACTIF</option>
                  </select>
                </div>
              </div>

              {/* Affectation des classes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Classes attribuées à l&apos;enseignant *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {classrooms.map((c) => {
                    const isSelected = formSelectedClasses.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleClassSelection(c.id)}
                        className={cn(
                          "py-2 px-3 rounded-xl border text-xs font-semibold text-left transition flex items-center justify-between",
                          isSelected
                            ? "bg-school-50 border-school-300 text-school-primary ring-1 ring-school-primary/30"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <span>{c.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-school-primary" />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  L&apos;enseignant ne pourra consulter et saisir les notes que pour ses classes attribuées.
                </p>
              </div>

              {/* Volume horaire hebdo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Volume horaire hebdomadaire attribué (heures)
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={formWeeklyHours}
                  onChange={(e) => setFormWeeklyHours(Number(e.target.value))}
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-school-primary"
                />
              </div>

              {/* Permissions & Accès autorisés */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Accès & Fonctionnalités autorisées
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: "saisie_notes", label: "Saisie des notes & Évaluations" },
                    { id: "appel_presence", label: "Appel & Pointage des présences" },
                    { id: "cahier_textes", label: "Cahier de textes & Devoirs" },
                    { id: "bulletins", label: "Appréciations des bulletins" },
                  ].map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100"
                    >
                      <input
                        type="checkbox"
                        checked={formPermissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="rounded text-school-primary focus:ring-school-primary"
                      />
                      <span className="text-[11px] font-medium text-slate-800">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTeacher(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-school-primary hover:bg-school-primary/90 rounded-xl shadow-sm transition"
                >
                  {editingTeacher ? "Mettre à jour la fiche" : "Créer le compte enseignant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
