"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Clock,
  BookOpen,
  Search,
  FileSpreadsheet,
  CheckSquare,
  Award,
  CalendarDays,
  FileText,
  Plus,
  Edit,
  Trash2,
  Lock,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  X,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/lib/auth-store";
import { useBulletinStore } from "@/lib/bulletin-store";
import { SubjectConfig, ClassRoom } from "@/lib/types/bulletin";

export default function EnseignantClassesPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuthStore();
  const {
    classrooms,
    students,
    subjects,
    addClassSubject,
    updateClassSubject,
    deactivateClassSubject,
    getClassSubjects,
  } = useBulletinStore();

  const teacherName = (currentUser?.fullName || (currentUser as any)?.full_name || "").trim().toLowerCase();
  const teacherId = currentUser?.id || "";

  // 1. Détection des classes assignées à cet enseignant
  // Pour le primaire : STRICTEMENT la classe où il est le maître unique responsable
  // Pour le secondaire : les classes où il intervient
  const assignedClasses = useMemo(() => {
    const myClasses = classrooms.filter((c) => {
      if (c.cycle === "PRIMAIRE") {
        return (
          (c.primaryTeacherId && c.primaryTeacherId === teacherId) ||
          (c.mainTeacher && teacherName && c.mainTeacher.toLowerCase() === teacherName)
        );
      }
      // Secondaire
      return (
        (c.mainTeacher && teacherName && c.mainTeacher.toLowerCase() === teacherName)
      );
    });

    // Repli de démonstration : si aucune classe n'est explicitement rattachée à cet ID dans la session
    if (myClasses.length === 0 && classrooms.length > 0) {
      // Priorité aux classes primaires ayant un enseignant ou la première classe primaire
      const firstPrimary = classrooms.find((c) => c.cycle === "PRIMAIRE");
      return firstPrimary ? [firstPrimary] : [classrooms[0]];
    }

    return myClasses;
  }, [classrooms, teacherId, teacherName]);

  const [selectedClassId, setSelectedClassId] = useState<string>(
    assignedClasses[0]?.id || ""
  );

  // Synchronisation de la sélection si les classes changent
  React.useEffect(() => {
    if (assignedClasses.length > 0 && !assignedClasses.some((c) => c.id === selectedClassId)) {
      setSelectedClassId(assignedClasses[0].id);
    }
  }, [assignedClasses, selectedClassId]);

  const currentClass: ClassRoom | undefined = classrooms.find((c) => c.id === selectedClassId);

  // Vérification de sécurité côté client : l'enseignant ne peut pas accéder à une classe qui ne lui est pas attribuée
  const isAuthorized = useMemo(() => {
    if (!currentClass) return false;
    return assignedClasses.some((c) => c.id === currentClass.id);
  }, [currentClass, assignedClasses]);

  const isPrimary = currentClass?.cycle === "PRIMAIRE";

  // Navigation par onglets dans la classe
  const [activeTab, setActiveTab] = useState<"MATIERES" | "ELEVES" | "HORAIRES">("MATIERES");
  const [searchTerm, setSearchTerm] = useState("");

  // Matières de cette classe (autonomes pour le primaire)
  const classSubjects = useMemo(() => {
    if (!currentClass) return [];
    return getClassSubjects(currentClass.id, currentClass.cycle);
  }, [currentClass, getClassSubjects, subjects]);

  // Modal d'ajout / modification de matière pour le maître primaire
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectConfig | null>(null);
  const [subjName, setSubjName] = useState("");
  const [subjCode, setSubjCode] = useState("");
  const [subjCoef, setSubjCoef] = useState<number>(2);
  const [subjCategory, setSubjCategory] = useState<"LITTÉRAIRE" | "SCIENTIFIQUE" | "AUTRE">("LITTÉRAIRE");
  const [subjScale, setSubjScale] = useState<number>(20);

  const openNewSubjectModal = () => {
    setEditingSubject(null);
    setSubjName("");
    setSubjCode("");
    setSubjCoef(2);
    setSubjCategory("LITTÉRAIRE");
    setSubjScale(20);
    setIsSubjectModalOpen(true);
  };

  const openEditSubjectModal = (s: SubjectConfig) => {
    setEditingSubject(s);
    setSubjName(s.name);
    setSubjCode(s.code);
    setSubjCoef(s.coef);
    setSubjCategory(s.category);
    setSubjScale(s.customScale || 20);
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName.trim() || !currentClass) return;

    try {
      if (editingSubject) {
        updateClassSubject(
          editingSubject.id,
          {
            name: subjName.trim(),
            code: subjCode.trim() || subjName.slice(0, 4).toUpperCase(),
            coef: subjCoef,
            category: subjCategory,
            customScale: subjScale,
          },
          currentUser?.fullName || "Maître responsable"
        );
        toast(`Matière « ${subjName.trim()} » mise à jour avec succès.`, "success");
      } else {
        addClassSubject(
          {
            name: subjName.trim(),
            code: subjCode.trim() || subjName.slice(0, 4).toUpperCase(),
            coef: subjCoef,
            category: subjCategory,
            customScale: subjScale,
            cycle: "PRIMAIRE",
            classId: currentClass.id,
            academicYearId: currentClass.academicYearId || "2026-2027",
            order: (classSubjects.length + 1) * 10,
          },
          currentUser?.id,
          currentUser?.fullName || "Maître responsable"
        );
        toast(`Nouvelle matière « ${subjName.trim()} » créée pour votre classe.`, "success");
      }
      setIsSubjectModalOpen(false);
    } catch (err: any) {
      toast(err.message || "Erreur lors de l'enregistrement de la matière.", "error");
    }
  };

  const handleDeactivateSubject = (subjectId: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir retirer la matière « ${name} » ?\n\nRemarque : toutes les notes déjà enregistrées dans les bulletins resteront intactes et consultables.`)) {
      deactivateClassSubject(subjectId, currentUser?.fullName || "Maître responsable");
      toast(`Matière « ${name} » retirée de la classe. L'historique des notes reste préservé.`, "info");
    }
  };

  const handleAttemptEditHours = () => {
    toast(
      "Opération non autorisée : Les horaires d'ouverture, de fermeture et les jours ouvrables sont fixés souverainement par le Directeur de l'établissement.",
      "error"
    );
  };

  // Élèves inscrits dans cette classe
  const classStudents = useMemo(() => {
    if (!currentClass) return [];
    return students.filter(
      (s) => s.classId === currentClass.id || s.className?.toLowerCase() === currentClass.name?.toLowerCase()
    );
  }, [students, currentClass]);

  const filteredStudents = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return classStudents;
    return classStudents.filter(
      (s) =>
        `${s.lastName} ${s.firstName}`.toLowerCase().includes(q) ||
        s.matricule?.toLowerCase().includes(q) ||
        s.educMasterNumber?.toLowerCase().includes(q)
    );
  }, [classStudents, searchTerm]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Espace Pédagogique du Maître"
        subtitle={
          currentClass
            ? `Gestion de votre classe : ${currentClass.name} (${isPrimary ? "Cycle Primaire · Maître Unique" : "Secondaire"}) · Année ${currentClass.academicYearId || "2026-2027"}`
            : "Consultation et gestion de vos classes attribuées"
        }
        breadcrumbs={[{ label: "Enseignant", href: "/enseignant" }, { label: "Mes classes & cours" }]}
      />

      {/* Sélecteur des classes dont l'enseignant est responsable */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {assignedClasses.map((item) => {
          const isActive = item.id === selectedClassId;
          const count = students.filter(
            (s) => s.classId === item.id || s.className?.toLowerCase() === item.name?.toLowerCase()
          ).length;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedClassId(item.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                isActive
                  ? "bg-school-primary text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>{item.name}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {item.cycle === "PRIMAIRE" ? "🎒 Primaire" : "🎓 Secondaire"} &bull; {count} élève(s)
              </span>
            </button>
          );
        })}
      </div>

      {/* Cas de tentative d'accès non autorisé */}
      {!isAuthorized && currentClass && (
        <div className="p-8 bg-rose-50 border-2 border-rose-300 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-rose-950">Accès Refusé &mdash; Classe Non Attribuée</h3>
          <p className="text-xs text-rose-800 max-w-md mx-auto leading-relaxed">
            Vous n&apos;êtes pas le maître responsable de la classe <strong>{currentClass.name}</strong>. Conformément aux directives officielles du primaire, seul le maître titulaire désigné par la direction a l&apos;autorité pour gérer les matières, les notes et les élèves de cette division.
          </p>
          <button
            type="button"
            onClick={() => setSelectedClassId(assignedClasses[0]?.id || "")}
            className="px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700"
          >
            Retourner à ma classe attribuée
          </button>
        </div>
      )}

      {isAuthorized && currentClass && (
        <>
          {/* Fiche récapitulative officielle de la classe */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-school-primary text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {currentClass.level || currentClass.name.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">{currentClass.name}</h2>
                    {isPrimary ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                        🎒 Maître Titulaire Unique
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-300">
                        🎓 Secondaire
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Niveau : <strong className="text-slate-900">{currentClass.level}</strong> &bull; Année scolaire :{" "}
                    <strong className="text-slate-900">{currentClass.academicYearId || "2026-2027"}</strong>
                  </p>
                </div>
              </div>

              {/* Raccourcis d'actions rapides */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/enseignant/notes`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-school-primary hover:bg-school-700 text-white text-xs font-bold shadow-xs transition"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Saisir les notes</span>
                </Link>
                <Link
                  href={`/enseignant/bulletins`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition"
                >
                  <Award className="w-4 h-4" />
                  <span>Bulletins scolaires</span>
                </Link>
                <Link
                  href={`/enseignant/presences`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Faire l'appel</span>
                </Link>
              </div>
            </div>

            {/* 3 Cartes indicateurs & Horaires officiels */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-500 block">Effectif réel de la classe</span>
                <strong className="text-base font-bold text-slate-900 font-mono">
                  {classStudents.length} apprenant(s)
                </strong>
                <span className="text-[11px] text-slate-500 block">Inscrits officiellement</span>
              </div>

              {/* HORAIRES DE LA CLASSE DÉFINIS PAR LA DIRECTION */}
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1 relative">
                <div className="flex items-center justify-between">
                  <span className="text-blue-900 font-bold block flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-700" />
                    <span>Horaires de classe officiels</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAttemptEditHours}
                    className="text-slate-400 hover:text-slate-600"
                    title="Paramètre verrouillé par la Direction"
                  >
                    <Lock className="w-3.5 h-3.5 text-blue-700" />
                  </button>
                </div>
                <strong className="text-base font-bold text-blue-950 font-mono block">
                  {currentClass.openingTime || "08:00"} &mdash; {currentClass.closingTime || "15:30"}
                </strong>
                <span className="text-[10px] text-blue-800 block">
                  🔒 Fixé par le Directeur (Non modifiable)
                </span>
              </div>

              {/* JOURS OUVRABLES */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-500 block">Jours ouvrables de cours</span>
                <strong className="text-xs font-bold text-slate-900 block truncate">
                  {currentClass.workingDays && currentClass.workingDays.length > 0
                    ? currentClass.workingDays.join(", ")
                    : "Lundi, Mardi, Mercredi, Jeudi, Vendredi"}
                </strong>
                <span className="text-[11px] text-slate-500 block">
                  {currentClass.workingDays?.length || 5} jours de classe / semaine
                </span>
              </div>
            </div>
          </div>

          {/* Navigation par Onglets de Gestion */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1 text-xs">
            {isPrimary && (
              <button
                type="button"
                onClick={() => setActiveTab("MATIERES")}
                className={`px-4 py-2.5 font-bold rounded-t-xl transition flex items-center gap-2 ${
                  activeTab === "MATIERES"
                    ? "bg-white text-school-primary border-t-2 border-school-primary shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Matières &amp; Coefficients ({classSubjects.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("ELEVES")}
              className={`px-4 py-2.5 font-bold rounded-t-xl transition flex items-center gap-2 ${
                activeTab === "ELEVES"
                  ? "bg-white text-school-primary border-t-2 border-school-primary shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Liste des Élèves ({classStudents.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("HORAIRES")}
              className={`px-4 py-2.5 font-bold rounded-t-xl transition flex items-center gap-2 ${
                activeTab === "HORAIRES"
                  ? "bg-white text-school-primary border-t-2 border-school-primary shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Règlement &amp; Horaires</span>
            </button>
          </div>

          {/* ONGLET 1 : GESTION DES MATIÈRES DU MAÎTRE DU PRIMAIRE */}
          {activeTab === "MATIERES" && isPrimary && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-school-primary" />
                    <span>Matières enseignées dans votre classe</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    En tant que maître responsable, vous configurez librement vos matières, coefficients et échelles d&apos;évaluation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewSubjectModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une matière à ma classe</span>
                </button>
              </div>

              {/* Grille des matières de la classe */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {classSubjects.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-slate-400 text-xs italic">
                    Aucune matière encore créée. Cliquez sur le bouton ci-dessus pour ajouter votre première matière.
                  </div>
                ) : (
                  classSubjects.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-school-200 transition space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {s.code || "MAT"}
                          </span>
                          <span className="text-xs font-bold text-school-primary font-mono bg-school-50 px-2 py-0.5 rounded-full border border-school-100">
                            Coef. {s.coef}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mt-1">{s.name}</h4>
                        <p className="text-[11px] text-slate-500">
                          Catégorie : <strong>{s.category}</strong> &bull; Barème : sur {s.customScale || 20}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <Link
                          href={`/enseignant/notes`}
                          className="font-bold text-school-primary hover:underline"
                        >
                          Saisir les notes &rarr;
                        </Link>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditSubjectModal(s)}
                            className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                            title="Modifier les paramètres"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeactivateSubject(s.id, s.name)}
                            className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                            title="Retirer la matière (sans effacer les notes)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ONGLET 2 : LISTE DES ÉLÈVES */}
          {activeTab === "ELEVES" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Registre des élèves &middot; {currentClass.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {filteredStudents.length} élève(s) répertorié(s) pour l&apos;année scolaire en cours
                  </p>
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher élève, matricule..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-primary/20"
                  />
                </div>
              </div>

              {/* Tableau des apprenants */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10px]">
                      <th className="p-3">N°</th>
                      <th className="p-3">Nom &amp; Prénoms</th>
                      <th className="p-3">Matricule</th>
                      <th className="p-3 text-center">Sexe</th>
                      <th className="p-3">Date de Naissance</th>
                      <th className="p-3">Parent / Tuteur</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                          Aucun élève trouvé dans cette classe.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((std, idx) => (
                        <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-3">
                            <span className="font-bold text-slate-900 uppercase">{std.lastName}</span>{" "}
                            <span className="font-medium text-slate-800">{std.firstName}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-600">{std.matricule}</td>
                          <td className="p-3 text-center font-bold text-slate-700">{std.gender}</td>
                          <td className="p-3 text-slate-600">{std.birthDate || "—"}</td>
                          <td className="p-3 text-slate-600">
                            {std.parentName || "—"}{" "}
                            {std.parentPhone && <span className="text-[11px] font-mono text-slate-400">({std.parentPhone})</span>}
                          </td>
                          <td className="p-3 text-right">
                            <Link
                              href="/enseignant/notes"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-school-primary hover:underline"
                            >
                              <span>Notes</span>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ONGLET 3 : RÈGLEMENT, HORAIRES & INFOS ADMINISTRATIVES */}
          {activeTab === "HORAIRES" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-school-primary" />
                  <span>Organisation des Horaires et Jours Ouvrables</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Paramètres réglementaires de présence fixés par la Direction de l&apos;établissement.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Horaires officiels de classe</span>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-blue-100 text-blue-800">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {currentClass.openingTime || "08:00"} &agrave; {currentClass.closingTime || "15:30"}
                      </p>
                      <span className="text-[11px] text-slate-500">
                        Heure d&apos;ouverture et fermeture des cours
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Jours ouvrables déclarés</span>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {currentClass.workingDays?.join(", ") || "Lundi, Mardi, Mercredi, Jeudi, Vendredi"}
                      </p>
                      <span className="text-[11px] text-slate-500">
                        Jours où les cours ont lieu dans l&apos;école
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <Lock className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Protection administrative</span>
                  <p className="leading-relaxed text-[11px]">
                    Ces horaires généraux s&apos;appliquent à l&apos;ensemble de la division. Seul le Directeur de l&apos;établissement possède l&apos;autorisation administrative de modifier les heures d&apos;ouverture, de fermeture et le calendrier des jours ouvrables.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal d'ajout / modification d'une matière par le maître primaire */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-school-primary" />
                <span>{editingSubject ? `Modifier la matière` : "Ajouter une matière à ma classe"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSubjectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Intitulé de la matière <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subjName}
                  onChange={(e) => setSubjName(e.target.value)}
                  placeholder="Ex : Français, Mathématiques, Éveil Scientifique, Dessin..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-school-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Code abrégé
                  </label>
                  <input
                    type="text"
                    value={subjCode}
                    onChange={(e) => setSubjCode(e.target.value.toUpperCase())}
                    placeholder="Ex : FRA, MATH"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Coefficient officiel <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={subjCoef}
                    onChange={(e) => setSubjCoef(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catégorie d'enseignement
                </label>
                <select
                  value={subjCategory}
                  onChange={(e) => setSubjCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800"
                >
                  <option value="LITTÉRAIRE">Littéraire (Français, Langues, Communication)</option>
                  <option value="SCIENTIFIQUE">Scientifique (Mathématiques, Sciences, EST)</option>
                  <option value="AUTRE">Autre (EPS, Dessin, Conduite, Éducation Civique)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Échelle de notation
                </label>
                <select
                  value={subjScale}
                  onChange={(e) => setSubjScale(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800"
                >
                  <option value={20}>Standard officiel Bénin (Note sur 20)</option>
                  <option value={10}>Échelle sur 10</option>
                  <option value={40}>Échelle sur 40</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-sm"
                >
                  {editingSubject ? "Mettre à jour" : "Créer la matière"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
