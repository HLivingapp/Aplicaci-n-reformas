const hayClaves = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const estatica = process.env.NEXT_PUBLIC_ESTATICA === "1";

/**
 * App con servidor (Vercel) y Supabase: los datos del equipo y de los clientes pasan por /api.
 * Sin claves, o en la web estática, la app funciona en modo demostración (datos en el navegador).
 */
export const conBaseDeDatos = hayClaves && !estatica;

/**
 * Nube de cada persona: con las claves de Supabase (también en la web estática de GitHub Pages),
 * quien entra con el enlace de su email guarda sus datos en Supabase directamente desde el navegador.
 * La seguridad la ponen las políticas RLS de supabase/migrations: cada uno solo lee y escribe lo suyo.
 * Sin claves, todo sigue en el navegador (localStorage) como hasta ahora.
 */
export const conNube = hayClaves;

/** Web estática con nube: sin servidor, el foro se lee y escribe directamente en Supabase. */
export const nubeSinServidor = hayClaves && estatica;
