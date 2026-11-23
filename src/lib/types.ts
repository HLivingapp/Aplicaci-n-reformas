import type { DetalleReforma } from "./detalle-reforma";
export type EstadoPresupuesto = "borrador" | "enviado" | "aceptado" | "rechazado";
export type EstadoFase = "pendiente" | "en_curso" | "terminada";

export interface Cliente {
  id: string;
  /** Secreto del enlace privado del cliente: /p/<token> */
  token: string;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  creado: string;
}

export interface Partida {
  id: string;
  descripcion: string;
  /** Descripción completa: qué incluye, medición, acabado y qué no incluye */
  detalle?: string;
  /** Partida del tarifario de la que sale, si la hay */
  tarifaId?: string;
  unidad: string;
  cantidad: number;
  /** Precio de venta por unidad, sin IVA */
  precio: number;
  /** Coste interno por unidad (solo lo ve la empresa) */
  coste: number;
}

export interface Capitulo {
  id: string;
  nombre: string;
  partidas: Partida[];
}

export interface Presupuesto {
  id: string;
  numero: string;
  clienteId: string;
  titulo: string;
  direccionObra: string;
  fecha: string;
  validezDias: number;
  estado: EstadoPresupuesto;
  ivaPct: number;
  descuentoPct: number;
  capitulos: Capitulo[];
  notas: string;
  obraId?: string;
  /** Presupuesto de referencia de la vivienda (sin IVA) para comparar la oferta */
  referenciaBase?: number;
  /** Referencia por capítulo (sin IVA), para comparar la oferta capítulo a capítulo */
  referenciaCapitulos?: Record<string, number>;
  respuestaCliente?: { fecha: string; comentario: string };
}

export interface Tarea {
  id: string;
  texto: string;
  hecha: boolean;
}

export interface Fase {
  id: string;
  nombre: string;
  inicio: string;
  fin: string;
  estado: EstadoFase;
  tareas: Tarea[];
}

export interface Novedad {
  id: string;
  fecha: string;
  texto: string;
  visibleCliente: boolean;
}

export interface Obra {
  id: string;
  clienteId: string;
  presupuestoId: string;
  titulo: string;
  direccion: string;
  inicio: string;
  fases: Fase[];
  novedades: Novedad[];
  /** Hitos de pago del contrato: el pago es directo al reformista; ambas partes lo confirman aquí */
  hitos?: HitoPago[];
  /** Cambios y extras pedidos durante la obra, presupuestados y aceptados en la app */
  extras?: Extra[];
  /** Valoraciones del cliente al terminar cada fase */
  valoraciones?: ValoracionFase[];
}

export interface HitoPago {
  id: string;
  nombre: string;
  pct: number;
  /** pendiente → el reformista lo pide al cumplirse → el cliente confirma que ha pagado */
  estado: "pendiente" | "solicitado" | "pagado";
  solicitado?: string;
  pagado?: string;
}

export interface Extra {
  id: string;
  descripcion: string;
  /** Importe sin IVA */
  importe: number;
  /** Precio de referencia del tarifario para lo mismo, si lo hay (sin IVA) */
  referencia?: number;
  fecha: string;
  estado: "propuesto" | "aceptado" | "rechazado";
  respuesta?: { fecha: string; comentario: string };
}

export interface ValoracionFase {
  faseId: string;
  fecha: string;
  puntualidad: number;
  limpieza: number;
  cumplimiento: number;
  comentario: string;
}

export interface Direccion {
  tipoVia: string;
  calle: string;
  numero: string;
  escalera: string;
  planta: string;
  puerta: string;
  codigoPostal: string;
  municipio: string;
  provincia: string;
}

export interface DatosCatastro {
  referencia: string;
  superficie?: number;
  anoConstruccion?: number;
  uso?: string;
  direccionCatastro?: string;
  lat?: number;
  lng?: number;
  consultado: string;
}

export type TipoTerraza = "abierta" | "cerrada";

