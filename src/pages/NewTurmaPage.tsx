import { AppLayout } from "@/components/layout/AppLayout";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Layers, X, Info, Hash, Users, AlertCircle, CheckCircle2,
  ChevronLeft, ArrowRight, Save, Calendar as CalendarLucide,
  BookOpen, UserPlus, Sparkles, Pencil, CalendarIcon, Building2,
  UserCheck, ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// ─── Types ────────────────────────────────────────────────────────────────────
type ProgramType = "custom" | "aberto" | "imersao";
type ModalityType = "presencial" | "hibrido" | "online";
type LocalType = "campus_ise" | "externo";

interface Person { id: string; name: string; role: string }
interface Program { id: number; name: string; sigla: string; cliente?: string; status: string }

interface TurmaFormData {
  nomeTurma: string; siglaTurma: string; programaId: number | "";
  diretorPrograma: string; nomeFinanceiro: string; nomeFantasia: string;
  coordenador: string; diretorAcademico: string; planejamento: string;
  producaoMateriais: string; codigoFinanceiro: string;
  periodoStart?: Date; periodoEnd?: Date; diasPrograma: number | "";
  numParticipantes: number | ""; estimativaAlunos: number | "";
  modalidade: ModalityType; anoConclusion: string;
  local: LocalType; tipoPrograma: ProgramType;
}

// ─── Static data ──────────────────────────────────────────────────────────────
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

const TIPO_PROGRAMA: { value: ProgramType; label: string }[] = [
  { value: "custom", label: "Custom" },
  { value: "aberto", label: "Aberto" },
  { value: "imersao", label: "Imersão" },
];
const MODALIDADES: { value: ModalityType; label: string }[] = [
  { value: "presencial", label: "Presencial" },
  { value: "hibrido", label: "Híbrido" },
  { value: "online", label: "Online" },
];
const LOCAIS: { value: LocalType; label: string }[] = [
  { value: "campus_ise", label: "Campus ISE" },
  { value: "externo", label: "Externo" },
];
const SLOTS = ["M1", "M2", "T1", "T2", "N1", "N2"];

const STEPS = ["Identificação", "Responsáveis", "Estrutura Acadêmica", "Grade"];

