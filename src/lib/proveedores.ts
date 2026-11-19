/**
 * Homologación de proveedores (reformistas). Funciones puras que usan el servidor
 * y el modo demostración. Un proveedor solo puede mostrarse a clientes si el equipo
 * lo ha aprobado y todos sus documentos obligatorios son válidos y están en vigor.
 */
import { hoy } from "./calc";
import { nuevoId, nuevoToken } from "./id";
import { mismoNombre, type ResultadoREA } from "./rea";
import type { Datos, DocumentoProveedor, ObraReferencia, Proveedor, TipoDocProveedor } from "./types";

export const TEXTO_CONSENTIMIENTO_PROVEEDOR =
  "Acepto que la empresa trate los datos y documentos que aporto para homologarme como proveedor, comprobar su validez y ponerme en contacto con clientes, según la política de privacidad. Declaro que la información es veraz.";

export const TEXTO_DECLARACION_RESPONSABLE =
  "Declaro bajo mi responsabilidad que todos los datos y documentos que aporto son verdaderos, están en vigor y corresponden a la empresa o autónomo que represento, y que tengo capacidad para firmar en su nombre. Me comprometo a mantenerlos en vigor y a actualizarlos en cuanto cambien (baja en el REA, fin del seguro, deudas con Hacienda o la Seguridad Social). Acepto que la empresa haga comprobaciones aleatorias y me pida los originales. Sé que cualquier falsedad u omisión supone la baja inmediata en la plataforma y la pérdida de mis valoraciones, sin perjuicio de las acciones legales que correspondan.";

const LETRAS_DNI = "TRWAGMYFPDXBNJZSQVHLCKE";

/** Comprueba el dígito o letra de control de un DNI, NIE o CIF español. */
export function nifValido(entrada: string): boolean {
  const n = entrada.toUpperCase().replace(/[\s.-]/g, "");
  if (/^\d{8}[A-Z]$/.test(n)) return LETRAS_DNI[Number(n.slice(0, 8)) % 23] === n[8];
  if (/^[XYZ]\d{7}[A-Z]$/.test(n)) return LETRAS_DNI[Number("XYZ".indexOf(n[0]) + n.slice(1, 8)) % 23] === n[8];
  const m = /^([ABCDEFGHJNPQRSUVW])(\d{7})([0-9A-J])$/.exec(n);
  if (!m) return false;
  const d = m[2].split("").map(Number);
  let suma = 0;
  d.forEach((x, i) => (suma += i % 2 ? x : Math.floor((x * 2) / 10) + ((x * 2) % 10)));
  const digito = (10 - (suma % 10)) % 10;
  const letra = "JABCDEFGHI"[digito];
  if ("PQRSNW".includes(m[1])) return m[3] === letra;
  if ("ABEH".includes(m[1])) return m[3] === String(digito);
  return m[3] === letra || m[3] === String(digito);
}

export const ESPECIALIDADES = [
  { valor: "reforma_integral", texto: "Reforma integral" },
  { valor: "demolicion", texto: "Demolición y desescombro" },
  { valor: "albanileria", texto: "Albañilería y tabiquería" },
  { valor: "pladur", texto: "Pladur y falsos techos" },
  { valor: "fontaneria", texto: "Fontanería" },
  { valor: "electricidad", texto: "Electricidad" },
  { valor: "climatizacion", texto: "Climatización y aerotermia" },
  { valor: "gas", texto: "Gas y calderas" },
  { valor: "alicatado", texto: "Alicatado y solados" },
  { valor: "suelos", texto: "Suelos laminados y tarima" },
  { valor: "pintura", texto: "Pintura" },
  { valor: "carpinteria", texto: "Carpintería y puertas" },
  { valor: "ventanas", texto: "Ventanas y aluminio" },
  { valor: "cocinas", texto: "Montaje de cocinas" },
  { valor: "banos", texto: "Baños completos" },
  { valor: "cristaleria", texto: "Cristalería y mamparas" },
] as const;

