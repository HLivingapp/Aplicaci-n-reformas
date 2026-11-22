/**
 * Ayudas públicas para comprar la primera vivienda que se piden a través de los bancos.
 * Información pública consultada el 22/11/2026; puede cambiar. Ver fuentes en cada bloque.
 */

/** Entidades con la Línea de Avales ICO para primera vivienda operativa, según el ICO (consultado el 22/11/2026). */
export const ENTIDADES_AVAL_ICO = [
  "Banco Santander", "BBVA", "Ibercaja Banco", "EVO Banco", "Caja de Ahorros y M.P. de Ontinyent", "Arquia Bank", "UCI, Unión de Créditos Inmobiliarios",
  "Caja Rural de Almendralejo", "Abanca", "Banco Cooperativo Español", "Cajasiete, Caja Rural", "Caja Rural de Extremadura", "Caja Rural de Soria",
  "Caja Rural de Teruel", "Caja Rural del Sur", "Caja Rural de Granada", "Caja Rural de Salamanca", "Caja Rural de Utrera", "Caja Rural San José de Alcora",
  "Caja Rural de Jaén, Barcelona y Madrid", "Caja Rural de Zamora", "Caixa Rural Galega", "Caja Rural Regional", "Caja Rural de Cañete de las Torres",
  "Caja Rural de Gijón", "Caixa La Vall S. Isidro", "Caixa Popular", "Caja Rural de Nueva Carteya", "Caja Rural de Aragón", "CaixaBank", "Caja Rural Central",
  "Caja Rural Asturias", "Caja Rural Ntra. Sra. La Esperanza de Onda", "Caixa Rural Algemesí", "Caja Rural de Albal", "Cajamar", "Caixa Rural Torrent",
  "Caja Rural de Petrer", "Caixa Rural de Turís", "Banco de Crédito Social Cooperativo", "Caja Rural de Alquerías del Niño Perdido", "Caja Rural San José de Burriana",
  "Caja Rural de Callosa", "Caja Rural Católica Agraria Vila-real", "Caja Rural Cheste", "Caja Rural de Junquera de Chilches", "Caja Rural San José de Nules",
  "Caixa Rural San Roque de Almenara", "Caja Rural Sant Josep de Vilavella", "Caja Rural de Villar", "Caja Rural de S. Vicent Ferrer", "Globalcaja", "Unicaja",
  "Banca Pueyo", "Cajaviva", "Caja Rural Alginet", "Caixa Rural Altea", "Caja Rural S. Isidro de Vilafamés", "Caja Rural de Baena", "Banco Sabadell", "Bankinter",
  "Caja Rural de Benicarló", "MyInvestor Banco", "ING", "Kutxabank", "Cajasur", "Rural Nostra", "Caja Rural de Villamalea",
];

export const FUENTE_AVAL_ICO = "https://www.ico.es/es/web/guest/entidades-linea-avales-hipoteca-primera-vivienda";

export const AVAL_ICO = {
  titulo: "Aval ICO para la entrada de tu primera vivienda",
  resumen: "El Estado, a través del ICO, avala hasta el 20 % del préstamo hipotecario para que el banco pueda financiar casi todo el precio y no tengas que reunir toda la entrada.",
  puntos: [
    "Para jóvenes de hasta 35 años y familias con menores a cargo (en este caso, sin límite de edad).",
    "Primera vivienda y residencia habitual, con límites de ingresos, patrimonio y precio de la vivienda que fija cada comunidad autónoma.",
    "Se pide en el banco al pedir la hipoteca: el banco estudia la operación y decide si la concede.",
    "Se pueden formalizar operaciones hasta el 31 de diciembre de 2027.",
  ],
};

export const TU_CASA = {
  titulo: "Préstamo TU CASA: hasta 50.000 € al 0 % para la entrada",
  estado: "Aprobado (Real Decreto-ley 29/2026, convalidado el 12/11/2026), pero todavía no se puede pedir: falta que el Consejo de Ministros fije requisitos y procedimiento y el convenio con el ICO. Aún no hay lista de bancos.",
  puntos: [
    "Préstamo público del ICO que se suma a tu hipoteca para pagar la entrada de tu primera vivienda habitual.",
    "Importe: el 20 % del precio de la vivienda, con un máximo de 50.000 € (el máximo se alcanza con viviendas de 250.000 € o más).",
    "Al 0 % de interés y sin comisiones. No pagas nada mientras dure la hipoteca (hasta 30 años) y después lo devuelves en un máximo de 10 años.",
    "Sin límite de edad. Los límites de ingresos y de precio de la vivienda están pendientes de fijar.",
    "Es un préstamo que se devuelve, no una subvención. No cubre impuestos ni gastos de compra.",
    "A cambio, la vivienda tendrá para siempre un precio máximo de venta (el de compra actualizado con el IPC), inscrito en el Registro, y un tope de renta si se alquila.",
  ],
  fuente: "https://www.boe.es/buscar/act.php?id=BOE-A-2026-20823",
};
