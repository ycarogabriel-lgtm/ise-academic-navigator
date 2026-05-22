import { AppLayout } from "@/components/layout/AppLayout";
import { Plus, Search, MoreHorizontal, Shield, X, Pencil, UserX, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const ROLES = {
  admin: { label: "Admin", class: "bg-foreground/10 text-foreground border-border" },
  da: { label: "Dir. Acadêmico", class: "bg-primary/10 text-primary border-primary/20" },
  dp: { label: "Dir. de Programa", class: "bg-primary/15 text-primary border-primary/20" },
  ca: { label: "Coord. Acadêmica", class: "bg-warning/10 text-warning border-warning/20" },
  planejamento: { label: "Planejamento", class: "bg-success/10 text-success border-success/20" },
  admissoes: { label: "Admissões", class: "bg-accent-foreground/10 text-accent-foreground border-border" },
  atendimento: { label: "Atendimento", class: "bg-muted text-muted-foreground border-border" },
};

type Role = keyof typeof ROLES;
type UserStatus = "active" | "inactive";

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  cargo: string;
  lastLogin: string;
  status: UserStatus;
}

const initialUsers: User[] = [
  { id: 1, name: "Ana Lima", email: "a.lima@ise.edu.br", role: "admin", cargo: "Administradora", lastLogin: "Hoje, 09:14", status: "active" },
  { id: 2, name: "Carlos Faria", email: "c.faria@ise.edu.br", role: "da", cargo: "Diretor Acadêmico", lastLogin: "Hoje, 08:30", status: "active" },
  { id: 3, name: "Beatriz Campos", email: "b.campos@ise.edu.br", role: "dp", cargo: "Diretora de Programa", lastLogin: "Ontem, 17:45", status: "active" },
  { id: 4, name: "Diego Mendes", email: "d.mendes@ise.edu.br", role: "planejamento", cargo: "Analista de Planejamento", lastLogin: "Hoje, 10:02", status: "active" },
  { id: 5, name: "Fernanda Rocha", email: "f.rocha@ise.edu.br", role: "admissoes", cargo: "Coordenadora de Admissões", lastLogin: "22/02/24", status: "active" },
  { id: 6, name: "Gustavo Neves", email: "g.neves@ise.edu.br", role: "ca", cargo: "Coordenador Acadêmico", lastLogin: "Nunca", status: "inactive" },
  { id: 7, name: "Helena Costa", email: "h.costa@ise.edu.br", role: "atendimento", cargo: "Atendimento ao Aluno", lastLogin: "Hoje, 11:20", status: "active" },
];

const emptyForm = { name: "", email: "", cargo: "", role: "atendimento" as Role, status: "active" as UserStatus };

interface FormData {
  name: string;
  email: string;
  cargo: string;
  role: Role;
  status: UserStatus;
}

