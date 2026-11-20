/**
 * Comunidad pública de reformas: la gente que está haciendo su obra comparte experiencias
 * (buenas y malas) y acabados, busca problemas parecidos y los profesionales homologados opinan.
 *
 * Privacidad: todo es público, así que se publica con alias, se ocultan teléfonos, emails y
 * enlaces, las fotos se reducen en el navegador (lo que borra la ubicación GPS y los datos EXIF)
 * y cada persona puede borrar lo suyo. En la demo se guarda en el navegador.
 */
export type TipoTema = "buena" | "mala" | "pregunta";
export type Autor = { alias: string; tipo: "particular" | "profesional"; homologado?: boolean };

export interface Mensaje {
  id: string;
  autor: Autor;
  texto: string;
  foto?: string;
  creado: string;
  utiles: number;
  denuncias: number;
  solucion?: boolean;
  /** Huella de la clave secreta de quien lo escribió (para borrar o marcar solución). Nunca se publica. */
  claveHash?: string;
}

export interface RespuestaIA {
  texto: string;
  fuentes: { titulo: string; url: string }[];
  creado: string;
}

export interface Tema extends Mensaje {
  titulo: string;
  categoria: string;
  tipoTema: TipoTema;
  respuestas: Mensaje[];
  /** Opinión del asistente IA (orientativa, con fuentes) */
  respuestaIA?: RespuestaIA;
}

export const CATEGORIA_LEGAL = "Legalizaciones urbanísticas (Madrid)";
export const esLegal = (t: Pick<Tema, "categoria">) => t.categoria === CATEGORIA_LEGAL;

export const CATEGORIAS = [
  "Legalizaciones urbanísticas (Madrid)",
  "Baños",
  "Cocina",
  "Suelos y revestimientos",
  "Ventanas y puertas",
  "Electricidad",
  "Fontanería",
  "Climatización y aerotermia",
  "Pintura y techos",
  "Plazos y obra",
  "Presupuestos y contratos",
  "Comunidad de propietarios",
] as const;

export const TIPOS: { valor: TipoTema; texto: string; icono: string; clase: string }[] = [
  { valor: "buena", texto: "Experiencia positiva", icono: "👍", clase: "bg-emerald-100 text-emerald-800" },
  { valor: "mala", texto: "Experiencia negativa", icono: "⚠️", clase: "bg-amber-100 text-amber-900" },
  { valor: "pregunta", texto: "Pregunta", icono: "❓", clase: "bg-sky-100 text-sky-800" },
];

/** A partir de cuántas denuncias se oculta un mensaje hasta revisarlo. */
export const DENUNCIAS_OCULTAR = 3;

export const TEXTO_CONSENTIMIENTO_FORO =
  "Entiendo que lo que publique será público. Usaré un alias, no pondré mi dirección ni datos de contacto y podré borrar mis mensajes cuando quiera.";

/**
 * Oculta teléfonos, emails, enlaces y direcciones con número: protege la privacidad y evita
 * que los contactos salgan de la plataforma.
 */
export function ocultarContacto(texto: string): string {
  return texto
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[email oculto]")
    .replace(/(https?:\/\/|www\.)\S+/gi, "[enlace oculto]")
    .replace(/(\+34[\s.-]?)?\b[6789](?:[\s.-]?\d){8}\b/g, "[teléfono oculto]")
    .replace(/\b(calle|c\/|avenida|avda\.?|av\.|plaza|pza\.?|paseo|pº)\s+[^\n,.;]{2,40}?\s*,?\s*(n[ºo°.]?\s*)?\d+[^\n,.;]*/gi, "[dirección oculta]");
}

const CLAVE = "app-reformas:foro";
const CLAVE_MIOS = "app-reformas:foro-mios";
const CLAVE_UTILES = "app-reformas:foro-utiles";

function leerJson<T>(clave: string, defecto: T): T {
  try {
    const raw = localStorage.getItem(clave);
    return raw ? (JSON.parse(raw) as T) : defecto;
  } catch {
    return defecto;
  }
}

function escribirJson(clave: string, v: unknown) {
  try {
    localStorage.setItem(clave, JSON.stringify(v));
  } catch {
    /* sin almacenamiento */
  }
}

export function leerForo(): Tema[] {
  const guardado = leerJson<Tema[] | null>(CLAVE, null);
  if (!guardado) return temasIniciales();
  // Añade los temas de ejemplo nuevos sin tocar lo publicado
  for (const t of temasIniciales()) if (!guardado.some((x) => x.id === t.id)) guardado.push(t);
  return guardado;
}
export const guardarForo = (t: Tema[]) => escribirJson(CLAVE, t);

