import { Bell, Search, ChevronDown, LogOut, User, X, GraduationCap, Building, Users, BookOpen } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface HeaderProps {
  pageTitle: string;
  pageSubtitle?: string;
}

type SearchResultType = "program" | "room" | "professor" | "resource";

interface SearchResult {
  id: string;
  type: SearchResultType;
  label: string;
  sublabel?: string;
  route: string;
}

const SEARCH_DATA: SearchResult[] = [
  // Programs
  { id: "s1", type: "program", label: "MBA Executivo", sublabel: "ISE Business School · Reservado", route: "/programs" },
  { id: "s2", type: "program", label: "Especialização em Finanças Corporativas", sublabel: "Custom · Finalizado", route: "/programs" },
  { id: "s3", type: "program", label: "Liderança Estratégica", sublabel: "Custom · Rascunho", route: "/programs" },
  { id: "s4", type: "program", label: "Marketing Digital", sublabel: "Aberto · Reservado", route: "/programs" },
  { id: "s5", type: "program", label: "Inovação e Startups", sublabel: "Custom · Rascunho", route: "/programs" },
  // Rooms
  { id: "r1", type: "room", label: "Anfiteatro A", sublabel: "Cap. 120 · Sala Plenária", route: "/occupancy" },
  { id: "r2", type: "room", label: "Anfiteatro B", sublabel: "Cap. 80 · Sala Plenária", route: "/occupancy" },
  { id: "r3", type: "room", label: "Sala 101", sublabel: "Cap. 30 · Sala de Equipe", route: "/occupancy" },
  { id: "r4", type: "room", label: "Sala 201", sublabel: "Cap. 40 · Sala de Equipe", route: "/occupancy" },
  { id: "r5", type: "room", label: "Refeitório Principal", sublabel: "Cap. 200 · Refeitório", route: "/occupancy" },
  { id: "r6", type: "room", label: "Lab. Digital", sublabel: "Cap. 25 · Laboratório", route: "/occupancy" },
  // Professors
  { id: "p1", type: "professor", label: "Prof. Dr. Carlos Faria", sublabel: "Diretor Acadêmico", route: "/people" },
  { id: "p2", type: "professor", label: "Profa. Dra. Ana Souza", sublabel: "Coordenadora", route: "/people" },
  { id: "p3", type: "professor", label: "Prof. Dr. Pedro Costa", sublabel: "Docente", route: "/people" },
  { id: "p4", type: "professor", label: "Prof. Dr. Marcos Lima", sublabel: "Diretor de Programa", route: "/people" },
  { id: "p5", type: "professor", label: "Profa. Dra. Lucia Mendes", sublabel: "Coordenadora", route: "/people" },
  // Resources
  { id: "x1", type: "resource", label: "Projetor Epson EB-2250U", sublabel: "Recurso AV · Disponível", route: "/resources-catalog" },
  { id: "x2", type: "resource", label: "Kit Flipchart Premium", sublabel: "Material · Disponível", route: "/resources-catalog" },
  { id: "x3", type: "resource", label: "Sistema de Videoconferência", sublabel: "Recurso AV · Em uso", route: "/resources-catalog" },
];

const TYPE_CONFIG: Record<SearchResultType, { icon: React.ElementType; label: string; color: string }> = {
  program: { icon: GraduationCap, label: "Programa", color: "text-primary bg-primary/10" },
  room: { icon: Building, label: "Sala", color: "text-success bg-success/10" },
  professor: { icon: Users, label: "Professor", color: "text-warning bg-warning/10" },
  resource: { icon: BookOpen, label: "Recurso", color: "text-muted-foreground bg-muted" },
};

function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = query.trim().length >= 1
    ? SEARCH_DATA.filter((d) =>
        d.label.toLowerCase().includes(query.toLowerCase()) ||
        (d.sublabel && d.sublabel.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (result: SearchResult) => {
    navigate(result.route);
    setQuery("");
    setOpen(false);
    setFocused(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setFocused((f) => Math.min(f + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setFocused((f) => Math.max(f - 1, 0)); }
    else if (e.key === "Enter" && focused >= 0 && results[focused]) handleSelect(results[focused]);
    else if (e.key === "Escape") { setOpen(false); setFocused(-1); inputRef.current?.blur(); }
  };

  // Group results by type
  const grouped = results.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<SearchResultType, SearchResult[]>);

  return (
    <div className="relative" ref={ref}>
      <div className={cn(
        "flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg border transition-all",
        open && query ? "border-primary/50 ring-2 ring-primary/20 bg-background" : "border-border bg-muted"
      )}>
        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setFocused(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar programas, salas, professores..."
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-64"
          aria-label="Busca global"
          aria-autocomplete="list"
          aria-expanded={open && results.length > 0}
          role="combobox"
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }} className="p-0.5 rounded hover:bg-muted-foreground/20 transition-colors" aria-label="Limpar busca">
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
      </div>

      {open && query.trim().length >= 1 && (
        <div
          role="listbox"
          className="absolute top-full left-0 mt-1.5 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in max-h-80 overflow-y-auto"
        >
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum resultado para "{query}"</p>
            </div>
          ) : (
            Object.entries(grouped).map(([type, items]) => {
              const cfg = TYPE_CONFIG[type as SearchResultType];
              const Icon = cfg.icon;
              return (
                <div key={type}>
                  <div className="px-3 pt-2.5 pb-1 flex items-center gap-1.5">
                    <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded", cfg.color)}>{cfg.label}</span>
                  </div>
                  {items.map((result, i) => {
                    const globalIdx = results.indexOf(result);
                    return (
                      <button
                        key={result.id}
                        role="option"
                        aria-selected={focused === globalIdx}
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setFocused(globalIdx)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors",
                          focused === globalIdx ? "bg-muted" : "hover:bg-muted/60"
                        )}
                      >
                        <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0", cfg.color)}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground font-medium truncate">{result.label}</p>
                          {result.sublabel && <p className="text-xs text-muted-foreground truncate">{result.sublabel}</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
          <div className="border-t border-border px-3 py-2 bg-muted/30">
            <p className="text-xs text-muted-foreground">↑↓ navegar · Enter selecionar · Esc fechar</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function Header({ pageTitle, pageSubtitle }: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 shrink-0 shadow-sm-blue">
      {/* Page title */}
      <div>
        <h1 className="font-display font-bold text-foreground text-base leading-tight">{pageTitle}</h1>
        {pageSubtitle && <p className="text-muted-foreground text-xs">{pageSubtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Global Search */}
        <div className="hidden md:block">
          <GlobalSearch />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" aria-label="Notificações">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full" />
        </button>

        {/* User profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted transition-colors"
            aria-haspopup="true"
            aria-expanded={profileOpen}
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              DA
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-foreground leading-tight">Dir. Acadêmico</p>
              <p className="text-xs text-muted-foreground leading-tight">d.academico@ise.edu.br</p>
            </div>
            <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", profileOpen && "rotate-180")} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-lg shadow-md-blue py-1 z-50 animate-fade-in">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-semibold text-foreground">Diretor Acadêmico</p>
                <p className="text-xs text-muted-foreground">d.academico@ise.edu.br</p>
              </div>
              <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <User className="w-3.5 h-3.5" />
                Meu Perfil
              </button>
              <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
