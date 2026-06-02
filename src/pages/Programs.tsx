import { AppLayout } from "@/components/layout/AppLayout";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, MoreHorizontal, ChevronRight, GraduationCap, X,
  Pencil, EyeOff, Eye, Copy, Trash2, CalendarIcon, Ghost, Info,
  UserPlus, BookOpen, Users, Building2, Layers, ClipboardList,
  AlertCircle, CheckCircle2, Clock, ChevronDown, Hash, Sparkles,
  ArrowRight, FlaskConical, Send, Save, FileText, MapPin, BookMarked,
  ChevronLeft, Calendar as CalendarLucide, Tag, DollarSign, Globe,
  Briefcase, UserCheck, Cpu, LayoutGrid, List, Circle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// ─── Types ───────────────────────────────────────────────────────────────────

type ProgramStatus = "draft" | "awaiting_approval" | "reserved" | "final" | "inactive" | "deleted";
type ProgramType = "custom" | "aberto" | "imersao" | "colaboradores" | "educacao_executiva" | "emba" | "eventos" | "internacionais" | "llm" | "mba_full_time" | "easy_humanidades";
type ModalityType = "presencial" | "hibrido" | "online";
type LocalType = "campus_ise" | "externo";

interface Person { id: string; name: string; role: string; avatar?: string }
interface Program {
  id: number;
  name: string; sigla: string; code: string;
  tipo: ProgramType; instituto: string;
  periodo: string; periodoStart?: Date; periodoEnd?: Date;
  responsavel: string; cliente?: string;
  coordenador?: string; responsavelPlanejamento?: string;
  extraResponsaveis: string[];
  status: ProgramStatus;
  description?: string;
  turmas: Turma[];
  isTemplate?: boolean;
}

interface Turma {
  id: number; nomeTurma: string; siglaTurma: string;
  programaId: number; diretorPrograma: string;
  nomeFinanceiro?: string; nomeFantasia?: string;
  nomeFantasiaUso?: string;
  coordenador?: string; diretorAcademico?: string;
  planejamento?: string; producaoMateriais?: string;
  codigoFinanceiro?: string;
  periodoStart?: Date; periodoEnd?: Date;
  diasPrograma?: number; numParticipantes?: number;
  modalidade?: ModalityType; anoConclusion?: string;
  local?: LocalType; tipoPrograma?: ProgramType;
  estimativaAlunos?: number;
  status: "draft" | "active" | "awaiting_approval";
  sessoes: Sessao[];
}

interface Sessao {
  id: number; slot: string; titulo: string; docente: string;
  tema: string; objetivos?: string; horario?: string;
  duracao?: number; dia?: number; hasConflict?: boolean;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const PEOPLE: Person[] = [
  { id: "p1", name: "Prof. Dr. Carlos Faria", role: "Diretor Acadêmico" },
  { id: "p2", name: "Profa. Dra. Ana Souza", role: "Coordenadora" },
  { id: "p3", name: "Prof. Dr. Pedro Costa", role: "Docente" },
  { id: "p4", name: "Prof. Dr. Marcos Lima", role: "Diretor de Programa" },
  { id: "p5", name: "Profa. Dra. Lucia Mendes", role: "Coordenadora" },
  { id: "p6", name: "Rafael Torres", role: "Planejamento" },
  { id: "p7", name: "Paula Neves", role: "Produção de Materiais" },
  { id: "p8", name: "Fernando Alves", role: "Diretor de Programa" },
  { id: "p9", name: "Carla Barros", role: "Coordenadora" },
];

const INSTITUTOS = ["ISE Business School", "FGV", "Insper", "USP", "FEA-USP", "PUC-SP", "ESPM", "Outro"];
const TIPO_PROGRAMA: { value: ProgramType; label: string; desc: string }[] = [
  { value: "custom", label: "Custom", desc: "Programa fechado para uma empresa ou organização específica" },
  { value: "aberto", label: "Aberto", desc: "Inscrições abertas ao público" },
  { value: "imersao", label: "Imersão", desc: "Formato intensivo com dedicação exclusiva" },
  { value: "emba", label: "EMBA", desc: "Executive MBA — ano de conclusão para nome da turma" },
  { value: "mba_full_time", label: "MBA Full Time", desc: "MBA de dedicação integral" },
  { value: "educacao_executiva", label: "Educação Executiva", desc: "Programas para executivos e líderanças" },
  { value: "colaboradores", label: "Colaboradores", desc: "Treinamento interno para colaboradores" },
  { value: "eventos", label: "Eventos", desc: "Eventos acadêmicos e institucionais" },
  { value: "internacionais", label: "Internacionais", desc: "Programas com parceiros internacionais" },
  { value: "llm", label: "LLM", desc: "Master of Laws — pós-graduação em Direito" },
  { value: "easy_humanidades", label: "Easy Humanidades", desc: "Programa de humanidades em formato flexível" },
];
const SLOTS = ["M1", "M2", "M3", "I1", "T1", "T2", "T3", "N1", "N2"];
const MODALIDADES: { value: ModalityType; label: string }[] = [
  { value: "presencial", label: "Presencial" },
  { value: "hibrido", label: "Híbrido" },
  { value: "online", label: "Online" },
];
const LOCAIS: { value: LocalType; label: string }[] = [
  { value: "campus_ise", label: "Campus ISE" },
  { value: "externo", label: "Externo" },
];

const statusConfig: Record<ProgramStatus, { label: string; class: string; icon: React.ReactNode }> = {
  draft: { label: "Rascunho", class: "bg-muted text-muted-foreground border-muted-foreground/20", icon: <FileText className="w-3 h-3" /> },
  awaiting_approval: { label: "Em aprovação", class: "bg-warning/10 text-warning border-warning/30", icon: <Clock className="w-3 h-3" /> },
  reserved: { label: "Aprovado", class: "bg-success/10 text-success border-success/20", icon: <CheckCircle2 className="w-3 h-3" /> },
  final: { label: "Finalizado", class: "bg-primary/10 text-primary border-primary/20", icon: <CheckCircle2 className="w-3 h-3" /> },
  inactive: { label: "Inativo", class: "bg-muted text-muted-foreground border-border opacity-60", icon: <EyeOff className="w-3 h-3" /> },
  deleted: { label: "Deletado", class: "bg-destructive/10 text-destructive border-destructive/20", icon: <Trash2 className="w-3 h-3" /> },
};

const turmaStatusConfig: Record<string, { label: string; class: string }> = {
  draft: { label: "Rascunho", class: "bg-muted text-muted-foreground border-muted-foreground/20" },
  active: { label: "Ativo", class: "bg-success/10 text-success border-success/20" },
  awaiting_approval: { label: "Em aprovação", class: "bg-warning/10 text-warning border-warning/30" },
};

const initialPrograms: Program[] = [
  {
    id: 1, name: "MBA Executivo", sigla: "MBA", code: "MBA-T24A", tipo: "aberto",
    instituto: "ISE Business School", periodo: "Mar – Nov 2024",
    periodoStart: new Date(2024, 2, 1), periodoEnd: new Date(2024, 10, 30),
    responsavel: "Prof. Dr. Carlos Faria", cliente: "Público Geral",
    coordenador: "Profa. Dra. Ana Souza", responsavelPlanejamento: "Rafael Torres",
    extraResponsaveis: [], status: "reserved",
    turmas: [
      {
        id: 101, nomeTurma: "Turma A 2024", siglaTurma: "T24A", programaId: 1,
        diretorPrograma: "Prof. Dr. Carlos Faria", diretorAcademico: "Profa. Dra. Ana Souza",
        coordenador: "Profa. Dra. Lucia Mendes", planejamento: "Rafael Torres",
        modalidade: "presencial", anoConclusion: "2024", local: "campus_ise",
        numParticipantes: 35, estimativaAlunos: 40,
        periodoStart: new Date(2024, 2, 1), periodoEnd: new Date(2024, 10, 30),
        status: "active", sessoes: [],
      },
    ],
  },
  {
    id: 2, name: "Especialização em Finanças Corporativas", sigla: "ESP-FIN", code: "ESP-FIN-T23B",
    tipo: "custom", instituto: "ISE Business School", periodo: "Fev – Ago 2024",
    responsavel: "Profa. Dra. Ana Souza", cliente: "Banco Itaú",
    extraResponsaveis: [], status: "final", turmas: [],
  },
  {
    id: 3, name: "Liderança Estratégica", sigla: "LID", code: "LID-T24B", tipo: "custom",
    instituto: "ISE Business School", periodo: "Abr – Set 2024",
    responsavel: "A definir", extraResponsaveis: [], status: "draft", turmas: [],
  },
];

// ─── Small shared components ──────────────────────────────────────────────────

function FieldLabel({ children, required, optional, tooltip }: {
  children: React.ReactNode; required?: boolean; optional?: boolean; tooltip?: string
}) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1.5">
      {children}
      {required && <span className="text-destructive">*</span>}
      {optional && <span className="text-muted-foreground font-normal">(opcional)</span>}
      {tooltip && (
        <span title={tooltip} className="cursor-help">
          <Info className="w-3 h-3 text-muted-foreground" />
        </span>
      )}
    </label>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-border">
      <span className="text-primary shrink-0">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2.5 py-2.5">
      {icon && <span className="shrink-0 text-foreground">{icon}</span>}
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function PeopleAutocomplete({
  value, onChange, placeholder, people = PEOPLE
}: { value: string; onChange: (v: string) => void; placeholder?: string; people?: Person[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const filtered = people.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => { setQuery(value); }, [value]);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <input
        className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || "Digite para buscar..."}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
          {filtered.map((p) => (
            <button key={p.id} type="button"
              className="w-full text-left px-3 py-2.5 hover:bg-muted transition-colors"
              onMouseDown={() => { onChange(p.name); setQuery(p.name); setOpen(false); }}
            >
              <p className="text-sm text-foreground font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.role}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MultiResponsavel({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const add = () => onChange([...values, ""]);
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));
  const update = (i: number, v: string) => onChange(values.map((val, idx) => idx === i ? v : val));

  return (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex-1">
            <PeopleAutocomplete value={v} onChange={(val) => update(i, val)} placeholder="Nome do responsável..." />
          </div>
          <button type="button" onClick={() => remove(i)}
            className="mt-1.5 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={add}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium">
        <UserPlus className="w-3.5 h-3.5" />
        Adicionar responsável
      </button>
    </div>
  );
}

function DatePicker({ value, onChange, placeholder, minDate }: {
  value?: Date; onChange: (d?: Date) => void; placeholder?: string; minDate?: Date
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={cn(
          "flex items-center gap-2 w-full px-3 py-2 text-sm border rounded-lg bg-background text-left focus:outline-none hover:bg-muted/30 transition-colors",
          "border-input", !value && "text-muted-foreground"
        )}>
          <CalendarIcon className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
          {value ? format(value, "dd/MM/yyyy", { locale: ptBR }) : (placeholder || "Selecionar data")}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange}
          className="p-3 pointer-events-auto" locale={ptBR}
          disabled={(date) => minDate ? date < minDate : false}
        />
      </PopoverContent>
    </Popover>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step, total, labels }: { step: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shrink-0",
            i < step ? "bg-primary border-primary text-primary-foreground" :
            i === step ? "bg-background border-primary text-primary" :
            "bg-background border-border text-muted-foreground"
          )}>
            {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
          </div>
          <div className="ml-1.5 mr-2 flex-1 min-w-0">
            <p className={cn("text-xs font-medium truncate", i === step ? "text-foreground" : "text-muted-foreground")}>
              {labels[i]}
            </p>
          </div>
          {i < total - 1 && <div className={cn("h-0.5 w-4 shrink-0", i < step ? "bg-primary" : "bg-border")} />}
        </div>
      ))}
    </div>
  );
}