const DISTRITOS_MADRID = [
  "Arganzuela", "Barajas", "Carabanchel", "Centro", "Chamartín", "Chamberí", "Ciudad Lineal", "Fuencarral-El Pardo", "Hortaleza", "Latina", "Moncloa-Aravaca",
  "Moratalaz", "Puente de Vallecas", "Retiro", "Salamanca", "San Blas-Canillejas", "Tetuán", "Usera", "Vicálvaro", "Villa de Vallecas", "Villaverde",
];
const MUNICIPIOS_MADRID = [
  "Alcalá de Henares", "Alcobendas", "Alcorcón", "Boadilla del Monte", "Collado Villalba", "Coslada", "Fuenlabrada", "Getafe", "Las Rozas", "Leganés", "Majadahonda",
  "Móstoles", "Parla", "Pozuelo de Alarcón", "Rivas-Vaciamadrid", "San Sebastián de los Reyes", "Torrejón de Ardoz", "Tres Cantos", "Valdemoro",
];
/** Zonas para empezar en Madrid: "Madrid capital" cubre todos los distritos. */
export const ZONAS = ["Madrid capital", ...DISTRITOS_MADRID.map((d) => `Madrid - ${d}`), ...MUNICIPIOS_MADRID, "Resto de la Comunidad de Madrid"];

export const DOCUMENTOS: Record<TipoDocProveedor, { texto: string; ayuda: string; caduca: boolean; mesesPorDefecto?: number }> = {
  rea: { texto: "Certificado de inscripción en el REA", ayuda: "Registro de Empresas Acreditadas (se renueva cada 3 años).", caduca: true, mesesPorDefecto: 36 },
  prl_modalidad: { texto: "Modalidad preventiva", ayuda: "Contrato con el servicio de prevención ajeno o documento de tu modalidad.", caduca: true, mesesPorDefecto: 12 },
  prl_evaluacion: { texto: "Evaluación de riesgos y planificación preventiva", ayuda: "", caduca: false },
  prl_formacion: { texto: "Formación en PRL de los trabajadores", ayuda: "Certificados de formación (20 h construcción o según puesto).", caduca: false },
  rc_poliza: { texto: "Póliza de responsabilidad civil", ayuda: "Condiciones particulares con el capital asegurado.", caduca: true, mesesPorDefecto: 12 },
  rc_recibo: { texto: "Recibo pagado del seguro", ayuda: "Último recibo de la póliza de RC.", caduca: true, mesesPorDefecto: 12 },
  hacienda: {
    texto: "Certificado de estar al corriente con Hacienda",
    ayuda: "Certificado de contratistas y subcontratistas o de estar al corriente, descargado de la sede electrónica de la AEAT. Lo comprobamos automáticamente con su código seguro de verificación (CSV).",
    caduca: true,
    mesesPorDefecto: 12,
  },
  seguridad_social: { texto: "Certificado de estar al corriente con la Seguridad Social", ayuda: "Se descarga en Import@ss o la sede de la Seguridad Social.", caduca: true, mesesPorDefecto: 6 },
  cuentas: { texto: "Cuentas anuales depositadas", ayuda: "Último depósito en el Registro Mercantil. Autónomos: última declaración de la renta o modelo 130.", caduca: true, mesesPorDefecto: 18 },
};

export const OBRAS_MINIMAS = 3;
/** Documentos que se comprueban con su código seguro de verificación */
export const CON_CSV: TipoDocProveedor[] = ["hacienda"];
export const csvValido = (c: string) => /^[A-Z0-9]{16}$/.test(c);
export const DIAS_AVISO = 30;

export function sumarMeses(fecha: string, meses: number) {
  const d = new Date(fecha + "T00:00:00Z");
  d.setUTCMonth(d.getUTCMonth() + meses);
  return d.toISOString().slice(0, 10);
}
const diasEntre = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

type Doc = Omit<DocumentoProveedor, "ruta">;
/** Lo común a la ficha completa y a la que ve el propio proveedor. */
export type ProveedorBase = Omit<Proveedor, "token" | "notasInternas" | "documentos"> & { documentos: Doc[] };

export type SituacionDoc = "pendiente" | "rechazado" | "caducado" | "caduca_pronto" | "valido";

