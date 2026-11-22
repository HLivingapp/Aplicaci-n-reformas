/**
 * Proveedores sin homologar: empresas que aún no están en la red, con su contacto y referencias públicas de internet
 * (ficha de empresa, web, reseñas). Solo datos públicos de empresas, nunca de particulares (RGPD).
 * Cuando uno se homologa, deja de mostrarse su contacto: pasa a la red y al flujo normal de la app.
 */
import { leerInvitaciones } from "./encargos";

export type ProveedorPublico = {
  id: string;
  nombre: string;
  oficios: string[];
  zonas: string[];
  telefono?: string;
  web?: string;
  /** Valoración pública (p. ej. reseñas de Google) */
  valoracion?: { media: number; n: number; fuente: string };
  /** Dónde se ha sacado la información */
  fuente: string;
  comprobado: string;
};

/** Demostración: empresas ficticias, con contacto de ejemplo. */
export const NO_HOMOLOGADOS_EJEMPLO: ProveedorPublico[] = [
  { id: "pub-1", nombre: "Reformas Ejemplo Centro", oficios: ["Reforma integral", "Baños"], zonas: ["Madrid"], telefono: "Teléfono de ejemplo", web: "web de ejemplo", valoracion: { media: 4.6, n: 87, fuente: "Google" }, fuente: "Ficha pública de empresa", comprobado: "2026-11-22" },
  { id: "pub-2", nombre: "Instalaciones Ejemplo Norte", oficios: ["Electricidad", "Fontanería"], zonas: ["Madrid", "Alcobendas"], telefono: "Teléfono de ejemplo", valoracion: { media: 4.3, n: 41, fuente: "Google" }, fuente: "Ficha pública de empresa", comprobado: "2026-11-22" },
  { id: "pub-3", nombre: "Carpintería Ejemplo", oficios: ["Puertas", "Armarios"], zonas: ["Madrid", "Getafe"], telefono: "Teléfono de ejemplo", web: "web de ejemplo", valoracion: { media: 4.8, n: 23, fuente: "Google" }, fuente: "Ficha pública de empresa", comprobado: "2026-11-22" },
  { id: "pub-4", nombre: "Cocinas Ejemplo Sur", oficios: ["Cocinas"], zonas: ["Málaga"], telefono: "Teléfono de ejemplo", valoracion: { media: 4.1, n: 15, fuente: "Google" }, fuente: "Ficha pública de empresa", comprobado: "2026-11-22" },
];

/** Los que ya se han homologado tras una invitación: su contacto deja de mostrarse. */
export const yaHomologados = () => new Set(leerInvitaciones().filter((i) => i.publicoId && i.encargoId).map((i) => i.publicoId as string));

export const noHomologadosEn = (zona?: string) => {
  const fuera = yaHomologados();
  return NO_HOMOLOGADOS_EJEMPLO.filter((p) => !fuera.has(p.id) && (!zona || p.zonas.some((z) => z.toLowerCase() === zona.toLowerCase())));
};

export const AVISO_NO_HOMOLOGADO =
  "No homologado: la app no ha comprobado su Registro de Empresas Acreditadas, que esté al corriente de pago ni su seguro. Los datos son públicos de internet. Si le contratas por tu cuenta, no tienes contrato en la app, pagos por fases ni el seguro de promotor.";
