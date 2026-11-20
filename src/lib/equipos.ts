import type { NivelMaterial } from "./types";

/**
 * Especificación orientativa de equipos y materiales: marca de referencia («o similar»), modelo o
 * serie y potencia, dimensionados con las medidas de la vivienda y según la gama.
 * Son referencias de mercado; el reformista concreta el modelo exacto en el presupuesto final.
 */
export interface ContextoEquipo {
  /** m² construidos */
  m2c: number;
  /** m² útiles */
  util: number;
  banos: number;
  dormitorios: number;
  nivel: NivelMaterial;
  /** m² de cada estancia, para dimensionar el aire acondicionado */
  salonM2?: number;
}

const porNivel = <T,>(n: NivelMaterial, b: T, m: T, p: T) => (n === "basico" ? b : n === "medio" ? m : p);

/** Primer tamaño comercial que cubre lo necesario. */
const tamano = (necesario: number, tamanos: number[]) => tamanos.find((x) => x >= necesario) ?? tamanos[tamanos.length - 1];

const kw = (n: number) => `${n.toLocaleString("es-ES")} kW`;

export function especificacion(tarifaId: string, c: ContextoEquipo): string | undefined {
  const { nivel: n } = c;
  switch (tarifaId) {
    case "aerotermia_clima": {
      const potencia = tamano(c.util * 0.085, [6, 8, 10, 12, 14, 16]);
      const deposito = c.banos >= 3 ? 250 : c.banos === 2 ? 200 : 150;
      const marca = porNivel(n, "Baxi Platinum BC o Ferroli Omnia", "Daikin Altherma 3 o Panasonic Aquarea", "Daikin Altherma 3 H HT o Mitsubishi Ecodan");
      return `${marca} o similar. Bomba de calor aire-agua de ${kw(potencia)} (para ${Math.round(c.util)} m² útiles), depósito de agua caliente de ${deposito} l, clase energética A+++ en calefacción, COP superior a 4, refrigerante R32, control por wifi.`;
    }
    case "aerotermia_acs": {
      const litros = c.banos >= 3 ? 270 : c.banos === 2 ? 200 : 150;
      const marca = porNivel(n, "Thermor Aéromax o Ariston Nuos", "Ariston Nuos Plus o Daikin Altherma M HW", "Daikin Altherma M HW o Panasonic Aquarea ACS");
      return `${marca} o similar. Bomba de calor para agua caliente de ${litros} l (${c.banos} baño${c.banos === 1 ? "" : "s"}), clase energética A+, COP superior a 3.`;
    }
    case "caldera_gas": {
      const potencia = c.banos >= 3 ? 30 : c.banos === 2 ? 28 : 24;
      const marca = porNivel(n, "Baxi Victoria Condens o Ferroli Bluehelix", "Vaillant ecoTEC pure o Saunier Duval Thema Condens", "Vaillant ecoTEC plus o Viessmann Vitodens 100");
      return `${marca} o similar. Caldera mixta de condensación de ${kw(potencia)} (calefacción y agua caliente para ${c.banos} baño${c.banos === 1 ? "" : "s"}), clase A, con termostato modulante${n === "premium" ? " wifi" : ""}.`;
    }
    case "termo": {
      const litros = c.banos >= 3 ? 150 : c.banos === 2 ? 100 : 80;
      const marca = porNivel(n, "Cointra o Fleck", "Thermor o Ariston Velis", "Ariston Velis Wifi o Thermor Duralis");
      return `${marca} o similar. Termo eléctrico de ${litros} l para ${c.banos} baño${c.banos === 1 ? "" : "s"}${n === "basico" ? "" : ", con modo eco y bajo consumo"}.`;
    }
    case "split": {
      const salon = tamano((c.salonM2 ?? 20) * 0.13, [2.5, 3.5, 5, 7]);
      const marca = porNivel(n, "Hisense o Haier", "Mitsubishi Electric MSZ-HR o Daikin Sensira", "Daikin Perfera o Mitsubishi Electric MSZ-LN");
      return `${marca} o similar. Splits 1x1 bomba de calor, clase A++ o superior, gas R32: ${kw(2.5)} (unas 2.150 frigorías) en cada dormitorio y ${kw(salon)} en el salón.`;
    }
    case "conductos": {
      const potencia = tamano(c.util * 0.1, [5, 7, 10, 12.5, 14]);
      const marca = porNivel(n, "Mitsubishi Heavy o Hisense", "Mitsubishi Electric o Daikin", "Daikin Sky Air con zonificación Airzone");
      return `${marca} o similar. Equipo de conductos de ${kw(potencia)} (unas ${Math.round(potencia * 860).toLocaleString("es-ES")} frigorías) para ${Math.round(c.util)} m² útiles, clase A++, con rejillas de impulsión en cada estancia${n === "premium" ? " y termostato por estancia" : ""}.`;
    }
    case "radiadores": {
      const elementos = Math.ceil((c.util * 90) / 130);
      const marca = porNivel(n, "Ferroli Europa o Baxi Dubal", "Baxi Dubal 70 o Roca Dubal", "Irsap Tesi o radiadores de diseño");
      return `${marca} o similar. Radiadores de aluminio, unos ${elementos} elementos en total (unos 90 W por m² útil), con válvula termostática en cada uno${n === "basico" ? "" : " y toallero en los baños"}.`;
    }
    case "radiador_electrico": {
      const marca = porNivel(n, "Haverland o Cointra", "Ducasa o Haverland Inerzia", "Ducasa Wifi o Rointe Kyros");
      return `${marca} o similar. Emisores secos de bajo consumo de 1.000 a 1.500 W según la estancia, con programación${n === "premium" ? " por wifi" : ""}.`;
    }
    case "suelo_radiante":
      return `${porNivel(n, "Orkli o Giacomini", "Uponor o Rehau", "Uponor o Rehau con control por estancia")} o similar. Tubo PEX de 16 mm sobre panel aislante, colectores con caudalímetros y un circuito por estancia.`;
    case "elec_completa":
      return `Cuadro con protecciones Schneider o Hager o similar, electrificación elevada (9,2 kW), un circuito por uso. Mecanismos ${porNivel(n, "Simon 27 o BJC Iris", "Simon 82 o Niessen Zenit", "Jung LS990 o Simon 100")} o similar.`;
    case "equip_bano":
      return porNivel(
        n,
        "Sanitarios Roca o Gala o similar, plato de resina, mampara fija de vidrio templado, grifería monomando.",
        "Inodoro suspendido Roca o similar, plato extraplano, mampara de vidrio templado de 8 mm, grifería termostática Hansgrohe o Grohe o similar.",
        "Sanitarios Duravit o Villeroy & Boch o similar, ducha a ras de suelo, grifería empotrada Hansgrohe o Grohe o similar.",
      );
    case "electrodomesticos":
      return porNivel(
        n,
        "Balay o Beko o similar: vitrocerámica, horno, campana, frigorífico y lavavajillas.",
        "Bosch Serie 4 o Siemens iQ300 o similar: placa de inducción, horno multifunción, campana, frigorífico y lavavajillas integrables.",
        "Siemens iQ700 o Neff o similar: inducción de zona libre, horno pirolítico, campana integrada, frigorífico y lavavajillas integrables.",
      );
    case "suelo_laminado":
      return `${porNivel(n, "Laminado AC4 de 8 mm, Faus o similar", "Laminado AC5 hidrófugo, Quick-Step o Faus o similar", "Tarima multicapa de roble, Quick-Step o Kährs o similar")}, con rodapié a juego.`;
    case "suelo_porcelanico":
    case "revest_bano":
    case "revest_cocina":
      return `Cerámica ${porNivel(n, "Baldocer o Argenta", "Porcelanosa, Saloni o Baldocer", "Porcelanosa o Marazzi colecciones de diseño")} o similar.`;
    case "puerta_paso":
      return porNivel(n, "Puerta lisa lacada blanca, herrajes cromados.", "Puerta semimaciza lacada blanca, bisagras y manillas de acero inoxidable.", "Puerta maciza hasta el techo o enrasada, herrajes ocultos y manillas de diseño.");
    case "ventana":
    case "ventanal":
      return porNivel(
        n,
        "Perfil de PVC blanco de 70 mm, oscilobatiente, doble acristalamiento 4/16/4 tipo Climalit, persiana de aluminio.",
        "Perfilería Cortizo o similar (PVC A70 o aluminio COR 70 con rotura de puente térmico), doble acristalamiento tipo Climalit bajo emisivo 4/16/4 con cámara de argón, persiana de aluminio con aislante.",
        "Perfilería Cortizo de aluminio COR Vision o similar, perfil fino con rotura de puente térmico, vidrio tipo Climalit acústico laminado o triple acristalamiento, persiana motorizada.",
      );
    case "luminarias":
      return "Downlights LED empotrados de 7 a 12 W en luz cálida (3.000 K) en falsos techos, y plafones LED en el resto.";
    default:
      return undefined;
  }
}
