import "server-only";
import { estimar } from "../estimacion";
import { planificarFases } from "../fases";
import { fotosDeFases, fotosParecidas, type FotoPublica } from "../galeria";
import type { Datos, DatosReforma, FotoGaleria, Vivienda } from "../types";
import { db } from "./repo";

/** Enlaces firmados de 1 hora: el bucket es privado y las fotos nunca son públicas. */
async function firmar(fotos: FotoGaleria[]): Promise<FotoPublica[]> {
  if (!fotos.length) return [];
  const { data, error } = await db().storage.from("galeria").createSignedUrls(fotos.map((f) => f.ruta), 3600);
  if (error) throw error;
  const url = new Map(data.map((x) => [x.path, x.signedUrl]));
  return fotos.flatMap((f) => {
    const u = url.get(f.ruta);
    return u ? [{ id: f.id, url: u, tipo: f.tipo, estancias: f.estancias, fase: f.fase }] : [];
  });
}

export async function galeriaPara(d: Datos, v: Vivienda, r: DatosReforma) {
  const claves = planificarFases(estimar(v, r, d.tarifas), v, r).fases.map((f) => f.clave);
  const [parecidas, fases] = await Promise.all([firmar(fotosParecidas(d.fotos, v, r)), firmar(fotosDeFases(d.fotos, claves))]);
  return { parecidas, fases };
}
