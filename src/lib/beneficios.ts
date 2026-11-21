/**
 * Beneficios de contratar y trabajar a través de la app.
 * Pendiente de cerrar: acuerdo y coberturas exactas del seguro con MAPFRE; bancos colaboradores
 * para la financiación. Los textos no prometen concesión de ayudas ni de préstamos.
 */
export interface Beneficio {
  i: string;
  t: string;
  d: string;
  /** Detalle que se despliega */
  mas?: string[];
  pendiente?: string;
}

export const BENEFICIOS_CLIENTE: Beneficio[] = [
  {
    i: "🛡️",
    t: "Seguro de promotor MAPFRE, gratis",
    d: "Si contratas tu obra por la app, te regalamos un seguro como promotor de la obra mientras dura la reforma.",
    mas: [
      "Responsabilidad civil como promotor: daños a vecinos, a la comunidad o a terceros durante la obra",
      "Defensa jurídica y reclamación de daños",
      "Asesoramiento legal telefónico durante la obra",
    ],
    pendiente: "Coberturas y condiciones según la póliza, pendientes de cerrar con MAPFRE. Si traes a tu propio reformista, puedes contratarlo online con coste.",
  },
  {
    i: "🤖",
    t: "Asesoramiento urbanístico con IA",
    d: "Licencia o declaración responsable, ICIO, permisos de la comunidad, edificios protegidos: te orienta con la normativa de Madrid antes de empezar.",
    pendiente: "Incluido en el plan Pro.",
  },
  {
    i: "📐",
    t: "Estudios de arquitectura homologados",
    d: "Si tu reforma necesita proyecto, licencia o legalización, ves el precio de cada estudio o arquitecto para tu casa y lo contratas en la app.",
    pendiente: "Con el plan Básico.",
  },
  {
    i: "🏦",
    t: "Reforma en tu hipoteca",
    d: "Financia la reforma con un préstamo o con tu hipoteca: te enseñamos las opciones de Unicaja, Kutxabank y Caja Rural de Soria, y simulas la cuota desde tu presupuesto.",
    pendiente: "Sujeto a la aprobación del banco.",
  },
  {
    i: "🏠",
    t: "Tasación Aesval online",
    d: "Pide desde la app la tasación oficial que te pide el banco para la hipoteca o para financiar la reforma.",
    pendiente: "Precio y acuerdo con Aesval pendientes de cerrar.",
  },
  {
    i: "🤝",
    t: "Invita a tu reformista",
    d: "¿Ya tienes reformista? Invítalo a la app: ni tú ni él pagáis reserva ni comisión, y tenéis contrato, pagos por fases y avances igualmente.",
    pendiente: "El seguro de promotor gratis solo va con reformistas de la app.",
  },
  {
    i: "🔑",
    t: "Ayuda con el aval ICO para la entrada",
    d: "Si compras tu primera vivienda, te orientamos para pedir el aval ICO: el Estado avala hasta el 20 % del préstamo para que no tengas que reunir toda la entrada.",
    mas: ["Para menores de 36 años y familias con menores a cargo, con límites de ingresos y de precio de la vivienda", "Se pide a través de los bancos adheridos, que son quienes lo conceden"],
    pendiente: "Te acompañamos en la solicitud; la concesión depende del banco y de los requisitos vigentes.",
  },
  {
    i: "✍️",
    t: "Contrato, pagos por fases y seguimiento",
    d: "Contrato estándar firmado en la app, pagos por hitos confirmados por las dos partes y los avances de tu obra con fotos.",
  },
];

export const BENEFICIOS_PROFESIONAL: Beneficio[] = [
  {
    i: "💶",
    t: "Menos impagos",
    d: "Pagos por hitos firmados en el contrato, solicitud de cada pago desde la app con aviso al cliente, y el historial de pagos siempre a mano.",
  },
  {
    i: "📸",
    t: "Tus avances, visibles para tu cliente",
    d: "Publica el avance de cada fase y tu cliente lo ve en su enlace. Menos llamadas y más confianza para pagar a tiempo.",
  },
  {
    i: "🏦",
    t: "Financiación para tus clientes",
    d: "«Reforma en tu hipoteca»: tus clientes pueden financiar la obra con bancos colaboradores. Más presupuestos aceptados.",
    pendiente: "Bancos colaboradores en preparación.",
  },
  {
    i: "📑",
    t: "Memoria técnica y financiación, con nuestra ayuda",
    d: "Las reformas financiadas con hipoteca necesitan una memoria técnica firmada por arquitecto colegiado, para legalizar la obra y para el banco. Te ayudamos a preparar la memoria y la documentación de la financiación con tu cliente.",
  },
  {
    i: "🤝",
    t: "Invita a tus clientes: no te costará ni un euro",
    d: "Desde tu área mandas un enlace a tus propios clientes y lleváis la obra con la app: en esas obras no pagas fee ni comisión, ni tu cliente reserva. Solo pagas el fee (la reserva del cliente) en los clientes que te llegan por la app.",
  },
  {
    i: "📋",
    t: "Clientes que ya saben lo que cuesta",
    d: "Cargas tus tarifas una vez y la app calcula tu presupuesto a cada cliente de tu zona. Solo vas a las visitas de quien ya te ha elegido.",
  },
];

/**
 * Productos de financiación de reformas de bancos (resumen propio de su información pública,
 * consultada el 21/11/2026). Human Living no tiene acuerdo con estas entidades por ahora.
 */
export const BANCOS_REFORMA = [
  {
    banco: "Unicaja",
    producto: "Préstamo Reforma",
    tipo: "Préstamo personal",
    resumen: "Para reformar la vivienda (baños, cocina, climatización…). Hasta 60.000 €, a tipo fijo y hasta 8 años. Se tramita con el presupuesto o una factura proforma de la obra.",
    url: "https://www.unicajabanco.es/es/particulares/hipotecas-y-prestamos/prestamos-personales/prestamo-reforma",
  },
  {
    banco: "Kutxabank",
    producto: "Préstamo Reforma Hogar",
    tipo: "Préstamo personal",
    resumen: "Para reformar o rehabilitar la vivienda o el edificio. De 1.500 € a 75.000 €, de 3 meses a 7 años y cuotas fijas. Se presenta el presupuesto de la obra; por debajo de 70.000 € se puede contratar online.",
    url: "https://portal.kutxabank.es/cs/Satellite/kb/en/private-customers/productos/prestamos-consumo/prestamo-reforma-hogar/pys",
  },
  {
    banco: "Caja Rural de Soria",
    producto: "Préstamo Personal",
    tipo: "Préstamo personal",
    resumen: "Préstamo para lo que necesites, también reformar tu casa: hasta 60.000 € y hasta 8 años, a tipo fijo, con rebajas si domicilias la nómina. Para obras de ahorro energético (aislamiento, placas solares, reformas eco) tiene además un préstamo de mejora energética.",
    url: "https://www.cajaruraldesoria.com/es/particulares/prestamos/prestamo-personal",
  },
];
