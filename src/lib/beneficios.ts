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
    pendiente: "Coberturas y condiciones según la póliza, pendientes de cerrar con MAPFRE.",
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
    d: "Financia la reforma junto con la compra o ampliando tu hipoteca, con bancos colaboradores. Simula la cuota desde tu presupuesto.",
    pendiente: "Sujeto a la aprobación del banco.",
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
    i: "📋",
    t: "Clientes que ya saben lo que cuesta",
    d: "Cargas tus tarifas una vez y la app calcula tu presupuesto a cada cliente de tu zona. Solo vas a las visitas de quien ya te ha elegido.",
  },
];
