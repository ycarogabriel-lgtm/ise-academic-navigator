import { AppLayout } from "@/components/layout/AppLayout";
import {
  Plus, BookOpen, User, AlertCircle, CheckCircle2,
  X, Clock, MapPin, Trash2, Edit2, Search,
  BookMarked, Link2, AlertTriangle, Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

const PROGRAMS_LIST = [
  "MBA Executivo – T24A",
  "Esp. Finanças – T23B",
  "Liderança Estratégica – T24B",
  "Marketing Digital – T24A",
  "Gestão de Pessoas – T24A",
  "Inovação e Startups – T24C",
];

const RA_OPTIONS = [
  "RA-0001 – Projetor duplo",
  "RA-0002 – Lousa digital",
  "RA-0003 – Kit café / água",
  "RA-0004 – Microfone sem fio",
  "RA-0005 – Flipchart",
  "RA-0006 – Sistema de videoconferência",
  "RA-0007 – Impressão de material",
  "RA-0008 – Cabine de tradução",
  "RA-0009 – Câmera de gravação",
  "RA-0010 – Sala com lousa dupla",
  "RA-0011 – Acesso a laboratório",
  "RA-0012 – Sistema de som completo",
];

const ROOM_CHECKLIST: Record<string, string[]> = {
  "Sala 201": ["Projetor", "Ar-condicionado", "Internet Wi-Fi", "Lousa"],
  "Sala 105": ["Projetor", "Lousa", "Internet Wi-Fi"],
  "Sala 302": ["Projetor", "Ar-condicionado", "Internet Wi-Fi"],
  "Auditório A": ["Projetor duplo", "Microfone", "Sistema de som", "Filmagem"],
  "Auditório B": ["Projetor duplo", "Microfone", "Sistema de som"],
  "Lab. Digital": ["Computadores", "Projetor", "Internet cabeada", "Câmeras"],
};

// RA Autocomplete Component
function RAAutocomplete({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [selected, setSelected] = useState<string[]>(value ? [value] : []);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = RA_OPTIONS.filter((r) => r.toLowerCase().includes(query.toLowerCase()) && !selected.includes(r));

  useEffect(() => {
    function handler(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (item: string) => {
    const next = selected.includes(item) ? selected.filter((s) => s !== item) : [...selected, item];
    setSelected(next);
    onChange(next.join(", "));
    setQuery("");
  };

  return (
    <div className="space-y-1.5" ref={ref}>
      <div className="w-full min-h-[38px] px-3 py-2 text-sm bg-background border border-input rounded-lg flex flex-wrap gap-1.5 items-center cursor-text"
        onClick={() => setOpen(true)}>
        {selected.map((s) => (
          <span key={s} className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 rounded-md px-2 py-0.5 text-xs font-medium">
            {s}
            <button type="button" onClick={(e) => { e.stopPropagation(); toggle(s); }}
              className="hover:text-destructive transition-colors"><X className="w-2.5 h-2.5" /></button>
          </span>
        ))}
        <input
          className="flex-1 min-w-24 outline-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground"
          placeholder={selected.length === 0 ? "Digite para buscar requisição..." : "Adicionar mais..."}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden mt-1 max-h-48 overflow-y-auto">
          {filtered.map((r) => (
            <button key={r} type="button"
              className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground flex items-center gap-2"
              onMouseDown={(e) => { e.preventDefault(); toggle(r); }}>
              <span className="w-3.5 h-3.5 rounded border border-input flex items-center justify-center shrink-0">
                {selected.includes(r) && <span className="w-2 h-2 rounded-sm bg-primary" />}
              </span>
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Types ─────────────────────────────────────────────── */
type SessionStatus = "confirmed" | "pending" | "conflict" | "finalized";
type MaterialType = "video" | "pdf" | "slide" | "quiz" | "link";

interface Material {
  id: number;
  title: string;
  type: MaterialType;
  description: string;
  objective: string;
  category: string;
  origin: "Moodle" | "manual";
  deliveryMoment: "pre" | "during" | "post";
  materialCategory: "digital" | "physical";
}

interface Logistics {
  meal: string;
  event: string;
  ra: string;
  special: string;
  notes: string;
}

interface Session {
  id: number;
  program: string;
  theme: string;
  discipline: string;
  date: string;
  time: string;
  duration: string;
  professor: string;
  room: string;
  status: SessionStatus;
  moodle: boolean;
  observations: string;
  materials: Material[];
  logistics: Logistics;
  prerequisites: number[];
}

/* ─── Seed data ──────────────────────────────────────────── */
const PROFESSORS = ["Dr. Carlos Faria", "Dra. Ana Souza", "Dr. Pedro Costa", "Dr. Lima", "Dra. Mendes", "A definir"];
const ROOMS = ["Sala 201", "Sala 105", "Sala 302", "Sala 102", "Auditório A", "Auditório B"];
const MOODLE_CATALOG: Omit<Material, "id">[] = [
  { title: "Frameworks de Estratégia", type: "slide", description: "Slides sobre Porter e Blue Ocean", objective: "Compreender modelos estratégicos", category: "Estratégia", origin: "Moodle", deliveryMoment: "pre", materialCategory: "digital" },
  { title: "Caso Harvard – Netflix", type: "pdf", description: "Estudo de caso de disrupção digital", objective: "Aplicar análise estratégica", category: "Cases", origin: "Moodle", deliveryMoment: "during", materialCategory: "digital" },
  { title: "Videoaula – Growth Hacking", type: "video", description: "Aula gravada sobre métricas de crescimento", objective: "Dominar técnicas de aquisição", category: "Marketing", origin: "Moodle", deliveryMoment: "pre", materialCategory: "digital" },
  { title: "Quiz – Valuation", type: "quiz", description: "Exercícios de modelagem financeira", objective: "Fixar conceitos de valor", category: "Finanças", origin: "Moodle", deliveryMoment: "during", materialCategory: "digital" },
  { title: "Leitura – Liderança Adaptativa", type: "link", description: "Artigo HBR sobre liderança", objective: "Expandir repertório teórico", category: "Liderança", origin: "Moodle", deliveryMoment: "post", materialCategory: "digital" },
];

const INITIAL_SESSIONS: Session[] = [
  {
    id: 1, program: "MBA Executivo – T24A", theme: "Estratégia Competitiva e Vantagem", discipline: "Estratégia",
    date: "2024-03-15", time: "08:00", duration: "4h", professor: "Dr. Carlos Faria", room: "Sala 201",
    status: "confirmed", moodle: true, observations: "",
    materials: [{ id: 1, title: "Frameworks de Estratégia", type: "slide", description: "Slides sobre Porter e Blue Ocean", objective: "Compreender modelos estratégicos", category: "Estratégia", origin: "Moodle", deliveryMoment: "pre", materialCategory: "digital" }],
    logistics: { meal: "Restaurante A – Almoço buffet", event: "", ra: "RA-0012", special: "", notes: "Projetor duplo necessário" },
    prerequisites: [],
  },
  {
    id: 2, program: "MBA Executivo – T24A", theme: "Análise de Cenários e Posicionamento", discipline: "Estratégia",
    date: "2024-03-22", time: "08:00", duration: "4h", professor: "Dr. Carlos Faria", room: "Sala 201",
    status: "confirmed", moodle: false, observations: "",
    materials: [],
    logistics: { meal: "", event: "", ra: "", special: "", notes: "" },
    prerequisites: [1],
  },
  {
    id: 3, program: "Liderança Estratégica – T24B", theme: "Modelos de Liderança Contemporânea", discipline: "Liderança",
    date: "2024-03-18", time: "14:00", duration: "3h", professor: "A definir", room: "Auditório A",
    status: "conflict", moodle: false, observations: "Docente não confirmado",
    materials: [],
    logistics: { meal: "", event: "", ra: "", special: "", notes: "" },
    prerequisites: [],
  },
  {
    id: 4, program: "Marketing Digital – T24A", theme: "Growth Hacking e Aquisição Digital", discipline: "Marketing",
    date: "2024-03-20", time: "09:00", duration: "4h", professor: "Dr. Pedro Costa", room: "Sala 302",
    status: "pending", moodle: true, observations: "",
    materials: [{ id: 2, title: "Videoaula – Growth Hacking", type: "video", description: "Aula gravada sobre métricas de crescimento", objective: "Dominar técnicas de aquisição", category: "Marketing", origin: "Moodle", deliveryMoment: "pre", materialCategory: "digital" }],
    logistics: { meal: "", event: "Workshop externo", ra: "", special: "", notes: "" },
    prerequisites: [],
  },
  {
    id: 5, program: "Esp. Finanças – T23B", theme: "Valuation e Modelagem Financeira", discipline: "Finanças",
    date: "2024-03-13", time: "14:00", duration: "4h", professor: "Dra. Ana Souza", room: "Sala 105",
    status: "confirmed", moodle: true, observations: "",
    materials: [{ id: 3, title: "Quiz – Valuation", type: "quiz", description: "Exercícios de modelagem financeira", objective: "Fixar conceitos de valor", category: "Finanças", origin: "Moodle", deliveryMoment: "during", materialCategory: "digital" }],
    logistics: { meal: "Restaurante B – Jantar", event: "", ra: "RA-0023", special: "Sala com lousa dupla", notes: "" },
    prerequisites: [],
  },
];

const statusConfig: Record<SessionStatus, { label: string; class: string }> = {
  confirmed: { label: "Confirmado", class: "bg-success/10 text-success border-success/20" },
  pending: { label: "Pendente", class: "bg-warning/10 text-warning border-warning/20" },
  conflict: { label: "Conflito", class: "bg-destructive/10 text-destructive border-destructive/20" },
  finalized: { label: "Finalizado", class: "bg-primary/10 text-primary border-primary/20" },
};

const materialTypeConfig: Record<MaterialType, { label: string; icon: string }> = {
  video: { label: "Vídeo", icon: "🎬" },
  pdf: { label: "PDF", icon: "📄" },
  slide: { label: "Slides", icon: "📊" },
  quiz: { label: "Quiz", icon: "❓" },
  link: { label: "Link", icon: "🔗" },
};

/* ─── Session Form Modal ─────────────────────────────────── */
function SessionModal({
  session, onSave, onClose, sessions,
}: {
  session: Session | null;
  onSave: (s: Session) => void;
  onClose: () => void;
  sessions: Session[];
}) {
  const blank: Session = {
    id: Date.now(), program: "", theme: "", discipline: "", date: "", time: "", duration: "4h",
    professor: "", room: "", status: "pending", moodle: false, observations: "",
    materials: [], logistics: { meal: "", event: "", ra: "", special: "", notes: "" },
    prerequisites: [],
  };
  const [form, setForm] = useState<Session>(session ?? blank);
  const [errors, setErrors] = useState<Partial<Record<keyof Session, string>>>({});

  const set = (k: keyof Session, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  // Conflict detection
  const hasConflict = sessions.some(
    (s) =>
      s.id !== form.id &&
      s.professor === form.professor &&
      form.professor !== "A definir" &&
      s.date === form.date &&
      s.time === form.time,
  );

  const validate = () => {
    const e: typeof errors = {};
    if (!form.program) e.program = "Obrigatório";
    if (!form.theme) e.theme = "Obrigatório";
    if (!form.professor) e.professor = "Obrigatório";
    if (!form.date) e.date = "Obrigatório";
    if (!form.time) e.time = "Obrigatório";
    if (!form.room) e.room = "Obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const status = hasConflict ? "conflict" : form.status === "conflict" ? "pending" : form.status;
    onSave({ ...form, status });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display font-bold text-foreground">{session ? "Editar Sessão" : "Nova Sessão"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-4">
          {hasConflict && (
            <div className="flex items-center gap-2 bg-warning/10 border border-warning/20 rounded-lg px-4 py-2.5 text-warning text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>⚠️ Docente já possui sessão neste horário. Pode salvar com conflito ou alterar os dados.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* RA Autocomplete — primeiro campo conforme solicitado */}
            <div className="md:col-span-2 relative">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Requisição Acadêmica (RA)</label>
              <RAAutocomplete value={form.logistics?.ra || ""} onChange={(v) => setForm((f) => ({ ...f, logistics: { ...f.logistics, ra: v } }))} />
              {form.room && ROOM_CHECKLIST[form.room] && (
                <div className="mt-2 bg-muted/40 rounded-lg p-3 border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">✅ Necessidades da sala — {form.room}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ROOM_CHECKLIST[form.room].map((item) => (
                      <span key={item} className="text-xs bg-success/10 text-success border border-success/20 rounded-md px-2 py-0.5">{item}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Programa (select) */}
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Programa *</label>
              <select className={cn("w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground", errors.program ? "border-destructive" : "border-input")}
                value={form.program} onChange={(e) => set("program", e.target.value)}>
                <option value="">Selecione o programa...</option>
                {PROGRAMS_LIST.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.program && <p className="text-xs text-destructive mt-1">{errors.program}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Título / Tema da Sessão *</label>
              <input className={cn("w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary", errors.theme ? "border-destructive" : "border-input")}
                value={form.theme} onChange={(e) => set("theme", e.target.value)} placeholder="Ex: Estratégia Competitiva" />
              {errors.theme && <p className="text-xs text-destructive mt-1">{errors.theme}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Disciplina</label>
              <input className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.discipline} onChange={(e) => set("discipline", e.target.value)} placeholder="Ex: Estratégia" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Docente *</label>
              <select className={cn("w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary", errors.professor ? "border-destructive" : "border-input")}
                value={form.professor} onChange={(e) => set("professor", e.target.value)}>
                <option value="">Selecione...</option>
                {PROFESSORS.map((p) => <option key={p}>{p}</option>)}
              </select>
              {errors.professor && <p className="text-xs text-destructive mt-1">{errors.professor}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Data *</label>
              <input type="date" className={cn("w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary", errors.date ? "border-destructive" : "border-input")}
                value={form.date} onChange={(e) => set("date", e.target.value)} />
              {errors.date && <p className="text-xs text-destructive mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Horário *</label>
              <input type="time" className={cn("w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary", errors.time ? "border-destructive" : "border-input")}
                value={form.time} onChange={(e) => set("time", e.target.value)} />
              {errors.time && <p className="text-xs text-destructive mt-1">{errors.time}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Duração</label>
              <select className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.duration} onChange={(e) => set("duration", e.target.value)}>
                {["1h", "2h", "3h", "4h", "6h", "8h"].map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Sala *</label>
              <select className={cn("w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary", errors.room ? "border-destructive" : "border-input")}
                value={form.room} onChange={(e) => set("room", e.target.value)}>
                <option value="">Selecione...</option>
                {ROOMS.map((r) => <option key={r}>{r}</option>)}
              </select>
              {errors.room && <p className="text-xs text-destructive mt-1">{errors.room}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
              <select className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.status} onChange={(e) => set("status", e.target.value as SessionStatus)}>
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="finalized">Finalizado</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Observações</label>
              <textarea className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={2} value={form.observations} onChange={(e) => set("observations", e.target.value)} placeholder="Informações adicionais..." />
            </div>

            {/* Pré-requisitos */}
            {sessions.filter((s) => s.id !== form.id && s.program === form.program).length > 0 && (
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Pré-requisitos (sessões que devem ocorrer antes desta)
                </label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto border border-input rounded-lg p-2 bg-background">
                  {sessions.filter((s) => s.id !== form.id && s.program === form.program).map((s) => (
                    <label key={s.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.prerequisites.includes(s.id)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...form.prerequisites, s.id]
                            : form.prerequisites.filter((pid) => pid !== s.id);
                          setForm((f) => ({ ...f, prerequisites: updated }));
                        }}
                        className="rounded border-input"
                      />
                      <span className="text-xs text-foreground">{s.theme}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{s.date}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 pb-5">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground">Cancelar</button>
          <button onClick={handleSave} className="text-sm px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary-light transition-colors flex items-center gap-2 font-medium">
            <Save className="w-4 h-4" />Salvar Sessão
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Delete confirm ─────────────────────────────────────── */
function DeleteModal({ title, onConfirm, onClose }: { title: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm border border-border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-sm">Remover Sessão</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Tem certeza que deseja remover esta sessão?</p>
          </div>
        </div>
        <p className="text-xs text-foreground bg-muted/50 rounded-lg px-3 py-2 font-medium">"{title}"</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground">Cancelar</button>
          <button onClick={onConfirm} className="text-sm px-4 py-2 rounded-lg bg-destructive text-white hover:bg-destructive/90 transition-colors font-medium">Confirmar</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Material Modal (Moodle) ────────────────────────────── */
function MaterialModal({
  existingMaterials, onAdd, onClose,
}: {
  existingMaterials: Material[];
  onAdd: (m: Material) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Omit<Material, "id"> | null>(null);
  const [desc, setDesc] = useState("");
  const [obj, setObj] = useState("");
  const [deliveryMoment, setDeliveryMoment] = useState<Material["deliveryMoment"]>("during");
  const [materialCategory, setMaterialCategory] = useState<Material["materialCategory"]>("digital");

  const filtered = MOODLE_CATALOG.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) &&
      !existingMaterials.find((em) => em.title === m.title),
  );

  const handleAdd = () => {
    if (!selected) return;
    onAdd({ ...selected, id: Date.now(), description: desc || selected.description, objective: obj || selected.objective, deliveryMoment, materialCategory });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg border border-border max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-primary" />
            <h2 className="font-display font-bold text-foreground text-sm">Vincular Material do Moodle</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Buscar material no Moodle..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {filtered.map((m) => (
              <button key={m.title} onClick={() => { setSelected(m); setDesc(m.description); setObj(m.objective); }}
                className={cn("w-full text-left px-3 py-2.5 rounded-lg border transition-all text-xs",
                  selected?.title === m.title ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30")}>
                <div className="flex items-center gap-2">
                  <span>{materialTypeConfig[m.type].icon}</span>
                  <div>
                    <p className="font-medium text-foreground">{m.title}</p>
                    <p className="text-muted-foreground">{materialTypeConfig[m.type].label} · {m.category}</p>
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhum material encontrado</p>}
          </div>

          {selected && (
            <div className="space-y-3 border-t border-border pt-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição</label>
                <textarea className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Objetivo Pedagógico</label>
                <input className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={obj} onChange={(e) => setObj(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Momento de entrega</label>
                  <select
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    value={deliveryMoment} onChange={(e) => setDeliveryMoment(e.target.value as Material["deliveryMoment"])}
                  >
                    <option value="pre">Pré-sessão</option>
                    <option value="during">Durante a sessão</option>
                    <option value="post">Pós-sessão</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Formato</label>
                  <select
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    value={materialCategory} onChange={(e) => setMaterialCategory(e.target.value as Material["materialCategory"])}
                  >
                    <option value="digital">Digital / Moodle</option>
                    <option value="physical">Material físico</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 pb-5">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground">Cancelar</button>
          <button onClick={handleAdd} disabled={!selected} className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary-light transition-colors font-medium disabled:opacity-50 flex items-center gap-2">
            <Link2 className="w-3.5 h-3.5" />Vincular Material
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Session Detail Drawer ──────────────────────────────── */
function SessionDrawer({
  session, onClose, onSaveMaterial, onRemoveMaterial, onSaveLogistics, onEdit,
}: {
  session: Session;
  onClose: () => void;
  onSaveMaterial: (sessionId: number, m: Material) => void;
  onRemoveMaterial: (sessionId: number, materialId: number) => void;
  onSaveLogistics: (sessionId: number, l: Logistics) => void;
  onEdit: (s: Session) => void;
}) {
  const [tab, setTab] = useState<"info" | "materials" | "logistics">("info");
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingLogistics, setEditingLogistics] = useState(false);
  const [logistics, setLogistics] = useState<Logistics>(session.logistics);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const s = statusConfig[session.status];

  const setL = (k: keyof Logistics, v: string) => setLogistics((l) => ({ ...l, [k]: v }));

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full z-50 w-full max-w-xl bg-card border-l border-border shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-foreground text-sm leading-tight">{session.theme}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{session.program}</p>
              <span className={cn("inline-flex mt-1 text-xs px-2 py-0.5 rounded-full border font-medium", s.class)}>{s.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            <button onClick={() => onEdit(session)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><Edit2 className="w-4 h-4" /></button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          {(["info", "materials", "logistics"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("text-xs py-2.5 px-3 font-medium border-b-2 transition-colors -mb-px",
                tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {t === "info" ? "Informações" : t === "materials" ? `Materiais (${session.materials.length})` : "Logística"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "info" && (
            <div className="space-y-4">
              {session.status === "conflict" && (
                <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2.5 text-destructive text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Esta sessão possui conflito de docente ou horário. Revise antes de confirmar.</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Docente", value: session.professor, icon: <User className="w-3.5 h-3.5" /> },
                  { label: "Sala", value: session.room, icon: <MapPin className="w-3.5 h-3.5" /> },
                  { label: "Data", value: new Date(session.date + "T00:00:00").toLocaleDateString("pt-BR"), icon: <Clock className="w-3.5 h-3.5" /> },
                  { label: "Horário / Duração", value: `${session.time} · ${session.duration}`, icon: <Clock className="w-3.5 h-3.5" /> },
                  { label: "Disciplina", value: session.discipline || "—", icon: <BookOpen className="w-3.5 h-3.5" /> },
                  { label: "Moodle", value: session.moodle ? "Vinculado" : "Não vinculado", icon: <BookMarked className="w-3.5 h-3.5" /> },
                ].map((item) => (
                  <div key={item.label} className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">{item.icon}<span className="text-xs">{item.label}</span></div>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
              {session.observations && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Observações</p>
                  <p className="text-sm text-foreground">{session.observations}</p>
                </div>
              )}
            </div>
          )}

          {tab === "materials" && (
            <div className="space-y-3">
              <button onClick={() => setShowMaterialModal(true)}
                className="w-full border-2 border-dashed border-primary/30 rounded-xl py-4 text-xs text-primary font-medium hover:border-primary/60 hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                <Plus className="w-3.5 h-3.5" />Adicionar material do Moodle
              </button>

              {session.materials.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BookMarked className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Nenhum material vinculado ainda</p>
                </div>
              )}

              {session.materials.map((m) => (
                <div key={m.id} className="border border-border rounded-xl p-4 space-y-2 hover:border-primary/30 transition-colors">
                  {editingMaterial?.id === m.id ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span>{materialTypeConfig[m.type].icon}</span>
                        <p className="text-xs font-semibold text-foreground">{m.title}</p>
                      </div>
                      <textarea className="w-full border border-input rounded-lg px-3 py-1.5 text-xs bg-background focus:outline-none resize-none"
                        rows={2} value={editingMaterial.description}
                        onChange={(e) => setEditingMaterial({ ...editingMaterial, description: e.target.value })}
                        placeholder="Descrição" />
                      <input className="w-full border border-input rounded-lg px-3 py-1.5 text-xs bg-background focus:outline-none"
                        value={editingMaterial.objective}
                        onChange={(e) => setEditingMaterial({ ...editingMaterial, objective: e.target.value })}
                        placeholder="Objetivo pedagógico" />
                      <div className="flex gap-2">
                        <button onClick={() => { onSaveMaterial(session.id, editingMaterial); setEditingMaterial(null); }}
                          className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary-light transition-colors font-medium">Salvar</button>
                        <button onClick={() => setEditingMaterial(null)}
                          className="text-xs px-3 py-1.5 border border-border rounded-md hover:bg-muted transition-colors text-muted-foreground">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span>{materialTypeConfig[m.type].icon}</span>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{m.title}</p>
                            <span className="text-xs text-muted-foreground">{materialTypeConfig[m.type].label} · {m.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => setEditingMaterial(m)}
                            className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"><Edit2 className="w-3 h-3" /></button>
                          <button onClick={() => onRemoveMaterial(session.id, m.id)}
                            className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                      {m.description && <p className="text-xs text-muted-foreground">{m.description}</p>}
                      {m.objective && <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Objetivo:</span> {m.objective}</p>}
                      <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/5 border border-primary/20 rounded-md px-2 py-0.5">
                        <Link2 className="w-2.5 h-2.5" />Moodle
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === "logistics" && (
            <div className="space-y-4">
              {editingLogistics ? (
                <div className="space-y-3">
                  {([
                    { key: "meal", label: "Local de Refeição" },
                    { key: "event", label: "Evento Associado" },
                    { key: "ra", label: "Requisição Acadêmica (RA)" },
                    { key: "special", label: "Necessidades Especiais" },
                  ] as { key: keyof Logistics; label: string }[]).map(({ key, label }) => (
                    <div key={key}>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
                      <input className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        value={logistics[key]} onChange={(e) => setL(key, e.target.value)} />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Observações Operacionais</label>
                    <textarea className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={3} value={logistics.notes} onChange={(e) => setL("notes", e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { onSaveLogistics(session.id, logistics); setEditingLogistics(false); }}
                      className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-light transition-colors font-medium flex items-center gap-2">
                      <Save className="w-3.5 h-3.5" />Salvar Logística
                    </button>
                    <button onClick={() => setEditingLogistics(false)}
                      className="text-sm px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button onClick={() => setEditingLogistics(true)}
                    className="w-full text-right text-xs text-primary font-medium hover:underline flex items-center justify-end gap-1">
                    <Edit2 className="w-3 h-3" />Editar logística
                  </button>
                  {([
                    { key: "meal", label: "Local de Refeição", icon: "🍽️" },
                    { key: "event", label: "Evento Associado", icon: "📅" },
                    { key: "ra", label: "Requisição Acadêmica", icon: "📋" },
                    { key: "special", label: "Necessidades Especiais", icon: "⭐" },
                    { key: "notes", label: "Observações Operacionais", icon: "📝" },
                  ] as { key: keyof Logistics; label: string; icon: string }[]).map(({ key, label, icon }) => (
                    <div key={key} className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">{icon} {label}</p>
                      <p className="text-sm text-foreground">{session.logistics[key] || <span className="italic text-muted-foreground">Não informado</span>}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showMaterialModal && (
        <MaterialModal
          existingMaterials={session.materials}
          onAdd={(m) => { onSaveMaterial(session.id, m); setShowMaterialModal(false); }}
          onClose={() => setShowMaterialModal(false)}
        />
      )}
    </>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [filter, setFilter] = useState<"all" | SessionStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null | "new">(null);
  const [deletingSession, setDeletingSession] = useState<Session | null>(null);

  const filtered = sessions.filter((s) => {
    const matchFilter = filter === "all" || s.status === filter;
    const matchSearch = s.theme.toLowerCase().includes(search.toLowerCase()) ||
      s.program.toLowerCase().includes(search.toLowerCase()) ||
      s.professor.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    all: sessions.length,
    confirmed: sessions.filter((s) => s.status === "confirmed").length,
    pending: sessions.filter((s) => s.status === "pending").length,
    conflict: sessions.filter((s) => s.status === "conflict").length,
    finalized: sessions.filter((s) => s.status === "finalized").length,
  };

  const handleSave = (s: Session) => {
    setSessions((prev) => prev.find((p) => p.id === s.id) ? prev.map((p) => p.id === s.id ? s : p) : [...prev, s]);
    setEditingSession(null);
    if (selectedSession?.id === s.id) setSelectedSession(s);
  };

  const handleDelete = (id: number) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (selectedSession?.id === id) setSelectedSession(null);
    setDeletingSession(null);
  };

  const handleSaveMaterial = (sessionId: number, m: Material) => {
    setSessions((prev) => prev.map((s) => s.id === sessionId
      ? { ...s, materials: s.materials.find((em) => em.id === m.id) ? s.materials.map((em) => em.id === m.id ? m : em) : [...s.materials, m], moodle: true }
      : s));
    setSelectedSession((prev) => prev?.id === sessionId
      ? { ...prev, materials: prev.materials.find((em) => em.id === m.id) ? prev.materials.map((em) => em.id === m.id ? m : em) : [...prev.materials, m], moodle: true }
      : prev);
  };

  const handleRemoveMaterial = (sessionId: number, materialId: number) => {
    setSessions((prev) => prev.map((s) => s.id === sessionId
      ? { ...s, materials: s.materials.filter((m) => m.id !== materialId), moodle: s.materials.filter((m) => m.id !== materialId).length > 0 }
      : s));
    setSelectedSession((prev) => prev?.id === sessionId
      ? { ...prev, materials: prev.materials.filter((m) => m.id !== materialId) }
      : prev);
  };

  const handleSaveLogistics = (sessionId: number, l: Logistics) => {
    setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, logistics: l } : s));
    setSelectedSession((prev) => prev?.id === sessionId ? { ...prev, logistics: l } : prev);
  };

  const openEdit = (s: Session) => { setEditingSession(s); setSelectedSession(null); };

  return (
    <AppLayout pageTitle="Sessões" pageSubtitle="Grade pedagógica e detalhamento de sessões">
      <div className="p-6 space-y-5 animate-fade-in">
        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {([
              { key: "all", label: "Todas", count: counts.all },
              { key: "confirmed", label: "Confirmadas", count: counts.confirmed },
              { key: "pending", label: "Pendentes", count: counts.pending },
              { key: "conflict", label: "Conflitos", count: counts.conflict },
              { key: "finalized", label: "Finalizadas", count: counts.finalized },
            ] as const).map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={cn("text-xs px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5",
                  filter === f.key ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground")}>
                {f.label}
                <span className={cn("rounded-full px-1.5 py-0.5 text-xs",
                  filter === f.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input className="pl-8 pr-3 py-1.5 text-xs border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary w-52"
                placeholder="Buscar sessão..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button onClick={() => setEditingSession("new")}
              className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 hover:bg-primary-light transition-colors">
              <Plus className="w-3.5 h-3.5" />Nova Sessão
            </button>
          </div>
        </div>

        {/* Stats */}
        {counts.conflict > 0 && (
          <div className="flex items-center gap-2 bg-destructive/8 border border-destructive/20 rounded-xl px-4 py-2.5 text-destructive text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{counts.conflict} sessão{counts.conflict > 1 ? "s" : ""} com conflito</span>
            <span className="text-destructive/70">· Revise os docentes e horários</span>
          </div>
        )}

        {/* Table */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Sessão / Programa</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Docente</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Data / Hora</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Sala</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Moodle</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="px-3 py-3 text-xs font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground text-xs">Nenhuma sessão encontrada</td></tr>
              )}
              {filtered.map((session) => {
                const s = statusConfig[session.status];
                return (
                  <tr key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                          session.status === "conflict" ? "bg-destructive/10" : "bg-primary/10")}>
                          <BookOpen className={cn("w-3.5 h-3.5", session.status === "conflict" ? "text-destructive" : "text-primary")} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground leading-tight">{session.theme}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{session.program}</p>
                          {session.discipline && <p className="text-xs text-muted-foreground/60">{session.discipline}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className={cn("text-xs", session.professor === "A definir" ? "text-muted-foreground italic" : "text-foreground")}>
                          {session.professor}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <p className="text-xs text-foreground">{new Date(session.date + "T00:00:00").toLocaleDateString("pt-BR")}</p>
                      <p className="text-xs text-muted-foreground">{session.time} · {session.duration}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground hidden lg:table-cell">{session.room}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        {session.moodle ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-muted-foreground/40" />
                        )}
                        {session.materials.length > 0 && (
                          <span className="text-xs text-muted-foreground">{session.materials.length}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", s.class)}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => openEdit(session)}
                          className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeletingSession(session)}
                          className="p-1 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {editingSession !== null && (
        <SessionModal
          session={editingSession === "new" ? null : editingSession as Session}
          sessions={sessions}
          onSave={handleSave}
          onClose={() => setEditingSession(null)}
        />
      )}

      {deletingSession && (
        <DeleteModal
          title={deletingSession.theme}
          onConfirm={() => handleDelete(deletingSession.id)}
          onClose={() => setDeletingSession(null)}
        />
      )}

      {selectedSession && !editingSession && (
        <SessionDrawer
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onSaveMaterial={handleSaveMaterial}
          onRemoveMaterial={handleRemoveMaterial}
          onSaveLogistics={handleSaveLogistics}
          onEdit={openEdit}
        />
      )}
    </AppLayout>
  );
}
