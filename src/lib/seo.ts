import { estimar } from "./estimacion";
import { reformaVacia, viviendaVacia } from "./proyecto";
import { tarifasPorDefecto } from "./tarifas";
import type { DatosReforma } from "./types";

/**
 * Páginas para buscadores: precios por servicio y reformas por distrito de Madrid.
 * Los precios salen del mismo cálculo que la app (tarifas de referencia), no son inventados.
 * La demo sigue con noindex: estas páginas se abren a Google al lanzar en el dominio propio.
 */
export const DOMINIO = "https://reformamejor.es";
const IVA = 10;

export type Calidad = DatosReforma["calidad"];
export const CALIDADES_SEO: { id: Calidad; t: string }[] = [
  { id: "basica", t: "Básica" },
  { id: "media", t: "Media" },
  { id: "alta", t: "Premium" },
];

export interface ServicioSeo {
  slug: string;
  t: string;
  /** «¿Cuánto cuesta …?» */
  accion: string;
  /** Cómo lo busca la gente */
  busqueda: string;
  estancias: string[];
  integral?: boolean;
  m2: number;
  intro: string;
  incluye: string[];
  preguntas: { q: string; a: string }[];
}

export const SERVICIOS_SEO: ServicioSeo[] = [
  {
    slug: "reforma-integral", accion: "reformar un piso entero", t: "Reforma integral de un piso", busqueda: "cuánto cuesta reformar un piso", estancias: [], integral: true, m2: 80,
    intro: "Una reforma integral cambia instalaciones, suelos, baños, cocina, carpintería y pintura. El precio depende sobre todo de los metros, los baños y la calidad de los acabados.",
    incluye: ["Demoliciones y retirada de escombros", "Fontanería y electricidad nuevas", "Baño y cocina completos", "Suelos, puertas y pintura", "Ventanas (si se cambian)"],
    preguntas: [
      { q: "¿Cuánto dura una reforma integral?", a: "Para un piso de 80 m², entre 10 y 14 semanas de obra, más el trámite municipal (declaración responsable o licencia)." },
      { q: "¿Necesito licencia?", a: "En Madrid, la mayoría de reformas interiores van con declaración responsable. Si tocas estructura, fachada o cambias el uso, hace falta licencia." },
    ],
  },
  {
    slug: "reforma-bano", accion: "reformar un baño", t: "Reforma de baño", busqueda: "precio reforma baño", estancias: ["Baños"], m2: 80,
    intro: "Reformar un baño completo incluye quitar el alicatado y los sanitarios, renovar fontanería y desagües, alicatar, plato de ducha, mampara, mueble, grifería e iluminación.",
    incluye: ["Demolición de alicatado y sanitarios", "Fontanería y desagües nuevos", "Alicatado y solado", "Plato de ducha y mampara", "Sanitarios, mueble y grifería"],
    preguntas: [
      { q: "¿Cuánto tarda reformar un baño?", a: "Entre 2 y 3 semanas, según si se cambian también las tuberías de la vivienda." },
      { q: "¿Puedo cambiar la bañera por un plato de ducha sin reformar todo?", a: "Sí, es un trabajo más pequeño. En la app puedes ver el precio de cada partida por separado." },
    ],
  },
  {
    slug: "reforma-cocina", accion: "reformar la cocina", t: "Reforma de cocina", busqueda: "precio reforma cocina", estancias: ["Cocina"], m2: 80,
    intro: "Una cocina nueva suma muebles, encimera, electrodomésticos, alicatado, instalaciones y, si se abre al salón, cambios de tabiques.",
    incluye: ["Desmontaje de la cocina actual", "Fontanería y electricidad de cocina", "Muebles y encimera", "Alicatado o revestimiento", "Electrodomésticos según gama"],
    preguntas: [
      { q: "¿Cuánto cuesta abrir la cocina al salón?", a: "Depende de si el tabique es de carga. Si no lo es, se suma la demolición, el remate de suelos y techos y la electricidad." },
      { q: "¿Qué encimera elegir?", a: "Las porcelánicas (tipo Dekton o Laminam) resisten mejor el calor y las manchas que el cuarzo." },
    ],
  },
  {
    slug: "cambiar-ventanas", accion: "cambiar las ventanas", t: "Cambiar las ventanas", busqueda: "precio cambiar ventanas", estancias: ["Ventanas"], m2: 80,
    intro: "Cambiar las ventanas por PVC o aluminio con rotura de puente térmico y doble vidrio mejora el aislamiento y el ruido. Suele poder pedirse ayuda de eficiencia energética.",
    incluye: ["Retirada de ventanas antiguas", "Perfilería PVC o aluminio RPT", "Doble acristalamiento", "Colocación y remates"],
    preguntas: [
      { q: "¿PVC o aluminio?", a: "Los dos aíslan bien si el aluminio es con rotura de puente térmico. El PVC suele ser algo más barato; el aluminio admite perfiles más finos." },
      { q: "¿Hay ayudas para cambiar ventanas?", a: "Sí, en programas de eficiencia energética cuando se mejora la demanda de calefacción. Lo verás en Ayudas y subvenciones." },
    ],
  },
  {
    slug: "cambiar-suelos", accion: "cambiar el suelo de un piso", t: "Cambiar el suelo", busqueda: "precio cambiar suelo piso", estancias: ["Suelos"], m2: 80,
    intro: "Cambiar el suelo de un piso con laminado o porcelánico. El precio cambia mucho si hay que levantar el suelo antiguo o se puede colocar encima.",
    incluye: ["Retirada o preparación del suelo actual", "Nivelado si hace falta", "Suelo laminado o porcelánico", "Rodapiés"],
    preguntas: [
      { q: "¿Se puede poner laminado encima del terrazo?", a: "Sí, si está bien nivelado. Ahorras demolición, pero hay que revisar las puertas." },
    ],
  },
  {
    slug: "instalacion-electrica", accion: "renovar la instalación eléctrica", t: "Renovar la instalación eléctrica", busqueda: "precio cambiar instalación eléctrica piso", estancias: ["Electricidad"], m2: 80,
    intro: "Renovar la electricidad de un piso: cuadro nuevo, cableado, mecanismos y boletín. Obligatorio si la instalación es antigua y quieres aumentar potencia.",
    incluye: ["Cuadro eléctrico nuevo", "Cableado y tubos", "Mecanismos", "Boletín de la instalación"],
    preguntas: [
      { q: "¿Cada cuánto hay que cambiar la instalación eléctrica?", a: "Si tiene más de 20 años, conviene renovarla al reformar: los cables y protecciones antiguos no cumplen la norma actual." },
    ],
  },
  {
    slug: "fontaneria", accion: "renovar la fontanería", t: "Renovar la fontanería", busqueda: "precio cambiar tuberías piso", estancias: ["Fontanería"], m2: 80,
    intro: "Cambiar las tuberías de agua y los desagües de baños y cocina. Evita fugas y problemas de presión en pisos antiguos.",
    incluye: ["Tuberías de agua fría y caliente", "Desagües", "Llaves de corte"],
    preguntas: [
      { q: "¿Tengo que cambiar las tuberías si reformo el baño?", a: "Si tienen más de 20 años, sí: es el momento más barato de hacerlo." },
    ],
  },
  {
    slug: "aire-acondicionado", accion: "poner aire acondicionado", t: "Climatización y aire acondicionado", busqueda: "precio instalar aire acondicionado piso", estancias: ["Calefacción / aire acondicionado"], m2: 80,
    intro: "Instalar aire acondicionado o calefacción: desde splits hasta conductos o aerotermia. El precio depende del sistema y de los metros.",
    incluye: ["Equipos con marca, modelo y potencia", "Instalación y puesta en marcha"],
    preguntas: [
      { q: "¿Splits o conductos?", a: "Los conductos reparten mejor el aire y no se ven, pero necesitan falso techo. Los splits son más baratos y rápidos de instalar." },
    ],
  },
  {
    slug: "pintura", accion: "pintar un piso", t: "Pintar el piso", busqueda: "precio pintar piso", estancias: ["Pintura"], m2: 80,
    intro: "Pintar paredes y techos de todo el piso, con preparación de superficies.",
    incluye: ["Protección de suelos y muebles", "Preparación y alisado", "Pintura de paredes y techos"],
    preguntas: [
      { q: "¿Cuánto se tarda en pintar un piso?", a: "Para 80 m², entre 3 y 5 días." },
    ],
  },
];

