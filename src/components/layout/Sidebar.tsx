import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  BarChart3,
  Package,
  Users,
  Settings,
  CheckSquare,
  Bell,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  ClipboardList,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import iseLogo1 from "@/assets/ISE Logo1.svg";
import iseLogo3 from "@/assets/ISE Logo3.svg";

const navItems = [
  {
    group: "Principal",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { label: "Calendário", icon: Calendar, path: "/calendar" },
      { label: "Mapa de Calor", icon: BarChart3, path: "/occupancy" },
    ],
  },
  {
    group: "Acadêmico",
    items: [
      { label: "Programas e turmas", icon: GraduationCap, path: "/programs" },
      { label: "Sessões", icon: BookOpen, path: "/sessions" },
      { label: "Pré-Reservas", icon: ClipboardList, path: "/reservations" },
      { label: "Horário Oficial", icon: CheckSquare, path: "/schedule" },
    ],
  },
  {
    group: "Catálogos",
    items: [
      { label: "Pessoas", icon: Users, path: "/people" },
      { label: "Espaços", icon: Building2, path: "/spaces" },
      { label: "Acervos e Recursos", icon: Package, path: "/resources-catalog" },
    ],
  },
  {
    group: "Administração",
    items: [
      { label: "Usuários", icon: Users, path: "/users" },
      { label: "Configurações", icon: Settings, path: "/settings" },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "sidebar-gradient flex flex-col h-screen transition-all duration-300 ease-in-out shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center border-b border-sidebar-border", collapsed ? "justify-center px-2 py-4" : "px-5 py-4")}>
        {collapsed ? (
          <img src={iseLogo1} alt="ISE" className="w-8 h-8 shrink-0" />
        ) : (
          <img src={iseLogo3} alt="ISE Business School" className="h-10 w-auto animate-fade-in" />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navItems.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <p className="text-sidebar-foreground/40 text-xs font-semibold uppercase tracking-wider px-2 mb-1">
                {group.group}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-all duration-150",
                        collapsed ? "justify-center" : "",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span className="animate-fade-in">{item.label}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 py-3 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center gap-2 w-full px-2 py-2 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition-all text-xs",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Recolher</span></>}
        </button>
      </div>
    </aside>
  );
}