/** Mensajes publicados desde este navegador (para poder borrarlos o marcar la solución). */
export const misMensajes = () => new Set(leerJson<string[]>(CLAVE_MIOS, []));
export const anotarMio = (id: string) => escribirJson(CLAVE_MIOS, [...misMensajes(), id]);
export const misUtiles = () => new Set(leerJson<string[]>(CLAVE_UTILES, []));
export const anotarUtil = (id: string) => escribirJson(CLAVE_UTILES, [...misUtiles(), id]);

export function buscarTemas(temas: Tema[], q: string, categoria: string, tipo: TipoTema | "") {
  const palabras = quitarAcentos(q.toLowerCase()).split(/\s+/).filter(Boolean);
  return temas
    .filter((t) => (!categoria || t.categoria === categoria) && (!tipo || t.tipoTema === tipo))
    .filter((t) => {
      if (!palabras.length) return true;
      const todo = quitarAcentos([t.titulo, t.texto, t.categoria, ...t.respuestas.map((r) => r.texto)].join(" ").toLowerCase());
      return palabras.every((p) => todo.includes(p));
    });
}

const quitarAcentos = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

export const tieneSolucion = (t: Tema) => t.respuestas.some((r) => r.solucion);

const dias = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const m = (id: string, autor: Autor, texto: string, d: number, utiles = 0, extra: Partial<Mensaje> = {}): Mensaje => ({ id, autor, texto, creado: dias(d), utiles, denuncias: 0, ...extra });
const pro = (alias: string): Autor => ({ alias, tipo: "profesional", homologado: true });
const par = (alias: string): Autor => ({ alias, tipo: "particular" });