export function situacionDoc(d: Doc, h = hoy()): SituacionDoc {
  if (d.estado !== "valido") return d.estado;
  if (d.caduca && d.caduca < h) return "caducado";
  if (d.caduca && diasEntre(h, d.caduca) <= DIAS_AVISO) return "caduca_pronto";
  return "valido";
}

/** El documento de ese tipo que cuenta: el válido más reciente; si no hay, el último subido. */
export function docActual<D extends Doc>(p: { documentos: D[] }, tipo: TipoDocProveedor, h = hoy()): D | undefined {
  const deTipo = p.documentos.filter((d) => d.tipo === tipo).sort((a, b) => b.subido.localeCompare(a.subido));
  return deTipo.find((d) => ["valido", "caduca_pronto"].includes(situacionDoc(d, h))) ?? deTipo[0];
}
const vigente = (p: { documentos: Doc[] }, t: TipoDocProveedor, h: string) => {
  const d = docActual(p, t, h);
  return !!d && ["valido", "caduca_pronto"].includes(situacionDoc(d, h));
};

export interface Requisito {
  clave: string;
  texto: string;
  ok: boolean;
  /** Documentos que lo cumplen */
  documentos: TipoDocProveedor[];
}

/** Cómo acredita la prevención: comprobado en el REA, con el certificado del REA (si no se pudo consultar) o con la documentación de PRL. */
export function viaPrevencion(p: Pick<Proveedor, "rea" | "reaVerificado">): "rea_comprobado" | "rea_certificado" | "prl" {
  const r = p.reaVerificado?.resultado;
  if (r === "alta") return "rea_comprobado";
  if (p.rea.inscrito && r !== "no_consta" && r !== "baja") return "rea_certificado";
  return "prl";
}

/** Qué documentos tiene que aportar este proveedor (el REA sustituye a los tres de PRL). */
export function documentosExigidos(p: Pick<Proveedor, "rea" | "reaVerificado">): TipoDocProveedor[] {
  const via = viaPrevencion(p);
  const prevencion: TipoDocProveedor[] = via === "rea_comprobado" ? [] : via === "rea_certificado" ? ["rea"] : ["prl_modalidad", "prl_evaluacion", "prl_formacion"];
  return [...prevencion, "rc_poliza", "rc_recibo", "hacienda", "seguridad_social", "cuentas"];
}

function prevencion(p: ProveedorBase, h: string): Requisito {
  const via = viaPrevencion(p);
  if (via === "rea_comprobado")
    return { clave: "prevencion", texto: `Inscrito en el REA (comprobado en el registro oficial el ${p.reaVerificado!.fecha.slice(0, 10)})`, ok: true, documentos: [] };
  const docs = documentosExigidos(p).filter((t) => t === "rea" || t.startsWith("prl_"));
  const ok = docs.every((t) => vigente(p, t, h));
  if (via === "rea_certificado") return { clave: "prevencion", texto: "Inscripción en el REA en vigor", ok, documentos: docs };
  const noConsta = p.rea.inscrito ? " (no consta en el REA)" : "";
  return { clave: "prevencion", texto: `Prevención de riesgos laborales${noConsta || " (sin REA)"}`, ok, documentos: docs };
}

export function requisitos(p: ProveedorBase, h = hoy()): Requisito[] {
  const docs = (...t: TipoDocProveedor[]) => ({ documentos: t, ok: t.every((x) => vigente(p, x, h)) });
  return [
    { clave: "datos", texto: "Datos de la empresa completos", ok: !!(p.razonSocial && nifValido(p.nif) && p.contacto && (p.telefono || p.email)), documentos: [] },
    prevencion(p, h),
    { clave: "rc", texto: "Seguro de responsabilidad civil en vigor", ...docs("rc_poliza", "rc_recibo") },
    { clave: "corriente", texto: "Al corriente con Hacienda y Seguridad Social", ...docs("hacienda", "seguridad_social") },
    { clave: "cuentas", texto: "Cuentas anuales depositadas", ...docs("cuentas") },
    { clave: "obras", texto: `Al menos ${OBRAS_MINIMAS} obras de referencia comprobables`, ok: p.obras.filter((o) => o.descripcion && o.contacto).length >= OBRAS_MINIMAS, documentos: [] },
    { clave: "zonas", texto: "Zonas donde trabaja", ok: p.zonas.length > 0, documentos: [] },
    { clave: "especialidades", texto: "Especialidades", ok: p.especialidades.length > 0, documentos: [] },
  ];
}

