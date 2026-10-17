"use client";

import { useState, useMemo } from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Send,
  X,
  Phone,
  FileQuestion,
  UserX,
  Mail,
  History,
} from "lucide-react";
import { useSurveillantStore, ParentDisciplineMessage } from "@/lib/surveillant-store";

const MESSAGE_TYPES: Array<{
  value: ParentDisciplineMessage["type"];
  label: string;
  badgeColor: string;
}> = [
  { value: "DEMANDE_JUSTIFICATIF", label: "Demande de Justificatif d'absence", badgeColor: "bg-amber-100 text-amber-800" },
  { value: "CONVOCATION", label: "Convocation Vie Scolaire", badgeColor: "bg-rose-100 text-rose-800" },
  { value: "SIGNALEMENT_INCIDENT", label: "Signalement d'incident disciplinaire", badgeColor: "bg-purple-100 text-purple-800" },
  { value: "AVIS_RETARD", label: "Notification de retard", badgeColor: "bg-blue-100 text-blue-800" },
];

export default function SurveillantParentMessagesPage() {
  const {
    parentComms,
    students,
    classrooms,
    sendParentDisciplineMessage,
  } = useSurveillantStore();

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modal Nouveau Message
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [type, setType] = useState<ParentDisciplineMessage["type"]>("CONVOCATION");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Modal Réponse Parent
  const [replyMessageId, setReplyMessageId] = useState<string | null>(null);
  const [parentReplyText, setParentReplyText] = useState("");

  const filteredMessages = useMemo(() => {
    return parentComms.filter((m) => {
      const matchSearch =
        m.studentName.toLowerCase().includes(search.toLowerCase()) ||
        m.parentName.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.message.toLowerCase().includes(search.toLowerCase());

      const matchType = selectedType === "ALL" || m.type === selectedType;
      const matchStatus = selectedStatus === "ALL" || m.status === selectedStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [parentComms, search, selectedType, selectedStatus]);

  const handleStudentSelect = (id: string) => {
    setStudentId(id);
    const st = students.find((s) => s.id === id);
    if (st) {
      if (type === "CONVOCATION") {
        setSubject(`Convocation urgente : Parents de ${st.firstName} ${st.lastName} (${st.className})`);
        setMessage(
          `Bonjour M./Mme ${st.parentName}. Vous êtes prié(e) de bien vouloir vous présenter au bureau de la Surveillance Générale le [Date] à [Heure] concernant la situation disciplinaire de votre enfant ${st.firstName} ${st.lastName}. Cordialement.`
        );
      } else if (type === "DEMANDE_JUSTIFICATIF") {
        setSubject(`Demande de justificatif d'absence : ${st.firstName} ${st.lastName} (${st.className})`);
        setMessage(
          `Bonjour M./Mme ${st.parentName}. Nous constatons une absence non justifiée de votre enfant ${st.firstName}. Merci de nous faire parvenir le motif ou un certificat médical dans les meilleurs délais.`
        );
      } else if (type === "AVIS_RETARD") {
        setSubject(`Avis de retard : ${st.firstName} ${st.lastName} (${st.className})`);
        setMessage(
          `Bonjour M./Mme ${st.parentName}. Votre enfant est arrivé en retard en classe ce matin. Merci de veiller au respect des horaires de l'établissement.`
        );
      } else {
        setSubject(`Avis disciplinaire : ${st.firstName} ${st.lastName} (${st.className})`);
        setMessage(
          `Bonjour M./Mme ${st.parentName}. Votre enfant a fait l'objet d'un rapport disciplinaire ce jour. Merci de prendre contact avec la vie scolaire.`
        );
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === studentId);
    if (!st) {
      alert("Veuillez sélectionner un élève.");
      return;
    }

    sendParentDisciplineMessage({
      studentId: st.id,
      studentName: `${st.firstName} ${st.lastName}`,
      className: st.className,
      parentName: st.parentName,
      parentPhone: st.parentPhone,
      type,
      subject,
      message,
      sentBy: "Augustin SOSSOU (Surveillant Général)",
    });

    setIsModalOpen(false);
    setStudentId("");
    setSubject("");
    setMessage("");
  };

  const handleSaveParentReply = (msgId: string) => {
    const existing = parentComms.find((m) => m.id === msgId);
    if (existing) {
      existing.parentResponse = parentReplyText;
      existing.responseReceivedAt = `${new Date().toLocaleDateString("fr-FR")} ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
      existing.status = "REPONDU";
      localStorage.setItem("educogest_surveillant_parent_comms_v1", JSON.stringify(parentComms));
      window.dispatchEvent(new Event("educogest_surveillant_storage_update"));
    }
    setReplyMessageId(null);
    setParentReplyText("");
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-rose-700 text-sm font-semibold uppercase tracking-wider mb-1">
            <MessageSquare className="w-4 h-4" />
            Communication Vie Scolaire
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Convocations & Échanges avec les Parents
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Envoi de convocations, demandes écrites de justificatifs d'absence, signalements et traçabilité des réponses des familles.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Convocation / Message
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par élève, parent, objet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            >
              <option value="ALL">Tous les types de messages</option>
              {MESSAGE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            >
              <option value="ALL">Tous les statuts de réponse</option>
              <option value="EN_ATTENTE_REPONSE">⏳ En attente de réponse</option>
              <option value="REPONDU">✅ Réponse reçue / Conclu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-medium text-gray-700">Aucun message pour le moment</p>
            <p className="text-xs text-gray-400 mt-1">
              Les convocations et demandes de justificatifs apparaîtront ici.
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const typeMeta = MESSAGE_TYPES.find((t) => t.value === msg.type);
            return (
              <div
                key={msg.id}
                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-50 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeMeta?.badgeColor}`}>
                      {typeMeta?.label}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      Élève : {msg.studentName} ({msg.className})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Envoyé le {msg.sentAt}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        msg.status === "REPONDU"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {msg.status === "REPONDU" ? "Répondu" : "En attente"}
                    </span>
                  </div>
                </div>

                {/* Parent Contact Details */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-1.5 font-medium text-gray-900">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                    Destinataire : {msg.parentName}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-600" />
                    {msg.parentPhone}
                  </div>
                  <div className="text-gray-400">Émetteur : {msg.sentBy}</div>
                </div>

                {/* Message Content */}
                <div className="text-xs space-y-1">
                  <p className="font-bold text-gray-900">{msg.subject}</p>
                  <p className="text-gray-700 bg-white p-3 rounded-lg border border-gray-100 leading-relaxed">
                    {msg.message}
                  </p>
                </div>

                {/* Parent Response Box */}
                {msg.parentResponse ? (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1 text-emerald-900">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                        Réponse enregistrée du parent :
                      </span>
                      {msg.responseReceivedAt && (
                        <span className="text-[11px] text-emerald-700">
                          Reçu le : {msg.responseReceivedAt}
                        </span>
                      )}
                    </div>
                    <p className="italic bg-white/70 p-2 rounded border border-emerald-100">
                      "{msg.parentResponse}"
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <span className="text-xs text-amber-700 italic">
                      En attente de justificatif ou de présence physique au rendez-vous.
                    </span>
                    <button
                      onClick={() => setReplyMessageId(msg.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Consigner la réponse du parent
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL : NOUVELLE COMMUNICATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-rose-700">
                <MessageSquare className="w-5 h-5" />
                <h3 className="font-bold text-gray-900 text-lg">
                  Envoyer une Convocation / Notification
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Type d'échange *
                </label>
                <select
                  value={type}
                  onChange={(e) => {
                    const newType = e.target.value as ParentDisciplineMessage["type"];
                    setType(newType);
                    if (studentId) handleStudentSelect(studentId);
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  {MESSAGE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Élève concerné *
                </label>
                <select
                  required
                  value={studentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  <option value="">Sélectionnez l'élève...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.lastName} {s.firstName} ({s.className}) - Parent: {s.parentName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Objet du message *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Texte du message / Convocation *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium rounded-xl bg-rose-700 hover:bg-rose-800 text-white shadow-sm inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Envoyer (SMS & Carnet)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL : CONSIGNER LA REPONSE */}
      {replyMessageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h3 className="font-bold text-gray-900 text-base mb-2">
              Consigner la réponse du parent
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Enregistrez le retour téléphonique, l'écrit reçu ou le compte rendu de l'entretien physique.
            </p>

            <textarea
              rows={4}
              required
              placeholder="Ex: Le parent s'est présenté ce matin à 09h et a fourni un certificat médical justifiant l'absence..."
              value={parentReplyText}
              onChange={(e) => setParentReplyText(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setReplyMessageId(null)}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleSaveParentReply(replyMessageId)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white shadow-sm"
              >
                Enregistrer le retour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
