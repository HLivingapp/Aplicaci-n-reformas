import type { TipoTerraza } from "@/lib/types";

interface Props {
  m2: number | null;
  dormitorios: number;
  banos: number;
  cocinaAbierta: boolean;
  terrazas: TipoTerraza[];
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  nombre: string;
  tipo: "dia" | "noche" | "agua" | "paso" | "terraza-abierta" | "terraza-cerrada";
}

const RELLENO: Record<Rect["tipo"], string> = {
  dia: "#fef3c7",
  noche: "#e0f2fe",
  agua: "#ccfbf1",
  paso: "#f5f5f4",
  "terraza-abierta": "#ecfccb",
  "terraza-cerrada": "#d9f99d",
};

/**
 * Distribución esquemática a partir de los m² y las estancias.
 * No es un plano real: sirve para ubicar la conversación con el cliente antes de la visita.
 */
export function calcularPlano({ m2, dormitorios, banos, cocinaAbierta, terrazas }: Props) {
  const util = Math.max((m2 ?? 70) * 0.8, 25);
  const H = Math.sqrt(util / 1.4);
  const W = H * 1.4;
  const pasillo = 1.1;
  const dayW = (W - pasillo) * 0.48;
  const nightW = W - pasillo - dayW;
  const rects: Rect[] = [];

  if (cocinaAbierta) {
    rects.push({ x: 0, y: 0, w: dayW, h: H, nombre: "Salón-cocina", tipo: "dia" });
  } else {
    rects.push({ x: 0, y: 0, w: dayW, h: H * 0.6, nombre: "Salón-comedor", tipo: "dia" });
    rects.push({ x: 0, y: H * 0.6, w: dayW, h: H * 0.4, nombre: "Cocina", tipo: "agua" });
  }
  rects.push({ x: dayW, y: 0, w: pasillo, h: H, nombre: "Pasillo", tipo: "paso" });

  const noche: Pick<Rect, "nombre" | "tipo">[] = [];
  for (let i = 0; i < Math.max(dormitorios, 0); i++) noche.push({ nombre: i === 0 ? "Dormitorio principal" : `Dormitorio ${i + 1}`, tipo: "noche" });
  for (let i = 0; i < Math.max(banos, 0); i++) noche.push({ nombre: banos > 1 ? `Baño ${i + 1}` : "Baño", tipo: "agua" });
  if (!noche.length) noche.push({ nombre: "Estudio", tipo: "noche" });

  const cols = noche.length > 3 ? 2 : 1;
  const filas = Math.ceil(noche.length / cols);
  // Los baños ocupan media altura relativa respecto a los dormitorios
  const pesosFila = Array.from({ length: filas }, (_, f) => {
    const enFila = noche.slice(f * cols, f * cols + cols);
    return enFila.every((x) => x.tipo === "agua") ? 0.6 : 1;
  });
  const totalPeso = pesosFila.reduce((a, b) => a + b, 0);
  let y = 0;
  for (let f = 0; f < filas; f++) {
    const h = (H * pesosFila[f]) / totalPeso;
    const enFila = noche.slice(f * cols, f * cols + cols);
    enFila.forEach((r, c) => {
      const w = nightW / enFila.length;
      rects.push({ x: dayW + pasillo + c * w, y, w, h, ...r });
    });
    y += h;
  }

  const fondoTerraza = 1.6;
  terrazas.forEach((t, i) => {
    const w = W / terrazas.length;
    rects.push({ x: i * w, y: H, w, h: fondoTerraza, nombre: `Terraza ${t}`, tipo: t === "abierta" ? "terraza-abierta" : "terraza-cerrada" });
  });

  return { W, H: H + (terrazas.length ? fondoTerraza : 0), rects, util };
}

export function PlanoBase(props: Props) {
  const { W, H, rects, util } = calcularPlano(props);
  const pad = 0.4;
  return (
    <figure>
      <svg viewBox={`${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}`} className="h-auto w-full" role="img" aria-label="Plano base orientativo">
        {rects.map((r, i) => {
          const terraza = r.tipo.startsWith("terraza");
          const area = r.w * r.h;
          const fs = Math.min(0.42, (r.w * 0.9) / (r.nombre.length * 0.56), r.h / 3);
          return (
            <g key={i}>
              <rect
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
                fill={RELLENO[r.tipo]}
                stroke="#44403c"
                strokeWidth={terraza ? 0.04 : 0.1}
                strokeDasharray={r.tipo === "terraza-abierta" ? "0.2 0.15" : undefined}
              />
              {r.tipo !== "paso" && (
                <>
                  <text x={r.x + r.w / 2} y={r.y + r.h / 2} textAnchor="middle" fontSize={fs} fill="#292524" fontWeight={600}>
                    {r.nombre}
                  </text>
                  <text x={r.x + r.w / 2} y={r.y + r.h / 2 + fs * 1.3} textAnchor="middle" fontSize={fs * 0.85} fill="#78716c">
                    ≈ {area.toFixed(1)} m²
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 text-xs text-stone-500">
        Plano orientativo generado con los datos indicados (≈ {Math.round(util)} m² útiles). No es un plano a escala: lo ajustaremos en la visita.
      </figcaption>
    </figure>
  );
}
