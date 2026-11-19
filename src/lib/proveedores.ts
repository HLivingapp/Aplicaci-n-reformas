/**
 * Homologación de proveedores (reformistas). Funciones puras que usan el servidor
 * y el modo demostración. Un proveedor solo puede mostrarse a clientes si el equipo
 * lo ha aprobado y todos sus documentos obligatorios son válidos y están en vigor.
 */
import { hoy } from "./calc";
import { nuevoId, nuevoToken } from "./id";
import type { Datos, DocumentoProveedor, ObraReferencia, Proveedor, TipoDocProveedor } from "./types";

export const TEXTO_CONSENTIMIENTO_PROVEEDOR =
  "Acepto que la empresa trate los datos y documentos que aporto para homologarme como proveedor, comprobar su validez y ponerme en contacto con clientes, según la política de privacidad. Declaro que la información es veraz.";

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
  hacienda: { texto: "Certificado de estar al corriente con Hacienda", ayuda: "Se descarga en la sede electrónica de la AEAT.", caduca: true, mesesPorDefecto: 6 },
  seguridad_social: { texto: "Certificado de estar al corriente con la Seguridad Social", ayuda: "Se descarga en Import@ss o la sede de la Seguridad Social.", caduca: true, mesesPorDefecto: 6 },
  cuentas: { texto: "Cuentas anuales depositadas", ayuda: "Último depósito en el Registro Mercantil. Autónomos: última declaración de la renta o modelo 130.", caduca: true, mesesPorDefecto: 18 },
};

export const OBRAS_MINIMAS = 3;
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

/** Qué documentos tiene que aportar este proveedor (el REA sustituye a los tres de PRL). */
export function documentosExigidos(p: Pick<Proveedor, "rea">): TipoDocProveedor[] {
  const prevencion: TipoDocProveedor[] = p.rea.inscrito ? ["rea"] : ["prl_modalidad", "prl_evaluacion", "prl_formacion"];
  return [...prevencion, "rc_poliza", "rc_recibo", "hacienda", "seguridad_social", "cuentas"];
}

export function requisitos(p: ProveedorBase, h = hoy()): Requisito[] {
  const docs = (...t: TipoDocProveedor[]) => ({ documentos: t, ok: t.every((x) => vigente(p, x, h)) });
  return [
    { clave: "datos", texto: "Datos de la empresa completos", ok: !!(p.razonSocial && p.nif && p.contacto && (p.telefono || p.email)), documentos: [] },
    p.rea.inscrito
      ? { clave: "prevencion", texto: "Inscripción en el REA en vigor", ...docs("rea") }
      : { clave: "prevencion", texto: "Prevención de riesgos laborales (sin REA)", ...docs("prl_modalidad", "prl_evaluacion", "prl_formacion") },
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

export function registrarProveedor(d: Datos, a: AltaProveedor): string {
  const token = nuevoToken();
  d.proveedores.unshift({
    ...a,
    id: nuevoId(),
    token,
    estado: "pendiente",
    documentos: [],
    notasInternas: "",
    creado: hoy(),
    consentimiento: { fecha: new Date().toISOString(), texto: TEXTO_CONSENTIMIENTO_PROVEEDOR },
  });
  return token;
}

export type VistaProveedor = ProveedorBase;

export function vistaProveedor(d: Datos, token: string): VistaProveedor | null {
  const p = d.proveedores.find((x) => x.token && x.token === token);
  if (!p) return null;
  const { notasInternas, token: _t, documentos, ...resto } = p;
  void notasInternas;
  void _t;
  return { ...resto, documentos: documentos.map(({ ruta, ...doc }) => (void ruta, doc)) };
}

/** Añade un documento subido por el proveedor; queda pendiente de revisión. */
export function anadirDocumento(d: Datos, token: string, doc: Pick<DocumentoProveedor, "id" | "tipo" | "ruta" | "nombre" | "caduca">): boolean {
  const p = d.proveedores.find((x) => x.token === token);
  if (!p || p.estado === "rechazado") return false;
  p.documentos.push({ ...doc, subido: hoy(), estado: "pendiente" });
  return true;
}
