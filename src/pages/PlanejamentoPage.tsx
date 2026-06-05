import { AppLayout } from "@/components/layout/AppLayout";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle, AlertTriangle, ArrowRight, Calendar as CalendarLucide,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock,
  Edit2, Info, Layers, Plus, RefreshCw, Settings, Trash2, X,
  Users, BookOpen, Zap, TrendingDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { format, subDays, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── Types ────────────────────────────────────────────────────────────────────
type EtapaStatus = "pendente" | "em_andamento" | "concluida" | "atrasada" | "bloqueada";
type AreaResponsavel = "Docente" | "Diretor Acadêmico" | "Coordenação" | "Diretor de Programa" | "Produção de Materiais";

interface EtapaSLA {
  id: string;
  nome: string;
  area: AreaResponsavel;
  diasAntes: number;
  dependencias: string[];
}

interface EtapaInstance extends EtapaSLA {
  status: EtapaStatus;
  dataLimite: Date;
  dataConclusao?: Date;
}

interface Entrega {
  id: string;
  nome: string;
  aulaIds: string[];
  etapas: EtapaInstance[];
}

interface AulaDia {
  id: string;
  data: Date;
  disciplina: string;
  professor?: string;
  modulo?: string;
  modalidade: "presencial" | "online" | "hibrido";
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DEMO_TODAY = new Date(2027, 2, 10);

const AREA_COLORS: Record<AreaResponsavel, string> = {
  "Docente":               "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  "Diretor Acadêmico":     "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  "Coordenação":           "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
  "Diretor de Programa":   "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  "Produção de Materiais": "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
};

const STATUS_CONFIG: Record<EtapaStatus, {
  ring: string; bg: string; text: string; connector: string; label: string;
}> = {
  concluida:    { ring: "border-green-500",  bg: "bg-green-500/10",  text: "text-green-600 dark:text-green-400",  connector: "bg-green-400",  label: "Concluída" },
  em_andamento: { ring: "border-blue-500",   bg: "bg-blue-500/10",   text: "text-blue-600 dark:text-blue-400",   connector: "bg-blue-400",   label: "Em andamento" },
  atrasada:     { ring: "border-red-500",    bg: "bg-red-500/10",    text: "text-red-600 dark:text-red-400",    connector: "bg-red-400",    label: "Atrasada" },
  pendente:     { ring: "border-border",     bg: "bg-muted/50",      text: "text-muted-foreground",             connector: "bg-border",     label: "Pendente" },
  bloqueada:    { ring: "border-orange-500", bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", connector: "bg-orange-300", label: "Bloqueada" },
};

const MODALIDADE_COLORS = {
  presencial: "bg-primary/10 text-primary border-primary/20",
  online:     "bg-muted text-muted-foreground border-border",
  hibrido:    "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
};
const MODALIDADE_LABELS = { presencial: "Presencial", online: "Online", hibrido: "Híbrido" };

// ─── Default SLA template ─────────────────────────────────────────────────────
const SLA_PADRAO: EtapaSLA[] = [
  { id: "sla1", nome: "Envio de Outline",       area: "Docente",               diasAntes: 21, dependencias: [] },
  { id: "sla2", nome: "Aprovação de Outline",   area: "Diretor Acadêmico",     diasAntes: 14, dependencias: ["sla1"] },
  { id: "sla3", nome: "Cadastro de Horário",    area: "Coordenação",           diasAntes: 10, dependencias: ["sla2"] },
  { id: "sla4", nome: "Aprovação de Horário",   area: "Diretor de Programa",   diasAntes: 7,  dependencias: ["sla3"] },
  { id: "sla5", nome: "Preparação de Materiais",area: "Produção de Materiais", diasAntes: 3,  dependencias: ["sla4"] },
];

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_AULAS: AulaDia[] = [
  { id: "a1", data: new Date(2027, 2, 22), disciplina: "Estratégia Empresarial",    professor: "Prof. Dr. Pedro Costa",  modulo: "Módulo 1", modalidade: "presencial" },
  { id: "a2", data: new Date(2027, 2, 23), disciplina: "Finanças Corporativas",      professor: "Prof. Dr. Carlos Faria", modulo: "Módulo 1", modalidade: "presencial" },
  { id: "a3", data: new Date(2027, 2, 29), disciplina: "Gestão de Pessoas",          professor: "Prof(a) Ana Paula",      modulo: "Módulo 1", modalidade: "presencial" },
  { id: "a4", data: new Date(2027, 3, 5),  disciplina: "Marketing Estratégico",      professor: "Prof. Dr. Pedro Costa",  modulo: "Módulo 2", modalidade: "hibrido" },
  { id: "a5", data: new Date(2027, 3, 6),  disciplina: "Inovação e Transformação",   professor: "Prof. Dr. Marcos Lima",  modulo: "Módulo 2", modalidade: "presencial" },
  { id: "a6", data: new Date(2027, 3, 12), disciplina: "Liderança",                  professor: "Prof. Dr. Carlos Faria", modulo: "Módulo 2", modalidade: "presencial" },
];

function buildEtapas(aulaDate: Date, overrides: Partial<Record<string, EtapaStatus>>): EtapaInstance[] {
  return SLA_PADRAO.map((sla) => ({
    ...sla,
    dataLimite: subDays(aulaDate, sla.diasAntes),
    status: (overrides[sla.id] ?? "pendente") as EtapaStatus,
  }));
}

const MOCK_ENTREGAS: Entrega[] = [
  {
    id: "e1", nome: "Estratégia Empresarial", aulaIds: ["a1"],
    etapas: buildEtapas(new Date(2027, 2, 22), { sla1: "concluida", sla2: "atrasada", sla3: "bloqueada", sla4: "bloqueada", sla5: "bloqueada" }),
  },
  {
    id: "e2", nome: "Finanças Corporativas", aulaIds: ["a2"],
    etapas: buildEtapas(new Date(2027, 2, 23), { sla1: "concluida", sla2: "em_andamento", sla3: "pendente", sla4: "pendente", sla5: "pendente" }),
  },
  {
    id: "e3", nome: "Gestão de Pessoas", aulaIds: ["a3"],
    etapas: buildEtapas(new Date(2027, 2, 29), { sla1: "em_andamento", sla2: "pendente", sla3: "pendente", sla4: "pendente", sla5: "pendente" }),
  },
  {
    id: "e4", nome: "Módulo 2 — Bloco 1", aulaIds: ["a4", "a5"],
    etapas: buildEtapas(new Date(2027, 3, 5), { sla1: "pendente", sla2: "pendente", sla3: "pendente", sla4: "pendente", sla5: "pendente" }),
  },
  {
    id: "e5", nome: "Liderança", aulaIds: ["a6"],
    etapas: buildEtapas(new Date(2027, 3, 12), { sla1: "pendente", sla2: "pendente", sla3: "pendente", sla4: "pendente", sla5: "pendente" }),
  },
];

// ─── Helper: Status icon ───────────────────────────────────────────────────────
function StatusIcon({ status, size = "sm" }: { status: EtapaStatus; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  if (status === "concluida")    return <CheckCircle2 className={cn(cls, "text-green-500")} />;
  if (status === "em_andamento") return <RefreshCw    className={cn(cls, "text-blue-500")} />;
  if (status === "atrasada")     return <AlertCircle  className={cn(cls, "text-red-500")} />;
  if (status === "bloqueada")    return <AlertTriangle className={cn(cls, "text-orange-500")} />;
  return <Clock className={cn(cls, "text-muted-foreground")} />;
}

// ─── AulaDayCard ──────────────────────────────────────────────────────────────
function AulaDayCard({ aula, selected, onClick, entrega }: {
  aula: AulaDia; selected: boolean; onClick: () => void; entrega?: Entrega;
}) {
  const atrasadas = entrega?.etapas.filter((e) => e.status === "atrasada" || e.status === "bloqueada").length ?? 0;
  const concluidas = entrega?.etapas.filter((e) => e.status === "concluida").length ?? 0;
  const total = entrega?.etapas.length ?? SLA_PADRAO.length;
  const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  return (
    <button onClick={onClick} className={cn(
      "shrink-0 w-44 border rounded-xl p-3 text-left transition-all hover:shadow-sm",
      selected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-primary/30"
    )}>
      <div className="flex items-start justify-between gap-1 mb-2">
        <div>
          <p className="text-[10px] text-muted-foreground capitalize font-medium">
            {format(aula.data, "EEE", { locale: ptBR })}
          </p>
          <p className="text-sm font-bold text-foreground">{format(aula.data, "dd/MM/yyyy")}</p>
        </div>
        {atrasadas > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] font-medium text-red-600 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full border border-red-500/20">
            <AlertCircle className="w-2.5 h-2.5" /> {atrasadas}
          </span>
        )}
      </div>
      <p className="text-[11px] font-semibold text-foreground leading-tight truncate mb-1">{aula.disciplina}</p>
      {aula.professor && <p className="text-[10px] text-muted-foreground truncate mb-2">{aula.professor}</p>}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all", pct === 100 ? "bg-green-500" : atrasadas > 0 ? "bg-red-400" : "bg-primary")}
            style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[10px] text-muted-foreground shrink-0">{concluidas}/{total}</span>
      </div>
      <span className={cn("inline-block mt-1.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full border", MODALIDADE_COLORS[aula.modalidade])}>
        {MODALIDADE_LABELS[aula.modalidade]}
      </span>
    </button>
  );
}

// ─── EtapaNode ────────────────────────────────────────────────────────────────
function EtapaNode({ etapa, isLast, onEditSLA }: {
  etapa: EtapaInstance; isLast: boolean; onEditSLA: (id: string) => void;
}) {
  const cfg = STATUS_CONFIG[etapa.status];
  const daysLate = etapa.status === "atrasada" ? differenceInDays(DEMO_TODAY, etapa.dataLimite) : 0;

  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center w-[108px] shrink-0 group">
        {/* Circle */}
        <div className={cn("w-9 h-9 rounded-full border-2 flex items-center justify-center relative", cfg.ring, cfg.bg)}>
          <StatusIcon status={etapa.status} size="md" />
          {etapa.status === "atrasada" && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-[8px] text-white font-bold">{daysLate}d</span>
            </span>
          )}
        </div>
        {/* Info */}
        <p className="text-[10px] font-semibold text-foreground text-center mt-1.5 leading-tight px-1">{etapa.nome}</p>
        <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-full border mt-1 leading-none", AREA_COLORS[etapa.area])}>
          {etapa.area.split(" ")[0]}
        </span>
        <p className="text-[10px] text-muted-foreground font-mono mt-1">{format(etapa.dataLimite, "dd/MM")}</p>
        {/* Edit SLA button */}
        <button onClick={() => onEditSLA(etapa.id)}
          className="mt-1 opacity-0 group-hover:opacity-100 text-[9px] text-muted-foreground hover:text-primary flex items-center gap-0.5 transition-all">
          <Edit2 className="w-2 h-2" /> SLA: {etapa.diasAntes}d
        </button>
      </div>
      {/* Connector */}
      {!isLast && (
        <div className="flex items-center mb-8 mx-0.5 w-6 shrink-0">
          <div className={cn("flex-1 h-0.5", cfg.connector)} />
          <ChevronRight className={cn("w-3 h-3 shrink-0", cfg.text)} />
        </div>
      )}
    </div>
  );
}

