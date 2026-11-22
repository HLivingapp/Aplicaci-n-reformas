/**
 * Qué incluye cada partida del tarifario, en lenguaje claro para el cliente.
 * Textos estándar de una reforma tipo; la visita y el presupuesto final los concretan.
 */
export interface Alcance {
  incluye: string;
  noIncluye?: string;
}

export const ALCANCE: Record<string, Alcance> = {
  demolicion_integral: {
    incluye: "Protección de zonas comunes, demolición de revestimientos, sanitarios y cocina, y retirada de escombros con contenedor.",
    noIncluye: "Picado de suelos cerámicos o de terrazo y desmontaje de falsos techos, que van en sus partidas.",
  },
  albanileria_integral: {
    incluye: "Recrecidos y regularización de suelos, rozas y ayudas a instalaciones, y tabiquería de los baños y la cocina.",
    noIncluye: "Refuerzos de estructura o forjado, que se valoran tras la visita si hacen falta.",
  },
  albanileria_redistribucion: {
    incluye: "Derribo de los tabiques que cambian y levantamiento de los nuevos (ladrillo o placa de yeso con aislamiento acústico), con sus remates y premarcos de puertas.",
  },
  dem_suelo_ceramico: { incluye: "Picado del suelo cerámico o porcelánico existente y retirada de escombros antes de colocar el nuevo." },
  dem_suelo_terrazo: { incluye: "Picado del terrazo existente, que es más duro y pesado, y retirada de escombros antes de colocar el nuevo suelo." },
  dem_falso_techo: { incluye: "Desmontaje del falso techo actual y retirada de escombros." },
  demolicion_estancia: {
    incluye: "Demolición de alicatados, suelo y sanitarios o muebles de la estancia, y retirada de escombros.",
  },
  albanileria_estancia: {
    incluye: "Regularización de paredes y suelo, recrecidos y ayudas a fontanería y electricidad.",
    noIncluye: "Cambios de distribución fuera de la estancia.",
  },
  traslado_cocina: { incluye: "Nuevos desagües con su pendiente, rozas para las tomas y nueva salida de humos para la campana en la nueva ubicación." },
  sin_ascensor: { incluye: "Subida a mano de todo el material y bajada de escombros por la escalera, por cada planta." },
  alicatado_mo: {
    incluye: "Colocación de azulejos en las paredes de los baños hasta el techo y en el frente de la cocina, con cantoneras y rejuntado.",
    noIncluye: "El azulejo, que va en «Revestimientos y suelos» según el acabado que elijas.",
  },
  falso_techo: {
    incluye: "Falso techo de placa de yeso laminado (hidrófuga en baños y cocina), con estructura, cinta, pasta y huecos para la iluminación, listo para pintar.",
  },
  vigas: { incluye: "Limpieza, lijado y tratamiento protector de las vigas vistas para dejarlas a la vista." },
  elec_completa: {
    incluye: "Instalación eléctrica nueva de toda la vivienda: cuadro con protecciones, cableado, mecanismos (enchufes, interruptores, tomas de TV y datos), puntos de luz, videoportero y boletín (certificado eléctrico).",
    noIncluye: "Las lámparas, que van en «Iluminación», y la acometida de la compañía.",
  },
  elec_adaptar: { incluye: "Adaptación de la instalación existente en baños y cocina: nuevos circuitos para electrodomésticos, enchufes y puntos de luz donde cambien." },
  fonta_punto: {
    incluye: "Tuberías nuevas de agua fría y caliente, desagües y conexión a la bajante, con llaves de corte, por cada punto de agua (lavabo, inodoro, ducha, fregadero, lavavajillas, lavadora…). Incluye montar los sanitarios y la grifería.",
    noIncluye: "Cambio de la bajante comunitaria del edificio.",
  },
  fonta_adaptar: { incluye: "Se mantiene la instalación existente y se adaptan las tomas de agua y desagües de cada baño o cocina, con montaje de sanitarios y grifería." },
  radiadores: { incluye: "Tuberías de calefacción y un radiador de aluminio en cada estancia, con su válvula y purgador." },
  caldera_gas: { incluye: "Caldera de condensación de gas, instalación de gas, salida de humos, termostato y puesta en marcha con certificado." },
  radiador_electrico: { incluye: "Emisor térmico eléctrico de bajo consumo colocado en la pared y conectado." },
  suelo_radiante: { incluye: "Aislamiento, tubos de suelo radiante por agua, colectores y mortero, en toda la superficie útil." },
  termo: { incluye: "Termo eléctrico de 80 litros colgado, con sus conexiones y válvula de seguridad." },
  aerotermia_acs: { incluye: "Equipo de aerotermia para el agua caliente con su depósito, instalado y en marcha." },
  aerotermia_clima: { incluye: "Aerotermia para calefacción, refrigeración y agua caliente: unidad exterior, interior, depósito y conexiones." },
  split: {
    incluye: "Aire acondicionado split frío/calor por estancia: unidad interior, exterior, tuberías y desagüe.",
    noIncluye: "Permisos de la comunidad de vecinos para la unidad exterior, si hacen falta.",
  },
  conductos: { incluye: "Máquina de aire acondicionado por conductos en el falso techo del pasillo, con conductos, rejillas en cada estancia y termostato." },
  pintura: {
    incluye: "Alisado de paredes y techos, imprimación y dos manos de pintura plástica en toda la superficie pintable.",
    noIncluye: "Papel pintado o acabados decorativos, salvo que elijas el acabado premium.",
  },
  material_obra: { incluye: "Cemento, yeso, mortero, adhesivos, placas, perfiles y el resto de material de albañilería que se gasta en la obra." },
  ventana: {
    incluye: "Ventana nueva oscilobatiente de perfilería Cortizo o similar, en PVC o aluminio con rotura de puente térmico, doble acristalamiento tipo Climalit, persiana, retirada de la antigua y colocación con sellado, por cada ventana.",
    noIncluye: "Cambio de la fachada o de los huecos, que necesita permiso de la comunidad de vecinos.",
  },
  ventanal: { incluye: "Balconera o ventanal de salida a la terraza de perfilería Cortizo o similar (PVC o aluminio con rotura de puente térmico), doble acristalamiento tipo Climalit de seguridad, persiana y colocación." },
  puerta_entrada: { incluye: "Panelado interior de la puerta de entrada a juego con las puertas de paso." },
  puerta_paso: { incluye: "Puerta de paso completa: hoja, marco, tapajuntas, manillas y colocación, por cada puerta." },
  cocina: {
    incluye: "Muebles altos y bajos de cocina a medida, encimera, fregadero con grifo y montaje.",
    noIncluye: "Electrodomésticos, que van aparte.",
  },
  electrodomesticos: { incluye: "Placa, horno, campana, frigorífico, lavavajillas y microondas, colocados y conectados." },
  equip_bano: { incluye: "Plato de ducha, mampara, inodoro, mueble con lavabo, grifería, espejo y accesorios, colocados, por cada baño." },
  revest_bano: { incluye: "El azulejo de las paredes y el suelo de cada baño (material)." },
  revest_cocina: { incluye: "El material del frente de la cocina entre muebles altos y bajos." },
  pavimento_terraza: { incluye: "Suelo exterior antideslizante para la terraza, colocado." },
  suelo_laminado: {
    incluye: "Nivelado, lámina aislante, suelo laminado y rodapié, colocados en toda la vivienda salvo los baños.",
  },
  suelo_porcelanico: { incluye: "Suelo porcelánico con su adhesivo, rejuntado y rodapié, colocado en toda la vivienda salvo los baños." },
  luminarias: { incluye: "Focos LED empotrados en falsos techos y lámparas básicas de superficie." },
  limpieza: { incluye: "Limpieza final de obra a fondo y pequeños remates para entregar la vivienda lista para entrar." },
  tasas: { incluye: "Tasa de residuos, permisos de contenedor, seguridad y salud (PRL) y coordinador de seguridad." },
  direccion_parcial: { incluye: "Jefe de obra durante la reforma del baño o la cocina: planificación, coordinación de oficios y seguimiento contigo." },
  direccion: { incluye: "Jefe de obra durante toda la reforma, diseño de la distribución, planificación y seguimiento contigo." },
};

/** Nombre claro de cada unidad. */
export const UNIDADES: Record<string, [string, string]> = {
  "m²c": ["m² construido", "m² construidos"],
  "m²": ["m²", "m²"],
  ud: ["unidad", "unidades"],
  pa: ["partida", "partidas"],
};

export function cantidadLegible(cantidad: number, unidad: string) {
  const [uno, varios] = UNIDADES[unidad] ?? [unidad, unidad];
  if (unidad === "pa" && cantidad === 1) return "Partida completa";
  const n = cantidad.toLocaleString("es-ES", { maximumFractionDigits: 1 });
  return `${n} ${cantidad === 1 ? uno : varios}`;
}
