import { guiaPara, PRIORIDADES, REGLAS_GUIA, type EstanciaGuia } from "@/lib/guia-eleccion";

/** Guía visual: qué materiales se eligen en una reforma y en qué orden. */
export function GuiaEleccion({ estancia = "vivienda", titulo }: { estancia?: EstanciaGuia; titulo?: string }) {
  const pasos = guiaPara(estancia);
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
      <h2 className="text-lg font-semibold tracking-tight">{titulo ?? "Qué se elige en una reforma, y en qué orden"}</h2>
      <p className="mt-1 text-sm text-stone-600">Cuando termina la demolición todo tiene que estar elegido. Este es el orden en que la obra necesita cada decisión.</p>
      <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
        {REGLAS_GUIA.map((r, i) => (
          <li key={r} className="rounded-xl bg-teal-50 p-3 text-teal-950"><span className="font-semibold">{i + 1}.</span> {r}</li>
        ))}
      </ul>
      <ol className="mt-4 space-y-2">
        {pasos.map((p, i) => (
          <li key={p.id}>
            <details className="group rounded-xl border border-stone-200 p-3 open:bg-stone-50">
              <summary className="flex cursor-pointer list-none items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-white">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium leading-snug">{p.titulo}</span>
                  <span className="block text-xs text-stone-500">{p.cuando === PRIORIDADES[p.prioridad] ? p.cuando : `${PRIORIDADES[p.prioridad]} · ${p.cuando}`}</span>
                </span>
                <span className="text-stone-400 transition group-open:rotate-90">›</span>
              </summary>
              <div className="mt-3 grid gap-3 pl-10 text-sm sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Qué eliges</div>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-stone-700">{p.elige.map((x) => <li key={x}>{x}</li>)}</ul>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Ten en cuenta</div>
                  <ul className="mt-1 space-y-1 text-stone-700">{p.consejos.map((x) => <li key={x}>💡 {x}</li>)}</ul>
                  {p.donde && <p className="mt-2 text-xs text-stone-500">Dónde: {p.donde}</p>}
                </div>
              </div>
            </details>
          </li>
        ))}
      </ol>
    </section>
  );
}
