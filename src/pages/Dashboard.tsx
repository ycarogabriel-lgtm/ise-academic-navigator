import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  GraduationCap,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  FileText,
  Flame,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

interface StatCard {
  label: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
}

type TurmaStatus = "active" | "draft" | "pending";

interface Turma {
  name: string;
  start: string;
  progress: number;
  status: TurmaStatus;
}

type AlertType = "conflict" | "pending" | "success";

interface Alert {
  type: AlertType;
  message: string;
  time: string;
}

type TaskPriority = "overdue" | "pending";

interface Task {
  priority: TaskPriority;
  title: string;
  description: string;
  program: string;
  responsible: string;
  role: string;
  deadline: string;
  isOverdue: boolean;
}

// ── Static data ───────────────────────────────────────────────────────────────

const statsCards: StatCard[] = [
  { label: "Programas Ativos", value: "24", change: "Neste semestre", icon: GraduationCap },
  { label: "Alunos previstos hoje (campus ISE)", value: "318", change: "26/03", icon: Users },
  { label: "Alunos previstos amanhã (campus ISE)", value: "500", change: "27/03", icon: Users },
  { label: "Professores Alocados (hoje)", value: "67", change: "10 sem alocações", icon: UserCheck },
  { label: "Salas Reservadas (hoje)", value: "12", change: "de 18 disponíveis", icon: Building2 },
];

const turmas: Turma[] = [
  { name: "MBA Executivo – T2025A", start: "Mar/24", progress: 80, status: "active" },
  { name: "Especialização Finanças – T2026B", start: "—", progress: 0, status: "draft" },
  { name: "Liderança Estratégica – T2026A", start: "—", progress: 0, status: "draft" },
  { name: "Marketing Digital – T2026D", start: "Jul/26", progress: 0, status: "pending" },
  { name: "Inovação e Startups – T2026C", start: "Jul/26", progress: 0, status: "pending" },
];

const alerts: Alert[] = [
  { type: "conflict", message: "Conflito detectado: Dr. Lima alocado em 2 sessões simultâneas em 15/Mar", time: "Há 2h" },
  { type: "pending", message: "Pré-reserva de sala Auditório A aguardando aprovação (MBA T24A)", time: "Há 4h" },
  { type: "success", message: "Horário Oficial do MBA Executivo T23B foi publicado", time: "Ontem" },
];

const tasks: Task[] = [
  {
    priority: "overdue",
    title: "Resolver conflito de sala — Prof. Ana Silva",
    description: "Prof. Ana com 2 atividades sobrepostas, realocar sala ou horário",
    program: "MBA Executivo / MBA-2026-T1",
    responsible: "Camila Rocha",
    role: "Diretora Acadêmica",
    deadline: "12/03/2026",
    isOverdue: true,
  },
  {
    priority: "overdue",
    title: "Definir professores para sessões ainda sem alocação.",
    description: "Ainda há professores que não estão alocados",
    program: "MBA Executivo / Gestão de Projetos",
    responsible: "Camila Rocha",
    role: "Diretora Acadêmica",
    deadline: "08/03/2026",
    isOverdue: true,
  },
  {
    priority: "pending",
    title: "Revisar outlines pendentes",
    description: "Há outlines que precisam ser revisados",
    program: "MBA Executivo / MBA-2026-T1",
    responsible: "Camila Rocha",
    role: "Diretora Acadêmica",
    deadline: "15/03/2026",
    isOverdue: false,
  },
  {
    priority: "pending",
    title: "Confirmar carga horária total da turma",
    description: "Confirme a carga horária da turma",
    program: "Data Science / DS-2026-T1",
    responsible: "Camila Rocha",
    role: "Diretora Acadêmica",
    deadline: "15/03/2026",
    isOverdue: false,
  },
];

// ── Config maps ───────────────────────────────────────────────────────────────

