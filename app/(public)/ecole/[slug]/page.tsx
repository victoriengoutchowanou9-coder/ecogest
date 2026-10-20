import React from "react";
import Link from "next/link";
import {
  School,
  MapPin,
  Phone,
  Mail,
  Award,
  CheckCircle2,
  Calendar,
  DollarSign,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { CURRENT_SCHOOL } from "@/lib/permissions";
import { SchoolMap } from "@/components/school/SchoolMap";
import { formatFCFA } from "@/lib/utils";

export default function EcolePubliquePage() {
  const examResults: Array<{ year: string; bepc: string; bac: string; mentionBien: string }> = [];

  const tuitionFees: Array<{ cycle: string; montant: number; echeances: string }> = [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-school-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
            E
          </div>
          <div>
            <h1 className="text-base font-bold text-school-primary leading-tight">
              {CURRENT_SCHOOL.name}
            </h1>
            <p className="text-xs text-slate-500">{CURRENT_SCHOOL.address}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/connexion"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-school-primary hover:bg-school-700 text-white font-semibold text-xs md:text-sm shadow-sm transition-colors touch-target min-h-[40px]"
          >
            <span>Espace Connecté</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8 space-y-10 flex-1">
        {/* Hero Section with pexels-tosin-olowoleni photo banner */}
        <section
          className="rounded-3xl p-6 md:p-12 text-white shadow-xl relative overflow-hidden bg-cover bg-center border border-slate-800"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(15, 23, 42, 0.94) 0%, rgba(30, 41, 59, 0.88) 55%, rgba(15, 23, 42, 0.65) 100%), url('/images/pexels-tosin-olowoleni-2148141635-34162713.jpg')",
          }}
        >
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm border border-white/20">
              Année Scolaire {CURRENT_SCHOOL.activeYear} &middot; Inscriptions Ouvertes
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
              L&apos;excellence académique au service de l&apos;avenir de vos enfants
            </h2>
            <p className="text-sm md:text-base text-slate-200 leading-relaxed">
              Fondé sur la rigueur, le travail et l&apos;épanouissement personnel, le {CURRENT_SCHOOL.name} accueille les élèves de la 6ème à la Terminale dans un cadre propice à l&apos;apprentissage moderne.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="#tarifs"
                className="px-5 py-2.5 rounded-xl bg-white text-school-primary font-bold text-sm hover:bg-slate-100 shadow-sm transition-colors touch-target min-h-[44px]"
              >
                Frais et Modalités
              </a>
              <a
                href="#carte"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/30 backdrop-blur-sm transition-colors touch-target min-h-[44px]"
              >
                Localisation GPS
              </a>
            </div>
          </div>
        </section>

        {/* Exam Results & Success Rates */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-xl font-bold text-slate-900">
              Résultats officiels &amp; Taux de réussite aux examens
            </h3>
          </div>
          <p className="text-xs md:text-sm text-slate-500">
            Taux de succès enregistrés par l&apos;établissement lors des sessions nationales du BEPC et du Baccalauréat.
          </p>

          {examResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {examResults.map((res) => (
                <div
                  key={res.year}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-sm text-slate-800">{res.year}</span>
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                      Certifié
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center pt-1">
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-[11px] font-semibold text-slate-500 block">BEPC</span>
                      <span className="text-xl font-extrabold text-school-primary tabular-nums">
                        {res.bepc}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-[11px] font-semibold text-slate-500 block">BAC</span>
                      <span className="text-xl font-extrabold text-school-primary tabular-nums">
                        {res.bac}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    Mentions Bien &amp; Très Bien : <strong className="text-slate-800">{res.mentionBien}</strong>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
              <Award className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Aucun résultat d&apos;examen officiel publié pour le moment.</p>
              <p className="text-xs text-slate-400">Les taux de réussite officiels aux sessions nationales seront affichés dès validation par la direction.</p>
            </div>
          )}
        </section>

        {/* Tuition Fees & Inscription */}
        <section id="tarifs" className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xl font-bold text-slate-900">
              Grille des Frais de Scolarité ({CURRENT_SCHOOL.activeYear})
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {tuitionFees.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {tuitionFees.map((fee, idx) => (
                  <div
                    key={idx}
                    className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-sm md:text-base font-bold text-slate-900">{fee.cycle}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Échéances : {fee.echeances}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg md:text-xl font-extrabold text-school-primary tabular-nums">
                        {formatFCFA(fee.montant)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center space-y-2">
                <DollarSign className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">Grille tarifaire officielle</p>
                <p className="text-xs text-slate-500">
                  Les modalités et les montants des frais de scolarité sont disponibles auprès du secrétariat et de la comptabilité de l&apos;établissement.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* OpenStreetMap GPS Location */}
        <section id="carte" className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-500" />
            <h3 className="text-xl font-bold text-slate-900">
              Localisation &amp; Accès
            </h3>
          </div>
          <p className="text-xs md:text-sm text-slate-500">
            {CURRENT_SCHOOL.address} &middot; Téléphone : {CURRENT_SCHOOL.phone} &middot; E-mail : {CURRENT_SCHOOL.email}
          </p>
          <SchoolMap />
        </section>
      </main>

      {/* Public Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 md:px-8 text-center text-xs text-slate-500">
        <p>
          &copy; {new Date().getFullYear()} {CURRENT_SCHOOL.name} &middot; Développé sur la plateforme GESTIO 229 / ECODUC.
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Aucune donnée à caractère personnel d&apos;élève n&apos;est accessible publiquement sans authentification sécurisée.
        </p>
      </footer>
    </div>
  );
}
