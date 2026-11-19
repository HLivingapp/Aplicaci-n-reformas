import { fecha, hoy } from "@/lib/calc";
import type { Fase } from "@/lib/types";

const dia = (iso: string) => new Date(iso + "T12:00:00").getTime() / 86400000;

/** Diagrama de barras sencillo (tipo Gantt) de las fases de una obra. */
export function Cronograma({ fases }: { fases: Fase[] }) {
  if (!fases.length) return null;
  const ini = Math.min(...fases.map((f) => dia(f.inicio)));
  const fin = Math.max(...fases.map((f) => dia(f.fin))) + 1;
  const total = Math.max(fin - ini, 1);
  const h = dia(hoy());
  const pctHoy = ((h - ini) / total) * 100;
  const color = { pendiente: "bg-stone-300", en_curso: "bg-sky-500", terminada: "bg-emerald-500" };

  return (
    <div className="relative space-y-2">
      {pctHoy >= 0 && pctHoy <= 100 && (
        <div className="pointer-events-none absolute inset-y-0 z-10 border-l-2 border-dashed border-red-400" style={{ left: `calc(7rem + (100% - 7rem) * ${pctHoy / 100})` }} title="Hoy" />
      )}
      {fases.map((f) => {
        const l = ((dia(f.inicio) - ini) / total) * 100;
        const w = ((dia(f.fin) + 1 - dia(f.inicio)) / total) * 100;
        return (
          <div key={f.id} className="flex items-center gap-2 text-xs">
            <div className="w-28 shrink-0 truncate text-stone-600">{f.nombre}</div>
            <div className="relative h-5 flex-1 rounded bg-stone-100">
              <div className={`absolute h-5 rounded ${color[f.estado]}`} style={{ left: `${l}%`, width: `${Math.max(w, 1)}%` }} title={`${fecha(f.inicio)} – ${fecha(f.fin)}`} />
            </div>
          </div>
        );
      })}
      <div className="flex justify-between pl-30 text-[11px] text-stone-400">
        <span>{fecha(fases.reduce((m, f) => (f.inicio < m ? f.inicio : m), fases[0].inicio))}</span>
        <span>{fecha(fases.reduce((m, f) => (f.fin > m ? f.fin : m), fases[0].fin))}</span>
      </div>
    </div>
  );
}
