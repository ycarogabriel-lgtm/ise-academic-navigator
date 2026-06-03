import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  Filter,
  X,
  ChevronDown,
  Plus,
  Paperclip,
  MessageSquare,
  History,
  Link2,
  User,
  Users,
  ChevronRight,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type TaskStatus = "overdue" | "upcoming" | "pending" | "completed";
type TaskPriority = "high" | "medium" | "low";

interface TaskComment {
  author: string;
  role: string;
  text: string;
  date: string;
}

interface TaskHistory {
  user: string;
  action: string;
  date: string;
}

interface TaskAttachment {
  name: string;
  type: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  program: string;
  turma: string;
  responsible: string;
  role: string;
  team: string[];
  deadline: string;
  status: TaskStatus;
  priority: TaskPriority;
  dependencies: string[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  history: TaskHistory[];
  relatedLinks: { label: string; url: string }[];
  createdAt: string;
  updatedAt: string;
}

// ── Static data ───────────────────────────────────────────────────────────────

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Resolver conflito de sala — Prof. Ana Silva",
    description:
      "Prof. Ana com 2 atividades sobrepostas no dia 15/03. Realocar sala ou horário para eliminar sobreposição. Verificar disponibilidade de salas alternativas no mesmo período.",
    program: "MBA Executivo",
    turma: "MBA-2026-T1",
    responsible: "Camila Rocha",
    role: "Diretora Acadêmica",
    team: ["Camila Rocha", "André Martins"],
    deadline: "12/03/2026",
    status: "overdue",
    priority: "high",
    dependencies: [],
    attachments: [
      { name: "Grade_MBA2026T1.pdf", type: "pdf" },
      { name: "Mapa_Salas_Mar.xlsx", type: "xlsx" },
    ],
    comments: [
      {
        author: "André Martins",
        role: "Coordenador",
        text: "Identifiquei a Sala B-204 disponível no horário. Podemos realocar para lá.",
        date: "10/03/2026 às 14h22",
      },
    ],
    history: [
      { user: "Sistema", action: "Tarefa criada automaticamente após conflito detectado", date: "09/03/2026 10:00" },
      { user: "Camila Rocha", action: "Status alterado de Pendente para Atrasada", date: "12/03/2026 08:00" },
    ],
    relatedLinks: [
      { label: "Grade de Horários MBA-2026-T1", url: "/schedule" },
      { label: "Mapa de Ocupação", url: "/occupancy" },
    ],
    createdAt: "09/03/2026",
    updatedAt: "12/03/2026",
  },
  {
    id: 2,
    title: "Definir professores para sessões ainda sem alocação",
    description:
      "Há sessões na grade do curso de Gestão de Projetos sem professores alocados. Identificar docentes disponíveis e confirmar participação.",
    program: "MBA Executivo",
    turma: "Gestão de Projetos",
    responsible: "Camila Rocha",
    role: "Diretora Acadêmica",
    team: ["Camila Rocha"],
    deadline: "08/03/2026",
    status: "overdue",
    priority: "high",
    dependencies: ["Aprovação da grade final"],
    attachments: [{ name: "Sessoes_sem_alocacao.xlsx", type: "xlsx" }],
    comments: [],
    history: [
      { user: "Sistema", action: "Tarefa criada a partir do fluxo de revisão de grade", date: "05/03/2026 09:00" },
    ],
    relatedLinks: [{ label: "Sessões", url: "/sessions" }],
    createdAt: "05/03/2026",
    updatedAt: "08/03/2026",
  },
  {
    id: 3,
    title: "Revisar outlines pendentes",
    description:
      "Existem outlines de disciplinas que ainda não foram revisados e aprovados para o semestre de 2026. Revisar e aprovar ou solicitar ajustes.",
    program: "Data Science",
    turma: "DS-2026-T1",
    responsible: "Camila Rocha",
    role: "Diretora Acadêmica",
    team: ["Camila Rocha", "Beatriz Santos"],
    deadline: "12/03/2026",
    status: "overdue",
    priority: "medium",
    dependencies: [],
    attachments: [{ name: "Outlines_DS2026.zip", type: "zip" }],
    comments: [
      {
        author: "Beatriz Santos",
        role: "Analista Acadêmica",
        text: "Enviei os outlines revisados para aprovação. Aguardando retorno.",
        date: "11/03/2026 às 16h45",
      },
    ],
    history: [
      { user: "Sistema", action: "Tarefa criada a partir da abertura do semestre", date: "01/03/2026 08:00" },
    ],
    relatedLinks: [],
    createdAt: "01/03/2026",
    updatedAt: "11/03/2026",
  },
  {
    id: 4,
    title: "Confirmar carga horária total da turma",
    description:
      "Verificar e confirmar se a carga horária total da turma T1-2026 está de acordo com o planejamento curricular aprovado.",
    program: "MBA Executivo em Gestão",
    turma: "T1-2026",
    responsible: "Camila Rocha",
    role: "Diretora Acadêmica",
    team: ["Camila Rocha"],
    deadline: "27/03/2026",
    status: "upcoming",
    priority: "medium",
    dependencies: ["Revisão de outlines pendentes"],
    attachments: [],
    comments: [],
    history: [
      { user: "Sistema", action: "Tarefa criada automaticamente", date: "15/03/2026 08:00" },
    ],
    relatedLinks: [{ label: "Programas e turmas", url: "/programs" }],
    createdAt: "15/03/2026",
    updatedAt: "15/03/2026",
  },
  {
    id: 5,
    title: "Enviar confirmação de presença aos professores",
    description:
      "Enviar e-mail de confirmação de presença para todos os professores do programa Liderança Estratégica antes do início das aulas.",
    program: "Liderança Estratégica",
    turma: "LID-2026-T1",
    responsible: "Camila Rocha",
    role: "Diretora Acadêmica",
    team: ["Camila Rocha", "André Martins"],
    deadline: "12/03/2026",
    status: "pending",
    priority: "medium",
    dependencies: [],
    attachments: [],
    comments: [],
    history: [
      { user: "Sistema", action: "Tarefa criada a partir do fechamento do programa", date: "08/03/2026 10:00" },
    ],
    relatedLinks: [{ label: "Professores", url: "/people" }],
    createdAt: "08/03/2026",
    updatedAt: "08/03/2026",
  },
  {
    id: 6,
    title: "Validar material didático das sessões",
    description:
      "Confirmar que todo material didático para as sessões do MBA Executivo T1-2026 está disponível e atualizado na plataforma.",
    program: "MBA Executivo",
    turma: "MBA-2026-T1",
    responsible: "Camila Rocha",
    role: "Diretora Acadêmica",
    team: ["Camila Rocha"],
    deadline: "15/03/2026",
    status: "pending",
    priority: "low",
    dependencies: ["Revisar outlines pendentes"],
    attachments: [],
    comments: [],
    history: [
      { user: "Sistema", action: "Tarefa criada automaticamente", date: "10/03/2026 08:00" },
    ],
    relatedLinks: [],
    createdAt: "10/03/2026",
    updatedAt: "10/03/2026",
  },
  {
    id: 7,
    title: "Atualizar lista de alunos matriculados",
    description:
      "Atualizar a lista de alunos matriculados no sistema para o Data Science DS-2026-T1 com os dados do processo seletivo.",
    program: "Data Science",
    turma: "DS-2026-T1",
    responsible: "Camila Rocha",
    role: "Diretora Acadêmica",
    team: ["Camila Rocha"],
    deadline: "15/03/2026",
    status: "pending",
    priority: "low",
    dependencies: [],
    attachments: [{ name: "Lista_Alunos_DS2026T1.xlsx", type: "xlsx" }],
    comments: [],
    history: [
      { user: "Sistema", action: "Tarefa criada manualmente", date: "10/03/2026 09:00" },
    ],
    relatedLinks: [],
    createdAt: "10/03/2026",
    updatedAt: "10/03/2026",
  },
  {
    id: 8,
    title: "Publicar horário oficial do programa",
    description:
      "Publicar o horário oficial do programa Liderança Estratégica para os alunos e professores após aprovação final.",
    program: "Liderança Estratégica",
    turma: "LID-2026-T1",
    responsible: "Camila Rocha",
    role: "Diretora Acadêmica",
    team: ["Camila Rocha", "Beatriz Santos"],
    deadline: "11/03/2026",
    status: "completed",
    priority: "high",
    dependencies: [],
    attachments: [{ name: "Horario_Lideranca_Oficial.pdf", type: "pdf" }],
    comments: [
      {
        author: "Camila Rocha",
        role: "Diretora Acadêmica",
        text: "Horário publicado com sucesso na plataforma e enviado por e-mail.",
        date: "11/03/2026 às 10h30",
      },
    ],
    history: [
      { user: "Camila Rocha", action: "Status alterado para Concluída", date: "11/03/2026 10:30" },
    ],
    relatedLinks: [{ label: "Horário Oficial", url: "/schedule" }],
    createdAt: "05/03/2026",
    updatedAt: "11/03/2026",
  },
  {
    id: 9,
    title: "Aprovar reserva de salas para o MBA T1-2026",
    description:
      "Revisar e aprovar as pré-reservas de salas para todas as sessões do MBA Executivo T1-2026.",
    program: "MBA Executivo",
    turma: "MBA-2026-T1",
    responsible: "Camila Rocha",
    role: "Diretora Acadêmica",
    team: ["Camila Rocha"],
    deadline: "11/03/2026",
    status: "completed",
    priority: "medium",
    dependencies: [],
    attachments: [],
    comments: [],
    history: [
      { user: "Camila Rocha", action: "Status alterado para Concluída", date: "11/03/2026 09:15" },
    ],
    relatedLinks: [{ label: "Pré-Reservas", url: "/reservations" }],
    createdAt: "04/03/2026",
    updatedAt: "11/03/2026",
  },
];

