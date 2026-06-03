import { AppLayout } from "@/components/layout/AppLayout";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Layers, X, Info, Hash, Users, AlertCircle, CheckCircle2,
  ChevronLeft, ArrowRight, Save, Calendar as CalendarLucide,
  BookOpen, UserPlus, Sparkles, Pencil, CalendarIcon, Building2,
  UserCheck, ClipboardList, Plus, Trash2, GripVertical, ChevronDown,
  ChevronRight, FileText, Send, Copy, Settings, Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, useDraggable, useDroppable, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// ─── Types ────────────────────────────────────────────────────────────────────
type ProgramType = "custom" | "aberto" | "imersao" | "colaboradores" | "educacao_executiva" | "emba" | "eventos" | "internacionais" | "llm" | "mba_full_time" | "easy_humanidades";
type ModalityType = "presencial" | "hibrido" | "online";
type LocalType = "campus_ise" | "externo";

interface Person { id: string; name: string; role: string }
interface Program { id: number; name: string; sigla: string; cliente?: string; status: string }

interface TurmaFormData {
  nomeTurma: string; siglaTurma: string; programaId: number | "";
  diretorPrograma: string; nomeFinanceiro: string; nomeFantasia: string;
  coordenador: string; diretorAcademico: string; planejamento: string;
  producaoMateriais: string; codigoFinanceiro: string;
  diretorTurma?: string; coordenadorTurma?: string;
  coordenadorAcademico?: string; responsavelMateriais?: string;
  nomeFantasiaI18n: Array<{ langCode: string; langLabel: string; value: string }>;
  periodoStart?: Date; periodoEnd?: Date; diasPrograma: number | "";
  numParticipantes: number | ""; estimativaAlunos: number | "";
  modalidade: ModalityType; anoInicio: string; anoConclusion: string;
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
  { value: "emba", label: "EMBA" },
  { value: "mba_full_time", label: "MBA Full Time" },
  { value: "educacao_executiva", label: "Educação Executiva" },
  { value: "colaboradores", label: "Colaboradores" },
  { value: "eventos", label: "Eventos" },
  { value: "internacionais", label: "Internacionais" },
  { value: "llm", label: "LLM" },
  { value: "easy_humanidades", label: "Easy Humanidades" },
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
const AVAILABLE_LANGUAGES = [
  { code: "fr", label: "Francês" },
  { code: "de", label: "Alemão" },
  { code: "it", label: "Italiano" },
  { code: "zh", label: "Chinês" },
  { code: "ja", label: "Japonês" },
  { code: "ar", label: "Árabe" },
  { code: "ru", label: "Russo" },
  { code: "pt-pt", label: "Português (Portugal)" },
];
const STEPS = ["Identificação", "Responsáveis", "Estrutura Acadêmica", "Grade", "Detalhes das sessões", "Dias de aula"];

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
    <div className="flex items-center">
      {Array.from({ length: total }, (_, i) => [
        <div key={`s${i}`} className="flex items-center gap-2 shrink-0">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shrink-0",
            i < step ? "bg-primary border-primary text-primary-foreground" :
            i === step ? "bg-background border-primary text-primary" :
            "bg-background border-border text-muted-foreground"
          )}>
            {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
          </div>
          <p className={cn("text-xs font-medium whitespace-nowrap", i === step ? "text-foreground" : "text-muted-foreground")}>
            {labels[i]}
          </p>
        </div>,
        i < total - 1 && (
          <div key={`c${i}`} className={cn("flex-1 h-0.5 mx-2 min-w-[12px]", i < step ? "bg-primary" : "bg-border")} />
        ),
      ]).flat()}
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
  const isEmba = selectedProgram?.sigla?.toUpperCase().includes("EMBA") ?? false;
  const generatedName = selectedProgram
    ? `${selectedProgram.sigla}${selectedProgram.cliente ? " " + selectedProgram.cliente.split(" ")[0] : ""} ${isEmba ? (form.anoConclusion || form.anoInicio || new Date().getFullYear()) : (form.anoInicio || new Date().getFullYear())}`
    : "";
  const [showLangPicker, setShowLangPicker] = useState(false);
  const langPickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langPickerRef.current && !langPickerRef.current.contains(e.target as Node)) setShowLangPicker(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

      <div>
        <FieldLabel optional>Nome financeiro</FieldLabel>
        <input className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={form.nomeFinanceiro}
          onChange={(e) => setForm((f) => ({ ...f, nomeFinanceiro: e.target.value }))}
          placeholder="Nome para nota fiscal..." />
      </div>

      <div>
        <FieldLabel optional>Nome fantasia</FieldLabel>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 w-24 shrink-0">
              <Globe className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Padrão</span>
            </div>
            <input className="flex-1 px-3 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.nomeFantasia}
              onChange={(e) => setForm((f) => ({ ...f, nomeFantasia: e.target.value }))}
              placeholder="Como será divulgado..." />
          </div>
          {form.nomeFantasiaI18n.map((item, idx) => (
            <div key={item.langCode} className="flex items-center gap-2">
              <div className="flex items-center gap-1 w-24 shrink-0">
                <Globe className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{item.langLabel}</span>
              </div>
              <input
                className="flex-1 px-3 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={item.value}
                onChange={(e) => {
                  const updated = form.nomeFantasiaI18n.map((l, i) => i === idx ? { ...l, value: e.target.value } : l);
                  setForm((f) => ({ ...f, nomeFantasiaI18n: updated }));
                }}
                placeholder={`Nome fantasia em ${item.langLabel}...`}
              />
              {idx >= 2 && (
                <button type="button"
                  onClick={() => setForm((f) => ({ ...f, nomeFantasiaI18n: f.nomeFantasiaI18n.filter((_, i) => i !== idx) }))}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          <div className="relative" ref={langPickerRef}>
            {AVAILABLE_LANGUAGES.filter((l) => !form.nomeFantasiaI18n.find((x) => x.langCode === l.code)).length > 0 && (
              <button type="button"
                onClick={() => setShowLangPicker((p) => !p)}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-1">
                <Plus className="w-3 h-3" /> Adicionar outro idioma
              </button>
            )}
            {showLangPicker && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-10 min-w-40 overflow-hidden">
                {AVAILABLE_LANGUAGES
                  .filter((l) => !form.nomeFantasiaI18n.find((x) => x.langCode === l.code))
                  .map((lang) => (
                    <button key={lang.code} type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors text-foreground"
                      onClick={() => {
                        setForm((f) => ({
                          ...f,
                          nomeFantasiaI18n: [...f.nomeFantasiaI18n, { langCode: lang.code, langLabel: lang.label, value: "" }],
                        }));
                        setShowLangPicker(false);
                      }}>
                      {lang.label}
                    </button>
                  ))}
              </div>
            )}
          </div>
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel required tooltip="Ano em que a turma inicia o programa.">Ano de Início</FieldLabel>
          <input className={cn("w-full px-3 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30",
            errors.anoInicio ? "border-destructive" : "border-input"
          )}
            value={form.anoInicio}
            onChange={(e) => { setForm((f) => ({ ...f, anoInicio: e.target.value })); setErrors((er) => ({ ...er, anoInicio: undefined })); }}
            placeholder="2025" maxLength={4} />
          {errors.anoInicio && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.anoInicio}</p>}
        </div>
        <div>
          <FieldLabel required>Ano de Conclusão</FieldLabel>
          <input className={cn("w-full px-3 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30",
            errors.anoConclusion ? "border-destructive" : "border-input"
          )}
            value={form.anoConclusion}
            onChange={(e) => { setForm((f) => ({ ...f, anoConclusion: e.target.value })); setErrors((er) => ({ ...er, anoConclusion: undefined })); }}
            placeholder="2026" maxLength={4} />
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
      <div className="grid grid-cols-2 gap-4">
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
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel optional>Coordenador</FieldLabel>
          <PeopleAutocomplete value={form.coordenador}
            onChange={(v) => setForm((f) => ({ ...f, coordenador: v }))}
            placeholder="Coordenador acadêmico..." />
        </div>
        <div>
          <FieldLabel optional>Planejamento (DP)</FieldLabel>
          <PeopleAutocomplete value={form.planejamento}
            onChange={(v) => setForm((f) => ({ ...f, planejamento: v }))}
            placeholder="Diretor de Planejamento..." />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel optional>Produção de materiais</FieldLabel>
          <PeopleAutocomplete value={form.producaoMateriais}
            onChange={(v) => setForm((f) => ({ ...f, producaoMateriais: v }))}
            placeholder="Responsável por materiais..." />
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Coordenação da turma</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel optional>Diretor da Turma</FieldLabel>
            <PeopleAutocomplete value={form.diretorTurma ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, diretorTurma: v }))}
              placeholder="Buscar diretor da turma..." />
          </div>
          <div>
            <FieldLabel optional>Coordenador da Turma</FieldLabel>
            <PeopleAutocomplete value={form.coordenadorTurma ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, coordenadorTurma: v }))}
              placeholder="Buscar coordenador da turma..." />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <FieldLabel optional>Coordenador Acadêmico</FieldLabel>
            <PeopleAutocomplete value={form.coordenadorAcademico ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, coordenadorAcademico: v }))}
              placeholder="Buscar coordenador acadêmico..." />
          </div>
          <div>
            <FieldLabel optional>Responsável por Materiais</FieldLabel>
            <PeopleAutocomplete value={form.responsavelMateriais ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, responsavelMateriais: v }))}
              placeholder="Buscar responsável..." />
          </div>
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
      <div>
        <FieldLabel optional>Local</FieldLabel>
        <select className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
          value={form.local}
          onChange={(e) => setForm((f) => ({ ...f, local: e.target.value as LocalType }))}>
          {LOCAIS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </div>

      <div>
        <FieldLabel optional>Datas da turma</FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          <DatePicker value={form.periodoStart}
            onChange={(d) => setForm((f) => ({ ...f, periodoStart: d }))}
            placeholder="Data de início" />
          <DatePicker value={form.periodoEnd}
            onChange={(d) => setForm((f) => ({ ...f, periodoEnd: d }))}
            placeholder="Data de fim" minDate={form.periodoStart} />
        </div>
      </div>

      <div>
        <FieldLabel optional>Nº de participantes</FieldLabel>
        <input type="number" min={0}
          className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={form.numParticipantes}
          onChange={(e) => setForm((f) => ({ ...f, numParticipantes: Number(e.target.value) || "" }))}
          placeholder="40" />
      </div>
    </div>
  );
}