function UserModal({
  mode,
  user,
  onSave,
  onClose,
}: {
  mode: "create" | "edit";
  user?: User;
  onSave: (data: FormData) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormData>(
    mode === "edit" && user
      ? { name: user.name, email: user.email, cargo: user.cargo, role: user.role, status: user.status }
      : emptyForm
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nome é obrigatório";
    if (!form.email.trim()) e.email = "E-mail é obrigatório";
    else if (!form.email.endsWith("@ise.edu.br")) e.email = "Use e-mail institucional @ise.edu.br";
    if (!form.role) e.role = "Perfil é obrigatório";
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
          <h2 className="font-display font-bold text-lg text-foreground">
            {mode === "create" ? "Novo Usuário" : "Editar Usuário"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Nome completo *</label>
            <input
              className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30", errors.name ? "border-destructive" : "border-input")}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nome completo"
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
              E-mail institucional *{mode === "edit" && " (não editável)"}
            </label>
            <input
              className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30", errors.email ? "border-destructive" : "border-input", mode === "edit" && "opacity-50 cursor-not-allowed")}
              value={form.email}
              onChange={(e) => mode === "create" && setForm({ ...form, email: e.target.value })}
              readOnly={mode === "edit"}
              placeholder="usuario@ise.edu.br"
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Cargo / Área</label>
            <input
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.cargo}
              onChange={(e) => setForm({ ...form, cargo: e.target.value })}
              placeholder="Cargo ou área de atuação"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Perfil de acesso *</label>
            <select
              className={cn("w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30", errors.role ? "border-destructive" : "border-input")}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
            >
              {Object.entries(ROLES).map(([key, r]) => (
                <option key={key} value={key}>{r.label}</option>
              ))}
            </select>
            {errors.role && <p className="text-xs text-destructive mt-1">{errors.role}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Status</label>
            <div className="flex gap-2">
              {(["active", "inactive"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={cn(
                    "flex-1 py-2 text-sm rounded-lg border font-medium transition-colors",
                    form.status === s
                      ? s === "active" ? "bg-success/10 text-success border-success/30" : "bg-muted text-muted-foreground border-border"
                      : "bg-background text-muted-foreground border-input hover:border-primary/40"
                  )}
                >
                  {s === "active" ? "Ativo" : "Inativo"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-2 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="flex-1 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            {mode === "create" ? "Criar Usuário" : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ user, onConfirm, onClose }: { user: User; onConfirm: () => void; onClose: () => void }) {
  const deactivating = user.status === "active";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", deactivating ? "bg-destructive/10" : "bg-success/10")}>
            {deactivating ? <UserX className="w-5 h-5 text-destructive" /> : <UserCheck className="w-5 h-5 text-success" />}
          </div>
          <div>
            <h2 className="font-display font-bold text-base text-foreground">{deactivating ? "Inativar Usuário" : "Ativar Usuário"}</h2>
            <p className="text-xs text-muted-foreground">{user.name}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          {deactivating
            ? "O usuário perderá acesso ao sistema imediatamente. O histórico de ações será preservado."
            : "O usuário recuperará acesso ao sistema com o perfil atual."}
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">Cancelar</button>
          <button
            onClick={onConfirm}
            className={cn("flex-1 py-2 text-sm font-medium rounded-lg transition-colors", deactivating ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-success text-white hover:bg-success/90")}
          >
            {deactivating ? "Inativar" : "Ativar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [toggleUser, setToggleUser] = useState<User | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (data: FormData) => {
    const isDup = users.some((u) => u.email === data.email);
    if (isDup) return;
    setUsers([...users, { ...data, id: Date.now(), lastLogin: "Nunca" }]);
    setShowCreate(false);
  };

  const handleEdit = (data: FormData) => {
    setUsers(users.map((u) => (u.id === editUser!.id ? { ...u, ...data } : u)));
    setEditUser(null);
  };

  const handleToggle = () => {
    setUsers(users.map((u) =>
      u.id === toggleUser!.id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
    ));
    setToggleUser(null);
  };

  return (
    <AppLayout pageTitle="Usuários" pageSubtitle="Gestão de acesso e perfis do sistema">
      <div className="p-6 space-y-5 animate-fade-in" onClick={() => setOpenMenu(null)}>
        {/* Role summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(ROLES).map(([key, role]) => (
            <div key={key} className={cn("rounded-lg border px-3 py-2.5 text-center", role.class)}>
              <p className="text-xs font-semibold">{role.label}</p>
              <p className="text-lg font-display font-bold mt-0.5">
                {users.filter((u) => u.role === key).length}
              </p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-60"
            />
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Usuário
          </button>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Usuário</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">E-mail</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Cargo</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Perfil</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Último acesso</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const r = ROLES[user.role];
                return (
                  <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold", user.status === "active" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                          {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <p className="text-xs font-semibold text-foreground">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground font-mono hidden md:table-cell">{user.email}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground hidden md:table-cell">{user.cargo}</td>
                    <td className="px-3 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", r.class)}>
                        {r.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground hidden lg:table-cell">{user.lastLogin}</td>
                    <td className="px-3 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", user.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                        {user.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-3 py-3 relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === user.id ? null : user.id); }}
                        className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                      {openMenu === user.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-3 top-8 z-20 bg-card border border-border rounded-xl shadow-xl w-44 py-1 animate-fade-in"
                        >
                          <button
                            onClick={() => { setEditUser(user); setOpenMenu(null); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                            Editar perfil
                          </button>
                          <button
                            onClick={() => { setToggleUser(user); setOpenMenu(null); }}
                            className={cn("w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors hover:bg-muted", user.status === "active" ? "text-destructive" : "text-success")}
                          >
                            {user.status === "active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            {user.status === "active" ? "Inativar usuário" : "Ativar usuário"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* RBAC info banner */}
        <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/15 rounded-xl">
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Controle de Acesso por Perfil (RBAC)</p>
            <p className="text-xs text-muted-foreground mt-0.5">Cada perfil possui permissões específicas por módulo. Usuários inativos são bloqueados automaticamente. A atribuição de perfis é gerenciada pelo administrador do sistema.</p>
          </div>
        </div>
      </div>

      {showCreate && <UserModal mode="create" onSave={handleCreate} onClose={() => setShowCreate(false)} />}
      {editUser && <UserModal mode="edit" user={editUser} onSave={handleEdit} onClose={() => setEditUser(null)} />}
      {toggleUser && <ConfirmModal user={toggleUser} onConfirm={handleToggle} onClose={() => setToggleUser(null)} />}
    </AppLayout>
  );
}