const programOptions = ["Todos os programas", "MBA Executivo", "Data Science", "Liderança Estratégica", "MBA Executivo em Gestão"];
const turmaOptions = ["Todas as turmas", "MBA-2026-T1", "DS-2026-T1", "LID-2026-T1", "T1-2026", "Gestão de Projetos"];
const responsibleOptions = ["Apenas as minhas", "Todos os responsáveis", "Camila Rocha", "André Martins", "Beatriz Santos"];

// ── Config maps ───────────────────────────────────────────────────────────────

const statusConfig: Record<TaskStatus, { label: string; badgeClass: string; dotClass: string; icon: React.ComponentType<{ className?: string }> }> = {
  overdue: {
    label: "Atrasada",
    badgeClass: "bg-destructive/10 text-destructive border border-destructive/20",
    dotClass: "bg-destructive",
    icon: AlertTriangle,
  },
  upcoming: {
    label: "Próxima do prazo",
    badgeClass: "bg-warning/10 text-warning border border-warning/20",
    dotClass: "bg-warning",
    icon: Clock,
  },
  pending: {
    label: "Pendente",
    badgeClass: "bg-primary/10 text-primary border border-primary/20",
    dotClass: "bg-primary",
    icon: Clock,
  },
  completed: {
    label: "Concluído",
    badgeClass: "bg-success/10 text-success border border-success/20",
    dotClass: "bg-success",
    icon: CheckCircle2,
  },
};

