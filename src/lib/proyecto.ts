import { TIPOS_VIA } from "./catastro/provincias";
import type { DatosReforma, Direccion, Vivienda } from "./types";

export const ESTANCIAS = [
  "Cocina", "Baños", "Suelos", "Ventanas", "Puertas", "Electricidad", "Fontanería",
  "Calefacción / aire acondicionado", "Pintura", "Cambio de distribución",
];

export const CALIDADES = [
  { valor: "basica", texto: "Básica", detalle: "Buenos materiales a buen precio" },
  { valor: "media", texto: "Media", detalle: "Lo más habitual: calidad y diseño equilibrados" },
  { valor: "alta", texto: "Alta", detalle: "Materiales y acabados premium" },
] as const;

export const RANGOS_PRESUPUESTO = ["Menos de 15.000 €", "15.000 – 30.000 €", "30.000 – 60.000 €", "60.000 – 100.000 €", "Más de 100.000 €", "Aún no lo sé"];
export const PLAZOS = ["Lo antes posible", "En 1-3 meses", "En 3-6 meses", "Más adelante / solo estoy informándome"];

export const direccionVacia = (): Direccion => ({
  tipoVia: "CL", calle: "", numero: "", escalera: "", planta: "", puerta: "", codigoPostal: "", municipio: "MADRID", provincia: "MADRID",
});

export const viviendaVacia = (): Vivienda => ({
  direccion: direccionVacia(),
  m2: null,
  anoConstruccion: null,
  tipo: "piso",
  planta: null,
  ascensor: null,
  terrazas: [],
  dormitorios: 2,
  banos: 1,
  cocinaAbierta: false,
});

export const reformaVacia = (dormitorios = 2, banos = 1): DatosReforma => ({
  alcance: "integral",
  estancias: [],
  dormitoriosDeseados: dormitorios,
  banosDeseados: banos,
  moverCocina: false,
  cambiarVentanas: null,
  sueloDeseado: "laminado",
  techoActual: null,
  sueloActual: null,
  climaActual: null,
  climaDeseado: null,
  acsActual: null,
  acsDeseado: null,
  fontaneria: { accion: "cambiar", ano: null },
  electricidad: { accion: "cambiar", ano: null },
  calidad: "media",
  presupuestoCliente: "",
  cuando: "",
  viviraEnObra: null,
  comentarios: "",
});

export const TECHOS = [
  { valor: "falso_techo", texto: "Falso techo", detalle: "Techo de escayola o pladur bajado" },
  { valor: "yeso", texto: "Techo de yeso", detalle: "Liso, sin falso techo" },
  { valor: "vigas_vistas", texto: "Vigas vistas", detalle: "Se ven las vigas de madera o hierro" },
] as const;

export const SUELOS = [
  { valor: "tarima", texto: "Tarima o parquet", detalle: "Madera o laminado" },
  { valor: "porcelanico", texto: "Porcelánico o cerámico", detalle: "Baldosa" },
  { valor: "terrazo", texto: "Terrazo", detalle: "Baldosa de piedra pulida antigua" },
  { valor: "otro", texto: "Otro / no lo sé" },
] as const;

export const CLIMAS = [
  { valor: "ninguna", texto: "Nada" },
  { valor: "split", texto: "Aire acondicionado (splits)" },
  { valor: "conductos", texto: "Aire por conductos" },
  { valor: "radiadores_gas", texto: "Radiadores con caldera" },
  { valor: "radiadores_electricos", texto: "Radiadores eléctricos" },
  { valor: "suelo_radiante", texto: "Suelo radiante" },
  { valor: "aerotermia", texto: "Aerotermia" },
] as const;

export const ACS = [
  { valor: "caldera_gas", texto: "Caldera de gas" },
  { valor: "termo_electrico", texto: "Termo eléctrico" },
  { valor: "aerotermia", texto: "Aerotermia" },
  { valor: "central", texto: "Central del edificio" },
] as const;

export const textoDe = <T extends string>(lista: readonly { valor: T; texto: string }[], v: T | null | undefined) =>
  lista.find((x) => x.valor === v)?.texto ?? "—";

/** "3", "3º", "03" → 3; "BJ", "BAJO" → 0; otro → null */
export function plantaANumero(p: string): number | null {
  const s = p.trim().toUpperCase();
  if (!s) return null;
  if (/^(BJ|BAJO|B|00|0)$/.test(s)) return 0;
  const m = s.match(/^-?\d+/);
  return m ? parseInt(m[0], 10) : null;
}

export function textoDireccion(d: Direccion) {
  const via = TIPOS_VIA.find((t) => t.sigla === d.tipoVia)?.texto ?? "";
  const interior = [d.escalera && `esc. ${d.escalera}`, d.planta && `${d.planta}º`, d.puerta].filter(Boolean).join(" ");
  return [`${via} ${d.calle} ${d.numero}`.trim(), interior, [d.codigoPostal, d.municipio].filter(Boolean).join(" "), d.provincia]
    .filter(Boolean)
    .join(", ");
}

export const textoPlanta = (n: number | null) => (n == null ? "—" : n === 0 ? "Bajo" : n < 0 ? "Sótano" : `${n}ª planta`);
