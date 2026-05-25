import { AppLayout } from "@/components/layout/AppLayout";
import { useNavigate, useLocation } from "react-router-dom";
import {
  GraduationCap, X, Info, BookOpen, Building2, Hash, Users, UserPlus,
  AlertCircle, ChevronDown, Save, Send, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
type ProgramType = "custom" | "aberto" | "imersao" | "colaboradores" | "educacao_executiva" | "emba" | "eventos" | "internacionais" | "llm" | "mba_full_time" | "easy_humanidades";
interface Person { id: string; name: string; role: string }
interface ProgramFormData {
  name: string; sigla: string; tipo: ProgramType; instituto: string; responsavel: string;
  cliente: string; coordenador: string; responsavelPlanejamento: string; extraResponsaveis: string[];
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

const INSTITUTOS = ["ISE Business School", "FGV", "Insper", "USP", "FEA-USP", "PUC-SP", "ESPM", "Outro"];
const TIPO_PROGRAMA: { value: ProgramType; label: string; desc: string }[] = [
  { value: "custom", label: "Custom", desc: "Programa fechado para uma empresa ou organização específica" },
  { value: "aberto", label: "Aberto", desc: "Inscrições abertas ao público" },
  { value: "imersao", label: "Imersão", desc: "Formato intensivo com dedicação exclusiva" },
  { value: "emba", label: "EMBA", desc: "Executive MBA — ano de conclusão para nome da turma" },
  { value: "mba_full_time", label: "MBA Full Time", desc: "MBA de dedicação integral" },
  { value: "educacao_executiva", label: "Educação Executiva", desc: "Programas para executivos e lideranças" },
  { value: "colaboradores", label: "Colaboradores", desc: "Treinamento interno para colaboradores" },
  { value: "eventos", label: "Eventos", desc: "Eventos acadêmicos e institucionais" },
  { value: "internacionais", label: "Internacionais", desc: "Programas com parceiros internacionais" },
  { value: "llm", label: "LLM", desc: "Master of Laws — pós-graduação em Direito" },
  { value: "easy_humanidades", label: "Easy Humanidades", desc: "Programa de humanidades em formato flexível" },
];

const emptyForm: ProgramFormData = {
  name: "", sigla: "", tipo: "custom", instituto: "", responsavel: "",
  cliente: "", coordenador: "", responsavelPlanejamento: "", extraResponsaveis: [],
};

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

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function NewProgramPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editProgram = (location.state as { program?: any })?.program ?? null;
  const isEdit = !!editProgram;

  const [form, setForm] = useState<ProgramFormData>(
    isEdit ? {
      name: editProgram.name, sigla: editProgram.sigla, tipo: editProgram.tipo,
      instituto: editProgram.instituto, responsavel: editProgram.responsavel,
      cliente: editProgram.cliente || "", coordenador: editProgram.coordenador || "",
      responsavelPlanejamento: editProgram.responsavelPlanejamento || "",
      extraResponsaveis: editProgram.extraResponsaveis || [],
    } : emptyForm
  );
  const [errors, setErrors] = useState<Partial<Record<keyof ProgramFormData, string>>>({});
  const [showOptional, setShowOptional] = useState(isEdit);

  const validate = () => {
    const e: Partial<Record<keyof ProgramFormData, string>> = {};
    if (!form.name.trim()) e.name = "Nome do programa é obrigatório";
    if (!form.sigla.trim()) e.sigla = "Sigla é obrigatória";
    if (!form.responsavel.trim()) e.responsavel = "Diretor(a) do programa é obrigatório";
    return e;
  };

  const handleAction = (action: "draft" | "submit") => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const title = action === "submit"
      ? (isEdit ? "✅ Programa atualizado." : "✅ Aprovação solicitada!")
      : "✅ Programa salvo como Rascunho.";
    const description = action === "submit" && !isEdit
      ? `"${form.name}" está aguardando aprovação do Planejamento.`
      : `"${form.name}" foi salvo com sucesso.`;
    toast({ title, description });
    navigate("/programs");
  };

  return (
    <AppLayout
      pageTitle={isEdit ? `Editar Programa` : "Novo Programa"}
      pageSubtitle={isEdit ? editProgram.name : "Criado como Rascunho — sem impacto em agendas oficiais"}
    >
      <div className="max-w-2xl mx-auto px-6 py-8 animate-fade-in">

        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <GraduationCap className="w-6 h-6 text-primary shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {isEdit ? `Editar: ${editProgram.name}` : "Novo Programa"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isEdit
                ? "Atualize as informações do programa abaixo."
                : "Preencha as informações para criar um novo programa acadêmico."}
            </p>
          </div>
        </div>

        {/* Info banner (create only) */}
        {!isEdit && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3 mb-6">
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

        {/* Form card */}
        <div className="bg-card border border-border rounded-2xl shadow-sm">

          {/* Mandatory fields */}
          <div className="px-6 py-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <p className="text-sm font-semibold text-foreground">Informações do programa</p>
            </div>

            <div>
              <FieldLabel required tooltip="Nome fantasia do programa como será reconhecido institucionalmente">Nome do programa</FieldLabel>
              <input
                className={cn("w-full px-3 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30",
                  errors.name ? "border-destructive ring-destructive/20" : "border-input"
                )}
                value={form.name}
                onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: undefined }); }}
                placeholder="Ex: MBA Executivo em Gestão de Negócios"
              />
              {errors.name && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required tooltip="Sigla usada na geração do código oficial">Sigla</FieldLabel>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    className={cn("w-full pl-8 pr-3 py-2.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase font-mono",
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
                  className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
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

            {/* Preview nome gerado */}
            {form.sigla && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Código gerado automaticamente</p>
                  <p className="text-sm font-mono text-primary mt-0.5">
                    {form.sigla}-T{new Date().getFullYear().toString().slice(2)}A
                  </p>
                </div>
              </div>
            )}


            <div>
              <FieldLabel required tooltip="Diretor(a) responsável pela condução acadêmica do programa">Diretor(a) do programa</FieldLabel>
              <PeopleAutocomplete
                value={form.responsavel}
                onChange={(v) => { setForm({ ...form, responsavel: v }); setErrors({ ...errors, responsavel: undefined }); }}
                placeholder="Buscar por nome..."
              />
              {errors.responsavel && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.responsavel}</p>}
            </div>
          </div>

          {/* Optional fields */}
          <div className="border-t border-border">
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="w-full flex items-center justify-between py-4 px-6 hover:bg-muted/40 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Informações adicionais</span>
                <span className="text-xs text-muted-foreground">(opcional)</span>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showOptional && "rotate-180")} />
            </button>

            {showOptional && (
              <div className="px-6 pb-6 space-y-4 border-t border-border/50">
                <div className="pt-4">
                  <FieldLabel optional>Instituto</FieldLabel>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <select
                      className="w-full pl-8 pr-3 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                      value={form.instituto}
                      onChange={(e) => setForm({ ...form, instituto: e.target.value })}
                    >
                      <option value="">Selecione o instituto...</option>
                      {INSTITUTOS.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <FieldLabel optional>Diretor(a) acadêmico (DA)</FieldLabel>
                  <PeopleAutocomplete
                    value={form.coordenador}
                    onChange={(v) => setForm({ ...form, coordenador: v })}
                    placeholder="Responsável pela grade acadêmica..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">Muitas vezes não definido na criação do programa.</p>
                </div>
                <div>
                  <FieldLabel optional>Cliente</FieldLabel>
                  <input
                    className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.cliente}
                    onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                    placeholder="Ex: Empresa XYZ, Público Geral..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
          <button
            onClick={() => navigate("/programs")}
            className="px-4 py-2.5 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            Descartar
          </button>
          <div className="flex gap-3">
            <button onClick={() => handleAction("draft")}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-primary/40 text-primary rounded-lg hover:bg-primary/5 transition-colors">
              <Save className="w-3.5 h-3.5" />
              Salvar como Rascunho
            </button>
            <button onClick={() => handleAction("submit")}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Send className="w-3.5 h-3.5" />
              {isEdit ? "Salvar Alterações" : "Solicitar Aprovação"}
            </button>
          </div>
        </div>

        {!isEdit && (
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <Info className="w-3 h-3 shrink-0" />
            <strong>Solicitar Aprovação</strong> notifica o Planejamento e muda o status para "Aguardando Aprovação"
          </p>
        )}
      </div>
    </AppLayout>
  );
}
