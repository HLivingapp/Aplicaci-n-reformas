import type { Estimacion } from "./estimacion";
import type { DatosReforma, Vivienda } from "./types";

/**
 * Fases de la reforma deducidas de las respuestas del cliente y de la cotización.
 *
 * Las duraciones son días laborables con una cuadrilla habitual (2-3 operarios)
 * y salen de rendimientos aproximados por m² o por unidad. Son orientativas:
 * la empresa las ajusta en la obra.
 */
export interface FasePlan {
  clave: string;
  nombre: string;
  /** Explicación sencilla para el cliente */
  explicacion: string;
  /** Días laborables */
  dias: number;
  tareas: string[];
  /** "antes": preparación previa a entrar en la vivienda. "obra": trabajos en la vivienda. */
  momento: "antes" | "obra";
  /** Se hace a la vez que la fase anterior (no suma al plazo total) */
  enParalelo?: boolean;
  /** Día laborable en que empieza, contado desde el inicio de su bloque (antes / obra) */
  inicio: number;
}

export interface PlanFases {
  fases: FasePlan[];
  /** Días laborables de obra (sin contar la preparación previa) */
  diasObra: number;
  diasAntes: number;
  /** Semanas de obra, horquilla orientativa */
  semanasMin: number;
  semanasMax: number;
}

/** Rendimientos por día de la cuadrilla. Valores orientativos, a revisar con la empresa. */
export const RENDIMIENTOS = {
  demolicionM2Dia: 12,
  picadoSueloM2Dia: 40,
  desmontajeTechoM2Dia: 60,
  tabiqueriaM2Dia: 16,
  electricidadM2Dia: 16,
  puntosAguaDia: 4,
  yesosM2Dia: 16,
  falsoTechoM2Dia: 15,
  alicatadoM2Dia: 10,
  ventanasDia: 3,
  pinturaM2Dia: 35,
  laminadoM2Dia: 25,
  porcelanicoM2Dia: 12,
  puertasDia: 4,
  splitsDia: 2,
};

const techo = Math.ceil;
const cantidad = (e: Estimacion, id: string) => e.lineas.find((l) => l.tarifaId === id)?.cantidad ?? 0;
const tiene = (e: Estimacion, id: string) => cantidad(e, id) > 0;

