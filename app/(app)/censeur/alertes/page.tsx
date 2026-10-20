"use client";

import React, { useState } from "react";
import { AlertTriangle, Send, BellRing, Check, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/Toast";

interface MissingGradeAlert {
  id: string;
  className: string;
  subject: string;
  teacherName: string;
  evaluation: string;
  dueDate: string;
  missingStudentsCount: number;
}

const ALERTS: MissingGradeAlert[] = [];

export default function AlertesNotesPage() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<MissingGradeAlert[]>(ALERTS);
  const [sentAlerts, setSentAlerts] = useState<string[]>([]);

  const handleSendReminder = (alert: MissingGradeAlert) => {
    setSentAlerts((prev) => [...prev, alert.id]);
    toast(`Notification de rappel envoyée à ${alert.teacherName} (${alert.subject})`, "success");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Alertes de Notes Manquantes"
        subtitle="Suivi des évaluations non saisies dans les délais réglementaires et relance des enseignants"
        breadcrumbs={[{ label: "Censeur", href: "/censeur" }, { label: "Alertes notes" }]}
      />

      {alerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
          <Check className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Aucune alerte de note manquante</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Toutes les évaluations sont à jour ou aucune saisie en retard n&apos;a été détectée par le système.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alt) => {
            const isSent = sentAlerts.includes(alt.id);
            return (
              <div
                key={alt.id}
                className="p-4 md:p-5 rounded-2xl bg-white border border-rose-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm md:text-base">
                        {alt.className} &middot; {alt.subject}
                      </h3>
                      <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-semibold border border-rose-200">
                        {alt.missingStudentsCount} notes manquantes
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Évaluation : <span className="font-semibold text-slate-800">{alt.evaluation}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Professeur : {alt.teacherName} &middot; Date limite :{" "}
                      <span className="font-mono text-rose-600 font-semibold">{alt.dueDate}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendReminder(alt)}
                  disabled={isSent}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-xs md:text-sm shadow-sm transition-colors touch-target min-h-[44px] ${
                    isSent
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default"
                      : "bg-school-primary hover:bg-school-700 text-white"
                  }`}
                >
                  {isSent ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Relance transmise</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Envoyer une relance</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
