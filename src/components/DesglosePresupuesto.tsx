import { ALCANCE, cantidadLegible } from "@/lib/alcance";
import { euros } from "@/lib/calc";
import type { Estimacion, LineaEstimacion } from "@/lib/estimacion";
import { acabadoDe } from "@/lib/presupuesto-estimacion";

/**
 * Presupuesto desglosado al estilo de un presupuesto de obra: capítulos numerados, partidas con código,
 * medición, precio unitario, importe, qué incluye y qué no, base imponible, IVA y total.
 * Sale del mismo cálculo partida a partida que el asistente principal (sin costes internos).
 */
export function DesglosePresupuesto({ e, iva = 10, titulo = "Presupuesto desglosado" }: { e: Estimacion; iva?: number; titulo?: string }) {
  const caps: { nombre: string; lineas: LineaEstimacion[]; importe: number }[] = [];
  for (const l of e.lineas) {
    let c = caps.find((x) => x.nombre === l.capitulo);
    if (!c) caps.push((c = { nombre: l.capitulo, lineas: [], importe: 0 }));
    c.lineas.push(l);
    c.importe += l.cantidad * l.precio;
  }
  const base = caps.reduce((s, c) => s + c.importe, 0);
  const cuotaIva = base * (iva / 100);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white">
      <div className="border-b border-stone-100 p-4">
        <h2 className="font-semibold">{titulo}</h2>
        <p className="mt-1 text-xs text-stone-500">Capítulo a capítulo, con la medición, el precio unitario y el importe de cada partida. Las cantidades salen de las medidas estándar de una vivienda como la tuya; en la visita se miden de verdad.</p>
      </div>
      <ol className="divide-y divide-stone-100">
        {caps.map((c, i) => (
          <li key={c.nombre} className="p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-stone-900">{i + 1}. {c.nombre}</h3>
              <span className="shrink-0 text-sm font-semibold">{euros(c.importe)}</span>
            </div>
            <ul className="mt-2 space-y-2">
              {c.lineas.map((l, j) => {
                const a = ALCANCE[l.tarifaId];
                const acabado = acabadoDe(e, l);
                return (
                  <li key={l.tarifaId} className="rounded-xl bg-stone-50 p-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <span><span className="mr-1.5 font-mono text-xs text-stone-400">{i + 1}.{j + 1}</span><span className="font-medium text-stone-800">{l.descripcion}</span></span>
                      <span className="shrink-0 font-medium">{euros(l.cantidad * l.precio)}</span>
                    </div>
                    <div className="mt-1 text-xs text-stone-600">
                      {cantidadLegible(l.cantidad, l.unidad)} × {euros(l.precio)}{l.unidad === "pa" ? "" : `/${l.unidad}`}
                      {l.medicion ? <span className="text-stone-500"> · Medición: {l.medicion}</span> : null}
                    </div>
                    {acabado && <p className="mt-1 text-xs text-stone-700"><span className="font-medium">Acabado:</span> {acabado}</p>}
                    {l.especificacion && <p className="mt-1 text-xs text-stone-700"><span className="font-medium">Equipo de referencia:</span> {l.especificacion}</p>}
                    {(a?.incluye || a?.noIncluye) && (
                      <details className="mt-1 text-xs">
                        <summary className="cursor-pointer text-teal-800">Qué incluye y qué no</summary>
                        {a?.incluye && <p className="mt-1 text-stone-600"><span className="font-medium">Incluye:</span> {a.incluye}</p>}
                        {a?.noIncluye && <p className="mt-0.5 text-stone-500"><span className="font-medium">No incluye:</span> {a.noIncluye}</p>}
                      </details>
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
      <dl className="space-y-1 border-t border-stone-200 p-4 text-sm">
        <div className="flex justify-between"><dt className="text-stone-600">Base imponible</dt><dd>{euros(base)}</dd></div>
        <div className="flex justify-between"><dt className="text-stone-600">IVA {iva} % (reforma de vivienda)</dt><dd>{euros(cuotaIva)}</dd></div>
        <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{euros(base + cuotaIva)}</dd></div>
      </dl>
      <p className="border-t border-stone-100 px-4 py-3 text-xs text-stone-500">
        Presupuesto orientativo con medidas estándar. El precio final lo fija el reformista tras la visita, con las mediciones reales y los materiales que elijas. IVA del 10 % para reformas de la vivienda de un particular, siempre que los materiales que aporta el reformista no superen el 40 % de la base; si no, el IVA es del 21 %. No incluye licencias, tasas, proyecto ni lo indicado en «No incluye».
      </p>
    </div>
  );
}
