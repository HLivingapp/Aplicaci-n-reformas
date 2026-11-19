# Puesta en marcha

Pasos para pasar del modo demostración a la app con base de datos. Se hacen una sola vez.

## 1. Base de datos (Supabase)

1. Crea una cuenta gratuita en [supabase.com](https://supabase.com) con el email de la empresa.
2. **New project**. En *Region* elige **Europe (Frankfurt o Ireland)**, para que los datos se queden en la UE.
3. Cuando esté creado: *SQL Editor* → *New query* → pega el contenido de [`supabase/esquema.sql`](../supabase/esquema.sql) → *Run*.
4. En la misma pantalla, da de alta a las personas del equipo (cambia los emails):
   ```sql
   insert into equipo (email, nombre) values
     ('admin@empresa.es', 'Administración'),
     ('pm@empresa.es', 'Project manager');
   ```
5. *Authentication* → *URL Configuration*: en **Site URL** pon la dirección de la web (paso 2) y añade `https://TU-DOMINIO/empresa` en *Redirect URLs*.
6. *Project Settings* → *API*: apunta **Project URL**, la clave **anon public** y la clave **service_role** (esta última es secreta).

## 2. Publicar la web (Vercel)

1. Crea una cuenta en [vercel.com](https://vercel.com) entrando con GitHub e importa el repositorio.
2. En *Environment Variables* añade las variables de [`.env.example`](../.env.example) con los valores del paso 1.6.
3. En *Settings → Functions* elige la región **Frankfurt (fra1)**.
4. Despliega. La dirección que te dé Vercel (o vuestro dominio) es la que va en el paso 1.5.

> El plan gratuito de Vercel es para uso no comercial; para la empresa corresponde el plan Pro, u otro alojamiento equivalente.

## 3. Cargar vuestros datos

1. Entra en `/entrar` con un email del equipo y abre el enlace que llega por correo.
2. *Ajustes → Empresa*: datos que salen en los presupuestos.
3. *Ajustes → Tarifario → Importar*: el archivo del tarifario de la empresa (no está en este repositorio).

## 4. Protección de datos: lo que tiene que hacer la empresa

La app ya incluye: consentimiento con fecha en el formulario, política de privacidad (`/privacidad`), enlaces privados que se pueden renovar, acceso del equipo solo por email autorizado, datos en la UE, y botones para descargar y borrar todos los datos de un cliente.

La empresa debe además:

- **Revisar la política de privacidad** con su asesoría (datos del responsable en `src/lib/legal.ts`) y los plazos de conservación.
- **Firmar el contrato de encargado del tratamiento (DPA)** de Supabase (*Organization settings → Legal documents*) y el de Vercel o el alojamiento elegido.
- **Registro de actividades de tratamiento**: añadir "Clientes y presupuestos de reforma" con las finalidades, datos y plazos de la política.
- **Revisar cada año** los clientes sin obra con más de 12 meses de antigüedad y borrarlos desde *Clientes → Protección de datos*.
- No enviar los enlaces privados por canales abiertos (grupos, redes) y renovarlos si se comparten por error.
- Configurar un SMTP propio en Supabase (*Authentication → SMTP*) si el equipo envía muchos enlaces de acceso al día; el correo incluido tiene un límite bajo.
