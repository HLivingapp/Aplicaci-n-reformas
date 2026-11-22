import type { DatosReforma, GrupoMaterial, NivelMaterial, OpcionMaterial, Tarifas } from "./types";

export const NIVELES: { valor: NivelMaterial; texto: string }[] = [
  { valor: "basico", texto: "Básico" },
  { valor: "medio", texto: "Medio" },
  { valor: "premium", texto: "Premium" },
];

/** La calidad general que el cliente marcó en el asistente decide el acabado por defecto. */
export const NIVEL_POR_CALIDAD: Record<DatosReforma["calidad"], NivelMaterial> = { basica: "basico", media: "medio", alta: "premium" };

const o = (id: string, nivel: NivelMaterial, nombre: string, detalle: string, factor: number): OpcionMaterial => ({ id, nivel, nombre, detalle, factor });

/**
 * Catálogo genérico de acabados (descripciones y factores orientativos, sin marcas ni precios
 * de ninguna empresa). Cada empresa lo ajusta en Ajustes → Tarifario; los precios reales
 * no se guardan en este repositorio.
 */
export const materialesPorDefecto = (): GrupoMaterial[] => [
  {
    id: "suelo_laminado",
    nombre: "Suelo laminado",
    tarifaIds: ["suelo_laminado"],
    opciones: [
      o("lam_basico", "basico", "Laminado AC4 de 8 mm", "Resistente para uso doméstico, en tonos madera estándar", 0.85),
      o("lam_medio", "medio", "Laminado AC5 hidrófugo", "Más grueso y resistente al agua, también en cocina", 1),
      o("lam_premium", "premium", "Tarima de madera natural", "Multicapa de roble con capa de madera noble", 1.6),
    ],
  },
  {
    id: "suelo_porcelanico",
    nombre: "Suelo porcelánico",
    tarifaIds: ["suelo_porcelanico"],
    opciones: [
      o("por_basico", "basico", "Porcelánico 60×60", "Formato estándar en tonos neutros", 0.8),
      o("por_medio", "medio", "Porcelánico rectificado 120×60", "Gran formato, imitación madera o piedra, juntas finas", 1),
      o("por_premium", "premium", "Porcelánico de diseño gran formato", "Piezas grandes o colecciones de diseño", 1.5),
    ],
  },
  {
    id: "revest_bano",
    nombre: "Azulejos y suelo del baño",
    tarifaIds: ["revest_bano"],
    opciones: [
      o("rb_basico", "basico", "Azulejo cerámico 30×60", "Blanco o tonos claros, suelo a juego", 0.8),
      o("rb_medio", "medio", "Porcelánico rectificado 60×120", "Gran formato en paredes y suelo", 1),
      o("rb_premium", "premium", "Piezas de diseño", "Gran formato especial, mosaicos o piezas artesanas", 1.6),
    ],
  },
  {
    id: "equip_bano",
    nombre: "Sanitarios y grifería",
    tarifaIds: ["equip_bano"],
    opciones: [
      o("eb_basico", "basico", "Equipamiento estándar", "Plato de resina, mampara fija, inodoro de suelo, mueble de 60 cm y monomando", 0.75),
      o("eb_medio", "medio", "Equipamiento de gama media", "Plato extraplano, mampara Kassandra de vidrio templado, inodoro Roca Gap, mueble Salgar con lavabo y grifería Imex", 1),
      o("eb_premium", "premium", "Equipamiento de gama alta", "Ducha a ras de suelo, grifería empotrada, mueble a medida y espejo con luz", 1.7),
    ],
  },
  {
    id: "cocina",
    nombre: "Muebles y encimera de cocina",
    tarifaIds: ["cocina"],
    opciones: [
      o("co_basico", "basico", "Muebles laminados", "Frentes laminados y encimera laminada", 0.75),
      o("co_medio", "medio", "Muebles lacados", "Frentes Alvic (Luxe, Zenit o Syncron) y encimera porcelánica Ascale", 1),
      o("co_premium", "premium", "Cocina a medida de gama alta", "Frentes a medida, herrajes con cierre suave y encimera porcelánica Dekton o Laminam", 1.6),
    ],
  },
  {
    id: "electrodomesticos",
    nombre: "Electrodomésticos",
    tarifaIds: ["electrodomesticos"],
    opciones: [
      o("el_basico", "basico", "Gama básica", "Vitrocerámica, horno, campana, frigorífico y lavavajillas de libre instalación", 0.7),
      o("el_medio", "medio", "Gama media integrable", "Balay o Teka: placa de inducción, horno multifunción y frigorífico y lavavajillas integrables", 1),
      o("el_premium", "premium", "Gama alta integrable", "Inducción de zona libre, horno pirolítico y campana de techo o integrada", 1.6),
    ],
  },
  {
    id: "revest_cocina",
    nombre: "Frente de cocina",
    tarifaIds: ["revest_cocina"],
    opciones: [
      o("rc_basico", "basico", "Azulejo cerámico", "Azulejo blanco o de color liso", 0.8),
      o("rc_medio", "medio", "Porcelánico", "Porcelánico a juego con el suelo", 1),
      o("rc_premium", "premium", "Mismo material que la encimera", "Frente continuo de la misma piedra o porcelánico", 1.8),
    ],
  },
  {
    id: "puertas",
    nombre: "Puertas interiores",
    tarifaIds: ["puerta_paso"],
    opciones: [
      o("pu_basico", "basico", "Puerta lisa lacada", "Lisa, lacada en blanco, alma alveolar", 0.7),
      o("pu_medio", "medio", "Puerta semimaciza lacada", "Lacada en blanco con herrajes de acero inoxidable", 1),
      o("pu_premium", "premium", "Puerta maciza hasta el techo", "Maciza, hasta el techo o enrasada con la pared", 1.8),
    ],
  },
  {
    id: "ventanas",
    nombre: "Ventanas",
    tarifaIds: ["ventana", "ventanal"],
    opciones: [
      o("ve_basico", "basico", "PVC blanco estándar", "Perfil de PVC blanco, oscilobatiente, con doble acristalamiento 4/16/4", 0.85),
      o("ve_medio", "medio", "Perfilería Cortizo o similar, PVC o aluminio", "PVC o aluminio con rotura de puente térmico, vidrio tipo Climalit bajo emisivo y persiana", 1),
      o("ve_premium", "premium", "Aluminio Cortizo de perfil fino o similar", "Perfil minimalista con rotura de puente térmico, vidrio tipo Climalit acústico o triple acristalamiento", 1.5),
    ],
  },
  {
    id: "pintura",
    nombre: "Pintura",
    tarifaIds: ["pintura"],
    opciones: [
      o("pi_basico", "basico", "Plástica blanca mate", "Pintura blanca en paredes y techos", 0.9),
      o("pi_medio", "medio", "Plástica lavable", "Lavable, blanca o en un color suave", 1),
      o("pi_premium", "premium", "Colores y acabados especiales", "Varios colores, paredes de acento o acabados decorativos", 1.25),
    ],
  },
];

