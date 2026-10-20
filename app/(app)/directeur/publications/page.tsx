"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Eye,
  EyeOff,
  Award,
  Check,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Calendar,
  Sparkles,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";

export interface PublicResultItem {
  id: string;
  title: string;
  rate: string;
  description?: string;
  session?: string;
  isPublished: boolean;
  date: string;
  updatedAt?: string;
}

const STORAGE_KEY = "ecogest_public_results_v1";

const DEFAULT_PUBLIC_RESULTS: PublicResultItem[] = [];

export default function PublicationsPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<PublicResultItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PublicResultItem | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formRate, setFormRate] = useState("");
  const [formSession, setFormSession] = useState("Session 2026");
  const [formDescription, setFormDescription] = useState("");
  const [formIsPublished, setFormIsPublished] = useState(true);

  // Charger les résultats depuis le stockage persistant
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Supprimer tout reliquat d'anciennes données d'exemple fictives
          const cleaned = parsed.filter(
            (item: PublicResultItem) =>
              item.id !== "p-01" &&
              item.id !== "p-02" &&
              item.id !== "p-03" &&
              item.id !== "p-04"
          );
          setItems(cleaned);
          setIsLoaded(true);
          return;
        }
      }
      setItems(DEFAULT_PUBLIC_RESULTS);
    } catch (e) {
      console.warn("Erreur chargement résultats publics :", e);
      setItems(DEFAULT_PUBLIC_RESULTS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sauvegarder dans le stockage persistant
  const saveItemsToStorage = (newItems: PublicResultItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error("Erreur sauvegarde résultats publics :", e);
    }
  };

  const openNewModal = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormRate("");
    setFormSession("Session 2026");
    setFormDescription("");
    setFormIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: PublicResultItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormRate(item.rate);
    setFormSession(item.session || "Session 2026");
    setFormDescription(item.description || "");
    setFormIsPublished(item.isPublished);
    setIsModalOpen(true);
  };

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formRate.trim()) {
      toast("Veuillez renseigner le titre et l'indicateur clé.", "error");
      return;
    }

    const todayStr = new Date().toLocaleDateString("fr-FR");

    if (editingItem) {
      // Modification
      const updated = items.map((it) =>
        it.id === editingItem.id
          ? {
              ...it,
              title: formTitle.trim(),
              rate: formRate.trim(),
              session: formSession.trim(),
              description: formDescription.trim(),
              isPublished: formIsPublished,
              date: todayStr,
              updatedAt: new Date().toISOString(),
            }
          : it
      );
      saveItemsToStorage(updated);
      toast(`Résultat public « ${formTitle} » modifié et enregistré avec succès !`, "success");
    } else {
      // Nouveau résultat
      const newItem: PublicResultItem = {
        id: `pub-${Date.now()}`,
        title: formTitle.trim(),
        rate: formRate.trim(),
        session: formSession.trim(),
        description: formDescription.trim(),
        isPublished: formIsPublished,
        date: todayStr,
        updatedAt: new Date().toISOString(),
      };
      saveItemsToStorage([newItem, ...items]);
      toast(`Nouveau résultat « ${formTitle} » enregistré avec succès dans la base !`, "success");
    }

    setIsModalOpen(false);
  };

  const togglePublish = (id: string) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        const next = !item.isPublished;
        toast(
          next
            ? `Publication en ligne activée pour « ${item.title} »`
            : `« ${item.title} » a été masqué de la vitrine publique.`,
          next ? "success" : "info"
        );
        return {
          ...item,
          isPublished: next,
          date: new Date().toLocaleDateString("fr-FR"),
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });
    saveItemsToStorage(updated);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la publication « ${title} » ?`)) {
      const filtered = items.filter((it) => it.id !== id);
      saveItemsToStorage(filtered);
      toast(`Publication « ${title} » supprimée.`, "info");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Publication des Résultats Publics"
        subtitle="Enregistrez, modifiez et gérez les indicateurs de performance visibles sur la vitrine officielle de l'école"
        breadcrumbs={[{ label: "Directeur", href: "/directeur" }, { label: "Résultats publics" }]}
        actions={
          <button
            type="button"
            onClick={openNewModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-school-primary text-white font-bold text-xs md:text-sm hover:bg-school-700 shadow-sm transition-colors touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Résultat Public</span>
          </button>
        }
      />

      {/* Résumé des publications */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total des Résultats
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{items.length}</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
            En Ligne (Vitrine)
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {items.filter((i) => i.isPublished).length}
          </span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Brouillons / Masqués
          </span>
          <span className="text-2xl font-black text-slate-600 mt-1 block">
            {items.filter((i) => !i.isPublished).length}
          </span>
        </div>
      </div>

      {/* Liste des Résultats Enregistrés */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Award className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">Aucun résultat public enregistré</p>
            <p className="text-xs text-slate-500">
              Cliquez sur « Nouveau Résultat Public » ci-dessus pour ajouter votre premier taux de réussite.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
            >
              <div className="space-y-1.5 min-w-0 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm md:text-base font-extrabold text-slate-900 truncate">
                    {item.title}
                  </h3>
                  <StatusBadge
                    status={item.isPublished ? "VALIDATED" : "DRAFT"}
                    label={item.isPublished ? "En ligne" : "Masqué"}
                    size="sm"
                  />
                  {item.session && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {item.session}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-black text-school-primary">{item.rate}</span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-xs text-slate-500">Dernière mise à jour : {item.date}</span>
                </div>

                {item.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Actions : Modifier & Gérer la publication */}
              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition touch-target"
                  title="Modifier ce résultat"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Modifier</span>
                </button>

                <button
                  type="button"
                  onClick={() => togglePublish(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors touch-target min-h-[38px] ${
                    item.isPublished
                      ? "border-rose-200 text-rose-700 bg-rose-50/70 hover:bg-rose-100"
                      : "border-emerald-200 text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100"
                  }`}
                  title={item.isPublished ? "Retirer de la vitrine" : "Publier sur la vitrine"}
                >
                  {item.isPublished ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Masquer</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Publier</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Supprimer définitivement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Création & Modification de Résultat Public */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-school-primary" />
                <h3 className="font-bold text-slate-900 text-sm md:text-base">
                  {editingItem ? "Modifier le Résultat Public" : "Enregistrer un Nouveau Résultat"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResult} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Titre de la publication *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Résultats Session BEPC 2026, Session CEP 2026..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-school-primary/20 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Taux ou indicateur clé *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 95.4 % de réussite"
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-school-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Session / Année
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Session 2026"
                    value={formSession}
                    onChange={(e) => setFormSession(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Détails &amp; Mentions complémentaires (optionnel)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: 38 % de mention Bien, 100% de réussite en Série C, 22 lauréats au tableau d'honneur..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-school-primary/20"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Visibilité sur la vitrine publique
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {formIsPublished
                      ? "Le résultat sera immédiatement consultable par le public."
                      : "Le résultat sera conservé comme brouillon masqué."}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formIsPublished}
                  onChange={(e) => setFormIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-school-primary focus:ring-school-primary border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-school-primary text-white text-xs font-bold hover:bg-school-700 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingItem ? "Enregistrer les modifications" : "Enregistrer le résultat"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
