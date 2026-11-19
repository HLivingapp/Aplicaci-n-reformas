/** Con Supabase configurado los datos van a la base de datos; si no, la app funciona en modo demostración. */
export const conBaseDeDatos = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