/** Grupo al que pertenece una partida del tarifario, si el cliente puede elegir su acabado. */
export const grupoDePartida = (t: Tarifas, tarifaId: string) => t.materiales.find((g) => g.tarifaIds.includes(tarifaId));

/** Opción elegida en un grupo; si el cliente no ha elegido, la que corresponde a su calidad general. */
export function opcionElegida(g: GrupoMaterial, r: DatosReforma): OpcionMaterial | undefined {
  const elegida = r.materiales?.[g.id];
  return g.opciones.find((x) => x.id === elegida) ?? g.opciones.find((x) => x.nivel === NIVEL_POR_CALIDAD[r.calidad]) ?? g.opciones[0];
}

/** Deja solo elecciones que existen en el catálogo (lo que llega del navegador no es de fiar). */
export function limpiarMateriales(x: unknown, grupos: GrupoMaterial[]): Record<string, string> {
  const res: Record<string, string> = {};
  if (!x || typeof x !== "object") return res;
  for (const [k, v] of Object.entries(x as Record<string, unknown>)) {
    const g = grupos.find((y) => y.id === k);
    if (g && typeof v === "string" && g.opciones.some((op) => op.id === v)) res[k] = v;
  }
  return res;
}

/** Completa el catálogo de una empresa con los grupos nuevos que aún no tenga. */
export function completarMateriales(propios: GrupoMaterial[] | undefined): GrupoMaterial[] {
  const lista = Array.isArray(propios) ? [...propios] : [];
  for (const g of materialesPorDefecto()) if (!lista.some((x) => x.id === g.id)) lista.push(g);
  return lista;
}
