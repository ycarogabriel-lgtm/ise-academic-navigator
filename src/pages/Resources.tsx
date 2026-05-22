import { AppLayout } from "@/components/layout/AppLayout";
import { Plus, Search, Building2, Users, Package, Filter, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const spaces = [
  { id: 1, name: "Sala 101", type: "Sala de Aula", capacity: 30, status: "free", floor: "1º Andar" },
  { id: 2, name: "Sala 102", type: "Sala de Aula", capacity: 30, status: "occupied", floor: "1º Andar" },
  { id: 3, name: "Sala 105", type: "Sala VIP", capacity: 20, status: "free", floor: "1º Andar" },
  { id: 4, name: "Sala 201", type: "Sala de Aula", capacity: 40, status: "occupied", floor: "2º Andar" },
  { id: 5, name: "Sala 202", type: "Sala de Aula", capacity: 40, status: "free", floor: "2º Andar" },
  { id: 6, name: "Sala 302", type: "Sala de Aula", capacity: 35, status: "reserved", floor: "3º Andar" },
  { id: 7, name: "Auditório A", type: "Auditório", capacity: 120, status: "reserved", floor: "Térreo" },
  { id: 8, name: "Auditório B", type: "Auditório", capacity: 80, status: "free", floor: "Térreo" },
  { id: 9, name: "Lab. Digital", type: "Laboratório", capacity: 25, status: "occupied", floor: "2º Andar" },
];

const professors = [
  { id: 1, name: "Dr. Carlos Faria", area: "Estratégia", programs: 3, email: "c.faria@ise.edu.br", status: "active" },
  { id: 2, name: "Dra. Ana Souza", area: "Finanças", programs: 2, email: "a.souza@ise.edu.br", status: "active" },
  { id: 3, name: "Dr. Pedro Costa", area: "Marketing", programs: 1, email: "p.costa@ise.edu.br", status: "active" },
  { id: 4, name: "Dr. Marcos Lima", area: "Operações", programs: 2, email: "m.lima@ise.edu.br", status: "active" },
  { id: 5, name: "Dra. Lucia Mendes", area: "RH", programs: 1, email: "l.mendes@ise.edu.br", status: "inactive" },
  { id: 6, name: "Dr. Rafael Torres", area: "Inovação", programs: 0, email: "r.torres@ise.edu.br", status: "active" },
];

const statusSpace = {
  free: { label: "Disponível", class: "bg-success/10 text-success border-success/20" },
  occupied: { label: "Ocupado", class: "bg-destructive/10 text-destructive border-destructive/20" },
  reserved: { label: "Reservado", class: "bg-primary/10 text-primary border-primary/20" },
};

export default function Resources() {
  const [tab, setTab] = useState<"spaces" | "professors">("spaces");
  const [search, setSearch] = useState("");

  const filteredSpaces = spaces.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.type.toLowerCase().includes(search.toLowerCase()));
  const filteredProfs = professors.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.area.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppLayout pageTitle="Recursos" pageSubtitle="Espaços físicos, professores e materiais">
      <div className="p-6 space-y-5 animate-fade-in">
        {/* Tabs & toolbar */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              {([
                { key: "spaces", label: "Espaços", icon: Building2 },
                { key: "professors", label: "Professores", icon: Users },
              ] as const).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "text-sm px-4 py-2 font-medium transition-colors flex items-center gap-1.5",
                    tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-52"
              />
            </div>
          </div>

          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary-light transition-colors">
            <Plus className="w-4 h-4" />
            {tab === "spaces" ? "Novo Espaço" : "Novo Professor"}
          </button>
        </div>

        {/* Spaces view */}
        {tab === "spaces" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSpaces.map((space) => {
              const s = statusSpace[space.status as keyof typeof statusSpace];
              return (
                <div key={space.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-card transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", s.class)}>{s.label}</span>
                      <button className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-foreground text-base group-hover:text-primary transition-colors">{space.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{space.type} · {space.floor}</p>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Capacidade</span>
                    <span className="text-sm font-semibold text-foreground">{space.capacity} pessoas</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Professors view */}
        {tab === "professors" && (
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Professor</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Área</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">E-mail</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Programas</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredProfs.map((prof) => (
                  <tr key={prof.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold">
                          {prof.name.split(" ").slice(-1)[0][0]}
                        </div>
                        <p className="text-xs font-semibold text-foreground">{prof.name}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground hidden md:table-cell">{prof.area}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground font-mono hidden lg:table-cell">{prof.email}</td>
                    <td className="px-3 py-3 text-xs text-foreground">{prof.programs}</td>
                    <td className="px-3 py-3">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        prof.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                      )}>
                        {prof.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
