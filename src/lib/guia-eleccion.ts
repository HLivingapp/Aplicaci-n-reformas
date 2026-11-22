/**
 * Guía de elección de materiales: qué decidir y en qué orden, según lo que la obra necesita en cada momento.
 * Redactada en neutro a partir de la guía de una empresa de la red (sin nombres ni teléfonos de personas, sin precios).
 */
export type EstanciaGuia = "bano" | "cocina" | "vivienda";

export type PasoGuia = {
  id: string;
  prioridad: 1 | 2 | 3 | 4 | 5;
  titulo: string;
  cuando: string;
  /** Qué tienes que elegir */
  elige: string[];
  /** Consejos para no equivocarte */
  consejos: string[];
  donde?: string;
  /** Categoría de la selección de materiales relacionada */
  categoria?: string;
  estancias: EstanciaGuia[];
};

export const PRIORIDADES: Record<PasoGuia["prioridad"], string> = {
  1: "Antes de demoler",
  2: "Nada más demoler",
  3: "Durante la demolición",
  4: "Durante la demolición",
  5: "Antes de empezar la obra",
};

export const REGLAS_GUIA = [
  "Elige siempre dos opciones de cada material, por si una no está disponible o se sale de precio.",
  "Manda cada elección a tu reformista por escrito: foto de la referencia, captura o modelo.",
  "Cuenta todo lo que te guste, con fotos y comentarios. Con eso se prepara el moodboard: el documento con todos los materiales y cómo se instalan.",
];