export const servicioSeo = (slug: string) => SERVICIOS_SEO.find((s) => s.slug === slug);

/** Precio con IVA para una vivienda tipo, con el mismo cálculo que la app. */
export function precioServicio(s: ServicioSeo, calidad: Calidad, m2 = s.m2) {
  const v = { ...viviendaVacia(), m2, dormitorios: 2, banos: 1, anoConstruccion: 1975 };
  const r: DatosReforma = { ...reformaVacia(2, 1), alcance: s.integral ? "integral" : "parcial", estancias: s.estancias, calidad, cambiarVentanas: s.integral ? true : s.estancias.includes("Ventanas") };
  const e = estimar(v, r, tarifasPorDefecto());
  // Un trabajo de un solo oficio (pintar, suelos, electricidad…) no lleva dirección de obra
  const unOficio = !s.integral && !s.estancias.some((x) => x === "Baños" || x === "Cocina");
  const lineas = unOficio ? e.lineas.filter((l) => l.capitulo !== "Dirección de obra") : e.lineas;
  const base = lineas.reduce((t, l) => t + l.cantidad * l.precio, 0);
  const k = e.base ? base / e.base : 1;
  const conIva = (n: number) => Math.round((n * (1 + IVA / 100)) / 100) * 100;
  const capitulos = [...new Set(lineas.map((l) => l.capitulo))]
    .map((c) => ({ c, importe: conIva(lineas.filter((l) => l.capitulo === c).reduce((t, l) => t + l.cantidad * l.precio, 0)) }))
    .filter((x) => x.importe > 0)
    .sort((a, b) => b.importe - a.importe);
  return { total: conIva(base), minimo: conIva(e.minimo * k), maximo: conIva(e.maximo * k), capitulos };
}

export const DISTRITOS_MADRID = [
  "Centro", "Arganzuela", "Retiro", "Salamanca", "Chamartín", "Tetuán", "Chamberí", "Fuencarral-El Pardo", "Moncloa-Aravaca", "Latina", "Carabanchel",
  "Usera", "Puente de Vallecas", "Moratalaz", "Ciudad Lineal", "Hortaleza", "Villaverde", "Villa de Vallecas", "Vicálvaro", "San Blas-Canillejas", "Barajas",
].map((n) => ({ n, slug: n.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-") }));

export const distrito = (slug: string) => DISTRITOS_MADRID.find((d) => d.slug === slug);

export const euros = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} €`;