// ─── Program Create/Edit Modal ─────────────────────────────────────────────────

interface ProgramFormData {
  name: string; sigla: string; tipo: ProgramType; instituto: string; responsavel: string;
  cliente: string; coordenador: string; responsavelPlanejamento: string; extraResponsaveis: string[];
}

const emptyProgramForm: ProgramFormData = {
  name: "", sigla: "", tipo: "custom", instituto: "", responsavel: "",
  cliente: "", coordenador: "", responsavelPlanejamento: "", extraResponsaveis: [],
};

function ProgramModal({
  mode, program, onSave, onClose,
}: { mode: "create" | "edit"; program?: Program; onSave: (d: ProgramFormData, action: "draft" | "submit") => void; onClose: () => void }) {
  const [form, setForm] = useState<ProgramFormData>(
    mode === "edit" && program
      ? {
        name: program.name, sigla: program.sigla, tipo: program.tipo, instituto: program.instituto,
        responsavel: program.responsavel, cliente: program.cliente || "",
        coordenador: program.coordenador || "", responsavelPlanejamento: program.responsavelPlanejamento || "",
        extraResponsaveis: program.extraResponsaveis || [],
      }
      : emptyProgramForm
  );
  const [errors, setErrors] = useState<Partial<Record<keyof ProgramFormData, string>>>({});
  const [showOptional, setShowOptional] = useState(false);

  const validate = () => {
    const e: Partial<Record<keyof ProgramFormData, string>> = {};
    if (!form.name.trim()) e.name = "Nome do programa é obrigatório";
    if (!form.sigla.trim()) e.sigla = "Sigla é obrigatória";
    if (!form.responsavel.trim()) e.responsavel = "Diretor(a) é obrigatório";
    return e;
  };

  const handleAction = (action: "draft" | "submit") => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form, action);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-primary" />
              <div>
                <h2 className="font-semibold text-foreground text-base">
                  {mode === "create" ? "Novo Programa" : `Editar: ${program?.name}`}
                </h2>
                {mode === "create" && (
                  <p className="text-xs text-muted-foreground">Criado como Rascunho — sem impacto em agendas oficiais</p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground" aria-label="Fechar">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {mode === "create" && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3">
              <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground mb-0.5">Programa vs. Turma</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Um <strong>Programa</strong> é a identidade acadêmica (ex: "MBA Executivo").
                  Cada edição é uma <strong>Turma</strong> (ex: "Turma 2025"). Você poderá criar turmas após salvar o programa.
                </p>
              </div>
            </div>
          )}

          <div>
            <SectionHeader icon={<BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />} title="Informações obrigatórias" />
            <div className="space-y-4">
              <div>
                <FieldLabel required tooltip="Nome fantasia do programa como será reconhecido institucionalmente">Nome do programa</FieldLabel>
                <input
                  className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30",
                    errors.name ? "border-destructive ring-destructive/20" : "border-input"
                  )}
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: undefined }); }}
                  placeholder="Ex: MBA Executivo em Gestão de Negócios"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel required tooltip="Sigla usada na geração do código oficial">Sigla</FieldLabel>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      className={cn("w-full pl-8 pr-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase font-mono",
                        errors.sigla ? "border-destructive" : "border-input"
                      )}
                      value={form.sigla}
                      onChange={(e) => { setForm({ ...form, sigla: e.target.value.toUpperCase() }); setErrors({ ...errors, sigla: undefined }); }}
                      placeholder="MBA" maxLength={8}
                    />
                  </div>
                  {errors.sigla && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.sigla}</p>}
                </div>
                <div>
                  <FieldLabel required tooltip="Formato de oferta do programa">Tipo</FieldLabel>
                  <select
                    className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground",
                      errors.tipo ? "border-destructive" : "border-input"
                    )}
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value as ProgramType })}
                  >
                    {TIPO_PROGRAMA.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg px-3 py-2">
                <p className="text-xs text-muted-foreground">{TIPO_PROGRAMA.find((t) => t.value === form.tipo)?.desc}</p>
              </div>

              <div>
                <FieldLabel required tooltip="Instituição responsável pela certificação">Instituto</FieldLabel>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <select
                    className={cn("w-full pl-8 pr-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground",
                      errors.instituto ? "border-destructive" : "border-input"
                    )}
                    value={form.instituto}
                    onChange={(e) => { setForm({ ...form, instituto: e.target.value }); setErrors({ ...errors, instituto: undefined }); }}
                  >
                    <option value="">Selecione o instituto...</option>
                    {INSTITUTOS.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                {errors.instituto && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.instituto}</p>}
              </div>

              <div>
                <FieldLabel required tooltip="Responsável pela condução acadêmica do programa">Diretor(a) do programa</FieldLabel>
                <PeopleAutocomplete
                  value={form.responsavel}
                  onChange={(v) => { setForm({ ...form, responsavel: v }); setErrors({ ...errors, responsavel: undefined }); }}
                  placeholder="Buscar por nome..."
                />
                {errors.responsavel && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.responsavel}</p>}
              </div>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Informações adicionais</span>
                <span className="text-xs text-muted-foreground">(opcional)</span>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showOptional && "rotate-180")} />
            </button>

            {showOptional && (
              <div className="mt-3 space-y-4 pl-4 border-l-2 border-primary/20 ml-1">
                <div>
                  <FieldLabel optional>Cliente</FieldLabel>
                  <input
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.cliente}
                    onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                    placeholder="Ex: Empresa XYZ, Público Geral..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel optional>Coordenador de Programa</FieldLabel>
                    <PeopleAutocomplete value={form.coordenador} onChange={(v) => setForm({ ...form, coordenador: v })} placeholder="Buscar coordenador..." />
                  </div>
                  <div>
                    <FieldLabel optional>Responsável de Planejamento</FieldLabel>
                    <PeopleAutocomplete value={form.responsavelPlanejamento} onChange={(v) => setForm({ ...form, responsavelPlanejamento: v })} placeholder="Buscar responsável..." />
                  </div>
                </div>
                <div>
                  <FieldLabel optional tooltip="Adicione outros responsáveis envolvidos no programa">Outros responsáveis</FieldLabel>
                  <MultiResponsavel values={form.extraResponsaveis} onChange={(v) => setForm({ ...form, extraResponsaveis: v })} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 rounded-b-2xl">
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              Descartar
            </button>
            <div className="flex-1 flex gap-2 justify-end">
              <button onClick={() => handleAction("draft")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-primary/40 text-primary rounded-lg hover:bg-primary/5 transition-colors">
                <Save className="w-3.5 h-3.5" />
                Salvar como Rascunho
              </button>
              <button onClick={() => handleAction("submit")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Send className="w-3.5 h-3.5" />
                {mode === "create" ? "Solicitar Aprovação" : "Salvar Alterações"}
              </button>
            </div>
          </div>
          {mode === "create" && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Info className="w-3 h-3" />
              <strong>Solicitar Aprovação</strong> notifica o Planejamento e muda o status para "Aguardando Aprovação"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Turma Create Modal (wizard) ──────────────────────────────────────────────

interface TurmaFormData {
  nomeTurma: string; siglaTurma: string; programaId: number | "";
  diretorPrograma: string; nomeFinanceiro: string; nomeFantasia: string;
  nomeFantasiaUso: string;
  coordenador: string; diretorAcademico: string; planejamento: string;
  producaoMateriais: string; codigoFinanceiro: string;
  periodoStart?: Date; periodoEnd?: Date; diasPrograma: number | "";
  numParticipantes: number | ""; estimativaAlunos: number | "";
  modalidade: ModalityType; anoConclusion: string;
  local: LocalType; tipoPrograma: ProgramType;
}

const emptyTurmaForm: TurmaFormData = {
  nomeTurma: "", siglaTurma: "", programaId: "", diretorPrograma: "",
  nomeFinanceiro: "", nomeFantasia: "", nomeFantasiaUso: "",
  coordenador: "", diretorAcademico: "",
  planejamento: "", producaoMateriais: "", codigoFinanceiro: "",
  periodoStart: undefined, periodoEnd: undefined, diasPrograma: "",
  numParticipantes: "", estimativaAlunos: "", modalidade: "presencial",
  anoConclusion: String(new Date().getFullYear()), local: "campus_ise", tipoPrograma: "custom",
};

function TurmaFormFields({
  form, setForm, errors, setErrors, programs, step,
}: {
  form: TurmaFormData;
  setForm: React.Dispatch<React.SetStateAction<TurmaFormData>>;
  errors: Partial<Record<keyof TurmaFormData, string>>;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<keyof TurmaFormData, string>>>>;
  programs: Program[];
  step: number;
}) {
  const [showPersonalizacao, setShowPersonalizacao] = useState(false);
  const selectedProgram = programs.find((p) => p.id === form.programaId);
  const generatedName = selectedProgram
    ? `${selectedProgram.sigla}${selectedProgram.cliente ? " " + selectedProgram.cliente.split(" ")[0] : ""} ${form.anoConclusion || new Date().getFullYear()}`
    : "";

  const inp = (key: keyof TurmaFormData) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setErrors((er) => ({ ...er, [key]: undefined }));
    },
  });

  if (step === 0) return (
    <div className="space-y-4">
      <SectionHeader icon={<Hash className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />} title="Identificação da Turma" subtitle="Dados que definem a turma institucionalmente" />

      <div>
        <FieldLabel required>Programa relacionado</FieldLabel>
        <select
          className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground",
            errors.programaId ? "border-destructive" : "border-input"
          )}
          value={form.programaId}
          onChange={(e) => { setForm((f) => ({ ...f, programaId: Number(e.target.value) || "" })); setErrors((er) => ({ ...er, programaId: undefined })); }}
        >
          <option value="">Selecione um programa...</option>
          {programs.filter((p) => !["deleted", "inactive"].includes(p.status)).map((p) => (
            <option key={p.id} value={p.id}>{p.name} — {p.sigla}</option>
          ))}
        </select>
        {errors.programaId && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.programaId}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel required>Nome da turma</FieldLabel>
          <input className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30",
            errors.nomeTurma ? "border-destructive" : "border-input"
          )} {...inp("nomeTurma")} placeholder="Ex: Turma A 2025" />
          {errors.nomeTurma && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.nomeTurma}</p>}
        </div>
        <div>
          <FieldLabel required tooltip="Identificador curto — usado no código oficial">Sigla da turma</FieldLabel>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              className={cn("w-full pl-8 pr-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase font-mono",
                errors.siglaTurma ? "border-destructive" : "border-input"
              )}
              value={form.siglaTurma}
              onChange={(e) => { setForm((f) => ({ ...f, siglaTurma: e.target.value.toUpperCase() })); setErrors((er) => ({ ...er, siglaTurma: undefined })); }}
              placeholder="T25A" maxLength={6}
            />
          </div>
          {errors.siglaTurma && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.siglaTurma}</p>}
        </div>
      </div>

      {generatedName && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-foreground">Nome oficial gerado automaticamente</p>
            <p className="text-sm font-mono text-primary mt-0.5">{generatedName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Sigla + Empresa + Algarismo Romano + Ano</p>
          </div>
        </div>
      )}

      <div>
        <FieldLabel optional>Nome financeiro</FieldLabel>
        <input className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
          {...inp("nomeFinanceiro")} placeholder="Nome para nota fiscal..." />
      </div>

      {/* Personalização — colapsável */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowPersonalizacao((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted/40 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5" />
            Personalização
            {form.nomeFantasia && (
              <span className="bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5 font-normal text-[10px]">
                {form.nomeFantasia}
              </span>
            )}
          </span>
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showPersonalizacao && "rotate-180")} />
        </button>
        {showPersonalizacao && (
          <div className="px-4 pb-4 pt-2 space-y-3 border-t border-border bg-muted/10">
            <p className="text-[11px] text-muted-foreground">
              Nome fantasia é exibido apenas em contextos específicos (sinalização, relatórios, integrações).
            </p>
            <div>
              <FieldLabel optional>Nome fantasia</FieldLabel>
              <input className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                {...inp("nomeFantasia")} placeholder="Como será divulgado..." />
            </div>
            <div>
              <FieldLabel optional tooltip="Onde esse nome fantasia será utilizado nas integrações">Uso do nome fantasia</FieldLabel>
              <select
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                {...inp("nomeFantasiaUso")}
              >
                <option value="">Selecione o uso...</option>
                <option value="sinalizacao_digital">Sinalização digital</option>
                <option value="relatorio_aluno">Relatório para aluno</option>
                <option value="moodle">Moodle</option>
                <option value="certificado">Certificado</option>
                <option value="comunicacao_externa">Comunicação externa</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel optional>Código financeiro</FieldLabel>
          <input className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
            {...inp("codigoFinanceiro")} placeholder="FIN-2025-001" />
        </div>
        <div>
          <FieldLabel required>Ano de conclusão</FieldLabel>
          <input className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30",
            errors.anoConclusion ? "border-destructive" : "border-input"
          )} {...inp("anoConclusion")} placeholder="2025" maxLength={4} />
          {errors.anoConclusion && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.anoConclusion}</p>}
        </div>
      </div>
    </div>
  );

  if (step === 1) return (
    <div className="space-y-4">
      <SectionHeader icon={<Users className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />} title="Equipe Responsável" subtitle="Defina os responsáveis por cada área da turma" />

      <div>
        <FieldLabel required>Diretor do programa</FieldLabel>
        <PeopleAutocomplete value={form.diretorPrograma} onChange={(v) => { setForm((f) => ({ ...f, diretorPrograma: v })); setErrors((er) => ({ ...er, diretorPrograma: undefined })); }} placeholder="Buscar diretor..." />
        {errors.diretorPrograma && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.diretorPrograma}</p>}
      </div>

      <div>
        <FieldLabel optional>Diretor acadêmico (DA)</FieldLabel>
        <PeopleAutocomplete value={form.diretorAcademico} onChange={(v) => setForm((f) => ({ ...f, diretorAcademico: v }))} placeholder="Responsável pela grade..." />
        <p className="text-xs text-muted-foreground mt-1">O DA receberá a pendência de preenchimento da grade no seu dashboard.</p>
      </div>

      <div>
        <FieldLabel optional>Coordenador</FieldLabel>
        <PeopleAutocomplete value={form.coordenador} onChange={(v) => setForm((f) => ({ ...f, coordenador: v }))} placeholder="Coordenador acadêmico..." />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel optional>Planejamento (DP)</FieldLabel>
          <PeopleAutocomplete value={form.planejamento} onChange={(v) => setForm((f) => ({ ...f, planejamento: v }))} placeholder="Diretor de Planejamento..." />
        </div>
        <div>
          <FieldLabel optional>Produção de materiais</FieldLabel>
          <PeopleAutocomplete value={form.producaoMateriais} onChange={(v) => setForm((f) => ({ ...f, producaoMateriais: v }))} placeholder="Responsável por materiais..." />
        </div>
      </div>
    </div>
  );

  if (step === 2) return (
    <div className="space-y-4">
      <SectionHeader icon={<CalendarLucide className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />} title="Estrutura Acadêmica" subtitle="Defina a estrutura e o período da turma" />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel required>Modalidade</FieldLabel>
          <select className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground",
            errors.modalidade ? "border-destructive" : "border-input"
          )} value={form.modalidade} onChange={(e) => setForm((f) => ({ ...f, modalidade: e.target.value as ModalityType }))}>
            {MODALIDADES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel optional>Local</FieldLabel>
          <select className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
            value={form.local} onChange={(e) => setForm((f) => ({ ...f, local: e.target.value as LocalType }))}>
            {LOCAIS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <FieldLabel optional>Intervalo de datas pretendidas</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <DatePicker value={form.periodoStart} onChange={(d) => setForm((f) => ({ ...f, periodoStart: d }))} placeholder="Data início" />
          <DatePicker value={form.periodoEnd} onChange={(d) => setForm((f) => ({ ...f, periodoEnd: d }))} placeholder="Data fim" minDate={form.periodoStart} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <FieldLabel optional tooltip="Total de dias letivos">Dias de programa</FieldLabel>
          <input type="number" min={0} className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={form.diasPrograma} onChange={(e) => setForm((f) => ({ ...f, diasPrograma: Number(e.target.value) || "" }))} placeholder="30" />
        </div>
        <div>
          <FieldLabel optional tooltip="Para dimensionamento de salas">Estimativa de alunos</FieldLabel>
          <input type="number" min={0} className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={form.estimativaAlunos} onChange={(e) => setForm((f) => ({ ...f, estimativaAlunos: Number(e.target.value) || "" }))} placeholder="40" />
        </div>
        <div>
          <FieldLabel optional>Nº participantes</FieldLabel>
          <input type="number" min={0} className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={form.numParticipantes} onChange={(e) => setForm((f) => ({ ...f, numParticipantes: Number(e.target.value) || "" }))} placeholder="40" />
        </div>
      </div>

      <div>
        <FieldLabel optional>Tipo de programa</FieldLabel>
        <select className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
          value={form.tipoPrograma} onChange={(e) => setForm((f) => ({ ...f, tipoPrograma: e.target.value as ProgramType }))}>
          {TIPO_PROGRAMA.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
    </div>
  );

  if (step === 3) return (
    <div className="space-y-4">
      <SectionHeader icon={<BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />} title="Preenchimento da Grade" subtitle="Competência do Diretor Acadêmico — slots teóricos por período" />

      <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-foreground">Sobre o preenchimento da grade</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Conflitos são <strong>sinalizados visualmente</strong> mas não bloqueiam o salvamento.
            Convites definitivos só são enviados se você optar. Validação automática de sobrecarga docente (máx. 2 sessões/dia).
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Slots disponíveis</p>
        <div className="grid grid-cols-3 gap-2">
          {SLOTS.map((slot) => (
            <div key={slot} className="border border-dashed border-border rounded-xl p-3 text-center hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mx-auto mb-1 group-hover:bg-primary/10 transition-colors">
                <span className="text-xs font-bold text-foreground">{slot}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {slot === "M1" && "Manhã 1"}{slot === "M2" && "Manhã 2"}
                {slot === "T1" && "Tarde 1"}{slot === "T2" && "Tarde 2"}
                {slot === "N1" && "Noite 1"}{slot === "N2" && "Noite 2"}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Clique para adicionar</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted/50 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground">Integração Moodle</p>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">Disponível após criar turma</span>
        </div>
        <p className="text-xs text-muted-foreground">Casos e documentos pedagógicos poderão ser vinculados via API do Moodle após criação da turma.</p>
      </div>
    </div>
  );

  return null;
}

function TurmaModal({
  programs, onSave, onClose, initialProgramId,
}: { programs: Program[]; onSave: (d: TurmaFormData) => void; onClose: () => void; initialProgramId?: number }) {
  const [form, setForm] = useState<TurmaFormData>({ ...emptyTurmaForm, programaId: initialProgramId || "" });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof TurmaFormData, string>>>({});

  const STEPS = ["Identificação", "Responsáveis", "Estrutura Acadêmica", "Grade"];

  const validateStep = (s: number) => {
    const e: Partial<Record<keyof TurmaFormData, string>> = {};
    if (s === 0) {
      if (!form.nomeTurma.trim()) e.nomeTurma = "Nome da turma é obrigatório";
      if (!form.siglaTurma.trim()) e.siglaTurma = "Sigla é obrigatória";
      if (!form.programaId) e.programaId = "Selecione um programa";
      if (!form.anoConclusion) e.anoConclusion = "Ano de conclusão é obrigatório";
    }
    if (s === 1) {
      if (!form.diretorPrograma.trim()) e.diretorPrograma = "Diretor é obrigatório";
    }
    if (s === 2) {
      if (!form.modalidade) e.modalidade = "Modalidade é obrigatória";
    }
    return e;
  };

  const next = () => {
    const e = validateStep(step);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(Math.min(step + 1, STEPS.length - 1));
  };

  const prev = () => setStep(Math.max(0, step - 1));

  const handleSave = () => {
    const e = validateStep(step);
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-primary" />
              <div>
                <h2 className="font-semibold text-foreground text-base">Nova Turma</h2>
                <p className="text-xs text-muted-foreground">Vinculada a um programa existente</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground" aria-label="Fechar">
              <X className="w-4 h-4" />
            </button>
          </div>
          <StepIndicator step={step} total={STEPS.length} labels={STEPS} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <TurmaFormFields form={form} setForm={setForm} errors={errors} setErrors={setErrors} programs={programs} step={step} />
        </div>

        <div className="border-t border-border px-6 py-4 flex items-center justify-between bg-card rounded-b-2xl">
          <div>
            {step > 0 && (
              <button onClick={prev} className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" /> Anterior
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              Cancelar
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={next} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Próximo <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Save className="w-3.5 h-3.5" /> Salvar Turma
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Turma Edit Modal ─────────────────────────────────────────────────────────

function TurmaEditModal({
  turma, programs, onSave, onClose,
}: { turma: Turma; programs: Program[]; onSave: (d: Partial<Turma>) => void; onClose: () => void }) {
  const [form, setForm] = useState<TurmaFormData>({
    nomeTurma: turma.nomeTurma, siglaTurma: turma.siglaTurma, programaId: turma.programaId,
    diretorPrograma: turma.diretorPrograma, nomeFinanceiro: turma.nomeFinanceiro || "",
    nomeFantasia: turma.nomeFantasia || "", nomeFantasiaUso: "",
    coordenador: turma.coordenador || "",
    diretorAcademico: turma.diretorAcademico || "", planejamento: turma.planejamento || "",
    producaoMateriais: turma.producaoMateriais || "", codigoFinanceiro: turma.codigoFinanceiro || "",
    periodoStart: turma.periodoStart, periodoEnd: turma.periodoEnd,
    diasPrograma: turma.diasPrograma || "", numParticipantes: turma.numParticipantes || "",
    estimativaAlunos: turma.estimativaAlunos || "", modalidade: turma.modalidade || "presencial",
    anoConclusion: turma.anoConclusion || String(new Date().getFullYear()),
    local: turma.local || "campus_ise", tipoPrograma: turma.tipoPrograma || "custom",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TurmaFormData, string>>>({});
  const [activeTab, setActiveTab] = useState<"identification" | "team" | "structure">("identification");

  const tabs: { key: typeof activeTab; label: string; icon: React.ReactNode }[] = [
    { key: "identification", label: "Identificação", icon: <Hash className="w-3.5 h-3.5" /> },
    { key: "team", label: "Equipe", icon: <Users className="w-3.5 h-3.5" /> },
    { key: "structure", label: "Estrutura", icon: <CalendarLucide className="w-3.5 h-3.5" /> },
  ];

  const stepForTab = activeTab === "identification" ? 0 : activeTab === "team" ? 1 : 2;

  const handleSave = (action: "draft" | "submit") => {
    if (!form.nomeTurma.trim()) { setErrors({ nomeTurma: "Nome da turma é obrigatório" }); setActiveTab("identification"); return; }
    if (!form.siglaTurma.trim()) { setErrors({ siglaTurma: "Sigla é obrigatória" }); setActiveTab("identification"); return; }
    if (!form.anoConclusion) { setErrors({ anoConclusion: "Ano de conclusão é obrigatório" }); setActiveTab("identification"); return; }
    if (!form.diretorPrograma.trim()) { setErrors({ diretorPrograma: "Diretor é obrigatório" }); setActiveTab("team"); return; }
    if (!form.modalidade) { setErrors({ modalidade: "Modalidade é obrigatória" }); setActiveTab("structure"); return; }

    onSave({
      nomeTurma: form.nomeTurma, siglaTurma: form.siglaTurma,
      diretorPrograma: form.diretorPrograma, nomeFinanceiro: form.nomeFinanceiro,
      nomeFantasia: form.nomeFantasia, coordenador: form.coordenador,
      diretorAcademico: form.diretorAcademico, planejamento: form.planejamento,
      producaoMateriais: form.producaoMateriais, codigoFinanceiro: form.codigoFinanceiro,
      periodoStart: form.periodoStart, periodoEnd: form.periodoEnd,
      diasPrograma: Number(form.diasPrograma) || undefined,
      numParticipantes: Number(form.numParticipantes) || undefined,
      estimativaAlunos: Number(form.estimativaAlunos) || undefined,
      modalidade: form.modalidade, anoConclusion: form.anoConclusion,
      local: form.local, tipoPrograma: form.tipoPrograma,
      status: action === "submit" ? "awaiting_approval" : "draft",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Pencil className="w-5 h-5 text-primary" />
              <div>
                <h2 className="font-semibold text-foreground text-base">Editar Turma</h2>
                <p className="text-xs text-muted-foreground font-mono">{turma.siglaTurma} · {turma.nomeTurma}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab nav */}
          <div className="flex gap-1 p-1 bg-muted rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all",
                  activeTab === tab.key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <TurmaFormFields
            form={form} setForm={setForm} errors={errors} setErrors={setErrors}
            programs={programs} step={stepForTab}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 bg-card rounded-b-2xl">
          <div className="flex items-center gap-2 justify-between">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3" />
              Campos com <span className="text-destructive font-semibold">*</span> são obrigatórios para submissão
            </p>
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                Cancelar
              </button>
              <button onClick={() => handleSave("draft")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-primary/40 text-primary rounded-lg hover:bg-primary/5 transition-colors">
                <Save className="w-3.5 h-3.5" /> Salvar Rascunho
              </button>
              <button onClick={() => handleSave("submit")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Send className="w-3.5 h-3.5" /> Solicitar Aprovação
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Program Detail Drawer ────────────────────────────────────────────────────

function ProgramDetailDrawer({
  program, programs, onClose, onEditProgram, onEditTurma, onNewTurma, onCPanel,
}: {
  program: Program;
  programs: Program[];
  onClose: () => void;
  onEditProgram: () => void;
  onEditTurma: (turma: Turma) => void;
  onNewTurma: () => void;
  onCPanel: (turma: Turma) => void;
}) {
  const s = statusConfig[program.status];
  const formatDate = (d?: Date) => d ? format(d, "dd/MM/yyyy", { locale: ptBR }) : "—";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} aria-hidden />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-card border-l border-border shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <GraduationCap className="w-5 h-5 text-primary shrink-0" />
              <div className="min-w-0">
                <h2 className="font-bold text-foreground text-base leading-tight truncate">{program.name}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs font-mono text-muted-foreground">{program.sigla}</span>
                  <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium", s.class)}>
                    {s.icon}{s.label}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                    {TIPO_PROGRAMA.find((t) => t.value === program.tipo)?.label}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onEditProgram}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                <Pencil className="w-3.5 h-3.5" /> Editar
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Basic Info */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Informações do Programa</p>
            <div className="divide-y divide-border/50">
              <InfoRow label="Instituto" value={program.instituto} icon={<Building2 className="w-4 h-4" />} />
              <InfoRow label="Cliente" value={program.cliente} icon={<Briefcase className="w-4 h-4" />} />
              <InfoRow label="Responsável" value={program.responsavel} icon={<UserCheck className="w-4 h-4" />} />
              <InfoRow label="Coordenador" value={program.coordenador} icon={<Users className="w-4 h-4" />} />
              <InfoRow label="Responsável Planejamento" value={program.responsavelPlanejamento} icon={<ClipboardList className="w-4 h-4" />} />
              {program.periodo && <InfoRow label="Período" value={program.periodo} icon={<CalendarIcon className="w-4 h-4" />} />}
            </div>
            {program.extraResponsaveis?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-2">Outros responsáveis</p>
                <div className="flex flex-wrap gap-2">
                  {program.extraResponsaveis.map((r, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-muted rounded-lg text-foreground">{r}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Turmas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Turmas ({program.turmas?.length ?? 0})
              </p>
              <button
                onClick={onNewTurma}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <Plus className="w-3 h-3" /> Nova turma
              </button>
            </div>

            {(!program.turmas || program.turmas.length === 0) ? (
              <div className="bg-muted/30 border border-dashed border-border rounded-xl py-8 text-center">
                <Layers className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma turma cadastrada</p>
                <p className="text-xs text-muted-foreground mt-0.5">Clique em "Nova turma" para começar</p>
                <button
                  onClick={onNewTurma}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Criar turma
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {program.turmas.map((turma) => {
                  const ts = turmaStatusConfig[turma.status] || turmaStatusConfig.draft;
                  return (
                    <div key={turma.id}
                      className="bg-muted/20 border border-border rounded-xl p-4 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 min-w-0">
                          <Layers className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{turma.nomeTurma}</p>
                            <p className="text-xs font-mono text-muted-foreground">{turma.siglaTurma}</p>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              <span className={cn("inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full border font-medium", ts.class)}>
                                {ts.label}
                              </span>
                              {turma.modalidade && (
                                <span className="text-xs px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                                  {MODALIDADES.find((m) => m.value === turma.modalidade)?.label}
                                </span>
                              )}
                              {turma.local && (
                                <span className="text-xs px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                                  {LOCAIS.find((l) => l.value === turma.local)?.label}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 shrink-0">
                          <button
                            onClick={() => onCPanel(turma)}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-primary/30 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                          >
                            <ClipboardList className="w-3 h-3" /> cPanel
                          </button>
                          <button
                            onClick={() => onEditTurma(turma)}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Pencil className="w-3 h-3" /> Editar
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        {turma.diretorPrograma && (
                          <div>
                            <p className="text-muted-foreground">Diretor</p>
                            <p className="text-foreground font-medium truncate">{turma.diretorPrograma}</p>
                          </div>
                        )}
                        {turma.diretorAcademico && (
                          <div>
                            <p className="text-muted-foreground">Dir. Acadêmico</p>
                            <p className="text-foreground font-medium truncate">{turma.diretorAcademico}</p>
                          </div>
                        )}
                        {turma.numParticipantes && (
                          <div>
                            <p className="text-muted-foreground">Participantes</p>
                            <p className="text-foreground font-medium">{turma.numParticipantes}</p>
                          </div>
                        )}
                        {(turma.periodoStart || turma.periodoEnd) && (
                          <div>
                            <p className="text-muted-foreground">Período</p>
                            <p className="text-foreground font-medium">
                              {formatDate(turma.periodoStart)} – {formatDate(turma.periodoEnd)}
                            </p>
                          </div>
                        )}
                        {turma.anoConclusion && (
                          <div>
                            <p className="text-muted-foreground">Conclusão</p>
                            <p className="text-foreground font-medium">{turma.anoConclusion}</p>
                          </div>
                        )}
                      </div>

                      {turma.sessoes?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5 text-xs text-muted-foreground">
                          <BookOpen className="w-3 h-3" />
                          {turma.sessoes.length} sessão(ões) na grade
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-card/80">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Visível para o solicitante em qualquer status</p>
            <button
              onClick={onNewTurma}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Nova Turma
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Delete Confirm ────────────────────────────────────────────────────────────

function DeleteConfirmModal({ program, onConfirm, onClose }: { program: Program; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-base text-foreground">Deletar Programa</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-3">
          <Trash2 className="w-5 h-5 text-destructive" />
        </div>
        <p className="text-sm text-muted-foreground text-center mb-1">Tem certeza que deseja deletar:</p>
        <p className="text-sm font-semibold text-foreground text-center mb-4">"{program.name}"</p>
        <div className="bg-muted/50 rounded-xl p-3 mb-5 text-xs text-muted-foreground">
          O programa ficará com status <strong>Deletado</strong> e não aparecerá em novos planejamentos. O histórico permanece registrado no sistema.
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors">Confirmar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Turma Card ───────────────────────────────────────────────────────────────

function TurmaCard({ turma, program, viewMode = "grid", onClick }: { turma: Turma; program: Program; viewMode?: "grid" | "list"; onClick?: () => void }) {
  const ts = turmaStatusConfig[turma.status] || turmaStatusConfig.draft;
  const fmt = (d?: Date) => d ? format(d, "MM/yyyy", { locale: ptBR }) : undefined;
  const totalSessoes = turma.sessoes?.length ?? 0;
  const allocatedSessoes = turma.sessoes?.filter((s) => s.dia !== undefined).length ?? 0;
  const allocPct = totalSessoes > 0 ? Math.round((allocatedSessoes / totalSessoes) * 100) : 0;
  const tipoLabel = TIPO_PROGRAMA.find((t) => t.value === (turma.tipoPrograma || program.tipo))?.label;

  if (viewMode === "list") {
    return (
      <div onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer group">
        <span className="w-20 text-xs font-mono text-muted-foreground shrink-0 truncate">{turma.siglaTurma}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{turma.nomeTurma}</p>
          <p className="text-xs text-muted-foreground truncate">{program.name}</p>
        </div>
        <div className="w-28 shrink-0">
          <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", ts.class)}>{ts.label}</span>
        </div>
        <span className="text-xs text-muted-foreground w-24 shrink-0 hidden sm:block">
          {fmt(turma.periodoStart) ?? "—"}{turma.periodoEnd ? ` – ${fmt(turma.periodoEnd)}` : ""}
        </span>
        <span className="text-xs text-muted-foreground w-32 truncate shrink-0 hidden md:block">{turma.diretorPrograma || "—"}</span>
        <div className="w-36 shrink-0 hidden lg:flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{allocatedSessoes}/{totalSessoes} sess.</span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all",
              allocPct === 100 ? "bg-success" : allocPct > 50 ? "bg-primary" : "bg-warning"
            )} style={{ width: `${allocPct}%` }} />
          </div>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
      </div>
    );
  }

  return (
    <div onClick={onClick}
      className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all group cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-mono font-semibold text-muted-foreground">{turma.siglaTurma}</span>
        <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium", ts.class)}>{ts.label}</span>
      </div>
      <h3 className="font-semibold text-foreground text-sm mb-0.5 group-hover:text-primary transition-colors">{turma.nomeTurma}</h3>
      <p className="text-xs text-muted-foreground mb-3">{program.name}</p>
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {tipoLabel && <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{tipoLabel}</span>}
        {turma.modalidade && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
            {MODALIDADES.find((m) => m.value === turma.modalidade)?.label}
          </span>
        )}
        {turma.local && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
            {LOCAIS.find((l) => l.value === turma.local)?.label}
          </span>
        )}
        {program.cliente && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/10">{program.cliente}</span>
        )}
      </div>
      <div className="border-t border-border pt-2.5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-muted-foreground">Período</p>
            <p className="text-xs font-medium text-foreground">
              {fmt(turma.periodoStart) ?? "—"}{turma.periodoEnd ? ` – ${fmt(turma.periodoEnd)}` : ""}
            </p>
          </div>
          {turma.numParticipantes && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Participantes</p>
              <p className="text-xs font-medium text-foreground">{turma.numParticipantes}</p>
            </div>
          )}
          {turma.diretorPrograma && !turma.numParticipantes && (
            <div className="text-right min-w-0 ml-2">
              <p className="text-xs text-muted-foreground">Diretor(a)</p>
              <p className="text-xs font-medium text-foreground truncate max-w-[140px]">{turma.diretorPrograma}</p>
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Alocação de recursos</p>
            <p className="text-xs font-medium text-foreground">{allocatedSessoes}/{totalSessoes} sessões</p>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all",
                allocPct === 100 ? "bg-success" : allocPct > 50 ? "bg-primary" : "bg-warning"
              )}
              style={{ width: `${allocPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Turma Detail Drawer ──────────────────────────────────────────────────────

function TurmaDetailDrawer({
  turma, program, onClose, onEdit, onCPanel,
}: {
  turma: Turma; program: Program;
  onClose: () => void; onEdit: () => void; onCPanel: () => void;
}) {
  const ts = turmaStatusConfig[turma.status] || turmaStatusConfig.draft;
  const fmt = (d?: Date) => d ? format(d, "dd/MM/yyyy", { locale: ptBR }) : "—";
  const totalSessoes = turma.sessoes?.length ?? 0;
  const allocatedSessoes = turma.sessoes?.filter((s) => s.dia !== undefined).length ?? 0;
  const allocPct = totalSessoes > 0 ? Math.round((allocatedSessoes / totalSessoes) * 100) : 0;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-card border-l border-border shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Layers className="w-5 h-5 text-primary shrink-0" />
              <div className="min-w-0">
                <h2 className="font-bold text-foreground text-base leading-tight truncate">{turma.nomeTurma}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs font-mono text-muted-foreground">{turma.siglaTurma}</span>
                  <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium", ts.class)}>{ts.label}</span>
                  {turma.modalidade && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                      {MODALIDADES.find((m) => m.value === turma.modalidade)?.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={onEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors text-foreground">
                <Pencil className="w-3.5 h-3.5" /> Editar
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Programa */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Programa</p>
            <div className="divide-y divide-border/50">
              <InfoRow label="Nome" value={program.name} icon={<GraduationCap className="w-4 h-4" />} />
              <InfoRow label="Sigla" value={program.sigla} icon={<Hash className="w-4 h-4" />} />
              <InfoRow label="Cliente" value={program.cliente} icon={<Briefcase className="w-4 h-4" />} />
              <InfoRow label="Instituto" value={program.instituto} icon={<Building2 className="w-4 h-4" />} />
            </div>
          </div>

          {/* Responsáveis */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Responsáveis</p>
            <div className="divide-y divide-border/50">
              <InfoRow label="Diretor(a) de Programa" value={turma.diretorPrograma} icon={<UserCheck className="w-4 h-4" />} />
              <InfoRow label="Diretor(a) Acadêmico" value={turma.diretorAcademico} icon={<BookOpen className="w-4 h-4" />} />
              <InfoRow label="Coordenador(a)" value={turma.coordenador} icon={<Users className="w-4 h-4" />} />
              <InfoRow label="Planejamento" value={turma.planejamento} icon={<ClipboardList className="w-4 h-4" />} />
              <InfoRow label="Produção de Materiais" value={turma.producaoMateriais} icon={<FileText className="w-4 h-4" />} />
            </div>
          </div>

          {/* Estrutura */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Estrutura</p>
            <div className="divide-y divide-border/50">
              <InfoRow label="Modalidade" value={MODALIDADES.find((m) => m.value === turma.modalidade)?.label} icon={<CalendarLucide className="w-4 h-4" />} />
              <InfoRow label="Local" value={LOCAIS.find((l) => l.value === turma.local)?.label} icon={<MapPin className="w-4 h-4" />} />
              <InfoRow label="Período" value={turma.periodoStart ? `${fmt(turma.periodoStart)} – ${fmt(turma.periodoEnd)}` : undefined} icon={<CalendarIcon className="w-4 h-4" />} />
              <InfoRow label="Nº participantes" value={turma.numParticipantes?.toString()} icon={<Users className="w-4 h-4" />} />
              <InfoRow label="Código financeiro" value={turma.codigoFinanceiro} icon={<DollarSign className="w-4 h-4" />} />
            </div>
          </div>

          {/* Sessões + alocação */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Sessões{totalSessoes > 0 ? ` (${totalSessoes})` : ""}
            </p>
            {totalSessoes > 0 ? (
              <div className="bg-muted/30 rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">Alocação de recursos</p>
                  <p className="text-xs font-medium text-foreground">{allocatedSessoes}/{totalSessoes}</p>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", allocPct === 100 ? "bg-success" : allocPct > 50 ? "bg-primary" : "bg-warning")}
                    style={{ width: `${allocPct}%` }} />
                </div>
                <div className="mt-3 space-y-1.5">
                  {turma.sessoes.slice(0, 4).map((s) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground w-8 shrink-0">{s.slot}</span>
                      <span className="text-xs text-foreground truncate flex-1">{s.titulo || s.tema}</span>
                      {s.dia !== undefined ? (
                        <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                      ) : (
                        <Circle className="w-3 h-3 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  ))}
                  {turma.sessoes.length > 4 && (
                    <p className="text-xs text-muted-foreground">+{turma.sessoes.length - 4} sessões</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-muted/20 border border-dashed border-border rounded-xl py-6 text-center">
                <p className="text-xs text-muted-foreground">Nenhuma sessão configurada</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-card/80 flex items-center gap-2">
          <button onClick={onCPanel}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-primary/30 text-primary rounded-lg hover:bg-primary/5 transition-colors">
            <ClipboardList className="w-4 h-4" /> Abrir cPanel
          </button>
          <button onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Pencil className="w-4 h-4" /> Editar turma
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Program Card ─────────────────────────────────────────────────────────────

function ProgramCard({ prog, viewMode = "grid", onCardClick, onEdit, onDuplicate, onSaveAsTemplate, onDelete, onToggle, onNewTurma }: {
  prog: Program;
  viewMode?: "grid" | "list";
  onCardClick: () => void;
  onEdit: () => void; onDuplicate: () => void; onSaveAsTemplate: () => void; onDelete: () => void;
  onToggle: () => void; onNewTurma: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const s = statusConfig[prog.status];

  if (viewMode === "list") {
    return (
      <div onClick={onCardClick}
        className={cn("flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer group",
          prog.status === "inactive" && "opacity-60"
        )}>
        <span className="w-20 text-xs font-mono text-muted-foreground shrink-0 truncate">{prog.sigla || prog.code}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{prog.name}</p>
          {prog.cliente && <p className="text-xs text-muted-foreground truncate">{prog.cliente}</p>}
        </div>
        {prog.tipo && <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground shrink-0 hidden sm:block">{TIPO_PROGRAMA.find((t) => t.value === prog.tipo)?.label}</span>}
        <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium shrink-0", s.class)}>{s.icon}{s.label}</span>
        <span className="text-xs text-muted-foreground shrink-0 hidden md:block">{prog.turmas?.length ?? 0} turmas</span>
        <span className="text-xs text-muted-foreground w-32 shrink-0 hidden lg:block truncate">{prog.periodo || "—"}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
          <button onClick={onEdit} className="p-1.5 rounded-md hover:bg-muted transition-colors"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
          <button onClick={() => { setMenuOpen(!menuOpen); }} className="p-1.5 rounded-md hover:bg-muted transition-colors relative">
            <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
      </div>
    );
  }
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes de ${prog.name}`}
      onClick={onCardClick}
      onKeyDown={(e) => e.key === "Enter" && onCardClick()}
      className={cn(
        "bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-[0_4px_20px_hsl(var(--primary)/0.08)] transition-all group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30",
        prog.status === "inactive" && "opacity-60"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-semibold text-muted-foreground">{prog.sigla || prog.code}</span>
            <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium border border-primary/20">
              {prog.turmas.reduce((acc, t) => acc + (t.sessoes?.length ?? 0), 0)} sessões
            </span>
          </div>
          <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium", s.class)}>
            {s.icon}{s.label}
          </span>
        </div>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
            aria-label="Opções"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-8 z-20 bg-card border border-border rounded-xl shadow-xl w-52 py-1 animate-fade-in"
            >
              <button onClick={() => { onEdit(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-foreground hover:bg-muted transition-colors">
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" /> Editar programa
              </button>
              <button onClick={() => { onNewTurma(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-foreground hover:bg-muted transition-colors">
                <Layers className="w-3.5 h-3.5 text-muted-foreground" /> Nova turma
              </button>
              <button onClick={() => { onDuplicate(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-foreground hover:bg-muted transition-colors">
                <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Clonar programa
              </button>
              <button onClick={() => { onSaveAsTemplate(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-foreground hover:bg-muted transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-muted-foreground" /> Salvar como template
              </button>
              <button onClick={() => { onToggle(); setMenuOpen(false); }}
                className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors hover:bg-muted",
                  prog.status === "inactive" ? "text-success" : "text-muted-foreground"
                )}>
                {prog.status === "inactive" ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {prog.status === "inactive" ? "Reativar" : "Inativar"}
              </button>
              <div className="border-t border-border my-1" />
              <button onClick={() => { onDelete(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-destructive hover:bg-destructive/5 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Deletar programa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Name + meta */}
      <h3 className="font-semibold text-foreground text-sm leading-tight group-hover:text-primary transition-colors mb-1">
        {prog.name}
      </h3>
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {prog.tipo && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
            {TIPO_PROGRAMA.find((t) => t.value === prog.tipo)?.label}
          </span>
        )}
        {prog.instituto && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{prog.instituto}</span>
        )}
        {prog.cliente && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/10">
            {prog.cliente}
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 py-2.5 border-t border-b border-border mb-3">
        <div>
          <p className="text-xs text-muted-foreground">Turmas</p>
          <p className="text-sm font-semibold text-foreground">{prog.turmas?.length ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Período</p>
          <p className="text-xs font-medium text-foreground">{prog.periodo || "—"}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground truncate pr-2 max-w-[70%]">{prog.responsavel}</p>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </div>
    </div>
  );
}

// ─── Tasks Panel ──────────────────────────────────────────────────────────────

type TaskUrgency = "overdue" | "soon" | "ok";
interface Task {
  id: number; programa: string; turma: string; descricao: string;
  responsavel: string; prazo: string; urgency: TaskUrgency; route: string;
}

const MOCK_TASKS: Task[] = [
  { id: 1, programa: "MBA Executivo", turma: "T24A", descricao: "Preencher outline da sessão 3", responsavel: "Prof. Dr. Carlos Faria", prazo: "Ontem", urgency: "overdue", route: "/sessions" },
  { id: 2, programa: "MBA Executivo", turma: "T24A", descricao: "Vincular professor para M2 – Semana 5", responsavel: "Rafael Torres", prazo: "Hoje", urgency: "soon", route: "/sessions" },
  { id: 3, programa: "Especialização em Finanças", turma: "T23B", descricao: "Revisar grade acadêmica", responsavel: "Profa. Dra. Ana Souza", prazo: "15/Mar", urgency: "soon", route: "/sessions" },
  { id: 4, programa: "Liderança Estratégica", turma: "T24B", descricao: "Aprovar reserva Anfiteatro A", responsavel: "Rafael Torres", prazo: "22/Mar", urgency: "ok", route: "/reservations" },
  { id: 5, programa: "MBA Executivo", turma: "T24A", descricao: "Revisar requisição acadêmica RA-0042", responsavel: "Paula Neves", prazo: "28/Mar", urgency: "ok", route: "/sessions" },
];

const URGENCY_CONFIG: Record<TaskUrgency, { dot: string; badge: string; label: string }> = {
  overdue: { dot: "bg-destructive", badge: "text-destructive bg-destructive/10 border-destructive/20", label: "Vencido" },
  soon: { dot: "bg-warning", badge: "text-warning bg-warning/10 border-warning/20", label: "Em breve" },
  ok: { dot: "bg-success", badge: "text-success bg-success/10 border-success/20", label: "No prazo" },
};

function TasksPanel({ onTaskClick }: { onTaskClick: (route: string) => void }) {
  const [filter, setFilter] = useState<TaskUrgency | "all">("all");
  const visible = filter === "all" ? MOCK_TASKS : MOCK_TASKS.filter((t) => t.urgency === filter);

  return (
    <div className="bg-card border border-border rounded-xl shadow-card">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold text-sm text-foreground">Minhas Tarefas</h3>
          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold border border-primary/20">{MOCK_TASKS.length}</span>
        </div>
        <div className="flex items-center gap-1">
          {(["all", "overdue", "soon", "ok"] as const).map((k) => (
            <button key={k} onClick={() => setFilter(k)}
              className={cn("text-xs px-2 py-1 rounded-md font-medium transition-colors",
                filter === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}>
              {k === "all" ? "Todas" : k === "overdue" ? "🔴" : k === "soon" ? "🟡" : "🟢"}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {visible.map((task) => {
          const urg = URGENCY_CONFIG[task.urgency];
          return (
            <button key={task.id} onClick={() => onTaskClick(task.route)}
              className="w-full text-left px-5 py-3 hover:bg-muted/40 transition-colors flex items-start gap-3 group">
              <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", urg.dot)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{task.descricao}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{task.programa} · <span className="font-mono">{task.turma}</span></p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-muted-foreground">{task.responsavel}</span>
                  <span className={cn("text-xs px-1.5 py-0.5 rounded border font-medium", urg.badge)}>
                    {task.prazo}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Approvals Panel ──────────────────────────────────────────────────────────

type ApprovalType = "program" | "turma" | "reserva" | "bloqueio";
interface ApprovalItem {
  id: number; type: ApprovalType; label: string; turma?: string;
  solicitante: string; data: string; recurso: string;
}

const MOCK_APPROVALS: ApprovalItem[] = [
  { id: 1, type: "program", label: "MBA Executivo", turma: "T25A", solicitante: "Prof. Dr. Carlos Faria", data: "Há 2h", recurso: "Solicitação de aprovação de programa" },
  { id: 2, type: "reserva", label: "Anfiteatro A", turma: undefined, solicitante: "Rafael Torres", data: "Há 4h", recurso: "Reserva 15/Mar · 08:00–18:00" },
  { id: 3, type: "bloqueio", label: "Prof. Dr. Marcos Lima", turma: undefined, solicitante: "Prof. Dr. Marcos Lima", data: "Há 1d", recurso: "Bloqueio pessoal: 20–25/Mar (deslocamento)" },
  { id: 4, type: "turma", label: "Liderança Estratégica", turma: "T24B", solicitante: "Paula Neves", data: "Há 2d", recurso: "Solicitação de aprovação de turma" },
];

const APPROVAL_TYPE_CONFIG: Record<ApprovalType, { icon: React.ReactNode; textColor: string }> = {
  program: { icon: <GraduationCap className="w-4 h-4" />, textColor: "text-primary" },
  turma: { icon: <Layers className="w-4 h-4" />, textColor: "text-success" },
  reserva: { icon: <Building2 className="w-4 h-4" />, textColor: "text-warning" },
  bloqueio: { icon: <AlertCircle className="w-4 h-4" />, textColor: "text-destructive" },
};

function ApprovalsPanel() {
  const [items, setItems] = useState<ApprovalItem[]>(MOCK_APPROVALS);

  const handle = (id: number, action: "approve" | "reject" | "adjust") => {
    setItems((prev) => prev.filter((a) => a.id !== id));
    const msg = action === "approve" ? "✅ Aprovado" : action === "reject" ? "❌ Rejeitado" : "📝 Ajuste solicitado";
    toast({ title: msg, description: "Decisão registrada no histórico.", className: action === "approve" ? "top-center-toast" : undefined });
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-card">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold text-sm text-foreground">Aprovações Pendentes</h3>
          {items.length > 0 && (
            <span className="text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full font-bold">{items.length}</span>
          )}
        </div>
      </div>
      {items.length === 0 ? (
        <div className="py-10 text-center">
          <CheckCircle2 className="w-10 h-10 text-success/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhuma aprovação pendente</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {items.map((item) => {
            const tc = APPROVAL_TYPE_CONFIG[item.type];
            return (
              <div key={item.id} className="px-5 py-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn("shrink-0", tc.textColor)}>
                    {tc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{item.label}{item.turma ? ` · ${item.turma}` : ""}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.recurso}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{item.solicitante}</span>
                      <span className="text-xs text-muted-foreground/60">·</span>
                      <span className="text-xs text-muted-foreground">{item.data}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => handle(item.id, "approve")}
                    className="flex-1 py-1.5 text-xs font-semibold bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors">
                    Aprovar
                  </button>
                  <button onClick={() => handle(item.id, "adjust")}
                    className="flex-1 py-1.5 text-xs font-semibold border border-warning/40 text-warning bg-warning/5 rounded-lg hover:bg-warning/10 transition-colors">
                    Ajuste
                  </button>
                  <button onClick={() => handle(item.id, "reject")}
                    className="flex-1 py-1.5 text-xs font-semibold border border-destructive/40 text-destructive bg-destructive/5 rounded-lg hover:bg-destructive/10 transition-colors">
                    Rejeitar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Programs() {
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [activeTab, setActiveTab] = useState<"programs" | "turmas">("programs");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedTurma, setSelectedTurma] = useState<{ turma: Turma; program: Program } | null>(null);
  const [deleteProgram, setDeleteProgram] = useState<Program | null>(null);
  const navigate = useNavigate();
  const [pendingPreReservation, setPendingPreReservation] = useState<string | null>(null);

  const openNewProgram = () => navigate("/programs/new");
  const openEditProgram = (prog: Program) => navigate("/programs/edit", { state: { program: prog } });
  const openNewTurma = (programId?: number) => navigate("/programs/turma/new", { state: { programs, initialProgramId: programId } });
  const openEditTurma = (turma: Turma, programId: number) => navigate("/programs/turma/edit", { state: { programs, turma, isEdit: true, programId } });

  const allTurmas = programs
    .filter((p) => p.status !== "deleted")
    .flatMap((p) => (p.turmas || []).map((t) => ({ turma: t, program: p })));

  const filtered = programs.filter((p) => {
    if (p.status === "deleted") return false;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sigla.toLowerCase().includes(search.toLowerCase());
    const matchStatus = activeStatus === "all" || p.status === activeStatus;
    return matchSearch && matchStatus;
  });

  const generateCode = (sigla: string) =>
    `${sigla}-T${new Date().getFullYear().toString().slice(2)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

  const formatPeriod = (start?: Date, end?: Date) => {
    if (!start) return "";
    const s = format(start, "MMM yyyy", { locale: ptBR });
    const e = end ? format(end, "MMM yyyy", { locale: ptBR }) : "";
    return e ? `${s} – ${e}` : s;
  };

  const handleCreate = (data: ProgramFormData, action: "draft" | "submit") => {
    const status: ProgramStatus = action === "submit" ? "awaiting_approval" : "draft";
    const newProg: Program = {
      ...data, id: Date.now(), code: generateCode(data.sigla),
      periodo: "", status, turmas: [], extraResponsaveis: data.extraResponsaveis,
    };
    setPrograms([...programs, newProg]);
    if (action === "submit") setPendingPreReservation(data.name);
  };

  const handleDuplicate = (prog: Program) => {
    const copy: Program = {
      ...prog, id: Date.now(), name: prog.name + " (Cópia)",
      code: generateCode(prog.sigla + "C"), status: "draft", turmas: [],
    };
    setPrograms([...programs, copy]);
    toast({ title: "Programa clonado como Rascunho.", className: "top-center-toast" });
  };

  const handleSaveAsTemplate = (prog: Program) => {
    setPrograms(programs.map((p) => p.id === prog.id ? { ...p, isTemplate: true } : p));
    toast({ title: "Salvo como template.", description: `${prog.name} agora pode ser reutilizado como base.`, className: "top-center-toast" });
  };

  const handleDelete = () => {
    if (!deleteProgram) return;
    setPrograms(programs.map((p) => p.id === deleteProgram.id ? { ...p, status: "deleted" } : p));
    if (selectedProgram?.id === deleteProgram.id) setSelectedProgram(null);
    setDeleteProgram(null);
    toast({ title: "Programa deletado.", description: "O histórico permanece no sistema.", variant: "destructive" });
  };

  const handleToggleStatus = (prog: Program) => {
    const newStatus: ProgramStatus = prog.status === "inactive" ? "draft" : "inactive";
    setPrograms(programs.map((p) => p.id === prog.id ? { ...p, status: newStatus } : p));
    toast({ title: prog.status === "inactive" ? "Programa reativado." : "Programa inativado." });
  };

  const handleCreateTurma = () => {
    // handled by NewTurmaPage — kept for compat
  };

  const handleEditTurmaLegacy = () => {
    // handled by NewTurmaPage — kept for compat
  };

  const statusFilters = [
    { key: "all", label: "Todos" },
    { key: "draft", label: "Rascunho" },
    { key: "awaiting_approval", label: "Em aprovação" },
    { key: "reserved", label: "Aprovado" },
    { key: "final", label: "Finalizado" },
    { key: "inactive", label: "Inativo" },
  ];

  const counts = programs.reduce((acc, p) => {
    if (p.status !== "deleted") acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AppLayout pageTitle="Programas e turmas" pageSubtitle="Gestão e planejamento de programas e turmas acadêmicas">
      <div className="p-6 space-y-5 animate-fade-in">

        {/* Pre-reservation notification banner */}
        {pendingPreReservation && (
          <div className="bg-primary/5 border border-primary/30 rounded-xl px-5 py-4 flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <Ghost className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Solicitação enviada ao Planejamento: "{pendingPreReservation}"</p>
                <p className="text-xs text-muted-foreground mt-0.5">Você também pode registrar uma pré-reserva de espaço neste momento.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a href="/reservations" className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5">
                <Ghost className="w-3 h-3" /> Pré-Reservar espaço
              </a>
              <button onClick={() => setPendingPreReservation(null)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}


        {/* Main tabs + search + actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex gap-1 p-1 bg-muted rounded-xl">
                {([
                  { key: "programs", label: "Programas", icon: <GraduationCap className="w-3.5 h-3.5" /> },
                  { key: "turmas", label: "Turmas", icon: <Layers className="w-3.5 h-3.5" /> },
                ] as const).map((tab) => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                      activeTab === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}>
                    {tab.icon}{tab.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 p-1 bg-muted rounded-xl">
                <button onClick={() => setViewMode("grid")}
                  className={cn("p-1.5 rounded-md transition-all", viewMode === "grid" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode("list")}
                  className={cn("p-1.5 rounded-md transition-all", viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input type="text" placeholder="Buscar por nome, turma, cliente..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-[280px]" />
              </div>
              <button onClick={() => openNewTurma()} className="border border-border text-foreground px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors">
                <Layers className="w-4 h-4" /> Nova Turma
              </button>
              <button onClick={openNewProgram} className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> Novo Programa
              </button>
            </div>
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {statusFilters.map((f) => (
              <button key={f.key} onClick={() => setActiveStatus(f.key)}
                className={cn("text-xs px-2.5 py-1.5 rounded-lg border transition-all font-medium",
                  activeStatus === f.key ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40"
                )}>
                {f.label}{counts[f.key] !== undefined && f.key !== "all" && (
                  <span className="ml-1 opacity-70">({counts[f.key]})</span>
                )}
              </button>
            ))}
          </div>

          {/* Dropdown filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {(activeTab === "programs" ? ["Todos os programas", "Todos os clientes", "Todos os tipos", "Todos os criadores"] : ["Todas as turmas", "Todos os programas", "Todos os clientes", "Todos os tipos"]).map((label) => (
              <select key={label}
                className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer hover:border-primary/40 transition-colors">
                <option>{label}</option>
              </select>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "programs" && (
          <>
            {viewMode === "list" ? (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-muted/30">
                  <span className="w-20 text-xs font-semibold text-muted-foreground">Sigla</span>
                  <span className="flex-1 text-xs font-semibold text-muted-foreground">Programa</span>
                  <span className="text-xs font-semibold text-muted-foreground shrink-0 hidden sm:block w-20">Tipo</span>
                  <span className="text-xs font-semibold text-muted-foreground shrink-0 w-28">Status</span>
                  <span className="text-xs font-semibold text-muted-foreground shrink-0 hidden md:block w-16">Turmas</span>
                  <span className="text-xs font-semibold text-muted-foreground shrink-0 hidden lg:block w-32">Período</span>
                  <span className="w-16 shrink-0" />
                </div>
                {filtered.map((prog) => (
                  <ProgramCard key={prog.id} prog={prog} viewMode="list"
                    onCardClick={() => setSelectedProgram(prog)}
                    onEdit={() => openEditProgram(prog)}
                    onDuplicate={() => handleDuplicate(prog)}
                    onSaveAsTemplate={() => handleSaveAsTemplate(prog)}
                    onDelete={() => setDeleteProgram(prog)}
                    onToggle={() => handleToggleStatus(prog)}
                    onNewTurma={() => openNewTurma(prog.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((prog) => (
                  <ProgramCard key={prog.id} prog={prog}
                    onCardClick={() => setSelectedProgram(prog)}
                    onEdit={() => openEditProgram(prog)}
                    onDuplicate={() => handleDuplicate(prog)}
                    onSaveAsTemplate={() => handleSaveAsTemplate(prog)}
                    onDelete={() => setDeleteProgram(prog)}
                    onToggle={() => handleToggleStatus(prog)}
                    onNewTurma={() => openNewTurma(prog.id)}
                  />
                ))}
              </div>
            )}
            {filtered.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium mb-1">Nenhum programa encontrado</p>
                <p className="text-muted-foreground text-sm">Tente ajustar os filtros ou crie um novo programa.</p>
                <button onClick={openNewProgram} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                  <Plus className="w-4 h-4" /> Novo Programa
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === "turmas" && (
          <>
            {viewMode === "list" ? (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-muted/30">
                  <span className="w-20 text-xs font-semibold text-muted-foreground">Sigla</span>
                  <span className="flex-1 text-xs font-semibold text-muted-foreground">Turma</span>
                  <span className="text-xs font-semibold text-muted-foreground shrink-0 w-28">Status</span>
                  <span className="text-xs font-semibold text-muted-foreground shrink-0 hidden sm:block w-24">Período</span>
                  <span className="text-xs font-semibold text-muted-foreground shrink-0 hidden md:block w-32">Diretor(a)</span>
                  <span className="text-xs font-semibold text-muted-foreground shrink-0 hidden lg:block w-36">Alocação</span>
                  <span className="w-4 shrink-0" />
                </div>
                {allTurmas.map(({ turma, program }) => (
                  <TurmaCard key={turma.id} turma={turma} program={program} viewMode="list"
                    onClick={() => setSelectedTurma({ turma, program })} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {allTurmas.map(({ turma, program }) => (
                  <TurmaCard key={turma.id} turma={turma} program={program}
                    onClick={() => setSelectedTurma({ turma, program })} />
                ))}
              </div>
            )}
            {allTurmas.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium mb-1">Nenhuma turma encontrada</p>
                <p className="text-muted-foreground text-sm">Crie uma nova turma para começar.</p>
                <button onClick={() => openNewTurma()} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                  <Plus className="w-4 h-4" /> Nova Turma
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Drawers */}
      {selectedProgram && (
        <ProgramDetailDrawer
          program={selectedProgram}
          programs={programs}
          onClose={() => setSelectedProgram(null)}
          onEditProgram={() => openEditProgram(selectedProgram)}
          onEditTurma={(turma) => openEditTurma(turma, selectedProgram.id)}
          onNewTurma={() => openNewTurma(selectedProgram.id)}
          onCPanel={(turma) => navigate("/programs/turma/cpanel", {
            state: {
              turmaName: turma.nomeTurma,
              programName: selectedProgram.name,
              siglaTurma: turma.siglaTurma,
            },
          })}
        />
      )}
      {selectedTurma && (
        <TurmaDetailDrawer
          turma={selectedTurma.turma}
          program={selectedTurma.program}
          onClose={() => setSelectedTurma(null)}
          onEdit={() => { openEditTurma(selectedTurma.turma, selectedTurma.program.id); setSelectedTurma(null); }}
          onCPanel={() => navigate("/programs/turma/cpanel", {
            state: {
              turmaName: selectedTurma.turma.nomeTurma,
              programName: selectedTurma.program.name,
              siglaTurma: selectedTurma.turma.siglaTurma,
            },
          })}
        />
      )}

      {/* Delete confirm only — create/edit now use full pages */}
      {deleteProgram && (
        <DeleteConfirmModal program={deleteProgram} onConfirm={handleDelete} onClose={() => setDeleteProgram(null)} />
      )}
    </AppLayout>
  );
}
