import { AppLayout } from "@/components/layout/AppLayout";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar, ClipboardList, Check, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DAYS_HEADER = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

interface DayEntry {
  id: string;
  year: number;
  month: number; // 0-based
  day: number;
  label: string;
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatLabel(year: number, month: number, day: number): string {
  const weekday = new Date(year, month, day).toLocaleDateString("pt-BR", { weekday: "short" });
  return `${String(day).padStart(2, "0")}/${MONTHS[month].slice(0, 3)} (${weekday.replace(".", "").replace(/^\w/, (c) => c.toUpperCase())})`;
}

export default function DiasDeEntregaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    turmaName?: string;
    programName?: string;
    siglaTurma?: string;
  } | null;

  const turmaName = state?.turmaName || "Turma A 2024";
  const programName = state?.programName || "MBA Executivo";
  const siglaTurma = state?.siglaTurma || "T24A";

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [days, setDays] = useState<DayEntry[]>([]);
  const [manualForm, setManualForm] = useState({ open: false, day: "", month: "", year: String(today.getFullYear()) });

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();

  const isSelected = (y: number, m: number, d: number) =>
    days.some((e) => e.year === y && e.month === m && e.day === d);

  const toggleDay = (d: number) => {
    const y = calYear;
    const m = calMonth;
    if (isSelected(y, m, d)) {
      setDays((prev) => prev.filter((e) => !(e.year === y && e.month === m && e.day === d)));
    } else {
      setDays((prev) => [
        ...prev,
        { id: isoDate(y, m, d), year: y, month: m, day: d, label: formatLabel(y, m, d) },
      ].sort((a, b) => isoDate(a.year, a.month, a.day).localeCompare(isoDate(b.year, b.month, b.day))));
    }
  };

  const removeDay = (id: string) => setDays((prev) => prev.filter((d) => d.id !== id));

  const updateLabel = (id: string, label: string) =>
    setDays((prev) => prev.map((d) => (d.id === id ? { ...d, label } : d)));

  const handleManualAdd = () => {
    const d = parseInt(manualForm.day);
    const m = parseInt(manualForm.month) - 1;
    const y = parseInt(manualForm.year);
    if (!manualForm.day || !manualForm.month || !manualForm.year) return;
    if (isNaN(d) || isNaN(m) || isNaN(y)) return;
    if (d < 1 || d > 31 || m < 0 || m > 11 || y < 2000 || y > 2099) return;
    const date = new Date(y, m, d);
    if (date.getMonth() !== m || date.getDate() !== d) return;
    if (!isSelected(y, m, d)) {
      setDays((prev) =>
        [...prev, { id: isoDate(y, m, d), year: y, month: m, day: d, label: formatLabel(y, m, d) }]
          .sort((a, b) => isoDate(a.year, a.month, a.day).localeCompare(isoDate(b.year, b.month, b.day)))
      );
    }
    setManualForm({ open: false, day: "", month: "", year: String(calYear) });
  };

  const handleGenerate = () => {
    const deliveryDays = days.map((d) => ({
      label: d.label,
      date: formatLabel(d.year, d.month, d.day),
    }));
    navigate("/programs/turma/cpanel", {
      state: { turmaName, programName, siglaTurma, deliveryDays },
    });
  };

  return (
    <AppLayout pageTitle="Dias de Entrega" pageSubtitle={`${programName} · ${siglaTurma}`}>
      <div className="p-4 md:p-6 space-y-5 animate-fade-in max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div>
          <button
            onClick={() => navigate("/programs")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" /> Programas
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <div>
              <h1 className="font-display font-bold text-foreground text-lg leading-tight">
                Dias de Aula — {turmaName}
              </h1>
              <p className="text-muted-foreground text-sm">{programName} · Configurar dias de aula</p>
            </div>
          </div>
        </div>

        {/* Instruction banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <p className="text-sm text-foreground font-medium mb-1">Selecione os dias de aula no calendário</p>
          <p className="text-xs text-muted-foreground">
            Clique nos dias do calendário para adicioná-los ou removê-los. Você também pode adicionar manualmente pelo botão abaixo.
          </p>
        </div>

        {/* Calendar picker */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <button
              onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); } else { setCalMonth((m) => m - 1); } }}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <p className="font-semibold text-sm text-foreground">{MONTHS[calMonth]} {calYear}</p>
            <button
              onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); } else { setCalMonth((m) => m + 1); } }}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Grid */}
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DAYS_HEADER.map((d) => (
                <div key={d} className="text-[11px] font-semibold text-muted-foreground py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1;
                const selected = isSelected(calYear, calMonth, d);
                return (
                  <button
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={cn(
                      "h-9 w-full rounded-lg text-sm font-medium transition-colors",
                      selected
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected days list */}
        {days.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              Dias selecionados ({days.length})
            </p>
            {days.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3"
              >
                <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={entry.label}
                    onChange={(e) => updateLabel(entry.id, e.target.value)}
                    placeholder="Rótulo do dia"
                    className="w-full text-sm bg-transparent text-foreground focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {String(entry.day).padStart(2, "0")} de {MONTHS[entry.month]} de {entry.year}
                  </p>
                </div>
                <button
                  onClick={() => removeDay(entry.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Manual add */}
        {manualForm.open ? (
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3">
            <div className="flex items-center gap-1 flex-1 flex-wrap">
              <input
                type="number" min={1} max={31} placeholder="Dia"
                value={manualForm.day}
                onChange={(e) => setManualForm((f) => ({ ...f, day: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleManualAdd()}
                className="w-12 text-sm text-center border border-border rounded-md px-1 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
              <span className="text-muted-foreground text-sm">/</span>
              <input
                type="number" min={1} max={12} placeholder="Mês"
                value={manualForm.month}
                onChange={(e) => setManualForm((f) => ({ ...f, month: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleManualAdd()}
                className="w-12 text-sm text-center border border-border rounded-md px-1 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-muted-foreground text-sm">/</span>
              <input
                type="number" min={2000} max={2099} placeholder="Ano"
                value={manualForm.year}
                onChange={(e) => setManualForm((f) => ({ ...f, year: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleManualAdd()}
                className="w-16 text-sm text-center border border-border rounded-md px-1 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button onClick={handleManualAdd}
              className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors shrink-0">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setManualForm({ open: false, day: "", month: "", year: String(calYear) })}
              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setManualForm({ open: true, day: "", month: "", year: String(calYear) })}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            <Plus className="w-4 h-4" /> Adicionar dia manualmente
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => navigate("/programs")}
            className="px-4 py-2 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            disabled={days.length === 0}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors",
              days.length > 0
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            <ClipboardList className="w-4 h-4" /> Gerar cPanel
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
