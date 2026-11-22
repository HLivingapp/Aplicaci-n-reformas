import { APP } from "./marca";
/**
 * Comunidad de la app: para usar la app basta con unirse con el email (sin contraseña).
 * El teléfono y el permiso para escribir por WhatsApp o llamar son opcionales y van aparte (RGPD:
 * el consentimiento comercial no puede ser condición para entrar).
 */
export const TEXTO_PRIVACIDAD_MIEMBRO =
  `He leído la política de privacidad y acepto unirme a ${APP.nombre} con mi email.`;
export const TEXTO_CONTACTO_MIEMBRO =
  `Autorizo a ${APP.nombre} a escribirme por WhatsApp o llamarme a este teléfono sobre mi reforma y la app. Puedo retirarlo cuando quiera.`;

export interface Miembro {
  email: string;
  telefono?: string;
  /** Consentimientos con su texto y fecha */
  privacidad: { fecha: string; texto: string };
  contacto?: { fecha: string; texto: string; canales: ("whatsapp" | "llamada")[] };
  creado: string;
}

export const emailValido = (e: string) => /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i.test(e.trim());

/** Normaliza un móvil o fijo español: devuelve +34XXXXXXXXX o null si no es válido. */
export function telefonoValido(t: string): string | null {
  const n = t.replace(/[\s().-]/g, "").replace(/^0034/, "+34");
  const m = n.match(/^(?:\+34)?([6789]\d{8})$/);
  return m ? `+34${m[1]}` : null;
}

/** Valida y limpia lo que llega del formulario (en el navegador y en el servidor). */
export function miembroLimpio(x: unknown): Miembro | null {
  const o = (x ?? {}) as Record<string, unknown>;
  const email = String(o.email ?? "").trim().toLowerCase();
  if (!emailValido(email) || o.aceptaPrivacidad !== true) return null;
  const ahora = new Date().toISOString();
  const tel = o.telefono ? telefonoValido(String(o.telefono)) : null;
  if (o.telefono && !tel) return null;
  const quiereContacto = o.aceptaContacto === true && !!tel;
  return {
    email,
    telefono: tel ?? undefined,
    privacidad: { fecha: ahora, texto: TEXTO_PRIVACIDAD_MIEMBRO },
    contacto: quiereContacto ? { fecha: ahora, texto: TEXTO_CONTACTO_MIEMBRO, canales: ["whatsapp", "llamada"] } : undefined,
    creado: ahora,
  };
}
