/**
 * Modelo de cobro (decidido por el titular de la app el 25/11/2026; sustituye a la reserva del 3 %, al fee
 * del reformista, al pago de visitas del cliente y al seguro de promotor gratis):
 * - Gratis para cualquier cliente: cuántos proveedores hay en su zona y el presupuesto medio de su reforma.
 * - Acceso del cliente: una cuota única de 29,90 € (tarjeta o Bizum) para ver la ficha ampliada de cada proveedor,
 *   sus tarifas concretas y su presupuesto, chatear con ellos y pedirles cita presencial.
 * - Proveedor: recibe aviso por email y WhatsApp y chatea con el cliente. Cuando acepta la cita presencial
 *   (cliente ya cualificado e interesado) paga 150 €, venda o no.
 * - Si el cliente ya tiene una suscripción de servicios (Básico 4,95 €/mes o Pro 29,95 €/mes), la cuota es de 19,90 €.
 * - Condición de pago (solo en letra pequeña, sin destacarla como garantía; titular 25/11/2026): si en 30 días desde el pago
 *   ningún proveedor acepta una cita con él, se le devuelve la cuota.
 * - Si el proveedor marca que el cliente no se presentó y este no lo desmiente en 48 h, recupera la cita como crédito.
 * - Arquitectos y estudios: sin visita; pagan 99 € cuando piden el contacto del cliente tras chatear, venda o no.
 * - La app no cobra nada sobre la obra (ni porcentaje ni mínimo) ni interviene en ella.
 * En la demo los pagos son simulados. Todos los textos de la web salen de aquí.
 */
export const COBRO = { accesoCliente: 29.9, accesoSuscrito: 19.9, citaProveedor: 150, contactoArquitecto: 99, maxCitas: 5, diasGarantia: 30 };
export const METODOS_PAGO = ["Tarjeta", "Bizum"] as const;
export type MetodoPago = (typeof METODOS_PAGO)[number];

/** 1.000 € (con punto de miles también en cifras de cuatro dígitos) */
export const miles = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
/** 29,90 € · 150 € */
export const precio = (n: number) => (Number.isInteger(n) ? `${miles(n)} €` : `${n.toFixed(2).replace(".", ",")} €`);

export const PRECIO_ACCESO = precio(COBRO.accesoCliente);
export const PRECIO_ACCESO_SUSCRITO = precio(COBRO.accesoSuscrito);
export const PRECIO_CITA = precio(COBRO.citaProveedor);
export const PRECIO_CONTACTO_ARQ = precio(COBRO.contactoArquitecto);
/** Arquitectos (25/11/2026): no hay visita. El cliente ve su ficha y chatea; el arquitecto paga 99 € al pedir el contacto del cliente, venda o no. Desde ahí, relación directa. */
export const TEXTO_CONTACTO_ARQ = `${precio(COBRO.contactoArquitecto)} cuando pides el contacto de un cliente, acabe o no en encargo`;
export const CONDICION_DEVOLUCION = `Si en ${COBRO.diasGarantia} días desde el pago ningún proveedor acepta una cita contigo, o los que la aceptaron faltan sin avisar, se te devuelve el importe.`;

export const GRATIS_CLIENTE = ["Cuántos proveedores homologados hay en tu zona", "El presupuesto medio de tu reforma con sus tarifas", "Tu presupuesto orientativo partida a partida"];
export const INCLUYE_ACCESO = [
  "Ficha ampliada de cada proveedor: currículum, fotos de obras, documentación y opiniones",
  "Sus tarifas concretas y su presupuesto para tu casa, capítulo a capítulo",
  "Chat directo con los que te interesen",
  `Pedir cita presencial (hasta ${COBRO.maxCitas} proveedores)`,
];
/** Proveedores con tarifas cargadas que anunciamos en la portada. Tiene que ser cierto al lanzar: actualizar aquí. */
export const PROVEEDORES_RED = 500;
export const TEXTO_RED_PROVEEDORES = `Cuenta con los tarifarios de más de ${PROVEEDORES_RED.toLocaleString("es-ES")} proveedores en tiempo real, así como la posibilidad de quedar con los de tu zona para contratarles lo que necesites.`;

export const TEXTO_ACCESO_CLIENTE = `${PRECIO_ACCESO} una sola vez (${PRECIO_ACCESO_SUSCRITO} si tienes suscripción), con tarjeta o Bizum`;
export const TEXTO_CITA_PROVEEDOR = `${PRECIO_CITA} por cada cita presencial que aceptas, aunque no vendas`;
export const SIN_COMISION = "Sin comisión ni porcentaje sobre la obra";

/** Aviso al reformista donde carga sus tarifas y donde se explica lo que cobramos. */
export const AVISO_TARIFAS = "Tus tarifas son las que ve el cliente: mantenlas al día";
export const LETRA_PEQUENA_TARIFAS = `No cobramos comisión ni porcentaje sobre la obra: solo ${TEXTO_CITA_PROVEEDOR}. El cliente que te pide cita ya ha pagado para ver tu ficha y tus precios.`;

/**
 * Cifras de la portada. Son de la demo: antes del lanzamiento hay que sustituirlas por las reales
 * (o calcularlas de la base de datos), porque se anuncian al público.
 */
export const CIFRAS_PORTADA = {
  proveedores: PROVEEDORES_RED,
  comparadosMes: 1240,
  /** Ratio medio de la red: una obra vendida de cada N citas. */
  ratioRed: 9,
};
/** Objetivo que proponemos a cada proveedor: vender una obra de cada 10 citas. */
export const OBJETIVO_RATIO = 10;