export function planificarFases(e: Estimacion, v: Vivienda, r: DatosReforma, R = RENDIMIENTOS): PlanFases {
  const integral = r.alcance === "integral";
  const m2c = v.catastro?.superficie ?? v.m2 ?? 70;
  const fases: FasePlan[] = [];
  const add = (f: Omit<FasePlan, "inicio">) => f.dias > 0 && fases.push({ ...f, inicio: 0, dias: Math.max(1, Math.round(f.dias)) });

  const hayCocina = tiene(e, "cocina");
  const nBanos = cantidad(e, "equip_bano");
  const ventanas = cantidad(e, "ventana") + cantidad(e, "ventanal");
  const redistribuye = tiene(e, "albanileria_redistribucion");
  const elecCompleta = tiene(e, "elec_completa");
  const puntosAgua = cantidad(e, "fonta_punto");
  const conductos = tiene(e, "conductos");
  const sueloPorcelanico = cantidad(e, "suelo_porcelanico");
  const sueloLaminado = cantidad(e, "suelo_laminado");
  const sinAscensor = v.tipo !== "casa" && v.ascensor === false && (v.planta ?? 0) >= 3;

  // --- Antes de entrar en la vivienda ---
  add({
    clave: "diseno",
    nombre: "Diseño y elección de materiales",
    explicacion:
      "Visitamos la vivienda, tomamos medidas y preparamos el plano definitivo. Contigo elegimos acabados, cocina y baños, y cerramos el presupuesto final.",
    dias: integral ? 10 : 5,
    tareas: ["Visita y medición", "Plano definitivo", "Elección de materiales", "Presupuesto cerrado"],
    momento: "antes",
  });
  add({
    clave: "permisos",
    nombre: "Permisos y pedidos",
    explicacion:
      "Tramitamos el permiso de obra del Ayuntamiento y avisamos a la comunidad. A la vez pedimos lo que tarda en llegar, como ventanas y muebles de cocina.",
    dias: ventanas || hayCocina ? 15 : 10,
    tareas: ["Declaración responsable o licencia", "Aviso a la comunidad", ventanas ? "Pedido de ventanas" : "", hayCocina ? "Pedido de cocina" : ""].filter(Boolean),
    momento: "antes",
    enParalelo: true,
  });

  // --- Obra ---
  const diasDemolicion = integral
    ? Math.max(4, m2c / R.demolicionM2Dia) +
      (cantidad(e, "dem_suelo_ceramico") + cantidad(e, "dem_suelo_terrazo")) / R.picadoSueloM2Dia +
      cantidad(e, "dem_falso_techo") / R.desmontajeTechoM2Dia +
      (sinAscensor ? 1 : 0)
    : 2 * cantidad(e, "dem_estancia");
  add({
    clave: "demolicion",
    nombre: "Protección y demolición",
    explicacion: [
      "Protegemos portal, ascensor y zonas comunes, y retiramos lo que se va a cambiar.",
      tiene(e, "dem_suelo_ceramico") || tiene(e, "dem_suelo_terrazo") ? "Se pica el suelo actual." : "",
      tiene(e, "dem_falso_techo") ? "Se desmonta el falso techo existente." : "",
      "Es la fase más ruidosa y genera más escombro.",
    ].filter(Boolean).join(" "),
    dias: diasDemolicion,
    tareas: ["Proteger zonas comunes", "Demoler y retirar escombros", tiene(e, "dem_falso_techo") ? "Desmontar falso techo" : "", tiene(e, "dem_suelo_ceramico") || tiene(e, "dem_suelo_terrazo") ? "Picar suelo" : ""].filter(Boolean),
    momento: "obra",
  });

  if (redistribuye || r.moverCocina) {
    add({
      clave: "tabiqueria",
      nombre: "Nueva distribución",
      explicacion: r.moverCocina
        ? "Levantamos los tabiques nuevos y preparamos la cocina en su nuevo sitio: desagües y salida de humos."
        : "Levantamos los tabiques nuevos para crear la distribución que has elegido.",
      dias: Math.max(3, (redistribuye ? m2c : 30) / R.tabiqueriaM2Dia) + (r.moverCocina ? 1 : 0),
      tareas: ["Replanteo de tabiques", "Tabiquería", r.moverCocina ? "Traslado de cocina" : ""].filter(Boolean),
      momento: "obra",
    });
  }

  const diasElec = elecCompleta ? m2c / R.electricidadM2Dia : tiene(e, "elec_adaptar") ? 2 : 0;
  const diasFonta = puntosAgua ? puntosAgua / R.puntosAguaDia : tiene(e, "fonta_adaptar") ? cantidad(e, "fonta_adaptar") : 0;
  if (diasElec || diasFonta || conductos) {
    add({
      clave: "instalaciones",
      nombre: "Instalaciones",
      explicacion: [
        elecCompleta ? "Hacemos la instalación eléctrica nueva con cuadro y boletín." : diasElec ? "Adaptamos la instalación eléctrica." : "",
        puntosAgua ? "Renovamos fontanería y desagües." : diasFonta ? "Adaptamos las tomas de agua." : "",
        conductos ? "Instalamos los conductos del aire acondicionado." : "",
        "Todo queda dentro de paredes y suelos, por eso va antes de cerrar.",
      ].filter(Boolean).join(" "),
      dias: Math.max(diasElec, diasFonta) + (diasElec && diasFonta ? 2 : 0) + (conductos ? 3 : 0),
      tareas: [diasFonta ? "Fontanería y saneamiento" : "", diasElec ? "Electricidad" : "", conductos ? "Conductos de climatización" : "", "Pruebas de instalaciones"].filter(Boolean),
      momento: "obra",
    });
  }

  if (integral || redistribuye) {
    add({
      clave: "yesos",
      nombre: "Yesos y recrecidos",
      explicacion: "Cerramos rozas, dejamos paredes lisas y nivelamos el suelo para los acabados.",
      dias: m2c / R.yesosM2Dia,
      tareas: ["Cerrar rozas", "Guarnecido de paredes", "Recrecido y nivelado de suelo"],
      momento: "obra",
    });
  }

  if (tiene(e, "falso_techo")) {
    add({
      clave: "falso_techo",
      nombre: "Falsos techos",
      explicacion: tiene(e, "dem_falso_techo")
        ? "Montamos el techo nuevo de placa de yeso en toda la vivienda."
        : conductos
          ? "Bajamos el techo en baños, cocina y pasillo para esconder instalaciones y conductos."
          : "Bajamos el techo en baños y cocina para esconder instalaciones y extracción.",
      dias: cantidad(e, "falso_techo") / R.falsoTechoM2Dia,
      tareas: ["Estructura", "Placas y juntas"],
      momento: "obra",
    });
  }

  if (tiene(e, "alicatado_mo")) {
    add({
      clave: "alicatado",
      nombre: nBanos && hayCocina ? "Alicatado de baños y cocina" : nBanos ? "Alicatado de baños" : "Alicatado de cocina",
      explicacion: "Colocamos azulejos y suelos de baños y el frente de cocina, y dejamos instalados platos de ducha y bañeras.",
      dias: cantidad(e, "alicatado_mo") / R.alicatadoM2Dia,
      tareas: ["Impermeabilización", "Alicatado", "Solado de baños", "Plato de ducha o bañera"],
      momento: "obra",
    });
  }

  if (ventanas) {
    add({
      clave: "ventanas",
      nombre: "Ventanas",
      explicacion: "Cambiamos las ventanas. Se hace a la vez que otros trabajos y no alarga la obra.",
      dias: ventanas / R.ventanasDia,
      tareas: ["Retirar ventanas", "Colocar ventanas nuevas", "Sellado"],
      momento: "obra",
      enParalelo: true,
    });
  }

  if (sueloPorcelanico) {
    add({
      clave: "suelo",
      nombre: "Suelo porcelánico",
      explicacion: "Colocamos el suelo porcelánico en toda la vivienda antes de pintar.",
      dias: sueloPorcelanico / R.porcelanicoM2Dia,
      tareas: ["Solado", "Rodapiés"],
      momento: "obra",
    });
  }

  if (tiene(e, "pintura")) {
    add({
      clave: "pintura",
      nombre: "Pintura",
      explicacion: "Alisamos y pintamos paredes y techos.",
      dias: cantidad(e, "pintura") / R.pinturaM2Dia,
      tareas: ["Alisado", "Imprimación", "Pintura final"],
      momento: "obra",
    });
  }

  if (sueloLaminado) {
    add({
      clave: "suelo",
      nombre: "Suelo laminado",
      explicacion: "Colocamos el suelo laminado al final, para que no se estropee con el resto de trabajos.",
      dias: sueloLaminado / R.laminadoM2Dia,
      tareas: ["Nivelado", "Suelo laminado", "Rodapiés"],
      momento: "obra",
    });
  }

  const puertas = cantidad(e, "puerta_paso") + cantidad(e, "puerta_entrada");
  if (hayCocina || puertas) {
    add({
      clave: "carpinteria",
      nombre: hayCocina && puertas ? "Cocina y puertas" : hayCocina ? "Montaje de cocina" : "Puertas",
      explicacion: [hayCocina ? "Montamos los muebles de cocina, la encimera y los electrodomésticos." : "", puertas ? "Colocamos las puertas." : ""].filter(Boolean).join(" "),
      dias: (hayCocina ? 3 : 0) + puertas / R.puertasDia,
      tareas: [hayCocina ? "Muebles y encimera" : "", hayCocina ? "Electrodomésticos" : "", puertas ? "Puertas" : ""].filter(Boolean),
      momento: "obra",
    });
  }

  const splits = cantidad(e, "split");
  const equipos = splits || conductos || tiene(e, "caldera_gas") || tiene(e, "termo") || tiene(e, "aerotermia_clima") || tiene(e, "aerotermia_acs") || tiene(e, "radiadores");
  add({
    clave: "remates",
    nombre: "Montaje final",
    explicacion: [
      nBanos ? "Colocamos sanitarios, mamparas y grifería." : "",
      "Ponemos enchufes, interruptores y luces.",
      equipos ? "Instalamos y probamos climatización y agua caliente." : "",
    ].filter(Boolean).join(" "),
    dias: 2 + (nBanos ? 1 : 0) + (splits ? splits / R.splitsDia : 0) + (conductos || tiene(e, "aerotermia_clima") ? 2 : 0),
    tareas: [nBanos ? "Sanitarios y grifería" : "", "Mecanismos y luminarias", equipos ? "Climatización y agua caliente" : "", elecCompleta ? "Boletín eléctrico" : ""].filter(Boolean),
    momento: "obra",
  });

  add({
    clave: "entrega",
    nombre: "Limpieza y entrega",
    explicacion: "Limpiamos a fondo, repasamos contigo cada detalle y te entregamos las llaves.",
    dias: 2,
    tareas: ["Limpieza final", "Repaso con el cliente", "Entrega de llaves"],
    momento: "obra",
  });

  // Calendario: cada fase empieza al acabar la anterior; las que van en paralelo, a la vez que ella.
  const duracion = { antes: 0, obra: 0 };
  const cursor = { antes: 0, obra: 0 };
  let anterior = { antes: 0, obra: 0 };
  for (const f of fases) {
    const m = f.momento;
    f.inicio = f.enParalelo ? anterior[m] : cursor[m];
    if (!f.enParalelo) {
      anterior = { ...anterior, [m]: f.inicio };
      cursor[m] = f.inicio + f.dias;
    }
    duracion[m] = Math.max(duracion[m], f.inicio + f.dias);
  }
  const diasObra = duracion.obra;
  const diasAntes = duracion.antes;
  const semanas = diasObra / 5;
  return {
    fases,
    diasObra,
    diasAntes,
    semanasMin: Math.max(1, Math.floor(semanas * 0.9)),
    semanasMax: techo(semanas * 1.15),
  };
}
