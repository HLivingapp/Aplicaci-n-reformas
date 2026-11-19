import { grupoDePartida, opcionElegida } from "./materiales";
import { recargoDe } from "./tarifas";
import type { DatosReforma, Instalacion, NivelMaterial, Tarifas, TramoMedidas, Vivienda } from "./types";

export interface LineaEstimacion {
  tarifaId: string;
  capitulo: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio: number;
  coste: number;
  /** Grupo de acabados que el cliente puede elegir para esta partida */
  grupoMaterial?: string;
}

export interface OpcionMaterialPublica {
  id: string;
  nivel: NivelMaterial;
  nombre: string;
  detalle: string;
  /** Precio de venta (sin IVA) de las partidas del grupo con esta opción */
  precio: number;
}

/** Acabados que el cliente puede elegir en su reforma, con el precio de cada opción. */
export interface EleccionMaterial {
  grupo: string;
  nombre: string;
  elegida: string;
  /** true si la eligió el cliente; false si sale de la calidad general */
  elegidaPorCliente: boolean;
  opciones: OpcionMaterialPublica[];
}

export interface Estancia {
  nombre: string;
  m2: number;
  humeda: boolean;
}

export interface Estimacion {
  m2Utiles: number;
  estancias: Estancia[];
  lineas: LineaEstimacion[];
  /** suma de costes */
  coste: number;
  /** precio de venta sin IVA */
  base: number;
  minimo: number;
  maximo: number;
  avisos: string[];
  materiales: EleccionMaterial[];
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;

export function tramoPara(t: Tarifas, m2Utiles: number): TramoMedidas {
  const orden = [...t.tramos].sort((a, b) => a.hastaM2 - b.hastaM2);
  return orden.find((x) => m2Utiles <= x.hastaM2) ?? orden[orden.length - 1];
}

/** Superficie de cada estancia de la vivienda deseada a partir de las medidas estándar. */
export function repartirEstancias(t: Tarifas, m2Utiles: number, dormitorios: number, banos: number): Estancia[] {
  const tr = tramoPara(t, m2Utiles);
  const lista: Estancia[] = [{ nombre: "Cocina", m2: tr.cocina, humeda: true }];
  for (let i = 0; i < dormitorios; i++) lista.push({ nombre: i === 0 ? "Dormitorio principal" : `Dormitorio ${i + 1}`, m2: i === 0 ? tr.dormitorioPrincipal : tr.dormitorio, humeda: false });
  for (let i = 0; i < banos; i++) lista.push({ nombre: banos > 1 ? `Baño ${i + 1}` : "Baño", m2: tr.bano, humeda: true });
  lista.push({ nombre: "Pasillo y distribuidor", m2: (m2Utiles * tr.pasilloPct) / 100, humeda: false });
  const ocupado = lista.reduce((s, e) => s + e.m2, 0);
  const salon = Math.max(m2Utiles - ocupado, tr.salon * 0.6);
  lista.splice(1, 0, { nombre: "Salón-comedor", m2: salon, humeda: false });
  // Si las medidas estándar no caben, se escalan para que sumen la superficie útil
  const total = lista.reduce((s, e) => s + e.m2, 0);
  const k = total > m2Utiles ? m2Utiles / total : 1;
  return lista.map((e) => ({ ...e, m2: r1(e.m2 * k) }));
}

/** ¿Hay que cambiar esta instalación? Se fuerza si es antigua, o si no se sabe su edad y se mueven tabiques. */
export function debeCambiar(inst: Instalacion, t: Tarifas, cambiaTabiques: boolean, hoyAno = new Date().getFullYear()) {
  if (inst.accion === "cambiar") return { cambiar: true, forzado: false };
  if (inst.ano == null) return { cambiar: cambiaTabiques, forzado: cambiaTabiques };
  if (hoyAno - inst.ano > t.aniosMaxInstalacion) return { cambiar: true, forzado: true };
  return { cambiar: false, forzado: false };
}

export function cambiosDistribucion(v: Vivienda, r: DatosReforma) {
  return Math.abs(r.dormitoriosDeseados - v.dormitorios) + Math.abs(r.banosDeseados - v.banos) + (r.moverCocina ? 1 : 0);
}

/** Primera cotización automática a partir de las respuestas del cliente. */
export function estimar(v: Vivienda, r: DatosReforma, t: Tarifas): Estimacion {
  const m2c = v.catastro?.superficie ?? v.m2 ?? 70;
  const util = r1(m2c * t.coefUtil);
  const estancias = repartirEstancias(t, util, r.dormitoriosDeseados, r.banosDeseados);
  const integral = r.alcance === "integral";
  const quiere = (e: string) => integral || r.estancias.includes(e);
  const avisos: string[] = [];
  const lineas: LineaEstimacion[] = [];
  const factor = t.factorCalidad[r.calidad] ?? 1;

  const add = (id: string, cantidad: number) => {
    const p = t.precios.find((x) => x.id === id);
    if (!p || !(cantidad > 0)) return;
    // Si el cliente puede elegir el acabado de esta partida, manda la opción elegida
    const g = grupoDePartida(t, id);
    const op = g && opcionElegida(g, r);
    const coste = r2(p.coste * (op ? op.factor : p.dependeCalidad ? factor : 1));
    const existente = lineas.find((l) => l.tarifaId === id);
    if (existente) {
      existente.cantidad = r1(existente.cantidad + cantidad);
      return;
    }
    const descripcion = op ? `${p.descripcion} · ${op.nombre}` : p.descripcion;
    lineas.push({ tarifaId: id, capitulo: p.capitulo, descripcion, unidad: p.unidad, cantidad: r1(cantidad), coste, precio: r2(coste * recargoDe(t, p.grupo)), ...(g ? { grupoMaterial: g.id } : {}) });
  };

  const banos = estancias.filter((e) => e.nombre.startsWith("Baño"));
  const cocina = estancias.find((e) => e.nombre === "Cocina")!;
  const pasillo = estancias.find((e) => e.nombre.startsWith("Pasillo"))!;
  const m2Banos = banos.reduce((s, e) => s + e.m2, 0);
  const hazBanos = quiere("Baños");
  const hazCocina = quiere("Cocina");
  const hazSuelos = quiere("Suelos") && r.sueloDeseado !== "mantener";
  const nBanos = hazBanos ? banos.length : 0;
  const cambios = cambiosDistribucion(v, r);
  const cambiaTabiques = cambios > 0 && (integral || r.estancias.includes("Cambio de distribución"));
  const conductos = r.climaDeseado === "conductos" && r.climaDeseado !== r.climaActual && quiere("Calefacción / aire acondicionado");

  // --- Demolición y albañilería ---
  if (integral) add("albanileria_base", m2c);
  else add("dem_estancia", nBanos + (hazCocina ? 1 : 0));
  if (cambiaTabiques) add("albanileria_redistribucion", m2c);
  if (hazSuelos && r.sueloActual === "porcelanico") add("dem_suelo_ceramico", util - m2Banos);
  if (hazSuelos && r.sueloActual === "terrazo") add("dem_suelo_terrazo", util - m2Banos);
  if (r.moverCocina) add("traslado_cocina", 1);

  // --- Techos ---
  let m2FalsoTecho = (hazBanos ? m2Banos : 0) + (hazCocina ? cocina.m2 : 0);
  if (r.techoActual === "falso_techo" && integral) {
    add("dem_falso_techo", util);
    m2FalsoTecho = util;
    avisos.push("Tiene falso techo: se desmonta y se rehace en toda la vivienda.");
  }
  if (r.techoActual === "vigas_vistas") {
    m2FalsoTecho = hazBanos ? m2Banos : 0;
    if (integral) add("vigas", util - m2FalsoTecho);
    avisos.push("Vigas vistas: se tratan y se mantienen; el falso techo se limita a los baños.");
  }
  if (conductos) m2FalsoTecho = Math.max(m2FalsoTecho, m2Banos + cocina.m2 + pasillo.m2);
  add("falso_techo", m2FalsoTecho);
  add("alicatado_mo", nBanos * t.m2AlicatadoBano + (hazCocina ? t.m2AlicatadoCocina : 0));

  // --- Electricidad ---
  const elec = debeCambiar(r.electricidad, t, cambiaTabiques);
  if (elec.forzado) avisos.push(`Electricidad: se renueva porque ${r.electricidad.ano ? `tiene más de ${t.aniosMaxInstalacion} años` : "no se sabe su antigüedad y se mueven tabiques"}.`);
  if (elec.cambiar && quiere("Electricidad")) add("elec_completa", m2c);
  else if (integral || hazBanos || hazCocina) add("elec_adaptar", 1);

  // --- Fontanería ---
  const fonta = debeCambiar(r.fontaneria, t, cambiaTabiques || r.moverCocina);
  if (fonta.forzado) avisos.push(`Fontanería: se renueva porque ${r.fontaneria.ano ? `tiene más de ${t.aniosMaxInstalacion} años` : "no se sabe su antigüedad y cambia la distribución"}.`);
  const puntos = nBanos * t.puntosAguaBano + (hazCocina ? t.puntosAguaCocina : 0);
  if (fonta.cambiar && (integral || r.estancias.includes("Fontanería") || puntos)) add("fonta_punto", puntos || t.puntosAguaBano);
  else add("fonta_adaptar", nBanos + (hazCocina ? 1 : 0));

  // --- Climatización y agua caliente ---
  let caldera = false;
  let aerotermia = false;
  if (quiere("Calefacción / aire acondicionado") && r.climaDeseado && r.climaDeseado !== r.climaActual) {
    switch (r.climaDeseado) {
      case "split": add("split", r.dormitoriosDeseados + 1); break;
      case "conductos": add("conductos", m2c); break;
      case "radiadores_gas": add("radiadores", m2c); add("caldera_gas", 1); caldera = true; break;
      case "radiadores_electricos": add("radiador_electrico", r.dormitoriosDeseados + banos.length + 1); break;
      case "suelo_radiante": add("suelo_radiante", util); break;
      case "aerotermia": add("aerotermia_clima", 1); aerotermia = true; break;
    }
  }
  if (r.acsDeseado && r.acsDeseado !== r.acsActual) {
    if (r.acsDeseado === "caldera_gas" && !caldera) add("caldera_gas", 1);
    if (r.acsDeseado === "termo_electrico") add("termo", 1);
    if (r.acsDeseado === "aerotermia" && !aerotermia) add("aerotermia_acs", 1);
  }

  // --- Pintura y material ---
  if (quiere("Pintura")) add("pintura", m2c * t.paramentosPorM2);
  add("material_obra", integral ? m2c : Math.min(m2c, (m2Banos + (hazCocina ? cocina.m2 : 0)) * 3));

  // --- Compras ---
  if (r.cambiarVentanas || r.estancias.includes("Ventanas")) {
    add("ventana", r.dormitoriosDeseados + 2);
    add("ventanal", v.terrazas.length);
  }
  if (integral) add("puerta_entrada", 1);
  if (quiere("Puertas")) add("puerta_paso", Math.max(2, r.dormitoriosDeseados + banos.length));
  if (hazCocina) {
    add("cocina", 1);
    add("electrodomesticos", 1);
    add("revest_cocina", 1);
  }
  add("equip_bano", nBanos);
  add("revest_bano", nBanos);
  if (integral) add("pavimento_terraza", v.terrazas.length);
  if (hazSuelos) add(r.sueloDeseado === "porcelanico" ? "suelo_porcelanico" : "suelo_laminado", util - m2Banos);
  if (integral) add("luminarias", 1);
  if (lineas.length) {
    add("limpieza", 1);
    add("tasas", 1);
    add("direccion", 1);
  }

  // --- Accesos y avisos ---
  if (v.tipo !== "casa" && v.ascensor === false && (v.planta ?? 0) >= 1) {
    add("sin_ascensor", v.planta ?? 1);
    avisos.push(`Sin ascensor en ${v.planta}ª planta: se suma subir material y bajar escombros.`);
  }
  if (v.anoConstruccion && v.anoConstruccion < 1980) {
    avisos.push(`Edificio de ${v.anoConstruccion}: revisar en la visita bajantes, posible amianto y estado del forjado.`);
  }

  const coste = r2(lineas.reduce((s, l) => s + l.cantidad * l.coste, 0));
  const base = r2(lineas.reduce((s, l) => s + l.cantidad * l.precio, 0));
  const m = t.margenRangoPct / 100;
  // Precio de cada opción de acabado con las cantidades de esta reforma
  const materiales: EleccionMaterial[] = [];
  for (const g of t.materiales) {
    const ls = lineas.filter((l) => l.grupoMaterial === g.id);
    if (!ls.length) continue;
    const elegida = opcionElegida(g, r)!;
    const precioCon = (f: number) =>
      Math.round(
        ls.reduce((s, l) => {
          const p = t.precios.find((x) => x.id === l.tarifaId);
          return s + (p ? l.cantidad * p.coste * f * recargoDe(t, p.grupo) : 0);
        }, 0),
      );
    materiales.push({
      grupo: g.id,
      nombre: g.nombre,
      elegida: elegida.id,
      elegidaPorCliente: r.materiales?.[g.id] === elegida.id,
      opciones: g.opciones.map((op) => ({ id: op.id, nivel: op.nivel, nombre: op.nombre, detalle: op.detalle, precio: precioCon(op.factor) })),
    });
  }
  return {
    m2Utiles: util,
    estancias,
    lineas,
    coste,
    base,
    minimo: Math.round((base * (1 - m)) / 500) * 500,
    maximo: Math.round((base * (1 + m)) / 500) * 500,
    avisos,
    materiales,
  };
}
