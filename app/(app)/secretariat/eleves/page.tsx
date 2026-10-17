"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  Filter,
  UserPlus,
  Edit,
  ArrowRightLeft,
  FileText,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Calendar,
  Building,
  CheckCircle2,
  X,
  ChevronRight,
  Eye,
  ShieldAlert,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useSecretariatStore } from "@/lib/secretariat-store";
import { useToast } from "@/components/ui/Toast";
import { StudentProfile, StudentStatus } from "@/lib/types/bulletin";
import { OfficialDocumentModal } from "@/components/school/OfficialDocumentModal";

export default function SecretariatElevesPage() {
  const { toast } = useToast();
  const {
    students,
    classrooms,
    registerStudent,
    updateStudentInfo,
    changeStudentClass,
    updateStudentStatus,
    generateDocument,
  } = useSecretariatStore();

  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedGender, setSelectedGender] = useState("ALL");

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [movingStudent, setMovingStudent] = useState<StudentProfile | null>(null);
  const [targetClassId, setTargetClassId] = useState("");
  const [detailStudent, setDetailStudent] = useState<StudentProfile | null>(null);

  // Document modal preview
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  // Registration Form State
  const [formLastName, setFormLastName] = useState("");
  const [formFirstName, setFormFirstName] = useState("");
  const [formGender, setFormGender] = useState<"M" | "F">("M");
  const [formBirthDate, setFormBirthDate] = useState("2012-05-15");
  const [formBirthPlace, setFormBirthPlace] = useState("Cotonou");
  const [formClassId, setFormClassId] = useState(classrooms[0]?.id || "6e-a");
  const [formParentName, setFormParentName] = useState("");
  const [formParentPhone, setFormParentPhone] = useState("+229 ");
  const [formParentEmail, setFormParentEmail] = useState("");

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !search ||
        s.lastName.toLowerCase().includes(search.toLowerCase()) ||
        s.firstName.toLowerCase().includes(search.toLowerCase()) ||
        s.matricule?.toLowerCase().includes(search.toLowerCase()) ||
        (s.parentName || "").toLowerCase().includes(search.toLowerCase());

      const matchClass = selectedClass === "ALL" || s.classId === selectedClass;
      const stStatus = s.status || "ACTIF";
      const matchStatus = selectedStatus === "ALL" || stStatus === selectedStatus;
      const matchGender = selectedGender === "ALL" || s.gender === selectedGender;

      return matchSearch && matchClass && matchStatus && matchGender;
    });
  }, [students, search, selectedClass, selectedStatus, selectedGender]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLastName.trim() || !formFirstName.trim()) {
      toast("Veuillez renseigner le nom et le prénom de l'élève.", "error");
      return;
    }

    const assignedClass = classrooms.find((c) => c.id === formClassId);
    const className = assignedClass?.name || "6ème A";
    const cycle = assignedClass?.cycle || "SECONDAIRE";

    const created = registerStudent({
      lastName: formLastName.trim().toUpperCase(),
      firstName: formFirstName.trim(),
      gender: formGender,
      birthDate: formBirthDate,
      birthPlace: formBirthPlace.trim(),
      classId: formClassId,
      className,
      cycle,
      parentName: formParentName.trim() || "Parent d'élève",
      parentPhone: formParentPhone.trim(),
      parentEmail: formParentEmail.trim(),
      status: "ACTIF",
    });

    toast(`Élève ${created.lastName} ${created.firstName} enregistré avec succès (Matricule: ${created.matricule}).`, "success");
    setIsRegisterModalOpen(false);

    // Reset fields
    setFormLastName("");
    setFormFirstName("");
    setFormParentName("");
    setFormParentEmail("");
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    updateStudentInfo(editingStudent.id, {
      lastName: editingStudent.lastName.trim().toUpperCase(),
      firstName: editingStudent.firstName.trim(),
      birthDate: editingStudent.birthDate,
      birthPlace: editingStudent.birthPlace,
      parentName: editingStudent.parentName,
      parentPhone: editingStudent.parentPhone,
      parentEmail: editingStudent.parentEmail,
      status: editingStudent.status,
    });

    toast("Informations administratives de l'élève mises à jour.", "success");
    setEditingStudent(null);
  };

  const handleMoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movingStudent || !targetClassId) return;

    const targetClass = classrooms.find((c) => c.id === targetClassId);
    if (!targetClass) return;

    if (targetClass.id === movingStudent.classId) {
      toast("L'élève est déjà inscrit dans cette classe.", "info");
      return;
    }

    changeStudentClass(movingStudent.id, targetClass.id, targetClass.name);
    toast(`${movingStudent.lastName} ${movingStudent.firstName} réaffecté(e) en ${targetClass.name}.`, "success");
    setMovingStudent(null);
  };

  const handleGenerateCertificate = (st: StudentProfile) => {
    const doc = generateDocument({
      docType: "CERTIFICAT_SCOLARITE",
      title: "Certificat de Scolarité",
      studentId: st.id,
      studentName: `${st.lastName} ${st.firstName}`,
      matricule: st.matricule,
      classId: st.classId,
      className: st.className,
      academicYear: "2026 - 2027",
      issueDate: new Date().toISOString().split("T")[0],
      issuedBy: "Secrétariat Pédagogique",
      recipient: "Organisme demandeur",
      notes: "Certificat officiel délivré par le Secrétariat",
    });

    setPreviewDoc(doc);
    setDetailStudent(st);
  };

  const getStatusBadge = (status?: StudentStatus) => {
    switch (status) {
      case "ACTIF":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Actif</span>;
      case "TRANSFERE":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Transféré</span>;
      case "DESISTE":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Désisté</span>;
      case "EXCLU":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Exclu</span>;
      case "READMIS":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">Réadmis</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Actif</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Gestion Administrative des Élèves &amp; Dossiers"
        subtitle="Inscriptions, fiches élèves, transferts, départs et historique scolaire partagé"
        breadcrumbs={[{ label: "Secrétariat", href: "/secretariat" }, { label: "Élèves" }]}
        actions={
          <button
            type="button"
            onClick={() => setIsRegisterModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-school-primary text-white font-semibold text-xs md:text-sm shadow-sm hover:bg-school-primary/90 transition touch-target"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enregistrer un élève</span>
          </button>
        }
      />

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
          {/* Recherche */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, matricule ou parent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-primary/20"
            />
          </div>

          {/* Classe */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
          >
            <option value="ALL">Toutes les classes</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.cycle})
              </option>
            ))}
          </select>

          {/* Statut administratif */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIF">Actif</option>
            <option value="TRANSFERE">Transféré</option>
            <option value="DESISTE">Désisté</option>
            <option value="EXCLU">Exclu</option>
            <option value="READMIS">Réadmis</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            {filteredStudents.length} élève{filteredStudents.length > 1 ? "s" : ""} trouvé{filteredStudents.length > 1 ? "s" : ""}
          </span>
          {(search || selectedClass !== "ALL" || selectedStatus !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedClass("ALL");
                setSelectedStatus("ALL");
              }}
              className="text-school-primary hover:underline font-semibold"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* Tableau des élèves */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Élève &amp; Matricule</th>
                <th className="py-3 px-3">Classe</th>
                <th className="py-3 px-3">Sexe</th>
                <th className="py-3 px-3">Naissance</th>
                <th className="py-3 px-4">Parent / Contact</th>
                <th className="py-3 px-3">Statut</th>
                <th className="py-3 px-4 text-right">Actions Secrétariat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">
                      {st.lastName} {st.firstName}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">{st.matricule}</p>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                      {st.className}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.gender === "M" ? "bg-blue-50 text-blue-800" : "bg-pink-50 text-pink-800"}`}>
                      {st.gender === "M" ? "M" : "F"}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">
                    <p>{st.birthDate ? new Date(st.birthDate).toLocaleDateString("fr-FR") : "-"}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[100px]">{st.birthPlace || ""}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <p className="font-bold text-slate-800 truncate">{st.parentName || "Non renseigné"}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{st.parentPhone || ""}</p>
                  </td>
                  <td className="py-3.5 px-3">{getStatusBadge(st.status)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Fiche détaillée */}
                      <button
                        type="button"
                        onClick={() => setDetailStudent(st)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                        title="Consulter le dossier"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Modifier infos autorisées */}
                      <button
                        type="button"
                        onClick={() => setEditingStudent(st)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                        title="Modifier les informations"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Changer de classe */}
                      <button
                        type="button"
                        onClick={() => {
                          setMovingStudent(st);
                          setTargetClassId(st.classId);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                        title="Changer de classe"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>

                      {/* Certificat de scolarité direct */}
                      <button
                        type="button"
                        onClick={() => handleGenerateCertificate(st)}
                        className="p-1.5 rounded-lg text-teal-600 hover:text-teal-800 hover:bg-teal-50 transition"
                        title="Générer Certificat de scolarité"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1 : ENREGISTRER UN NOUVEL ÉLÈVE */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-school-primary" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Inscription d&apos;un nouvel élève
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Nom de famille *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: DOSSOU"
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Prénoms *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Jean-Eudes"
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Sexe *</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as "M" | "F")}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold"
                  >
                    <option value="M">Masculin (M)</option>
                    <option value="F">Féminin (F)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Date naissance</label>
                  <input
                    type="date"
                    value={formBirthDate}
                    onChange={(e) => setFormBirthDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Lieu de naissance</label>
                  <input
                    type="text"
                    placeholder="Cotonou"
                    value={formBirthPlace}
                    onChange={(e) => setFormBirthPlace(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Affectation classe */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Affectation à la classe *</label>
                <select
                  value={formClassId}
                  onChange={(e) => setFormClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-800"
                >
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} &mdash; Cycle {c.cycle} ({c.stream || "Général"})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500">
                  Les classes sont définies par la Direction / Censorat.
                </p>
              </div>

              {/* Responsable légal / Tuteur */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <p className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                  Responsable Légal / Parent
                </p>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Nom &amp; Prénoms du parent *</label>
                  <input
                    type="text"
                    required
                    placeholder="M. Thomas DOSSOU"
                    value={formParentName}
                    onChange={(e) => setFormParentName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Téléphone *</label>
                    <input
                      type="text"
                      required
                      placeholder="+229 97 00 00 00"
                      value={formParentPhone}
                      onChange={(e) => setFormParentPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">E-mail</label>
                    <input
                      type="email"
                      placeholder="parent@gmail.com"
                      value={formParentEmail}
                      onChange={(e) => setFormParentEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-school-primary text-white font-bold hover:bg-school-primary/90 shadow-sm"
                >
                  Valider l&apos;inscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2 : MODIFIER INFORMATIONS AUTORISÉES */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-school-primary" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Mise à jour du dossier &mdash; {editingStudent.matricule}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Nom</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.lastName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Prénom(s)</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.firstName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Date de naissance</label>
                  <input
                    type="date"
                    value={editingStudent.birthDate}
                    onChange={(e) => setEditingStudent({ ...editingStudent, birthDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Lieu de naissance</label>
                  <input
                    type="text"
                    value={editingStudent.birthPlace}
                    onChange={(e) => setEditingStudent({ ...editingStudent, birthPlace: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Statut administratif</label>
                <select
                  value={editingStudent.status || "ACTIF"}
                  onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold"
                >
                  <option value="ACTIF">Actif (Régulièrement inscrit)</option>
                  <option value="TRANSFERE">Transféré vers un autre établissement</option>
                  <option value="DESISTE">Désisté / Abandon</option>
                  <option value="EXCLU">Exclu</option>
                  <option value="READMIS">Réadmis</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <p className="font-bold text-slate-900 uppercase text-[11px]">Coordonnées du Parent</p>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Nom du parent</label>
                  <input
                    type="text"
                    value={editingStudent.parentName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Téléphone</label>
                    <input
                      type="text"
                      value={editingStudent.parentPhone}
                      onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">E-mail</label>
                    <input
                      type="email"
                      value={editingStudent.parentEmail || ""}
                      onChange={(e) => setEditingStudent({ ...editingStudent, parentEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-school-primary text-white font-bold hover:bg-school-primary/90 shadow-sm"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3 : CHANGER D'AFFECTATION DE CLASSE */}
      {movingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-school-primary" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Changement de classe
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMovingStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMoveSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900">
                  {movingStudent.lastName} {movingStudent.firstName}
                </p>
                <p className="text-slate-500">Matricule : {movingStudent.matricule}</p>
                <p className="text-slate-700">
                  Classe actuelle : <strong className="text-school-primary">{movingStudent.className}</strong>
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Nouvelle classe d&apos;affectation *</label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-800"
                >
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} &mdash; Cycle {c.cycle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMovingStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-school-primary text-white font-bold hover:bg-school-primary/90 shadow-sm"
                >
                  Confirmer le transfert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4 : FICHE INDIVIDUELLE COMPLÈTE */}
      {detailStudent && !previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-school-primary" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Fiche Individuelle &mdash; {detailStudent.matricule}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-black text-slate-900">
                    {detailStudent.lastName} {detailStudent.firstName}
                  </h4>
                  <p className="text-slate-500 font-mono text-[11px]">
                    N° EducMaster : {detailStudent.educMasterNumber || "Non attribué"}
                  </p>
                </div>
                {getStatusBadge(detailStudent.status)}
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-slate-500 block text-[11px]">Classe :</span>
                  <span className="font-bold text-slate-900 text-sm">{detailStudent.className}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Sexe :</span>
                  <span className="font-bold text-slate-900 text-sm">{detailStudent.gender === "M" ? "Masculin" : "Féminin"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Date de naissance :</span>
                  <span className="font-bold text-slate-900">
                    {detailStudent.birthDate ? new Date(detailStudent.birthDate).toLocaleDateString("fr-FR") : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Lieu de naissance :</span>
                  <span className="font-bold text-slate-900">{detailStudent.birthPlace || "-"}</span>
                </div>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                  Responsable / Parent
                </span>
                <p><strong>Nom :</strong> {detailStudent.parentName || "Non renseigné"}</p>
                <p><strong>Téléphone :</strong> {detailStudent.parentPhone || "Non renseigné"}</p>
                <p><strong>E-mail :</strong> {detailStudent.parentEmail || "Non renseigné"}</p>
              </div>

              <div className="pt-2 flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => handleGenerateCertificate(detailStudent)}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Certificat de scolarité</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailStudent(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APERÇU IMPRESSION DOCUMENT */}
      {previewDoc && (
        <OfficialDocumentModal
          document={previewDoc}
          student={detailStudent}
          classroom={classrooms.find((c) => c.id === detailStudent?.classId)}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
