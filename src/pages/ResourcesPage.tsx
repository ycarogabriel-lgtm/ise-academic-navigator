import { AppLayout } from "@/components/layout/AppLayout";
import { Plus, Search, MoreHorizontal, Package, X, Pencil, EyeOff, Eye, Infinity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type ResourceType = "finite" | "infinite";
type ResourceStatus = "active" | "inactive";

interface Resource {
  id: number;
  name: string;
  type: ResourceType;
  quantity: number | null;
  category: string;
  description: string;
  status: ResourceStatus;
}

const initialResources: Resource[] = [
  { id: 1, name: "Notebook Dell", type: "finite", quantity: 15, category: "Equipamento", description: "Notebooks para uso em sala", status: "active" },
  { id: 2, name: "Projetor Epson", type: "finite", quantity: 8, category: "Equipamento", description: "Projetores Full HD", status: "active" },
  { id: 3, name: "Kit Case (Harvard)", type: "finite", quantity: 40, category: "Material Físico", description: "Cases impressos para MBA", status: "active" },
  { id: 4, name: "Apostila Finanças", type: "finite", quantity: 60, category: "Material Físico", description: "Apostilas para Esp. Finanças", status: "active" },
  { id: 5, name: "Vídeo Aula – Estratégia", type: "infinite", quantity: null, category: "Material Digital", description: "Biblioteca de vídeos de estratégia", status: "active" },
  { id: 6, name: "Slides MBA 2024", type: "infinite", quantity: null, category: "Material Digital", description: "Slides das disciplinas do MBA", status: "active" },
  { id: 7, name: "Flip Chart", type: "finite", quantity: 10, category: "Equipamento", description: "Cavaletes com papel", status: "active" },
  { id: 8, name: "Case Digital – Inovação", type: "infinite", quantity: null, category: "Material Digital", description: "Cases digitais para o programa de inovação", status: "inactive" },
];

const CATEGORIES = ["Equipamento", "Material Físico", "Material Digital", "Kit", "Outro"];

const emptyForm = { name: "", type: "finite" as ResourceType, quantity: 1, category: "Equipamento", description: "", status: "active" as ResourceStatus };
interface FormData { name: string; type: ResourceType; quantity: number; category: string; description: string; status: ResourceStatus; }

function ResourceModal({ mode, resource, onSave, onClose }: { mode: "create" | "edit"; resource?: Resource; onSave: (d: FormData) => void; onClose: () => void; }) {
  const [form, setForm] = useState<FormData>(
    mode === "edit" && resource
      ? { name: resource.name, type: resource.type, quantity: resource.quantity ?? 1, category: resource.category, description: resource.description, status: resource.status }
      : emptyForm
  );
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validate = () => {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = "Nome é obrigatório";
    if (!form.category) e.category = "Categoria é obrigatória";
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
          <h2 className="font-display font-bold text-lg text-foreground">{mode === "create" ? "Novo Recurso" : "Editar Recurso"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Nome do recurso *</label>
            <input className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30", errors.name ? "border-destructive" : "border-input")}
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Projetor Epson" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Tipo de recurso</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { val: "finite", label: "Finito", desc: "Equipamentos, materiais físicos", icon: Package },
                { val: "infinite", label: "Infinito", desc: "Materiais digitais, conteúdo", icon: Infinity },
              ] as const).map((t) => (
                <button key={t.val} type="button" onClick={() => setForm({ ...form, type: t.val, quantity: t.val === "infinite" ? 0 : form.quantity || 1 })}
                  className={cn("p-3 rounded-xl border text-left transition-colors", form.type === t.val ? "border-primary bg-primary/5" : "border-input hover:border-primary/40")}>
                  <t.icon className={cn("w-4 h-4 mb-1", form.type === t.val ? "text-primary" : "text-muted-foreground")} />
                  <p className={cn("text-xs font-semibold", form.type === t.val ? "text-primary" : "text-foreground")}>{t.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {form.type === "finite" && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Quantidade disponível</label>
              <input type="number" min={0}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.quantity || ""} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} placeholder="0" />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Categoria *</label>
            <select className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30", errors.category ? "border-destructive" : "border-input")}
              value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Descrição</label>
            <textarea rows={2} className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Breve descrição do recurso..." />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Status</label>
            <div className="flex gap-2">
              {(["active", "inactive"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setForm({ ...form, status: s })}
                  className={cn("flex-1 py-2 text-sm rounded-lg border font-medium transition-colors",
                    form.status === s ? s === "active" ? "bg-success/10 text-success border-success/30" : "bg-muted text-muted-foreground border-border"
                      : "bg-background text-muted-foreground border-input hover:border-primary/40")}>
                  {s === "active" ? "Ativo" : "Inativo"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-2 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">Cancelar</button>
          <button onClick={handleSave} className="flex-1 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            {mode === "create" ? "Cadastrar Recurso" : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | ResourceType>("all");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [editResource, setEditResource] = useState<Resource | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const filtered = resources.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || r.type === filterType;
    return matchSearch && matchType;
  });

  const handleCreate = (data: FormData) => {
    setResources([...resources, { ...data, id: Date.now(), quantity: data.type === "infinite" ? null : data.quantity }]);
    setShowCreate(false);
  };

  const handleEdit = (data: FormData) => {
    setResources(resources.map((r) => r.id === editResource!.id ? { ...r, ...data, quantity: data.type === "infinite" ? null : data.quantity } : r));
    setEditResource(null);
  };

  const handleToggle = (resource: Resource) => {
    setResources(resources.map((r) => r.id === resource.id ? { ...r, status: r.status === "active" ? "inactive" : "active" } : r));
    setOpenMenu(null);
  };

  return (
    <AppLayout pageTitle="Acervos e Recursos" pageSubtitle="Materiais, equipamentos e conteúdos digitais">
      <div className="p-6 space-y-5 animate-fade-in" onClick={() => setOpenMenu(null)}>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total", value: resources.length, class: "bg-primary/5 text-primary border-primary/15" },
            { label: "Finitos", value: resources.filter((r) => r.type === "finite").length, class: "bg-warning/5 text-warning border-warning/15" },
            { label: "Infinitos", value: resources.filter((r) => r.type === "infinite").length, class: "bg-success/5 text-success border-success/15" },
            { label: "Inativos", value: resources.filter((r) => r.status === "inactive").length, class: "bg-muted text-muted-foreground border-border" },
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
              <input type="text" placeholder="Buscar recursos..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-56" />
            </div>
            <div className="flex items-center gap-1.5">
              {([
                { key: "all", label: "Todos" },
                { key: "finite", label: "Finitos" },
                { key: "infinite", label: "Infinitos" },
              ] as const).map((f) => (
                <button key={f.key} onClick={() => setFilterType(f.key)}
                  className={cn("text-xs px-3 py-1.5 rounded-lg border transition-all font-medium",
                    filterType === f.key ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40")}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Novo Recurso
          </button>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Recurso</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Tipo</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Quantidade</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Categoria</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((resource) => (
                <tr key={resource.id} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer", resource.status === "inactive" && "opacity-60")}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", resource.type === "finite" ? "bg-warning/10" : "bg-success/10")}>
                        {resource.type === "finite" ? <Package className="w-3.5 h-3.5 text-warning" /> : <Infinity className="w-3.5 h-3.5 text-success" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{resource.name}</p>
                        {resource.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{resource.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", resource.type === "finite" ? "bg-warning/10 text-warning border-warning/20" : "bg-success/10 text-success border-success/20")}>
                      {resource.type === "finite" ? "Finito" : "Infinito"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-foreground hidden md:table-cell">
                    {resource.type === "finite" ? (
                      <span className={cn("font-semibold", (resource.quantity ?? 0) <= 5 ? "text-destructive" : "text-foreground")}>{resource.quantity}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground hidden md:table-cell">{resource.category}</td>
                  <td className="px-3 py-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", resource.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                      {resource.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-3 py-3 relative">
                    <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === resource.id ? null : resource.id); }}
                      className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                    {openMenu === resource.id && (
                      <div onClick={(e) => e.stopPropagation()} className="absolute right-3 top-8 z-20 bg-card border border-border rounded-xl shadow-xl w-40 py-1 animate-fade-in">
                        <button onClick={() => { setEditResource(resource); setOpenMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors">
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" /> Editar recurso
                        </button>
                        <button onClick={() => handleToggle(resource)} className={cn("w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors hover:bg-muted", resource.status === "active" ? "text-destructive" : "text-success")}>
                          {resource.status === "active" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          {resource.status === "active" ? "Desativar" : "Ativar"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum recurso encontrado.</p>
            </div>
          )}
        </div>
      </div>
      {showCreate && <ResourceModal mode="create" onSave={handleCreate} onClose={() => setShowCreate(false)} />}
      {editResource && <ResourceModal mode="edit" resource={editResource} onSave={handleEdit} onClose={() => setEditResource(null)} />}
    </AppLayout>
  );
}