/** Temas de ejemplo (ficticios) para que la comunidad no empiece vacía. */
export function temasIniciales(): Tema[] {
  return [
    {
      ...m("ej-1", par("Lucía_Chamberí"), "Hicimos el baño hace dos meses con plato de ducha de resina extraplano y ahora en la junta con la pared sale una línea negra. ¿Es moho? ¿Lo tiene que arreglar el reformista o es mantenimiento?", 6, 4),
      titulo: "Moho en la junta del plato de ducha a los dos meses",
      categoria: "Baños",
      tipoTema: "pregunta",
      respuestas: [
        m("ej-1a", pro("Reformista homologado · Madrid sur"), "Casi siempre es la silicona: si se puso sin fungicida o antes de que secara el alicatado, ennegrece pronto. Al ser una obra reciente entra en garantía. Pide que la quiten entera, limpien con lejía diluida, dejen secar 24 h y pongan silicona sanitaria antimoho.", 5, 9, { solucion: true }),
        m("ej-1b", par("Marcos_Getafe"), "Nos pasó igual. Lo resolvieron en una mañana y sin coste.", 4, 2),
      ],
    },
    {
      ...m("ej-2", par("Ana_Vallecas"), "Pusimos laminado AC5 hidrófugo en toda la casa, también en la cocina. Un año después cero problemas, ni con el lavavajillas que goteó una vez. Muy contentos con el cambio respecto al terrazo: la casa es mucho más cálida y se limpia muy fácil.", 12, 7),
      titulo: "Laminado hidrófugo en cocina: un año después, genial",
      categoria: "Suelos y revestimientos",
      tipoTema: "buena",
      respuestas: [m("ej-2a", pro("Reformista homologado · Madrid centro"), "Buena elección. El truco es dejar la junta perimetral de dilatación y sellar bien bajo el fregadero.", 11, 3)],
    },
    {
      ...m("ej-3", par("Pedro_Alcalá"), "Nos dijeron 8 semanas y vamos por la 13. Lo que más ha retrasado ha sido esperar las ventanas: tardaron 6 semanas en fabricarse y nadie las pidió al empezar. Consejo: preguntad desde el primer día cuándo se piden ventanas, cocina y mamparas.", 20, 11),
      titulo: "La obra se alargó 5 semanas por las ventanas",
      categoria: "Plazos y obra",
      tipoTema: "mala",
      respuestas: [
        m("ej-3a", pro("Reformista homologado · Corredor del Henares"), "Muy buen consejo. Las ventanas a medida se toman medidas y se encargan en la primera semana; la cocina, en cuanto están los tabiques. En el contrato de la app quedan los plazos de cada fase, revisadlos.", 19, 6),
      ],
    },
    {
      ...m("ej-4", par("Familia_Tetuán"), "Piso de 85 m² con caldera de gas de 2009. ¿Merece la pena pasar a aerotermia con radiadores normales o hay que poner suelo radiante?", 3, 2),
      titulo: "¿Aerotermia con los radiadores de siempre?",
      categoria: "Climatización y aerotermia",
      tipoTema: "pregunta",
      respuestas: [
        m("ej-4a", pro("Reformista homologado · Madrid norte"), "Se puede con radiadores de baja temperatura o sobredimensionando los actuales (trabajan a 45-50 °C en vez de 70 °C). Con suelo radiante rinde mejor, pero si no vais a levantar el suelo, radiadores de baja temperatura y una máquina de unos 8 kW para 85 m² suele ir bien. Pedid el cálculo de cargas.", 2, 5),
      ],
      respuestaIA: {
        creado: dias(2),
        texto: "Sí, la aerotermia puede funcionar con radiadores, pero rinde mejor cuanto más baja es la temperatura del agua. Con los radiadores de una caldera de gas (pensados para 70 °C) la bomba de calor tendría que trabajar a 55-60 °C y consumiría más. Lo habitual es cambiar a radiadores de baja temperatura o añadir elementos para trabajar a 45-50 °C.\n\nPara 85 m² en Madrid suele salir una máquina de 6 a 8 kW, pero depende del aislamiento y las ventanas: pide el cálculo de cargas. El Código Técnico (documento de ahorro de energía) y el RITE marcan los rendimientos mínimos.\n\nEs una orientación general: un profesional homologado debe confirmarlo en tu caso.",
        fuentes: [{ titulo: "Reglamento de Instalaciones Térmicas en los Edificios (RITE)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2007-15820" }, { titulo: "Código Técnico de la Edificación · DB HE", url: "https://www.codigotecnico.org" }],
      },
    },
    {
      ...m("ej-5", par("Irene_Arganzuela"), "Vamos a reformar el piso entero: tirar dos tabiques, baño y cocina nuevos, ventanas y suelos. ¿Necesito licencia de obra o basta con una declaración responsable? ¿Cuánto tarda?", 5, 8),
      titulo: "¿Licencia o declaración responsable para una reforma integral?",
      categoria: CATEGORIA_LEGAL,
      tipoTema: "pregunta",
      respuestaIA: {
        creado: dias(5),
        texto: "En la ciudad de Madrid, una reforma interior que no toca la estructura ni la fachada se tramita normalmente con declaración responsable: la presentas con la documentación técnica y puedes empezar, sin esperar a una licencia. Tirar tabiques que no son de carga entra aquí. Si algún muro es de carga, o cambias el aspecto de las ventanas en un edificio protegido, ya es licencia y conviene un técnico.\n\nAl presentarla pagas el ICIO (impuesto de obras) y la tasa municipal. Las ventanas que cambien el aspecto de la fachada necesitan además el acuerdo de la comunidad.\n\nEs una orientación general: un profesional homologado o el Ayuntamiento deben confirmarlo en tu caso.",
        fuentes: [{ titulo: "Ordenanza de Licencias y Declaraciones Responsables Urbanísticas (Madrid, 2022)", url: "https://sede.madrid.es" }, { titulo: "Ley 49/1960 de Propiedad Horizontal (BOE)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1960-10906" }],
      },
      respuestas: [
        m("ej-5a", pro("Reformista homologado · Madrid centro"), "Coincido. En la práctica: declaración responsable con memoria y presupuesto, y si hay un tabique dudoso, que un arquitecto o aparejador lo revise antes de tirarlo. Nosotros la presentamos y en 1-2 días se puede empezar.", 4, 6, { solucion: true }),
      ],
    },
    {
      ...m("ej-6", par("Jorge_Carabanchel"), "Queremos cerrar la terraza con aluminio y cristal para ganar un trozo de salón. ¿Es legal? ¿Qué nos va a pedir la comunidad y el Ayuntamiento?", 9, 5),
      titulo: "Cerrar la terraza: ¿qué permisos hacen falta?",
      categoria: CATEGORIA_LEGAL,
      tipoTema: "pregunta",
      respuestaIA: {
        creado: dias(9),
        texto: "Cerrar una terraza cambia la fachada, así que necesitas dos cosas: el acuerdo de la comunidad de propietarios (y que todos los cierres sigan el mismo modelo si ya hay uno aprobado) y el título urbanístico del Ayuntamiento. Además, la superficie cerrada puede contar como edificabilidad: si el edificio ya ha agotado la que permite el planeamiento, el cierre puede no ser legalizable.\n\nPide primero en la comunidad si hay un modelo de cerramiento aprobado y consulta la normativa de tu zona antes de encargarlo.\n\nEs una orientación general: un profesional homologado o el Ayuntamiento deben confirmarlo en tu caso.",
        fuentes: [{ titulo: "Ordenanza de Licencias y Declaraciones Responsables Urbanísticas (Madrid, 2022)", url: "https://sede.madrid.es" }, { titulo: "Ley 49/1960 de Propiedad Horizontal (BOE)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1960-10906" }],
      },
      respuestas: [
        m("ej-6a", pro("Reformista homologado · Madrid sur"), "Muy importante lo del modelo aprobado: en muchas comunidades ya existe y te ahorra la junta. Pedid al instalador perfilería con rotura de puente térmico, si no en invierno es una nevera.", 8, 4),
      ],
    },
  ];
}


