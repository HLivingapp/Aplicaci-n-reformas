# Base de conocimiento de la IA

Zona de admin: **/empresa/conocimiento** («IA: saber» en el menú de empresa). Solo para emails de la tabla `equipo`.

## Cómo funciona

1. El equipo sube un PDF, Excel (xlsx, xls, ods), CSV, TXT/MD, pega un texto o un enlace a un PDF oficial.
2. El original va al almacén privado `conocimiento` de Supabase y se crea una fila en `conocimiento_documentos`
   (tema, tipos de obra, fuente, versión y si es **público** o **interno**).
3. La Edge Function `conocimiento-importar` lo lee (los PDF por lotes de páginas), oculta emails, teléfonos,
   NIF/CIF/NIE e IBAN, y lo guarda troceado en `conocimiento_fragmentos` con su página y sección.
4. La IA llama a `buscar_conocimiento(consulta, tipos, temas, limite)` y recibe los fragmentos como bloques
   `search_result` con citas: la respuesta cita documento, sección y página.

Clientes, profesionales y el foro solo reciben documentos **públicos** (la propia base de datos lo filtra cuando
se consulta con la clave pública). Los internos (precios, partidas, procesos) solo los ve el equipo o el servidor.

## Contenido cargado

- **Código Técnico de la Edificación** (codigotecnico.org): Parte I (jun. 2022), DB-HE, DB-HS, DB-SI, DB-SUA y
  DB-HR con comentarios, DB-SE, SE-AE, SE-F, SE-M, SE-A, y los documentos de apoyo DA DB-SUA/2 (accesibilidad en
  edificios existentes), DA DB-HE/1, /2 y /3. Cada fragmento lleva los tipos de obra según la sección
  (p. ej. HS 1 → fachadas y cubiertas; HS 3 → reforma interior e instalaciones; SI 2 → fachadas).

## Reglas

- Nunca se suben documentos a este repositorio público: viven solo en Supabase (UE).
- Quitar antes nombres y direcciones de clientes. De los catálogos de proveedores, solo enlaces.
- Tarifas y precios detallados: solo como documentos **internos**.
