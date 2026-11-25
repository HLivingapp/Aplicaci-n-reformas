import Link from "next/link";
import { PRECIO_ACCESO } from "@/lib/comercializacion";

/** Ejemplo de la comparativa que ve el cliente: reformistas de una zona con su precio para la misma casa (borroso hasta pagar el acceso). */
const MEDIO = 92400;
const FILAS = [
  { codigo: "R-14", precio: 86900, ratio: 6, opiniones: 23, responde: "< 1 h" },
  { codigo: "R-07", precio: 91300, ratio: 8, opiniones: 41, responde: "2 h" },
  { codigo: "R-22", precio: 98800, ratio: 11, opiniones: 12, responde: "5 h" },
];
const eur = (n: number) => `${n.toLocaleString("es-ES")} €`;

export function ComparativaEjemplo({ empezar }: { empezar: string }) {
  return (
    <section className="bg-stone-100" data-comparativa-ejemplo>
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Lo que vas a ver</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">El precio de cada reformista para tu casa, uno al lado del otro</h2>
          <p className="mt-4 text-lg text-stone-600">Los reformistas homologados han cargado sus tarifas. La app calcula con ellas tu reforma, partida a partida, y te los ordena. Sin pedir presupuestos uno a uno ni esperar semanas.</p>
          <ul className="mt-5 space-y-2 text-stone-700">
            {["Gratis: cuántos hay en tu zona y el precio medio", `Por ${PRECIO_ACCESO} una vez: quién es cada uno, su precio, chat y citas`, "Ordena por precio, opiniones o lo rápido que responden"].map((x) => (
              <li key={x} className="flex gap-2"><span className="text-teal-700">✓</span>{x}</li>
            ))}
          </ul>
          <Link href={empezar} className="mt-6 inline-block rounded-xl bg-teal-700 px-6 py-3.5 font-semibold text-white hover:bg-teal-800">Ver los de mi zona</Link>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-stone-200">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="text-sm text-stone-500">Ejemplo · Piso de 80 m² en Chamberí · calidad media</div>
            <div className="text-sm"><span className="text-stone-500">Medio de la zona </span><b>{eur(MEDIO)}</b></div>
          </div>
          <div className="mt-3 flex gap-1.5 text-xs">
            {["Precio", "Opiniones", "Responde antes"].map((x, i) => (
              <span key={x} className={`rounded-full px-2.5 py-1 ${i === 0 ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600"}`}>{x}</span>
            ))}
          </div>
          <ul className="mt-3 divide-y divide-stone-100">
            {FILAS.map((f, i) => {
              const dif = Math.round(((f.precio - MEDIO) / MEDIO) * 100);
              return (
                <li key={f.codigo} className="flex items-center gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 font-semibold text-teal-800">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">Reformista {f.codigo} <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">✓ Homologado</span></div>
                    <div className="text-xs text-stone-500">{f.opiniones} opiniones · responde en {f.responde}{f.ratio <= 10 ? ` · vende 1 de cada ${f.ratio} visitas` : ""}</div>
                  </div>
                  <div className="text-right">
                    <div className="select-none font-display text-xl font-semibold blur-sm">{eur(f.precio)}</div>
                    <div className={`text-xs font-medium ${dif < 0 ? "text-emerald-700" : "text-stone-500"}`}>{dif > 0 ? "+" : ""}{dif} % vs. medio</div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-2 rounded-xl bg-teal-50 p-3 text-sm text-teal-900">🔒 Desbloquea nombres, precios, chat y citas con un pago único de {PRECIO_ACCESO}.</div>
        </div>
      </div>
    </section>
  );
}