const turmaStatusConfig: Record<TurmaStatus, { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }> = {
  active: {
    label: "Aprovada/Em andamento",
    badgeClass: "bg-success/10 text-success",
    icon: CheckCircle2,
  },
  draft: {
    label: "Rascunho",
    badgeClass: "bg-muted text-muted-foreground",
    icon: FileText,
  },
  pending: {
    label: "Em aprovação",
    badgeClass: "bg-warning/10 text-warning",
    icon: Flame,
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [statsCollapsed, setStatsCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <AppLayout pageTitle="Dashboard" pageSubtitle="Visão geral da operação acadêmica">
      <div className="p-6 space-y-6">

        {/* ── KPI Cards — collapsible ─────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setStatsCollapsed((v) => !v)}
            className="w-full flex items-center gap-2 px-5 py-3 text-left hover:bg-muted/30 transition-colors"
          >
            {statsCollapsed
              ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
              : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
            <span className="text-sm font-medium text-foreground">
              {statsCollapsed ? "Expandir informações" : "Recolher informações"}
            </span>
          </button>

          {!statsCollapsed && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-border border-t border-border">
              {statsCards.map((card) => (
                <div key={card.label} className="flex items-start justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <p className="text-muted-foreground text-xs font-medium leading-snug">{card.label}</p>
                    <p className="font-display font-bold text-2xl text-foreground mt-1.5">{card.value}</p>
                    <p className="text-muted-foreground text-xs mt-1">{card.change}</p>
                  </div>
                  <card.icon className="w-5 h-5 shrink-0 text-primary" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Middle row: Turmas + Alertas ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Turmas Recentes */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h3 className="font-display font-bold text-foreground text-sm">Turmas Recentes</h3>
                <p className="text-muted-foreground text-xs mt-0.5">Últimas atualizações de programas</p>
              </div>
              <button className="text-primary text-xs font-medium hover:underline flex items-center gap-1">
                Ver todos <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Turma</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Início</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Progresso</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {turmas.map((turma, i) => {
                    const s = turmaStatusConfig[turma.status];
                    const StatusIcon = s.icon;
                    return (
                      <tr
                        key={i}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-foreground text-xs">{turma.name}</p>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">
                          {turma.start}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground hidden sm:table-cell">
                          {turma.progress}%
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn("inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap", s.badgeClass)}>
                            <StatusIcon className="w-3 h-3 shrink-0" />
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alertas & Notificações */}
          <div className="bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-display font-bold text-foreground text-sm">Alertas & Notificações</h3>
              <span className="bg-destructive text-destructive-foreground text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {alerts.length}
              </span>
            </div>
            <div className="p-4 space-y-3">
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-3 p-3 rounded-lg border",
                    alert.type === "conflict" && "bg-destructive/5 border-destructive/20",
                    alert.type === "pending" && "bg-warning/5 border-warning/20",
                    alert.type === "success" && "bg-success/5 border-success/20",
                  )}
                >
                  {alert.type === "conflict" && <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />}
                  {alert.type === "pending" && <Clock className="w-4 h-4 text-warning shrink-0 mt-0.5" />}
                  {alert.type === "success" && <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-xs text-foreground leading-snug">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 pb-4">
              <button className="w-full py-2 text-xs text-primary font-medium hover:bg-primary/5 rounded-lg transition-colors">
                Ver todas as notificações
              </button>
            </div>
          </div>
        </div>

        {/* ── Tarefas ────────────────────────────────────────────────────── */}
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h3 className="font-display font-bold text-foreground text-sm">Tarefas</h3>
              <p className="text-muted-foreground text-xs mt-0.5">Últimas atualizações de tarefas</p>
            </div>
            <button onClick={() => navigate("/tasks")} className="text-primary text-xs font-medium hover:underline flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </button>
          </div>
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
                {tasks.map((task, i) => (
                  <tr
                    key={i}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "w-3.5 h-3.5 rounded-full shrink-0 mt-0.5",
                            task.priority === "overdue" ? "bg-destructive" : "bg-primary",
                          )}
                        />
                        <div>
                          <p className="font-medium text-foreground text-xs">{task.title}</p>
                          <p className="text-muted-foreground text-xs mt-0.5">{task.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground hidden sm:table-cell">
                      {task.program}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <p className="text-xs font-medium text-foreground">{task.responsible}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{task.role}</p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className={cn("text-xs font-medium", task.isOverdue ? "text-destructive" : "text-foreground")}>
                        {task.deadline}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap",
                          task.priority === "overdue"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {task.priority === "overdue" ? "Atrasada" : "Pendente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
