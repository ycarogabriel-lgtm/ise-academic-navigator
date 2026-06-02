import { AppLayout } from "@/components/layout/AppLayout";
import {
  Plus, Clock, CheckCircle2, XCircle, AlertTriangle, Download, X, Ghost,
  MessageSquare, ChevronDown, Send, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

type ReservationStatus = "pending" | "approved" | "conflict" | "rejected" | "cancelled";

interface Reservation {
  id: number;
  program: string;
  resource: string;
  resourceType: "space" | "professor";
  date: string;
  timeStart: string;
  timeEnd: string;
  requestedBy: string;
  status: ReservationStatus;
  createdAt: string;
  justification?: string;
  comments?: string[];
}

const PROGRAMS_LIST = [
  "MBA Executivo – T24A",
  "Marketing Digital – T24A",
  "Liderança Estratégica – T24B",
  "Gestão de Pessoas – T24A",
  "Inovação e Startups – T24C",
  "Esp. Finanças – T23B",
];

const SPACES_LIST = [
  "Sala 101", "Sala 102", "Sala 105", "Sala 201", "Sala 202",
  "Sala 302", "Auditório A", "Auditório B", "Lab. Digital",
  "Refeitório Principal", "Sala de Equipe 1",
];

const PROFESSORS_LIST = [
  "Dr. Carlos Faria", "Dra. Ana Souza", "Dr. Pedro Costa",
  "Dr. Marcos Lima", "Dra. Lucia Mendes", "Dr. Rafael Torres", "Dra. Paula Neves",
];

const TIME_OPTIONS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00",
];

const initialReservations: Reservation[] = [
  {
    id: 1, program: "MBA Executivo – T24A", resource: "Sala 201", resourceType: "space",
    date: "2024-03-15", timeStart: "08:00", timeEnd: "12:00", requestedBy: "Dir. Carlos Faria",
    status: "pending", createdAt: "10/03/2024", comments: [],
  },
  {
    id: 2, program: "Marketing Digital – T24A", resource: "Auditório A", resourceType: "space",
    date: "2024-03-20", timeStart: "09:00", timeEnd: "13:00", requestedBy: "Dir. Beatriz Campos",
    status: "approved", createdAt: "08/03/2024", comments: ["Confirmado pelo planejamento."],
  },
  {
    id: 3, program: "Liderança Estratégica – T24B", resource: "Dr. Marcos Lima", resourceType: "professor",
    date: "2024-03-18", timeStart: "14:00", timeEnd: "17:00", requestedBy: "Dir. Carlos Faria",
    status: "conflict", createdAt: "11/03/2024", comments: [],
  },
  {
    id: 4, program: "Gestão de Pessoas – T24A", resource: "Sala 302", resourceType: "space",
    date: "2024-03-14", timeStart: "08:00", timeEnd: "11:00", requestedBy: "Dir. Helena Costa",
    status: "approved", createdAt: "07/03/2024", comments: [],
  },
  {
    id: 5, program: "Inovação e Startups – T24C", resource: "Lab. Digital", resourceType: "space",
    date: "2024-03-22", timeStart: "09:00", timeEnd: "12:00", requestedBy: "Dir. Beatriz Campos",
    status: "pending", createdAt: "12/03/2024", comments: [],
  },
  {
    id: 6, program: "Esp. Finanças – T23B", resource: "Sala 105", resourceType: "space",
    date: "2024-03-13", timeStart: "14:00", timeEnd: "18:00", requestedBy: "Dir. Carlos Faria",
    status: "rejected", createdAt: "06/03/2024", justification: "Sala indisponível neste período.", comments: [],
  },
];

const statusConfig: Record<ReservationStatus, { label: string; iconClass: string; icon: React.ElementType }> = {
  pending:   { label: "Aguardando", iconClass: "text-warning",          icon: Clock },
  approved:  { label: "Aprovado",   iconClass: "text-success",          icon: CheckCircle2 },
  conflict:  { label: "Conflito",   iconClass: "text-destructive",      icon: AlertTriangle },
  rejected:  { label: "Recusado",   iconClass: "text-muted-foreground", icon: XCircle },
  cancelled: { label: "Cancelado",  iconClass: "text-muted-foreground", icon: XCircle },
};

