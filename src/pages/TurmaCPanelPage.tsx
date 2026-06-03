import { AppLayout } from "@/components/layout/AppLayout";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft, ClipboardList, CheckCircle2, Clock, AlertCircle,
  Circle, MinusCircle, ChevronDown, ChevronUp, MessageSquare,
  User, Calendar, BarChart2, Filter, BookOpen, Monitor,
  FileText, Send, Award, Bell, Users, Building2, Layers,
  GraduationCap, CheckCheck, RefreshCw, AlertTriangle, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStatus = "pending" | "in_progress" | "done" | "late" | "na";
type TaskPriority = "high" | "medium" | "low";

interface CPanelTask {
  id: number;
  title: string;
  responsible: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  notes?: string;
  category: string;
}

interface CPanelPhase {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  categories: {
    id: string;
    label: string;
    icon: React.ReactNode;
    tasks: CPanelTask[];
  }[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const CPANEL_PHASES: CPanelPhase[] = [
  {
    id: "pre_abertura",
    label: "Pré-Abertura",
    icon: <FileText className="w-4 h-4" />,
    description: "Planejamento e preparação antes do início do programa",
    categories: [
      {
        id: "grade_academica",
        label: "Grade Acadêmica",
        icon: <GraduationCap className="w-3.5 h-3.5" />,
        tasks: [
          { id: 1, title: "Outline do programa aprovado pela diretoria", responsible: "Prof. Dr. Carlos Faria", dueDate: "10/Mar", status: "done", priority: "high", category: "grade_academica", notes: "Aprovado na reunião de 08/Mar" },
          { id: 2, title: "Grade de professores definida e confirmada", responsible: "Profa. Dra. Ana Souza", dueDate: "15/Mar", status: "done", priority: "high", category: "grade_academica" },
          { id: 3, title: "Plano de aulas (sessão a sessão) entregue", responsible: "Prof. Dr. Carlos Faria", dueDate: "20/Mar", status: "late", priority: "high", category: "grade_academica" },
        ],
      },
      {
        id: "infraestrutura",
        label: "Infraestrutura",
        icon: <Building2 className="w-3.5 h-3.5" />,
        tasks: [
          { id: 4, title: "Salas reservadas para todo o período", responsible: "Rafael Torres", dueDate: "05/Mar", status: "done", priority: "high", category: "infraestrutura" },
          { id: 5, title: "Equipamentos AV confirmados", responsible: "Rafael Torres", dueDate: "10/Mar", status: "done", priority: "medium", category: "infraestrutura" },
          { id: 6, title: "Acessibilidade verificada", responsible: "Rafael Torres", dueDate: "10/Mar", status: "na", priority: "low", category: "infraestrutura" },
        ],
      },
      {
        id: "comunicacao",
        label: "Comunicação",
        icon: <Send className="w-3.5 h-3.5" />,
        tasks: [
          { id: 7, title: "Comunicado de boas-vindas enviado aos alunos", responsible: "Profa. Dra. Lucia Mendes", dueDate: "01/Mar", status: "done", priority: "high", category: "comunicacao" },
          { id: 8, title: "Instruções de acesso ao campus enviadas", responsible: "Profa. Dra. Lucia Mendes", dueDate: "05/Mar", status: "done", priority: "medium", category: "comunicacao" },
          { id: 9, title: "Lista de materiais necessários enviada", responsible: "Paula Neves", dueDate: "12/Mar", status: "in_progress", priority: "medium", category: "comunicacao" },
        ],
      },
      {
        id: "participantes",
        label: "Participantes",
        icon: <Users className="w-3.5 h-3.5" />,
        tasks: [
          { id: 10, title: "Lista de alunos confirmada e revisada", responsible: "Carla Barros", dueDate: "28/Fev", status: "done", priority: "high", category: "participantes" },
          { id: 11, title: "Documentação dos alunos recebida", responsible: "Carla Barros", dueDate: "05/Mar", status: "late", priority: "high", category: "participantes" },
        ],
      },
    ],
  },
  {
    id: "configuracao",
    label: "Configuração",
    icon: <Monitor className="w-4 h-4" />,
    description: "Ambiente digital e materiais didáticos",
    categories: [
      {
        id: "moodle",
        label: "Moodle",
        icon: <Monitor className="w-3.5 h-3.5" />,
        tasks: [
          { id: 12, title: "Ambiente Moodle da turma criado", responsible: "Paula Neves", dueDate: "01/Mar", status: "done", priority: "high", category: "moodle" },
          { id: 13, title: "Disciplinas e módulos configurados", responsible: "Paula Neves", dueDate: "10/Mar", status: "done", priority: "high", category: "moodle" },
          { id: 14, title: "Alunos matriculados no Moodle", responsible: "Paula Neves", dueDate: "15/Mar", status: "in_progress", priority: "high", category: "moodle" },
          { id: 15, title: "Conteúdo da Semana 1 publicado", responsible: "Paula Neves", dueDate: "18/Mar", status: "pending", priority: "high", category: "moodle" },
          { id: 16, title: "Fórum de dúvidas habilitado", responsible: "Paula Neves", dueDate: "18/Mar", status: "pending", priority: "medium", category: "moodle" },
          { id: 17, title: "Avaliações configuradas (pesos e prazos)", responsible: "Paula Neves", dueDate: "20/Mar", status: "pending", priority: "high", category: "moodle" },
        ],
      },
      {
        id: "horario",
        label: "Horários",
        icon: <Clock className="w-3.5 h-3.5" />,
        tasks: [
          { id: 18, title: "Horário oficial publicado no portal", responsible: "Rafael Torres", dueDate: "15/Mar", status: "in_progress", priority: "high", category: "horario", notes: "Aguardando confirmação de dois docentes" },
          { id: 19, title: "Horário enviado por e-mail aos alunos", responsible: "Carla Barros", dueDate: "17/Mar", status: "pending", priority: "high", category: "horario" },
          { id: 20, title: "Horário enviado ao corpo docente", responsible: "Profa. Dra. Ana Souza", dueDate: "17/Mar", status: "pending", priority: "high", category: "horario" },
        ],
      },
      {
        id: "materiais",
        label: "Materiais Didáticos",
        icon: <BookOpen className="w-3.5 h-3.5" />,
        tasks: [
          { id: 21, title: "Material dos professores recebido (Sem. 1–3)", responsible: "Paula Neves", dueDate: "12/Mar", status: "done", priority: "high", category: "materiais" },
          { id: 22, title: "Material dos professores recebido (Sem. 4–6)", responsible: "Paula Neves", dueDate: "26/Mar", status: "pending", priority: "high", category: "materiais" },
          { id: 23, title: "Apostila impressa preparada (se aplicável)", responsible: "Paula Neves", dueDate: "15/Mar", status: "na", priority: "medium", category: "materiais" },
          { id: 24, title: "Cases e leituras complementares enviados", responsible: "Paula Neves", dueDate: "18/Mar", status: "pending", priority: "medium", category: "materiais" },
        ],
      },
    ],
  },
  {
    id: "execucao",
    label: "Execução",
    icon: <RefreshCw className="w-4 h-4" />,
    description: "Acompanhamento durante o andamento do programa",
    categories: [
      {
        id: "presenca",
        label: "Presença & Frequência",
        icon: <CheckCheck className="w-3.5 h-3.5" />,
        tasks: [
          { id: 25, title: "Lista de presença Semana 1 registrada", responsible: "Carla Barros", dueDate: "Semanal", status: "done", priority: "high", category: "presenca" },
          { id: 26, title: "Lista de presença Semana 2 registrada", responsible: "Carla Barros", dueDate: "Semanal", status: "done", priority: "high", category: "presenca" },
          { id: 27, title: "Lista de presença Semana 3 registrada", responsible: "Carla Barros", dueDate: "Semanal", status: "pending", priority: "high", category: "presenca" },
          { id: 28, title: "Relatório de frequência parcial enviado", responsible: "Rafael Torres", dueDate: "31/Mar", status: "pending", priority: "medium", category: "presenca" },
        ],
      },
      {
        id: "feedback",
        label: "Feedback & Qualidade",
        icon: <MessageSquare className="w-3.5 h-3.5" />,
        tasks: [
          { id: 29, title: "NPS intermediário coletado", responsible: "Carla Barros", dueDate: "15/Abr", status: "pending", priority: "medium", category: "feedback" },
          { id: 30, title: "Resultado de NPS intermediário reportado", responsible: "Prof. Dr. Carlos Faria", dueDate: "20/Abr", status: "pending", priority: "medium", category: "feedback" },
          { id: 31, title: "Ajustes de conteúdo implementados (se necessário)", responsible: "Profa. Dra. Ana Souza", dueDate: "25/Abr", status: "pending", priority: "low", category: "feedback" },
        ],
      },
      {
        id: "conteudo_exec",
        label: "Conteúdo Contínuo",
        icon: <FileText className="w-3.5 h-3.5" />,
        tasks: [
          { id: 32, title: "Conteúdo semanas 7–10 publicado no Moodle", responsible: "Paula Neves", dueDate: "15/Abr", status: "pending", priority: "high", category: "conteudo_exec" },
          { id: 33, title: "Material adicional dos professores coletado", responsible: "Paula Neves", dueDate: "10/Abr", status: "pending", priority: "medium", category: "conteudo_exec" },
        ],
      },
    ],
  },
  {
    id: "encerramento",
    label: "Encerramento",
    icon: <Award className="w-4 h-4" />,
    description: "Finalização, avaliações e encerramento da turma",
    categories: [
      {
        id: "avaliacoes",
        label: "Avaliações Finais",
        icon: <ClipboardList className="w-3.5 h-3.5" />,
        tasks: [
          { id: 34, title: "NPS final coletado", responsible: "Carla Barros", dueDate: "10/Nov", status: "pending", priority: "high", category: "avaliacoes" },
          { id: 35, title: "Avaliação dos docentes coletada", responsible: "Carla Barros", dueDate: "10/Nov", status: "pending", priority: "high", category: "avaliacoes" },
          { id: 36, title: "Notas lançadas no sistema", responsible: "Profa. Dra. Ana Souza", dueDate: "20/Nov", status: "pending", priority: "high", category: "avaliacoes" },
        ],
      },
      {
        id: "certificados",
        label: "Certificados",
        icon: <Award className="w-3.5 h-3.5" />,
        tasks: [
          { id: 37, title: "Lista de aprovados gerada e revisada", responsible: "Carla Barros", dueDate: "25/Nov", status: "pending", priority: "high", category: "certificados" },
          { id: 38, title: "Certificados emitidos e enviados", responsible: "Carla Barros", dueDate: "30/Nov", status: "pending", priority: "high", category: "certificados" },
          { id: 39, title: "Evento de encerramento realizado", responsible: "Profa. Dra. Lucia Mendes", dueDate: "28/Nov", status: "pending", priority: "medium", category: "certificados" },
        ],
      },
      {
        id: "encerramento_fin",
        label: "Fechamento Final",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        tasks: [
          { id: 40, title: "Moodle arquivado e fechado para edição", responsible: "Paula Neves", dueDate: "05/Dez", status: "pending", priority: "medium", category: "encerramento_fin" },
          { id: 41, title: "Relatório final da turma entregue à diretoria", responsible: "Prof. Dr. Carlos Faria", dueDate: "10/Dez", status: "pending", priority: "high", category: "encerramento_fin" },
          { id: 42, title: "Documentação arquivada no sistema", responsible: "Rafael Torres", dueDate: "15/Dez", status: "pending", priority: "medium", category: "encerramento_fin" },
        ],
      },
    ],
  },
];

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: React.ReactNode; class: string; badgeClass: string }> = {
  pending: {
    label: "Pendente",
    icon: <Circle className="w-4 h-4" />,
    class: "text-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
  in_progress: {
    label: "Em andamento",
    icon: <RefreshCw className="w-4 h-4" />,
    class: "text-primary",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
  },
  done: {
    label: "Concluído",
    icon: <CheckCircle2 className="w-4 h-4" />,
    class: "text-success",
    badgeClass: "bg-success/10 text-success border-success/20",
  },
  late: {
    label: "Atrasado",
    icon: <AlertCircle className="w-4 h-4" />,
    class: "text-destructive",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
  },
  na: {
    label: "N/A",
    icon: <MinusCircle className="w-4 h-4" />,
    class: "text-muted-foreground/50",
    badgeClass: "bg-muted/50 text-muted-foreground/60 border-border/50",
  },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; dotClass: string }> = {
  high: { label: "Alta", dotClass: "bg-destructive" },
  medium: { label: "Média", dotClass: "bg-warning" },
  low: { label: "Baixa", dotClass: "bg-muted-foreground" },
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function computePhaseStats(phase: CPanelPhase) {
  const allTasks = phase.categories.flatMap((c) => c.tasks);
  const total = allTasks.filter((t) => t.status !== "na").length;
  const done = allTasks.filter((t) => t.status === "done").length;
  const late = allTasks.filter((t) => t.status === "late").length;
  const pending = allTasks.filter((t) => t.status === "pending").length;
  const inProgress = allTasks.filter((t) => t.status === "in_progress").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, late, pending, inProgress, pct };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ pct, late }: { pct: number; late: boolean }) {
  return (
    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-500", late ? "bg-destructive" : pct === 100 ? "bg-success" : "bg-primary")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StatusCycle({ status, onChange }: { status: TaskStatus; onChange: (s: TaskStatus) => void }) {
  const order: TaskStatus[] = ["pending", "in_progress", "done", "late", "na"];
  const next = () => {
    const idx = order.indexOf(status);
    onChange(order[(idx + 1) % order.length]);
  };
  const cfg = STATUS_CONFIG[status];
  return (
    <button
      type="button"
      onClick={next}
      title={`Status: ${cfg.label} — clique para alterar`}
      className={cn("flex-shrink-0 transition-colors hover:opacity-70", cfg.class)}
    >
      {cfg.icon}
    </button>
  );
}

function TaskStatusIcon({ status }: { status: TaskStatus }) {
  const cfg = STATUS_CONFIG[status];
  return <span className={cn("shrink-0", cfg.class)}>{cfg.icon}</span>;
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn("text-xs px-1.5 py-0.5 rounded-full border font-medium whitespace-nowrap", cfg.badgeClass)}>
      {cfg.label}
    </span>
  );
}