export const cumpleRequisitos = (p: ProveedorBase, h = hoy()) => requisitos(p, h).every((r) => r.ok);

/** Solo estos pueden mostrarse a los clientes. */
export const homologado = (p: ProveedorBase, h = hoy()) => p.estado === "aprobado" && cumpleRequisitos(p, h);

/** Documentos válidos que caducan pronto o ya han caducado, de proveedores aprobados. */
export function avisosCaducidad(proveedores: Proveedor[], h = hoy()) {
  return proveedores
    .filter((p) => p.estado === "aprobado")
    .flatMap((p) =>
      documentosExigidos(p).flatMap((t) => {
        const d = docActual(p, t, h);
        const s = d && situacionDoc(d, h);
        return d && (s === "caducado" || s === "caduca_pronto") ? [{ proveedor: p, documento: d, situacion: s, dias: diasEntre(h, d.caduca!) }] : [];
      }),
    )
    .sort((a, b) => a.dias - b.dias);
}

export const CAPITAL_RC_MINIMO = 150_000;

/** Lo que no cuadra y conviene que mire una persona. No bloquea la aprobación automática. */
export function avisos(p: ProveedorBase, h = hoy()): string[] {
  const r: string[] = [];
  if (p.rc.capital && p.rc.capital < CAPITAL_RC_MINIMO) r.push(`Capital del seguro de RC bajo (${p.rc.capital.toLocaleString("es-ES")} €)`);
  for (const d of p.documentos) {
    const info = DOCUMENTOS[d.tipo];
    if (d.caduca && info.mesesPorDefecto && d.caduca > sumarMeses(d.subido, Math.ceil(info.mesesPorDefecto * 1.5)))
      r.push(`${info.texto}: validez hasta ${d.caduca}, más larga de lo normal`);
  }
  const porHuella = new Map<string, Set<TipoDocProveedor>>();
  for (const d of p.documentos) if (d.huella) porHuella.set(d.huella, (porHuella.get(d.huella) ?? new Set()).add(d.tipo));
  for (const tipos of porHuella.values())
    if (tipos.size > 1) r.push(`El mismo archivo se ha subido como: ${[...tipos].map((t) => DOCUMENTOS[t].texto).join(" y ")}`);
  for (const t of CON_CSV) {
    const d = docActual(p, t, h);
    if (d && d.estado === "valido" && d.verificacion?.resultado === "error") r.push(`${DOCUMENTOS[t].texto}: no se pudo comprobar el CSV en la AEAT`);
  }
  const rea = p.reaVerificado;
  if (rea?.resultado === "no_consta" && p.rea.inscrito) r.push("Dice estar inscrito en el REA, pero no consta en el registro oficial: se le piden los documentos de PRL");
  if (rea?.resultado === "baja") r.push(`Consta en el REA con estado "${rea.estado ?? "no en alta"}"`);
  if (rea?.resultado === "error") r.push("No se pudo consultar el REA: se usa el certificado que suba");
  if (rea?.resultado === "alta" && rea.razonSocial && !mismoNombre(rea.razonSocial, p.razonSocial)) r.push(`En el REA figura como "${rea.razonSocial}"`);
  if (rea?.resultado === "alta" && rea.numero && p.rea.numero && rea.numero.replace(/\s/g, "") !== p.rea.numero.replace(/\s/g, "")) r.push(`Número de REA declarado (${p.rea.numero}) distinto del oficial (${rea.numero})`);
  void h;
  return r;
}

/** Guarda una consulta nueva del REA y recalcula la aprobación. */
export function aplicarREA(p: Proveedor, r: ResultadoREA) {
  // Si la consulta falla, se conserva el último resultado conocido
  if (r.resultado === "error" && p.reaVerificado && p.reaVerificado.resultado !== "error") return;
  p.reaVerificado = r;
  aprobarSiCumple(p);
}

