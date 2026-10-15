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

const ALERTS: MissingGradeAlert[] = [
  { id: "alt-01", className: "3ème A", subject: "PCT", teacherName: "M. Pamphile BIO", evaluation: "Devoir Surveillé 2", dueDate: "25/09/2026", missingStudentsCount: 48 },
  { id: "alt-02", className: "1ère D", subject: "SVT", teacherName: "Mme Reine ZANNOU", evaluation: "Interrogation 2", dueDate: "26/09/2026", missingStudentsCount: 14 },
  { id: "alt-03", className: "Terminale C", subject: "Philosophie", teacherName: "M. Roger DEGBE", evaluation: "Devoir Surveillé 1", dueDate: "20/09/2026", missingStudentsCount: 32 },
];

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
    </div>
  );
}
