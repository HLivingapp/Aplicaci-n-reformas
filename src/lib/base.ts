/** Prefijo cuando la app se publica en una subcarpeta (versión estática de demostración). */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Ruta de un archivo de /public teniendo en cuenta el prefijo. */
export const publico = (p: string) => `${BASE}${p}`;
