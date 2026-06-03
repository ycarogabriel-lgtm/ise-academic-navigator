import { AppLayout } from "@/components/layout/AppLayout";
import { Check, ChevronLeft, ChevronRight, Plus, X, Save, AlertTriangle, Trash2, BookOpen, Clock, MapPin, User, GraduationCap, Tag, Layers, PanelRightClose, PanelRightOpen, BarChart3, FileDown, Ban, CalendarPlus, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DndContext, PointerSensor, type CollisionDetection, type DragEndEvent, type DragOverEvent, type DragStartEvent, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const MIN_EVENT_WIDTH = 130; // px — minimum width of a single-event day column
const TIME_COL_W = 56;       // px — width of the time gutter column
const SLOT_MINUTES = 30;
const SLOTS_PER_HOUR = 60 / SLOT_MINUTES;
const START_HOUR = HOURS[0];
const END_HOUR = HOURS[HOURS.length - 1] + 1;
const TIME_SLOTS = Array.from({ length: (END_HOUR - START_HOUR) * SLOTS_PER_HOUR }, (_, index) => START_HOUR + index / SLOTS_PER_HOUR);
const LANE_HEIGHT = 58;
const SELECTABLE_DAYS = [11, 12, 13, 14, 15, 16, 17, 25, 30];

const PROFESSORS = ["Dr. Faria", "Dra. Souza", "Dr. Costa", "Dr. Lima", "Dra. Mendes", "A definir"];
const PROFESSOR_TYPE: Record<string, "ISE" | "Convidado" | "Externo"> = {
  "Dr. Faria": "ISE", "Dra. Souza": "ISE", "Dr. Costa": "Convidado",
  "Dr. Lima": "ISE", "Dra. Mendes": "Convidado", "A definir": "Externo",
};
const PLENARIAS = ["Plenária 1", "Plenária 2", "Plenária 3", "Plenária 4", "Plenária 5"];
const SALAS_EQUIPE = Array.from({ length: 20 }, (_, i) => `Sala Equipe ${String(i + 1).padStart(2, "0")}`);
const AUDITORIOS = ["Auditório A", "Auditório B"];
const REFEITORIOS = ["Refeitório 1001"];
const ROOMS = [...PLENARIAS, ...AUDITORIOS, ...SALAS_EQUIPE, ...REFEITORIOS];
const THEMES = ["Estratégia", "Finanças", "Marketing", "Liderança", "Inovação", "RH", "Operações"];
const TURMAS = ["MBA Executivo – T24A", "Esp. Finanças – T23B", "Marketing – T24A", "Custom Vale – T24", "Liderança – T24B", "Imersão Inovação – T24", "Gestão de Pessoas – T24A", "Esp. Operações – T24"];
const STATUSES = ["Reservado", "Pré-reservado", "Conflito", "Rascunho"] as const;
type Status = (typeof STATUSES)[number];

const FILTER_BY_TYPES = [
  { key: "espaco", label: "Por espaço" },
  { key: "recurso", label: "Por recurso" },
  { key: "disciplina", label: "Por disciplina" },
  { key: "docente", label: "Por docente" },
  { key: "turma", label: "Por turma" },
  { key: "compromisso", label: "Por compromisso" },
] as const;
type FilterByType = (typeof FILTER_BY_TYPES)[number]["key"];
type AxisOrientation = "calendar" | "resources";
type ShowMode = "free" | "occupied" | "both";
type ResourceKind = "rooms" | "professors";
type OccupancyLevel = "low" | "medium" | "high";

interface CalendarEvent {
  id: number;
  title: string;
  day: number;
  startHour: number;
  duration: number;
  color: "primary" | "success" | "warning" | "destructive";
  room: string;
  professor: string;
  theme: string;
  program: string;
  status: Status;
}

interface DropTarget {
  day: number;
  hour: number;
  resource: string;
}

type ResizeEdge = "start" | "end";

const colorMap = {
  primary: "bg-primary/15 border-primary text-primary",
  success: "bg-success/15 border-success text-success",
  warning: "bg-warning/15 border-warning text-warning",
  destructive: "bg-destructive/15 border-destructive text-destructive",
};

const statusToColor = (s: Status): CalendarEvent["color"] =>
  s === "Conflito" ? "destructive" : s === "Pré-reservado" ? "warning" : s === "Rascunho" ? "warning" : "primary";

const INITIAL_EVENTS: CalendarEvent[] = [
  // ───────── Segunda-feira (11/Mar) ─────────
  { id: 101, title: "MBA Executivo – Módulo 3", day: 11, startHour: 8, duration: 4, color: "primary", room: "Plenária 1", professor: "Dr. Faria", theme: "Estratégia", program: "MBA Executivo – T24A", status: "Reservado" },
  { id: 102, title: "Esp. Finanças – Sessão 7", day: 11, startHour: 8, duration: 4, color: "success", room: "Plenária 2", professor: "Dra. Souza", theme: "Finanças", program: "Esp. Finanças – T23B", status: "Reservado" },
  { id: 103, title: "Marketing Digital – S.04", day: 11, startHour: 8, duration: 4, color: "primary", room: "Plenária 3", professor: "Dr. Costa", theme: "Marketing", program: "Marketing – T24A", status: "Reservado" },
  { id: 104, title: "Custom Vale – Estratégia", day: 11, startHour: 8, duration: 4, color: "success", room: "Plenária 4", professor: "Dr. Lima", theme: "Estratégia", program: "Custom Vale – T24", status: "Reservado" },
  { id: 105, title: "Liderança 360 – S.01", day: 11, startHour: 9, duration: 3, color: "primary", room: "Plenária 5", professor: "Dra. Mendes", theme: "Liderança", program: "Liderança – T24B", status: "Reservado" },
  { id: 106, title: "Conferência Inovação ABERTA", day: 11, startHour: 9, duration: 3, color: "success", room: "Auditório A", professor: "Dr. Faria", theme: "Inovação", program: "Imersão Inovação – T24", status: "Reservado" },
  { id: 107, title: "Painel RH Estratégico", day: 11, startHour: 8, duration: 3, color: "primary", room: "Auditório B", professor: "Dra. Mendes", theme: "RH", program: "Gestão de Pessoas – T24A", status: "Reservado" },
  { id: 108, title: "Workshop Times – MBA G1", day: 11, startHour: 10, duration: 2, color: "warning", room: "Sala Equipe 01", professor: "A definir", theme: "Estratégia", program: "MBA Executivo – T24A", status: "Pré-reservado" },
  { id: 109, title: "Workshop Times – MBA G2", day: 11, startHour: 10, duration: 2, color: "primary", room: "Sala Equipe 02", professor: "Dr. Faria", theme: "Estratégia", program: "MBA Executivo – T24A", status: "Reservado" },
  { id: 110, title: "Workshop Times – Finanças G1", day: 11, startHour: 10, duration: 2, color: "success", room: "Sala Equipe 03", professor: "Dra. Souza", theme: "Finanças", program: "Esp. Finanças – T23B", status: "Reservado" },
  { id: 111, title: "Workshop Times – Mkt G1", day: 11, startHour: 10, duration: 2, color: "primary", room: "Sala Equipe 04", professor: "Dr. Costa", theme: "Marketing", program: "Marketing – T24A", status: "Reservado" },
  { id: 112, title: "Workshop Times – Custom Vale", day: 11, startHour: 10, duration: 2, color: "success", room: "Sala Equipe 05", professor: "Dr. Lima", theme: "Estratégia", program: "Custom Vale – T24", status: "Reservado" },
  { id: 113, title: "MBA – Painel Estratégia Tarde", day: 11, startHour: 14, duration: 4, color: "primary", room: "Plenária 1", professor: "Dr. Faria", theme: "Estratégia", program: "MBA Executivo – T24A", status: "Reservado" },
  { id: 114, title: "Esp. Finanças – Sessão 8", day: 11, startHour: 14, duration: 4, color: "success", room: "Plenária 2", professor: "Dra. Souza", theme: "Finanças", program: "Esp. Finanças – T23B", status: "Reservado" },
  { id: 115, title: "Mkt Digital – Lab Prático", day: 11, startHour: 14, duration: 4, color: "primary", room: "Plenária 3", professor: "Dr. Costa", theme: "Marketing", program: "Marketing – T24A", status: "Reservado" },
  { id: 116, title: "Custom Vale – Painel Tarde", day: 11, startHour: 14, duration: 4, color: "success", room: "Plenária 4", professor: "Dr. Lima", theme: "Estratégia", program: "Custom Vale – T24", status: "Reservado" },
  { id: 117, title: "Painel Liderança 360", day: 11, startHour: 14, duration: 4, color: "primary", room: "Auditório A", professor: "Dra. Mendes", theme: "Liderança", program: "Liderança – T24B", status: "Reservado" },
  { id: 118, title: "Sprint Inovação – Pitch", day: 11, startHour: 14, duration: 4, color: "success", room: "Auditório B", professor: "Dra. Mendes", theme: "Inovação", program: "Imersão Inovação – T24", status: "Reservado" },
  { id: 119, title: "Coaching Times – MBA G3", day: 11, startHour: 16, duration: 2, color: "warning", room: "Sala Equipe 06", professor: "A definir", theme: "Liderança", program: "MBA Executivo – T24A", status: "Pré-reservado" },
  { id: 120, title: "Mentoria – Inovação Squad", day: 11, startHour: 16, duration: 2, color: "primary", room: "Sala Equipe 07", professor: "Dra. Mendes", theme: "Inovação", program: "Imersão Inovação – T24", status: "Reservado" },
  { id: 130, title: "MBA – Aula Inaugural Manhã", day: 11, startHour: 7, duration: 1, color: "primary", room: "Plenária 1", professor: "Dr. Faria", theme: "Estratégia", program: "MBA Executivo – T24A", status: "Reservado" },
  { id: 131, title: "MBA – Encerramento do Dia", day: 11, startHour: 18, duration: 1, color: "primary", room: "Plenária 1", professor: "Dr. Faria", theme: "Estratégia", program: "MBA Executivo – T24A", status: "Reservado" },
  { id: 132, title: "Finanças – Briefing Matinal", day: 11, startHour: 7, duration: 1, color: "success", room: "Plenária 2", professor: "Dra. Souza", theme: "Finanças", program: "Esp. Finanças – T23B", status: "Reservado" },
  { id: 133, title: "Finanças – Plantão", day: 11, startHour: 13, duration: 1, color: "success", room: "Plenária 2", professor: "Dra. Souza", theme: "Finanças", program: "Esp. Finanças – T23B", status: "Reservado" },
  { id: 134, title: "Finanças – Wrap-up", day: 11, startHour: 18, duration: 1, color: "success", room: "Plenária 2", professor: "Dra. Souza", theme: "Finanças", program: "Esp. Finanças – T23B", status: "Reservado" },
  { id: 135, title: "Mkt – Mesa-Redonda", day: 11, startHour: 12, duration: 2, color: "primary", room: "Plenária 3", professor: "Dr. Costa", theme: "Marketing", program: "Marketing – T24A", status: "Reservado" },
  { id: 136, title: "Mkt – Networking Final", day: 11, startHour: 18, duration: 1, color: "primary", room: "Plenária 3", professor: "Dr. Costa", theme: "Marketing", program: "Marketing – T24A", status: "Reservado" },
  { id: 137, title: "Custom Vale – Café Estratégico", day: 11, startHour: 7, duration: 1, color: "success", room: "Plenária 4", professor: "Dr. Lima", theme: "Estratégia", program: "Custom Vale – T24", status: "Reservado" },
  { id: 138, title: "Custom Vale – Almoço Executivo", day: 11, startHour: 12, duration: 2, color: "success", room: "Plenária 4", professor: "Dr. Lima", theme: "Estratégia", program: "Custom Vale – T24", status: "Reservado" },
  { id: 139, title: "Liderança – Pré-Aula", day: 11, startHour: 7, duration: 2, color: "primary", room: "Plenária 5", professor: "Dra. Mendes", theme: "Liderança", program: "Liderança – T24B", status: "Reservado" },
  { id: 140, title: "Liderança – Painel Tarde", day: 11, startHour: 13, duration: 4, color: "primary", room: "Plenária 5", professor: "Dra. Mendes", theme: "Liderança", program: "Liderança – T24B", status: "Reservado" },
  { id: 141, title: "Liderança – Encerramento", day: 11, startHour: 17, duration: 2, color: "primary", room: "Plenária 5", professor: "Dra. Mendes", theme: "Liderança", program: "Liderança – T24B", status: "Reservado" },
  { id: 142, title: "Abertura Institucional", day: 11, startHour: 7, duration: 1, color: "success", room: "Auditório A", professor: "Dr. Faria", theme: "Estratégia", program: "Imersão Inovação – T24", status: "Reservado" },
  { id: 143, title: "Palestra Magna – Inovação", day: 11, startHour: 12, duration: 2, color: "success", room: "Auditório A", professor: "Dra. Mendes", theme: "Inovação", program: "Imersão Inovação – T24", status: "Reservado" },
  { id: 144, title: "Apresentação de Resultados", day: 11, startHour: 18, duration: 1, color: "success", room: "Auditório A", professor: "Dr. Faria", theme: "Estratégia", program: "Imersão Inovação – T24", status: "Reservado" },
  { id: 145, title: "RH – Roda de Conversa", day: 11, startHour: 11, duration: 2, color: "primary", room: "Auditório B", professor: "Dra. Mendes", theme: "RH", program: "Gestão de Pessoas – T24A", status: "Reservado" },
  { id: 146, title: "RH – Cerimônia", day: 11, startHour: 18, duration: 1, color: "primary", room: "Auditório B", professor: "Dra. Mendes", theme: "RH", program: "Gestão de Pessoas – T24A", status: "Reservado" },
  { id: 150, title: "Almoço acadêmico", day: 11, startHour: 12, duration: 1, color: "success", room: "Refeitório 1001", professor: "Dra. Souza", theme: "Operações", program: "Institucional", status: "Reservado" },
  { id: 151, title: "Squad Mkt G2", day: 11, startHour: 8, duration: 2, color: "primary", room: "Sala Equipe 09", professor: "Dr. Costa", theme: "Marketing", program: "Marketing – T24A", status: "Reservado" },
  { id: 152, title: "Squad RH G1", day: 11, startHour: 8, duration: 3, color: "warning", room: "Sala Equipe 10", professor: "A definir", theme: "RH", program: "Gestão de Pessoas – T24A", status: "Pré-reservado" },
  { id: 153, title: "Mentoria Operações", day: 11, startHour: 9, duration: 2, color: "success", room: "Sala Equipe 11", professor: "Dr. Lima", theme: "Operações", program: "Esp. Operações – T24", status: "Reservado" },
  { id: 154, title: "Coaching Liderança G1", day: 11, startHour: 13, duration: 2, color: "primary", room: "Sala Equipe 12", professor: "Dra. Mendes", theme: "Liderança", program: "Liderança – T24B", status: "Reservado" },
  { id: 155, title: "Coaching Liderança G2", day: 11, startHour: 13, duration: 2, color: "primary", room: "Sala Equipe 13", professor: "Dr. Lima", theme: "Liderança", program: "Liderança – T24B", status: "Reservado" },
  { id: 156, title: "Workshop Inovação G3", day: 11, startHour: 14, duration: 3, color: "success", room: "Sala Equipe 14", professor: "Dra. Mendes", theme: "Inovação", program: "Imersão Inovação – T24", status: "Reservado" },
  { id: 157, title: "Workshop Estratégia G4", day: 11, startHour: 15, duration: 3, color: "primary", room: "Sala Equipe 15", professor: "Dr. Faria", theme: "Estratégia", program: "MBA Executivo – T24A", status: "Reservado" },
  { id: 158, title: "Mentoria Custom Vale G2", day: 11, startHour: 16, duration: 2, color: "success", room: "Sala Equipe 16", professor: "Dr. Lima", theme: "Estratégia", program: "Custom Vale – T24", status: "Reservado" },
  { id: 159, title: "Reunião Coordenação Acadêmica", day: 11, startHour: 17, duration: 2, color: "warning", room: "Sala Equipe 17", professor: "A definir", theme: "Operações", program: "MBA Executivo – T24A", status: "Pré-reservado" },
  { id: 160, title: "Liderança – S.02", day: 11, startHour: 11, duration: 1, color: "warning", room: "Sala 204", professor: "Dra. Mendes", theme: "Liderança", program: "Liderança – T24B", status: "Conflito" },

  // ── Adensamento extra (eventos simultâneos no 11/03 — cards lado a lado) ──
  { id: 170, title: "Squad Finanças G2", day: 11, startHour: 8, duration: 2, color: "success", room: "Sala Equipe 11", professor: "Dra. Souza", theme: "Finanças", program: "Esp. Finanças – T23B", status: "Reservado" },
  { id: 171, title: "Squad Finanças G3", day: 11, startHour: 8, duration: 2, color: "success", room: "Sala Equipe 12", professor: "Dra. Souza", theme: "Finanças", program: "Esp. Finanças – T23B", status: "Reservado" },
  { id: 172, title: "Mentoria Inovação A", day: 11, startHour: 8, duration: 2, color: "primary", room: "Sala Equipe 13", professor: "Dra. Mendes", theme: "Inovação", program: "Imersão Inovação – T24", status: "Reservado" },
  { id: 173, title: "Mentoria Inovação B", day: 11, startHour: 8, duration: 2, color: "primary", room: "Sala Equipe 14", professor: "Dra. Mendes", theme: "Inovação", program: "Imersão Inovação – T24", status: "Reservado" },
  { id: 174, title: "Coaching Custom Vale", day: 11, startHour: 9, duration: 2, color: "success", room: "Sala Equipe 15", professor: "Dr. Lima", theme: "Estratégia", program: "Custom Vale – T24", status: "Reservado" },
  { id: 175, title: "Coaching Liderança G3", day: 11, startHour: 9, duration: 2, color: "primary", room: "Sala Equipe 16", professor: "Dra. Mendes", theme: "Liderança", program: "Liderança – T24B", status: "Reservado" },
  { id: 176, title: "Coaching Liderança G4", day: 11, startHour: 9, duration: 2, color: "primary", room: "Sala Equipe 17", professor: "Dra. Mendes", theme: "Liderança", program: "Liderança – T24B", status: "Reservado" },
  { id: 177, title: "Squad Operações", day: 11, startHour: 9, duration: 2, color: "warning", room: "Sala Equipe 18", professor: "A definir", theme: "Operações", program: "Esp. Operações – T24", status: "Pré-reservado" },
  { id: 178, title: "Squad RH G2", day: 11, startHour: 9, duration: 2, color: "primary", room: "Sala Equipe 19", professor: "Dra. Mendes", theme: "RH", program: "Gestão de Pessoas – T24A", status: "Reservado" },
  { id: 179, title: "Squad RH G3", day: 11, startHour: 14, duration: 2, color: "primary", room: "Sala Equipe 18", professor: "Dra. Mendes", theme: "RH", program: "Gestão de Pessoas – T24A", status: "Reservado" },
  { id: 180, title: "Squad Mkt G3", day: 11, startHour: 14, duration: 2, color: "success", room: "Sala Equipe 19", professor: "Dr. Costa", theme: "Marketing", program: "Marketing – T24A", status: "Reservado" },
  { id: 181, title: "Squad Mkt G4", day: 11, startHour: 14, duration: 2, color: "success", room: "Sala Equipe 20", professor: "Dr. Costa", theme: "Marketing", program: "Marketing – T24A", status: "Reservado" },
  { id: 182, title: "Workshop Inovação G4", day: 11, startHour: 15, duration: 2, color: "primary", room: "Sala Equipe 11", professor: "Dra. Mendes", theme: "Inovação", program: "Imersão Inovação – T24", status: "Reservado" },
  { id: 183, title: "Workshop Inovação G5", day: 11, startHour: 15, duration: 2, color: "primary", room: "Sala Equipe 12", professor: "Dra. Mendes", theme: "Inovação", program: "Imersão Inovação – T24", status: "Reservado" },
  { id: 184, title: "Mentoria Finanças B", day: 11, startHour: 16, duration: 2, color: "success", room: "Sala Equipe 13", professor: "Dra. Souza", theme: "Finanças", program: "Esp. Finanças – T23B", status: "Reservado" },
  { id: 185, title: "Mentoria Finanças C", day: 11, startHour: 16, duration: 2, color: "success", room: "Sala Equipe 14", professor: "Dra. Souza", theme: "Finanças", program: "Esp. Finanças – T23B", status: "Reservado" },
  { id: 186, title: "Plantão Acadêmico", day: 11, startHour: 17, duration: 1, color: "warning", room: "Sala Equipe 15", professor: "A definir", theme: "Operações", program: "Institucional", status: "Pré-reservado" },
  { id: 187, title: "Reunião DA", day: 11, startHour: 17, duration: 1, color: "primary", room: "Sala Equipe 16", professor: "Dr. Faria", theme: "Operações", program: "Institucional", status: "Reservado" },
  { id: 188, title: "Briefing Auditório", day: 11, startHour: 7, duration: 1, color: "success", room: "Auditório B", professor: "Dr. Faria", theme: "Estratégia", program: "Institucional", status: "Reservado" },
  { id: 189, title: "Almoço Convidados", day: 11, startHour: 12, duration: 1, color: "warning", room: "Sala Equipe 08", professor: "A definir", theme: "Operações", program: "Institucional", status: "Pré-reservado" },

  // ───────── Outros dias da semana ─────────
  { id: 10, title: "MBA Executivo – Módulo 3 (cont.)", day: 12, startHour: 8, duration: 4, color: "primary", room: "Plenária 1", professor: "Dr. Faria", theme: "Estratégia", program: "MBA Executivo – T24A", status: "Reservado" },
  { id: 11, title: "Liderança – S.02 ⚠️", day: 12, startHour: 9, duration: 3, color: "warning", room: "Auditório A", professor: "A definir", theme: "Liderança", program: "Liderança – T24B", status: "Pré-reservado" },
  { id: 12, title: "Operações Avançadas", day: 12, startHour: 8, duration: 4, color: "success", room: "Plenária 2", professor: "Dr. Lima", theme: "Operações", program: "Esp. Operações – T24", status: "Reservado" },
  { id: 13, title: "Marketing – Casos Reais", day: 12, startHour: 8, duration: 3, color: "primary", room: "Plenária 3", professor: "Dr. Costa", theme: "Marketing", program: "Marketing – T24A", status: "Reservado" },
  { id: 14, title: "Sprint Inovação", day: 12, startHour: 13, duration: 5, color: "success", room: "Sala Equipe 14", professor: "Dra. Mendes", theme: "Inovação", program: "Imersão Inovação – T24", status: "Reservado" },
  { id: 20, title: "Marketing Digital – S.05", day: 13, startHour: 8, duration: 4, color: "primary", room: "Plenária 3", professor: "Dr. Costa", theme: "Marketing", program: "Marketing – T24A", status: "Reservado" },
  { id: 21, title: "MBA – Estratégia Global", day: 13, startHour: 8, duration: 4, color: "primary", room: "Plenária 1", professor: "Dr. Faria", theme: "Estratégia", program: "MBA Executivo – T24A", status: "Reservado" },
  { id: 30, title: "MBA Executivo – Módulo 4", day: 14, startHour: 8, duration: 4, color: "primary", room: "Plenária 1", professor: "Dr. Lima", theme: "Estratégia", program: "MBA Executivo – T24A", status: "Reservado" },
  { id: 40, title: "MBA Executivo – Módulo 4 (cont.)", day: 15, startHour: 8, duration: 4, color: "primary", room: "Plenária 1", professor: "Dr. Lima", theme: "Estratégia", program: "MBA Executivo – T24A", status: "Reservado" },
  { id: 50, title: "Workshop Sábado – Inovação", day: 16, startHour: 9, duration: 4, color: "success", room: "Sala Equipe 14", professor: "Dra. Mendes", theme: "Inovação", program: "Imersão Inovação – T24", status: "Reservado" },
  { id: 250, title: "MBA Executivo – Simulação Conselho", day: 25, startHour: 8, duration: 3, color: "primary", room: "Plenária 2", professor: "Dr. Faria", theme: "Estratégia", program: "MBA Executivo – T24A", status: "Reservado" },
  { id: 251, title: "Intervalo orientado", day: 25, startHour: 11, duration: 1, color: "success", room: "Plenária 2", professor: "Dr. Faria", theme: "Operações", program: "MBA Executivo – T24A", status: "Reservado" },
  { id: 252, title: "Laboratório Finanças", day: 25, startHour: 14, duration: 3, color: "success", room: "Sala Equipe 03", professor: "Dra. Souza", theme: "Finanças", program: "Esp. Finanças – T23B", status: "Reservado" },
  { id: 300, title: "Custom Vale – Banca Final", day: 30, startHour: 9, duration: 3, color: "warning", room: "Auditório A", professor: "Dr. Lima", theme: "Estratégia", program: "Custom Vale – T24", status: "Pré-reservado" },
  { id: 301, title: "Liderança – Mentorias", day: 30, startHour: 13, duration: 2, color: "primary", room: "Sala Equipe 08", professor: "Dra. Mendes", theme: "Liderança", program: "Liderança – T24B", status: "Reservado" },
];

// ── Helpers ────────────────────────────────────────────────────────
const formatTime = (time: number) => {
  const hour = Math.floor(time);
  const minutes = Math.round((time - hour) * 60);
  return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const formatDuration = (duration: number) => duration % 1 === 0 ? `${duration}h` : `${Math.floor(duration)}h30`;

const formatTimeRange = (start: number, dur: number) => `${formatTime(start)} – ${formatTime(start + dur)}`;

const isVisibleStart = (time: number) => time >= START_HOUR && time < END_HOUR;

const slotIndexForTime = (time: number) => Math.round((time - START_HOUR) * SLOTS_PER_HOUR);

const timeForSlotIndex = (slotIndex: number) => START_HOUR + slotIndex / SLOTS_PER_HOUR;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const startReferenceCollisionDetection: CollisionDetection = ({ collisionRect, droppableContainers, droppableRects }) => {
  const referencePoint = {
    x: collisionRect.left + 1,
    y: collisionRect.top + Math.min(8, collisionRect.height / 2),
  };

  for (const droppableContainer of droppableContainers) {
    const rect = droppableRects.get(droppableContainer.id);
    if (!rect) continue;
    if (referencePoint.x >= rect.left && referencePoint.x <= rect.right && referencePoint.y >= rect.top && referencePoint.y <= rect.bottom) {
      return [{ id: droppableContainer.id, data: { droppableContainer, value: 1 } }];
    }
  }

  return [];
};

const eventsOverlap = (aStart: number, aDuration: number, bStart: number, bDuration: number) =>
  aStart < bStart + bDuration && bStart < aStart + aDuration;

const getResourceForEvent = (event: CalendarEvent, resourceKind: ResourceKind) =>
  resourceKind === "rooms" ? event.room : event.professor;

const getEventsInSlot = (events: CalendarEvent[], day: number, hour: number, resource: string, resourceKind: ResourceKind) =>
  events.filter((event) =>
    event.day === day &&
    getResourceForEvent(event, resourceKind) === resource &&
    event.startHour <= hour &&
    event.startHour + event.duration > hour,
  );

const getDropConflict = (events: CalendarEvent[], moving: CalendarEvent, target: DropTarget, resourceKind: ResourceKind) => {
  const targetRoom = resourceKind === "rooms" ? target.resource : moving.room;
  const conflict = events.find((event) =>
    event.id !== moving.id &&
    event.day === target.day &&
    eventsOverlap(target.hour, moving.duration, event.startHour, event.duration) &&
    event.room === targetRoom,
  );

  if (!conflict) return null;
  return `${targetRoom} ocupada`;
};

const getConflictedEventIds = (events: CalendarEvent[]) => {
  const conflictedIds = new Set<number>();
  for (let i = 0; i < events.length; i += 1) {
    for (let j = i + 1; j < events.length; j += 1) {
      const current = events[i];
      const candidate = events[j];
      if (
        current.day === candidate.day &&
        current.room === candidate.room &&
        eventsOverlap(current.startHour, current.duration, candidate.startHour, candidate.duration)
      ) {
        conflictedIds.add(current.id);
        conflictedIds.add(candidate.id);
      }
    }
  }
  return conflictedIds;
};

const withDerivedConflicts = (events: CalendarEvent[], conflictedIds: Set<number>) =>
  events.map((event) => conflictedIds.has(event.id) ? { ...event, status: "Conflito" as const, color: "destructive" as const } : event);

const getEventLanes = (events: CalendarEvent[]) => {
  const lanes: CalendarEvent[][] = [];
  const laneByEventId = new Map<number, number>();
  const sortedEvents = [...events].sort((a, b) => a.startHour - b.startHour || b.duration - a.duration || a.id - b.id);

  sortedEvents.forEach((event) => {
    const availableLane = lanes.findIndex((lane) => !lane.some((laneEvent) => eventsOverlap(event.startHour, event.duration, laneEvent.startHour, laneEvent.duration)));
    const laneIndex = availableLane >= 0 ? availableLane : lanes.length;
    if (!lanes[laneIndex]) lanes[laneIndex] = [];
    lanes[laneIndex].push(event);
    laneByEventId.set(event.id, laneIndex);
  });

  return { laneByEventId, laneCount: Math.max(1, lanes.length) };
};

const getOccupancyLevel = (events: CalendarEvent[], day: number): OccupancyLevel => {
  const occupiedRooms = new Set(events.filter((event) => event.day === day).map((event) => event.room)).size;
  const percentage = (occupiedRooms / ROOMS.length) * 100;
  if (percentage < 34) return "low";
  if (percentage < 67) return "medium";
  return "high";
};

const occupancyClassMap: Record<OccupancyLevel, string> = {
  low: "bg-success/15 text-success border-success/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
};

const statusLabel = (level: OccupancyLevel) =>
  level === "low" ? "Livre" : level === "medium" ? "Atenção" : "Lotado";

const roomCategory = (room: string) => {
  if (PLENARIAS.includes(room)) return "Plenária";
  if (AUDITORIOS.includes(room)) return "Auditório";
  if (SALAS_EQUIPE.includes(room)) return "Sala de Equipe";
  if (REFEITORIOS.includes(room)) return "Refeitório";
  return "Outro";
};

// ── New Session Modal (simples, mantido) ───────────────────────────
function NewSessionModal({ defaultDay, defaultHour, onSave, onClose }: {
  defaultDay?: number;
  defaultHour?: number;
  onSave: (ev: Omit<CalendarEvent, "id">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: "", day: defaultDay ?? 11, startHour: defaultHour ?? 8, duration: 2,
    room: "", professor: "", theme: "", program: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Obrigatório";
    if (!form.room) e.room = "Obrigatório";
    if (!form.professor) e.professor = "Obrigatório";
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ ...form, color: "primary" as const, status: "Reservado" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display font-bold text-foreground text-sm">Nova Sessão</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Título / Tema *</label>
            <input className={cn("w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary", errors.title ? "border-destructive" : "border-input")}
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: MBA Executivo – Módulo 5" />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Dia</label>
              <select className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background"
                value={form.day} onChange={(e) => setForm({ ...form, day: Number(e.target.value) })}>
                {[11, 12, 13, 14, 15, 16, 17].map((d) => <option key={d} value={d}>{d}/Mar</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Horário início</label>
              <select className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background"
                value={form.startHour} onChange={(e) => setForm({ ...form, startHour: Number(e.target.value) })}>
                {TIME_SLOTS.map((time) => <option key={time} value={time}>{formatTime(time)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Sala *</label>
            <select className={cn("w-full border rounded-lg px-3 py-2 text-sm bg-background", errors.room ? "border-destructive" : "border-input")}
              value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })}>
              <option value="">Selecione...</option>
              <optgroup label="Plenárias">{PLENARIAS.map((r) => <option key={r} value={r}>{r}</option>)}</optgroup>
              <optgroup label="Auditórios">{AUDITORIOS.map((r) => <option key={r} value={r}>{r}</option>)}</optgroup>
              <optgroup label="Salas de Equipe">{SALAS_EQUIPE.map((r) => <option key={r} value={r}>{r}</option>)}</optgroup>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Docente *</label>
            <select className={cn("w-full border rounded-lg px-3 py-2 text-sm bg-background", errors.professor ? "border-destructive" : "border-input")}
              value={form.professor} onChange={(e) => setForm({ ...form, professor: e.target.value })}>
              <option value="">Selecione...</option>
              {PROFESSORS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 pb-5">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted text-muted-foreground">Cancelar</button>
          <button onClick={handleSave} className="text-sm px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium flex items-center gap-2">
            <Save className="w-4 h-4" />Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Event Details Modal (rich, with tabs) ──────────────────────────
function EventDetailsModal({ event, onSave, onDelete, onClose }: {
  event: CalendarEvent;
  onSave: (ev: CalendarEvent) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CalendarEvent>(event);
  const [tab, setTab] = useState<"info" | "logistica" | "historico">("info");
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl border border-border max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                form.status === "Conflito" ? "bg-destructive/10 text-destructive border-destructive/30"
                : form.status === "Pré-reservado" ? "bg-warning/10 text-warning border-warning/30"
                : form.status === "Rascunho" ? "bg-muted text-muted-foreground border-border"
                : "bg-success/10 text-success border-success/30")}>
                {form.status === "Conflito" && <AlertTriangle className="w-3 h-3" />}
                {form.status}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{form.program || "Sem programa"}</span>
            </div>
            <h2 className="font-display font-bold text-foreground text-base">{form.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Seg 11/03/2024 · {formatTimeRange(form.startHour, form.duration)}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-4">
          {([
            { k: "info", l: "Informações" },
            { k: "logistica", l: "Logística" },
            { k: "historico", l: "Histórico" },
          ] as const).map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={cn("text-xs font-medium px-4 py-3 border-b-2 transition-colors -mb-px",
                tab === t.k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {t.l}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "info" && (
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Título / Tema</label>
              <input className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Dia</label>
                <select className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background"
                  value={form.day} onChange={(e) => setForm({ ...form, day: Number(e.target.value) })}>
                  {[11, 12, 13, 14, 15, 16, 17].map((d) => <option key={d} value={d}>{d}/Mar</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Horário</label>
                <div className="grid grid-cols-2 gap-2">
                  <select className="w-full border border-input rounded-lg px-2 py-2 text-sm bg-background"
                    value={form.startHour} onChange={(e) => setForm({ ...form, startHour: Number(e.target.value) })}>
                    {TIME_SLOTS.map((time) => <option key={time} value={time}>{formatTime(time)}</option>)}
                  </select>
                  <select className="w-full border border-input rounded-lg px-2 py-2 text-sm bg-background"
                    value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}>
                    {[0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8].map((d) => <option key={d} value={d}>{formatDuration(d)}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Docente</label>
                <select className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background"
                  value={form.professor} onChange={(e) => setForm({ ...form, professor: e.target.value })}>
                  {PROFESSORS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                <select className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background"
                  value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status, color: statusToColor(e.target.value as Status) })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Disciplina / Tema</label>
                <select className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background"
                  value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })}>
                  {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Turma</label>
                <input className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background"
                  value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Sala</label>
              <select className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background"
                value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })}>
                <optgroup label="Plenárias">{PLENARIAS.map((r) => <option key={r} value={r}>{r}</option>)}</optgroup>
                <optgroup label="Auditórios">{AUDITORIOS.map((r) => <option key={r} value={r}>{r}</option>)}</optgroup>
                <optgroup label="Salas de Equipe">{SALAS_EQUIPE.map((r) => <option key={r} value={r}>{r}</option>)}</optgroup>
                <optgroup label="Refeitórios">{REFEITORIOS.map((r) => <option key={r} value={r}>{r}</option>)}</optgroup>
              </select>
            </div>
          </div>
        )}

        {tab === "logistica" && (
          <div className="p-5 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-3">
                <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Espaço</p>
                <p className="font-medium text-foreground">{form.room}</p>
                <p className="text-xs text-muted-foreground">{roomCategory(form.room)}</p>
              </div>
              <div className="border border-border rounded-lg p-3">
                <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Capacidade estimada</p>
                <p className="font-medium text-foreground">{PLENARIAS.includes(form.room) ? "120" : AUDITORIOS.includes(form.room) ? "300" : "20"} pessoas</p>
              </div>
              <div className="border border-border rounded-lg p-3">
                <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Coffee Break</p>
                <p className="font-medium text-foreground">Sim — 15 min</p>
              </div>
              <div className="border border-border rounded-lg p-3">
                <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Material didático</p>
                <p className="font-medium text-foreground">Apostila + Slides</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Ajustes finos de logística podem ser feitos no Painel de Sessões.</p>
          </div>
        )}

        {tab === "historico" && (
          <div className="p-5 space-y-2 text-sm">
            <div className="flex items-start gap-3 border-l-2 border-primary pl-3 py-1">
              <div>
                <p className="text-xs font-medium text-foreground">Sessão criada</p>
                <p className="text-xs text-muted-foreground">há 3 dias · d.academico@ise.edu.br</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-l-2 border-muted pl-3 py-1">
              <div>
                <p className="text-xs font-medium text-foreground">Sala alterada para {form.room}</p>
                <p className="text-xs text-muted-foreground">há 1 dia · d.academico@ise.edu.br</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-border bg-muted/20">
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              className="text-xs px-3 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/5 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />Excluir
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-destructive">Confirmar exclusão?</span>
              <button onClick={() => onDelete(form.id)} className="text-xs px-2 py-1 rounded bg-destructive text-destructive-foreground">Sim</button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs px-2 py-1 rounded border border-border">Não</button>
            </div>
          )}
          <div className="flex gap-2">
            <a href="/sessions" className="text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />Painel de sessões
            </a>
            <button onClick={() => onSave(form)}
              className="text-sm px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium flex items-center gap-2">
              <Save className="w-4 h-4" />Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type CalendarView = "day" | "week" | "month" | "quarter" | "semester" | "year";

export default function CalendarPage() {
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState(2);
  const [currentDay, setCurrentDay] = useState(11);
  const [weekStart, setWeekStart] = useState(11);
  const [view, setView] = useState<CalendarView>("week");
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [showNewSession, setShowNewSession] = useState<{ day?: number; hour?: number } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [axisOrientation, setAxisOrientation] = useState<AxisOrientation>("resources");
  const [resourceKind, setResourceKind] = useState<ResourceKind>("rooms");
  const [selectedDays, setSelectedDays] = useState<number[]>([11, 25, 30]);
  const [showMode, setShowMode] = useState<ShowMode>("free");
  const [activeEventId, setActiveEventId] = useState<number | null>(null);
  const [hoveredDropTarget, setHoveredDropTarget] = useState<DropTarget | null>(null);
  const [showIncompleteGrid, setShowIncompleteGrid] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filtros (chips)
  const [filterBy, setFilterBy] = useState<FilterByType>("espaco");
  const [filterRoomCategory, setFilterRoomCategory] = useState<"" | "plenaria" | "auditorio" | "equipe" | "refeitorio">("");
  const [filterProfessor, setFilterProfessor] = useState("");
  const [filterProfessorType, setFilterProfessorType] = useState<"" | "ISE" | "Convidado" | "Externo">("");
  const [filterTheme, setFilterTheme] = useState("");
  const [filterTurma, setFilterTurma] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | Status>("");

  // Painel lateral: lista de recursos com checkbox
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

  // Painel direito (insights) — recolhível
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const dndSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const weekDays = view === "week"
    ? Array.from({ length: 7 }, (_, i) => weekStart + i).filter((d) => d >= 1 && d <= new Date(year, month + 1, 0).getDate())
    : view === "day"
    ? [currentDay]
    : selectedDays.length ? selectedDays : [11];

  const sidebarRooms = useMemo(() => {
    if (filterRoomCategory === "plenaria") return PLENARIAS;
    if (filterRoomCategory === "auditorio") return AUDITORIOS;
    if (filterRoomCategory === "equipe") return SALAS_EQUIPE;
    if (filterRoomCategory === "refeitorio") return REFEITORIOS;
    return ROOMS;
  }, [filterRoomCategory]);

  const visibleEvents = events.filter((e) => {
    if (!weekDays.includes(e.day) && (view === "week" || view === "day")) return false;
    if (selectedRooms.length > 0 && !selectedRooms.includes(e.room)) return false;
    if (filterRoomCategory) {
      if (filterRoomCategory === "plenaria" && !PLENARIAS.includes(e.room)) return false;
      if (filterRoomCategory === "auditorio" && !AUDITORIOS.includes(e.room)) return false;
      if (filterRoomCategory === "equipe" && !SALAS_EQUIPE.includes(e.room)) return false;
      if (filterRoomCategory === "refeitorio" && !REFEITORIOS.includes(e.room)) return false;
    }
    if (filterProfessor && e.professor !== filterProfessor) return false;
    if (filterProfessorType && PROFESSOR_TYPE[e.professor] !== filterProfessorType) return false;
    if (filterTheme && e.theme !== filterTheme) return false;
    if (filterTurma && e.program !== filterTurma) return false;
    if (filterStatus && e.status !== filterStatus) return false;
    return true;
  });

  const hasFilters = !!(filterRoomCategory || filterProfessor || filterProfessorType || filterTheme || filterTurma || filterStatus || selectedRooms.length > 0);

  const visibleResources = useMemo(() => {
    if (resourceKind === "professors") return PROFESSORS;
    return selectedRooms.length > 0 ? selectedRooms : sidebarRooms;
  }, [resourceKind, selectedRooms, sidebarRooms]);

  const emptySlotCount = useMemo(() => {
    return weekDays.reduce((total, day) => total + visibleResources.reduce((resourceTotal, resource) => (
      resourceTotal + HOURS.filter((hour) => getEventsInSlot(events, day, hour, resource, resourceKind).length === 0).length
    ), 0), 0);
  }, [events, resourceKind, visibleResources, weekDays]);

  const conflictedEventIds = useMemo(() => getConflictedEventIds(events), [events]);
  const displayEvents = useMemo(() => withDerivedConflicts(visibleEvents, conflictedEventIds), [conflictedEventIds, visibleEvents]);

  const { weekGridCols, weekTotalMinW } = useMemo(() => {
    const colWidths = weekDays.slice(0, 7).reduce<Record<number, number>>((acc, day) => {
      acc[day] = Math.max(1, ...HOURS.map(h =>
        displayEvents.filter(e => e.day === day && e.startHour === h).length
      ));
      return acc;
    }, {});
    const gridCols = `${TIME_COL_W}px ${weekDays.slice(0, 7).map(d =>
      `${(colWidths[d] ?? 1) * MIN_EVENT_WIDTH}px`
    ).join(' ')}`;
    const totalMinW = TIME_COL_W + weekDays.slice(0, 7).reduce((s, d) => s + (colWidths[d] ?? 1) * MIN_EVENT_WIDTH, 0);
    return { weekGridCols: gridCols, weekTotalMinW: totalMinW };
  }, [weekDays, displayEvents]);

  const handleAddSession = (ev: Omit<CalendarEvent, "id">) => {
    setEvents([...events, { ...ev, id: Date.now() }]);
    setShowNewSession(null);
    toast({ title: "Sessão criada.", description: `"${ev.title}" adicionada ao calendário.`, className: "top-center-toast bg-success text-success-foreground border-success" });
  };

  const clearAll = () => {
    setFilterRoomCategory(""); setFilterProfessor(""); setFilterProfessorType("");
    setFilterTheme(""); setFilterTurma(""); setFilterStatus(""); setSelectedRooms([]);
  };

  const updateDaySelection = (day: number) => {
    setSelectedDays((prev) => prev.includes(day) ? prev.filter((selectedDay) => selectedDay !== day) : [...prev, day].sort((a, b) => a - b));
  };

  const moveEventToSlot = (moving: CalendarEvent, target: DropTarget) => {
    setEvents((prev) => prev.map((event) => event.id === moving.id ? {
      ...event,
      day: target.day,
      startHour: target.hour,
      room: resourceKind === "rooms" ? target.resource : event.room,
      professor: resourceKind === "professors" ? target.resource : event.professor,
    } : event));
  };

  const resizeEvent = (eventId: number, edge: ResizeEdge, slotDelta: number) => {
    if (slotDelta === 0) return;
    setEvents((prev) => prev.map((event) => {
      if (event.id !== eventId) return event;
      const startSlot = slotIndexForTime(event.startHour);
      const endSlot = slotIndexForTime(event.startHour + event.duration);
      const minDurationSlots = 1;

      if (edge === "start") {
        const nextStartSlot = clamp(startSlot + slotDelta, slotIndexForTime(START_HOUR), endSlot - minDurationSlots);
        const nextStart = timeForSlotIndex(nextStartSlot);
        return { ...event, startHour: nextStart, duration: event.startHour + event.duration - nextStart };
      }

      const nextEndSlot = clamp(endSlot + slotDelta, startSlot + minDurationSlots, slotIndexForTime(END_HOUR));
      const nextEnd = timeForSlotIndex(nextEndSlot);
      return { ...event, duration: nextEnd - event.startHour };
    }));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveEventId(Number(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const target = event.over?.data.current as DropTarget | undefined;
    setHoveredDropTarget(target ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const target = event.over?.data.current as DropTarget | undefined;
    const moving = events.find((calendarEvent) => calendarEvent.id === Number(event.active.id));
    setActiveEventId(null);
    setHoveredDropTarget(null);
    if (!target || !moving) return;

    const willConflict = !!getDropConflict(events, moving, target, resourceKind);
    moveEventToSlot(moving, target);
    toast({
      title: willConflict ? "Conflito detectado." : "Sessão realocada.",
      description: willConflict ? "Há duas sessões no mesmo espaço e horário; o conflito foi marcado automaticamente." : `Início fixado em ${formatTime(target.hour)} no slot selecionado.`,
      className: cn("top-center-toast", willConflict ? "bg-destructive text-destructive-foreground border-destructive" : "bg-success text-success-foreground border-success"),
    });
  };

  const exportVisibleCsv = () => {
    const headers = ["Dia", "Inicio", "Fim", "Sala", "Docente", "Programa", "Tema", "Status"];
    const rows = visibleEvents.map((event) => [
      `${String(event.day).padStart(2, "0")}/03/${year}`,
      formatTime(event.startHour),
      formatTime(event.startHour + event.duration),
      event.room,
      event.professor,
      event.program,
      event.theme,
      event.status,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `calendario-filtrado-${year}-${String(month + 1).padStart(2, "0")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Relatório exportado.", description: `${visibleEvents.length} sessões conforme filtros atuais.`, className: "top-center-toast bg-success text-success-foreground border-success" });
  };

  const viewLabels: Record<CalendarView, string> = { day: "Dia", week: "Semana", month: "Mês", quarter: "Trimestre", semester: "Semestre", year: "Ano" };
  const quarterStart = Math.floor(month / 3) * 3;
  const semesterStart = Math.floor(month / 6) * 6;
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const weekEnd = Math.min(weekStart + 6, daysInCurrentMonth);
  const periodLabel = view === "day"
    ? `${currentDay} de ${MONTHS[month]} ${year}`
    : view === "week"
    ? `${weekStart} – ${weekEnd} de ${MONTHS[month]} ${year}`
    : view === "quarter"
    ? `${MONTHS[quarterStart]} – ${MONTHS[quarterStart + 2]} ${year}`
    : view === "semester"
    ? `${MONTHS[semesterStart]} – ${MONTHS[semesterStart + 5]} ${year}`
    : view === "year"
    ? `${year}`
    : `${MONTHS[month]} ${year}`;

  const handlePrev = () => {
    if (view === "day") {
      if (currentDay > 1) { setCurrentDay((d) => d - 1); }
      else if (month > 0) { setMonth((m) => m - 1); setCurrentDay(new Date(year, month, 0).getDate()); }
    } else if (view === "week") {
      if (weekStart > 7) { setWeekStart((w) => w - 7); }
      else if (month > 0) { setMonth((m) => m - 1); const dim = new Date(year, month, 0).getDate(); setWeekStart(Math.max(1, dim - 6)); }
    } else if (view === "quarter") {
      const newMonth = month - 3;
      if (newMonth < 0) return;
      setMonth(newMonth);
    } else if (view === "semester") {
      const newMonth = month - 6;
      if (newMonth < 0) return;
      setMonth(newMonth);
    } else if (view === "year") {
      setYear((y) => y - 1);
    } else {
      setMonth((m) => Math.max(0, m - 1));
    }
  };

  const handleNext = () => {
    if (view === "day") {
      const dim = new Date(year, month + 1, 0).getDate();
      if (currentDay < dim) { setCurrentDay((d) => d + 1); }
      else if (month < 11) { setMonth((m) => m + 1); setCurrentDay(1); }
    } else if (view === "week") {
      const dim = new Date(year, month + 1, 0).getDate();
      if (weekStart + 7 <= dim) { setWeekStart((w) => w + 7); }
      else if (month < 11) { setMonth((m) => m + 1); setWeekStart(1); }
    } else if (view === "quarter") {
      const newMonth = month + 3;
      if (newMonth > 11) return;
      setMonth(newMonth);
    } else if (view === "semester") {
      const newMonth = month + 6;
      if (newMonth > 11) return;
      setMonth(newMonth);
    } else if (view === "year") {
      setYear((y) => y + 1);
    } else {
      setMonth((m) => Math.min(11, m + 1));
    }
  };
  const daysInMonth = daysInCurrentMonth;
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  return (
    <TooltipProvider delayDuration={200}>
      <AppLayout pageTitle="Calendário Acadêmico" pageSubtitle="Visualização e gestão de sessões e eventos">
        <div className="flex flex-col h-full animate-fade-in">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <button onClick={handlePrev} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="font-display font-bold text-foreground text-sm min-w-32 text-center">{periodLabel}</h2>
              <button onClick={handleNext} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="text-xs text-primary font-medium border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5">Hoje</button>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                {(["day", "week", "month", "quarter", "semester", "year"] as CalendarView[]).map((v) => (
                  <button key={v} onClick={() => setView(v)}
                    className={cn("text-xs px-3 py-1.5 font-medium transition-colors",
                      view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
                    {viewLabels[v]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button onClick={() => setAxisOrientation("resources")}
                  className={cn("text-xs px-3 py-1.5 font-medium transition-colors", axisOrientation === "resources" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted")}>Recursos x horários</button>
                <button onClick={() => setAxisOrientation("calendar")}
                  className={cn("text-xs px-3 py-1.5 font-medium transition-colors", axisOrientation === "calendar" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted")}>Calendário</button>
              </div>
              <button onClick={() => setShowSuggestions(true)}
                className="border border-border bg-background text-foreground px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-muted">
                <CalendarPlus className="w-3.5 h-3.5" />Sugerir datas
              </button>
              <button onClick={exportVisibleCsv}
                className="border border-border bg-background text-foreground px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-muted">
                <FileDown className="w-3.5 h-3.5" />Exportar
              </button>
              <button onClick={() => setShowIncompleteGrid(true)}
                className="border border-warning/40 bg-warning/10 text-warning px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-warning/15">
                <AlertTriangle className="w-3.5 h-3.5" />Aprovar grade
              </button>
              <button onClick={() => setShowNewSession({})}
                className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90">
                <Plus className="w-3.5 h-3.5" />Nova Sessão
              </button>
            </div>
          </div>

          {/* Filters Bar (chips, sempre visível) */}
          <div className="px-6 py-3 border-b border-border bg-muted/20 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Filtros:</span>

            <FilterChip label="Mostrar" value={showMode === "free" ? "Livres" : showMode === "occupied" ? "Ocupados" : "Livres e ocupados"} active>
              <select value={showMode} onChange={(e) => setShowMode(e.target.value as ShowMode)}
                className="absolute inset-0 opacity-0 cursor-pointer">
                <option value="free">Livres</option>
                <option value="occupied">Ocupados</option>
                <option value="both">Livres e ocupados</option>
              </select>
            </FilterChip>

            <FilterChip label="Recurso" value={resourceKind === "rooms" ? "Salas" : "Docentes"} active>
              <select value={resourceKind} onChange={(e) => setResourceKind(e.target.value as ResourceKind)}
                className="absolute inset-0 opacity-0 cursor-pointer">
                <option value="rooms">Salas</option>
                <option value="professors">Docentes</option>
              </select>
            </FilterChip>

            {view === "week" && (
              <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1">
                <span className="text-xs text-muted-foreground">Dias:</span>
                {SELECTABLE_DAYS.map((day) => (
                  <button key={day} onClick={() => updateDaySelection(day)}
                    className={cn("h-6 min-w-7 rounded-md px-1.5 text-xs font-medium transition-colors", selectedDays.includes(day) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
                    aria-pressed={selectedDays.includes(day)}>
                    {day}
                  </button>
                ))}
              </div>
            )}

            {/* Tipo */}
            <FilterChip label="Tipo" value={FILTER_BY_TYPES.find((t) => t.key === filterBy)?.label ?? "Tipo"} active>
              <select value={filterBy} onChange={(e) => { setFilterBy(e.target.value as FilterByType); setSelectedRooms([]); }}
                className="absolute inset-0 opacity-0 cursor-pointer">
                {FILTER_BY_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </FilterChip>

            <RoomMultiSelect
              rooms={sidebarRooms}
              selectedRooms={selectedRooms}
              selectedRoomCategory={filterRoomCategory}
              onChangeSelectedRooms={setSelectedRooms}
              onChangeRoomCategory={(category) => { setFilterRoomCategory(category); setSelectedRooms([]); }}
            />

            {/* Docentes */}
            <FilterChip label="Docentes" value={filterProfessor || "Todos os docentes"} active={!!filterProfessor}>
              <select value={filterProfessor} onChange={(e) => setFilterProfessor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer">
                <option value="">Todos os docentes</option>
                {PROFESSORS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </FilterChip>

            {/* Status */}
            <FilterChip label="Status" value={filterStatus || "Todos os status"} active={!!filterStatus}>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="absolute inset-0 opacity-0 cursor-pointer">
                <option value="">Todos os status</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FilterChip>

            {/* Disciplinas */}
            <FilterChip label="Disciplinas" value={filterTheme || "Todas as disciplinas"} active={!!filterTheme}>
              <select value={filterTheme} onChange={(e) => setFilterTheme(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer">
                <option value="">Todas as disciplinas</option>
                {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </FilterChip>

            {/* Turmas */}
            <FilterChip label="Turmas" value={filterTurma || "Todas as turmas"} active={!!filterTurma}>
              <select value={filterTurma} onChange={(e) => setFilterTurma(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer">
                <option value="">Todas as turmas</option>
                {TURMAS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </FilterChip>

            {/* Tipo de docente */}
            <FilterChip label="Tipo de docente" value={filterProfessorType || "Todos os tipos"} active={!!filterProfessorType}>
              <select value={filterProfessorType} onChange={(e) => setFilterProfessorType(e.target.value as typeof filterProfessorType)}
                className="absolute inset-0 opacity-0 cursor-pointer">
                <option value="">Todos os tipos</option>
                <option value="ISE">ISE B. School</option>
                <option value="Convidado">Convidados</option>
                <option value="Externo">Externos</option>
              </select>
            </FilterChip>

            {hasFilters && (
              <button onClick={clearAll} className="text-xs text-destructive hover:underline flex items-center gap-1 ml-1">
                <X className="w-3 h-3" />Limpar
              </button>
            )}
          </div>

          {/* Body: calendar */}
          <div className="flex-1 flex overflow-hidden">
            {/* Calendar Content */}
            <div className="flex-1 overflow-auto">
              {/* WEEK VIEW */}
              {view === "week" && (
                axisOrientation === "resources" ? (
                  <DndContext sensors={dndSensors} collisionDetection={startReferenceCollisionDetection} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                    <ResourceTimelineGrid
                      days={weekDays}
                      resources={visibleResources}
                      resourceKind={resourceKind}
                      showMode={showMode}
                      events={displayEvents}
                      hoveredDropTarget={hoveredDropTarget}
                      onSelectEvent={setSelectedEvent}
                      onCreateSession={setShowNewSession}
                      onResizeEvent={resizeEvent}
                    />
                  </DndContext>
                ) : (
                  <div style={{ width: 'fit-content', minWidth: `${weekTotalMinW}px` }}>
                    <div className="grid border-b border-border bg-card sticky top-0 z-20" style={{ gridTemplateColumns: weekGridCols }}>
                      <div className="py-3 px-3 text-xs text-muted-foreground border-r border-border bg-card" />
                      {weekDays.slice(0, 7).map((day, i) => (
                        <div key={day} className="py-3 px-2 text-left border-r border-border last:border-r-0 bg-card">
                          <p className="text-xs text-muted-foreground">{DAYS[(i + 1) % DAYS.length]}</p>
                          <p className={cn("font-display font-bold text-base mt-0.5", day === 11 ? "text-primary" : "text-foreground")}>{day}</p>
                        </div>
                      ))}
                    </div>
                    <div className="relative">
                      {HOURS.map((hour) => (
                        <div key={hour} className="grid border-b border-border/50 min-h-[56px]" style={{ gridTemplateColumns: weekGridCols }}>
                          <div className="px-3 py-2 text-xs text-muted-foreground border-r border-border flex items-start pt-2">{hour}:00</div>
                          {weekDays.slice(0, 7).map((day) => {
                            const dayEvents = displayEvents.filter((e) => e.day === day && e.startHour === hour);
                            return (
                              <div key={day}
                                className={cn("border-r border-border/50 last:border-r-0 relative p-0.5 min-h-[56px] group/cell hover:bg-muted/30 transition-colors cursor-pointer", day === 11 && "bg-primary/3")}
                                onClick={() => setShowNewSession({ day, hour })}>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none">
                                  <Plus className="w-3.5 h-3.5 text-muted-foreground/40" />
                                </div>
                                <div className="flex gap-0.5 h-full">
                                  {dayEvents.map((ev) => (
                                    <EventCard key={ev.id} ev={ev} onClick={() => setSelectedEvent(ev)} />
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

              {/* DAY VIEW */}
              {view === "day" && (
                axisOrientation === "resources" ? (
                  <DndContext sensors={dndSensors} collisionDetection={startReferenceCollisionDetection} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                    <ResourceTimelineGrid
                      days={[currentDay]}
                      resources={visibleResources}
                      resourceKind={resourceKind}
                      showMode={showMode}
                      events={displayEvents}
                      hoveredDropTarget={hoveredDropTarget}
                      onSelectEvent={setSelectedEvent}
                      onCreateSession={setShowNewSession}
                      onResizeEvent={resizeEvent}
                    />
                  </DndContext>
                ) : (
                  <div className="min-w-[320px]">
                  <div className="grid border-b border-border sticky top-0 z-20" style={{ gridTemplateColumns: '56px 1fr' }}>
                    <div className="py-3 px-3 text-xs text-muted-foreground border-r border-border bg-card" />
                    <div className="py-3 px-4 text-left bg-card">
                      <p className="text-xs text-muted-foreground">{DAYS[new Date(year, month, currentDay).getDay()]}</p>
                      <p className="font-display font-bold text-base text-primary">{currentDay}</p>
                    </div>
                  </div>
                  {HOURS.map((hour) => {
                    const dayEvents = displayEvents.filter((e) => e.day === currentDay && e.startHour === hour);
                    return (
                      <div key={hour} className="grid border-b border-border/50 min-h-[64px]" style={{ gridTemplateColumns: '56px 1fr' }}>
                        <div className="px-3 py-2 text-xs text-muted-foreground border-r border-border">{hour}:00</div>
                        <div className="p-1 hover:bg-muted/20 cursor-pointer" onClick={() => setShowNewSession({ day: currentDay, hour })}>
                          {dayEvents.map((ev) => (
                            <EventCard key={ev.id} ev={ev} expanded onClick={() => setSelectedEvent(ev)} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                )
              )}

              {/* MONTH VIEW */}
              {view === "month" && (() => {
                const totalHours = (day: number) =>
                  displayEvents.filter((e) => e.day === day).reduce((acc, e) => acc + e.duration, 0);
                const conflictCount = (day: number) =>
                  displayEvents.filter((e) => e.day === day && e.status === "Conflito").length;
                const bgClass = (level: OccupancyLevel, isOtherMonth: boolean) => {
                  if (isOtherMonth) {
                    return level === "high" ? "bg-destructive/20 text-destructive/50"
                      : level === "medium" ? "bg-warning/20 text-warning/50"
                      : "bg-success/20 text-success/50";
                  }
                  return level === "high" ? "bg-destructive text-destructive-foreground"
                    : level === "medium" ? "bg-warning text-warning-foreground"
                    : "bg-success text-success-foreground";
                };

                // Prev month trailing days
                const prevMonthDays = new Date(year, month, 0).getDate();
                const leadingDays = Array.from({ length: firstDayOfMonth }, (_, i) => prevMonthDays - firstDayOfMonth + 1 + i);
                // Next month leading days to fill grid to multiple of 7
                const totalCells = firstDayOfMonth + daysInMonth;
                const trailingCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

                const distAcademica = displayEvents.filter((e) => e.theme !== "").length;
                const distNaoAcademica = Math.max(0, displayEvents.length - distAcademica);
                const distTotal = Math.max(1, displayEvents.length);

                return (
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-7 gap-0 rounded-xl overflow-hidden border border-border">
                      {/* Header */}
                      {["DOMINGO","SEGUNDA","TERÇA","QUARTA","QUINTA","SEXTA","SÁBADO"].map((d) => (
                        <div key={d} className="bg-muted/30 py-2 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wide border-b border-r border-border last:border-r-0">{d}</div>
                      ))}
                      {/* Leading days (prev month) */}
                      {leadingDays.map((d) => {
                        const level = getOccupancyLevel(events, d);
                        const hrs = totalHours(d);
                        return (
                          <div key={`prev-${d}`} className={cn("min-h-[96px] border-b border-r border-border flex flex-col items-center justify-center gap-1 cursor-pointer", bgClass(level, true))}>
                            <p className="text-xs font-bold opacity-60">{d}</p>
                            {hrs > 0 && <p className="text-[10px] font-medium opacity-50">{hrs}h totais</p>}
                          </div>
                        );
                      })}
                      {/* Current month days */}
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                        const level = getOccupancyLevel(events, day);
                        const hrs = totalHours(day);
                        const conflicts = conflictCount(day);
                        const isToday = day === 11;
                        return (
                          <Tooltip key={day}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn("min-h-[96px] border-b border-r border-border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-opacity hover:opacity-85 relative", bgClass(level, false), isToday && "ring-2 ring-inset ring-white/60")}
                                onClick={() => setShowNewSession({ day })}
                              >
                                {conflicts > 0 && (
                                  <AlertTriangle className="w-4 h-4 absolute top-2 right-2 opacity-80" />
                                )}
                                <p className="text-sm font-bold">{day}</p>
                                {hrs > 0 && <p className="text-xs font-medium opacity-80">{hrs}h totais</p>}
                              </div>
                            </TooltipTrigger>
                            <OccupancyTooltip day={day} events={events} />
                          </Tooltip>
                        );
                      })}
                      {/* Trailing days (next month) */}
                      {Array.from({ length: trailingCount }, (_, i) => i + 1).map((d) => {
                        const level = getOccupancyLevel(events, d);
                        const hrs = totalHours(d);
                        return (
                          <div key={`next-${d}`} className={cn("min-h-[96px] border-b border-r border-border last:border-r-0 flex flex-col items-center justify-center gap-1 cursor-pointer", bgClass(level, true))}>
                            <p className="text-xs font-bold opacity-60">{d}</p>
                            {hrs > 0 && <p className="text-[10px] font-medium opacity-50">{hrs}h totais</p>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <p className="font-medium">Legenda:</p>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success inline-block" />Livre</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" />Média ocupação</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-destructive inline-block" />Alta ocupação</span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 flex items-center justify-center text-[9px] shrink-0">i</span>
                      Consideramos alocados apenas os recursos confirmados, desconsiderando rascunhos e pré-reservas
                    </p>

                    {/* Distribution */}
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-foreground">Distribuição por atividades</p>
                      {[
                        { label: "Atividades acadêmicas", count: 245, pct: 57, color: "bg-primary" },
                        { label: "Atividades não acadêmicas", count: 108, pct: 25, color: "bg-muted-foreground/40" },
                      ].map((item) => (
                        <div key={item.label} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 font-medium text-foreground">
                              <span className={cn("w-3 h-3 rounded-sm inline-block", item.color)} />
                              {item.label}
                            </span>
                            <span className="text-muted-foreground">{item.count} sessões ({item.pct}%)</span>
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* QUARTER VIEW */}
              {view === "quarter" && (() => {
                const qStart = Math.floor(month / 3) * 3;
                const months3 = [qStart, qStart + 1, qStart + 2];

                // Mock weekly occupancy data per month (4-5 weeks each)
                const mockWeeklyOccupancy: Record<number, number[]> = {
                  0: [10, 26, 90, 70], 1: [10, 26, 90, 70], 2: [10, 26, 90, 70, 80],
                  3: [15, 30, 60, 45], 4: [20, 20, 50, 35], 5: [25, 45, 70, 60],
                  6: [30, 50, 80, 65], 7: [10, 35, 55, 40], 8: [20, 60, 85, 55],
                  9: [15, 40, 70, 50], 10: [25, 55, 65, 45], 11: [10, 20, 45, 30],
                };

                const weekOccupancyColor = (pct: number) =>
                  pct >= 70 ? "bg-destructive" : pct >= 40 ? "bg-warning" : "bg-success";

                const activityCount = (mIdx: number) => {
                  const base = [14, 34, 60, 16, 16, 16, 18, 22, 28, 20, 14, 12];
                  return base[mIdx] ?? 14;
                };

                const distAcademica = months3.reduce((acc, m) => acc + activityCount(m), 0);
                const distNaoAcademica = Math.round(distAcademica * 0.44);
                const distTotal = distAcademica + distNaoAcademica + Math.round(distAcademica * 0.1);

                return (
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                      {/* Month cards */}
                      {months3.map((mIdx) => {
                        const weeks = mockWeeklyOccupancy[mIdx] ?? [10, 30, 50, 40];
                        return (
                          <div key={mIdx} className="border border-border rounded-xl overflow-hidden bg-card">
                            <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                              <p className="text-sm font-bold text-foreground">{MONTHS[mIdx]}</p>
                              <span className="text-xs text-muted-foreground">{activityCount(mIdx)} Atividades</span>
                            </div>
                            <div className="p-4 space-y-2.5">
                              <p className="text-xs font-semibold text-muted-foreground">Ocupação geral por semana</p>
                              {weeks.map((pct, wi) => (
                                <div key={wi} className="space-y-1">
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{wi + 1} semana</span>
                                    <span className="font-medium text-foreground">{pct}%</span>
                                  </div>
                                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full transition-all", weekOccupancyColor(pct))} style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {/* Distribution card */}
                      <div className="border border-border rounded-xl overflow-hidden bg-card">
                        <div className="px-4 py-3 border-b border-border bg-muted/20">
                          <p className="text-sm font-bold text-foreground">Distribuição por atividades</p>
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-2 font-medium text-foreground">
                                <span className="w-3 h-3 rounded-sm bg-primary inline-block" />
                                Atividades acadêmicas
                              </span>
                              <span className="text-muted-foreground">{distAcademica} sessões ({Math.round((distAcademica / distTotal) * 100)}%)</span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.round((distAcademica / distTotal) * 100)}%` }} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-2 font-medium text-foreground">
                                <span className="w-3 h-3 rounded-sm bg-muted-foreground/40 inline-block" />
                                Atividades não acadêmicas
                              </span>
                              <span className="text-muted-foreground">{distNaoAcademica} sessões ({Math.round((distNaoAcademica / distTotal) * 100)}%)</span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-muted-foreground/40 rounded-full" style={{ width: `${Math.round((distNaoAcademica / distTotal) * 100)}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <p className="font-medium">Legenda:</p>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success inline-block" />Livre</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" />Média ocupação</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-destructive inline-block" />Alta ocupação</span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 flex items-center justify-center text-[9px]">i</span>
                      Consideramos alocados apenas os recursos confirmados, desconsiderando rascunhos e pré-reservas
                    </p>
                  </div>
                );
              })()}

              {/* SEMESTER VIEW */}
              {view === "semester" && (() => {
                const sStart = Math.floor(month / 6) * 6;
                const months6 = Array.from({ length: 6 }, (_, i) => sStart + i);

                const monthOccupancy: Record<number, number> = {
                  0: 10, 1: 60, 2: 90, 3: 15, 4: 20, 5: 70,
                  6: 35, 7: 50, 8: 80, 9: 25, 10: 45, 11: 10,
                };
                const activityCount = (mIdx: number) => {
                  const base = [14, 34, 60, 16, 16, 16, 18, 22, 28, 20, 14, 12];
                  return base[mIdx] ?? 14;
                };
                const barColor = (pct: number) =>
                  pct >= 70 ? "bg-destructive" : pct >= 40 ? "bg-warning" : "bg-success";

                return (
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {months6.map((mIdx) => {
                        const pct = monthOccupancy[mIdx] ?? 20;
                        return (
                          <div key={mIdx} className="border border-border rounded-xl overflow-hidden bg-card">
                            <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                              <p className="text-sm font-bold text-foreground">{MONTHS[mIdx]}</p>
                              <span className="text-xs text-muted-foreground">{activityCount(mIdx)} Atividades</span>
                            </div>
                            <div className="p-5 space-y-3">
                              <div className="text-center">
                                <p className="font-display font-black text-5xl text-foreground">{pct}%</p>
                                <p className="text-xs text-muted-foreground mt-1">Ocupação geral</p>
                              </div>
                              <div className="h-6 bg-muted rounded-lg overflow-hidden">
                                <div className={cn("h-full rounded-lg transition-all duration-500", barColor(pct))} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Distribution section */}
                    <div className="border border-border rounded-xl p-4 bg-card space-y-3">
                      <p className="text-sm font-bold text-foreground">Distribuição por atividades</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { label: "Atividades acadêmicas", count: 245, pct: 57, color: "bg-primary" },
                          { label: "Atividades não acadêmicas", count: 108, pct: 25, color: "bg-muted-foreground/40" },
                        ].map((item) => (
                          <div key={item.label} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-2 font-medium text-foreground">
                                <span className={cn("w-3 h-3 rounded-sm inline-block", item.color)} />
                                {item.label}
                              </span>
                              <span className="text-muted-foreground">{item.count} sessões ({item.pct}%)</span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <p className="font-medium">Legenda:</p>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success inline-block" />Baixa ocupação</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" />Média ocupação</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-destructive inline-block" />Alta ocupação</span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 flex items-center justify-center text-[9px]">i</span>
                      Consideramos alocados apenas os recursos confirmados, desconsiderando rascunhos e pré-reservas
                    </p>
                  </div>
                );
              })()}

              {/* YEAR VIEW */}
              {view === "year" && (
                <div className="p-6">
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    {MONTHS.map((monthName, mIdx) => {
                      const daysInM = new Date(year, mIdx + 1, 0).getDate();
                      const firstDay = new Date(year, mIdx, 1).getDay();
                      return (
                        <div key={monthName} className={cn("border border-border rounded-xl p-3 hover:border-primary/40 cursor-pointer", mIdx === 2 && "border-primary/30 bg-primary/3")}>
                          <p className={cn("text-xs font-semibold mb-2", mIdx === 2 ? "text-primary" : "text-foreground")}>{monthName}</p>
                          <div className="grid grid-cols-7 gap-0 text-center">
                            {DAYS.map((d) => <div key={d} className="text-xs text-muted-foreground/60 pb-0.5">{d[0]}</div>)}
                            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                            {Array.from({ length: daysInM }).map((_, i) => {
                              const d = i + 1;
                              const hasEv = mIdx === 2 && displayEvents.some((e) => e.day === d);
                              const level = getOccupancyLevel(events, d);
                              return (
                                <Tooltip key={d}>
                                  <TooltipTrigger asChild>
                                    <div className={cn("text-xs rounded-sm h-4 flex items-center justify-center border", hasEv ? occupancyClassMap[level] : "border-transparent text-muted-foreground")}>
                                      {d}
                                    </div>
                                  </TooltipTrigger>
                                  {mIdx === 2 && <OccupancyTooltip day={d} events={events} />}
                                </Tooltip>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Painel direito (insights) — recolhível */}
            <RightInsightsPanel
              open={rightPanelOpen}
              onToggle={() => setRightPanelOpen((v) => !v)}
              events={displayEvents}
              view={view}
              onChangeView={setView}
              month={month}
              year={year}
              onPrevMonth={() => setMonth((m) => Math.max(0, m - 1))}
              onNextMonth={() => setMonth((m) => Math.min(11, m + 1))}
              onSelectDay={(d) => {
                if (view === "day") { setCurrentDay(d); }
                else if (view === "week") { setWeekStart(d); }
                else { setSelectedDays([d]); }
              }}
            />
          </div>

          {/* Legend */}
          <div className="border-t border-border px-6 py-2 bg-card flex items-center gap-4 flex-wrap">
            <p className="text-xs text-muted-foreground font-medium">Legenda:</p>
            {[
              { label: "Reservado", color: "primary" },
              { label: "Confirmado", color: "success" },
              { label: "Pré-Reserva", color: "warning" },
              { label: "Conflito", color: "destructive" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full", {
                  "bg-primary": l.color === "primary",
                  "bg-success": l.color === "success",
                  "bg-warning": l.color === "warning",
                  "bg-destructive": l.color === "destructive",
                })} />
                <span className="text-xs text-muted-foreground">{l.label}</span>
              </div>
            ))}
            {hasFilters && (
              <span className="text-xs text-primary font-medium ml-auto">
                {visibleEvents.length} sessão{visibleEvents.length !== 1 ? "ões" : ""} visível{visibleEvents.length !== 1 ? "eis" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Modals */}
        {showNewSession !== null && (
          <NewSessionModal defaultDay={showNewSession.day} defaultHour={showNewSession.hour}
            onSave={handleAddSession} onClose={() => setShowNewSession(null)} />
        )}
        {selectedEvent && (
          <EventDetailsModal event={selectedEvent}
            onSave={(updated) => {
              setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
              setSelectedEvent(null);
              toast({ title: "Sessão atualizada.", description: `"${updated.title}" foi salva.`, className: "top-center-toast bg-success text-success-foreground border-success" });
            }}
            onDelete={(id) => {
              setEvents((prev) => prev.filter((e) => e.id !== id));
              setSelectedEvent(null);
              toast({ title: "Sessão excluída.", className: "top-center-toast bg-destructive text-destructive-foreground border-destructive" });
            }}
            onClose={() => setSelectedEvent(null)} />
        )}
        {showIncompleteGrid && (
          <IncompleteGridModal
            emptySlots={emptySlotCount}
            onConfirm={() => {
              setShowIncompleteGrid(false);
              toast({ title: "Grade enviada para aprovação.", description: "A confirmação registrou os espaços livres como pendências permitidas.", className: "top-center-toast bg-success text-success-foreground border-success" });
            }}
            onCancel={() => setShowIncompleteGrid(false)}
          />
        )}
        {showSuggestions && (
          <DateSuggestionModal
            events={events}
            selectedDays={selectedDays}
            onApply={(days) => {
              setSelectedDays(days);
              setShowSuggestions(false);
            }}
            onClose={() => setShowSuggestions(false)}
          />
        )}
      </AppLayout>
    </TooltipProvider>
  );
}

// ── Subcomponents ──────────────────────────────────────────────────
function ResourceTimelineGrid({
  days, resources, resourceKind, showMode, events, hoveredDropTarget, onSelectEvent, onCreateSession, onResizeEvent,
}: {  
  days: number[];
  resources: string[];
  resourceKind: ResourceKind;
  showMode: ShowMode;
  events: CalendarEvent[];
  hoveredDropTarget: DropTarget | null;
  onSelectEvent: (event: CalendarEvent) => void;
  onCreateSession: (slot: { day?: number; hour?: number }) => void;
  onResizeEvent: (eventId: number, edge: ResizeEdge, slotDelta: number) => void;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [slotWidth, setSlotWidth] = useState(36);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const scrollCont = el.closest(".overflow-auto") as HTMLElement | null;
    if (!scrollCont) return;
    const update = () => {
      setScrollLeft(scrollCont.scrollLeft);
      setSlotWidth(Math.max(36, (scrollCont.scrollWidth - 180) / TIME_SLOTS.length));
    };
    update();
    scrollCont.addEventListener("scroll", update, { passive: true });
    const obs = new ResizeObserver(update);
    obs.observe(scrollCont);
    return () => {
      scrollCont.removeEventListener("scroll", update);
      obs.disconnect();
    };
  }, []);

  // First visible slot index (using Math.ceil so only fully-visible slots are counted)
  const visibleStartSlot = Math.ceil(scrollLeft / slotWidth);

  return (
    <div ref={gridRef} className="w-full" style={{ minWidth: `${180 + TIME_SLOTS.length * 36}px` }}>
      <div className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="flex">
          <div className="sticky left-0 z-30 w-[180px] shrink-0 border-r border-border bg-card px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {resourceKind === "rooms" ? "Salas" : "Docentes"}
          </div>
          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${TIME_SLOTS.length}, minmax(36px, 1fr))` }}>
            {HOURS.map((hour) => (
              <div key={hour} className="border-r border-border px-2 py-3 text-center text-xs font-semibold text-foreground last:border-r-0" style={{ gridColumn: `span ${SLOTS_PER_HOUR}` }}>
                {String(hour).padStart(2, "0")}:00
              </div>
            ))}
          </div>
        </div>
      </div>

      {days.map((day) => (
        <section key={day} className="border-b border-border bg-background">
          <div className="sticky top-[41px] z-40 flex items-center justify-between border-b border-border bg-card px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">{day}/Mar</span>
              <span className="text-xs text-muted-foreground">{resources.length} recursos · foco em {showMode === "free" ? "disponibilidade" : showMode === "occupied" ? "ocupação" : "visão completa"}</span>
            </div>
            <span className="text-xs text-muted-foreground">Arraste uma sessão para realocar com snap</span>
          </div>

          {resources.map((resource) => {
            const rowEvents = events.filter((event) => event.day === day && getResourceForEvent(event, resourceKind) === resource && isVisibleStart(event.startHour));
            const { laneByEventId, laneCount } = getEventLanes(rowEvents);
            const rowHeight = laneCount * LANE_HEIGHT;

            return (
              <div key={`${day}-${resource}`} className="flex border-b border-border/50 last:border-b-0 bg-card">
                {/* Sticky resource label */}
                <div className="sticky left-0 z-30 w-[180px] shrink-0 flex flex-col justify-center border-r border-border bg-card px-3" style={{ minHeight: rowHeight }}>
                  <span className="truncate text-xs font-semibold text-foreground">{resource}</span>
                  <span className="text-[10px] text-muted-foreground">{resourceKind === "rooms" ? roomCategory(resource) : PROFESSOR_TYPE[resource]}</span>
                </div>
                {/* Timeline area: slots layer (bottom) + cards layer (top) */}
                <div data-timeline-area className="relative flex-1" style={{ height: rowHeight }}>
                  {/* Layer 1 — drop target cells, single grid, fills full height */}
                  <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${TIME_SLOTS.length}, minmax(36px, 1fr))` }}>
                    {TIME_SLOTS.map((hour) => (
                      <DroppableTimelineCell
                        key={`${day}-${resource}-${hour}`}
                        day={day}
                        hour={hour}
                        resource={resource}
                        isHovered={hoveredDropTarget?.day === day && hoveredDropTarget.hour === hour && hoveredDropTarget.resource === resource}
                        onCreateSession={onCreateSession}
                      />
                    ))}
                  </div>
                  {/* Layer 2 — event cards, same grid template as slots → alinhamento garantido */}
                  <div
                    className="absolute inset-0 grid pointer-events-none"
                    style={{
                      gridTemplateColumns: `repeat(${TIME_SLOTS.length}, minmax(36px, 1fr))`,
                      gridTemplateRows: `repeat(${laneCount}, ${LANE_HEIGHT}px)`,
                    }}
                  >
                    {rowEvents.map((event) => {
                      const laneIndex = laneByEventId.get(event.id) ?? 0;
                      const startIndex = slotIndexForTime(event.startHour);
                      const rawDuration = Math.min(
                        slotIndexForTime(event.duration + START_HOUR) - slotIndexForTime(START_HOUR),
                        TIME_SLOTS.length - startIndex,
                      );
                      const endIndex = startIndex + rawDuration;
                      const clippedStart = Math.max(startIndex, visibleStartSlot);
                      const clippedDuration = endIndex - clippedStart;
                      if (clippedDuration <= 0) return null;
                      return (
                        <div
                          key={event.id}
                          data-timeline-event
                          className="pointer-events-auto z-20 p-1"
                          style={{ gridColumn: `${clippedStart + 1} / span ${clippedDuration}`, gridRow: laneIndex + 1 }}
                        >
                          <DraggableEventCard ev={event} onClick={() => onSelectEvent(event)} onResize={onResizeEvent} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}

function RoomMultiSelect({
  rooms, selectedRooms, selectedRoomCategory, onChangeSelectedRooms, onChangeRoomCategory,
}: {
  rooms: string[];
  selectedRooms: string[];
  selectedRoomCategory: "" | "plenaria" | "auditorio" | "equipe" | "refeitorio";
  onChangeSelectedRooms: (rooms: string[]) => void;
  onChangeRoomCategory: (category: "" | "plenaria" | "auditorio" | "equipe" | "refeitorio") => void;
}) {
  const allVisibleSelected = rooms.length > 0 && selectedRooms.length === rooms.length && rooms.every((room) => selectedRooms.includes(room));
  const label = selectedRooms.length > 0 ? `${selectedRooms.length} selecionada${selectedRooms.length === 1 ? "" : "s"}` : (
    selectedRoomCategory === "plenaria" ? "Plenárias" :
    selectedRoomCategory === "auditorio" ? "Auditórios" :
    selectedRoomCategory === "equipe" ? "Salas de equipe" :
    selectedRoomCategory === "refeitorio" ? "Refeitórios" : "Todos os espaços"
  );

  const toggleRoom = (room: string) => {
    onChangeSelectedRooms(selectedRooms.includes(room) ? selectedRooms.filter((selectedRoom) => selectedRoom !== room) : [...selectedRooms, room]);
  };

  const categories = [
    { value: "" as const, label: "Todos" },
    { value: "plenaria" as const, label: "Plenárias" },
    { value: "auditorio" as const, label: "Auditórios" },
    { value: "equipe" as const, label: "Salas" },
    { value: "refeitorio" as const, label: "Refeitórios" },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/40",
          selectedRooms.length > 0 || selectedRoomCategory ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground",
        )}>
          <span className="text-muted-foreground">Espaços:</span>
          <span className="font-medium">{label}</span>
          <ChevronRight className="h-3 w-3 rotate-90 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[360px] p-0">
        <Command>
          <CommandInput placeholder="Buscar plenária, auditório ou sala..." />
          <div className="flex flex-wrap gap-1 border-b border-border p-2">
            {categories.map((category) => (
              <button key={category.label} onClick={() => onChangeRoomCategory(category.value)}
                className={cn("rounded-md px-2 py-1 text-xs font-medium transition-colors", selectedRoomCategory === category.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
                type="button">
                {category.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between border-b border-border px-2 py-2">
            <button type="button" onClick={() => onChangeSelectedRooms(allVisibleSelected ? [] : [...rooms])}
              className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10">
              {allVisibleSelected ? "Limpar seleção" : "Selecionar todas"}
            </button>
            <span className="text-xs text-muted-foreground">{rooms.length} opções</span>
          </div>
          <CommandList>
            <CommandEmpty>Nenhum espaço encontrado.</CommandEmpty>
            <CommandGroup heading="Espaços disponíveis">
              {rooms.map((room) => {
                const checked = selectedRooms.includes(room);
                return (
                  <CommandItem key={room} value={`${room} ${roomCategory(room)}`} onSelect={() => toggleRoom(room)} className="gap-2">
                    <span className={cn("flex h-4 w-4 items-center justify-center rounded-sm border", checked ? "border-primary bg-primary text-primary-foreground" : "border-input")}>{checked && <Check className="h-3 w-3" />}</span>
                    <span className="flex-1 truncate">{room}</span>
                    <span className="text-[10px] text-muted-foreground">{roomCategory(room)}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DroppableTimelineCell({
  day, hour, resource, isHovered, onCreateSession,
}: {
  day: number;
  hour: number;
  resource: string;
  isHovered: boolean;
  onCreateSession: (slot: { day?: number; hour?: number }) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-${day}-${resource}-${hour}`,
    data: { day, hour, resource } satisfies DropTarget,
  });

  return (
    <div
      ref={setNodeRef}
      onClick={() => onCreateSession({ day, hour })}
      className={cn(
        "h-full border-r border-border/30 transition-colors last:border-r-0 hover:bg-muted/20",
        (isOver || isHovered) && "ring-2 ring-primary/40 ring-inset bg-primary/5",
      )}
    />
  );
}

function DraggableEventCard({ ev, onClick, onResize }: { ev: CalendarEvent; onClick: () => void; onResize: (eventId: number, edge: ResizeEdge, slotDelta: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ev.id,
    data: { event: ev },
  });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  const handleResizePointerDown = (edge: ResizeEdge) => (pointerEvent: ReactPointerEvent<HTMLSpanElement>) => {
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();
    const eventWrapper = pointerEvent.currentTarget.closest<HTMLElement>("[data-timeline-event]");
    const timelineArea = pointerEvent.currentTarget.closest<HTMLElement>("[data-timeline-area]");
    if (!eventWrapper || !timelineArea) return;

    const areaRect = timelineArea.getBoundingClientRect();
    const slotWidth = areaRect.width / TIME_SLOTS.length;
    const startX = pointerEvent.clientX;
    let appliedSlotDelta = 0;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const nextSlotDelta = Math.round((moveEvent.clientX - startX) / slotWidth);
      const incrementalDelta = nextSlotDelta - appliedSlotDelta;
      if (incrementalDelta === 0) return;
      appliedSlotDelta = nextSlotDelta;
      onResize(ev.id, edge, incrementalDelta);
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          ref={setNodeRef}
          type="button"
          style={style}
          className={cn(
            "h-full min-h-12 w-full rounded-md border-l-2 px-1.5 py-1 text-left shadow-sm transition-opacity focus:outline-none focus:ring-2 focus:ring-ring",
            colorMap[ev.color],
            isDragging && "z-50 opacity-70 shadow-lg",
          )}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          {...listeners}
          {...attributes}
        >
          <span onPointerDown={handleResizePointerDown("start")} className="absolute inset-y-1 left-0 z-30 w-2 cursor-ew-resize rounded-l-md bg-foreground/0 hover:bg-foreground/15" aria-label="Redimensionar início" />
          <span className="block truncate text-[11px] font-semibold leading-tight">{ev.title}</span>
          <span className="block truncate text-[10px] opacity-75">{formatTimeRange(ev.startHour, ev.duration)}</span>
          <span onPointerDown={handleResizePointerDown("end")} className="absolute inset-y-1 right-0 z-30 w-2 cursor-ew-resize rounded-r-md bg-foreground/0 hover:bg-foreground/15" aria-label="Redimensionar fim" />
        </button>
      </TooltipTrigger>
      <EventTooltip ev={ev} />
    </Tooltip>
  );
}

function OccupancyTooltip({ day, events }: { day: number; events: CalendarEvent[] }) {
  const dayEvents = events.filter((event) => event.day === day);
  const occupiedRooms = Array.from(new Set(dayEvents.map((event) => event.room)));
  const freeRooms = ROOMS.filter((room) => !occupiedRooms.includes(room));

  return (
    <TooltipContent className="max-w-sm border-border bg-popover p-3 text-popover-foreground opacity-100 shadow-xl backdrop-blur-none">
      <div className="space-y-2">
        <div>
          <p className="text-sm font-semibold">{day}/Mar · ocupação</p>
          <p className="text-xs text-muted-foreground">{occupiedRooms.length} salas ocupadas · {freeRooms.length} salas livres</p>
        </div>
        <div className="space-y-1">
          {dayEvents.slice(0, 6).map((event) => (
            <div key={event.id} className="rounded-md bg-muted/50 px-2 py-1 text-xs">
              <p className="font-medium text-foreground">{event.room}</p>
              <p className="text-muted-foreground">{event.program} · {formatTimeRange(event.startHour, event.duration)}</p>
            </div>
          ))}
          {dayEvents.length === 0 && <p className="text-xs text-success">Todas as salas estão livres neste dia.</p>}
        </div>
        <p className="text-xs text-muted-foreground">Livres: {freeRooms.slice(0, 8).join(", ")}{freeRooms.length > 8 ? "..." : ""}</p>
      </div>
    </TooltipContent>
  );
}

function IncompleteGridModal({ emptySlots, onConfirm, onCancel }: { emptySlots: number; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-warning/10 p-2 text-warning"><AlertTriangle className="h-5 w-5" /></div>
          <div>
            <h2 className="font-display text-base font-bold text-foreground">Grade incompleta</h2>
            <p className="mt-1 text-sm text-muted-foreground">Foram encontrados {emptySlots} horários livres nos recursos e dias visíveis. A aprovação pode seguir, mas ficará registrada como pendente de fechamento.</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">Revisar</button>
          <button onClick={onConfirm} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Confirmar mesmo assim</button>
        </div>
      </div>
    </div>
  );
}

function DateSuggestionModal({ events, selectedDays, onApply, onClose }: {
  events: CalendarEvent[];
  selectedDays: number[];
  onApply: (days: number[]) => void;
  onClose: () => void;
}) {
  const suggestions = SELECTABLE_DAYS.map((day) => {
    const occupiedRooms = new Set(events.filter((event) => event.day === day).map((event) => event.room)).size;
    const occupiedProfessors = new Set(events.filter((event) => event.day === day).map((event) => event.professor)).size;
    const score = Math.max(0, 100 - Math.round((occupiedRooms / ROOMS.length) * 70) - occupiedProfessors * 3);
    return { day, score, occupiedRooms, freeRooms: ROOMS.length - occupiedRooms };
  }).sort((a, b) => b.score - a.score);
  const recommendedDays = suggestions.slice(0, 3).map((suggestion) => suggestion.day).sort((a, b) => a - b);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
          <div>
            <h2 className="font-display text-base font-bold text-foreground">Sugestões automáticas de datas</h2>
            <p className="mt-1 text-sm text-muted-foreground">Mock considera salas e docentes livres, priorizando menor ocupação nos dias disponíveis.</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {suggestions.slice(0, 6).map((suggestion) => (
            <button key={suggestion.day} onClick={() => onApply([suggestion.day])}
              className={cn("rounded-lg border p-3 text-left transition-colors hover:bg-muted/40", selectedDays.includes(suggestion.day) ? "border-primary bg-primary/5" : "border-border bg-background")}> 
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold text-foreground">{suggestion.day}/Mar</span>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">{suggestion.score}%</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{suggestion.freeRooms} salas livres · {suggestion.occupiedRooms} ocupadas</p>
            </button>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">Fechar</button>
          <button onClick={() => onApply(recommendedDays)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Aplicar melhores datas</button>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, value, active, children }: { label: string; value: string; active?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("relative inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border bg-background hover:bg-muted/40 transition-colors cursor-pointer",
      active ? "border-primary text-primary bg-primary/5" : "border-border text-foreground")}>
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
      <ChevronRight className="w-3 h-3 rotate-90 opacity-60" />
      {children}
    </div>
  );
}

function EventCard({ ev, onClick, expanded }: { ev: CalendarEvent; onClick: () => void; expanded?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "rounded-md border-l-2 px-1.5 py-1 cursor-pointer hover:opacity-90 transition-opacity z-10 relative overflow-hidden",
            expanded ? "mb-1 w-full" : "flex-1 min-w-0",
            colorMap[ev.color],
          )}
          style={{ minHeight: expanded ? undefined : `${ev.duration * 14}px` }}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          <p className="text-[11px] font-semibold leading-tight truncate">{ev.title}</p>
          <p className="text-[10px] opacity-70 truncate">{ev.room}{expanded ? ` · ${ev.professor}` : ""}</p>
        </div>
      </TooltipTrigger>
      <EventTooltip ev={ev} />
    </Tooltip>
  );
}

function EventTooltip({ ev }: { ev: CalendarEvent }) {
  return (
    <TooltipContent
      side="right"
      collisionPadding={{ top: 90, right: 8, bottom: 8, left: 8 }}
      className="z-[200] max-w-xs space-y-1.5 border-border bg-card p-3 text-card-foreground opacity-100 shadow-xl backdrop-blur-none"
    >
      <p className="font-semibold text-sm">{ev.title}</p>
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-1.5"><Clock className="w-3 h-3 opacity-70" /><span>Seg 11/03 · {formatTimeRange(ev.startHour, ev.duration)}</span></div>
        <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 opacity-70" /><span>{ev.room} <span className="opacity-60">({roomCategory(ev.room)})</span></span></div>
        <div className="flex items-center gap-1.5"><User className="w-3 h-3 opacity-70" /><span>{ev.professor}</span></div>
        <div className="flex items-center gap-1.5"><GraduationCap className="w-3 h-3 opacity-70" /><span>{ev.program}</span></div>
        <div className="flex items-center gap-1.5"><Tag className="w-3 h-3 opacity-70" /><span>{ev.theme}</span></div>
        <div className="flex items-center gap-1.5"><Layers className="w-3 h-3 opacity-70" /><span>Status: {ev.status}</span></div>
      </div>
    </TooltipContent>
  );
}

// ── Right Insights Panel (recolhível) ──────────────────────────────
function RightInsightsPanel({
  open, onToggle, events, view, onChangeView, month, year, onPrevMonth, onNextMonth, onSelectDay,
}: {
  open: boolean;
  onToggle: () => void;
  events: CalendarEvent[];
  view: CalendarView;
  onChangeView: (v: CalendarView) => void;
  month: number;
  year: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (day: number) => void;
}) {
  // Considerar eventos do dia 11 como "período corresponde à visualização" para insights rápidos
  const periodEvents = events;
  const totalSlots = HOURS.length * ROOMS.length;
  const occupiedSlotHours = periodEvents.reduce((acc, e) => acc + e.duration, 0);
  const occupancy = Math.min(100, Math.round((occupiedSlotHours / totalSlots) * 100));

  const byStatus = STATUSES.map((s) => ({
    status: s,
    count: periodEvents.filter((e) => e.status === s).length,
  }));
  const total = Math.max(1, periodEvents.length);

  const statusColor = (s: Status) =>
    s === "Conflito" ? "bg-destructive" :
    s === "Pré-reservado" ? "bg-warning" :
    s === "Rascunho" ? "bg-muted-foreground" : "bg-primary";

  // Mini-calendário
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  if (!open) {
    return (
      <aside className="w-10 border-l border-border bg-card shrink-0 flex flex-col items-center py-3">
        <button onClick={onToggle} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" title="Abrir painel">
          <PanelRightOpen className="w-4 h-4" />
        </button>
        <div className="mt-3 flex flex-col items-center gap-3 text-muted-foreground">
          <BarChart3 className="w-4 h-4" />
          <CalendarPlus className="w-4 h-4" />
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 border-l border-border bg-card overflow-y-auto shrink-0">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Insights do Período</p>
        <button onClick={onToggle} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" title="Recolher painel">
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {/* Mini-calendário */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onPrevMonth} className="p-1 rounded hover:bg-muted text-muted-foreground"><ChevronLeft className="w-3.5 h-3.5" /></button>
          <p className="text-xs font-semibold text-foreground">{MONTHS[month]} {year}</p>
          <button onClick={onNextMonth} className="p-1 rounded hover:bg-muted text-muted-foreground"><ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {DAYS.map((d) => <div key={d} className="text-[10px] text-muted-foreground py-0.5">{d[0]}</div>)}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const isToday = d === 11;
            return (
              <div key={d}
                onClick={() => { if (view === "day") { onSelectDay(d); onChangeView("day"); } }}
                className={cn(
                  "text-[10px] h-6 flex items-center justify-center rounded-full cursor-pointer hover:bg-muted",
                  isToday && "bg-primary text-primary-foreground font-bold hover:bg-primary",
                  view === "day" && !isToday && "hover:bg-primary/20",
                )}>{d}</div>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">Hoje: 11/03 Segunda</p>
      </div>

      {/* Seletor de visualização */}
      <div className="px-4 py-3 border-b border-border space-y-1">
        {(["week", "day", "month", "quarter", "semester", "year"] as CalendarView[]).map((v) => (
          <button key={v} onClick={() => onChangeView(v)}
            className={cn("w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors",
              view === v ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted")}>
            {v === "week" ? "Semana" : v === "day" ? "Dia" : v === "month" ? "Mês" : v === "quarter" ? "Trimestre" : v === "semester" ? "Semestre" : "Ano"}
          </button>
        ))}
      </div>

      {/* Taxa de ocupação */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <p className="text-[11px] font-semibold text-foreground">Taxa de ocupação</p>
        </div>
        <div className="flex items-baseline gap-1.5 mb-1">
          <p className="font-display font-bold text-2xl text-foreground">{occupancy}%</p>
          <p className="text-[10px] text-muted-foreground">do período visível</p>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden flex">
          <div className="bg-primary" style={{ width: `${occupancy * 0.55}%` }} />
          <div className="bg-success" style={{ width: `${occupancy * 0.25}%` }} />
          <div className="bg-warning" style={{ width: `${occupancy * 0.12}%` }} />
          <div className="bg-destructive" style={{ width: `${occupancy * 0.08}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-1 mt-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />Reservado</div>
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />Confirmado</div>
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-warning inline-block" />Pré-reserva</div>
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />Conflito</div>
        </div>
      </div>

      {/* Distribuição por status */}
      <div className="px-4 py-3 border-b border-border">
        <p className="text-[11px] font-semibold text-foreground mb-2">Distribuição por status</p>
        <div className="space-y-2">
          {byStatus.map((b) => {
            const pct = Math.round((b.count / total) * 100);
            return (
              <div key={b.status}>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5">
                  <span>{b.status}</span>
                  <span>{b.count} · {pct}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full", statusColor(b.status))} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="px-4 py-3 space-y-1.5">
        <button className="w-full flex items-center gap-2 text-xs px-2.5 py-2 rounded-lg border border-border hover:bg-muted text-foreground">
          <Ban className="w-3.5 h-3.5" />Registrar bloqueio
        </button>
        <button className="w-full flex items-center gap-2 text-xs px-2.5 py-2 rounded-lg border border-border hover:bg-muted text-foreground">
          <FileDown className="w-3.5 h-3.5" />Exportar Relatório
        </button>
        <button className="w-full flex items-center gap-2 text-xs px-2.5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium justify-center">
          <CalendarPlus className="w-3.5 h-3.5" />Fazer uma reserva
        </button>
      </div>
    </aside>
  );
}
