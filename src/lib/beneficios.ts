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
      "Responsabilidad civil como promotor: daños a vecinos, a la comunidad de vecinos o a terceros durante la obra",
      "Defensa jurídica y reclamación de daños",
      "Asesoramiento legal telefónico durante la obra",
    ],
    pendiente: "Coberturas y condiciones según la póliza, pendientes de cerrar con MAPFRE. Si traes a tu propio reformista, puedes contratarlo online con coste.",
  },
  {
    i: "🤖",
    t: "Asesoramiento urbanístico con IA",
    d: "Licencia o declaración responsable, ICIO, permisos de la comunidad de vecinos, edificios protegidos: te orienta con la normativa de Madrid antes de empezar.",
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

export interface ProductoBanco {
  banco: string;
  /** Logotipo oficial (Wikimedia Commons o la web de la entidad); se enlaza, no se copia. */
  logo?: string;
  producto: string;
  tipo: "Préstamo personal" | "Préstamo hipotecario";
  /** Importe máximo en euros, si la web lo indica */
  importeMax: number | null;
  /** Hipotecas: % máximo del valor de tasación */
  pctTasacion?: number;
  plazoMeses: number | null;
  interes: "fijo" | "variable" | "mixto" | null;
  resumen: string;
  url: string;
  /** Explicación del producto con la información de su web (null: la web no lo indica) */
  detalle?: DetalleProducto;
}

export interface DetalleProducto {
  paraQue: string | null;
  paraQuien: string | null;
  importe: string | null;
  plazo: string | null;
  tin: string | null;
  tae: string | null;
  ejemplo: string | null;
  comisiones: string | null;
  vinculaciones: string | null;
  documentacion: string | null;
  comoSeContrata: string | null;
}

/**
 * Productos de financiación de reformas de bancos y cajas (resumen propio de su información pública,
 * consultada el 21/11/2026). La app no tiene acuerdo con estas entidades por ahora.
 */
export const BANCOS_REFORMA: ProductoBanco[] = [
  {
    banco: "Unicaja",
    producto: "Préstamo Reforma",
    tipo: "Préstamo personal",
    importeMax: 60000,
    plazoMeses: 96,
    interes: "fijo",
    resumen: "Para reformar la vivienda (baños, cocina, climatización…). Se tramita con el presupuesto o una factura proforma de la obra.",
    url: "https://www.unicajabanco.es/es/particulares/hipotecas-y-prestamos/prestamos-personales/prestamo-reforma",
    detalle: {
      paraQue: "Reformas o mejoras de la vivienda (baño, salón, climatización) y su equipamiento.",
      paraQuien: "A criterio de la entidad.",
      importe: "Hasta 60.000 €.",
      plazo: "Hasta 8 años.",
      tin: null,
      tae: null,
      ejemplo: null,
      comisiones: null,
      vinculaciones: null,
      documentacion: "Presupuesto o factura proforma de la obra.",
      comoSeContrata: "En oficina, por teléfono o con un formulario online (después te llama la oficina).",
    },
  },
  {
    banco: "Kutxabank",
    producto: "Préstamo Reforma Hogar",
    tipo: "Préstamo personal",
    importeMax: 75000,
    plazoMeses: 84,
    interes: "fijo",
    resumen: "Para reformar o rehabilitar la vivienda o el edificio, desde 1.500 € y con cuotas fijas. Se presenta el presupuesto; por debajo de 70.000 € se puede contratar online.",
    url: "https://portal.kutxabank.es/cs/Satellite/kb/en/private-customers/productos/prestamos-consumo/prestamo-reforma-hogar/pys",
    detalle: {
      paraQue: "Reformar o rehabilitar la vivienda o la comunidad de vecinos.",
      paraQuien: "Según la evaluación del banco; no publica requisitos concretos.",
      importe: "De 1.500 € a 75.000 €.",
      plazo: "De 3 meses a 7 años.",
      tin: "5,99 % en su ejemplo.",
      tae: "6,48 % en su ejemplo a 84 meses.",
      ejemplo: "10.000 € a 84 meses al 5,99 % TIN con 1 % de apertura: cuota de 146,04 € y 12.367,05 € en total.",
      comisiones: "Apertura del 1 % en su ejemplo. Amortizar antes de tiempo, hasta un 1 % (0,5 % si queda menos de un año).",
      vinculaciones: "Seguro de protección opcional; condiciones especiales para comunidades.",
      documentacion: "Presupuesto u otro justificante de la obra.",
      comoSeContrata: "Online hasta 70.000 €; también en oficina.",
    },
  },
  {
    banco: "Globalcaja",
    producto: "Hipoteca Inversión y Reforma",
    tipo: "Préstamo hipotecario",
    importeMax: null,
    pctTasacion: 70,
    plazoMeses: 360,
    interes: "mixto",
    resumen: "Hipoteca para comprar una vivienda o reformarla, con la vivienda como garantía, hasta el 70 % del valor de tasación.",
    url: "https://www.globalcaja.es/sites/default/files/2026-05/720_fipre_hip_inversion_reforma.pdf",
    detalle: {
      paraQue: "Comprar una vivienda para alquilar o reformar tu vivienda, con hipoteca.",
      paraQuien: "Con la vivienda como garantía. La edad del titular más joven con ingresos más el plazo no puede pasar de 70 años; pueden pedir avalistas.",
      importe: "Hasta el 70 % del valor de tasación o del precio de compra, el menor de los dos.",
      plazo: "Hasta 30 años.",
      tin: "3,95 % fijo el primer año; después Euríbor a 12 meses más un diferencial de 2,70 (hasta 1,50 con bonificaciones).",
      tae: "5,52 % sin productos y 6,47 % con productos, en su ejemplo.",
      ejemplo: "100.000 € a 20 años: 603,35 € al mes el primer año y después 671,56 € sin productos.",
      comisiones: "Apertura del 0,50 %, tasación 300 €, nota registral 12 €. Amortizar antes de tiempo: 2 % en el tramo fijo (1,5 % tras 10 años) y 0,15 % en el variable los 5 primeros años.",
      vinculaciones: "Opcionales, hasta 1,20 puntos menos: nómina, recibos y Bizum (−0,40), seguro de vida (−0,30) y tarjeta, seguros, planes o fondos (−0,10 cada uno). El seguro de daños es obligatorio.",
      documentacion: "DNI, nóminas o declaraciones de IRPF/IVA, vida laboral, extractos, nota registral, contrato de compra, declaración de bienes y tasación homologada.",
      comoSeContrata: "En oficina. La ficha es orientativa y la oferta personal puede variar.",
    },
  },
  {
    banco: "Caja Rural de Soria",
    producto: "Préstamo Personal",
    tipo: "Préstamo personal",
    importeMax: 60000,
    plazoMeses: 96,
    interes: "fijo",
    resumen: "Préstamo para lo que necesites, también reformar tu casa, con rebajas si domicilias la nómina. Para obras de ahorro energético tiene además el Préstamo Verde.",
    url: "https://www.cajaruraldesoria.com/es/particulares/prestamos/prestamo-personal",
    detalle: {
      paraQue: "Para cualquier finalidad, también una reforma.",
      paraQuien: "No publica requisitos; si no eres cliente tendrás que darte de alta.",
      importe: "Hasta 60.000 €.",
      plazo: "Hasta 8 años.",
      tin: "5,95 % los 6 primeros meses; después 8,45 % sin bonificar o 5,95 % bonificado.",
      tae: "8,40 % bonificado en su ejemplo.",
      ejemplo: "20.000 € a 96 meses bonificado: cuota de 262,34 € y 26.817,34 € en total.",
      comisiones: "Apertura del 1 %, sin comisión de estudio. Amortizar antes de tiempo cuesta un 1 % (0,50 % si queda un año o menos).",
      vinculaciones: "Nómina o ingresos (−1), seguro de vida (−0,75) y seguro de protección de pagos (−0,75).",
      documentacion: null,
      comoSeContrata: "En oficina, por teléfono o pidiendo una propuesta en su web; tiene simulador online.",
    },
  },
  {
    banco: "Banco Santander",
    producto: "Préstamo Reforma Vivienda",
    tipo: "Préstamo personal",
    importeMax: 100000,
    plazoMeses: 84,
    interes: "fijo",
    resumen: "Para reformas que mejoran la eficiencia energética de tu casa (ventanas, aislamiento, calefacción…), contratable online. Hay que justificar la obra con factura o presupuesto en 90 días.",
    url: "https://www.bancosantander.es/particulares/prestamos/prestamo-reforma-vivienda",
    detalle: {
      paraQue: "Reformas que mejoran la eficiencia energética: calefacción y agua caliente eficientes, ventanas con rotura de puente térmico, aislamiento SATE, fachada ventilada o electrodomésticos de máxima etiqueta.",
      paraQuien: "Clientes y no clientes, si el banco lo aprueba; el tipo depende de tu perfil.",
      importe: "Hasta 100.000 €.",
      plazo: "Hasta 7 años.",
      tin: "Desde 3,99 % hasta 10,75 %, según perfil.",
      tae: "Desde 4,06 % hasta 11,29 %, según perfil.",
      ejemplo: "15.000 € a 7 años al 3,99 % TIN: cuota de 204,96 € y 17.216,98 € en total.",
      comisiones: "Sin comisión de apertura ni de estudio. Amortizar antes de tiempo cuesta un 1 % (0,50 % si queda un año o menos).",
      vinculaciones: "Tienes que justificar en 90 días que el dinero va a una reforma sostenible; si no, el tipo sube un punto.",
      documentacion: "Factura o presupuesto de la reforma, en los 90 días siguientes.",
      comoSeContrata: "100 % online, con firma digital.",
    },
  },
  {
    banco: "CaixaBank",
    producto: "Préstamo Hogar",
    tipo: "Préstamo personal",
    importeMax: 30000,
    plazoMeses: 72,
    interes: null,
    resumen: "Para reformar o amueblar la casa, desde 2.000 €. Se pide 100 % online y responden en unas 24 horas.",
    url: "https://www.caixabank.es/particular/prestamos-personales/prestamo-muebles.html",
    detalle: {
      paraQue: "Reformar la vivienda o renovar los muebles.",
      paraQuien: "Mayores de edad con ingresos estables; el banco estudia la solvencia y consulta ficheros de morosidad.",
      importe: "De 2.000 € a 30.000 €.",
      plazo: "Hasta 72 meses, según el importe.",
      tin: "11,90 % en su ejemplo.",
      tae: "12,57 % en su ejemplo.",
      ejemplo: "5.729 € a 65 meses: 64 cuotas de 120 € y una de 119,68 €, 7.799,68 € en total.",
      comisiones: "Sin comisión de apertura.",
      vinculaciones: null,
      documentacion: "Nómina o pensión y declaración de la renta; pueden pedir algo más.",
      comoSeContrata: "100 % online desde su app; respuesta en menos de 24 horas.",
    },
  },
  {
    banco: "BBVA",
    producto: "Préstamo Reforma Vivienda",
    tipo: "Préstamo personal",
    importeMax: 20000,
    plazoMeses: null,
    interes: null,
    resumen: "Para la reforma de tu vivienda, desde 3.000 € y con un solo titular. Se contrata en digital, sin necesidad de ser cliente; mejor tipo si domicilias la nómina.",
    url: "https://www.bbva.es/personas/productos/prestamos/prestamo-reforma-vivienda.html",
    detalle: {
      paraQue: "La reforma de tu vivienda.",
      paraQuien: "No hace falta ser cliente; un solo titular.",
      importe: "De 3.000 € a 20.000 €.",
      plazo: null,
      tin: "6,10 % si domicilias nómina o pensión; 7,10 % si no.",
      tae: null,
      ejemplo: null,
      comisiones: "Sin comisión de apertura.",
      vinculaciones: "Tipo más bajo si domicilias la nómina o la pensión.",
      documentacion: null,
      comoSeContrata: "Solo online, no en oficina. La oferta se revisa cada mes.",
    },
  },
  {
    banco: "Abanca",
    producto: "Préstamo Reforma 24h",
    tipo: "Préstamo personal",
    importeMax: 60000,
    plazoMeses: 96,
    interes: null,
    resumen: "Para reformar tu casa, desde 6.000 €, solicitándolo en su web. Tiene comisión de apertura y pide tener su tarjeta.",
    url: "https://www.abanca.com/es/prestamos/prestamo-reforma-24h/",
    detalle: {
      paraQue: "Reformas del hogar: baño, salón o electrodomésticos de cocina.",
      paraQuien: "Titulares hasta 59 años, con una tarjeta de crédito de Abanca.",
      importe: "De 6.000 € a 60.000 €.",
      plazo: "De 1 a 8 años.",
      tin: "9,25 % sin bonificar; 6,25 % con todas las bonificaciones.",
      tae: "10,69 % en su ejemplo sin bonificar.",
      ejemplo: "60.000 € a 8 años sin bonificar: cuota de 886,81 €.",
      comisiones: "Apertura del 1,50 % (mínimo 90 €). Sus ejemplos incluyen el coste de la cuenta y la tarjeta.",
      vinculaciones: "Opcionales, hasta 3 puntos menos: nómina de más de 600 € (−1,50), seguro de vida (−0,75) y seguro de protección de pagos, hogar o coche (−0,75).",
      documentacion: "Te la piden después de ver que la operación es viable.",
      comoSeContrata: "Formulario en su web y firma online o en oficina; respuesta en 24 horas tras enviar la documentación.",
    },
  },
  {
    banco: "Laboral Kutxa",
    producto: "Financiación Sostenible",
    tipo: "Préstamo personal",
    importeMax: 99999,
    plazoMeses: 96,
    interes: null,
    resumen: "Para obras sostenibles de la vivienda: ascensor, baño accesible, ventanas, placas solares o aerotermia.",
    url: "https://www.laboralkutxa.com/es/personas/prestamo-online/financiacion-sostenible/",
    detalle: {
      paraQue: "Obras sostenibles en casa: ascensor, baño accesible, ventanas, placas solares, caldera, aerotermia o electrodomésticos eficientes (también coche ECO, estudios o salud).",
      paraQuien: "Según su análisis de riesgo; el destino tiene que cumplir sus criterios de sostenibilidad.",
      importe: "De 1.000 € a 99.999 €.",
      plazo: "De 1 a 8 años.",
      tin: "5,25 %.",
      tae: "5,378 %.",
      ejemplo: "12.000 € a 8 años: cuotas de unos 153,35 € y 14.721,73 € en total.",
      comisiones: "Sin comisión de apertura. Amortizar antes de tiempo cuesta un 1 % (0,5 % si queda un año o menos).",
      vinculaciones: "No indica ninguna. Se puede pedir hasta el 31/05/2027.",
      documentacion: null,
      comoSeContrata: "Solicitud online.",
    },
  },
  {
    banco: "Bankinter",
    producto: "Préstamo EcoReforma",
    tipo: "Préstamo personal",
    importeMax: null,
    plazoMeses: null,
    interes: null,
    resumen: "Para obras de eficiencia energética (ventanas, aislamiento, bomba de calor, placas solares), desde 3.000 €, contratable online.",
    url: "https://www.bankinter.com/banca/en/mortgages-loans/loans/ecoreforma-loan",
    detalle: {
      paraQue: "Mejoras de eficiencia: electrodomésticos, ventanas, aislamiento, bomba de calor, caldera, placas solares o suelo radiante.",
      paraQuien: "Viviendas con calefacción individual.",
      importe: "Desde 3.000 € (no publica el máximo).",
      plazo: "Desde 6 meses (no publica el máximo).",
      tin: null,
      tae: null,
      ejemplo: null,
      comisiones: null,
      vinculaciones: null,
      documentacion: "Sin papeleo ni notario, según su web.",
      comoSeContrata: "100 % online o por teléfono; el dinero llega en 24 horas.",
    },
  },
];

const WM = (ruta: string) => `https://upload.wikimedia.org/wikipedia/commons/${ruta}`;
/** Logotipos de cada entidad. Las marcas son de sus titulares; la app no tiene acuerdo con ellas. */
export const LOGOS_BANCOS: Record<string, string> = {
  Unicaja: WM("7/74/Unicaja_logo.svg"),
  Kutxabank: WM("5/55/Kutxabank.svg"),
  Globalcaja: "https://www.globalcaja.es/sites/default/files/Logotipo_Globalcaja.png",
  "Caja Rural de Soria": "https://www.cajaruraldesoria.com/sites/default/files/logotipo_caja_rural_soria.png",
  "Banco Santander": WM("6/60/Banco_santander_logo.svg"),
  CaixaBank: WM("2/2f/Logo_CaixaBank.svg"),
  BBVA: WM("9/98/BBVA_logo_2025.svg"),
  Abanca: WM("9/95/Abanca_logo.svg"),
  "Laboral Kutxa": WM("thumb/7/74/Logo_Laboral_Kutxa.JPG/330px-Logo_Laboral_Kutxa.JPG"),
  Bankinter: WM("a/a5/Bankinter.svg"),
};
for (const b of BANCOS_REFORMA) b.logo ??= LOGOS_BANCOS[b.banco];
