import type { FasePlan, PlanFases } from "@/lib/fases";

/** "3 días", "1 semana", "2,5 semanas" (días laborables → semanas de 5 días) */
export function textoDuracion(dias: number) {
  if (dias < 5) return dias === 1 ? "1 día" : `${dias} días`;
  const s = Math.round((dias / 5) * 2) / 2;
  return s === 1 ? "1 semana" : `${String(s).replace(".", ",")} semanas`;
}

function Bloque({ titulo, fases, total }: { titulo: string; fases: FasePlan[]; total: number }) {
  if (!fases.length) return null;
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-stone-700">{titulo}</h3>
      <ol className="space-y-3">
        {fases.map((f, i) => (
          <li key={f.clave + i} className="rounded-lg border border-stone-200 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium">{f.nombre}</span>
              <span className="shrink-0 text-xs text-stone-500">
                {textoDuracion(f.dias)}
                {f.enParalelo ? " · a la vez" : ""}
              </span>
            </div>
            <div className="relative mt-2 h-1.5 rounded bg-stone-100" aria-hidden>
              <div
                className={`absolute h-1.5 rounded ${f.momento === "antes" ? "bg-stone-400" : "bg-teal-600"}`}
                style={{ left: `${(f.inicio / total) * 100}%`, width: `${Math.max((f.dias / total) * 100, 2)}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-stone-600">{f.explicacion}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Fases de la reforma con su duración aproximada. */
export function VistaFases({ plan }: { plan: PlanFases }) {
  const antes = plan.fases.filter((f) => f.momento === "antes");
  const obra = plan.fases.filter((f) => f.momento === "obra");
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-stone-100 p-4">
        <div className="text-sm text-stone-600">Duración orientativa de la obra</div>
        <div className="text-2xl font-semibold">
          {plan.semanasMin === plan.semanasMax ? `${plan.semanasMax} semanas` : `${plan.semanasMin} – ${plan.semanasMax} semanas`}
        </div>
        <div className="text-xs text-stone-500">Antes de empezar, unas {textoDuracion(plan.diasAntes)} para diseño, permisos y pedidos.</div>
      </div>
      <Bloque titulo="Antes de empezar la obra" fases={antes} total={plan.diasAntes || 1} />
      <Bloque titulo="La obra, paso a paso" fases={obra} total={plan.diasObra || 1} />
    </div>
  );
}