function TaskRow({ task, onStatusChange }: { task: CPanelTask; onStatusChange: (id: number, s: TaskStatus) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(task.notes || "");
  const cfg = STATUS_CONFIG[task.status];
  const prio = PRIORITY_CONFIG[task.priority];

  return (
    <div className={cn(
      "group border-b border-border/60 last:border-0 transition-colors",
      task.status === "done" ? "opacity-60 hover:opacity-80" : "hover:bg-muted/20"
    )}>
      <div className="flex items-start gap-3 px-4 py-3">
        <StatusCycle status={task.status} onChange={(s) => onStatusChange(task.id, s)} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <p className={cn(
              "text-sm font-medium leading-snug flex-1 min-w-0",
              task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"
            )}>
              {task.title}
            </p>
            <span className={cn("text-xs px-1.5 py-0.5 rounded border font-medium whitespace-nowrap shrink-0", cfg.badgeClass)}>
              {cfg.label}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="w-3 h-3" /> {task.responsible}
            </span>
            <span className={cn(
              "flex items-center gap-1 text-xs",
              task.status === "late" ? "text-destructive font-medium" : "text-muted-foreground"
            )}>
              <Calendar className="w-3 h-3" /> {task.dueDate}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className={cn("w-1.5 h-1.5 rounded-full", prio.dotClass)} />
              {prio.label}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-3 pl-11">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> Observações
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Adicione observações, links ou contexto..."
            className="w-full text-xs bg-muted/40 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-muted-foreground/60"
          />
        </div>
      )}
    </div>
  );
}

