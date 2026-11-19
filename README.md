# App Reformas

Aplicación web y móvil para gestionar los procesos de una empresa de reformas: desde que el cliente abre su proyecto hasta la entrega de la obra.

## Qué hace esta primera versión

**Cliente** (`/nuevo` y `/cliente`)
- Abre su proyecto de reforma en 7 pasos: dirección, vivienda, distribución (ahora / quiero), estado actual (techos, suelos, ventanas), instalaciones (climatización, agua caliente, fontanería, electricidad) y la reforma que quiere.
- Con la dirección se consulta el **Catastro** (m² construidos, año de construcción, referencia catastral). Si no se encuentra, se rellena a mano.
- Ve un **plano base orientativo** generado con sus m² y estancias, la parcela en la cartografía del Catastro y un enlace a Street View.
- Recibe una **estimación orientativa** (horquilla) calculada con el tarifario de la empresa.
- En su portal sigue el estado: solicitud, visita, presupuesto (que puede aceptar o rechazar) y el avance de la obra por fases, con las novedades que la empresa marca como visibles.
- Si quiere mantener una instalación con más de 20 años (configurable), la app no lo permite y explica por qué.

**Empresa** (`/empresa`)
- **Solicitudes**: datos de la vivienda, ficha catastral (búsqueda por dirección o referencia), cotización automática con costes y venta, plano y ubicación. Un clic crea el presupuesto con todas las partidas.
- **Presupuestos** por capítulos y partidas, con coste interno, margen, descuento, IVA (10% / 21%), impresión a PDF y envío al cliente.
- **Obras**: al aceptarse un presupuesto se crea la obra con fases tipo, diagrama de plazos, tareas y diario de obra.
- **Ajustes → Tarifario**: todas las medidas estándar y costes son editables. Precio de venta = coste × (1 + recargo, 40% por defecto). Se puede importar y exportar en JSON.

## Tarifario

El repositorio es público, así que solo incluye un **tarifario genérico de ejemplo** (`src/lib/tarifas.ts`). El tarifario real de la empresa se guarda fuera del repositorio y se importa desde *Ajustes → Tarifario → Importar*.

## Plataformas

Una sola aplicación web, adaptada al móvil e instalable como app (PWA: "Añadir a pantalla de inicio").

Para pasar a la base de datos real: [docs/puesta-en-marcha.md](docs/puesta-en-marcha.md).

## Desarrollo

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

Stack: Next.js (App Router) + TypeScript + Tailwind CSS.

## Limitaciones de esta versión

- Sin las variables de Supabase la app funciona en **modo demostración** (datos en el navegador). Con ellas, los datos van a la base de datos: el equipo entra con un enlace por email y cada cliente con su enlace privado `/p/<token>`, sin contraseñas.
- La consulta al Catastro usa los servicios públicos de la Sede Electrónica del Catastro desde el servidor (`/api/catastro`). País Vasco y Navarra tienen catastro foral y aún no están conectados.
- El plano es esquemático, no a escala.
