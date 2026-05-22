import { AppLayout } from "@/components/layout/AppLayout";
import { Plus, Search, MoreHorizontal, Building2, X, Pencil, EyeOff, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type SpaceStatus = "free" | "occupied" | "reserved" | "inactive";

interface Space {
  id: number;
  name: string;
  type: string;
  capacity: number;
  location: string;
  floor: string;
  resources: string;
  status: SpaceStatus;
}

const initialSpaces: Space[] = [
  { id: 1, name: "Sala 101", type: "Sala de Aula", capacity: 30, location: "Bloco A", floor: "1º Andar", resources: "Projetor, Quadro", status: "free" },
  { id: 2, name: "Sala 102", type: "Sala de Aula", capacity: 30, location: "Bloco A", floor: "1º Andar", resources: "Projetor, Quadro", status: "occupied" },
  { id: 3, name: "Sala 105", type: "Sala VIP", capacity: 20, location: "Bloco A", floor: "1º Andar", resources: "TV 65\", Frigobar", status: "free" },
  { id: 4, name: "Sala 201", type: "Sala de Aula", capacity: 40, location: "Bloco B", floor: "2º Andar", resources: "Projetor Duplo, Quadro", status: "occupied" },
  { id: 5, name: "Sala 202", type: "Sala de Aula", capacity: 40, location: "Bloco B", floor: "2º Andar", resources: "Projetor, Quadro", status: "free" },
  { id: 6, name: "Sala 302", type: "Sala de Aula", capacity: 35, location: "Bloco C", floor: "3º Andar", resources: "Projetor, Ar-cond", status: "reserved" },
  { id: 7, name: "Auditório A", type: "Auditório", capacity: 120, location: "Térreo", floor: "Térreo", resources: "Sistema de som, Palco", status: "reserved" },
  { id: 8, name: "Auditório B", type: "Auditório", capacity: 80, location: "Térreo", floor: "Térreo", resources: "Sistema de som", status: "free" },
  { id: 9, name: "Lab. Digital", type: "Laboratório", capacity: 25, location: "Bloco B", floor: "2º Andar", resources: "Computadores, Projetor", status: "occupied" },
];

const statusConfig: Record<SpaceStatus, { label: string; class: string }> = {
  free: { label: "Disponível", class: "bg-success/10 text-success border-success/20" },
  occupied: { label: "Ocupado", class: "bg-destructive/10 text-destructive border-destructive/20" },
  reserved: { label: "Reservado", class: "bg-primary/10 text-primary border-primary/20" },
  inactive: { label: "Inativo", class: "bg-muted text-muted-foreground border-border" },
};

const SPACE_TYPES = ["Sala de Aula", "Sala VIP", "Auditório", "Laboratório", "Sala de Reunião", "Espaço Externo"];

const emptyForm = { name: "", type: "Sala de Aula", capacity: 0, location: "", floor: "", resources: "", status: "free" as SpaceStatus };
interface FormData { name: string; type: string; capacity: number; location: string; floor: string; resources: string; status: SpaceStatus; }

function SpaceModal({ mode, space, onSave, onClose }: { mode: "create" | "edit"; space?: Space; onSave: (d: FormData) => void; onClose: () => void; }) {
  const [form, setForm] = useState<FormData>(
    mode === "edit" && space
      ? { name: space.name, type: space.type, capacity: space.capacity, location: space.location, floor: space.floor, resources: space.resources, status: space.status }
      : emptyForm
  );
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nome é obrigatório";
    if (!form.type) e.type = "Tipo é obrigatório";
    if (!form.capacity || form.capacity <= 0) e.capacity = "Capacidade deve ser maior que 0";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-lg text-foreground">{mode === "create" ? "Novo Espaço" : "Editar Espaço"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Nome do espaço *</label>
            <input className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30", errors.name ? "border-destructive" : "border-input")}
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Sala 301" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Tipo de espaço *</label>
              <select className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30", errors.type ? "border-destructive" : "border-input")}
                value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {SPACE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Capacidade *</label>
              <input type="number" min={1}
                className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30", errors.capacity ? "border-destructive" : "border-input")}
                value={form.capacity || ""} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} placeholder="0" />
              {errors.capacity && <p className="text-xs text-destructive mt-1">{errors.capacity}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Localização</label>
              <input className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Bloco A" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Andar</label>
              <input className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} placeholder="1º Andar" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Recursos disponíveis</label>
            <input className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.resources} onChange={(e) => setForm({ ...form, resources: e.target.value })} placeholder="Projetor, Quadro, Ar-condicionado..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Status</label>
            <div className="flex gap-2">
              {([
                { val: "free", label: "Disponível", cls: "bg-success/10 text-success border-success/30" },
                { val: "inactive", label: "Inativo", cls: "bg-muted text-muted-foreground border-border" },
              ] as const).map((s) => (
                <button key={s.val} type="button" onClick={() => setForm({ ...form, status: s.val })}
                  className={cn("flex-1 py-2 text-sm rounded-lg border font-medium transition-colors",
                    form.status === s.val ? s.cls : "bg-background text-muted-foreground border-input hover:border-primary/40")}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-2 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">Cancelar</button>
          <button onClick={handleSave} className="flex-1 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            {mode === "create" ? "Cadastrar Espaço" : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>(initialSpaces);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCap, setFilterCap] = useState("all");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [editSpace, setEditSpace] = useState<Space | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const types = ["all", ...Array.from(new Set(spaces.map((s) => s.type)))];

  const filtered = spaces.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.type.toLowerCase().includes(search.toLowerCase()) || s.location.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || s.type === filterType;
    const matchCap = filterCap === "all" || (filterCap === "small" && s.capacity <= 30) || (filterCap === "medium" && s.capacity > 30 && s.capacity <= 60) || (filterCap === "large" && s.capacity > 60);
    return matchSearch && matchType && matchCap;
  });

  const handleCreate = (data: FormData) => {
    setSpaces([...spaces, { ...data, id: Date.now() }]);
    setShowCreate(false);
  };

  const handleEdit = (data: FormData) => {
    setSpaces(spaces.map((s) => s.id === editSpace!.id ? { ...s, ...data } : s));
    setEditSpace(null);
  };

  const handleToggle = (space: Space) => {
    setSpaces(spaces.map((s) => s.id === space.id ? { ...s, status: s.status === "inactive" ? "free" : "inactive" } : s));
    setOpenMenu(null);
  };

  return (
    <AppLayout pageTitle="Espaços" pageSubtitle="Salas, auditórios e laboratórios disponíveis">
      <div className="p-6 space-y-5 animate-fade-in" onClick={() => setOpenMenu(null)}>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total", value: spaces.length, class: "bg-primary/5 text-primary border-primary/15" },
            { label: "Disponíveis", value: spaces.filter((s) => s.status === "free").length, class: "bg-success/5 text-success border-success/15" },
            { label: "Ocupados", value: spaces.filter((s) => s.status === "occupied").length, class: "bg-destructive/5 text-destructive border-destructive/15" },
            { label: "Reservados", value: spaces.filter((s) => s.status === "reserved").length, class: "bg-warning/5 text-warning border-warning/15" },
          ].map((stat) => (
            <div key={stat.label} className={cn("rounded-xl border px-4 py-3 text-center", stat.class)}>
              <p className="text-xs font-semibold">{stat.label}</p>
              <p className="text-2xl font-display font-bold mt-0.5">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input type="text" placeholder="Buscar espaços..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-52" />
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground">
              <option value="all">Todos os tipos</option>
              {types.filter((t) => t !== "all").map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterCap} onChange={(e) => setFilterCap(e.target.value)}
              className="px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground">
              <option value="all">Capacidade: Todos</option>
              <option value="small">Até 30 pessoas</option>
              <option value="medium">31–60 pessoas</option>
              <option value="large">+ 60 pessoas</option>
            </select>
          </div>
          <button onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Novo Espaço
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((space) => {
            const s = statusConfig[space.status];
            return (
              <div key={space.id} className={cn("bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-card transition-all group", space.status === "inactive" && "opacity-60")}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", s.class)}>{s.label}</span>
                    <div className="relative">
                      <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === space.id ? null : space.id); }}
                        className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                      {openMenu === space.id && (
                        <div onClick={(e) => e.stopPropagation()} className="absolute right-0 top-6 z-20 bg-card border border-border rounded-xl shadow-xl w-40 py-1 animate-fade-in">
                          <button onClick={() => { setEditSpace(space); setOpenMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors">
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" /> Editar espaço
                          </button>
                          <button onClick={() => handleToggle(space)} className={cn("w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors hover:bg-muted", space.status === "inactive" ? "text-success" : "text-destructive")}>
                            {space.status === "inactive" ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            {space.status === "inactive" ? "Reativar" : "Desativar"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <h3 className="font-display font-bold text-foreground text-base group-hover:text-primary transition-colors">{space.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{space.type} · {space.floor}</p>
                {space.resources && <p className="text-xs text-muted-foreground mt-1 truncate">{space.resources}</p>}
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{space.location}</span>
                  <span className="text-sm font-semibold text-foreground">{space.capacity} pessoas</span>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum espaço encontrado.</p>
          </div>
        )}
      </div>
      {showCreate && <SpaceModal mode="create" onSave={handleCreate} onClose={() => setShowCreate(false)} />}
      {editSpace && <SpaceModal mode="edit" space={editSpace} onSave={handleEdit} onClose={() => setEditSpace(null)} />}
    </AppLayout>
  );
}
