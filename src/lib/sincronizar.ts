import { completarTarifas } from "./tarifas";
import { datosIniciales } from "./semilla";
import type { Datos } from "./types";

export const COLECCIONES = ["clientes", "proyectos", "presupuestos", "obras", "fotos", "proveedores"] as const;
export type Coleccion = (typeof COLECCIONES)[number];
const AJUSTES = ["empresa", "tarifas", "contador"] as const;

export interface Fila {
  coleccion: Coleccion;
  id: string;
  cliente_id: string | null;
  datos: unknown;
}
export interface FilaAjuste {
  clave: string;
  datos: unknown;
}

const clienteDe = (c: Coleccion, x: { id: string; clienteId?: string }) => (c === "clientes" ? x.id : (x.clienteId ?? null));

/** Monta el objeto de datos de la app a partir de las filas de la base de datos (ordenadas de más nueva a más antigua). */
export function datosDesdeFilas(filas: Fila[], ajustes: FilaAjuste[]): Datos {
  const base = datosIniciales();
  const aj = Object.fromEntries(ajustes.map((a) => [a.clave, a.datos]));
  const de = <T>(c: Coleccion) => filas.filter((f) => f.coleccion === c).map((f) => f.datos as T);
  return {
    version: 3,
    empresa: (aj.empresa as Datos["empresa"]) ?? { ...base.empresa, nombre: "Mi empresa de reformas" },
    tarifas: completarTarifas((aj.tarifas as Datos["tarifas"]) ?? {}),
    contador: (aj.contador as number) ?? 0,
    clientes: de(COLECCIONES[0]),
    proyectos: de(COLECCIONES[1]),
    presupuestos: de(COLECCIONES[2]),
    obras: de(COLECCIONES[3]),
    fotos: de(COLECCIONES[4]),
    proveedores: de(COLECCIONES[5]),
  };
}

/** Qué hay que escribir o borrar en la base de datos para pasar de `antes` a `despues`. */
export function diferencias(antes: Datos | null, despues: Datos) {
  const upserts: Fila[] = [];
  const borrados: { coleccion: Coleccion; id: string }[] = [];
  for (const c of COLECCIONES) {
    const previos = new Map((antes?.[c] ?? []).map((x) => [x.id, JSON.stringify(x)]));
    for (const x of despues[c]) {
      if (previos.get(x.id) !== JSON.stringify(x)) upserts.push({ coleccion: c, id: x.id, cliente_id: clienteDe(c, x as { id: string; clienteId?: string }), datos: x });
      previos.delete(x.id);
    }
    for (const id of previos.keys()) borrados.push({ coleccion: c, id });
  }
  const ajustes: FilaAjuste[] = AJUSTES.filter((k) => JSON.stringify(antes?.[k]) !== JSON.stringify(despues[k])).map((k) => ({ clave: k, datos: despues[k] }));
  return { upserts, borrados, ajustes, vacio: !upserts.length && !borrados.length && !ajustes.length };
}
