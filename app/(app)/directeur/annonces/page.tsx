"use client";

import React, { useState } from "react";
import {
  Bell,
  Megaphone,
  Plus,
  Send,
  Users,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Sparkles,
  Search,
  Filter,
  Eye,
  Check,
  X,
  GraduationCap,
  Home,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useToast } from "@/components/ui/Toast";
import { useCommunicationStore } from "@/lib/communication-store";
import { useBulletinStore } from "@/lib/bulletin-store";
import {
  SchoolAnnouncement,
  AnnouncementTargetAudience,
  AnnouncementPriority,
  AnnouncementCategory,
} from "@/lib/types/communication";
import { cn } from "@/lib/utils";

export default function DirecteurAnnoncesPage() {
  const { toast } = useToast();
  const { announcements, publishAnnouncement, refreshData } = useCommunicationStore();
  const { classrooms } = useBulletinStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<SchoolAnnouncement | null>(null);
  const [filterAudience, setFilterAudience] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Formulaire d'annonce
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetAudience, setTargetAudience] = useState<AnnouncementTargetAudience>("ALL");
  const [targetClassId, setTargetClassId] = useState("");
  const [priority, setPriority] = useState<AnnouncementPriority>("NORMAL");
  const [category, setCategory] = useState<AnnouncementCategory>("GENERAL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAnnouncements = announcements.length;
  const urgentCount = announcements.filter((a) => a.priority === "URGENT").length;
  const totalReads = announcements.reduce((acc, a) => acc + (a.readCount || 0), 0);

  const filteredAnnouncements = announcements.filter((a) => {
    const matchAudience = filterAudience === "ALL" || a.targetAudience === filterAudience;
    const matchSearch =
      searchTerm === "" ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchAudience && matchSearch;
  });

  const handleOpenModal = () => {
    setTitle("");
    setContent("");
    setTargetAudience("ALL");
    setTargetClassId(classrooms[0]?.id || "");
    setPriority("NORMAL");
    setCategory("GENERAL");
    setIsModalOpen(true);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast("Veuillez renseigner le titre et le contenu du message.", "error");
      return;
    }

    setIsSubmitting(true);
    const targetClass = classrooms.find((c) => c.id === targetClassId);

    try {
      const res = await publishAnnouncement({
        title: title.trim(),
        content: content.trim(),
        targetAudience,
        targetClassId: targetAudience === "CLASS" || targetAudience === "PARENTS_CLASS" ? targetClassId : undefined,
        targetClassName: targetAudience === "CLASS" || targetAudience === "PARENTS_CLASS" ? targetClass?.name : undefined,
        priority,
        category,
      });

      if (res.success) {
        toast("Annonce publiée et notifications transmises aux destinataires concernés.", "success");
        setIsModalOpen(false);
      } else {
        toast("Échec de diffusion de l'annonce.", "error");
      }
    } catch {
      toast("Une erreur est survenue lors de la publication.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAudienceLabel = (aud: AnnouncementTargetAudience, className?: string) => {
    switch (aud) {
      case "ALL":
        return "Tout l'établissement";
      case "ENSEIGNANTS":
        return "Tous les enseignants";
      case "PARENTS":
        return "Tous les parents d'élèves";
      case "ELEVES":
        return "Tous les élèves";
      case "CLASS":
        return `Classe : ${className || "Spécifique"}`;
      case "PARENTS_CLASS":
        return `Parents : ${className || "Spécifique"}`;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communications & Diffusion d'Annonces"
        subtitle="Publiez des annonces ciblées vers les enseignants, les parents ou des classes précises et suivez les lectures"
        breadcrumbs={[{ label: "Directeur" }, { label: "Communications & Annonces" }]}
        actions={
          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-school-primary text-white text-xs font-bold shadow-xs hover:bg-school-primary/90 transition touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle annonce</span>
          </button>
        }
      />

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Annonces diffusées"
          value={`${totalAnnouncements}`}
          subtitle="Toutes audiences confondues"
          icon={<Megaphone className="w-6 h-6" />}
          variant="info"
        />
        <StatCard
          title="Avis urgents"
          value={`${urgentCount}`}
          subtitle={urgentCount > 0 ? "Priorité haute active" : "Aucun avis critique"}
          icon={<AlertTriangle className="w-6 h-6" />}
          variant={urgentCount > 0 ? "danger" : "default"}
        />
        <StatCard
          title="Lectures cumulées"
          value={`${totalReads}`}
          subtitle="Accusés de lecture enregistrés"
          icon={<Eye className="w-6 h-6" />}
          variant="success"
        />
        <StatCard
          title="Canaux actifs"
          value="Web, Push, Mail"
          subtitle="Multi-diffusion simultanée"
          icon={<ShieldCheck className="w-6 h-6" />}
          variant="default"
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: "ALL", label: "Toutes les annonces" },
            { key: "PARENTS", label: "Parents" },
            { key: "ENSEIGNANTS", label: "Enseignants" },
            { key: "CLASS", label: "Classes ciblées" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterAudience(tab.key)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors",
                filterAudience === tab.key
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par titre ou mot-clé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-school-primary"
          />
        </div>
      </div>

      {/* Liste des annonces */}
      <div className="space-y-3">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Aucune annonce trouvée</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Utilisez le bouton &laquo; Nouvelle annonce &raquo; pour créer et diffuser votre premier communiqué officiel.
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {ann.priority === "URGENT" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      <span>Urgent</span>
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                    {ann.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-school-50 text-school-primary border border-school-200">
                    {getAudienceLabel(ann.targetAudience, ann.targetClassName)}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 truncate">{ann.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{ann.content}</p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>Par <strong>{ann.authorName}</strong></span>
                  <span>&bull;</span>
                  <span>Publiée le {new Date(ann.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>

              {/* Read receipts & Action */}
              <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 block tabular-nums">
                    {ann.readCount || 0} lecture(s)
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Confirmées</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(ann)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Détails
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Création Annonce */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-school-primary" />
                <h3 className="text-sm font-bold text-slate-900">Diffuser une annonce officielle</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Titre du communiqué *
                </label>
                <input
                  type="text"
                  placeholder="Ex : Réunion trimestrielle des parents d'élèves"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-school-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Audience ciblée *
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as AnnouncementTargetAudience)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-school-primary"
                  >
                    <option value="ALL">Tout l&apos;établissement</option>
                    <option value="PARENTS">Tous les parents</option>
                    <option value="ENSEIGNANTS">Tous les enseignants</option>
                    <option value="ELEVES">Tous les élèves</option>
                    <option value="CLASS">Une classe particulière</option>
                    <option value="PARENTS_CLASS">Parents d&apos;une classe particulière</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priorité de diffusion
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-school-primary font-bold"
                  >
                    <option value="NORMAL">Normale</option>
                    <option value="URGENT">⚠️ Urgente (Notification immédiate)</option>
                  </select>
                </div>
              </div>

              {(targetAudience === "CLASS" || targetAudience === "PARENTS_CLASS") && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sélectionner la classe concernée *
                  </label>
                  <select
                    value={targetClassId}
                    onChange={(e) => setTargetClassId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-school-primary"
                  >
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.cycle})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-school-primary"
                >
                  <option value="GENERAL">Vie générale de l&apos;établissement</option>
                  <option value="PEDAGOGIQUE">Pédagogie &amp; Examens</option>
                  <option value="ADMINISTRATIF">Administration &amp; Inscriptions</option>
                  <option value="FINANCIER">Frais &amp; Échéances de scolarité</option>
                  <option value="DISCIPLINE">Discipline &amp; Règlement intérieur</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message officiel *
                </label>
                <textarea
                  rows={5}
                  placeholder="Rédigez ici le contenu détaillé de votre communication..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-school-primary leading-relaxed"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-snug">
                ℹ️ Cette annonce sera immédiatement visible sur les espaces connectés et sera délivrée automatiquement aux utilisateurs hors ligne dès leur prochaine visite.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-school-primary hover:bg-school-primary/90 rounded-xl shadow-xs transition"
                >
                  {isSubmitting ? "Diffusion en cours..." : "Publier l'annonce"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Consultation Détails Annonce */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold uppercase tracking-wider text-school-primary">
                Fiche officielle de l&apos;annonce
              </span>
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                {selectedAnnouncement.priority === "URGENT" && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200">
                    Avis Urgent
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                  {selectedAnnouncement.category}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-school-50 text-school-primary">
                  {getAudienceLabel(selectedAnnouncement.targetAudience, selectedAnnouncement.targetClassName)}
                </span>
              </div>

              <h2 className="text-base font-bold text-slate-900">{selectedAnnouncement.title}</h2>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedAnnouncement.content}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-500 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block">Émetteur</span>
                  <span className="font-semibold text-slate-800">{selectedAnnouncement.authorName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Accusés de lecture</span>
                  <span className="font-mono font-bold text-emerald-700">{selectedAnnouncement.readCount || 0} confirmés</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