export interface Vivienda {
  direccion: Direccion;
  catastro?: DatosCatastro;
  /** m² construidos (catastro) */
  m2: number | null;
  anoConstruccion: number | null;
  tipo: "piso" | "casa" | "atico" | "bajo";
  /** número de planta (0 = bajo) */
  planta: number | null;
  ascensor: boolean | null;
  terrazas: TipoTerraza[];
  dormitorios: number;
  banos: number;
  cocinaAbierta: boolean;
}

export type Techo = "falso_techo" | "yeso" | "vigas_vistas";
export type Suelo = "tarima" | "porcelanico" | "terrazo" | "otro";
export type Clima = "ninguna" | "split" | "conductos" | "radiadores_gas" | "radiadores_electricos" | "suelo_radiante" | "aerotermia";
export type Acs = "caldera_gas" | "termo_electrico" | "aerotermia" | "central";
export type Instalacion = { accion: "cambiar" | "mantener"; ano: number | null };

export interface DatosReforma {
  alcance: "integral" | "parcial";
  /** Trabajos concretos (sobre todo en reformas parciales) */
  estancias: string[];
  dormitoriosDeseados: number;
  banosDeseados: number;
  moverCocina: boolean;
  cambiarVentanas: boolean | null;
  sueloDeseado: "laminado" | "porcelanico" | "mantener";
  techoActual: Techo | null;
  sueloActual: Suelo | null;
  climaActual: Clima | null;
  climaDeseado: Clima | null;
  acsActual: Acs | null;
  acsDeseado: Acs | null;
  fontaneria: Instalacion;
  electricidad: Instalacion;
  calidad: "basica" | "media" | "alta";
  /** Acabado elegido por el cliente en cada grupo de materiales: { grupo: opción } */
  materiales?: Record<string, string>;
  presupuestoCliente: string;
  cuando: string;
  viviraEnObra: boolean | null;
  comentarios: string;
  /** Descripción detallada (opcional) para afinar el presupuesto */
  detalle?: DetalleReforma;
}

export type EstadoProyecto = "nuevo" | "visita" | "presupuestado" | "descartado";

export interface Proyecto {
  id: string;
  clienteId: string;
  creado: string;
  /** Texto de consentimiento que aceptó el cliente y cuándo */
  consentimiento?: { fecha: string; texto: string };
  estado: EstadoProyecto;
  vivienda: Vivienda;
  reforma: DatosReforma;
  presupuestoId?: string;
  notasInternas: string;
}

/** Medidas estándar de cada estancia según el tamaño del piso (m² útiles). */
export interface TramoMedidas {
  hastaM2: number;
  cocina: number;
  salon: number;
  dormitorioPrincipal: number;
  dormitorio: number;
  bano: number;
  pasilloPct: number;
}

export type GrupoTarifa = "Mano de obra" | "Compras" | "Impuestos y tasas" | "Dirección de obra";

/** Una línea del tarifario: COSTE por unidad. El precio de venta = coste × (1 + recargo). */
export interface PrecioTarifa {
  id: string;
  grupo: GrupoTarifa;
  capitulo: string;
  descripcion: string;
  unidad: string;
  coste: number;
  /** Si el coste sube o baja con el nivel de acabados */
  dependeCalidad: boolean;
}

export interface Tarifas {
  /** Nombre del tarifario (p. ej. "Genérico" o "Human Living 2024") */
  nombre: string;
  /** % que se suma al coste para obtener el precio de venta */
  recargoPct: number;
  /** % que se suma al coste de los materiales (partidas de «Compras») */
  recargoMaterialesPct: number;
  /** m² útiles / m² construidos */
  coefUtil: number;
  /** m² de paredes + techos a pintar por cada m² útil */
  paramentosPorM2: number;
  /** m² de tabique que se demuelen o construyen por cada estancia que cambia */
  /** m² de alicatado por baño y por frente de cocina */
  m2AlicatadoBano: number;
  m2AlicatadoCocina: number;
  /** puntos de agua (fontanería) por baño y por cocina */
  puntosAguaBano: number;
  puntosAguaCocina: number;
  aniosMaxInstalacion: number;
  margenRangoPct: number;
  /** Recargo propio de algunos capítulos (p. ej. «Carpintería exterior»: 60). Manda sobre los generales. */
  recargoPorCapitulo?: Record<string, number>;
  /**
   * Precio de venta de referencia (€/m² construido, sin IVA) de una reforma integral según la calidad.
   * Si la estimación sale por debajo, se sube hasta esta referencia; los extras se suman encima.
   */
  precioM2Referencia?: Record<"basica" | "media" | "alta", number>;
  factorCalidad: { basica: number; media: number; alta: number };
  tramos: TramoMedidas[];
  precios: PrecioTarifa[];
  /** Catálogo de acabados que elige el cliente (básico, medio, premium) */
  materiales: GrupoMaterial[];
}

