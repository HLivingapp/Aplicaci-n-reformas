"use client";

import Link from "next/link";
import { useState } from "react";
import { CabeceraPublica } from "@/components/CabeceraPublica";
import { calcularTramite, NIVELES, nivelDe, OBRAS, type NivelTramite, type Proteccion } from "@/lib/tramites";

const PROTECCION: { id: Proteccion; texto: string; icono: string }[] = [
  { id: "no", texto: "No está protegido", icono: "🏢" },
  { id: "si", texto: "Sí, está protegido", icono: "🏛️" },
  { id: "nose", texto: "No lo sé", icono: "🤷" },
];

/** Orientador visual: el cliente toca lo que va a hacer y ve al momento qué trámite necesita en Madrid. */
export default function Tramites() {
  const [elegidas, setElegidas] = useState<string[]>([]);
  const [proteccion, setProteccion] = useState<Proteccion>("no");
  const r = calcularTramite(elegidas, proteccion);
  const n = NIVELES[r.nivel];
  const alternar = (id: string) => setElegidas((x) => (x.includes(id) ? x.filter((y) => y !== id) : [...x, id]));

  return (
    <div className="min-h-dvh bg-stone-50">
      <CabeceraPublica />
      <section className="bg-gradient-to-b from-teal-50 to-stone-50">
        <div className="mx-auto max-w-6xl px-4 pb-4 pt-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Trámites en Madrid</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">¿Qué trámite necesita tu reforma?</h1>
          <p className="mt-2 max-w-2xl text-stone-600">Toca lo que vas a hacer en tu casa y te decimos al momento si necesitas declaración responsable, licencia o nada. Manda la obra más exigente.</p>
          <Escala nivel={elegidas.length ? r.nivel : null} />
        </div>
      </section>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-28 lg:grid-cols-[1fr_360px] lg:pb-16">
        <div className="min-w-0">
          <h2 className="mt-4 text-sm font-semibold text-stone-700">1. ¿Tu edificio está protegido?</h2>
          <p className="text-xs text-stone-500">Edificios catalogados, centro histórico o bien de interés cultural. Lo ves en el visor urbanístico del Ayuntamiento de Madrid o en el IBI; si dudas, pregunta en el foro.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PROTECCION.map((p) => (
              <button
                key={p.id}
                onClick={() => setProteccion(p.id)}
                aria-pressed={proteccion === p.id}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${proteccion === p.id ? "border-teal-700 bg-teal-700 text-white" : "border-stone-300 bg-white text-stone-700 hover:border-teal-600"}`}
              >
                <span className="mr-1" aria-hidden>{p.icono}</span>{p.texto}
              </button>
            ))}
          </div>

          <h2 className="mt-6 text-sm font-semibold text-stone-700">2. Toca todo lo que vas a hacer</h2>
          <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {OBRAS.map((o) => {
              const activa = elegidas.includes(o.id);
              const nv = NIVELES[nivelDe(o, proteccion)];
              return (
                <li key={o.id}>
                  <button
                    onClick={() => alternar(o.id)}
                    aria-pressed={activa}
                    className={`relative flex h-full w-full flex-col items-start rounded-2xl border-2 p-3 text-left transition ${activa ? "border-teal-600 bg-white shadow-md" : "border-transparent bg-white shadow-sm hover:border-stone-300"}`}
                  >
                    {activa && <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs text-white">✓</span>}
                    <span className="text-3xl" aria-hidden>{o.icono}</span>
                    <span className="mt-2 text-sm font-medium leading-snug text-stone-900">{o.texto}</span>
                    {activa && <span className={`mt-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${nv.cls}`}>{nv.corto}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <aside id="resultado" className="min-w-0 scroll-mt-20 lg:sticky lg:top-20 lg:self-start">
          {elegidas.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-stone-300 bg-white p-5 text-center text-sm text-stone-500">
              <div className="text-4xl" aria-hidden>👆</div>
              Toca una o varias obras y aquí verás el trámite.
            </div>
          ) : (
            <div className={`rounded-2xl border-2 p-5 ${n.borde}`}>
              <div className="text-xs font-semibold uppercase tracking-wide opacity-70">Tu reforma necesita</div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-4xl" aria-hidden>{n.icono}</span>
                <span className="font-display text-2xl font-semibold leading-tight">{n.titulo}</span>
              </div>
              <p className="mt-2 text-sm">{n.explica}</p>
              {r.decisivas.length > 0 && (
                <p className="mt-2 text-sm"><span className="font-semibold">Lo marca:</span> {r.decisivas.map((o) => o.texto.toLowerCase()).join(", ")}.</p>
              )}
              <ul className="mt-3 space-y-1.5">
                {r.detalle.map(({ obra, nivel }) => (
                  <li key={obra.id} className="rounded-xl bg-white/70 p-2 text-xs text-stone-700">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-stone-900"><span aria-hidden>{obra.icono}</span> {obra.texto}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${NIVELES[nivel].cls}`}>{NIVELES[nivel].corto}</span>
                    </div>
                    <p className="mt-0.5">{obra.porque}{!obra.confirmada && <span className="text-stone-400"> (orientativo)</span>}</p>
                  </li>
                ))}
              </ul>
              {(r.comunidad || r.extras.length > 0 || proteccion !== "no") && (
                <ul className="mt-3 space-y-1 text-xs">
                  {r.comunidad && <li>🏘️ Necesitas también el acuerdo de la comunidad de vecinos.</li>}
                  {r.extras.map((x) => <li key={x}>➕ {x}.</li>)}
                  {proteccion === "si" && <li>🏛️ En edificio protegido puede hacer falta informe de la comisión de patrimonio y respetar materiales y colores.</li>}
                  {proteccion === "nose" && <li>🏛️ Compruébalo: si el edificio está protegido, el trámite puede subir a licencia.</li>}
                </ul>
              )}
            </div>
          )}
          <p className="mt-3 rounded-xl bg-white p-3 text-xs text-stone-500">
            ⚠️ Es una orientación para la ciudad de Madrid, no un informe. El trámite exacto lo confirma el técnico con tu proyecto. Las obras marcadas como «orientativo» están pendientes de revisar por nuestro equipo técnico.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2">
            <Link href="/comunidad?legal" className="rounded-xl bg-stone-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-stone-800">🏛️ Pregunta tu caso en el foro de legalizaciones</Link>
            <Link href="/nuevo" className="rounded-xl bg-teal-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-teal-800">Calcula el precio de tu reforma</Link>
            {r.nivel === 3 && <Link href="/arquitectos" className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-center text-sm font-medium hover:bg-stone-50">Busca un arquitecto para el proyecto</Link>}
          </div>
        </aside>
      </main>

      {elegidas.length > 0 && (
        <a href="#resultado" className={`fixed inset-x-4 bottom-4 z-20 flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg lg:hidden ${n.cls}`}>
          <span><span aria-hidden>{n.icono}</span> {n.titulo}</span>
          <span aria-hidden>↓</span>
        </a>
      )}
    </div>
  );
}

/** Escalera de trámites de menos a más exigente, con el de tu reforma resaltado. */
function Escala({ nivel }: { nivel: NivelTramite | null }) {
  return (
    <ol className="mt-5 grid grid-cols-4 gap-1.5">
      {([0, 1, 2, 3] as NivelTramite[]).map((k) => {
        const x = NIVELES[k];
        const activo = nivel === k;
        return (
          <li key={k} className={`flex flex-col items-center rounded-xl px-1 py-2 text-center transition ${activo ? `${x.cls} scale-105 shadow-md` : "bg-white text-stone-500"}`}>
            <span className="text-xl" aria-hidden>{x.icono}</span>
            <span className="mt-0.5 text-[10px] font-semibold leading-tight sm:text-xs">{x.corto}</span>
          </li>
        );
      })}
    </ol>
  );
}
