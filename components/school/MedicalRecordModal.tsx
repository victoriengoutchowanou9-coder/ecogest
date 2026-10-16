"use client";

import React, { useState, useEffect } from "react";
import {
  HeartPulse,
  Shield,
  ShieldAlert,
  Save,
  X,
  Phone,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
} from "lucide-react";
import { MedicalRecord, StudentProfile } from "@/lib/types/bulletin";
import { useDisciplineStore } from "@/lib/discipline-store";
import { isUserAuthorizedForSensitiveData } from "@/lib/security/encryption";
import { useToast } from "@/components/ui/Toast";

interface MedicalRecordModalProps {
  student: StudentProfile;
  userRole?: string;
  isOpen: boolean;
  onClose: () => void;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "NON_DEFINI"] as const;

export const MedicalRecordModal: React.FC<MedicalRecordModalProps> = ({
  student,
  userRole = "censeur",
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const { getStudentMedicalRecord, saveStudentMedicalRecord } = useDisciplineStore();

  const isAuthorized = isUserAuthorizedForSensitiveData(userRole, "MEDICAL");
  const [showEncryptedDetails, setShowEncryptedDetails] = useState(false);

  const [bloodGroup, setBloodGroup] = useState<MedicalRecord["bloodGroup"]>("O+");
  const [allergies, setAllergies] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [vaccinationHistory, setVaccinationHistory] = useState("");
  const [importantNotes, setImportantNotes] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState(student.parentName || "");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(student.parentPhone || "");

  useEffect(() => {
    if (isOpen) {
      const existing = getStudentMedicalRecord(student.id, userRole, "Censeur des Études");
      if (existing) {
        setBloodGroup(existing.bloodGroup);
        setAllergies(existing.allergies || "");
        setMedicalHistory(existing.medicalHistory || "");
        setVaccinationHistory(existing.vaccinationHistory || "");
        setImportantNotes(existing.importantNotes || "");
        setEmergencyContactName(existing.emergencyContactName || student.parentName || "");
        setEmergencyContactPhone(existing.emergencyContactPhone || student.parentPhone || "");
      } else {
        setBloodGroup("O+");
        setAllergies("Aucune allergie connue");
        setMedicalHistory("Aucun antécédent médical particulier");
        setVaccinationHistory("À jour selon le carnet de santé béninois (PEV)");
        setImportantNotes("Aucune contre-indication aux activités physiques");
        setEmergencyContactName(student.parentName || "");
        setEmergencyContactPhone(student.parentPhone || "");
      }
    }
  }, [isOpen, student.id, getStudentMedicalRecord, userRole, student.parentName, student.parentPhone]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) {
      toast("Vous n'avez pas l'autorisation d'éditer les données médicales", "error");
      return;
    }

    const newRecord: MedicalRecord = {
      bloodGroup,
      allergies: allergies.trim(),
      medicalHistory: medicalHistory.trim(),
      vaccinationHistory: vaccinationHistory.trim(),
      importantNotes: importantNotes.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
    };

    saveStudentMedicalRecord(student.id, newRecord, userRole, "Censeur des Études");
    toast(`Dossier médical de ${student.firstName} mis à jour et chiffré au repos avec succès.`, "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Dossier Médical Confidentiel
              </h3>
              <p className="text-xs text-slate-500">
                {student.lastName} {student.firstName} &bull; {student.className} &bull; {student.matricule}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Notification Banner */}
        <div className="px-6 py-2.5 bg-slate-900 text-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Chiffrement de bout en bout au repos actif (Protocole <strong>AES-GCM / Vault ENCv1</strong>). Accès strictement restreint.
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] bg-slate-800 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
            <Lock className="w-3 h-3" /> RBAC Certifié
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {!isAuthorized ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold">Accès non autorisé aux données de santé</p>
                <p className="mt-1">
                  Votre rôle ({userRole}) ne dispose pas des privilèges nécessaires pour consulter les dossiers médicaux confidentiels de cet élève.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Groupe Sanguin */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Groupe Sanguin & Facteur Rhésus
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {BLOOD_GROUPS.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setBloodGroup(bg)}
                      className={`px-3 py-2 rounded-xl text-xs font-black transition-all border ${
                        bloodGroup === bg
                          ? "bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-200"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {bg === "NON_DEFINI" ? "Non défini" : bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergies & Intolérances */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Allergies & Intolérances alimentaires / médicamenteuses</span>
                  <span className="text-[10px] text-slate-400">Ex: Arachides, Pénicilline...</span>
                </label>
                <textarea
                  rows={2}
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-primary focus:border-transparent"
                  placeholder="Mentionner les allergies connues..."
                />
              </div>

              {/* Antécédents Médicaux */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Antécédents médicaux & chirurgicaux</span>
                  <span className="text-[10px] text-slate-400">Ex: Asthme, Drépanocytose, Épilepsie...</span>
                </label>
                <textarea
                  rows={2}
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-primary focus:border-transparent"
                  placeholder="Pathologies chroniques, interventions chirurgicales..."
                />
              </div>

              {/* Historique de Vaccination */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Historique des Vaccinations (Carnet de santé)</span>
                  <span className="text-[10px] text-slate-400">PEV Bénin, Fièvre Jaune, Méningite...</span>
                </label>
                <input
                  type="text"
                  value={vaccinationHistory}
                  onChange={(e) => setVaccinationHistory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-primary focus:border-transparent"
                  placeholder="Ex: BCG, Pentavalent, Fièvre Jaune à jour"
                />
              </div>

              {/* Informations Médicales Importantes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Informations & Recommandations scolaires importantes</span>
                  <span className="text-[10px] text-slate-400">Port de lunettes, dispense d'EPS, PAI...</span>
                </label>
                <textarea
                  rows={2}
                  value={importantNotes}
                  onChange={(e) => setImportantNotes(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-primary focus:border-transparent"
                  placeholder="Recommandations d'aménagement pour les enseignants..."
                />
              </div>

              {/* Contacts d'Urgence */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Contact d'Urgence Immédiate</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Nom complet du contact
                    </label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-primary"
                      placeholder="M. ou Mme..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Téléphone d'urgence (Joignable 24/7)
                    </label>
                    <input
                      type="tel"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-primary font-mono"
                      placeholder="+229 ..."
                      required
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Fermer
            </button>
            {isAuthorized && (
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer & Chiffrer</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
