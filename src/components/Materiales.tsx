import { eurosRedondo as euros } from "@/lib/calc";
import type { EleccionMaterial } from "@/lib/estimacion";
import { NIVELES } from "@/lib/materiales";

const diferencia = (n: number) => (Math.abs(n) < 1 ? "Sin cambio de precio" : `${n > 0 ? "+" : "−"}${euros(Math.abs(n))}`);

/** El cliente elige el acabado de cada partida (básico, medio o premium) y ve cuánto cambia el precio. */
export function ElegirMateriales({
  materiales,
  onElegir,
  ocupado = false,
}: {
  materiales: EleccionMaterial[];
  onElegir: (grupo: string, opcion: string) => void;
  ocupado?: boolean;
}) {
  if (!materiales.length) return null;
  return (
    <div className="space-y-5">
      <p className="text-sm text-stone-600">
        Elige el nivel de cada acabado. El precio de la estimación se actualiza al momento. Después, en el presupuesto, se concretan modelos y colores contigo.
      </p>
      {materiales.map((m) => {
        const actual = m.opciones.find((o) => o.id === m.elegida)?.precio ?? 0;
        return (
          <fieldset key={m.grupo} disabled={ocupado}>
            <legend className="mb-2 text-sm font-semibold text-stone-800">{m.nombre}</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {m.opciones.map((o) => {
                const activo = o.id === m.elegida;
                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={activo}
                    onClick={() => !activo && onElegir(m.grupo, o.id)}
                    className={`flex flex-col rounded-xl border px-3 py-3 text-left text-sm transition disabled:opacity-60 ${
                      activo ? "border-teal-600 bg-teal-50 ring-2 ring-teal-600/20" : "border-stone-300 bg-white hover:border-stone-400"
                    }`}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">{NIVELES.find((n) => n.valor === o.nivel)?.texto}</span>
                    <span className={`mt-0.5 font-medium ${activo ? "text-teal-900" : "text-stone-900"}`}>{o.nombre}</span>
                    <span className="mt-1 flex-1 text-xs text-stone-500">{o.detalle}</span>
                    <span className={`mt-2 text-xs font-medium ${activo ? "text-teal-800" : "text-stone-700"}`}>
                      {activo ? (m.elegidaPorCliente ? "Elegido" : "Incluido según tu calidad") : diferencia(o.precio - actual)}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
      <p className="text-xs text-stone-400">Precios orientativos sin IVA, con las cantidades estimadas para tu vivienda.</p>
    </div>
  );
}

/** Lista de acabados elegidos, para el equipo, el presupuesto y el contrato. */
export function ResumenMateriales({ materiales }: { materiales: EleccionMaterial[] }) {
  if (!materiales.length) return null;
  return (
    <dl className="divide-y divide-stone-100 text-sm">
      {materiales.map((m) => {
        const o = m.opciones.find((x) => x.id === m.elegida);
        return (
          <div key={m.grupo} className="flex justify-between gap-3 py-1.5">
            <dt className="text-stone-600">{m.nombre}</dt>
            <dd className="text-right">
              {o?.nombre}
              <span className="ml-1 text-xs text-stone-400">
                {NIVELES.find((n) => n.valor === o?.nivel)?.texto}
                {m.elegidaPorCliente ? "" : " · por defecto"}
              </span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