// ─── ClonarTemplateModal ─────────────────────────────────────────────────────────────

const MOCK_TURMAS_TEMPLATE = [
  { id: "t1", sigla: "EMBA-23A", nome: "EMBA Turma 2023 A", periodo: "Mar 2023 – Jan 2024", sessoes: 48 },
  { id: "t2", sigla: "EMBA-22B", nome: "EMBA Turma 2022 B", periodo: "Set 2022 – Jun 2023", sessoes: 48 },
  { id: "t3", sigla: "MBA-23A", nome: "MBA Full Time 2023", periodo: "Fev 2023 – Dez 2023", sessoes: 60 },
  { id: "t4", sigla: "EXEC-23", nome: "Educação Executiva 2023", periodo: "Mai 2023 – Nov 2023", sessoes: 24 },
];
const MOCK_TEMPLATES_INST = [
  { id: "tpl1", nome: "Template EMBA Padrão", versao: "v2.3", sessoes: 48, atualizado: "Jan 2024" },
  { id: "tpl2", nome: "Template MBA Full Time", versao: "v1.8", sessoes: 60, atualizado: "Dez 2023" },
  { id: "tpl3", nome: "Template Educação Executiva", versao: "v3.1", sessoes: 24, atualizado: "Mar 2024" },
];

function ClonarTemplateModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [tab, setTab] = useState<"turma" | "template">("turma");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [checks, setChecks] = useState({
    info: true, turmas: false, grade: true, agrupamentos: false,
  });

  const turmas = MOCK_TURMAS_TEMPLATE.filter((t) =>
    t.nome.toLowerCase().includes(search.toLowerCase()) || t.sigla.toLowerCase().includes(search.toLowerCase())
  );
  const templates = MOCK_TEMPLATES_INST.filter((t) =>
    t.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[85vh] animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div className="flex items-center gap-3">
              <Copy className="w-4 h-4 text-primary shrink-0" />
              <h2 className="text-base font-bold text-foreground">Criar a partir de...</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mx-6 mt-4 p-1 bg-muted rounded-xl shrink-0">
            {([{ key: "turma", label: "Clonar Turma Anterior" }, { key: "template", label: "Template Institucional" }] as const).map((t) => (
              <button key={t.key} onClick={() => { setTab(t.key); setSelected(null); setSearch(""); }}
                className={cn("flex-1 py-2 text-xs font-medium rounded-lg transition-all",
                  tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}>{t.label}</button>
            ))}
          </div>

          {/* Search */}
          <div className="px-6 mt-3 shrink-0">
            <input
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1.5">
            {tab === "turma" && turmas.map((t) => (
              <label key={t.id} className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer border transition-all",
                selected === t.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
              )}>
                <input type="radio" name="template-turma" checked={selected === t.id}
                  onChange={() => setSelected(t.id)} className="shrink-0 accent-primary" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{t.sigla}</span>
                    <span className="text-sm font-medium text-foreground truncate">{t.nome}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.periodo} · {t.sessoes} sessões</p>
                </div>
              </label>
            ))}
            {tab === "template" && templates.map((t) => (
              <label key={t.id} className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer border transition-all",
                selected === t.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
              )}>
                <input type="radio" name="template-inst" checked={selected === t.id}
                  onChange={() => setSelected(t.id)} className="shrink-0 accent-primary" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{t.versao}</span>
                    <span className="text-sm font-medium text-foreground truncate">{t.nome}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.sessoes} sessões · Atualizado {t.atualizado}</p>
                </div>
              </label>
            ))}
            {((tab === "turma" && turmas.length === 0) || (tab === "template" && templates.length === 0)) && (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum resultado encontrado.</p>
            )}
          </div>

          {/* Checkboxes */}
          <div className="px-6 py-4 border-t border-border shrink-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">Incluir na cópia</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { key: "info", label: "Informações do programa" },
                { key: "turmas", label: "Turmas" },
                { key: "grade", label: "Grade Acadêmica" },
                { key: "agrupamentos", label: "Agrupamento de Atividades" },
              ] as const).map((c) => (
                <label key={c.key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={checks[c.key]}
                    onChange={() => setChecks((p) => ({ ...p, [c.key]: !p[c.key] }))}
                    className="rounded accent-primary" />
                  <span className="text-xs text-foreground">{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30 shrink-0">
            <button onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors">
              Começar do zero
            </button>
            <button onClick={() => { if (selected) { onConfirm(); onClose(); } }}
              disabled={!selected}
              className={cn("flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                selected ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
              )}>
              <Copy className="w-3.5 h-3.5" /> Clonar estrutura selecionada
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── StepGrade ──────────────────────────────────────────────────────────────────────

interface GradeModule { id: string; nome: string; disciplinas: GradeDisciplina[] }
interface GradeDisciplina { id: string; professor: string; modalidade: "presencial" | "online"; numSessoes: number; modulo: string }

function ModalDisciplina({ modulo, onClose, onSave }: {
  modulo: string; onClose: () => void;
  onSave: (d: GradeDisciplina) => void;
}) {
  const [form, setForm] = useState<GradeDisciplina>({
    id: crypto.randomUUID(), professor: "", modalidade: "presencial", numSessoes: 1, modulo,
  });
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary shrink-0" />
              <h2 className="text-sm font-bold text-foreground">Adicionar disciplina</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div>
              <FieldLabel>Módulo</FieldLabel>
              <input className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.modulo} onChange={(e) => setForm({ ...form, modulo: e.target.value })} />
            </div>
            <div>
              <FieldLabel>Professor</FieldLabel>
              <PeopleAutocomplete value={form.professor}
                onChange={(v) => setForm({ ...form, professor: v })} placeholder="Nome do professor..." />
            </div>
            <div>
              <FieldLabel>Modalidade</FieldLabel>
              <div className="flex gap-2">
                {(["presencial", "online"] as const).map((m) => (
                  <button key={m} type="button"
                    onClick={() => setForm({ ...form, modalidade: m })}
                    className={cn("flex-1 py-2 text-xs font-medium rounded-lg border transition-all",
                      form.modalidade === m ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted text-foreground"
                    )}>
                    {m === "presencial" ? "Presencial" : "Online"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Nº de sessões</FieldLabel>
              <input type="number" min={1} max={99}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.numSessoes}
                onChange={(e) => setForm({ ...form, numSessoes: Math.max(1, Number(e.target.value)) })} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button onClick={() => { onSave(form); onClose(); }}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function StepGrade() {
  const [modules, setModules] = useState<GradeModule[]>([
    { id: "m1", nome: "Módulo 1 — Fundamentos", disciplinas: [
      { id: "d1", professor: "Prof. Dr. Carlos Faria", modalidade: "presencial", numSessoes: 3, modulo: "Módulo 1 — Fundamentos" },
    ]},
    { id: "m2", nome: "Módulo 2 — Estratégia", disciplinas: [] },
  ]);
  const [newModuleName, setNewModuleName] = useState("");
  const [editModuleId, setEditModuleId] = useState<string | null>(null);
  const [addDisciplinaFor, setAddDisciplinaFor] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ m1: true });

  const addModule = () => {
    const name = newModuleName.trim();
    if (!name) return;
    setModules((p) => [...p, { id: crypto.randomUUID(), nome: name, disciplinas: [] }]);
    setNewModuleName("");
  };
  const deleteModule = (id: string) => setModules((p) => p.filter((m) => m.id !== id));
  const addDisciplina = (moduleId: string, d: GradeDisciplina) => {
    setModules((p) => p.map((m) => m.id === moduleId ? { ...m, disciplinas: [...m.disciplinas, d] } : m));
  };
  const removeDisciplina = (moduleId: string, dId: string) => {
    setModules((p) => p.map((m) => m.id === moduleId ? { ...m, disciplinas: m.disciplinas.filter((d) => d.id !== dId) } : m));
  };

  return (
    <div className="space-y-5">
      {addDisciplinaFor && (
        <ModalDisciplina
          modulo={modules.find((m) => m.id === addDisciplinaFor)?.nome ?? ""}
          onClose={() => setAddDisciplinaFor(null)}
          onSave={(d) => addDisciplina(addDisciplinaFor, d)}
        />
      )}
      <div className="flex items-center gap-2">
        <input
          className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          placeholder="Nome do módulo..."
          value={newModuleName}
          onChange={(e) => setNewModuleName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addModule()}
        />
        <button onClick={addModule}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shrink-0">
          <Plus className="w-3.5 h-3.5" /> Adicionar
        </button>
      </div>
      <div className="space-y-3">
        {modules.map((mod) => (
          <div key={mod.id} className="border border-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/30">
              <button onClick={() => setExpanded((p) => ({ ...p, [mod.id]: !p[mod.id] }))}
                className="flex items-center gap-2 flex-1 text-left min-w-0">
                {expanded[mod.id] ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                <span className="text-sm font-semibold text-foreground truncate">
                  {editModuleId === mod.id ? (
                    <input className="text-sm font-semibold text-foreground bg-transparent border-b border-primary focus:outline-none w-48"
                      autoFocus defaultValue={mod.nome}
                      onBlur={(e) => { setModules((p) => p.map((m) => m.id === mod.id ? { ...m, nome: e.target.value } : m)); setEditModuleId(null); }}
                      onKeyDown={(e) => e.key === "Enter" && (e.currentTarget.blur())}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : mod.nome}
                </span>
                <span className="text-xs text-muted-foreground ml-1 shrink-0">
                  {mod.disciplinas.reduce((s, d) => s + d.numSessoes, 0)} sessões
                </span>
              </button>
              <button onClick={() => setAddDisciplinaFor(mod.id)}
                className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground">
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setEditModuleId(editModuleId === mod.id ? null : mod.id)}
                className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground">
                <Pencil className="w-3 h-3" />
              </button>
              <button onClick={() => deleteModule(mod.id)}
                className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            {expanded[mod.id] && (
              <div className="divide-y divide-border">
                {mod.disciplinas.length === 0 ? (
                  <div className="px-4 py-4 text-center">
                    <p className="text-xs text-muted-foreground">Nenhuma disciplina. Clique em + para adicionar.</p>
                  </div>
                ) : mod.disciplinas.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground opacity-40 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{d.professor || "Professor TBD"}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium",
                          d.modalidade === "presencial" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        )}>{d.modalidade === "presencial" ? "Presencial" : "Online"}</span>
                        <span className="text-xs text-muted-foreground">{d.numSessoes} sessão(s)</span>
                      </div>
                    </div>
                    <button onClick={() => removeDisciplina(mod.id, d.id)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {modules.length === 0 && (
          <div className="border border-dashed border-border rounded-xl py-8 text-center">
            <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-foreground font-medium">Nenhum módulo adicionado</p>
            <p className="text-xs text-muted-foreground mt-1">Digite um nome acima e clique em Adicionar.</p>
          </div>
        )}
      </div>
      <div className="bg-muted/50 rounded-xl p-4 flex items-start gap-3">
        <Globe className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-foreground">Integração Moodle</p>
          <p className="text-xs text-muted-foreground mt-0.5">Casos e documentos pedagógicos vinculados via API do Moodle após criação da turma.</p>
        </div>
      </div>
    </div>
  );
}

interface SessaoData {
  id: string; titulo: string; slot: string; status: "draft" | "confirmada" | "cancelada";
  modalidade: "presencial" | "hibrido" | "online";
  professor: string; duracao: number; recurso?: string; modulo?: string;
  tema?: string; objetivos?: string;
}
interface DisciplinaData { id: string; nome: string; modulo?: string; sessoes: SessaoData[] }

const MOCK_DISCIPLINAS: DisciplinaData[] = [
  { id: "d1", nome: "Estratégia Empresarial", modulo: "Módulo 1",
    sessoes: [
      { id: "s1", titulo: "Introdução à Estratégia", slot: "M1", status: "draft", modalidade: "presencial", professor: "Prof. Dr. Carlos Faria", duracao: 90 },
      { id: "s2", titulo: "Análise Competitiva", slot: "T1", status: "draft", modalidade: "presencial", professor: "Prof. Dr. Carlos Faria", duracao: 90 },
      { id: "s3", titulo: "Estudo de Caso AMBEV", slot: "M2", status: "confirmada", modalidade: "presencial", professor: "Prof. Dr. Carlos Faria", duracao: 120 },
    ]},
  { id: "d2", nome: "Finanças Corporativas", modulo: "Módulo 1",
    sessoes: [
      { id: "s4", titulo: "Valuation", slot: "M1", status: "draft", modalidade: "online", professor: "Profa. Dra. Ana Souza", duracao: 90 },
      { id: "s5", titulo: "Estrutura de Capital", slot: "T2", status: "draft", modalidade: "presencial", professor: "Profa. Dra. Ana Souza", duracao: 90 },
    ]},
  { id: "d3", nome: "Marketing Estratégico", modulo: "Módulo 2",
    sessoes: [
      { id: "s6", titulo: "Posicionamento de Marca", slot: "M1", status: "draft", modalidade: "presencial", professor: "Prof. Dr. Pedro Costa", duracao: 90 },
    ]},
];

function ModalSessao({ sessao, onClose, onSave }: {
  sessao: SessaoData; onClose: () => void; onSave: (s: SessaoData) => void;
}) {
  const [tab, setTab] = useState<"info" | "materiais" | "logistica">("info");
  const [form, setForm] = useState<SessaoData>(sessao);
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] animate-fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary shrink-0" />
              <h2 className="text-sm font-bold text-foreground">{form.titulo || "Editar sessão"}</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-1 mx-5 mt-3 p-1 bg-muted rounded-lg shrink-0">
            {([{ key: "info", label: "Informações" }, { key: "materiais", label: "Materiais" }, { key: "logistica", label: "Logística" }] as const).map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={cn("flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                  tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}>{t.label}</button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {tab === "info" && (
              <>
                <div className="col-span-2">
                  <FieldLabel required>Título da sessão</FieldLabel>
                  <input className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Slot</FieldLabel>
                    <select className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none"
                      value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })}>
                      {SLOTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Duração (min)</FieldLabel>
                    <input type="number" min={30} step={15}
                      className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none"
                      value={form.duracao} onChange={(e) => setForm({ ...form, duracao: Number(e.target.value) })} />
                  </div>
                </div>
                <div>
                  <FieldLabel>Professor</FieldLabel>
                  <PeopleAutocomplete value={form.professor} onChange={(v) => setForm({ ...form, professor: v })} />
                </div>
                <div>
                  <FieldLabel>Modalidade</FieldLabel>
                  <div className="flex gap-2">
                    {MODALIDADES.map((m) => (
                      <button key={m.value} type="button" onClick={() => setForm({ ...form, modalidade: m.value as "presencial" | "hibrido" | "online" })}
                        className={cn("flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all",
                          form.modalidade === m.value ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted text-foreground"
                        )}>{m.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <FieldLabel optional>Tema / Objetivos</FieldLabel>
                  <textarea rows={3} className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none resize-none"
                    value={form.tema || ""} onChange={(e) => setForm({ ...form, tema: e.target.value })}
                    placeholder="Descreva o tema e objetivos da sessão..." />
                </div>
                <div>
                  <FieldLabel optional>Recurso / Sala estimada</FieldLabel>
                  <input className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none"
                    value={form.recurso || ""} onChange={(e) => setForm({ ...form, recurso: e.target.value })}
                    placeholder="Ex: Auditório A, Sala 201..." />
                </div>
              </>
            )}
            {tab === "materiais" && (
              <div className="bg-muted/40 rounded-xl border border-dashed border-border p-6 text-center">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Materiais do Moodle</p>
                <p className="text-xs text-muted-foreground mt-1">Materiais vinculados via API do Moodle aparecerão aqui após a criação da turma.</p>
              </div>
            )}
            {tab === "logistica" && (
              <div className="space-y-4">
                {(["Solicitar RA", "Solicitar refeição", "Marcar como evento"] as const).map((item) => (
                  <label key={item} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="rounded accent-primary" />
                    <span className="text-sm text-foreground">{item}</span>
                  </label>
                ))}
                <div>
                  <FieldLabel optional>Necessidades especiais</FieldLabel>
                  <input className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none"
                    placeholder="Ex: Projetor duplo, microfone sem fio..." />
                </div>
                <div>
                  <FieldLabel optional>Observações</FieldLabel>
                  <textarea rows={3} className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none resize-none"
                    placeholder="Anotações internas sobre a sessão..." />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button onClick={() => { onSave(form); onClose(); }}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Salvar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function StepDetalhes() {
  const [disciplinas, setDisciplinas] = useState<DisciplinaData[]>(MOCK_DISCIPLINAS);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ d1: true });
  const [editSessao, setEditSessao] = useState<{ sessao: SessaoData; disciplinaId: string } | null>(null);

  const updateSessao = (disciplinaId: string, updated: SessaoData) => {
    setDisciplinas((prev) => prev.map((d) =>
      d.id === disciplinaId ? { ...d, sessoes: d.sessoes.map((s) => s.id === updated.id ? updated : s) } : d
    ));
  };
  const removeSessao = (disciplinaId: string, sessaoId: string) => {
    setDisciplinas((prev) => prev.map((d) =>
      d.id === disciplinaId ? { ...d, sessoes: d.sessoes.filter((s) => s.id !== sessaoId) } : d
    ));
  };
  const addSessao = (disciplinaId: string) => {
    const novaS: SessaoData = {
      id: crypto.randomUUID(), titulo: "Nova sessão", slot: "M1",
      status: "draft", modalidade: "presencial", professor: "", duracao: 90,
    };
    setDisciplinas((prev) => prev.map((d) =>
      d.id === disciplinaId ? { ...d, sessoes: [...d.sessoes, novaS] } : d
    ));
  };

  const totalSessoes = disciplinas.reduce((s, d) => s + d.sessoes.length, 0);
  const confirmedSessoes = disciplinas.reduce((s, d) => s + d.sessoes.filter((ss) => ss.status === "confirmada").length, 0);

  return (
    <div className="space-y-4">
      {editSessao && (
        <ModalSessao sessao={editSessao.sessao} onClose={() => setEditSessao(null)}
          onSave={(updated) => { updateSessao(editSessao.disciplinaId, updated); setEditSessao(null); }} />
      )}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-foreground">Recursos em modo Rascunho</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Alocações nesta etapa não disparam convites ou bloqueios no Outlook.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sessões e disciplinas</p>
        <span className="text-xs text-muted-foreground">{confirmedSessoes}/{totalSessoes} confirmadas</span>
      </div>
      <div className="space-y-3">
        {disciplinas.map((disc) => {
          const confirmed = disc.sessoes.filter((s) => s.status === "confirmada").length;
          return (
            <div key={disc.id} className="border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 cursor-pointer"
                onClick={() => setExpanded((p) => ({ ...p, [disc.id]: !p[disc.id] }))}>
                {expanded[disc.id] ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm font-semibold text-foreground flex-1 truncate">{disc.nome}</span>
                {disc.modulo && <span className="text-xs px-2 py-0.5 bg-muted rounded text-muted-foreground shrink-0 hidden sm:block">{disc.modulo}</span>}
                <span className="text-xs text-muted-foreground shrink-0">{confirmed}/{disc.sessoes.length}</span>
                <button onClick={(e) => { e.stopPropagation(); addSessao(disc.id); }}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {expanded[disc.id] && (
                <div className="divide-y divide-border">
                  {disc.sessoes.length === 0 ? (
                    <div className="px-4 py-4 text-center">
                      <p className="text-xs text-muted-foreground">Nenhuma sessão. Clique em + para adicionar.</p>
                    </div>
                  ) : disc.sessoes.map((sessao) => (
                    <div key={sessao.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 group transition-colors">
                      <GripVertical className="w-3.5 h-3.5 text-muted-foreground opacity-40 shrink-0" />
                      <select className="text-xs px-2 py-1 rounded border border-border bg-background text-foreground w-12 shrink-0"
                        value={sessao.slot} onChange={(e) => updateSessao(disc.id, { ...sessao, slot: e.target.value })}>
                        {SLOTS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <span className="text-sm text-foreground flex-1 truncate">{sessao.titulo}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full border shrink-0 hidden sm:block",
                        sessao.status === "confirmada" ? "bg-success/10 text-success border-success/20" :
                        sessao.status === "cancelada" ? "bg-destructive/10 text-destructive border-destructive/20" :
                        "bg-muted text-muted-foreground border-muted-foreground/20"
                      )}>{sessao.status}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded shrink-0 hidden md:block",
                        sessao.modalidade === "presencial" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>{MODALIDADES.find((m) => m.value === sessao.modalidade)?.label}</span>
                      <span className="text-xs text-muted-foreground shrink-0 hidden lg:block truncate max-w-[100px]">{sessao.professor}</span>
                      <button onClick={() => setEditSessao({ sessao, disciplinaId: disc.id })}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeSessao(disc.id, sessao.id)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all shrink-0">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const TIME_ROWS = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

interface AllocSessao { id: string; nome: string; slot: string; modulo?: string; duracao?: number; allocated?: boolean; dayIdx?: number; timeIdx?: number }

const MOCK_ALLOC_SESSOES: AllocSessao[] = [
  { id: "a1", nome: "Introdução à Estratégia", slot: "M1", modulo: "Módulo 1", duracao: 90 },
  { id: "a2", nome: "Análise Competitiva", slot: "T1", modulo: "Módulo 1", duracao: 90, allocated: true, dayIdx: 0, timeIdx: 2 },
  { id: "a3", nome: "Valuation", slot: "M2", modulo: "Módulo 1", duracao: 90 },
  { id: "a4", nome: "Estudo de Caso AMBEV", slot: "M1", modulo: "Módulo 2", duracao: 120 },
  { id: "a5", nome: "Estrutura de Capital", slot: "T2", modulo: "Módulo 1", duracao: 90, allocated: true, dayIdx: 2, timeIdx: 5 },
  { id: "a6", nome: "Posicionamento de Marca", slot: "M1", modulo: "Módulo 2", duracao: 90 },
];

// ─── DnD sub-components ───────────────────────────────────────────────────────
function DraggableSessionCard({ sessao, academic }: { sessao: AllocSessao; academic: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: sessao.id });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes}
      className={cn(
        "flex items-center gap-2 px-2.5 py-2.5 border border-border rounded-xl bg-card hover:border-primary/40 hover:shadow-sm transition-all cursor-grab touch-none",
        isDragging && "opacity-40"
      )}>
      <GripVertical className="w-3 h-3 text-muted-foreground opacity-40 shrink-0" />
      {academic ? (
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{sessao.nome}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-xs font-mono text-muted-foreground">{sessao.slot}</span>
            {sessao.modulo && <span className="text-xs text-muted-foreground/60 truncate">{sessao.modulo}</span>}
          </div>
        </div>
      ) : (
        <p className="text-xs font-medium text-foreground truncate flex-1">{sessao.nome}</p>
      )}
    </div>
  );
}

function DraggablePlacedSession({ sessao, onRemove, isBeingDragged }: {
  sessao: AllocSessao; onRemove: () => void; isBeingDragged: boolean;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: sessao.id });
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div ref={setNodeRef} {...listeners} {...attributes}
          className={cn(
            "h-10 rounded-lg bg-primary/10 border border-primary/20 px-1.5 flex items-center justify-between group cursor-grab touch-none hover:bg-primary/15 transition-colors w-full overflow-hidden",
            isBeingDragged && "opacity-40"
          )}>
          <span className="text-xs text-primary font-medium truncate flex-1 min-w-0">{sessao.nome}</span>
          <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="opacity-0 group-hover:opacity-100 shrink-0 ml-1 text-muted-foreground hover:text-destructive transition-all">
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{sessao.nome}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function DroppableCell({ dayIdx, timeIdx, children, isOver, isEmpty }: {
  dayIdx: number; timeIdx: number; children?: React.ReactNode; isOver: boolean; isEmpty: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: `cell-${dayIdx}-${timeIdx}`, data: { dayIdx, timeIdx } });
  return (
    <div ref={setNodeRef}
      className={cn(
        "h-10 rounded-lg transition-colors overflow-hidden",
        isEmpty
          ? isOver ? "bg-primary/10 border border-dashed border-primary/50" : "border border-dashed border-border hover:bg-primary/5 hover:border-primary/30"
          : isOver ? "ring-2 ring-primary/40" : ""
      )}>
      {children}
    </div>
  );
}

function StepDiasAula() {
  const [viewDir, setViewDir] = useState<"horizontal" | "vertical">("horizontal");
  const [sessoes, setSessoes] = useState<AllocSessao[]>(MOCK_ALLOC_SESSOES);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const unallocated = sessoes.filter((s) => !s.allocated);
  const academic = unallocated.filter((_, i) => i % 2 === 0);
  const nonAcademic = unallocated.filter((_, i) => i % 2 !== 0);
  const allocatedCount = sessoes.filter((s) => s.allocated).length;
  const allocPct = sessoes.length > 0 ? Math.round((allocatedCount / sessoes.length) * 100) : 0;
  const activeSessao = activeId ? sessoes.find((s) => s.id === activeId) ?? null : null;

  const placeSession = (sessaoId: string, dayIdx: number, timeIdx: number) => {
    setSessoes((prev) => prev.map((s) =>
      s.id === sessaoId ? { ...s, allocated: true, dayIdx, timeIdx } : s
    ));
  };
  const removeAllocation = (sessaoId: string) => {
    setSessoes((prev) => prev.map((s) =>
      s.id === sessaoId ? { ...s, allocated: false, dayIdx: undefined, timeIdx: undefined } : s
    ));
  };
  const getSessionAt = (dayIdx: number, timeIdx: number) =>
    sessoes.find((s) => s.allocated && s.dayIdx === dayIdx && s.timeIdx === timeIdx);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setOverId(null);
    if (!event.over) return;
    const { dayIdx, timeIdx } = event.over.data.current as { dayIdx: number; timeIdx: number };
    const draggedId = String(event.active.id);
    // Reject if target is occupied by a *different* session
    const occupant = getSessionAt(dayIdx, timeIdx);
    if (occupant && occupant.id !== draggedId) return;
    setSessoes((prev) => prev.map((s) =>
      s.id === draggedId ? { ...s, allocated: true, dayIdx, timeIdx } : s
    ));
  };

  return (
    <TooltipProvider delayDuration={400}>
    <DndContext sensors={sensors} onDragStart={handleDragStart}
      onDragOver={(e) => setOverId(e.over ? String(e.over.id) : null)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => { setActiveId(null); setOverId(null); }}>
      <div className="h-full min-h-[600px] flex flex-col gap-4">
        {/* Controls */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Visualização:</span>
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {([{ key: "horizontal", label: "Horizontal" }, { key: "vertical", label: "Vertical" }] as const).map((v) => (
                <button key={v.key} onClick={() => setViewDir(v.key)}
                  className={cn("text-xs px-2.5 py-1 rounded-md transition-all font-medium",
                    viewDir === v.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}>{v.label}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full", allocPct === 100 ? "bg-success" : "bg-primary")}
                style={{ width: `${allocPct}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{allocatedCount}/{sessoes.length} alocadas</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-1">
          {/* Top panel – sessions list */}
          <div className="flex gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Acadêmicas</p>
              <div className="flex flex-wrap gap-1.5">
                {academic.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Todas alocadas</p>
                ) : academic.map((s) => (
                  <DraggableSessionCard key={s.id} sessao={s} academic />
                ))}
              </div>
            </div>
            {nonAcademic.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Não-acadêmicas</p>
                <div className="flex flex-wrap gap-1.5">
                  {nonAcademic.map((s) => (
                    <DraggableSessionCard key={s.id} sessao={s} academic={false} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom panel – grid */}
          <div className="overflow-auto">
            {viewDir === "horizontal" ? (
              /* Horizontal: days = columns, hours = rows */
              <div className="min-w-[480px]">
                <div className="grid gap-0.5 mb-1" style={{ gridTemplateColumns: `52px repeat(${WEEK_DAYS.length}, 1fr)` }}>
                  <div className="text-xs text-muted-foreground text-right pr-1.5 pt-1">Hora</div>
                  {WEEK_DAYS.map((d) => (
                    <div key={d} className="text-xs font-semibold text-center text-foreground py-1">{d}</div>
                  ))}
                </div>
                {TIME_ROWS.map((time, tIdx) => (
                  <div key={time} className="grid gap-0.5" style={{ gridTemplateColumns: `52px repeat(${WEEK_DAYS.length}, 1fr)`, gridAutoRows: "40px" }}>
                    <div className="h-10 flex items-center justify-end text-xs text-muted-foreground pr-1.5">{time}</div>
                    {WEEK_DAYS.map((_, dIdx) => {
                      const placed = getSessionAt(dIdx, tIdx);
                      const cellId = `cell-${dIdx}-${tIdx}`;
                      return (
                        <DroppableCell key={dIdx} dayIdx={dIdx} timeIdx={tIdx} isOver={overId === cellId} isEmpty={!placed}>
                          {placed && (
                            <DraggablePlacedSession
                              sessao={placed}
                              isBeingDragged={activeId === placed.id}
                              onRemove={() => removeAllocation(placed.id)}
                            />
                          )}
                        </DroppableCell>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              /* Vertical: hours = columns, days = rows */
              <div className="min-w-[640px]">
                <div className="grid gap-0.5 mb-1" style={{ gridTemplateColumns: `52px repeat(${TIME_ROWS.length}, 1fr)` }}>
                  <div className="text-xs text-muted-foreground text-right pr-1.5 pt-1">Dia</div>
                  {TIME_ROWS.map((time) => (
                    <div key={time} className="text-xs font-semibold text-center text-foreground py-1">{time}</div>
                  ))}
                </div>
                {WEEK_DAYS.map((day, dIdx) => (
                  <div key={day} className="grid gap-0.5" style={{ gridTemplateColumns: `52px repeat(${TIME_ROWS.length}, 1fr)`, gridAutoRows: "40px" }}>
                    <div className="h-10 flex items-center justify-end text-xs font-semibold text-foreground pr-1.5">{day}</div>
                    {TIME_ROWS.map((_, tIdx) => {
                      const placed = getSessionAt(dIdx, tIdx);
                      const cellId = `cell-${dIdx}-${tIdx}`;
                      return (
                        <DroppableCell key={tIdx} dayIdx={dIdx} timeIdx={tIdx} isOver={overId === cellId} isEmpty={!placed}>
                          {placed && (
                            <DraggablePlacedSession
                              sessao={placed}
                              isBeingDragged={activeId === placed.id}
                              onRemove={() => removeAllocation(placed.id)}
                            />
                          )}
                        </DroppableCell>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeSessao && (
          <div className="flex items-center gap-2 px-2.5 py-2.5 border border-primary rounded-xl bg-card shadow-lg opacity-90 w-48 cursor-grabbing">
            <GripVertical className="w-3 h-3 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{activeSessao.nome}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs font-mono text-muted-foreground">{activeSessao.slot}</span>
                {activeSessao.modulo && <span className="text-xs text-muted-foreground/60 truncate">{activeSessao.modulo}</span>}
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
    </TooltipProvider>
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
    nomeFantasiaI18n: [
      { langCode: "en", langLabel: "Inglês", value: "" },
      { langCode: "es", langLabel: "Espanhol", value: "" },
    ],
    anoInicio: String(new Date().getFullYear()), anoConclusion: "",
    local: "campus_ise", tipoPrograma: "custom",
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
      nomeFantasiaI18n: editTurma.nomeFantasiaI18n ?? [
        { langCode: "en", langLabel: "Inglês", value: "" },
        { langCode: "es", langLabel: "Espanhol", value: "" },
      ],
      anoInicio: editTurma.anoInicio || String(new Date().getFullYear()),
      anoConclusion: editTurma.anoConclusion || "",
      local: editTurma.local || "campus_ise", tipoPrograma: editTurma.tipoPrograma || "custom",
    } : emptyTurmaForm
  );
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof TurmaFormData, string>>>({});
  const [showClonar, setShowClonar] = useState(false);

  const validateStep = (s: number) => {
    const e: Partial<Record<keyof TurmaFormData, string>> = {};
    if (s === 0) {
      if (!form.nomeTurma.trim()) e.nomeTurma = "Nome da turma é obrigatório";
      if (!form.siglaTurma.trim()) e.siglaTurma = "Sigla é obrigatória";
      if (!form.programaId) e.programaId = "Selecione um programa";
      if (!form.anoInicio) e.anoInicio = "Ano de início é obrigatório";
      if (!form.anoConclusion) e.anoConclusion = "Ano de conclusão é obrigatório";
    }
    if (s === 1) {
      // all optional
    }
    // step 2 has no required fields
    // steps 3, 4, 5 have no required fields
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
    <ClipboardList className="w-4 h-4" />,
    <CalendarLucide className="w-4 h-4" />,
  ];

  return (
    <AppLayout
      pageTitle={isEdit ? "Editar Turma" : "Nova Turma"}
      pageSubtitle="Vinculada a um programa existente"
    >
      {showClonar && (
        <ClonarTemplateModal
          onClose={() => setShowClonar(false)}
          onConfirm={() => toast({ title: "Estrutura clonada", description: "Grade importada com sucesso." })}
        />
      )}
      <div className="px-6 py-8 animate-fade-in">

        {/* Page header */}
        <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-primary shrink-0" />
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {isEdit ? `Editar: ${editTurma?.nomeTurma}` : "Nova Turma"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isEdit ? "Atualize as informações da turma abaixo." : "Configure as informações da nova turma passo a passo."}
              </p>
            </div>
          </div>
          {!isEdit && (
            <button onClick={() => setShowClonar(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-muted transition-colors shrink-0">
              <Copy className="w-3.5 h-3.5" /> Clonar template
            </button>
          )}
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
              <span className="text-primary shrink-0">
                {stepIcons[step]}
              </span>
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
            {step === 4 && <StepDetalhes />}
            {step === 5 && <StepDiasAula />}
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
                {isEdit ? "Salvar Alterações" : "Solicitar aprovação"}
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
