import { euros } from "@/lib/calc";
import type { LineaEstimacion } from "@/lib/estimacion";
import { valorarSubpartidas } from "@/lib/subpartidas";

const num = (n: number) => n.toLocaleString("es-ES", { maximumFractionDigits: 1 });

/** Subpartidas de una partida: concepto, unidad, medición, precio medio e importe (suman el importe de la partida). */
export function SubpartidasTabla({ l, codigo }: { l: LineaEstimacion; codigo?: string }) {
  const filas = valorarSubpartidas(l);
  if (!filas.length) return null;
  return (
    <details open className="mt-2 text-xs">
      <summary className="cursor-pointer font-medium text-stone-700">Subpartidas y cómo se calcula</summary>
      <table className="mt-1 w-full table-fixed border-collapse">
        <thead>
          <tr className="border-b border-stone-200 text-[10px] uppercase tracking-wide text-stone-400">
            <th className="py-1 pr-1 text-left font-medium">Concepto</th>
            <th className="w-16 py-1 text-right font-medium">Medición</th>
            <th className="w-16 py-1 text-right font-medium">Precio</th>
            <th className="w-16 py-1 text-right font-medium">Importe</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i} className="border-b border-stone-100 align-top">
              <td className="py-1 pr-1 text-stone-700">{codigo && <span className="mr-1 font-mono text-[10px] text-stone-400">{codigo}.{i + 1}</span>}{f.concepto}</td>
              <td className="py-1 text-right tabular-nums text-stone-600">{num(f.cantidad)} {f.unidad}</td>
              <td className="py-1 text-right tabular-nums text-stone-600">{euros(f.precio)}</td>
              <td className="py-1 text-right tabular-nums font-medium">{euros(f.importe)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