export const GUIA_ELECCION: PasoGuia[] = [
  {
    id: "griferia",
    prioridad: 1,
    titulo: "Grifería: ¿empotrada o de superficie?",
    cuando: "Es lo primero: antes de terminar la demolición",
    elige: ["Por cada baño: grifo de lavabo y grifo o conjunto de ducha (de superficie, empotrado o termostático)", "Para la cocina: grifo de cocina (los hay extraíbles)", "Acabado: negro mate o cromo son los más habituales"],
    consejos: [
      "La empotrada lleva un cuerpo dentro del tabique que se instala con la fontanería. Si se decide tarde, hay que volver a abrir paredes.",
      "La de superficie es más práctica y se cambia en el futuro sin obra; la empotrada es más limpia y minimalista.",
      "En ducha empotrada di también si el rociador sale de la pared o del techo: cambia por dónde va la tubería.",
      "Lavabo encastrado o integrado en el mueble → grifo de caño bajo. Lavabo sobre encimera → grifo de caño alto.",
    ],
    donde: "Online, en el catálogo del fabricante",
    categoria: "bano",
    estancias: ["bano", "cocina", "vivienda"],
  },
  {
    id: "instalaciones",
    prioridad: 2,
    titulo: "Dónde van las instalaciones",
    cuando: "Con la vivienda demolida, fontanería y electricidad se trazan enseguida",
    elige: [
      "Agua: lavabo, inodoro, bidé y ducha o bañera en cada baño; fregadero, lavavajillas y lavadora en cocina; toma para frigorífico si lleva dispensador",
      "Electricidad: enchufes junto a cama, sofá y escritorio; TV y datos; qué enciende cada interruptor y desde dónde",
      "Cocina: enchufes de encimera y tomas de electrodomésticos. Baños: enchufe junto al espejo",
      "Clima y otros: caldera o aerotermia, radiadores o splits, salida de humos de la campana, videoportero y cuadro eléctrico",
    ],
    consejos: ["Recorre el plano con tu reformista y marca cada punto antes de esa fecha: moverlo después son rozas nuevas.", "Los focos empotrados solo son posibles donde hay falso techo."],
    categoria: "electricidad",
    estancias: ["bano", "cocina", "vivienda"],
  },
  {
    id: "alicatado",
    prioridad: 3,
    titulo: "Alicatado y suelo del baño",
    cuando: "De lo primero en elegirse: se pide a fábrica y define el resto del baño",
    elige: ["Pieza de pared y de suelo", "Color de la junta (lechada)", "Orientación de la pieza", "Cantoneras (guardavivos)"],
    consejos: ["Las piezas especiales o de gran formato suelen tener más plazo y sobrecoste.", "Elige el frontal de la cocina a la vez, en el mismo showroom."],
    donde: "Showroom de azulejos",
    categoria: "suelos",
    estancias: ["bano", "vivienda"],
  },
  {
    id: "cocina",
    prioridad: 3,
    titulo: "Cocina: puertas, tirador y encimera",
    cuando: "Durante la demolición; después el fabricante mide y propone la distribución",
    elige: ["Acabado de puertas", "Tirador: gola, tirador normal, push and pull o integrado", "Encimera: porcelánica (Dekton, Laminam, Ascale) o laminada", "Frontal entre muebles (azulejo)", "Grifo de cocina"],
    consejos: [
      "En el showroom eliges puertas y encimera; el diseño completo se hace con la cocina ya demolida y medida.",
      "Push and pull, tirador integrado, encimeras de acero, madera o piedra natural suelen tener sobrecoste o más plazo.",
      "La tira LED bajo los muebles altos ilumina la encimera: pídela con el frontal.",
    ],
    donde: "Showroom de cocinas",
    categoria: "cocina",
    estancias: ["cocina", "vivienda"],
  },
  {
    id: "mueble-bano",
    prioridad: 4,
    titulo: "Mueble de baño y lavabo",
    cuando: "Durante la demolición",
    elige: ["Ancho: los estándar miden 60, 70 u 80 cm (míralo en el plano)", "Tipo: 3 cajones con patas (con o sin zócalo) o 2 cajones suspendido", "Lavabo encastrado o sobre encimera", "Espejo, mejor retroiluminado"],
    consejos: ["El suspendido es más actual y deja limpiar el suelo.", "Con zócalo, las patas quedan ocultas y el acabado es más uniforme; sin zócalo, se ven las patas y el mueble parece más ligero.", "Lavabo encastrado → grifo de caño bajo. Lavabo sobre encimera → grifo de caño alto.", "Para baños estrechos hay muebles de 35 y hasta 22 cm de fondo."],
    donde: "Online",
    categoria: "bano",
    estancias: ["bano", "vivienda"],
  },
  {
    id: "mampara",
    prioridad: 4,
    titulo: "Mampara",
    cuando: "Durante la demolición",
    elige: ["Plato entre tres paredes: 1 fija + 1 corredera (la más práctica), o 2 fijas + 2 correderas si el frente es ancho", "Plato en esquina: 2 fijas + 2 correderas con entrada por el vértice", "Acabado del perfil: negro mate o plata/cromo"],
    consejos: ["Vidrio templado de 6-8 mm con antical y unos 195 cm de alto.", "El panel fijo sin puerta no se recomienda: el agua suele salir del plato.", "Oro, oro rosado o blanco suelen ir bajo pedido y con sobrecoste."],
    donde: "Online",
    categoria: "bano",
    estancias: ["bano", "vivienda"],
  },
  {
    id: "sanitarios",
    prioridad: 4,
    titulo: "Sanitarios",
    cuando: "Durante la demolición",
    elige: ["Inodoro (y bidé si lo quieres)", "Bañera o plato de ducha"],
    consejos: ["El plato de ducha de obra lleva coste extra frente a un plato estándar."],
    donde: "Online",
    categoria: "bano",
    estancias: ["bano", "vivienda"],
  },
  {
    id: "suelo",
    prioridad: 4,
    titulo: "Suelo y rodapié",
    cuando: "Durante la demolición",
    elige: ["Suelo laminado o porcelánico y su color", "Color del rodapié"],
    consejos: ["Un laminado de 8 mm resistente al agua y a los arañazos sirve también para cocina.", "Ten una segunda opción por si la primera no está en stock."],
    donde: "Showroom de suelos",
    categoria: "suelos",
    estancias: ["vivienda"],
  },
  {
    id: "puertas-armarios",
    prioridad: 5,
    titulo: "Puertas de paso y armarios",
    cuando: "Llegan después en la obra, pero ciérralos con el resto",
    elige: ["Puertas: modelo (lisa, rayas o molduras) y blanco cálido (RAL 9010) o puro (RAL 9016)", "Armarios: color, fondo (58 o 35 cm), altura (236 o 201 cm), módulos de 50, 75 o 100 cm, interiores, puertas y tiradores"],
    consejos: ["Las puertas correderas de armario necesitan unos centímetros más de techo que el armario."],
    categoria: "armarios",
    estancias: ["vivienda"],
  },
  {
    id: "luz",
    prioridad: 5,
    titulo: "Luminarias y electrodomésticos",
    cuando: "Antes de empezar la obra",
    elige: ["Tipo de luz por estancia: foco empotrado, foco de superficie o portalámparas", "Temperatura de color: cálida, neutra o fría", "Electrodomésticos, con la propuesta de la cocina"],
    consejos: ["Fija una cantidad para electrodomésticos: lo que la supere se paga aparte."],
    categoria: "electricidad",
    estancias: ["cocina", "vivienda"],
  },
];

export const guiaPara = (e: EstanciaGuia) => GUIA_ELECCION.filter((p) => p.estancias.includes(e));
