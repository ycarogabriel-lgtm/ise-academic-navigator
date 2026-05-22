import { AppLayout } from "@/components/layout/AppLayout";
import {
  Filter, ChevronLeft, ChevronRight, Plus, X, BarChart2,
  Users, Utensils, Building, TrendingUp, Download, Search,
  GraduationCap, Clock, CheckCircle2, AlertTriangle,
  BookOpen, Info, ArrowRight, Zap, CalendarRange,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// ─── Types ────────────────────────────────────────────────────────────────────

type HeatViewMode = "week" | "month" | "semester" | "year";
type HeatDimension = "spaces" | "plenary" | "team" | "professors" | "refeitorio";
type ReservationStatus = "contracted" | "reserved" | "prereserved" | "draft" | "free";
type CellStatus = "free" | "attention" | "full" | "simulation" | "conflict";
type ModalStep = "detail" | "simulate";

interface CellDetail {
  programa: string;
  turma: string;
  horario: string;
  status: ReservationStatus;
  professor?: string;
  alunos?: number;
}

interface SimEntry { id: number; rowIdx: number; dayIdx: number; label: string; motivo: string; }

interface SelectedCell {
  rowIdx: number;
  dayIdx: number;
  rowName: string;
  dayLabel: string;
  day: number;
}

// ─── Static data ───────────────────────────────────────────────────────────────

const DIMENSION_CONFIGS: Record<HeatDimension, { label: string; icon: React.ElementType; rows: { name: string; cap?: number; type?: string }[] }> = {
  spaces: {
    label: "Todos os Espaços",
    icon: BarChart2,
    rows: [
      { name: "Anfiteatro A", cap: 120, type: "Plenária" },
      { name: "Anfiteatro B", cap: 80, type: "Plenária" },
      { name: "Sala 101", cap: 30, type: "Equipe" },
      { name: "Sala 102", cap: 25, type: "Equipe" },
      { name: "Sala 105", cap: 35, type: "Equipe" },
      { name: "Sala 201", cap: 40, type: "Equipe" },
      { name: "Sala 202", cap: 30, type: "Equipe" },
      { name: "Lab. Digital", cap: 25, type: "Laboratório" },
      { name: "Refeitório Principal", cap: 200, type: "Refeitório" },
      { name: "Café Executivo", cap: 60, type: "Refeitório" },
    ],
  },
  plenary: {
    label: "Salas Plenárias",
    icon: Building,
    rows: [
      { name: "Anfiteatro A", cap: 120, type: "Plenária" },
      { name: "Anfiteatro B", cap: 80, type: "Plenária" },
      { name: "Sala 302", cap: 60, type: "Plenária" },
      { name: "Sala 401 (Exec)", cap: 50, type: "Plenária" },
    ],
  },
  team: {
    label: "Salas de Equipe",
    icon: Building,
    rows: [
      { name: "Sala 101", cap: 30, type: "Equipe" },
      { name: "Sala 102", cap: 25, type: "Equipe" },
      { name: "Sala 105", cap: 35, type: "Equipe" },
      { name: "Sala 201", cap: 40, type: "Equipe" },
      { name: "Sala 202", cap: 30, type: "Equipe" },
      { name: "Sala 301", cap: 20, type: "Equipe" },
    ],
  },
  professors: {
    label: "Professores",
    icon: Users,
    rows: [
      { name: "Prof. Silva" },
      { name: "Prof. Costa" },
      { name: "Prof. Oliveira" },
      { name: "Prof. Souza" },
      { name: "Prof. Pereira" },
      { name: "Prof. Lima" },
      { name: "Prof. Carvalho" },
      { name: "Prof. Ferreira" },
      { name: "Prof. Rodrigues" },
      { name: "Prof. Almeida" },
    ],
  },
  refeitorio: {
    label: "Refeitórios",
    icon: Utensils,
    rows: [
      { name: "Refeitório Principal", cap: 200, type: "Refeitório" },
      { name: "Café Executivo", cap: 60, type: "Refeitório" },
      { name: "Sala de Convivência A", cap: 40, type: "Refeitório" },
      { name: "Sala de Convivência B", cap: 30, type: "Refeitório" },
    ],
  },
};

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const PROGRAMS = ["MBA Executivo", "Especialização Finanças", "Liderança Estratégica", "Marketing Digital", "Inovação e Startups"];
const TURMAS = ["T24A", "T24B", "T23B", "T24C", "T25A"];

// Mock details per cell
const CELL_DETAILS: Record<string, CellDetail[]> = {
  "0-0": [{ programa: "MBA Executivo", turma: "T24A", horario: "08:15–09:45", status: "contracted", professor: "Dr. Faria", alunos: 42 }],
  "0-2": [{ programa: "MBA Executivo", turma: "T24A", horario: "14:00–15:30", status: "reserved", professor: "Dra. Souza", alunos: 38 }],
  "1-1": [{ programa: "Especialização Finanças", turma: "T23B", horario: "09:00–12:00", status: "contracted", professor: "Dr. Lima", alunos: 28 }],
  "2-3": [
    { programa: "Liderança Estratégica", turma: "T24B", horario: "08:00–12:00", status: "prereserved", professor: "Dr. Costa", alunos: 35 },
    { programa: "Marketing Digital", turma: "T24A", horario: "14:00–18:00", status: "draft", alunos: 22 },
  ],
  "3-0": [{ programa: "MBA Executivo", turma: "T24A", horario: "13:00–14:30", status: "reserved", professor: "Dr. Pereira", alunos: 22 }],
  "4-2": [{ programa: "Inovação e Startups", turma: "T24C", horario: "10:00–11:30", status: "prereserved", alunos: 30 }],
};

const STATUS_ICONS: Record<ReservationStatus, string> = {
  contracted: "🟢",
  reserved: "🟢",
  prereserved: "🟡",
  draft: "⚪",
  free: "🟢",
};

const RESERVATION_STATUS_CONFIG: Record<ReservationStatus, { label: string; color: string; bg: string }> = {
  contracted: { label: "Contratado", color: "text-primary", bg: "bg-primary/10 border-primary/30" },
  reserved: { label: "Reservado", color: "text-success", bg: "bg-success/10 border-success/30" },
  prereserved: { label: "Pré-reserva", color: "text-warning", bg: "bg-warning/10 border-warning/30" },
  draft: { label: "Rascunho", color: "text-muted-foreground", bg: "bg-muted border-border" },
  free: { label: "Livre", color: "text-success", bg: "bg-success/10 border-success/30" },
};

function getOccupancy(seed: number): number {
  return ((seed * 6364136223846793005 + 1442695040888963407) & 0x7fffffff) % 100;
}

function occupancyStatus(pct: number): CellStatus {
  if (pct < 40) return "free";
  if (pct < 75) return "attention";
  return "full";
}

const statusStyles: Record<CellStatus, { bg: string; label: string }> = {
  free: { bg: "bg-success/70 text-success-foreground", label: "Livre" },
  attention: { bg: "bg-warning/70 text-warning-foreground", label: "Atenção" },
  full: { bg: "bg-destructive/70 text-destructive-foreground", label: "Lotado" },
  simulation: { bg: "bg-primary/70 text-primary-foreground", label: "Simulação" },
  conflict: { bg: "bg-destructive text-destructive-foreground", label: "Conflito" },
};

// ─── Range Pre-Reservation Modal ────────────────────────────────────────────────

interface RangeSimEntry {
  id: number;
  resourceName: string;
  dateRange: { from: Date; to: Date };
  startTime: string;
  endTime: string;
  label: string;
  motivo: string;
  programa: string;
  turma: string;
  observacoes: string;
  hasConflict: boolean;
}

interface RangeSimModalProps {
  allRows: { name: string; cap?: number; type?: string }[];
  onClose: () => void;
  onSave: (entry: RangeSimEntry) => void;
}

function RangeSimModal({ allRows, onClose, onSave }: RangeSimModalProps) {
  const [resource, setResource] = useState(allRows[0]?.name || "");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [label, setLabel] = useState("");
  const [motivo, setMotivo] = useState("");
  const [programa, setPrograma] = useState("");
  const [turma, setTurma] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [calOpen, setCalOpen] = useState(false);

  const hasConflict = dateRange?.from && dateRange?.to
    ? (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24) > 14
    : false;

  const dayCount = dateRange?.from && dateRange?.to
    ? Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : null;

  const canSave = resource && dateRange?.from && dateRange?.to && motivo.trim() && label.trim();

  const handleSave = () => {
    if (!canSave || !dateRange?.from || !dateRange?.to) return;
    onSave({
      id: Date.now(),
      resourceName: resource,
      dateRange: { from: dateRange.from, to: dateRange.to },
      startTime,
      endTime,
      label,
      motivo,
      programa,
      turma,
      observacoes,
      hasConflict,
    });
    onClose();
    toast({
      title: hasConflict ? "⚠️ Pré-reserva simulada com alertas" : "✅ Simulação de pré-reserva criada",
      description: hasConflict
        ? `"${label}" foi salva, mas o período é extenso. Verifique conflitos no mapa.`
        : `"${label}" marcada em ${resource} de ${format(dateRange.from, "dd/MM")} a ${format(dateRange.to, "dd/MM/yyyy")}.`,
      variant: hasConflict ? "destructive" : "default",
    });
  };

  const dateLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "dd MMM", { locale: ptBR })} – ${format(dateRange.to, "dd MMM yyyy", { locale: ptBR })}`
      : format(dateRange.from, "dd MMM yyyy", { locale: ptBR })
    : "Selecionar período";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarRange className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-foreground">Nova Pré-Reserva</h3>
              <p className="text-xs text-muted-foreground">Selecione um período e recurso</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Resource selector */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Recurso <span className="text-destructive">*</span>
            </label>
            <select
              value={resource}
              onChange={e => setResource(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {allRows.map(r => (
                <option key={r.name} value={r.name}>
                  {r.name}{r.cap ? ` — Cap. ${r.cap}` : ""}{r.type ? ` (${r.type})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Date range picker */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Período <span className="text-destructive">*</span>
            </label>
            <Popover open={calOpen} onOpenChange={setCalOpen}>
              <PopoverTrigger asChild>
                <button className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm bg-background border border-input rounded-lg hover:border-primary/40 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-primary/30",
                  !dateRange?.from && "text-muted-foreground"
                )}>
                  <CalendarRange className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="flex-1">{dateLabel}</span>
                  {dayCount && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium shrink-0">
                      {dayCount}d
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" side="bottom">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  initialFocus
                  numberOfMonths={2}
                  className="p-3 pointer-events-auto"
                />
                <div className="px-4 pb-3 flex justify-end border-t border-border pt-3">
                  <button
                    onClick={() => setCalOpen(false)}
                    className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Confirmar
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            {dateRange?.from && !dateRange?.to && (
              <p className="text-xs text-muted-foreground mt-1">Clique em uma segunda data para definir o fim do período</p>
            )}
          </div>

          {/* Time range */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Horário diário <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                aria-label="Horário início"
              />
              <span className="text-xs text-muted-foreground font-medium">até</span>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                aria-label="Horário fim"
              />
            </div>
          </div>

          {/* Conflict preview if long range */}
          {hasConflict && (
            <div className="flex items-start gap-2.5 bg-warning/10 border border-warning/30 rounded-xl p-3.5">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-warning">Período extenso detectado</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  O período selecionado é longo (&gt;14 dias). Revise o mapa de calor após salvar para identificar possíveis conflitos.
                </p>
              </div>
            </div>
          )}

          {/* Conflict simulation banner */}
          {dateRange?.from && dateRange?.to && (
            <div className="bg-muted/30 border border-border rounded-xl p-3.5 space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Preview da simulação</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-1 font-medium">
                  {resource}
                </span>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-foreground font-medium">
                  {format(dateRange.from, "dd/MM")} – {format(dateRange.to, "dd/MM/yyyy")}
                </span>
                <span className="text-xs text-muted-foreground">
                  · {startTime}–{endTime}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${Math.min(((dayCount || 1) / 30) * 100, 100)}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{dayCount} dia{dayCount !== 1 ? "s" : ""}</span>
              </div>
            </div>
          )}

          {/* Label */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Descrição da atividade <span className="text-destructive">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Ex: MBA T25A – Módulo Finanças"
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Motivo */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Motivo / Finalidade <span className="text-destructive">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Descreva o objetivo desta pré-reserva..."
              rows={2}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Optional fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Programa (opcional)</label>
              <select
                value={programa}
                onChange={e => setPrograma(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Nenhum</option>
                {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Turma (opcional)</label>
              <select
                value={turma}
                onChange={e => setTurma(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Nenhuma</option>
                {TURMAS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Observações (opcional)</label>
            <textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Informações adicionais..."
              rows={2}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="flex items-start gap-2.5 bg-primary/5 border border-primary/20 rounded-xl p-3.5">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Simulações são marcadas como <strong className="text-foreground">Pré-reserva (Simulação)</strong> e não bloqueiam agendas oficiais.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border shrink-0 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            disabled={!canSave}
            onClick={handleSave}
            className={cn(
              "flex-1 py-2.5 text-sm rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
              hasConflict
                ? "bg-warning text-warning-foreground hover:bg-warning/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {hasConflict ? <AlertTriangle className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
            {hasConflict ? "Salvar com Alertas" : "Confirmar Simulação"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cell + Simulation Modal ────────────────────────────────────────────────────

interface CellSimModalProps {
  cell: SelectedCell;
  details: CellDetail[];
  occupancyPct: number;
  simEntries: SimEntry[];
  onClose: () => void;
  onSaveSim: (entry: Omit<SimEntry, "id">) => void;
}

function CellSimModal({ cell, details, occupancyPct, simEntries, onClose, onSaveSim }: CellSimModalProps) {
  const [step, setStep] = useState<ModalStep>("detail");
  const [motivo, setMotivo] = useState("");
  const [label, setLabel] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [programaVinc, setProgramaVinc] = useState("");
  const [turmaVinc, setTurmaVinc] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const hasConflict = occupancyPct >= 75 || details.some(d => d.status === "contracted" || d.status === "reserved");
  const canSave = motivo.trim().length > 0 && label.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSaveSim({ rowIdx: cell.rowIdx, dayIdx: cell.dayIdx, label, motivo });
    onClose();
    toast({
      title: hasConflict ? "⚠️ Simulação salva com conflito" : "✅ Simulação adicionada",
      description: hasConflict
        ? `"${label}" foi salva mas há conflito em ${cell.rowName}.`
        : `"${label}" marcada como Pré-reserva (Simulação) em ${cell.rowName}.`,
      variant: hasConflict ? "destructive" : "default",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {step === "simulate" && (
              <button
                onClick={() => setStep("detail")}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground shrink-0"
                aria-label="Voltar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div className="min-w-0">
              <h3 className="font-display font-bold text-sm text-foreground truncate">
                {step === "detail" ? cell.rowName : "Simular Pré-Reserva"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{cell.dayLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Step indicator */}
            <div className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full transition-colors", step === "detail" ? "bg-primary" : "bg-muted-foreground/40")} />
              <div className={cn("w-2 h-2 rounded-full transition-colors", step === "simulate" ? "bg-primary" : "bg-muted-foreground/40")} />
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground ml-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {step === "detail" && (
            <div className="p-6 space-y-4">
              {/* Occupancy summary */}
              <div className={cn(
                "rounded-xl p-3.5 flex items-center gap-3 border",
                hasConflict ? "bg-destructive/10 border-destructive/30" : occupancyPct >= 40 ? "bg-warning/10 border-warning/30" : "bg-success/10 border-success/30"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                  hasConflict ? "bg-destructive/20 text-destructive" : occupancyPct >= 40 ? "bg-warning/20 text-warning" : "bg-success/20 text-success"
                )}>
                  {occupancyPct}%
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {hasConflict ? "Recurso com alta ocupação" : occupancyPct >= 40 ? "Ocupação moderada" : "Recurso disponível"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {details.length > 0 ? `${details.length} atividade${details.length > 1 ? "s" : ""} neste período` : "Nenhuma atividade registrada"}
                  </p>
                </div>
                {hasConflict && <AlertTriangle className="w-4 h-4 text-destructive ml-auto shrink-0" />}
              </div>

              {/* Activity list */}
              {details.length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-xl border border-border border-dashed">
                  <CheckCircle2 className="w-10 h-10 text-success/40 mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Recurso livre neste período</p>
                  <p className="text-xs text-muted-foreground mt-1">Nenhuma atividade vinculada</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Atividades vinculadas
                  </p>
                  {details.map((d, i) => {
                    const sc = RESERVATION_STATUS_CONFIG[d.status];
                    return (
                      <div key={i} className={cn("border rounded-xl p-4 space-y-2.5", sc.bg)}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <BookOpen className="w-3 h-3 text-muted-foreground shrink-0" />
                              <p className="text-sm font-semibold text-foreground leading-tight truncate">{d.programa}</p>
                            </div>
                            <p className="text-xs text-muted-foreground pl-4.5">{d.turma}</p>
                          </div>
                          <span className={cn(
                            "text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap shrink-0 border",
                            sc.bg, sc.color
                          )}>
                            {STATUS_ICONS[d.status]} {sc.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap border-t border-border/40 pt-2">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="font-medium text-foreground">{d.horario}</span>
                          </div>
                          {d.professor && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Users className="w-3 h-3" />{d.professor}
                            </div>
                          )}
                          {d.alunos && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <GraduationCap className="w-3 h-3" />{d.alunos} alunos
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Conflict warning if multiple bookings */}
              {details.length > 1 && (
                <div className="flex items-start gap-2.5 bg-warning/10 border border-warning/30 rounded-xl p-3.5">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-warning">Múltiplas ocupações</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Este recurso possui {details.length} atividades sobrepostas. Simule uma pré-reserva para verificar o impacto.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "simulate" && (
            <div className="p-6 space-y-5">
              {/* Conflict preview banner */}
              {hasConflict && (
                <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/30 rounded-xl p-3.5">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-destructive">⚠️ Conflito detectado</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cell.rowName} já possui atividades contratadas/reservadas neste período. A simulação será marcada com status de conflito.
                    </p>
                  </div>
                </div>
              )}

              {/* Resource + date (read-only context) */}
              <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Contexto da simulação</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">Recurso</p>
                    <p className="text-xs font-semibold text-foreground">{cell.rowName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">Data</p>
                    <p className="text-xs font-semibold text-foreground">{cell.dayLabel}</p>
                  </div>
                </div>
              </div>

              {/* Time range */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block">
                  Horário <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                    aria-label="Horário início"
                  />
                  <span className="text-xs text-muted-foreground">até</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                    aria-label="Horário fim"
                  />
                </div>
              </div>

              {/* Label / activity description */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  Descrição da atividade <span className="text-destructive">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="Ex: MBA T25A – Sessão 01"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Motivo */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  Motivo / Finalidade <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  placeholder="Descreva o objetivo desta pré-reserva..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              {/* Optional: programa/turma */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Programa (opcional)
                  </label>
                  <select
                    value={programaVinc}
                    onChange={e => setProgramaVinc(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Nenhum</option>
                    {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Turma (opcional)
                  </label>
                  <select
                    value={turmaVinc}
                    onChange={e => setTurmaVinc(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Nenhuma</option>
                    {TURMAS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Observações (opcional)
                </label>
                <textarea
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              {/* Simulation info note */}
              <div className="flex items-start gap-2.5 bg-primary/5 border border-primary/20 rounded-xl p-3.5">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Simulações são marcadas como <strong className="text-foreground">Pré-reserva (Simulação)</strong> e não bloqueiam agendas oficiais. Apenas você visualiza internamente.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-border shrink-0 flex gap-2.5">
          {step === "detail" ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 text-sm border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors font-medium"
              >
                Fechar
              </button>
              <button
                onClick={() => setStep("simulate")}
                className="flex-1 py-2.5 text-sm bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                Simular Pré-Reserva
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep("detail")}
                className="flex-1 py-2.5 text-sm border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors font-medium"
              >
                Voltar
              </button>
              <button
                disabled={!canSave}
                onClick={handleSave}
                className={cn(
                  "flex-1 py-2.5 text-sm rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors",
                  hasConflict
                    ? "bg-warning text-warning-foreground hover:bg-warning/90 disabled:opacity-50"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                )}
              >
                {hasConflict ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {hasConflict ? "Salvar com Conflito" : "Confirmar Simulação"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Insights Sidebar ──────────────────────────────────────────────────────────

function InsightsSidebar({ rows, visibleDays, simEntries, activeStatuses, onRemoveSim }: {
  rows: typeof DIMENSION_CONFIGS[HeatDimension]["rows"];
  visibleDays: number[];
  simEntries: SimEntry[];
  activeStatuses: Set<ReservationStatus>;
  onRemoveSim: (id: number) => void;
}) {
  const allPcts: number[] = [];
  rows.forEach((_, rIdx) => {
    visibleDays.forEach((day, dIdx) => {
      const seed = (rIdx + 1) * (dIdx + 1) * (day + 7);
      allPcts.push(getOccupancy(seed));
    });
  });
  const avgPct = allPcts.length ? Math.round(allPcts.reduce((a, b) => a + b, 0) / allPcts.length) : 0;
  const contracted = Math.round(allPcts.filter((p) => p >= 75).length / allPcts.length * 100);
  const wip = Math.round(allPcts.filter((p) => p >= 40 && p < 75).length / allPcts.length * 100);
  const free = 100 - contracted - wip;

  const statusDist = [
    { label: "Contratado", pct: contracted, color: "bg-primary" },
    { label: "Reservado", pct: Math.round(wip * 0.5), color: "bg-success" },
    { label: "Pré-reserva", pct: Math.round(wip * 0.3), color: "bg-warning" },
    { label: "Rascunho", pct: Math.round(wip * 0.2), color: "bg-muted-foreground/40" },
    { label: "Livre", pct: free, color: "bg-muted-foreground/20" },
  ];

  const dayStats = visibleDays.map((day, dIdx) => {
    const dayPcts = rows.map((_, rIdx) => getOccupancy((rIdx + 1) * (dIdx + 1) * (day + 7)));
    const avg = Math.round(dayPcts.reduce((a, b) => a + b, 0) / dayPcts.length);
    return { day, avg, dIdx };
  }).sort((a, b) => b.avg - a.avg).slice(0, 3);

  const barMax = Math.max(...statusDist.map((s) => s.pct));

  return (
    <div className="w-60 shrink-0 bg-card border-l border-border flex flex-col overflow-y-auto">
      <div className="px-4 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold text-sm text-foreground">Insights do Período</h3>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Taxa geral */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Taxa de Ocupação</p>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-4xl font-display font-bold text-foreground">{avgPct}%</span>
            <span className="text-xs text-muted-foreground">do período</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-3">
            {statusDist.filter((s) => s.pct > 0).map((s) => (
              <div key={s.label} className={cn("h-full transition-all", s.color)} style={{ width: `${s.pct}%` }} title={`${s.label}: ${s.pct}%`} />
            ))}
          </div>
          <div className="space-y-1.5">
            {statusDist.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-2.5 h-2.5 rounded-full", item.color)} />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
                <span className="text-xs font-semibold text-foreground">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Distribuição por Status</p>
          <div className="space-y-2">
            {statusDist.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between mb-0.5">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <span className="text-xs font-medium text-foreground">{s.pct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", s.color)} style={{ width: `${barMax > 0 ? (s.pct / barMax) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top períodos críticos */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Top Períodos Críticos</p>
          <div className="space-y-2">
            {dayStats.map(({ day, avg, dIdx }) => (
              <div key={day} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs font-medium text-foreground">{DAY_LABELS[dIdx % 7]}, {day.toString().padStart(2, "0")}/03</p>
                  <p className="text-xs text-muted-foreground">{avg >= 75 ? "Nível Crítico" : avg >= 40 ? "Atenção" : "Normal"}</p>
                </div>
                <span className={cn("text-xs font-bold",
                  avg >= 75 ? "text-destructive" : avg >= 40 ? "text-warning" : "text-success")}>{avg}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Simulações ativas */}
        {simEntries.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Simulações ({simEntries.length})
            </p>
            <div className="space-y-1.5">
              {simEntries.map((s) => (
                <div key={s.id} className="text-xs bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-2 text-primary flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{s.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{s.motivo}</p>
                  </div>
                  <button
                    onClick={() => onRemoveSim(s.id)}
                    className="shrink-0 p-0.5 rounded hover:bg-destructive/20 hover:text-destructive transition-colors"
                    aria-label="Remover simulação"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="w-full py-2.5 bg-foreground text-background text-sm font-semibold rounded-lg hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />Exportar Relatório
        </button>
      </div>
    </div>
  );
}

// ─── Filter Panel ──────────────────────────────────────────────────────────────

interface FilterState {
  maxAlunos: number | "";
  professor: string;
  statuses: Set<ReservationStatus>;
}

function FilterPanel({ filters, onChange, onClose }: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClose: () => void;
}) {
  const allStatuses: ReservationStatus[] = ["contracted", "reserved", "prereserved", "draft", "free"];
  const toggleStatus = (s: ReservationStatus) => {
    const next = new Set(filters.statuses);
    next.has(s) ? next.delete(s) : next.add(s);
    onChange({ ...filters, statuses: next });
  };

  return (
    <div className="absolute top-full right-0 mt-1.5 w-72 bg-card border border-border rounded-xl shadow-xl z-40 animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <p className="text-sm font-semibold text-foreground">Filtros Operacionais</p>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">Nº máx. de alunos</label>
          <input
            type="number"
            placeholder="Ex: 50"
            value={filters.maxAlunos}
            onChange={(e) => onChange({ ...filters, maxAlunos: e.target.value ? Number(e.target.value) : "" })}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">Professor específico</label>
          <input
            type="text"
            placeholder="Buscar professor..."
            value={filters.professor}
            onChange={(e) => onChange({ ...filters, professor: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground mb-2 block">Status de reserva</label>
          <div className="space-y-2">
            {allStatuses.map((s) => {
              const sc = RESERVATION_STATUS_CONFIG[s];
              return (
                <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => toggleStatus(s)}
                    className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer shrink-0",
                      filters.statuses.has(s) ? "bg-primary border-primary" : "border-border hover:border-primary/50"
                    )}
                  >
                    {filters.statuses.has(s) && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <span className={cn("text-xs font-medium", sc.color)}>{sc.label}</span>
                </label>
              );
            })}
          </div>
        </div>
        <button
          onClick={() => onChange({ maxAlunos: "", professor: "", statuses: new Set() })}
          className="w-full py-2 text-xs text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
        >
          Limpar filtros
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function HeatMap() {
  const [dimension, setDimension] = useState<HeatDimension>("spaces");
  const [viewMode, setViewMode] = useState<HeatViewMode>("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [simEntries, setSimEntries] = useState<SimEntry[]>([]);
  const [rangeSimEntries, setRangeSimEntries] = useState<RangeSimEntry[]>([]);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ maxAlunos: "", professor: "", statuses: new Set() });
  const filterRef = useRef<HTMLDivElement>(null);
  const [startDate, setStartDate] = useState("2026-03-09");
  const [endDate, setEndDate] = useState("2026-03-15");

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilters(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const allRows = DIMENSION_CONFIGS[dimension].rows;

  const rows = allRows.filter((row) => {
    if (filters.professor && !row.name.toLowerCase().includes(filters.professor.toLowerCase())) return false;
    if (filters.maxAlunos !== "" && row.cap !== undefined && row.cap > (filters.maxAlunos as number)) return false;
    return true;
  });

  const getDays = (): number[] => {
    if (viewMode === "week") return [9, 10, 11, 12, 13, 14, 15].map((d) => d + weekOffset * 7);
    if (viewMode === "month") return Array.from({ length: 31 }, (_, i) => i + 1);
    if (viewMode === "semester") return Array.from({ length: 6 }, (_, i) => i + 1);
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  const days = getDays();
  const dayLabels = viewMode === "week" ? DAY_LABELS
    : viewMode === "month" ? days.map((d) => d.toString())
    : viewMode === "semester" ? ["Mar", "Abr", "Mai", "Jun", "Jul", "Ago"]
    : MONTHS_SHORT;

  const visibleDays = viewMode === "month" ? days.slice(0, 16) : days;

  const getSimEntry = (rowIdx: number, dayIdx: number) =>
    simEntries.find((e) => e.rowIdx === rowIdx && e.dayIdx === dayIdx);

  const getCellData = (rowIdx: number, dayIdx: number, day: number) => {
    const seed = (rowIdx + 1) * (dayIdx + 1) * (day + 7);
    const pct = getOccupancy(seed);
    const sim = getSimEntry(rowIdx, dayIdx);
    const key = `${rowIdx}-${dayIdx}`;
    const details = CELL_DETAILS[key] || [];
    if (sim) return { status: pct >= 75 ? "conflict" : "simulation" as CellStatus, pct, simEntry: sim, details };
    return { status: occupancyStatus(pct), pct, simEntry: undefined, details };
  };

  const handleCellClick = (rowIdx: number, dayIdx: number, rowName: string, day: number) => {
    const label = viewMode === "week"
      ? `${DAY_LABELS[dayIdx]}, ${day.toString().padStart(2, "0")}/Mar 2026`
      : viewMode === "month" ? `Dia ${day}/03/2026`
      : dayLabels[dayIdx] + " 2026";
    setSelectedCell({ rowIdx, dayIdx, rowName, dayLabel: label, day });
  };

  const handleRemoveSim = (id: number) => {
    setSimEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleSaveSim = (entry: Omit<SimEntry, "id">) => {
    setSimEntries(prev => [
      ...prev.filter(e => !(e.rowIdx === entry.rowIdx && e.dayIdx === entry.dayIdx)),
      { ...entry, id: Date.now() },
    ]);
  };

  const handleSaveRangeSim = (entry: RangeSimEntry) => {
    setRangeSimEntries(prev => [...prev, entry]);
  };

  const handleRemoveRangeSim = (id: number) => {
    setRangeSimEntries(prev => prev.filter(e => e.id !== id));
  };

  const totalSimCount = simEntries.length + rangeSimEntries.length;

  const periodLabel = viewMode === "week"
    ? `${(9 + weekOffset * 7).toString().padStart(2, "0")} mar – ${(15 + weekOffset * 7).toString().padStart(2, "0")} mar 2026`
    : viewMode === "month" ? "Março 2026"
    : viewMode === "semester" ? "Mar – Ago 2026"
    : "2026";

  const activeFilterCount = (filters.maxAlunos !== "" ? 1 : 0) + (filters.professor ? 1 : 0) + filters.statuses.size;

  // Data for selected cell modal
  const selectedCellDetails = selectedCell
    ? CELL_DETAILS[`${selectedCell.rowIdx}-${selectedCell.dayIdx}`] || []
    : [];
  const selectedCellPct = selectedCell
    ? getOccupancy((selectedCell.rowIdx + 1) * (selectedCell.dayIdx + 1) * (selectedCell.day + 7))
    : 0;

  return (
    <AppLayout pageTitle="Mapa de Calor" pageSubtitle="Heatmap de disponibilidade de espaços, professores e refeitórios">
      <div className="flex h-full overflow-hidden animate-fade-in">
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Controls bar */}
          <div className="px-5 py-3 border-b border-border bg-card flex flex-wrap items-center gap-3 justify-between shrink-0">
            {/* Dimension/resource type tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(Object.entries(DIMENSION_CONFIGS) as [HeatDimension, typeof DIMENSION_CONFIGS[HeatDimension]][]).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button key={key} onClick={() => setDimension(key)}
                    className={cn("text-xs px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5",
                      dimension === key
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                    )}
                    aria-pressed={dimension === key}
                  >
                    <Icon className="w-3.5 h-3.5" />{cfg.label}
                  </button>
                );
              })}
            </div>

            {/* Period nav + view mode + filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* View mode toggle */}
              <div className="flex items-center border border-border rounded-lg overflow-hidden" role="group" aria-label="Modo de visualização">
                {(["week", "month", "semester", "year"] as HeatViewMode[]).map((v) => (
                  <button key={v} onClick={() => setViewMode(v)}
                    className={cn("text-xs px-2.5 py-1.5 font-medium transition-colors",
                      viewMode === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                    )}
                    aria-pressed={viewMode === v}
                  >
                    {v === "week" ? "Semana" : v === "month" ? "Mês" : v === "semester" ? "Semestre" : "Ano"}
                  </button>
                ))}
              </div>

              {/* Calendar navigation */}
              {viewMode === "week" && (
                <div className="flex items-center gap-1">
                  <button onClick={() => setWeekOffset((i) => i - 1)}
                    className="p-1.5 border border-border rounded-md hover:bg-muted transition-colors text-muted-foreground"
                    aria-label="Semana anterior">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-medium text-foreground min-w-36 text-center">{periodLabel}</span>
                  <button onClick={() => setWeekOffset((i) => i + 1)}
                    className="p-1.5 border border-border rounded-md hover:bg-muted transition-colors text-muted-foreground"
                    aria-label="Próxima semana">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
              {viewMode !== "week" && (
                <span className="text-xs font-medium text-foreground px-2 py-1.5 bg-muted rounded-lg">{periodLabel}</span>
              )}

              {/* Filter button */}
              <div className="relative" ref={filterRef}>
                <button onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all",
                    activeFilterCount > 0
                      ? "bg-primary/10 text-primary border-primary/40"
                      : "bg-card text-muted-foreground border-border hover:border-primary/40"
                  )}
                  aria-label="Filtros operacionais"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filtros
                  {activeFilterCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                {showFilters && (
                  <FilterPanel filters={filters} onChange={setFilters} onClose={() => setShowFilters(false)} />
                )}
              </div>

              {/* Pre-Reserve button */}
              <button
                onClick={() => setShowRangeModal(true)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-sm"
                aria-label="Nova pré-reserva"
              >
                <CalendarRange className="w-3.5 h-3.5" />
                Nova Pré-Reserva
              </button>
            </div>
          </div>
          <div className="px-5 py-2 border-b border-border bg-muted/20 flex items-center gap-3 shrink-0 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Período customizado:</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="text-xs px-2.5 py-1 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="Data de início" />
            <span className="text-xs text-muted-foreground">até</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="text-xs px-2.5 py-1 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="Data de fim" />
            {simEntries.length > 0 && (
              <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full font-medium border border-primary/20 ml-auto">
                {simEntries.length} simulação{simEntries.length !== 1 ? "ões" : ""} ativa{simEntries.length !== 1 ? "s" : ""}
              </span>
            )}
            {activeFilterCount > 0 && (
              <span className="text-xs px-2.5 py-1 bg-warning/10 text-warning rounded-full font-medium border border-warning/20">
                {activeFilterCount} filtro{activeFilterCount !== 1 ? "s" : ""} ativo{activeFilterCount !== 1 ? "s" : ""}
              </span>
            )}
            {/* Instruction hint */}
            <span className="text-xs text-muted-foreground/60 ml-auto">
              💡 Clique em qualquer célula para ver detalhes e simular pré-reservas
            </span>
          </div>

          {/* Heatmap grid */}
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-card rounded-xl border border-border shadow-card overflow-auto">
              <table className="text-sm min-w-[700px] w-full" aria-label="Mapa de ocupação">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground w-44 sticky left-0 bg-card z-10">
                      Recurso
                    </th>
                    {visibleDays.map((day, i) => (
                      <th key={`${day}-${i}`} className="text-center px-1 py-3 text-xs font-semibold text-muted-foreground min-w-[68px]">
                        {viewMode === "week" && <p className="text-muted-foreground/60 text-[10px]">{dayLabels[i]}</p>}
                        <p className="font-mono text-foreground text-xs">
                          {viewMode === "week" ? `${day.toString().padStart(2, "0")}/03` : dayLabels[i]}
                        </p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={visibleDays.length + 1} className="px-4 py-12 text-center">
                        <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Nenhum recurso encontrado com os filtros atuais</p>
                      </td>
                    </tr>
                  ) : rows.map((row, rowIdx) => (
                    <tr key={row.name} className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-2 text-xs font-medium text-foreground sticky left-0 bg-card z-10">
                        <div className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0 mt-1" />
                          <div>
                            <p className="font-semibold">{row.name}</p>
                            {row.cap && <p className="text-[10px] text-muted-foreground">Cap. {row.cap} · {row.type}</p>}
                          </div>
                        </div>
                      </td>
                      {visibleDays.map((day, dayIdx) => {
                        const { status, pct, simEntry, details } = getCellData(rowIdx, dayIdx, day);
                        const st = statusStyles[status];
                        const hasSim = !!simEntry;
                        const hasDetail = details.length > 0;
                        const durationH = Math.floor(pct / 12) + 4;
                        const isSelected = selectedCell?.rowIdx === rowIdx && selectedCell?.dayIdx === dayIdx;
                        return (
                          <td key={`${day}-${dayIdx}`} className="px-1 py-1.5 text-center">
                            <div
                              role="button"
                              tabIndex={0}
                              aria-label={`${row.name}, ${viewMode === "week" ? `${day}/Mar` : dayLabels[dayIdx]}: ${pct}% ocupado. Clique para detalhes.`}
                              className={cn(
                                "mx-auto rounded-md py-1.5 px-1 cursor-pointer hover:opacity-90 hover:scale-105 transition-all relative group/cell min-w-[60px]",
                                st.bg,
                                hasSim && "ring-2 ring-primary ring-offset-1",
                                hasDetail && "ring-1 ring-white/30",
                                isSelected && "ring-2 ring-primary ring-offset-2 scale-105"
                              )}
                              onClick={() => handleCellClick(rowIdx, dayIdx, row.name, day)}
                              onKeyDown={(e) => e.key === "Enter" && handleCellClick(rowIdx, dayIdx, row.name, day)}
                            >
                              <p className="text-xs font-bold leading-tight">{durationH}h</p>
                              <p className="text-[9px] opacity-80">{pct}%</p>
                              {hasDetail && (
                                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white/80 border border-card"
                                  title={`${details.length} programa${details.length > 1 ? "s" : ""}`} />
                              )}
                              {hasSim && (
                                <button
                                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity z-10"
                                  onClick={(e) => { e.stopPropagation(); handleRemoveSim(simEntry!.id); }}
                                  aria-label="Remover simulação"
                                >
                                  <X className="w-2.5 h-2.5 text-destructive-foreground" />
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 flex-wrap mt-4 px-1">
              <p className="text-xs text-muted-foreground font-semibold">Legenda:</p>
              {[
                { status: "free" as CellStatus, label: "Livre (< 40%)" },
                { status: "attention" as CellStatus, label: "Atenção (40–75%)" },
                { status: "full" as CellStatus, label: "Lotado (> 75%)" },
                { status: "simulation" as CellStatus, label: "Em simulação" },
                { status: "conflict" as CellStatus, label: "Conflito" },
              ].map((l) => (
                <div key={l.status} className="flex items-center gap-1.5">
                  <div className={cn("w-4 h-4 rounded", statusStyles[l.status].bg)} />
                  <span className="text-xs text-muted-foreground">{l.label}</span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                · <span className="inline-block w-2 h-2 rounded-full bg-foreground/60 mx-0.5 mb-0.5" /> programas vinculados
                · <kbd className="text-[9px] bg-muted border border-border rounded px-1">clique</kbd> para detalhes + simular pré-reserva
              </p>
            </div>
          </div>
        </div>

        {/* Insights sidebar */}
        <InsightsSidebar
          rows={rows}
          visibleDays={visibleDays}
          simEntries={[...simEntries, ...rangeSimEntries.map(e => ({ id: e.id, rowIdx: -1, dayIdx: -1, label: e.label, motivo: e.motivo }))]}
          activeStatuses={filters.statuses}
          onRemoveSim={(id) => { handleRemoveSim(id); handleRemoveRangeSim(id); }}
        />
      </div>

      {/* Range pre-reservation modal */}
      {showRangeModal && (
        <RangeSimModal
          allRows={allRows}
          onClose={() => setShowRangeModal(false)}
          onSave={handleSaveRangeSim}
        />
      )}

      {/* Combined cell detail + simulation modal */}
      {selectedCell && (
        <CellSimModal
          cell={selectedCell}
          details={selectedCellDetails}
          occupancyPct={selectedCellPct}
          simEntries={simEntries}
          onClose={() => setSelectedCell(null)}
          onSaveSim={handleSaveSim}
        />
      )}
    </AppLayout>
  );
}
