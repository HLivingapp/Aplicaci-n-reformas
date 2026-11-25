/**
 * Mini vídeos de la portada: cada bloque abre el vídeo de su tema y, debajo, un botón para ir a esa área de la app.
 * Los temas sin vídeo muestran un hueco «en preparación» hasta que se graben.
 */
export type TemaPortada =
  | "paso-1"
  | "paso-2"
  | "paso-3"
  | "presupuesto"
  | "red"
  | "contrato"
  | "fases"
  | "acabados"
  | "comparador"
  | "datos"
  | "seguro"
  | "urbanismo"
  | "arquitectos"
  | "hipoteca"
  | "invita"
  | "profesionales";

/**
 * Cada tema espera su mini vídeo en /public/videos/mini/<tema>.mp4 (y la portada en <tema>.jpg).
 * Basta con dejar el archivo ahí: si aún no existe, se usa el vídeo provisional (ruta sin extensión) o un hueco «en preparación».
 */
export const archivoMini = (tema: TemaPortada) => `mini/${tema}`;

export const VIDEOS_PORTADA: Record<TemaPortada, { video?: string; guion: string }> = {
  "paso-1": { guion: "Paso 1: escribe tu dirección y el Catastro rellena tu casa" },
  "paso-2": { guion: "Paso 2: tu presupuesto partida a partida, al momento" },
  "paso-3": { guion: "Paso 3: compara reformistas homologados y pídeles cita" },
  presupuesto: { video: "portada/comprar-y-reformar", guion: "Cómo se calcula tu presupuesto partida a partida" },
  red: { guion: "Cómo homologamos a los reformistas y cómo eliges entre ellos" },
  contrato: { guion: "Contrato estándar, pagos por hitos y seguimiento de la obra" },
  fases: { video: "decisiones/pasos-reforma", guion: "Los pasos de una reforma" },
  acabados: { video: "decisiones/bano", guion: "Elegir acabados: básico, medio o premium" },
  comparador: { guion: "Comparar ofertas capítulo a capítulo" },
  datos: { guion: "Tus datos protegidos: RGPD y servidores en la UE" },
  seguro: { guion: "El seguro de promotor: qué cubre y cómo contratarlo" },
  urbanismo: { video: "normativa/declaracion-responsable", guion: "Declaración responsable o licencia" },
  arquitectos: { guion: "Cuándo necesitas un arquitecto y cómo encontrarlo en la app" },
  hipoteca: { video: "portada/comprar-y-reformar", guion: "Comprar y reformar: hipoteca, tasación y aval ICO" },
  invita: { guion: "Invita a tu reformista: gratis para los dos" },
  profesionales: { guion: "Para reformistas: tarifas, chat y citas con clientes interesados" },
};
