# Puesta en marcha

Pasos para pasar del modo demostración a la app con base de datos. Se hacen una sola vez.

## 0. Lo más rápido: la web actual (GitHub Pages) guardando en Supabase

Sin servidor: cada persona entra con un enlace a su email (sin contraseña) y sus datos se guardan en Supabase
directamente desde el navegador. Lo que protege los datos son las políticas RLS de
[`supabase/migrations/20261122000000_plataforma.sql`](../supabase/migrations/20261122000000_plataforma.sql):
cada uno solo lee y escribe lo suyo; cliente y profesional ven el encargo que comparten; lo único público
es el escaparate anónimo de los profesionales homologados y el foro.

1. Crea la cuenta y el proyecto en **Central EU (Frankfurt)** (pasos 1.1 y 1.2 de abajo).
2. *SQL Editor* → *New query*: pega y ejecuta [`supabase/esquema.sql`](../supabase/esquema.sql) y después
   [`supabase/migrations/20261122000000_plataforma.sql`](../supabase/migrations/20261122000000_plataforma.sql).
   Se pueden ejecutar más de una vez.
3. *Authentication* → *URL Configuration*:
   - **Site URL**: `https://hlivingapp.github.io/Aplicaci-n-reformas/` (o el dominio definitivo).
   - **Redirect URLs**: `https://hlivingapp.github.io/Aplicaci-n-reformas/**` (y `https://reformamejor.es/**` cuando esté).
4. *Authentication* → *Email Templates* → *Magic Link*: pon el asunto y el texto en español
   (por ejemplo «Tu enlace para entrar en ReformaMejor»).
5. *Project Settings* → *API*: copia **Project URL** y la clave **anon public**. En GitHub:
   *Settings* → *Secrets and variables* → *Actions* → pestaña **Variables** → crea `SUPABASE_URL` y
   `SUPABASE_ANON_KEY`. La próxima publicación de la demo ya guarda en Supabase.
   **Nunca** pongas la clave `service_role` en GitHub ni en el código.

Qué se guarda: perfil y consentimientos, borrador del presupuesto, proyectos y presupuestos del cliente,
materiales elegidos (moodboard), suscripción, encargos (visitas, presupuesto final, contrato, avances),
pagos simulados, foro y profesionales (tablas preparadas; el alta de profesionales se conecta en el siguiente paso).
Sin las variables, la web sigue como hasta ahora, guardando en el navegador. En *Mi cuenta* (`/cuenta`)
cada persona puede descargar sus datos o borrar su cuenta.

### 0.1 Asistente IA (Claude)

Una sola clave de Anthropic para toda la plataforma, guardada **solo** como secreto de la Edge Function
[`supabase/functions/asistente`](../supabase/functions/asistente/index.ts). La función comprueba el plan
de cada persona (tabla `planes`) y lleva su consumo del mes (`uso_ia`):

| Quién | Qué | Límite al mes |
|---|---|---|
| Plan Pro | Asistente de obra, con su proyecto como contexto y búsqueda en fuentes oficiales | 150 consultas |
| Plan Básico | Prueba del asistente | 5 consultas |
| Profesionales dados de alta | Leer un presupuesto suyo en PDF para proponer sus tarifas | 10 lecturas |
| Todos juntos | Tope de seguridad (secreto `IA_TOPE_MES`) | 3.000 consultas |

1. Crea la cuenta en [console.anthropic.com](https://console.anthropic.com) a nombre de la empresa,
   añade la tarjeta (*Settings → Billing*) y pon un **tope de gasto mensual** (*Settings → Limits*).
2. *API Keys → Create Key* (nombre: `reformamejor-supabase`). Copia la clave.
3. En Supabase: *Edge Functions → Secrets → Add new secret*: nombre `ANTHROPIC_API_KEY`, valor la clave.
   No la pegues en ningún otro sitio.
4. Ejecuta [`supabase/migrations/20261123000000_ia.sql`](../supabase/migrations/20261123000000_ia.sql) y
   despliega la función `asistente` (desde el conector de Supabase o con `supabase functions deploy asistente`).
5. Opcional: secretos `IA_MODELO` (por defecto `claude-opus-5-5`) e `IA_TOPE_MES`.

Hasta conectar Stripe, el plan se elige en la app (pago simulado), así que el tope de gasto de Anthropic y
`IA_TOPE_MES` son los que limitan el coste.

## 1. Base de datos (Supabase)

1. Crea una cuenta gratuita en [supabase.com](https://supabase.com) con el email de la empresa.
2. **New project**. En *Region* elige **Europe (Frankfurt o Ireland)**, para que los datos se queden en la UE.
3. Cuando esté creado: *SQL Editor* → *New query* → pega el contenido de [`supabase/esquema.sql`](../supabase/esquema.sql) → *Run*. Repite con [`supabase/migrations/20261122000000_plataforma.sql`](../supabase/migrations/20261122000000_plataforma.sql).
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