/* ---------- Acciones (las mismas en la demo y en el servidor) ---------- */

export type EntradaMensaje = { alias: string; texto: string; foto?: string };
export type Accion =
  | { tipo: "crear"; id: string; titulo: string; categoria: string; tipoTema: TipoTema; mensaje: EntradaMensaje }
  | { tipo: "responder"; id: string; temaId: string; mensaje: EntradaMensaje; tokenProfesional?: string }
  | { tipo: "util" | "denunciar"; temaId: string; mensajeId: string }
  | { tipo: "borrar" | "solucion"; temaId: string; mensajeId: string }
  | { tipo: "ia"; temaId: string };

const FOTO_MAX = 1_500_000;

/** Limpia lo que escribe la gente antes de guardarlo. */
export function mensajeLimpio(id: string, e: EntradaMensaje, autor: Autor, claveHash: string): Mensaje {
  const alias = ocultarContacto(String(e.alias ?? "").trim()).slice(0, 30);
  const texto = ocultarContacto(String(e.texto ?? "").trim()).slice(0, 4000);
  if (alias.length < 3 || texto.length < 10) throw new Error("Escribe un alias y un mensaje un poco más largo.");
  const foto = typeof e.foto === "string" && e.foto.startsWith("data:image/jpeg;base64,") && e.foto.length < FOTO_MAX ? e.foto : undefined;
  return { id, autor: { ...autor, alias: autor.tipo === "profesional" ? autor.alias : alias }, texto, foto, creado: new Date().toISOString(), utiles: 0, denuncias: 0, claveHash };
}

/**
 * Aplica una acción sobre la lista de temas. `claveHash` identifica a quien la hace;
 * `profesional` es su identidad pública si es un reformista homologado comprobado.
 */
export function aplicarAccion(temas: Tema[], a: Exclude<Accion, { tipo: "ia" }>, claveHash: string, profesional?: Autor): Tema[] {
  const n = temas.map((t) => ({ ...t, respuestas: t.respuestas.map((r) => ({ ...r })) }));
  if (a.tipo === "crear") {
    if (!CATEGORIAS.includes(a.categoria as (typeof CATEGORIAS)[number])) throw new Error("Tema no válido");
    if (!TIPOS.some((x) => x.valor === a.tipoTema)) throw new Error("Tipo no válido");
    const titulo = ocultarContacto(String(a.titulo ?? "").trim()).slice(0, 120);
    if (titulo.length < 8) throw new Error("El título es demasiado corto.");
    const m = mensajeLimpio(a.id, a.mensaje, { alias: "", tipo: "particular" }, claveHash);
    return [{ ...m, titulo, categoria: a.categoria, tipoTema: a.tipoTema, respuestas: [] }, ...n];
  }
  const t = n.find((x) => x.id === a.temaId);
  if (!t) throw new Error("El tema no existe");
  if (a.tipo === "responder") {
    t.respuestas.push(mensajeLimpio(a.id, a.mensaje, profesional ?? { alias: "", tipo: "particular" }, claveHash));
    return n;
  }
  const m: Mensaje | undefined = t.id === a.mensajeId ? t : t.respuestas.find((r) => r.id === a.mensajeId);
  if (!m) throw new Error("El mensaje no existe");
  if (a.tipo === "util") m.utiles += 1;
  if (a.tipo === "denunciar") m.denuncias += 1;
  if (a.tipo === "borrar") {
    if (!claveHash || m.claveHash !== claveHash) throw new Error("Solo puedes borrar tus mensajes.");
    if (m === t) return n.filter((x) => x.id !== t.id);
    t.respuestas = t.respuestas.filter((r) => r.id !== m.id);
  }
  if (a.tipo === "solucion") {
    if (!claveHash || t.claveHash !== claveHash) throw new Error("Solo quien preguntó puede marcar la solución.");
    t.respuestas.forEach((r) => (r.solucion = r.id === m.id));
  }
  return n;
}

/** Lo que se publica: sin huellas de clave. */
export const temasPublicos = (temas: Tema[]): Tema[] =>
  temas.map(({ claveHash, ...t }) => {
    void claveHash;
    return { ...t, respuestas: t.respuestas.map(({ claveHash: _c, ...r }) => (void _c, r)) };
  });

export async function huella(clave: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`foro:${clave}`));
  return Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join("");
}

/** Identidad pública de un reformista en el foro: anónima hasta que firma con un cliente. */
export const autorProfesional = (zonas: string[]): Autor => ({ alias: `Reformista homologado${zonas[0] ? ` · ${zonas[0]}` : ""}`, tipo: "profesional", homologado: true });
