"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Receipt, ArrowLeft, User, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaymentStepper } from "@/components/school/PaymentStepper";
import { Skeleton } from "@/components/ui/EmptyState";
import { MOCK_STUDENTS, Student } from "@/lib/mock-data";
import { formatFCFA } from "@/lib/utils";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStudentId = searchParams.get("studentId");

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(
    MOCK_STUDENTS.find((s) => s.id === initialStudentId) || MOCK_STUDENTS[0]
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Enregistrement d'un Paiement de Scolarité"
        subtitle="Guichet d'encaissement direct avec émission instantanée du reçu officiel"
        breadcrumbs={[
          { label: "Comptabilité", href: "/comptabilite" },
          { label: "Encaisser un paiement" },
        ]}
      />

      {/* Student Selector Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
          Sélectionner l'élève bénéficiaire
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MOCK_STUDENTS.map((student) => {
            const isSelected = selectedStudent?.id === student.id;
            return (
              <button
                key={student.id}
                type="button"
                onClick={() => setSelectedStudent(student)}
                className={`p-3 rounded-xl border text-left transition-all touch-target ${
                  isSelected
                    ? "border-school-primary bg-school-50/70 ring-1 ring-school-primary"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="font-bold text-xs text-slate-900">
                  {student.firstName} {student.lastName}
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                  <span>{student.className}</span>
                  <span className="font-semibold text-rose-600 tabular-nums">
                    Reste : {formatFCFA(student.remainingTuition)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-step Payment Engine */}
      {selectedStudent && (
        <PaymentStepper
          student={selectedStudent}
          onPaymentSuccess={(recId) => {
            console.log("Paiement validé :", recId);
          }}
          onCancel={() => router.push("/comptabilite/eleves")}
        />
      )}
    </div>
  );
}

export default function EncaisserPaiementPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 max-w-3xl mx-auto p-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
