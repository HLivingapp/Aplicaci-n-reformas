import { completarMateriales, materialesPorDefecto } from "./materiales";
import type { GrupoTarifa, PrecioTarifa, Tarifas } from "./types";

/**
 * Tarifario genérico de ejemplo (costes orientativos de mercado, no de ninguna empresa).
 * Cada empresa importa o edita el suyo en Ajustes → Tarifario. Los costes reales
 * NO se guardan en este repositorio, que es público.
 */
/** Recargo que se aplica a una partida: los materiales («Compras») llevan el suyo. */
export const recargoDe = (t: Pick<Tarifas, "recargoPct" | "recargoMaterialesPct">, grupo: GrupoTarifa) =>
  1 + (grupo === "Compras" ? (t.recargoMaterialesPct ?? t.recargoPct) : t.recargoPct) / 100;

export const tarifasPorDefecto = (): Tarifas => ({
  nombre: "Genérico de ejemplo",
  recargoPct: 40,
  recargoMaterialesPct: 25,
  coefUtil: 0.8,
  paramentosPorM2: 2.4,
  m2AlicatadoBano: 30,
  m2AlicatadoCocina: 8,
  puntosAguaBano: 6,
  puntosAguaCocina: 4,
  aniosMaxInstalacion: 20,
  margenRangoPct: 10,
  factorCalidad: { basica: 0.85, media: 1, alta: 1.35 },
  tramos: [
    { hastaM2: 50, cocina: 7, salon: 16, dormitorioPrincipal: 11, dormitorio: 8, bano: 3.5, pasilloPct: 8 },
    { hastaM2: 75, cocina: 9, salon: 20, dormitorioPrincipal: 12, dormitorio: 9, bano: 4, pasilloPct: 9 },
    { hastaM2: 100, cocina: 10, salon: 24, dormitorioPrincipal: 14, dormitorio: 10, bano: 4.5, pasilloPct: 10 },
    { hastaM2: 140, cocina: 12, salon: 30, dormitorioPrincipal: 16, dormitorio: 11, bano: 5, pasilloPct: 10 },
    { hastaM2: 9999, cocina: 15, salon: 38, dormitorioPrincipal: 18, dormitorio: 12, bano: 6, pasilloPct: 11 },
  ],
  precios: [
    // MANO DE OBRA (m²c = metro cuadrado construido)
    l("albanileria_base", "Mano de obra", "Demolición y albañilería", "Demolición y albañilería integral con contenedores", "m²c", 110),
    l("albanileria_redistribucion", "Mano de obra", "Demolición y albañilería", "Suplemento por redistribución de tabiquería", "m²c", 25),
    l("dem_suelo_ceramico", "Mano de obra", "Demolición y albañilería", "Suplemento picado de suelo cerámico o porcelánico", "m²", 8),
    l("dem_suelo_terrazo", "Mano de obra", "Demolición y albañilería", "Suplemento picado de suelo de terrazo", "m²", 12),
    l("dem_falso_techo", "Mano de obra", "Demolición y albañilería", "Desmontaje de falso techo existente", "m²", 8),
    l("dem_estancia", "Mano de obra", "Demolición y albañilería", "Demolición y albañilería de baño o cocina (reforma parcial)", "ud", 2500),
    l("traslado_cocina", "Mano de obra", "Demolición y albañilería", "Traslado de cocina: desagües, rozas y salida de humos", "pa", 1200),
    l("sin_ascensor", "Mano de obra", "Demolición y albañilería", "Subida de material y bajada de escombros sin ascensor (por planta)", "ud", 120),
    l("alicatado_mo", "Mano de obra", "Alicatado", "Alicatado de baños y frente de cocina (mano de obra)", "m²", 25),
    l("falso_techo", "Mano de obra", "Pladur", "Falso techo de placa de yeso laminado", "m²", 40),
    l("vigas", "Mano de obra", "Pladur", "Limpieza y tratamiento de vigas vistas", "m²", 12),
    l("elec_completa", "Mano de obra", "Electricidad", "Instalación eléctrica completa con cuadro y boletín", "m²c", 50),
    l("elec_adaptar", "Mano de obra", "Electricidad", "Adaptación eléctrica de baño, cocina y cambios", "pa", 2000),
    l("fonta_punto", "Mano de obra", "Fontanería", "Fontanería y saneamiento por punto de agua, colocación incluida", "ud", 110),
    l("fonta_adaptar", "Mano de obra", "Fontanería", "Adaptación de tomas existentes (se mantiene la instalación)", "ud", 500),
    l("radiadores", "Mano de obra", "Calefacción y agua caliente", "Circuito de calefacción y radiadores en todas las estancias", "m²c", 25, true),
    l("caldera_gas", "Mano de obra", "Calefacción y agua caliente", "Instalación de gas y caldera de condensación con termostato", "ud", 2700, true),
    l("radiador_electrico", "Mano de obra", "Calefacción y agua caliente", "Emisor térmico eléctrico instalado", "ud", 250, true),
    l("suelo_radiante", "Mano de obra", "Calefacción y agua caliente", "Suelo radiante por agua", "m²", 60, true),
    l("termo", "Mano de obra", "Calefacción y agua caliente", "Termo eléctrico 80 l instalado", "ud", 750, true),
    l("aerotermia_acs", "Mano de obra", "Calefacción y agua caliente", "Aerotermia para agua caliente sanitaria", "ud", 3000, true),
    l("aerotermia_clima", "Mano de obra", "Calefacción y agua caliente", "Aerotermia para calefacción, refrigeración y agua caliente", "ud", 8000, true),
    l("split", "Mano de obra", "Climatización", "Aire acondicionado split 1x1 frío/calor instalado", "ud", 1100, true),
    l("conductos", "Mano de obra", "Climatización", "Aire acondicionado por conductos", "m²c", 55, true),
    l("pintura", "Mano de obra", "Pintura", "Pintura en blanco con alisado de paramentos", "m²", 20),
    l("material_obra", "Mano de obra", "Material de obra", "Material de obra para albañilería", "m²c", 30),
    // COMPRAS
    l("ventana", "Compras", "Carpintería exterior", "Ventana de PVC o aluminio", "ud", 650, true),
    l("ventanal", "Compras", "Carpintería exterior", "Ventanal o balconera a terraza", "ud", 1800, true),
    l("puerta_entrada", "Compras", "Carpintería interior", "Puerta de entrada (panelado interior)", "ud", 500, true),
    l("puerta_paso", "Compras", "Carpintería interior", "Puerta de paso semimaciza", "ud", 340, true),
    l("cocina", "Compras", "Cocina", "Cocina a medida completa con encimera", "ud", 5500, true),
    l("electrodomesticos", "Compras", "Cocina", "Bolsa de electrodomésticos", "ud", 3000, true),
    l("equip_bano", "Compras", "Baños", "Plato, mampara, inodoro, mueble, grifería y espejo", "ud", 2000, true),
    l("revest_bano", "Compras", "Revestimientos y suelos", "Alicatado y pavimento de baño (material)", "ud", 1000, true),
    l("revest_cocina", "Compras", "Revestimientos y suelos", "Alicatado de frente de cocina (material)", "ud", 200, true),
    l("pavimento_terraza", "Compras", "Revestimientos y suelos", "Pavimento de terraza", "ud", 400, true),
    l("suelo_laminado", "Compras", "Revestimientos y suelos", "Suelo laminado con colocación y nivelado", "m²", 48, true),
    l("suelo_porcelanico", "Compras", "Revestimientos y suelos", "Suelo porcelánico colocado", "m²", 58, true),
    l("luminarias", "Compras", "Iluminación", "Luminarias LED de superficie y colgantes", "pa", 250, true),
    l("limpieza", "Compras", "Limpieza", "Servicio de limpieza y manitas", "pa", 250),
    // IMPUESTOS Y TASAS
    l("tasas", "Impuestos y tasas", "Impuestos y tasas", "Tasas de residuos, contenedor, PRL y coordinador", "pa", 370),
    // DIRECCIÓN DE OBRA
    l("direccion", "Dirección de obra", "Dirección de obra", "Jefatura de obra y diseño", "pa", 3500),
  ],
  materiales: materialesPorDefecto(),
});

function l(id: string, grupo: GrupoTarifa, capitulo: string, descripcion: string, unidad: string, coste: number, dependeCalidad = false): PrecioTarifa {
  return { id, grupo, capitulo, descripcion, unidad, coste, dependeCalidad };
}

/** Comprueba que un JSON importado tiene forma de tarifario. */
export function esTarifas(x: unknown): x is Tarifas {
  const t = x as Tarifas;
  return !!t && typeof t === "object" && Array.isArray(t.precios) && Array.isArray(t.tramos) && typeof t.recargoPct === "number";
}

/** Completa un tarifario importado con las líneas o campos nuevos que falten. */
export function completarTarifas(t: Partial<Tarifas>): Tarifas {
  const base = tarifasPorDefecto();
  const precios = [...(t.precios ?? [])];
  for (const p of base.precios) if (!precios.some((x) => x.id === p.id)) precios.push(p);
  return { ...base, ...t, factorCalidad: { ...base.factorCalidad, ...t.factorCalidad }, tramos: t.tramos?.length ? t.tramos : base.tramos, precios, materiales: completarMateriales(t.materiales) };
}
