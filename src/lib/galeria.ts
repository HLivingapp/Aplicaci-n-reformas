import type { DatosReforma, FotoGaleria, Vivienda } from "./types";

export const ESTANCIAS_FOTO = [
  { valor: "cocina", texto: "Cocina" },
  { valor: "bano", texto: "Baño" },
  { valor: "salon", texto: "Salón" },
  { valor: "dormitorio", texto: "Dormitorio" },
  { valor: "pasillo", texto: "Pasillo" },
  { valor: "terraza", texto: "Terraza" },
] as const;

export const ETIQUETAS_FOTO = [
  { valor: "laminado", texto: "Suelo laminado" },
  { valor: "porcelanico", texto: "Suelo porcelánico" },
  { valor: "falso_techo", texto: "Falso techo" },
  { valor: "vigas", texto: "Vigas vistas" },
  { valor: "cocina_abierta", texto: "Cocina abierta" },
  { valor: "armarios", texto: "Armarios" },
  { valor: "ducha", texto: "Ducha" },
  { valor: "banera", texto: "Bañera" },
] as const;

/** Fases a las que se puede asociar una foto de obra (mismas claves que en fases.ts). */
export const FASES_FOTO = [
  { valor: "demolicion", texto: "Protección y demolición" },
  { valor: "tabiqueria", texto: "Nueva distribución" },
  { valor: "instalaciones", texto: "Instalaciones" },
  { valor: "yesos", texto: "Yesos y recrecidos" },
  { valor: "falso_techo", texto: "Falsos techos" },
  { valor: "alicatado", texto: "Alicatado" },
  { valor: "ventanas", texto: "Ventanas" },
  { valor: "pintura", texto: "Pintura" },
  { valor: "suelo", texto: "Suelo" },
  { valor: "carpinteria", texto: "Cocina y puertas" },
  { valor: "remates", texto: "Montaje final" },
  { valor: "entrega", texto: "Entrega" },
] as const;

/** Lo que se envía al cliente: solo lo necesario para pintar la foto. */
export interface FotoPublica {
  id: string;
  url: string;
  tipo: FotoGaleria["tipo"];
  estancias: string[];
  fase?: string;
}

/** Una foto solo puede salir hacia clientes si está aprobada y revisada (sin datos de ubicación). */
export const publicable = (f: FotoGaleria) => f.aprobada && f.sinDatosUbicacion;

/** Qué estancias y rasgos interesan a este cliente según sus respuestas. */
export function interesesDe(v: Vivienda, r: DatosReforma) {
  const integral = r.alcance === "integral";
  const quiere = (e: string) => integral || r.estancias.includes(e);
  const estancias = new Set<string>();
  if (quiere("Cocina")) estancias.add("cocina");
  if (quiere("Baños")) estancias.add("bano");
  if (integral) ["salon", "dormitorio", "pasillo"].forEach((x) => estancias.add(x));
  if (integral && v.terrazas.length) estancias.add("terraza");
  const etiquetas = new Set<string>();
  if (quiere("Suelos") && (r.sueloDeseado === "laminado" || r.sueloDeseado === "porcelanico")) etiquetas.add(r.sueloDeseado);
  if (r.techoActual === "vigas_vistas") etiquetas.add("vigas");
  if (r.techoActual === "falso_techo" || r.climaDeseado === "conductos") etiquetas.add("falso_techo");
  if (v.cocinaAbierta || r.moverCocina) etiquetas.add("cocina_abierta");
  return { estancias, etiquetas };
}

/** Las fotos de reformas terminadas que más se parecen a lo que pide el cliente, variadas por estancia. */
export function fotosParecidas(fotos: FotoGaleria[], v: Vivienda, r: DatosReforma, max = 8): FotoGaleria[] {
  const { estancias, etiquetas } = interesesDe(v, r);
  const puntuadas = fotos
    .filter((f) => publicable(f) && f.tipo === "resultado")
    .map((f) => ({
      f,
      p: f.estancias.filter((e) => estancias.has(e)).length * 2 + f.etiquetas.filter((e) => etiquetas.has(e)).length * 3,
    }))
    .filter((x) => x.p > 0)
    .sort((a, b) => b.p - a.p || a.f.id.localeCompare(b.f.id));
  // Como mucho 3 por estancia principal, para que salga variado
  const porEstancia = new Map<string, number>();
  const elegidas: FotoGaleria[] = [];
  for (const { f } of puntuadas) {
    const e = f.estancias[0] ?? "otra";
    if ((porEstancia.get(e) ?? 0) >= 3) continue;
    porEstancia.set(e, (porEstancia.get(e) ?? 0) + 1);
    elegidas.push(f);
    if (elegidas.length >= max) break;
  }
  return elegidas;
}

/** Una foto de obra por fase (la primera aprobada), para ilustrar el plan de obra. */
export function fotosDeFases(fotos: FotoGaleria[], claves: string[]): FotoGaleria[] {
  const res: FotoGaleria[] = [];
  for (const c of new Set(claves)) {
    const f = fotos.find((x) => publicable(x) && x.fase === c);
    if (f) res.push(f);
  }
  return res;
}

export interface GaleriaCliente {
  parecidas: FotoPublica[];
  fases: FotoPublica[];
}

/** Versión sin servidor (modo demostración): la ruta ya es la imagen. */
export function galeriaLocal(fotos: FotoGaleria[], v: Vivienda, r: DatosReforma, claves: string[]): GaleriaCliente {
  const pub = (f: FotoGaleria): FotoPublica => ({ id: f.id, url: f.ruta, tipo: f.tipo, estancias: f.estancias, fase: f.fase });
  return { parecidas: fotosParecidas(fotos, v, r).map(pub), fases: fotosDeFases(fotos, claves).map(pub) };
}

/**
 * Vuelve a dibujar la imagen en un canvas y la exporta como JPEG: así se pierden
 * los metadatos EXIF (GPS, cámara, fecha) y se reduce el tamaño.
 */
export async function reencodar(archivo: File, lado = 1600, calidad = 0.82): Promise<Blob> {
  const bmp = await createImageBitmap(archivo);
  const k = Math.min(1, lado / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  return new Promise((ok, mal) => c.toBlob((b) => (b ? ok(b) : mal(new Error("No se pudo procesar la imagen"))), "image/jpeg", calidad));
}

/** { clave de fase: url } para VistaFases. */
export const fotosPorFase = (g: GaleriaCliente | null) => Object.fromEntries((g?.fases ?? []).map((f) => [f.fase!, f.url]));
