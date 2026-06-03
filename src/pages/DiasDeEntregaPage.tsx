import { AppLayout } from "@/components/layout/AppLayout";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Plus, Trash2, Calendar, ClipboardList } from "lucide-react";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DayEntry {
  id: string;
  date: string;
}

function formatDeliveryDate(isoDate: string): string {
  try {
    const parsed = parseISO(isoDate);
    const day = format(parsed, "dd", { locale: ptBR });
    const month = format(parsed, "MMM", { locale: ptBR });
    const weekday = format(parsed, "EEE", { locale: ptBR });
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(".", "");
    return `${day}/${capitalize(month)} (${capitalize(weekday)})`;
  } catch {
    return isoDate;
  }
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

  const [days, setDays] = useState<DayEntry[]>([{ id: "1", date: "" }]);

  const addDay = () => {
    setDays((prev) => [...prev, { id: String(Date.now()), date: "" }]);
  };

  const removeDay = (id: string) => {
    setDays((prev) => prev.filter((d) => d.id !== id));
  };

  const updateDay = (id: string, date: string) => {
    setDays((prev) => prev.map((d) => (d.id === id ? { ...d, date } : d)));
  };

  const validDays = days.filter((d) => d.date !== "");
  const canGenerate = validDays.length > 0;

  const handleGenerate = () => {
    const deliveryDays = validDays.map((d, i) => ({
      label: `Dia ${i + 1}`,
      date: formatDeliveryDate(d.date),
    }));

    navigate("/programs/turma/cpanel", {
      state: {
        turmaName,
        programName,
        siglaTurma,
        deliveryDays,
      },
    });
  };

  return (
    <AppLayout pageTitle="Dias de Entrega" pageSubtitle={`${programName} · ${siglaTurma}`}>
      <div className="p-4 md:p-6 space-y-5 animate-fade-in max-w-2xl mx-auto">
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
                Dias de Entrega — {turmaName}
              </h1>
              <p className="text-muted-foreground text-sm">{programName} · Configurar dias de aula</p>
            </div>
          </div>
        </div>

        {/* Instruction banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <p className="text-sm text-foreground font-medium mb-1">Configure os dias de aula</p>
          <p className="text-xs text-muted-foreground">
            Adicione as datas de cada dia de aula da turma. O cPanel será gerado automaticamente com as entregas
            organizadas por dia.
          </p>
        </div>

        {/* Days list */}
        <div className="space-y-3">
          {days.map((day, index) => (
            <div
              key={day.id}
              className="flex items-center gap-3 bg-card border border-border rounded-xl p-4"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Dia {index + 1}</p>
                <input
                  type="date"
                  value={day.date}
                  onChange={(e) => updateDay(day.id, e.target.value)}
                  className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              {days.length > 1 && (
                <button
                  onClick={() => removeDay(day.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add day */}
        <button
          onClick={addDay}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
        >
          <Plus className="w-4 h-4" /> Adicionar dia
        </button>

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
            disabled={!canGenerate}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ClipboardList className="w-4 h-4" /> Gerar cPanel
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