// ── New Reservation Modal ─────────────────────────────────────────
interface NewResForm {
  program: string;
  resource: string;
  resourceType: "space" | "professor";
  date: string;
  timeStart: string;
  timeEnd: string;
  activityType: string;
}

function NewReservationModal({ onSave, onClose }: { onSave: (f: NewResForm) => void; onClose: () => void }) {
  const [form, setForm] = useState<NewResForm>({
    program: "", resource: "", resourceType: "space", date: "",
    timeStart: "08:00", timeEnd: "12:00", activityType: "",
  });
  const [errors, setErrors] = useState<Partial<NewResForm>>({});

  const validate = () => {
    const e: Partial<NewResForm> = {};
    if (!form.program) e.program = "Campo obrigatório";
    if (!form.resource) e.resource = "Campo obrigatório";
    if (!form.date) e.date = "Campo obrigatório";
    if (!form.timeStart) e.timeStart = "Campo obrigatório";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  };

  const resourceList = form.resourceType === "space" ? SPACES_LIST : PROFESSORS_LIST;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-bold text-lg text-foreground">Nova Pré-Reserva</h2>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Ghost className="w-3 h-3" />
              Criada como Pré-Reservada (aguardando aprovação)
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          {/* Programa (select) */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Programa *</label>
            <select
              className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground", errors.program ? "border-destructive" : "border-input")}
              value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })}
            >
              <option value="">Selecione o programa...</option>
              {PROGRAMS_LIST.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.program && <p className="text-xs text-destructive mt-1">{errors.program}</p>}
          </div>

          {/* Tipo de recurso */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Tipo de recurso</label>
            <div className="flex gap-2">
              {(["space", "professor"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setForm({ ...form, resourceType: t, resource: "" })}
                  className={cn("flex-1 py-2 text-xs font-medium rounded-lg border transition-all", form.resourceType === t ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40")}>
                  {t === "space" ? "Sala / Espaço" : "Professor / Docente"}
                </button>
              ))}
            </div>
          </div>

          {/* Sala (select) ou Professor (select) */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
              {form.resourceType === "space" ? "Sala desejada *" : "Docente *"}
            </label>
            <select
              className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground", errors.resource ? "border-destructive" : "border-input")}
              value={form.resource} onChange={(e) => setForm({ ...form, resource: e.target.value })}
            >
              <option value="">Selecione {form.resourceType === "space" ? "a sala" : "o docente"}...</option>
              {resourceList.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.resource && <p className="text-xs text-destructive mt-1">{errors.resource}</p>}
          </div>

          {/* Tipo de atividade */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Tipo de atividade</label>
            <select
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              value={form.activityType} onChange={(e) => setForm({ ...form, activityType: e.target.value })}
            >
              <option value="">Selecione...</option>
              {["Aula presencial", "Workshop", "Palestra", "Módulo intensivo", "Atividade prática", "Reunião de equipe", "Outro"].map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Data */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Data *</label>
            <input
              type="date"
              className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30", errors.date ? "border-destructive" : "border-input")}
              value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            {errors.date && <p className="text-xs text-destructive mt-1">{errors.date}</p>}
          </div>

          {/* Horário (time selectors) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Horário início *</label>
              <select
                className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground", errors.timeStart ? "border-destructive" : "border-input")}
                value={form.timeStart} onChange={(e) => setForm({ ...form, timeStart: e.target.value })}
              >
                {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Horário fim</label>
              <select
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                value={form.timeEnd} onChange={(e) => setForm({ ...form, timeEnd: e.target.value })}
              >
                {TIME_OPTIONS.filter((t) => t > form.timeStart).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-2 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">Cancelar</button>
          <button onClick={handleSave} className="flex-1 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Enviar Solicitação
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Review / Reject Modal ─────────────────────────────────────────
function ReviewModal({
  reservation, mode, onConfirm, onClose,
}: { reservation: Reservation; mode: "approve" | "reject" | "cancel"; onConfirm: (justification?: string) => void; onClose: () => void }) {
  const [justification, setJustification] = useState("");
  const [alternative, setAlternative] = useState("");
  const [error, setError] = useState("");

  const isReject = mode === "reject";
  const isCancel = mode === "cancel";

  const handleConfirm = () => {
    if (isReject && !justification.trim()) { setError("Justificativa é obrigatória para recusar."); return; }
    onConfirm(justification || undefined);
  };

  const titles = { approve: "Aprovar Reserva", reject: "Recusar Solicitação", cancel: "Cancelar Pré-Reserva" };
  const confirmLabels = { approve: "Confirmar Aprovação", reject: "Recusar", cancel: "Cancelar Solicitação" };
  const confirmVariants = {
    approve: "bg-primary text-primary-foreground hover:bg-primary/90",
    reject:  "border border-border text-muted-foreground hover:bg-muted",
    cancel:  "border border-border text-muted-foreground hover:bg-muted",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-foreground">{titles[mode]}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="bg-muted/40 rounded-lg p-3 mb-4 text-xs space-y-1">
          <p><span className="text-muted-foreground">Programa:</span> <strong className="text-foreground">{reservation.program}</strong></p>
          <p><span className="text-muted-foreground">Recurso:</span> <strong className="text-foreground">{reservation.resource}</strong></p>
          <p><span className="text-muted-foreground">Data / Hora:</span> <strong className="text-foreground">{new Date(reservation.date + "T00:00:00").toLocaleDateString("pt-BR")} · {reservation.timeStart} – {reservation.timeEnd}</strong></p>
        </div>

        {mode === "approve" && (
          <p className="text-sm text-muted-foreground mb-4">
            Ao aprovar, a sala/docente será <strong>bloqueado</strong> neste período e a reserva aparecerá no calendário oficial. O solicitante será notificado.
          </p>
        )}

        {(isReject || isCancel) && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Justificativa {isReject ? "*" : "(opcional)"}
              </label>
              <textarea
                rows={3}
                className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none", error ? "border-destructive" : "border-input")}
                value={justification} onChange={(e) => { setJustification(e.target.value); setError(""); }}
                placeholder={isReject ? "Informe o motivo da recusa..." : "Motivo do cancelamento (opcional)..."}
              />
              {error && <p className="text-xs text-destructive mt-1">{error}</p>}
            </div>
            {isReject && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Sugerir alternativa (opcional)</label>
                <input
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={alternative} onChange={(e) => setAlternative(e.target.value)}
                  placeholder="Ex: Sala 302 disponível no mesmo horário"
                />
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">Voltar</button>
          <button onClick={handleConfirm} className={cn("flex-1 py-2 text-sm font-medium rounded-lg transition-colors", confirmVariants[mode])}>
            {confirmLabels[mode]}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Drawer ─────────────────────────────────────────────────
function DetailDrawer({ reservation, onClose, onApprove, onReject, onCancel }: {
  reservation: Reservation;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onCancel: () => void;
}) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>(reservation.comments || []);
  const s = statusConfig[reservation.status];

  const addComment = () => {
    if (!comment.trim()) return;
    setComments([...comments, comment.trim()]);
    setComment("");
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div className="fixed inset-0 bg-black/30" />
      <div className="relative z-50 bg-card border-l border-border w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-border flex items-start justify-between">
          <div>
            <h2 className="font-display font-bold text-foreground leading-tight">{reservation.program}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 w-fit", s.class)}>
                <s.icon className="w-2.5 h-2.5" />{s.label}
              </span>
              {reservation.status === "pending" && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Ghost className="w-3 h-3" /> Reserva fantasma
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Recurso", value: reservation.resource },
              { label: "Tipo", value: reservation.resourceType === "space" ? "Espaço" : "Docente" },
              { label: "Data", value: new Date(reservation.date + "T00:00:00").toLocaleDateString("pt-BR") },
              { label: "Horário", value: `${reservation.timeStart} – ${reservation.timeEnd}` },
              { label: "Solicitado por", value: reservation.requestedBy },
              { label: "Criado em", value: reservation.createdAt },
            ].map((item) => (
              <div key={item.label} className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>

          {reservation.justification && (
            <div className="bg-muted/40 border border-border rounded-lg p-3">
              <p className="text-xs font-semibold text-foreground mb-1">Justificativa de recusa</p>
              <p className="text-xs text-muted-foreground">{reservation.justification}</p>
            </div>
          )}

          {/* Comments */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Comentários internos
            </p>
            {comments.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Nenhum comentário ainda.</p>
            ) : (
              <div className="space-y-2">
                {comments.map((c, i) => (
                  <div key={i} className="bg-muted/40 rounded-lg px-3 py-2">
                    <p className="text-xs text-foreground">{c}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Planejamento · agora</p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <input
                className="flex-1 px-3 py-2 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Adicionar comentário..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addComment()}
              />
              <button onClick={addComment} disabled={!comment.trim()} className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-40 transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        {(reservation.status === "pending" || reservation.status === "conflict") && (
          <div className="p-5 border-t border-border space-y-2">
            <button onClick={onApprove} className="w-full py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Aprovar Reserva
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={onReject} className="py-2 text-sm font-medium border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors">Recusar</button>
              <button onClick={onCancel} className="py-2 text-sm font-medium border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors">Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [filter, setFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [reviewMode, setReviewMode] = useState<"approve" | "reject" | "cancel" | null>(null);

  const filtered = reservations.filter((r) => {
    if (r.status === "cancelled" && filter === "all") return false;
    return filter === "all" || r.status === filter;
  });

  const updateStatus = (id: number, status: ReservationStatus, justification?: string) => {
    setReservations(reservations.map((r) => r.id === id ? { ...r, status, justification } : r));
  };

  const handleCreate = (form: NewResForm) => {
    const newRes: Reservation = {
      id: Date.now(), program: form.program, resource: form.resource, resourceType: form.resourceType,
      date: form.date, timeStart: form.timeStart, timeEnd: form.timeEnd,
      requestedBy: "Dir. Usuário Atual", status: "pending", createdAt: new Date().toLocaleDateString("pt-BR"), comments: [],
    };
    setReservations([newRes, ...reservations]);
    setShowNew(false);
    toast({
      title: "👻 Pré-Reserva criada.",
      description: "Notificação enviada ao time de planejamento.",
      className: "top-center-toast bg-success text-success-foreground border-success",
    });
  };

  const handleApprove = () => {
    if (!selected) return;
    updateStatus(selected.id, "approved");
    toast({
      title: "✅ Reserva aprovada.",
      description: "Sala/Docente bloqueado. Solicitante notificado.",
      className: "top-center-toast bg-success text-success-foreground border-success",
    });
    setSelected(null); setReviewMode(null);
  };

  const handleReject = (justification?: string) => {
    if (!selected) return;
    updateStatus(selected.id, "rejected", justification);
    toast({ title: "Reserva recusada.", description: "Solicitante foi notificado.", variant: "destructive" });
    setSelected(null); setReviewMode(null);
  };

  const handleCancel = (justification?: string) => {
    if (!selected) return;
    updateStatus(selected.id, "cancelled", justification);
    toast({ title: "Solicitação cancelada." });
    setSelected(null); setReviewMode(null);
  };

  return (
    <AppLayout pageTitle="Pré-Reservas" pageSubtitle="Solicitações e aprovação de recursos">
      <div className="p-6 space-y-5 animate-fade-in">
        {/* Mapa de calor link */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs text-foreground flex-1">Verifique a disponibilidade no <strong>Mapa de Calor</strong> antes de criar uma pré-reserva.</p>
          <a href="/occupancy" className="text-xs text-primary font-medium hover:underline whitespace-nowrap">Ver Mapa de Calor →</a>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Pendentes", count: reservations.filter((r) => r.status === "pending").length, iconClass: "text-warning",          icon: Clock },
            { label: "Aprovadas", count: reservations.filter((r) => r.status === "approved").length, iconClass: "text-success",          icon: CheckCircle2 },
            { label: "Conflitos", count: reservations.filter((r) => r.status === "conflict").length, iconClass: "text-destructive",      icon: AlertTriangle },
            { label: "Recusadas", count: reservations.filter((r) => r.status === "rejected").length, iconClass: "text-muted-foreground", icon: XCircle },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
              <s.icon className={cn("w-5 h-5 shrink-0", s.iconClass)} />
              <div>
                <p className="font-display font-bold text-xl text-foreground">{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { key: "all", label: "Todas" },
              { key: "pending", label: "Pendentes" },
              { key: "conflict", label: "Conflitos" },
              { key: "approved", label: "Aprovadas" },
              { key: "rejected", label: "Recusadas" },
              { key: "cancelled", label: "Canceladas" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg border font-medium transition-all",
                  filter === f.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <Download className="w-3.5 h-3.5" />
              Exportar XLS
            </button>
            <button
              onClick={() => setShowNew(true)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Pré-Reserva
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Programa</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Recurso</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Data / Hora</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden xl:table-cell">Solicitado por</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((res) => {
                const s = statusConfig[res.status];
                const isPending = res.status === "pending";
                const isConflict = res.status === "conflict";
                return (
                  <tr
                    key={res.id}
                    className={cn(
                      "border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer",
                      (res.status === "cancelled" || res.status === "rejected") && "opacity-60"
                    )}
                    onClick={() => setSelected(res)}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {isPending && <span title="Reserva fantasma"><Ghost className="w-3 h-3 text-muted-foreground shrink-0" /></span>}
                        <div>
                          <p className="text-xs font-semibold text-foreground leading-tight">{res.program}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 md:hidden">{res.resource}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <p className="text-xs text-foreground">{res.resource}</p>
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <p className="text-xs text-foreground">{new Date(res.date + "T00:00:00").toLocaleDateString("pt-BR")}</p>
                      <p className="text-xs text-muted-foreground">{res.timeStart} – {res.timeEnd}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground hidden xl:table-cell">{res.requestedBy}</td>
                    <td className="px-3 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full border border-border bg-muted/40 font-medium flex items-center gap-1 w-fit text-foreground">
                        <s.icon className={cn("w-2.5 h-2.5", s.iconClass)} />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {(isPending || isConflict) && (
                          <>
                            <button
                              onClick={() => { setSelected(res); setReviewMode("approve"); }}
                              className="text-xs px-2 py-1 bg-muted text-foreground rounded-md hover:bg-muted/60 transition-colors font-medium"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => { setSelected(res); setReviewMode("reject"); }}
                              className="text-xs px-2 py-1 bg-muted text-foreground rounded-md hover:bg-muted/60 transition-colors font-medium"
                            >
                              Recusar
                            </button>
                          </>
                        )}
                        {(res.status === "approved" || res.status === "rejected" || res.status === "cancelled") && (
                          <button
                            onClick={() => setSelected(res)}
                            className="text-xs px-2 py-1 border border-border text-muted-foreground rounded-md hover:bg-muted transition-colors font-medium flex items-center gap-1"
                          >
                            Ver detalhes <ChevronDown className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">Nenhuma reserva encontrada para este filtro.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showNew && <NewReservationModal onSave={handleCreate} onClose={() => setShowNew(false)} />}

      {selected && !reviewMode && (
        <DetailDrawer
          reservation={selected}
          onClose={() => setSelected(null)}
          onApprove={() => setReviewMode("approve")}
          onReject={() => setReviewMode("reject")}
          onCancel={() => setReviewMode("cancel")}
        />
      )}

      {selected && reviewMode === "approve" && (
        <ReviewModal reservation={selected} mode="approve" onConfirm={handleApprove} onClose={() => setReviewMode(null)} />
      )}
      {selected && reviewMode === "reject" && (
        <ReviewModal reservation={selected} mode="reject" onConfirm={handleReject} onClose={() => setReviewMode(null)} />
      )}
      {selected && reviewMode === "cancel" && (
        <ReviewModal reservation={selected} mode="cancel" onConfirm={handleCancel} onClose={() => setReviewMode(null)} />
      )}
    </AppLayout>
  );
}
