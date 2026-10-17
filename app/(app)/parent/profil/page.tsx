"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ShieldCheck,
  Bell,
  GraduationCap,
  Save,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuthStore } from "@/lib/auth-store";
import { useCenseurStore } from "@/lib/censeur-store";

export default function ParentProfilePage() {
  const { user: currentUser } = useAuthStore();
  const { studentsList, parentAccessRequests } = useCenseurStore();

  const parentPhone = currentUser?.phone || "";
  const parentEmail = currentUser?.email || "";
  const parentId = currentUser?.id || "";
  const parentIdent = currentUser?.identifier || "";

  const myChildren = React.useMemo(() => {
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
    return studentsList.filter((s) => activeStudentIds.has(s.id));
  }, [parentAccessRequests, studentsList, parentPhone, parentEmail, parentId, parentIdent]);

  const [profile, setProfile] = useState(() => ({
    id: currentUser?.identifier || currentUser?.id || "",
    fullName: currentUser?.fullName || "",
    relationship: "Parent",
    phoneNumber: currentUser?.phone || "",
    email: currentUser?.email || "",
    address: "",
    profession: "",
    workplace: "",
    emergencyContact: "",
    notifications: {
      notifyOnAbsence: true,
      notifyOnGrades: true,
      notifyOnDueTuition: true,
      whatsappAlerts: true,
    },
  }));
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleNotif = (key: keyof typeof profile.notifications) => {
    setProfile((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil du Parent"
        subtitle="Coordonnées, enfants scolarisés, contacts d'urgence et préférences d'alertes"
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Profil" }]}
      />

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Vos modifications ont été enregistrées avec succès.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identity & Contact Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-school-primary text-white flex items-center justify-center font-bold text-lg">
              {profile.fullName ? profile.fullName.charAt(0) : "P"}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{profile.fullName}</h2>
              <p className="text-xs text-slate-500">Compte tuteur légal &middot; Bénin</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nom &amp; Prénoms</label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold">
                <User className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="bg-transparent flex-1 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Profession</label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={profile.profession}
                  onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                  className="bg-transparent flex-1 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Numéro de Téléphone (Moov / MTN)</label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold">
                <Phone className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                  className="bg-transparent flex-1 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Adresse Email</label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold">
                <Mail className="w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="bg-transparent flex-1 focus:outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Adresse de résidence</label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold">
                <MapPin className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="bg-transparent flex-1 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Children Enrolled */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <GraduationCap className="w-5 h-5 text-school-primary" />
            <h3 className="text-sm font-bold text-slate-900">Enfants rattachés sous votre tutelle</h3>
          </div>

          {myChildren.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              Aucun enfant actuellement rattaché à ce compte.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {myChildren.map((child) => (
                <div key={child.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <h4 className="font-extrabold text-slate-900">{child.lastName} {child.firstName}</h4>
                  <p className="text-slate-600">
                    Classe : <strong className="text-school-primary">{child.className}</strong>
                  </p>
                  <p className="text-slate-500 font-mono">
                    Matricule : {child.matricule}
                  </p>
                  <p className="text-slate-500 font-mono">
                    N° Educ Master : {child.educMasterNumber || "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">Préférences des notifications &amp; alertes</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <span className="font-semibold text-slate-800">Alertes absences &amp; retards par SMS</span>
              <input
                type="checkbox"
                checked={profile.notifications.notifyOnAbsence}
                onChange={() => handleToggleNotif("notifyOnAbsence")}
                className="w-4 h-4 accent-school-primary"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <span className="font-semibold text-slate-800">Avis de publication des bulletins</span>
              <input
                type="checkbox"
                checked={profile.notifications.notifyOnGrades}
                onChange={() => handleToggleNotif("notifyOnGrades")}
                className="w-4 h-4 accent-school-primary"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <span className="font-semibold text-slate-800">Rappels d&apos;échéances de scolarité</span>
              <input
                type="checkbox"
                checked={profile.notifications.notifyOnDueTuition}
                onChange={() => handleToggleNotif("notifyOnDueTuition")}
                className="w-4 h-4 accent-school-primary"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <span className="font-semibold text-slate-800">Notifications WhatsApp</span>
              <input
                type="checkbox"
                checked={profile.notifications.whatsappAlerts}
                onChange={() => handleToggleNotif("whatsappAlerts")}
                className="w-4 h-4 accent-school-primary"
              />
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-school-primary hover:bg-school-700 text-white font-bold text-xs md:text-sm shadow-sm transition-colors touch-target"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les modifications</span>
          </button>
        </div>
      </form>
    </div>
  );
}
