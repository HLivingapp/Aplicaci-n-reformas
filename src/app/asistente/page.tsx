"use client";

import { useEffect, useRef, useState } from "react";
import { CabeceraPublica } from "@/components/CabeceraPublica";
import { Muro } from "@/components/Muro";
import type { RespuestaIA } from "@/lib/foro";
import { conBaseDeDatos } from "@/lib/modo";
import { incluye, useSuscripcion } from "@/lib/suscripcion";

type Turno = { rol: "usuario" | "asistente"; texto: string; fuentes?: RespuestaIA["fuentes"] };

const conServidor = conBaseDeDatos && process.env.NEXT_PUBLIC_ESTATICA !== "1";
const CLAVE = "app-reformas:asistente";

const SUGERENCIAS = [
  "¿Necesito licencia para tirar un tabique en Madrid?",
  "Me piden 95.000 € por reformar 80 m², ¿es caro?",
  "¿Qué debe incluir el presupuesto de un baño?",
  "Sale humedad en la pared del baño nuevo, ¿qué hago?",
  "¿Aerotermia o caldera de condensación para 90 m²?",
];

const CTE = { titulo: "Código Técnico de la Edificación", url: "https://www.codigotecnico.org" };
const ORDENANZA = { titulo: "Ordenanza de Licencias y Declaraciones Responsables Urbanísticas (Madrid, 2022)", url: "https://sede.madrid.es" };
const AVISO = "\n\nEs una orientación: un profesional homologado o el Ayuntamiento deben confirmarlo en tu caso.";

/** Respuestas de ejemplo para la demo (sin conexión a la IA). */
function respuestaDemo(p: string): Turno {
  const q = p.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (/licencia|declaracion|permiso|ayuntamiento|icio|tabique|terraza|legal/.test(q))
    return { rol: "asistente", fuentes: [ORDENANZA], texto: "En la ciudad de Madrid, una reforma interior que no toca estructura ni fachada se tramita con declaración responsable: la presentas y puedes empezar sin esperar.\n\n• Tabiques que no son de carga: declaración responsable.\n• Muros de carga, cambios de fachada en edificios protegidos o cambio de uso: licencia, con proyecto de un técnico.\n• Al presentarla pagas el ICIO (alrededor del 4 % del presupuesto de ejecución) y la tasa.\n• Si cambias ventanas con otro aspecto, cierras la terraza o pones la máquina del aire en fachada, necesitas también el acuerdo de la comunidad de vecinos.\n\nAntes de tirar un tabique dudoso, que lo revise un arquitecto o aparejador." + AVISO };
  if (/presupuesto|caro|precio|€|euros|oferta/.test(q))
    return { rol: "asistente", fuentes: [], texto: "Para saber si es caro, compáralo partida a partida con tu presupuesto de referencia de la app (en Madrid, una reforma integral de calidad media ronda los 1.100 €/m² construido sin IVA).\n\nRevisa sobre todo:\n• Que estén todas las partidas: demolición, instalaciones nuevas (no adaptadas), falsos techos, carpintería, limpieza y tasas.\n• Las mediciones: m² de suelo, de alicatado y número de puntos de luz y agua.\n• Las marcas y modelos de equipos (aerotermia, caldera, ventanas) «o similar».\n• Qué no incluye, el IVA aplicado (10 % en vivienda) y los hitos de pago.\n\nSi una oferta está más de un 15 % por debajo de la referencia, pregunta qué se ha quitado." + AVISO };
  if (/humedad|moho|gotera|filtra|condensa/.test(q))
    return { rol: "asistente", fuentes: [CTE], texto: "Primero hay que distinguir el tipo de humedad:\n• Condensación: manchas negras en esquinas y techos, sobre todo en invierno. Se arregla ventilando (extractor en el baño) y aislando.\n• Filtración por instalación: mancha que crece cerca de la ducha o tuberías. Suele ser una junta o un sellado; en obra reciente entra en la garantía.\n• Capilaridad: en plantas bajas, desde el suelo hacia arriba.\n\nHaz fotos con fecha, avisa por escrito al reformista y pide que localice la causa antes de reparar. El Código Técnico (DB HS, salubridad) fija la ventilación mínima de baños y cocinas." + AVISO };
  if (/aerotermia|caldera|calefaccion|radiador|suelo radiante|bomba de calor/.test(q))
    return { rol: "asistente", fuentes: [CTE], texto: "Para unos 90 m² en Madrid:\n• Aerotermia: unos 8 kW, consumo bajo y también da frío si va con suelo radiante o fancoils. Funciona mejor con suelo radiante o radiadores de baja temperatura. Más inversión inicial, pero sin gas y con ayudas a la eficiencia.\n• Caldera de condensación: unos 24-28 kW, más barata de instalar y aprovecha los radiadores actuales.\n\nSi haces reforma integral y vas a levantar suelos, la aerotermia con suelo radiante suele compensar. Pide el cálculo de cargas y la etiqueta energética de la máquina." + AVISO };
  return { rol: "asistente", fuentes: [], texto: "Te ayudo con mucho gusto. Para darte una respuesta útil, cuéntame:\n• Qué tipo de obra haces (integral, baño, cocina…) y los m² aproximados.\n• En qué fase estás: buscando presupuesto, ya contratado o en obra.\n• Qué te preocupa en concreto: precio, plazos, un problema técnico o un trámite.\n\nTambién puedes pegar aquí el presupuesto que te han dado y te digo qué revisar." + AVISO };
}

