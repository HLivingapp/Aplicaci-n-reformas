import { APP } from "./marca";
/**
 * Datos del responsable del tratamiento que aparecen en la política de privacidad.
 * Revisar con la asesoría antes de publicar.
 */
export const RESPONSABLE = {
  razonSocial: "VIVIENDA HL CENTRO S.L.",
  /** Nombre de la app (ver marca.ts). Titular del negocio: VIVIENDA HL CENTRO S.L. */
  marca: APP.nombre,
  cif: "B72840291",
  domicilio: "Calle Arrieta 5, 1º dcha., 28013 Madrid",
  email: "admin@humanliving.es",
  telefono: "610 50 08 11",
  /** Proveedor de la base de datos y alojamiento (encargado del tratamiento) */
  proveedores: "Supabase Inc. (base de datos, servidores en la Unión Europea) y el proveedor de alojamiento de la web",
  actualizada: "22 de noviembre de 2026",
};

/** «VIVIENDA HL CENTRO S.L., titular de ReformaMejor»: quien cobra el acceso de los clientes y las citas de los profesionales. */
export const TITULAR = `${RESPONSABLE.razonSocial}, titular de ${APP.nombre}`;

/** Comercializadora en todos los contratos de la app. */
export const TEXTO_COMERCIALIZADORA = `${RESPONSABLE.razonSocial} (CIF ${RESPONSABLE.cif}), titular de ${APP.nombre}, pone en contacto a las partes y les facilita este modelo de contrato, pero no es parte de la obra o del encargo, no cobra nada sobre su importe ni responde de su ejecución.`;

/** Tratamiento de datos de clientes por los profesionales. Pendiente de revisión por el abogado (acuerdo RGPD completo). */
export const TEXTO_DATOS_PROFESIONAL = `Los datos de los clientes que recibo a través de ${APP.nombre} me los facilita ${RESPONSABLE.razonSocial}. Me comprometo a usarlos solo para preparar y ejecutar su reforma o encargo, a mantenerlos en secreto y protegidos, a no cederlos a terceros, a avisar de inmediato de cualquier fuga de datos y a borrarlos cuando ya no los necesite, según el RGPD.`;
