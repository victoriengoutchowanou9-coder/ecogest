"use client";

import React, { useState } from "react";
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  GraduationCap,
  Star,
  Users,
  Clock,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Edit2,
  FileText,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/Toast";
import { MOCK_TEACHER_PROFILE } from "@/lib/mock-teacher-db";
import { ChangePasswordSection } from "@/components/account/ChangePasswordSection";

export default function EnseignantProfilPage() {
  const { toast } = useToast();
  const teacher = MOCK_TEACHER_PROFILE;

  const [phone, setPhone] = useState(teacher.phone);
  const [address, setAddress] = useState(teacher.address);
  const [isEditingContact, setIsEditingContact] = useState(false);

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingContact(false);
    toast("Coordonnées de contact mises à jour avec succès.", "success");
  };

  const handlePrint = () => {
    window.print();
  };

  const totalStudents = teacher.classesAssigned.reduce((acc, c) => acc + c.studentsCount, 0);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Profil de l'Enseignant"
        subtitle="Informations personnelles, qualifications professionnelles et affectations pédagogiques"
        breadcrumbs={[{ label: "Enseignant", href: "/enseignant" }, { label: "Profil enseignant" }]}
        actions={
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs md:text-sm shadow-sm touch-target flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Imprimer la fiche d&apos;affectation</span>
          </button>
        }
      />

      {/* Main Identity Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-school-primary via-school-700 to-indigo-900 px-6 flex items-end">
          <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg translate-y-8 flex items-center justify-center border-2 border-white">
            <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-school-primary font-black text-2xl">
              {teacher.fullName ? teacher.fullName.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("") : "ENS"}
            </div>
          </div>
        </div>

        <div className="pt-10 p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">{teacher.fullName}</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Compte Actif
                </span>
                {teacher.isMainTeacher && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                    Prof. Titulaire {teacher.mainClassName}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Matricule : <span className="font-mono font-semibold text-slate-700">{teacher.matricule}</span> &bull; Spécialité : <strong className="text-slate-800">{teacher.speciality}</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingContact(!isEditingContact)}
              className="self-start md:self-auto px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs touch-target flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5 text-school-primary" />
              <span>{isEditingContact ? "Annuler l'édition" : "Modifier mes coordonnées"}</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Classes Assignées</span>
              <span className="text-lg font-black text-slate-900">{teacher.classesAssigned.length}</span>
              <span className="text-[10px] text-slate-500 block">3ème A, Tle C, 1ère D</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Total Élèves</span>
              <span className="text-lg font-black text-school-primary">{totalStudents}</span>
              <span className="text-[10px] text-slate-500 block">apprenants encadrés</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Charge Horaire</span>
              <span className="text-lg font-black text-indigo-700">{teacher.weeklyHours}h</span>
              <span className="text-[10px] text-slate-500 block">par semaine</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Assiduité Cours</span>
              <span className="text-lg font-black text-emerald-600">98.5%</span>
              <span className="text-[10px] text-slate-500 block">émargements réguliers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns : Informations Personnelles & Qualifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations Personnelles & Contacts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <UserCircle className="w-5 h-5 text-school-primary" />
            <h3 className="font-bold text-slate-900 text-sm">Informations Personnelles & Coordonnées</h3>
          </div>

          {!isEditingContact ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Nom complet</span>
                <span className="font-bold text-slate-900">{teacher.fullName}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Genre</span>
                <span className="font-semibold text-slate-800">
                  {teacher.gender === "M" ? "Masculin (M)" : "Féminin (F)"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Date de naissance</span>
                <span className="font-semibold text-slate-800">{teacher.birthDate}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Adresse email professionnelle</span>
                <span className="font-semibold text-slate-800 font-mono">{teacher.email}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Téléphone portable</span>
                <span className="font-semibold text-slate-800 font-mono">{phone}</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 font-medium">Adresse de résidence</span>
                <span className="font-semibold text-slate-800">{address}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Téléphone portable</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Adresse de résidence</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 font-semibold"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingContact(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-school-primary text-white font-semibold hover:bg-school-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Qualifications Pédagogiques & Statut */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <GraduationCap className="w-5 h-5 text-school-primary" />
            <h3 className="font-bold text-slate-900 text-sm">Carrière & Diplômes Pédagogiques</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Diplôme d&apos;enseignement</span>
              <span className="font-bold text-slate-900">{teacher.diploma}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Grade administratif</span>
              <span className="font-semibold text-slate-800">{teacher.grade}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Discipline principale</span>
              <span className="font-semibold text-slate-800">{teacher.speciality}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Date d&apos;affectation / Prise de service</span>
              <span className="font-semibold text-slate-800">{teacher.hireDate}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Établissement d&apos;exercice</span>
              <span className="font-bold text-slate-800">Collège Catholique Père Aupiais</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500 font-medium">Statut de Titularisation</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                Professeur Titulaire de classe (3ème A)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Table of Teaching Assignments */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Affectations Pédagogiques Officielles</h3>
            <p className="text-xs text-slate-500">
              Classes attribuées par la direction des études pour l&apos;année scolaire 2026 - 2027
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-100 text-blue-900">
            Total : {teacher.weeklyHours}h hebdomadaires
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                <th className="py-3 px-4">Classe</th>
                <th className="py-3 px-3">Matière</th>
                <th className="py-3 px-3 text-center">Coefficient</th>
                <th className="py-3 px-3 text-center">Volume Horaire</th>
                <th className="py-3 px-3 text-center">Effectif</th>
                <th className="py-3 px-3">Responsabilité Pédagogique</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teacher.classesAssigned.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Aucune classe actuellement affectée.
                  </td>
                </tr>
              ) : (
                teacher.classesAssigned.map((assignment) => (
                  <tr key={assignment.classId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 text-sm">{assignment.className}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{assignment.subject}</td>
                    <td className="py-3 px-3 text-center font-bold text-school-primary">
                      Coef. {assignment.coef}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-indigo-700">
                      {assignment.hoursPerWeek}h / sem
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">
                      {assignment.studentsCount} élèves
                    </td>
                    <td className="py-3 px-3">
                      {assignment.isMain ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px]">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                          Professeur Titulaire (Coordination de classe)
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">Professeur de discipline</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modification autonome du mot de passe */}
      <ChangePasswordSection />
    </div>
  );
}
