import { AppLayout } from "@/components/layout/AppLayout";
import {
  CheckSquare, Download, Send, FileText, CheckCircle2, X, AlertTriangle,
  Clock, MapPin, User, Plus, Edit2, Trash2, Bell, Calendar, List,
  ChevronRight, Save, Search, Filter, BookOpen, BarChart3, Table2,
  GraduationCap, Layers, Settings2, Play, Share2, Star, FolderOpen,
  ChevronDown, ChevronUp, SlidersHorizontal, Eye, RefreshCcw,
  FileDown, Sheet, Printer, History, Tag, Zap, Users, Building2,
  Package, Hash, BookMarked, FilePlus, Info, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

/* ─── Types ─────────────────────────────────────────────── */
type ScheduleStatus = "draft" | "review" | "approved" | "cancelled";

interface ScheduleSession {
  id: number;
  program: string;
  theme: string;
  room: string;
  professor: string;
  date: string;
  time: string;
  duration: string;
  activity: string;
  status: ScheduleStatus;
  slot?: string;
  raCode?: string;
  cancellationReason?: string;
  changeLog: { date: string; description: string; user: string }[];
}

interface ScheduleProgram {
  id: number;
  program: string;
  period: string;
  sessions: number;
  status: ScheduleStatus;
  publishedAt: string | null;
  conflicts: number;
  sessionList: ScheduleSession[];
}

/* ─── Seed data ──────────────────────────────────────────── */
const INITIAL_SCHEDULES: ScheduleProgram[] = [
  {
    id: 1, program: "MBA Executivo – T24A", period: "Mar – Nov 2024", sessions: 24,
    status: "approved", publishedAt: "01/03/2024", conflicts: 0,
    sessionList: [
      { id: 101, program: "MBA Executivo – T24A", theme: "Estratégia Competitiva", room: "Sala 201", professor: "Dr. Carlos Faria", date: "2024-03-15", time: "08:00", duration: "4h", activity: "Aula presencial", slot: "M1", raCode: "RA-001", status: "approved", changeLog: [] },
      { id: 102, program: "MBA Executivo – T24A", theme: "Análise de Cenários", room: "Sala 201", professor: "Dr. Carlos Faria", date: "2024-03-22", time: "08:00", duration: "4h", activity: "Aula presencial", slot: "M2", status: "approved", changeLog: [] },
      { id: 103, program: "MBA Executivo – T24A", theme: "Inovação e Disrupção", room: "Sala 201", professor: "Dr. Lima", date: "2024-03-29", time: "08:00", duration: "4h", activity: "Workshop", slot: "T1", status: "approved", changeLog: [] },
    ],
  },
  {
    id: 2, program: "Esp. Finanças – T23B", period: "Fev – Ago 2024", sessions: 18,
    status: "approved", publishedAt: "15/02/2024", conflicts: 0,
    sessionList: [
      { id: 201, program: "Esp. Finanças – T23B", theme: "Valuation e Modelagem", room: "Sala 105", professor: "Dra. Ana Souza", date: "2024-03-13", time: "14:00", duration: "4h", activity: "Aula presencial", slot: "T2", raCode: "RA-007", status: "approved", changeLog: [] },
    ],
  },
  {
    id: 3, program: "Marketing Digital – T24A", period: "Mar – Jul 2024", sessions: 16,
    status: "review", publishedAt: null, conflicts: 1,
    sessionList: [
      { id: 301, program: "Marketing Digital – T24A", theme: "Growth Hacking", room: "Sala 302", professor: "Dr. Pedro Costa", date: "2024-03-20", time: "09:00", duration: "4h", activity: "Aula presencial", slot: "M1", status: "review", changeLog: [] },
      { id: 302, program: "Marketing Digital – T24A", theme: "SEO e Performance", room: "Sala 302", professor: "Dr. Pedro Costa", date: "2024-03-27", time: "09:00", duration: "4h", activity: "Aula presencial", slot: "M2", status: "review", changeLog: [] },
    ],
  },
  {
    id: 4, program: "Gestão de Pessoas – T24A", period: "Mar – Ago 2024", sessions: 20,
    status: "draft", publishedAt: null, conflicts: 0,
    sessionList: [],
  },
];

const statusConfig: Record<ScheduleStatus, { label: string; class: string; dot: string }> = {
  draft: { label: "Rascunho", class: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
  review: { label: "Em Revisão", class: "bg-warning/10 text-warning border-warning/20", dot: "bg-warning" },
  approved: { label: "Publicado", class: "bg-success/10 text-success border-success/20", dot: "bg-success" },
  cancelled: { label: "Cancelado", class: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
};

/* ─── PDF Preview Modal ──────────────────────────────────── */
function PdfPreviewModal({ prog, onClose, onExport }: { prog: ScheduleProgram; onClose: () => void; onExport: () => void }) {
  const [filterDay, setFilterDay] = useState("all");
  const [showRA, setShowRA] = useState(true);
  const [showLogistic, setShowLogistic] = useState(true);
  const [audience, setAudience] = useState<"aluno" | "operacoes" | "limpeza" | "docente">("aluno");

  const logisticItems = [
    { time: "07:45", end: "08:00", label: "Welcome Coffee", location: "Foyer Principal", type: "coffee" },
    { time: "10:15", end: "10:30", label: "Intervalo", location: "Foyer Principal", type: "break" },
    { time: "12:00", end: "13:30", label: "Almoço", location: "Refeitório", type: "lunch" },
    { time: "15:00", end: "15:15", label: "Coffee Break", location: "Foyer Principal", type: "coffee" },
  ];

  const slotColors: Record<string, string> = {
    M1: "bg-primary/10 text-primary border-primary/20",
    M2: "bg-secondary text-secondary-foreground border-secondary",
    T1: "bg-warning/10 text-warning border-warning/20",
    T2: "bg-success/10 text-success border-success/20",
    N1: "bg-muted text-muted-foreground border-border",
  };

  const versions = [
    { v: "v3", date: "20/03/2024 14:32", user: "Ana Coordenação", note: "Troca de professor – sessão 3" },
    { v: "v2", date: "15/03/2024 09:10", user: "Carlos Planejamento", note: "Ajuste de sala" },
    { v: "v1", date: "01/03/2024 08:00", user: "Sistema", note: "Publicação inicial" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-4xl border border-border max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-bold text-foreground text-sm">Pré-visualização — Horário Oficial</h2>
              <p className="text-xs text-muted-foreground">{prog.program} · {prog.period}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onExport} className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-1.5">
              <FileDown className="w-3.5 h-3.5" />Exportar PDF
            </button>
            <button className="text-xs px-3 py-1.5 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium flex items-center gap-1.5">
              <Sheet className="w-3.5 h-3.5" />Exportar Excel
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-muted/20 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">Template:</span>
          <div className="flex gap-1 bg-muted rounded-lg p-0.5">
            {([
              { key: "aluno", label: "Aluno" },
              { key: "operacoes", label: "Operações" },
              { key: "limpeza", label: "Limpeza" },
              { key: "docente", label: "Docente" },
            ] as const).map(({ key, label }) => (
              <button key={key} type="button" onClick={() => setAudience(key)}
                className={cn("text-xs px-2.5 py-1 rounded-md font-medium transition-all",
                  audience === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {label}
              </button>
            ))}
          </div>
          <span className="text-xs font-medium text-muted-foreground ml-2">Filtros:</span>
          <select value={filterDay} onChange={e => setFilterDay(e.target.value)}
            className="text-xs border border-input rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="all">Todos os dias</option>
            <option value="2024-03-15">15/03/2024</option>
            <option value="2024-03-22">22/03/2024</option>
            <option value="2024-03-29">29/03/2024</option>
          </select>
          {(audience === "operacoes") && (
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={showLogistic} onChange={e => setShowLogistic(e.target.checked)} className="rounded" />
              Atividades logísticas
            </label>
          )}
          {(audience === "operacoes") && (
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={showRA} onChange={e => setShowRA(e.target.checked)} className="rounded" />
              Exibir RAs
            </label>
          )}
          {audience === "aluno" && <span className="text-[10px] text-muted-foreground italic">Tema · Docente · Sala · Horário</span>}
          {audience === "limpeza" && <span className="text-[10px] text-muted-foreground italic">Apenas Horário · Sala · Turno</span>}
          {audience === "docente" && <span className="text-[10px] text-muted-foreground italic">Sessões do docente selecionado</span>}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Document preview */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Doc header */}
            <div className="border border-border rounded-xl overflow-hidden mb-4">
              <div className="bg-primary px-6 py-4 text-primary-foreground">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-primary-foreground/70 uppercase tracking-wider">Instituto Superior de Ensino</p>
                    <h1 className="font-display font-bold text-lg mt-1">{prog.program}</h1>
                    <p className="text-primary-foreground/80 text-sm mt-0.5">{prog.period}</p>
                  </div>
                  <div className="text-right text-xs text-primary-foreground/70">
                    <p>Publicado em: {prog.publishedAt || "—"}</p>
                    <p className="mt-0.5">Versão: v3</p>
                  </div>
                </div>
              </div>

              {/* Sessions table */}
              <div className="p-4 space-y-3">
                {showLogistic && (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="bg-muted/40 px-3 py-2 border-b border-border">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Zap className="w-3 h-3" />Atividades de Apoio — Dia 1 (15/03)
                      </p>
                    </div>
                    {logisticItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-border/50 last:border-0">
                        <span className="text-xs text-muted-foreground w-20 shrink-0">{item.time}–{item.end}</span>
                        <span className="text-xs font-medium text-foreground">{item.label}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                          <MapPin className="w-3 h-3" />{item.location}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {prog.sessionList.filter(s => s.status !== "cancelled" && (filterDay === "all" || s.date === filterDay)).map((session, idx) => (
                  <div key={session.id} className="border border-border rounded-lg overflow-hidden">
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <span className="text-xs text-muted-foreground w-5 shrink-0 font-medium">{idx + 1}</span>
                      {session.slot && (
                        <span className={cn("text-xs px-1.5 py-0.5 rounded border font-semibold shrink-0", slotColors[session.slot] || "bg-muted text-muted-foreground border-border")}>
                          {session.slot}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground shrink-0 w-24">{new Date(session.date + "T00:00:00").toLocaleDateString("pt-BR")} · {session.time}</span>
                      <span className="text-xs font-semibold text-foreground flex-1 min-w-0 truncate">{session.theme}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <User className="w-3 h-3" />{session.professor}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <MapPin className="w-3 h-3" />{session.room}
                      </span>
                      {showRA && session.raCode && (
                        <span className="flex items-center gap-1 text-xs text-primary border border-primary/30 bg-primary/5 px-1.5 py-0.5 rounded shrink-0">
                          <Tag className="w-2.5 h-2.5" />{session.raCode}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {prog.sessionList.filter(s => s.status !== "cancelled").length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">Nenhuma sessão para exibir</p>
                )}
              </div>
            </div>

            {/* Version history */}
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/20">
                <History className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs font-semibold text-muted-foreground">Histórico de Versões</p>
              </div>
              {versions.map((ver) => (
                <div key={ver.v} className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50 last:border-0">
                  <span className="text-xs font-bold text-primary w-6 shrink-0">{ver.v}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{ver.date}</span>
                  <span className="text-xs text-foreground flex-1">{ver.note}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{ver.user}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar: distribution */}
          <div className="w-56 border-l border-border p-4 space-y-4 bg-muted/10 shrink-0">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <Bell className="w-3 h-3" />Distribuição
              </p>
              {["Catering", "TI / AV", "Materiais", "Atendimento", "Docentes"].map((team) => (
                <label key={team} className="flex items-center gap-2 text-xs text-foreground py-1 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-border" />
                  {team}
                </label>
              ))}
              <button className="w-full mt-2 text-xs py-1.5 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors font-medium flex items-center justify-center gap-1.5">
                <Send className="w-3 h-3" />Disparar Notificações
              </button>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <Printer className="w-3 h-3" />Impressão
              </p>
              <button className="w-full text-xs py-1.5 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors font-medium flex items-center justify-center gap-1.5">
                <Printer className="w-3 h-3" />Imprimir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Approve Confirm Modal ──────────────────────────────── */
function ApproveModal({ program, conflicts, onConfirm, onClose }: { program: string; conflicts: number; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm border border-border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-sm">Aprovar Horário Oficial</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{program}</p>
          </div>
        </div>
        {conflicts > 0 && (
          <div className="flex items-center gap-2 bg-warning/10 border border-warning/20 rounded-lg px-3 py-2.5 text-warning text-xs">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{conflicts} conflito{conflicts > 1 ? "s" : ""} detectado{conflicts > 1 ? "s" : ""}. Você pode aprovar mesmo assim.</span>
          </div>
        )}
        <p className="text-xs text-muted-foreground">Após a aprovação, o horário oficial será publicado e as notificações serão disparadas para Materiais, Atendimento e Operação.</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground">Cancelar</button>
          <button onClick={onConfirm} className="text-sm px-4 py-2 rounded-lg bg-success text-white hover:bg-success/90 transition-colors font-medium flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />Aprovar Horário
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Cancel Session Modal ───────────────────────────────── */
function CancelSessionModal({ session, onConfirm, onClose }: { session: ScheduleSession; onConfirm: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm border border-border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-sm">Cancelar Sessão</h3>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">{session.theme}</p>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Justificativa *</label>
          <textarea className={cn("w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none", error ? "border-destructive" : "border-input")}
            rows={3} value={reason} onChange={(e) => { setReason(e.target.value); setError(""); }}
            placeholder="Informe o motivo do cancelamento..." />
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground">Cancelar</button>
          <button onClick={() => { if (!reason.trim()) { setError("Justificativa obrigatória"); return; } onConfirm(reason); }}
            className="text-sm px-4 py-2 rounded-lg bg-destructive text-white hover:bg-destructive/90 transition-colors font-medium">Confirmar</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit Session Modal ─────────────────────────────────── */
function EditSessionModal({ session, onSave, onClose }: { session: ScheduleSession; onSave: (s: ScheduleSession) => void; onClose: () => void }) {
  const [form, setForm] = useState(session);
  const set = (k: keyof ScheduleSession, v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg border border-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display font-bold text-foreground text-sm">Editar Sessão Oficial</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-warning/10 border border-warning/20 rounded-lg px-4 py-2.5 text-warning text-xs flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Alterações em horário oficial disparam notificações para os envolvidos.
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tema</label>
              <input className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.theme} onChange={(e) => set("theme", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Professor</label>
              <input className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.professor} onChange={(e) => set("professor", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Sala</label>
              <input className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.room} onChange={(e) => set("room", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Data</label>
              <input type="date" className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.date} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Horário</label>
              <input type="time" className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.time} onChange={(e) => set("time", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Slot</label>
              <select className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.slot || ""} onChange={(e) => set("slot", e.target.value)}>
                {["M1", "M2", "T1", "T2", "N1", "N2"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Duração</label>
              <select className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.duration} onChange={(e) => set("duration", e.target.value)}>
                {["1h", "2h", "3h", "4h", "6h", "8h"].map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Código RA</label>
              <input className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: RA-001" value={form.raCode || ""} onChange={(e) => set("raCode", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 pb-5">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground">Cancelar</button>
          <button onClick={() => { onSave({ ...form, changeLog: [...form.changeLog, { date: new Date().toLocaleDateString("pt-BR"), description: "Sessão editada", user: "Coordenação Acadêmica" }] }); }}
            className="text-sm px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium flex items-center gap-2">
            <Save className="w-3.5 h-3.5" />Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Program Detail Drawer ──────────────────────────────── */
function ProgramDrawer({ prog, onClose, onCancelSession, onEditSession, onApprove, onOpenPDF }: {
  prog: ScheduleProgram; onClose: () => void;
  onCancelSession: (sessionId: number, reason: string) => void;
  onEditSession: (s: ScheduleSession) => void;
  onApprove: () => void;
  onOpenPDF: () => void;
}) {
  const [cancelTarget, setCancelTarget] = useState<ScheduleSession | null>(null);
  const [editTarget, setEditTarget] = useState<ScheduleSession | null>(null);
  const activeSessions = prog.sessionList.filter((s) => s.status !== "cancelled");

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full z-50 w-full max-w-2xl bg-card border-l border-border shadow-2xl flex flex-col">
        <div className="flex items-start justify-between px-6 py-4 border-b border-border">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-bold text-foreground text-sm">{prog.program}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{prog.period} · {prog.sessions} sessões</p>
              <span className={cn("inline-flex mt-1 text-xs px-2 py-0.5 rounded-full border font-medium", statusConfig[prog.status].class)}>
                {statusConfig[prog.status].label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {prog.status === "review" && (
              <button onClick={onApprove} className="text-xs px-3 py-1.5 bg-success text-white rounded-lg hover:bg-success/90 transition-colors font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />Aprovar
              </button>
            )}
            {prog.status === "approved" && (
              <>
                <button onClick={onOpenPDF} className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />Pré-visualizar PDF
                </button>
                <button className="text-xs px-3 py-1.5 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" />Notificar
                </button>
              </>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {prog.conflicts > 0 && (
          <div className="px-6 py-2.5 bg-destructive/10 border-b border-destructive/20 flex items-center gap-2 text-destructive text-xs">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold">{prog.conflicts} conflito{prog.conflicts > 1 ? "s" : ""} detectado{prog.conflicts > 1 ? "s" : ""}</span>
            <span className="text-destructive/70">· Revise antes de aprovar</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {activeSessions.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Nenhuma sessão programada</p>
            </div>
          )}
          {activeSessions.map((session) => (
            <div key={session.id} className="border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {session.slot && (
                    <span className="text-xs px-1.5 py-0.5 rounded border font-semibold bg-primary/10 text-primary border-primary/20 shrink-0 mt-0.5">
                      {session.slot}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground leading-tight">{session.theme}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{session.activity}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />{new Date(session.date + "T00:00:00").toLocaleDateString("pt-BR")} · {session.time} ({session.duration})
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />{session.room}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />{session.professor}
                      </span>
                      {session.raCode && (
                        <span className="flex items-center gap-1 text-xs text-primary border border-primary/30 bg-primary/5 px-1.5 py-0.5 rounded">
                          <Tag className="w-2.5 h-2.5" />{session.raCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditTarget(session)} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setCancelTarget(session)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {session.changeLog.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground font-medium mb-1.5">Histórico</p>
                  {session.changeLog.map((log, i) => (
                    <div key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="text-muted-foreground/50">•</span>
                      <span>{log.date} · {log.description} por {log.user}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {cancelTarget && (
        <CancelSessionModal session={cancelTarget}
          onConfirm={(reason) => { onCancelSession(cancelTarget.id, reason); setCancelTarget(null); }}
          onClose={() => setCancelTarget(null)} />
      )}
      {editTarget && (
        <EditSessionModal session={editTarget}
          onSave={(s) => { onEditSession(s); setEditTarget(null); }}
          onClose={() => setEditTarget(null)} />
      )}
    </>
  );
}

/* ─── Notify Modal ───────────────────────────────────────── */
function NotifyModal({ program, onClose }: { program: string; onClose: () => void }) {
  const teams = ["Catering", "TI / AV", "Equipe de Materiais", "Atendimento", "Docentes"];
  const [selected, setSelected] = useState<string[]>(teams);
  const toggle = (t: string) => setSelected((s) => s.includes(t) ? s.filter((x) => x !== t) : [...s, t]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm border border-border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-sm">Notificar Equipes</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{program}</p>
          </div>
        </div>
        <div className="space-y-2">
          {teams.map((t) => (
            <label key={t} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={selected.includes(t)} onChange={() => toggle(t)} className="w-4 h-4 rounded border-border text-primary" />
              <span className="text-sm text-foreground">{t}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground">Cancelar</button>
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium flex items-center gap-2">
            <Send className="w-3.5 h-3.5" />Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Standard Reports Tab ───────────────────────────────── */
const STANDARD_REPORTS = [
  {
    id: "grades", icon: <GraduationCap className="w-5 h-5" />, title: "Grades e Outlines Acadêmicos",
    description: "Consolidação de temas, cargas horárias e estrutura dos módulos por área acadêmica e programa.",
    tag: "Acadêmico", color: "bg-primary/10 text-primary border-primary/20",
    fields: ["Programa", "Turma", "Módulo", "Tema", "Slot", "Professor", "Carga Horária"],
    sample: [
      { prog: "MBA Executivo – T24A", module: "Estratégia", theme: "Estratégia Competitiva", slot: "M1", professor: "Dr. Carlos Faria", load: "4h" },
      { prog: "MBA Executivo – T24A", module: "Estratégia", theme: "Análise de Cenários", slot: "M2", professor: "Dr. Carlos Faria", load: "4h" },
      { prog: "MBA Executivo – T24A", module: "Inovação", theme: "Inovação e Disrupção", slot: "T1", professor: "Dr. Lima", load: "4h" },
      { prog: "Esp. Finanças – T23B", module: "Finanças", theme: "Valuation e Modelagem", slot: "T2", professor: "Dra. Ana Souza", load: "4h" },
    ],
  },
  {
    id: "docs", icon: <BookMarked className="w-5 h-5" />, title: "Documentos Utilizados",
    description: "Listagem de materiais vinculados às atividades com metadados do Moodle para rastreabilidade pedagógica.",
    tag: "Pedagógico", color: "bg-warning/10 text-warning border-warning/20",
    fields: ["Programa", "Turma", "Sessão", "Material", "Tipo", "Moodle ID", "Código RA"],
    sample: [
      { prog: "MBA Executivo – T24A", session: "Estratégia Competitiva", material: "Caso Harvard: Blue Ocean", type: "Caso", moodleId: "MOO-4521", ra: "RA-001" },
      { prog: "Esp. Finanças – T23B", session: "Valuation e Modelagem", material: "Planilha de Modelagem DCF", type: "Planilha", moodleId: "MOO-3312", ra: "RA-007" },
      { prog: "Marketing Digital – T24A", session: "Growth Hacking", material: "Artigo: Métricas de Crescimento", type: "Artigo", moodleId: "MOO-5001", ra: "—" },
    ],
  },
];

function StandardReportsTab() {
  const [active, setActive] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<typeof STANDARD_REPORTS[0] | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-foreground/80">
          Relatórios padronizados fornecem visões rápidas e consistentes da operação acadêmica. 
          Todos derivam diretamente do núcleo oficial do ISE Planner em tempo real — garantindo que todas as áreas trabalhem sobre a mesma base de dados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STANDARD_REPORTS.map((report) => (
          <div key={report.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-card-hover transition-all">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  {report.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-bold text-foreground text-sm leading-tight">{report.title}</h3>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium shrink-0", report.color)}>{report.tag}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{report.description}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {report.fields.map(f => (
                  <span key={f} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">{f}</span>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button onClick={() => setPreviewReport(previewReport?.id === report.id ? null : report)}
                  className="flex-1 text-xs py-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground font-medium flex items-center justify-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />{previewReport?.id === report.id ? "Fechar" : "Pré-visualizar"}
                </button>
                <button className="text-xs py-2 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium flex items-center gap-1.5">
                  <FileDown className="w-3.5 h-3.5" />PDF
                </button>
                <button className="text-xs py-2 px-3 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors font-medium flex items-center gap-1.5">
                  <Sheet className="w-3.5 h-3.5" />Excel
                </button>
              </div>
            </div>

            {/* Inline preview */}
            {previewReport?.id === report.id && (
              <div className="border-t border-border bg-muted/20 p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Eye className="w-3 h-3" />Pré-visualização
                </p>
                {report.id === "grades" && (
                  <div className="rounded-lg border border-border overflow-hidden bg-card">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          {["Programa", "Módulo", "Tema", "Slot", "Professor", "Carga"].map(h => (
                            <th key={h} className="text-left px-3 py-2 text-muted-foreground font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {report.sample.map((row: any, i) => (
                          <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/10">
                            <td className="px-3 py-2 font-medium text-foreground">{row.prog}</td>
                            <td className="px-3 py-2 text-muted-foreground">{row.module}</td>
                            <td className="px-3 py-2 text-foreground">{row.theme}</td>
                            <td className="px-3 py-2">
                              <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">{row.slot}</span>
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">{row.professor}</td>
                            <td className="px-3 py-2 text-foreground">{row.load}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {report.id === "docs" && (
                  <div className="rounded-lg border border-border overflow-hidden bg-card">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          {["Programa", "Sessão", "Material", "Tipo", "Moodle ID", "RA"].map(h => (
                            <th key={h} className="text-left px-3 py-2 text-muted-foreground font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {report.sample.map((row: any, i) => (
                          <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/10">
                            <td className="px-3 py-2 font-medium text-foreground">{row.prog}</td>
                            <td className="px-3 py-2 text-muted-foreground">{row.session}</td>
                            <td className="px-3 py-2 text-foreground">{row.material}</td>
                            <td className="px-3 py-2">
                              <span className="bg-warning/10 text-warning border border-warning/20 px-1.5 py-0.5 rounded text-xs">{row.type}</span>
                            </td>
                            <td className="px-3 py-2 text-primary font-mono">{row.moodleId}</td>
                            <td className="px-3 py-2">
                              {row.ra !== "—" ? (
                                <span className="text-primary border border-primary/30 bg-primary/5 px-1.5 py-0.5 rounded flex items-center gap-1 w-fit">
                                  <Tag className="w-2.5 h-2.5" />{row.ra}
                                </span>
                              ) : <span className="text-muted-foreground">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Advanced Queries Tab ───────────────────────────────── */
type Entity = "programs" | "turmas" | "sessions" | "people" | "spaces" | "requisitions";

const ENTITY_FIELDS: Record<Entity, { label: string; fields: string[] }> = {
  programs: { label: "Programas", fields: ["Nome", "Sigla", "Tipo", "Instituto", "Cliente", "Status", "Período", "Responsável"] },
  turmas: { label: "Turmas", fields: ["Nome", "Sigla", "Programa", "Modalidade", "Ano", "Participantes", "Período", "Local", "Diretor"] },
  sessions: { label: "Atividades / Sessões", fields: ["Tema", "Data", "Horário", "Slot", "Duração", "Professor", "Sala", "Programa", "Turma", "Status", "Código RA"] },
  people: { label: "Pessoas", fields: ["Nome", "Papel", "Área", "Email", "Histórico de Turmas", "Carga Mensal"] },
  spaces: { label: "Espaços", fields: ["Nome", "Tipo", "Capacidade", "Campus", "Status", "Ocupação %"] },
  requisitions: { label: "Requisições Acadêmicas", fields: ["Código RA", "Tipo de Material", "Sessão", "Programa", "Turma", "Responsável", "Status"] },
};

const ENTITY_ICONS: Record<Entity, React.ReactNode> = {
  programs: <BookOpen className="w-4 h-4" />,
  turmas: <Layers className="w-4 h-4" />,
  sessions: <Calendar className="w-4 h-4" />,
  people: <Users className="w-4 h-4" />,
  spaces: <Building2 className="w-4 h-4" />,
  requisitions: <Package className="w-4 h-4" />,
};

const SAVED_MODELS = [
  { id: 1, name: "Sessões por Professor – Março", entity: "sessions", owner: "Ana Silva", shared: true, star: true },
  { id: 2, name: "Ocupação de Salas – Q1 2024", entity: "spaces", owner: "Carlos Planejamento", shared: false, star: false },
  { id: 3, name: "Grade Completa MBA T24A", entity: "turmas", owner: "Você", shared: true, star: true },
];

const QUERY_SAMPLE: Record<Entity, any[]> = {
  programs: [
    { Nome: "MBA Executivo", Sigla: "MBAE", Tipo: "Custom", Instituto: "ISE Business School", Status: "Aprovado", Período: "Mar–Nov 2024" },
    { Nome: "Esp. Finanças", Sigla: "FIN", Tipo: "Aberto", Instituto: "ISE Business School", Status: "Aprovado", Período: "Fev–Ago 2024" },
  ],
  turmas: [
    { Nome: "MBA Executivo – T24A", Sigla: "T24A", Programa: "MBA Executivo", Modalidade: "Presencial", Ano: "2024", Participantes: "32", Local: "Campus ISE" },
    { Nome: "Esp. Finanças – T23B", Sigla: "T23B", Programa: "Esp. Finanças", Modalidade: "Híbrido", Ano: "2024", Participantes: "24", Local: "Campus ISE" },
  ],
  sessions: [
    { Tema: "Estratégia Competitiva", Data: "15/03/2024", Horário: "08:00", Slot: "M1", Duração: "4h", Professor: "Dr. Carlos Faria", Sala: "Sala 201", Turma: "T24A", Status: "Aprovado" },
    { Tema: "Valuation e Modelagem", Data: "13/03/2024", Horário: "14:00", Slot: "T2", Duração: "4h", Professor: "Dra. Ana Souza", Sala: "Sala 105", Turma: "T23B", Status: "Aprovado" },
    { Tema: "Growth Hacking", Data: "20/03/2024", Horário: "09:00", Slot: "M1", Duração: "4h", Professor: "Dr. Pedro Costa", Sala: "Sala 302", Turma: "T24A-MKT", Status: "Em Revisão" },
  ],
  people: [
    { Nome: "Dr. Carlos Faria", Papel: "Docente", Área: "Estratégia", Email: "cfaria@ise.edu.br", "Carga Mensal": "16h" },
    { Nome: "Dra. Ana Souza", Papel: "Docente", Área: "Finanças", Email: "asouza@ise.edu.br", "Carga Mensal": "8h" },
  ],
  spaces: [
    { Nome: "Sala 201", Tipo: "Plenária", Capacidade: "40", Campus: "Campus ISE", Status: "Ocupado", "Ocupação %": "75%" },
    { Nome: "Sala 105", Tipo: "Plenária", Capacidade: "30", Campus: "Campus ISE", Status: "Livre", "Ocupação %": "30%" },
    { Nome: "Sala de Equipe A", Tipo: "Equipe", Capacidade: "8", Campus: "Campus ISE", Status: "Livre", "Ocupação %": "0%" },
  ],
  requisitions: [
    { "Código RA": "RA-001", "Tipo de Material": "Caso Harvard", Sessão: "Estratégia Competitiva", Programa: "MBA Exec.", Responsável: "Dr. Faria", Status: "Confirmado" },
    { "Código RA": "RA-007", "Tipo de Material": "Planilha", Sessão: "Valuation e Modelagem", Programa: "Esp. Finanças", Responsável: "Dra. Souza", Status: "Pendente" },
  ],
};

function AdvancedQueriesTab() {
  const [selectedEntity, setSelectedEntity] = useState<Entity>("sessions");
  const [selectedFields, setSelectedFields] = useState<string[]>(["Tema", "Data", "Slot", "Professor", "Sala", "Status"]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [progFilter, setProgFilter] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [modelName, setModelName] = useState("");
  const [savedModels, setSavedModels] = useState(SAVED_MODELS);
  const [sharePublic, setSharePublic] = useState(false);
  const [groupBy, setGroupBy] = useState("none");
  const [orderBy, setOrderBy] = useState("none");
  const [savedFeedback, setSavedFeedback] = useState(false);

  const allFields = ENTITY_FIELDS[selectedEntity].fields;

  const toggleField = (f: string) => setSelectedFields(prev =>
    prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
  );
  const toggleStatus = (s: string) => setStatusFilter(prev =>
    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
  );

  const previewData = QUERY_SAMPLE[selectedEntity];
  const previewColumns = selectedFields.filter(f => allFields.includes(f));

  const handleSave = () => {
    if (!modelName.trim()) return;
    setSavedModels(prev => [
      { id: Date.now(), name: modelName, entity: selectedEntity, owner: "Você", shared: sharePublic, star: false },
      ...prev,
    ]);
    setModelName("");
    setShowSaveModal(false);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  return (
    <div className="space-y-5">
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-foreground/80">
          Realize consultas dinâmicas cruzando entidades, períodos e filtros operacionais. 
          Salve configurações como modelos reutilizáveis e exporte em PDF, Excel ou CSV — sem dependência de planilhas externas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Config panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Entity */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
              <Table2 className="w-3.5 h-3.5 text-primary" />Entidade Principal
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(ENTITY_FIELDS) as [Entity, { label: string; fields: string[] }][]).map(([key, val]) => (
                <button key={key} onClick={() => { setSelectedEntity(key); setSelectedFields(val.fields.slice(0, 5)); setShowPreview(false); }}
                  className={cn("text-xs px-2 py-2 rounded-lg border font-medium transition-all flex items-center gap-1.5",
                    selectedEntity === key ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border hover:text-foreground hover:border-primary/30")}>
                  {ENTITY_ICONS[key]}{val.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-primary" />Campos / Colunas
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {allFields.map(f => (
                <button key={f} onClick={() => toggleField(f)}
                  className={cn("text-xs px-2 py-1 rounded-full border transition-all",
                    selectedFields.includes(f) ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border hover:border-primary/30")}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />Filtros Avançados
            </h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Período</label>
              <div className="flex gap-2">
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="flex-1 text-xs border border-input rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="flex-1 text-xs border border-input rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Programa / Turma</label>
              <input value={progFilter} onChange={e => setProgFilter(e.target.value)}
                placeholder="Ex: MBA Executivo..."
                className="w-full text-xs border border-input rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Status</label>
              <div className="flex flex-wrap gap-1.5">
                {["Rascunho", "Pré-reserva", "Reservado", "Contratado", "Em Revisão", "Aprovado"].map(s => (
                  <button key={s} onClick={() => toggleStatus(s)}
                    className={cn("text-xs px-2 py-0.5 rounded-full border transition-all",
                      statusFilter.includes(s) ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border")}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Agrupar por</label>
                <select value={groupBy} onChange={e => setGroupBy(e.target.value)}
                  className="w-full text-xs border border-input rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="none">Sem agrupamento</option>
                  <option value="professor">Professor</option>
                  <option value="area">Área Acadêmica</option>
                  <option value="program">Programa</option>
                  <option value="slot">Slot</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Ordenar por</label>
                <select value={orderBy} onChange={e => setOrderBy(e.target.value)}
                  className="w-full text-xs border border-input rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="none">Padrão</option>
                  <option value="date">Data</option>
                  <option value="professor">Professor</option>
                  <option value="program">Programa</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button onClick={() => setShowPreview(true)}
              className="w-full text-sm py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center gap-2">
              <Play className="w-4 h-4" />Executar Consulta
            </button>
            <div className="flex gap-2">
              <button onClick={() => setShowSaveModal(true)}
                className="flex-1 text-xs py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium flex items-center justify-center gap-1.5">
                <Save className="w-3.5 h-3.5" />Salvar Modelo
              </button>
              <button className="flex-1 text-xs py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium flex items-center justify-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" />Compartilhar
              </button>
            </div>
          </div>

          {savedFeedback && (
            <div className="flex items-center gap-2 text-xs text-success bg-success/10 border border-success/20 rounded-lg px-3 py-2.5">
              <Check className="w-3.5 h-3.5 shrink-0" />Modelo salvo com sucesso!
            </div>
          )}
        </div>

        {/* Results panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Saved models */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
              <FolderOpen className="w-3.5 h-3.5 text-primary" />Modelos Salvos
            </h3>
            <div className="space-y-2">
              {savedModels.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/20 transition-colors cursor-pointer group"
                  onClick={() => { setSelectedEntity(m.entity as Entity); setShowPreview(true); }}>
                  <div className="w-7 h-7 bg-primary/10 rounded-md flex items-center justify-center text-primary shrink-0">
                    {ENTITY_ICONS[m.entity as Entity]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{ENTITY_FIELDS[m.entity as Entity].label} · {m.owner}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {m.star && <Star className="w-3 h-3 text-warning fill-warning" />}
                    {m.shared && <Share2 className="w-3 h-3 text-muted-foreground" />}
                    <span className="text-xs opacity-0 group-hover:opacity-100 text-primary transition-opacity">Usar →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          {showPreview ? (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <RefreshCcw className="w-3.5 h-3.5 text-primary" />
                  <p className="text-xs font-semibold text-foreground">
                    Resultados — {ENTITY_FIELDS[selectedEntity].label}
                  </p>
                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20 font-medium">
                    {previewData.length} registros
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors font-medium flex items-center gap-1">
                    <FileDown className="w-3 h-3" />PDF
                  </button>
                  <button className="text-xs px-2.5 py-1 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors font-medium flex items-center gap-1">
                    <Sheet className="w-3 h-3" />Excel
                  </button>
                  <button className="text-xs px-2.5 py-1 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors font-medium flex items-center gap-1">
                    <Hash className="w-3 h-3" />CSV
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/10">
                      {previewColumns.map(col => (
                        <th key={col} className="text-left px-3 py-2.5 font-semibold text-muted-foreground whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                        {previewColumns.map(col => (
                          <td key={col} className="px-3 py-2.5 text-foreground whitespace-nowrap">
                            {col === "Slot" && row[col] ? (
                              <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">{row[col]}</span>
                            ) : col === "Status" && row[col] ? (
                              <span className={cn("px-1.5 py-0.5 rounded-full border text-xs font-medium",
                                row[col] === "Aprovado" ? "bg-success/10 text-success border-success/20" :
                                row[col] === "Em Revisão" ? "bg-warning/10 text-warning border-warning/20" :
                                "bg-muted text-muted-foreground border-border")}>
                                {row[col]}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">{row[col] ?? "—"}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-7 h-7 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Configure e execute a consulta</p>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto">
                Selecione a entidade, os campos e os filtros desejados. Clique em "Executar Consulta" para visualizar os dados.
              </p>
              <button onClick={() => setShowPreview(true)}
                className="mt-4 text-xs px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium inline-flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" />Executar agora
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Save modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm border border-border p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Save className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground text-sm">Salvar Modelo de Consulta</h3>
                <p className="text-xs text-muted-foreground">{ENTITY_FIELDS[selectedEntity].label} · {selectedFields.length} campos</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome do modelo *</label>
              <input value={modelName} onChange={e => setModelName(e.target.value)}
                placeholder="Ex: Sessões por Professor – Março"
                className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={sharePublic} onChange={e => setSharePublic(e.target.checked)} className="w-4 h-4 rounded border-border" />
              <div>
                <p className="text-sm text-foreground">Tornar público para a equipe</p>
                <p className="text-xs text-muted-foreground">Todos os usuários poderão acessar este modelo</p>
              </div>
            </label>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowSaveModal(false)} className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground">Cancelar</button>
              <button onClick={handleSave} disabled={!modelName.trim()}
                className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center gap-2">
                <Save className="w-3.5 h-3.5" />Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function Schedule() {
  const [schedules, setSchedules] = useState<ScheduleProgram[]>(INITIAL_SCHEDULES);
  const [selectedProg, setSelectedProg] = useState<ScheduleProgram | null>(null);
  const [approvingProg, setApprovingProg] = useState<ScheduleProgram | null>(null);
  const [notifyProg, setNotifyProg] = useState<ScheduleProgram | null>(null);
  const [pdfProg, setPdfProg] = useState<ScheduleProgram | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ScheduleStatus | "all">("all");
  const [activeTab, setActiveTab] = useState<"schedule" | "reports" | "queries">("schedule");

  const filtered = schedules.filter((s) => {
    const matchSearch = s.program.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: schedules.length,
    draft: schedules.filter((s) => s.status === "draft").length,
    review: schedules.filter((s) => s.status === "review").length,
    approved: schedules.filter((s) => s.status === "approved").length,
  };

  const handleApprove = (progId: number) => {
    setSchedules((prev) => prev.map((s) => s.id === progId
      ? { ...s, status: "approved" as ScheduleStatus, publishedAt: new Date().toLocaleDateString("pt-BR"), conflicts: 0 }
      : s));
    setApprovingProg(null);
    if (selectedProg?.id === progId) setSelectedProg((prev) => prev ? { ...prev, status: "approved", publishedAt: new Date().toLocaleDateString("pt-BR") } : null);
  };

  const handleCancelSession = (progId: number, sessionId: number, reason: string) => {
    setSchedules((prev) => prev.map((p) => p.id === progId
      ? { ...p, sessionList: p.sessionList.map((s) => s.id === sessionId ? { ...s, status: "cancelled" as ScheduleStatus, cancellationReason: reason } : s) }
      : p));
    setSelectedProg((prev) => prev?.id === progId
      ? { ...prev, sessionList: prev.sessionList.map((s) => s.id === sessionId ? { ...s, status: "cancelled" as ScheduleStatus, cancellationReason: reason } : s) }
      : prev);
  };

  const handleEditSession = (progId: number, session: ScheduleSession) => {
    setSchedules((prev) => prev.map((p) => p.id === progId
      ? { ...p, sessionList: p.sessionList.map((s) => s.id === session.id ? session : s) }
      : p));
    setSelectedProg((prev) => prev?.id === progId
      ? { ...prev, sessionList: prev.sessionList.map((s) => s.id === session.id ? session : s) }
      : prev);
  };

  const TABS = [
    { key: "schedule", label: "Horário Oficial", icon: <CheckSquare className="w-4 h-4" /> },
    { key: "reports", label: "Relatórios Padrão", icon: <BarChart3 className="w-4 h-4" /> },
    { key: "queries", label: "Consultas Avançadas", icon: <SlidersHorizontal className="w-4 h-4" /> },
  ] as const;

  return (
    <AppLayout pageTitle="Horário Oficial" pageSubtitle="Relatórios, emissão e consultas dinâmicas da grade acadêmica">
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px",
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border")}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* ── Horário Oficial tab ── */}
        {activeTab === "schedule" && (
          <>
            <div className="bg-primary rounded-xl p-5 text-primary-foreground">
              <div className="flex items-start gap-3">
                <CheckSquare className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display font-bold text-base">Processo de Aprovação do Horário Oficial</h3>
                  <p className="text-primary-foreground/80 text-sm mt-1">
                    Após aprovação pelo DP ou DA, o PDF é gerado automaticamente e as notificações são disparadas para Materiais, Atendimento, Catering e TI.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Em Revisão", count: counts.review,   iconClass: "text-warning",          icon: Clock },
                { label: "Publicados", count: counts.approved, iconClass: "text-success",          icon: CheckCircle2 },
                { label: "Rascunho",   count: counts.draft,    iconClass: "text-muted-foreground", icon: FileText },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                  <stat.icon className={cn("w-5 h-5 shrink-0", stat.iconClass)} />
                  <div>
                    <p className="text-2xl font-display font-bold text-foreground">{stat.count}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                {([{ key: "all", label: "Todos" }, { key: "review", label: "Em Revisão" }, { key: "approved", label: "Publicados" }, { key: "draft", label: "Rascunho" }] as const).map((f) => (
                  <button key={f.key} onClick={() => setFilterStatus(f.key)}
                    className={cn("text-xs px-3 py-1.5 rounded-lg border font-medium transition-all",
                      filterStatus === f.key ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground")}>
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input className="pl-8 pr-3 py-1.5 text-xs border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary w-52"
                  placeholder="Buscar programa..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Programa</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Período</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Sessões</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Conflitos</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Publicado em</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-12 text-muted-foreground text-xs">Nenhum programa encontrado</td></tr>
                  )}
                  {filtered.map((s) => {
                    const sc = statusConfig[s.status];
                    return (
                      <tr key={s.id} onClick={() => setSelectedProg(s)}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-primary/10 rounded-md flex items-center justify-center">
                              <FileText className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <p className="text-xs font-semibold text-foreground">{s.program}</p>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs text-muted-foreground hidden md:table-cell">{s.period}</td>
                        <td className="px-3 py-3 text-xs text-foreground hidden lg:table-cell">{s.sessions}</td>
                        <td className="px-3 py-3 hidden lg:table-cell">
                          {s.conflicts > 0 ? (
                            <span className="flex items-center gap-1 text-xs text-warning"><AlertTriangle className="w-3 h-3" />{s.conflicts}</span>
                          ) : (
                            <span className="text-xs text-success flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />OK</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", sc.class)}>{sc.label}</span>
                        </td>
                        <td className="px-3 py-3 text-xs text-muted-foreground hidden lg:table-cell">{s.publishedAt || "—"}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {s.status === "review" && (
                              <button onClick={() => setApprovingProg(s)}
                                className="text-xs px-2 py-1 bg-success/10 text-success rounded-md hover:bg-success/20 transition-colors font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />Aprovar
                              </button>
                            )}
                            {s.status === "approved" && (
                              <>
                                <button onClick={() => setPdfProg(s)}
                                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors font-medium flex items-center gap-1">
                                  <Eye className="w-3 h-3" />PDF
                                </button>
                                <button onClick={() => setNotifyProg(s)}
                                  className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors font-medium flex items-center gap-1">
                                  <Bell className="w-3 h-3" />Notificar
                                </button>
                              </>
                            )}
                            <button onClick={() => setSelectedProg(s)} className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Relatórios Padrão tab ── */}
        {activeTab === "reports" && <StandardReportsTab />}

        {/* ── Consultas Avançadas tab ── */}
        {activeTab === "queries" && <AdvancedQueriesTab />}
      </div>

      {/* Modals */}
      {selectedProg && (
        <ProgramDrawer prog={selectedProg} onClose={() => setSelectedProg(null)}
          onCancelSession={(sid, reason) => handleCancelSession(selectedProg.id, sid, reason)}
          onEditSession={(s) => handleEditSession(selectedProg.id, s)}
          onApprove={() => setApprovingProg(selectedProg)}
          onOpenPDF={() => setPdfProg(selectedProg)} />
      )}
      {approvingProg && (
        <ApproveModal program={approvingProg.program} conflicts={approvingProg.conflicts}
          onConfirm={() => handleApprove(approvingProg.id)}
          onClose={() => setApprovingProg(null)} />
      )}
      {notifyProg && <NotifyModal program={notifyProg.program} onClose={() => setNotifyProg(null)} />}
      {pdfProg && (
        <PdfPreviewModal prog={pdfProg}
          onClose={() => setPdfProg(null)}
          onExport={() => setPdfProg(null)} />
      )}
    </AppLayout>
  );
}