export type NivelMaterial = "basico" | "medio" | "premium";

export interface OpcionMaterial {
  id: string;
  nivel: NivelMaterial;
  /** Nombre corto: «Laminado AC5 hidrófugo» */
  nombre: string;
  /** Qué incluye, en lenguaje sencillo */
  detalle: string;
  /** Multiplica el coste de las partidas del grupo (1 = el coste del tarifario) */
  factor: number;
}

/** Grupo de acabados que afecta a una o varias partidas del tarifario. */
export interface GrupoMaterial {
  id: string;
  nombre: string;
  /** Partidas del tarifario a las que se aplica el factor de la opción elegida */
  tarifaIds: string[];
  opciones: OpcionMaterial[];
}

/** Foto de la galería de la empresa (se guarda en un almacén privado; nunca en el repositorio). */
export interface FotoGaleria {
  id: string;
  /** Ruta dentro del almacén privado "galeria" */
  ruta: string;
  /** "resultado": reforma terminada. "obra": foto de una fase en curso. */
  tipo: "resultado" | "obra";
  /** Estancias que se ven: cocina, bano, salon, dormitorio, pasillo, terraza */
  estancias: string[];
  /** Clave de la fase que ilustra (demolicion, instalaciones…), para fotos de obra */
  fase?: string;
  /** Rasgos de la reforma: laminado, porcelanico, falso_techo, vigas, cocina_abierta, armarios… */
  etiquetas: string[];
  /** Solo las aprobadas se enseñan a clientes */
  aprobada: boolean;
  /** Comprobado que no se reconoce la dirección (fachada, vistas, portal, personas, documentos) */
  sinDatosUbicacion: boolean;
  nota: string;
  subida: string;
}

export type TipoDocProveedor = "rea" | "prl_modalidad" | "prl_evaluacion" | "prl_formacion" | "rc_poliza" | "rc_recibo" | "hacienda" | "seguridad_social" | "cuentas";

export interface DocumentoProveedor {
  id: string;
  tipo: TipoDocProveedor;
  /** Ruta en el almacén privado "proveedores" (en demostración, solo el nombre) */
  ruta: string;
  nombre: string;
  subido: string;
  /** Fecha de caducidad que indica el proveedor o corrige el equipo */
  caduca?: string;
  /** Al subirlo queda válido bajo la declaración responsable; el equipo solo interviene si hay avisos */
  estado: "pendiente" | "valido" | "rechazado";
  motivo?: string;
  /** Código seguro de verificación (certificados de la AEAT) */
  csv?: string;
  /** Comprobación automática en el organismo que lo emite */
  verificacion?: { resultado: "autentico" | "no_encontrado" | "error"; fecha: string; copiaOficial?: string };
  /** Huella SHA-256 del archivo, para detectar el mismo archivo subido como documentos distintos */
  huella?: string;
}

export interface ObraReferencia {
  descripcion: string;
  ano: number;
  importe: number;
  /** Persona que puede confirmar la obra (nombre y teléfono o email) */
  contacto: string;
}

