"use client";

import Link from "next/link";
import { useState } from "react";
import { CabeceraPublica } from "@/components/CabeceraPublica";
import { calcularTramite, NIVELES, OBRAS, type NivelTramite, type Proteccion } from "@/lib/tramites";

const PROTECCION: { id: Proteccion; texto: string }[] = [
  { id: "si", texto: "Sí" },
  { id: "no", texto: "No" },
  { id: "nose", texto: "No lo sé" },
];

type Respuesta = "si" | "no";

/** Formulario: el cliente responde Sí / No a cada pregunta y la app le da al momento el trámite que necesita en Madrid. */
export default function Tramites() {
  const [resp, setResp] = useState<Record<string, Respuesta>>({});
  const [proteccion, setProteccion] = useState<Proteccion | null>(null);
  const [visto, setVisto] = useState(false);
  const elegidas = OBRAS.filter((o) => resp[o.id] === "si").map((o) => o.id);
  const r = calcularTramite(elegidas, proteccion ?? "nose");
  const n = NIVELES[r.nivel];
  const sinResponder = OBRAS.filter((o) => !resp[o.id]).length + (proteccion ? 0 : 1);
  const responder = (id: string, v: Respuesta) => setResp((x) => ({ ...x, [id]: v }));
  const verResultado = () => {
    setVisto(true);
    setTimeout(() => document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <div className="min-h-dvh bg-stone-50">
      <CabeceraPublica />
      <section className="bg-gradient-to-b from-teal-50 to-stone-50">
        <div className="mx-auto max-w-3xl px-4 pb-4 pt-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Trámites en Madrid</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">¿Qué trámite necesita tu reforma?</h1>
          <p className="mt-2 text-stone-600">Responde a las preguntas y te damos el resultado al momento: sin trámite, declaración responsable, licencia básica o proyecto y licencia. Manda la obra más exigente.</p>
          <Escala nivel={visto ? r.nivel : null} />
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 pb-16">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verResultado();
          }}
          className="rounded-2xl border border-stone-200 bg-white"
        >
          <ol className="divide-y divide-stone-100">
            <li className="p-4">
              <Pregunta num={1} texto="¿Tu edificio está protegido?" ayuda="Catalogado, en el centro histórico o bien de interés cultural. Lo ves en el visor urbanístico del Ayuntamiento de Madrid; si dudas, marca «No lo sé».">
                {PROTECCION.map((p) => (
                  <Opcion key={p.id} activa={proteccion === p.id} onClick={() => setProteccion(p.id)}>{p.texto}</Opcion>
                ))}
              </Pregunta>
            </li>
            {OBRAS.map((o, i) => (
              <li key={o.id} className="p-4">
                <Pregunta num={i + 2} texto={o.pregunta}>
                  <Opcion activa={resp[o.id] === "si"} onClick={() => responder(o.id, "si")}>Sí</Opcion>
                  <Opcion activa={resp[o.id] === "no"} onClick={() => responder(o.id, "no")}>No</Opcion>
                </Pregunta>
              </li>
            ))}
          </ol>
          <div className="border-t border-stone-200 p-4">
            {sinResponder > 0 && <p className="mb-2 text-xs text-stone-500">Te quedan {sinResponder} pregunta{sinResponder === 1 ? "" : "s"} sin responder; las que dejes en blanco cuentan como «No».</p>}
            <button type="submit" className="w-full rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800">Ver resultado</button>
          </div>
        </form>

        {visto && (
          <section id="resultado" className="mt-6 scroll-mt-20">
            {elegidas.length === 0 ? (
              <div className={`rounded-2xl border-2 p-5 ${n.borde}`}>
                <div className="text-xs font-semibold uppercase tracking-wide opacity-70">Tu reforma necesita</div>
                <div className="mt-1 flex items-center gap-2"><span className="text-4xl" aria-hidden>{n.icono}</span><span className="font-display text-2xl font-semibold">{n.titulo}</span></div>
                <p className="mt-2 text-sm">No has marcado ninguna obra que necesite trámite. {n.explica}</p>
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
                    {proteccion !== "si" && proteccion !== "no" && <li>🏛️ Comprueba si el edificio está protegido: si lo está, el trámite puede subir a licencia.</li>}
                  </ul>
                )}
              </div>
            )}
            <p className="mt-3 rounded-xl bg-white p-3 text-xs text-stone-500">
              ⚠️ Es una orientación para la ciudad de Madrid, no un informe. El trámite exacto lo confirma el técnico con tu proyecto. Las respuestas marcadas como «orientativo» están pendientes de revisar por nuestro equipo técnico.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Link href="/comunidad?legal" className="rounded-xl bg-stone-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-stone-800">🏛️ Pregunta tu caso en el foro de legalizaciones</Link>
              <Link href="/nuevo" className="rounded-xl bg-teal-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-teal-800">Calcula el precio de tu reforma</Link>
              {r.nivel === 3 && <Link href="/arquitectos" className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-center text-sm font-medium hover:bg-stone-50 sm:col-span-2">Busca un arquitecto para el proyecto</Link>}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Pregunta({ num, texto, ayuda, children }: { num: number; texto: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="flex gap-2 text-sm font-medium text-stone-900"><span className="w-6 shrink-0 text-right text-stone-400">{num}.</span><span>{texto}</span></legend>
      {ayuda && <p className="ml-8 mt-0.5 text-xs text-stone-500">{ayuda}</p>}
      <div className="ml-8 mt-2 flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Opcion({ activa, onClick, children }: { activa: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={activa} className={`min-w-16 rounded-lg border px-4 py-1.5 text-sm font-medium transition ${activa ? "border-teal-700 bg-teal-700 text-white" : "border-stone-300 bg-white text-stone-700 hover:border-teal-600"}`}>
      {children}
    </button>
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