// ─── Shared sub-components ────────────────────────────────────────────────────
function FieldLabel({ children, required, optional, tooltip }: {
  children: React.ReactNode; required?: boolean; optional?: boolean; tooltip?: string;
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

function PeopleAutocomplete({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const filtered = PEOPLE.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => { setQuery(value); }, [value]);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <input
        className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
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

function DatePicker({ value, onChange, placeholder, minDate }: {
  value?: Date; onChange: (d?: Date) => void; placeholder?: string; minDate?: Date;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={cn(
          "flex items-center gap-2 w-full px-3 py-2.5 text-sm border rounded-lg bg-background text-left focus:outline-none hover:bg-muted/30 transition-colors",
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

function StepIndicator({ step, total, labels }: { step: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center gap-0">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shrink-0",
            i < step ? "bg-primary border-primary text-primary-foreground" :
            i === step ? "bg-background border-primary text-primary" :
            "bg-background border-border text-muted-foreground"
          )}>
            {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
          </div>
          <div className="ml-2 mr-3 flex-1 min-w-0">
            <p className={cn("text-xs font-medium truncate", i === step ? "text-foreground" : "text-muted-foreground")}>
              {labels[i]}
            </p>
          </div>
          {i < total - 1 && <div className={cn("h-0.5 w-6 shrink-0", i < step ? "bg-primary" : "bg-border")} />}
        </div>
      ))}
    </div>
  );
}

// ─── Step renderers ───────────────────────────────────────────────────────────
function StepIdentificacao({ form, setForm, errors, setErrors, programs }: {
  form: TurmaFormData;
  setForm: React.Dispatch<React.SetStateAction<TurmaFormData>>;
  errors: Partial<Record<keyof TurmaFormData, string>>;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<keyof TurmaFormData, string>>>>;
  programs: Program[];
}) {
  const selectedProgram = programs.find((p) => p.id === form.programaId);
  const generatedName = selectedProgram
    ? `${selectedProgram.sigla}${selectedProgram.cliente ? " " + selectedProgram.cliente.split(" ")[0] : ""} ${form.anoConclusion || new Date().getFullYear()}`
    : "";

  return (
    <div className="space-y-5">
      <div>
        <FieldLabel required>Programa relacionado</FieldLabel>
        <select
          className={cn("w-full px-3 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground",
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Nome da turma</FieldLabel>
          <input className={cn("w-full px-3 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30",
            errors.nomeTurma ? "border-destructive" : "border-input"
          )}
            value={form.nomeTurma}
            onChange={(e) => { setForm((f) => ({ ...f, nomeTurma: e.target.value })); setErrors((er) => ({ ...er, nomeTurma: undefined })); }}
            placeholder="Ex: Turma A 2025" />
          {errors.nomeTurma && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.nomeTurma}</p>}
        </div>
        <div>
          <FieldLabel required tooltip="Identificador curto — usado no código oficial">Sigla da turma</FieldLabel>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              className={cn("w-full pl-8 pr-3 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase font-mono",
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
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">Nome sugerido automaticamente</p>
            <p className="text-sm font-mono text-primary mt-0.5">{generatedName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedProgram?.sigla?.toUpperCase().includes("EMBA")
                ? "EMBA: utiliza o ano de conclusão"
                : "Utiliza o ano de início do programa"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, nomeTurma: generatedName }))}
            className="text-xs font-semibold text-primary hover:bg-primary/10 px-2.5 py-1.5 rounded-lg border border-primary/20 transition-colors shrink-0"
          >
            Usar
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel optional>Nome financeiro</FieldLabel>
          <input className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={form.nomeFinanceiro}
            onChange={(e) => setForm((f) => ({ ...f, nomeFinanceiro: e.target.value }))}
            placeholder="Nome para nota fiscal..." />
        </div>
        <div>
          <FieldLabel optional>Nome fantasia</FieldLabel>
          <input className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={form.nomeFantasia}
            onChange={(e) => setForm((f) => ({ ...f, nomeFantasia: e.target.value }))}
            placeholder="Como será divulgado..." />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel optional>Código financeiro</FieldLabel>
          <input className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
            value={form.codigoFinanceiro}
            onChange={(e) => setForm((f) => ({ ...f, codigoFinanceiro: e.target.value }))}
            placeholder="FIN-2025-001" />
        </div>
        <div>
          <FieldLabel required tooltip="EMBA: use o ano de conclusão. Demais programas: use o ano de início.">Ano de referência</FieldLabel>
          <input className={cn("w-full px-3 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30",
            errors.anoConclusion ? "border-destructive" : "border-input"
          )}
            value={form.anoConclusion}
            onChange={(e) => { setForm((f) => ({ ...f, anoConclusion: e.target.value })); setErrors((er) => ({ ...er, anoConclusion: undefined })); }}
            placeholder="2025" maxLength={4} />
          {errors.anoConclusion && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.anoConclusion}</p>}
        </div>
      </div>
    </div>
  );
}

function StepResponsaveis({ form, setForm, errors, setErrors }: {
  form: TurmaFormData;
  setForm: React.Dispatch<React.SetStateAction<TurmaFormData>>;
  errors: Partial<Record<keyof TurmaFormData, string>>;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<keyof TurmaFormData, string>>>>;
}) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel required>Diretor do programa</FieldLabel>
        <PeopleAutocomplete value={form.diretorPrograma}
          onChange={(v) => { setForm((f) => ({ ...f, diretorPrograma: v })); setErrors((er) => ({ ...er, diretorPrograma: undefined })); }}
          placeholder="Buscar diretor..." />
        {errors.diretorPrograma && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.diretorPrograma}</p>}
      </div>
      <div>
        <FieldLabel optional>Diretor acadêmico (DA)</FieldLabel>
        <PeopleAutocomplete value={form.diretorAcademico}
          onChange={(v) => setForm((f) => ({ ...f, diretorAcademico: v }))}
          placeholder="Responsável pela grade..." />
        <p className="text-xs text-muted-foreground mt-1">O DA receberá a pendência de preenchimento da grade no seu dashboard.</p>
      </div>
      <div>
        <FieldLabel optional>Coordenador</FieldLabel>
        <PeopleAutocomplete value={form.coordenador}
          onChange={(v) => setForm((f) => ({ ...f, coordenador: v }))}
          placeholder="Coordenador acadêmico..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel optional>Planejamento (DP)</FieldLabel>
          <PeopleAutocomplete value={form.planejamento}
            onChange={(v) => setForm((f) => ({ ...f, planejamento: v }))}
            placeholder="Diretor de Planejamento..." />
        </div>
        <div>
          <FieldLabel optional>Produção de materiais</FieldLabel>
          <PeopleAutocomplete value={form.producaoMateriais}
            onChange={(v) => setForm((f) => ({ ...f, producaoMateriais: v }))}
            placeholder="Responsável por materiais..." />
        </div>
      </div>
    </div>
  );
}