function CategoryBlock({
  category,
  tasks,
  onStatusChange,
}: {
  category: CPanelPhase["categories"][number];
  tasks: CPanelTask[];
  onStatusChange: (id: number, s: TaskStatus) => void;
}) {
  const [open, setOpen] = useState(true);
  const done = tasks.filter((t) => t.status === "done").length;
  const valid = tasks.filter((t) => t.status !== "na").length;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{category.icon}</span>
          <span className="text-sm font-semibold text-foreground">{category.label}</span>
          <span className="text-xs text-muted-foreground">({done}/{valid})</span>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      {open && (
        <div className="bg-card">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onStatusChange={onStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TurmaCPanelPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    turmaName?: string;
    programName?: string;
    siglaTurma?: string;
    deliveryDays?: { label: string; date: string }[];
  } | null;

  const turmaName = state?.turmaName || "Turma A 2024";
  const programName = state?.programName || "MBA Executivo";
  const siglaTurma = state?.siglaTurma || "T24A";
  const deliveryDays = state?.deliveryDays ?? null;

  const [phases, setPhases] = useState<CPanelPhase[]>(CPANEL_PHASES);
  const [activePhase, setActivePhase] = useState("pre_abertura");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [mobilePhaseOpen, setMobilePhaseOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"phases" | "days">(deliveryDays && deliveryDays.length > 0 ? "days" : "phases");
  const [addDayOpen, setAddDayOpen] = useState(false);
  const [newDayLabel, setNewDayLabel] = useState("");
  const [newDayDate, setNewDayDate] = useState("");

  const handleStatusChange = (taskId: number, newStatus: TaskStatus) => {
    setPhases((prev) =>
      prev.map((phase) => ({
        ...phase,
        categories: phase.categories.map((cat) => ({
          ...cat,
          tasks: cat.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
        })),
      }))
    );
  };

  // Aggregated stats across all phases
  const allTasks = phases.flatMap((p) => p.categories.flatMap((c) => c.tasks));
  const totalValid = allTasks.filter((t) => t.status !== "na").length;
  const totalDone = allTasks.filter((t) => t.status === "done").length;
  const totalLate = allTasks.filter((t) => t.status === "late").length;
  const totalPending = allTasks.filter((t) => t.status === "pending").length;
  const totalInProgress = allTasks.filter((t) => t.status === "in_progress").length;
  const globalPct = totalValid > 0 ? Math.round((totalDone / totalValid) * 100) : 0;

  const currentPhase = phases.find((p) => p.id === activePhase)!;
  const phaseStats = computePhaseStats(currentPhase);

  // Apply filter to current phase tasks
  const filteredPhase: CPanelPhase = {
    ...currentPhase,
    categories: currentPhase.categories.map((cat) => ({
      ...cat,
      tasks: filterStatus === "all" ? cat.tasks : cat.tasks.filter((t) => t.status === filterStatus),
    })).filter((cat) => cat.tasks.length > 0 || filterStatus === "all"),
  };

  const summaryStats = [
    { label: "Total de Tarefas", value: totalValid, icon: <ClipboardList className="w-4 h-4" />, textColor: "text-primary" },
    { label: "Concluídas", value: totalDone, icon: <CheckCircle2 className="w-4 h-4" />, textColor: "text-success" },
    { label: "Em Andamento", value: totalInProgress, icon: <RefreshCw className="w-4 h-4" />, textColor: "text-primary" },
    { label: "Atrasadas", value: totalLate, icon: <AlertTriangle className="w-4 h-4" />, textColor: "text-destructive" },
    { label: "Pendentes", value: totalPending, icon: <Clock className="w-4 h-4" />, textColor: "text-warning" },
  ];

  const buildDayPackage = (d: { label: string; date: string }, i: number) => ({
        id: `dia${i + 1}`,
        label: d.label,
        date: d.date,
        deliveries: [
          {
            category: "Grade Acadêmica",
            tasks: [
              { id: (i + 1) * 100 + 1, title: `Plano de aulas do ${d.label} entregue`, responsible: "—", dueDate: "—", status: "pending" as TaskStatus, priority: "high" as TaskPriority, category: "grade" },
            ],
          },
          {
            category: "Moodle",
            tasks: [
              { id: (i + 1) * 100 + 2, title: `Materiais do ${d.label} publicados no Moodle`, responsible: "—", dueDate: "—", status: "pending" as TaskStatus, priority: "high" as TaskPriority, category: "moodle" },
            ],
          },
          {
            category: "Logística",
            tasks: [
              { id: (i + 1) * 100 + 3, title: `Sala e equipamentos do ${d.label} verificados`, responsible: "—", dueDate: "—", status: "pending" as TaskStatus, priority: "medium" as TaskPriority, category: "logistica" },
            ],
          },
        ],
      });

  const [dayPackages, setDayPackages] = useState(() =>
    deliveryDays && deliveryDays.length > 0
    ? deliveryDays.map((d, i) => ({
        id: `dia${i + 1}`,
        label: d.label,
        date: d.date,
        deliveries: [
          {
            category: "Grade Acadêmica",
            tasks: [
              { id: (i + 1) * 100 + 1, title: `Plano de aulas do ${d.label} entregue`, responsible: "—", dueDate: "—", status: "pending" as TaskStatus, priority: "high" as TaskPriority, category: "grade" },
            ],
          },
          {
            category: "Moodle",
            tasks: [
              { id: (i + 1) * 100 + 2, title: `Materiais do ${d.label} publicados no Moodle`, responsible: "—", dueDate: "—", status: "pending" as TaskStatus, priority: "high" as TaskPriority, category: "moodle" },
            ],
          },
          {
            category: "Logística",
            tasks: [
              { id: (i + 1) * 100 + 3, title: `Sala e equipamentos do ${d.label} verificados`, responsible: "—", dueDate: "—", status: "pending" as TaskStatus, priority: "medium" as TaskPriority, category: "logistica" },
            ],
          },
        ],
      }))
    : [
    {
      id: "dia1", label: "Dia 1", date: "15/Mar (Sex)", deliveries: [
        { category: "Grade Acadêmica", tasks: [
            { id: 101, title: "Outline aprovado", responsible: "Dr. Carlos Faria", dueDate: "10/Mar", status: "done" as TaskStatus, priority: "high" as TaskPriority, category: "grade" },
            { id: 102, title: "Plano de aulas entregue", responsible: "Dr. Carlos Faria", dueDate: "13/Mar", status: "late" as TaskStatus, priority: "high" as TaskPriority, category: "grade" },
        ]},
        { category: "Moodle", tasks: [
            { id: 103, title: "Materiais do Dia 1 publicados no Moodle", responsible: "Paula Neves", dueDate: "14/Mar", status: "in_progress" as TaskStatus, priority: "high" as TaskPriority, category: "moodle" },
        ]},
        { category: "Logística", tasks: [
            { id: 104, title: "Coffee break confirmado com fornecedor", responsible: "Rafael Torres", dueDate: "12/Mar", status: "done" as TaskStatus, priority: "medium" as TaskPriority, category: "logistica" },
            { id: 105, title: "Sala 201 checada e equipamentos OK", responsible: "Rafael Torres", dueDate: "14/Mar", status: "pending" as TaskStatus, priority: "high" as TaskPriority, category: "logistica" },
        ]},
      ],
    },
    {
      id: "dia2", label: "Dia 2", date: "22/Mar (Sex)", deliveries: [
        { category: "Grade Acadêmica", tasks: [
            { id: 201, title: "Confirmação de docente do Dia 2", responsible: "Profa. Ana Souza", dueDate: "18/Mar", status: "done" as TaskStatus, priority: "high" as TaskPriority, category: "grade" },
        ]},
        { category: "Moodle", tasks: [
            { id: 202, title: "Materiais do Dia 2 publicados no Moodle", responsible: "Paula Neves", dueDate: "21/Mar", status: "pending" as TaskStatus, priority: "high" as TaskPriority, category: "moodle" },
        ]},
        { category: "Logística", tasks: [
            { id: 203, title: "Almoço reservado para 22/Mar", responsible: "Rafael Torres", dueDate: "19/Mar", status: "pending" as TaskStatus, priority: "medium" as TaskPriority, category: "logistica" },
        ]},
      ],
    },
    {
      id: "dia3", label: "Dia 3", date: "29/Mar (Sex)", deliveries: [
        { category: "Grade Acadêmica", tasks: [
            { id: 301, title: "Avaliação final entregue pelo docente", responsible: "Dr. Pedro Costa", dueDate: "25/Mar", status: "pending" as TaskStatus, priority: "high" as TaskPriority, category: "grade" },
        ]},
        { category: "Encerramento", tasks: [
            { id: 302, title: "Certificados preparados para emissão", responsible: "Ana Coord.", dueDate: "28/Mar", status: "pending" as TaskStatus, priority: "medium" as TaskPriority, category: "encerramento" },
            { id: 303, title: "Avaliação de satisfação configurada", responsible: "Ana Coord.", dueDate: "28/Mar", status: "pending" as TaskStatus, priority: "medium" as TaskPriority, category: "encerramento" },
        ]},
      ],
    },
  ]);

  return (
    <AppLayout pageTitle="cPanel" pageSubtitle={`${programName} · ${siglaTurma}`}>
      <div className="p-4 md:p-6 space-y-5 animate-fade-in">
        {/* Breadcrumb & header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <button
              onClick={() => navigate("/programs")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ChevronLeft className="w-4 h-4" /> Programas
            </button>
            <div className="flex items-center gap-2 flex-wrap">
              <ClipboardList className="w-4 h-4 text-primary shrink-0" />
              <div>
                <h1 className="font-display font-bold text-foreground text-lg leading-tight">
                  cPanel — {turmaName}
                </h1>
                <p className="text-muted-foreground text-sm">{programName} · Painel de Tarefas e Entregas</p>
              </div>
            </div>
          </div>

          {/* Overall progress */}
          <div className="bg-card border border-border rounded-xl px-4 py-3 min-w-[180px]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground">Progresso geral</span>
              <span className={cn(
                "text-sm font-bold",
                globalPct === 100 ? "text-success" : totalLate > 0 ? "text-destructive" : "text-primary"
              )}>
                {globalPct}%
              </span>
            </div>
            <ProgressBar pct={globalPct} late={totalLate > 0 && globalPct < 100} />
            <p className="text-xs text-muted-foreground mt-1">{totalDone} de {totalValid} tarefas</p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {summaryStats.map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
              <span className={cn("shrink-0", s.textColor)}>
                {s.icon}
              </span>
              <div className="min-w-0">
                <p className="text-lg font-bold text-foreground leading-none">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Late tasks alert */}
        {totalLate > 0 && (
          <div className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive">
                {totalLate} {totalLate === 1 ? "tarefa atrasada" : "tarefas atrasadas"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Verifique os itens marcados como atrasados e acione os responsáveis.
              </p>
            </div>
            <button
              onClick={() => setFilterStatus("late")}
              className="ml-auto text-xs font-semibold text-destructive hover:underline whitespace-nowrap shrink-0"
            >
              Ver atrasadas
            </button>
          </div>
        )}

        {/* Main content: phase nav + tasks */}
        {/* View mode toggle */}
        <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-1 w-fit">
          <button type="button" onClick={() => setViewMode("phases")}
            className={cn("text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5",
              viewMode === "phases" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            <Layers className="w-3.5 h-3.5" />Por Fase
          </button>
          <button type="button" onClick={() => setViewMode("days")}
            className={cn("text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5",
              viewMode === "days" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            <Calendar className="w-3.5 h-3.5" />Por Dia de Aula
          </button>
        </div>

        {/* Day packages view */}
        {viewMode === "days" && (
          <div className="space-y-4">
            {dayPackages.map((pkg) => {
              const pkgTasks = pkg.deliveries.flatMap((d) => d.tasks);
              const pkgDone = pkgTasks.filter((t) => t.status === "done").length;
              const pkgLate = pkgTasks.filter((t) => t.status === "late").length;
              const pkgPct = pkgTasks.length > 0 ? Math.round((pkgDone / pkgTasks.length) * 100) : 0;
              return (
                <div key={pkg.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{pkg.label}</p>
                        <p className="text-xs text-muted-foreground">{pkg.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {pkgLate > 0 && (
                        <span className="text-xs bg-destructive/10 text-destructive border border-destructive/20 px-1.5 py-0.5 rounded-full font-medium">
                          {pkgLate} atrasada{pkgLate > 1 ? "s" : ""}
                        </span>
                      )}
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{pkgDone}/{pkgTasks.length} tarefas</p>
                        <ProgressBar pct={pkgPct} late={pkgLate > 0} />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {pkg.deliveries.map((delivery) => (
                      <div key={delivery.category}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{delivery.category}</p>
                        <div className="space-y-1.5">
                          {delivery.tasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-muted/30 transition-colors">
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <TaskStatusIcon status={task.status} />
                                <span className={cn("text-xs font-medium", task.status === "done" ? "line-through text-muted-foreground" : "text-foreground")}>
                                  {task.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                                  <User className="w-3 h-3" />{task.responsible}
                                </span>
                                <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                                <StatusBadge status={task.status} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Add Day */}
            {addDayOpen ? (
              <div className="bg-card border border-dashed border-primary/40 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-foreground">Adicionar Dia de Aula</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                    <label className="text-xs text-muted-foreground font-medium">Rótulo</label>
                    <input
                      type="text"
                      placeholder="ex: Dia 4"
                      value={newDayLabel}
                      onChange={(e) => setNewDayLabel(e.target.value)}
                      className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                    <label className="text-xs text-muted-foreground font-medium">Data</label>
                    <input
                      type="text"
                      placeholder="ex: 15/Abr (Ter)"
                      value={newDayDate}
                      onChange={(e) => setNewDayDate(e.target.value)}
                      className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => { setAddDayOpen(false); setNewDayLabel(""); setNewDayDate(""); }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!newDayLabel.trim()}
                    onClick={() => {
                      setDayPackages((prev) => [
                        ...prev,
                        buildDayPackage({ label: newDayLabel.trim(), date: newDayDate.trim() || "—" }, prev.length),
                      ]);
                      setAddDayOpen(false);
                      setNewDayLabel("");
                      setNewDayDate("");
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddDayOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Adicionar Dia
              </button>
            )}
          </div>
        )}

        {viewMode === "phases" && <div className="flex gap-5 items-start">
          {/* Phase sidebar — desktop */}
          <nav className="hidden lg:flex flex-col gap-1 w-52 shrink-0 sticky top-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-1">Fases</p>
            {phases.map((phase) => {
              const stats = computePhaseStats(phase);
              const isActive = phase.id === activePhase;
              return (
                <button
                  key={phase.id}
                  type="button"
                  onClick={() => { setActivePhase(phase.id); setFilterStatus("all"); }}
                  className={cn(
                    "flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                  )}
                >
                  <span className="mt-0.5 shrink-0">{phase.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{phase.label}</p>
                    <div className="mt-1.5">
                      <ProgressBar pct={stats.pct} late={stats.late > 0} />
                    </div>
                    <p className="text-xs mt-1 opacity-70">{stats.done}/{stats.total}</p>
                  </div>
                  {stats.late > 0 && (
                    <span className="shrink-0 w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
                      <span className="text-[9px] font-bold text-destructive-foreground">{stats.late}</span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Phase dropdown — mobile */}
          <div className="lg:hidden w-full">
            <button
              type="button"
              onClick={() => setMobilePhaseOpen(!mobilePhaseOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl"
            >
              <div className="flex items-center gap-2">
                <span className="text-primary">{currentPhase.icon}</span>
                <span className="text-sm font-semibold text-foreground">{currentPhase.label}</span>
                <span className="text-xs text-muted-foreground">({phaseStats.done}/{phaseStats.total})</span>
              </div>
              {mobilePhaseOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {mobilePhaseOpen && (
              <div className="mt-1 bg-card border border-border rounded-xl overflow-hidden shadow-md">
                {phases.map((phase) => {
                  const stats = computePhaseStats(phase);
                  return (
                    <button
                      key={phase.id}
                      type="button"
                      onClick={() => { setActivePhase(phase.id); setFilterStatus("all"); setMobilePhaseOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left border-b border-border last:border-0 transition-colors",
                        phase.id === activePhase ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      )}
                    >
                      <span>{phase.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{phase.label}</p>
                        <ProgressBar pct={stats.pct} late={stats.late > 0} />
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{stats.done}/{stats.total}</span>
                      {stats.late > 0 && <span className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center text-[10px] font-bold text-destructive-foreground">{stats.late}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tasks area */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Phase header + filter */}
            <div className="bg-card border border-border rounded-xl px-4 py-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary">{currentPhase.icon}</span>
                    <h2 className="font-display font-bold text-foreground">{currentPhase.label}</h2>
                    {phaseStats.late > 0 && (
                      <span className="text-xs bg-destructive/10 text-destructive border border-destructive/20 px-1.5 py-0.5 rounded-full font-medium">
                        {phaseStats.late} atrasada{phaseStats.late > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{currentPhase.description}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Filter className="w-3 h-3" /> Filtrar:
                  </span>
                  {([
                    { key: "all", label: "Todas" },
                    { key: "pending", label: "Pendentes" },
                    { key: "in_progress", label: "Em andamento" },
                    { key: "done", label: "Concluídas" },
                    { key: "late", label: "Atrasadas" },
                  ] as const).map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFilterStatus(f.key)}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-lg border font-medium transition-all",
                        filterStatus === f.key
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:border-primary/40"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phase progress bar */}
              <div className="mt-3 flex items-center gap-3">
                <ProgressBar pct={phaseStats.pct} late={phaseStats.late > 0} />
                <span className="text-xs text-muted-foreground shrink-0">
                  {phaseStats.pct}% completo
                </span>
              </div>
            </div>

            {/* Categories + tasks */}
            {filteredPhase.categories.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <CheckCircle2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nenhuma tarefa encontrada para o filtro selecionado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPhase.categories.map((cat) => (
                  <CategoryBlock
                    key={cat.id}
                    category={cat}
                    tasks={cat.tasks}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </div>
        </div>}
      </div>
    </AppLayout>
  );
}
