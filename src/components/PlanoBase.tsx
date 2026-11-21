"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TipoTerraza } from "@/lib/types";

interface Props {
  m2: number | null;
  dormitorios: number;
  banos: number;
  cocinaAbierta: boolean;
  terrazas: TipoTerraza[];
}

type Tipo = "dia" | "noche" | "agua" | "paso" | "terraza-abierta" | "terraza-cerrada";

interface Rect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  nombre: string;
  tipo: Tipo;
}

const RELLENO: Record<Tipo, string> = {
  dia: "#fef3c7",
  noche: "#e0f2fe",
  agua: "#ccfbf1",
  paso: "#f5f5f4",
  "terraza-abierta": "#ecfccb",
  "terraza-cerrada": "#d9f99d",
};

/**
 * Mínimos de las Normas Urbanísticas de Madrid para cada pieza de la vivienda (modificación de 2023):
 * superficie útil y diámetro del círculo que se puede inscribir. Orientativo: lo confirma el técnico.
 */
interface Minimo {
  norma: string;
  m2: number;
  /** Círculo inscrito: en un rectángulo, el lado más corto */
  diametro?: number;
}
export const VIVIENDA_MINIMA_M2 = 40;

export function minimoDe(r: Pick<Rect, "nombre">): Minimo | null {
  const n = r.nombre.toLowerCase();
  if (n.startsWith("salón-cocina")) return { norma: "Estancia-comedor (14 m², círculo de 3 m) más cocina (7 m²)", m2: 21, diametro: 3 };
  if (n.startsWith("salón")) return { norma: "Estancia-comedor", m2: 14, diametro: 3 };
  if (n.startsWith("cocina")) return { norma: "Cocina", m2: 7, diametro: 1.6 };
  if (n.startsWith("dormitorio principal")) return { norma: "Dormitorio principal", m2: 12, diametro: 2.7 };
  if (n.startsWith("dormitorio")) return { norma: "Dormitorio adicional", m2: 7, diametro: 2 };
  if (n.startsWith("baño")) return { norma: "Baño (ducha o bañera, inodoro y lavabo)", m2: 3 };
  if (n.startsWith("vestíbulo")) return { norma: "Vestíbulo", m2: 2 };
  return null;
}

