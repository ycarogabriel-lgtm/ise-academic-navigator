import { AppLayout } from "@/components/layout/AppLayout";
import { Plus, Search, MoreHorizontal, Users, X, Pencil, UserX, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import { useState } from "react";

type PersonStatus = "active" | "inactive";

interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
  area: string;
  status: PersonStatus;
}

const initialPeople: Person[] = [
  { id: 1, name: "Dr. Carlos Faria", email: "c.faria@ise.edu.br", role: "Professor", area: "Estratégia", status: "active" },
  { id: 2, name: "Dra. Ana Souza", email: "a.souza@ise.edu.br", role: "Professora", area: "Finanças", status: "active" },
  { id: 3, name: "Dr. Pedro Costa", email: "p.costa@ise.edu.br", role: "Professor", area: "Marketing", status: "active" },
  { id: 4, name: "Dr. Marcos Lima", email: "m.lima@ise.edu.br", role: "Professor", area: "Operações", status: "active" },
  { id: 5, name: "Dra. Lucia Mendes", email: "l.mendes@ise.edu.br", role: "Professora", area: "RH", status: "inactive" },
  { id: 6, name: "Dr. Rafael Torres", email: "r.torres@ise.edu.br", role: "Professor", area: "Inovação", status: "active" },
  { id: 7, name: "Mariana Ferreira", email: "m.ferreira@ise.edu.br", role: "Coordenadora", area: "Planejamento", status: "active" },
  { id: 8, name: "Rodrigo Alves", email: "r.alves@ise.edu.br", role: "Analista", area: "Operações", status: "active" },
];

const emptyForm = { name: "", email: "", role: "", area: "", status: "active" as PersonStatus };
interface FormData { name: string; email: string; role: string; area: string; status: PersonStatus; }

function PersonModal({ mode, person, onSave, onClose }: { mode: "create" | "edit"; person?: Person; onSave: (d: FormData) => void; onClose: () => void; }) {
  const [form, setForm] = useState<FormData>(
    mode === "edit" && person
      ? { name: person.name, email: person.email, role: person.role, area: person.area, status: person.status }
      : emptyForm
  );
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validate = () => {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = "Nome é obrigatório";
    if (!form.email.trim()) e.email = "E-mail é obrigatório";
    else if (!form.email.endsWith("@ise.edu.br")) e.email = "Use e-mail institucional @ise.edu.br";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-lg text-foreground">{mode === "create" ? "Nova Pessoa" : "Editar Pessoa"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Nome completo *</label>
            <input className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30", errors.name ? "border-destructive" : "border-input")}
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">E-mail institucional *{mode === "edit" && " (não editável)"}</label>
            <input className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30", errors.email ? "border-destructive" : "border-input", mode === "edit" && "opacity-50 cursor-not-allowed")}
              value={form.email} onChange={(e) => mode === "create" && setForm({ ...form, email: e.target.value })} readOnly={mode === "edit"} placeholder="usuario@ise.edu.br" />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Cargo / Função</label>
              <input className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Professor, Coord..." />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Área acadêmica</label>
              <input className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Finanças, RH..." />
            </div>
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
            {mode === "create" ? "Cadastrar Pessoa" : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [editPerson, setEditPerson] = useState<Person | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const roles = ["all", ...Array.from(new Set(people.map((p) => p.role)))];

  const filtered = people.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase()) || p.area.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || p.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleCreate = (data: FormData) => {
    const isDup = people.some((p) => p.email === data.email);
    if (isDup) return;
    setPeople([...people, { ...data, id: Date.now() }]);
    setShowCreate(false);
  };

  const handleEdit = (data: FormData) => {
    setPeople(people.map((p) => p.id === editPerson!.id ? { ...p, ...data } : p));
    setEditPerson(null);
  };

  const handleToggle = (person: Person) => {
    setPeople(people.map((p) => p.id === person.id ? { ...p, status: p.status === "active" ? "inactive" : "active" } : p));
    setOpenMenu(null);
  };

  return (
    <AppLayout pageTitle="Catálogo de Pessoas" pageSubtitle="Professores e colaboradores disponíveis para alocação">
      <div className="p-6 space-y-5 animate-fade-in" onClick={() => setOpenMenu(null)}>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total"       value={people.length} />
          <StatCard label="Ativos"      value={people.filter((p) => p.status === "active").length} />
          <StatCard label="Inativos"    value={people.filter((p) => p.status === "inactive").length} />
          <StatCard label="Professores" value={people.filter((p) => p.role.toLowerCase().includes("professor")).length} />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input type="text" placeholder="Buscar por nome, área..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-60" />
            </div>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground">
              <option value="all">Todas as funções</option>
              {roles.filter((r) => r !== "all").map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Nova Pessoa
          </button>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Pessoa</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">E-mail</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Função</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Área</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((person) => (
                <tr key={person.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold", person.status === "active" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                        {person.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <p className="text-xs font-semibold text-foreground">{person.name}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground font-mono hidden md:table-cell">{person.email}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{person.role}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground hidden lg:table-cell">{person.area}</td>
                  <td className="px-3 py-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", person.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                      {person.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-3 py-3 relative">
                    <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === person.id ? null : person.id); }}
                      className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                    {openMenu === person.id && (
                      <div onClick={(e) => e.stopPropagation()} className="absolute right-3 top-8 z-20 bg-card border border-border rounded-xl shadow-xl w-44 py-1 animate-fade-in">
                        <button onClick={() => { setEditPerson(person); setOpenMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors">
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" /> Editar cadastro
                        </button>
                        <button onClick={() => handleToggle(person)} className={cn("w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors hover:bg-muted", person.status === "active" ? "text-destructive" : "text-success")}>
                          {person.status === "active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          {person.status === "active" ? "Inativar" : "Ativar"}
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
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma pessoa encontrada.</p>
            </div>
          )}
        </div>
      </div>
      {showCreate && <PersonModal mode="create" onSave={handleCreate} onClose={() => setShowCreate(false)} />}
      {editPerson && <PersonModal mode="edit" person={editPerson} onSave={handleEdit} onClose={() => setEditPerson(null)} />}
    </AppLayout>
  );
}