const priorityConfig: Record<TaskPriority, { label: string; class: string }> = {
  high: { label: "Alta", class: "text-destructive" },
  medium: { label: "Média", class: "text-warning" },
  low: { label: "Baixa", class: "text-muted-foreground" },
};

type TabFilter = "all" | TaskStatus;

const tabOptions: { key: TabFilter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendentes" },
  { key: "completed", label: "Concluídas" },
  { key: "upcoming", label: "Próximas do prazo" },
  { key: "overdue", label: "Atrasadas" },
];

// ── Task Detail Panel ─────────────────────────────────────────────────────────

function TaskDetailPanel({ task, onClose, onStatusChange }: { task: Task; onClose: () => void; onStatusChange: (id: number, status: TaskStatus) => void }) {
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<TaskComment[]>(task.comments);
  const isConflict = task.title.toLowerCase().includes("conflito");
  const cfg = statusConfig[task.status];
  const pri = priorityConfig[task.priority];

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: TaskComment = {
      author: "Camila Rocha",
      role: "Diretora Acadêmica",
      text: newComment.trim(),
      date: new Date().toLocaleDateString("pt-BR") + " às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) + "h",
    };
    setComments([...comments, comment]);
    setNewComment("");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-card w-full max-w-xl h-full overflow-y-auto shadow-2xl border-l border-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  "text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap",
                  cfg.badgeClass,
                )}
              >
                {cfg.label}
              </span>
              <span className={cn("text-xs font-medium", pri.class)}>
                Prioridade {pri.label}
              </span>
            </div>
            <h2 className={cn("font-display font-bold text-base text-foreground leading-snug", task.status === "completed" && "line-through text-muted-foreground")}>
              {task.title}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Criada em {task.createdAt} · Atualizada em {task.updatedAt}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Descrição */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Descrição</h3>
            <p className="text-sm text-foreground leading-relaxed">{task.description}</p>
          </section>

          {/* Metadados */}
          <section className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Programa / Turma</p>
              <p className="text-sm text-foreground">{task.program}</p>
              <p className="text-xs text-muted-foreground">{task.turma}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Prazo</p>
              <p className={cn("text-sm font-medium", (task.status === "overdue") ? "text-destructive" : "text-foreground")}>
                {task.deadline}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                <User className="w-3 h-3 inline mr-1" />
                Responsável
              </p>
              <p className="text-sm text-foreground">{task.responsible}</p>
              <p className="text-xs text-muted-foreground">{task.role}</p>
            </div>
            {task.team.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  <Users className="w-3 h-3 inline mr-1" />
                  Equipe
                </p>
                <div className="flex flex-wrap gap-1">
                  {task.team.map((member) => (
                    <span key={member} className="text-xs bg-muted text-foreground px-2 py-0.5 rounded-full">
                      {member}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Alterar status */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Alterar Status</h3>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(statusConfig) as TaskStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(task.id, s)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full font-medium transition-all border",
                    task.status === s
                      ? statusConfig[s].badgeClass + " ring-2 ring-offset-1 ring-primary/30"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {statusConfig[s].label}
                </button>
              ))}
            </div>
          </section>

          {/* Dependências */}
          {task.dependencies.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Dependências</h3>
              <ul className="space-y-1">
                {task.dependencies.map((dep, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                    {dep}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Anexos */}
          {task.attachments.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                <Paperclip className="w-3 h-3" /> Anexos
              </h3>
              <div className="space-y-1.5">
                {task.attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-foreground bg-muted/40 px-3 py-2 rounded-lg">
                    <Paperclip className="w-3 h-3 text-muted-foreground" />
                    <span className="flex-1">{att.name}</span>
                    <span className="text-muted-foreground uppercase">{att.type}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Links relacionados */}
          {task.relatedLinks.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                <Link2 className="w-3 h-3" /> Recursos Relacionados
              </h3>
              <div className="space-y-1.5">
                {task.relatedLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    className="flex items-center gap-2 text-xs text-primary hover:underline bg-primary/5 px-3 py-2 rounded-lg"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {link.label}
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Comentários */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Comentários ({comments.length})
            </h3>
            <div className="space-y-3 mb-3">
              {comments.length === 0 && (
                <p className="text-xs text-muted-foreground italic">Nenhum comentário ainda.</p>
              )}
              {comments.map((c, i) => (
                <div key={i} className="bg-muted/40 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-semibold text-foreground">{c.author}</span>
                    <span className="text-xs text-muted-foreground">· {c.role}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{c.date}</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Adicionar comentário... (@mencionar colega)"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                className="flex-1 px-3 py-2 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={handleAddComment}
                className="px-3 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Enviar
              </button>
            </div>
          </section>

          {/* Histórico */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <History className="w-3 h-3" /> Histórico de Alterações
            </h3>
            <div className="space-y-2">
              {task.history.map((h, i) => (
                <div key={i} className="flex gap-2 text-xs text-muted-foreground">
                  <span className="shrink-0 font-medium text-foreground">{h.user}</span>
                  <span>{h.action}</span>
                  <span className="ml-auto shrink-0">{h.date}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Footer: Solucionar conflito ──────────────────────────── */}
        {isConflict && (
          <div className="px-6 py-4 border-t border-border">
            <button
              onClick={() => navigate("/calendar", { state: { resourceKind: "professors", filterStatus: "Conflito" } })}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              Solucionar conflito
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [search, setSearch] = useState("");
  const [filterProgram, setFilterProgram] = useState(programOptions[0]);
  const [filterTurma, setFilterTurma] = useState(turmaOptions[0]);
  const [filterResponsible, setFilterResponsible] = useState(responsibleOptions[0]);
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleStatusChange = (id: number, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t)),
    );
    if (selectedTask?.id === id) {
      setSelectedTask((prev) => prev ? { ...prev, status } : null);
    }
  };

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (activeTab !== "all" && t.status !== activeTab) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.program.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterProgram !== programOptions[0] && t.program !== filterProgram) return false;
      if (filterTurma !== turmaOptions[0] && t.turma !== filterTurma) return false;
      if (filterResponsible === responsibleOptions[0] && t.responsible !== "Camila Rocha") return false;
      if (filterResponsible !== responsibleOptions[0] && filterResponsible !== responsibleOptions[1] && t.responsible !== filterResponsible) return false;
      return true;
    });
  }, [tasks, activeTab, search, filterProgram, filterTurma, filterResponsible]);

  const counts = useMemo(() => ({
    pending: tasks.filter((t) => t.status === "pending").length,
    upcoming: tasks.filter((t) => t.status === "upcoming").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  }), [tasks]);

  return (
    <AppLayout pageTitle="Tarefas" pageSubtitle="Acompanhe e gerencie as tarefas da equipe">
      <div className="p-6 space-y-5">

        {/* ── Summary Cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key: "pending" as TabFilter, label: "Pendentes", count: counts.pending, icon: Clock, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
            { key: "upcoming" as TabFilter, label: "Próximas do prazo", count: counts.upcoming, icon: CalendarDays, color: "text-warning", bg: "bg-warning/10 border-warning/20" },
            { key: "overdue" as TabFilter, label: "Atrasadas", count: counts.overdue, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
            { key: "completed" as TabFilter, label: "Finalizadas", count: counts.completed, icon: CheckCircle2, color: "text-success", bg: "bg-success/10 border-success/20" },
          ].map(({ key, label, count, icon: Icon, color, bg }) => (
            <button
              key={key}
              onClick={() => setActiveTab(activeTab === key ? "all" : key)}
              className={cn(
                "bg-card border rounded-xl px-5 py-4 text-left hover:shadow-sm transition-all",
                activeTab === key ? bg + " border-current" : "border-border",
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={cn("w-4 h-4", color)} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className="font-display font-bold text-3xl text-foreground">{count}</p>
            </button>
          ))}
        </div>

        {/* ── Tabs + Search ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 flex-wrap">
            {tabOptions.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                  activeTab === tab.key
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar tarefa"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-48"
            />
          </div>
        </div>

        {/* ── Filters row ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-medium">Filtros:</span>
          </div>

          {[
            { value: filterResponsible, options: responsibleOptions, setter: setFilterResponsible },
            { value: filterProgram, options: programOptions, setter: setFilterProgram },
            { value: filterTurma, options: turmaOptions, setter: setFilterTurma },
          ].map(({ value, options, setter }, idx) => (
            <div key={idx} className="relative">
              <select
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="appearance-none text-xs font-medium bg-muted/60 hover:bg-muted text-foreground border border-border rounded-full px-3 py-1.5 pr-7 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
              >
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          ))}

          <div className="flex items-center gap-1.5 ml-auto text-xs text-muted-foreground">
            <span className="font-medium">Período customizado:</span>
            <input
              type="date"
              value={periodFrom}
              onChange={(e) => setPeriodFrom(e.target.value)}
              className="text-xs bg-background border border-input rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <span>até</span>
            <input
              type="date"
              value={periodTo}
              onChange={(e) => setPeriodTo(e.target.value)}
              className="text-xs bg-background border border-input rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Tarefa</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Programa/Turma</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Responsável</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Prazo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                      Nenhuma tarefa encontrada para os filtros selecionados.
                    </td>
                  </tr>
                )}
                {filtered.map((task) => {
                  const cfg = statusConfig[task.status];
                  return (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      {/* Tarefa */}
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <span className={cn("w-3 h-3 rounded-full shrink-0 mt-1", cfg.dotClass)} />
                          <div>
                            <p className={cn("font-medium text-foreground text-xs", task.status === "completed" && "line-through text-muted-foreground")}>
                              {task.title}
                            </p>
                            <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{task.description}</p>
                          </div>
                        </div>
                      </td>
                      {/* Programa/Turma */}
                      <td className="px-4 py-4 text-xs text-muted-foreground hidden sm:table-cell">
                        <p>{task.program}</p>
                        <p className="text-xs opacity-70">{task.turma}</p>
                      </td>
                      {/* Responsável */}
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <p className="text-xs font-medium text-foreground">{task.responsible}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{task.role}</p>
                      </td>
                      {/* Prazo */}
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className={cn("text-xs font-medium", task.status === "overdue" ? "text-destructive" : "text-foreground")}>
                          {task.deadline}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap", cfg.badgeClass)}>
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Task Detail Panel ────────────────────────────────────────────── */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </AppLayout>
  );
}
