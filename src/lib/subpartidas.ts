import { DESCOMPOSICION } from "./descomposicion";
import type { Estancia, LineaEstimacion } from "./estimacion";

/**
 * Subpartidas de cada partida con su unidad y medición, calculadas con las unidades recomendadas
 * (REBT ITC-BT-25 para electricidad, puntos de agua por aparato, radiadores por m², puertas por estancia…).
 * Cada subpartida lleva un precio relativo de referencia; el importe de la partida (precio de venta) se reparte
 * en proporción a cantidad × precio relativo, así que la suma de subpartidas es siempre el importe de la partida.
 * Nunca se usan costes ni tarifas de proveedor.
 */
export interface Subpartida {
  concepto: string;
  unidad: string;
  cantidad: number;
  /** Precio relativo de referencia por unidad (solo para repartir el importe) */
  rel: number;
}

export interface ContextoSub {
  /** Estancias que entran en la reforma */
  estancias: Estancia[];
  m2c: number;
  util: number;
  integral: boolean;
  nBanos: number;
  hazCocina: boolean;
  m2AlicatadoBano: number;
  m2AlicatadoCocina: number;
  paramentosPorM2: number;
  puntosAguaBano: number;
  puntosAguaCocina: number;
  m2FalsoTecho: number;
  cambiosDistribucion: number;
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const s = (concepto: string, unidad: string, cantidad: number, rel: number): Subpartida => ({ concepto, unidad, cantidad: r1(cantidad), rel });
const tipo = (e: Estancia) =>
  e.nombre.startsWith("Salón") ? "salon" : e.nombre.startsWith("Dormitorio") ? "dormitorio" : e.nombre.startsWith("Baño") ? "bano" : e.nombre === "Cocina" ? "cocina" : "pasillo";
/** Perímetro aproximado de una estancia rectangular de proporción 1:1,3 */
const perimetro = (m2: number) => 2 * (Math.sqrt(m2 / 1.3) + Math.sqrt(m2 * 1.3));

/** Mínimos del REBT (ITC-BT-25) por estancia, electrificación elevada. */
export function puntosElectricos(estancias: Estancia[]) {
  let luz = 1; // vestíbulo
  let tomas = 1; // vestíbulo
  let especiales = 0;
  let tv = 0;
  for (const e of estancias) {
    switch (tipo(e)) {
      case "salon": luz += e.m2 > 10 ? 2 : 1; tomas += Math.max(3, Math.ceil(e.m2 / 6)); tv += 1; break;
      case "dormitorio": luz += 1; tomas += Math.max(3, Math.ceil(e.m2 / 6)); tv += 1; break;
      case "cocina": luz += e.m2 > 10 ? 2 : 1; tomas += 2; especiales += 3 + 1 + 3; break; // C5 encimera, C3 horno/placa, C4 lavadora, lavavajillas y termo
      case "bano": luz += 1; especiales += 1; break;
      default: { const largo = e.m2 / 1.1; luz += Math.max(1, Math.ceil(largo / 5)); tomas += Math.max(1, Math.ceil(largo / 5)); }
    }
  }
  return { luz, tomas, especiales, tv };
}

export function subpartidasDe(l: LineaEstimacion, c: ContextoSub): Subpartida[] {
  const est = c.estancias;
  const banos = est.filter((e) => tipo(e) === "bano");
  const cocina = c.hazCocina ? est.find((e) => tipo(e) === "cocina") : undefined;
  const humedas = [...banos.slice(0, c.nBanos), ...(cocina ? [cocina] : [])];
  const m2Banos = banos.slice(0, c.nBanos).reduce((x, e) => x + e.m2, 0);
  const alicatado = c.nBanos * c.m2AlicatadoBano + (cocina ? c.m2AlicatadoCocina : 0);
  const secas = est.filter((e) => !e.humeda);
  const m2Secas = secas.reduce((x, e) => x + e.m2, 0);
  const q = l.cantidad;

  switch (l.tarifaId) {
    case "demolicion_integral":
      return [
        s("Protección de zonas comunes (portal, ascensor y escalera)", "ud", 1, 300),
        s("Demolición de alicatados de baños y cocina", "m²", alicatado, 12),
        s("Demolición de pavimentos", "m²", c.util, 8),
        s("Desmontaje de sanitarios, muebles de cocina y carpinterías", "ud", c.nBanos * 4 + (cocina ? 1 : 0) + secas.length, 35),
        s("Contenedor de escombros de 5 m³ con transporte a vertedero", "ud", Math.ceil(c.m2c / 25), 260),
      ];
    case "demolicion_estancia":
      return [
        s("Protección de zonas comunes", "ud", 1, 150),
        s("Demolición de alicatado", "m²", alicatado, 14),
        s("Demolición de pavimento", "m²", m2Banos + (cocina?.m2 ?? 0), 12),
        s("Desmontaje de sanitarios o muebles", "ud", c.nBanos * 4 + (cocina ? 1 : 0), 40),
        s("Sacas y contenedor de escombros", "ud", Math.max(1, Math.ceil(humedas.length / 2)), 260),
      ];
    case "albanileria_integral":
      return [
        s("Recrecido y regularización de suelos con mortero", "m²", c.util, 14),
        s("Tabiquería de ladrillo en baños y cocina", "m²", c.nBanos * 10 + (cocina ? 6 : 0), 38),
        s("Rozas y ayudas a electricidad y fontanería", "ud", est.length, 140),
        s("Enlucido y regularización de paredes", "m²", c.util * (c.paramentosPorM2 - 1) * 0.35, 9),
      ];
    case "albanileria_redistribucion": {
      const n = Math.max(1, c.cambiosDistribucion);
      return [
        s("Replanteo de la nueva distribución", "ud", 1, 150),
        s("Derribo de tabiques que cambian", "m²", n * 8, 14),
        s("Tabique de placa de yeso con aislamiento acústico", "m²", n * 9, 48),
        s("Premarcos y remates de puertas nuevas", "ud", n, 90),
      ];
    }
    case "albanileria_estancia":
      return [
        s("Regularización de paredes para alicatar", "m²", alicatado, 18),
        s("Recrecido y nivelado de suelo", "m²", m2Banos + (cocina?.m2 ?? 0), 22),
        s("Ayudas a fontanería y electricidad", "ud", humedas.length, 220),
        s("Remates de huecos y premarcos", "ud", humedas.length, 90),
      ];
    case "alicatado_mo":
      return [
        s("Preparación y replanteo de paredes", "m²", q, 3),
        s("Mortero cola C2 y crucetas", "m²", q, 5),
        s("Colocación de azulejo", "m²", q, 13),
        s("Cantoneras de aluminio en esquinas", "ml", c.nBanos * 7 + (cocina ? 2 : 0), 5),
        s("Rejuntado y limpieza", "m²", q, 2.5),
      ];
    case "falso_techo":
      return [
        s("Estructura de perfiles galvanizados", "m²", q, 8),
        s("Placa de yeso laminado (hidrófuga en zonas húmedas)", "m²", q, 9),
        s("Montaje y atornillado", "m²", q, 12),
        s("Cinta, pasta y lijado de juntas", "m²", q, 6),
        s("Huecos para downlights y registros", "ud", Math.ceil(q / 1.5), 6),
      ];
    case "elec_completa": {
      const p = puntosElectricos(est);
      return [
        s("Cuadro general con IGA, diferenciales y magnetotérmicos", "ud", 1, 450),
        s("Circuitos interiores C1 a C10 con cable libre de halógenos", "ud", 8, 130),
        s("Puntos de luz con interruptor o conmutador (REBT: mín. por estancia)", "ud", p.luz, 48),
        s("Tomas de corriente 16 A de uso general (REBT: 1 por cada 6 m², mín. 3 en salón y dormitorios)", "ud", p.tomas, 42),
        s("Tomas especiales de cocina y baño (horno, placa, lavadora, lavavajillas, termo, encimera)", "ud", p.especiales, 55),
        s("Tomas de TV y datos", "ud", p.tv, 45),
        s("Videoportero", "ud", 1, 220),
        s("Boletín y certificado de la instalación", "ud", 1, 180),
      ];
    }
    case "elec_adaptar":
      return [
        s("Nuevos circuitos de cocina y baño", "ud", (cocina ? 3 : 0) + c.nBanos, 130),
        s("Cableado libre de halógenos desde el cuadro", "ml", humedas.length * 18, 6),
        s("Tomas de corriente nuevas o desplazadas", "ud", (cocina ? 8 : 0) + c.nBanos * 2, 45),
        s("Puntos de luz nuevos o desplazados", "ud", (cocina ? 2 : 0) + c.nBanos * 2, 45),
        s("Revisión de la instalación y remates", "ud", 1, 150),
      ];
    case "fonta_punto":
      return [
        s("Tomas de agua fría y caliente en tubería multicapa", "ud", q, 70),
        s("Desagües de aparatos en PVC hasta la bajante", "ud", c.nBanos * 3 + (cocina ? 3 : 0) || Math.ceil(q / 2), 60),
        s("Llaves de corte por estancia", "ud", Math.max(1, humedas.length), 35),
        s("Conexión a bajante y prueba de estanqueidad", "ud", Math.max(1, humedas.length), 90),
      ];
    case "radiadores": {
      const conRad = est.filter((e) => tipo(e) !== "pasillo");
      const elementos = conRad.reduce((x, e) => x + Math.ceil((e.m2 * 90) / 130), 0);
      return [
        s("Elementos de radiador de aluminio (unos 90 W por m² útil)", "ud", elementos, 22),
        s("Válvula termostática y detentor por radiador", "ud", conRad.length, 45),
        s("Circuito de tubería multicapa", "ml", c.util * 1.2, 12),
        s("Llenado, purgado y prueba del circuito", "ud", 1, 150),
      ];
    }
    case "split":
      return [
        s("Equipo split interior y exterior", "ud", q, 700),
        s("Línea frigorífica y desagüe (hasta 3 m)", "ud", q, 180),
        s("Soporte de la unidad exterior", "ud", q, 60),
        s("Instalación, vacío y puesta en marcha", "ud", q, 160),
      ];
    case "pintura": {
      const paredes = Math.max(0, q - c.util);
      return [
        s("Protección de suelos y carpinterías", "m²", c.util, 1),
        s("Alisado de paredes (quitar gotelé)", "m²", paredes, 8),
        s("Imprimación selladora", "m²", q, 1.5),
        s("Pintura plástica en paredes, dos manos", "m²", paredes, 6),
        s("Pintura en techos, dos manos", "m²", Math.min(q, c.util), 6),
      ];
    }
    case "puerta_paso":
      return [
        s("Hoja de puerta", "ud", q, 170),
        s("Precerco y marco", "ud", q, 70),
        s("Tapajuntas (dos caras)", "juego", q * 2, 15),
        s("Bisagras, manilla y condena en baños", "ud", q, 30),
        s("Colocación y ajuste", "ud", q, 60),
      ];
    case "ventana":
    case "ventanal": {
      const m2 = l.tarifaId === "ventana" ? 1.44 : 4.4;
      return [
        s("Desmontaje de la carpintería existente", "ud", q, 50),
        s("Carpintería con rotura de puente térmico y vidrio tipo Climalit", "m²", q * m2, l.tarifaId === "ventana" ? 330 : 280),
        s("Persiana de aluminio con aislante y cajón", "ud", q, l.tarifaId === "ventana" ? 120 : 220),
        s("Colocación, sellado y remates", "ud", q, 60),
      ];
    }
    case "cocina": {
      const lineal = Math.max(2.4, r1((cocina?.m2 ?? 8) * 0.45));
      return [
        s("Módulos bajos", "ml", lineal, 300),
        s("Módulos altos", "ml", r1(lineal * 0.8), 220),
        s("Columna de horno o frigorífico", "ud", lineal > 3.5 ? 2 : 1, 420),
        s("Encimera", "ml", lineal, 210),
        s("Fregadero y grifo", "ud", 1, 320),
        s("Montaje y ajustes", "ud", 1, 380),
      ];
    }
    case "electrodomesticos":
      return [
        s("Placa", "ud", 1, 550),
        s("Horno", "ud", 1, 600),
        s("Campana", "ud", 1, 350),
        s("Frigorífico", "ud", 1, 900),
        s("Lavavajillas", "ud", 1, 600),
      ];
    case "equip_bano":
      return [
        s("Plato de ducha", "ud", q, 300),
        s("Mampara", "ud", q, 400),
        s("Inodoro con cisterna y tapa", "ud", q, 330),
        s("Mueble con lavabo", "ud", q, 450),
        s("Espejo", "ud", q, 120),
        s("Grifería de lavabo", "ud", q, 130),
        s("Grifería de ducha", "ud", q, 230),
      ];
    case "revest_bano":
      return [
        s("Azulejo de paredes (con 10 % de merma)", "m²", q * c.m2AlicatadoBano * 1.1, 24),
        s("Pavimento (con 10 % de merma)", "m²", (m2Banos || q * 4) * 1.1, 28),
        s("Cantoneras y material de rejuntado", "ud", q, 40),
      ];
    case "revest_cocina":
      return [
        s("Azulejo del frente de cocina (con 10 % de merma)", "m²", c.m2AlicatadoCocina * 1.1, 24),
        s("Cantoneras y material de rejuntado", "ud", 1, 30),
      ];
    case "suelo_laminado":
      return [
        s("Laminado (con 5 % de merma)", "m²", q * 1.05, 26),
        s("Lámina antihumedad y aislante acústico", "m²", q, 3),
        s("Nivelado puntual del soporte", "m²", q, 3),
        s("Rodapié a juego", "ml", secas.reduce((x, e) => x + perimetro(e.m2), 0) * Math.min(1, q / Math.max(m2Secas, 1)), 7),
        s("Colocación", "m²", q, 10),
      ];
    case "suelo_porcelanico":
      return [
        s("Porcelánico (con 10 % de merma)", "m²", q * 1.1, 28),
        s("Mortero cola C2", "m²", q, 5),
        s("Rodapié", "ml", secas.reduce((x, e) => x + perimetro(e.m2), 0) * Math.min(1, q / Math.max(m2Secas, 1)), 8),
        s("Colocación y rejuntado", "m²", q, 16),
      ];
    case "luminarias": {
      const down = Math.ceil(c.m2FalsoTecho / 1.5);
      return [
        s("Downlights LED empotrados (1 cada 1,5 m² de falso techo)", "ud", down, 28),
        s("Plafones y colgantes en salón y dormitorios", "ud", secas.filter((e) => tipo(e) !== "pasillo").length + 1, 55),
        s("Montaje y conexión", "ud", down + secas.length, 8),
      ];
    }
    default: {
      const d = DESCOMPOSICION[l.tarifaId];
      if (!d) return [];
      return d.map(([concepto, peso]) => s(concepto, l.unidad, q, peso));
    }
  }
}

/** Importe y precio unitario de cada subpartida, repartiendo el importe de la partida. */
export function valorarSubpartidas(l: LineaEstimacion): { concepto: string; unidad: string; cantidad: number; precio: number; importe: number }[] {
  const subs = (l.subpartidas ?? []).filter((x) => x.cantidad > 0);
  const pesos = subs.map((x) => x.cantidad * x.rel);
  const totalPeso = pesos.reduce((a, b) => a + b, 0);
  const total = Math.round(l.cantidad * l.precio * 100) / 100;
  if (!totalPeso) return [];
  let acumulado = 0;
  return subs.map((x, i) => {
    const importe = i === subs.length - 1 ? Math.round((total - acumulado) * 100) / 100 : Math.round(((total * pesos[i]) / totalPeso) * 100) / 100;
    acumulado += importe;
    return { concepto: x.concepto, unidad: x.unidad, cantidad: x.cantidad, precio: Math.round((importe / x.cantidad) * 100) / 100, importe };
  });
}