/** Se aprueba solo en cuanto cumple todos los requisitos (y no lo ha rechazado o suspendido el equipo). */
export function aprobarSiCumple(p: Proveedor, h = hoy()) {
  if (p.estado === "pendiente" && cumpleRequisitos(p, h)) {
    p.estado = "aprobado";
    p.revisado = h;
    p.aprobadoAutomatico = true;
  }
}

// ---- Lo que envía y ve el propio proveedor -------------------------------------------------

export interface AltaProveedor {
  tipo: Proveedor["tipo"];
  razonSocial: string;
  nif: string;
  contacto: string;
  telefono: string;
  email: string;
  web: string;
  trabajadores: number;
  rea: Proveedor["rea"];
  rc: Proveedor["rc"];
  zonas: string[];
  especialidades: string[];
  obras: ObraReferencia[];
  presentacion: string;
}

export const altaVacia = (): AltaProveedor => ({
  tipo: "empresa",
  razonSocial: "",
  nif: "",
  contacto: "",
  telefono: "",
  email: "",
  web: "",
  trabajadores: 1,
  rea: { inscrito: true, numero: "" },
  rc: { aseguradora: "", capital: 0 },
  zonas: [],
  especialidades: [],
  obras: [0, 1, 2].map(() => ({ descripcion: "", ano: new Date().getFullYear(), importe: 0, contacto: "" })),
  presentacion: "",
});

export function registrarProveedor(d: Datos, a: AltaProveedor, reaVerificado?: ResultadoREA): string {
  const token = nuevoToken();
  d.proveedores.unshift({
    reaVerificado,
    ...a,
    id: nuevoId(),
    token,
    estado: "pendiente",
    documentos: [],
    notasInternas: "",
    creado: hoy(),
    consentimiento: { fecha: new Date().toISOString(), texto: TEXTO_CONSENTIMIENTO_PROVEEDOR },
    declaracion: { fecha: new Date().toISOString(), texto: TEXTO_DECLARACION_RESPONSABLE },
  });
  return token;
}

export type VistaProveedor = Omit<ProveedorBase, "documentos"> & { documentos: Omit<DocumentoProveedor, "ruta" | "huella" | "csv">[] };

export function vistaProveedor(d: Datos, token: string): VistaProveedor | null {
  const p = d.proveedores.find((x) => x.token && x.token === token);
  if (!p) return null;
  const { notasInternas, token: _t, documentos, ...resto } = p;
  void notasInternas;
  void _t;
  return { ...resto, documentos: documentos.map(({ ruta, huella, csv, ...doc }) => (void ruta, void huella, void csv, { ...doc, verificacion: doc.verificacion && { ...doc.verificacion, copiaOficial: undefined } })) };
}

/** Por qué no se acepta un documento al subirlo (o null si vale). */
export function errorDocumento(tipo: TipoDocProveedor, caduca: string | undefined, h = hoy(), csv?: string): string | null {
  if (CON_CSV.includes(tipo) && !csvValido(csv ?? "")) return "Indica el código seguro de verificación (CSV) que aparece en el certificado: 16 letras y números";
  if (!DOCUMENTOS[tipo].caduca) return null;
  if (!caduca) return "Indica hasta qué fecha es válido el documento";
  if (caduca < h) return "El documento ya está caducado: sube uno en vigor";
  if (caduca > sumarMeses(h, 120)) return "La fecha de validez no es correcta";
  return null;
}

/**
 * Añade un documento subido por el proveedor. Bajo su declaración responsable queda
 * válido al momento; si con él completa los requisitos, queda aprobado.
 */
export function anadirDocumento(
  d: Datos,
  token: string,
  doc: Pick<DocumentoProveedor, "id" | "tipo" | "ruta" | "nombre" | "caduca" | "huella" | "csv" | "verificacion">,
): boolean {
  const p = d.proveedores.find((x) => x.token === token);
  if (!p || p.estado === "rechazado" || errorDocumento(doc.tipo, doc.caduca, hoy(), doc.csv)) return false;
  p.documentos.push({ ...doc, subido: hoy(), estado: "valido" });
  aprobarSiCumple(p);
  return true;
}