export default function Asistente() {
  const s = useSuscripcion();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setTurnos(JSON.parse(sessionStorage.getItem(CLAVE) ?? "[]"));
    } catch {
      /* sin almacenamiento */
    }
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(turnos));
    } catch {
      /* sin almacenamiento */
    }
    fin.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turnos]);

  const pro = s ? incluye(s.plan, "pro") : false;

  const preguntar = async (pregunta: string) => {
    const q = pregunta.trim();
    if (!q || cargando) return;
    const historial: Turno[] = [...turnos, { rol: "usuario", texto: q }];
    setTurnos(historial);
    setTexto("");
    setError(null);
    setCargando(true);
    try {
      if (conServidor) {
        const r = await fetch("/api/asistente", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ historial: historial.map(({ rol, texto }) => ({ rol, texto })) }) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? "No se ha podido responder");
        setTurnos([...historial, { rol: "asistente", texto: j.respuesta.texto, fuentes: j.respuesta.fuentes }]);
      } else {
        await new Promise((res) => setTimeout(res, 1000));
        setTurnos([...historial, respuestaDemo(q)]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se ha podido responder");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-stone-50">
      <CabeceraPublica />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-6 pt-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">🤖 Asistente IA de obra</h1>
          <span className="rounded-full bg-indigo-700 px-2 py-0.5 text-xs font-medium text-white">Plan Pro</span>
        </div>
        <p className="mt-1 text-sm text-stone-600">Revisa presupuestos, te orienta en licencias y trámites en Madrid y resuelve dudas técnicas de tu obra, con fuentes oficiales.</p>

        {s === null ? null : !pro ? (
          <div className="mt-5 space-y-4">
            <Muro plan="pro" volver="/asistente" titulo="Tu asistente IA especializado en obra">
              Pregúntale lo que quieras de tu reforma, a cualquier hora. Incluye todo lo del plan Básico.
            </Muro>
            <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm opacity-80">
              <div className="text-xs font-medium text-stone-500">Ejemplo de conversación</div>
              <p className="mt-2 rounded-xl bg-stone-100 p-3">{SUGERENCIAS[1]}</p>
              <p className="mt-2 line-clamp-4 whitespace-pre-line rounded-xl bg-indigo-50 p-3">{respuestaDemo(SUGERENCIAS[1]).texto}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-5 flex-1 space-y-3">
              {turnos.length === 0 && (
                <div className="rounded-2xl border border-dashed border-indigo-200 bg-white p-4">
                  <div className="text-sm font-medium text-stone-700">Prueba a preguntar:</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {SUGERENCIAS.map((x) => (
                      <button key={x} onClick={() => preguntar(x)} className="rounded-full bg-indigo-50 px-3 py-1.5 text-left text-sm text-indigo-900 ring-1 ring-indigo-100 hover:ring-indigo-300">{x}</button>
                    ))}
                  </div>
                </div>
              )}
              {turnos.map((t, i) => (
                <div key={i} className={t.rol === "usuario" ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-stone-900 px-4 py-2.5 text-sm text-white" : "max-w-[92%] rounded-2xl rounded-bl-md border border-indigo-100 bg-white px-4 py-3 text-sm"}>
                  <p className="whitespace-pre-line leading-relaxed">{t.texto}</p>
                  {t.fuentes && t.fuentes.length > 0 && (
                    <div className="mt-2 border-t border-stone-100 pt-2 text-xs">
                      <span className="text-stone-500">Fuentes: </span>
                      {t.fuentes.map((f, j) => (
                        <a key={f.url + j} href={f.url} target="_blank" rel="noopener noreferrer nofollow" className="mr-2 text-indigo-800 underline">{f.titulo}</a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {cargando && <div className="max-w-[60%] rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm text-stone-500">Consultando…</div>}
              {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
              <div ref={fin} />
            </div>
            <form
              className="sticky bottom-3 mt-4 flex gap-2 rounded-2xl border border-stone-200 bg-white p-2 shadow-sm"
              onSubmit={(e) => {
                e.preventDefault();
                preguntar(texto);
              }}
            >
              <textarea
                value={texto}
                rows={2}
                maxLength={8000}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    preguntar(texto);
                  }
                }}
                placeholder="Escribe tu duda o pega aquí tu presupuesto…"
                className="flex-1 resize-none px-2 py-1 text-sm outline-none"
              />
              <button disabled={!texto.trim() || cargando} className="self-end rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Enviar</button>
            </form>
            <p className="mt-2 text-center text-xs text-stone-400">Respuestas orientativas generadas por IA. No escribas datos personales.{!conServidor && " En la demo las respuestas son de ejemplo."}</p>
          </>
        )}
      </main>
    </div>
  );
}