function StepEstrutura({ form, setForm, errors }: {
  form: TurmaFormData;
  setForm: React.Dispatch<React.SetStateAction<TurmaFormData>>;
  errors: Partial<Record<keyof TurmaFormData, string>>;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Modalidade</FieldLabel>
          <select className={cn("w-full px-3 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground",
            errors.modalidade ? "border-destructive" : "border-input"
          )}
            value={form.modalidade}
            onChange={(e) => setForm((f) => ({ ...f, modalidade: e.target.value as ModalityType }))}>
            {MODALIDADES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel optional>Local</FieldLabel>
          <select className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
            value={form.local}
            onChange={(e) => setForm((f) => ({ ...f, local: e.target.value as LocalType }))}>
            {LOCAIS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <FieldLabel optional>Intervalo de datas pretendidas</FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          <DatePicker value={form.periodoStart}
            onChange={(d) => setForm((f) => ({ ...f, periodoStart: d }))}
            placeholder="Data início" />
          <DatePicker value={form.periodoEnd}
            onChange={(d) => setForm((f) => ({ ...f, periodoEnd: d }))}
            placeholder="Data fim" minDate={form.periodoStart} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <FieldLabel optional tooltip="Total de dias letivos">Dias de programa</FieldLabel>
          <input type="number" min={0}
            className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={form.diasPrograma}
            onChange={(e) => setForm((f) => ({ ...f, diasPrograma: Number(e.target.value) || "" }))}
            placeholder="30" />
        </div>
        <div>
          <FieldLabel optional tooltip="Para dimensionamento de salas">Estimativa de alunos</FieldLabel>
          <input type="number" min={0}
            className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={form.estimativaAlunos}
            onChange={(e) => setForm((f) => ({ ...f, estimativaAlunos: Number(e.target.value) || "" }))}
            placeholder="40" />
        </div>
        <div>
          <FieldLabel optional>Nº participantes</FieldLabel>
          <input type="number" min={0}
            className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={form.numParticipantes}
            onChange={(e) => setForm((f) => ({ ...f, numParticipantes: Number(e.target.value) || "" }))}
            placeholder="40" />
        </div>
      </div>

      <div>
        <FieldLabel optional>Tipo de programa</FieldLabel>
        <select className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
          value={form.tipoPrograma}
          onChange={(e) => setForm((f) => ({ ...f, tipoPrograma: e.target.value as ProgramType }))}>
          {TIPO_PROGRAMA.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
    </div>
  );
}

function StepGrade() {
  return (
    <div className="space-y-5">
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
        <div className="grid grid-cols-3 gap-3">
          {SLOTS.map((slot) => (
            <div key={slot} className="border border-dashed border-border rounded-xl p-4 text-center hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/10 transition-colors">
                <span className="text-sm font-bold text-foreground">{slot}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {slot === "M1" && "Manhã 1"}{slot === "M2" && "Manhã 2"}
                {slot === "T1" && "Tarde 1"}{slot === "T2" && "Tarde 2"}
                {slot === "N1" && "Noite 1"}{slot === "N2" && "Noite 2"}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">Clique para adicionar</p>
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
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function NewTurmaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as { programs?: Program[]; initialProgramId?: number; turma?: any; isEdit?: boolean }) ?? {};
  const programs: Program[] = state.programs ?? [];
  const isEdit = !!state.isEdit;
  const editTurma = state.turma;

  const emptyTurmaForm: TurmaFormData = {
    nomeTurma: "", siglaTurma: "", programaId: state.initialProgramId || "",
    diretorPrograma: "", nomeFinanceiro: "", nomeFantasia: "", coordenador: "",
    diretorAcademico: "", planejamento: "", producaoMateriais: "", codigoFinanceiro: "",
    periodoStart: undefined, periodoEnd: undefined, diasPrograma: "",
    numParticipantes: "", estimativaAlunos: "", modalidade: "presencial",
    anoConclusion: String(new Date().getFullYear()), local: "campus_ise", tipoPrograma: "custom",
  };

  const [form, setForm] = useState<TurmaFormData>(
    isEdit && editTurma ? {
      nomeTurma: editTurma.nomeTurma, siglaTurma: editTurma.siglaTurma, programaId: editTurma.programaId,
      diretorPrograma: editTurma.diretorPrograma, nomeFinanceiro: editTurma.nomeFinanceiro || "",
      nomeFantasia: editTurma.nomeFantasia || "", coordenador: editTurma.coordenador || "",
      diretorAcademico: editTurma.diretorAcademico || "", planejamento: editTurma.planejamento || "",
      producaoMateriais: editTurma.producaoMateriais || "", codigoFinanceiro: editTurma.codigoFinanceiro || "",
      periodoStart: editTurma.periodoStart, periodoEnd: editTurma.periodoEnd,
      diasPrograma: editTurma.diasPrograma || "", numParticipantes: editTurma.numParticipantes || "",
      estimativaAlunos: editTurma.estimativaAlunos || "", modalidade: editTurma.modalidade || "presencial",
      anoConclusion: editTurma.anoConclusion || String(new Date().getFullYear()),
      local: editTurma.local || "campus_ise", tipoPrograma: editTurma.tipoPrograma || "custom",
    } : emptyTurmaForm
  );
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof TurmaFormData, string>>>({});

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
    toast({
      title: isEdit ? "✅ Turma atualizada com sucesso." : "✅ Turma criada com sucesso.",
      description: `"${form.nomeTurma}" foi salva como Rascunho.`,
    });
    navigate("/programs");
  };

  const stepIcons = [
    <Hash className="w-4 h-4" />,
    <Users className="w-4 h-4" />,
    <CalendarLucide className="w-4 h-4" />,
    <BookOpen className="w-4 h-4" />,
  ];

  return (
    <AppLayout
      pageTitle={isEdit ? "Editar Turma" : "Nova Turma"}
      pageSubtitle="Vinculada a um programa existente"
    >
      <div className="max-w-2xl mx-auto px-6 py-8 animate-fade-in">

        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <Layers className="w-5 h-5 text-success" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {isEdit ? `Editar: ${editTurma?.nomeTurma}` : "Nova Turma"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isEdit ? "Atualize as informações da turma abaixo." : "Configure as informações da nova turma passo a passo."}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="mb-8">
          <StepIndicator step={step} total={STEPS.length} labels={STEPS} />
        </div>

        {/* Form card */}
        <div className="bg-card border border-border rounded-2xl shadow-sm">

          {/* Step header */}
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {stepIcons[step]}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{STEPS[step]}</p>
                <p className="text-xs text-muted-foreground">
                  Passo {step + 1} de {STEPS.length}
                </p>
              </div>
            </div>
          </div>

          {/* Form body */}
          <div className="px-6 py-6">
            {step === 0 && <StepIdentificacao form={form} setForm={setForm} errors={errors} setErrors={setErrors} programs={programs} />}
            {step === 1 && <StepResponsaveis form={form} setForm={setForm} errors={errors} setErrors={setErrors} />}
            {step === 2 && <StepEstrutura form={form} setForm={setForm} errors={errors} />}
            {step === 3 && <StepGrade />}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/programs")}
              className="px-4 py-2.5 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            {step > 0 && (
              <button onClick={prev}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" /> Anterior
              </button>
            )}
          </div>

          <div>
            {step < STEPS.length - 1 ? (
              <button onClick={next}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Próximo <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Save className="w-3.5 h-3.5" />
                {isEdit ? "Salvar Alterações" : "Salvar Turma"}
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
          <Info className="w-3 h-3 shrink-0" />
          Campos com <span className="text-destructive font-semibold mx-0.5">*</span> são obrigatórios para avançar
        </p>
      </div>
    </AppLayout>
  );
}
