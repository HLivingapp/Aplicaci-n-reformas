/**
 * Subvenciones y ventajas fiscales para reformas, por localidad y destinatario.
 * Datos de fuentes oficiales (BOE, BOCM, BOJA, BDNS, AEAT, ayuntamientos), redactados con nuestras palabras.
 * Las convocatorias con código BDNS se actualizan solas (scripts/actualizar-subvenciones.mjs → /datos/bdns.json).
 */
export type Para = "particulares" | "comunidades";
export type Ambito = "estatal" | "madrid-capital" | "comunidad-madrid" | "malaga" | "andalucia";
export type Estado = "abierta" | "en-vigor" | "pendiente" | "suspendida" | "cerrada" | "sin-confirmar";

export const LOCALIDADES: { id: string; texto: string; ambitos: Ambito[] }[] = [
  { id: "madrid", texto: "Madrid capital", ambitos: ["estatal", "comunidad-madrid", "madrid-capital"] },
  { id: "comunidad-madrid", texto: "Resto de la Comunidad de Madrid", ambitos: ["estatal", "comunidad-madrid"] },
  { id: "malaga", texto: "Málaga", ambitos: ["estatal", "andalucia", "malaga"] },
];

export const ESTADOS: Record<Estado, { texto: string; cls: string; orden: number }> = {
  abierta: { texto: "Abierta", cls: "bg-emerald-100 text-emerald-900", orden: 0 },
  "en-vigor": { texto: "En vigor", cls: "bg-emerald-100 text-emerald-900", orden: 1 },
  pendiente: { texto: "Pendiente de convocatoria", cls: "bg-sky-100 text-sky-900", orden: 2 },
  suspendida: { texto: "Suspendida: dinero agotado", cls: "bg-amber-100 text-amber-900", orden: 3 },
  "sin-confirmar": { texto: "Sin confirmar", cls: "bg-stone-200 text-stone-700", orden: 4 },
  cerrada: { texto: "Cerrada", cls: "bg-stone-200 text-stone-600", orden: 5 },
};

export type Subvencion = {
  id: string;
  nombre: string;
  organismo: string;
  ambito: Ambito;
  para: Para[];
  cubre: string;
  importe: string;
  requisitos: string;
  plazo: string;
  /** Fechas de solicitud (aaaa-mm-dd) para saber si está en plazo. */
  desde?: string;
  hasta?: string;
  estado: Estado;
  /** Dinero de la convocatoria. */
  credito?: { total: string; restante?: string; nota: string };
  bdns?: string[];
  url: string;
  comprobado: string;
};

const C = "2026-11-21";

