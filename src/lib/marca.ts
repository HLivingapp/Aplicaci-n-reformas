/**
 * Nombre de la app. PROVISIONAL: se está buscando el nombre definitivo.
 * Para cambiarlo basta con tocar este fichero (o la variable NEXT_PUBLIC_NOMBRE_APP).
 * La app es neutral: la usan clientes, reformistas, estudios y comunidades de cualquier empresa.
 * Human Living aparece solo como empresa destacada en su propio apartado (/human-living).
 */
export const APP = {
  nombre: process.env.NEXT_PUBLIC_NOMBRE_APP ?? "ReformaMejor",
  /** Versión corta para cabeceras en móvil */
  corto: process.env.NEXT_PUBLIC_NOMBRE_APP_CORTO ?? "RM",
  lema: "Tu reforma con precio claro",
};

/** Empresa destacada con apartado propio dentro de la app. */
export const DESTACADA = { nombre: "Human Living", ruta: "/human-living" };
