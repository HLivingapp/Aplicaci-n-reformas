/**
 * Reserva y fee de comercialización:
 * - Al firmar, el cliente paga en la app una reserva que forma parte del precio y se descuenta
 *   de su primer pago al reformista. Esa reserva se la queda Human Living: es el fee del reformista.
 * - Obra mínima contratada por la app.
 * Fórmula confirmada por Human Living (21/11/2026): el 3 % del presupuesto con un mínimo de 1.000 €.
 * Al cliente solo se le habla de la reserva; que es el fee del reformista se explica solo al reformista.
 * Todos los textos de la web salen de aquí.
 */
export const COMERCIALIZACION: { minimo: number; pct: number; obraMinima: number; formula: "suma" | "maximo" } = { minimo: 1000, pct: 3, obraMinima: 6000, formula: "maximo" };
/** 1.000 € (con punto de miles también en cifras de cuatro dígitos) */
export const miles = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const eur = (n: number) => `${miles(n)} €`;
export const reservaApp = (importeSinIva: number, c = COMERCIALIZACION) => {
  const pct = Math.round(importeSinIva * c.pct) / 100;
  return c.formula === "suma" ? c.minimo + pct : Math.max(c.minimo, pct);
};
export const TEXTO_RESERVA =
  COMERCIALIZACION.formula === "suma"
    ? `${eur(COMERCIALIZACION.minimo)} más el ${COMERCIALIZACION.pct} % del presupuesto sin IVA`
    : `el ${COMERCIALIZACION.pct} % del presupuesto sin IVA, con un mínimo de ${eur(COMERCIALIZACION.minimo)}`;