export interface Proveedor {
  id: string;
  /** Enlace privado del proveedor para completar y actualizar su documentación */
  token: string;
  estado: "pendiente" | "aprobado" | "rechazado" | "suspendido";
  tipo: "empresa" | "autonomo";
  razonSocial: string;
  nif: string;
  contacto: string;
  telefono: string;
  email: string;
  web: string;
  trabajadores: number;
  rea: { inscrito: boolean; numero: string };
  rc: { aseguradora: string; capital: number };
  zonas: string[];
  especialidades: string[];
  obras: ObraReferencia[];
  presentacion: string;
  documentos: DocumentoProveedor[];
  notasInternas: string;
  creado: string;
  revisado?: string;
  consentimiento: { fecha: string; texto: string };
  /** Declaración responsable de veracidad, firmada antes del cuestionario */
  declaracion: { fecha: string; texto: string };
  /** Última consulta automática al Registro de Empresas Acreditadas */
  reaVerificado?: import("./rea").ResultadoREA;
  /** true si se aprobó solo al completar los requisitos */
  aprobadoAutomatico?: boolean;
  /** Tarifas del reformista para que la app calcule su presupuesto a cada cliente */
  tarifa?: TarifaReformista;
  /** Datos del formulario de alta: experiencia, cuentas, prevención, formación, certificaciones y disponibilidad */
  perfil?: PerfilProfesional;
  /** Entrevistas a sus clientes al terminar la obra (las hace el equipo; se publican sin datos del cliente) */
  entrevistas?: EntrevistaCliente[];
}

/** Quién emite el boletín o hace la legalización: el propio reformista, un instalador colaborador o nadie. */
export type Habilitacion = "propia" | "colaborador" | "no" | "";

/** Opinión documentada: entrevista al cliente al terminar la obra, en lugar de reseñas con estrellas. */
export interface EntrevistaCliente {
  id: string;
  fecha: string;
  /** Qué obra fue, sin dirección ni nombre (p. ej. «Reforma integral de 90 m² en Chamberí») */
  obra: string;
  loMejor: string;
  enQueFalla: string;
  cumplioPlazo: boolean | null;
  cumplioPresupuesto: boolean | null;
  recomendaria: "si" | "con_reservas" | "no";
}

/** Lo que declara el reformista en el alta (22/11/2026). Parte se enseña al cliente en su ficha. */
export interface PerfilProfesional {
  /** Número de proyectos ejecutados y de qué tipo */
  proyectosEjecutados: number;
  tiposProyecto: string[];
  /** Cuentas presentadas del último ejercicio (cuentas anuales si es empresa; renta o modelo 130/131 si es autónomo) */
  cuentas: { ejercicio: number; presentadas: boolean | null };
  /** Servicio de prevención de riesgos laborales */
  servicioPrevencion: "ajeno" | "propio" | "mancomunado" | "asumido" | "no" | "";
  /** Entidad del servicio de prevención (si es ajeno) */
  entidadPrevencion: string;
  /** Cursos de prevención que tiene su equipo */
  cursosPrevencion: string[];
  /** Certificaciones y habilitaciones profesionales */
  certificaciones: string[];
  otrasCertificaciones: string;
  /** Disponibilidad habitual para empezar obra y para visitas */
  disponibilidad: { inicio: "inmediata" | "2-4 semanas" | "1-2 meses" | "mas de 2 meses" | ""; obrasSimultaneas: number; visitas: string };
  /** Boletines y legalizaciones que puede emitir (23/11/2026) */
  habilitaciones?: { electrico: Habilitacion; agua: Habilitacion; gas: Habilitacion; aerotermia: Habilitacion };
  /** Facturación anual del último ejercicio, por tramos, para ver su volumen real */
  facturacion?: { ejercicio: number; tramo: string };
}

/** Tarifas del reformista: % sobre el precio de referencia, general y por capítulo. */
export interface TarifaReformista {
  general: number;
  capitulos: Record<string, number>;
  actualizado: string;
}

export interface Datos {
  version: 3;
  fotos: FotoGaleria[];
  proveedores: Proveedor[];
  proyectos: Proyecto[];
  tarifas: Tarifas;
  empresa: { nombre: string; cif: string; telefono: string; email: string; direccion: string };
  clientes: Cliente[];
  presupuestos: Presupuesto[];
  obras: Obra[];
  contador: number;
}