export const SUBVENCIONES: Subvencion[] = [
  // ---------- Estatal ----------
  {
    id: "irpf-eficiencia", nombre: "Deducción en el IRPF por obras de eficiencia energética", organismo: "Agencia Tributaria", ambito: "estatal", para: ["particulares", "comunidades"],
    cubre: "Obras que bajan la demanda de calefacción y refrigeración o el consumo de energía (aislamiento, ventanas, aerotermia…) en tu vivienda o en el edificio.",
    importe: "Deducción del 20 % o del 40 % en obras de la vivienda y del 60 % en obras del edificio (porcentajes de la ley del IRPF; consulta los máximos en la Agencia Tributaria).",
    requisitos: "Certificado energético antes y después de la obra que acredite la mejora. Pago por banco, nunca en efectivo.",
    plazo: "Obras en la vivienda hasta el 31/12/2026; obras del edificio hasta el 31/12/2027 (prórroga del RDL 7/2026).",
    estado: "en-vigor", url: "https://sede.agenciatributaria.gob.es/Sede/todas-noticias/2026/marzo/23/medidas-materia-tributacion.html", comprobado: C,
  },
  {
    id: "iva-10", nombre: "IVA reducido del 10 % en obras de renovación", organismo: "Agencia Tributaria", ambito: "estatal", para: ["particulares", "comunidades"],
    cubre: "Obras de renovación y reparación de viviendas en lugar del 21 % de IVA.",
    importe: "IVA del 10 % en vez del 21 %.",
    requisitos: "Lo contrata un particular para su vivienda, una comunidad de propietarios o quien la alquila como vivienda habitual; edificio terminado hace al menos 2 años; los materiales que pone la empresa no pasan del 40 % del total.",
    plazo: "Permanente.",
    estado: "en-vigor", url: "https://sede.agenciatributaria.gob.es/Sede/iva/iva-operaciones-inmobiliarias/que-tipo-se-aplica-obras-viviendas/obras-renovacion-reparacion.html", comprobado: C,
  },
  {
    id: "plan-estatal-2026", nombre: "Plan Estatal de Vivienda 2026-2030", organismo: "Ministerio de Vivienda (lo convocan las comunidades autónomas)", ambito: "estatal", para: ["particulares", "comunidades"],
    cubre: "Rehabilitación integral de edificios y obras dentro de la vivienda habitual, con más ayuda para hogares vulnerables.",
    importe: "Según cada convocatoria autonómica.",
    requisitos: "Aún sin convenio firmado con la Comunidad de Madrid ni con la Junta de Andalucía.",
    plazo: "Sin convocatoria todavía en Madrid ni en Andalucía.",
    estado: "pendiente", credito: { total: "7.000 M€ para todo el plan y toda España (RD 326/2026)", nota: "Aún no repartido por comunidades." },
    url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-8872", comprobado: C,
  },
  // ---------- Madrid capital ----------
  {
    id: "plan-rehabilita-2026", nombre: "Plan Rehabilita Madrid 2026", organismo: "Ayuntamiento de Madrid", ambito: "madrid-capital", para: ["comunidades", "particulares"],
    cubre: "Comunidades y viviendas unifamiliares: accesibilidad, eficiencia energética, conservación, salubridad y seguridad, con un 5 % más por embellecer la fachada.",
    importe: "Porcentaje según la línea (ver la convocatoria).",
    requisitos: "Edificio en Madrid capital; las obras van por líneas.",
    plazo: "Del 03/06/2026 al 30/09/2026.", desde: "2026-06-03", hasta: "2026-09-30",
    estado: "cerrada", credito: { total: "50 M€ (20 M€ en 2027 y 30 M€ en 2028)", nota: "Saldo no publicado." }, bdns: ["908939"],
    url: "https://www.bocm.es/boletin/CM_Orden_BOCM/2026/06/02/BOCM-20260602-59.PDF", comprobado: C,
  },
  {
    id: "cambia-360", nombre: "Cambia 360: calderas y climatización", organismo: "Ayuntamiento de Madrid", ambito: "madrid-capital", para: ["particulares", "comunidades"],
    cubre: "Cambiar calderas y sistemas de climatización por otros más limpios.",
    importe: "Hasta el 50 %, con máximo de 5.000 € por vivienda y 200.000 € por edificio.",
    requisitos: "Vivienda o edificio en Madrid capital.",
    plazo: "Del 20/04/2026 al 13/11/2026.", desde: "2026-04-20", hasta: "2026-11-13",
    estado: "cerrada", credito: { total: "2,7 M€ en esta línea", nota: "Saldo no publicado." },
    url: "https://diario.madrid.es/blog/2026/04/21/ayudas-cambia-360-madrid-2026-cambio-coche-caldera-punto-recarga-bici/", comprobado: C,
  },
  {
    id: "plan-adapta-2026", nombre: "Plan Adapta 2026 (accesibilidad)", organismo: "Ayuntamiento de Madrid", ambito: "madrid-capital", para: ["particulares", "comunidades"],
    cubre: "Adaptar viviendas de personas con discapacidad o enfermedad rara, y zonas comunes de edificios.",
    importe: "Según la convocatoria.",
    requisitos: "Persona con discapacidad o enfermedad rara en la vivienda, o actuación en zonas comunes.",
    plazo: "Del 28/04/2026 al 27/07/2026.", desde: "2026-04-28", hasta: "2026-07-27",
    estado: "cerrada", credito: { total: "4 M€ (según el anuncio municipal)", nota: "Saldo no publicado." },
    url: "https://sede.madrid.es/", comprobado: C,
  },
  // ---------- Comunidad de Madrid ----------
  {
    id: "cm-next-generation", nombre: "Fondos europeos Next Generation (programas 3, 4 y 5)", organismo: "Comunidad de Madrid", ambito: "comunidad-madrid", para: ["comunidades", "particulares"],
    cubre: "Rehabilitación energética de edificios (programa 3), de viviendas (programa 4) y libro del edificio y proyectos (programa 5).",
    importe: "Según el ahorro energético conseguido.",
    requisitos: "Ya no admite solicitudes: solo se resuelven las presentadas.",
    plazo: "Programa 4 finalizado (BOCM 28/07/2026); programa 3 sin nuevas solicitudes.",
    estado: "cerrada", credito: { total: "Quedan 256,5 M€ del programa 3 para expedientes ya presentados", nota: "Dato de la Comunidad de Madrid del 27/10/2026." },
    url: "https://www.comunidad.madrid/vivienda/ayudas-actuaciones-rehabilitacion-energetica-edificios-residenciales-viviendas-prtr", comprobado: C,
  },
  {
    id: "cm-accesibilidad-2025", nombre: "Ayudas de accesibilidad en edificios y viviendas", organismo: "Comunidad de Madrid", ambito: "comunidad-madrid", para: ["comunidades", "particulares"],
    cubre: "Ascensores, rampas y obras de accesibilidad.",
    importe: "Hasta el 60 %: 12.500 € por vivienda unifamiliar y de 6.000 a 9.000 € por vivienda en edificio.",
    requisitos: "Última convocatoria: 2025. Sin convocatoria 2026 publicada.",
    plazo: "Del 27/05/2025 al 28/07/2025.", desde: "2025-05-27", hasta: "2025-07-28",
    estado: "cerrada", credito: { total: "25,5 M€ (convocatoria 2025)", nota: "Saldo no publicado." },
    url: "https://www.comunidad.madrid/vivienda/ayudas-rehabilitacion-edificios-2025-accesibilidad", comprobado: C,
  },
  {
    id: "cm-incendios", nombre: "Ayudas urgentes por los incendios de la Sierra Oeste", organismo: "Comunidad de Madrid", ambito: "comunidad-madrid", para: ["particulares"],
    cubre: "Reparar viviendas dañadas por esos incendios.",
    importe: "Según el daño (ver la convocatoria).",
    requisitos: "Solo viviendas afectadas por los incendios de la Sierra Oeste.",
    plazo: "Del 11/11/2026 al 11/01/2027.", desde: "2026-11-11", hasta: "2027-01-11",
    estado: "abierta", credito: { total: "8 M€", nota: "Saldo no publicado." }, bdns: ["940275"],
    url: "https://www.comunidad.madrid/vivienda/rehabilitacion", comprobado: C,
  },
  // ---------- Málaga ----------
  {
    id: "imv-rehabilitacion-2026", nombre: "Rehabilitación de edificios 2026", organismo: "Instituto Municipal de la Vivienda de Málaga", ambito: "malaga", para: ["comunidades", "particulares"],
    cubre: "Rehabilitación parcial de edificios, barriadas y líneas especiales.",
    importe: "Según la línea.",
    requisitos: "Edificio en Málaga capital.",
    plazo: "Del 24/03/2026 al 22/05/2026.", desde: "2026-03-24", hasta: "2026-05-22",
    estado: "cerrada", credito: { total: "3 M€", nota: "Saldo no publicado." },
    url: "https://imv.malaga.eu/es/rehabilitacion-edificios/rehabilitacion-de-edificios-2026/", comprobado: C,
  },
  {
    id: "imv-ascensores-2026", nombre: "Ascensores y accesibilidad 2026", organismo: "Instituto Municipal de la Vivienda de Málaga", ambito: "malaga", para: ["comunidades"],
    cubre: "Poner ascensor nuevo, sustituirlo u otras obras de accesibilidad en el edificio.",
    importe: "Del 75 al 90 %, hasta 120.000 € por ascensor nuevo; sustitución del 25 al 50 %, hasta 50.000 €.",
    requisitos: "Al menos la mitad de las viviendas con ingresos por debajo de 4 veces el IPREM.",
    plazo: "Del 15/09/2026 al 13/11/2026.", desde: "2026-09-15", hasta: "2026-11-13",
    estado: "cerrada", credito: { total: "2 M€", nota: "Saldo no publicado." }, bdns: ["927856"],
    url: "https://imv.malaga.eu/es/rehabilitacion-edificios/rehabilitacion-ascensores-2026/", comprobado: C,
  },
  // ---------- Andalucía ----------
  {
    id: "aae-residencial", nombre: "Programa sector residencial (eficiencia energética)", organismo: "Agencia Andaluza de la Energía", ambito: "andalucia", para: ["particulares", "comunidades"],
    cubre: "Aislar fachadas y cubiertas, cambiar ventanas, climatización, aerotermia y fotovoltaica con batería.",
    importe: "Del 50 al 65 % de la inversión para particulares.",
    requisitos: "La obra tiene que subir al menos una letra el certificado energético.",
    plazo: "Abrió el 22/10/2026 con fin previsto el 30/09/2027, pero está suspendida: el dinero se agotó (BOJA 23/10 y 29/10/2026).", desde: "2026-10-22", hasta: "2027-09-30",
    estado: "suspendida", credito: { total: "20,77 M€", restante: "0 €: agotado", nota: "Solo se reabre si la Junta añade dinero." }, bdns: ["930702", "930703", "930704"],
    url: "https://www.juntadeandalucia.es/organismos/universidadindustriaenergiaeinnovacion/servicios/actualidad/noticias/detalle/689725.html", comprobado: C,
  },
  {
    id: "junta-next-generation", nombre: "Fondos europeos Next Generation (programas 3, 4 y 5)", organismo: "Junta de Andalucía", ambito: "andalucia", para: ["comunidades", "particulares"],
    cubre: "Rehabilitación energética de edificios y viviendas, libro del edificio y proyectos.",
    importe: "Según el ahorro energético conseguido.",
    requisitos: "Plazo de solicitud terminado; las obras de edificio tienen prórroga hasta el 30/06/2028.",
    plazo: "Solicitudes hasta el 26/12/2024.", hasta: "2024-12-26",
    estado: "cerrada",
    url: "https://www.juntadeandalucia.es/organismos/fomentoarticulaciondelterritorioyvivienda/areas/vivienda-rehabilitacion/plan-eco-vivienda/paginas/plan-eco-convocatoriarehab.html", comprobado: C,
  },
];

/** Datos que el robot trae de la BDNS cada día (si los hay). */
export type DatoBdns = { titulo?: string; presupuesto?: number; desde?: string; hasta?: string };
export type FicheroBdns = { actualizado: string; convocatorias: Record<string, DatoBdns> };

/** Estado según las fechas: si ya pasó el plazo, cerrada aunque no hayamos revisado la ficha. */
export function estadoActual(s: Subvencion, hoy = new Date().toISOString().slice(0, 10)): Estado {
  if (s.estado === "abierta" && s.hasta && s.hasta < hoy) return "cerrada";
  return s.estado;
}

export const subvencionesPara = (para: Para, localidad: string) => {
  const ambitos = LOCALIDADES.find((l) => l.id === localidad)?.ambitos ?? [];
  return SUBVENCIONES.filter((s) => s.para.includes(para) && ambitos.includes(s.ambito)).sort((a, b) => ESTADOS[estadoActual(a)].orden - ESTADOS[estadoActual(b)].orden);
};