export function cumple(r: Rect) {
  const m = minimoDe(r);
  if (!m) return { m, ok: true, fallos: [] as string[] };
  const fallos: string[] = [];
  const area = r.w * r.h;
  if (area + 0.005 < m.m2) fallos.push(`le faltan ${(m.m2 - area).toFixed(1).replace(".", ",")} m²`);
  if (m.diametro && Math.min(r.w, r.h) + 0.005 < m.diametro) fallos.push(`el lado corto debe medir al menos ${m.diametro.toString().replace(".", ",")} m`);
  return { m, ok: !fallos.length, fallos };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Distribución orientativa a partir de los m² y las estancias: zona de día a un lado,
 * pasillo y zona de noche al otro. Intenta respetar los mínimos de cada pieza.
 */
export function calcularPlano({ m2, dormitorios, banos, cocinaAbierta, terrazas }: Props) {
  const util = Math.max((m2 ?? 70) * 0.8, 25);
  const H = r1(Math.sqrt(util / 1.45));
  const W = r1(util / H);
  const pasillo = 1.1;
  const dayW = r1(Math.max(3.2, (W - pasillo) * 0.43));
  const nightW = r1(W - pasillo - dayW);
  const rects: Rect[] = [];

  const vest = 1.9;
  if (cocinaAbierta) {
    rects.push({ id: "salon", x: 0, y: 0, w: dayW, h: H, nombre: "Salón-cocina", tipo: "dia" });
  } else {
    const hc = r1(Math.max(7 / dayW, H * 0.36));
    rects.push({ id: "salon", x: 0, y: 0, w: dayW, h: r1(H - hc), nombre: "Salón-comedor", tipo: "dia" });
    rects.push({ id: "cocina", x: 0, y: r1(H - hc), w: dayW, h: hc, nombre: "Cocina", tipo: "agua" });
  }
  rects.push({ id: "vestibulo", x: dayW, y: r1(H - vest), w: pasillo, h: vest, nombre: "Vestíbulo", tipo: "paso" });
  rects.push({ id: "pasillo", x: dayW, y: 0, w: pasillo, h: r1(H - vest), nombre: "Pasillo", tipo: "paso" });

  const noche: Pick<Rect, "nombre" | "tipo">[] = [];
  for (let i = 0; i < Math.max(dormitorios, 0); i++) noche.push({ nombre: i === 0 ? "Dormitorio principal" : `Dormitorio ${i + 1}`, tipo: "noche" });
  for (let i = 0; i < Math.max(banos, 0); i++) noche.push({ nombre: banos > 1 ? `Baño ${i + 1}` : "Baño", tipo: "agua" });
  if (!noche.some((x) => x.tipo === "noche")) noche.unshift({ nombre: "Estudio", tipo: "noche" });

  // Dormitorios en filas (el principal solo; el resto de dos en dos si son muchos) y baños juntos
  const dorms = noche.filter((x) => x.tipo === "noche");
  const banosN = noche.filter((x) => x.tipo === "agua");
  const filasNoche: Pick<Rect, "nombre" | "tipo">[][] = [[dorms[0]]];
  const otros = dorms.slice(1);
  const porFila = otros.length > 2 ? 2 : 1;
  for (let i = 0; i < otros.length; i += porFila) filasNoche.push(otros.slice(i, i + porFila));
  for (let i = 0; i < banosN.length; i += 2) filasNoche.push(banosN.slice(i, i + 2));
  // Peso de cada fila según la superficie que necesita (un poco por encima del mínimo)
  const peso = (fila: Pick<Rect, "nombre" | "tipo">[]) =>
    fila[0].tipo === "agua" ? 4.5 * fila.length : fila[0].nombre === "Dormitorio principal" ? 12.6 : 9.5 * fila.length;
  const totalPeso = filasNoche.reduce((a, fila) => a + peso(fila), 0);
  let y = 0;
  filasNoche.forEach((fila, f) => {
    const h = f === filasNoche.length - 1 ? r1(H - y) : r1((H * peso(fila)) / totalPeso);
    fila.forEach((r, c) => {
      const w = r1(nightW / fila.length);
      rects.push({ id: `n${f}-${c}`, x: r1(dayW + pasillo + c * w), y, w, h, ...r });
    });
    y = r1(y + h);
  });

  const fondoTerraza = 1.6;
  terrazas.forEach((t, i) => {
    const w = r1(W / terrazas.length);
    rects.push({ id: `t${i}`, x: r1(i * w), y: H, w, h: fondoTerraza, nombre: `Terraza ${t}`, tipo: t === "abierta" ? "terraza-abierta" : "terraza-cerrada" });
  });

  return { W, H: H + (terrazas.length ? fondoTerraza : 0), rects, util };
}

type Arrastre = { id: string; modo: "mover" | "tamano"; px: number; py: number; orig: Rect };

/** Plano orientativo editable: cada estancia se puede mover y cambiar de tamaño con el dedo o el ratón. */
export function PlanoBase(props: Props) {
  const { m2, dormitorios, banos, cocinaAbierta } = props;
  const terrazasClave = props.terrazas.join(",");
  const inicial = useMemo(
    () => calcularPlano({ m2, dormitorios, banos, cocinaAbierta, terrazas: terrazasClave ? (terrazasClave.split(",") as TipoTerraza[]) : [] }),
    [m2, dormitorios, banos, cocinaAbierta, terrazasClave],
  );
  const [rects, setRects] = useState<Rect[]>(inicial.rects);
  const [sel, setSel] = useState<string | null>(null);
  const [arr, setArr] = useState<Arrastre | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => setRects(inicial.rects), [inicial]);

  const pad = 0.6;
  const W = Math.max(inicial.W, ...rects.map((r) => r.x + r.w));
  const H = Math.max(inicial.H, ...rects.map((r) => r.y + r.h));
  const vb = { x: -pad, y: -pad, w: W + pad * 2, h: H + pad * 2 };

  const punto = (e: React.PointerEvent) => {
    const s = svg.current!;
    const p = s.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const m = s.getScreenCTM();
    const q = m ? p.matrixTransform(m.inverse()) : p;
    return { x: q.x, y: q.y };
  };
  const empezar = (e: React.PointerEvent, r: Rect, modo: Arrastre["modo"]) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const p = punto(e);
    setSel(r.id);
    setArr({ id: r.id, modo, px: p.x, py: p.y, orig: r });
  };
  const mover = (e: React.PointerEvent) => {
    if (!arr) return;
    const p = punto(e);
    const dx = p.x - arr.px;
    const dy = p.y - arr.py;
    const o = arr.orig;
    setRects((rs) =>
      rs.map((r) =>
        r.id !== arr.id
          ? r
          : arr.modo === "mover"
            ? { ...r, x: r1(Math.max(0, o.x + dx)), y: r1(Math.max(0, o.y + dy)) }
            : { ...r, w: r1(Math.max(0.8, o.w + dx)), h: r1(Math.max(0.8, o.h + dy)) },
      ),
    );
  };
  const soltar = () => setArr(null);

  const elegida = rects.find((r) => r.id === sel);
  const interiores = rects.filter((r) => !r.tipo.startsWith("terraza"));
  const dibujado = interiores.reduce((s, r) => s + r.w * r.h, 0);
  const fallan = interiores.filter((r) => !cumple(r).ok);
  const cambiado = rects.some((r, i) => JSON.stringify(r) !== JSON.stringify(inicial.rects[i]));
  const f = (n: number) => n.toFixed(1).replace(".", ",");
  const mango = Math.max(0.35, vb.w / 28);

  return (
    <figure className="space-y-3">
      <svg
        ref={svg}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        className="h-auto w-full touch-none select-none rounded-xl bg-white"
        role="img"
        aria-label="Plano orientativo editable"
        onPointerMove={mover}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        onPointerDown={() => setSel(null)}
      >
        <defs>
          <pattern id="cuadricula" width={1} height={1} patternUnits="userSpaceOnUse">
            <path d="M 1 0 L 0 0 0 1" fill="none" stroke="#e7e5e4" strokeWidth={0.02} />
          </pattern>
        </defs>
        <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill="url(#cuadricula)" />
        {[...rects.filter((r) => r.id !== sel), ...rects.filter((r) => r.id === sel)].map((r) => {
          const terraza = r.tipo.startsWith("terraza");
          const c = cumple(r);
          const activa = r.id === sel;
          const fs = Math.min(0.4, (r.w * 0.9) / (r.nombre.length * 0.55), r.h / 3.4);
          return (
            <g key={r.id} className="cursor-move" onPointerDown={(e) => empezar(e, r, "mover")}>
              <rect
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
                fill={RELLENO[r.tipo]}
                fillOpacity={0.92}
                stroke={!c.ok ? "#d97706" : activa ? "#0f766e" : "#44403c"}
                strokeWidth={terraza ? 0.05 : activa ? 0.14 : 0.12}
                strokeDasharray={r.tipo === "terraza-abierta" ? "0.2 0.15" : undefined}
              />
              <text x={r.x + r.w / 2} y={r.y + r.h / 2 - fs * 0.2} textAnchor="middle" fontSize={fs} fill="#292524" fontWeight={600} pointerEvents="none">
                {r.nombre}
              </text>
              <text x={r.x + r.w / 2} y={r.y + r.h / 2 + fs * 1.1} textAnchor="middle" fontSize={fs * 0.85} fill={c.ok ? "#57534e" : "#b45309"} pointerEvents="none">
                {f(r.w * r.h)} m²{c.ok ? "" : " ⚠"}
              </text>
              {activa && (
                <>
                  <text x={r.x + r.w / 2} y={r.y - 0.12} textAnchor="middle" fontSize={0.3} fill="#0f766e" pointerEvents="none">{f(r.w)} m</text>
                  <text x={r.x + r.w + 0.12} y={r.y + r.h / 2} fontSize={0.3} fill="#0f766e" pointerEvents="none">{f(r.h)} m</text>
                  <circle cx={r.x + r.w} cy={r.y + r.h} r={mango} fill="#0f766e" stroke="white" strokeWidth={0.06} className="cursor-nwse-resize" onPointerDown={(e) => empezar(e, r, "tamano")} />
                </>
              )}
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
        <span>Toca una estancia para verla. Arrástrala para moverla y usa el punto verde para cambiar su tamaño.</span>
        {cambiado && <button onClick={() => { setRects(inicial.rects); setSel(null); }} className="rounded-full border border-stone-300 px-2.5 py-1 text-stone-700">Volver al plano inicial</button>}
      </div>

      {elegida ? (
        <FichaEstancia r={elegida} alRenombrar={(nombre) => setRects((rs) => rs.map((x) => (x.id === elegida.id ? { ...x, nombre } : x)))} />
      ) : (
        <div className={`rounded-xl p-3 text-sm ${fallan.length ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-900"}`}>
          {fallan.length
            ? `Aviso: ${fallan.length === 1 ? "una estancia no llega" : `${fallan.length} estancias no llegan`} a los mínimos de las normas urbanísticas de Madrid (${fallan.map((r) => r.nombre).join(", ")}). No te limita: tócala para ver qué le falta. Un dormitorio pequeño puede quedarse como estudio, y el arquitecto lo ajusta con la normativa.`
            : "Todas las estancias cumplen los mínimos de superficie de las normas urbanísticas de Madrid."}
        </div>
      )}

      <figcaption className="text-xs text-stone-500">
        Plano orientativo, no a escala de obra: {f(dibujado)} m² dibujados de unos {Math.round(inicial.util)} m² útiles.
        {inicial.util < VIVIENDA_MINIMA_M2 ? ` Ojo: la vivienda mínima en Madrid es de ${VIVIENDA_MINIMA_M2} m² útiles.` : ""} Mínimos según la modificación de 2023 de las Normas Urbanísticas de Madrid; los confirma el técnico en la visita.
      </figcaption>
    </figure>
  );
}

function FichaEstancia({ r, alRenombrar }: { r: Rect; alRenombrar: (nombre: string) => void }) {
  const c = cumple(r);
  const f = (n: number) => n.toFixed(1).replace(".", ",");
  const dormitorio = r.nombre.toLowerCase().startsWith("dormitorio");
  return (
    <div className={`rounded-xl border p-3 text-sm ${c.ok ? "border-stone-200 bg-stone-50" : "border-amber-200 bg-amber-50"}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold">{r.nombre}</span>
        <span className="text-stone-600">{f(r.w)} × {f(r.h)} m · {f(r.w * r.h)} m²</span>
      </div>
      {c.m ? (
        <>
          <p className="mt-1 text-stone-600">
            Normativa ({c.m.norma}): mínimo {c.m.m2.toString().replace(".", ",")} m²
            {c.m.diametro ? ` y que quepa un círculo de ${c.m.diametro.toString().replace(".", ",")} m de diámetro` : ""}.
          </p>
          {c.ok ? (
            <p className="mt-1 font-medium text-emerald-700">✓ Cumple</p>
          ) : (
            <>
              <p className="mt-1 font-medium text-amber-800">Aviso: {c.fallos.join(" y ")}. Es orientativo; el arquitecto lo ajusta con la normativa.</p>
              {dormitorio && (
                <button onClick={() => alRenombrar(r.nombre.startsWith("Dormitorio principal") ? "Estudio" : r.nombre.replace(/^Dormitorio/, "Estudio"))} className="mt-2 rounded-full border border-amber-400 bg-white px-3 py-1 text-xs font-medium text-amber-900">
                  Si no da para dormitorio, llámalo estudio
                </button>
              )}
            </>
          )}
        </>
      ) : (
        <p className="mt-1 text-stone-600">
          {r.tipo.startsWith("terraza") ? "Las terrazas no tienen superficie mínima." : r.nombre.startsWith("Estudio") ? "Estudio o segunda estancia: sin mínimos de dormitorio." : "Zona de paso: sin superficie mínima en el programa de vivienda."}
        </p>
      )}
    </div>
  );
}