// ─── AulaMarker ───────────────────────────────────────────────────────────────
function AulaMarker({ aula }: { aula: AulaDia }) {
  return (
    <div className="flex items-center">
      <div className="flex items-center mb-8 mx-0.5 w-6 shrink-0">
        <div className="flex-1 h-0.5 bg-foreground/20" />
        <ArrowRight className="w-3 h-3 shrink-0 text-foreground/40" />
      </div>
      <div className="flex flex-col items-center w-20 shrink-0">
        <div className="w-9 h-9 rounded-full bg-foreground/10 border-2 border-foreground/30 flex items-center justify-center">
          <CalendarLucide className="w-4 h-4 text-foreground/60" />
        </div>
        <p className="text-[11px] font-bold text-foreground text-center mt-1.5 leading-tight">AULA</p>
        <p className="text-[10px] text-muted-foreground font-mono mt-1">{format(aula.data, "dd/MM")}</p>
      </div>
    </div>
  );
}

// ─── EntregaRow ───────────────────────────────────────────────────────────────
function EntregaRow({ entrega, aulas, onEditSLA, onDelete }: {
  entrega: Entrega; aulas: AulaDia[]; onEditSLA: (entregaId: string, etapaId: string) => void; onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const primaryAula = aulas.find((a) => a.id === entrega.aulaIds[0]);
  const atrasadas = entrega.etapas.filter((e) => e.status === "atrasada" || e.status === "bloqueada").length;
  const concluidas = entrega.etapas.filter((e) => e.status === "concluida").length;
  const overallStatus: EtapaStatus = atrasadas > 0 ? (entrega.etapas.some((e) => e.status === "atrasada") ? "atrasada" : "bloqueada") :
    concluidas === entrega.etapas.length ? "concluida" :
    entrega.etapas.some((e) => e.status === "em_andamento") ? "em_andamento" : "pendente";

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/20 border-b border-border">
        <button onClick={() => setExpanded((p) => !p)} className="shrink-0 text-muted-foreground">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground">{entrega.nome}</p>
            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full border", STATUS_CONFIG[overallStatus].bg, STATUS_CONFIG[overallStatus].text,
              overallStatus === "atrasada" ? "border-red-500/20" : overallStatus === "bloqueada" ? "border-orange-500/20" : overallStatus === "concluida" ? "border-green-500/20" : "border-border"
            )}>
              <StatusIcon status={overallStatus} /> <span className="ml-0.5">{STATUS_CONFIG[overallStatus].label}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {entrega.aulaIds.map((aId) => {
              const a = aulas.find((x) => x.id === aId);
              return a ? (
                <span key={aId} className="text-[10px] text-muted-foreground">
                  {format(a.data, "dd/MM/yyyy", { locale: ptBR })} · {a.disciplina}
                </span>
              ) : null;
            })}
            <span className="text-[10px] text-muted-foreground">
              {concluidas}/{entrega.etapas.length} etapas concluídas
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {atrasadas > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
              <AlertCircle className="w-3 h-3" /> {atrasadas} atrasada{atrasadas > 1 ? "s" : ""}
            </span>
          )}
          <button onClick={() => onDelete(entrega.id)}
            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pipeline */}
      {expanded && (
        <div className="px-4 py-4 overflow-x-auto bg-card">
          <div className="flex items-start min-w-max">
            {entrega.etapas.map((etapa, i) => (
              <EtapaNode
                key={etapa.id}
                etapa={etapa}
                isLast={i === entrega.etapas.length - 1}
                onEditSLA={(eid) => onEditSLA(entrega.id, eid)}
              />
            ))}
            {primaryAula && <AulaMarker aula={primaryAula} />}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EditSLAModal ─────────────────────────────────────────────────────────────
function EditSLAModal({ entregaId, etapaId, entregas, onClose, onSave }: {
  entregaId: string; etapaId: string; entregas: Entrega[];
  onClose: () => void; onSave: (entregaId: string, etapaId: string, diasAntes: number) => void;
}) {
  const entrega = entregas.find((e) => e.id === entregaId);
  const etapa = entrega?.etapas.find((e) => e.id === etapaId);
  const [dias, setDias] = useState(etapa?.diasAntes ?? 7);

  if (!etapa) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary shrink-0" />
              <div>
                <h2 className="text-sm font-bold text-foreground">Editar SLA</h2>
                <p className="text-xs text-muted-foreground">{etapa.nome}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="px-5 py-5 space-y-4">
            <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium", AREA_COLORS[etapa.area])}>
              <Users className="w-3.5 h-3.5 shrink-0" /> Responsável: {etapa.area}
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                Prazo (dias antes da aula)
              </label>
              <div className="flex items-center gap-3">
                <input type="number" min={1} max={60}
                  className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={dias} onChange={(e) => setDias(Math.max(1, Number(e.target.value)))} />
                <span className="text-sm text-muted-foreground shrink-0">dias antes</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                <Info className="w-3 h-3 shrink-0" />
                SLA padrão: {SLA_PADRAO.find((s) => s.id === etapaId)?.diasAntes ?? dias} dias
              </p>
            </div>
            {etapa.dependencias.length > 0 && (
              <div className="bg-muted/40 rounded-lg p-3">
                <p className="text-xs font-semibold text-foreground mb-1">Dependências</p>
                {etapa.dependencias.map((depId) => {
                  const dep = entrega?.etapas.find((e) => e.id === depId);
                  return dep ? (
                    <p key={depId} className="text-xs text-muted-foreground flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 shrink-0" /> {dep.nome}
                    </p>
                  ) : null;
                })}
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button onClick={() => { onSave(entregaId, etapaId, dias); onClose(); }}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Salvar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── NovaEntregaModal ─────────────────────────────────────────────────────────
function NovaEntregaModal({ aulas, onClose, onConfirm }: {
  aulas: AulaDia[]; onClose: () => void;
  onConfirm: (nome: string, aulaIds: string[], slas: typeof SLA_PADRAO) => void;
}) {
  const [nome, setNome] = useState("");
  const [selectedAulas, setSelectedAulas] = useState<string[]>([]);
  const [slas, setSlas] = useState(SLA_PADRAO.map((s) => ({ ...s })));
  const [step, setStep] = useState<"select" | "slas">("select");

  const toggleAula = (id: string) =>
    setSelectedAulas((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const canNext = nome.trim() && selectedAulas.length > 0;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh] animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary shrink-0" />
              <h2 className="text-sm font-bold text-foreground">Nova Entrega</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Step tabs */}
          <div className="flex gap-1 mx-5 mt-3 p-1 bg-muted rounded-lg shrink-0">
            {(["select", "slas"] as const).map((s, i) => (
              <button key={s} onClick={() => step === "slas" && s === "select" && setStep("select")}
                className={cn("flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                  step === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                )}>
                {i + 1}. {s === "select" ? "Aulas e nome" : "Configurar SLAs"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {step === "select" && (
              <>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">Nome da entrega</label>
                  <input className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Estratégia Empresarial…" autoFocus />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">Dias de aula relacionados</label>
                  <div className="space-y-1.5">
                    {aulas.map((a) => (
                      <label key={a.id} className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all",
                        selectedAulas.includes(a.id) ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                      )}>
                        <input type="checkbox" checked={selectedAulas.includes(a.id)} onChange={() => toggleAula(a.id)}
                          className="rounded accent-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground">{format(a.data, "dd/MM/yyyy")} · {a.disciplina}</p>
                          {a.professor && <p className="text-[10px] text-muted-foreground">{a.professor}</p>}
                        </div>
                        <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-full border shrink-0", MODALIDADE_COLORS[a.modalidade])}>
                          {MODALIDADE_LABELS[a.modalidade]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === "slas" && (
              <div className="space-y-3">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-2">
                  <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-foreground">
                    Prazos calculados regressivamente a partir das datas de aula selecionadas. Ajuste os SLAs se necessário.
                  </p>
                </div>
                {slas.map((sla, i) => (
                  <div key={sla.id} className="flex items-center gap-3 border border-border rounded-xl px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{sla.nome}</p>
                      <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-full border", AREA_COLORS[sla.area])}>
                        {sla.area}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input type="number" min={1} max={60}
                        className="w-14 px-2 py-1 text-xs bg-background border border-input rounded focus:outline-none text-center"
                        value={sla.diasAntes}
                        onChange={(e) => setSlas((p) => p.map((s, j) => j === i ? { ...s, diasAntes: Math.max(1, Number(e.target.value)) } : s))}
                      />
                      <span className="text-[10px] text-muted-foreground">dias antes</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-5 py-4 border-t border-border shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
              Cancelar
            </button>
            <div className="flex gap-2">
              {step === "slas" && (
                <button onClick={() => setStep("select")} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                </button>
              )}
              {step === "select" ? (
                <button onClick={() => setStep("slas")} disabled={!canNext}
                  className={cn("flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    canNext ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}>
                  Próximo <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button onClick={() => { if (canNext) { onConfirm(nome.trim(), selectedAulas, slas); onClose(); } }}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Criar entrega
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PlanejamentoPage() {
  const navigate = useNavigate();
  const [entregas, setEntregas] = useState<Entrega[]>(MOCK_ENTREGAS);
  const [selectedAulaId, setSelectedAulaId] = useState<string | null>(null);
  const [alertasOpen, setAlertasOpen] = useState(true);
  const [showNovaEntrega, setShowNovaEntrega] = useState(false);
  const [editSLA, setEditSLA] = useState<{ entregaId: string; etapaId: string } | null>(null);

  // Alerts: atrasadas + bloqueadas
  const alertas = entregas.flatMap((entrega) =>
    entrega.etapas
      .filter((e) => e.status === "atrasada" || e.status === "bloqueada")
      .map((e) => ({ entrega, etapa: e }))
  );

  const totalAtrasadas = alertas.filter((a) => a.etapa.status === "atrasada").length;
  const totalBloqueadas = alertas.filter((a) => a.etapa.status === "bloqueada").length;

  const filteredEntregas = selectedAulaId
    ? entregas.filter((e) => e.aulaIds.includes(selectedAulaId))
    : entregas;

  // Stats
  const totalEtapas = entregas.reduce((a, e) => a + e.etapas.length, 0);
  const etapasConcluidas = entregas.reduce((a, e) => a + e.etapas.filter((et) => et.status === "concluida").length, 0);

  const handleSaveSLA = (entregaId: string, etapaId: string, diasAntes: number) => {
    setEntregas((prev) => prev.map((entrega) =>
      entrega.id !== entregaId ? entrega : {
        ...entrega,
        etapas: entrega.etapas.map((etapa) =>
          etapa.id !== etapaId ? etapa : {
            ...etapa,
            diasAntes,
            dataLimite: subDays(
              MOCK_AULAS.find((a) => a.id === entrega.aulaIds[0])?.data ?? new Date(),
              diasAntes
            ),
          }
        ),
      }
    ));
  };

  const handleNovaEntrega = (nome: string, aulaIds: string[], slas: typeof SLA_PADRAO) => {
    const aulaDate = MOCK_AULAS.find((a) => a.id === aulaIds[0])?.data ?? new Date();
    const novaEntrega: Entrega = {
      id: `e${Date.now()}`,
      nome,
      aulaIds,
      etapas: slas.map((sla) => ({
        ...sla,
        status: "pendente" as EtapaStatus,
        dataLimite: subDays(aulaDate, sla.diasAntes),
      })),
    };
    setEntregas((p) => [...p, novaEntrega]);
  };

  const handleDeleteEntrega = (id: string) => setEntregas((p) => p.filter((e) => e.id !== id));

  return (
    <AppLayout pageTitle="Planejamento" pageSubtitle="Cronograma reverso e gestão de entregas">
      {showNovaEntrega && (
        <NovaEntregaModal
          aulas={MOCK_AULAS}
          onClose={() => setShowNovaEntrega(false)}
          onConfirm={handleNovaEntrega}
        />
      )}
      {editSLA && (
        <EditSLAModal
          entregaId={editSLA.entregaId}
          etapaId={editSLA.etapaId}
          entregas={entregas}
          onClose={() => setEditSLA(null)}
          onSave={handleSaveSLA}
        />
      )}

      <div className="px-6 py-8 animate-fade-in space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary shrink-0" />
                <h1 className="text-xl font-bold text-foreground">Planejamento — EMBA 2027</h1>
                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/20 font-medium">Rascunho</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 ml-7">Cronograma reverso baseado nas datas de aula</p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Dias de aula", value: MOCK_AULAS.length, icon: <CalendarLucide className="w-4 h-4 text-primary" />, color: "border-primary/20 bg-primary/5" },
            { label: "Entregas",     value: entregas.length,    icon: <BookOpen className="w-4 h-4 text-blue-500" />,    color: "border-blue-500/20 bg-blue-500/5" },
            { label: "Etapas concluídas", value: `${etapasConcluidas}/${totalEtapas}`, icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, color: "border-green-500/20 bg-green-500/5" },
            { label: "Alertas",      value: alertas.length,     icon: <AlertCircle className="w-4 h-4 text-red-500" />,  color: "border-red-500/20 bg-red-500/5" },
          ].map((stat) => (
            <div key={stat.label} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border", stat.color)}>
              {stat.icon}
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Dias de Aula ──────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CalendarLucide className="w-4 h-4 text-primary" /> Dias de Aula
              <span className="text-xs text-muted-foreground font-normal">— clique para filtrar</span>
            </h2>
            {selectedAulaId && (
              <button onClick={() => setSelectedAulaId(null)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <X className="w-3 h-3" /> Limpar filtro
              </button>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
            {MOCK_AULAS.map((aula) => (
              <AulaDayCard
                key={aula.id}
                aula={aula}
                selected={selectedAulaId === aula.id}
                onClick={() => setSelectedAulaId((p) => p === aula.id ? null : aula.id)}
                entrega={entregas.find((e) => e.aulaIds.includes(aula.id))}
              />
            ))}
          </div>
        </div>

        {/* ── Alertas ───────────────────────────────────────────────────────── */}
        {alertas.length > 0 && (
          <div className="border border-red-500/20 rounded-xl overflow-hidden">
            <button
              onClick={() => setAlertasOpen((p) => !p)}
              className="w-full flex items-center justify-between px-4 py-3 bg-red-500/5 hover:bg-red-500/8 transition-colors">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-sm font-semibold text-foreground">
                  Alertas de atraso
                </span>
                <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                  {totalAtrasadas} atrasada{totalAtrasadas !== 1 ? "s" : ""} · {totalBloqueadas} bloqueada{totalBloqueadas !== 1 ? "s" : ""}
                </span>
              </div>
              {alertasOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {alertasOpen && (
              <div className="divide-y divide-border">
                {alertas.map(({ entrega, etapa }, i) => {
                  const daysLate = etapa.status === "atrasada" ? differenceInDays(DEMO_TODAY, etapa.dataLimite) : null;
                  const blockedBy = etapa.status === "bloqueada"
                    ? entrega.etapas.find((e) => etapa.dependencias.includes(e.id) && (e.status === "atrasada" || e.status === "bloqueada"))
                    : null;
                  return (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 bg-card hover:bg-muted/20 transition-colors">
                      <div className="mt-0.5 shrink-0">
                        {etapa.status === "atrasada"
                          ? <AlertCircle className="w-4 h-4 text-red-500" />
                          : <TrendingDown className="w-4 h-4 text-orange-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{etapa.nome}</p>
                          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full border", AREA_COLORS[etapa.area])}>
                            {etapa.area}
                          </span>
                          {daysLate !== null && (
                            <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full border border-red-500/20">
                              {daysLate} dia{daysLate !== 1 ? "s" : ""} de atraso
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {entrega.nome} · Prazo: {format(etapa.dataLimite, "dd/MM/yyyy")}
                          {blockedBy && ` · Bloqueada por: ${blockedBy.nome}`}
                        </p>
                        {etapa.status === "bloqueada" && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-orange-600 dark:text-orange-400">
                            <Zap className="w-3 h-3 shrink-0" />
                            Efeito cascata: etapas dependentes também impactadas
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setEditSLA({ entregaId: entrega.id, etapaId: etapa.id })}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground shrink-0">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Cronograma ────────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-primary" /> Cronograma de Entregas
              {selectedAulaId && (
                <span className="text-xs text-muted-foreground font-normal">
                  — filtrado por {format(MOCK_AULAS.find((a) => a.id === selectedAulaId)?.data ?? new Date(), "dd/MM")}
                </span>
              )}
            </h2>
            <button onClick={() => setShowNovaEntrega(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Nova Entrega
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 flex-wrap mb-4 px-1">
            <span className="text-[10px] text-muted-foreground font-medium">Status:</span>
            {(Object.entries(STATUS_CONFIG) as [EtapaStatus, typeof STATUS_CONFIG[EtapaStatus]][]).map(([key, cfg]) => (
              <span key={key} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <StatusIcon status={key} />
                <span>{cfg.label}</span>
              </span>
            ))}
            <span className="text-[10px] text-muted-foreground ml-2">· Passe o mouse na etapa para editar o SLA</span>
          </div>

          {filteredEntregas.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl py-12 text-center">
              <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Nenhuma entrega encontrada</p>
              <p className="text-xs text-muted-foreground mt-1">Crie uma entrega ou remova o filtro de aula.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntregas.map((entrega) => (
                <EntregaRow
                  key={entrega.id}
                  entrega={entrega}
                  aulas={MOCK_AULAS}
                  onEditSLA={(entregaId, etapaId) => setEditSLA({ entregaId, etapaId })}
                  onDelete={handleDeleteEntrega}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="bg-muted/40 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-foreground">Cronograma reverso</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              As datas limite de cada etapa são calculadas automaticamente a partir das datas de aula.
              Alterar o SLA de uma etapa recalcula sua data limite. Etapas com dependências em atraso são
              marcadas como <strong>Bloqueadas</strong> e geram alertas de cascata.
            </p>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
