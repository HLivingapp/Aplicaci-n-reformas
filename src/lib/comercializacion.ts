/**
 * Reserva y fee de comercialización:
 * - Al firmar, el cliente paga en la app una reserva que forma parte del precio y se descuenta
 *   de su primer pago al reformista. Esa reserva se la queda Human Living: es el fee del reformista.
 * - Obra mínima contratada por la app.
 * Fórmula pendiente de confirmar por Human Living: «suma» (mínimo + %) o «maximo» (el mayor de los dos).
 * Todos los textos de la web salen de aquí.
 */
export const COMERCIALIZACION: { minimo: number; pct: number; obraMinima: number; formula: "suma" | "maximo" } = { minimo: 1000, pct: 3, obraMinima: 6000, formula: "suma" };
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
    : `el mayor entre ${eur(COMERCIALIZACION.minimo)} y el ${COMERCIALIZACION.pct} % del presupuesto sin IVA`;
